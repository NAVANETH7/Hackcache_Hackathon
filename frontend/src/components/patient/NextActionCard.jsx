import React from 'react';
import { useJourney } from '../../context/JourneyContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { speakText } from '../../utils/speech';
import { 
  Navigation, 
  MapPin, 
  HelpCircle, 
  Volume2, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

export default function NextActionCard() {
  const { 
    nextActionState, 
    activeSlip, 
    currentStepNodeId, 
    advanceToCheckpoint 
  } = useJourney();
  const { language, t } = useAccessibility();

  if (!activeSlip) return null;

  const isSuperseded = nextActionState.instructionFreshness === 'SUPERSEDED';
  const isDisrupted = nextActionState.instructionFreshness === 'DISRUPTED';

  const nextActionText = 
    nextActionState.nextExpectedAction.localizedText[language] ||
    nextActionState.nextExpectedAction.localizedText['ta'] ||
    nextActionState.nextExpectedAction.localizedText['en'];

  const handleSpeak = () => {
    speakText(nextActionText, language);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 overflow-hidden">
      {/* Status Header Badge */}
      <div className={`px-4 py-2.5 flex items-center justify-between text-sm font-black ${
        isSuperseded 
          ? 'bg-amber-500 text-slate-950 animate-pulse' 
          : isDisrupted
          ? 'bg-red-600 text-white'
          : 'bg-emerald-600 text-white'
      }`}>
        <div className="flex items-center gap-2">
          {isSuperseded ? (
            <AlertTriangle size={18} />
          ) : isDisrupted ? (
            <AlertTriangle size={18} />
          ) : (
            <CheckCircle2 size={18} />
          )}
          <span>
            {isSuperseded 
              ? t('journey.statusSuperseded') 
              : isDisrupted 
              ? t('journey.statusDisrupted') 
              : t('journey.statusCurrent')}
          </span>
        </div>
        <span className="text-xs opacity-90">
          {nextActionState.lastConfirmedDestination.confirmedBy}
        </span>
      </div>

      {/* Superseded Change Alert Banner */}
      {isSuperseded && nextActionState.supersededNote && (
        <div className="bg-amber-50 border-b-2 border-amber-300 p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-200 text-amber-900 mt-0.5">
              <RotateCcw size={20} />
            </div>
            <div>
              <p className="text-xs uppercase font-black text-amber-900 tracking-wider m-0">
                {t('journey.whatChanged')}
              </p>
              <p className="text-base font-bold text-slate-900 m-0 mt-0.5">
                {language === 'ta'
                  ? `டாக்டர் வர்மா அறை ${nextActionState.supersededNote.previousRoom}-ல் இருந்து அறை ${nextActionState.supersededNote.newRoom}-க்கு மாற்றப்பட்டுள்ளார்.`
                  : language === 'hi'
                  ? `डॉ. वर्मा कमरा ${nextActionState.supersededNote.previousRoom} से कमरा ${nextActionState.supersededNote.newRoom} में चले गए हैं।`
                  : `Dr. Verma relocated from Room ${nextActionState.supersededNote.previousRoom} to Room ${nextActionState.supersededNote.newRoom}.`}
              </p>
              <p className="text-xs text-slate-600 m-0 mt-1">
                {t('journey.supersededExplanation')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* The Core 3 Questions Grid */}
      <div className="p-5 space-y-4">
        {/* Question 1: Where am I? */}
        <div className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
            <MapPin size={22} />
          </div>
          <div>
            <p className="text-xs font-black uppercase text-slate-500 tracking-wider m-0">
              {t('journey.whereAmI')}
            </p>
            <p className="text-lg font-bold text-slate-900 m-0">
              {currentStepNodeId === 'ENTRANCE_G' 
                ? (language === 'ta' ? 'மருத்துவமனை முதன்மை நுழைவாயில்' : 'Main Hospital Entrance')
                : currentStepNodeId === 'REG_COUNTER'
                ? (language === 'ta' ? 'OPD பதிவு கவுண்டர்' : 'OPD Registration Desk')
                : currentStepNodeId === 'ORTHO_WAITING_F1'
                ? (language === 'ta' ? 'தளம் 1 — காத்திருப்பு பகுதி' : 'Floor 1 — Ortho Waiting Lounge')
                : currentStepNodeId}
            </p>
          </div>
        </div>

        {/* Question 2: What should I do next? */}
        <div className="flex items-start gap-3 bg-emerald-50/80 p-4 rounded-xl border-2 border-emerald-300">
          <div className="p-2.5 rounded-xl bg-emerald-600 text-white mt-0.5 shadow">
            <Navigation size={24} className="animate-bounce-gentle" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-black uppercase text-emerald-900 tracking-wider m-0">
                {t('journey.whatNext')}
              </p>
              <button
                onClick={handleSpeak}
                className="tap-target-large px-3 py-1 rounded-lg bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-800 transition-colors shadow-sm"
              >
                <Volume2 size={16} />
                <span>{t('journey.listenAudio')}</span>
              </button>
            </div>
            <p className="text-lg md:text-xl font-black text-slate-950 m-0 mt-1 leading-snug">
              {nextActionText}
            </p>
            <p className="text-xs font-semibold text-emerald-800 m-0 mt-1">
              📍 {nextActionState.nextExpectedAction.visualLandmarkCue}
            </p>
          </div>
        </div>

        {/* Quick Checkpoint Action */}
        <div className="pt-2 flex flex-wrap gap-2">
          <button
            onClick={() => advanceToCheckpoint('ORTHO_WAITING_F1')}
            className="tap-target-large flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2 transition-transform active:scale-95 shadow"
          >
            <span>{language === 'ta' ? 'காத்திருப்பு அறைக்கு வந்துவிட்டேன்' : 'Reached Waiting Lounge'}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
