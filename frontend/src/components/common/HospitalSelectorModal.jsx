import React from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { nationalHospitals, calculateDistanceKm } from '../../data/nationalHospitals';
import { 
  Building2, 
  MapPin, 
  Check, 
  X, 
  ShieldCheck, 
  PhoneCall, 
  Globe2, 
  Sparkles,
  ArrowRight,
  Compass,
  Loader2,
  Navigation
} from 'lucide-react';

export default function HospitalSelectorModal({ isOpen, onClose }) {
  const { 
    currentHospital, 
    setCurrentHospital, 
    userLocation, 
    detectLocation, 
    locationStatus, 
    language 
  } = useAccessibility();

  if (!isOpen) return null;

  const handleSelectHospital = (hospital) => {
    setCurrentHospital(hospital);
    onClose();
  };

  // Sort hospitals by proximity if user location is available
  const sortedHospitals = [...nationalHospitals].map(h => {
    const dist = userLocation && h.lat && h.lng
      ? calculateDistanceKm(userLocation.lat, userLocation.lng, h.lat, h.lng)
      : null;
    return { ...h, distanceKm: dist };
  }).sort((a, b) => {
    if (a.distanceKm !== null && b.distanceKm !== null) return a.distanceKm - b.distanceKm;
    if (a.distanceKm !== null) return -1;
    if (b.distanceKm !== null) return 1;
    return 0;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-qc-text/75 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-qc-bg rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border-2 border-qc-border max-h-[92vh] overflow-y-auto space-y-5">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-qc-border pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-qc-primary text-qc-bg flex items-center justify-center flex-shrink-0 shadow-sm">
              <Building2 size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-qc-sage text-qc-primary px-2.5 py-0.5 rounded-full">
                  Pan-India Public Health Network
                </span>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                  ABDM / ABHA Ready
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-qc-text m-0 mt-1">
                {language === 'ta' ? 'அரசு மருத்துவமனையைத் தேர்ந்தெடுக்கவும்' : language === 'hi' ? 'अस्पताल एवं राज्य का चयन करें' : 'Select Hospital & State Network'}
              </h2>
              <p className="text-xs text-qc-text/70 font-semibold m-0 mt-0.5">
                Standardized companion deployed across public hospitals in India
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-qc-text/60 hover:text-qc-text hover:bg-qc-sage/30 transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {/* GPS Auto-Detect Nearest Hospital Quick Action */}
        <div className="p-3.5 rounded-2xl bg-[#EEF4F0] border border-[#D9E8DF] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#174E46] text-white flex items-center justify-center">
              <Compass size={18} />
            </div>
            <div>
              <p className="text-xs font-black text-[#174E46] m-0">
                {language === 'ta' ? 'GPS இருப்பிட கண்டறிதல்' : language === 'hi' ? 'जीपीएस द्वारा निकटतम अस्पताल' : 'Auto-Detect Nearest Hospital'}
              </p>
              <p className="text-[11px] text-[#52665C] m-0">
                {userLocation 
                  ? (language === 'ta' ? 'ஜிபிஎஸ் நிலை: இயக்கப்பட்டது' : language === 'hi' ? 'जीपीएस सक्रिय' : 'GPS location active')
                  : (language === 'ta' ? 'உங்கள் அருகிலுள்ள மருத்துவமனையை கண்டறியவும்' : language === 'hi' ? 'स्वचालित निकटतम अस्पताल चयन' : 'Find closest public health facility')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={detectLocation}
            disabled={locationStatus === 'detecting'}
            className="tap-target-large px-3.5 py-2 rounded-xl bg-[#174E46] hover:bg-[#123C36] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 disabled:opacity-50"
          >
            {locationStatus === 'detecting' ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Detecting...</span>
              </>
            ) : (
              <>
                <Navigation size={13} />
                <span>{userLocation ? 'Re-Detect GPS' : 'Detect My Hospital'}</span>
              </>
            )}
          </button>
        </div>

        {/* Hospital Card List */}
        <div className="space-y-3">
          {sortedHospitals.map((hosp) => {
            const isSelected = currentHospital?.id === hosp.id;
            const displayName = language === 'ta' && hosp.name_ta 
              ? hosp.name_ta 
              : language === 'hi' && hosp.name_hi 
              ? hosp.name_hi 
              : hosp.name;

            return (
              <div
                key={hosp.id}
                onClick={() => handleSelectHospital(hosp)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isSelected 
                    ? 'bg-qc-sage/40 border-qc-primary ring-2 ring-qc-primary/20 shadow-sm' 
                    : 'bg-white border-qc-border hover:border-qc-primary hover:bg-[#FAF8F3]'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-black uppercase text-qc-primary bg-qc-sage px-2 py-0.5 rounded-md">
                      {hosp.state} ({hosp.stateCode})
                    </span>
                    {hosp.distanceKm !== null && (
                      <span className="text-[11px] font-extrabold text-[#174E46] bg-[#D9E8DF] px-2 py-0.5 rounded-md flex items-center gap-1">
                        <MapPin size={10} />
                        <span>~{hosp.distanceKm} km away</span>
                      </span>
                    )}
                    <span className="text-[11px] font-bold text-qc-text/60">
                      {hosp.type}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-qc-text m-0">
                    {displayName}
                  </h3>

                  <p className="text-xs text-qc-text/70 font-semibold m-0 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-qc-primary" />
                      <span>{hosp.city}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <PhoneCall size={13} className="text-[#C93B2B]" />
                      <span>Helpline: {hosp.helpline}</span>
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {isSelected ? (
                    <span className="px-3 py-1.5 rounded-xl bg-qc-primary text-white font-black text-xs flex items-center gap-1.5 shadow-sm">
                      <Check size={14} />
                      <span>Selected</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-xl bg-white border border-qc-border text-qc-primary font-bold text-xs hover:bg-qc-sage/30 flex items-center gap-1"
                    >
                      <span>Switch Hospital</span>
                      <ArrowRight size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Universal Policy Notice */}
        <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-qc-border text-xs text-qc-text/80 space-y-1">
          <p className="font-black text-qc-text uppercase tracking-wider m-0 flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-qc-primary" />
            <span>Universal Healthcare Access Guarantee</span>
          </p>
          <p className="m-0 leading-relaxed font-medium">
            OPD Saathi adheres to the National Health Mission (NHM) standards: 100% free consultation slips, zero-stairs accessible routing, multi-language speech, and emergency casualty care for all citizens.
          </p>
        </div>
      </div>
    </div>
  );
}
