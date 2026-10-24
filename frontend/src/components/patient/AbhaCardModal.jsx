import React from 'react';
import { 
  X, 
  QrCode, 
  ShieldCheck, 
  CheckCircle, 
  Share2, 
  Download, 
  Building2, 
  CreditCard,
  Check
} from 'lucide-react';

export default function AbhaCardModal({ isOpen, onClose, persona, onSelectPersona }) {
  if (!isOpen) return null;

  const activePersona = persona || {
    patientName: 'Anand Joshi',
    age: 22,
    gender: 'Male',
    state: 'Maharashtra',
    stateCode: 'MH',
    abhaId: '91-4523-8821-6549',
    abhaAddress: 'anand.joshi@abdm',
    mobile: '9845012345'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-scale-up"
        role="dialog"
        aria-labelledby="abha-title"
      >
        {/* Top Header */}
        <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard size={18} className="text-amber-400" />
            <div>
              <h3 id="abha-title" className="text-sm font-black m-0 tracking-tight">
                National Health ID (ABHA) Card
              </h3>
              <p className="text-[10px] text-slate-400 m-0">
                Ayushman Bharat Digital Mission (ABDM) • Govt. of India
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Realistic Indian ABHA Health Card */}
        <div className="p-5 space-y-4">
          <div className="bg-gradient-to-br from-[#0F3831] via-[#174E46] to-[#0A2924] rounded-2xl p-5 text-white shadow-xl relative overflow-hidden border border-emerald-500/30">
            {/* Background Seal Watermark */}
            <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none text-white">
              <Building2 size={160} />
            </div>

            {/* National Top Banner */}
            <div className="flex items-center justify-between border-b border-emerald-500/30 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🇮🇳</span>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-amber-300 m-0">
                    National Health Authority
                  </p>
                  <p className="text-[9px] text-emerald-200 font-semibold m-0">
                    Ministry of Health & Family Welfare
                  </p>
                </div>
              </div>
              <span className="bg-amber-400/20 text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-400/40">
                ABDM Verified
              </span>
            </div>

            {/* Card Body: QR + Details */}
            <div className="flex items-center gap-4">
              {/* Stylized QR Code Box */}
              <div className="bg-white p-2.5 rounded-xl shadow-md text-slate-900 flex flex-col items-center flex-shrink-0">
                <QrCode size={76} className="text-slate-900" />
                <span className="text-[8px] font-black text-emerald-800 mt-1 uppercase tracking-tighter">
                  Scan at OPD
                </span>
              </div>

              {/* Citizen Details */}
              <div className="space-y-1 min-w-0">
                <p className="text-base font-black text-white truncate m-0 leading-tight">
                  {activePersona.patientName}
                </p>
                <p className="text-xs text-emerald-200 font-semibold m-0">
                  {activePersona.age} Years • {activePersona.gender}
                </p>
                <div className="pt-1">
                  <p className="text-[9px] uppercase tracking-wider text-amber-300/90 font-bold m-0">
                    ABHA Number
                  </p>
                  <p className="text-xs font-mono font-black tracking-wider text-white m-0">
                    {activePersona.abhaId}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-emerald-300 font-bold m-0">
                    ABHA Address
                  </p>
                  <p className="text-[11px] font-mono text-emerald-100 truncate m-0">
                    {activePersona.patientName.toLowerCase().replace(/[^a-z]/g, '')}@abdm
                  </p>
                </div>
              </div>
            </div>

            {/* Footer with State & National Interoperability */}
            <div className="mt-4 pt-2.5 border-t border-emerald-500/20 flex items-center justify-between text-[10px] text-emerald-200">
              <span className="font-semibold">
                State: <strong className="text-white">{activePersona.state} ({activePersona.stateCode})</strong>
              </span>
              <span className="flex items-center gap-1 font-bold text-emerald-300">
                <ShieldCheck size={12} className="text-amber-400" />
                All-India Valid
              </span>
            </div>
          </div>

          {/* Action Explanations */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2 text-xs">
            <div className="flex items-start gap-2 text-slate-700">
              <CheckCircle size={15} className="text-emerald-600 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Universal Pan-India Access:</strong> Works in any AIIMS, State Civil Hospital, District Hospital, or Primary Health Centre (PHC) across all 28 states & 8 UTs.
              </span>
            </div>
            <div className="flex items-start gap-2 text-slate-700">
              <CheckCircle size={15} className="text-emerald-600 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Instant 0-Second Queue Registration:</strong> Replaces physical paper forms at counter #1 with token issuance in under 300ms.
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                if (onSelectPersona) onSelectPersona(activePersona);
                onClose();
              }}
              className="flex-1 tap-target-large py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs flex items-center justify-center gap-2 shadow transition-transform active:scale-95"
            >
              <Check size={16} />
              <span>Apply This ABHA to Registration</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="tap-target-large px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
