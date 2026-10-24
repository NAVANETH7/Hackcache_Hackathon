import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useJourney } from '../../context/JourneyContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { departments } from '../../data/departments';
import { speakText, stopSpeaking } from '../../utils/speech';
import { demographicPersonas } from '../../data/demographicPersonas';
import AbhaCardModal from './AbhaCardModal';
import { 
  UserPlus, 
  Sparkles, 
  AlertTriangle, 
  Mic, 
  MicOff, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  HelpCircle, 
  Volume2, 
  HeartHandshake,
  Stethoscope,
  Baby,
  Heart,
  Bone,
  Ear,
  Eye,
  Activity,
  ShieldAlert,
  QrCode,
  CreditCard,
  BadgeCheck,
  Users
} from 'lucide-react';

export default function RegistrationWizard({ onCancel, onFinish }) {
  const { registerPatient } = useSocket();
  const { setPatientSlip } = useJourney();
  const { 
    language, 
    setLanguage, 
    assistedMode, 
    setAssistedMode, 
    readAloud, 
    avoidStairsDefault,
    t 
  } = useAccessibility();

  // Step 0: Emergency triage screening
  // Step 1: Name
  // Step 2: Age
  // Step 3: Gender
  // Step 4: Mobile Number
  // Step 5: Which doctor do you need?
  const [currentStep, setCurrentStep] = useState(0);

  const [formData, setFormData] = useState({
    patientName: '',
    age: '',
    gender: 'Female',
    mobile: '',
    departmentId: 'ortho',
    avoidStairs: avoidStairsDefault,
    assistedMode: assistedMode,
    language: language
  });

  const [isListening, setIsListening] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHelpDeskRoute, setShowHelpDeskRoute] = useState(false);
  const [abhaModalOpen, setAbhaModalOpen] = useState(false);
  const [activeAbhaPersona, setActiveAbhaPersona] = useState(null);

  // Web Speech Recognition for voice input
  const startSpeechRecognition = (fieldName) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported on this browser. Please type your answer.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'ta' ? 'ta-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);
      recognition.start();

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (fieldName === 'age') {
          const num = parseInt(transcript.replace(/\D/g, ''), 10);
          if (!isNaN(num)) setFormData(prev => ({ ...prev, age: num }));
        } else {
          setFormData(prev => ({ ...prev, [fieldName]: transcript }));
        }
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
    } catch {
      setIsListening(false);
    }
  };

  // 1-Click Pan-India Citizen Persona Selector
  const handleSelectPersona = (persona) => {
    setFormData({
      patientName: persona.patientName,
      age: persona.age,
      gender: persona.gender,
      mobile: persona.mobile,
      abhaId: persona.abhaId,
      departmentId: persona.departmentId,
      avoidStairs: persona.avoidStairs,
      assistedMode: persona.assistedMode,
      language: persona.language
    });
    setLanguage(persona.language);
    setAssistedMode(persona.assistedMode);
    setCurrentStep(5); // Jump directly to department choice for instant preview
    speakText(
      language === 'ta'
        ? `${persona.patientName} விவரங்கள் ஏற்றப்பட்டது`
        : `Selected demographic: ${persona.patientName}. Proceeding to ${persona.departmentName}`,
      persona.language
    );
  };

  // 1-Click ABHA (Ayushman Bharat Digital Health Account) Verification Scan
  const handleSimulateAbhaScan = () => {
    const persona = demographicPersonas[4]; // Anand Joshi (student with digital ABHA)
    setActiveAbhaPersona(persona);
    setAbhaModalOpen(true);
  };

  // Read step instructions aloud if readAloud is enabled
  useEffect(() => {
    if (!readAloud && !assistedMode) return;

    if (currentStep === 0) {
      speakText(t('emergencyNotice.title') + '. ' + t('emergencyNotice.anyOfThese'), language);
    } else if (currentStep === 1) {
      speakText(t('wizard.nameTitle'), language);
    } else if (currentStep === 2) {
      speakText(t('wizard.ageTitle'), language);
    } else if (currentStep === 3) {
      speakText(t('wizard.genderTitle'), language);
    } else if (currentStep === 4) {
      speakText(t('wizard.mobileTitle'), language);
    } else if (currentStep === 5) {
      speakText(t('wizard.deptTitle'), language);
    }

    return () => stopSpeaking();
  }, [currentStep, language, readAloud, assistedMode]);

  // Handle Form Submission
  const handleSubmitRegistration = async () => {
    setIsSubmitting(true);
    try {
      const token = await registerPatient(formData);
      setPatientSlip(token);
      if (onFinish) onFinish(token);
    } catch (err) {
      alert(`Registration error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper mode toggle ("Someone is helping me")
  const handleToggleHelperMode = (val) => {
    setAssistedMode(val);
    setFormData(prev => ({ ...prev, assistedMode: val }));
  };

  // Department icon mapper
  const getDeptIcon = (iconName) => {
    switch (iconName) {
      case 'Baby': return <Baby size={28} className="text-amber-500" />;
      case 'Heart': return <Heart size={28} className="text-rose-500" />;
      case 'Bone': return <Bone size={28} className="text-blue-500" />;
      case 'Ear': return <Ear size={28} className="text-teal-500" />;
      case 'Eye': return <Eye size={28} className="text-indigo-500" />;
      case 'Activity': return <Activity size={28} className="text-emerald-500" />;
      default: return <Stethoscope size={28} className="text-emerald-600" />;
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-qc-bg rounded-3xl shadow-xl border-2 border-qc-border overflow-hidden animate-fade-in text-qc-text">
      {/* Universal Pan-India Citizen Quick Profiles & ABHA Scan */}
      <div className="bg-qc-primary text-qc-bg p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 font-black uppercase tracking-wider text-qc-amber">
            <Users size={16} />
            <span>{language === 'ta' ? 'அனைத்து குடிமக்கள் முன்மாதிரிகள் (Demo)' : 'Pan-India Citizen Presets (Demo)'}</span>
          </div>

          {/* Someone is helping me toggle */}
          <label className="flex items-center gap-1.5 cursor-pointer select-none text-xs font-bold text-qc-sage">
            <input
              type="checkbox"
              checked={assistedMode}
              onChange={(e) => handleToggleHelperMode(e.target.checked)}
              className="w-4 h-4 rounded text-qc-primary accent-qc-amber"
            />
            <span>{t('wizard.helperMode')}</span>
          </label>
        </div>

        {/* Horizontal Persona Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {demographicPersonas.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelectPersona(p)}
              className="tap-target-large flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs whitespace-nowrap active:scale-95 transition-all shadow-sm flex-shrink-0"
              title={`${p.patientName} (${p.state}) - ${p.reason}`}
            >
              <span>{p.icon}</span>
              <span className="font-extrabold">{p.patientName.split(' ')[0]}</span>
              <span className="text-[10px] text-qc-sage">({p.age}y • {p.stateCode})</span>
            </button>
          ))}

          {/* ABHA Instant Card Scan */}
          <button
            type="button"
            onClick={handleSimulateAbhaScan}
            className="tap-target-large flex items-center gap-1.5 px-3 py-2 rounded-xl bg-qc-amber hover:bg-amber-300 text-qc-text font-black text-xs whitespace-nowrap active:scale-95 transition-all shadow flex-shrink-0"
            title="Scan National Health Account (ABHA)"
          >
            <QrCode size={14} />
            <span>⚡ ABHA Scan</span>
          </button>
        </div>
      </div>

      {/* Progress Bar (Steps 1 to 5) */}
      {currentStep > 0 && (
        <div className="bg-qc-sage/30 border-b border-qc-border px-6 py-3">
          <div className="flex items-center justify-between text-xs font-black text-qc-text uppercase tracking-wider mb-1.5">
            <span>{t('wizard.step')} {currentStep} {t('wizard.of')} 5</span>
            <span className="text-qc-primary font-mono">{Math.round((currentStep / 5) * 100)}%</span>
          </div>
          <div className="w-full h-2.5 bg-qc-sage rounded-full overflow-hidden">
            <div 
              className="h-full bg-qc-primary rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Wizard Content Body */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* ======================================================== */}
        {/* STEP 0: MANDATORY EMERGENCY SAFETY SCREENING GATE       */}
        {/* ======================================================== */}
        {currentStep === 0 && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-center gap-3 text-red-600">
              <ShieldAlert size={36} className="flex-shrink-0 animate-bounce-gentle" />
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight m-0">
                  {t('emergencyNotice.title')}
                </h2>
                <p className="text-xs font-extrabold text-red-600 uppercase tracking-wider m-0">
                  {t('emergencyNotice.signsHeader')}
                </p>
              </div>
            </div>

            {/* List of Emergency Signs */}
            <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 space-y-2 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold text-slate-900">
                <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-red-200">
                  <span className="w-2 h-2 rounded-full bg-red-600"></span>
                  <span>{t('emergencyNotice.sign1')}</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-red-200">
                  <span className="w-2 h-2 rounded-full bg-red-600"></span>
                  <span>{t('emergencyNotice.sign2')}</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-red-200">
                  <span className="w-2 h-2 rounded-full bg-red-600"></span>
                  <span>{t('emergencyNotice.sign3')}</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-red-200">
                  <span className="w-2 h-2 rounded-full bg-red-600"></span>
                  <span>{t('emergencyNotice.sign4')}</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-red-200">
                  <span className="w-2 h-2 rounded-full bg-red-600"></span>
                  <span>{t('emergencyNotice.sign5')}</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-red-200">
                  <span className="w-2 h-2 rounded-full bg-red-600"></span>
                  <span>{t('emergencyNotice.sign6')}</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-red-200">
                  <span className="w-2 h-2 rounded-full bg-red-600"></span>
                  <span>{t('emergencyNotice.sign7')}</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-red-200">
                  <span className="w-2 h-2 rounded-full bg-red-600"></span>
                  <span>{t('emergencyNotice.sign8')}</span>
                </div>
              </div>

              <p className="text-sm font-black text-red-900 pt-2 m-0 text-center">
                {t('emergencyNotice.anyOfThese')}
              </p>
            </div>

            {/* Direct Casualty Button */}
            <a
              href="/emergency"
              className="w-full tap-target-large py-4 px-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-base flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-98 no-underline"
            >
              <AlertTriangle size={22} />
              <span>{t('emergencyNotice.goToCasualty')}</span>
            </a>

            {/* Continue to regular OPD */}
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="w-full tap-target-large py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-sm border-2 border-slate-300 transition-colors"
            >
              {t('emergencyNotice.noEmergencyContinue')} →
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 1: PATIENT NAME                                    */}
        {/* ======================================================== */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <h2 className="text-2xl font-black text-slate-900 m-0">
                {t('wizard.nameTitle')}
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                {language === 'ta' ? 'அடையாள அட்டை அல்லது நினைவில் உள்ள பெயர்' : 'First name as remembered or on ID'}
              </p>
            </div>

            <div className="relative">
              <input
                type="text"
                autoFocus
                value={formData.patientName}
                onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                placeholder={t('wizard.namePlaceholder')}
                className="w-full tap-target-large px-5 py-4 rounded-2xl border-3 border-slate-300 focus:border-emerald-600 font-black text-xl text-slate-900 outline-none pr-16"
              />
              <button
                type="button"
                onClick={() => startSpeechRecognition('patientName')}
                className={`absolute right-3 top-2.5 p-3 rounded-xl transition-all ${
                  isListening ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-100 text-slate-700 hover:bg-emerald-100'
                }`}
                title={t('wizard.speakMicrophone')}
              >
                {isListening ? <MicOff size={22} /> : <Mic size={22} />}
              </button>
            </div>

            {isListening && (
              <p className="text-xs font-bold text-red-600 animate-pulse m-0">
                🎙️ {t('wizard.listening')}
              </p>
            )}

            {/* Avoid stairs toggle */}
            <div 
              onClick={() => setFormData({ ...formData, avoidStairs: !formData.avoidStairs })}
              className="p-4 rounded-2xl border-2 border-emerald-300 bg-emerald-50/70 cursor-pointer flex items-center justify-between select-none"
            >
              <div>
                <p className="text-sm font-black text-slate-950 m-0">
                  {t('registration.avoidStairs')}
                </p>
                <p className="text-xs text-slate-600 font-semibold m-0 mt-0.5">
                  {t('registration.avoidStairsHint')}
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.avoidStairs}
                onChange={() => {}}
                className="w-6 h-6 text-emerald-600 rounded"
              />
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 2: PATIENT AGE                                     */}
        {/* ======================================================== */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <h2 className="text-2xl font-black text-slate-900 m-0">
                {t('wizard.ageTitle')}
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                {language === 'ta' ? 'வயது தோராயமாக இருக்கலாம்' : 'Approximate age is acceptable'}
              </p>
            </div>

            <div className="relative">
              <input
                type="number"
                autoFocus
                min={1}
                max={120}
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="e.g. 62"
                className="w-full tap-target-large px-5 py-4 rounded-2xl border-3 border-slate-300 focus:border-emerald-600 font-black text-3xl text-slate-900 outline-none pr-16"
              />
              <button
                type="button"
                onClick={() => startSpeechRecognition('age')}
                className={`absolute right-3 top-2.5 p-3 rounded-xl transition-all ${
                  isListening ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-100 text-slate-700 hover:bg-emerald-100'
                }`}
                title={t('wizard.speakMicrophone')}
              >
                {isListening ? <MicOff size={22} /> : <Mic size={22} />}
              </button>
            </div>

            {/* Quick age chips */}
            <div className="flex flex-wrap gap-2 pt-2">
              {[25, 40, 55, 62, 70, 80].map(chipAge => (
                <button
                  key={chipAge}
                  type="button"
                  onClick={() => setFormData({ ...formData, age: chipAge })}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${
                    formData.age === chipAge ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-slate-100 text-slate-800 border-slate-300'
                  }`}
                >
                  {chipAge} yrs
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 3: PATIENT GENDER                                  */}
        {/* ======================================================== */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <h2 className="text-2xl font-black text-slate-900 m-0">
                {t('wizard.genderTitle')}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {['Female', 'Male', 'Other'].map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: g })}
                  className={`tap-target-large p-5 rounded-2xl border-3 font-black text-lg flex items-center justify-center gap-2 transition-all ${
                    formData.gender === g
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-md ring-2 ring-emerald-400'
                      : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                  }`}
                >
                  <span>
                    {g === 'Female' ? t('wizard.female') : g === 'Male' ? t('wizard.male') : t('wizard.other')}
                  </span>
                  {formData.gender === g && <Check size={20} className="text-emerald-700" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 4: MOBILE NUMBER (OPTIONAL)                        */}
        {/* ======================================================== */}
        {currentStep === 4 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <h2 className="text-2xl font-black text-slate-900 m-0">
                {t('wizard.mobileTitle')}
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                {t('wizard.mobileHint')}
              </p>
            </div>

            <div className="relative">
              <input
                type="tel"
                autoFocus
                maxLength={10}
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })}
                placeholder={t('wizard.mobilePlaceholder')}
                className="w-full tap-target-large px-5 py-4 rounded-2xl border-3 border-slate-300 focus:border-emerald-600 font-black text-2xl text-slate-900 outline-none pr-16 tracking-widest"
              />
              <button
                type="button"
                onClick={() => startSpeechRecognition('mobile')}
                className={`absolute right-3 top-2.5 p-3 rounded-xl transition-all ${
                  isListening ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-100 text-slate-700 hover:bg-emerald-100'
                }`}
                title={t('wizard.speakMicrophone')}
              >
                {isListening ? <MicOff size={22} /> : <Mic size={22} />}
              </button>
            </div>

            <p className="text-xs text-slate-500 font-medium m-0">
              * If you don't have a phone with you, simply leave it blank and tap Next.
            </p>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 5: WHICH DOCTOR DO YOU NEED? (PICTURE CARDS)       */}
        {/* ======================================================== */}
        {currentStep === 5 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h2 className="text-2xl font-black text-slate-900 m-0">
                {t('wizard.deptTitle')}
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                {t('wizard.deptSubtitle')}
              </p>
            </div>

            {/* Department Picture Cards */}
            <div className="grid grid-cols-1 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
              {departments.map((dept) => {
                const isSelected = formData.departmentId === dept.id;
                const deptName = language === 'ta' ? dept.name_ta : language === 'hi' ? dept.name_hi : dept.name;
                const plainWords = language === 'ta' ? dept.plainWords_ta : language === 'hi' ? dept.plainWords_hi : dept.plainWords;

                return (
                  <div
                    key={dept.id}
                    onClick={() => setFormData({ ...formData, departmentId: dept.id })}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 select-none ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/80 shadow-md ring-2 ring-emerald-400'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="p-2.5 rounded-xl bg-slate-100 mt-0.5 flex-shrink-0">
                      {getDeptIcon(dept.iconName)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-black text-slate-950 m-0">
                          {deptName}
                        </h4>
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                          {dept.room} (Floor {dept.floor})
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-600 m-0 mt-1">
                        {plainWords}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Not Sure? Ask at Help Desk */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowHelpDeskRoute(!showHelpDeskRoute)}
                className="w-full tap-target-large p-3 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-black text-xs flex items-center justify-center gap-2 border border-amber-300 transition-colors"
              >
                <HelpCircle size={18} />
                <span>{t('wizard.notSure')}</span>
              </button>

              {showHelpDeskRoute && (
                <div className="mt-2 p-3.5 bg-amber-50 rounded-xl border border-amber-300 text-xs font-bold text-slate-800 animate-fade-in">
                  <p className="m-0 text-amber-900 font-black">
                    📍 {language === 'ta' ? 'உதவி மையத்திற்கு செல்லும் வழி:' : 'Way to May I Help You Desk:'}
                  </p>
                  <p className="m-0 mt-1">
                    {language === 'ta' 
                      ? 'தரைத்தள நுழைவாயிலில் உள்ள பெரிய மஞ்சள் கவுண்டர். நீல நாற்காலிகளுக்கு எதிரே உள்ளது.'
                      : 'Large yellow counter right at the Ground Floor entrance gate, opposite the blue chairs.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Wizard Navigation Action Buttons (Back & Next/Finish) */}
        {currentStep > 0 && (
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-qc-border">
            {/* Back Button */}
            <button
              type="button"
              onClick={() => setCurrentStep(prev => prev - 1)}
              className="tap-target-large px-5 py-3.5 rounded-2xl bg-white border-2 border-qc-border hover:bg-qc-sage/30 text-qc-text font-black text-sm flex items-center gap-1.5 transition-colors focus:ring-2 focus:ring-qc-primary"
            >
              <ArrowLeft size={18} />
              <span>{t('wizard.back')}</span>
            </button>

            {/* Next or Finish Button */}
            {currentStep < 5 ? (
              <button
                type="button"
                onClick={() => {
                  if (currentStep === 1 && !formData.patientName.trim()) {
                    const fallbackName = language === 'ta' ? 'Kamla Devi' : language === 'hi' ? 'Ramesh Sharma' : 'Citizen Patient';
                    setFormData(prev => ({ ...prev, patientName: fallbackName }));
                  }
                  setCurrentStep(prev => prev + 1);
                }}
                className="tap-target-large flex-1 py-4 px-6 rounded-2xl bg-qc-primary hover:bg-qc-primary/90 text-qc-bg font-black text-base flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-98 focus:ring-2 focus:ring-qc-primary"
              >
                <span>{t('wizard.next')}</span>
                <ArrowRight size={20} />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmitRegistration}
                className="tap-target-large flex-1 py-4 px-6 rounded-2xl bg-qc-primary hover:bg-qc-primary/95 text-qc-bg font-black text-base flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-98 disabled:opacity-50 focus:ring-2 focus:ring-qc-primary"
              >
                <span>{isSubmitting ? 'Generating...' : t('wizard.finish')}</span>
                <Check size={22} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Interactive ABHA National Health Card Modal */}
      <AbhaCardModal
        isOpen={abhaModalOpen}
        onClose={() => setAbhaModalOpen(false)}
        persona={activeAbhaPersona}
        onSelectPersona={handleSelectPersona}
      />
    </div>
  );
}
