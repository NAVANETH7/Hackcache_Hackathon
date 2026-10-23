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
import { 
  UserPlus, 
  FileText, 
  Compass, 
  AlertTriangle, 
  Globe, 
  Settings as SettingsIcon, 
  RefreshCw, 
  Check, 
  Clock, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function PatientHome() {
  const { activeSlip, setPatientSlip } = useJourney();
  const { 
    language, 
    setLanguage, 
    hasChosenLanguage, 
    setHasChosenLanguage, 
    t 
  } = useAccessibility();
  const { serverState, lastUpdatedText } = useSocket();

  // Active view inside Patient space: 'home' | 'register' | 'have_slip' | 'find_place' | 'my_turn' | 'slip_details'
  const [activeTab, setActiveTab] = useState(() => (activeSlip ? 'my_turn' : 'home'));
  const [settingsOpen, setSettingsOpen] = useState(false);

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border-4 border-emerald-600 text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-inner">
              <Globe size={36} />
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900 m-0">
                Choose Language / भाषा चुनें / மொழியைத் தேர்ந்தெடுக்கவும்
              </h2>
              <p className="text-xs text-slate-600 font-bold m-0 mt-2">
                City District Hospital • Adaptive Health Journey Companion
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {/* Hindi */}
              <button
                type="button"
                onClick={() => handleSelectInitialLanguage('hi')}
                className="w-full tap-target-large p-4 rounded-2xl border-3 border-emerald-500 hover:border-emerald-600 bg-emerald-50 text-emerald-950 font-black text-lg flex items-center justify-between shadow-md transition-transform active:scale-98"
              >
                <span>हिंदी (Hindi)</span>
                <span className="text-xs bg-emerald-200 text-emerald-900 px-3 py-1 rounded-full font-bold">आगे बढ़ें</span>
              </button>

              {/* Tamil (Kamla's Native Language) */}
              <button
                type="button"
                onClick={() => handleSelectInitialLanguage('ta')}
                className="w-full tap-target-large p-4 rounded-2xl border-3 border-emerald-500 hover:border-emerald-600 bg-emerald-50 text-emerald-950 font-black text-lg flex items-center justify-between shadow-md transition-transform active:scale-98"
              >
                <span>தமிழ் (Tamil)</span>
                <span className="text-xs bg-emerald-200 text-emerald-900 px-3 py-1 rounded-full font-bold">தொடரவும்</span>
              </button>

              {/* English */}
              <button
                type="button"
                onClick={() => handleSelectInitialLanguage('en')}
                className="w-full tap-target-large p-4 rounded-2xl border-2 border-slate-300 hover:border-slate-400 bg-white text-slate-800 font-bold text-base flex items-center justify-between transition-colors"
              >
                <span>English</span>
                <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full">Select</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* PATIENT ACTIVE SLIP QUICK ACCESS HEADER (IF PRESENT)     */}
      {/* ======================================================== */}
      {activeSlip && (
        <div className="bg-white p-4 rounded-3xl shadow-sm border-2 border-emerald-300 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-ping"></span>
            <div>
              <p className="text-xs font-black uppercase text-emerald-800 tracking-wider m-0">
                Active Token: <strong className="font-mono text-base">{activeSlip.tokenId}</strong> ({activeSlip.patientName})
              </p>
              <p className="text-xs text-slate-600 font-bold m-0 mt-0.5">
                {activeSlip.departmentName} • {activeSlip.assignedRoomNumber ? `Room ${activeSlip.assignedRoomNumber}` : activeSlip.assignedRoomId} (Floor {activeSlip.assignedFloor})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab(activeTab === 'my_turn' ? 'home' : 'my_turn')}
              className={`tap-target-large px-4 py-2 rounded-xl text-xs font-black transition-all ${
                activeTab === 'my_turn'
                  ? 'bg-emerald-700 text-white shadow'
                  : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
              }`}
            >
              {activeTab === 'my_turn' ? 'View Menu' : 'My Turn & Queue'}
            </button>

            <button
              onClick={() => {
                if (window.confirm('Clear active slip and start fresh registration?')) {
                  setPatientSlip(null);
                  localStorage.removeItem('opd_saathi_active_slip');
                  setActiveTab('home');
                }
              }}
              title="Clear Slip"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. MAIN HOME SCREEN: 4 BIG BUTTONS                      */}
      {/* ======================================================== */}
      {activeTab === 'home' && (
        <div className="space-y-6 animate-fade-in">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-2 relative overflow-hidden">
            <div className="relative z-10 max-w-xl">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-700 text-emerald-200 text-xs font-black uppercase tracking-wider mb-2">
                City District Hospital • OPD Saathi
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white m-0">
                {t('home.welcome')}
              </h2>
              <p className="text-sm font-semibold text-emerald-100 m-0 mt-1.5 leading-relaxed">
                {t('home.sub')}
              </p>
            </div>
            <div className="text-[11px] font-bold text-emerald-300 pt-2 flex items-center gap-2">
              <Clock size={14} />
              <span>{t('app.lastSynced')}: {lastUpdatedText}</span>
            </div>
          </div>

          {/* THE 4 BIG BUTTONS (WCAG AAA Target: >56px tall, icon + plain word) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Button 1: Register */}
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className="tap-target-large p-6 rounded-3xl bg-white hover:bg-emerald-50 border-3 border-emerald-600 text-left shadow-lg transition-transform active:scale-98 flex items-start gap-4 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-md">
                <UserPlus size={30} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black text-slate-900 m-0 group-hover:text-emerald-800">
                  {t('home.registerBtn')}
                </h3>
                <p className="text-xs font-bold text-slate-600 m-0 mt-1">
                  {t('home.registerDesc')}
                </p>
              </div>
            </button>

            {/* Button 2: I Have My Slip */}
            <button
              type="button"
              onClick={() => setActiveTab('have_slip')}
              className="tap-target-large p-6 rounded-3xl bg-white hover:bg-emerald-50 border-3 border-slate-300 hover:border-emerald-500 text-left shadow-lg transition-transform active:scale-98 flex items-start gap-4 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-md">
                <FileText size={30} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black text-slate-900 m-0 group-hover:text-emerald-800">
                  {t('home.haveSlipBtn')}
                </h3>
                <p className="text-xs font-bold text-slate-600 m-0 mt-1">
                  {t('home.haveSlipDesc')}
                </p>
              </div>
            </button>

            {/* Button 3: Find a Place */}
            <button
              type="button"
              onClick={() => setActiveTab('find_place')}
              className="tap-target-large p-6 rounded-3xl bg-white hover:bg-emerald-50 border-3 border-slate-300 hover:border-emerald-500 text-left shadow-lg transition-transform active:scale-98 flex items-start gap-4 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-teal-700 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-md">
                <Compass size={30} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black text-slate-900 m-0 group-hover:text-teal-800">
                  {t('home.findPlaceBtn')}
                </h3>
                <p className="text-xs font-bold text-slate-600 m-0 mt-1">
                  {t('home.findPlaceDesc')}
                </p>
              </div>
            </button>

            {/* Button 4: Emergency */}
            <a
              href="/emergency"
              className="tap-target-large p-6 rounded-3xl bg-red-600 hover:bg-red-700 text-white text-left shadow-xl transition-transform active:scale-98 flex items-start gap-4 no-underline group animate-urgent"
            >
              <div className="w-14 h-14 rounded-2xl bg-white text-red-700 flex items-center justify-center flex-shrink-0 shadow-md">
                <AlertTriangle size={32} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-black text-white m-0">
                  {t('home.emergencyBtn')}
                </h3>
                <p className="text-xs font-bold text-red-100 m-0 mt-1">
                  {t('home.emergencyDesc')}
                </p>
              </div>
            </a>
          </div>

          {/* Quick Settings & Help Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200">
            <button
              onClick={() => setSettingsOpen(true)}
              className="tap-target-large flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <SettingsIcon size={18} className="text-slate-500" />
              <span>{t('home.settingsBtn')}</span>
            </button>

            <span className="text-xs font-bold text-slate-500">
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
            className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 mb-2"
          >
            ← Back to Home
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
            className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 mb-2"
          >
            ← Back to Home
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
            className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 mb-2"
          >
            ← Back to Home
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

      {/* Persistent Help Modal */}
      <HelpCardModal />
    </div>
  );
}
