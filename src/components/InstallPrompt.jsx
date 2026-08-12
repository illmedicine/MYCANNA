import { useState, useEffect } from "react";

const DISMISS_KEY = "mycana_install_dismissed";
const DISMISS_DAYS = 14;

function isDismissed() {
  try {
    const ts = localStorage.getItem(DISMISS_KEY);
    if (!ts) return false;
    return Date.now() - parseInt(ts, 10) < DISMISS_DAYS * 86400_000;
  } catch { return false; }
}

function dismiss() {
  try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch {}
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window.navigator.standalone);
}

function isInStandaloneMode() {
  return window.navigator.standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches;
}

export default function InstallPrompt() {
  const [mode,    setMode]    = useState(null);   // "android" | "ios" | null
  const [prompt,  setPrompt]  = useState(null);   // deferred BeforeInstallPromptEvent
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isInStandaloneMode() || isDismissed()) return;

    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
      setMode("android");
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // iOS doesn't fire beforeinstallprompt — detect manually
    if (isIOS()) {
      setMode("ios");
      setVisible(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") handleClose();
  };

  const handleClose = () => {
    dismiss();
    setVisible(false);
  };

  if (!visible || !mode) return null;

  return (
    <div className="install-banner" role="banner" aria-label="Install Mycana app">
      <div className="install-banner__inner">
        <img src="/apple-touch-icon.png" alt="Mycana" className="install-banner__icon" />

        <div className="install-banner__text">
          <div className="install-banner__title">Add Mycana to your Home Screen</div>
          {mode === "ios" ? (
            <div className="install-banner__sub">
              Tap <span className="install-banner__share-icon">⎋</span> then{" "}
              <strong>Add to Home Screen</strong>
            </div>
          ) : (
            <div className="install-banner__sub">Install for the full app experience — works offline</div>
          )}
        </div>

        {mode === "android" && (
          <button className="install-banner__cta" onClick={handleInstall}>
            Install
          </button>
        )}

        <button className="install-banner__close" onClick={handleClose} aria-label="Dismiss">
          ✕
        </button>
      </div>
    </div>
  );
}
