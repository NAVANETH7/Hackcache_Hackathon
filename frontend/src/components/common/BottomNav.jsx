import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useJourney } from '../../context/JourneyContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { 
  Home, 
  Ticket, 
  Compass, 
  Stethoscope, 
  AlertTriangle 
} from 'lucide-react';

export default function BottomNav() {
  const location = useLocation();
  const { activeSlip } = useJourney();
  const { language } = useAccessibility();

  const labels = {
    home: language === 'ta' ? 'முகப்பு' : language === 'hi' ? 'होम' : 'Home',
    myTurn: language === 'ta' ? 'டோக்கன்' : language === 'hi' ? 'पर्ची' : (activeSlip ? 'My Turn' : 'My Slip'),
    find: language === 'ta' ? 'வழி' : language === 'hi' ? 'मार्ग' : 'Map',
    staff: language === 'ta' ? 'பணியாளர்' : language === 'hi' ? 'स्टाफ' : 'Staff',
    sos: 'SOS'
  };

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E3DED1] shadow-[0_-4px_24px_rgba(0,0,0,0.08)] px-2 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Home */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl min-w-[56px] transition-all no-underline ${
            isActive('/') && !location.hash
              ? 'text-[#174E46] font-black'
              : 'text-[#52665C] hover:text-[#26352F]'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${
            isActive('/') ? 'bg-[#EEF4F0]' : ''
          }`}>
            <Home size={20} />
          </div>
          <span className="text-[11px] font-bold tracking-tight mt-0.5">
            {labels.home}
          </span>
        </Link>

        {/* My Turn / Active Slip */}
        <Link
          to="/"
          onClick={() => {
            // Smoothly scrolls to or triggers token view if on home
            window.dispatchEvent(new CustomEvent('opd_nav_my_turn'));
          }}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl min-w-[56px] relative transition-all no-underline ${
            activeSlip ? 'text-[#174E46] font-black' : 'text-[#52665C]'
          }`}
        >
          <div className={`p-1 rounded-xl relative transition-all ${
            activeSlip ? 'bg-[#EEF4F0]' : ''
          }`}>
            <Ticket size={20} />
            {activeSlip && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
            )}
          </div>
          <span className="text-[11px] font-bold tracking-tight mt-0.5">
            {labels.myTurn}
          </span>
        </Link>

        {/* Indoor Map / Route */}
        <Link
          to="/"
          onClick={() => {
            window.dispatchEvent(new CustomEvent('opd_nav_find_place'));
          }}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl min-w-[56px] text-[#52665C] hover:text-[#26352F] transition-all no-underline"
        >
          <div className="p-1 rounded-xl">
            <Compass size={20} />
          </div>
          <span className="text-[11px] font-bold tracking-tight mt-0.5">
            {labels.find}
          </span>
        </Link>

        {/* Staff Dashboard */}
        <Link
          to="/staff"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl min-w-[56px] transition-all no-underline ${
            isActive('/staff')
              ? 'text-[#174E46] font-black'
              : 'text-[#52665C] hover:text-[#26352F]'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${
            isActive('/staff') ? 'bg-[#EEF4F0]' : ''
          }`}>
            <Stethoscope size={20} />
          </div>
          <span className="text-[11px] font-bold tracking-tight mt-0.5">
            {labels.staff}
          </span>
        </Link>

        {/* SOS Emergency */}
        <Link
          to="/emergency"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl min-w-[56px] transition-all no-underline ${
            isActive('/emergency')
              ? 'text-[#C93B2B] font-black'
              : 'text-[#C93B2B]'
          }`}
        >
          <div className="p-1 rounded-xl bg-red-100 text-[#C93B2B] shadow-sm animate-pulse">
            <AlertTriangle size={20} />
          </div>
          <span className="text-[11px] font-black tracking-tight text-[#C93B2B] mt-0.5">
            {labels.sos}
          </span>
        </Link>
      </div>
    </nav>
  );
}
