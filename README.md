# OPD Saathi: Adaptive Hospital Journey Companion
### Multilingual, Mobility-Aware Public Hospital Navigation & Real-Time Queue Coordination

> **Problem Statement (in two lines):**  
> Patients at government hospitals wait hours in chaotic lines to register and get an OPD slip, only to get lost searching for confusing room numbers across crowded floors. Registering and navigating is especially overwhelming for elderly patients, non-English speakers, illiterate visitors, and those with physical disabilities.

**OPD Saathi** is an intelligent, offline-first hospital journey companion designed for public district hospitals. It empowers vulnerable patients to register in their mother tongue, receive an instant digital OPD slip, monitor queue progress with sensory alerts, and follow zero-stairs step-by-step routes with physical landmarks. At the same time, hospital staff receive a real-time queue orchestration dashboard and TV waiting-room board.

---

## 👥 Who the App is For

- **Primary Persona — Kamla (62):** A solo visitor from a rural district, reads a little Hindi/Tamil, owns a basic budget Android smartphone, walks slowly with joint pain, and strictly avoids stairs.
- **Vulnerable & First-Time Patients:** Non-English readers, elderly individuals, pregnant mothers, and wheelchair users who find massive hospital complexes intimidating.
- **Family Helpers & Caregivers:** Relatives using "Assisted Mode" to register and guide their family members.
- **Hospital Registration Attendants & Help Desk Staff:** High-speed counter clerks registering walk-in patients without phones.
- **OPD Doctors & Nursing Supervisors:** Clinicians updating real-time queue states, breaks, and delays to prevent waiting room overcrowding.

---

## 📱 What It Does: All 12 Screens Explained (One Line per Screen)

1. **Home (`/`):** A calm, 4-button gateway (*Register*, *I have my slip*, *Find a place*, *Emergency*) with a first-visit native-script language picker.
2. **Register (`/register`):** A 1-question-per-screen wizard with progress indicators, speech-to-text mic input, plain-word symptom cards, assisted mode, and help desk links.
3. **OPD Slip (`/slip`):** A digital patient slip showing token, room, floor, doctor, ahead count, estimated wait, QR code, print, image save, read aloud, and large-text mode.
4. **My Turn (`/my-turn`):** A live queue status tracker with doctor state, sensory 3-ahead proximity alerts (chime, vibration, simulated SMS, banner), and called token directions.
5. **I Have My Slip (`/find-slip`):** Instant visit recovery via manual token entry or direct camera QR scanning using the browser's BarcodeDetector API.
6. **Find a Place (`/find-place`):** Interactive 3-floor SVG architectural navigation with Dijkstra shortest path, step-by-step landmark directions, read aloud, and an "I'm lost" staff help card.
7. **Emergency (`/emergency`):** Zero-barrier casualty guide with 1-touch 112/108 calling, direct red-line navigation, and immediate hospital-wide urgent flag trigger.
8. **Settings (`/settings`):** Accessibility command center for 3 languages (English, हिंदी, தமிழ்), 3 text sizes, high contrast, auto read aloud, avoid stairs, and PWA install button.
9. **Staff Dashboard (`/staff`):** Real-time department queue control room with call next, no-show, send-to-end, transfer, doctor status/delay controls, overcrowding colors, and pinned audible emergency alarms.
10. **Registration Counter (`/counter`):** High-speed 3-tap staff registration for walk-in patients without smartphones with instant physical thermal slip print preview.
11. **Waiting-Room TV Board (`/board`):** High-contrast public TV display showing active and upcoming tokens with alternating tri-lingual rotation and spoken voice announcements.
12. **Demo Controls (`/staff` demo panel):** Rapid jury demonstration engine with 1-click 20 sample patient population, 10x time speedup, transit disruption simulator, and complete state reset.

---

## 🚨 Emergencies Come First: Clinical Safety Mandate

