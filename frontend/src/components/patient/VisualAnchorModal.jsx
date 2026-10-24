import React, { useState } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useJourney } from '../../context/JourneyContext';
import { speakText } from '../../utils/speech';
import { playChime } from '../../context/SocketContext';
import { 
  Compass, 
  X, 
  MapPin, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  HelpCircle,
  Building,
  GlassWater
} from 'lucide-react';

export default function VisualAnchorModal({ isOpen, onClose }) {
  const { language, t } = useAccessibility();
  const { advanceToCheckpoint, activeSlip } = useJourney();
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  if (!isOpen) return null;

  // Recognizable physical landmarks across the 3 hospital floors
  const landmarks = [
    {
      id: 'HELP_DESK_G',
      icon: '🟡',
      name_en: 'Yellow "May I Help You" Desk',
      name_hi: 'पीला सहायता केंद्र (Help Desk)',
      name_ta: 'மஞ்சள் உதவி மையம் (Help Desk)',
      floor: 0,
      cue_en: 'Ground Floor, opposite the blue chairs',
      cue_hi: 'भू-तल, नीली कुर्सियों के सामने',
      cue_ta: 'தரை தளம், நீல நாற்காலிகளுக்கு எதிரே'
    },
    {
      id: 'WATER_G',
      icon: '🚰',
      name_en: 'Drinking Water Dispenser',
      name_hi: 'पीने के पानी का कूलर (Water Cooler)',
      name_ta: 'குடிநீர் மையம் (Water Dispenser)',
      floor: 0,
      cue_en: 'Stainless steel dispenser near Pharmacy',
      cue_hi: 'दवा केंद्र के पास स्टेनलेस स्टील वाटर कूलर',
      cue_ta: 'மருந்தகத்தின் அருகில் எஃகு குடிநீர் வழங்கி'
    },
    {
      id: 'LIFT_A_F0',
      icon: '🛗',
      name_en: 'Lift Block A (Elevator)',
      name_hi: 'लिफ्ट ब्लॉक ए (Lift Block A)',
      name_ta: 'லிஃப்ட் பிளாக் ஏ (Lift A)',
      floor: 0,
      cue_en: 'Elevator doors near Registration',
      cue_hi: 'पंजीकरण के पास लिफ्ट के दरवाजे',
      cue_ta: 'பதிவு கவுண்டர் அருகில் உள்ள லிஃப்ட்'
    },
    {
      id: 'PHARMACY_G',
      icon: '💊',
      name_en: 'Central Pharmacy Windows',
      name_hi: 'केंद्रीय दवा वितरण खिड़की (Pharmacy)',
      name_ta: 'மத்திய இலவச மருந்தகம் (Pharmacy)',
      floor: 0,
      cue_en: 'Counters 1-3 with green signboard',
      cue_hi: 'हरे बोर्ड वाले काउंटर 1 से 3',
      cue_ta: 'பச்சை பலகை கொண்ட கவுண்டர்கள் 1 முதல் 3'
    },
    {
      id: 'WAITING_HALL_A',
      icon: '🛋️',
      name_en: 'Waiting Hall A Blue Chairs',
      name_hi: 'प्रतीक्षा कक्ष की नीली कुर्सियां (Floor 1)',
      name_ta: 'முதல் தள காத்திருப்பு மண்டப நாற்காலிகள்',
      floor: 1,
      cue_en: 'Floor 1, outside Orthopedics & ENT',
      cue_hi: 'प्रथम तल, हड्डी एवं ईएनटी विभाग के बाहर',
      cue_ta: 'முதல் தளம், எலும்பு மற்றும் கண் மருத்துவர் அறை அருகில்'
    },
    {
      id: 'ENTRANCE_G',
      icon: '🚪',
      name_en: 'Main Entrance Security Gate',
      name_hi: 'मुख्य प्रवेश द्वार (Main Entrance)',
      name_ta: 'மருத்துவமனை முதன்மை நுழைவு வாயில்',
      floor: 0,
      cue_en: 'Hospital front gate & wheelchair post',
      cue_hi: 'अस्पताल का मुख्य गेट एवं व्हीलचेयर स्टैंड',
      cue_ta: 'முதன்மை வாயில் மற்றும் சக்கர நாற்காலி மையம்'
    }
  ];

  const handleSelectLandmark = (nodeId, name) => {
    setSelectedNodeId(nodeId);
    advanceToCheckpoint(nodeId);
    setConfirmed(true);
    playChime('alert3');

    const spokenText = language === 'ta'
      ? `புதிய தொடக்க இடம்: ${name}. உங்களின் இலக்கிற்கு புதிய படிக்கட்டுகள் இல்லாத பாதை கணக்கிடப்பட்டுள்ளது.`
      : language === 'hi'
      ? `नया प्रारंभिक स्थान: ${name}। आपके गंतव्य के लिए नया सुगम्य रास्ता तैयार किया गया है।`
      : `Location updated to: ${name}. Updated step-free route calculated to your destination.`;

    speakText(spokenText, language);

    setTimeout(() => {
      setConfirmed(false);
      onClose();
    }, 1800);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-qc-text/80 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="visual-anchor-title"
    >
      <div className="bg-qc-bg text-qc-text rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-4 border-qc-text relative max-h-[92vh] overflow-y-auto space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 tap-target-large p-2.5 rounded-full bg-qc-sage/60 text-qc-primary hover:bg-qc-sage transition-colors focus:ring-2 focus:ring-qc-primary"
          aria-label="Close"
        >
          <X size={22} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-qc-border pb-3">
          <div className="p-3 rounded-2xl bg-qc-primary text-qc-bg shadow-sm">
            <Compass size={26} className="text-qc-amber" />
          </div>
          <div>
            <h2 id="visual-anchor-title" className="text-xl sm:text-2xl font-black text-qc-text m-0">
              {t('visualAnchor.title')}
            </h2>
            <p className="text-xs text-qc-text/70 font-semibold m-0 mt-0.5">
              {t('visualAnchor.subtitle')}
            </p>
          </div>
        </div>

        {/* Success Confirmation Toast */}
        {confirmed && (
          <div className="p-4 bg-qc-sage text-qc-primary rounded-2xl border-2 border-qc-primary font-black text-sm flex items-center gap-2 animate-bounce-gentle">
            <CheckCircle2 size={22} className="text-qc-primary flex-shrink-0" />
            <span>{t('visualAnchor.recalculated')}</span>
          </div>
        )}

        {/* Visual Landmark Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {landmarks.map((l) => {
            const landmarkName = language === 'ta' ? l.name_ta : language === 'hi' ? l.name_hi : l.name_en;
            const landmarkCue = language === 'ta' ? l.cue_ta : language === 'hi' ? l.cue_hi : l.cue_en;
            const isSelected = selectedNodeId === l.id;

            return (
              <div
                key={l.id}
                onClick={() => handleSelectLandmark(l.id, landmarkName)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-2 select-none tap-target-large ${
                  isSelected
                    ? 'border-qc-primary bg-qc-sage/60 shadow-md ring-2 ring-qc-primary'
                    : 'border-qc-border bg-white hover:border-qc-primary/50 hover:bg-qc-sage/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl flex-shrink-0">{l.icon}</span>
                  <div>
                    <h4 className="text-sm font-black text-qc-text m-0 leading-tight">
                      {landmarkName}
                    </h4>
                    <span className="text-[10px] font-bold uppercase text-qc-primary bg-qc-sage/80 px-2 py-0.5 rounded-full inline-block mt-1">
                      Floor {l.floor}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-qc-text/70 font-semibold m-0 pt-1 border-t border-qc-border/60">
                  {landmarkCue}
                </p>
              </div>
            );
          })}
        </div>

        {/* Footer Guidance Note */}
        <p className="text-xs text-qc-text/60 text-center m-0 pt-1">
          💡 Tapping any location recalibrates your route step-free with zero stairs.
        </p>
      </div>
    </div>
  );
}
