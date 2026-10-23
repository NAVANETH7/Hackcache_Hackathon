import { loadDatabase, saveDatabase } from './db.js';

let state = loadDatabase();

export function getState() {
  return state;
}

export function registerPatientToken(payload) {
  state.tokenCounter = (state.tokenCounter || 100) + 1;
  const tokenNum = state.tokenCounter;
  const deptCode = payload.deptCode || (payload.departmentId ? payload.departmentId.substring(0, 3).toUpperCase() : 'OPD');
  const tokenId = `${deptCode}-${String(tokenNum).padStart(3, '0')}`;

  // Find assigned doctor for department
  const doctor = state.doctors.find(d => 
    (payload.departmentId && (d.departmentId === payload.departmentId || d.specialty.toLowerCase().includes(payload.departmentId.toLowerCase()))) ||
    (payload.departmentName && d.specialty.toLowerCase().includes(payload.departmentName.toLowerCase()))
  ) || state.doctors[0];

  const newToken = {
    tokenId,
    tokenNumber: tokenNum,
    patientName: payload.patientName || 'Kamla',
    age: payload.age || 62,
    gender: payload.gender || 'Female',
    mobile: payload.mobile || '',
    language: payload.language || 'ta',
    avoidStairs: payload.avoidStairs !== undefined ? payload.avoidStairs : true,
    assistedMode: payload.assistedMode !== undefined ? payload.assistedMode : true,
    departmentId: doctor.departmentId || payload.departmentId || 'ortho',
    departmentName: doctor.specialty,
    assignedDoctorId: doctor.id,
    assignedDoctorName: doctor.name,
    assignedRoomId: doctor.roomId,
    assignedRoomNumber: doctor.roomNumber || 1,
    assignedFloor: doctor.floor,
    queueStatus: 'WAITING', // WAITING, CALLED, IN_CONSULTATION, COMPLETED, NO_SHOW
    journeyStep: 'NAVIGATING_TO_WAITING',
    issuedAt: new Date().toISOString(),
    calledAt: null,
    inRoomAt: null,
    completedAt: null,
    supersededNote: null,
    version: 1
  };

  state.tokens.push(newToken);
  state.lastUpdated = new Date().toISOString();
  saveDatabase(state);
  return newToken;
}

export function callNextToken(doctorId, staffPin) {
  if (staffPin && staffPin !== '1234') {
    throw new Error('Invalid Staff PIN');
  }

  const doctor = state.doctors.find(d => d.id === doctorId);
  if (!doctor) throw new Error('Doctor not found');

  // Find next waiting token for this doctor or specialty
  const nextToken = state.tokens.find(t => 
    (t.assignedDoctorId === doctorId || t.departmentId === doctor.departmentId) && 
    t.queueStatus === 'WAITING'
  );

  if (!nextToken) {
    return { doctor, token: null, message: 'No more waiting patients' };
  }

  // Update token queue status to CALLED
  nextToken.queueStatus = 'CALLED';
  nextToken.calledAt = new Date().toISOString();
  nextToken.journeyStep = 'RESPONDING_TO_CALL';
  nextToken.version = (nextToken.version || 1) + 1;

  doctor.currentToken = nextToken.tokenId;
  doctor.status = 'CALLING';

  state.auditLog.push({
    action: 'TOKEN_CALLED',
    tokenId: nextToken.tokenId,
    doctorId,
    roomId: doctor.roomId,
    timestamp: new Date().toISOString()
  });

  state.lastUpdated = new Date().toISOString();
  saveDatabase(state);
  return { doctor, token: nextToken };
}

export function markNoShow(tokenId, staffPin) {
  if (staffPin && staffPin !== '1234') throw new Error('Invalid Staff PIN');
  const token = state.tokens.find(t => t.tokenId === tokenId);
  if (!token) throw new Error('Token not found');

  token.queueStatus = 'NO_SHOW';
  token.version = (token.version || 1) + 1;

  const doctor = state.doctors.find(d => d.id === token.assignedDoctorId);
  if (doctor && doctor.currentToken === tokenId) {
    doctor.currentToken = null;
    doctor.status = 'AVAILABLE';
  }

  state.lastUpdated = new Date().toISOString();
  saveDatabase(state);
  return { token, doctor };
}

