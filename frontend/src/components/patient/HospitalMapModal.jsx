import React, { useState } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useJourney } from '../../context/JourneyContext';
import FloorPlanSVG from './FloorPlanSVG';
import { 
  X, 
  Map, 
  Compass, 
  Layers, 
  ShieldCheck, 
  Footprints, 
  Heart,
  Volume2
} from 'lucide-react';
import { speakText } from '../../utils/speech';

export default function HospitalMapModal({ isOpen, onClose }) {
  const { language, t } = useAccessibility();
  const { activeRoute, activeSlip } = useJourney();

  // Active Floor Tab: 0 (Ground), 1 (First), 2 (Second)
  const [selectedFloor, setSelectedFloor] = useState(() => activeSlip?.assignedFloor || 0);

  if (!isOpen) return null;

  const handleSpeakLegend = () => {
    const text = language === 'ta'
      ? "மருத்துவமனை தரை வண்ணக் கோடுகள்: ஓபிடிக்கு பச்சை நிறக் கோடு, இலவச மருந்தகம் மற்றும் ஆய்வகத்திற்கு மஞ்சள் நிறக் கோடு, அவசர சிகிச்சைக்கு சிவப்பு நிறக் கோடு, தாய்-சேய் பிரிவுக்கு நீல நிறக் கோடு. படிக்கட்டுகள் ஏறாமல் செல்ல லிஃப்ட் ஏ-வை பயன்படுத்தவும்."
      : language === 'hi'
      ? "अस्पताल फर्श की रंगीन रेखाएं: ओपीडी के लिए हरी रेखा, दवा और लैब के लिए पीली रेखा, इमरजेंसी के लिए लाल रेखा, बाल विभाग के लिए नीली रेखा। लिफ्ट ए का उपयोग करें।"
      : "Hospital floor line guide: Green line leads to OPD rooms and lifts. Yellow line leads to Pharmacy and Lab. Red line leads to Emergency. Blue line leads to Pediatrics. Take Lift A for zero stairs.";
    speakText(text, language);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-qc-text/75 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-qc-bg rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl border-2 border-qc-border max-h-[92vh] overflow-y-auto space-y-5">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-qc-border pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-qc-primary text-qc-bg flex items-center justify-center flex-shrink-0 shadow-sm">
              <Map size={24} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-qc-text m-0">
                {language === 'ta' ? 'மருத்துவமனை 3-தள வரைபடம்' : 'Hospital 3-Floor Interactive Map'}
              </h2>
              <p className="text-xs text-qc-text/70 font-semibold m-0 mt-0.5">
                City District Headquarters Hospital • Zero-Stairs Dijkstra Network
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSpeakLegend}
              className="p-2 rounded-xl text-qc-primary hover:bg-qc-sage transition-colors"
              title="Listen to Floor Legend"
            >
              <Volume2 size={20} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-qc-text/60 hover:text-qc-text hover:bg-qc-sage/30 transition-colors"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Floor Selection Tabs */}
        <div className="grid grid-cols-3 gap-2 bg-qc-sage/30 p-1.5 rounded-2xl border border-qc-border">
          <button
            type="button"
            onClick={() => setSelectedFloor(0)}
            className={`tap-target-large py-2.5 rounded-xl text-xs font-black transition-all ${
              selectedFloor === 0
                ? 'bg-qc-primary text-white shadow-sm'
                : 'text-qc-text hover:bg-white/60'
            }`}
          >
            {language === 'ta' ? 'தரை தளம் (Ground)' : 'Ground Floor (0)'}
          </button>

          <button
            type="button"
            onClick={() => setSelectedFloor(1)}
            className={`tap-target-large py-2.5 rounded-xl text-xs font-black transition-all ${
              selectedFloor === 1
                ? 'bg-qc-primary text-white shadow-sm'
                : 'text-qc-text hover:bg-white/60'
            }`}
          >
            {language === 'ta' ? 'முதல் தளம் (OPD)' : 'Floor 1 (OPD 1-8)'}
          </button>

          <button
            type="button"
            onClick={() => setSelectedFloor(2)}
            className={`tap-target-large py-2.5 rounded-xl text-xs font-black transition-all ${
              selectedFloor === 2
                ? 'bg-qc-primary text-white shadow-sm'
                : 'text-qc-text hover:bg-white/60'
            }`}
          >
            {language === 'ta' ? '2-ஆம் தளம் (Wards)' : 'Floor 2 (Wards)'}
          </button>
        </div>

        {/* SVG Floor Map Component */}
        <div className="rounded-2xl overflow-hidden border-2 border-qc-border shadow-inner">
          <FloorPlanSVG floor={selectedFloor} activeRoute={activeRoute} />
        </div>

        {/* Physical Floor Line Color Legend */}
        <div className="bg-white p-4 rounded-2xl border border-qc-border space-y-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-qc-text m-0">
            {language === 'ta' ? 'மருத்துவமனை தரை வண்ணக் கோடுகள் வழிகாட்டி' : 'Follow the Painted Floor Stripe Guide:'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold">
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 flex-shrink-0"></span>
              <span>{t('floorLine.greenLine')}</span>
            </div>
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-amber-500 flex-shrink-0"></span>
              <span>{t('floorLine.yellowLine')}</span>
            </div>
            <div className="p-2 rounded-xl bg-red-50 border border-red-300 text-red-950 flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-red-600 flex-shrink-0"></span>
              <span>{t('floorLine.redLine')}</span>
            </div>
            <div className="p-2 rounded-xl bg-blue-50 border border-blue-300 text-blue-950 flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-blue-600 flex-shrink-0"></span>
              <span>{t('floorLine.blueLine')}</span>
            </div>
          </div>
        </div>

        {/* Accessibility & Safety Guarantee */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-qc-text/70 pt-1">
          <div className="flex items-center gap-2 font-bold text-qc-primary">
            <ShieldCheck size={16} />
            <span>Strict Zero-Stairs Guarantee: Elevator Lift A & Ramps always prioritized.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="tap-target-large px-5 py-2.5 rounded-xl bg-qc-primary text-white font-black text-xs hover:bg-[#123C36] transition-colors"
          >
            Close Map
          </button>
        </div>
      </div>
    </div>
  );
}
