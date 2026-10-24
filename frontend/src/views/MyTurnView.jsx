import React, { useEffect, useState, useRef } from 'react';
import { useJourney } from '../context/JourneyContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useSocket, playChime } from '../context/SocketContext';
import { speakText } from '../utils/speech';
import FloorPlanSVG from '../components/patient/FloorPlanSVG';
import PostConsultationCard from '../components/patient/PostConsultationCard';
import { 
  Bell, 
  Clock, 
  MapPin, 
  User, 
  Stethoscope, 
  AlertTriangle, 
  MessageSquare, 
  Volume2, 
  Compass, 
  CheckCircle2, 
  RotateCcw,
  Sparkles,
  PhoneCall,
  Pill
} from 'lucide-react';

export default function MyTurnView({ onNavigateToRoute }) {
  const { activeSlip, activeRoute, markConsultationCompleted } = useJourney();
  const { language, t } = useAccessibility();
  const { serverState, calculateEstimatedWait } = useSocket();

  const [simulatedSmsToast, setSimulatedSmsToast] = useState(null);
  const [hasAlerted3Ahead, setHasAlerted3Ahead] = useState(false);
  const [hasAlertedCalled, setHasAlertedCalled] = useState(false);

  if (!activeSlip) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white p-8 rounded-3xl text-center shadow-lg border-2 border-slate-200">
        <Clock size={40} className="text-slate-400 mx-auto mb-3" />
        <h2 className="text-xl font-black text-slate-900 m-0">No Active OPD Slip</h2>
        <p className="text-sm text-slate-500 m-0 mt-2 mb-4">
          Please register for an OPD token or enter your existing slip number to track your turn.
        </p>
        <a
          href="/"
          className="inline-block tap-target-large px-6 py-3 rounded-xl bg-emerald-700 text-white font-bold text-sm no-underline"
        >
          Go to Home & Register
        </a>
      </div>
    );
  }

  // Find live token status from shared authoritative serverState
  const matchedToken = (serverState?.tokens || []).find(t => t.tokenId === activeSlip.tokenId) || activeSlip;
  const isCalled = matchedToken.queueStatus === 'CALLED';

  // Calculate live waiting count ahead
  const waitingAhead = (serverState?.tokens || []).filter(t => 
    t.assignedDoctorId === activeSlip.assignedDoctorId && 
    t.queueStatus === 'WAITING' &&
    t.tokenNumber < activeSlip.tokenNumber
  );
  const aheadCount = waitingAhead.length;

  // Assigned doctor & status
  const assignedDoc = (serverState?.doctors || []).find(d => d.id === activeSlip.assignedDoctorId);
  const doctorDelay = assignedDoc?.delayMinutes || 0;
  const doctorStatus = assignedDoc?.status || 'AVAILABLE'; // AVAILABLE, ON_BREAK, RUNNING_LATE, IN_CONSULTATION
  const nowServingToken = assignedDoc?.currentToken || null;

  // Estimated wait (rounded to 5 mins)
  const estWaitMins = calculateEstimatedWait(aheadCount, activeSlip.departmentId, doctorDelay);

  const roomDisplay = activeSlip.assignedRoomNumber ? `Room ${activeSlip.assignedRoomNumber}` : activeSlip.assignedRoomId;

  // Alert triggers when 3 people are ahead!
  useEffect(() => {
    if (aheadCount === 3 && !hasAlerted3Ahead && !isCalled) {
      setHasAlerted3Ahead(true);

      // 1. Phone Vibration
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate([200, 100, 200, 100, 300]); } catch {}
      }

      // 2. Play Audio Chime
      playChime('alert3');

      // 3. Spoken Audio Alert
      const spokenNotice = language === 'ta'
        ? `உங்கள் முறை மிக அருகில் உள்ளது. உங்களுக்கு முன்னால் 3 நபர்கள் மட்டுமே உள்ளனர். தயவுசெய்து தளம் ${activeSlip.assignedFloor} அறை ${activeSlip.assignedRoomNumber || 5}-க்கு செல்லவும்.`
        : language === 'hi'
        ? `आपकी बारी बहुत नजदीक है। केवल 3 मरीज आगे हैं। कृपया मंजिल ${activeSlip.assignedFloor} पर कमरा ${activeSlip.assignedRoomNumber || 5} की ओर जाएं।`
        : `Your turn is close! Only 3 people ahead. Please proceed towards ${roomDisplay} on Floor ${activeSlip.assignedFloor}.`;
      speakText(spokenNotice, language);

      // 4. Simulated SMS Toast
      setSimulatedSmsToast({
        sender: 'CITY-HOSP-ALERT',
        text: language === 'ta'
          ? `[SMS] உங்கள் முறை நெருங்கிவிட்டது. தயவுசெய்து முதல் தளத்தில் உள்ள அறை ${activeSlip.assignedRoomNumber || 5}-க்கு வரவும்.`
          : language === 'hi'
          ? `[SMS] आपकी बारी पास है। कृपया पहली मंजिल पर कमरा ${activeSlip.assignedRoomNumber || 5} में जाएं।`
          : `[SMS] City District Hospital: Your turn is close. Please go to ${roomDisplay} on Floor ${activeSlip.assignedFloor}.`
      });

      // 5. Browser Notification
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        try {
          new Notification('OPD Saathi Alert', {
            body: `Your turn is close. Please go to ${roomDisplay} on Floor ${activeSlip.assignedFloor}.`
          });
        } catch {}
      }
    }
  }, [aheadCount, hasAlerted3Ahead, isCalled, language, activeSlip, roomDisplay]);

  // Alert triggers when Token is CALLED!
  useEffect(() => {
    if (isCalled && !hasAlertedCalled) {
      setHasAlertedCalled(true);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate([400, 200, 400]); } catch {}
      }
      playChime('call');

      const calledText = language === 'ta'
        ? `டோக்கன் ${activeSlip.tokenId} அழைக்கப்பட்டது! தயவுசெய்து அறை ${roomDisplay}-க்குள் நுழையவும்.`
        : language === 'hi'
        ? `टोकन ${activeSlip.tokenId} को बुलाया गया है! कृपया कमरा ${roomDisplay} में प्रवेश करें।`
        : `Token ${activeSlip.tokenId} is called! Please proceed into ${roomDisplay}.`;
      speakText(calledText, language);
    }
  }, [isCalled, hasAlertedCalled, activeSlip, roomDisplay, language]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5 animate-fade-in">
      {/* ======================================================== */}
      {/* SIMULATED SMS TOAST BANNER                              */}
      {/* ======================================================== */}
      {simulatedSmsToast && (
        <div className="bg-slate-900 text-white p-4 rounded-2xl border-2 border-emerald-400 shadow-2xl flex items-start gap-3 animate-bounce-gentle">
          <div className="p-2 rounded-xl bg-emerald-600 text-white flex-shrink-0 mt-0.5">
            <MessageSquare size={20} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-400 mb-0.5">
              <span>{t('myTurn.simulatedSmsTitle')} ({simulatedSmsToast.sender})</span>
              <button 
                onClick={() => setSimulatedSmsToast(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="text-sm font-black m-0 text-white">
              {simulatedSmsToast.text}
            </p>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. CONSULTATION COMPLETED -> SHOW POST-CONSULTATION CARD */}
      {/* ======================================================== */}
      {matchedToken.queueStatus === 'COMPLETED' ? (
        <PostConsultationCard onNavigateToRoute={onNavigateToRoute} />
      ) : isCalled ? (
        /* ======================================================== */
        /* 2. TOKEN CALLED GIANT BANNER (WHEN CALLED)               */
        /* ======================================================== */
        <div className="bg-gradient-to-r from-qc-primary to-qc-text text-qc-bg p-6 sm:p-8 rounded-3xl text-center shadow-2xl border-4 border-qc-amber animate-beacon space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-qc-amber text-qc-text font-black text-xs uppercase mb-1">
            <PhoneCall size={16} />
            <span>{t('myTurn.tokenCalledTitle')}</span>
          </div>

          <div className="text-5xl sm:text-7xl font-black font-mono tracking-tight tabular-nums my-2 drop-shadow-md text-white">
            {activeSlip.tokenId}
          </div>

          <p className="text-xl sm:text-2xl font-black text-qc-amber m-0 mt-1">
            {t('myTurn.tokenCalledMessage')}
          </p>

          <div className="mt-3 inline-block bg-qc-bg/15 border-2 border-qc-amber px-6 py-3 rounded-2xl">
            <p className="text-lg sm:text-xl font-black text-white m-0">
              👉 {roomDisplay} (Floor {activeSlip.assignedFloor})
            </p>
            <p className="text-xs text-qc-sage m-0 mt-0.5">
              {activeSlip.assignedDoctorName}
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={markConsultationCompleted}
              className="tap-target-large px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold border border-white/20 transition-all inline-flex items-center gap-2"
            >
              <CheckCircle2 size={15} />
              <span>{language === 'ta' ? 'மருத்துவர் ஆலோசனை முடிந்தது? மருந்தகம் பார்க்க' : 'Finished with Doctor? Go to Pharmacy & Lab'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* ======================================================== */
        /* 3. REGULAR QUEUE TRACKER                                 */
        /* ======================================================== */
        <div className="bg-qc-bg text-qc-text rounded-3xl shadow-xl border-2 border-qc-border p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-qc-border pb-3">
            <div>
              <span className="text-xs font-black uppercase text-qc-text/60 tracking-wider">
                {t('myTurn.title')}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-qc-text m-0">
                {activeSlip.patientName} — <span className="font-mono text-qc-primary">{activeSlip.tokenId}</span>
              </h2>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-qc-text/60 block">Room</span>
              <span className="text-lg font-black text-qc-primary">{roomDisplay}</span>
            </div>
          </div>

          {/* Big Place in Queue Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Ahead count */}
            <div className="bg-qc-sage/40 border-2 border-qc-primary p-5 rounded-2xl text-center">
              <span className="text-xs font-black uppercase text-qc-primary tracking-wider">
                {t('myTurn.placeInQueue')}
              </span>
              <div className="text-4xl sm:text-5xl font-black text-qc-primary my-1 tabular-nums">
                {aheadCount}
              </div>
              <p className="text-xs font-bold text-qc-primary m-0">
                {aheadCount === 0 ? 'You are next in line!' : `${aheadCount} ${t('myTurn.aheadCount')}`}
              </p>
            </div>

            {/* Estimated Wait */}
            <div className="bg-white border-2 border-qc-border p-5 rounded-2xl text-center">
              <span className="text-xs font-black uppercase text-qc-text/60 tracking-wider">
                {t('slip.estimatedWaitLabel')}
              </span>
              <div className="text-3xl sm:text-4xl font-black text-qc-text my-1 tabular-nums">
                ~{estWaitMins} mins
              </div>
              <p className="text-xs font-bold text-qc-text/70 m-0">
                {t('myTurn.estWait')} {estWaitMins} {t('slip.minutes')}
              </p>
            </div>
          </div>

          {/* Now Serving & Doctor Status Banner */}
          <div className="p-4 rounded-2xl bg-qc-primary text-qc-bg space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-extrabold text-qc-sage">
                {t('myTurn.nowServing')}:
              </span>
              <span className="text-base font-black font-mono text-qc-amber">
                {nowServingToken || 'None at moment'}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-white/20 pt-2 text-xs">
              <span className="text-qc-sage font-bold">{t('myTurn.doctorStatus')}:</span>
              <span className={`font-black px-2.5 py-0.5 rounded-full ${
                doctorStatus === 'ON_BREAK'
                  ? 'bg-qc-amber text-qc-text'
                  : doctorStatus === 'RUNNING_LATE' || doctorDelay > 0
                  ? 'bg-qc-emergency text-white'
                  : 'bg-qc-sage text-qc-primary'
              }`}>
                {doctorStatus === 'ON_BREAK' 
                  ? `${t('myTurn.docOnBreak')} ${assignedDoc?.breakUntil || '11:30'}`
                  : doctorDelay > 0
                  ? `${t('myTurn.docRunningLate')} ${doctorDelay} mins`
                  : t('myTurn.docInRoom')}
              </span>
            </div>
          </div>

          {/* What to do next instructions */}
          <div className="p-4 rounded-2xl bg-qc-amber/25 border-2 border-qc-amber text-xs font-bold text-qc-text space-y-1">
            <p className="font-black text-qc-text uppercase tracking-wider m-0">
              ℹ️ {t('myTurn.whatToDoNext')}
            </p>
            <p className="text-sm font-bold text-qc-text m-0 leading-relaxed">
              {aheadCount <= 3 
                ? (language === 'ta' 
                  ? `உங்கள் முறை மிக அருகில் உள்ளது. தயவுசெய்து அறை ${roomDisplay} வாசலில் வந்து காத்திருக்கவும்.`
                  : `Your turn is very close! Please walk to ${roomDisplay} on Floor ${activeSlip.assignedFloor} now.`)
                : t('myTurn.waitInHall')}
            </p>
          </div>

          {/* Consultation Finished Button Trigger */}
          <div className="text-center pt-1 border-t border-qc-border">
            <button
              type="button"
              onClick={markConsultationCompleted}
              className="text-xs text-qc-primary font-bold hover:underline inline-flex items-center gap-1.5"
            >
              <CheckCircle2 size={14} />
              <span>{language === 'ta' ? 'மருத்துவர் ஆலோசனை முடிந்துவிட்டதா? மருந்தக வழிகாட்டி' : 'Finished seeing the doctor? Go to Post-Consultation Pharmacy & Lab'}</span>
            </button>
          </div>
        </div>
      )}

      {/* SVG Floor Plan Route Preview */}
      <div className="space-y-2">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2 m-0">
          <Compass size={20} className="text-emerald-700" />
          <span>{t('myTurn.directionsToRoom')} ({roomDisplay})</span>
        </h3>
        <FloorPlanSVG floor={activeSlip.assignedFloor} activeRoute={activeRoute} />
      </div>
    </div>
  );
}