### How Emergencies are Handled:
1. **Persistent Emergency Button:** Visible in the header of every single screen, including before registration, linking immediately to the Casualty Department map and national helplines (**112** for emergency, **108** for ambulance).
2. **Pre-Registration Triage Red Flags:** The very first registration step presents a clear list of life-threatening symptoms:
   - *Chest pain or pressure*
   - *Severe trouble breathing*
   - *Heavy or uncontrollable bleeding*
   - *Fainting, unconsciousness, or inability to wake up*
   - *Sudden weakness or a drooping face (stroke signs)*
   - *Serious head or bodily injury*
   - *A pregnant woman bleeding or in severe pain*
   - *A child who is very unwell, limp, or unresponsive*
   - **Mandate Displayed:** *"Any of these? Go to Emergency now. You do not need a token or registration."*
3. **"I Need Urgent Help" Distress Button:** Patients or helpers can tap this button at any moment to broadcast an instant hospital-wide emergency flag. This flag is pinned to the top of the staff dashboard with a continuous pulsating web-audio alarm until a staff member marks it as attended.

### Why the App Never Decides Who is Urgent:
> **The app NEVER decides whether a condition is an emergency, NEVER tells anyone they can wait, and NEVER forces an urgent case to register or hold a token.**  
> Medical triage is an exclusive clinical responsibility. Algorithm-driven triage can fail to detect atypical presentations (e.g., silent myocardial infarction or subtle pediatric sepsis). The app guarantees immediate, unblocked routing to Casualty and alerts qualified human doctors.

---

## 🎨 Key Design Decisions & Why We Made Them

| Design Decision | Implementation | Why We Made It |
|---|---|---|
| **Assisted Mode** | Toggle in header & wizard; activates 22px+ font, auto Web Speech narration, and helper input mode. | Accommodates elderly patients like Kamla who may have low vision, tremor, or rely on a grandchild/helper. |
| **Picture Cards & Plain Words** | Symptom-based cards (e.g., General Medicine: *"fever, cough, BP, sugar"*; Ortho: *"knee pain, fractures"*) instead of Latin terms. | Patients often don't know whether a cough requires "Pulmonology" or "General Medicine". Plain words eliminate wrong-room queues. |
| **The Zero-Stairs Invariant** | Dijkstra pathfinder strictly strips all staircase edges when `avoidStairs: true`. | Elderly and arthritic patients can suffer severe pain or falls on stairs. If elevators fail, the app falls back to ramps or human assistance handoff—never stairs. |
| **Tri-Lingual Parity (EN, HI, TA)** | 100% key parity across all 244 keys in `en.json`, `hi.json`, and `ta.json`, with native script names (*English*, *हिंदी*, *தமிழ்*). | Ensures non-English speakers are never disenfranchised. Every landmark, floor name, and direction adapts instantly. |
| **Read Aloud (Web Speech API)** | Native browser speech synthesis with automatic language detection (`ta-IN`, `hi-IN`, `en-IN`). | Empowers illiterate patients to navigate the hospital independently without relying on printed text. |
| **Zero Image Downloads (Pure Inline SVG)** | Floor plans and interface icons are coded entirely in lightweight inline SVG (<40KB total). | Loads instantaneously on 2G/3G mobile networks inside thick concrete hospital walls where images fail to load. |

---

## ⏱️ How Waiting Time is Calculated

$$\text{Estimated Wait} = \left(\text{People Ahead} \times \text{Avg Consultation Time of Last 10 Patients}\right) + \text{Doctor Delay}$$

- **Base Consultation Time:** Seeded from department standards in `departments.js` (e.g., 8 mins for General Medicine, 12 mins for Orthopedics), dynamically updated as the last 10 patients are completed.
- **Doctor Delay / Break Integration:** If a doctor posts a 15-minute emergency ward round or a delay, that exact delta is added to every waiting patient's estimate immediately.
- **Rounding Rule:** The result is rounded to the nearest 5 minutes and displayed reassuringly as *"about X minutes"*, avoiding false precision that causes patient frustration.

---

## 🏥 How OPD Saathi Improves on a Hospital Visit Today

