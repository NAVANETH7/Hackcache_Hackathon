import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { SocketProvider } from './context/SocketContext';
import { JourneyProvider } from './context/JourneyContext';
import Header from './components/common/Header';
import PatientHome from './views/PatientHome';
import StaffDashboard from './views/StaffDashboard';
import WaitingRoomBoard from './views/WaitingRoomBoard';
import EmergencyView from './views/EmergencyView';
import DemoHarness from './views/DemoHarness';
import { AlertCircle, RotateCcw } from 'lucide-react';

// Error Boundary Component to guarantee no blank white screen crash
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[OPD Saathi Crash Caught]:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-red-500 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle size={36} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 m-0">
              Something went wrong
            </h2>
            <p className="text-xs text-slate-600 font-medium m-0">
              The application encountered an unexpected error. Your saved OPD slip data remains safe.
            </p>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs font-mono text-red-700 overflow-x-auto max-h-32">
              {this.state.error?.message || 'Unknown runtime error'}
            </div>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/';
              }}
              className="w-full tap-target-large py-3.5 rounded-xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} />
              <span>Reload OPD Saathi</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AccessibilityProvider>
        <SocketProvider>
          <JourneyProvider>
            <BrowserRouter>
              <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-emerald-200">
                <Header />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<PatientHome />} />
                    <Route path="/staff" element={<StaffDashboard />} />
                    <Route path="/board" element={<WaitingRoomBoard />} />
                    <Route path="/emergency" element={<EmergencyView />} />
                    <Route path="/demo" element={<DemoHarness />} />
                    {/* Fallback route */}
                    <Route path="*" element={<PatientHome />} />
                  </Routes>
                </main>
                <footer className="bg-white border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500 print:hidden">
                  <p className="m-0 font-medium">
                    OPD Saathi • City District Headquarters Hospital • Prototype for Hackathon Evaluation
                  </p>
                  <p className="m-0 text-[11px] text-slate-400 mt-0.5">
                    WCAG AAA • Tri-Lingual (English, தமிழ், हिंदी) • Zero-Stairs Dijkstra Routing
                  </p>
                </footer>
              </div>
            </BrowserRouter>
          </JourneyProvider>
        </SocketProvider>
      </AccessibilityProvider>
    </ErrorBoundary>
  );
}
