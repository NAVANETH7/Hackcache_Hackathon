import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useJourney } from '../../context/JourneyContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useSocket } from '../../context/SocketContext';
import { speakText } from '../../utils/speech';
import { 
  QrCode, 
  User, 
  Stethoscope, 
  Clock, 
  ShieldCheck, 
  Download, 
  Printer, 
  Volume2, 
  Maximize2, 
  X,
  Compass
} from 'lucide-react';

export default function SlipCard({ onNavigate }) {
  const { activeSlip } = useJourney();
  const { language, t } = useAccessibility();
  const { serverState, calculateEstimatedWait } = useSocket();

  const [largeTypeModalOpen, setLargeTypeModalOpen] = useState(false);
  const cardRef = useRef(null);

  if (!activeSlip) return null;

  // Calculate live waiting count ahead
  const waitingAhead = (serverState?.tokens || []).filter(t => 
    t.assignedDoctorId === activeSlip.assignedDoctorId && 
    t.queueStatus === 'WAITING' &&
    t.tokenNumber < activeSlip.tokenNumber
  );
  const aheadCount = waitingAhead.length;

  // Find assigned doctor's delay (if any)
  const assignedDoc = (serverState?.doctors || []).find(d => d.id === activeSlip.assignedDoctorId);
  const doctorDelay = assignedDoc?.delayMinutes || 0;

  // Compute estimated wait in minutes (rounded to 5 mins)
  const estimatedWaitMins = calculateEstimatedWait(aheadCount, activeSlip.departmentId, doctorDelay);

  // Read aloud slip details
  const handleReadAloud = () => {
    const text = language === 'ta'
      ? `உங்கள் டோக்கன் எண் ${activeSlip.tokenId}. அறை ${activeSlip.assignedRoomNumber || activeSlip.assignedRoomId}, தளம் ${activeSlip.assignedFloor}. மருத்துவர் ${activeSlip.assignedDoctorName}. உங்களுக்கு முன்னால் ${aheadCount} நபர்கள் உள்ளனர். காத்திருப்பு நேரம் சுமார் ${estimatedWaitMins} நிமிடங்கள்.`
      : language === 'hi'
      ? `आपका टोकन नंबर ${activeSlip.tokenId} है। कमरा ${activeSlip.assignedRoomNumber || activeSlip.assignedRoomId}, मंजिल ${activeSlip.assignedFloor}। डॉक्टर ${activeSlip.assignedDoctorName}। आपसे आगे ${aheadCount} मरीज हैं। अनुमानित प्रतीक्षा समय लगभग ${estimatedWaitMins} मिनट है।`
      : `Your token number is ${activeSlip.tokenId}. Room ${activeSlip.assignedRoomNumber || activeSlip.assignedRoomId}, Floor ${activeSlip.assignedFloor}. Doctor ${activeSlip.assignedDoctorName}. ${aheadCount} people ahead of you. Estimated wait is about ${estimatedWaitMins} minutes.`;
    speakText(text, language);
  };

  // Print Slip
  const handlePrint = () => {
    window.print();
  };

  // Save Slip as Image
  const handleSaveImage = () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 420;
      const ctx = canvas.getContext('2d');

      // Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 600, 420);

      // Header
      ctx.fillStyle = '#065f46';
      ctx.fillRect(0, 0, 600, 70);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CITY DISTRICT HOSPITAL — OPD SLIP', 300, 42);

      // Token Box
      ctx.fillStyle = '#ecfdf5';
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.fillRect(40, 90, 520, 110);
      ctx.strokeRect(40, 90, 520, 110);

      ctx.fillStyle = '#064e3b';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('TOKEN NUMBER', 300, 120);

      ctx.font = 'bold 44px monospace';
      ctx.fillText(activeSlip.tokenId, 300, 168);

      // Details
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Patient: ${activeSlip.patientName}`, 60, 240);
      ctx.fillText(`Department: ${activeSlip.departmentName}`, 60, 275);
      ctx.fillText(`Room: ${activeSlip.assignedRoomNumber || activeSlip.assignedRoomId} (Floor ${activeSlip.assignedFloor})`, 60, 310);
      ctx.fillText(`Doctor: ${activeSlip.assignedDoctorName}`, 60, 345);

      ctx.fillStyle = '#047857';
      ctx.fillText(`Estimated Wait: about ${estimatedWaitMins} mins (${aheadCount} ahead)`, 60, 385);

      const link = document.createElement('a');
      link.download = `OPD-Slip-${activeSlip.tokenId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      alert('Could not export image. Please use Print Slip instead.');
    }
  };

  return (
    <div ref={cardRef} className="bg-white rounded-3xl shadow-xl border-2 border-slate-200 overflow-hidden print:border-none print:shadow-none">
      {/* Hospital Seal Header */}
      <div className="bg-emerald-800 text-white p-4 text-center border-b-2 border-emerald-950">
        <p className="text-[11px] uppercase font-black tracking-widest text-emerald-200 m-0">
          CITY DISTRICT HEADQUARTERS HOSPITAL
        </p>
        <h2 className="text-xl sm:text-2xl font-black m-0 mt-0.5 tracking-tight">
          {t('slip.title')}
        </h2>
      </div>

      <div className="p-5 sm:p-6 space-y-4">
        {/* Token Number High-Impact Banner */}
        <div className="bg-emerald-50 border-3 border-emerald-500 p-4 rounded-2xl text-center shadow-inner">
          <p className="text-xs font-black uppercase text-emerald-800 tracking-wider m-0">
            {t('slip.tokenLabel')}
          </p>
          <div className="text-5xl sm:text-6xl font-black text-emerald-950 my-1 font-mono tracking-tight drop-shadow-sm">
            {activeSlip.tokenId}
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-200 text-emerald-950 font-black text-xs mt-1">
            <Clock size={15} />
            <span>
              {aheadCount === 0 
                ? (language === 'ta' ? 'அடுத்ததாக நீங்கள் அழைக்கப்படுவீர்கள்' : 'You are next in line')
                : `${aheadCount} ${t('slip.aheadOfYou')} • ${t('slip.about')} ${estimatedWaitMins} ${t('slip.minutes')}`}
            </span>
          </div>
        </div>

        {/* Patient & Room Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-1.5 text-slate-500 font-bold text-xs uppercase mb-1">
              <User size={15} />
              <span>{t('slip.patientDetails')}</span>
            </div>
            <p className="font-extrabold text-slate-900 text-lg m-0">
              {activeSlip.patientName}
            </p>
            <p className="text-xs text-slate-600 m-0 mt-0.5">
              {activeSlip.age} yrs • {activeSlip.gender}
            </p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-1.5 text-slate-500 font-bold text-xs uppercase mb-1">
              <Stethoscope size={15} />
              <span>{t('slip.assignedDoctor')}</span>
            </div>
            <p className="font-extrabold text-slate-900 text-base m-0">
              {activeSlip.assignedDoctorName}
            </p>
            <p className="text-xs font-black text-emerald-700 m-0 mt-0.5">
              {activeSlip.departmentName}
            </p>
          </div>
        </div>

        {/* Room & Floor Banner */}
        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase text-amber-900 tracking-wider m-0">
              {t('slip.destinationRoom')}
            </p>
            <p className="text-2xl font-black text-slate-950 m-0">
              {activeSlip.assignedRoomNumber ? `Room ${activeSlip.assignedRoomNumber}` : activeSlip.assignedRoomId}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-amber-900 uppercase block">Floor</span>
            <span className="text-2xl font-black text-amber-800">
              Floor {activeSlip.assignedFloor}
            </span>
          </div>
        </div>

        {/* Mobility Safe Invariant Tag */}
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 p-2.5 rounded-xl border border-emerald-200 text-xs font-bold">
          <ShieldCheck size={18} className="text-emerald-600 flex-shrink-0" />
          <span>{t('slip.cautionStairs')}</span>
        </div>

        {/* QR Code for Staff Verification */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-center gap-4">
          <div className="p-2 bg-white rounded-xl border-2 border-slate-900 shadow-sm">
            <QRCodeSVG
              value={JSON.stringify({
                token: activeSlip.tokenId,
                name: activeSlip.patientName,
                dept: activeSlip.departmentName,
                room: activeSlip.assignedRoomId,
                issuedAt: activeSlip.issuedAt
              })}
              size={90}
              level="M"
            />
          </div>
          <div className="text-xs space-y-1">
            <p className="font-extrabold text-slate-900 m-0">
              {t('slip.showQr')}
            </p>
            <p className="text-[11px] text-slate-500 m-0">
              Scan at pharmacy, lab, or counter for fast verification.
            </p>
          </div>
        </div>

        {/* Action Buttons: Save, Print, Read Aloud, Show Large Type */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 print:hidden">
          <button
            type="button"
            onClick={handleSaveImage}
            className="tap-target-large p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex flex-col items-center justify-center gap-1 border border-slate-300 transition-colors"
          >
            <Download size={18} />
            <span>{t('slip.saveImage')}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="tap-target-large p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex flex-col items-center justify-center gap-1 border border-slate-300 transition-colors"
          >
            <Printer size={18} />
            <span>{t('slip.printSlip')}</span>
          </button>

          <button
            type="button"
            onClick={handleReadAloud}
            className="tap-target-large p-3 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-bold text-xs flex flex-col items-center justify-center gap-1 border border-emerald-300 transition-colors"
          >
            <Volume2 size={18} />
            <span>{t('slip.readAloud')}</span>
          </button>

          <button
            type="button"
            onClick={() => setLargeTypeModalOpen(true)}
            className="tap-target-large p-3 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs flex flex-col items-center justify-center gap-1 border border-amber-500 shadow-sm transition-transform active:scale-95"
          >
            <Maximize2 size={18} />
            <span>{t('slip.showLargeType')}</span>
          </button>
        </div>
      </div>

      {/* Large Type Modal for Showing to Staff / Security */}
      {largeTypeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center border-4 border-amber-400 shadow-2xl relative space-y-4">
            <button
              onClick={() => setLargeTypeModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200"
              aria-label="Close"
            >
              <X size={24} />
            </button>

            <p className="text-xs font-black uppercase tracking-wider text-slate-500 m-0">
              {t('slip.largeTypeModalTitle')}
            </p>

            <div className="bg-emerald-50 border-3 border-emerald-500 rounded-2xl py-6 px-4">
              <span className="text-xs font-black uppercase text-emerald-800 block">TOKEN</span>
              <div className="text-6xl sm:text-7xl font-black text-emerald-950 my-1 font-mono tracking-tight">
                {activeSlip.tokenId}
              </div>
              <p className="text-xl font-black text-slate-900 m-0 mt-2">
                {activeSlip.patientName}
              </p>
            </div>

            <div className="bg-amber-100 border-2 border-amber-400 rounded-2xl p-4">
              <span className="text-xs font-black uppercase text-amber-900 block">DESTINATION</span>
              <p className="text-3xl font-black text-slate-950 m-0">
                {activeSlip.assignedRoomNumber ? `Room ${activeSlip.assignedRoomNumber}` : activeSlip.assignedRoomId}
              </p>
              <p className="text-sm font-extrabold text-amber-900 m-0 mt-1">
                Floor {activeSlip.assignedFloor} • {activeSlip.departmentName}
              </p>
              <p className="text-xs font-bold text-slate-700 m-0 mt-0.5">
                {activeSlip.assignedDoctorName}
              </p>
            </div>

            <button
              onClick={() => setLargeTypeModalOpen(false)}
              className="w-full tap-target-large py-3.5 rounded-xl bg-slate-900 text-white font-bold text-sm"
            >
              Done / Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
