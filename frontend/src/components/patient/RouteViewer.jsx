import React from 'react';
import { useJourney } from '../../context/JourneyContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useSocket } from '../../context/SocketContext';
import { 
  MapPin, 
  ArrowDown, 
  ShieldCheck, 
  AlertTriangle, 
  Compass, 
  CornerDownRight, 
  Building
} from 'lucide-react';

export default function RouteViewer() {
  const { activeRoute, activeSlip } = useJourney();
  const { language, t } = useAccessibility();
  const { serverState } = useSocket();

  if (!activeRoute || !activeRoute.instructions) {
    return (
      <div className="bg-amber-50 border-2 border-amber-300 p-5 rounded-2xl text-center">
        <AlertTriangle size={32} className="text-amber-600 mx-auto mb-2" />
        <p className="font-bold text-amber-950 m-0">
          {t('routing.noAccessibleRoute')}
        </p>
      </div>
    );
  }

  const liftAStatus = serverState?.lifts?.['LIFT_A']?.status || 'OPERATIONAL';

  return (
    <div className="bg-white rounded-2xl shadow-md border-2 border-slate-200 p-5 space-y-4">
      {/* Route Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <Compass size={22} className="text-emerald-700" />
          <h3 className="text-lg font-black text-slate-900 m-0">
            {t('routing.steps')}
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-full">
          <ShieldCheck size={14} />
          <span>{language === 'ta' ? 'படிக்கட்டுகள் இல்லாத பாதை' : '100% Stair-Free Path'}</span>
        </div>
      </div>

      {/* Transit Advisory Note */}
      {liftAStatus === 'OUT_OF_SERVICE' ? (
        <div className="bg-amber-100 text-amber-950 p-3 rounded-xl border border-amber-300 flex items-center gap-2 text-xs font-bold">
          <AlertTriangle size={18} className="text-amber-700 flex-shrink-0" />
          <span>{t('routing.liftBroken')} — {t('routing.fallbackRamp')}</span>
        </div>
      ) : (
        <div className="bg-slate-50 text-slate-700 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-semibold">
          <span>{t('routing.distance')}: ~{activeRoute.totalDistance} {t('routing.meters')}</span>
          <span className="text-emerald-700 font-bold">✓ {t('routing.liftAvailable')}</span>
        </div>
      )}

      {/* Step-by-Step Landmark Path List */}
      <div className="relative pl-6 space-y-4 border-l-2 border-emerald-300 my-2">
        {activeRoute.instructions.map((step, idx) => {
          const isCurrent = idx === 0;
          const isDestination = idx === activeRoute.instructions.length - 1;

          return (
            <div key={step.nodeId} className="relative">
              {/* Dot Icon on Path Line */}
              <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white shadow ${
                isDestination 
                  ? 'bg-red-600 ring-4 ring-red-200 animate-beacon' 
                  : isCurrent 
                  ? 'bg-emerald-600 ring-2 ring-emerald-200' 
                  : 'bg-slate-400'
              }`}></div>

              {/* Node Details */}
              <div className={`p-3 rounded-xl border transition-all ${
                isDestination 
                  ? 'bg-red-50/70 border-red-300 shadow-sm' 
                  : isCurrent 
                  ? 'bg-emerald-50 border-emerald-300' 
                  : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold uppercase text-slate-500">
                    {t('routing.floor')} {step.floor}
                  </span>
                  {isDestination && (
                    <span className="text-xs font-black bg-red-600 text-white px-2 py-0.5 rounded">
                      {language === 'ta' ? 'இலக்கு' : 'Destination'}
                    </span>
                  )}
                </div>

                <p className="font-extrabold text-slate-900 text-base m-0 mt-0.5">
                  {step.nodeName}
                </p>

                {step.landmarkText && (
                  <p className="text-xs font-bold text-emerald-800 m-0 mt-1 flex items-start gap-1">
                    <CornerDownRight size={13} className="mt-0.5 flex-shrink-0" />
                    <span>{step.landmarkText}</span>
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
