// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/**
 * @title PHR (Personal Health Record)
 * @author Based on Sentausa & Hareva (ICTIIA 2022)
 * @notice Decentralized Personal Health Record smart contract using Ethereum and IPFS.
 * @dev Stores EHR metadata on-chain while medical files reside on IPFS.
 *      Note: On-chain storage is publicly readable; access controls govern contract interactions.
 */
contract PHR {
    // --- Data Structures ---

    /**
     * @notice Structure representing a single Electronic Health Record entry.
     * @param creator_address Address of the medical professional who created this record.
     * @param creator_name Name of the doctor/creator.
     * @param ipfs_location IPFS CID pointing to the record file.
     * @param createdAt Unix timestamp when the record was created.
     */
    struct EHR {
        address creator_address;
        string creator_name;
        string ipfs_location;
        uint256 createdAt;
    }

    /**
     * @notice Structure representing a registered User profile.
     */
    struct User {
        address user_address;
        string full_name;
        string gender;
        string home_address;
        string phone_number;
        uint256 birthday;
        address[] viewerList;
        address[] creatorList;
        EHR[] ehr_data;
    }

    // --- State Variables ---

    /// @dev Mapping from user address to their profile and record data.
    mapping(address => User) private userData;

    /// @dev Quick lookup for registration status.
    mapping(address => bool) public isRegistered;

    /// @dev Mapping patient address => (viewer address => is granted viewer).
    mapping(address => mapping(address => bool)) public canView;

    /// @dev Mapping patient address => (creator address => is granted creator).
    mapping(address => mapping(address => bool)) public canCreate;

    // --- Events ---

    event UserRegistered(address indexed userAddress, string fullName);
    event AccessGranted(address indexed patient, address indexed grantee, string role);
    event AccessRevoked(address indexed patient, address indexed target, string role);
    event EHRCreated(
        address indexed patient,
        address indexed creator,
        string creatorName,
        string ipfsLocation,
        uint256 createdAt
    );

    // --- External Functions ---

    /**
     * @notice Registers a new user on the blockchain.
     * @param _full_name Full legal name of the user.
     * @param _gender Gender of the user (e.g. "Male", "Female").
     * @param _home_address Physical home address.
     * @param _phone_number Contact phone number.
     * @param _birthday Unix timestamp of the user's birthdate.
     */
    function setUserData(
        string memory _full_name,
        string memory _gender,
        string memory _home_address,
        string memory _phone_number,
        uint256 _birthday
    ) external {
        require(!isRegistered[msg.sender], "Already registered");

        User storage u = userData[msg.sender];
        u.user_address = msg.sender;
        u.full_name = _full_name;
        u.gender = _gender;
        u.home_address = _home_address;
        u.phone_number = _phone_number;
        u.birthday = _birthday;

        // The patient is always a viewer of their own records
        u.viewerList.push(msg.sender);
        canView[msg.sender][msg.sender] = true;

        isRegistered[msg.sender] = true;

        emit UserRegistered(msg.sender, _full_name);
    }

    /**
     * @notice Grants an address access to view, create, or manage health records.
     * @param _target Address of the doctor or grantee.
     * @param _role Access level: "v" (viewer), "c" (creator), "m" (master = both).
     */
    function grantAccess(address _target, string memory _role) external {
        require(isRegistered[msg.sender], "Address not registered");
        require(isRegistered[_target], "User not found");

        bytes32 roleHash = keccak256(bytes(_role));

        if (roleHash == keccak256(bytes("v"))) {
            require(!canView[msg.sender][_target], "Already Granted As Viewer");
            canView[msg.sender][_target] = true;
            userData[msg.sender].viewerList.push(_target);
            emit AccessGranted(msg.sender, _target, "v");
        } else if (roleHash == keccak256(bytes("c"))) {
            require(!canCreate[msg.sender][_target], "Already Granted As Creator");
            canCreate[msg.sender][_target] = true;
            userData[msg.sender].creatorList.push(_target);
            emit AccessGranted(msg.sender, _target, "c");
        } else if (roleHash == keccak256(bytes("m"))) {
            require(
                !(canView[msg.sender][_target] && canCreate[msg.sender][_target]),
                "Already Granted As Master"
            );

            if (!canView[msg.sender][_target]) {
                canView[msg.sender][_target] = true;
                userData[msg.sender].viewerList.push(_target);
            }
            if (!canCreate[msg.sender][_target]) {
                canCreate[msg.sender][_target] = true;
                userData[msg.sender].creatorList.push(_target);
            }
            emit AccessGranted(msg.sender, _target, "m");
        } else {
            revert("Access Role Not Valid");
        }
    }

    /**
     * @notice Revokes viewer, creator, or master access from a previously granted address.
     * @param _target Address to revoke access from.
     * @param _role Access level to revoke: "v", "c", or "m".
     */
    function revokeAccess(address _target, string memory _role) external {
        require(isRegistered[msg.sender], "Address not registered");
        require(isRegistered[_target], "User not found");
        require(_target != msg.sender, "Cannot revoke own access");

        bytes32 roleHash = keccak256(bytes(_role));

        if (roleHash == keccak256(bytes("v"))) {
            require(canView[msg.sender][_target], "Not granted");
            canView[msg.sender][_target] = false;
            _removeFromList(userData[msg.sender].viewerList, _target);
            emit AccessRevoked(msg.sender, _target, "v");
        } else if (roleHash == keccak256(bytes("c"))) {
            require(canCreate[msg.sender][_target], "Not granted");
            canCreate[msg.sender][_target] = false;
            _removeFromList(userData[msg.sender].creatorList, _target);
            emit AccessRevoked(msg.sender, _target, "c");
        } else if (roleHash == keccak256(bytes("m"))) {
            require(
                canView[msg.sender][_target] || canCreate[msg.sender][_target],
                "Not granted"
            );
            if (canView[msg.sender][_target]) {
                canView[msg.sender][_target] = false;
                _removeFromList(userData[msg.sender].viewerList, _target);
            }
            if (canCreate[msg.sender][_target]) {
                canCreate[msg.sender][_target] = false;
                _removeFromList(userData[msg.sender].creatorList, _target);
            }
            emit AccessRevoked(msg.sender, _target, "m");
        } else {
            revert("Access Role Not Valid");
        }
    }

    /**
     * @notice Creates an EHR record for a patient.
     * @param _patient Address of the patient.
     * @param _creator_name Name of the creator/doctor.
     * @param _ipfs_location IPFS CID of the attached medical document.
     */
    function createEHR(
        address _patient,
        string memory _creator_name,
        string memory _ipfs_location
    ) external {
        require(isRegistered[_patient], "Address not registered");
        require(canCreate[_patient][msg.sender], "You are not granted as a creator");

        userData[_patient].ehr_data.push(
            EHR({
                creator_address: msg.sender,
                creator_name: _creator_name,
                ipfs_location: _ipfs_location,
                createdAt: block.timestamp
            })
        );

        emit EHRCreated(
            _patient,
            msg.sender,
            _creator_name,
            _ipfs_location,
            block.timestamp
        );
    }

    /**
     * @notice Retrieves all EHR records for a patient.
     * @param _patient Address of the patient whose records to retrieve.
     * @return Array of EHR structures.
     */
    function viewEHR(address _patient) external view returns (EHR[] memory) {
        require(isRegistered[_patient], "Address not registered");
        require(canView[_patient][msg.sender], "You are not granted as viewer");

        return userData[_patient].ehr_data;
    }

    /**
     * @notice Retrieves user demographic details.
     * @param _user Address of the user.
     */
    function getUserData(address _user)
        external
        view
        returns (
            address user_address,
            string memory full_name,
            string memory gender,
            string memory home_address,
            string memory phone_number,
            uint256 birthday
        )
    {
        require(isRegistered[_user], "Address not registered");
        User storage u = userData[_user];
        return (
            u.user_address,
            u.full_name,
            u.gender,
            u.home_address,
            u.phone_number,
            u.birthday
        );
    }

    /**
     * @notice Retrieves the caller's list of granted viewers and creators.
     */
    function getMyAccessList()
        external
        view
        returns (address[] memory viewers, address[] memory creators)
    {
        require(isRegistered[msg.sender], "Address not registered");
        return (userData[msg.sender].viewerList, userData[msg.sender].creatorList);
    }

    /**
     * @notice Checks if an address is registered.
     */
    function isUserRegistered(address _user) external view returns (bool) {
        return isRegistered[_user];
    }

    /**
     * @notice Checks if a viewer has been granted view access by a patient.
     */
    function isGrantedToView(address _patient, address _viewer) external view returns (bool) {
        return canView[_patient][_viewer];
    }

    /**
     * @notice Checks if a creator has been granted create access by a patient.
     */
    function isGrantedToCreate(address _patient, address _creator) external view returns (bool) {
        return canCreate[_patient][_creator];
    }

    // --- Internal Helpers ---

    /**
     * @dev Removes an address from an array using swap-and-pop.
     */
    function _removeFromList(address[] storage list, address target) internal {
        uint256 len = list.length;
        for (uint256 i = 0; i < len; i++) {
            if (list[i] == target) {
                list[i] = list[len - 1];
                list.pop();
                break;
            }
        }
    }
}
