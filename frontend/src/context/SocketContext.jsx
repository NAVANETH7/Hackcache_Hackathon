import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { departments } from '../data/departments';
import { hospitalData } from '../data/hospital';
import { samplePatients } from '../data/patients';
import { saveGraphOffline, getGraphOffline } from '../utils/offlineStore';

const SocketContext = createContext();

const SOCKET_SERVER_URL = 'http://localhost:3001';
const LOCAL_STORAGE_STATE_KEY = 'opd_saathi_shared_state';
const OFFLINE_QUEUE_KEY = 'opd_saathi_offline_registrations';

// Web Audio API Synthetic Chime Generator
export function playChime(type = 'call') {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'urgent') {
      // Siren dual tone for emergency flag
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.3);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.6);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
      return;
    }

    if (type === 'alert3') {
      // Gentle two-pulse attention chime
      const now = ctx.currentTime;
      [440, 660, 880].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.15, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.3);
      });
      return;
    }

    // Default: Pleasant airport/hospital announcement chime (F - A - C)
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const startTime = ctx.currentTime + idx * 0.15;
      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.5);
    });
  } catch (err) {
    console.warn('[Audio] Could not play synthetic chime:', err);
  }
}

// Initial default state seeded with sample departments and baseline doctors
function getInitialBaselineState() {
  const localSaved = localStorage.getItem(LOCAL_STORAGE_STATE_KEY);
  if (localSaved) {
    try {
      return JSON.parse(localSaved);
    } catch {
      // fallback
    }
  }

  return {
    version: 1,
    lastUpdated: new Date().toISOString(),
    tokenCounter: 142,
    tokens: samplePatients.slice(0, 7).map((p, idx) => ({
      ...p,
      issuedAt: new Date(Date.now() - (idx + 1) * 3 * 60000).toISOString(),
      version: 1
    })),
    doctors: departments.map(d => ({
      id: `DOC-${d.code}`,
      name: d.doctorName,
      name_hi: d.doctorName_hi,
      name_ta: d.doctorName_ta,
      departmentId: d.id,
      specialty: d.name,
      specialty_hi: d.name_hi,
      specialty_ta: d.name_ta,
      roomId: d.roomId,
      roomNumber: d.roomNumber,
      floor: d.floor,
      status: d.id === 'ortho' ? 'IN_CONSULTATION' : d.id === 'gen_med' ? 'IN_CONSULTATION' : 'AVAILABLE',
      currentToken: d.id === 'ortho' ? 'ORT-041' : d.id === 'gen_med' ? 'MED-011' : null,
      breakUntil: null,
      delayMinutes: 0
    })),
    waitingAreas: [
      { id: "WAITING_HALL_A", name: "Waiting Hall A (Floor 1)", seatsTotal: 60, currentWaitCount: 14 },
      { id: "WAITING_HALL_G", name: "Ground Registration Hall", seatsTotal: 40, currentWaitCount: 16 }
    ],
    lifts: {
      "LIFT_A": { name: "Elevator Block A", status: "OPERATIONAL" },
      "LIFT_B": { name: "Elevator Block B", status: "OPERATIONAL" },
      "RAMP_1": { name: "Accessible Ramp 1", status: "OPERATIONAL" }
    },
    emergencies: [],
    auditLog: []
  };
}

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [serverState, setServerState] = useState(getInitialBaselineState);
  const [hospitalGraph, setHospitalGraph] = useState(hospitalData);
  const [lastUpdatedText, setLastUpdatedText] = useState('just now');

  const broadcastChannelRef = useRef(null);

  // Sync state helper: saves to state, localStorage, and broadcasts to other tabs
  const applyStateUpdate = (newState, broadcast = true) => {
    const updated = {
      ...newState,
      lastUpdated: new Date().toISOString(),
      version: (newState.version || 1) + 1
    };
    setServerState(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_STATE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }

    if (broadcast && broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        type: 'STATE_CHANGED',
        state: updated
      });
    }
  };

  // Keep last updated text ticking (e.g., "just now", "1 min ago")
  useEffect(() => {
    const updateRelativeTime = () => {
      if (!serverState?.lastUpdated) return;
      const diffMs = Date.now() - new Date(serverState.lastUpdated).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) setLastUpdatedText('just now');
      else if (diffMins === 1) setLastUpdatedText('1 minute ago');
      else setLastUpdatedText(`${diffMins} minutes ago`);
    };

    updateRelativeTime();
    const interval = setInterval(updateRelativeTime, 10000);
    return () => clearInterval(interval);
  }, [serverState?.lastUpdated]);

  // Setup BroadcastChannel for zero-latency multi-tab sync without server dependency
  useEffect(() => {
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('opd_saathi_channel');
      broadcastChannelRef.current = channel;

      channel.onmessage = (event) => {
        if (event.data?.type === 'STATE_CHANGED' && event.data?.state) {
          setServerState(event.data.state);
        }
      };

      return () => channel.close();
    }
  }, []);

  // Listen to cross-window storage events as fallback
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === LOCAL_STORAGE_STATE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setServerState(parsed);
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Initialize Socket.io connection to backend (if running)
  useEffect(() => {
    let s;
    try {
      s = io(SOCKET_SERVER_URL, {
        reconnectionAttempts: 20,
        reconnectionDelay: 1000,
        timeout: 4000
      });

      s.on('connect', () => {
        console.log('[Socket] Connected to backend coordination server');
        setConnected(true);

        // Check and send offline queued registrations
        const offlineQueue = localStorage.getItem(OFFLINE_QUEUE_KEY);
        if (offlineQueue) {
          try {
            const list = JSON.parse(offlineQueue);
            if (Array.isArray(list) && list.length > 0) {
              list.forEach(item => {
                s.emit('REGISTER_PATIENT', item, () => {});
              });
              localStorage.removeItem(OFFLINE_QUEUE_KEY);
            }
          } catch {}
        }
      });

      s.on('disconnect', () => {
        console.log('[Socket] Disconnected from server (operating in offline browser sync mode)');
        setConnected(false);
      });

      s.on('INITIAL_STATE', (data) => {
        if (data && data.tokens) {
          applyStateUpdate(data, true);
        }
      });

      s.on('STATE_UPDATED', (payload) => {
        if (payload?.state) {
          applyStateUpdate(payload.state, true);
        }
      });

      setSocket(s);
    } catch (err) {
      console.warn('[Socket] Could not initialize socket.io:', err);
    }

    return () => {
      if (s) s.disconnect();
    };
  }, []);

  // Initial fetch of authoritative server state
  useEffect(() => {
    async function fetchServerInitial() {
      try {
        const res = await fetch(`${SOCKET_SERVER_URL}/api/state`);
        if (res.ok) {
          const remoteState = await res.json();
          if (remoteState && remoteState.tokens) {
            applyStateUpdate(remoteState, true);
          }
        }
      } catch {
        // Server offline - using localStorage state
      }
    }
    fetchServerInitial();
  }, []);

  // Waiting Time Calculation Formula:
  // Estimated wait = people ahead * average consultation time (last 10 patients) + doctor delay.
  // Rounded to nearest 5 minutes, shown as "about X minutes".
  const calculateEstimatedWait = (aheadCount, deptId, doctorDelay = 0) => {
    if (aheadCount <= 0) return 0;
    const dept = departments.find(d => d.id === deptId || d.code === deptId) || departments[0];
    
    // Average from last 10 patients
    const times = dept.recentConsultationTimes || [8, 8, 8, 8, 8, 8, 8, 8, 8, 8];
    const avgMins = times.reduce((a, b) => a + b, 0) / times.length;

    const rawMinutes = aheadCount * avgMins + (Number(doctorDelay) || 0);
    // Round to nearest 5 minutes
    const rounded = Math.max(5, Math.round(rawMinutes / 5) * 5);
    return rounded;
  };

  // Queue Action 1: Register Patient
  const registerPatient = async (patientData) => {
    const dept = departments.find(d => d.id === patientData.departmentId) || departments[0];
    const nextTokenNum = (serverState.tokenCounter || 140) + 1;
    const deptPrefix = dept.code || 'MED';
    const tokenId = `${deptPrefix}-${String(nextTokenNum).padStart(3, '0')}`;

    const matchingDoctor = serverState.doctors.find(d => d.departmentId === dept.id) || serverState.doctors[0];

    const newToken = {
      tokenId,
      tokenNumber: nextTokenNum,
      patientName: patientData.patientName || 'Kamla',
      age: patientData.age || 62,
      gender: patientData.gender || 'Female',
      mobile: patientData.mobile || '',
      language: patientData.language || 'ta',
      avoidStairs: patientData.avoidStairs !== undefined ? patientData.avoidStairs : true,
      assistedMode: patientData.assistedMode !== undefined ? patientData.assistedMode : true,
      departmentId: dept.id,
      departmentName: dept.name,
      assignedDoctorId: matchingDoctor.id,
      assignedDoctorName: matchingDoctor.name,
      assignedRoomId: matchingDoctor.roomId,
      assignedRoomNumber: matchingDoctor.roomNumber || dept.roomNumber,
      assignedFloor: matchingDoctor.floor,
      queueStatus: 'WAITING',
      journeyStep: 'NAVIGATING_TO_WAITING',
      issuedAt: new Date().toISOString(),
      calledAt: null,
      version: 1
    };

    // If connected to server, emit via socket
    if (connected && socket) {
      socket.emit('REGISTER_PATIENT', newToken);
    } else {
      // Buffer in offline queue
      const existingOffline = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
      existingOffline.push(newToken);
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(existingOffline));
    }

    // Always update shared local state immediately
    const updatedState = {
      ...serverState,
      tokenCounter: nextTokenNum,
      tokens: [...serverState.tokens, newToken]
    };
    applyStateUpdate(updatedState, true);
    return newToken;
  };

  // Queue Action 2: Call Next Patient
  const callNextPatient = async (doctorId, staffPin = '1234') => {
    if (staffPin !== '1234') throw new Error('Invalid Staff PIN');

    const doctor = serverState.doctors.find(d => d.id === doctorId);
    if (!doctor) throw new Error('Doctor not found');

    const nextToken = serverState.tokens.find(t => 
      (t.assignedDoctorId === doctorId || t.departmentId === doctor.departmentId) && 
      t.queueStatus === 'WAITING'
    );

    if (!nextToken) {
      return { success: false, message: 'No more waiting patients' };
    }

    const updatedTokens = serverState.tokens.map(t => {
      if (t.tokenId === nextToken.tokenId) {
        return {
          ...t,
          queueStatus: 'CALLED',
          calledAt: new Date().toISOString(),
          journeyStep: 'RESPONDING_TO_CALL',
          version: (t.version || 1) + 1
        };
      }
      return t;
    });

    const updatedDoctors = serverState.doctors.map(d => {
      if (d.id === doctorId) {
        return {
          ...d,
          status: 'CALLING',
          currentToken: nextToken.tokenId
        };
      }
      return d;
    });

    const updatedState = {
      ...serverState,
      tokens: updatedTokens,
      doctors: updatedDoctors
    };

    applyStateUpdate(updatedState, true);
    if (connected && socket) {
      socket.emit('CALL_NEXT_TOKEN', { doctorId, staffPin });
    }
    playChime('call');
    return { success: true, token: nextToken, doctor };
  };

  // Queue Action 3: Mark No-Show
  const markNoShowPatient = async (tokenId, staffPin = '1234') => {
    if (staffPin !== '1234') throw new Error('Invalid Staff PIN');

    const updatedTokens = serverState.tokens.map(t => {
      if (t.tokenId === tokenId) {
        return { ...t, queueStatus: 'NO_SHOW', version: (t.version || 1) + 1 };
      }
      return t;
    });

    const updatedDoctors = serverState.doctors.map(d => {
      if (d.currentToken === tokenId) {
        return { ...d, currentToken: null, status: 'AVAILABLE' };
      }
      return d;
    });

    const updatedState = { ...serverState, tokens: updatedTokens, doctors: updatedDoctors };
    applyStateUpdate(updatedState, true);
    if (connected && socket) socket.emit('NO_SHOW', { tokenId, staffPin });
    return { success: true };
  };

  // Queue Action 4: Send to End of Queue
  const sendToEndOfQueuePatient = async (tokenId, staffPin = '1234') => {
    if (staffPin !== '1234') throw new Error('Invalid Staff PIN');

    const maxNum = Math.max(...serverState.tokens.map(t => t.tokenNumber || 0), 100);
    const updatedTokens = serverState.tokens.map(t => {
      if (t.tokenId === tokenId) {
        return {
          ...t,
          tokenNumber: maxNum + 1,
          queueStatus: 'WAITING',
          calledAt: null,
          version: (t.version || 1) + 1
        };
      }
      return t;
    });

    const updatedDoctors = serverState.doctors.map(d => {
      if (d.currentToken === tokenId) {
        return { ...d, currentToken: null, status: 'AVAILABLE' };
      }
      return d;
    });

    const updatedState = { ...serverState, tokens: updatedTokens, doctors: updatedDoctors };
    applyStateUpdate(updatedState, true);
    if (connected && socket) socket.emit('SEND_TO_END', { tokenId, staffPin });
    return { success: true };
  };

  // Queue Action 5: Move to Another Department
  const movePatientDepartment = async (tokenId, newDeptId, staffPin = '1234') => {
    if (staffPin !== '1234') throw new Error('Invalid Staff PIN');

    const targetDept = departments.find(d => d.id === newDeptId) || departments[0];
    const targetDoc = serverState.doctors.find(d => d.departmentId === targetDept.id) || serverState.doctors[0];

    const updatedTokens = serverState.tokens.map(t => {
      if (t.tokenId === tokenId) {
        return {
          ...t,
          departmentId: targetDept.id,
          departmentName: targetDept.name,
          assignedDoctorId: targetDoc.id,
          assignedDoctorName: targetDoc.name,
          assignedRoomId: targetDoc.roomId,
          assignedRoomNumber: targetDoc.roomNumber,
          assignedFloor: targetDoc.floor,
          queueStatus: 'WAITING',
          calledAt: null,
          supersededNote: {
            previousRoom: t.assignedRoomId,
            newRoom: targetDoc.roomId,
            newFloor: targetDoc.floor,
            reason: 'Transferred to another clinical department',
            supersededAt: new Date().toISOString(),
            confirmedBy: 'Staff Desk'
          },
          version: (t.version || 1) + 1
        };
      }
      return t;
    });

    const updatedState = { ...serverState, tokens: updatedTokens };
    applyStateUpdate(updatedState, true);
    if (connected && socket) socket.emit('MOVE_DEPARTMENT', { tokenId, newDeptId, staffPin });
    return { success: true };
  };

  // Queue Action 6: Set Doctor Status (Break or Delay)
  const setDoctorStatusAction = async (doctorId, status, breakUntil = null, delayMinutes = 0, staffPin = '1234') => {
    if (staffPin !== '1234') throw new Error('Invalid Staff PIN');

    const updatedDoctors = serverState.doctors.map(d => {
      if (d.id === doctorId) {
        return {
          ...d,
          status,
          breakUntil,
          delayMinutes: Number(delayMinutes) || 0
        };
      }
      return d;
    });

    const updatedState = { ...serverState, doctors: updatedDoctors };
    applyStateUpdate(updatedState, true);
    if (connected && socket) socket.emit('SET_DOCTOR_STATUS', { doctorId, status, breakUntil, delayMinutes, staffPin });
    return { success: true };
  };

  // Action 7: Reassign Consultation Room
  const reassignRoom = async (doctorId, newRoomId, newFloor, reason = 'Doctor relocated', staffPin = '1234') => {
    if (staffPin !== '1234') throw new Error('Invalid Staff PIN');

    const doctor = serverState.doctors.find(d => d.id === doctorId);
    const oldRoomId = doctor ? doctor.roomId : 'Previous';

    const updatedDoctors = serverState.doctors.map(d => {
      if (d.id === doctorId) {
        return { ...d, roomId: newRoomId, floor: Number(newFloor) };
      }
      return d;
    });

    const nowIso = new Date().toISOString();
    const updatedTokens = serverState.tokens.map(t => {
      if (t.assignedDoctorId === doctorId && (t.queueStatus === 'WAITING' || t.queueStatus === 'CALLED')) {
        return {
          ...t,
          assignedRoomId: newRoomId,
          assignedFloor: Number(newFloor),
          supersededNote: {
            previousRoom: oldRoomId,
            newRoom: newRoomId,
            newFloor: Number(newFloor),
            reason,
            supersededAt: nowIso,
            confirmedBy: 'Staff Desk'
          },
          version: (t.version || 1) + 1
        };
      }
      return t;
    });

    const updatedState = { ...serverState, doctors: updatedDoctors, tokens: updatedTokens };
    applyStateUpdate(updatedState, true);
    if (connected && socket) socket.emit('REASSIGN_ROOM', { doctorId, newRoomId, newFloor, reason, staffPin });
    return { success: true };
  };

  // Action 8: Toggle Lift Status
  const updateLift = async (liftKey, status, staffPin = '1234') => {
    if (staffPin !== '1234') throw new Error('Invalid Staff PIN');

    const updatedLifts = {
      ...serverState.lifts,
      [liftKey]: {
        ...(serverState.lifts[liftKey] || {}),
        status
      }
    };

    const updatedState = { ...serverState, lifts: updatedLifts };
    applyStateUpdate(updatedState, true);
    if (connected && socket) socket.emit('UPDATE_LIFT_STATUS', { liftKey, status, staffPin });
    return { success: true, lifts: updatedLifts };
  };

  // Action 9: Trigger Urgent / Casualty Emergency Alert
  const triggerEmergency = async (location = 'Casualty Reception', details = 'Urgent assistance needed') => {
    const alertItem = {
      id: `EMG-${Date.now()}`,
      location,
      details,
      timestamp: new Date().toISOString(),
      status: 'ACTIVE',
      seen: false
    };

    const updatedState = {
      ...serverState,
      emergencies: [alertItem, ...serverState.emergencies]
    };

    applyStateUpdate(updatedState, true);
    playChime('urgent');
    if (connected && socket) socket.emit('TRIGGER_EMERGENCY', { location, details });
    return alertItem;
  };

  // Action 10: Mark Emergency Alert Seen
  const markEmergencySeenAction = async (alertId, staffPin = '1234') => {
    if (staffPin !== '1234') throw new Error('Invalid Staff PIN');

    const updatedEmergencies = serverState.emergencies.map(a => {
      if (a.id === alertId) {
        return { ...a, seen: true, status: 'SEEN' };
      }
      return a;
    });

    const updatedState = { ...serverState, emergencies: updatedEmergencies };
    applyStateUpdate(updatedState, true);
    if (connected && socket) socket.emit('MARK_EMERGENCY_SEEN', { alertId, staffPin });
    return { success: true };
  };

  // Action 11: Demo Controls - Add 20 Sample Patients
  const addSamplePatientsAction = async () => {
    const existingIds = new Set(serverState.tokens.map(t => t.tokenId));
    const newPatients = samplePatients.filter(p => !existingIds.has(p.tokenId)).map(p => ({
      ...p,
      issuedAt: new Date().toISOString(),
      version: 1
    }));

    const updatedTokens = [...serverState.tokens, ...newPatients];
    const updatedState = { ...serverState, tokens: updatedTokens };
    applyStateUpdate(updatedState, true);
    if (connected && socket) {
      try {
        await fetch(`${SOCKET_SERVER_URL}/api/add-sample-patients`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patients: newPatients })
        });
      } catch {}
    }
    return { success: true, addedCount: newPatients.length };
  };

  // Action 12: Demo Controls - Speed Time 10x
  const speedTime10xAction = async () => {
    // Advances queues by automatically calling the next waiting patient in active specialties
    const doctors = serverState.doctors;
    let advancedCount = 0;
    for (const doc of doctors) {
      const waiting = serverState.tokens.find(t => 
        (t.assignedDoctorId === doc.id || t.departmentId === doc.departmentId) && 
        t.queueStatus === 'WAITING'
      );
      if (waiting) {
        waiting.queueStatus = 'CALLED';
        waiting.calledAt = new Date().toISOString();
        doc.currentToken = waiting.tokenId;
        advancedCount++;
        break; // Advance one consultation at a time per click
      }
    }

    const updatedState = { ...serverState };
    applyStateUpdate(updatedState, true);
    playChime('call');
    return { success: true, advancedCount };
  };

  // Action 13: Reset Demo Baseline
  const resetDemo = async () => {
    const cleanState = getInitialBaselineState();
    cleanState.tokens = samplePatients.slice(0, 6).map((p, idx) => ({
      ...p,
      issuedAt: new Date(Date.now() - (idx + 1) * 3 * 60000).toISOString(),
      version: 1
    }));
    cleanState.emergencies = [];
    cleanState.lifts = {
      "LIFT_A": { name: "Elevator Block A", status: "OPERATIONAL" },
      "LIFT_B": { name: "Elevator Block B", status: "OPERATIONAL" },
      "RAMP_1": { name: "Accessible Ramp 1", status: "OPERATIONAL" }
    };

    applyStateUpdate(cleanState, true);
    if (connected && socket) {
      try {
        await fetch(`${SOCKET_SERVER_URL}/api/reset-demo`, { method: 'POST' });
      } catch {}
    }
    return cleanState;
  };

  return (
    <SocketContext.Provider
      value={{
        connected,
        serverState,
        hospitalGraph,
        lastUpdatedText,
        calculateEstimatedWait,
        registerPatient,
        callNextPatient,
        markNoShowPatient,
        sendToEndOfQueuePatient,
        movePatientDepartment,
        setDoctorStatusAction,
        reassignRoom,
        updateLift,
        triggerEmergency,
        markEmergencySeenAction,
        addSamplePatientsAction,
        speedTime10xAction,
        resetDemo
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
