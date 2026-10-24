import React from 'react';
import { useJourney } from '../../context/JourneyContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { 
  CheckCircle2, 
  Pill, 
  FlaskConical, 
  Calendar, 
  Sun, 
  CloudSun, 
  Moon, 
  ArrowRight, 
  MapPin, 
  RotateCcw,
  Volume2,
  FileCheck
} from 'lucide-react';
import { speakText } from '../../utils/speech';

export default function PostConsultationCard({ onNavigateToRoute }) {
  const { activeSlip, setCustomDestination, customDestinationNodeId, setPatientSlip } = useJourney();
  const { language, t } = useAccessibility();

  if (!activeSlip) return null;

  const handleRouteToPharmacy = () => {
    setCustomDestination('PHARMACY_G');
    const spoken = language === 'ta'
      ? "இலவச மருந்தகத்திற்கான பாதை காட்டப்பட்டுள்ளது. தரைத்தளத்தில் உள்ள மஞ்சள் நிறக் கோட்டைப் பின்தொடரவும்."
      : language === 'hi'
      ? "दवा वितरण केंद्र का रास्ता दिखाया गया है। भू-तल पर पीली रेखा का पालन करें।"
      : "Route to Free Pharmacy selected. Follow the yellow stripe on the ground floor.";
    speakText(spoken, language);
    if (onNavigateToRoute) onNavigateToRoute();
  };

  const handleRouteToLab = () => {
    setCustomDestination('LAB_G');
    const spoken = language === 'ta'
      ? "பரிசோதனை ஆய்வகத்திற்கான பாதை காட்டப்பட்டுள்ளது. கண்ணாடி கதவுக்குப் பின்னால் உள்ள அறை G-08-க்கு செல்லவும்."
      : language === 'hi'
      ? "जांच प्रयोगशाला का रास्ता दिखाया गया है। शीशे के दरवाजे के पीछे कमरा G-08 में जाएं।"
      : "Route to Diagnostic Laboratory selected. Proceed to Room G-08 behind the glass door.";
    speakText(spoken, language);
    if (onNavigateToRoute) onNavigateToRoute();
  };

  const handleSpeakAll = () => {
    const speech = language === 'ta'
      ? "மருத்துவர் ஆலோசனை வெற்றிகரமாக முடிந்தது. அடுத்த படிகள்: முதலில் தரைத்தள இலவச மருந்தகம் கவுண்டர் 3-ல் மருந்துகளைப் பெறவும். இரத்த பரிசோதனை பரிந்துரைக்கப்பட்டிருந்தால் ஆய்வகம் அறை G-08-க்கு செல்லவும். இரண்டு வாரங்களுக்குப் பிறகு மீண்டும் வரவும்."
      : language === 'hi'
      ? "डॉक्टर परामर्श पूरा हुआ। अगले कदम: पहले भू-तल पर दवा काउंटर 3 से मुफ्त दवाइयां प्राप्त करें। यदि जांच लिखी गई है तो लैब G-08 में जाएं। दो सप्ताह बाद दोबारा आएं।"
      : "Consultation complete. Next steps: First collect free medicines at Pharmacy Counter 3 on Ground Floor. If tests are prescribed, proceed to Lab G-08. Follow up in two weeks.";
    speakText(speech, language);
  };

  return (
    <div className="bg-qc-bg text-qc-text rounded-3xl shadow-lg border-2 border-qc-border p-6 space-y-6 animate-fade-in">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-qc-primary to-[#1f5c53] text-qc-bg p-5 sm:p-6 rounded-2xl shadow-sm border border-qc-primary flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-qc-amber text-qc-text text-xs font-black uppercase">
            <CheckCircle2 size={16} />
            <span>{t('postConsult.completedTitle')}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white m-0">
            {activeSlip.patientName} — {activeSlip.assignedDoctorName || 'Dr. A. Verma'}
          </h2>
          <p className="text-xs text-qc-sage font-medium m-0">
            {activeSlip.departmentName} • Token <span className="font-mono tabular-nums font-bold text-white">{activeSlip.tokenId}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={handleSpeakAll}
          className="tap-target-large px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/20"
          title="Listen to Post-Consultation Advice"
        >
          <Volume2 size={16} />
          <span>{language === 'ta' ? 'கேட்க' : 'Listen'}</span>
        </button>
      </div>

      {/* 2. Priority Next Actions: Pharmacy & Lab */}
      <div className="space-y-3">
        <h3 className="text-sm font-black uppercase tracking-wider text-qc-text flex items-center gap-2 m-0">
          <FileCheck size={18} className="text-qc-primary" />
          <span>{t('postConsult.title')}</span>
        </h3>
        <p className="text-xs font-semibold text-qc-text/70 m-0">
          {t('postConsult.subtitle')}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Card 1: Free Pharmacy */}
          <div className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between space-y-3 ${
            customDestinationNodeId === 'PHARMACY_G' 
              ? 'bg-qc-amber/30 border-amber-600 shadow-md ring-2 ring-amber-500/20' 
              : 'bg-white border-qc-border hover:border-qc-primary'
          }`}>
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center flex-shrink-0">
                <Pill size={22} />
              </div>
              <div className="flex-1">
                <span className="text-[11px] font-extrabold uppercase text-amber-800 tracking-wider block">
                  Step 1 • Free Medicine
                </span>
                <h4 className="text-base font-black text-qc-text m-0">
                  {t('postConsult.pharmacy')}
                </h4>
                <p className="text-xs text-qc-text/70 font-semibold m-0 mt-1">
                  Ground Floor • Counter 3 • Yellow Floor Stripe
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRouteToPharmacy}
              className="w-full tap-target-large py-3 px-4 rounded-xl bg-qc-primary text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm hover:bg-[#123C36] active:scale-98 transition-transform"
            >
              <MapPin size={15} />
              <span>{t('postConsult.routeToPharmacy')}</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Card 2: Diagnostic Lab */}
          <div className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between space-y-3 ${
            customDestinationNodeId === 'LAB_G' 
              ? 'bg-qc-sage/60 border-qc-primary shadow-md ring-2 ring-qc-primary/20' 
              : 'bg-white border-qc-border hover:border-qc-primary'
          }`}>
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center flex-shrink-0">
                <FlaskConical size={22} />
              </div>
              <div className="flex-1">
                <span className="text-[11px] font-extrabold uppercase text-blue-800 tracking-wider block">
                  Step 2 (If Prescribed)
                </span>
                <h4 className="text-base font-black text-qc-text m-0">
                  {t('postConsult.lab')}
                </h4>
                <p className="text-xs text-qc-text/70 font-semibold m-0 mt-1">
                  Ground Floor • Room G-08 • Blood & Urine Tests
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRouteToLab}
              className="w-full tap-target-large py-3 px-4 rounded-xl bg-white border-2 border-qc-primary text-qc-primary font-black text-xs flex items-center justify-center gap-2 shadow-sm hover:bg-qc-sage/30 active:scale-98 transition-transform"
            >
              <MapPin size={15} />
              <span>{language === 'ta' ? 'ஆய்வகத்திற்கான வழி' : 'Show Route to Lab'}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Visual Medicine Schedule (High Accessibility for Non-Literate Patients) */}
      <div className="bg-white p-5 rounded-2xl border-2 border-qc-border space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black uppercase tracking-wider text-qc-text flex items-center gap-2 m-0">
            <Pill size={16} className="text-qc-primary" />
            <span>{language === 'ta' ? 'மருந்து உட்கொள்ளும் முறை' : 'Standard Medication Schedule'}</span>
          </h4>
          <span className="text-[11px] font-bold text-qc-primary bg-qc-sage px-2.5 py-0.5 rounded-full">
            {language === 'ta' ? 'உணவுக்குப் பின்' : 'After Meals'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          {/* Morning */}
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
            <div className="w-8 h-8 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center mx-auto">
              <Sun size={18} />
            </div>
            <span className="block text-xs font-black text-amber-950">
              {language === 'ta' ? 'காலை' : 'Morning'}
            </span>
            <span className="text-[11px] font-extrabold text-amber-800">1 Pill • 8 AM</span>
          </div>

          {/* Afternoon */}
          <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 space-y-1">
            <div className="w-8 h-8 rounded-full bg-orange-200 text-orange-800 flex items-center justify-center mx-auto">
              <CloudSun size={18} />
            </div>
            <span className="block text-xs font-black text-orange-950">
              {language === 'ta' ? 'மதியம்' : 'Afternoon'}
            </span>
            <span className="text-[11px] font-extrabold text-orange-800">1 Pill • 1 PM</span>
          </div>

          {/* Night */}
          <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 space-y-1">
            <div className="w-8 h-8 rounded-full bg-indigo-200 text-indigo-800 flex items-center justify-center mx-auto">
              <Moon size={18} />
            </div>
            <span className="block text-xs font-black text-indigo-950">
              {language === 'ta' ? 'இரவு' : 'Night'}
            </span>
            <span className="text-[11px] font-extrabold text-indigo-800">1 Pill • 9 PM</span>
          </div>
        </div>
      </div>

      {/* 3B. UNIQUE INNOVATION: PMBJP Jan Aushadhi Generic Medicine Stock Radar & Cost Saver */}
      <div className="bg-gradient-to-br from-[#123C36] to-[#0E2E2A] text-white p-5 rounded-2xl border-2 border-[#F2C66D]/40 space-y-3.5 shadow-md">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#52B788] animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider text-[#F2C66D]">
              PMBJP Jan Aushadhi Generic Medicine Radar
            </span>
          </div>
          <span className="text-[10px] bg-white/10 text-[#D9E8DF] font-bold px-2 py-0.5 rounded-md border border-white/20">
            Govt. Generic Subsidized
          </span>
        </div>

        <p className="text-xs text-[#D9E8DF] m-0 leading-relaxed font-medium">
          If hospital counter runs out of stock, get prescribed generic salts at the nearest authorized <strong>Jan Aushadhi Kendra</strong> with up to 90% savings:
        </p>

        {/* Medicine Comparison Card */}
        <div className="bg-white/10 p-3.5 rounded-xl border border-white/15 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white">Paracetamol 500mg + Calcium D3</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded">
              Hospital: In Stock
            </span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-white/10">
            <div>
              <span className="text-[11px] text-[#D9E8DF] block">PMBJP Jan Aushadhi Price:</span>
              <span className="text-lg font-black text-[#F2C66D] font-mono">₹12.50</span>
              <span className="text-[11px] text-white/50 line-through ml-2">Private MRP: ₹145</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-extrabold text-emerald-300 block">SAVE 91%</span>
              <span className="text-[10px] text-[#D9E8DF]">Gate 1 Exit • 180m</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Follow-up and Return Guidance */}
      <div className="p-4 rounded-2xl bg-qc-sage/40 border border-qc-primary/30 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-qc-primary text-white flex-shrink-0 mt-0.5">
          <Calendar size={18} />
        </div>
        <div className="flex-1 space-y-0.5">
          <h4 className="text-xs font-black uppercase text-qc-primary tracking-wider m-0">
            {language === 'ta' ? 'அடுத்த மருத்துவ சந்திப்பு' : 'Next Recommended Follow-Up'}
          </h4>
          <p className="text-xs font-bold text-qc-text m-0">
            {t('postConsult.followup')}
          </p>
        </div>
      </div>
    </div>
  );
}
