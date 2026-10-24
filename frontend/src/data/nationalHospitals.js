/**
 * Pan-India National Public Hospital Registry
 * OPD Saathi is an open public hospital platform designed for all 28 Indian States & 8 Union Territories
 * Under the National Health Mission (NHM) and Ayushman Bharat Digital Mission (ABDM).
 */

export const nationalHospitals = [
  {
    id: "DIST_HOSP_COIMBATORE",
    name: "District Headquarters Hospital",
    name_hi: "जिला मुख्यालय अस्पताल",
    name_ta: "மாவட்ட தலைமை அரசு மருத்துவமனை",
    city: "Coimbatore",
    state: "Tamil Nadu",
    stateCode: "TN",
    type: "District Civil Hospital",
    badge: "NHM District Hospital",
    floors: 3,
    lat: 11.0018,
    lng: 76.9628,
    helpline: "0422-2300100",
    emergencyHelpline: "108",
    abhaEnabled: true,
    primaryLanguages: ["ta", "en", "hi"],
    gates: [
      { id: "ENTRANCE_G", name: "Gate 1 - Main OPD Entrance", zone: "OPD_REGISTRATION" },
      { id: "CASUALTY", name: "Gate 2 - Emergency / Trauma Casualty", zone: "CASUALTY" },
      { id: "RAMP_1", name: "Gate 3 - Barrier-Free Accessible Ramp", zone: "RAMP_1" }
    ]
  },
  {
    id: "AIIMS_NEW_DELHI",
    name: "AIIMS (All India Institute of Medical Sciences)",
    name_hi: "एम्स (अखिल भारतीय आयुर्विज्ञान संस्थान)",
    name_ta: "அகில இந்திய மருத்துவ அறிவியல் நிறுவனம் (AIIMS)",
    city: "New Delhi",
    state: "National Capital Territory (Delhi)",
    stateCode: "DL",
    type: "Apex National Referral Institute",
    badge: "Central Apex Center",
    floors: 3,
    lat: 28.5672,
    lng: 77.2100,
    helpline: "011-26588500",
    emergencyHelpline: "102",
    abhaEnabled: true,
    primaryLanguages: ["hi", "en"],
    gates: [
      { id: "ENTRANCE_G", name: "Gate 1 - Rajkumari Amrit Kaur OPD Block", zone: "OPD_REGISTRATION" },
      { id: "CASUALTY", name: "Gate 2 - Emergency & Trauma Center", zone: "CASUALTY" },
      { id: "RAMP_1", name: "Gate 3 - Metro Link Accessible Ramp", zone: "RAMP_1" }
    ]
  },
  {
    id: "RGGGH_CHENNAI",
    name: "Rajiv Gandhi Govt General Hospital (RGGGH)",
    name_hi: "राजीव गांधी शासकीय सामान्य अस्पताल",
    name_ta: "ராஜீவ் காந்தி அரசு பொது மருத்துவமனை (சென்னை)",
    city: "Chennai",
    state: "Tamil Nadu",
    stateCode: "TN",
    type: "Premier State Teaching Hospital",
    badge: "State Teaching Hospital",
    floors: 3,
    lat: 13.0805,
    lng: 80.2785,
    helpline: "044-25305000",
    emergencyHelpline: "108",
    abhaEnabled: true,
    primaryLanguages: ["ta", "en", "te"],
    gates: [
      { id: "ENTRANCE_G", name: "Tower Block 1 - Main OPD Registration", zone: "OPD_REGISTRATION" },
      { id: "CASUALTY", name: "Emergency Casualty Entrance (Station Side)", zone: "CASUALTY" },
      { id: "RAMP_1", name: "Accessible Lift & Ramp Concourse", zone: "RAMP_1" }
    ]
  },
  {
    id: "KEM_MUMBAI",
    name: "King Edward Memorial (KEM) Hospital",
    name_hi: "किंग एडवर्ड मेमोरियल (केईएम) अस्पताल",
    name_ta: "கிங் எட்வர்ட் மெமோரியல் மருத்துவமனை (மும்பை)",
    city: "Mumbai",
    state: "Maharashtra",
    stateCode: "MH",
    type: "Civic Medical College & Hospital",
    badge: "Municipal Teaching Hospital",
    floors: 3,
    lat: 19.0028,
    lng: 72.8427,
    helpline: "022-24107000",
    emergencyHelpline: "108",
    abhaEnabled: true,
    primaryLanguages: ["mr", "hi", "en"],
    gates: [
      { id: "ENTRANCE_G", name: "Gate 1 - Main OPD Desk", zone: "OPD_REGISTRATION" },
      { id: "CASUALTY", name: "Gate 2 - Casualty Emergency Unit", zone: "CASUALTY" },
      { id: "RAMP_1", name: "Gate 3 - Multi-Storey Accessible Ramp", zone: "RAMP_1" }
    ]
  },
  {
    id: "GANDHI_HYDERABAD",
    name: "Gandhi Hospital & Medical College",
    name_hi: "गांधी अस्पताल एवं मेडिकल कॉलेज",
    name_ta: "காந்தி மருத்துவமனை (ஹைதராபாத்)",
    city: "Hyderabad / Secunderabad",
    state: "Telangana",
    stateCode: "TG",
    type: "State Multi-Specialty Hospital",
    badge: "Telangana State Hospital",
    floors: 3,
    lat: 17.4244,
    lng: 78.5042,
    helpline: "040-27505566",
    emergencyHelpline: "108",
    abhaEnabled: true,
    primaryLanguages: ["te", "en", "hi"],
    gates: [
      { id: "ENTRANCE_G", name: "Main OPD Concourse Desk", zone: "OPD_REGISTRATION" },
      { id: "CASUALTY", name: "Emergency Trauma Center Gate", zone: "CASUALTY" },
      { id: "RAMP_1", name: "Accessible Patient Ramp 1", zone: "RAMP_1" }
    ]
  },
  {
    id: "MC_KOLKATA",
    name: "Medical College & Hospital Kolkata",
    name_hi: "मेडिकल कॉलेज एवं अस्पताल कोलकाता",
    name_ta: "கொல்கத்தா மருத்துவக் கல்லூரி மற்றும் மருத்துவமனை",
    city: "Kolkata",
    state: "West Bengal",
    stateCode: "WB",
    type: "Historic National Institution",
    badge: "West Bengal State Hospital",
    floors: 3,
    lat: 22.5726,
    lng: 88.3639,
    helpline: "033-22551635",
    emergencyHelpline: "102",
    abhaEnabled: true,
    primaryLanguages: ["bn", "hi", "en"],
    gates: [
      { id: "ENTRANCE_G", name: "Eden Building Main OPD Registration", zone: "OPD_REGISTRATION" },
      { id: "CASUALTY", name: "Emergency & Trauma Entry", zone: "CASUALTY" },
      { id: "RAMP_1", name: "Accessible Ramp & Lift Gate", zone: "RAMP_1" }
    ]
  },
  {
    id: "CIVIL_LUCKNOW",
    name: "Dr. Shyama Prasad Mukherjee Civil Hospital",
    name_hi: "डॉ. श्यामा प्रसाद मुखर्जी सिविल अस्पताल",
    name_ta: "சிவில் மருத்துவமனை (லக்னோ)",
    city: "Lucknow",
    state: "Uttar Pradesh",
    stateCode: "UP",
    type: "State Civil Hospital",
    badge: "UP Health Mission",
    floors: 3,
    lat: 26.8500,
    lng: 80.9500,
    helpline: "0522-2287239",
    emergencyHelpline: "108",
    abhaEnabled: true,
    primaryLanguages: ["hi", "en"],
    gates: [
      { id: "ENTRANCE_G", name: "Gate 1 - OPD Registration Counter", zone: "OPD_REGISTRATION" },
      { id: "CASUALTY", name: "Gate 2 - Emergency Casualty Block", zone: "CASUALTY" },
      { id: "RAMP_1", name: "Accessible Ramp Entry", zone: "RAMP_1" }
    ]
  }
];

export const defaultHospital = nationalHospitals[0];

/**
 * Calculate distance between two lat/lng coordinates in kilometers using Haversine formula
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((R * c) * 10) / 10;
}
