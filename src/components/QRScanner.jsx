import { useRef, useEffect, useState, useCallback } from "react";

// Use the built-in BarcodeDetector API (Chrome, Edge, Android) when available.
// Falls back to jsQR loaded on demand — no impact on initial bundle.

async function getDecoder() {
  if ("BarcodeDetector" in window) {
    try {
      const supported = await BarcodeDetector.getSupportedFormats();
      if (supported.includes("qr_code")) {
        const detector = new BarcodeDetector({ formats: ["qr_code"] });
        return async (canvas) => {
          const codes = await detector.detect(canvas);
          return codes[0]?.rawValue ?? null;
        };
      }
    } catch { /* fall through */ }
  }

  // jsQR fallback
  const { default: jsQR } = await import("jsqr");
  return (canvas) => {
    const ctx = canvas.getContext("2d");
    const { width, height } = canvas;
    const imageData = ctx.getImageData(0, 0, width, height);
    const code = jsQR(imageData.data, width, height, { inversionAttempts: "dontInvert" });
    return code?.data ?? null;
  };
}

export default function QRScanner({ onDetected, onCancel }) {
  const videoRef   = useRef(null);
  const canvasRef  = useRef(null);
  const streamRef  = useRef(null);
  const rafRef     = useRef(null);
  const decoderRef = useRef(null);

  const [status, setStatus] = useState("init"); // init | active | error | detected
  const [errMsg, setErrMsg] = useState("");
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteUrl, setPasteUrl] = useState("");
  const [flash, setFlash] = useState(false);

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  const handleDetected = useCallback((url) => {
    setStatus("detected");
    setFlash(true);
    stopCamera();
    setTimeout(() => onDetected(url), 500);
  }, [onDetected, stopCamera]);

  const startCamera = useCallback(async () => {
    setStatus("init");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      // Load decoder
      if (!decoderRef.current) decoderRef.current = await getDecoder();

      setStatus("active");

      const scan = async () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video  = videoRef.current;
        const canvas = canvasRef.current;

        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width  = video.videoWidth;
          canvas.height = video.videoHeight;
          canvas.getContext("2d").drawImage(video, 0, 0);

          const result = await decoderRef.current(canvas);
          if (result) {
            handleDetected(result);
            return;
          }
        }
        rafRef.current = requestAnimationFrame(scan);
      };
      rafRef.current = requestAnimationFrame(scan);
    } catch (err) {
      setStatus("error");
      if (err.name === "NotAllowedError") {
        setErrMsg("Camera permission denied. Please allow camera access and try again, or paste the QR URL below.");
      } else if (err.name === "NotFoundError") {
        setErrMsg("No camera found on this device. Use the paste option below.");
      } else {
        setErrMsg("Camera unavailable. Use the paste option below.");
      }
      setPasteMode(true);
    }
  }, [handleDetected]);

  useEffect(() => {
    startCamera();
    return stopCamera;
  }, [startCamera, stopCamera]);

  const handlePaste = () => {
    const url = pasteUrl.trim();
    if (url) handleDetected(url);
  };

  return (
    <div className="qr-scanner">
      {/* Flash overlay on detection */}
      {flash && <div className="qr-scanner__flash" />}

      <div className="qr-scanner__header">
        <h2 className="qr-scanner__title">Scan Product QR Code</h2>
        <p className="qr-scanner__sub">Point your camera at the QR code on the product package</p>
      </div>

      {!pasteMode && (
        <div className="qr-scanner__viewport">
          <video
            ref={videoRef}
            className="qr-scanner__video"
            playsInline
            muted
            autoPlay
          />
          {/* Hidden canvas for frame capture */}
          <canvas ref={canvasRef} className="qr-scanner__canvas" />

          {/* Scanning reticle */}
          {status === "active" && (
            <div className="qr-scanner__reticle">
              <div className="qr-scanner__corner qr-scanner__corner--tl" />
              <div className="qr-scanner__corner qr-scanner__corner--tr" />
              <div className="qr-scanner__corner qr-scanner__corner--bl" />
              <div className="qr-scanner__corner qr-scanner__corner--br" />
              <div className="qr-scanner__scan-line" />
            </div>
          )}

          {/* Status labels */}
          {status === "init" && (
            <div className="qr-scanner__overlay-msg">
              <span className="qr-scanner__spinner" />
              Starting camera…
            </div>
          )}
          {status === "detected" && (
            <div className="qr-scanner__overlay-msg qr-scanner__overlay-msg--success">
              ✓ Code detected
            </div>
          )}
          {status === "error" && (
            <div className="qr-scanner__overlay-msg qr-scanner__overlay-msg--error">
              {errMsg}
            </div>
          )}

          {status === "active" && (
            <div className="qr-scanner__pulse-label">
              <span className="qr-scanner__pulse-dot" /> Scanning…
            </div>
          )}
        </div>
      )}

      {/* Paste URL fallback */}
      <div className="qr-scanner__paste-section">
        {!pasteMode ? (
          <button className="qr-scanner__paste-toggle" onClick={() => {
            stopCamera();
            setPasteMode(true);
          }}>
            Can&apos;t scan? Paste the product URL instead →
          </button>
        ) : (
          <div className="qr-scanner__paste-form">
            <p className="qr-scanner__paste-hint">
              Open your phone&apos;s camera app, scan the QR code on the package to get the URL, then paste it below.
            </p>
            <div className="qr-scanner__paste-row">
              <input
                type="url"
                className="qr-scanner__paste-input"
                placeholder="https://app.1a4.com/landingpage/…"
                value={pasteUrl}
                onChange={e => setPasteUrl(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handlePaste()}
                autoFocus
              />
              <button
                className="btn btn--primary"
                onClick={handlePaste}
                disabled={!pasteUrl.trim()}
              >
                Lookup →
              </button>
            </div>
            <button className="qr-scanner__paste-toggle" onClick={() => {
              setPasteMode(false);
              startCamera();
            }}>
              ← Use camera instead
            </button>
          </div>
        )}
      </div>

      <div className="qr-scanner__why">
        <span className="qr-scanner__why-icon">🏛️</span>
        <span>
          Only NYS licensed dispensary products carry a Metrc QR code.
          Scanning ensures your data is scientifically traceable to verified, tested products.
        </span>
      </div>

      <button className="qr-scanner__cancel" onClick={() => { stopCamera(); onCancel(); }}>
        Cancel
      </button>
    </div>
  );
}