| Traditional Hospital Visit Today | OPD Saathi Experience |
|---|---|
| 2–3 hour standing queue at central registration just to receive a paper slip. | Self-registration in 45 seconds on mobile, or 3-tap priority registration at the counter. |
| Cryptic paper slips with handwritten room numbers that patients cannot read. | Digital OPD slip with clear doctor photo, room number, floor level, and ahead count. |
| Wandering aimlessly down noisy corridors asking strangers for directions. | Turn-by-turn landmark directions (*"Opposite the blue chairs, next to the water cooler"*). |
| Patients crowding tightly outside doctor doors fearing they will miss their call. | Live queue tracker with 3-ahead sensory alerts (sound, vibration, simulated SMS). |
| Critical emergencies delayed in regular queues due to lack of triage awareness. | Unmissable triage red-flags list and 1-tap urgent distress button to staff dashboard. |

---

## ⚙️ How to Run Locally

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/opd-saathi.git
cd opd-saathi

# Install all root, frontend, and backend dependencies
npm run install:all
```

### Starting the Application
You can run both the Frontend client and Backend coordination server concurrently with a single command:
```bash
npm run dev
```

Or run them in separate terminals:
```bash
# Terminal 1: Backend Coordination Server (Port 3001)
npm run backend

# Terminal 2: Frontend Vite Development Client (Port 5173)
npm run frontend
```

### Accessing the Prototype Screens
- **Patient Mobile Home:** [http://localhost:5173/](http://localhost:5173/)
- **Registration Wizard:** [http://localhost:5173/register](http://localhost:5173/register)
- **Live Queue Tracker:** [http://localhost:5173/my-turn](http://localhost:5173/my-turn)
- **Find a Place (SVG Map):** [http://localhost:5173/find-place](http://localhost:5173/find-place)
- **Emergency Casualty:** [http://localhost:5173/emergency](http://localhost:5173/emergency)
- **Staff Control Dashboard:** [http://localhost:5173/staff](http://localhost:5173/staff) *(Prototype PIN: `1234`)*
- **Staff Registration Counter:** [http://localhost:5173/counter](http://localhost:5173/counter)
- **Waiting Room TV Board:** [http://localhost:5173/board](http://localhost:5173/board)

---

## 🔬 System Verification & Invariant Testing

Run the automated invariant verification suite:
```bash
npm run verify
```
This executes:
1. **Tri-lingual Key Parity Audit:** 100% parity across English, Hindi, and Tamil dictionaries (244 keys).
2. **Zero-Stairs Invariant Testing:** Verifies 0 stair edges are traversed when `avoidStairs: true`.
3. **Lift Failure Recovery:** Confirms dynamic rerouting to ramps and human handoff when all vertical lifts fail.
4. **10-Pair Cross-Floor Routing Table:** Tests 10 realistic route pairs across floors 0, 1, and 2 with avoid stairs ON vs OFF.

---

## 🌐 Step-by-Step Deployment Guide (Vercel & Netlify)

### Deploying Frontend to Vercel
1. Push your code to GitHub.
2. In Vercel, click **"Add New Project"** and import the repository.
3. Configure the Project Settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. **Preventing 404 on Page Refresh (SPA Rewrites):**  
   The repository already includes `vercel.json` in the root and `frontend/public/_redirects`. In Vercel, ensure the rewrite rule is active:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```
5. Click **"Deploy"**. Your app is live!

