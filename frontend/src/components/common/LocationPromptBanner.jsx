import React, { useState } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { 
  MapPin, 
  Navigation, 
  Check, 
  X, 
  DoorOpen, 
  Building2, 
  Compass, 
  Loader2,
  ChevronDown
} from 'lucide-react';

export default function LocationPromptBanner({ onOpenHospitalModal }) {
  const { 
    currentHospital, 
    userLocation, 
    locationStatus, 
    distanceToCurrentHospital, 
    selectedEntranceGate, 
    updateEntranceGate, 
    detectLocation, 
    dismissLocationBanner, 
    locationBannerDismissed,
    language,
    t
  } = useAccessibility();

  const [expanded, setExpanded] = useState(false);

  // If user dismissed and has no detected location, don't show the initial prompt
  if (locationBannerDismissed && locationStatus === 'idle') {
    return null;
  }

  // Gates for the current active hospital
  const gates = currentHospital?.gates || [
    { id: "ENTRANCE_G", name: "Gate 1 - Main OPD Entrance", zone: "OPD_REGISTRATION" },
    { id: "CASUALTY", name: "Gate 2 - Emergency / Trauma Casualty", zone: "CASUALTY" },
    { id: "RAMP_1", name: "Gate 3 - Accessible Ramp Entry", zone: "RAMP_1" }
  ];

  const currentGate = gates.find(g => g.id === selectedEntranceGate) || gates[0];

  // 1. When Location is already detected & granted
  if (locationStatus === 'granted' || userLocation) {
    return (
      <aside aria-label="Hospital entrance and location banner" className="bg-[#FAF8F3] border-b border-[#E3DED1] px-3 sm:px-4 py-2 select-none">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5 text-xs text-[#26352F]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1 font-bold text-[#174E46] bg-[#EEF4F0] px-2.5 py-1 rounded-xl border border-[#D9E8DF]">
              <MapPin size={13} className="text-[#174E46]" />
              <span>
                {language === 'ta' 
                  ? `அருகிலுள்ள மருத்துவமனை: ${currentHospital.name}` 
                  : language === 'hi'
                  ? `निकटतम अस्पताल: ${currentHospital.name}`
                  : `Nearest: ${currentHospital.name}`}
              </span>
              {distanceToCurrentHospital !== null && (
                <span className="font-mono text-[#52665C]">({distanceToCurrentHospital} km)</span>
              )}
            </span>

            {/* Entrance Gate Selector */}
            <div className="flex items-center gap-1.5 font-bold text-[#52665C]">
              <DoorOpen size={14} className="text-[#174E46]" />
              <span>{language === 'ta' ? 'நுழைவு வாயில்:' : language === 'hi' ? 'प्रवेश द्वार:' : 'Entering Via:'}</span>
              <select
                value={selectedEntranceGate}
                onChange={(e) => updateEntranceGate(e.target.value)}
                className="tap-target-large bg-white border border-[#E3DED1] rounded-xl px-2.5 py-1 font-extrabold text-[#174E46] outline-none cursor-pointer"
              >
                {gates.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={detectLocation}
              className="text-[11px] font-bold text-[#174E46] hover:underline flex items-center gap-1"
              title="Refresh GPS location"
            >
              <Navigation size={11} />
              <span>{language === 'ta' ? 'மீண்டும் புதுப்பி' : language === 'hi' ? 'रीफ्रेश' : 'Re-detect GPS'}</span>
            </button>
          </div>
        </div>
      </aside>
    );
  }

  // 2. Initial Location Detection Request Prompt Banner
  return (
    <aside aria-label="Hospital entrance and location banner" className="bg-[#FAF8F3] border-b-2 border-[#F2C66D] px-3 sm:px-4 py-3 select-none animate-fade-in shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FDF7EA] text-[#8F6413] border border-[#F2C66D] flex items-center justify-center flex-shrink-0 mt-0.5">
            {locationStatus === 'detecting' ? (
              <Loader2 size={18} className="animate-spin text-[#8F6413]" />
            ) : (
              <MapPin size={18} className="text-[#8F6413]" />
            )}
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-black text-[#26352F] m-0 flex items-center gap-2">
              <span>
                {language === 'ta'
                  ? '📍 அருகிலுள்ள மருத்துவமனையை கண்டறிய இருப்பிடத்தை இயக்கவும்'
                  : language === 'hi'
                  ? '📍 निकटतम सरकारी अस्पताल खोजने के लिए लोकेशन ऑन करें'
                  : '📍 Enable Location to Detect Nearest Hospital & Entrance Gate'}
              </span>
              <span className="text-[10px] bg-[#F2C66D] text-[#26352F] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                GPS Assist
              </span>
            </h2>
            <p className="text-[11px] text-[#52665C] font-semibold m-0 mt-0.5">
              {locationStatus === 'denied'
                ? (language === 'ta' 
                    ? 'இருப்பிட அனுமதி வழங்கப்படவில்லை. கையேடு தேர்வு செய்ய கீழே உள்ள பொத்தானை அழுத்தவும்.'
                    : language === 'hi'
                    ? 'लोकेशन की अनुमति नहीं मिली। आप मैन्युअल रूप से अस्पताल चुन सकते हैं।'
                    : 'Location permission was denied. You can still select your hospital manually.')
                : (language === 'ta'
                    ? 'OPD Saathi தானாக உங்கள் மாவட்ட அரசு மருத்துவமனையை இணைத்து, நீங்கள் நுழையும் வாயிலிலிருந்து வழிகாட்டும்.'
                    : language === 'hi'
                    ? 'ओपीडी साथी आपके निकटतम जिला अस्पताल को स्वतः चुनेगा और आगमन गेट से रास्ता दिखाएगा।'
                    : 'OPD Saathi auto-connects to your nearest public hospital and routes your journey from your arrival gate.')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          <button
            type="button"
            onClick={detectLocation}
            disabled={locationStatus === 'detecting'}
            className="tap-target-large px-3.5 py-2 rounded-xl bg-[#174E46] hover:bg-[#123C36] text-white font-black text-xs flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 disabled:opacity-50"
          >
            {locationStatus === 'detecting' ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>{language === 'ta' ? 'கண்டறிகிறது...' : language === 'hi' ? 'खोज रहे हैं...' : 'Detecting GPS...'}</span>
              </>
            ) : (
              <>
                <Compass size={14} />
                <span>{language === 'ta' ? 'அருகிலுள்ளதை கண்டறி' : language === 'hi' ? 'निकटतम अस्पताल खोजें' : 'Detect Nearest Hospital'}</span>
              </>
            )}
          </button>

          {onOpenHospitalModal && (
            <button
              type="button"
              onClick={onOpenHospitalModal}
              className="tap-target-large px-3 py-2 rounded-xl bg-white hover:bg-[#EEF4F0] text-[#174E46] border border-[#D9E8DF] font-bold text-xs transition-colors"
            >
              {language === 'ta' ? 'பட்டியலிலிருந்து தேர்வு' : language === 'hi' ? 'सूची से चुनें' : 'Choose Hospital'}
            </button>
          )}

          <button
            type="button"
            onClick={dismissLocationBanner}
            className="p-2 rounded-xl text-[#52665C] hover:text-[#26352F] hover:bg-black/5 transition-colors"
            title="Dismiss location banner"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
