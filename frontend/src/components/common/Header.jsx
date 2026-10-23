import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useSocket } from '../../context/SocketContext';
import { useJourney } from '../../context/JourneyContext';
import SettingsModal from './SettingsModal';
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
  PlayCircle
} from 'lucide-react';

export default function Header() {
  const { 
    language, 
    setLanguage, 
    assistedMode, 
    setAssistedMode, 
    t 
  } = useAccessibility();
  const { connected, lastUpdatedText } = useSocket();
  const { setHelpModalOpen } = useJourney();
  const location = useLocation();

  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm select-none">
      {/* Top Utility & Accessibility Bar */}
      <div className="bg-slate-900 text-slate-100 px-3 sm:px-4 py-2 text-xs sm:text-sm flex flex-wrap items-center justify-between gap-2">
        {/* Connection & Live Sync Indicator */}
        <div className="flex items-center gap-2">
          {connected ? (
            <span className="flex items-center gap-1.5 text-emerald-400 font-extrabold text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <Wifi size={14} />
              <span>{language === 'ta' ? 'நேரடி ஒத்திசைவு (Live)' : language === 'hi' ? 'लाइव सिंक' : 'Live Sync'}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-amber-400 font-bold bg-amber-950/80 px-2.5 py-0.5 rounded-lg text-xs border border-amber-600/50">
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
            className={`tap-target-large flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              assistedMode 
                ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 font-black' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
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
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
            title="Open Settings"
          >
            <SettingsIcon size={16} />
          </button>

          {/* Tri-Lingual Language Switcher */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            <button
              type="button"
              onClick={() => setLanguage('hi')}
              className={`px-2 py-1 text-xs font-bold rounded-md transition-colors ${
                language === 'hi' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              हिंदी
            </button>
            <button
              type="button"
              onClick={() => setLanguage('ta')}
              className={`px-2 py-1 text-xs font-bold rounded-md transition-colors ${
                language === 'ta' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              தமிழ்
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 text-xs font-bold rounded-md transition-colors ${
                language === 'en' ? 'bg-emerald-600 text-white shadow' : 'text-slate-300 hover:text-white'
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
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-md flex-shrink-0">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-black text-slate-900 leading-tight tracking-tight m-0">
              {t('app.title')}
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium m-0 truncate max-w-[200px] sm:max-w-none">
              {t('app.subtitle')}
            </p>
          </div>
        </Link>

        {/* Global Action Buttons (Emergency & I Need Help on EVERY screen) */}
        <div className="flex items-center gap-2">
          {/* I Need Help Button */}
          <button
            type="button"
            onClick={() => setHelpModalOpen(true)}
            className="tap-target-large flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow transition-transform active:scale-95"
          >
            <LifeBuoy size={17} />
            <span>{t('app.needHelpBtn')}</span>
          </button>

          {/* Emergency / Casualty Link (On every screen, before & after registration) */}
          <Link
            to="/emergency"
            className="tap-target-large flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs sm:text-sm shadow transition-transform active:scale-95 animate-urgent no-underline"
          >
            <AlertTriangle size={17} />
            <span>{t('app.emergencyBtn')}</span>
          </Link>
        </div>
      </div>

      {/* Screen Navigation Tabs */}
      <nav className="bg-slate-100 border-t border-slate-200 px-3 sm:px-4 flex items-center justify-start gap-1 overflow-x-auto text-xs sm:text-sm font-bold scrollbar-none">
        <Link
          to="/"
          className={`px-3.5 py-2.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors no-underline ${
            location.pathname === '/' 
              ? 'border-emerald-600 text-emerald-900 bg-white font-black' 
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 size={16} />
          <span>{t('nav.patient')}</span>
        </Link>

        <Link
          to="/staff"
          className={`px-3.5 py-2.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors no-underline ${
            location.pathname === '/staff' 
              ? 'border-emerald-600 text-emerald-900 bg-white font-black' 
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Stethoscope size={16} />
          <span>{t('nav.staff')}</span>
        </Link>

        <Link
          to="/board"
          className={`px-3.5 py-2.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors no-underline ${
            location.pathname === '/board' 
              ? 'border-emerald-600 text-emerald-900 bg-white font-black' 
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Tv size={16} />
          <span>{t('nav.board')}</span>
        </Link>

        <Link
          to="/demo"
          className={`px-3.5 py-2.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors no-underline ${
            location.pathname === '/demo' 
              ? 'border-emerald-600 text-emerald-900 bg-white font-black' 
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <PlayCircle size={16} />
          <span>{t('nav.demo')}</span>
        </Link>
      </nav>

      {/* Settings Modal */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </header>
  );
}
