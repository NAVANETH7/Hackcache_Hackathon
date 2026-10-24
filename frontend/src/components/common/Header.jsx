import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useSocket } from '../../context/SocketContext';
import { useJourney } from '../../context/JourneyContext';
import SettingsModal from './SettingsModal';
import HospitalSelectorModal from './HospitalSelectorModal';
import LocationPromptBanner from './LocationPromptBanner';
import { 
  Building2, 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  LifeBuoy, 
  Eye, 
  Settings as SettingsIcon,
  Stethoscope,
  Tv,
  PlayCircle,
  ChevronDown,
  MapPin
} from 'lucide-react';

export default function Header() {
  const { 
    language, 
    setLanguage, 
    assistedMode, 
    setAssistedMode, 
    currentHospital,
    distanceToCurrentHospital,
    t 
  } = useAccessibility();
  const { connected, lastUpdatedText } = useSocket();
  const { setHelpModalOpen } = useJourney();
  const location = useLocation();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hospitalModalOpen, setHospitalModalOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E3DED1] shadow-sm select-none">
      {/* Top Utility & Accessibility Bar */}
      <div className="bg-[#174E46] text-[#F7F5EF] px-3 sm:px-4 py-2 text-xs sm:text-sm flex flex-wrap items-center justify-between gap-2">
        {/* Connection & Live Sync Indicator */}
        <div className="flex items-center gap-2">
          {connected ? (
            <span className="flex items-center gap-1.5 text-[#D9E8DF] font-bold text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-[#52B788] animate-pulse"></span>
              <Wifi size={14} />
              <span>{language === 'ta' ? 'நேரடி ஒத்திசைவு (Live)' : language === 'hi' ? 'लाइव सिंक' : 'Live Sync'}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[#F2C66D] font-bold bg-[#123C36] px-2.5 py-0.5 rounded-lg text-xs border border-[#F2C66D]/40">
              <WifiOff size={14} />
              <span>{t('app.offlineNotice')} ({lastUpdatedText})</span>
            </span>
          )}
        </div>

        {/* Accessibility, Settings & Language Controls */}
        <div className="flex items-center gap-2">
          {/* Assisted Mode Toggle */}
          <button
            type="button"
            onClick={() => setAssistedMode(!assistedMode)}
            className={`tap-target-large flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              assistedMode 
                ? 'bg-[#F2C66D] text-[#26352F] ring-2 ring-[#F2C66D]/80 font-black shadow-sm' 
                : 'bg-[#123C36] text-[#D9E8DF] hover:bg-[#0E2E2A]'
            }`}
            title="Toggle Large Text and High Contrast"
          >
            <Eye size={14} />
            <span>{assistedMode ? 'Assisted ON' : 'Assisted'}</span>
          </button>

          {/* Settings Modal Button */}
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="p-1.5 rounded-xl bg-[#123C36] text-[#D9E8DF] hover:bg-[#0E2E2A] hover:text-white transition-colors"
            title="Open Settings"
          >
            <SettingsIcon size={16} />
          </button>

          {/* Tri-Lingual Language Switcher */}
          <div className="flex items-center bg-[#123C36] rounded-xl p-0.5 border border-[#174E46]">
            <button
              type="button"
              onClick={() => setLanguage('hi')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                language === 'hi' ? 'bg-[#D9E8DF] text-[#174E46] font-black shadow-sm' : 'text-[#D9E8DF] hover:text-white'
              }`}
            >
              हिंदी
            </button>
            <button
              type="button"
              onClick={() => setLanguage('ta')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                language === 'ta' ? 'bg-[#D9E8DF] text-[#174E46] font-black shadow-sm' : 'text-[#D9E8DF] hover:text-white'
              }`}
            >
              தமிழ்
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                language === 'en' ? 'bg-[#D9E8DF] text-[#174E46] font-black shadow-sm' : 'text-[#D9E8DF] hover:text-white'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </div>

      {/* Main Branding & Vital Global Action Buttons */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2.5 sm:gap-3 no-underline">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#174E46] text-[#F7F5EF] flex items-center justify-center shadow-md flex-shrink-0">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-black text-[#26352F] leading-tight tracking-tight m-0">
              {t('app.title')}
            </h1>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setHospitalModalOpen(true);
              }}
              className="text-[11px] sm:text-xs text-[#174E46] font-extrabold bg-[#FAF8F3] hover:bg-[#EEF4F0] px-2 py-0.5 rounded-lg border border-[#E3DED1] flex items-center gap-1 transition-colors mt-0.5"
            >
              <MapPin size={11} className="text-[#174E46]" />
              <span className="truncate max-w-[190px] sm:max-w-none">
                {currentHospital 
                  ? `${currentHospital.name} (${currentHospital.stateCode})${distanceToCurrentHospital !== null ? ` • ~${distanceToCurrentHospital} km` : ''}` 
                  : t('app.subtitle')}
              </span>
              <ChevronDown size={11} className="text-[#52665C]" />
            </button>
          </div>
        </Link>

        {/* Global Action Buttons (Emergency & I Need Help on EVERY screen) */}
        <div className="flex items-center gap-2">
          {/* I Need Help Button */}
          <button
            type="button"
            onClick={() => setHelpModalOpen(true)}
            className="tap-target-large flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F2C66D] hover:bg-[#e4b85c] text-[#26352F] font-black text-xs sm:text-sm shadow-sm transition-transform active:scale-95 border border-[#8F6413]/20"
          >
            <LifeBuoy size={17} />
            <span>{t('app.needHelpBtn')}</span>
          </button>

          {/* Emergency / Casualty Link (On every screen, before & after registration) */}
          <Link
            to="/emergency"
            className="tap-target-large flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C93B2B] hover:bg-[#B33122] text-white font-black text-xs sm:text-sm shadow-md transition-transform active:scale-95 no-underline"
          >
            <AlertTriangle size={17} />
            <span>{t('app.emergencyBtn')}</span>
          </Link>
        </div>
      </div>

      {/* Screen Navigation Tabs */}
      <nav className="bg-[#FAF8F3] border-t border-[#E3DED1] px-3 sm:px-4 flex items-center justify-start gap-1 overflow-x-auto text-xs sm:text-sm font-bold scrollbar-none">
        <Link
          to="/"
          className={`px-3.5 py-2.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors no-underline ${
            location.pathname === '/' 
              ? 'border-[#174E46] text-[#174E46] bg-white font-black' 
              : 'border-transparent text-[#52665C] hover:text-[#26352F]'
          }`}
        >
          <Building2 size={16} />
          <span>{t('nav.patient')}</span>
        </Link>

        <Link
          to="/staff"
          className={`px-3.5 py-2.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors no-underline ${
            location.pathname === '/staff' 
              ? 'border-[#174E46] text-[#174E46] bg-white font-black' 
              : 'border-transparent text-[#52665C] hover:text-[#26352F]'
          }`}
        >
          <Stethoscope size={16} />
          <span>{t('nav.staff')}</span>
        </Link>

        <Link
          to="/board"
          className={`px-3.5 py-2.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors no-underline ${
            location.pathname === '/board' 
              ? 'border-[#174E46] text-[#174E46] bg-white font-black' 
              : 'border-transparent text-[#52665C] hover:text-[#26352F]'
          }`}
        >
          <Tv size={16} />
          <span>{t('nav.board')}</span>
        </Link>

        <Link
          to="/demo"
          className={`px-3.5 py-2.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors no-underline ${
            location.pathname === '/demo' 
              ? 'border-[#174E46] text-[#174E46] bg-white font-black' 
              : 'border-transparent text-[#52665C] hover:text-[#26352F]'
          }`}
        >
          <PlayCircle size={16} />
          <span>{t('nav.demo')}</span>
        </Link>
      </nav>

      {/* Geolocation & Entrance Gate Notification Banner */}
      <LocationPromptBanner onOpenHospitalModal={() => setHospitalModalOpen(true)} />

      {/* Settings Modal */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* Pan-India Hospital Network Selector Modal */}
      <HospitalSelectorModal isOpen={hospitalModalOpen} onClose={() => setHospitalModalOpen(false)} />
    </header>
  );
}
