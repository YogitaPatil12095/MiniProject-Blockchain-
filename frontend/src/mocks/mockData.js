/**
 * Mock Data Suite for PHR Chain UI Design & Preview
 * Conforms to ROLES.md Section 4 standard prop shapes.
 */

export const mockUsers = {
  patient: {
    address: '0x3394253c50947182cf98de072484609BF6683Dd5',
    fullName: 'Aarav Sharma',
    gender: 'Male',
    homeAddress: '42 Marine Drive, Mumbai, MH 400020',
    phone: '+91 9123456780',
    birthday: '1995-08-20',
    isRegistered: true,
  },
  doctor: {
    address: '0xF36A1a191f2343FfDAd7095A539c668748FD1eCa',
    fullName: 'Dr. Rajesh Verma',
    gender: 'Male',
    homeAddress: 'Apollo Hospital, Mumbai, MH 400001',
    phone: '+91 9876543210',
    birthday: '1984-11-20',
    isRegistered: true,
  },
  unregisteredUser: {
    address: '0x90F79bf6EB2c4f8080653020366430B0109d0056',
    fullName: '',
    gender: '',
    homeAddress: '',
    phone: '',
    birthday: '',
    isRegistered: false,
  }
};

export const mockRecords = [
  {
    id: '1',
    creatorName: 'Dr. David Ross',
    creatorAddress: '0x3C44CdDDB6a900fa2b585dd299e03d12FA4293BC',
    cid: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
    createdAt: 1718000000,
    gatewayUrl: 'https://gateway.pinata.cloud/ipfs/QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
    fileName: 'Annual_Blood_Test_Report.pdf',
  },
  {
    id: '2',
    creatorName: 'Dr. David Ross',
    creatorAddress: '0x3C44CdDDB6a900fa2b585dd299e03d12FA4293BC',
    cid: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
    createdAt: 1719500000,
    gatewayUrl: 'https://gateway.pinata.cloud/ipfs/QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
    fileName: 'Chest_XRay_Scan_Results.dcm',
  },
  {
    id: '3',
    creatorName: 'Dr. Sarah Connor',
    creatorAddress: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
    cid: 'QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZv5D2R8',
    createdAt: 1722000000,
    gatewayUrl: 'https://gateway.pinata.cloud/ipfs/QmPZ9gcCEpqKTo6aq61g2nXGUhM4iCL3ewB6LDXZv5D2R8',
    fileName: 'Cardiology_Consultation_Notes.pdf',
  }
];

export const mockAccessList = {
  viewers: [
    '0x3C44CdDDB6a900fa2b585dd299e03d12FA4293BC', // Dr. David Ross
    '0x90F79bf6EB2c4f8080653020366430B0109d0056', // User 2 (Viewer)
  ],
  creators: [
    '0x3C44CdDDB6a900fa2b585dd299e03d12FA4293BC', // Dr. David Ross (Master)
    '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65', // Dr. Sarah (Creator)
  ]
};

export const mockTxStates = {
  idle: { status: 'idle' },
  pending: {
    status: 'pending',
    message: 'Uploading to IPFS and requesting wallet signature...',
  },
  success: {
    status: 'success',
    message: 'Health record successfully added to Ethereum blockchain!',
    txHash: '0xe88a53e4c49d21c107e054457636e0539ecb001a18c0678d2fb56e2978d2b291',
  },
  error: {
    status: 'error',
    message: 'The patient has not granted you creator permission to add records.',
    rawError: 'execution reverted: You are not granted as a creator',
  }
};