export function sendToEndOfQueue(tokenId, staffPin) {
  if (staffPin && staffPin !== '1234') throw new Error('Invalid Staff PIN');
  const token = state.tokens.find(t => t.tokenId === tokenId);
  if (!token) throw new Error('Token not found');

  // Set token number to highest + 1
  const maxTokenNum = Math.max(...state.tokens.map(t => t.tokenNumber || 0), 100);
  token.tokenNumber = maxTokenNum + 1;
  token.queueStatus = 'WAITING';
  token.calledAt = null;
  token.version = (token.version || 1) + 1;

  const doctor = state.doctors.find(d => d.id === token.assignedDoctorId);
  if (doctor && doctor.currentToken === tokenId) {
    doctor.currentToken = null;
    doctor.status = 'AVAILABLE';
  }

  state.lastUpdated = new Date().toISOString();
  saveDatabase(state);
  return { token, doctor };
}

export function moveDepartment(tokenId, newDeptId, staffPin) {
  if (staffPin && staffPin !== '1234') throw new Error('Invalid Staff PIN');
  const token = state.tokens.find(t => t.tokenId === tokenId);
  if (!token) throw new Error('Token not found');

  const newDoc = state.doctors.find(d => d.departmentId === newDeptId || d.id === newDeptId) || state.doctors[0];
  const oldDoctor = state.doctors.find(d => d.id === token.assignedDoctorId);
  if (oldDoctor && oldDoctor.currentToken === tokenId) {
    oldDoctor.currentToken = null;
    oldDoctor.status = 'AVAILABLE';
  }

  token.departmentId = newDoc.departmentId;
  token.departmentName = newDoc.specialty;
  token.assignedDoctorId = newDoc.id;
  token.assignedDoctorName = newDoc.name;
  token.assignedRoomId = newDoc.roomId;
  token.assignedFloor = newDoc.floor;
  token.queueStatus = 'WAITING';
  token.calledAt = null;
  token.supersededNote = {
    previousRoom: oldDoctor?.roomId || 'Previous',
    newRoom: newDoc.roomId,
    newFloor: newDoc.floor,
    reason: 'Transferred to another clinical specialty',
    supersededAt: new Date().toISOString(),
    confirmedBy: 'Staff Desk'
  };
  token.version = (token.version || 1) + 1;

  state.lastUpdated = new Date().toISOString();
  saveDatabase(state);
  return { token, newDoc };
}

export function setDoctorStatus(doctorId, status, breakUntil = null, delayMinutes = 0, staffPin) {
  if (staffPin && staffPin !== '1234') throw new Error('Invalid Staff PIN');
  const doctor = state.doctors.find(d => d.id === doctorId);
  if (!doctor) throw new Error('Doctor not found');

  doctor.status = status; // AVAILABLE, ON_BREAK, RUNNING_LATE, IN_CONSULTATION
  doctor.breakUntil = breakUntil;
  doctor.delayMinutes = Number(delayMinutes) || 0;

  state.lastUpdated = new Date().toISOString();
  saveDatabase(state);
  return doctor;
}

export function confirmPatientEntry(tokenId, staffPin) {
  if (staffPin && staffPin !== '1234') {
    throw new Error('Invalid Staff PIN');
  }

  const token = state.tokens.find(t => t.tokenId === tokenId);
  if (!token) throw new Error('Token not found');

  token.queueStatus = 'IN_CONSULTATION';
  token.inRoomAt = new Date().toISOString();
  token.journeyStep = 'IN_CONSULTATION';
  token.version = (token.version || 1) + 1;

  const doctor = state.doctors.find(d => d.id === token.assignedDoctorId);
  if (doctor) {
    doctor.status = 'IN_CONSULTATION';
  }

  state.lastUpdated = new Date().toISOString();
  saveDatabase(state);
  return { token, doctor };
}

