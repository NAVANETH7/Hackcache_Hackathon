import React, { useState } from 'react';
import { useSocket, playChime } from '../context/SocketContext';
import { useAccessibility } from '../context/AccessibilityContext';
import FloorPlanSVG from '../components/patient/FloorPlanSVG';
import { 
  AlertTriangle, 
  Phone, 
  ShieldAlert, 
  MapPin, 
  CheckCircle2, 
  HeartHandshake,
  ArrowRight,
  Flame,
  LifeBuoy
} from 'lucide-react';

export default function EmergencyView() {
  const { triggerEmergency } = useSocket();
  const { language, t } = useAccessibility();
  const [alertSent, setAlertSent] = useState(false);
  const [flagLocation, setFlagLocation] = useState('Hospital Entrance');

  const handleAlert = async () => {
    playChime('urgent');
    await triggerEmergency(
      flagLocation, 
      'Patient or companion flagged immediate casualty assistance required'
    );
    setAlertSent(true);
    setTimeout(() => setAlertSent(false), 8000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
      {/* Red Alert Banner */}
      <div className="bg-red-600 text-white p-6 sm:p-8 rounded-3xl shadow-2xl border-4 border-red-800 space-y-4">
        <div className="flex items-center gap-3">
          <AlertTriangle size={42} className="text-amber-300 animate-bounce flex-shrink-0" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight m-0">
              {t('app.emergencyBtn')}
            </h1>
            <p className="text-xs sm:text-sm font-bold opacity-90 m-0 mt-0.5">
              Casualty & Critical Trauma Ward • அவசர சிகிச்சை பிரிவு
            </p>
          </div>
        </div>

        <div className="bg-red-950/80 p-5 rounded-2xl border-2 border-red-400/60 space-y-2">
          <p className="text-base sm:text-lg font-black m-0 text-white">
            GO DIRECTLY TO CASUALTY NOW. YOU DO NOT NEED A TOKEN OR REGISTRATION.
          </p>
          <p className="text-sm font-bold text-amber-300 m-0">
            எந்த வரிசையிலும் காத்திருக்க வேண்டாம். தரைத்தளத்தில் உள்ள அவசர சிகிச்சை பிரிவுக்கு உடனடியாக செல்லவும் அல்லது அருகிலுள்ள எந்தவொரு ஊழியரிடமும் உடனடியாக தெரிவிக்கவும்.
          </p>
        </div>

        {/* Vital Rule Note */}
        <div className="text-xs font-bold text-red-100 bg-red-700/60 p-3 rounded-xl border border-red-400">
          ⚖️ <strong>Emergency Policy:</strong> The app never decides whether something is an emergency, never tells anyone they can wait, and never makes an urgent case wait for registration or a token. Only qualified medical staff assess urgent cases.
        </div>
      </div>

      {/* Emergency Helpline Numbers (112 & 108) */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border-2 border-slate-800 space-y-4">
        <h2 className="text-lg font-black text-white m-0 flex items-center gap-2">
          <Phone size={22} className="text-emerald-400" />
          <span>Emergency Telephone Numbers (Call Immediately)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href="tel:112"
            className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-between text-white no-underline transition-colors"
          >
            <div>
              <span className="text-xs uppercase font-extrabold text-slate-400 block">All-India Emergency Helpline</span>
              <span className="text-3xl font-black text-emerald-400 font-mono">112</span>
            </div>
            <span className="text-xs font-black bg-emerald-600 text-white px-3 py-1.5 rounded-xl">Call 112</span>
          </a>

          <a
            href="tel:108"
            className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-between text-white no-underline transition-colors"
          >
            <div>
              <span className="text-xs uppercase font-extrabold text-slate-400 block">National Ambulance Service</span>
              <span className="text-3xl font-black text-amber-400 font-mono">108</span>
            </div>
            <span className="text-xs font-black bg-amber-500 text-slate-950 px-3 py-1.5 rounded-xl">Call 108</span>
          </a>
        </div>
      </div>

      {/* Direct Way to Emergency (Ground Floor Map Preview) */}
      <div className="bg-white rounded-3xl shadow-md border-2 border-slate-200 p-6 space-y-4">
        <h2 className="text-xl font-black text-slate-900 flex items-center gap-2 m-0">
          <MapPin size={24} className="text-red-600" />
          <span>Way to Emergency (Ground Floor)</span>
        </h2>

        <div className="space-y-2.5 text-sm">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-3">
            <span className="w-8 h-8 rounded-full bg-red-600 text-white font-black flex items-center justify-center flex-shrink-0 text-sm">1</span>
            <div>
              <p className="font-extrabold text-slate-900 m-0">
                Follow the RED line on the floor from Main Entrance
              </p>
              <p className="text-xs text-slate-600 m-0 mt-0.5">
                From the hospital entrance gate, follow the painted solid RED stripe straight along the left wall.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-3">
            <span className="w-8 h-8 rounded-full bg-red-600 text-white font-black flex items-center justify-center flex-shrink-0 text-sm">2</span>
            <div>
              <p className="font-extrabold text-slate-900 m-0">
                Walk 20 meters straight — Double Automatic Glass Doors
              </p>
              <p className="text-xs text-slate-600 m-0 mt-0.5">
                Casualty has stretchers, wheelchairs and triage nurses on duty 24 hours a day.
              </p>
            </div>
          </div>
        </div>

        {/* Floor Plan Viewer for Ground Floor */}
        <div className="pt-2">
          <FloorPlanSVG floor={0} />
        </div>

        {/* I Need Urgent Help Flag Button */}
        <div className="pt-3 border-t border-slate-200">
          {alertSent ? (
            <div className="p-4 bg-emerald-100 text-emerald-950 rounded-2xl border-2 border-emerald-500 font-black text-sm flex items-center justify-center gap-2 animate-bounce-gentle">
              <CheckCircle2 size={24} className="text-emerald-700" />
              <span>URGENT FLAG DISPATCHED! Staff alerted with alarm. An attendant is arriving.</span>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={flagLocation}
                  onChange={(e) => setFlagLocation(e.target.value)}
                  placeholder="Your current spot (e.g. Near Main Entrance / Near Lift A)"
                  className="flex-1 text-xs font-bold px-3 py-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <button
                type="button"
                onClick={handleAlert}
                className="w-full tap-target-large py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-base flex items-center justify-center gap-2 shadow-xl transition-transform active:scale-95 animate-urgent"
              >
                <ShieldAlert size={22} />
                <span>I NEED URGENT HELP (Raise Flag on Staff Dashboard)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
