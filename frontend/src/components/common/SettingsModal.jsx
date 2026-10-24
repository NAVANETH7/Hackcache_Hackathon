import React, { useState, useEffect } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useSocket } from '../../context/SocketContext';
import { 
  Settings as SettingsIcon, 
  X, 
  Globe, 
  Type, 
  Eye, 
  Volume2, 
  Footprints, 
  Download, 
  CheckCircle2, 
  Smartphone,
  Wifi,
  WifiOff,
  Database,
  Clock
} from 'lucide-react';

export default function SettingsModal({ isOpen, onClose }) {
  const { 
    language, 
    setLanguage, 
    textSize, 
    setTextSize, 
    highContrast, 
    setHighContrast, 
    readAloud, 
    setReadAloud, 
    avoidStairsDefault, 
    setAvoidStairsDefault,
    isInstallable,
    triggerInstallApp,
    t 
  } = useAccessibility();

  const { serverState } = useSocket();
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOpen) return null;

  const lastSyncTime = serverState?.lastUpdated 
    ? new Date(serverState.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    : 'Just now';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-qc-text/70 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      <div className="bg-qc-bg text-qc-text rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-2 border-qc-border relative max-h-[90vh] overflow-y-auto space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 tap-target-large p-2.5 rounded-full bg-qc-sage/60 text-qc-primary hover:bg-qc-sage transition-colors focus:ring-2 focus:ring-qc-primary"
          aria-label="Close Settings"
        >
          <X size={22} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-qc-border pb-4">
          <div className="p-3 rounded-2xl bg-qc-primary text-qc-bg shadow-sm">
            <SettingsIcon size={24} />
          </div>
          <div>
            <h2 id="settings-modal-title" className="text-xl sm:text-2xl font-black text-qc-text m-0">
              {t('settings.title')}
            </h2>
            <p className="text-xs text-qc-text/70 font-semibold m-0 mt-0.5">
              Customize text size, audio narration, and mobility preferences.
            </p>
          </div>
        </div>

        {/* 1. Language Picker (English, हिंदी, தமிழ் with native script) */}
        <div className="space-y-2">
          <label className="block text-xs font-black uppercase text-qc-text/80 tracking-wider flex items-center gap-2">
            <Globe size={16} className="text-qc-primary" />
            <span>{t('settings.language')}</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`tap-target-large py-3.5 px-3 rounded-2xl border-2 font-black text-sm transition-all focus:ring-2 focus:ring-qc-primary ${
                language === 'en'
                  ? 'border-qc-primary bg-qc-primary text-qc-bg shadow-md ring-2 ring-qc-sage'
                  : 'border-qc-border bg-white text-qc-text hover:border-qc-primary/50'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLanguage('hi')}
              className={`tap-target-large py-3.5 px-3 rounded-2xl border-2 font-black text-sm transition-all focus:ring-2 focus:ring-qc-primary ${
                language === 'hi'
                  ? 'border-qc-primary bg-qc-primary text-qc-bg shadow-md ring-2 ring-qc-sage'
                  : 'border-qc-border bg-white text-qc-text hover:border-qc-primary/50'
              }`}
            >
              हिंदी (Hindi)
            </button>
            <button
              type="button"
              onClick={() => setLanguage('ta')}
              className={`tap-target-large py-3.5 px-3 rounded-2xl border-2 font-black text-sm transition-all focus:ring-2 focus:ring-qc-primary ${
                language === 'ta'
                  ? 'border-qc-primary bg-qc-primary text-qc-bg shadow-md ring-2 ring-qc-sage'
                  : 'border-qc-border bg-white text-qc-text hover:border-qc-primary/50'
              }`}
            >
              தமிழ் (Tamil)
            </button>
          </div>
        </div>

        {/* 2. Text Size (3 steps: Normal 18px, Large 22px, Extra Large 26px) */}
        <div className="space-y-2">
          <label className="block text-xs font-black uppercase text-qc-text/80 tracking-wider flex items-center gap-2">
            <Type size={16} className="text-qc-primary" />
            <span>{t('settings.textSize')}</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setTextSize('normal')}
              className={`tap-target-large py-3 px-2 rounded-2xl border-2 font-bold text-xs transition-all focus:ring-2 focus:ring-qc-primary ${
                textSize === 'normal'
                  ? 'border-qc-primary bg-qc-primary text-qc-bg shadow-md font-black'
                  : 'border-qc-border bg-white text-qc-text'
              }`}
            >
              {t('settings.textNormal')}
            </button>
            <button
              type="button"
              onClick={() => setTextSize('large')}
              className={`tap-target-large py-3 px-2 rounded-2xl border-2 font-bold text-xs transition-all focus:ring-2 focus:ring-qc-primary ${
                textSize === 'large'
                  ? 'border-qc-primary bg-qc-primary text-qc-bg shadow-md font-black'
                  : 'border-qc-border bg-white text-qc-text'
              }`}
            >
              {t('settings.textLarge')}
            </button>
            <button
              type="button"
              onClick={() => setTextSize('extra-large')}
              className={`tap-target-large py-3 px-2 rounded-2xl border-2 font-bold text-xs transition-all focus:ring-2 focus:ring-qc-primary ${
                textSize === 'extra-large'
                  ? 'border-qc-primary bg-qc-primary text-qc-bg shadow-md font-black'
                  : 'border-qc-border bg-white text-qc-text'
              }`}
            >
              {t('settings.textExtraLarge')}
            </button>
          </div>
        </div>

        {/* 3. High Contrast Toggle */}
        <div 
          onClick={() => setHighContrast(!highContrast)}
          className="p-4 rounded-2xl border-2 border-qc-border bg-white flex items-center justify-between cursor-pointer select-none hover:border-qc-primary/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Eye size={22} className="text-qc-primary" />
            <div>
              <p className="text-sm font-black text-qc-text m-0">
                {t('settings.highContrast')}
              </p>
              <p className="text-xs text-qc-text/70 font-semibold m-0 mt-0.5">
                {t('settings.highContrastHint')}
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={highContrast}
            onChange={() => {}}
            className="w-6 h-6 text-qc-primary accent-qc-primary rounded focus:ring-qc-primary"
            aria-label={t('settings.highContrast')}
          />
        </div>

        {/* 4. Read Aloud Toggle */}
        <div 
          onClick={() => setReadAloud(!readAloud)}
          className="p-4 rounded-2xl border-2 border-qc-border bg-white flex items-center justify-between cursor-pointer select-none hover:border-qc-primary/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Volume2 size={22} className="text-qc-primary" />
            <div>
              <p className="text-sm font-black text-qc-text m-0">
                {t('settings.readAloud')}
              </p>
              <p className="text-xs text-qc-text/70 font-semibold m-0 mt-0.5">
                {t('settings.readAloudHint')}
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={readAloud}
            onChange={() => {}}
            className="w-6 h-6 text-qc-primary accent-qc-primary rounded focus:ring-qc-primary"
            aria-label={t('settings.readAloud')}
          />
        </div>

        {/* 5. Avoid Stairs Default Toggle */}
        <div 
          onClick={() => setAvoidStairsDefault(!avoidStairsDefault)}
          className="p-4 rounded-2xl border-2 border-qc-border bg-white flex items-center justify-between cursor-pointer select-none hover:border-qc-primary/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Footprints size={22} className="text-qc-primary" />
            <div>
              <p className="text-sm font-black text-qc-text m-0">
                {t('settings.avoidStairs')}
              </p>
              <p className="text-xs text-qc-text/70 font-semibold m-0 mt-0.5">
                {t('settings.avoidStairsHint')}
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={avoidStairsDefault}
            onChange={() => {}}
            className="w-6 h-6 text-qc-primary accent-qc-primary rounded focus:ring-qc-primary"
            aria-label={t('settings.avoidStairs')}
          />
        </div>

        {/* 6. Connection & Offline Information Panel (Phase 3.10) */}
        <div className="p-4 rounded-2xl border-2 border-qc-border bg-white space-y-3">
          <div className="flex items-center justify-between border-b border-qc-border/60 pb-2">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi size={18} className="text-qc-primary" />
              ) : (
                <WifiOff size={18} className="text-qc-emergency" />
              )}
              <span className="text-xs font-black uppercase text-qc-text tracking-wider">
                {t('settings.offlineStatusTitle')}
              </span>
            </div>
            <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
              isOnline ? 'bg-qc-sage text-qc-primary' : 'bg-red-100 text-qc-emergency'
            }`}>
              {isOnline ? t('settings.onlineStatus') : t('settings.offlineStatus')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs text-qc-text/80">
            <div className="flex items-center gap-1.5 p-2 bg-qc-bg rounded-xl border border-qc-border/60">
              <Clock size={15} className="text-qc-primary flex-shrink-0" />
              <div className="truncate">
                <span className="block text-[10px] font-bold uppercase text-qc-text/60">Last Synced</span>
                <span className="font-mono font-extrabold text-qc-text">{lastSyncTime}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 p-2 bg-qc-bg rounded-xl border border-qc-border/60">
              <Database size={15} className="text-qc-primary flex-shrink-0" />
              <div className="truncate">
                <span className="block text-[10px] font-bold uppercase text-qc-text/60">Cache State</span>
                <span className="font-extrabold text-qc-primary">PWA Ready</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-qc-text/70 m-0">
            {t('settings.cachedDataDesc')}
          </p>
        </div>

        {/* 7. PWA Install App (Only displayed when offered by browser) */}
        {isInstallable ? (
          <div className="p-4 rounded-2xl border-2 border-qc-primary/40 bg-qc-sage/30 space-y-2">
            <div className="flex items-center gap-2 text-qc-primary font-black text-sm">
              <Smartphone size={20} />
              <span>{t('settings.pwaTitle')}</span>
            </div>
            <p className="text-xs text-qc-text/80 font-medium m-0">
              {t('settings.pwaDesc')}
            </p>
            <button
              type="button"
              onClick={triggerInstallApp}
              className="w-full tap-target-large py-3.5 rounded-xl bg-qc-primary hover:bg-qc-primary/90 text-qc-bg font-black text-xs flex items-center justify-center gap-2 shadow focus:ring-2 focus:ring-qc-primary"
            >
              <Download size={16} />
              <span>{t('settings.installBtn')}</span>
            </button>
          </div>
        ) : (
          <div className="p-3 bg-white rounded-xl border border-qc-border text-center text-xs text-qc-text/70 font-bold">
            ✓ {t('settings.installedNotice')}
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-full tap-target-large py-4 rounded-2xl bg-qc-primary text-qc-bg font-bold text-sm shadow hover:bg-qc-primary/95 transition-all focus:ring-2 focus:ring-qc-primary"
        >
          Done
        </button>
      </div>
    </div>
  );
}
