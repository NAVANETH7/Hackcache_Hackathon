import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '../i18n/en.json';
import hi from '../i18n/hi.json';
import ta from '../i18n/ta.json';
import { speakText } from '../utils/speech';

const dictionaries = { en, hi, ta };

const AccessibilityContext = createContext();

export function AccessibilityProvider({ children }) {
  // 1. Language: English, Hindi, or Tamil (Defaults to Hindi or Tamil for Kamla persona)
  const [language, setLanguageState] = useState(() => localStorage.getItem('opd_lang') || 'hi');
  const [hasChosenLanguage, setHasChosenLanguage] = useState(() => Boolean(localStorage.getItem('opd_lang_chosen')));

  // 2. Assisted Mode (Defaults to true for Kamla)
  const [assistedMode, setAssistedModeState] = useState(() => {
    const saved = localStorage.getItem('opd_assisted');
    return saved !== null ? saved === 'true' : true;
  });

  // 3. Text Size: 'normal' (18px), 'large' (22px), 'extra-large' (26px)
  const [textSize, setTextSizeState] = useState(() => localStorage.getItem('opd_text_size') || 'large');

  // 4. High Contrast Mode
  const [highContrast, setHighContrastState] = useState(() => {
    const saved = localStorage.getItem('opd_high_contrast');
    return saved !== null ? saved === 'true' : false;
  });

  // 5. Read Aloud Mode
  const [readAloud, setReadAloudState] = useState(() => {
    const saved = localStorage.getItem('opd_read_aloud');
    return saved !== null ? saved === 'true' : true;
  });

  // 6. Avoid Stairs Default
  const [avoidStairsDefault, setAvoidStairsDefaultState] = useState(() => {
    const saved = localStorage.getItem('opd_avoid_stairs');
    return saved !== null ? saved === 'true' : true;
  });

  // 7. PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const triggerInstallApp = async () => {
    if (!deferredPrompt) {
      alert('App is already installed or ready in offline mode.');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('opd_lang', lang);
    localStorage.setItem('opd_lang_chosen', 'true');
    setHasChosenLanguage(true);
  };

  const setAssistedMode = (val) => {
    setAssistedModeState(val);
    localStorage.setItem('opd_assisted', String(val));
    if (val) {
      setTextSizeState('large');
      localStorage.setItem('opd_text_size', 'large');
      setAvoidStairsDefaultState(true);
      localStorage.setItem('opd_avoid_stairs', 'true');
    }
  };

  const setTextSize = (size) => {
    setTextSizeState(size);
    localStorage.setItem('opd_text_size', size);
  };

  const setHighContrast = (val) => {
    setHighContrastState(val);
    localStorage.setItem('opd_high_contrast', String(val));
  };

  const setReadAloud = (val) => {
    setReadAloudState(val);
    localStorage.setItem('opd_read_aloud', String(val));
  };

  const setAvoidStairsDefault = (val) => {
    setAvoidStairsDefaultState(val);
    localStorage.setItem('opd_avoid_stairs', String(val));
  };

  // Safe nested translation lookup
  const t = (pathKey) => {
    const dict = dictionaries[language] || dictionaries['hi'] || dictionaries['en'];
    const parts = pathKey.split('.');
    let curr = dict;
    for (const p of parts) {
      if (curr && curr[p] !== undefined) {
        curr = curr[p];
      } else {
        // Fallback to English
        let fallback = dictionaries['en'];
        for (const fp of parts) {
          if (fallback && fallback[fp] !== undefined) {
            fallback = fallback[fp];
          } else {
            return pathKey;
          }
        }
        return fallback;
      }
    }
    return curr;
  };

  // Font size class mapping adhering strictly to the prompt:
  // "Body text at least 18px, buttons at least 56px tall, strong colour contrast"
  const textSizeClass = 
    textSize === 'extra-large' 
      ? 'text-2xl leading-relaxed' 
      : textSize === 'large' || assistedMode 
      ? 'text-xl leading-normal' 
      : 'text-lg leading-normal';

  const contrastClass = highContrast
    ? 'contrast-more bg-black text-amber-300 ring-4 ring-amber-400'
    : '';

  return (
    <AccessibilityContext.Provider
      value={{
        language,
        setLanguage,
        hasChosenLanguage,
        setHasChosenLanguage,
        assistedMode,
        setAssistedMode,
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
      }}
    >
      <div className={`min-h-screen ${textSizeClass} ${contrastClass} transition-all duration-150`}>
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  return useContext(AccessibilityContext);
}
