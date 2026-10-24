import React, { useState } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useJourney } from '../../context/JourneyContext';
import { useSocket } from '../../context/SocketContext';
import { 
  Share2, 
  X, 
  MessageCircle, 
  Copy, 
  Check, 
  Phone, 
  ShieldAlert, 
  UserCheck, 
  Clock, 
  MapPin, 
  Heart,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function CaregiverShareModal({ isOpen, onClose }) {
  const { language, t } = useAccessibility();
  const { activeSlip } = useJourney();
  const { serverState, calculateEstimatedWait } = useSocket();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !activeSlip) return null;

  // Real-time queue calculations
  const waitingAhead = (serverState?.tokens || []).filter(t => 
    t.assignedDoctorId === activeSlip.assignedDoctorId && 
    t.queueStatus === 'WAITING' &&
    t.tokenNumber < activeSlip.tokenNumber
  );
  const aheadCount = waitingAhead.length;

  const assignedDoc = (serverState?.doctors || []).find(d => d.id === activeSlip.assignedDoctorId);
  const estWaitMins = calculateEstimatedWait(aheadCount, activeSlip.departmentId, assignedDoc?.delayMinutes || 0);

  const roomDisplay = activeSlip.assignedRoomNumber ? `Room ${activeSlip.assignedRoomNumber}` : activeSlip.assignedRoomId;
  const isSuperseded = Boolean(activeSlip.supersededNote);

  // Generate shareable link
  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/track?token=${activeSlip.tokenId}`
    : `http://localhost:5173/track?token=${activeSlip.tokenId}`;

  const patientName = activeSlip.patientName || 'Patient';

  const shareMessage = language === 'ta'
    ? `🏥 [OPD Saathi] ${patientName}-ன் மருத்துவமனை நேரலை வருகை: டோக்கன் ${activeSlip.tokenId}, ${roomDisplay} (தளம் ${activeSlip.assignedFloor}). உங்களுக்கு முன்னால் ${aheadCount} நோயாளிகள் உள்ளனர் (~${estWaitMins} நிமிடங்கள் காத்திருப்பு). நேரலையில் பார்க்க: ${shareUrl}`
    : language === 'hi'
    ? `🏥 [OPD Saathi] ${patientName} जी की अस्पताल यात्रा का लाइव ट्रैकर: टोकन ${activeSlip.tokenId}, ${roomDisplay} (मंजिल ${activeSlip.assignedFloor})। कतार में ${aheadCount} मरीज आगे हैं (~${estWaitMins} मिनट)। लाइव देखें: ${shareUrl}`
    : `🏥 [OPD Saathi] ${patientName}'s Live Hospital Visit Tracker: Token ${activeSlip.tokenId}, ${roomDisplay} (Floor ${activeSlip.assignedFloor}). ${aheadCount} patients ahead (~${estWaitMins} mins wait). Track live: ${shareUrl}`;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleWhatsApp = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-qc-text/80 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="caregiver-modal-title"
    >
      <div className="bg-qc-bg text-qc-text rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-4 border-qc-text relative max-h-[92vh] overflow-y-auto space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 tap-target-large p-2.5 rounded-full bg-qc-sage/60 text-qc-primary hover:bg-qc-sage transition-colors focus:ring-2 focus:ring-qc-primary"
          aria-label="Close"
        >
          <X size={22} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-qc-border pb-3">
          <div className="p-3 rounded-2xl bg-qc-primary text-qc-bg shadow-sm">
            <Heart size={26} className="text-qc-amber" />
          </div>
          <div>
            <h2 id="caregiver-modal-title" className="text-xl sm:text-2xl font-black text-qc-text m-0">
              {t('caregiver.title')}
            </h2>
            <p className="text-xs text-qc-text/70 font-semibold m-0 mt-0.5">
              {t('caregiver.subtitle')}
            </p>
          </div>
        </div>

        {/* Live Status Card for Family */}
        <div className="p-4 rounded-2xl bg-white border-2 border-qc-border space-y-3">
          <div className="flex items-center justify-between border-b border-qc-border pb-2">
            <span className="text-xs font-black uppercase text-qc-text/60 tracking-wider">
              {t('caregiver.statusHeading')}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-qc-sage text-qc-primary font-mono font-black text-xs">
              <span className="w-2 h-2 rounded-full bg-qc-primary animate-pulse"></span>
              LIVE
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-qc-bg p-3 rounded-xl border border-qc-border">
              <span className="text-[10px] font-bold uppercase text-qc-text/60 block">Patient</span>
              <span className="text-base font-black text-qc-text">{activeSlip.patientName}</span>
              <span className="text-[11px] font-mono text-qc-primary block">{activeSlip.tokenId}</span>
            </div>

            <div className="bg-qc-bg p-3 rounded-xl border border-qc-border">
              <span className="text-[10px] font-bold uppercase text-qc-text/60 block">Destination</span>
              <span className="text-base font-black text-qc-primary">{roomDisplay}</span>
              <span className="text-[11px] font-bold text-qc-text/70 block">Floor {activeSlip.assignedFloor}</span>
            </div>
          </div>

          {/* Ahead count and wait estimation */}
          <div className="flex items-center justify-between p-3 bg-qc-sage/30 rounded-xl border border-qc-primary/20">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-qc-primary" />
              <div>
                <span className="text-xs font-bold text-qc-text block">Queue Position</span>
                <span className="text-sm font-black text-qc-primary">
                  {aheadCount === 0 ? 'Next in line!' : `${aheadCount} patients ahead`}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-qc-text/60 block">Est. Wait</span>
              <span className="text-base font-mono font-black text-qc-primary">~{estWaitMins}m</span>
            </div>
          </div>

          {/* Superseded Room Change Warning for Caregiver */}
          {isSuperseded && (
            <div className="p-3 bg-qc-amber/30 border-2 border-qc-amber rounded-xl text-xs font-bold text-qc-text flex items-start gap-2">
              <Sparkles size={18} className="text-amber-800 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-black text-amber-950 m-0">Doctor Relocated</p>
                <p className="text-[11px] m-0 mt-0.5">
                  Dr. Verma has moved to {roomDisplay} (Floor {activeSlip.assignedFloor}). {patientName}'s phone has received step-free directions via Lift A.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 1-Click WhatsApp & Copy Actions */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={handleWhatsApp}
            className="w-full tap-target-large py-3.5 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-98 focus:ring-2 focus:ring-emerald-500"
          >
            <MessageCircle size={20} />
            <span>Share Live Link on WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="w-full tap-target-large py-3 px-4 rounded-2xl bg-white border-2 border-qc-border hover:bg-qc-bg text-qc-text font-bold text-xs flex items-center justify-center gap-2 transition-colors focus:ring-2 focus:ring-qc-primary"
          >
            {copied ? <Check size={16} className="text-qc-primary" /> : <Copy size={16} />}
            <span>{copied ? t('caregiver.copied') : t('caregiver.copyLink')}</span>
          </button>

          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full tap-target-large py-2.5 px-4 rounded-xl bg-qc-sage/40 hover:bg-qc-sage/70 text-qc-primary font-bold text-xs flex items-center justify-center gap-1.5 no-underline transition-colors"
          >
            <ExternalLink size={14} />
            <span>Open Companion View in New Tab</span>
          </a>
        </div>

        {/* Remote Caregiver Quick Emergency Calls */}
        <div className="pt-2 border-t border-qc-border space-y-2">
          <p className="text-[11px] font-black uppercase text-qc-text/60 m-0">
            Caregiver Emergency Direct Lines:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <a
              href="tel:9840123456"
              className="p-3 bg-white border border-qc-border rounded-xl flex items-center gap-2 text-xs font-bold text-qc-text no-underline hover:border-qc-primary transition-colors"
            >
              <Phone size={16} className="text-qc-primary" />
              <span>{t('caregiver.callPatient')}</span>
            </a>

            <a
              href="tel:04222300100"
              className="p-3 bg-white border border-qc-border rounded-xl flex items-center gap-2 text-xs font-bold text-qc-text no-underline hover:border-qc-primary transition-colors"
            >
              <ShieldAlert size={16} className="text-qc-emergency" />
              <span>{t('caregiver.callHelpdesk')}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
