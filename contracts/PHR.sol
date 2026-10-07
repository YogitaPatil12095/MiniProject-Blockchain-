// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/**
 * @title Intellihealth PHR (Electronic Health Record)
 * @author Based on Parshionikar, Verulkar, & Katkar (IEEE ICBDS 2024)
 *         "Intellihealth – A Secured Decentralized Electronic Health Record System using Blockchain"
 * @notice Secured Decentralized Electronic Health Record smart contract featuring:
 *         - Multi-role authorization (System Administrator, Doctor, Patient)
 *         - Primary identification linked with Aadhaar Number
 *         - Encrypted IPFS medical record & prescription management (CRUD)
 *         - Appointment booking & status management
 *         - Assistive navigation chatbot audit logs
 */
contract PHR {
    // --- Data Structures ---

    /**
     * @notice Structure representing a single Electronic Health Record entry with clinical prescriptions.
     */
    struct EHR {
        address creator_address;
        string creator_name;
        string ipfs_location;       // Encrypted IPFS CID
        uint256 createdAt;
        string diagnosis;           // e.g. "Pneumonia", "Migraine", "Hypertension"
        string medicationsJson;     // Serialized JSON array of medications (Brand, Dosage, Frequency, Duration, Remarks)
        string testsJson;           // Serialized JSON array of clinical tests ordered
        string followUpNotes;       // Clinical follow-up advisory
    }

    /**
     * @notice Structure representing extended Patient Demographics.
     */
    struct UserDemographics {
        string aadhaarNumber;
        string fullName;
        string gender;
        string homeAddress;
        string phoneNumber;
        uint256 birthday;
        string bloodType;
        uint256 heightCm;
        uint256 weightKg;
        string photoIpfsCid;
    }

    /**
     * @notice Structure representing Doctor Professional Profile.
     */
    struct DoctorProfile {
        string doctorId;
        string fullName;
        string specialty;
        string qualification;
        string phoneNumber;
        string location;
        string photoIpfsCid;
    }

    /**
     * @notice Structure representing a User profile (backward compatible + extended).
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

    /**
     * @notice Structure representing an Appointment.
     */
    struct Appointment {
        uint256 appointmentId;
        address patientAddress;
        string patientName;
        address doctorAddress;
        string doctorName;
        string specialty;
        uint256 dateTimestamp;
        string timeSlot;
        string status; // "Pending", "Confirmed", "Completed", "Cancelled"
    }

    /**
     * @notice Structure representing a Chatbot interaction log for admin auditing.
     */
    struct ChatbotLog {
        address userAddress;
        string query;
        string category;
        uint256 timestamp;
    }

    // --- State Variables ---

    /// @notice System Administrator (Hospital Owner) address.
    address public admin;

    /// @dev Mapping from user address to their legacy/base profile.
    mapping(address => User) private userData;

    /// @dev Mapping from user address to extended demographics.
    mapping(address => UserDemographics) public patientDemographics;

    /// @dev Mapping from doctor address to doctor profile.
    mapping(address => DoctorProfile) public doctorProfiles;

    /// @dev Quick lookup for registration status.
    mapping(address => bool) public isRegistered;

    /// @dev Role tags: "admin", "doctor", "patient".
    mapping(address => string) public userRoles;

    /// @dev Aadhaar number => registered wallet address (prevents duplicate Aadhaar claims).
    mapping(string => address) public aadhaarToAddress;

    /// @dev Mapping patient address => (viewer address => is granted viewer).
    mapping(address => mapping(address => bool)) public canView;

    /// @dev Mapping patient address => (creator address => is granted creator).
    mapping(address => mapping(address => bool)) public canCreate;

    /// @dev System registries for enumeration.
    address[] public registeredDoctors;
    address[] public registeredPatients;

    /// @dev Appointments storage.
    uint256 public appointmentCounter;
    mapping(uint256 => Appointment) public appointments;
    uint256[] public allAppointmentIds;

    /// @dev Chatbot logs for administrative audit.
    ChatbotLog[] public chatbotLogs;

    // --- Events ---

    event AdminChanged(address indexed previousAdmin, address indexed newAdmin);
    event UserRegistered(address indexed userAddress, string fullName);
    event DoctorRegistered(address indexed doctorAddress, string doctorId, string fullName, string specialty);
    event PatientRegistered(address indexed patientAddress, string aadhaarNumber, string fullName);
    event UserRevoked(address indexed userAddress);
    event PatientProfileUpdated(address indexed patientAddress);
    event DoctorProfileUpdated(address indexed doctorAddress);
    event AccessGranted(address indexed patient, address indexed grantee, string role);
    event AccessRevoked(address indexed patient, address indexed target, string role);
    event EHRCreated(
        address indexed patient,
        address indexed creator,
        string creatorName,
        string ipfsLocation,
        uint256 createdAt
    );
    event EHRUpdated(address indexed patient, uint256 indexed index, address indexed editor);
    event EHRDeleted(address indexed patient, uint256 indexed index, address indexed editor);
    event AppointmentBooked(
        uint256 indexed appointmentId,
        address indexed patient,
        address indexed doctor,
        string specialty,
        string timeSlot
    );
    event AppointmentStatusUpdated(uint256 indexed appointmentId, string newStatus);
    event ChatbotInteractionLogged(address indexed user, string query, string category, uint256 timestamp);

    // --- Modifiers ---

    modifier onlyAdmin() {
        require(msg.sender == admin, "Admin authorization required");
        _;
    }

    // --- Constructor ---

    constructor() {
        admin = msg.sender;
        userRoles[msg.sender] = "admin";
    }

    // --- Administrator Functions ---

    /**
     * @notice Transfers admin rights to a new address.
     */
    function setAdmin(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0), "Invalid admin address");
        emit AdminChanged(admin, _newAdmin);
        admin = _newAdmin;
        userRoles[_newAdmin] = "admin";
        isRegistered[_newAdmin] = true;
    }

    /**
     * @notice Admin registers a verified medical doctor.
     */
    function registerDoctor(
        address _doctorAddress,
        string memory _doctorId,
        string memory _fullName,
        string memory _specialty,
        string memory _qualification,
        string memory _phoneNumber,
        string memory _location,
        string memory _photoIpfsCid
    ) external onlyAdmin {
        require(_doctorAddress != address(0), "Invalid address");
        require(!isRegistered[_doctorAddress], "Doctor already registered");

        // Base user structure
        User storage u = userData[_doctorAddress];
        u.user_address = _doctorAddress;
        u.full_name = _fullName;
        u.home_address = _location;
        u.phone_number = _phoneNumber;
        u.viewerList.push(_doctorAddress);
        canView[_doctorAddress][_doctorAddress] = true;

        // Extended doctor profile
        doctorProfiles[_doctorAddress] = DoctorProfile({
            doctorId: _doctorId,
            fullName: _fullName,
            specialty: _specialty,
            qualification: _qualification,
            phoneNumber: _phoneNumber,
            location: _location,
            photoIpfsCid: _photoIpfsCid
        });

        isRegistered[_doctorAddress] = true;
        userRoles[_doctorAddress] = "doctor";
        registeredDoctors.push(_doctorAddress);

        emit DoctorRegistered(_doctorAddress, _doctorId, _fullName, _specialty);
        emit UserRegistered(_doctorAddress, _fullName);
    }

    /**
     * @notice Admin registers a verified patient with Aadhaar linkage.
     */
    function registerPatient(
        address _patientAddress,
        string memory _aadhaarNumber,
        string memory _fullName,
        string memory _gender,
        string memory _homeAddress,
        string memory _phoneNumber,
        uint256 _birthday,
        string memory _bloodType,
        uint256 _heightCm,
        uint256 _weightKg,
        string memory _photoIpfsCid
    ) external onlyAdmin {
        require(_patientAddress != address(0), "Invalid address");
        require(!isRegistered[_patientAddress], "Patient already registered");
        require(bytes(_aadhaarNumber).length > 0, "Aadhaar required");
        require(aadhaarToAddress[_aadhaarNumber] == address(0), "Aadhaar already linked");

        User storage u = userData[_patientAddress];
        u.user_address = _patientAddress;
        u.full_name = _fullName;
        u.gender = _gender;
        u.home_address = _homeAddress;
        u.phone_number = _phoneNumber;
        u.birthday = _birthday;
        u.viewerList.push(_patientAddress);
        canView[_patientAddress][_patientAddress] = true;

        patientDemographics[_patientAddress] = UserDemographics({
            aadhaarNumber: _aadhaarNumber,
            fullName: _fullName,
            gender: _gender,
            homeAddress: _homeAddress,
            phoneNumber: _phoneNumber,
            birthday: _birthday,
            bloodType: _bloodType,
            heightCm: _heightCm,
            weightKg: _weightKg,
            photoIpfsCid: _photoIpfsCid
        });

        aadhaarToAddress[_aadhaarNumber] = _patientAddress;
        isRegistered[_patientAddress] = true;
        userRoles[_patientAddress] = "patient";
        registeredPatients.push(_patientAddress);

        emit PatientRegistered(_patientAddress, _aadhaarNumber, _fullName);
        emit UserRegistered(_patientAddress, _fullName);
    }

    /**
     * @notice Admin revokes an existing user account.
     */
    function revokeUserAccount(address _userAddress) external onlyAdmin {
        require(isRegistered[_userAddress], "User not found");
        require(_userAddress != admin, "Cannot revoke admin");

        isRegistered[_userAddress] = false;
        userRoles[_userAddress] = "revoked";

        emit UserRevoked(_userAddress);
    }

    /**
     * @notice Returns all registered doctor addresses.
     */
    function getRegisteredDoctors() external view returns (address[] memory) {
        return registeredDoctors;
    }

    /**
     * @notice Returns all registered patient addresses.
     */
    function getRegisteredPatients() external view returns (address[] memory) {
        return registeredPatients;
    }

    // --- User Registration & Profile Functions (Self-Service) ---

    /**
     * @notice Base self-registration function (Preserved for compatibility).
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

        u.viewerList.push(msg.sender);
        canView[msg.sender][msg.sender] = true;

        // Default patient demographic record
        patientDemographics[msg.sender] = UserDemographics({
            aadhaarNumber: "",
            fullName: _full_name,
            gender: _gender,
            homeAddress: _home_address,
            phoneNumber: _phone_number,
            birthday: _birthday,
            bloodType: "O+",
            heightCm: 170,
            weightKg: 65,
            photoIpfsCid: ""
        });

        isRegistered[msg.sender] = true;
        if (bytes(userRoles[msg.sender]).length == 0) {
            userRoles[msg.sender] = "patient";
            registeredPatients.push(msg.sender);
        }

        emit UserRegistered(msg.sender, _full_name);
    }

    /**
     * @notice Patient updates their personal demographic details.
     */
    function updatePatientDemographics(
        string memory _homeAddress,
        string memory _phoneNumber,
        string memory _bloodType,
        uint256 _heightCm,
        uint256 _weightKg,
        string memory _photoIpfsCid
    ) external {
        require(isRegistered[msg.sender], "Address not registered");

        UserDemographics storage d = patientDemographics[msg.sender];
        d.homeAddress = _homeAddress;
        d.phoneNumber = _phoneNumber;
        d.bloodType = _bloodType;
        d.heightCm = _heightCm;
        d.weightKg = _weightKg;
        d.photoIpfsCid = _photoIpfsCid;

        // Sync with base profile
        userData[msg.sender].home_address = _homeAddress;
        userData[msg.sender].phone_number = _phoneNumber;

        emit PatientProfileUpdated(msg.sender);
    }

    /**
     * @notice Doctor updates their contact and photo details.
     */
    function updateDoctorProfile(
        string memory _phoneNumber,
        string memory _location,
        string memory _photoIpfsCid
    ) external {
        require(isRegistered[msg.sender], "Address not registered");

        DoctorProfile storage doc = doctorProfiles[msg.sender];
        doc.phoneNumber = _phoneNumber;
        doc.location = _location;
        doc.photoIpfsCid = _photoIpfsCid;

        userData[msg.sender].phone_number = _phoneNumber;
        userData[msg.sender].home_address = _location;

        emit DoctorProfileUpdated(msg.sender);
    }

    // --- Access Control (Grant / Revoke) ---

    /**
     * @notice Grants an address access to view, create, or manage health records.
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

    // --- EHR & Prescription Management (CRUD) ---

    /**
     * @notice Standard EHR creation (Base / Backwards-compatible).
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
                createdAt: block.timestamp,
                diagnosis: "General Medical Examination",
                medicationsJson: "[]",
                testsJson: "[]",
                followUpNotes: ""
            })
        );

        emit EHRCreated(_patient, msg.sender, _creator_name, _ipfs_location, block.timestamp);
    }

    /**
     * @notice Detailed EHR and Prescription creation as specified in Intellihealth paper.
     */
    function createDetailedEHR(
        address _patient,
        string memory _creator_name,
        string memory _ipfs_location,
        string memory _diagnosis,
        string memory _medicationsJson,
        string memory _testsJson,
        string memory _followUpNotes
    ) external {
        require(isRegistered[_patient], "Address not registered");
        require(canCreate[_patient][msg.sender], "You are not granted as a creator");

        userData[_patient].ehr_data.push(
            EHR({
                creator_address: msg.sender,
                creator_name: _creator_name,
                ipfs_location: _ipfs_location,
                createdAt: block.timestamp,
                diagnosis: _diagnosis,
                medicationsJson: _medicationsJson,
                testsJson: _testsJson,
                followUpNotes: _followUpNotes
            })
        );

        emit EHRCreated(_patient, msg.sender, _creator_name, _ipfs_location, block.timestamp);
    }

    /**
     * @notice Updates an existing EHR prescription record.
     */
    function updateEHR(
        address _patient,
        uint256 _index,
        string memory _diagnosis,
        string memory _medicationsJson,
        string memory _testsJson,
        string memory _followUpNotes
    ) external {
        require(isRegistered[_patient], "Address not registered");
        require(canCreate[_patient][msg.sender], "You are not granted as a creator");
        require(_index < userData[_patient].ehr_data.length, "Invalid record index");

        EHR storage record = userData[_patient].ehr_data[_index];
        record.diagnosis = _diagnosis;
        record.medicationsJson = _medicationsJson;
        record.testsJson = _testsJson;
        record.followUpNotes = _followUpNotes;

        emit EHRUpdated(_patient, _index, msg.sender);
    }

    /**
     * @notice Deletes an outdated EHR record to reduce clutter (swap-and-pop).
     */
    function deleteEHR(address _patient, uint256 _index) external {
        require(isRegistered[_patient], "Address not registered");
        require(canCreate[_patient][msg.sender], "You are not granted as a creator");
        require(_index < userData[_patient].ehr_data.length, "Invalid record index");

        uint256 len = userData[_patient].ehr_data.length;
        userData[_patient].ehr_data[_index] = userData[_patient].ehr_data[len - 1];
        userData[_patient].ehr_data.pop();

        emit EHRDeleted(_patient, _index, msg.sender);
    }

    /**
     * @notice Retrieves all EHR records for a patient.
     */
    function viewEHR(address _patient) external view returns (EHR[] memory) {
        require(isRegistered[_patient], "Address not registered");
        require(canView[_patient][msg.sender], "You are not granted as viewer");

        return userData[_patient].ehr_data;
    }

    // --- Appointment Booking System ---

    /**
     * @notice Patient schedules/books an appointment with a doctor.
     */
    function bookAppointment(
        address _doctorAddress,
        string memory _specialty,
        uint256 _dateTimestamp,
        string memory _timeSlot
    ) external returns (uint256) {
        require(isRegistered[msg.sender], "Patient not registered");
        require(isRegistered[_doctorAddress], "Doctor not registered");

        appointmentCounter++;
        uint256 newId = appointmentCounter;

        string memory pName = userData[msg.sender].full_name;
        string memory dName = userData[_doctorAddress].full_name;
        if (bytes(dName).length == 0 && bytes(doctorProfiles[_doctorAddress].fullName).length > 0) {
            dName = doctorProfiles[_doctorAddress].fullName;
        }

        appointments[newId] = Appointment({
            appointmentId: newId,
            patientAddress: msg.sender,
            patientName: pName,
            doctorAddress: _doctorAddress,
            doctorName: dName,
            specialty: _specialty,
            dateTimestamp: _dateTimestamp,
            timeSlot: _timeSlot,
            status: "Pending"
        });

        allAppointmentIds.push(newId);

        emit AppointmentBooked(newId, msg.sender, _doctorAddress, _specialty, _timeSlot);
        return newId;
    }

    /**
     * @notice Doctor or Admin updates appointment status ("Confirmed", "Completed", "Cancelled").
     */
    function updateAppointmentStatus(uint256 _appointmentId, string memory _newStatus) external {
        require(_appointmentId > 0 && _appointmentId <= appointmentCounter, "Appointment not found");
        Appointment storage appt = appointments[_appointmentId];

        require(
            msg.sender == appt.doctorAddress || msg.sender == appt.patientAddress || msg.sender == admin,
            "Unauthorized to update appointment"
        );

        appt.status = _newStatus;
        emit AppointmentStatusUpdated(_appointmentId, _newStatus);
    }

    /**
     * @notice Returns all appointments for a patient.
     */
    function getPatientAppointments(address _patient) external view returns (Appointment[] memory) {
        require(msg.sender == _patient || msg.sender == admin || isRegistered[msg.sender], "Access denied");

        uint256 count = 0;
        for (uint256 i = 0; i < allAppointmentIds.length; i++) {
            if (appointments[allAppointmentIds[i]].patientAddress == _patient) {
                count++;
            }
        }

        Appointment[] memory result = new Appointment[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < allAppointmentIds.length; i++) {
            if (appointments[allAppointmentIds[i]].patientAddress == _patient) {
                result[idx] = appointments[allAppointmentIds[i]];
                idx++;
            }
        }
        return result;
    }

    /**
     * @notice Returns all appointments for a doctor.
     */
    function getDoctorAppointments(address _doctor) external view returns (Appointment[] memory) {
        require(msg.sender == _doctor || msg.sender == admin || isRegistered[msg.sender], "Access denied");

        uint256 count = 0;
        for (uint256 i = 0; i < allAppointmentIds.length; i++) {
            if (appointments[allAppointmentIds[i]].doctorAddress == _doctor) {
                count++;
            }
        }

        Appointment[] memory result = new Appointment[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < allAppointmentIds.length; i++) {
            if (appointments[allAppointmentIds[i]].doctorAddress == _doctor) {
                result[idx] = appointments[allAppointmentIds[i]];
                idx++;
            }
        }
        return result;
    }

    /**
     * @notice Returns all system appointments for the Admin dashboard.
     */
    function getAllAppointments() external view onlyAdmin returns (Appointment[] memory) {
        Appointment[] memory result = new Appointment[](allAppointmentIds.length);
        for (uint256 i = 0; i < allAppointmentIds.length; i++) {
            result[i] = appointments[allAppointmentIds[i]];
        }
        return result;
    }

    // --- Chatbot Logging ---

    /**
     * @notice Records an assistive chatbot navigation or messaging interaction for admin review.
     */
    function logChatbotInteraction(string memory _query, string memory _category) external {
        chatbotLogs.push(
            ChatbotLog({
                userAddress: msg.sender,
                query: _query,
                category: _category,
                timestamp: block.timestamp
            })
        );
        emit ChatbotInteractionLogged(msg.sender, _query, _category, block.timestamp);
    }

    /**
     * @notice Retrieves chatbot interaction logs (Admin oversight).
     */
    function getChatbotLogs() external view onlyAdmin returns (ChatbotLog[] memory) {
        return chatbotLogs;
    }

    // --- View Utilities ---

    /**
     * @notice Retrieves base user demographic details.
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

