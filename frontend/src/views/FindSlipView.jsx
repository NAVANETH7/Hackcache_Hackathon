import React, { useState, useEffect, useRef } from 'react';
import { useJourney } from '../context/JourneyContext';
import { useSocket } from '../context/SocketContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { 
  FileText, 
  Search, 
  Camera, 
  X, 
  AlertCircle, 
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export default function FindSlipView({ onFound }) {
  const { setPatientSlip } = useJourney();
  const { serverState } = useSocket();
  const { language, t } = useAccessibility();

  const [tokenInput, setTokenInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [hasBarcodeDetector, setHasBarcodeDetector] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Check if browser natively supports BarcodeDetector
  useEffect(() => {
    if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
      setHasBarcodeDetector(true);
    }
  }, []);

  const handleSearch = (tokenToFind) => {
    const query = (tokenToFind || tokenInput).trim().toUpperCase();
    if (!query) return;

    const matched = (serverState?.tokens || []).find(t => 
      t.tokenId.toUpperCase() === query || 
      t.tokenId.replace('-', '').toUpperCase() === query.replace('-', '')
    );

    if (matched) {
      setPatientSlip(matched);
      if (onFound) onFound(matched);
    } else {
      setErrorMsg(t('haveSlip.notFound'));
    }
  };

  // Start Camera QR scanning using BarcodeDetector
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);

      const barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });
      
      const scanInterval = setInterval(async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) return;
        try {
          const barcodes = await barcodeDetector.detect(videoRef.current);
          if (barcodes.length > 0) {
            const rawValue = barcodes[0].rawValue;
            clearInterval(scanInterval);
            stopCamera();
            
            // Parse token from QR JSON or direct string
            let parsedToken = rawValue;
            try {
              const obj = JSON.parse(rawValue);
              if (obj.token || obj.tokenId) parsedToken = obj.token || obj.tokenId;
            } catch {}

            handleSearch(parsedToken);
          }
        } catch {}
      }, 500);

    } catch (err) {
      alert(`Could not start camera: ${err.message}`);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="max-w-md mx-auto my-6 bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-slate-200 space-y-6 animate-fade-in">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3 shadow-inner">
          <FileText size={32} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 m-0">
          {t('haveSlip.title')}
        </h2>
        <p className="text-xs text-slate-500 font-semibold m-0 mt-1.5">
          {t('haveSlip.desc')}
        </p>
      </div>

      {/* Manual Token Number Input */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1.5">
            {t('haveSlip.tokenInputLabel')}
          </label>
          <input
            type="text"
            value={tokenInput}
            onChange={(e) => {
              setTokenInput(e.target.value.toUpperCase());
              setErrorMsg('');
            }}
            placeholder={t('haveSlip.tokenPlaceholder')}
            className="w-full tap-target-large px-4 py-3.5 rounded-2xl border-2 border-slate-300 focus:border-emerald-600 font-mono text-2xl font-black text-slate-900 outline-none text-center tracking-widest uppercase"
          />
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs font-bold flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => handleSearch()}
          className="w-full tap-target-large py-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-base flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-98"
        >
          <Search size={20} />
          <span>{t('haveSlip.searchBtn')}</span>
        </button>
      </div>

      {/* Camera QR Scanner (Shown only if BarcodeDetector exists in browser) */}
      {hasBarcodeDetector && (
        <div className="pt-2 border-t border-slate-200">
          {!cameraActive ? (
            <button
              type="button"
              onClick={startCamera}
              className="w-full tap-target-large py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm flex items-center justify-center gap-2 border border-slate-300 transition-colors"
            >
              <Camera size={20} className="text-emerald-700" />
              <span>{t('haveSlip.scanQrBtn')}</span>
            </button>
          ) : (
            <div className="space-y-3 text-center">
              <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 bg-black aspect-square max-w-[280px] mx-auto">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-8 border-2 border-dashed border-white/80 rounded-xl pointer-events-none"></div>
              </div>
              <button
                type="button"
                onClick={stopCamera}
                className="tap-target-large px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 mx-auto"
              >
                <X size={16} />
                <span>{t('haveSlip.cancelCamera')}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Quick Demo Tokens helper */}
      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center">
        <p className="text-[11px] font-bold text-slate-500 m-0 mb-1.5">
          Tap a sample token to load instantly:
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {['ORT-042', 'MED-011', 'PED-031'].map(sampleId => (
            <button
              key={sampleId}
              type="button"
              onClick={() => {
                setTokenInput(sampleId);
                handleSearch(sampleId);
              }}
              className="px-3 py-1 rounded-lg bg-white border border-slate-300 text-xs font-mono font-bold text-slate-800 hover:bg-emerald-50 hover:border-emerald-400"
            >
              {sampleId}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
