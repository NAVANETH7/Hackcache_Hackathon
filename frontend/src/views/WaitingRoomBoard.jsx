import React, { useEffect, useState, useRef } from 'react';
import { useSocket, playChime } from '../context/SocketContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { speakText } from '../utils/speech';
import { Tv, Volume2, Building2, Bell, AlertCircle, Clock, VolumeX } from 'lucide-react';

export default function WaitingRoomBoard() {
  const { serverState } = useSocket();
  const { t } = useAccessibility();

  // Language rotation on TV board: English -> Hindi -> Tamil every 6 seconds
  const languages = ['en', 'hi', 'ta'];
  const [langIndex, setLangIndex] = useState(0);
  const currentLang = languages[langIndex];

  const [activeCall, setActiveCall] = useState(null);
  const [speechMuted, setSpeechMuted] = useState(false);
  const lastCalledTokenIdRef = useRef(null);

  // Rotate display language every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setLangIndex((prev) => (prev + 1) % languages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Monitor newly called tokens and announce aloud
  useEffect(() => {
    if (!serverState?.tokens) return;
    const calledToken = serverState.tokens.find(t => t.queueStatus === 'CALLED');
    if (calledToken && calledToken.tokenId !== lastCalledTokenIdRef.current) {
      lastCalledTokenIdRef.current = calledToken.tokenId;
      setActiveCall(calledToken);

      // Play chime
      playChime('call');

      // Audio voice announcement in alternating language
      if (!speechMuted) {
        const roomNum = calledToken.assignedRoomNumber || calledToken.assignedRoomId.replace('OPD_ROOM_', 'Room ');
        const spoken = currentLang === 'ta'
          ? `டோக்கன் எண் ${calledToken.tokenId}, தயவுசெய்து அறை ${roomNum}-க்கு செல்லவும்.`
          : currentLang === 'hi'
          ? `टोकन संख्या ${calledToken.tokenId}, कृपया कमरा नंबर ${roomNum} में जाएं।`
          : `Token number ${calledToken.tokenId}, please proceed to ${roomNum}.`;
        speakText(spoken, currentLang);
      }
    }
  }, [serverState?.tokens, currentLang, speechMuted]);

  const doctors = serverState?.doctors || [];
  const tokens = serverState?.tokens || [];

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6 space-y-6 select-none font-sans">
      {/* Top TV Header Banner */}
      <div className="bg-slate-900 border-2 border-slate-800 p-4 sm:p-6 rounded-3xl flex flex-wrap items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg flex-shrink-0">
            <Building2 size={36} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white m-0">
              {currentLang === 'ta' 
                ? 'நகர மாவட்ட அரசு தலைமை மருத்துவமனை' 
                : currentLang === 'hi'
                ? 'सिटी जिला सरकारी मुख्यालय अस्पताल'
                : 'City District Headquarters Hospital'}
            </h1>
            <p className="text-xs sm:text-sm font-bold text-emerald-400 m-0 mt-0.5">
              {currentLang === 'ta' 
                ? 'நேரடி ஓபிடி டோக்கன் காட்சிப் பலகை • Live OPD Token Board' 
                : currentLang === 'hi'
                ? 'लाइव ओपीडी टोकन डिस्प्ले बोर्ड • Live OPD Token Board'
                : 'Live OPD Token Display Board • சுழலும் மொழி திரை'}
            </p>
          </div>
        </div>

        {/* Live Status and Audio Control */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSpeechMuted(!speechMuted)}
            className={`tap-target-large px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border transition-colors ${
              speechMuted ? 'bg-red-950 text-red-400 border-red-700' : 'bg-slate-800 text-emerald-400 border-slate-700'
            }`}
          >
            {speechMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            <span>{speechMuted ? 'Muted' : 'Audio ON'}</span>
          </button>

          <div className="flex items-center gap-2 bg-emerald-950 border border-emerald-500/50 text-emerald-300 px-4 py-2 rounded-xl text-xs font-black animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span>LIVE TV</span>
          </div>
        </div>
      </div>

      {/* Now Calling Giant Banner */}
      {activeCall ? (
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-slate-900 border-4 border-emerald-400 p-6 sm:p-8 rounded-3xl text-center shadow-2xl relative overflow-hidden animate-beacon">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm uppercase mb-2">
            <Bell size={18} />
            <span>
              {currentLang === 'ta' 
                ? 'தற்போது அழைக்கப்படுகிறது (NOW CALLING)' 
                : currentLang === 'hi'
                ? 'वर्तमान बुलावा (NOW CALLING)'
                : 'NOW CALLING'}
            </span>
          </div>

          <div className="text-6xl sm:text-8xl md:text-9xl font-black font-mono text-white tracking-tighter my-1 drop-shadow-lg">
            {activeCall.tokenId}
          </div>

          <p className="text-xl sm:text-3xl font-extrabold text-amber-300 m-0">
            {activeCall.patientName} — {activeCall.departmentName}
          </p>

          <div className="inline-block mt-4 bg-slate-950/85 border-2 border-emerald-300 px-6 sm:px-10 py-3 rounded-2xl">
            <p className="text-2xl sm:text-3xl font-black text-emerald-300 m-0">
              👉 {activeCall.assignedRoomNumber ? `Room ${activeCall.assignedRoomNumber}` : activeCall.assignedRoomId} (Floor {activeCall.assignedFloor})
            </p>
            <p className="text-xs sm:text-sm font-bold text-slate-300 m-0 mt-1">
              {currentLang === 'ta' 
                ? `அறைக்குள் செல்லவும் • ${activeCall.assignedDoctorName}` 
                : currentLang === 'hi'
                ? `कमरे में प्रवेश करें • ${activeCall.assignedDoctorName}`
                : `Please enter the consultation room • ${activeCall.assignedDoctorName}`}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/60 border-2 border-slate-800 p-6 rounded-3xl text-center">
          <p className="text-slate-400 text-base font-bold m-0">
            {currentLang === 'ta' 
              ? 'உங்கள் டோக்கன் அழைக்கப்படும் போது அறைக்குச் செல்லவும்' 
              : currentLang === 'hi'
              ? 'टोकन बुलाए जाने पर कृपया अपने निर्धारित कमरे में जाएं'
              : 'Please proceed to your assigned room when your token is called'}
          </p>
        </div>
      )}

      {/* ======================================================== */}
      {/* OPD ROOMS DIRECTORY: NOW SERVING, NEXT 3 TOKENS & DELAYS */}
      {/* ======================================================== */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg sm:text-xl font-black text-slate-200 flex items-center gap-2 m-0">
            <Tv size={22} className="text-emerald-500" />
            <span>
              {currentLang === 'ta' 
                ? 'மருத்துவர் ஆலோசனை அறைகள் மற்றும் அடுத்த டோக்கன்கள்' 
                : currentLang === 'hi'
                ? 'परामर्श कक्ष एवं कतार में अगले टोकन'
                : 'Consultation Rooms & Next 3 Tokens in Line'}
            </span>
          </h2>
          <span className="text-xs font-bold text-slate-400">
            Language: <strong className="text-emerald-400 uppercase">{currentLang}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {doctors.map(doc => {
            // Find next 3 waiting tokens for this doctor
            const deptWaiting = tokens.filter(t => 
              (t.assignedDoctorId === doc.id || t.departmentId === doc.departmentId) && 
              t.queueStatus === 'WAITING'
            );
            const next3Tokens = deptWaiting.slice(0, 3);

            const isLate = doc.delayMinutes > 0;
            const onBreak = doc.status === 'ON_BREAK';

            const deptTitle = currentLang === 'ta' ? doc.specialty_ta || doc.specialty : currentLang === 'hi' ? doc.specialty_hi || doc.specialty : doc.specialty;
            const docName = currentLang === 'ta' ? doc.name_ta || doc.name : currentLang === 'hi' ? doc.name_hi || doc.name : doc.name;

            return (
              <div 
                key={doc.id}
                className="bg-slate-900 border-2 border-slate-800 p-4 rounded-3xl shadow-xl flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[11px] font-black uppercase bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full truncate">
                      {deptTitle}
                    </span>
                    <span className="text-[11px] font-extrabold text-amber-400">
                      Floor {doc.floor}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-white m-0 truncate">
                    {docName}
                  </h3>
                  <p className="text-xs font-extrabold text-emerald-400 m-0 mt-0.5">
                    {doc.roomNumber ? `Room ${doc.roomNumber}` : doc.roomId}
                  </p>

                  {/* Delay or Break Notice */}
                  {(onBreak || isLate) && (
                    <div className="mt-2 p-1.5 bg-red-950/80 border border-red-500/50 rounded-xl text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                      <Clock size={12} className="flex-shrink-0" />
                      <span className="truncate">
                        {onBreak 
                          ? (currentLang === 'ta' ? `இடைவேளை (${doc.breakUntil || '11:30'} வரை)` : `Break until ${doc.breakUntil || '11:30'}`)
                          : (currentLang === 'ta' ? `தாமதம்: +${doc.delayMinutes} நிமிடங்கள்` : `Delay: +${doc.delayMinutes} mins`)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Now Serving vs Next in line */}
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Now In Room:
                    </span>
                    <span className="text-lg font-black font-mono text-emerald-400">
                      {doc.currentToken || '—'}
                    </span>
                  </div>

                  {/* Next 3 tokens in line */}
                  <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800/80">
                    <span className="text-[10px] uppercase font-black text-slate-500 block mb-1">
                      {t('board.nextTokens')}:
                    </span>
                    {next3Tokens.length > 0 ? (
                      <div className="flex items-center gap-1.5">
                        {next3Tokens.map((token, idx) => (
                          <span 
                            key={token.tokenId}
                            className={`px-2 py-0.5 rounded-lg text-xs font-mono font-black ${
                              idx === 0 
                                ? 'bg-amber-400 text-slate-950' 
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {token.tokenId}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[11px] font-bold text-slate-600">
                        No waiting tokens
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
