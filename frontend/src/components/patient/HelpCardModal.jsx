import React, { useState, useEffect } from 'react';
import { useJourney } from '../../context/JourneyContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useSocket, playChime } from '../../context/SocketContext';
import { speakText } from '../../utils/speech';
import { 
  X, 
  Volume2, 
  AlertCircle, 
  MapPin, 
  User, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Send, 
  WifiOff 
} from 'lucide-react';

export default function HelpCardModal() {
  const { helpModalOpen, setHelpModalOpen, activeSlip } = useJourney();
  const { language, t } = useAccessibility();
  const { triggerEmergency, serverState, connected } = useSocket();

  const [activeAlertId, setActiveAlertId] = useState(null);
  const [requestStatus, setRequestStatus] = useState('IDLE'); // IDLE | SENDING | PENDING | ACKNOWLEDGED | OFFLINE_FAILED

  const patientName = activeSlip?.patientName || 'Kamla';
  const age = activeSlip?.age || 62;
  const destination = activeSlip?.assignedRoomNumber 
    ? `Room ${activeSlip.assignedRoomNumber}` 
    : (activeSlip?.assignedRoomId || 'OPD Room 5');
  const floor = activeSlip?.assignedFloor !== undefined ? activeSlip.assignedFloor : 1;
  const doctor = activeSlip?.assignedDoctorName || 'Dr. A. K. Verma';

  // Monitor acknowledgement from staff dashboard
  useEffect(() => {
    if (!activeAlertId || !serverState?.emergencies) return;

    const matchedAlert = serverState.emergencies.find(e => e.id === activeAlertId);
    if (matchedAlert) {
      if (matchedAlert.seen || matchedAlert.status === 'SEEN') {
        setRequestStatus('ACKNOWLEDGED');
      } else {
        setRequestStatus('PENDING');
      }
    }
  }, [serverState?.emergencies, activeAlertId]);

  if (!helpModalOpen) return null;

  const handleSendAssistanceRequest = async () => {
    setRequestStatus('SENDING');
    try {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setRequestStatus('OFFLINE_FAILED');
        return;
      }

      playChime('urgent');
      const location = `Floor ${floor} near ${destination}`;
      const details = `Patient ${patientName} (${age}y) needs stair-free assistance to ${destination}`;
      
      const alertItem = await triggerEmergency(location, details);
      if (alertItem && alertItem.id) {
        setActiveAlertId(alertItem.id);
        setRequestStatus('PENDING');
      } else {
        setRequestStatus('PENDING');
      }
    } catch {
      setRequestStatus('OFFLINE_FAILED');
    }
  };

  const handleAudioCall = () => {
    const text = language === 'ta'
      ? `தயவுசெய்து எனக்கு உதவவும். என் பெயர் ${patientName}. நான் தளம் ${floor} அறை ${destination}-க்கு செல்ல வேண்டும். என்னால் படிக்கட்டுகளில் ஏற முடியாது.`
      : language === 'hi'
      ? `कृपया मेरी सहायता करें। मेरा नाम ${patientName} है। मुझे मंजिल ${floor} पर कमरा ${destination} जाना है। मैं सीढ़ियां नहीं चढ़ सकती।`
      : `Please help me. My name is ${patientName}. I need to reach ${destination} on Floor ${floor}. I strictly cannot climb stairs.`;
    speakText(text, language);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-qc-text/80 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-card-title"
    >
      <div className="bg-qc-bg text-qc-text rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-4 border-qc-text relative max-h-[92vh] overflow-y-auto space-y-5">
        {/* Close Button */}
        <button
          onClick={() => setHelpModalOpen(false)}
          className="absolute top-5 right-5 tap-target-large p-2.5 rounded-full bg-qc-sage/60 text-qc-primary hover:bg-qc-sage transition-colors focus:ring-2 focus:ring-qc-primary"
          aria-label="Close Help Card"
        >
          <X size={22} />
        </button>

        {/* High-Contrast Yellow Header Banner */}
        <div className="bg-qc-amber text-qc-text p-4 rounded-2xl border-2 border-qc-text flex items-center gap-3">
          <ShieldAlert size={34} className="text-qc-text flex-shrink-0" />
          <div>
            <h2 id="help-card-title" className="text-xl sm:text-2xl font-black uppercase tracking-tight m-0">
              {t('helpModal.title')}
            </h2>
            <p className="text-xs sm:text-sm font-bold text-qc-text/90 m-0">
              {t('helpModal.subtitle')}
            </p>
          </div>
        </div>

        {/* Remote Staff Request Delivery Status Indicator */}
        <div className="p-3.5 rounded-2xl border-2 transition-all">
          {requestStatus === 'IDLE' && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs font-bold text-qc-text/80 text-center sm:text-left">
                Need staff to locate you? Dispatch a live alert to the Nurse & Staff Desk.
              </span>
              <button
                type="button"
                onClick={handleSendAssistanceRequest}
                className="tap-target-large px-4 py-2.5 rounded-xl bg-qc-primary hover:bg-qc-primary/90 text-qc-bg font-black text-xs flex items-center gap-1.5 shadow focus:ring-2 focus:ring-qc-primary flex-shrink-0"
              >
                <Send size={15} />
                <span>{t('helpModal.requestAssistance')}</span>
              </button>
            </div>
          )}

          {requestStatus === 'SENDING' && (
            <div className="flex items-center gap-2 text-qc-text font-bold text-xs">
              <Clock size={16} className="text-qc-amber animate-spin" />
              <span>{t('helpModal.requestSending')}</span>
            </div>
          )}

          {requestStatus === 'PENDING' && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-300 p-3 rounded-xl text-xs font-bold text-amber-950">
              <Clock size={18} className="text-amber-700 flex-shrink-0 mt-0.5 animate-pulse" />
              <div>
                <p className="font-black m-0">{t('helpModal.requestSentPending')}</p>
                <p className="text-[11px] text-amber-900/80 m-0 mt-0.5">
                  Alert is pinned to the Staff Control Dashboard. An attendant is being assigned.
                </p>
              </div>
            </div>
          )}

          {requestStatus === 'ACKNOWLEDGED' && (
            <div className="flex items-start gap-2 bg-qc-sage/60 border border-qc-primary p-3 rounded-xl text-xs font-bold text-qc-primary animate-beacon">
              <CheckCircle2 size={18} className="text-qc-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-black m-0">{t('helpModal.requestAcknowledged')}</p>
                <p className="text-[11px] text-qc-text/80 m-0 mt-0.5">
                  A staff member marked this request as seen and is on their way to assist.
                </p>
              </div>
            </div>
          )}

          {requestStatus === 'OFFLINE_FAILED' && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-300 p-3 rounded-xl text-xs font-bold text-qc-emergency">
              <WifiOff size={18} className="text-qc-emergency flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-black m-0">{t('helpModal.requestOfflineNotice')}</p>
              </div>
            </div>
          )}
        </div>

        {/* High-Contrast Patient & Destination Details */}
        <div className="space-y-3">
          {/* Patient Profile */}
          <div className="bg-white p-4 rounded-2xl border-2 border-qc-border flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-qc-sage/50 text-qc-primary">
              <User size={24} />
            </div>
            <div>
              <p className="text-[11px] uppercase font-bold text-qc-text/60 m-0">
                {t('helpModal.patientLabel')}
              </p>
              <p className="text-lg font-black text-qc-text m-0">
                {patientName} ({age} years / வயது)
              </p>
            </div>
          </div>

          {/* Destination */}
          <div className="bg-white p-4 rounded-2xl border-2 border-qc-border flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-100 text-qc-emergency">
              <MapPin size={24} />
            </div>
            <div>
              <p className="text-[11px] uppercase font-bold text-qc-text/60 m-0">
                {t('helpModal.destinationLabel')}
              </p>
              <p className="text-lg font-black text-qc-text m-0">
                {destination} (Floor {floor}) — {doctor}
              </p>
            </div>
          </div>

          {/* Critical Mobility Requirement Note */}
          <div className="bg-red-600 text-white p-4 rounded-2xl border-2 border-qc-text shadow-sm space-y-1">
            <div className="flex items-center gap-2">
              <AlertCircle size={20} className="text-qc-amber" />
              <p className="text-xs font-black uppercase tracking-wider m-0">
                {t('helpModal.noteLabel')}
              </p>
            </div>
            <p className="text-base font-black leading-snug m-0">
              {language === 'ta' 
                ? 'நோயாளி படிக்கட்டுகளில் ஏற முடியாது. லிஃப்ட் அல்லது சாய்வுப்பாதை தேவை.'
                : 'Patient strictly cannot climb stairs. Needs elevator or ramp escort.'}
            </p>
            <p className="text-xs font-semibold text-white/90 m-0">
              {t('helpModal.noteText')}
            </p>
          </div>

          {/* Action Instruction for Guards & Passing Staff */}
          <div className="bg-qc-text text-qc-bg p-4 rounded-2xl text-center space-y-1">
            <p className="text-sm font-bold text-qc-amber m-0">
              {language === 'ta'
                ? 'தயவுசெய்து இந்த நோயாளியை லிஃப்ட் ஏ அல்லது தரைத்தள உதவி மையத்திற்கு வழிகாட்டவும்.'
                : 'Please guide this patient to Lift A or to the Ground Floor Help Desk.'}
            </p>
            <p className="text-[11px] text-qc-bg/75 m-0">
              {t('helpModal.guardInstruction')}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleAudioCall}
            className="flex-1 tap-target-large py-3.5 px-4 rounded-2xl bg-qc-primary hover:bg-qc-primary/90 text-qc-bg font-bold text-sm flex items-center justify-center gap-2 shadow focus:ring-2 focus:ring-qc-primary"
          >
            <Volume2 size={20} className="text-qc-amber" />
            <span>{t('helpModal.speakCard')}</span>
          </button>

          <button
            type="button"
            onClick={() => setHelpModalOpen(false)}
            className="tap-target-large px-6 py-3.5 rounded-2xl bg-white border-2 border-qc-border font-bold text-sm text-qc-text hover:bg-qc-bg focus:ring-2 focus:ring-qc-primary"
          >
            {t('helpModal.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
