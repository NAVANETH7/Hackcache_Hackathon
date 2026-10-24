import React, { useState } from 'react';
import { useJourney } from '../../context/JourneyContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useSocket } from '../../context/SocketContext';
import { speakText } from '../../utils/speech';
import CaregiverShareModal from './CaregiverShareModal';
import VisualAnchorModal from './VisualAnchorModal';
import HospitalMapModal from './HospitalMapModal';
import { 
  Navigation, 
  MapPin, 
  LifeBuoy, 
  Volume2, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw,
  Clock,
  ShieldCheck,
  Footprints,
  Share2,
  Compass,
  Sparkles,
  TreePine,
  Coffee,
  Map
} from 'lucide-react';

export default function NextActionCard() {
  const { 
    nextActionState, 
    activeSlip, 
    currentStepNodeId, 
    advanceToCheckpoint,
    setHelpModalOpen 
  } = useJourney();
  const { language, t } = useAccessibility();
  const { lastUpdatedText, connected, serverState, calculateEstimatedWait } = useSocket();

  const [caregiverModalOpen, setCaregiverModalOpen] = useState(false);
  const [visualAnchorOpen, setVisualAnchorOpen] = useState(false);
  const [mapModalOpen, setMapModalOpen] = useState(false);

  if (!activeSlip) return null;

  const isSuperseded = nextActionState.instructionFreshness === 'SUPERSEDED';
  const isDisrupted = nextActionState.instructionFreshness === 'DISRUPTED';

  // Ahead count and wait estimation
  const waitingAhead = (serverState?.tokens || []).filter(t => 
    t.assignedDoctorId === activeSlip.assignedDoctorId && 
    t.queueStatus === 'WAITING' &&
    t.tokenNumber < activeSlip.tokenNumber
  );
  const aheadCount = waitingAhead.length;
  const assignedDoc = (serverState?.doctors || []).find(d => d.id === activeSlip.assignedDoctorId);
  const estWaitMins = calculateEstimatedWait(aheadCount, activeSlip.departmentId, assignedDoc?.delayMinutes || 0);

  const nextActionText = 
    nextActionState.nextExpectedAction.localizedText[language] ||
    nextActionState.nextExpectedAction.localizedText['ta'] ||
    nextActionState.nextExpectedAction.localizedText['en'];

  const handleSpeak = () => {
    speakText(nextActionText, language);
  };

  // Floor Line Wayfinding Cue
  const floorLineColor = activeSlip.departmentId === 'ortho' || activeSlip.departmentId === 'gen_med'
    ? 'green'
    : activeSlip.departmentId === 'peds'
    ? 'blue'
    : 'yellow';

  const floorLineText = floorLineColor === 'green'
    ? t('floorLine.greenLine')
    : floorLineColor === 'blue'
    ? t('floorLine.blueLine')
    : t('floorLine.yellowLine');

  return (
    <>
      <div className="bg-qc-bg rounded-3xl shadow-md border-2 border-qc-border overflow-hidden text-qc-text">
        {/* Top Status & Freshness Header */}
        <div className={`px-5 py-3 flex items-center justify-between text-xs sm:text-sm font-bold border-b ${
          isSuperseded 
            ? 'bg-amber-50 text-amber-900 border-qc-amber' 
            : isDisrupted
            ? 'bg-red-50 text-qc-emergency border-red-300'
            : 'bg-qc-sage/40 text-qc-primary border-qc-border'
        }`}>
          <div className="flex items-center gap-2">
            {isSuperseded ? (
              <AlertTriangle size={18} className="text-amber-800" />
            ) : isDisrupted ? (
              <AlertTriangle size={18} className="text-qc-emergency" />
            ) : (
              <CheckCircle2 size={18} className="text-qc-primary" />
            )}
            <span className="font-black tracking-tight">
              {isSuperseded 
                ? (language === 'ta' ? 'அறை மாற்றம் உறுதிசெய்யப்பட்டது' : language === 'hi' ? 'कमरा बदला गया' : 'Room Reassignment Confirmed')
                : isDisrupted 
                ? (language === 'ta' ? 'பாதை தடைபட்டுள்ளது — உதவி தேவை' : language === 'hi' ? 'रास्ता बाधित — सहायता उपलब्ध' : 'Route Disrupted — Help Requested')
                : (language === 'ta' ? 'உறுதிசெய்யப்பட்ட நேரலை வழித்தடம்' : language === 'hi' ? 'पुष्ट सक्रिय मार्ग' : 'Confirmed Active Journey')}
            </span>
          </div>

          {/* Sync & Freshness badge */}
          <div className="flex items-center gap-1.5 text-[11px] text-qc-text/70">
            <Clock size={13} />
            <span>{connected ? `Synced ${lastUpdatedText}` : `Offline (${lastUpdatedText})`}</span>
          </div>
        </div>

        {/* Floor Line Grounding Banner (Painted Line on Floor Guidance) */}
        <div className="px-5 py-2.5 bg-white border-b border-qc-border flex items-center justify-between gap-2 text-xs font-bold">
          <div className="flex items-center gap-2 text-qc-text">
            <span className="w-3 h-3 rounded-full bg-emerald-600 animate-pulse"></span>
            <span className="font-extrabold">{floorLineText}</span>
          </div>
          <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-qc-sage text-qc-primary">
            Floor Stripe
          </span>
        </div>

        {/* Signature Recovery Banner: Restrained Amber for Changed Information */}
        {isSuperseded && nextActionState.supersededNote && (
          <div className="bg-qc-amber/25 border-b border-qc-amber p-5">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-qc-amber text-qc-text flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                <RotateCcw size={20} />
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-qc-amber text-qc-text text-[11px] font-black uppercase tracking-wider">
                    {language === 'ta' ? 'முக்கிய அறிவிப்பு' : language === 'hi' ? 'महत्वपूर्ण सूचना' : 'What Has Changed'}
                  </span>
                  <span className="text-[11px] text-amber-900 font-medium">
                    {nextActionState.lastConfirmedDestination.confirmedBy || 'Staff Desk'}
                  </span>
                </div>

                <p className="text-base sm:text-lg font-black text-qc-text m-0 leading-snug">
                  {language === 'ta'
                    ? 'உங்கள் ஆலோசனை அறை மாற்றப்பட்டுள்ளது. கீழே உள்ள புதிய வழியைப் பின்பற்றவும்.'
                    : language === 'hi'
                    ? 'आपका कमरा बदल दिया गया है। कृपया नीचे दिए गए नए मार्ग का पालन करें।'
                    : 'Your consultation room has changed. Please follow the updated directions below.'}
                </p>

                {/* Superseded Room Diff Box */}
                <div className="p-3 bg-white rounded-2xl border border-qc-amber flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 line-through mr-2">
                      Room {nextActionState.supersededNote.previousRoom}
                    </span>
                    <span className="font-black text-qc-primary text-sm">
                      → Room {nextActionState.supersededNote.newRoom} (Floor {nextActionState.supersededNote.newFloor || 2})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSpeak}
                    className="px-3 py-1.5 rounded-xl bg-qc-primary text-qc-bg font-bold text-xs flex items-center gap-1.5 hover:bg-qc-primary/90 transition-colors focus:ring-2 focus:ring-qc-primary"
                  >
                    <Volume2 size={14} />
                    <span>{language === 'ta' ? 'மீண்டும் கேட்க' : language === 'hi' ? 'फिर सुनें' : 'Listen Again'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* The 3 Core Human Questions */}
        <div className="p-5 sm:p-6 space-y-4">
          {/* Question 1: Where am I in my confirmed hospital journey? */}
          <div className="flex items-start gap-3.5 bg-white p-4 rounded-2xl border border-qc-border">
            <div className="p-2.5 rounded-2xl bg-qc-sage/60 text-qc-primary flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
              <MapPin size={22} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-black uppercase text-qc-text/60 tracking-wider m-0">
                  {language === 'ta' ? '1. நான் இப்போது எங்கே இருக்கிறேன்?' : language === 'hi' ? '1. मैं अभी कहाँ हूँ?' : '1. Where am I in my visit?'}
                </p>
                <button
                  type="button"
                  onClick={() => setVisualAnchorOpen(true)}
                  className="text-xs font-black text-qc-primary hover:underline flex items-center gap-1"
                >
                  <Compass size={14} />
                  <span>{language === 'ta' ? 'இடத்தை மாற்ற' : 'Tap what you see'}</span>
                </button>
              </div>

              <p className="text-base sm:text-lg font-bold text-qc-text m-0 mt-0.5">
                {currentStepNodeId === 'ENTRANCE_G' 
                  ? (language === 'ta' ? 'மருத்துவமனை முதன்மை நுழைவாயில் (Ground Floor)' : language === 'hi' ? 'मुख्य अस्पताल प्रवेश द्वार (भू-तल)' : 'Main Hospital Entrance (Ground Floor)')
                  : currentStepNodeId === 'REG_COUNTER'
                  ? (language === 'ta' ? 'OPD பதிவு கவுண்டர் (Ground Floor)' : language === 'hi' ? 'ओपीडी पंजीकरण काउंटर (भू-तल)' : 'OPD Registration Counter (Ground Floor)')
                  : currentStepNodeId === 'ORTHO_WAITING_F1' || currentStepNodeId === 'WAITING_HALL_A'
                  ? (language === 'ta' ? 'தளம் 1 — காத்திருப்பு கூடம் ஏ' : language === 'hi' ? 'प्रथम तल — प्रतीक्षा कक्ष ए' : 'Floor 1 — Central Waiting Hall A')
                  : currentStepNodeId}
              </p>
              <p className="text-xs text-qc-text/70 m-0 mt-0.5">
                {currentStepNodeId === 'ENTRANCE_G' && '📍 Landmark: Wheelchair station & May I Help You desk'}
                {currentStepNodeId === 'REG_COUNTER' && '📍 Landmark: Opposite blue seats under Token Display 1'}
                {(currentStepNodeId === 'ORTHO_WAITING_F1' || currentStepNodeId === 'WAITING_HALL_A') && '📍 Landmark: Opposite water cooler and big TV token display'}
              </p>
            </div>
          </div>

          {/* Question 2: What should I do next? */}
          <div className="flex items-start gap-3.5 bg-qc-sage/30 p-4 sm:p-5 rounded-2xl border-2 border-qc-primary/40">
            <div className="p-3 rounded-2xl bg-qc-primary text-qc-bg flex items-center justify-center flex-shrink-0 shadow mt-0.5">
              <Navigation size={24} />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="text-[11px] font-black uppercase text-qc-primary tracking-wider m-0">
                  {language === 'ta' ? '2. அடுத்த நடவடிக்கை என்ன?' : language === 'hi' ? '2. मुझे आगे क्या करना चाहिए?' : '2. What should I do next?'}
                </p>
                <button
                  type="button"
                  onClick={handleSpeak}
                  className="tap-target-large px-3.5 py-1.5 rounded-xl bg-qc-primary hover:bg-qc-primary/90 text-qc-bg font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm focus:ring-2 focus:ring-qc-primary"
                >
                  <Volume2 size={16} />
                  <span>{language === 'ta' ? 'குரல் வழிகாட்டல்' : language === 'hi' ? 'आवाज़ सुनें' : 'Read Aloud'}</span>
                </button>
              </div>

              <p className="text-lg sm:text-xl font-black text-qc-text m-0 leading-snug">
                {nextActionText}
              </p>

              {/* Zero-Stairs Invariant Safety Badge */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-qc-border text-qc-primary text-xs font-bold">
                  <ShieldCheck size={14} className="text-qc-primary" />
                  <span>{language === 'ta' ? 'படிக்கட்டுகள் இல்லை (Step-Free)' : language === 'hi' ? 'सीढ़ियां रहित मार्ग' : 'Step-Free Verified (Zero-Stairs)'}</span>
                </span>
                <span className="text-xs text-qc-text/70 font-medium">
                  📍 {nextActionState.nextExpectedAction.visualLandmarkCue}
                </span>
              </div>
            </div>
          </div>

          {/* Quiet Seating Spot Recommendation (If wait > 20 mins) */}
          {estWaitMins > 20 && (
            <div className="p-3.5 rounded-2xl bg-white border-2 border-qc-border flex items-start gap-3">
              <TreePine size={22} className="text-qc-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-xs">
                <span className="font-black text-qc-primary uppercase tracking-wider block">
                  {t('quietSpots.title')}
                </span>
                <p className="text-qc-text m-0 mt-0.5 leading-relaxed font-medium">
                  {t('quietSpots.recommendation')}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons Row */}
          <div className="pt-2 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => advanceToCheckpoint('ORTHO_WAITING_F1')}
              className="flex-1 py-3.5 px-4 rounded-2xl bg-qc-primary hover:bg-qc-primary/90 text-qc-bg font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-transform active:scale-98 shadow focus:ring-2 focus:ring-qc-primary"
            >
              <Footprints size={18} />
              <span>{language === 'ta' ? 'காத்திருப்பு அறைக்கு வந்துவிட்டேன்' : language === 'hi' ? 'मैं प्रतीक्षा कक्ष में पहुँच गया हूँ' : 'I Reached Waiting Lounge'}</span>
              <ArrowRight size={16} />
            </button>

            {/* Share with Family Live Tracker */}
            <button
              type="button"
              onClick={() => setCaregiverModalOpen(true)}
              className="tap-target-large px-4 py-3.5 rounded-2xl bg-white hover:bg-qc-sage/30 text-qc-text border-2 border-qc-border font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors focus:ring-2 focus:ring-qc-primary"
            >
              <Share2 size={17} className="text-qc-primary" />
              <span>{t('caregiver.shareBtn')}</span>
            </button>

            {/* Hospital Map Button */}
            <button
              type="button"
              onClick={() => setMapModalOpen(true)}
              className="tap-target-large px-4 py-3.5 rounded-2xl bg-white hover:bg-qc-sage/30 text-qc-text border-2 border-qc-border font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors focus:ring-2 focus:ring-qc-primary"
            >
              <Map size={17} className="text-qc-primary" />
              <span>{language === 'ta' ? 'வரைபடம்' : 'Hospital Map'}</span>
            </button>

            {/* Help Card Button */}
            <button
              type="button"
              onClick={() => setHelpModalOpen(true)}
              className="tap-target-large px-4 py-3.5 rounded-2xl bg-qc-amber/30 hover:bg-qc-amber/50 text-qc-text border-2 border-qc-amber font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors focus:ring-2 focus:ring-qc-primary"
            >
              <LifeBuoy size={17} className="text-amber-900" />
              <span>{language === 'ta' ? 'உதவி அட்டை' : 'Help Card'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modals for Creative Innovations */}
      <CaregiverShareModal 
        isOpen={caregiverModalOpen} 
        onClose={() => setCaregiverModalOpen(false)} 
      />
      <VisualAnchorModal 
        isOpen={visualAnchorOpen} 
        onClose={() => setVisualAnchorOpen(false)} 
      />
      <HospitalMapModal 
        isOpen={mapModalOpen} 
        onClose={() => setMapModalOpen(false)} 
      />
    </>
  );
}
