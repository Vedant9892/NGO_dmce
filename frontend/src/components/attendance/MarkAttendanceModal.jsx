import { useState, useEffect, useRef } from 'react';
import { QrCode, Hash, MapPin, Clock, X, CheckCircle } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { markSelfAttendance } from '../../services/eventService';

const STEPS = { scan: 'scan', confirm: 'confirm', success: 'success' };

export default function MarkAttendanceModal({ eventId, eventTitle, onClose, onSuccess }) {
  const [step, setStep] = useState('scan');
  const [mode, setMode] = useState('scan'); // 'scan' | 'code'
  const [method, setMethod] = useState('code'); // 'qr' | 'code' - how they obtained the code
  const [code, setCode] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [timestamp, setTimestamp] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);
  const scannerInstanceRef = useRef(null);

  const startScanner = () => {
    stopScanner();
    const id = 'qr-reader';
    if (!document.getElementById(id)) return;
    const scanner = new Html5Qrcode(id);
    scannerInstanceRef.current = scanner;
    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 5 },
        (decodedText) => {
          const trimmed = String(decodedText || '').trim().toUpperCase();
          if (trimmed) {
            stopScanner();
            handleCodeReceived(trimmed, 'qr');
          }
        },
        () => {}
      )
      .catch((err) => setError(err?.message || 'Camera access failed'));
  };

  const stopScanner = () => {
    const scanner = scannerInstanceRef.current;
    if (scanner?.isScanning) {
      scanner.stop().catch(() => {});
      scannerInstanceRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopScanner();
  }, []);

  useEffect(() => {
    if (step === STEPS.scan && mode === 'scan') {
      const t = setTimeout(() => startScanner(), 300);
      return () => {
        clearTimeout(t);
        stopScanner();
      };
    }
  }, [step, mode]);

  const handleCodeReceived = (receivedCode, receivedMethod) => {
    setCode(receivedCode);
    setMethod(receivedMethod || 'code');
    setTimestamp(new Date());
    setLocationError(null);
    setLocation(null);

    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setStep(STEPS.confirm);
          setLoading(false);
        },
        (err) => {
          setLocationError(err.message || 'Location unavailable');
          setStep(STEPS.confirm);
          setLoading(false);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      setStep(STEPS.confirm);
    }
  };

  const handleSubmitCode = () => {
    const trimmed = manualCode.trim().toUpperCase();
    if (!trimmed) {
      setError('Please enter the attendance code');
      return;
    }
    setError(null);
    handleCodeReceived(trimmed, 'code');
  };

  const handleConfirm = async () => {
    if (!eventId || !code) return;
    setLoading(true);
    setError(null);
    try {
      await markSelfAttendance(eventId, {
        code,
        method,
        latitude: location?.lat,
        longitude: location?.lng,
      });
      setStep(STEPS.success);
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep(STEPS.scan);
    setCode('');
    setManualCode('');
    setTimestamp(null);
    setLocation(null);
    setLocationError(null);
    setError(null);
    if (mode === 'scan') startScanner();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Mark Attendance</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {step === STEPS.scan && (
            <>
              <p className="text-sm text-gray-600 mb-4">
                {eventTitle && <span className="font-medium">{eventTitle}</span>}
                {eventTitle && <br />}
                Scan the QR code at the event or enter the code manually.
              </p>

              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setMode('scan');
                    setError(null);
                    setManualCode('');
                    startScanner();
                  }}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 ${
                    mode === 'scan' ? 'bg-emerald-700 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <QrCode className="h-5 w-5" />
                  Scan QR
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('code');
                    stopScanner();
                    setError(null);
                  }}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 ${
                    mode === 'code' ? 'bg-emerald-700 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <Hash className="h-5 w-5" />
                  Enter Code
                </button>
              </div>

              {mode === 'scan' ? (
                <div className="mb-4">
                  <div id="qr-reader" className="w-full rounded-lg overflow-hidden border border-gray-200" />
                </div>
              ) : (
                <div className="mb-4">
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                    placeholder="Enter attendance code"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-lg tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={handleSubmitCode}
                    className="mt-3 w-full py-2 bg-emerald-700 text-white font-semibold rounded-lg hover:bg-emerald-800"
                  >
                    Continue
                  </button>
                </div>
              )}

              {loading && mode === 'scan' && (
                <p className="text-sm text-gray-500">Requesting camera access...</p>
              )}
            </>
          )}

          {step === STEPS.confirm && (
            <>
              <p className="text-sm text-gray-600 mb-4">Verify your attendance details:</p>

              <div className="space-y-3 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Date & Time</p>
                    <p className="font-medium">{timestamp?.toLocaleString() || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="font-medium">
                      {location
                        ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
                        : locationError || 'Not available'}
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={loading}
                  className="flex-1 py-2 bg-emerald-700 text-white font-semibold rounded-lg hover:bg-emerald-800 disabled:opacity-50"
                >
                  {loading ? 'Marking...' : 'Mark Attendance'}
                </button>
              </div>
            </>
          )}

          {step === STEPS.success && (
            <div className="text-center py-4">
              <CheckCircle className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
              <h4 className="text-xl font-bold text-gray-900 mb-2">Attendance Marked!</h4>
              <p className="text-gray-600 mb-6">Your attendance has been recorded successfully.</p>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-emerald-700 text-white font-semibold rounded-lg hover:bg-emerald-800"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
