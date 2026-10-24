import React, { useState } from 'react';
import { useJourney } from '../../context/JourneyContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useSocket } from '../../context/SocketContext';
import { speakText, stopSpeaking } from '../../utils/speech';
import { 
  MapPin, 
  ArrowDown, 
  ShieldCheck, 
  AlertTriangle, 
  Compass, 
  CornerDownRight, 
  Building,
  Volume2,
  Navigation,
  Check
} from 'lucide-react';

export default function RouteViewer() {
  const { activeRoute, activeSlip, advanceToCheckpoint, currentStepNodeId } = useJourney();
  const { language, t } = useAccessibility();
  const { serverState } = useSocket();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  if (!activeRoute || !activeRoute.instructions || activeRoute.instructions.length === 0) {
    return (
      <div className="bg-qc-amber/30 border-2 border-qc-amber p-5 rounded-2xl text-center text-qc-text">
        <AlertTriangle size={32} className="text-amber-800 mx-auto mb-2" />
        <p className="font-bold text-qc-text m-0">
          {t('routing.noAccessibleRoute')}
        </p>
      </div>
    );
  }

  const liftAStatus = serverState?.lifts?.['LIFT_A']?.status || 'OPERATIONAL';
  const destStep = activeRoute.instructions[activeRoute.instructions.length - 1];
  const destId = destStep?.nodeId || '';

  // Determine hospital floor colored line
  let floorLineText = t('floorLine.greenLine');
  let floorLineBg = 'bg-emerald-50 border-emerald-500 text-emerald-950';
  let floorLineBadge = 'bg-emerald-700 text-white';

  if (destId.includes('PHARMACY') || destId.includes('LAB')) {
    floorLineText = t('floorLine.yellowLine');
    floorLineBg = 'bg-amber-50 border-amber-500 text-amber-950';
    floorLineBadge = 'bg-amber-600 text-white';
  } else if (destId.includes('EMERGENCY')) {
    floorLineText = t('floorLine.redLine');
    floorLineBg = 'bg-red-50 border-red-500 text-red-950';
    floorLineBadge = 'bg-red-700 text-white';
  } else if (destId.includes('103') || destId.includes('PEDIATRIC')) {
    floorLineText = t('floorLine.blueLine');
    floorLineBg = 'bg-blue-50 border-blue-500 text-blue-950';
    floorLineBadge = 'bg-blue-700 text-white';
  }

  const handleSpeakFullRoute = () => {
    setIsPlayingAudio(true);
    const stepTexts = activeRoute.instructions.map((s, idx) => 
      `${idx + 1}. ${s.nodeName}. ${s.landmarkText || ''}`
    ).join('. ');
    const fullSpeech = `${floorLineText}. ${stepTexts}`;
    speakText(fullSpeech, language);
    setTimeout(() => setIsPlayingAudio(false), 8000);
  };

  const handleSpeakStep = (step, idx) => {
    const text = `${t('routing.floor')} ${step.floor}. ${step.nodeName}. ${step.landmarkText || ''}`;
    speakText(text, language);
  };

  return (
    <div className="bg-qc-bg text-qc-text rounded-3xl shadow-md border-2 border-qc-border p-5 space-y-4">
      {/* Route Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-qc-border pb-3">
        <div className="flex items-center gap-2">
          <Compass size={22} className="text-qc-primary" />
          <h3 className="text-lg font-black text-qc-text m-0">
            {t('routing.steps')}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSpeakFullRoute}
            className="tap-target-large px-3 py-1.5 rounded-full bg-qc-primary text-qc-bg hover:bg-[#123C36] text-xs font-bold flex items-center gap-1.5 shadow-sm"
            title="Listen to full route aloud"
          >
            <Volume2 size={14} />
            <span>{language === 'ta' ? 'குரல் வழிகாட்டி' : 'Listen Route'}</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs font-bold bg-qc-sage text-qc-primary px-3 py-1 rounded-full border border-qc-primary/20">
            <ShieldCheck size={14} />
            <span>{language === 'ta' ? 'படிக்கட்டுகள் இல்லாத பாதை' : '100% Step-Free'}</span>
          </div>
        </div>
      </div>

      {/* Physical Floor Line Guidance Banner */}
      <div className={`p-4 rounded-2xl border-2 flex items-center justify-between gap-3 shadow-sm ${floorLineBg}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0 text-base">
            🧭
          </div>
          <div>
            <span className="text-[10px] uppercase font-black tracking-wider block opacity-80">
              Hospital Floor Navigation Cue
            </span>
            <p className="text-xs sm:text-sm font-black m-0 leading-tight">
              {floorLineText}
            </p>
          </div>
        </div>
        <span className={`text-[11px] font-black uppercase px-2.5 py-1 rounded-lg flex-shrink-0 ${floorLineBadge}`}>
          Active
        </span>
      </div>

      {/* Transit Advisory Note */}
      {liftAStatus === 'OUT_OF_SERVICE' ? (
        <div className="bg-qc-amber/30 text-qc-text p-3 rounded-2xl border border-qc-amber flex items-center gap-2 text-xs font-bold">
          <AlertTriangle size={18} className="text-amber-800 flex-shrink-0" />
          <span>{t('routing.liftBroken')} — {t('routing.fallbackRamp')}</span>
        </div>
      ) : (
        <div className="bg-white text-qc-text p-3 rounded-2xl border border-qc-border flex items-center justify-between text-xs font-semibold">
          <span>{t('routing.distance')}: ~{activeRoute.totalDistance} {t('routing.meters')}</span>
          <span className="text-qc-primary font-bold">✓ {t('routing.liftAvailable')}</span>
        </div>
      )}

      {/* Step-by-Step Landmark Path List */}
      <div className="relative pl-6 space-y-4 border-l-2 border-qc-primary/30 my-2">
        {activeRoute.instructions.map((step, idx) => {
          const isCurrent = step.nodeId === currentStepNodeId || (idx === 0 && !currentStepNodeId);
          const isDestination = idx === activeRoute.instructions.length - 1;

          return (
            <div key={step.nodeId} className="relative">
              {/* Dot Icon on Path Line */}
              <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white shadow ${
                isDestination 
                  ? 'bg-qc-emergency ring-4 ring-qc-emergency/30 animate-beacon' 
                  : isCurrent 
                  ? 'bg-qc-primary ring-2 ring-qc-sage' 
                  : 'bg-qc-text/40'
              }`}></div>

              {/* Node Details Card */}
              <div className={`p-4 rounded-2xl border transition-all ${
                isDestination 
                  ? 'bg-red-50/80 border-red-300 shadow-sm' 
                  : isCurrent 
                  ? 'bg-qc-sage/35 border-qc-primary/50 ring-2 ring-qc-primary/10' 
                  : 'bg-white border-qc-border'
              }`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold uppercase text-qc-text/70">
                      {t('routing.floor')} {step.floor}
                    </span>
                    {isCurrent && (
                      <span className="text-[11px] font-black bg-qc-primary text-white px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Check size={12} />
                        <span>{language === 'ta' ? 'நீங்கள் இங்கே உள்ளீர்கள்' : 'You Are Here'}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Speak Step Audio */}
                    <button
                      type="button"
                      onClick={() => handleSpeakStep(step, idx)}
                      className="p-1.5 rounded-lg text-qc-text/60 hover:text-qc-primary hover:bg-qc-sage/40 transition-colors"
                      title="Speak step"
                    >
                      <Volume2 size={15} />
                    </button>

                    {isDestination && (
                      <span className="text-xs font-black bg-qc-emergency text-white px-2.5 py-0.5 rounded-md">
                        {language === 'ta' ? 'இலக்கு' : 'Destination'}
                      </span>
                    )}
                  </div>
                </div>

                <p className="font-extrabold text-qc-text text-base m-0 mt-1">
                  {step.nodeName}
                </p>

                {step.landmarkText && (
                  <p className="text-xs font-bold text-qc-primary m-0 mt-1.5 flex items-start gap-1">
                    <CornerDownRight size={14} className="mt-0.5 flex-shrink-0" />
                    <span>{step.landmarkText}</span>
                  </p>
                )}

                {/* Recalibrate / "I Am Here" Button */}
                {!isCurrent && (
                  <div className="pt-2 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        advanceToCheckpoint(step.nodeId);
                        speakText(
                          language === 'ta'
                            ? `நீங்கள் ${step.nodeName}-ல் இருப்பதாக புதுப்பிக்கப்பட்டது`
                            : `Updated: You are now at ${step.nodeName}`,
                          language
                        );
                      }}
                      className="text-[11px] font-bold text-qc-primary hover:underline inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-qc-border shadow-2xs"
                    >
                      <Navigation size={12} />
                      <span>{language === 'ta' ? 'நான் இப்போது இங்கே நிற்கிறேன்' : 'Set as current location'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
