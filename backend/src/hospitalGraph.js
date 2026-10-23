/**
 * Hospital Graph Specification for District Government Hospital
 * 3 Floors: Ground (0), First (1), Second (2)
 * Supports:
 * - Mobility-aware routing (stairs, ramps, lifts)
 * - Physical landmark descriptions for navigation guidance in multiple languages
 * - Dynamic operational statuses for vertical transit
 */

export const hospitalGraph = {
  floors: [
    { level: 0, name: "Ground Floor", name_hi: "भू-तल (Ground Floor)", name_ta: "தரை தளம் (Ground Floor)" },
    { level: 1, name: "First Floor", name_hi: "प्रथम तल (First Floor)", name_ta: "முதல் தளம் (1st Floor)" },
    { level: 2, name: "Second Floor", name_hi: "द्वितीय तल (Second Floor)", name_ta: "இரண்டாம் தளம் (2nd Floor)" }
  ],
  nodes: [
    // --- Floor 0 (Ground Floor) ---
    {
      id: "ENTRANCE_G",
      floor: 0,
      name: "Main Hospital Entrance",
      name_hi: "मुख्य अस्पताल प्रवेश द्वार",
      name_ta: "மருத்துவமனை முதன்மை நுழைவாயில்",
      type: "checkpoint",
      landmark: "Main Security Gate & Wheelchair Station",
      landmark_hi: "मुख्य सुरक्षा गेट और व्हीलचेयर स्टैंड",
      landmark_ta: "முதன்மை பாதுகாப்பு வாயில் மற்றும் சக்கர நாற்காலி மையம்"
    },
    {
      id: "HELP_DESK_G",
      floor: 0,
      name: "May I Help You Desk",
      name_hi: "सहायता केंद्र (May I Help You)",
      name_ta: "உதவி மையம் (May I Help You)",
      type: "helpdesk",
      landmark: "Large Yellow Counter right at entrance",
      landmark_hi: "प्रवेश द्वार के सामने बड़ा पीला काउंटर",
      landmark_ta: "நுழைவாயிலில் உள்ள பெரிய மஞ்சள் கவுண்டர்"
    },
    {
      id: "REG_COUNTER",
      floor: 0,
      name: "OPD Registration Counters 1-4",
      name_hi: "ओपीडी पंजीकरण काउंटर 1-4",
      name_ta: "OPD பதிவு கவுண்டர்கள் 1-4",
      type: "counter",
      landmark: "Opposite May I Help You Desk",
      landmark_hi: "सहायता केंद्र के ठीक सामने",
      landmark_ta: "உதவி மையத்திற்கு எதிரே"
    },
    {
      id: "EMERGENCY_G",
      floor: 0,
      name: "Casualty / Emergency Department",
      name_hi: "आपातकालीन / कैजुअल्टी विभाग",
      name_ta: "அவசர சிகிச்சை பிரிவு (Casualty)",
      type: "emergency",
      landmark: "Red Line on floor directly from entrance",
      landmark_hi: "फर्श पर लाल रेखा के साथ सीधा रास्ता",
      landmark_ta: "தரையில் உள்ள சிவப்பு கோடு பாதை"
    },
    {
      id: "PHARMACY_G",
      floor: 0,
      name: "Central Pharmacy Counter",
      name_hi: "केंद्रीय दवा वितरण केंद्र (Pharmacy)",
      name_ta: "மத்திய மருந்தகம் (Pharmacy)",
      type: "pharmacy",
      landmark: "Near Exit Gate, beside Drinking Water Station",
      landmark_hi: "निकास द्वार के पास, पानी की टंकी के बगल में",
      landmark_ta: "வெளியேறும் வாயில் அருகில், குடிநீர் தொட்டி பக்கம்"
    },
    {
      id: "WATER_BOOTH_G",
      floor: 0,
      name: "Green Drinking Water Booth",
      name_hi: "हरा पेयजल केंद्र",
      name_ta: "பச்சை குடிநீர் மையம்",
      type: "landmark",
      landmark: "Bright Green Filter Machine with benches",
      landmark_hi: "चमकीली हरी फिल्टर मशीन और कुर्सियां",
      landmark_ta: "பச்சை நிற வடிகட்டி இயந்திரம் மற்றும் இருக்கைகள்"
    },
    {
      id: "LIFT_A_F0",
      floor: 0,
      name: "Elevator Block A",
      name_hi: "लिफ्ट ब्लॉक ए (भू-तल)",
      name_ta: "லிஃப்ட் பிளாக் ஏ (தரை தளம்)",
      type: "lift",
      status: "OPERATIONAL",
      accessible: true
    },
    {
      id: "LIFT_B_F0",
      floor: 0,
      name: "Elevator Block B",
      name_hi: "लिफ्ट ब्लॉक बी (भू-तल)",
      name_ta: "லிஃப்ட் பிளாக் பி (தரை தளம்)",
      type: "lift",
      status: "OPERATIONAL",
      accessible: true
    },
    {
      id: "RAMP_F0_F1_START",
      floor: 0,
      name: "Accessible Ramp to Floor 1",
      name_hi: "प्रथम तल के लिए सुगम्य रैंप",
      name_ta: "முதல் தளத்திற்கான சாய்வுப் பாதை (Ramp)",
      type: "ramp",
      status: "OPERATIONAL",
      accessible: true
    },
    {
      id: "STAIRS_A_F0",
      floor: 0,
      name: "Staircase Block A",
      name_hi: "सीढ़ियां ब्लॉक ए (भू-तल)",
      name_ta: "படிக்கட்டு பிளாக் ஏ (தரை தளம்)",
      type: "stairs",
      status: "OPERATIONAL",
      accessible: false
    },

    // --- Floor 1 (First Floor) ---
    {
      id: "RAMP_F0_F1_END",
      floor: 1,
      name: "Floor 1 Ramp Landing",
      name_hi: "प्रथम तल रैंप लैंडिंग",
      name_ta: "முதல் தளம் சாய்வுப் பாதை வருகை",
      type: "ramp",
      status: "OPERATIONAL",
      accessible: true
    },
    {
      id: "LIFT_A_F1",
      floor: 1,
      name: "Elevator Block A - Floor 1",
      name_hi: "लिफ्ट ब्लॉक ए - प्रथम तल",
      name_ta: "லிஃப்ட் பிளாக் ஏ - முதல் தளம்",
      type: "lift",
      status: "OPERATIONAL",
      accessible: true
    },
    {
      id: "LIFT_B_F1",
      floor: 1,
      name: "Elevator Block B - Floor 1",
      name_hi: "लिफ्ट ब्लॉक बी - प्रथम तल",
      name_ta: "லிஃப்ட் பிளாக் பி - முதல் தளம்",
      type: "lift",
      status: "OPERATIONAL",
      accessible: true
    },
    {
      id: "STAIRS_A_F1",
      floor: 1,
      name: "Staircase Block A - Floor 1",
      name_hi: "सीढ़ियां ब्लॉक ए - प्रथम तल",
      name_ta: "படிக்கட்டு பிளாக் ஏ - முதல் தளம்",
      type: "stairs",
      status: "OPERATIONAL",
      accessible: false
    },
    {
      id: "ORTHO_WAITING_F1",
      floor: 1,
      name: "Orthopedics & Surgery Waiting Lounge",
      name_hi: "हड्डी रोग एवं सर्जरी प्रतीक्षा कक्ष",
      name_ta: "எலும்பியல் & அறுவை சிகிச்சை காத்திருப்பு பகுதி",
      type: "waiting_area",
      landmark: "Blue Seating Area with Token Display Screen",
      landmark_hi: "टोकन स्क्रीन के सामने नीली कुर्सियां",
      landmark_ta: "டோக்கன் திரை கொண்ட நீல நிற இருக்கைகள்"
    },
    {
      id: "OPD_104",
      floor: 1,
      name: "Room 104 - Orthopedics (Dr. Verma)",
      name_hi: "कमरा 104 - हड्डी रोग (डॉ. वर्मा)",
      name_ta: "அறை 104 - எலும்பியல் (டாக்டர் வர்மா)",
      type: "doctor_room",
      department: "Orthopedics",
      doctorName: "Dr. A. K. Verma",
      landmark: "Left corridor past the Drinking Water Booth",
      landmark_hi: "पानी की मशीन पार करके बाएं गलियारे में",
      landmark_ta: "குடிநீர் மையத்தை கடந்து இடதுபுற நடைபாதை"
    },
    {
      id: "OPD_105",
      floor: 1,
      name: "Room 105 - Orthopedics (Dr. Priya)",
      name_hi: "कमरा 105 - हड्डी रोग (डॉ. प्रिया)",
      name_ta: "அறை 105 - எலும்பியல் (டாக்டர் பிரியா)",
      type: "doctor_room",
      department: "Orthopedics",
      doctorName: "Dr. Priya Sundaram",
      landmark: "Directly opposite Room 104",
      landmark_hi: "कमरा 104 के ठीक सामने",
      landmark_ta: "அறை 104-க்கு நேர் எதிரே"
    },
    {
      id: "LAB_F1",
      floor: 1,
      name: "Clinical Pathology & Blood Sample Collection",
      name_hi: "रक्त एवं जांच संग्रह केंद्र (Pathology Lab)",
      name_ta: "இரத்த பரிசோதனை ஆய்வகம் (Blood Lab)",
      type: "lab",
      landmark: "End of North Corridor with glass partition",
      landmark_hi: "उत्तरी गलियारे के अंत में कांच का केबिन",
      landmark_ta: "வடக்கு நடைபாதையின் இறுதியில் உள்ள கண்ணாடி அறை"
    },
    {
      id: "RAMP_F1_F2_START",
      floor: 1,
      name: "Accessible Ramp to Floor 2",
      name_hi: "द्वितीय तल के लिए सुगम्य रैंप",
      name_ta: "இரண்டாம் தளத்திற்கான சாய்வுப் பாதை (Ramp)",
      type: "ramp",
      status: "OPERATIONAL",
      accessible: true
    },

    // --- Floor 2 (Second Floor) ---
    {
      id: "RAMP_F1_F2_END",
      floor: 2,
      name: "Floor 2 Ramp Landing",
      name_hi: "द्वितीय तल रैंप लैंडिंग",
      name_ta: "இரண்டாம் தளம் சாய்வுப் பாதை வருகை",
      type: "ramp",
      status: "OPERATIONAL",
      accessible: true
    },
    {
      id: "LIFT_A_F2",
      floor: 2,
      name: "Elevator Block A - Floor 2",
      name_hi: "लिफ्ट ब्लॉक ए - द्वितीय तल",
      name_ta: "லிஃப்ட் பிளாக் ஏ - இரண்டாம் தளம்",
      type: "lift",
      status: "OPERATIONAL",
      accessible: true
    },
    {
      id: "LIFT_B_F2",
      floor: 2,
      name: "Elevator Block B - Floor 2",
      name_hi: "लिफ्ट ब्लॉक बी - द्वितीय तल",
      name_ta: "லிஃப்ட் பிளாக் பி - இரண்டாம் தளம்",
      type: "lift",
      status: "OPERATIONAL",
      accessible: true
    },
    {
      id: "STAIRS_A_F2",
      floor: 2,
      name: "Staircase Block A - Floor 2",
      name_hi: "सीढ़ियां ब्लॉक ए - द्वितीय तल",
      name_ta: "படிக்கட்டு பிளாக் ஏ - இரண்டாம் தளம்",
      type: "stairs",
      status: "OPERATIONAL",
      accessible: false
    },
    {
      id: "OPD_208",
      floor: 2,
      name: "Room 208 - General Medicine / Special Clinic",
      name_hi: "कमरा 208 - सामान्य चिकित्सा / विशेष क्लिनिक",
      name_ta: "அறை 208 - பொது மருத்துவம் / சிறப்பு சிகிச்சை",
      type: "doctor_room",
      department: "General Medicine",
      doctorName: "Dr. A. K. Verma (Reassigned)",
      landmark: "Opposite Child Immunization Wing, near Lift A",
      landmark_hi: "बाल टीकाकरण विंग के सामने, लिफ्ट ए के पास",
      landmark_ta: "குழந்தைகள் தடுப்பூசி பிரிவுக்கு எதிரே, லிஃப்ட் ஏ அருகில்"
    },
    {
      id: "XRAY_F2",
      floor: 2,
      name: "Radiology & Digital X-Ray Wing",
      name_hi: "डिजिटल एक्स-रे एवं रेडियोलॉजी विभाग",
      name_ta: "டிஜிட்டல் எக்ஸ்-ரே பிரிவு (Radiology)",
      type: "lab",
      landmark: "Follow Yellow Caution Sign near Lift B",
      landmark_hi: "लिफ्ट बी के पास पीला चेतावनी बोर्ड",
      landmark_ta: "லிஃப்ட் பி அருகில் உள்ள மஞ்சள் எச்சரிக்கை பலகை"
    }
  ],
  edges: [
    // Floor 0 internal connections
    { from: "ENTRANCE_G", to: "HELP_DESK_G", distance: 10, type: "corridor", accessible: true },
    { from: "HELP_DESK_G", to: "REG_COUNTER", distance: 15, type: "corridor", accessible: true },
    { from: "ENTRANCE_G", to: "EMERGENCY_G", distance: 20, type: "corridor", accessible: true },
    { from: "REG_COUNTER", to: "WATER_BOOTH_G", distance: 15, type: "corridor", accessible: true },
    { from: "WATER_BOOTH_G", to: "PHARMACY_G", distance: 20, type: "corridor", accessible: true },
    { from: "REG_COUNTER", to: "LIFT_A_F0", distance: 25, type: "corridor", accessible: true },
    { from: "REG_COUNTER", to: "LIFT_B_F0", distance: 40, type: "corridor", accessible: true },
    { from: "REG_COUNTER", to: "RAMP_F0_F1_START", distance: 30, type: "corridor", accessible: true },
    { from: "REG_COUNTER", to: "STAIRS_A_F0", distance: 12, type: "corridor", accessible: true },

    // Vertical transit: Floor 0 to Floor 1
    { from: "LIFT_A_F0", to: "LIFT_A_F1", distance: 5, type: "lift", accessible: true },
    { from: "LIFT_A_F1", to: "LIFT_A_F0", distance: 5, type: "lift", accessible: true },
    { from: "LIFT_B_F0", to: "LIFT_B_F1", distance: 5, type: "lift", accessible: true },
    { from: "LIFT_B_F1", to: "LIFT_B_F0", distance: 5, type: "lift", accessible: true },
    { from: "RAMP_F0_F1_START", to: "RAMP_F0_F1_END", distance: 35, type: "ramp", accessible: true },
    { from: "RAMP_F0_F1_END", to: "RAMP_F0_F1_START", distance: 35, type: "ramp", accessible: true },
    { from: "STAIRS_A_F0", to: "STAIRS_A_F1", distance: 15, type: "stairs", accessible: false },
    { from: "STAIRS_A_F1", to: "STAIRS_A_F0", distance: 15, type: "stairs", accessible: false },

    // Floor 1 internal connections
    { from: "LIFT_A_F1", to: "ORTHO_WAITING_F1", distance: 15, type: "corridor", accessible: true },
    { from: "RAMP_F0_F1_END", to: "ORTHO_WAITING_F1", distance: 12, type: "corridor", accessible: true },
    { from: "STAIRS_A_F1", to: "ORTHO_WAITING_F1", distance: 10, type: "corridor", accessible: true },
    { from: "ORTHO_WAITING_F1", to: "OPD_104", distance: 12, type: "corridor", accessible: true },
    { from: "ORTHO_WAITING_F1", to: "OPD_105", distance: 14, type: "corridor", accessible: true },
    { from: "ORTHO_WAITING_F1", to: "LAB_F1", distance: 30, type: "corridor", accessible: true },
    { from: "ORTHO_WAITING_F1", to: "RAMP_F1_F2_START", distance: 20, type: "corridor", accessible: true },
    { from: "ORTHO_WAITING_F1", to: "LIFT_B_F1", distance: 35, type: "corridor", accessible: true },

    // Vertical transit: Floor 1 to Floor 2
    { from: "LIFT_A_F1", to: "LIFT_A_F2", distance: 5, type: "lift", accessible: true },
    { from: "LIFT_A_F2", to: "LIFT_A_F1", distance: 5, type: "lift", accessible: true },
    { from: "LIFT_B_F1", to: "LIFT_B_F2", distance: 5, type: "lift", accessible: true },
    { from: "LIFT_B_F2", to: "LIFT_B_F1", distance: 5, type: "lift", accessible: true },
    { from: "RAMP_F1_F2_START", to: "RAMP_F1_F2_END", distance: 35, type: "ramp", accessible: true },
    { from: "RAMP_F1_F2_END", to: "RAMP_F1_F2_START", distance: 35, type: "ramp", accessible: true },
    { from: "STAIRS_A_F1", to: "STAIRS_A_F2", distance: 15, type: "stairs", accessible: false },
    { from: "STAIRS_A_F2", to: "STAIRS_A_F1", distance: 15, type: "stairs", accessible: false },

    // Floor 2 internal connections
    { from: "LIFT_A_F2", to: "OPD_208", distance: 18, type: "corridor", accessible: true },
    { from: "RAMP_F1_F2_END", to: "OPD_208", distance: 22, type: "corridor", accessible: true },
    { from: "STAIRS_A_F2", to: "OPD_208", distance: 15, type: "corridor", accessible: true },
    { from: "OPD_208", to: "XRAY_F2", distance: 25, type: "corridor", accessible: true },
    { from: "LIFT_B_F2", to: "XRAY_F2", distance: 15, type: "corridor", accessible: true }
  ]
};
