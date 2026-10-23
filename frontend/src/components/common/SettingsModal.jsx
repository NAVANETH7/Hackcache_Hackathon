import React from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
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
  Smartphone 
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-4 border-slate-900 relative max-h-[90vh] overflow-y-auto space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 tap-target-large p-2 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          aria-label="Close Settings"
        >
          <X size={22} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
          <div className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-800">
            <SettingsIcon size={26} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 m-0">
              {t('settings.title')}
            </h2>
            <p className="text-xs text-slate-500 font-semibold m-0 mt-0.5">
              Customize text size, audio narration, and mobility preferences.
            </p>
          </div>
        </div>

        {/* 1. Language Picker (English, हिंदी, தமிழ் with native script) */}
        <div className="space-y-2">
          <label className="block text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2">
            <Globe size={16} className="text-emerald-700" />
            <span>{t('settings.language')}</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`tap-target-large py-3 px-3 rounded-2xl border-2 font-black text-sm transition-all ${
                language === 'en'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-400'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLanguage('hi')}
              className={`tap-target-large py-3 px-3 rounded-2xl border-2 font-black text-sm transition-all ${
                language === 'hi'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-400'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
              }`}
            >
              हिंदी (Hindi)
            </button>
            <button
              type="button"
              onClick={() => setLanguage('ta')}
              className={`tap-target-large py-3 px-3 rounded-2xl border-2 font-black text-sm transition-all ${
                language === 'ta'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-400'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
              }`}
            >
              தமிழ் (Tamil)
            </button>
          </div>
        </div>

        {/* 2. Text Size (3 steps: Normal 18px, Large 22px, Extra Large 26px) */}
        <div className="space-y-2">
          <label className="block text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2">
            <Type size={16} className="text-emerald-700" />
            <span>{t('settings.textSize')}</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setTextSize('normal')}
              className={`tap-target-large py-3 px-2 rounded-2xl border-2 font-bold text-xs transition-all ${
                textSize === 'normal'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-400 font-black'
                  : 'border-slate-300 bg-white text-slate-700'
              }`}
            >
              {t('settings.textNormal')}
            </button>
            <button
              type="button"
              onClick={() => setTextSize('large')}
              className={`tap-target-large py-3 px-2 rounded-2xl border-2 font-bold text-xs transition-all ${
                textSize === 'large'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-400 font-black'
                  : 'border-slate-300 bg-white text-slate-700'
              }`}
            >
              {t('settings.textLarge')}
            </button>
            <button
              type="button"
              onClick={() => setTextSize('extra-large')}
              className={`tap-target-large py-3 px-2 rounded-2xl border-2 font-bold text-xs transition-all ${
                textSize === 'extra-large'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-400 font-black'
                  : 'border-slate-300 bg-white text-slate-700'
              }`}
            >
              {t('settings.textExtraLarge')}
            </button>
          </div>
        </div>

        {/* 3. High Contrast Toggle */}
        <div 
          onClick={() => setHighContrast(!highContrast)}
          className="p-4 rounded-2xl border-2 border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer select-none"
        >
          <div className="flex items-center gap-3">
            <Eye size={22} className="text-slate-800" />
            <div>
              <p className="text-sm font-black text-slate-900 m-0">
                {t('settings.highContrast')}
              </p>
              <p className="text-xs text-slate-500 font-semibold m-0 mt-0.5">
                {t('settings.highContrastHint')}
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={highContrast}
            onChange={() => {}}
            className="w-6 h-6 text-emerald-600 rounded"
          />
        </div>

        {/* 4. Read Aloud Toggle */}
        <div 
          onClick={() => setReadAloud(!readAloud)}
          className="p-4 rounded-2xl border-2 border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer select-none"
        >
          <div className="flex items-center gap-3">
            <Volume2 size={22} className="text-emerald-700" />
            <div>
              <p className="text-sm font-black text-slate-900 m-0">
                {t('settings.readAloud')}
              </p>
              <p className="text-xs text-slate-500 font-semibold m-0 mt-0.5">
                {t('settings.readAloudHint')}
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={readAloud}
            onChange={() => {}}
            className="w-6 h-6 text-emerald-600 rounded"
          />
        </div>

        {/* 5. Avoid Stairs Default Toggle */}
        <div 
          onClick={() => setAvoidStairsDefault(!avoidStairsDefault)}
          className="p-4 rounded-2xl border-2 border-slate-200 bg-slate-50 flex items-center justify-between cursor-pointer select-none"
        >
          <div className="flex items-center gap-3">
            <Footprints size={22} className="text-emerald-700" />
            <div>
              <p className="text-sm font-black text-slate-900 m-0">
                {t('settings.avoidStairs')}
              </p>
              <p className="text-xs text-slate-500 font-semibold m-0 mt-0.5">
                {t('settings.avoidStairsHint')}
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={avoidStairsDefault}
            onChange={() => {}}
            className="w-6 h-6 text-emerald-600 rounded"
          />
        </div>

        {/* 6. PWA Install App (Only displayed when offered by browser) */}
        {isInstallable ? (
          <div className="p-4 rounded-2xl border-2 border-emerald-400 bg-emerald-50 space-y-2">
            <div className="flex items-center gap-2 text-emerald-900 font-black text-sm">
              <Smartphone size={20} />
              <span>{t('settings.pwaTitle')}</span>
            </div>
            <p className="text-xs text-emerald-800 font-medium m-0">
              {t('settings.pwaDesc')}
            </p>
            <button
              type="button"
              onClick={triggerInstallApp}
              className="w-full tap-target-large py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs flex items-center justify-center gap-2 shadow"
            >
              <Download size={16} />
              <span>{t('settings.installBtn')}</span>
            </button>
          </div>
        ) : (
          <div className="p-3 bg-slate-100 rounded-xl text-center text-xs text-slate-500 font-bold">
            ✓ {t('settings.installedNotice')}
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-full tap-target-large py-3.5 rounded-2xl bg-slate-900 text-white font-bold text-sm"
        >
          Done
        </button>
      </div>
    </div>
  );
}
