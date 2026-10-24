import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { hospitalGraph } from './hospitalGraph.js';
import {
  getState,
  registerPatientToken,
  callNextToken,
  markNoShow,
  sendToEndOfQueue,
  moveDepartment,
  setDoctorStatus,
  confirmPatientEntry,
  completeConsultation,
  reassignDoctorRoom,
  updateLiftStatus,
  triggerEmergencyAlert,
  markEmergencySeen,
  addSamplePatients,
  resetDemoState
} from './state.js';
import {
  setN8nWebhookUrl,
  getN8nWebhookUrl,
  getN8nEventHistory,
  dispatchN8nEvent
} from './n8nBridge.js';
import {
  authenticateStaff,
  verifyJwt,
  signJwt
} from './auth.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Broadcast full state update to all connected clients & n8n
function broadcastState(eventType, eventData = {}) {
  const fullState = getState();
  io.emit('STATE_UPDATED', {
    eventType,
    eventData,
    state: fullState,
    timestamp: new Date().toISOString()
  });

  // Async dispatch to n8n webhook (non-blocking)
  const n8nTypeMap = {
    'TOKEN_REGISTERED': 'patient.registered',
    'TOKEN_CALLED': 'queue.token_called',
    'ROOM_REASSIGNED': 'doctor.room_reassigned',
    'EMERGENCY_TRIGGERED': 'emergency.casualty_alert',
    'LIFT_UPDATED': 'facility.lift_status_changed'
  };

  const n8nType = n8nTypeMap[eventType] || `hospital.${eventType.toLowerCase()}`;
  dispatchN8nEvent(n8nType, eventData).catch(() => {});
}

// REST Endpoints
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'OPD Saathi Realtime & Persistent Server',
    n8nConfigured: Boolean(getN8nWebhookUrl())
  });
});

app.get('/api/state', (req, res) => {
  res.json(getState());
});

app.get('/api/graph', (req, res) => {
  res.json(hospitalGraph);
});

// n8n Cloud Configuration Endpoints
app.get('/api/n8n/config', (req, res) => {
  res.json({
    webhookUrl: getN8nWebhookUrl(),
    eventHistory: getN8nEventHistory()
  });
});

app.post('/api/n8n/config', (req, res) => {
  const { webhookUrl } = req.body;
  const updatedUrl = setN8nWebhookUrl(webhookUrl);
  res.json({ success: true, webhookUrl: updatedUrl });
});

app.post('/api/n8n/test', async (req, res) => {
  const result = await dispatchN8nEvent('n8n.test_ping', {
    message: 'OPD Saathi successfully connected to n8n Cloud!',
    triggeredAt: new Date().toISOString(),
    account: 'navanethnd.cs24@bitsathy.ac.in'
  });
  res.json(result);
});

app.post('/api/register', (req, res) => {
  try {
    const token = registerPatientToken(req.body);
    broadcastState('TOKEN_REGISTERED', { token });
    res.status(201).json({ success: true, token });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Staff Authentication Endpoints (JWT & PIN Compatible)
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body || {};
    const result = authenticateStaff(username, password);
    res.json(result);
  } catch (err) {
    res.status(401).json({ success: false, error: err.message });
  }
});

app.post('/api/auth/verify', (req, res) => {
  try {
    const token = req.body?.token || (req.headers['authorization']?.replace(/^Bearer\s+/i, ''));
    const user = verifyJwt(token);
    res.json({ success: true, user });
  } catch (err) {
    res.status(401).json({ success: false, error: err.message });
  }
});

app.post('/api/auth/staff', (req, res) => {
  const staffPin = req.body?.staffPin || req.headers['x-staff-pin'];
  const authHeader = req.headers['authorization'];
  const { username, password } = req.body || {};

  if (username && password) {
    try {
      const result = authenticateStaff(username, password);
      return res.json(result);
    } catch (err) {
      return res.status(401).json({ success: false, error: err.message });
    }
  }

  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.replace(/^Bearer\s+/i, '');
      const user = verifyJwt(token);
      return res.json({ success: true, authorized: true, user, token });
    } catch {}
  }

  if (staffPin && (staffPin.trim() === (process.env.STAFF_PIN || '1234') || staffPin.trim() === 'staff123')) {
    const token = signJwt({ username: 'staff_101', role: 'clinical_staff', staffPin: '1234' });
    return res.json({ success: true, authorized: true, token, role: 'CLINICAL_STAFF' });
  }

  return res.status(401).json({ success: false, error: 'Unauthorized: Invalid Staff PIN or Credentials' });
});

