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
  MapPin,
  Globe
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
    <header className="sticky top-0 z-40 bg-white border-b border-[#E3DED1] shadow-xs select-none">
      {/* Top Utility & Accessibility Bar */}
      <div className="bg-[#174E46] text-[#F7F5EF] px-3 sm:px-4 py-1.5 text-xs flex items-center justify-between gap-2">
        {/* Connection & Live Sync Indicator */}
        <div className="flex items-center gap-1.5 min-w-0">
          {connected ? (
            <span className="flex items-center gap-1.5 text-[#D9E8DF] font-bold text-xs truncate">
              <span className="w-2 h-2 rounded-full bg-[#52B788] animate-pulse flex-shrink-0"></span>
              <span className="hidden sm:inline"><Wifi size={13} className="inline mr-1" /></span>
              <span className="truncate">{language === 'ta' ? 'நேரடி' : language === 'hi' ? 'लाइव' : 'Live Sync'}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[#F2C66D] font-bold bg-[#123C36] px-2 py-0.5 rounded-md text-[11px] border border-[#F2C66D]/40 truncate">
              <WifiOff size={12} className="flex-shrink-0" />
              <span className="truncate">{t('app.offlineNotice')}</span>
            </span>
          )}
        </div>

        {/* Accessibility, Settings & Language Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Assisted Mode Toggle */}
          <button
            type="button"
            onClick={() => setAssistedMode(!assistedMode)}
            className={`tap-target-large flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              assistedMode 
                ? 'bg-[#F2C66D] text-[#26352F] ring-2 ring-[#F2C66D]/80 font-black shadow-xs' 
                : 'bg-[#123C36] text-[#D9E8DF] hover:bg-[#0E2E2A]'
            }`}
            title="Toggle Large Text and High Contrast"
          >
            <Eye size={13} />
            <span className="hidden sm:inline">{assistedMode ? 'Assisted ON' : 'Assisted'}</span>
          </button>

          {/* Settings Modal Button */}
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="p-1 rounded-lg bg-[#123C36] text-[#D9E8DF] hover:bg-[#0E2E2A] hover:text-white transition-colors"
            title="Open Settings"
          >
            <SettingsIcon size={15} />
          </button>

          {/* Compact Tri-Lingual Language Switcher */}
          <div className="flex items-center bg-[#123C36] rounded-lg p-0.5 border border-[#174E46]/60">
            <button
              type="button"
              onClick={() => setLanguage('hi')}
              className={`px-2 py-0.5 text-xs font-bold rounded transition-colors ${
                language === 'hi' ? 'bg-[#D9E8DF] text-[#174E46] font-black' : 'text-[#D9E8DF] hover:text-white'
              }`}
            >
              हिं
            </button>
            <button
              type="button"
              onClick={() => setLanguage('ta')}
              className={`px-2 py-0.5 text-xs font-bold rounded transition-colors ${
                language === 'ta' ? 'bg-[#D9E8DF] text-[#174E46] font-black' : 'text-[#D9E8DF] hover:text-white'
              }`}
            >
              த
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 text-xs font-bold rounded transition-colors ${
                language === 'en' ? 'bg-[#D9E8DF] text-[#174E46] font-black' : 'text-[#D9E8DF] hover:text-white'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </div>

      {/* Main Branding & Quick Actions Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo & Hospital selector */}
        <Link to="/" className="flex items-center gap-2 sm:gap-3 no-underline min-w-0">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#174E46] text-[#F7F5EF] flex items-center justify-center shadow-sm flex-shrink-0">
            <Building2 size={20} className="sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-2xl font-black text-[#26352F] leading-tight tracking-tight m-0 truncate">
              {t('app.title')}
            </h1>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setHospitalModalOpen(true);
              }}
              className="text-[10px] sm:text-xs text-[#174E46] font-extrabold bg-[#FAF8F3] hover:bg-[#EEF4F0] px-2 py-0.5 rounded-md border border-[#E3DED1] flex items-center gap-1 transition-colors mt-0.5 truncate max-w-[170px] sm:max-w-none"
            >
              <MapPin size={10} className="text-[#174E46] flex-shrink-0" />
              <span className="truncate">
                {currentHospital 
                  ? `${currentHospital.name} (${currentHospital.stateCode})${distanceToCurrentHospital !== null ? ` • ~${distanceToCurrentHospital}km` : ''}` 
                  : t('app.subtitle')}
              </span>
              <ChevronDown size={10} className="text-[#52665C] flex-shrink-0" />
            </button>
          </div>
        </Link>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* I Need Help Button */}
          <button
            type="button"
            onClick={() => setHelpModalOpen(true)}
            className="tap-target-large flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-[#F2C66D] hover:bg-[#e4b85c] text-[#26352F] font-black text-xs sm:text-sm shadow-xs transition-transform active:scale-95 border border-[#8F6413]/20"
          >
            <LifeBuoy size={16} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{t('app.needHelpBtn')}</span>
            <span className="sm:hidden">{language === 'ta' ? 'உதவி' : language === 'hi' ? 'मदद' : 'Help'}</span>
          </button>

          {/* Emergency / Casualty Link */}
          <Link
            to="/emergency"
            className="tap-target-large flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-[#C93B2B] hover:bg-[#B33122] text-white font-black text-xs sm:text-sm shadow-sm transition-transform active:scale-95 no-underline"
          >
            <AlertTriangle size={16} className="sm:w-4 sm:h-4 text-amber-300" />
            <span>SOS</span>
          </Link>
        </div>
      </div>

      {/* Screen Navigation Tabs (Visible on Desktop/Tablet, replaced by bottom bar on mobile) */}
      <nav className="hidden md:flex bg-[#FAF8F3] border-t border-[#E3DED1] px-4 items-center justify-start gap-1 overflow-x-auto text-sm font-bold scrollbar-none">
        <Link
          to="/"
          className={`px-4 py-2.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors no-underline ${
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
          className={`px-4 py-2.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors no-underline ${
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
          className={`px-4 py-2.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors no-underline ${
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
          className={`px-4 py-2.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors no-underline ${
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
