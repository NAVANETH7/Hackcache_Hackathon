import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext';
import { useAccessibility } from './AccessibilityContext';
import { calculateRoute } from '../navigation/router';
import { saveActiveSlipOffline, getActiveSlipOffline } from '../utils/offlineStore';
import { speakText } from '../utils/speech';

const JourneyContext = createContext();

export function JourneyProvider({ children }) {
  const { serverState, hospitalGraph } = useSocket();
  const { language, t } = useAccessibility();

  const [activeSlip, setActiveSlip] = useState(null);
  const [activeRoute, setActiveRoute] = useState(null);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [currentStepNodeId, setCurrentStepNodeId] = useState('ENTRANCE_G');

  // The Verified Next-Action State Model (§3.2)
  const [nextActionState, setNextActionState] = useState({
    currentStepId: 'REGISTRATION',
    stepPhase: 'REGISTRATION',
    intendedDestination: {
      roomId: 'REG_COUNTER',
      roomName: 'OPD Registration Desk',
      floor: 0,
      department: 'Registration'
    },
    lastConfirmedDestination: {
      roomId: 'REG_COUNTER',
      roomName: 'OPD Registration Desk',
      floor: 0,
      confirmedAt: new Date().toISOString(),
      confirmedBy: 'Hospital Gate'
    },
    instructionFreshness: 'CURRENT', // CURRENT | SUPERSEDED | STALE | DISRUPTED
    supersededNote: null,
    nextExpectedAction: {
      actionCode: 'PROCEED_TO_REGISTRATION',
      localizedText: {
        en: 'Please proceed to Registration Counter 1 to get your token',
        hi: 'कृपया अपना टोकन प्राप्त करने के लिए पंजीकरण काउंटर 1 पर जाएं',
        ta: 'உங்கள் டோக்கனைப் பெற பதிவு கவுண்டர் 1-க்கு செல்லவும்'
      },
      visualLandmarkCue: 'Opposite May I Help You Counter'
    },
    staffConfirmationRequired: false,
    safeRecoveryOption: {
      fallbackAction: 'PROCEED_TO_HELPDESK',
      helpdeskLocation: { floor: 0, landmark: 'Ground Floor May I Help You Desk' },
      showPhysicalHelpCard: false
    }
  });

  // Load offline slip on initial mount
  useEffect(() => {
    async function loadSaved() {
      const saved = await getActiveSlipOffline();
      if (saved) {
        setActiveSlip(saved);
      }
    }
    loadSaved();
  }, []);

  // Update route whenever active slip, graph, or lift statuses change
  useEffect(() => {
    if (!activeSlip || !hospitalGraph) return;

    const targetRoomId = activeSlip.assignedRoomId || 'OPD_104';
    const lifts = serverState?.lifts || {};

    const routeResult = calculateRoute(hospitalGraph, currentStepNodeId, targetRoomId, {
      avoidStairs: activeSlip.avoidStairs !== false,
      liftsState: lifts,
      language
    });

    if (routeResult.success) {
      setActiveRoute(routeResult);
    } else {
      // Invariant: No accessible route found -> trigger human handoff
      setActiveRoute(null);
      setNextActionState(prev => ({
        ...prev,
        instructionFreshness: 'DISRUPTED',
        safeRecoveryOption: {
          ...prev.safeRecoveryOption,
          showPhysicalHelpCard: true
        }
      }));
      setHelpModalOpen(true);
    }
  }, [activeSlip, hospitalGraph, currentStepNodeId, serverState?.lifts, language]);

  // Synchronize active slip with authoritative server token updates
  useEffect(() => {
    if (!activeSlip || !serverState?.tokens) return;

    const matchedToken = serverState.tokens.find(t => t.tokenId === activeSlip.tokenId);
    if (!matchedToken) return;

    // Detect if room was reassigned!
    const roomChanged = matchedToken.assignedRoomId !== activeSlip.assignedRoomId;
    const queueChanged = matchedToken.queueStatus !== activeSlip.queueStatus;

    if (roomChanged || queueChanged || matchedToken.version > activeSlip.version) {
      const updatedSlip = { ...activeSlip, ...matchedToken };
      setActiveSlip(updatedSlip);
      saveActiveSlipOffline(updatedSlip);

      if (roomChanged && matchedToken.supersededNote) {
        // Trigger the signature Patient Journey Recovery moment!
        setNextActionState(prev => ({
          ...prev,
          stepPhase: 'NAVIGATING_TO_WAITING',
          intendedDestination: {
            roomId: matchedToken.assignedRoomId,
            roomName: matchedToken.assignedRoomId === 'OPD_208' ? 'Room 208 (Floor 2)' : matchedToken.assignedRoomId,
            floor: matchedToken.assignedFloor || 2,
            department: matchedToken.departmentName || 'Orthopedics'
          },
          lastConfirmedDestination: {
            roomId: matchedToken.assignedRoomId,
            roomName: matchedToken.assignedRoomId,
            floor: matchedToken.assignedFloor || 2,
            confirmedAt: matchedToken.supersededNote.supersededAt || new Date().toISOString(),
            confirmedBy: matchedToken.supersededNote.confirmedBy || 'Staff Desk'
          },
          instructionFreshness: 'SUPERSEDED',
          supersededNote: matchedToken.supersededNote,
          nextExpectedAction: {
            actionCode: 'NAVIGATE_TO_NEW_ROOM',
            localizedText: {
              en: `Dr. Verma has relocated to Room 208 on Floor 2. Follow updated route via Lift A.`,
              hi: `डॉ. वर्मा कमरा 208 (दूसरी मंजिल) में स्थानांतरित हो गए हैं। लिफ्ट ए के रास्ते का पालन करें।`,
              ta: `டாக்டர் வர்மா அறை 208-க்கு (தளம் 2) மாற்றப்பட்டுள்ளார். லிஃப்ட் ஏ வழியாக புதிய வழியைப் பின்பற்றவும்.`
            },
            visualLandmarkCue: 'Opposite Child Immunization Wing, near Lift A'
          }
        }));

        // Audio Announcement in Tamil / selected language
        const speechText = language === 'ta'
          ? "முந்தைய தகவல் மாற்றப்பட்டுள்ளது. டாக்டர் வர்மா அறை 208-க்கு மாற்றப்பட்டுள்ளார். லிஃப்ட் ஏ வழியாக புதிய பாதை கணக்கிடப்பட்டுள்ளது."
          : language === 'hi'
          ? "निर्देश अपडेट किया गया है। डॉ. वर्मा कमरा 208 में चले गए हैं। लिफ्ट ए का उपयोग करें।"
          : "Instruction updated. Dr. Verma has moved to Room 208 on Floor 2. Please use Lift A.";
        
        speakText(speechText, language);
      } else if (queueChanged && matchedToken.queueStatus === 'CALLED') {
        // Token Called alert!
        const calledNotice = language === 'ta'
          ? `டோக்கன் ${matchedToken.tokenNumber} அழைக்கப்பட்டது. தயவுசெய்து அறைக்குள் செல்லவும்.`
          : language === 'hi'
          ? `टोकन संख्या ${matchedToken.tokenNumber} को बुलाया गया है। कृपया कमरे में प्रवेश करें।`
          : `Token ${matchedToken.tokenNumber} is now called. Please proceed inside.`;
        
        speakText(calledNotice, language);
      }
    }
  }, [serverState, activeSlip, language]);

  const setPatientSlip = (slip) => {
    setActiveSlip(slip);
    saveActiveSlipOffline(slip);
    setCurrentStepNodeId('REG_COUNTER');
  };

  const advanceToCheckpoint = (nodeId) => {
    setCurrentStepNodeId(nodeId);
  };

  return (
    <JourneyContext.Provider
      value={{
        activeSlip,
        setPatientSlip,
        activeRoute,
        currentStepNodeId,
        advanceToCheckpoint,
        nextActionState,
        helpModalOpen,
        setHelpModalOpen
      }}
    >
      {children}
    </JourneyContext.Provider>
  );
}

export function useJourney() {
  return useContext(JourneyContext);
}
