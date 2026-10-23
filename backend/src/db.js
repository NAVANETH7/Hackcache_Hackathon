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
  tokens: [],
  tokenCounter: 100,
  doctors: [
    {
      id: "DOC-VERMA",
      name: "Dr. A. K. Verma",
      specialty: "Orthopedics",
      roomId: "OPD_104",
      floor: 1,
      status: "AVAILABLE", // AVAILABLE, IN_CONSULTATION, PAUSED
      currentToken: null
    },
    {
      id: "DOC-PRIYA",
      name: "Dr. Priya Sundaram",
      specialty: "Orthopedics",
      roomId: "OPD_105",
      floor: 1,
      status: "AVAILABLE",
      currentToken: null
    },
    {
      id: "DOC-RAJESH",
      name: "Dr. Rajesh Sharma",
      specialty: "General Medicine",
      roomId: "OPD_208",
      floor: 2,
      status: "AVAILABLE",
      currentToken: null
    }
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