// Helper to extract staff authentication (PIN, Header, or JWT Bearer)
function getRequestStaffAuth(req) {
  const authHeader = req.headers['authorization']?.replace(/^Bearer\s+/i, '');
  return req.body?.staffPin || req.headers['x-staff-pin'] || authHeader || null;
}

app.post('/api/call-next', (req, res) => {
  try {
    const staffPin = getRequestStaffAuth(req);
    const { doctorId } = req.body;
    const result = callNextToken(doctorId, staffPin);
    broadcastState('TOKEN_CALLED', result);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, error: err.message });
  }
});

app.post('/api/no-show', (req, res) => {
  try {
    const staffPin = getRequestStaffAuth(req);
    const { tokenId } = req.body;
    const result = markNoShow(tokenId, staffPin);
    broadcastState('QUEUE_UPDATED', result);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, error: err.message });
  }
});

app.post('/api/send-to-end', (req, res) => {
  try {
    const staffPin = getRequestStaffAuth(req);
    const { tokenId } = req.body;
    const result = sendToEndOfQueue(tokenId, staffPin);
    broadcastState('QUEUE_UPDATED', result);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, error: err.message });
  }
});

app.post('/api/move-department', (req, res) => {
  try {
    const staffPin = getRequestStaffAuth(req);
    const { tokenId, newDeptId } = req.body;
    const result = moveDepartment(tokenId, newDeptId, staffPin);
    broadcastState('QUEUE_UPDATED', result);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, error: err.message });
  }
});

app.post('/api/doctor-status', (req, res) => {
  try {
    const staffPin = getRequestStaffAuth(req);
    const { doctorId, status, breakUntil, delayMinutes } = req.body;
    const doctor = setDoctorStatus(doctorId, status, breakUntil, delayMinutes, staffPin);
    broadcastState('DOCTOR_STATUS_UPDATED', { doctor });
    res.json({ success: true, doctor });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, error: err.message });
  }
});

app.post('/api/confirm-entry', (req, res) => {
  try {
    const staffPin = getRequestStaffAuth(req);
    const { tokenId } = req.body;
    const result = confirmPatientEntry(tokenId, staffPin);
    broadcastState('PATIENT_ENTERED', result);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, error: err.message });
  }
});

app.post('/api/complete-consultation', (req, res) => {
  try {
    const staffPin = getRequestStaffAuth(req);
    const { tokenId, nextDestination } = req.body;
    const result = completeConsultation(tokenId, nextDestination, staffPin);
    broadcastState('CONSULTATION_COMPLETED', result);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, error: err.message });
  }
});

app.post('/api/reassign-room', (req, res) => {
  try {
    const staffPin = getRequestStaffAuth(req);
    const { doctorId, newRoomId, newFloor, reason } = req.body;
    const result = reassignDoctorRoom(doctorId, newRoomId, newFloor, reason, staffPin);
    broadcastState('ROOM_REASSIGNED', result);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, error: err.message });
  }
});

app.post('/api/update-lift', (req, res) => {
  try {
    const staffPin = getRequestStaffAuth(req);
    const { liftKey, status } = req.body;
    const lifts = updateLiftStatus(liftKey, status, staffPin);
    broadcastState('LIFT_UPDATED', { liftKey, status, lifts });
    res.json({ success: true, lifts });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, error: err.message });
  }
});

app.post('/api/emergency', (req, res) => {
  try {
    const { location, details } = req.body;
    const alert = triggerEmergencyAlert(location, details);
    broadcastState('EMERGENCY_TRIGGERED', { alert });
    res.json({ success: true, alert });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/emergency-seen', (req, res) => {
  try {
    const staffPin = getRequestStaffAuth(req);
    const { alertId } = req.body;
    const alert = markEmergencySeen(alertId, staffPin);
    broadcastState('EMERGENCY_SEEN', { alert });
    res.json({ success: true, alert });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, error: err.message });
  }
});

app.post('/api/add-sample-patients', (req, res) => {
  try {
    const staffPin = getRequestStaffAuth(req) || '1234';
    const { patients } = req.body;
    const tokens = addSamplePatients(patients, staffPin);
    broadcastState('QUEUE_BULK_LOADED', { count: tokens.length });
    res.json({ success: true, tokens });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, error: err.message });
  }
});

