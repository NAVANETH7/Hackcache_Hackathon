import React, { useState, useEffect } from 'react';
import { useJourney } from '../context/JourneyContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useSocket } from '../context/SocketContext';
import RegistrationWizard from '../components/patient/RegistrationWizard';
import FindSlipView from './FindSlipView';
import FindPlaceView from './FindPlaceView';
import MyTurnView from './MyTurnView';
import SlipCard from '../components/patient/SlipCard';
import NextActionCard from '../components/patient/NextActionCard';
import HelpCardModal from '../components/patient/HelpCardModal';
import SettingsModal from '../components/common/SettingsModal';
import HospitalMapModal from '../components/patient/HospitalMapModal';
import { 
  UserPlus, 
  FileText, 
  Compass, 
  LifeBuoy, 
  Globe, 
  Settings as SettingsIcon, 
  RefreshCw, 
  Clock, 
  ArrowRight,
  AlertTriangle,
  Map,
  Heart,
  Sparkles,
  Ticket,
  ChevronRight
} from 'lucide-react';

export default function PatientHome() {
  const { activeSlip, setPatientSlip, setHelpModalOpen } = useJourney();
  const { 
    language, 
    setLanguage, 
    hasChosenLanguage, 
    setHasChosenLanguage, 
    currentHospital,
    t 
  } = useAccessibility();
  const { lastUpdatedText } = useSocket();

  // Active view: 'home' | 'register' | 'have_slip' | 'find_place' | 'my_turn'
  const [activeTab, setActiveTab] = useState(() => (activeSlip ? 'my_turn' : 'home'));
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);

  // Listen to mobile bottom navigation events
  useEffect(() => {
    const handleMyTurn = () => {
      setActiveTab(activeSlip ? 'my_turn' : 'have_slip');
    };
    const handleFindPlace = () => {
      setActiveTab('find_place');
    };
    window.addEventListener('opd_nav_my_turn', handleMyTurn);
    window.addEventListener('opd_nav_find_place', handleFindPlace);

    return () => {
      window.removeEventListener('opd_nav_my_turn', handleMyTurn);
      window.removeEventListener('opd_nav_find_place', handleFindPlace);
    };
  }, [activeSlip]);

  // First-Visit Language Modal
  const [showLanguageModal, setShowLanguageModal] = useState(() => !hasChosenLanguage);

  const handleSelectInitialLanguage = (lang) => {
    setLanguage(lang);
    setHasChosenLanguage(true);
    setShowLanguageModal(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* ======================================================== */}
      {/* 1. FIRST-VISIT LANGUAGE PICKER MODAL                    */}
      {/* ======================================================== */}
      {showLanguageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#26352F]/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border-2 border-[#174E46] text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-[#D9E8DF] text-[#174E46] flex items-center justify-center mx-auto shadow-sm">
              <Globe size={34} />
            </div>

            <div>
              <h2 className="text-2xl font-black text-[#26352F] m-0">
                Choose Language / மொழி / भाषा
              </h2>
              <p className="text-xs text-[#52665C] font-semibold m-0 mt-2">
                Pan-India Public Hospital Network • OPD Saathi
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {/* Hindi (North & Central States) */}
              <button
                type="button"
                onClick={() => handleSelectInitialLanguage('hi')}
                className="w-full tap-button-primary p-4 rounded-2xl border-2 border-[#174E46] hover:bg-[#EEF4F0] bg-[#FAF8F3] text-[#26352F] font-black text-lg flex items-center justify-between shadow-sm transition-transform active:scale-98"
              >
                <div className="text-left">
                  <span className="block text-lg">हिंदी (Hindi)</span>
                  <span className="text-xs text-[#52665C] font-medium">उत्तर एवं मध्य भारत के सभी नागरिकों के लिए</span>
                </div>
                <span className="text-xs bg-[#174E46] text-[#F7F5EF] px-3.5 py-1.5 rounded-full font-bold">आगे बढ़ें</span>
              </button>

              {/* Tamil (Southern States) */}
              <button
                type="button"
                onClick={() => handleSelectInitialLanguage('ta')}
                className="w-full tap-button-primary p-4 rounded-2xl border-2 border-[#E3DED1] hover:border-[#174E46] hover:bg-[#EEF4F0] bg-[#FAF8F3] text-[#26352F] font-black text-lg flex items-center justify-between shadow-sm transition-transform active:scale-98"
              >
                <div className="text-left">
                  <span className="block text-lg">தமிழ் (Tamil)</span>
                  <span className="text-xs text-[#52665C] font-medium">தமிழ்நாடு மற்றும் தென் மாநில வாசகர்களுக்கு</span>
                </div>
                <span className="text-xs bg-[#D9E8DF] text-[#174E46] px-3.5 py-1.5 rounded-full font-bold">தொடரவும்</span>
              </button>

              {/* English (Universal Administrative) */}
              <button
                type="button"
                onClick={() => handleSelectInitialLanguage('en')}
                className="w-full tap-button-primary p-4 rounded-2xl border-2 border-[#E3DED1] hover:border-[#174E46] bg-white text-[#26352F] font-bold text-base flex items-center justify-between transition-colors"
              >
                <div className="text-left">
                  <span className="block text-base">English</span>
                  <span className="text-xs text-[#52665C] font-medium">Pan-India Universal Access</span>
                </div>
                <span className="text-xs bg-[#FAF8F3] text-[#52665C] border border-[#E3DED1] px-3 py-1 rounded-full">Select</span>
              </button>
            </div>

            {/* Pan-India Language Script Indicators */}
            <div className="pt-2 text-center border-t border-[#E3DED1]">
              <span className="text-[11px] font-bold text-[#52665C]">
                తెలుగు • ಕನ್ನಡ • മലയാളം • বাংলা • मराठी • ગુજરાતી
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ACTIVE SLIP PERSISTENT QUICK BAR                         */}
      {/* ======================================================== */}
      {activeSlip && (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#E3DED1] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 rounded-full bg-[#174E46] animate-pulse"></span>
            <div>
              <p className="text-xs font-black uppercase text-[#174E46] tracking-wider m-0">
                Active Token: <strong className="font-mono text-base tabular-nums">{activeSlip.tokenId}</strong> ({activeSlip.patientName})
              </p>
              <p className="text-xs text-[#52665C] font-semibold m-0 mt-0.5">
                {activeSlip.departmentName} • {activeSlip.assignedRoomNumber ? `Room ${activeSlip.assignedRoomNumber}` : activeSlip.assignedRoomId} (Floor {activeSlip.assignedFloor})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab(activeTab === 'my_turn' ? 'home' : 'my_turn')}
              className={`tap-target-large px-4 py-2 rounded-xl text-xs font-black transition-all ${
                activeTab === 'my_turn'
                  ? 'bg-[#174E46] text-white shadow-sm'
                  : 'bg-[#EEF4F0] text-[#174E46] hover:bg-[#D9E8DF]'
              }`}
            >
              {activeTab === 'my_turn' ? 'View Menu' : 'My Turn & Queue'}
            </button>

            <button
              onClick={() => {
                if (window.confirm('Clear active slip and start a new visit?')) {
                  setPatientSlip(null);
                  localStorage.removeItem('opd_saathi_active_slip');
                  setActiveTab('home');
                }
              }}
              title="Clear Slip"
              className="p-2 rounded-xl text-[#52665C] hover:text-[#26352F] hover:bg-[#FAF8F3] transition-colors"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. MAIN HOME SCREEN: CLEAN, MOBILE-FIRST LAYOUT          */}
      {/* ======================================================== */}
      {activeTab === 'home' && (
        <div className="space-y-4 sm:space-y-6 animate-fade-in">
          {/* Active Visit Spotlight (If token already issued) */}
          {activeSlip ? (
            <div className="bg-gradient-to-br from-[#174E46] to-[#0E352F] text-white p-5 sm:p-6 rounded-3xl shadow-lg border border-[#174E46] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 pointer-events-none" />
              
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-[#D9E8DF] text-[11px] font-black uppercase tracking-wider backdrop-blur-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{language === 'ta' ? 'செயலில் உள்ள டோக்கன்' : 'Active Token Visit'}</span>
                </span>
                <span className="font-mono text-xs text-[#D9E8DF] font-bold">
                  {lastUpdatedText}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-[#F2C66D]">
                      {activeSlip.tokenId}
                    </span>
                    <span className="text-sm font-bold text-[#D9E8DF]">
                      ({activeSlip.patientName})
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-white/90 m-0 mt-1">
                    {activeSlip.departmentName} • Room {activeSlip.assignedRoomNumber || activeSlip.assignedRoomId} (Floor {activeSlip.assignedFloor})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('my_turn')}
                    className="tap-target-large flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#F2C66D] hover:bg-amber-300 text-[#26352F] font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow transition-transform active:scale-95"
                  >
                    <span>{language === 'ta' ? 'நேரலை நிலவரம்' : 'View My Turn'}</span>
                    <ArrowRight size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Clear current token and start a new registration?')) {
                        setPatientSlip(null);
                        localStorage.removeItem('opd_saathi_active_slip');
                      }
                    }}
                    title="Clear Token"
                    className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#D9E8DF] transition-colors"
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Featured Hero Card: Register for OPD */
            <div className="bg-gradient-to-br from-[#174E46] via-[#1B584F] to-[#123C36] text-white p-5 sm:p-7 rounded-3xl shadow-lg border border-[#174E46] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-16 -mt-16 pointer-events-none" />
              
              <div className="relative z-10 max-w-xl">
                <span className="inline-block px-3 py-1 rounded-full bg-white/15 text-[#D9E8DF] text-[11px] font-black uppercase tracking-wider mb-2.5">
                  {currentHospital ? currentHospital.name : 'OPD Saathi'} • {t('app.title')}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white m-0">
                  {t('home.welcome')}
                </h2>
                <p className="text-xs sm:text-sm text-[#D9E8DF] m-0 mt-2 font-medium leading-relaxed">
                  {t('home.sub')}
                </p>

                {/* Primary Call to Action Button */}
                <div className="pt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    className="tap-target-large px-6 py-3.5 rounded-2xl bg-[#F2C66D] hover:bg-[#e4b85c] text-[#26352F] font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-md transition-transform active:scale-95 flex-1 sm:flex-initial"
                  >
                    <UserPlus size={20} className="text-[#174E46]" />
                    <span>{t('home.registerBtn')}</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions Grid: 2 columns on mobile, 4 on desktop */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-[#52665C] mb-2 px-1">
              {language === 'ta' ? 'விரைவு சேவைகள்' : language === 'hi' ? 'त्वरित सेवाएं' : 'Quick Actions'}
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
              {/* Quick Action 1: Have Slip */}
              <button
                type="button"
                onClick={() => setActiveTab('have_slip')}
                className="tap-target-large p-4 rounded-2xl bg-white hover:bg-[#FAF8F3] border border-[#E3DED1] hover:border-[#174E46] text-left shadow-xs transition-all active:scale-95 flex flex-col justify-between group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FAF8F3] text-[#174E46] border border-[#E3DED1] flex items-center justify-center mb-3 group-hover:bg-[#EEF4F0] transition-colors">
                  <FileText size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#26352F] m-0 group-hover:text-[#174E46] leading-tight">
                    {t('home.haveSlipBtn')}
                  </h4>
                  <p className="text-[11px] text-[#52665C] font-semibold m-0 mt-1 line-clamp-1">
                    Find by Phone / ID
                  </p>
                </div>
              </button>

              {/* Quick Action 2: Find Room / Dijkstra Route */}
              <button
                type="button"
                onClick={() => setActiveTab('find_place')}
                className="tap-target-large p-4 rounded-2xl bg-white hover:bg-[#FAF8F3] border border-[#E3DED1] hover:border-[#174E46] text-left shadow-xs transition-all active:scale-95 flex flex-col justify-between group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#EEF4F0] text-[#174E46] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Compass size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#26352F] m-0 group-hover:text-[#174E46] leading-tight">
                    {t('home.findPlaceBtn')}
                  </h4>
                  <p className="text-[11px] text-[#52665C] font-semibold m-0 mt-1 line-clamp-1">
                    Step-Free Navigation
                  </p>
                </div>
              </button>

              {/* Quick Action 3: 3-Floor Hospital Map */}
              <button
                type="button"
                onClick={() => setMapOpen(true)}
                className="tap-target-large p-4 rounded-2xl bg-white hover:bg-[#FAF8F3] border border-[#E3DED1] hover:border-[#174E46] text-left shadow-xs transition-all active:scale-95 flex flex-col justify-between group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F7F5EF] text-[#26352F] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Map size={20} className="text-[#174E46]" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#26352F] m-0 group-hover:text-[#174E46] leading-tight">
                    {language === 'ta' ? '3-தள வரைபடம்' : 'Hospital Map'}
                  </h4>
                  <p className="text-[11px] text-[#52665C] font-semibold m-0 mt-1 line-clamp-1">
                    Interactive Layout
                  </p>
                </div>
              </button>

              {/* Quick Action 4: Guard Help Card */}
              <button
                type="button"
                onClick={() => setHelpModalOpen(true)}
                className="tap-target-large p-4 rounded-2xl bg-[#FAF8F3] hover:bg-[#FDF7EA] border border-[#E3DED1] hover:border-[#F2C66D] text-left shadow-xs transition-all active:scale-95 flex flex-col justify-between group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F2C66D] text-[#26352F] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-xs">
                  <LifeBuoy size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#26352F] m-0 leading-tight">
                    {language === 'ta' ? 'உதவி அட்டை' : language === 'hi' ? 'सहायता कार्ड' : 'Guard Help'}
                  </h4>
                  <p className="text-[11px] text-[#52665C] font-semibold m-0 mt-1 line-clamp-1">
                    Show to Attendant
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Secondary Utilities & Caregiver Row */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 p-3.5 bg-white rounded-2xl border border-[#E3DED1] text-xs">
            <div className="flex items-center gap-2">
              <a
                href={activeSlip ? `/track?token=${activeSlip.tokenId}` : '/track?token=OPD-7429'}
                className="tap-target-large inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold bg-[#FAF8F3] text-[#26352F] border border-[#E3DED1] hover:bg-[#EEF4F0] no-underline transition-colors"
              >
                <Heart size={14} className="text-[#C93B2B]" />
                <span>{language === 'ta' ? 'குடும்ப நேரலை இணைப்பு' : 'Caregiver Tracker'}</span>
              </a>

              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                className="p-2 rounded-xl text-[#52665C] hover:text-[#26352F] hover:bg-[#FAF8F3] transition-colors"
                title="Settings"
              >
                <SettingsIcon size={16} />
              </button>
            </div>

            <span className="text-[11px] font-semibold text-[#52665C]">
              {t('home.tagline')}
            </span>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. REGISTRATION WIZARD VIEW                             */}
      {/* ======================================================== */}
      {activeTab === 'register' && (
        <div className="space-y-4">
          <button
            onClick={() => setActiveTab('home')}
            className="text-xs font-bold text-[#52665C] hover:text-[#26352F] flex items-center gap-1 mb-2"
          >
            ← {language === 'ta' ? 'முதன்மை பக்கத்திற்கு திரும்ப' : language === 'hi' ? 'मुख्य पृष्ठ पर वापस' : 'Back to Home'}
          </button>
          <RegistrationWizard 
            onCancel={() => setActiveTab('home')}
            onFinish={() => setActiveTab('my_turn')}
          />
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. I HAVE MY SLIP VIEW                                   */}
      {/* ======================================================== */}
      {activeTab === 'have_slip' && (
        <div className="space-y-4">
          <button
            onClick={() => setActiveTab('home')}
            className="text-xs font-bold text-[#52665C] hover:text-[#26352F] flex items-center gap-1 mb-2"
          >
            ← {language === 'ta' ? 'முதன்மை பக்கத்திற்கு திரும்ப' : language === 'hi' ? 'मुख्य पृष्ठ पर वापस' : 'Back to Home'}
          </button>
          <FindSlipView onFound={() => setActiveTab('my_turn')} />
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. FIND A PLACE VIEW                                     */}
      {/* ======================================================== */}
      {activeTab === 'find_place' && (
        <div className="space-y-4">
          <button
            onClick={() => setActiveTab('home')}
            className="text-xs font-bold text-[#52665C] hover:text-[#26352F] flex items-center gap-1 mb-2"
          >
            ← {language === 'ta' ? 'முதன்மை பக்கத்திற்கு திரும்ப' : language === 'hi' ? 'मुख्य पृष्ठ पर वापस' : 'Back to Home'}
          </button>
          <FindPlaceView />
        </div>
      )}

      {/* ======================================================== */}
      {/* 6. MY TURN & LIVE QUEUE VIEW                             */}
      {/* ======================================================== */}
      {activeTab === 'my_turn' && (
        <div className="space-y-6">
          <NextActionCard />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <SlipCard />
            <MyTurnView onNavigateToRoute={() => setActiveTab('find_place')} />
          </div>
        </div>
      )}

      {/* Settings Modal */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* Hospital 3-Floor Map Modal */}
      <HospitalMapModal isOpen={mapOpen} onClose={() => setMapOpen(false)} />

      {/* Persistent Help Modal */}
      <HelpCardModal />
    </div>
  );
}
