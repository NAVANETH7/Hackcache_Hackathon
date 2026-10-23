import React from 'react';
import { useJourney } from '../../context/JourneyContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { speakText } from '../../utils/speech';
import { X, Volume2, AlertCircle, MapPin, User, ShieldAlert } from 'lucide-react';

export default function HelpCardModal() {
  const { helpModalOpen, setHelpModalOpen, activeSlip, nextActionState } = useJourney();
  const { language, t } = useAccessibility();

  if (!helpModalOpen) return null;

  const patientName = activeSlip?.patientName || 'Kamla';
  const age = activeSlip?.age || 62;
  const destination = activeSlip?.assignedRoomId || 'OPD_104';
  const doctor = activeSlip?.assignedDoctorName || 'Dr. A. K. Verma';

  const handleAudioCall = () => {
    const text = language === 'ta'
      ? `தயவுசெய்து எனக்கு உதவவும். என் பெயர் கமலா. நான் அறை ${destination}-க்கு செல்ல வேண்டும். என்னால் படிக்கட்டுகளில் ஏற முடியாது.`
      : language === 'hi'
      ? `कृपया मेरी सहायता करें। मेरा नाम कमला है। मुझे कमरा ${destination} जाना है। मैं सीढ़ियां नहीं चढ़ सकती।`
      : `Please help me. My name is Kamla. I need to reach Room ${destination}. I cannot climb stairs.`;
    speakText(text, language);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-amber-400 text-slate-950 rounded-2xl max-w-lg w-full p-6 shadow-2xl border-4 border-slate-950 relative">
        {/* Close Button */}
        <button
          onClick={() => setHelpModalOpen(false)}
          className="absolute top-4 right-4 tap-target-large p-2 rounded-full bg-slate-950 text-white hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        {/* Header Icon */}
        <div className="flex items-center gap-3 border-b-2 border-slate-950 pb-3 mb-4">
          <ShieldAlert size={36} className="text-slate-950" />
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight m-0">
              உதவி தேவை / HELP NEEDED
            </h2>
            <p className="text-sm font-bold text-slate-800 m-0">
              Show this card to any Hospital Staff or Security Guard
            </p>
          </div>
        </div>

        {/* Content Details */}
        <div className="space-y-4">
          {/* Patient Profile */}
          <div className="bg-white p-3.5 rounded-xl border-2 border-slate-950 flex items-center gap-3">
            <User size={28} className="text-emerald-700" />
            <div>
              <p className="text-xs uppercase font-bold text-slate-500 m-0">
                நோயாளி / Patient Name & Age
              </p>
              <p className="text-xl font-black text-slate-950 m-0">
                {patientName} ({age} years / வயது)
              </p>
            </div>
          </div>

          {/* Intended Destination */}
          <div className="bg-white p-3.5 rounded-xl border-2 border-slate-950 flex items-center gap-3">
            <MapPin size={28} className="text-red-600" />
            <div>
              <p className="text-xs uppercase font-bold text-slate-500 m-0">
                செல்ல வேண்டிய இடம் / Destination
              </p>
              <p className="text-xl font-black text-slate-950 m-0">
                {destination} — {doctor}
              </p>
            </div>
          </div>

          {/* Critical Mobility Warning */}
          <div className="bg-red-600 text-white p-4 rounded-xl border-2 border-slate-950 shadow">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle size={22} className="text-amber-300" />
              <p className="text-sm font-black uppercase tracking-wider m-0">
                முக்கிய அறிவிப்பு / CRITICAL MOBILITY NOTE
              </p>
            </div>
            <p className="text-lg font-black leading-snug m-0">
              நோயாளி படிக்கட்டுகளில் ஏற முடியாது. லிஃப்ட் அல்லது சாய்வுப்பாதை தேவை.
            </p>
            <p className="text-sm font-bold opacity-90 m-0 mt-1">
              Patient strictly cannot climb stairs. Needs elevator or ramp escort.
            </p>
          </div>

          {/* Action Instruction for Guards */}
          <div className="bg-slate-950 text-white p-3.5 rounded-xl text-center">
            <p className="text-base font-bold m-0 text-amber-300">
              தயவுசெய்து இந்த நோயாளியை லிஃப்ட் ஏ அல்லது தரைத்தள உதவி மையத்திற்கு வழிகாட்டவும்.
            </p>
            <p className="text-xs text-slate-300 m-0 mt-0.5">
              Please guide this patient to Lift A or to the Ground Floor Help Desk.
            </p>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-5 flex gap-3">
          <button
            onClick={handleAudioCall}
            className="flex-1 tap-target-large py-3 rounded-xl bg-slate-950 text-white font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-transform active:scale-95"
          >
            <Volume2 size={20} className="text-amber-400" />
            <span>குரல் உதவி / Speak Aloud</span>
          </button>
          <button
            onClick={() => setHelpModalOpen(false)}
            className="tap-target-large px-6 py-3 rounded-xl bg-white border-2 border-slate-950 font-bold hover:bg-slate-100 transition-colors"
          >
            {t('helpModal.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
