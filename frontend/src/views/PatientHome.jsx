import React, { useState } from 'react';
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
  Heart
} from 'lucide-react';

export default function PatientHome() {
  const { activeSlip, setPatientSlip, setHelpModalOpen } = useJourney();
  const { 
    language, 
    setLanguage, 
    hasChosenLanguage, 
    setHasChosenLanguage, 
    t 
  } = useAccessibility();
  const { lastUpdatedText } = useSocket();

  // Active view: 'home' | 'register' | 'have_slip' | 'find_place' | 'my_turn'
  const [activeTab, setActiveTab] = useState(() => (activeSlip ? 'my_turn' : 'home'));
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);

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
      {/* 2. MAIN HOME SCREEN: THE 4 ESSENTIAL ACTIONS             */}
      {/* ======================================================== */}
      {activeTab === 'home' && (
        <div className="space-y-6 animate-fade-in">
          {/* Active Journey Card shown directly on Home if patient has registered */}
          {activeSlip && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-[#174E46] tracking-wider">
                  Your Confirmed Visit Status
                </span>
                <button
                  onClick={() => setActiveTab('my_turn')}
                  className="text-xs font-bold text-[#174E46] hover:underline flex items-center gap-1"
                >
                  <span>Open Full Tracker</span>
                  <ArrowRight size={14} />
                </button>
              </div>
              <NextActionCard />
            </div>
          )}

          {/* Welcome Quiet Confidence Editorial Banner */}
          <div className="bg-[#174E46] text-[#F7F5EF] p-6 sm:p-8 rounded-3xl shadow-sm space-y-2 border border-[#174E46]">
            <div className="max-w-xl">
              <span className="inline-block px-3 py-1 rounded-full bg-[#123C36] text-[#D9E8DF] text-xs font-bold uppercase tracking-wider mb-2">
                City District Hospital • OPD Saathi
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#F7F5EF] m-0">
                {t('home.welcome')}
              </h2>
              <p className="text-sm font-medium text-[#D9E8DF] m-0 mt-2 leading-relaxed">
                {t('home.sub')}
              </p>
            </div>
            <div className="text-[11px] font-medium text-[#D9E8DF]/90 pt-3 flex items-center gap-2">
              <Clock size={14} />
              <span>{t('app.lastSynced')}: {lastUpdatedText}</span>
            </div>
          </div>

          {/* THE 4 PRIMARY ACTIONS (WCAG 2.2 AA / AAA: >=56px tall, icon + word + subtitle) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Action 1: Register for OPD */}
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className="tap-button-primary p-6 rounded-3xl bg-white hover:bg-[#FAF8F3] border-2 border-[#174E46] text-left shadow-sm transition-transform active:scale-98 flex items-start gap-4 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#174E46] text-[#F7F5EF] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                <UserPlus size={28} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black text-[#26352F] m-0 group-hover:text-[#174E46]">
                  {t('home.registerBtn')}
                </h3>
                <p className="text-xs font-semibold text-[#52665C] m-0 mt-1.5 leading-snug">
                  {t('home.registerDesc')}
                </p>
              </div>
            </button>

            {/* Action 2: I Have My Slip */}
            <button
              type="button"
              onClick={() => setActiveTab('have_slip')}
              className="tap-button-primary p-6 rounded-3xl bg-white hover:bg-[#FAF8F3] border-2 border-[#E3DED1] hover:border-[#174E46] text-left shadow-sm transition-transform active:scale-98 flex items-start gap-4 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#FAF8F3] text-[#26352F] border border-[#E3DED1] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                <FileText size={28} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black text-[#26352F] m-0 group-hover:text-[#174E46]">
                  {t('home.haveSlipBtn')}
                </h3>
                <p className="text-xs font-semibold text-[#52665C] m-0 mt-1.5 leading-snug">
                  {t('home.haveSlipDesc')}
                </p>
              </div>
            </button>

            {/* Action 3: Find a Place */}
            <button
              type="button"
              onClick={() => setActiveTab('find_place')}
              className="tap-button-primary p-6 rounded-3xl bg-white hover:bg-[#FAF8F3] border-2 border-[#E3DED1] hover:border-[#174E46] text-left shadow-sm transition-transform active:scale-98 flex items-start gap-4 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#EEF4F0] text-[#174E46] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                <Compass size={28} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black text-[#26352F] m-0 group-hover:text-[#174E46]">
                  {t('home.findPlaceBtn')}
                </h3>
                <p className="text-xs font-semibold text-[#52665C] m-0 mt-1.5 leading-snug">
                  {t('home.findPlaceDesc')}
                </p>
              </div>
            </button>

            {/* Action 4: Get Help & Emergency */}
            <button
              type="button"
              onClick={() => setHelpModalOpen(true)}
              className="tap-button-primary p-6 rounded-3xl bg-[#FAF8F3] hover:bg-[#FDF7EA] border-2 border-[#E3DED1] hover:border-[#F2C66D] text-left shadow-sm transition-transform active:scale-98 flex items-start gap-4 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#F2C66D] text-[#26352F] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-sm">
                <LifeBuoy size={28} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-[#26352F] m-0">
                    {language === 'ta' ? 'உதவி பெறுக' : language === 'hi' ? 'सहायता प्राप्त करें' : 'Get Help'}
                  </h3>
                  <a
                    href="/emergency"
                    onClick={(e) => e.stopPropagation()}
                    className="px-2 py-0.5 rounded-full bg-[#C93B2B] text-white text-[10px] font-black uppercase tracking-wider no-underline"
                  >
                    Emergency
                  </a>
                </div>
                <p className="text-xs font-semibold text-[#52665C] m-0 mt-1.5 leading-snug">
                  {language === 'ta' 
                    ? 'பாதுகாவலர் உதவி அட்டை அல்லது அவசர சிகிச்சை (Casualty)' 
                    : language === 'hi'
                    ? 'सुरक्षा गार्ड सहायता कार्ड या आपातकालीन वार्ड'
                    : 'Show guard help card, request attendant, or go to Emergency'}
                </p>
              </div>
            </button>
          </div>

          {/* Quick Settings, 3-Floor Map & Family Companion Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-[#E3DED1]">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setMapOpen(true)}
                className="tap-target-large flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#FAF8F3] text-[#174E46] border border-[#E3DED1] hover:bg-[#EEF4F0] transition-colors"
              >
                <Map size={16} />
                <span>{language === 'ta' ? '3-தள வரைபடம்' : '3-Floor Hospital Map'}</span>
              </button>

              <a
                href={activeSlip ? `/track?token=${activeSlip.tokenId}` : '/track?token=OPD-7429'}
                className="tap-target-large flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#FAF8F3] text-[#26352F] border border-[#E3DED1] hover:bg-[#EEF4F0] no-underline transition-colors"
              >
                <Heart size={16} className="text-[#C93B2B]" />
                <span>{language === 'ta' ? 'குடும்ப நேரலை இணைப்பு' : 'Caregiver Live Tracker'}</span>
              </a>

              <button
                type="button"
                onClick={() => setSettingsOpen(true)}
                className="tap-target-large flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#52665C] hover:text-[#26352F] hover:bg-[#FAF8F3] transition-colors"
              >
                <SettingsIcon size={16} className="text-[#52665C]" />
                <span>{t('home.settingsBtn')}</span>
              </button>
            </div>

            <span className="text-xs font-medium text-[#52665C]">
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
