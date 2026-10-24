import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '../i18n/en.json';
import hi from '../i18n/hi.json';
import ta from '../i18n/ta.json';
import { speakText } from '../utils/speech';
import { nationalHospitals, defaultHospital, calculateDistanceKm } from '../data/nationalHospitals';

const dictionaries = { en, hi, ta };

const AccessibilityContext = createContext();

export function AccessibilityProvider({ children }) {
  // 0. Active Pan-India Public Hospital
  const [currentHospital, setCurrentHospitalState] = useState(() => {
    const savedId = localStorage.getItem('opd_hospital_id');
    if (savedId) {
      const found = nationalHospitals.find(h => h.id === savedId);
      if (found) return found;
    }
    return defaultHospital;
  });

  const setCurrentHospital = (hosp) => {
    setCurrentHospitalState(hosp);
    localStorage.setItem('opd_hospital_id', hosp.id);
  };

  // Location & Nearest Hospital State
  const [userLocation, setUserLocation] = useState(() => {
    try {
      const saved = localStorage.getItem('opd_user_location');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [locationStatus, setLocationStatus] = useState('idle'); // 'idle' | 'detecting' | 'granted' | 'denied' | 'unsupported'
  const [locationBannerDismissed, setLocationBannerDismissed] = useState(() => {
    return Boolean(localStorage.getItem('opd_location_dismissed'));
  });
  const [selectedEntranceGate, setSelectedEntranceGate] = useState(() => {
    return localStorage.getItem('opd_selected_gate') || 'ENTRANCE_G';
  });

  const updateEntranceGate = (gateId) => {
    setSelectedEntranceGate(gateId);
    localStorage.setItem('opd_selected_gate', gateId);
  };

  const dismissLocationBanner = () => {
    setLocationBannerDismissed(true);
    localStorage.setItem('opd_location_dismissed', 'true');
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('unsupported');
      return;
    }

    setLocationStatus('detecting');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const coords = { lat: latitude, lng: longitude, accuracy };
        setUserLocation(coords);
        localStorage.setItem('opd_user_location', JSON.stringify(coords));

        // Find nearest hospital using Haversine formula
        let nearest = nationalHospitals[0];
        let minDist = Infinity;

        nationalHospitals.forEach((hosp) => {
          if (hosp.lat && hosp.lng) {
            const dist = calculateDistanceKm(latitude, longitude, hosp.lat, hosp.lng);
            if (dist !== null && dist < minDist) {
              minDist = dist;
              nearest = hosp;
            }
          }
        });

        setCurrentHospital(nearest);
        setLocationStatus('granted');
      },
      (err) => {
        console.warn('[OPD Saathi] Geolocation access:', err.message);
        setLocationStatus('denied');
      },
      { timeout: 10000, maximumAge: 60000, enableHighAccuracy: true }
    );
  };

  const distanceToCurrentHospital = userLocation && currentHospital?.lat && currentHospital?.lng
    ? calculateDistanceKm(userLocation.lat, userLocation.lng, currentHospital.lat, currentHospital.lng)
    : null;

  // 1. Language: English, Hindi, or Tamil (Universal Pan-India Multilingual)
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
        currentHospital,
        setCurrentHospital,
        nationalHospitals,
        userLocation,
        locationStatus,
        distanceToCurrentHospital,
        selectedEntranceGate,
        updateEntranceGate,
        detectLocation,
        dismissLocationBanner,
        locationBannerDismissed,
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
