import React, { useState, useEffect } from 'react';
import { useSocket, playChime } from '../context/SocketContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { departments } from '../data/departments';
import RegistrationCounter from '../components/staff/RegistrationCounter';
import { 
  Lock, 
  Unlock, 
  Stethoscope, 
  PhoneCall, 
  UserCheck, 
  RotateCcw, 
  CheckCircle2, 
  Sliders, 
  AlertTriangle,
  DoorOpen,
  ArrowRight,
  Clock,
  UserX,
  FastForward,
  Shuffle,
  Users,
  ShieldAlert,
  PlayCircle,
  RefreshCw,
  Bell
} from 'lucide-react';

export default function StaffDashboard() {
  const { 
    serverState, 
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
    resetDemo,
    calculateEstimatedWait
  } = useSocket();

  const { language, t } = useAccessibility();

  const [pinInput, setPinInput] = useState('1234');
  const [authenticated, setAuthenticated] = useState(true); // Pre-unlocked for smooth hackathon judge demo
  
  // Doctor room reassignment modal state
  const [selectedDoctorForReassign, setSelectedDoctorForReassign] = useState(null);
  const [newRoomId, setNewRoomId] = useState('OPD_ROOM_1');
  const [newFloor, setNewFloor] = useState(1);
  const [reassignReason, setReassignReason] = useState('Sanitization & maintenance');

  // Doctor status modal state
  const [statusDoctorModal, setStatusDoctorModal] = useState(null);
  const [newStatusType, setNewStatusType] = useState('AVAILABLE');
  const [breakTimeInput, setBreakTimeInput] = useState('11:30');
  const [delayMinsInput, setDelayMinsInput] = useState('15');

  // Move department modal state
  const [moveDeptPatient, setMoveDeptPatient] = useState(null);
  const [targetDeptId, setTargetDeptId] = useState('gen_med');

  const [actionNotice, setActionNotice] = useState('');

  const triggerActionNotice = (msg) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(''), 4500);
  };

  const doctors = serverState?.doctors || [];
  const lifts = serverState?.lifts || {};
  const emergencies = serverState?.emergencies || [];
  const tokens = serverState?.tokens || [];
  const waitingAreas = serverState?.waitingAreas || [];

  // Urgent Unseen Flags pinned at the top
  const unseenEmergencies = emergencies.filter(e => !e.seen);

  // Play alarm sound if there are active unseen emergency flags
  useEffect(() => {
    if (unseenEmergencies.length > 0) {
      playChime('urgent');
    }
  }, [unseenEmergencies.length]);

  // Handle Call Next
  const handleCallNext = async (doctorId) => {
    try {
      const res = await callNextPatient(doctorId, pinInput);
      if (res?.success && res.token) {
        triggerActionNotice(`Called Token #${res.token.tokenId} (${res.token.patientName})`);
      } else {
        triggerActionNotice('No waiting patients in this queue');
      }
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // Handle Room Reassign
  const handleReassignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctorForReassign) return;
    try {
      await reassignRoom(
        selectedDoctorForReassign.id, 
        newRoomId, 
        Number(newFloor), 
        reassignReason, 
        pinInput
      );
      triggerActionNotice(`Relocated ${selectedDoctorForReassign.name} to ${newRoomId} (Floor ${newFloor})! Broadcasted to patients.`);
      setSelectedDoctorForReassign(null);
    } catch (err) {
      alert(`Error reassigning room: ${err.message}`);
    }
  };

  // Handle Doctor Status Submit
  const handleDoctorStatusSubmit = async (e) => {
    e.preventDefault();
    if (!statusDoctorModal) return;
    try {
      await setDoctorStatusAction(
        statusDoctorModal.id,
        newStatusType,
        newStatusType === 'ON_BREAK' ? breakTimeInput : null,
        newStatusType === 'RUNNING_LATE' ? parseInt(delayMinsInput, 10) : 0,
        pinInput
      );
      triggerActionNotice(`Updated status for ${statusDoctorModal.name}`);
      setStatusDoctorModal(null);
    } catch (err) {
      alert(`Error updating doctor status: ${err.message}`);
    }
  };

  // Handle Move Department Submit
  const handleMoveDeptSubmit = async (e) => {
    e.preventDefault();
    if (!moveDeptPatient) return;
    try {
      await movePatientDepartment(moveDeptPatient.tokenId, targetDeptId, pinInput);
      triggerActionNotice(`Moved ${moveDeptPatient.patientName} (${moveDeptPatient.tokenId}) to new department`);
      setMoveDeptPatient(null);
    } catch (err) {
      alert(`Error moving department: ${err.message}`);
    }
  };

  // Handle Lift status toggle
  const handleToggleLift = async (liftKey, currentStatus) => {
    const nextStatus = currentStatus === 'OPERATIONAL' ? 'OUT_OF_SERVICE' : 'OPERATIONAL';
    try {
      await updateLift(liftKey, nextStatus, pinInput);
      triggerActionNotice(`Updated ${liftKey} status to ${nextStatus}`);
    } catch (err) {
      alert(`Error updating lift: ${err.message}`);
    }
  };

  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white p-8 rounded-3xl shadow-xl border-2 border-slate-200 text-center space-y-4">
        <Lock size={44} className="text-emerald-700 mx-auto" />
        <h2 className="text-2xl font-black text-slate-900 m-0">
          {t('staff.title')}
        </h2>
        <p className="text-xs text-slate-500 font-semibold m-0">
          {t('staff.pinPrompt')} ({t('staff.pinDefault')})
        </p>
        <input
          type="password"
          maxLength={6}
          value={pinInput}
          onChange={(e) => setPinInput(e.target.value)}
          className="w-full tap-target-large text-center text-3xl font-black tracking-widest px-4 py-3 rounded-2xl border-2 border-slate-300 focus:border-emerald-600 outline-none"
          placeholder="PIN"
        />
        <button
          onClick={() => {
            if (pinInput === '1234') setAuthenticated(true);
            else alert('Invalid PIN. Please enter 1234.');
          }}
          className="w-full tap-target-large py-4 rounded-2xl bg-emerald-700 text-white font-black text-base shadow-lg"
        >
          {t('staff.verify')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
      {/* Top Banner with Staff Authorized Status & Notice */}
      <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-3xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-wider mb-1">
            <Unlock size={16} />
            <span>Staff Authorized Control Room (PIN: 1234 Verified)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white m-0">
            {t('staff.title')}
          </h1>
          <p className="text-xs text-slate-400 font-medium m-0 mt-1">
            {t('staff.disclaimer')}
          </p>
        </div>

        {actionNotice && (
          <div className="bg-emerald-500 text-slate-950 px-4 py-2.5 rounded-2xl font-black text-xs shadow-lg animate-bounce-gentle">
            ✓ {actionNotice}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* PINNED URGENT FLAGS BANNER (WITH SOUND UNTIL MARKED SEEN) */}
      {/* ======================================================== */}
      {unseenEmergencies.length > 0 && (
        <div className="bg-red-600 text-white p-5 rounded-3xl shadow-2xl border-4 border-red-800 space-y-3 animate-urgent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldAlert size={28} className="text-amber-300 animate-bounce" />
              <h2 className="text-xl font-black uppercase tracking-tight m-0">
                {t('staff.urgentFlagsTitle')} ({unseenEmergencies.length})
              </h2>
            </div>
            <span className="text-xs font-black uppercase bg-red-950/70 text-amber-300 px-3 py-1 rounded-full">
              Sound Active
            </span>
          </div>

          <div className="space-y-2">
            {unseenEmergencies.map((emg) => (
              <div 
                key={emg.id}
                className="bg-white text-slate-950 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md"
              >
                <div>
                  <span className="text-xs font-black text-red-600 uppercase">
                    Location: {emg.location}
                  </span>
                  <p className="text-base font-extrabold m-0">
                    {emg.details}
                  </p>
                  <p className="text-[11px] text-slate-500 m-0 mt-0.5">
                    Flagged at: {new Date(emg.timestamp).toLocaleTimeString()}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => markEmergencySeenAction(emg.id, pinInput)}
                  className="tap-target-large px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs flex items-center gap-1.5 shadow"
                >
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <span>{t('staff.markSeen')}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DEMO CONTROLS (2-MINUTE HACKATHON PRESENTATION SUITE)    */}
      {/* ======================================================== */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 sm:p-6 rounded-3xl shadow-lg border-2 border-slate-700 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-emerald-400 uppercase tracking-wider m-0 flex items-center gap-2">
            <PlayCircle size={20} />
            <span>{t('staff.demoControlsTitle')}</span>
          </h3>
          <span className="text-xs font-bold text-slate-400">
            1-Click triggers for hackathon jury
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* 1. Add 20 sample patients */}
          <button
            type="button"
            onClick={async () => {
              const res = await addSamplePatientsAction();
              triggerActionNotice(`Added 20 sample patients across all departments!`);
            }}
            className="tap-target-large py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow transition-transform active:scale-95"
          >
            <Users size={18} />
            <span>{t('staff.add20Patients')}</span>
          </button>

          {/* 2. Speed time 10x */}
          <button
            type="button"
            onClick={async () => {
              await speedTime10xAction();
              triggerActionNotice(`Speed 10x: Advanced consultation queue.`);
            }}
            className="tap-target-large py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow transition-transform active:scale-95"
          >
            <FastForward size={18} />
            <span>{t('staff.speed10x')}</span>
          </button>

          {/* 3. Reset All */}
          <button
            type="button"
            onClick={async () => {
              await resetDemo();
              triggerActionNotice(`System reset to clean baseline demonstration state.`);
            }}
            className="tap-target-large py-3.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-black text-xs flex items-center justify-center gap-2 border border-slate-600 shadow transition-transform active:scale-95"
          >
            <RefreshCw size={18} />
            <span>{t('staff.resetAll')}</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* WAITING AREA OVERCROWDING CAPACITY INDICATORS            */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {waitingAreas.map(area => {
          // Count waiting patients on this floor
          const waitCount = tokens.filter(t => t.queueStatus === 'WAITING' && (area.id === 'WAITING_HALL_A' ? t.assignedFloor === 1 : t.assignedFloor === 0)).length;
          const ratio = waitCount / (area.seatsTotal || 60);

          // Overcrowding color rule:
          // < 50% Green (Normal), 50-80% Yellow (Busy), > 80% Red (Overcrowded)
          const crowdColor = ratio > 0.8
            ? 'border-red-500 bg-red-50 text-red-950'
            : ratio > 0.5
            ? 'border-amber-400 bg-amber-50 text-amber-950'
            : 'border-emerald-400 bg-emerald-50 text-emerald-950';

          const badgeColor = ratio > 0.8
            ? 'bg-red-600 text-white'
            : ratio > 0.5
            ? 'bg-amber-500 text-slate-950'
            : 'bg-emerald-600 text-white';

          const labelText = ratio > 0.8
            ? t('staff.overcrowdHigh')
            : ratio > 0.5
            ? t('staff.overcrowdMed')
            : t('staff.overcrowdLow');

          return (
            <div 
              key={area.id}
              className={`p-4 rounded-2xl border-2 shadow-sm flex items-center justify-between gap-3 ${crowdColor}`}
            >
              <div>
                <span className="text-xs uppercase font-black tracking-wider block opacity-80">
                  {t('staff.overcrowding')}
                </span>
                <h4 className="text-base font-black m-0 mt-0.5">
                  {area.name}
                </h4>
                <p className="text-xs font-bold m-0 mt-0.5 opacity-90">
                  {waitCount} waiting / {area.seatsTotal} total seats ({Math.round(ratio * 100)}% capacity)
                </p>
              </div>

              <span className={`text-xs font-black px-3 py-1.5 rounded-xl uppercase tracking-wider ${badgeColor}`}>
                {labelText}
              </span>
            </div>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* QUICK REGISTRATION COUNTER (3-TAPS FOR WALK-IN PATIENTS) */}
      {/* ======================================================== */}
      <RegistrationCounter />

      {/* ======================================================== */}
      {/* DEPARTMENT CONSULTATION QUEUES & CONTROLS                */}
      {/* ======================================================== */}
      <div className="space-y-4">
        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 m-0">
          <Stethoscope size={24} className="text-emerald-700" />
          <span>Clinical Department Queues & Doctors</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {doctors.map(doctor => {
            // Find active waiting tokens for this doctor
            const deptWaiting = tokens.filter(t => 
              (t.assignedDoctorId === doctor.id || t.departmentId === doctor.departmentId) && 
              t.queueStatus === 'WAITING'
            );
            const waitCount = deptWaiting.length;
            const avgWaitMins = calculateEstimatedWait(waitCount, doctor.departmentId, doctor.delayMinutes);

            const isLate = doctor.delayMinutes > 0;
            const onBreak = doctor.status === 'ON_BREAK';

            return (
              <div
                key={doctor.id}
                className="bg-white rounded-3xl p-5 shadow-md border-2 border-slate-200 flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-black uppercase bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                      {doctor.specialty}
                    </span>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      Floor {doctor.floor}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 m-0">
                    {doctor.name}
                  </h3>
                  <p className="text-xs font-extrabold text-slate-600 m-0 mt-0.5">
                    Room: <strong className="text-emerald-900 font-mono text-sm">{doctor.roomNumber ? `Room ${doctor.roomNumber}` : doctor.roomId}</strong>
                  </p>

                  {/* Doctor Status Banner */}
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-bold">
                    <span>Status:</span>
                    <span className={`px-2.5 py-0.5 rounded-full font-black ${
                      onBreak 
                        ? 'bg-amber-400 text-slate-950' 
                        : isLate 
                        ? 'bg-red-500 text-white' 
                        : 'bg-emerald-100 text-emerald-900'
                    }`}>
                      {onBreak 
                        ? `On Break until ${doctor.breakUntil || '11:30'}`
                        : isLate 
                        ? `Running Late (+${doctor.delayMinutes}m)`
                        : 'In Room Available'}
                    </span>
                  </div>

                  {/* Queue Metrics */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-center">
                    <div className="bg-slate-50 p-2 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">
                        {t('staff.waitingCount')}
                      </span>
                      <span className="text-xl font-black text-slate-900">
                        {waitCount}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-xl">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">
                        {t('staff.averageWait')}
                      </span>
                      <span className="text-base font-black text-emerald-700">
                        ~{avgWaitMins}m
                      </span>
                    </div>
                  </div>

                  {/* Current Active Token */}
                  <div className="mt-3 p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs font-bold text-emerald-950">
                    <span>Now Consulting:</span>
                    <span className="font-mono font-black text-sm text-emerald-900">
                      {doctor.currentToken || 'None (Waiting)'}
                    </span>
                  </div>
                </div>

                {/* Queue Action Buttons */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => handleCallNext(doctor.id)}
                    className="w-full tap-target-large py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow transition-transform active:scale-95"
                  >
                    <PhoneCall size={16} />
                    <span>{t('staff.callNext')}</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Reassign Room */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDoctorForReassign(doctor);
                        setNewRoomId(doctor.roomId === 'OPD_ROOM_5' ? 'OPD_ROOM_1' : 'OPD_ROOM_5');
                        setNewFloor(doctor.roomId === 'OPD_ROOM_5' ? 2 : 1);
                      }}
                      className="tap-target-large py-2 px-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-[11px] flex items-center justify-center gap-1"
                    >
                      <RotateCcw size={14} />
                      <span>{t('staff.reassignRoom')}</span>
                    </button>

                    {/* Set Doctor Break / Delay */}
                    <button
                      type="button"
                      onClick={() => {
                        setStatusDoctorModal(doctor);
                        setNewStatusType(doctor.status || 'AVAILABLE');
                      }}
                      className="tap-target-large py-2 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] flex items-center justify-center gap-1 border border-slate-300"
                    >
                      <Clock size={14} />
                      <span>Status / Delay</span>
                    </button>
                  </div>

                  {/* First Waiting Patient Actions (No-Show, Move, Send to End) */}
                  {deptWaiting.length > 0 && (
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-600 text-[11px]">
                        <span>Next: <strong className="text-slate-900">{deptWaiting[0].tokenId}</strong> ({deptWaiting[0].patientName})</span>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => markNoShowPatient(deptWaiting[0].tokenId, pinInput)}
                          title="Mark No-Show"
                          className="flex-1 py-1 px-1.5 rounded bg-red-100 hover:bg-red-200 text-red-900 font-bold text-[10px] flex items-center justify-center gap-1"
                        >
                          <UserX size={12} />
                          <span>No-Show</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => sendToEndOfQueuePatient(deptWaiting[0].tokenId, pinInput)}
                          title="Send to End of Queue"
                          className="flex-1 py-1 px-1.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-[10px] flex items-center justify-center gap-1"
                        >
                          <ArrowRight size={12} />
                          <span>End of Q</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setMoveDeptPatient(deptWaiting[0])}
                          title="Move Department"
                          className="flex-1 py-1 px-1.5 rounded bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold text-[10px] flex items-center justify-center gap-1"
                        >
                          <Shuffle size={12} />
                          <span>Move Dept</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* TRANSIT & LIFTS OUTAGE SIMULATOR                         */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 m-0">
            <Sliders size={22} className="text-emerald-700" />
            <span>{t('staff.manageLifts')}</span>
          </h3>
          <span className="text-xs font-bold text-slate-500">
            Simulate elevator outages to test strict zero-stairs router
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {Object.entries(lifts).map(([liftKey, lift]) => (
            <div 
              key={liftKey}
              className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-2"
            >
              <div>
                <p className="font-extrabold text-slate-900 text-sm m-0">
                  {lift.name}
                </p>
                <span className={`text-xs font-black px-2 py-0.5 rounded-full inline-block mt-1 ${
                  lift.status === 'OPERATIONAL'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {lift.status === 'OPERATIONAL' ? t('staff.operational') : t('staff.outOfService')}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleToggleLift(liftKey, lift.status)}
                className={`tap-target-large px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  lift.status === 'OPERATIONAL'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {lift.status === 'OPERATIONAL' ? 'Break' : 'Fix'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: REASSIGN CONSULTATION ROOM                      */}
      {/* ======================================================== */}
      {selectedDoctorForReassign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-4 border-amber-400 space-y-4">
            <h3 className="text-xl font-black text-slate-900 m-0">
              {t('staff.reassignTitle')}
            </h3>
            <p className="text-xs text-slate-600 font-medium m-0">
              Moving <strong className="text-slate-900">{selectedDoctorForReassign.name}</strong> will instantly broadcast to all assigned patients, re-route them step-free, and play a voice announcement on their phones.
            </p>

            <form onSubmit={handleReassignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  {t('staff.selectNewRoom')}
                </label>
                <select
                  value={newRoomId}
                  onChange={(e) => {
                    setNewRoomId(e.target.value);
                    setNewFloor(e.target.value === 'OPD_ROOM_1' ? 1 : e.target.value === 'WARD_4' ? 2 : 1);
                  }}
                  className="w-full tap-target-large px-4 py-2.5 rounded-xl border-2 border-slate-300 font-bold text-slate-900 bg-white"
                >
                  <option value="OPD_ROOM_1">Room 1 — Floor 1 (General Medicine Wing)</option>
                  <option value="OPD_ROOM_5">Room 5 — Floor 1 (Opposite Drinking Water)</option>
                  <option value="WARD_4">Ward 4 Special Clinic — Floor 2 (Near Lift A)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  {t('staff.reassignReason')}
                </label>
                <input
                  type="text"
                  required
                  value={reassignReason}
                  onChange={(e) => setReassignReason(e.target.value)}
                  className="w-full tap-target-large px-4 py-2.5 rounded-xl border-2 border-slate-300 font-semibold text-slate-900"
                  placeholder="e.g. Electrical maintenance in Room 5"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 tap-target-large py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-sm shadow transition-transform active:scale-95"
                >
                  {t('staff.confirmReassign')}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDoctorForReassign(null)}
                  className="tap-target-large px-5 py-3 rounded-xl bg-slate-200 text-slate-700 font-bold text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: DOCTOR STATUS & DELAY CONTROLS                  */}
      {/* ======================================================== */}
      {statusDoctorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-4 border-slate-900 space-y-4">
            <h3 className="text-xl font-black text-slate-900 m-0">
              Doctor Status: {statusDoctorModal.name}
            </h3>

            <form onSubmit={handleDoctorStatusSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  Status
                </label>
                <select
                  value={newStatusType}
                  onChange={(e) => setNewStatusType(e.target.value)}
                  className="w-full tap-target-large px-3 py-2 rounded-xl border border-slate-300 font-bold"
                >
                  <option value="AVAILABLE">Available / Consulting Patients</option>
                  <option value="ON_BREAK">On Break Until Specific Time</option>
                  <option value="RUNNING_LATE">Running Late by X Minutes</option>
                </select>
              </div>

              {newStatusType === 'ON_BREAK' && (
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                    Break Return Time
                  </label>
                  <input
                    type="time"
                    value={breakTimeInput}
                    onChange={(e) => setBreakTimeInput(e.target.value)}
                    className="w-full tap-target-large px-3 py-2 rounded-xl border border-slate-300 font-bold"
                  />
                </div>
              )}

              {newStatusType === 'RUNNING_LATE' && (
                <div>
                  <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                    Delay in Minutes
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={120}
                    step={5}
                    value={delayMinsInput}
                    onChange={(e) => setDelayMinsInput(e.target.value)}
                    className="w-full tap-target-large px-3 py-2 rounded-xl border border-slate-300 font-bold"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 tap-target-large py-3 rounded-xl bg-emerald-700 text-white font-black text-sm"
                >
                  Save Status
                </button>
                <button
                  type="button"
                  onClick={() => setStatusDoctorModal(null)}
                  className="tap-target-large px-4 py-3 rounded-xl bg-slate-200 text-slate-700 font-bold text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: MOVE TO ANOTHER DEPARTMENT                      */}
      {/* ======================================================== */}
      {moveDeptPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-4 border-blue-500 space-y-4">
            <h3 className="text-xl font-black text-slate-900 m-0">
              Transfer Patient to Another Dept
            </h3>
            <p className="text-xs text-slate-600 font-bold m-0">
              Patient: {moveDeptPatient.patientName} ({moveDeptPatient.tokenId})
            </p>

            <form onSubmit={handleMoveDeptSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                  Destination Department
                </label>
                <select
                  value={targetDeptId}
                  onChange={(e) => setTargetDeptId(e.target.value)}
                  className="w-full tap-target-large px-3 py-2 rounded-xl border border-slate-300 font-bold"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.room}) — {d.doctorName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 tap-target-large py-3 rounded-xl bg-blue-600 text-white font-black text-sm"
                >
                  Confirm Transfer
                </button>
                <button
                  type="button"
                  onClick={() => setMoveDeptPatient(null)}
                  className="tap-target-large px-4 py-3 rounded-xl bg-slate-200 text-slate-700 font-bold text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
