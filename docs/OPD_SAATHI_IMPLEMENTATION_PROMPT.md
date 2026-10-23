# OPD Saathi: Master Implementation Prompt
## Autonomous Development & Scaffolding Execution Guide

This document is the actionable, engineering-grade implementation prompt designed to build **OPD Saathi: Adaptive Hospital Journey Companion** from scratch in `e:\Hackcache`.

---

## 1. Project Overview & Tech Stack Architecture

### 1.1 Technology Choices
- **Frontend App Shell**: React 18 / 19 + Vite + Tailwind CSS + Lucide React icons.
- **Routing**: `react-router-dom` (v6) for tab/screen transitions (Patient View, Staff Desk, Waiting Room TV Board, Emergency View).
- **Backend Real-Time & Persistence**:
  - Node.js + Express server.
  - `socket.io` (v4) for authoritative, bidirectional real-time state synchronization with monotonic version sequence IDs.
  - File-backed atomic persistent storage (`better-sqlite3` or Lowdb JSON with atomic write locks) to ensure active queues and issued tokens survive server restarts.
- **Offline & PWA Capabilities**:
  - `vite-plugin-pwa` with Service Worker caching for application shell, static assets, and SVG floorplans.
  - `idb-keyval` / local IndexedDB to guarantee instant offline access to the patient's active OPD slip, route instructions, and verification QR code.
- **Audio & Accessibility Engine**:
  - Native Web Speech API (`window.speechSynthesis`) with automatic voice matching for Tamil (`ta-IN`), Hindi (`hi-IN`), and English (`en-IN`).
  - Graceful visual-cue fallback when specific speech engines are unavailable.
  - WCAG AAA standard: 48px minimum interactive tap targets, high contrast ratios (≥ 7:1), 360px viewport compatibility without horizontal scrolling.

### 1.2 Recommended Repository & Workspace Structure
```text
e:\Hackcache\
├── package.json               # Root scripts (concurrently run server & client)
├── server/
│   ├── src/
│   │   ├── server.js          # Express app + Socket.IO server entry
│   │   ├── db.js              # SQLite / Persistent store helper
│   │   ├── state.js           # Authoritative queue & room assignment state
│   │   ├── hospitalGraph.js   # 3-Floor hospital topology graph & landmarks
│   │   └── events.js          # Socket event handlers & broadcast logic
│   └── package.json
├── client/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── i18n/              # Complete tri-lingual dictionaries
│   │   │   ├── en.json
│   │   │   ├── hi.json
│   │   │   └── ta.json
│   │   ├── context/
│   │   │   ├── SocketContext.jsx   # Live synchronization & reconnect logic
│   │   │   ├── JourneyContext.jsx  # Verified Next-Action State Engine
│   │   │   └── AccessibilityContext.jsx # Text size, contrast, language
│   │   ├── navigation/        # Client Dijkstra routing & safety invariants
│   │   │   ├── router.js      # Strict zero-stairs constraint & lift pruner
│   │   │   └── hospitalData.js# 3-floor nodes, edges, landmarks
│   │   ├── components/
│   │   │   ├── common/        # Header, EmergencyBtn, LanguagePicker, AudioButton
│   │   │   ├── patient/       # SlipCard, RouteViewer, NextActionCard, HelpCardModal
│   │   │   ├── staff/         # DoctorDesk, RoomReassignModal, QueueControls
│   │   │   └── display/       # WaitingRoomTV, TokenCallBanner
│   │   ├── views/
│   │   │   ├── PatientHome.jsx
│   │   │   ├── SlipView.jsx
│   │   │   ├── NavigationGuide.jsx
│   │   │   ├── StaffDashboard.jsx
│   │   │   ├── WaitingRoomBoard.jsx
│   │   │   └── EmergencyView.jsx
│   │   └── utils/
│   │       ├── speech.js      # Web Speech TTS wrapper
│   │       └── offlineStore.js# IndexedDB slip cache
│   └── public/
│       ├── manifest.json
│       └── icons/
└── docs/
    ├── OPD_SAATHI_MASTER_BLUEPRINT.md
    └── OPD_SAATHI_IMPLEMENTATION_PROMPT.md
```

---

## 2. Core Data Contracts & Interfaces