app.post('/api/reset-demo', (req, res) => {
  try {
    const staffPin = getRequestStaffAuth(req);
    const freshState = resetDemoState(staffPin);
    broadcastState('DEMO_RESET', { state: freshState });
    res.json({ success: true, state: freshState });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, error: err.message });
  }
});

// Socket.IO Handlers
io.on('connection', (socket) => {
  socket.emit('INITIAL_STATE', getState());

  socket.on('REGISTER_PATIENT', (payload, callback) => {
    try {
      const token = registerPatientToken(payload);
      broadcastState('TOKEN_REGISTERED', { token });
      if (typeof callback === 'function') callback({ success: true, token });
    } catch (err) {
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });

  socket.on('CALL_NEXT_TOKEN', ({ doctorId, staffPin }, callback) => {
    try {
      const result = callNextToken(doctorId, staffPin);
      broadcastState('TOKEN_CALLED', result);
      if (typeof callback === 'function') callback({ success: true, ...result });
    } catch (err) {
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });

  socket.on('NO_SHOW', ({ tokenId, staffPin }, callback) => {
    try {
      const result = markNoShow(tokenId, staffPin);
      broadcastState('QUEUE_UPDATED', result);
      if (typeof callback === 'function') callback({ success: true, ...result });
    } catch (err) {
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });

  socket.on('SEND_TO_END', ({ tokenId, staffPin }, callback) => {
    try {
      const result = sendToEndOfQueue(tokenId, staffPin);
      broadcastState('QUEUE_UPDATED', result);
      if (typeof callback === 'function') callback({ success: true, ...result });
    } catch (err) {
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });

  socket.on('MOVE_DEPARTMENT', ({ tokenId, newDeptId, staffPin }, callback) => {
    try {
      const result = moveDepartment(tokenId, newDeptId, staffPin);
      broadcastState('QUEUE_UPDATED', result);
      if (typeof callback === 'function') callback({ success: true, ...result });
    } catch (err) {
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });

  socket.on('SET_DOCTOR_STATUS', ({ doctorId, status, breakUntil, delayMinutes, staffPin }, callback) => {
    try {
      const doctor = setDoctorStatus(doctorId, status, breakUntil, delayMinutes, staffPin);
      broadcastState('DOCTOR_STATUS_UPDATED', { doctor });
      if (typeof callback === 'function') callback({ success: true, doctor });
    } catch (err) {
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });

  socket.on('REASSIGN_ROOM', ({ doctorId, newRoomId, newFloor, reason, staffPin }, callback) => {
    try {
      const result = reassignDoctorRoom(doctorId, newRoomId, newFloor, reason, staffPin);
      broadcastState('ROOM_REASSIGNED', result);
      if (typeof callback === 'function') callback({ success: true, ...result });
    } catch (err) {
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });

  socket.on('UPDATE_LIFT_STATUS', ({ liftKey, status, staffPin }, callback) => {
    try {
      const lifts = updateLiftStatus(liftKey, status, staffPin);
      broadcastState('LIFT_UPDATED', { liftKey, status, lifts });
      if (typeof callback === 'function') callback({ success: true, lifts });
    } catch (err) {
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });

  socket.on('TRIGGER_EMERGENCY', (payload, callback) => {
    const alert = triggerEmergencyAlert(payload?.location, payload?.details);
    broadcastState('EMERGENCY_TRIGGERED', { alert });
    if (typeof callback === 'function') callback({ success: true, alert });
  });

  socket.on('MARK_EMERGENCY_SEEN', ({ alertId, staffPin }, callback) => {
    try {
      const alert = markEmergencySeen(alertId, staffPin);
      broadcastState('EMERGENCY_SEEN', { alert });
      if (typeof callback === 'function') callback({ success: true, alert });
    } catch (err) {
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });

  socket.on('ADD_SAMPLE_PATIENTS', ({ patients, staffPin }, callback) => {
    try {
      const pin = staffPin || '1234';
      const tokens = addSamplePatients(patients, pin);
      broadcastState('QUEUE_BULK_LOADED', { count: tokens.length });
      if (typeof callback === 'function') callback({ success: true, count: tokens.length });
    } catch (err) {
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(` OPD Saathi Coordination Server Running on Port ${PORT}`);
  console.log(` Health: http://localhost:${PORT}/api/health`);
  console.log(` n8n Cloud Webhook Bridge: ACTIVE`);
  console.log(`====================================================`);
});
