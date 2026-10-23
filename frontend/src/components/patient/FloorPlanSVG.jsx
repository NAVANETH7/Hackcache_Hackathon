import React from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';

/**
 * Inline SVG Floor Plan Viewer
 * Draws realistic 3-Floor District Hospital plans:
 * - Ground Floor: Entrance, Emergency, Help Desk, Registration, Pharmacy, Lab, X-Ray, Lifts, Ramps, Stairs, Water, Toilets
 * - Floor 1: OPD Rooms 1 to 8, Waiting Hall A, Lifts, Ramps, Stairs, Water, Toilets
 * - Floor 2: Ward 4 (Medicine), Ward 5 (Surgery), Ward 6 (Children), Nurses' Station, Lifts, Ramps, Stairs, X-Ray
 * 
 * Draws the computed Dijkstra path line dynamically over the floor plan!
 */
export default function FloorPlanSVG({ 
  floor = 1, 
  activeRoute = null, 
  targetNodeId = null,
  onNodeClick = null 
}) {
  const { language } = useAccessibility();

  // Floor dimensions
  const width = 800;
  const height = 500;

  // Extract path points that belong to this floor
  const floorSteps = (activeRoute?.instructions || []).filter(s => s.floor === floor);
  
  // Build SVG path data for route line on this floor
  let pathD = '';
  if (floorSteps.length > 1) {
    pathD = floorSteps.reduce((acc, step, idx) => {
      return idx === 0 ? `M ${step.x} ${step.y}` : `${acc} L ${step.x} ${step.y}`;
    }, '');
  }

  return (
    <div className="w-full bg-slate-950 rounded-2xl p-2.5 sm:p-4 shadow-xl border-2 border-slate-800 overflow-hidden">
      {/* SVG Header Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs font-bold text-slate-300">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-white font-black uppercase">
            {floor === 0 
              ? (language === 'ta' ? 'தரை தளம் (Ground Floor)' : language === 'hi' ? 'भू-तल (Ground Floor)' : 'Ground Floor')
              : floor === 1
              ? (language === 'ta' ? 'முதல் தளம் (Floor 1 - OPD Rooms 1 to 8)' : language === 'hi' ? 'प्रथम तल (Floor 1 - ओपीडी कक्ष 1-8)' : 'First Floor - OPD Rooms 1-8')
              : (language === 'ta' ? 'இரண்டாம் தளம் (Floor 2 - Wards & X-Ray)' : language === 'hi' ? 'द्वितीय तल (Floor 2 - वार्ड एवं एक्स-रे)' : 'Second Floor - Wards & X-Ray')}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-500"></span> {language === 'ta' ? 'லிஃப்ட்/சாய்வுப்பாதை' : 'Lift/Ramp'}</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-amber-400"></span> {language === 'ta' ? 'பாதை' : 'Path'}</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-red-500"></span> {language === 'ta' ? 'இலக்கு' : 'Destination'}</span>
        </div>
      </div>

      {/* SVG Viewport */}
      <div className="relative w-full aspect-[16/10] bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle Grid Background */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="1" />
            </pattern>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
          </defs>
          <rect width={width} height={height} fill="url(#grid)" />

          {/* ======================================================= */}
          {/* FLOOR 0: GROUND FLOOR LAYOUT                            */}
          {/* ======================================================= */}
          {floor === 0 && (
            <g id="floor0-elements">
              {/* Main Corridors */}
              <rect x="70" y="320" width="670" height="80" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="2" />
              <rect x="70" y="140" width="670" height="80" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="2" />
              <rect x="320" y="140" width="60" height="260" rx="4" fill="#1e293b" stroke="#334155" strokeWidth="1" />

              {/* Main Entrance */}
              <rect x="60" y="420" width="120" height="60" rx="6" fill="#065f46" stroke="#10b981" strokeWidth="2" />
              <text x="120" y="445" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">MAIN ENTRANCE</text>
              <text x="120" y="465" fill="#a7f3d0" fontSize="10" textAnchor="middle">முதன்மை நுழைவாயில்</text>

              {/* Emergency / Casualty (Bold Red Area) */}
              <rect x="60" y="40" width="140" height="90" rx="8" fill="#991b1b" stroke="#ef4444" strokeWidth="3" />
              <text x="130" y="75" fill="#ffffff" fontSize="14" fontWeight="900" textAnchor="middle">EMERGENCY</text>
              <text x="130" y="95" fill="#fecaca" fontSize="11" fontWeight="bold" textAnchor="middle">CASUALTY (அவசரம்)</text>
              <text x="130" y="115" fill="#fca5a5" fontSize="9" textAnchor="middle">No token needed • 24/7</text>

              {/* Help Desk (Yellow) */}
              <rect x="220" y="330" width="110" height="60" rx="6" fill="#854d0e" stroke="#eab308" strokeWidth="2" />
              <text x="275" y="358" fill="#fef08a" fontSize="12" fontWeight="bold" textAnchor="middle">MAY I HELP YOU</text>
              <text x="275" y="376" fill="#ffffff" fontSize="10" textAnchor="middle">உதவி மையம்</text>

              {/* Registration Counters 1-4 */}
              <rect x="360" y="330" width="130" height="60" rx="6" fill="#0f766e" stroke="#14b8a6" strokeWidth="2" />
              <text x="425" y="358" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">REGISTRATION</text>
              <text x="425" y="376" fill="#99f6e4" fontSize="10" textAnchor="middle">Counters 1-4 (பதிவு)</text>

              {/* Central Pharmacy */}
              <rect x="580" y="330" width="140" height="60" rx="6" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" />
              <text x="650" y="358" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">PHARMACY</text>
              <text x="650" y="376" fill="#bfdbfe" fontSize="10" textAnchor="middle">Free Medicine (மருந்தகம்)</text>

              {/* Drinking Water */}
              <circle cx="540" cy="420" r="22" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
              <text x="540" y="425" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">WATER</text>

              {/* Toilets Ground */}
              <rect x="690" y="420" width="70" height="50" rx="6" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
              <text x="725" y="450" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">WC / கழிவறை</text>

              {/* X-Ray Ground */}
              <rect x="440" y="50" width="100" height="80" rx="6" fill="#374151" stroke="#9ca3af" strokeWidth="1.5" />
              <text x="490" y="85" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">X-RAY WING</text>
              <text x="490" y="105" fill="#d1d5db" fontSize="10" textAnchor="middle">Ground Floor</text>

              {/* Blood Lab */}
              <rect x="580" y="50" width="140" height="80" rx="6" fill="#701a75" stroke="#d946ef" strokeWidth="2" />
              <text x="650" y="85" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">LABORATORY</text>
              <text x="650" y="105" fill="#f5d0fe" fontSize="10" textAnchor="middle">Blood & Tests (ஆய்வகம்)</text>

              {/* Vertical Transit Nodes */}
              {/* Lift A */}
              <rect x="330" y="210" width="50" height="40" rx="6" fill="#047857" stroke="#34d399" strokeWidth="2" />
              <text x="355" y="235" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">LIFT A</text>

              {/* Lift B */}
              <rect x="630" y="210" width="50" height="40" rx="6" fill="#047857" stroke="#34d399" strokeWidth="2" />
              <text x="655" y="235" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">LIFT B</text>

              {/* Ramp 1 */}
              <rect x="200" y="210" width="70" height="40" rx="6" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 2" />
              <text x="235" y="235" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">RAMP 1</text>

              {/* Stairs A */}
              <rect x="280" y="210" width="40" height="40" rx="4" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
              <text x="300" y="235" fill="#e2e8f0" fontSize="9" textAnchor="middle">STAIRS</text>
            </g>
          )}

          {/* ======================================================= */}
          {/* FLOOR 1: OPD ROOMS 1 TO 8 & WAITING HALL A              */}
          {/* ======================================================= */}
          {floor === 1 && (
            <g id="floor1-elements">
              {/* Central Waiting Hall A */}
              <rect x="120" y="210" width="560" height="150" rx="12" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 4" />
              <text x="400" y="280" fill="#38bdf8" fontSize="16" fontWeight="900" textAnchor="middle">WAITING HALL A (காத்திருப்பு கூடம்)</text>
              <text x="400" y="305" fill="#94a3b8" fontSize="12" textAnchor="middle">60 Blue Chairs • TV Display Board • Opposite Rooms 1 to 8</text>

              {/* OPD Rooms 1 to 8 on North Corridor */}
              {/* Room 1 */}
              <rect x="110" y="50" width="70" height="90" rx="6" fill="#14532d" stroke="#22c55e" strokeWidth="2" />
              <text x="145" y="80" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">ROOM 1</text>
              <text x="145" y="100" fill="#86efac" fontSize="9" textAnchor="middle">Gen Med</text>
              <text x="145" y="120" fill="#ffffff" fontSize="8" textAnchor="middle">Dr. Sharma</text>

              {/* Room 2 */}
              <rect x="190" y="50" width="70" height="90" rx="6" fill="#14532d" stroke="#22c55e" strokeWidth="2" />
              <text x="225" y="80" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">ROOM 2</text>
              <text x="225" y="100" fill="#86efac" fontSize="9" textAnchor="middle">Gen Med</text>
              <text x="225" y="120" fill="#ffffff" fontSize="8" textAnchor="middle">Dr. Rao</text>

              {/* Room 3 */}
              <rect x="280" y="50" width="75" height="90" rx="6" fill="#713f12" stroke="#eab308" strokeWidth="2" />
              <text x="317" y="80" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">ROOM 3</text>
              <text x="317" y="100" fill="#fef08a" fontSize="9" textAnchor="middle">Children</text>
              <text x="317" y="120" fill="#ffffff" fontSize="8" textAnchor="middle">Dr. Priya</text>

              {/* Room 4 */}
              <rect x="370" y="50" width="75" height="90" rx="6" fill="#701a75" stroke="#d946ef" strokeWidth="2" />
              <text x="407" y="80" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">ROOM 4</text>
              <text x="407" y="100" fill="#f5d0fe" fontSize="9" textAnchor="middle">Women</text>
              <text x="407" y="120" fill="#ffffff" fontSize="8" textAnchor="middle">Dr. Iyer</text>

              {/* Room 5 (Orthopedics - Kamla's Target) */}
              <rect x="460" y="50" width="80" height="90" rx="6" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="3" />
              <text x="500" y="80" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">ROOM 5</text>
              <text x="500" y="100" fill="#93c5fd" fontSize="9" fontWeight="bold" textAnchor="middle">Bones/Ortho</text>
              <text x="500" y="120" fill="#ffffff" fontSize="8" textAnchor="middle">Dr. Verma</text>

              {/* Room 6 */}
              <rect x="555" y="50" width="70" height="90" rx="6" fill="#0f766e" stroke="#2dd4bf" strokeWidth="2" />
              <text x="590" y="80" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">ROOM 6</text>
              <text x="590" y="100" fill="#99f6e4" fontSize="9" textAnchor="middle">ENT</text>
              <text x="590" y="120" fill="#ffffff" fontSize="8" textAnchor="middle">Dr. Deshmukh</text>

              {/* Room 7 */}
              <rect x="640" y="50" width="70" height="90" rx="6" fill="#312e81" stroke="#818cf8" strokeWidth="2" />
              <text x="675" y="80" fill="#ffffff" fontSize="13" fontWeight="bold" textAnchor="middle">ROOM 7</text>
              <text x="675" y="100" fill="#c7d2fe" fontSize="9" textAnchor="middle">Eyes (கண்)</text>
              <text x="675" y="120" fill="#ffffff" fontSize="8" textAnchor="middle">Dr. Swaminathan</text>

              {/* Room 8 */}
              <rect x="720" y="50" width="65" height="90" rx="6" fill="#374151" stroke="#9ca3af" strokeWidth="2" />
              <text x="752" y="80" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">ROOM 8</text>
              <text x="752" y="100" fill="#e5e7eb" fontSize="9" textAnchor="middle">Skin</text>
              <text x="752" y="120" fill="#ffffff" fontSize="8" textAnchor="middle">Dr. Zahra</text>

              {/* Drinking water Floor 1 */}
              <circle cx="500" cy="220" r="18" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
              <text x="500" y="224" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">WATER</text>

              {/* Toilets Floor 1 */}
              <rect x="700" y="270" width="70" height="50" rx="6" fill="#334155" stroke="#64748b" strokeWidth="1.5" />
              <text x="735" y="300" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">WC / கழிவறை</text>

              {/* Vertical Transit Floor 1 */}
              <rect x="330" y="260" width="50" height="40" rx="6" fill="#047857" stroke="#34d399" strokeWidth="2" />
              <text x="355" y="285" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">LIFT A</text>

              <rect x="630" y="260" width="50" height="40" rx="6" fill="#047857" stroke="#34d399" strokeWidth="2" />
              <text x="655" y="285" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">LIFT B</text>

              <rect x="200" y="260" width="70" height="40" rx="6" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 2" />
              <text x="235" y="285" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">RAMP 1</text>

              <rect x="280" y="260" width="40" height="40" rx="4" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
              <text x="300" y="285" fill="#e2e8f0" fontSize="9" textAnchor="middle">STAIRS</text>
            </g>
          )}

          {/* ======================================================= */}
          {/* FLOOR 2: WARDS 4 TO 6 & NURSES' STATION                 */}
          {/* ======================================================= */}
          {floor === 2 && (
            <g id="floor2-elements">
              {/* Central Nurses' Station */}
              <circle cx="400" cy="260" r="45" fill="#0f766e" stroke="#2dd4bf" strokeWidth="3" />
              <text x="400" y="255" fill="#ffffff" fontSize="11" fontWeight="900" textAnchor="middle">NURSES'</text>
              <text x="400" y="272" fill="#99f6e4" fontSize="10" textAnchor="middle">STATION</text>

              {/* Ward 4 - Medicine */}
              <rect x="100" y="60" width="160" height="110" rx="8" fill="#14532d" stroke="#22c55e" strokeWidth="2" />
              <text x="180" y="100" fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle">WARD 4</text>
              <text x="180" y="125" fill="#86efac" fontSize="11" textAnchor="middle">Medicine Ward (Beds 1-30)</text>

              {/* Ward 5 - Surgery */}
              <rect x="320" y="60" width="160" height="110" rx="8" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="2" />
              <text x="400" y="100" fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle">WARD 5</text>
              <text x="400" y="125" fill="#93c5fd" fontSize="11" textAnchor="middle">Surgery Ward (அறுவை சிகிச்சை)</text>

              {/* Ward 6 - Children */}
              <rect x="540" y="60" width="160" height="110" rx="8" fill="#713f12" stroke="#eab308" strokeWidth="2" />
              <text x="620" y="100" fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle">WARD 6</text>
              <text x="620" y="125" fill="#fef08a" fontSize="11" textAnchor="middle">Children's Inpatient Ward</text>

              {/* Digital X-Ray / Special Clinic */}
              <rect x="640" y="220" width="130" height="70" rx="8" fill="#312e81" stroke="#818cf8" strokeWidth="2" />
              <text x="705" y="250" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">X-RAY & SCAN</text>
              <text x="705" y="270" fill="#c7d2fe" fontSize="10" textAnchor="middle">Digital Radiology</text>

              {/* Vertical Transit Floor 2 */}
              <rect x="330" y="240" width="50" height="40" rx="6" fill="#047857" stroke="#34d399" strokeWidth="2" />
              <text x="355" y="265" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">LIFT A</text>

              <rect x="610" y="240" width="50" height="40" rx="6" fill="#047857" stroke="#34d399" strokeWidth="2" />
              <text x="635" y="265" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">LIFT B</text>

              <rect x="200" y="240" width="70" height="40" rx="6" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 2" />
              <text x="235" y="265" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">RAMP 2</text>

              <rect x="280" y="240" width="40" height="40" rx="4" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
              <text x="300" y="265" fill="#e2e8f0" fontSize="9" textAnchor="middle">STAIRS</text>
            </g>
          )}

          {/* ======================================================= */}
          {/* RENDER COMPUTED DIJKSTRA PATH ROUTE ON THIS FLOOR       */}
          {/* ======================================================= */}
          {pathD && (
            <g id="route-path">
              {/* Outer Glow Line */}
              <path
                d={pathD}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="12"
                strokeOpacity="0.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#glow)"
              />
              {/* Main Vivid Yellow/Amber Path Line */}
              <path
                d={pathD}
                fill="none"
                stroke="#fbbf24"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="8 6"
                className="animate-pulse"
              />

              {/* Waypoint Dots */}
              {floorSteps.map((step, idx) => {
                const isStart = idx === 0;
                const isDest = idx === floorSteps.length - 1;

                return (
                  <g key={`pt-${step.nodeId}`} transform={`translate(${step.x}, ${step.y})`}>
                    <circle
                      r={isDest ? 14 : isStart ? 10 : 6}
                      fill={isDest ? "#ef4444" : isStart ? "#10b981" : "#f59e0b"}
                      stroke="#ffffff"
                      strokeWidth="2.5"
                    />
                    {isDest && (
                      <circle
                        r="20"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="2"
                        className="animate-ping"
                      />
                    )}
                    <text
                      y={isDest ? -20 : 18}
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                      className="drop-shadow-md"
                    >
                      {step.nodeName}
                    </text>
                  </g>
                );
              })}
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
