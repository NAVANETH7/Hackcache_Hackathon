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

app.post('/api/call-next', (req, res) => {
  try {
    const { doctorId, staffPin } = req.body;
    const result = callNextToken(doctorId, staffPin || '1234');
    broadcastState('TOKEN_CALLED', result);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/no-show', (req, res) => {
  try {
    const { tokenId, staffPin } = req.body;
    const result = markNoShow(tokenId, staffPin || '1234');
    broadcastState('QUEUE_UPDATED', result);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/send-to-end', (req, res) => {
  try {
    const { tokenId, staffPin } = req.body;
    const result = sendToEndOfQueue(tokenId, staffPin || '1234');
    broadcastState('QUEUE_UPDATED', result);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/move-department', (req, res) => {
  try {
    const { tokenId, newDeptId, staffPin } = req.body;
    const result = moveDepartment(tokenId, newDeptId, staffPin || '1234');
    broadcastState('QUEUE_UPDATED', result);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/doctor-status', (req, res) => {
  try {
    const { doctorId, status, breakUntil, delayMinutes, staffPin } = req.body;
    const doctor = setDoctorStatus(doctorId, status, breakUntil, delayMinutes, staffPin || '1234');
    broadcastState('DOCTOR_STATUS_UPDATED', { doctor });
    res.json({ success: true, doctor });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/confirm-entry', (req, res) => {
  try {
    const { tokenId, staffPin } = req.body;
    const result = confirmPatientEntry(tokenId, staffPin || '1234');
    broadcastState('PATIENT_ENTERED', result);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/complete-consultation', (req, res) => {
  try {
    const { tokenId, nextDestination, staffPin } = req.body;
    const result = completeConsultation(tokenId, nextDestination, staffPin || '1234');
    broadcastState('CONSULTATION_COMPLETED', result);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/reassign-room', (req, res) => {
  try {
    const { doctorId, newRoomId, newFloor, reason, staffPin } = req.body;
    const result = reassignDoctorRoom(doctorId, newRoomId, newFloor, reason, staffPin || '1234');
    broadcastState('ROOM_REASSIGNED', result);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/update-lift', (req, res) => {
  try {
    const { liftKey, status, staffPin } = req.body;
    const lifts = updateLiftStatus(liftKey, status, staffPin || '1234');
    broadcastState('LIFT_UPDATED', { liftKey, status, lifts });
    res.json({ success: true, lifts });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
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
    const { alertId, staffPin } = req.body;
    const alert = markEmergencySeen(alertId, staffPin || '1234');
    broadcastState('EMERGENCY_SEEN', { alert });
    res.json({ success: true, alert });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/add-sample-patients', (req, res) => {
  try {
    const { patients } = req.body;
    const tokens = addSamplePatients(patients);
    broadcastState('QUEUE_BULK_LOADED', { count: tokens.length });
    res.json({ success: true, tokens });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/reset-demo', (req, res) => {
  const freshState = resetDemoState();
  broadcastState('DEMO_RESET', { state: freshState });
  res.json({ success: true, state: freshState });
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
      const result = callNextToken(doctorId, staffPin || '1234');
      broadcastState('TOKEN_CALLED', result);
      if (typeof callback === 'function') callback({ success: true, ...result });
    } catch (err) {
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });

  socket.on('NO_SHOW', ({ tokenId, staffPin }, callback) => {
    try {
      const result = markNoShow(tokenId, staffPin || '1234');
      broadcastState('QUEUE_UPDATED', result);
      if (typeof callback === 'function') callback({ success: true, ...result });
    } catch (err) {
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });

  socket.on('SEND_TO_END', ({ tokenId, staffPin }, callback) => {
    try {
      const result = sendToEndOfQueue(tokenId, staffPin || '1234');
      broadcastState('QUEUE_UPDATED', result);
      if (typeof callback === 'function') callback({ success: true, ...result });
    } catch (err) {
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });

  socket.on('MOVE_DEPARTMENT', ({ tokenId, newDeptId, staffPin }, callback) => {
    try {
      const result = moveDepartment(tokenId, newDeptId, staffPin || '1234');
      broadcastState('QUEUE_UPDATED', result);
      if (typeof callback === 'function') callback({ success: true, ...result });
    } catch (err) {
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });

  socket.on('SET_DOCTOR_STATUS', ({ doctorId, status, breakUntil, delayMinutes, staffPin }, callback) => {
    try {
      const doctor = setDoctorStatus(doctorId, status, breakUntil, delayMinutes, staffPin || '1234');
      broadcastState('DOCTOR_STATUS_UPDATED', { doctor });
      if (typeof callback === 'function') callback({ success: true, doctor });
    } catch (err) {
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });

  socket.on('REASSIGN_ROOM', ({ doctorId, newRoomId, newFloor, reason, staffPin }, callback) => {
    try {
      const result = reassignDoctorRoom(doctorId, newRoomId, newFloor, reason, staffPin || '1234');
      broadcastState('ROOM_REASSIGNED', result);
      if (typeof callback === 'function') callback({ success: true, ...result });
    } catch (err) {
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });

  socket.on('UPDATE_LIFT_STATUS', ({ liftKey, status, staffPin }, callback) => {
    try {
      const lifts = updateLiftStatus(liftKey, status, staffPin || '1234');
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
    const alert = markEmergencySeen(alertId, staffPin || '1234');
    broadcastState('EMERGENCY_SEEN', { alert });
    if (typeof callback === 'function') callback({ success: true, alert });
  });
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` OPD Saathi Coordination Server Running on Port ${PORT}`);
  console.log(` Health: http://localhost:${PORT}/api/health`);
  console.log(` n8n Cloud Webhook Bridge: ACTIVE`);
  console.log(`====================================================`);
});
