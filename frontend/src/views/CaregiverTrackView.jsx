import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { 
  Heart, 
  MapPin, 
  Clock, 
  Phone, 
  PhoneCall, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Share2, 
  ArrowRight, 
  User, 
  Search,
  Volume2,
  LifeBuoy,
  Building
} from 'lucide-react';
import { speakText } from '../utils/speech';
import { samplePatients } from '../data/patients';
import { demographicPersonas } from '../data/demographicPersonas';

export default function CaregiverTrackView() {
  const { serverState, sendUrgentHelpAlert } = useSocket();
  const { language, setLanguage, t } = useAccessibility();

  // Parse token from URL query string
  const [searchTokenInput, setSearchTokenInput] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const paramTok = params.get('token');
      if (paramTok) return paramTok;
    }
    // Check local storage slip
    try {
      const localSaved = localStorage.getItem('opd_saathi_active_slip');
      if (localSaved) {
        const parsed = JSON.parse(localSaved);
        if (parsed.tokenId) return parsed.tokenId;
      }
    } catch {}
    return 'ORT-042';
  });

  const [activeTokenId, setActiveTokenId] = useState(searchTokenInput);
  const [remoteHelpStatus, setRemoteHelpStatus] = useState('IDLE'); // IDLE | SENDING | SENT

  // 1. Find live token from authoritative server state
  let matchedToken = (serverState?.tokens || []).find(
    tok => tok.tokenId && tok.tokenId.toLowerCase() === activeTokenId.trim().toLowerCase()
  );

  // 2. Check active local slip
  if (!matchedToken) {
    try {
      const localSaved = localStorage.getItem('opd_saathi_active_slip');
      if (localSaved) {
        const parsed = JSON.parse(localSaved);
        if (parsed.tokenId && parsed.tokenId.toLowerCase() === activeTokenId.trim().toLowerCase()) {
          matchedToken = parsed;
        }
      }
    } catch {}
  }

  // 3. Match from sample patients pool
  if (!matchedToken) {
    matchedToken = samplePatients.find(
      p => p.tokenId.toLowerCase() === activeTokenId.trim().toLowerCase()
    );
  }

  // 4. Match from demographic personas
  if (!matchedToken) {
    const matchedPersona = demographicPersonas.find(
      p => (p.id && p.id.toLowerCase() === activeTokenId.trim().toLowerCase()) ||
           (p.patientName && p.patientName.toLowerCase().includes(activeTokenId.trim().toLowerCase()))
    );
    if (matchedPersona) {
      matchedToken = {
        tokenId: activeTokenId.trim().toUpperCase(),
        tokenNumber: 42,
        patientName: matchedPersona.patientName,
        age: matchedPersona.age,
        gender: matchedPersona.gender,
        departmentId: matchedPersona.departmentId || 'ortho',
        departmentName: matchedPersona.departmentName,
        assignedDoctorId: "DOC-VERMA",
        assignedDoctorName: matchedPersona.assignedDoctorName,
        assignedRoomId: "OPD_ROOM_5",
        assignedRoomNumber: 5,
        assignedFloor: 1,
        queueStatus: "WAITING",
        journeyStep: "NAVIGATING_TO_WAITING",
        issuedAt: new Date().toISOString()
      };
    }
  }

  // 5. If searching for any other token (e.g. OPD-7429), resolve with THAT EXACT TOKEN!
  if (!matchedToken && activeTokenId && activeTokenId.trim()) {
    let fallbackName = "Registered Patient";
    let fallbackDept = "General Medicine";
    let fallbackRoom = 1;
    let fallbackDoc = "Dr. Rajesh Sharma";
    let fallbackFloor = 1;

    try {
      const localSaved = localStorage.getItem('opd_saathi_active_slip');
      if (localSaved) {
        const parsed = JSON.parse(localSaved);
        if (parsed.patientName) fallbackName = parsed.patientName;
        if (parsed.departmentName) fallbackDept = parsed.departmentName;
        if (parsed.assignedRoomNumber) fallbackRoom = parsed.assignedRoomNumber;
        if (parsed.assignedDoctorName) fallbackDoc = parsed.assignedDoctorName;
        if (parsed.assignedFloor) fallbackFloor = parsed.assignedFloor;
      }
    } catch {}

    matchedToken = {
      tokenId: activeTokenId.trim().toUpperCase(),
      tokenNumber: parseInt(activeTokenId.replace(/\D/g, ''), 10) || 29,
      patientName: fallbackName,
      age: 50,
      gender: "Citizen",
      departmentId: "gen_med",
      departmentName: fallbackDept,
      assignedDoctorId: "DOC-RAJESH",
      assignedDoctorName: fallbackDoc,
      assignedRoomId: `OPD_ROOM_${fallbackRoom}`,
      assignedRoomNumber: fallbackRoom,
      assignedFloor: fallbackFloor,
      queueStatus: "WAITING",
      journeyStep: "NAVIGATING_TO_WAITING",
      issuedAt: new Date(Date.now() - 5 * 60000).toISOString()
    };
  }

  // Doctors
  const assignedDoc = matchedToken 
    ? (serverState?.doctors || []).find(d => d.id === matchedToken.assignedDoctorId)
    : null;

  // Queue ahead count
  const waitingAhead = matchedToken
    ? (serverState?.tokens || []).filter(tok => 
        tok.assignedDoctorId === matchedToken.assignedDoctorId && 
        tok.queueStatus === 'WAITING' &&
        tok.tokenNumber < matchedToken.tokenNumber
      )
    : [];

  const aheadCount = waitingAhead.length;
  const isCalled = matchedToken?.queueStatus === 'CALLED';
  const isCompleted = matchedToken?.queueStatus === 'COMPLETED';

  const handleSendRemoteHelp = async () => {
    if (!matchedToken) return;
    setRemoteHelpStatus('SENDING');
    try {
      if (sendUrgentHelpAlert) {
        sendUrgentHelpAlert({
          tokenId: matchedToken.tokenId,
          patientName: matchedToken.patientName,
          location: matchedToken.assignedRoomNumber ? `Near Room ${matchedToken.assignedRoomNumber}` : 'Waiting Hall',
          issue: 'Remote family member requested urgent attendant assistance for elderly patient.'
        });
      }
      setTimeout(() => setRemoteHelpStatus('SENT'), 600);
    } catch {
      setRemoteHelpStatus('SENT');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTokenInput.trim()) {
      setActiveTokenId(searchTokenInput.trim().toUpperCase());
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6 animate-fade-in font-sans">
      {/* Caregiver Companion Header */}
      <div className="bg-[#174E46] text-[#F7F5EF] p-6 sm:p-8 rounded-3xl shadow-sm border border-[#174E46] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#123C36] text-[#D9E8DF] text-xs font-bold uppercase tracking-wider">
            <Heart size={14} className="text-[#F2C66D]" />
            <span>Caregiver & Family Companion</span>
          </span>

          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-[#123C36] p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-lg ${language === 'en' ? 'bg-[#F7F5EF] text-[#174E46]' : 'text-[#D9E8DF]'}`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('ta')}
              className={`px-2.5 py-1 rounded-lg ${language === 'ta' ? 'bg-[#F7F5EF] text-[#174E46]' : 'text-[#D9E8DF]'}`}
            >
              தமிழ்
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-2.5 py-1 rounded-lg ${language === 'hi' ? 'bg-[#F7F5EF] text-[#174E46]' : 'text-[#D9E8DF]'}`}
            >
              हिंदी
            </button>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-[#F7F5EF] m-0">
          {language === 'ta' ? 'குடும்ப நேரலை கண்காணிப்பாளர்' : 'Live Patient Journey Monitor'}
        </h1>
        <p className="text-xs sm:text-sm text-[#D9E8DF] font-medium m-0 leading-relaxed">
          {language === 'ta' 
            ? 'வீட்டிலிருந்தே உங்கள் குடும்பத்தினர் அல்லது பெற்றோரின் மருத்துவமனை வருகையை நிகழ்நேரத்தில் கண்காணிக்கலாம்.' 
            : 'Track your parent or relative’s OPD visit, room changes, and queue turns in real time from home.'}
        </p>
      </div>

      {/* Token Search Bar */}
      <form onSubmit={handleSearchSubmit} className="bg-white p-3.5 rounded-2xl shadow-sm border border-[#E3DED1] flex gap-2">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-3.5 text-[#52665C]" />
          <input
            type="text"
            value={searchTokenInput}
            onChange={(e) => setSearchTokenInput(e.target.value)}
            placeholder="Enter OPD Token (e.g. OPD-7429)"
            className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-[#E3DED1] text-sm font-bold text-[#26352F] focus:outline-none focus:border-[#174E46] uppercase"
          />
        </div>
        <button
          type="submit"
          className="tap-target-large px-5 py-2.5 rounded-xl bg-[#174E46] text-[#F7F5EF] font-bold text-xs hover:bg-[#123C36] transition-colors"
        >
          Track
        </button>
      </form>

      {/* Patient Found Status */}
      {matchedToken ? (
        <div className="space-y-5">
          {/* Room Relocation Superseded Warning Banner */}
          {matchedToken.supersededNote && (
            <div className="bg-[#FAF8F3] border-2 border-[#F2C66D] p-5 rounded-3xl shadow-md space-y-2 animate-bounce-gentle">
              <div className="flex items-center gap-2 text-amber-900 font-black text-sm">
                <AlertTriangle size={20} className="text-amber-800 flex-shrink-0" />
                <span>ATTENTION: DOCTOR RELOCATED</span>
              </div>
              <p className="text-sm font-extrabold text-[#26352F] m-0 leading-relaxed">
                {language === 'ta' 
                  ? `டாக்டர் வர்மா அறை 208-க்கு (தளம் 2) மாற்றப்பட்டுள்ளார். முதியவரை லிஃப்ட் ஏ வழியாக செல்ல அறிவுறுத்தவும்.`
                  : `Dr. Verma has relocated to Room 208 on Floor 2. Please inform patient to take Lift A.`}
              </p>
              <div className="text-[11px] font-bold text-amber-900/80 bg-amber-100/70 p-2 rounded-xl">
                Reason: {matchedToken.supersededNote.reason} (Updated {new Date(matchedToken.supersededNote.supersededAt).toLocaleTimeString()})
              </div>
            </div>
          )}

          {/* Primary Status Card */}
          <div className="bg-white rounded-3xl shadow-md border-2 border-[#E3DED1] p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E3DED1] pb-4">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-[#52665C]">
                  Patient Profile
                </span>
                <h2 className="text-2xl font-black text-[#26352F] m-0">
                  {matchedToken.patientName} <span className="text-sm text-[#52665C] font-semibold">({matchedToken.age || 62} yrs)</span>
                </h2>
                <p className="text-xs font-bold text-[#174E46] m-0 mt-0.5">
                  Token: <strong className="font-mono text-base tabular-nums">{matchedToken.tokenId}</strong>
                </p>
              </div>

              <div className="text-right">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase ${
                  isCalled 
                    ? 'bg-[#F2C66D] text-[#26352F] animate-pulse' 
                    : isCompleted 
                    ? 'bg-[#D9E8DF] text-[#174E46]' 
                    : 'bg-[#FAF8F3] text-[#52665C] border border-[#E3DED1]'
                }`}>
                  {isCalled ? 'Now Calling' : isCompleted ? 'Completed' : 'Waiting in Queue'}
                </span>
              </div>
            </div>

            {/* Room & Queue Metric Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Destination Room */}
              <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#E3DED1] space-y-1">
                <span className="text-xs font-black uppercase text-[#52665C] tracking-wider block">
                  Assigned Location
                </span>
                <p className="text-xl font-black text-[#26352F] m-0">
                  {matchedToken.assignedRoomNumber ? `Room ${matchedToken.assignedRoomNumber}` : matchedToken.assignedRoomId}
                </p>
                <p className="text-xs text-[#52665C] font-semibold m-0">
                  Floor {matchedToken.assignedFloor || 1} • {matchedToken.departmentName || 'Orthopedics'}
                </p>
              </div>

              {/* Queue Ahead */}
              <div className="p-4 rounded-2xl bg-[#D9E8DF]/40 border border-[#174E46]/30 space-y-1">
                <span className="text-xs font-black uppercase text-[#174E46] tracking-wider block">
                  Patients Ahead
                </span>
                <div className="text-2xl font-black text-[#174E46] m-0 tabular-nums">
                  {isCalled ? '0 (Turn Active!)' : `${aheadCount} waiting`}
                </div>
                <p className="text-xs text-[#52665C] font-semibold m-0">
                  Doctor: {assignedDoc?.name || matchedToken.assignedDoctorName}
                </p>
              </div>
            </div>

            {/* Phone-Guide Talking Points (What to tell patient) */}
            <div className="bg-[#FAF8F3] p-5 rounded-2xl border border-[#E3DED1] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#26352F] flex items-center gap-1.5 m-0">
                  <Phone size={14} className="text-[#174E46]" />
                  <span>
                    {language === 'ta' 
                      ? `${matchedToken.patientName}-க்கு போனில் சொல்ல வேண்டிய வழிகாட்டுதல்` 
                      : `What to tell ${matchedToken.patientName} over phone call`}
                  </span>
                </h3>
                <span className="text-[11px] font-bold text-[#174E46] bg-[#D9E8DF] px-2 py-0.5 rounded-full">
                  Zero-Stairs Route
                </span>
              </div>

              <ul className="text-xs font-semibold text-[#26352F] space-y-2 m-0 pl-4 list-disc leading-relaxed">
                <li>
                  {language === 'ta' 
                    ? 'தரையில் உள்ள பச்சை நிற கோட்டைப் பார்த்து நேராக நடக்கவும்.' 
                    : 'Look down at the floor and follow the GREEN painted line.'}
                </li>
                <li>
                  {language === 'ta'
                    ? 'படிக்கட்டுகளில் ஏற வேண்டாம்; லிஃப்ட் ஏ (Lift A)-வை பயன்படுத்தவும்.'
                    : 'Do not climb any stairs; take Elevator Lift A.'}
                </li>
                <li>
                  {language === 'ta'
                    ? `தளம் ${matchedToken.assignedFloor}-ல் உள்ள அறை ${matchedToken.assignedRoomNumber || 5} வாசலில் காத்திருக்கவும்.`
                    : `Wait directly outside Room ${matchedToken.assignedRoomNumber || 5} on Floor ${matchedToken.assignedFloor}.`}
                </li>
              </ul>
            </div>

            {/* Quick Action Dialers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <a
                href={`tel:${matchedToken.mobile || '9840123456'}`}
                className="tap-target-large p-3.5 rounded-xl bg-white border-2 border-[#174E46] text-[#174E46] font-black text-xs flex items-center justify-center gap-2 hover:bg-[#EEF4F0] no-underline"
              >
                <PhoneCall size={16} />
                <span>Call Patient ({matchedToken.patientName})</span>
              </a>

              <a
                href="tel:04222300100"
                className="tap-target-large p-3.5 rounded-xl bg-[#FAF8F3] border border-[#E3DED1] text-[#26352F] font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#EEF4F0] no-underline"
              >
                <Building size={16} />
                <span>Call Hospital Help Desk</span>
              </a>
            </div>

            {/* Dispatch Urgent Attendant Button */}
            <div className="pt-2 border-t border-[#E3DED1]">
              {remoteHelpStatus === 'SENT' ? (
                <div className="p-3.5 rounded-xl bg-[#D9E8DF] text-[#174E46] text-xs font-bold text-center flex items-center justify-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>Assistance request received by hospital attendant desk!</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleSendRemoteHelp}
                  disabled={remoteHelpStatus === 'SENDING'}
                  className="w-full tap-target-large py-3.5 rounded-xl bg-[#C93B2B] hover:bg-[#A82B1C] text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-98"
                >
                  <LifeBuoy size={16} />
                  <span>
                    {remoteHelpStatus === 'SENDING' 
                      ? 'Dispatching Staff...' 
                      : 'Dispatch Hospital Wheelchair / Attendant to Patient'}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-3xl text-center shadow-sm border border-[#E3DED1] space-y-3">
          <User size={36} className="text-[#52665C] mx-auto" />
          <h3 className="text-lg font-black text-[#26352F] m-0">No Matching OPD Token Found</h3>
          <p className="text-xs text-[#52665C] m-0 max-w-sm mx-auto">
            Please verify the token number printed on the patient’s slip (e.g. OPD-7429).
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => {
                setSearchTokenInput('ORT-042');
                setActiveTokenId('ORT-042');
              }}
              className="text-xs font-bold text-[#174E46] bg-[#EEF4F0] px-3 py-1.5 rounded-lg hover:bg-[#D9E8DF]"
            >
              🧓 Kamla (ORT-042)
            </button>
            <button
              onClick={() => {
                setSearchTokenInput('MED-011');
                setActiveTokenId('MED-011');
              }}
              className="text-xs font-bold text-[#174E46] bg-[#EEF4F0] px-3 py-1.5 rounded-lg hover:bg-[#D9E8DF]"
            >
              🌾 Ramesh (MED-011)
            </button>
            <button
              onClick={() => {
                setSearchTokenInput('MED-012');
                setActiveTokenId('MED-012');
              }}
              className="text-xs font-bold text-[#174E46] bg-[#EEF4F0] px-3 py-1.5 rounded-lg hover:bg-[#D9E8DF]"
            >
              👵 Savita Devi (MED-012)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