export function completeConsultation(tokenId, nextDestination = 'PHARMACY_G', staffPin) {
  if (staffPin && staffPin !== '1234') {
    throw new Error('Invalid Staff PIN');
  }

  const token = state.tokens.find(t => t.tokenId === tokenId);
  if (!token) throw new Error('Token not found');

  token.queueStatus = 'COMPLETED';
  token.completedAt = new Date().toISOString();
  token.journeyStep = nextDestination === 'LAB_G' || nextDestination === 'LAB_F1' ? 'NAVIGATING_TO_LAB' : 'NAVIGATING_TO_PHARMACY';
  token.nextDestination = nextDestination;
  token.version = (token.version || 1) + 1;

  const doctor = state.doctors.find(d => d.id === token.assignedDoctorId);
  if (doctor) {
    doctor.currentToken = null;
    doctor.status = 'AVAILABLE';
  }

  state.lastUpdated = new Date().toISOString();
  saveDatabase(state);
  return { token, doctor };
}

export function reassignDoctorRoom(doctorId, newRoomId, newFloor, reason = 'Doctor relocated by administration', staffPin) {
  if (staffPin && staffPin !== '1234') {
    throw new Error('Invalid Staff PIN');
  }

  const doctor = state.doctors.find(d => d.id === doctorId);
  if (!doctor) throw new Error('Doctor not found');

  const oldRoomId = doctor.roomId;
  const oldFloor = doctor.floor;

  doctor.roomId = newRoomId;
  doctor.floor = newFloor;

  const nowIso = new Date().toISOString();

  // Find all active tokens assigned to this doctor that are still in WAITING or CALLED
  const affectedTokens = state.tokens.filter(t => 
    t.assignedDoctorId === doctorId && 
    (t.queueStatus === 'WAITING' || t.queueStatus === 'CALLED')
  );

  affectedTokens.forEach(t => {
    t.assignedRoomId = newRoomId;
    t.assignedFloor = newFloor;
    t.supersededNote = {
      previousRoom: oldRoomId,
      previousFloor: oldFloor,
      newRoom: newRoomId,
      newFloor: newFloor,
      reason,
      supersededAt: nowIso,
      confirmedBy: `Staff-Desk`
    };
    t.version = (t.version || 1) + 1;
  });

  state.auditLog.push({
    action: 'ROOM_REASSIGNED',
    doctorId,
    oldRoomId,
    newRoomId,
    newFloor,
    reason,
    affectedTokenCount: affectedTokens.length,
    timestamp: nowIso
  });

  state.lastUpdated = nowIso;
  saveDatabase(state);
  return { doctor, oldRoomId, newRoomId, newFloor, affectedTokens };
}

export function updateLiftStatus(liftKey, status, staffPin) {
  if (staffPin && staffPin !== '1234') {
    throw new Error('Invalid Staff PIN');
  }

  if (!state.lifts[liftKey]) {
    throw new Error('Invalid lift key');
  }

  state.lifts[liftKey].status = status;
  state.auditLog.push({
    action: 'LIFT_STATUS_CHANGED',
    liftKey,
    status,
    timestamp: new Date().toISOString()
  });

  state.lastUpdated = new Date().toISOString();
  saveDatabase(state);
  return state.lifts;
}

export function triggerEmergencyAlert(location = 'Entrance Area', details = 'Critical patient arrived at Casualty') {
  const alert = {
    id: `EMG-${Date.now()}`,
    location,
    details,
    timestamp: new Date().toISOString(),
    status: 'ACTIVE',
    seen: false
  };
  state.emergencies.unshift(alert);
  state.lastUpdated = new Date().toISOString();
  saveDatabase(state);
  return alert;
}

export function markEmergencySeen(alertId, staffPin) {
  if (staffPin && staffPin !== '1234') throw new Error('Invalid Staff PIN');
  const alert = state.emergencies.find(a => a.id === alertId);
  if (alert) {
    alert.seen = true;
    alert.status = 'SEEN';
  }
  state.lastUpdated = new Date().toISOString();
  saveDatabase(state);
  return alert;
}

export function addSamplePatients(sampleList) {
  if (!Array.isArray(sampleList)) return state.tokens;
  
  sampleList.forEach(sample => {
    // Check if token already exists
    if (!state.tokens.some(t => t.tokenId === sample.tokenId)) {
      state.tokens.push({
        ...sample,
        issuedAt: new Date().toISOString(),
        version: 1
      });
    }
  });

  state.lastUpdated = new Date().toISOString();
  saveDatabase(state);
  return state.tokens;
}