### 2.1 The Verified Next-Action State Schema
```typescript
interface VerifiedNextActionState {
  currentStepId: string;
  stepPhase: 
    | 'REGISTRATION' 
    | 'NAVIGATING_TO_WAITING' 
    | 'AT_WAITING_ZONE' 
    | 'RESPONDING_TO_CALL' 
    | 'IN_CONSULTATION' 
    | 'NAVIGATING_TO_LAB' 
    | 'NAVIGATING_TO_PHARMACY' 
    | 'VISIT_FINISHED';
  
  intendedDestination: {
    roomId: string;
    roomName: string;
    floor: number;
    department: string;
  };
  lastConfirmedDestination: {
    roomId: string;
    roomName: string;
    floor: number;
    confirmedAt: string; // ISO timestamp
    confirmedBy: string; // "Staff-Counter-1" | "Dr-Verma"
  };

  instructionFreshness: 'CURRENT' | 'STALE' | 'SUPERSEDED' | 'DISRUPTED';
  supersededNote?: {
    previousRoom: string;
    reason: string;
    localizedExplanation: { en: string; hi: string; ta: string };
  };

  nextExpectedAction: {
    actionCode: string;
    localizedText: { en: string; hi: string; ta: string };
    audioPromptKey: string;
    visualLandmarkCue: string;
  };

  staffConfirmationRequired: boolean;
  safeRecoveryOption: {
    fallbackAction: 'PROCEED_TO_HELPDESK' | 'WAIT_AT_CURRENT_ZONE' | 'REQUEST_ATTENDANT';
    helpdeskLocation: { floor: number; landmark: string };
    showPhysicalHelpCard: boolean;
  };
}
```

### 2.2 Server Queue & Token Record Schema
```typescript
interface PatientTokenRecord {
  tokenId: string;         // e.g. "OPD-ORTHO-042"
  tokenNumber: number;     // 42
  patientName: string;     // "Kamla"
  age: number;             // 62
  gender: string;          // "Female"
  language: 'ta' | 'hi' | 'en';
  avoidStairs: boolean;    // true
  assistedMode: boolean;   // true
  departmentId: string;    // "ORTHOPEDICS"
  assignedDoctorId: string;// "DOC-VERMA"
  assignedRoomId: string;  // "ROOM-104" (initially)
  queueStatus: 'WAITING' | 'CALLED' | 'IN_CONSULTATION' | 'NO_SHOW_GRACE' | 'SKIPPED' | 'COMPLETED';
  journeyStep: string;     // 'NAVIGATING_TO_WAITING'
  issuedAt: string;        // ISO string
  calledAt?: string;
  version: number;         // Incremented on every mutation
}
```

### 2.3 Socket.IO Real-Time Event Protocol
| Event Name | Direction | Payload Structure | Purpose |
| :--- | :--- | :--- | :--- |
| `TOKEN_REGISTER` | Client → Server | `PatientRegistrationPayload` | Issues a new persistent token. |
| `TOKEN_CREATED` | Server → All | `{ token: PatientTokenRecord, version }` | Broadcasts token assignment. |
| `QUEUE_CALL_NEXT` | Staff → Server | `{ doctorId, roomId, staffPin }` | Calls next token for a doctor. |
| `TOKEN_CALLED` | Server → All | `{ tokenId, tokenNumber, roomId, doctorName, version }` | Triggers TV alert & patient phone chime. |
| `ROOM_REASSIGN` | Staff → Server | `{ doctorId, oldRoomId, newRoomId, newFloor, reason, staffPin }` | Initiates room change workflow. |
| `ROOM_REASSIGNED` | Server → All | `{ doctorId, oldRoomId, newRoomId, newFloor, timestamp, version }` | Triggers the **Patient Journey Recovery Engine**. |
| `LIFT_STATUS_UPDATE` | Staff → Server | `{ liftId, status: 'OPERATIONAL' \| 'OUT_OF_SERVICE', staffPin }` | Updates vertical transit graph availability. |
| `EMERGENCY_ALERT` | Client → Server | `{ locationId, timestamp, patientId? }` | Broadcasts urgent casualty flag to staff desk. |

---

## 3. Strict Mobility-Aware Routing Specification

### 3.1 Graph Invariant Rules
1. **Explicit Stair Exclusion**: When `avoidStairs === true`, all graph edges where `type === 'stairs'` or `accessible === false` must be completely excluded from graph pathfinding.
2. **Dynamic Transit Filtering**: Any elevator or ramp node with `status !== 'OPERATIONAL'` is removed.
3. **Strict Zero-Stairs Law**:
   - If Dijkstra pathfinding fails to find a valid route to the destination floor without stairs, the router must **NOT** fall back to stairs.
   - It must return:
     ```javascript
     {
       success: false,
       code: 'NO_ACCESSIBLE_ROUTE',
       message: 'No step-free route available to target floor.',
       fallback: {
         action: 'TRIGGER_HUMAN_HANDOFF',
         destination: 'GROUND_FLOOR_HELPDESK'
       }
     }
     ```
   - The UI immediately renders the bilingual **Staff Help Card** for security attendants.

---

## 4. Phase-by-Phase Build Protocol

### Phase 0: Workspace & Scaffolding Setup
1. Initialize root `package.json` with scripts to run server (`node server/src/server.js`) and client (`vite`).
2. Scaffold Vite client with React, Tailwind CSS, Lucide icons, and React Router.
3. Scaffold Node.js Express server with `socket.io`, `cors`, and file-backed SQLite/persistent storage.
4. Establish shared `hospitalGraph.json` with 3 complete floors, realistic Indian hospital landmarks, and designated vertical transit nodes (Lift A, Lift B, Ramp 1, Staircases).

