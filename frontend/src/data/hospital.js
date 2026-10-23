/**
 * City District Hospital - 3-Floor Topology & Navigation Graph
 * 
 * Floors:
 * - Ground (0): Main entrance, Registration counters, Help desk, Emergency (Casualty),
 *               Pharmacy, Laboratory, Drinking water, Toilets, Wheelchair point, Lift, Stairs, Ramp.
 * - First (1): OPD Rooms 1 to 8:
 *              Rooms 1 & 2: General Medicine
 *              Room 3: Children (Pediatrics)
 *              Room 4: Women & Pregnancy (Gynecology/Obstetrics)
 *              Room 5: Bones & Joints (Orthopedics)
 *              Room 6: Ear, Nose & Throat (ENT)
 *              Room 7: Eyes (Ophthalmology)
 *              Room 8: Skin (Dermatology)
 *              Waiting Hall A, Lift, Stairs, Toilets.
 * - Second (2): Ward 4 (Medicine), Ward 5 (Surgery), Ward 6 (Children),
 *               Nurses' Station, Lift, Stairs, Digital X-Ray Wing.
 */

export const hospitalData = {
  name: "City District Hospital",
  name_hi: "सिटी जिला अस्पताल",
  name_ta: "நகர மாவட்ட தலைமை மருத்துவமனை",
  floors: [
    { level: 0, name: "Ground Floor", name_hi: "भू-तल (Ground Floor)", name_ta: "தரை தளம் (Ground Floor)" },
    { level: 1, name: "First Floor", name_hi: "प्रथम तल (First Floor)", name_ta: "முதல் தளம் (1st Floor)" },
    { level: 2, name: "Second Floor", name_hi: "द्वितीय तल (Second Floor)", name_ta: "இரண்டாம் தளம் (2nd Floor)" }
  ],
  nodes: [
    // ==========================================
    // FLOOR 0: GROUND FLOOR
    // Coordinates x, y are mapped to 0..800, 0..500
    // ==========================================
    {
      id: "ENTRANCE_G",
      floor: 0,
      x: 100,
      y: 450,
      name: "Main Entrance",
      name_hi: "मुख्य प्रवेश द्वार",
      name_ta: "முதன்மை நுழைவாயில்",
      type: "entrance",
      category: "essential",
      landmark: "Main Security Gate and Wheelchair point",
      landmark_hi: "मुख्य सुरक्षा गेट और व्हीलचेयर स्टैंड के पास",
      landmark_ta: "முதன்மை பாதுகாப்பு வாயில் மற்றும் சக்கர நாற்காலி மையம் அருகில்"
    },
    {
      id: "WHEELCHAIR_G",
      floor: 0,
      x: 150,
      y: 420,
      name: "Wheelchair Point",
      name_hi: "व्हीलचेयर पॉइंट",
      name_ta: "சக்கர நாற்காலி மையம்",
      type: "wheelchair",
      category: "essential",
      landmark: "Right inside the entrance gate, staffed by attendant",
      landmark_hi: "प्रवेश द्वार के ठीक अंदर, सहायक कर्मचारी के साथ",
      landmark_ta: "நுழைவாயிலின் வலதுபுறம், உதவியாளர் இருக்கும் இடம்"
    },
    {
      id: "HELP_DESK_G",
      floor: 0,
      x: 250,
      y: 360,
      name: "May I Help You Desk",
      name_hi: "सहायता केंद्र (May I Help You Desk)",
      name_ta: "உதவி மையம் (Help Desk)",
      type: "helpdesk",
      category: "essential",
      landmark: "Opposite the blue chairs, large yellow counter",
      landmark_hi: "नीली कुर्सियों के सामने, बड़ा पीला काउंटर",
      landmark_ta: "நீல நிற நாற்காலிகளுக்கு எதிரே உள்ள மஞ்சள் கவுண்டர்"
    },
    {
      id: "REG_COUNTER",
      floor: 0,
      x: 400,
      y: 360,
      name: "Registration Counters (1-4)",
      name_hi: "पंजीकरण काउंटर (1-4)",
      name_ta: "பதிவு கவுண்டர்கள் (1-4)",
      type: "counter",
      category: "essential",
      landmark: "Opposite May I Help You desk, under Token Display 1",
      landmark_hi: "सहायता केंद्र के सामने, टोकन डिस्प्ले बोर्ड के नीचे",
      landmark_ta: "உதவி மையத்திற்கு எதிரே, டோக்கன் திரை பலகையின் கீழ்"
    },
    {
      id: "EMERGENCY_G",
      floor: 0,
      x: 120,
      y: 180,
      name: "Emergency (Casualty)",
      name_hi: "आपातकालीन (कैजुअल्टी / Casualty)",
      name_ta: "அவசர சிகிச்சை பிரிவு (Casualty)",
      type: "emergency",
      category: "emergency",
      landmark: "Follow the bold RED floor stripe directly from entrance",
      landmark_hi: "प्रवेश द्वार से फर्श पर बनी लाल पट्टी के सीधे रास्ते पर",
      landmark_ta: "நுழைவாயிலில் இருந்து தரையில் உள்ள தடித்த சிவப்பு கோட்டைப் பின்தொடரவும்"
    },
    {
      id: "PHARMACY_G",
      floor: 0,
      x: 620,
      y: 360,
      name: "Pharmacy (Free Medicine)",
      name_hi: "दवा वितरण केंद्र (Pharmacy)",
      name_ta: "இலவச மருந்தகம் (Pharmacy)",
      type: "pharmacy",
      category: "services",
      landmark: "Next to the drinking water, counters 1 to 3",
      landmark_hi: "पीने के पानी के पास, काउंटर 1 से 3",
      landmark_ta: "குடிநீர் மையத்திற்கு அருகில், கவுண்டர்கள் 1 முதல் 3"
    },
    {
      id: "LAB_G",
      floor: 0,
      x: 620,
      y: 180,
      name: "Laboratory (Blood & Urine Tests)",
      name_hi: "जांच प्रयोगशाला (रक्त एवं पेशाब जांच)",
      name_ta: "பரிசோதனை ஆய்வகம் (இரத்த & சிறுநீர் பரிசோதனை)",
      type: "lab",
      category: "services",
      landmark: "Opposite X-ray wing, behind glass door",
      landmark_hi: "एक्स-रे विंग के सामने, शीशे के दरवाजे के पीछे",
      landmark_ta: "எக்ஸ்-ரே பிரிவுக்கு எதிரே, கண்ணாடி கதவுக்குப் பின்னால்"
    },
    {
      id: "XRAY_G",
      floor: 0,
      x: 480,
      y: 180,
      name: "X-Ray Department",
      name_hi: "एक्स-रे विभाग",
      name_ta: "எக்ஸ்-ரே பிரிவு (X-Ray)",
      type: "services",
      category: "services",
      landmark: "Beside ground floor toilets, yellow warning sign",
      landmark_hi: "शौचालय के बगल में, पीला चेतावनी संकेत",
      landmark_ta: "கழிப்பறை அருகில், மஞ்சள் எச்சரிக்கை பலகை"
    },
    {
      id: "WATER_G",
      floor: 0,
      x: 550,
      y: 420,
      name: "Drinking Water (Ground)",
      name_hi: "पीने का पानी (भू-तल)",
      name_ta: "குடிநீர் வசதி (தரை தளம்)",
      type: "amenity",
      category: "amenity",
      landmark: "Next to Central Pharmacy, stainless steel RO dispenser",
      landmark_hi: "दवा केंद्र के बगल में, स्टेनलेस स्टील वाटर कूलर",
      landmark_ta: "மருந்தகத்தின் அருகில், எஃகு குடிநீர் வழங்கி"
    },
    {
      id: "TOILETS_G",
      floor: 0,
      x: 720,
      y: 420,
      name: "Toilets (Ground Floor)",
      name_hi: "शौचालय (भू-तल)",
      name_ta: "கழிப்பறை (தரை தளம்)",
      type: "amenity",
      category: "amenity",
      landmark: "Near Pharmacy exit, accessible wheelchair stall included",
      landmark_hi: "दवा केंद्र निकास के पास, व्हीलचेयर सुलभ शौचालय",
      landmark_ta: "மருந்தக வெளியேறும் வழி அருகில், சக்கர நாற்காலி அணுகக்கூடியது"
    },
    {
      id: "LIFT_A_F0",
      floor: 0,
      x: 350,
      y: 220,
      name: "Lift Block A (Ground Floor)",
      name_hi: "लिफ्ट ब्लॉक ए (भू-तल)",
      name_ta: "லிஃப்ட் பிளாக் ஏ (தரை தளம்)",
      type: "lift",
      category: "transit",
      accessible: true,
      landmark: "Next to Registration, with voice announcements and Braille buttons",
      landmark_hi: "पंजीकरण के पास, वॉयस घोषणा और ब्रेल बटन वाली लिफ्ट",
      landmark_ta: "பதிவு கவுண்டர் அருகில், குரல் அறிவிப்பு வசதியுடன்"
    },
    {
      id: "LIFT_B_F0",
      floor: 0,
      x: 650,
      y: 220,
      name: "Lift Block B (Ground Floor)",
      name_hi: "लिफ्ट ब्लॉक बी (भू-तल)",
      name_ta: "லிஃப்ட் பிளாக் பி (தரை தளம்)",
      type: "lift",
      category: "transit",
      accessible: true,
      landmark: "Between Pharmacy and Lab",
      landmark_hi: "दवा केंद्र और लैब के बीच में",
      landmark_ta: "மருந்தகம் மற்றும் ஆய்வகத்திற்கு நடுவில்"
    },
    {
      id: "RAMP_F0_F1_START",
      floor: 0,
      x: 230,
      y: 220,
      name: "Accessible Ramp to First Floor",
      name_hi: "प्रथम तल के लिए सुगम्य रैंप",
      name_ta: "முதல் தளத்திற்கான சாய்வுப் பாதை (Ramp)",
      type: "ramp",
      category: "transit",
      accessible: true,
      landmark: "Gentle slope with stainless steel double handrails",
      landmark_hi: "दोनों तरफ स्टील रेलिंग वाला आसान ढलान",
      landmark_ta: "இருபுறமும் கைப்பிடிகள் கொண்ட எளிய சாய்வுப் பாதை"
    },
    {
      id: "STAIRS_A_F0",
      floor: 0,
      x: 300,
      y: 220,
      name: "Staircase A (Ground Floor)",
      name_hi: "सीढ़ियां ब्लॉक ए (भू-तल)",
      name_ta: "படிக்கட்டு பிளாக் ஏ (தரை தளம்)",
      type: "stairs",
      category: "transit",
      accessible: false,
      landmark: "Beside Lift Block A (avoid if walking is difficult)",
      landmark_hi: "लिफ्ट ब्लॉक ए के बगल में (पैदल चलने में कठिनाई हो तो बचें)",
      landmark_ta: "லிஃப்ட் ஏ அருகில் (நடக்க கடினமாக இருந்தால் தவிர்க்கவும்)"
    },

    // ==========================================
    // FLOOR 1: OPD ROOMS 1 TO 8 & WAITING HALL A
    // ==========================================
    {
      id: "WAITING_HALL_A",
      floor: 1,
      x: 400,
      y: 280,
      name: "Waiting Hall A",
      name_hi: "प्रतीक्षा कक्ष ए (Waiting Hall A)",
      name_ta: "காத்திருப்பு கூடம் ஏ (Waiting Hall A)",
      type: "waiting_area",
      category: "essential",
      landmark: "Large central hall with 60 blue chairs and big TV token board",
      landmark_hi: "60 नीली कुर्सियों और बड़े टीवी टोकन बोर्ड वाला हॉल",
      landmark_ta: "60 நீல நிற இருக்கைகள் மற்றும் பெரிய டிவி பலகை கொண்ட கூடம்"
    },
    {
      id: "OPD_ROOM_1",
      floor: 1,
      x: 150,
      y: 120,
      name: "Room 1 - General Medicine",
      name_hi: "कमरा 1 - सामान्य चिकित्सा (General Medicine)",
      name_ta: "அறை 1 - பொது மருத்துவம் (General Medicine)",
      type: "doctor_room",
      departmentId: "gen_med",
      roomNumber: 1,
      landmark: "First door on left, opposite the blue chairs",
      landmark_hi: "बाईं ओर पहला दरवाजा, नीली कुर्सियों के सामने",
      landmark_ta: "இடதுபுற முதல் கதவு, நீல நாற்காலிகளுகு எதிரே"
    },
    {
      id: "OPD_ROOM_2",
      floor: 1,
      x: 230,
      y: 120,
      name: "Room 2 - General Medicine",
      name_hi: "कमरा 2 - सामान्य चिकित्सा (General Medicine)",
      name_ta: "அறை 2 - பொது மருத்துவம் (General Medicine)",
      type: "doctor_room",
      departmentId: "gen_med_2",
      roomNumber: 2,
      landmark: "Second door on left, beside Room 1",
      landmark_hi: "बाईं ओर दूसरा दरवाजा, कमरा 1 के बगल में",
      landmark_ta: "இடதுபுற இரண்டாவது கதவு, அறை 1-ன் அருகில்"
    },
    {
      id: "OPD_ROOM_3",
      floor: 1,
      x: 320,
      y: 120,
      name: "Room 3 - Children (Pediatrics)",
      name_hi: "कमरा 3 - बाल रोग (Children / Pediatrics)",
      name_ta: "அறை 3 - குழந்தை மருத்துவம் (Pediatrics)",
      type: "doctor_room",
      departmentId: "pediatrics",
      roomNumber: 3,
      landmark: "Third door on left, painted with cartoon animals",
      landmark_hi: "बाईं ओर तीसरा दरवाजा, कार्टून चित्रों वाला",
      landmark_ta: "இடதுபுற மூன்றாவது கதவு, கார்ட்டூன் படங்கள் வரையப்பட்டது"
    },
    {
      id: "OPD_ROOM_4",
      floor: 1,
      x: 410,
      y: 120,
      name: "Room 4 - Women & Pregnancy",
      name_hi: "कमरा 4 - महिला एवं प्रसूति रोग (Gynecology)",
      name_ta: "அறை 4 - பெண்கள் & மகப்பேறு (Gynecology)",
      type: "doctor_room",
      departmentId: "women",
      roomNumber: 4,
      landmark: "Next to pediatric clinic, purple door signage",
      landmark_hi: "बच्चों के कमरे के बगल में, बैंगनी बोर्ड",
      landmark_ta: "குழந்தைகள் அறை அருகில், ஊதா நிற பலகை"
    },
    {
      id: "OPD_ROOM_5",
      floor: 1,
      x: 500,
      y: 120,
      name: "Room 5 - Bones & Joints (Orthopedics)",
      name_hi: "कमरा 5 - हड्डी और जोड़ (Orthopedics)",
      name_ta: "அறை 5 - எலும்பு மற்றும் மூட்டுகள் (Orthopedics)",
      type: "doctor_room",
      departmentId: "ortho",
      roomNumber: 5,
      landmark: "Fifth door, right opposite the drinking water cooler",
      landmark_hi: "पांचवां दरवाजा, पानी के कूलर के ठीक सामने",
      landmark_ta: "ஐந்தாவது கதவு, குடிநீர் குளிர்விப்பானுக்கு நேர் எதிரே"
    },
    {
      id: "OPD_ROOM_6",
      floor: 1,
      x: 590,
      y: 120,
      name: "Room 6 - Ear, Nose & Throat (ENT)",
      name_hi: "कमरा 6 - कान, नाक और गला (ENT)",
      name_ta: "அறை 6 - காது, மூக்கு, தொண்டை (ENT)",
      type: "doctor_room",
      departmentId: "ent",
      roomNumber: 6,
      landmark: "Sixth door, next to Orthopedics",
      landmark_hi: "छठा दरवाजा, हड्डी रोग कमरे के बगल में",
      landmark_ta: "ஆறாவது கதவு, எலும்பியல் அறைக்கு அருகில்"
    },
    {
      id: "OPD_ROOM_7",
      floor: 1,
      x: 680,
      y: 120,
      name: "Room 7 - Eyes (Ophthalmology)",
      name_hi: "कमरा 7 - नेत्र रोग (Eyes / Ophthalmology)",
      name_ta: "அறை 7 - கண் மருத்துவம் (Ophthalmology)",
      type: "doctor_room",
      departmentId: "eyes",
      roomNumber: 7,
      landmark: "Seventh door, eye testing chart visible near entrance",
      landmark_hi: "सातवां दरवाजा, बाहर लगा दृष्टि परीक्षण चार्ट",
      landmark_ta: "ஏழாவது கதவு, கண் பார்வை சோதனை விளக்கப்படம் அருகில்"
    },
    {
      id: "OPD_ROOM_8",
      floor: 1,
      x: 750,
      y: 120,
      name: "Room 8 - Skin (Dermatology)",
      name_hi: "कमरा 8 - त्वचा रोग (Skin / Dermatology)",
      name_ta: "அறை 8 - தோல் மருத்துவம் (Dermatology)",
      type: "doctor_room",
      departmentId: "skin",
      roomNumber: 8,
      landmark: "Last door on right corridor, near the balcony",
      landmark_hi: "दाहिने गलियारे का अंतिम दरवाजा, बालकनी के पास",
      landmark_ta: "வலது நடைபாதையின் கடைசி கதவு, பால்கனி அருகில்"
    },
    {
      id: "WATER_F1",
      floor: 1,
      x: 500,
      y: 220,
      name: "Drinking Water (Floor 1)",
      name_hi: "पीने का पानी (प्रथम तल)",
      name_ta: "குடிநீர் வசதி (முதல் தளம்)",
      type: "amenity",
      category: "amenity",
      landmark: "In Waiting Hall A, opposite Room 5",
      landmark_hi: "प्रतीक्षा कक्ष ए में, कमरा 5 के सामने",
      landmark_ta: "காத்திருப்பு கூடம் ஏ-வில், அறை 5-க்கு எதிரே"
    },
    {
      id: "TOILETS_F1",
      floor: 1,
      x: 720,
      y: 280,
      name: "Toilets (Floor 1)",
      name_hi: "शौचालय (प्रथम तल)",
      name_ta: "கழிப்பறை (முதல் தளம்)",
      type: "amenity",
      category: "amenity",
      landmark: "End of East corridor, past Room 8",
      landmark_hi: "पूर्वी गलियारे के अंत में, कमरा 8 के आगे",
      landmark_ta: "கிழக்கு நடைபாதையின் இறுதியில், அறை 8-ஐ தாண்டி"
    },
    {
      id: "LIFT_A_F1",
      floor: 1,
      x: 350,
      y: 280,
      name: "Lift Block A (Floor 1)",
      name_hi: "लिफ्ट ब्लॉक ए (प्रथम तल)",
      name_ta: "லிஃப்ட் பிளாக் ஏ (முதல் தளம்)",
      type: "lift",
      category: "transit",
      accessible: true,
      landmark: "Opens directly into Waiting Hall A",
      landmark_hi: "सीधे प्रतीक्षा कक्ष ए में खुलती है",
      landmark_ta: "நேரடியாக காத்திருப்பு கூடம் ஏ-வில் திறக்கிறது"
    },
    {
      id: "LIFT_B_F1",
      floor: 1,
      x: 650,
      y: 280,
      name: "Lift Block B (Floor 1)",
      name_hi: "लिफ्ट ब्लॉक बी (प्रथम तल)",
      name_ta: "லிஃப்ட் பிளாக் பி (முதல் தளம்)",
      type: "lift",
      category: "transit",
      accessible: true,
      landmark: "Near Room 7 & Toilets",
      landmark_hi: "कमरा 7 और शौचालय के पास",
      landmark_ta: "அறை 7 மற்றும் கழிப்பறை அருகில்"
    },
    {
      id: "RAMP_F0_F1_END",
      floor: 1,
      x: 230,
      y: 280,
      name: "Accessible Ramp Landing (Floor 1)",
      name_hi: "रैंप लैंडिंग (प्रथम तल)",
      name_ta: "சாய்வுப் பாதை வருகை (முதல் தளம்)",
      type: "ramp",
      category: "transit",
      accessible: true,
      landmark: "Arrives into Waiting Hall A near Room 2",
      landmark_hi: "कमरा 2 के पास प्रतीक्षा कक्ष में प्रवेश",
      landmark_ta: "அறை 2 அருகில் காத்திருப்பு கூடத்தில் இணைகிறது"
    },
    {
      id: "STAIRS_A_F1",
      floor: 1,
      x: 300,
      y: 280,
      name: "Staircase A (Floor 1)",
      name_hi: "सीढ़ियां ब्लॉक ए (प्रथम तल)",
      name_ta: "படிக்கட்டு பிளாக் ஏ (முதல் தளம்)",
      type: "stairs",
      category: "transit",
      accessible: false,
      landmark: "Next to Lift A (avoid if walking slowly)",
      landmark_hi: "लिफ्ट ए के पास (सीढ़ियों से बचें यदि दर्द हो)",
      landmark_ta: "லிஃப்ட் ஏ அருகில் (மெதுவாக நடப்பவர்கள் தவிர்க்கவும்)"
    },

    // ==========================================
    // FLOOR 2: INPATIENT WARDS & NURSES' STATION
    // ==========================================
    {
      id: "NURSES_STATION_F2",
      floor: 2,
      x: 400,
      y: 260,
      name: "Central Nurses' Station",
      name_hi: "नर्सिंग स्टेशन (द्वितीय तल)",
      name_ta: "மத்திய செவிலியர் மையம் (2-ம் தளம்)",
      type: "helpdesk",
      category: "essential",
      landmark: "Round counter with on-duty sister in white and blue",
      landmark_hi: "सफेद और नीली वर्दी में नर्सों वाला गोल काउंटर",
      landmark_ta: "வெள்ளை மற்றும் நீல சீருடையில் செவிலியர் உள்ள வட்ட கவுண்டர்"
    },
    {
      id: "WARD_4",
      floor: 2,
      x: 180,
      y: 140,
      name: "Ward 4 - Medicine Ward",
      name_hi: "वार्ड 4 - मेडिसिन वार्ड",
      name_ta: "வார்டு 4 - மருத்துவ உள்நோயாளி பிரிவு",
      type: "ward",
      category: "ward",
      landmark: "Left wing, beds 1 to 30",
      landmark_hi: "बायां विंग, बिस्तर संख्या 1 से 30",
      landmark_ta: "இடது பிரிவு, படுக்கை எண் 1 முதல் 30 வரை"
    },
    {
      id: "WARD_5",
      floor: 2,
      x: 400,
      y: 120,
      name: "Ward 5 - Surgery Ward",
      name_hi: "वार्ड 5 - सर्जरी वार्ड",
      name_ta: "வார்டு 5 - அறுவை சிகிச்சை பிரிவு",
      type: "ward",
      category: "ward",
      landmark: "Central wing, opposite nurses' desk",
      landmark_hi: "केंद्रीय विंग, नर्स डेस्क के ठीक सामने",
      landmark_ta: "மத்திய பிரிவு, செவிலியர் மேசைக்கு எதிரே"
    },
    {
      id: "WARD_6",
      floor: 2,
      x: 620,
      y: 140,
      name: "Ward 6 - Children's Ward",
      name_hi: "वार्ड 6 - शिशु एवं बाल रोग वार्ड",
      name_ta: "வார்டு 6 - குழந்தைகள் உள்நோயாளி பிரிவு",
      type: "ward",
      category: "ward",
      landmark: "Right wing with playroom at entrance",
      landmark_hi: "दाहिना विंग, प्रवेश पर खेल कक्ष के साथ",
      landmark_ta: "வலது பிரிவு, நுழைவில் விளையாட்டு அறையுடன்"
    },
    {
      id: "XRAY_WING_F2",
      floor: 2,
      x: 720,
      y: 260,
      name: "Digital X-Ray & Ultrasound Wing",
      name_hi: "डिजिटल एक्स-रे एवं अल्ट्रासाउंड",
      name_ta: "டிஜிட்டல் எக்ஸ்-ரே & அல்ட்ராசவுண்ட்",
      type: "services",
      category: "services",
      landmark: "End of corridor, near Lift B",
      landmark_hi: "गलियारे के अंत में, लिफ्ट बी के पास",
      landmark_ta: "நடைபாதையின் இறுதியில், லிஃப்ட் பி அருகில்"
    },
    {
      id: "LIFT_A_F2",
      floor: 2,
      x: 350,
      y: 260,
      name: "Lift Block A (Floor 2)",
      name_hi: "लिफ्ट ब्लॉक ए (द्वितीय तल)",
      name_ta: "லிஃப்ட் பிளாக் ஏ (இரண்டாம் தளம்)",
      type: "lift",
      category: "transit",
      accessible: true,
      landmark: "Directly opposite Nurses' Station",
      landmark_hi: "नर्सिंग स्टेशन के ठीक सामने",
      landmark_ta: "செவிலியர் மையத்திற்கு நேர் எதிரே"
    },
    {
      id: "LIFT_B_F2",
      floor: 2,
      x: 650,
      y: 260,
      name: "Lift Block B (Floor 2)",
      name_hi: "लिफ्ट ब्लॉक बी (द्वितीय तल)",
      name_ta: "லிஃப்ட் பிளாக் பி (இரண்டாம் தளம்)",
      type: "lift",
      category: "transit",
      accessible: true,
      landmark: "Near Ward 6 & X-ray",
      landmark_hi: "वार्ड 6 और एक्स-रे के पास",
      landmark_ta: "வார்டு 6 மற்றும் எக்ஸ்-ரே அருகில்"
    },
    {
      id: "RAMP_F1_F2_START",
      floor: 1,
      x: 230,
      y: 350,
      name: "Accessible Ramp to Floor 2",
      name_hi: "द्वितीय तल के लिए सुगम्य रैंप",
      name_ta: "இரண்டாம் தளத்திற்கான சாய்வுப் பாதை",
      type: "ramp",
      category: "transit",
      accessible: true,
      landmark: "Ramp continuation with wide turning space",
      landmark_hi: "चौड़े मोड़ के साथ आगे बढ़ता हुआ रैंप",
      landmark_ta: "அகன்ற திருப்பம் கொண்ட சாய்வுப் பாதை"
    },
    {
      id: "RAMP_F1_F2_END",
      floor: 2,
      x: 230,
      y: 260,
      name: "Accessible Ramp Landing (Floor 2)",
      name_hi: "रैंप लैंडिंग (द्वितीय तल)",
      name_ta: "சாய்வுப் பாதை வருகை (இரண்டாம் தளம்)",
      type: "ramp",
      category: "transit",
      accessible: true,
      landmark: "Opens near Ward 4 Medicine",
      landmark_hi: "वार्ड 4 मेडिसिन के पास खुलता है",
      landmark_ta: "வார்டு 4 மருத்துவ பிரிவு அருகில் இணைகிறது"
    },
    {
      id: "STAIRS_A_F2",
      floor: 2,
      x: 300,
      y: 260,
      name: "Staircase A (Floor 2)",
      name_hi: "सीढ़ियां ब्लॉक ए (द्वितीय तल)",
      name_ta: "படிக்கட்டு பிளாக் ஏ (இரண்டாம் தளம்)",
      type: "stairs",
      category: "transit",
      accessible: false,
      landmark: "Next to Lift A",
      landmark_hi: "लिफ्ट ए के पास",
      landmark_ta: "லிஃப்ட் ஏ அருகில்"
    }
  ],
  edges: [
    // ------------------------------------------
    // FLOOR 0 CONNECTIONS
    // ------------------------------------------
    { from: "ENTRANCE_G", to: "WHEELCHAIR_G", distance: 8, type: "corridor", accessible: true },
    { from: "WHEELCHAIR_G", to: "ENTRANCE_G", distance: 8, type: "corridor", accessible: true },

    { from: "ENTRANCE_G", to: "HELP_DESK_G", distance: 15, type: "corridor", accessible: true },
    { from: "HELP_DESK_G", to: "ENTRANCE_G", distance: 15, type: "corridor", accessible: true },

    { from: "HELP_DESK_G", to: "REG_COUNTER", distance: 12, type: "corridor", accessible: true },
    { from: "REG_COUNTER", to: "HELP_DESK_G", distance: 12, type: "corridor", accessible: true },

    { from: "ENTRANCE_G", to: "EMERGENCY_G", distance: 18, type: "corridor", accessible: true },
    { from: "EMERGENCY_G", to: "ENTRANCE_G", distance: 18, type: "corridor", accessible: true },

    { from: "REG_COUNTER", to: "WATER_G", distance: 15, type: "corridor", accessible: true },
    { from: "WATER_G", to: "REG_COUNTER", distance: 15, type: "corridor", accessible: true },

    { from: "WATER_G", to: "PHARMACY_G", distance: 8, type: "corridor", accessible: true },
    { from: "PHARMACY_G", to: "WATER_G", distance: 8, type: "corridor", accessible: true },

    { from: "PHARMACY_G", to: "TOILETS_G", distance: 12, type: "corridor", accessible: true },
    { from: "TOILETS_G", to: "PHARMACY_G", distance: 12, type: "corridor", accessible: true },

    { from: "REG_COUNTER", to: "XRAY_G", distance: 20, type: "corridor", accessible: true },
    { from: "XRAY_G", to: "REG_COUNTER", distance: 20, type: "corridor", accessible: true },

    { from: "XRAY_G", to: "LAB_G", distance: 14, type: "corridor", accessible: true },
    { from: "LAB_G", to: "XRAY_G", distance: 14, type: "corridor", accessible: true },

    { from: "REG_COUNTER", to: "LIFT_A_F0", distance: 12, type: "corridor", accessible: true },
    { from: "LIFT_A_F0", to: "REG_COUNTER", distance: 12, type: "corridor", accessible: true },

    { from: "REG_COUNTER", to: "STAIRS_A_F0", distance: 10, type: "corridor", accessible: true },
    { from: "STAIRS_A_F0", to: "REG_COUNTER", distance: 10, type: "corridor", accessible: true },

    { from: "HELP_DESK_G", to: "RAMP_F0_F1_START", distance: 14, type: "corridor", accessible: true },
    { from: "RAMP_F0_F1_START", to: "HELP_DESK_G", distance: 14, type: "corridor", accessible: true },

    { from: "PHARMACY_G", to: "LIFT_B_F0", distance: 16, type: "corridor", accessible: true },
    { from: "LIFT_B_F0", to: "PHARMACY_G", distance: 16, type: "corridor", accessible: true },

    { from: "LAB_G", to: "LIFT_B_F0", distance: 12, type: "corridor", accessible: true },
    { from: "LIFT_B_F0", to: "LAB_G", distance: 12, type: "corridor", accessible: true },

    // ------------------------------------------
    // VERTICAL TRANSIT: FLOOR 0 <-> FLOOR 1
    // ------------------------------------------
    { from: "LIFT_A_F0", to: "LIFT_A_F1", distance: 5, type: "lift", accessible: true },
    { from: "LIFT_A_F1", to: "LIFT_A_F0", distance: 5, type: "lift", accessible: true },

    { from: "LIFT_B_F0", to: "LIFT_B_F1", distance: 5, type: "lift", accessible: true },
    { from: "LIFT_B_F1", to: "LIFT_B_F0", distance: 5, type: "lift", accessible: true },

    { from: "RAMP_F0_F1_START", to: "RAMP_F0_F1_END", distance: 30, type: "ramp", accessible: true },
    { from: "RAMP_F0_F1_END", to: "RAMP_F0_F1_START", distance: 30, type: "ramp", accessible: true },

    { from: "STAIRS_A_F0", to: "STAIRS_A_F1", distance: 15, type: "stairs", accessible: false },
    { from: "STAIRS_A_F1", to: "STAIRS_A_F0", distance: 15, type: "stairs", accessible: false },

    // ------------------------------------------
    // FLOOR 1 CONNECTIONS
    // ------------------------------------------
    { from: "LIFT_A_F1", to: "WAITING_HALL_A", distance: 8, type: "corridor", accessible: true },
    { from: "WAITING_HALL_A", to: "LIFT_A_F1", distance: 8, type: "corridor", accessible: true },

    { from: "RAMP_F0_F1_END", to: "WAITING_HALL_A", distance: 10, type: "corridor", accessible: true },
    { from: "WAITING_HALL_A", to: "RAMP_F0_F1_END", distance: 10, type: "corridor", accessible: true },

    { from: "STAIRS_A_F1", to: "WAITING_HALL_A", distance: 8, type: "corridor", accessible: true },
    { from: "WAITING_HALL_A", to: "STAIRS_A_F1", distance: 8, type: "corridor", accessible: true },

    { from: "WAITING_HALL_A", to: "OPD_ROOM_1", distance: 15, type: "corridor", accessible: true },
    { from: "OPD_ROOM_1", to: "WAITING_HALL_A", distance: 15, type: "corridor", accessible: true },

    { from: "OPD_ROOM_1", to: "OPD_ROOM_2", distance: 8, type: "corridor", accessible: true },
    { from: "OPD_ROOM_2", to: "OPD_ROOM_1", distance: 8, type: "corridor", accessible: true },

    { from: "OPD_ROOM_2", to: "OPD_ROOM_3", distance: 8, type: "corridor", accessible: true },
    { from: "OPD_ROOM_3", to: "OPD_ROOM_2", distance: 8, type: "corridor", accessible: true },

    { from: "OPD_ROOM_3", to: "OPD_ROOM_4", distance: 8, type: "corridor", accessible: true },
    { from: "OPD_ROOM_4", to: "OPD_ROOM_3", distance: 8, type: "corridor", accessible: true },

    { from: "WAITING_HALL_A", to: "WATER_F1", distance: 8, type: "corridor", accessible: true },
    { from: "WATER_F1", to: "WAITING_HALL_A", distance: 8, type: "corridor", accessible: true },

    { from: "WATER_F1", to: "OPD_ROOM_5", distance: 10, type: "corridor", accessible: true },
    { from: "OPD_ROOM_5", to: "WATER_F1", distance: 10, type: "corridor", accessible: true },

    { from: "OPD_ROOM_5", to: "OPD_ROOM_6", distance: 8, type: "corridor", accessible: true },
    { from: "OPD_ROOM_6", to: "OPD_ROOM_5", distance: 8, type: "corridor", accessible: true },

    { from: "OPD_ROOM_6", to: "OPD_ROOM_7", distance: 8, type: "corridor", accessible: true },
    { from: "OPD_ROOM_7", to: "OPD_ROOM_6", distance: 8, type: "corridor", accessible: true },

    { from: "OPD_ROOM_7", to: "OPD_ROOM_8", distance: 8, type: "corridor", accessible: true },
    { from: "OPD_ROOM_8", to: "OPD_ROOM_7", distance: 8, type: "corridor", accessible: true },

    { from: "OPD_ROOM_8", to: "TOILETS_F1", distance: 10, type: "corridor", accessible: true },
    { from: "TOILETS_F1", to: "OPD_ROOM_8", distance: 10, type: "corridor", accessible: true },

    { from: "WAITING_HALL_A", to: "LIFT_B_F1", distance: 20, type: "corridor", accessible: true },
    { from: "LIFT_B_F1", to: "WAITING_HALL_A", distance: 20, type: "corridor", accessible: true },

    { from: "WAITING_HALL_A", to: "RAMP_F1_F2_START", distance: 12, type: "corridor", accessible: true },
    { from: "RAMP_F1_F2_START", to: "WAITING_HALL_A", distance: 12, type: "corridor", accessible: true },

    // ------------------------------------------
    // VERTICAL TRANSIT: FLOOR 1 <-> FLOOR 2
    // ------------------------------------------
    { from: "LIFT_A_F1", to: "LIFT_A_F2", distance: 5, type: "lift", accessible: true },
    { from: "LIFT_A_F2", to: "LIFT_A_F1", distance: 5, type: "lift", accessible: true },

    { from: "LIFT_B_F1", to: "LIFT_B_F2", distance: 5, type: "lift", accessible: true },
    { from: "LIFT_B_F2", to: "LIFT_B_F1", distance: 5, type: "lift", accessible: true },

    { from: "RAMP_F1_F2_START", to: "RAMP_F1_F2_END", distance: 30, type: "ramp", accessible: true },
    { from: "RAMP_F1_F2_END", to: "RAMP_F1_F2_START", distance: 30, type: "ramp", accessible: true },

    { from: "STAIRS_A_F1", to: "STAIRS_A_F2", distance: 15, type: "stairs", accessible: false },
    { from: "STAIRS_A_F2", to: "STAIRS_A_F1", distance: 15, type: "stairs", accessible: false },

    // ------------------------------------------
    // FLOOR 2 CONNECTIONS
    // ------------------------------------------
    { from: "LIFT_A_F2", to: "NURSES_STATION_F2", distance: 8, type: "corridor", accessible: true },
    { from: "NURSES_STATION_F2", to: "LIFT_A_F2", distance: 8, type: "corridor", accessible: true },

    { from: "RAMP_F1_F2_END", to: "NURSES_STATION_F2", distance: 12, type: "corridor", accessible: true },
    { from: "NURSES_STATION_F2", to: "RAMP_F1_F2_END", distance: 12, type: "corridor", accessible: true },

    { from: "STAIRS_A_F2", to: "NURSES_STATION_F2", distance: 8, type: "corridor", accessible: true },
    { from: "NURSES_STATION_F2", to: "STAIRS_A_F2", distance: 8, type: "corridor", accessible: true },

    { from: "NURSES_STATION_F2", to: "WARD_4", distance: 16, type: "corridor", accessible: true },
    { from: "WARD_4", to: "NURSES_STATION_F2", distance: 16, type: "corridor", accessible: true },

    { from: "NURSES_STATION_F2", to: "WARD_5", distance: 12, type: "corridor", accessible: true },
    { from: "WARD_5", to: "NURSES_STATION_F2", distance: 12, type: "corridor", accessible: true },

    { from: "NURSES_STATION_F2", to: "WARD_6", distance: 18, type: "corridor", accessible: true },
    { from: "WARD_6", to: "NURSES_STATION_F2", distance: 18, type: "corridor", accessible: true },

    { from: "NURSES_STATION_F2", to: "LIFT_B_F2", distance: 20, type: "corridor", accessible: true },
    { from: "LIFT_B_F2", to: "NURSES_STATION_F2", distance: 20, type: "corridor", accessible: true },

    { from: "LIFT_B_F2", to: "XRAY_WING_F2", distance: 10, type: "corridor", accessible: true },
    { from: "XRAY_WING_F2", to: "LIFT_B_F2", distance: 10, type: "corridor", accessible: true }
  ]
};
