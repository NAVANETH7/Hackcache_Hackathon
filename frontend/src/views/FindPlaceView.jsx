import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';
import { useSocket } from '../context/SocketContext';
import { useJourney } from '../context/JourneyContext';
import { hospitalData } from '../data/hospital';
import { calculateRoute } from '../navigation/router';
import { speakText, stopSpeaking } from '../utils/speech';
import FloorPlanSVG from '../components/patient/FloorPlanSVG';
import { 
  Search, 
  MapPin, 
  Compass, 
  Volume2, 
  AlertTriangle, 
  CornerDownRight, 
  ShieldCheck, 
  HelpCircle, 
  ArrowRight,
  Filter
} from 'lucide-react';

export default function FindPlaceView() {
  const { language, avoidStairsDefault, t } = useAccessibility();
  const { serverState } = useSocket();
  const { setHelpModalOpen } = useJourney();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFloorTab, setSelectedFloorTab] = useState(1);
  const [startNodeId, setStartNodeId] = useState('ENTRANCE_G');
  const [targetNodeId, setTargetNodeId] = useState('OPD_ROOM_5');
  const [avoidStairs, setAvoidStairs] = useState(avoidStairsDefault);
  const [routeResult, setRouteResult] = useState(null);

  // Recalculate route whenever start, target, avoidStairs, or lifts status change
  useEffect(() => {
    const lifts = serverState?.lifts || {};
    const res = calculateRoute(hospitalData, startNodeId, targetNodeId, {
      avoidStairs,
      liftsState: lifts,
      language
    });
    setRouteResult(res);

    // Auto-switch floor viewer to target floor
    const targetNode = hospitalData.nodes.find(n => n.id === targetNodeId);
    if (targetNode) {
      setSelectedFloorTab(targetNode.floor);
    }
  }, [startNodeId, targetNodeId, avoidStairs, serverState?.lifts, language]);

  // Read all directions aloud
  const handleListenDirections = () => {
    if (!routeResult || !routeResult.instructions) return;
    const allText = routeResult.instructions
      .map((s, idx) => `Step ${idx + 1}: ${s.directionalCue}. ${s.landmarkText || ''}`)
      .join('. ');
    speakText(allText, language);
  };

  // Filter destination places based on search query
  const searchableNodes = hospitalData.nodes.filter(n => {
    if (n.type === 'transit' || n.id.includes('STAIRS')) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = n.name.toLowerCase().includes(q) || 
                      (n.name_hi && n.name_hi.toLowerCase().includes(q)) || 
                      (n.name_ta && n.name_ta.toLowerCase().includes(q));
    const landmarkMatch = (n.landmark && n.landmark.toLowerCase().includes(q)) ||
                          (n.landmark_hi && n.landmark_hi.toLowerCase().includes(q)) ||
                          (n.landmark_ta && n.landmark_ta.toLowerCase().includes(q));
    return nameMatch || landmarkMatch;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 m-0 flex items-center gap-2">
              <Compass size={28} className="text-emerald-700" />
              <span>{t('findPlace.title')}</span>
            </h1>
            <p className="text-xs text-slate-500 font-semibold m-0 mt-1">
              Interactive 3-floor navigation with physical landmarks & step-free paths.
            </p>
          </div>

          {/* Quick Action: I'm Lost Button */}
          <button
            type="button"
            onClick={() => {
              setTargetNodeId('HELP_DESK_G');
              setHelpModalOpen(true);
            }}
            className="tap-target-large px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow"
          >
            <HelpCircle size={17} />
            <span>{t('findPlace.imLost')}</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative mb-4">
          <Search size={22} className="absolute left-4 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('findPlace.searchPlaceholder')}
            className="w-full tap-target-large pl-12 pr-4 py-3.5 rounded-2xl border-2 border-slate-300 focus:border-emerald-600 font-bold text-slate-900 outline-none text-base"
          />
        </div>

        {/* Avoid Stairs Switch & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200">
          <label 
            onClick={() => setAvoidStairs(!avoidStairs)}
            className="flex items-center gap-2.5 cursor-pointer select-none text-xs font-black text-slate-800"
          >
            <input
              type="checkbox"
              checked={avoidStairs}
              onChange={() => {}}
              className="w-5 h-5 text-emerald-600 rounded"
            />
            <span>{t('findPlace.avoidStairs')}</span>
          </label>

          {routeResult?.success && (
            <button
              type="button"
              onClick={handleListenDirections}
              className="tap-target-large px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow"
            >
              <Volume2 size={16} />
              <span>{t('findPlace.listenRoute')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Destination Quick Pick Chips */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-2">
        <p className="text-xs font-black uppercase text-slate-500 tracking-wider m-0">
          {t('findPlace.pickDestination')}
        </p>
        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
          {searchableNodes.map(node => {
            const isSelected = targetNodeId === node.id;
            const nodeName = language === 'ta' ? node.name_ta || node.name : language === 'hi' ? node.name_hi || node.name : node.name;

            return (
              <button
                key={node.id}
                type="button"
                onClick={() => setTargetNodeId(node.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  isSelected
                    ? 'bg-emerald-700 text-white border-emerald-800 shadow ring-2 ring-emerald-400'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                }`}
              >
                {nodeName} (F{node.floor})
              </button>
            );
          })}
        </div>
      </div>

      {/* Floor Tab Switcher */}
      <div className="flex items-center justify-center gap-2">
        {[0, 1, 2].map(fl => (
          <button
            key={fl}
            type="button"
            onClick={() => setSelectedFloorTab(fl)}
            className={`tap-target-large px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all ${
              selectedFloorTab === fl
                ? 'bg-slate-900 text-white shadow-lg ring-2 ring-emerald-500'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
            }`}
          >
            {fl === 0 ? t('findPlace.floor0') : fl === 1 ? t('findPlace.floor1') : t('findPlace.floor2')}
          </button>
        ))}
      </div>

      {/* Interactive SVG Floor Plan */}
      <FloorPlanSVG 
        floor={selectedFloorTab} 
        activeRoute={routeResult?.success ? routeResult : null}
        targetNodeId={targetNodeId}
      />

      {/* Step-by-Step Directions with Physical Landmarks */}
      <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="text-lg font-black text-slate-900 m-0 flex items-center gap-2">
            <MapPin size={22} className="text-emerald-700" />
            <span>{t('routing.steps')}</span>
          </h3>
          {routeResult?.success && (
            <span className="text-xs font-black text-slate-500">
              ~{routeResult.totalDistance} {t('routing.meters')} • {routeResult.stepCount} steps
            </span>
          )}
        </div>

        {routeResult?.success ? (
          <div className="space-y-3 relative pl-4 border-l-2 border-emerald-400 my-2">
            {routeResult.instructions.map((step, idx) => {
              const isTarget = idx === routeResult.instructions.length - 1;
              const isStart = idx === 0;

              return (
                <div key={step.nodeId} className="relative pl-3">
                  <div className={`absolute -left-[23px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                    isTarget ? 'bg-red-600 ring-2 ring-red-300' : isStart ? 'bg-emerald-600' : 'bg-amber-400'
                  }`}></div>

                  <div className={`p-3.5 rounded-xl border ${
                    isTarget 
                      ? 'bg-red-50/80 border-red-300' 
                      : isStart 
                      ? 'bg-emerald-50 border-emerald-300' 
                      : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-0.5">
                      <span>Step {idx + 1} • Floor {step.floor}</span>
                      {isTarget && (
                        <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded">
                          DESTINATION
                        </span>
                      )}
                    </div>
                    <p className="text-base font-extrabold text-slate-900 m-0 leading-snug">
                      {step.directionalCue}
                    </p>
                    {step.landmarkText && (
                      <p className="text-xs font-bold text-emerald-800 m-0 mt-1 flex items-start gap-1">
                        <CornerDownRight size={14} className="mt-0.5 flex-shrink-0" />
                        <span>📍 Landmark: {step.landmarkText}</span>
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 bg-amber-50 text-amber-950 rounded-2xl border border-amber-300 text-center space-y-2">
            <AlertTriangle size={32} className="text-amber-600 mx-auto" />
            <p className="font-extrabold m-0 text-sm">
              {t('routing.noAccessibleRoute')}
            </p>
            <button
              onClick={() => setHelpModalOpen(true)}
              className="tap-target-large px-4 py-2 bg-amber-500 font-black text-xs rounded-xl text-slate-950"
            >
              Open Staff Help Card
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
