import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'opd_state.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const defaultInitialState = {
  version: 1,
  lastUpdated: new Date().toISOString(),
  tokenCounter: 150,
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
      patientName: "Kamla Devi",
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
      age: 48,
      gender: "Male",
      language: "hi",
      avoidStairs: false,
      assistedMode: true,
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
      patientName: "Meera Devi",
      age: 42,
      gender: "Female",
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
      queueStatus: "WAITING",
      journeyStep: "AT_WAITING_ZONE",
      issuedAt: new Date(Date.now() - 8 * 60000).toISOString(),
      calledAt: null,
      version: 1
    },
    {
      tokenId: "PED-031",
      tokenNumber: 31,
      patientName: "Priya & Baby Aarav",
      age: 27,
      gender: "Female",
      language: "te",
      avoidStairs: true,
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
    },
    {
      tokenId: "PED-032",
      tokenNumber: 32,
      patientName: "Aarav Kumar",
      age: 4,
      gender: "Male",
      language: "ta",
      avoidStairs: true,
      assistedMode: true,
      departmentId: "pediatrics",
      departmentName: "Children (Pediatrics)",
      assignedDoctorId: "DOC-PRIYA",
      assignedDoctorName: "Dr. Priya Sundaram",
      assignedRoomId: "OPD_ROOM_3",
      assignedRoomNumber: 3,
      assignedFloor: 1,
      queueStatus: "WAITING",
      journeyStep: "AT_WAITING_ZONE",
      issuedAt: new Date(Date.now() - 6 * 60000).toISOString(),
      calledAt: null,
      version: 1
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
    { id: "WAITING_HALL_A", name: "Waiting Hall A (Floor 1)", seatsTotal: 60, currentWaitCount: 8 },
    { id: "WAITING_HALL_G", name: "Ground Registration Hall", seatsTotal: 40, currentWaitCount: 12 }
  ],
  lifts: {
    "LIFT_A": { name: "Elevator Block A", status: "OPERATIONAL" },
    "LIFT_B": { name: "Elevator Block B", status: "OPERATIONAL" },
    "RAMP_1": { name: "Accessible Ramp 1", status: "OPERATIONAL" },
    "RAMP_2": { name: "Accessible Ramp 2", status: "OPERATIONAL" }
  },
  emergencies: [],
  auditLog: []
};

export function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      console.log(`[DB] Loaded persistent state (version: ${parsed.version}, active tokens: ${parsed.tokens.length})`);
      return parsed;
    }
  } catch (err) {
    console.error('[DB] Failed reading persistent state, using default:', err.message);
  }

  // If file doesn't exist, save and return default initial state
  saveDatabase(defaultInitialState);
  return JSON.parse(JSON.stringify(defaultInitialState));
}

export function saveDatabase(state) {
  try {
    state.lastUpdated = new Date().toISOString();
    state.version = (state.version || 0) + 1;
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(state, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('[DB] Error atomically saving persistent state:', err.message);
  }
}