### Deploying Frontend to Netlify
1. Connect your GitHub repository in Netlify.
2. Build Settings:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/dist`
3. Netlify automatically detects `frontend/public/_redirects` containing:
   ```text
   /*    /index.html   200
   ```
   This guarantees refreshing `/staff`, `/board`, or `/my-turn` will never trigger a 404 error.

### Deploying the Backend Coordination Server (Render / Railway)
1. In Render or Railway, create a new **Web Service** pointing to `backend/`.
2. Build Command: `npm install`
3. Start Command: `node src/server.js`
4. In your frontend Vercel/Netlify dashboard, add the environment variable:
   `VITE_SOCKET_SERVER_URL=https://your-backend-url.onrender.com`

---

## 🎭 3-Minute Live Hackathon Demo Script (Scoring Guide Aligned)

| Time | Action | What to Say / Show | Hackathon Scoring Alignment |
|---|---|---|---|
| **0:00 - 0:35** | Open [http://localhost:5173/](http://localhost:5173/) on mobile view. | *"Meet Kamla, 62, visiting a district hospital alone. She reads Tamil, has arthritic knees, and fears stairs. Notice our first-visit language modal in native scripts."* | **Language Accessibility & Inclusive Design** |
| **0:35 - 1:10** | Tap **"Register"**, click **"Kamla Preset"**, select Hindi/Tamil, tap Orthopedics picture card. | *"Registration is 1-question per screen with plain-word symptom cards—'knee pain, fractures' instead of medical jargon. In Assisted Mode, everything is read aloud."* | **Ease of Registration & UX** |
| **1:10 - 1:45** | View generated OPD Slip (`MED-042`), tap **"Directions to Room"**. | *"Kamla gets her digital slip with QR code. When she opens directions, our Dijkstra router strictly enforces the Zero-Stairs Law, taking Lift A directly to Floor 1 with visual landmarks."* | **Navigation Accuracy & Safety** |
| **1:45 - 2:20** | Open `/staff` in Tab 2, `/board` in Tab 3 side-by-side. Click **"Call Next"**. | *"On the TV board, Kamla's token is called with spoken tri-lingual voice announcements. Simultaneously, on Kamla's phone, the screen vibrates, plays an audio chime, and displays a simulated SMS."* | **Queue-Management Efficiency & Technical Execution** |
| **2:20 - 2:45** | On patient screen, tap **"Emergency"** or **"I need urgent help"**. | *"Emergencies never wait for tokens. An unmissable distress banner immediately pops up at the top of the staff dashboard with an audible chime until marked seen."* | **Emergency Handling & Clinical Ethics** |
| **2:45 - 3:00** | Turn Chrome Network to **Offline**; refresh page. | *"Notice our PWA caches maps and the slip offline with a 'Last updated' relative ticker. Zero expensive hardware, 100% open web standards."* | **Real-World Usefulness & Resilience** |

---

## ⚠️ Potential Live Demo Failure Modes & How to Avoid Them

| Potential Risk | Root Cause | Built-in Mitigation / Demo Fix |
|---|---|---|
| **Wi-Fi Drops during Presentation** | Weak conference hall Wi-Fi kills WebSocket connection. | **Hybrid Sync:** The app seamlessly falls back to `BroadcastChannel` and `localStorage`. Multiple tabs on the same laptop sync in <5ms with zero internet connection! |
| **Browser Blocks Audio Chimes** | Autoplay policy blocks speech/sound before user gesture. | Click anywhere on the screen (or tap the Language/Settings icon) once during the introduction to grant audio playback permission. |
| **Page Refresh Returns 404** | Single-page application route refresh on static hosting. | Built-in `_redirects` and `vercel.json` redirect all routes to `index.html`. |
| **Camera Access Denied for QR Scan** | Presentation laptop doesn't grant webcam permission. | Find Slip view provides a 1-tap **"Enter Token Manually"** input as an instant fallback. |
| **Speech Voice Not Installed on Machine** | OS lacks native Tamil/Hindi TTS voice pack. | The app safely detects missing voice packs and falls back to visually rendered banners without throwing any script errors. |

---

## 🔮 What is Simulated vs. What We'd Build Next

### What is Simulated for Hackathon Demo:
- **Simulated SMS Gateways:** Renders an in-app system SMS toast representing National Informatics Centre (NIC) SMS integration.
- **Simulated Queue Speed:** A 10x demo accelerator button advances queue consultation clocks in seconds rather than minutes.
- **Simulated Hardware TV:** Standard browser viewport on `/board` mirrors hospital waiting-room commercial displays.
- **Simulated BarcodeDetector:** Polyfilled fallback scanner for desktop browsers lacking hardware barcode detection.

### Production Roadmap (What We'd Build Next):
1. **ABDM & ABHA Scan-and-Share Integration:** Instant token issuance by scanning the hospital's national ABHA QR code.
2. **Indoor BLE Beacon Positioning:** Blue-dot turn-by-turn indoor wayfinding utilizing sub-meter Bluetooth Low Energy beacons.
3. **Conversational WhatsApp/IVR Bot:** Voice-based OPD registration over simple phone calls for patients without smartphones.
4. **Physical Queue Display Hardware:** Integration with ESP32-driven LED matrix token displays mounted outside consultation rooms.
5. **Real-time Bed & Diagnostic Slot Tracking:** Extending queue logic to ultrasound, X-ray, and pathology collection counters.