### Phase 1: Core Patient Journey & Multilingual UI (P0-E & P4-E)
1. Build `i18n` dictionary files (`en.json`, `hi.json`, `ta.json`) ensuring 100% key parity for all clinical departments, directional instructions, and emergency alerts.
2. Build the **Kamla-First Patient View**:
   - Language selector with native scripts (English, தமிழ், हिंदी).
   - High-contrast **Assisted Mode** toggle (forces 48px touch targets, 18px+ text size).
   - Simplified Registration Form (Name, Age, Department, Avoid Stairs checkbox).
   - High-contrast digital **OPD Slip Card** with QR code and clear next-action directive.
3. Implement `router.js` executing Dijkstra with strict accessibility filtering and landmark breadcrumbs.
4. Integrate native Web Speech API helper for Tamil and Hindi audio instructions.

### Phase 2: Verified Next-Action Engine & Recovery Implementation (U1 & P0-E)
1. Build `JourneyContext.jsx` implementing the `VerifiedNextActionState` machine.
2. Build `NextActionCard.jsx`:
   - Highlights: **Where am I? What should I do next? What changed?**
   - Displays freshness badge (`CURRENT` vs `SUPERSEDED`).
   - When a room reassignment occurs, display the clear diff card: *"Room 104 (SUPERSEDED) → Room 208 (Confirmed at 10:24 AM by Staff)"*.
   - Play voice chime and Tamil speech announcement.

### Phase 3: Persistent Real-Time Synchronization (P2-E)
1. Implement persistent queue storage in `server/src/db.js` using SQLite or atomic file store.
2. Build `StaffDashboard.jsx`:
   - PIN-protected actions (default PIN: `1234`).
   - Active doctor list and room status.
   - "Call Next Token" button.
   - "Reassign Room" modal with reason dropdown and immediate confirmation.
   - "Toggle Lift Status" control to simulate elevator outages during judging.
3. Build `WaitingRoomBoard.jsx`:
   - High-contrast, large-format TV display.
   - Flashing token call banner with audible chime.
   - Live doctor-to-room directory with real-time room reassignment animations.

### Phase 4: Offline PWA & Human Assistance Handoff (P3-E & U4)
1. Configure Service Worker to cache static assets, icons, and hospital graph data.
2. Store issued OPD slip in `IndexedDB` so refreshing in Airplane Mode immediately renders the slip and cached navigation.
3. Build `HelpCardModal.jsx`:
   - Persistent red/orange "எனக்கு உதவி வேண்டும்" ("I Need Help") button on all screens.
   - Opens a full-screen, high-contrast bilingual physical card:
     > **"உதவி தேவை / HELP NEEDED"**
     > **நோயாளி: கமலா (வயது 62) / Patient: Kamla (Age 62)**
     > **இலக்கு: அறை 208 - பொது மருத்துவம் / Destination: Room 208 - General Medicine**
     > **குறிப்பு: படிக்கட்டுகளில் ஏற முடியாது / Note: Cannot use stairs**
     > **தயவுசெய்து லிஃப்ட் ஏ அல்லது உதவி மையத்திற்கு வழிகாட்டவும் / Please guide to Lift A or Help Desk.**

### Phase 5: Verification Suite & Demo Orchestration (P1-E & P5-E)
1. Add an automated test runner script `verify-system.js` that executes:
   - 100 randomized routing checks proving **0% stair traversal** when `avoidStairs: true`.
   - Locale dictionary check asserting **0 missing translation keys**.
   - Server persistence check (writes token, restarts store, verifies token remains intact).
2. Build `DemoHarness.jsx` (accessible via `/demo` or hidden staff trigger):
   - 1-click preset: "Load Kamla Scenario".
   - 1-click trigger: "Simulate Doctor Room Reassignment (104 → 208)".
   - 1-click trigger: "Simulate Lift A Breakdown".
   - 1-click trigger: "Simulate Network Disconnection".

---

## 5. Definition of Done for Hackathon Judging

The implementation is verified and judge-ready when:
1. **Three simultaneous screens** (Patient Mobile, Staff Desk, Waiting Room TV) synchronize in real time over Socket.IO without manual refresh.
2. When Dr. Verma changes rooms on the Staff Desk, Kamla's phone vibrates, chimes, speaks in Tamil, updates the route, and clearly marks the old room as `SUPERSEDED`.
3. If Lift A is marked out of order, the app **never** routes Kamla to the stairs; it routes via Ramp 1 or activates the bilingual Help Card.
4. When Airplane Mode is engaged, Kamla's slip and step-by-step route load instantly with a clear offline timestamp badge.
5. All interactive elements satisfy 48px touch targets at 360px viewport width with zero horizontal overflow.