export function resetDemoState() {
  const initial = {
    version: 1,
    lastUpdated: new Date().toISOString(),
    tokenCounter: 142,
    tokens: [
      {
        tokenId: "ORT-041",
        tokenNumber: 41,
        patientName: "Subramanian",
        age: 65,
        gender: "Male",
        language: "ta",
        avoidStairs: true,
        assistedMode: true,
        departmentId: "ortho",
        departmentName: "Bones & Joints (Orthopedics)",
        assignedDoctorId: "DOC-VERMA",
        assignedDoctorName: "Dr. A. K. Verma",
        assignedRoomId: "OPD_ROOM_5",
        assignedRoomNumber: 5,
        assignedFloor: 1,
        queueStatus: "IN_CONSULTATION",
        journeyStep: "IN_CONSULTATION",
        issuedAt: new Date(Date.now() - 25 * 60000).toISOString(),
        calledAt: new Date(Date.now() - 10 * 60000).toISOString(),
        version: 2
      },
      {
        tokenId: "ORT-042",
        tokenNumber: 42,
        patientName: "Kamla",
        age: 62,
        gender: "Female",
        language: "ta",
        avoidStairs: true,
        assistedMode: true,
        departmentId: "ortho",
        departmentName: "Bones & Joints (Orthopedics)",
        assignedDoctorId: "DOC-VERMA",
        assignedDoctorName: "Dr. A. K. Verma",
        assignedRoomId: "OPD_ROOM_5",
        assignedRoomNumber: 5,
        assignedFloor: 1,
        queueStatus: "WAITING",
        journeyStep: "NAVIGATING_TO_WAITING",
        issuedAt: new Date(Date.now() - 5 * 60000).toISOString(),
        calledAt: null,
        version: 1
      },
      {
        tokenId: "ORT-043",
        tokenNumber: 43,
        patientName: "Harish Chandra",
        age: 50,
        gender: "Male",
        language: "hi",
        avoidStairs: false,
        assistedMode: false,
        departmentId: "ortho",
        departmentName: "Bones & Joints (Orthopedics)",
        assignedDoctorId: "DOC-VERMA",
        assignedDoctorName: "Dr. A. K. Verma",
        assignedRoomId: "OPD_ROOM_5",
        assignedRoomNumber: 5,
        assignedFloor: 1,
        queueStatus: "WAITING",
        journeyStep: "AT_WAITING_ZONE",
        issuedAt: new Date(Date.now() - 2 * 60000).toISOString(),
        calledAt: null,
        version: 1
      },
      {
        tokenId: "MED-011",
        tokenNumber: 11,
        patientName: "Ramesh Sharma",
        age: 54,
        gender: "Male",
        language: "hi",
        avoidStairs: false,
        assistedMode: false,
        departmentId: "gen_med",
        departmentName: "General Medicine",
        assignedDoctorId: "DOC-RAJESH",
        assignedDoctorName: "Dr. Rajesh Sharma",
        assignedRoomId: "OPD_ROOM_1",
        assignedRoomNumber: 1,
        assignedFloor: 1,
        queueStatus: "IN_CONSULTATION",
        journeyStep: "IN_CONSULTATION",
        issuedAt: new Date(Date.now() - 20 * 60000).toISOString(),
        calledAt: new Date(Date.now() - 5 * 60000).toISOString(),
        version: 2
      },
      {
        tokenId: "MED-012",
        tokenNumber: 12,
        patientName: "Savita Devi",
        age: 68,
        gender: "Female",
        language: "hi",
        avoidStairs: true,
        assistedMode: true,
        departmentId: "gen_med",
        departmentName: "General Medicine",
        assignedDoctorId: "DOC-RAJESH",
        assignedDoctorName: "Dr. Rajesh Sharma",
        assignedRoomId: "OPD_ROOM_1",
        assignedRoomNumber: 1,
        assignedFloor: 1,
        queueStatus: "WAITING",
        journeyStep: "NAVIGATING_TO_WAITING",
        issuedAt: new Date(Date.now() - 8 * 60000).toISOString(),
        calledAt: null,
        version: 1
      },
      {
        tokenId: "PED-031",
        tokenNumber: 31,
        patientName: "Baby Aarav",
        age: 3,
        gender: "Male",
        language: "hi",
        avoidStairs: false,
        assistedMode: false,
        departmentId: "pediatrics",
        departmentName: "Children (Pediatrics)",
        assignedDoctorId: "DOC-PRIYA",
        assignedDoctorName: "Dr. Priya Sundaram",
        assignedRoomId: "OPD_ROOM_3",
        assignedRoomNumber: 3,
        assignedFloor: 1,
        queueStatus: "IN_CONSULTATION",
        journeyStep: "IN_CONSULTATION",
        issuedAt: new Date(Date.now() - 15 * 60000).toISOString(),
        calledAt: new Date(Date.now() - 3 * 60000).toISOString(),
        version: 2
      }
    ],
    doctors: [
      {
        id: "DOC-RAJESH",
        name: "Dr. Rajesh Sharma",
        departmentId: "gen_med",
        specialty: "General Medicine",
        roomId: "OPD_ROOM_1",
        roomNumber: 1,
        floor: 1,
        status: "IN_CONSULTATION",
        currentToken: "MED-011",
        breakUntil: null,
        delayMinutes: 0
      },
      {
        id: "DOC-SUNITA",
        name: "Dr. Sunita Rao",
        departmentId: "gen_med_2",
        specialty: "General Medicine (Room 2)",
        roomId: "OPD_ROOM_2",
        roomNumber: 2,
        floor: 1,
        status: "AVAILABLE",
        currentToken: null,
        breakUntil: null,
        delayMinutes: 0
      },
      {
        id: "DOC-PRIYA",
        name: "Dr. Priya Sundaram",
        departmentId: "pediatrics",
        specialty: "Children (Pediatrics)",
        roomId: "OPD_ROOM_3",
        roomNumber: 3,
        floor: 1,
        status: "IN_CONSULTATION",
        currentToken: "PED-031",
        breakUntil: null,
        delayMinutes: 0
      },
      {
        id: "DOC-MEENAKSHI",
        name: "Dr. Meenakshi Iyer",
        departmentId: "women",
        specialty: "Women & Pregnancy",
        roomId: "OPD_ROOM_4",
        roomNumber: 4,
        floor: 1,
        status: "AVAILABLE",
        currentToken: null,
        breakUntil: null,
        delayMinutes: 0
      },
      {
        id: "DOC-VERMA",
        name: "Dr. A. K. Verma",
        departmentId: "ortho",
        specialty: "Bones & Joints (Orthopedics)",
        roomId: "OPD_ROOM_5",
        roomNumber: 5,
        floor: 1,
        status: "IN_CONSULTATION",
        currentToken: "ORT-041",
        breakUntil: null,
        delayMinutes: 0
      },
      {
        id: "DOC-ANAND",
        name: "Dr. Anand Deshmukh",
        departmentId: "ent",
        specialty: "Ear, Nose & Throat (ENT)",
        roomId: "OPD_ROOM_6",
        roomNumber: 6,
        floor: 1,
        status: "AVAILABLE",
        currentToken: null,
        breakUntil: null,
        delayMinutes: 0
      },
      {
        id: "DOC-SWAMINATHAN",
        name: "Dr. K. Swaminathan",
        departmentId: "eyes",
        specialty: "Eyes (Ophthalmology)",
        roomId: "OPD_ROOM_7",
        roomNumber: 7,
        floor: 1,
        status: "AVAILABLE",
        currentToken: null,
        breakUntil: null,
        delayMinutes: 0
      },
      {
        id: "DOC-FATIMA",
        name: "Dr. Fatima Zahra",
        departmentId: "skin",
        specialty: "Skin (Dermatology)",
        roomId: "OPD_ROOM_8",
        roomNumber: 8,
        floor: 1,
        status: "AVAILABLE",
        currentToken: null,
        breakUntil: null,
        delayMinutes: 0
      }
    ],
    waitingAreas: [
      { id: "WAITING_HALL_A", name: "Waiting Hall A (Floor 1)", seatsTotal: 60, currentWaitCount: 12 },
      { id: "WAITING_HALL_G", name: "Ground Registration Hall", seatsTotal: 40, currentWaitCount: 15 }
    ],
    lifts: {
      "LIFT_A": { name: "Elevator Block A", status: "OPERATIONAL" },
      "LIFT_B": { name: "Elevator Block B", status: "OPERATIONAL" },
      "RAMP_1": { name: "Accessible Ramp 1", status: "OPERATIONAL" }
    },
    emergencies: [],
    auditLog: []
  };

  state = initial;
  saveDatabase(state);
  return state;
}
