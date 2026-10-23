# OPD Saathi: Adaptive Hospital Journey Companion
### Multilingual, Mobility-Aware Public Hospital Navigation & Real-Time Queue Coordination

OPD Saathi is an intelligent healthcare navigation companion built for government district hospitals. Unlike static queue tickers or generic map viewers, OPD Saathi actively adapts when hospital conditions change—recalculating step-free routes, alerting patients in their native tongue, and facilitating human assistance handoffs when automation reaches its limits.

---

## 🌟 Key Innovations & Differentiators

1. **Patient Journey Recovery Engine (U1 / P0-E)**:
   - When a staff member moves a doctor to a different room mid-shift, active patients receive an instant push notification, an audible chime, and spoken guidance in **Tamil**, **Hindi**, or **English**.
   - The system displays a clear superseding diff (*"Room 104 (SUPERSEDED) → Room 208 (Confirmed by Staff)"*) and automatically calculates a new route.

2. **Strict Mobility-Aware Router & The Zero-Stairs Law (U2 / P0-E)**:
   - Designed around **Kamla (62, solo visitor with severe arthritis)**.
   - If `avoidStairs` is enabled, the router strictly excludes all staircases.
   - **Safety Invariant**: If an elevator breaks down and no ramp exists, the system **never** silently falls back to stairs; it triggers **Human Assistance Handoff** and directs the patient to the ground-floor help desk.

3. **Persistent Multi-Device Synchronization (P2-E)**:
   - Real-time Socket.IO synchronization between **Patient Mobile**, **Staff Dashboard**, and **Waiting-Room TV Display**.
   - File-backed atomic persistence (`opd_state.json`) ensures queues, doctor assignments, and active tokens survive server reboots.

4. **Human Assistance Handoff (U4)**:
   - A 1-tap emergency/confusion button opens a full-screen, high-contrast bilingual card (*"HELP NEEDED: Guide Kamla to Room 208. Cannot climb stairs."*) to show security guards or hospital attendants.

5. **Confidence-Aware Offline PWA (P3-E)**:
   - Caches application shell, hospital landmark maps, and the patient's active OPD slip in `IndexedDB`.
   - Explicit "Last Synced" timestamp and "Offline Mode" indicators.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation
```bash
# Clone or navigate to the repository
cd e:\Hackcache

# Install dependencies across all modules
npm install
npm install --prefix backend
npm install --prefix frontend
```

### Running the Application
To run both the backend server (port 3001) and frontend client (port 5173) concurrently:
```bash
npm run dev
```

Or run them individually:
```bash
# Terminal 1: Backend Coordination Server
npm run backend

# Terminal 2: Frontend Vite Client
npm run frontend
```

Open your browser at:
- **Patient Guide**: [http://localhost:5173/](http://localhost:5173/)
- **Staff Dashboard**: [http://localhost:5173/staff](http://localhost:5173/staff) (PIN: `1234`)
- **Waiting Room TV Board**: [http://localhost:5173/board](http://localhost:5173/board)
- **Emergency Casualty**: [http://localhost:5173/emergency](http://localhost:5173/emergency)
- **Judging Demo Harness**: [http://localhost:5173/demo](http://localhost:5173/demo)

---

## 🧪 Automated Verification Suite

Run the automated test harness to verify routing safety invariants, dictionary completeness, and server persistence:
```bash
npm run verify
```
Expected output: **18 / 18 Tests Passed (100% Success Rate)**.

---

## 🎬 3-Minute Hackathon Demo Script

1. **The Hook (0:00 - 0:35)**:
   - Open [http://localhost:5173/](http://localhost:5173/). Introduce **Kamla** (62, solo, Tamil speaker, arthritic knees).
   - Click the golden **"'கமலா' டெமோ சுயவிவரம்"** button to auto-fill her profile.
   - Click **"OPD சீட்டு பெறவும்"** to generate the digital slip with QR code and live ahead count.
2. **The Guided Journey (0:35 - 1:15)**:
   - Show that the route automatically chooses Ramp 1 and Lift A, completely bypassing the stairs.
   - Click **"குரல் வழிகாட்டலைக் கேட்க"** to hear spoken Tamil directions.
3. **The Signature Recovery Moment (1:15 - 2:05)**:
   - Open [http://localhost:5173/staff](http://localhost:5173/staff) in a second tab.
   - Click **"Reassign Room"** for Dr. Verma and select **Room 208 on Floor 2**.
   - Switch back to the Patient tab: observe the amber **"கவனம்: தகவல் மாற்றப்பட்டுள்ளது"** banner, the spoken Tamil notification, and the recalculated route via Lift A!
4. **The Safe Failure Test (2:05 - 2:35)**:
   - On the Staff page, click **"Break Lift"** on Elevator A.
   - Show how the app dynamically switches to Ramp 1 without ever routing to stairs.
   - Click **"எனக்கு உதவி வேண்டும்"** to demonstrate the high-contrast bilingual Help Card for hospital guards.
5. **Impact & Engineering Proof (2:35 - 3:00)**:
   - Highlight the 18/18 passing automated tests, crash-resilient persistent storage, zero expensive hardware requirement, and WCAG AAA accessibility.

---

## 📁 Architecture Overview

```text
e:\Hackcache\
├── backend/
│   ├── src/
│   │   ├── server.js        # Express + Socket.IO server
│   │   ├── db.js            # Persistent disk-backed store (survives crashes)
│   │   ├── state.js         # Authoritative queue & decoupled visit progress
│   │   └── hospitalGraph.js # 3-Floor topology graph with landmark metadata
│   ├── data/                # opd_state.json (disk persistent store)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── i18n/            # 1:1 Key parity dictionaries (ta.json, hi.json, en.json)
│   │   ├── context/         # SocketContext, AccessibilityContext, JourneyContext
│   │   ├── navigation/      # Dijkstra router with strict zero-stairs invariant
│   │   ├── components/      # NextActionCard, SlipCard, RouteViewer, HelpCardModal
│   │   └── views/           # PatientHome, StaffDashboard, WaitingRoomBoard, EmergencyView, DemoHarness
│   ├── index.html
│   └── package.json
├── scripts/
│   └── verify-system.js     # Automated invariant verification script
└── docs/
    ├── OPD_SAATHI_MASTER_BLUEPRINT.md
    └── OPD_SAATHI_IMPLEMENTATION_PROMPT.md
```
