import { useState, useCallback, useRef } from "react";

const AGE_KEY = "mycana_age_verified";

function hasVerified() {
  try { return sessionStorage.getItem(AGE_KEY) === "1"; } catch { return false; }
}

function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    // C major arpeggio — satisfying "welcome" sound
    [[0, 523.25], [0.14, 659.25], [0.28, 783.99], [0.42, 1046.5]].forEach(([t, freq]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "sine"; osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + t);
      gain.gain.linearRampToValueAtTime(0.28, ctx.currentTime + t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.6);
      osc.start(ctx.currentTime + t);
      osc.stop(ctx.currentTime + t + 0.65);
    });
  } catch {}
}

function playBuzz() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = "square";
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 0.55);
    gain.gain.setValueAtTime(0.22, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
    osc.start(); osc.stop(ctx.currentTime + 0.6);
  } catch {}
}

export default function AgeGate() {
  const [show, setShow] = useState(!hasVerified());
  const [chosen, setChosen] = useState(null); // "yes" | "no" | null
  const [revealing, setRevealing] = useState(false);
  const rippleRef = useRef(null);

  const spawnRipple = (e, color) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const r = document.createElement("span");
    const d = Math.max(rect.width, rect.height) * 2;
    r.className = "ag-ripple";
    r.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - rect.left - d / 2}px;top:${e.clientY - rect.top - d / 2}px;background:${color};`;
    btn.appendChild(r);
    setTimeout(() => r.remove(), 700);
  };

  const handleYes = useCallback((e) => {
    if (chosen) return;
    spawnRipple(e, "rgba(255,255,255,0.25)");
    setChosen("yes");
    playChime();
    setTimeout(() => setRevealing(true), 200);
    setTimeout(() => {
      try { sessionStorage.setItem(AGE_KEY, "1"); } catch {}
      setShow(false);
    }, 1700);
  }, [chosen]);

  const handleNo = useCallback((e) => {
    if (chosen) return;
    spawnRipple(e, "rgba(255,80,80,0.3)");
    setChosen("no");
    playBuzz();
    setTimeout(() => { window.location.replace("https://pbskids.org"); }, 1200);
  }, [chosen]);

  if (!show) return null;

  return (
    <>
      {/* Inline SVG filter for felt texture */}
      <svg style={{ display: "none" }} aria-hidden="true">
        <defs>
          <filter id="ag-felt" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch" result="noise" />
            <feColorMatrix type="saturate" values="0" in="noise" result="gray" />
            <feBlend in="SourceGraphic" in2="gray" mode="multiply" />
          </filter>
        </defs>
      </svg>

      <div
        className={`ag-overlay${revealing ? " ag-overlay--clear" : ""}`}
        aria-modal="true"
        role="dialog"
        aria-label="Age verification required"
      >
        <div className={`ag-card${chosen ? ` ag-card--${chosen}` : ""}`}>
          {/* Stitched border inset */}
          <div className="ag-stitch" aria-hidden="true" />

          {/* Watermark leaf */}
          <CannaLeafWatermark />

          <div className="ag-inner">

            {/* ── Header ── */}
            <div className="ag-header">
              <CannaLeafIcon />
              <span className="ag-wordmark">MYCANA</span>
              <h1 className="ag-title">Age Verification</h1>
              <p className="ag-sub">CANNABIS WELLNESS PLATFORM · EST. 2024</p>
            </div>

            <div className="ag-rule" />

            {/* ── Body ── */}
            <div className="ag-body">
              <p className="ag-lead">
                You must be <strong>21 years of age or older</strong> to access this platform.
              </p>
              <p className="ag-principle">
                Mycana's 21+ threshold is a <strong>moral commitment</strong>, not merely a
                legal one. The founders believe that cannabis — a powerful plant medicine and
                recreational substance — demands the full cognitive maturity that comes with
                true adulthood. <em>This standard will not change, even if the legal age is
                ever lowered to 18.</em> We hold this line because we believe it is right,
                and that belief is not negotiable.
              </p>
              <p className="ag-sso-note">
                For registered accounts, Mycana uses Google Sign-In to further restrict
                access through age-gated verification at the account level.
              </p>
            </div>

            <div className="ag-rule" />

            <p className="ag-question">Are you 21 years of age or older?</p>

            {/* ── Buttons ── */}
            <div className="ag-btns">
              <button
                className={`ag-btn ag-btn--yes${chosen === "yes" ? " ag-btn--chosen" : ""}`}
                onClick={handleYes}
                disabled={!!chosen}
                aria-label="Yes, I am 21 or older"
              >
                <span className="ag-btn__icon ag-btn__icon--check">✓</span>
                <span className="ag-btn__label">Yes, I am 21 or older</span>
                <span className="ag-btn__hint">Enter Mycana</span>
              </button>

              <button
                className={`ag-btn ag-btn--no${chosen === "no" ? " ag-btn--chosen" : ""}`}
                onClick={handleNo}
                disabled={!!chosen}
                aria-label="No, I am under 21"
              >
                <span className="ag-btn__icon ag-btn__icon--x">✕</span>
                <span className="ag-btn__label">No, I am under 21</span>
                <span className="ag-btn__hint">Exit site</span>
              </button>
            </div>

            {chosen === "yes" && (
              <p className="ag-response ag-response--yes">
                Welcome. Enjoy responsibly. 🌿
              </p>
            )}
            {chosen === "no" && (
              <p className="ag-response ag-response--no">
                Come back when you're ready. ✌️
              </p>
            )}

            <p className="ag-legal">
              By entering you confirm you are 21+ and agree to our{" "}
              <a href="/privacy" className="ag-legal__link" onClick={e => e.stopPropagation()}>
                Privacy Policy
              </a>.
            </p>

          </div>
        </div>
      </div>
    </>
  );
}

function CannaLeafIcon() {
  return (
    <svg className="ag-leaf-icon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g>
        {/* Stem */}
        <line x1="50" y1="96" x2="50" y2="58" stroke="#c8a415" strokeWidth="3" strokeLinecap="round" />
        {/* Center top leaflet */}
        <path d="M50 58 C46 44 40 22 50 8 C60 22 54 44 50 58Z" fill="#c8a415" />
        {/* Upper left */}
        <path d="M50 62 C42 53 24 44 14 54 C24 67 44 64 50 62Z" fill="#c8a415" opacity=".9" />
        {/* Upper left lower */}
        <path d="M49 67 C38 60 18 56 12 70 C22 78 42 73 49 67Z" fill="#c8a415" opacity=".75" />
        {/* Lower left */}
        <path d="M48 73 C40 70 22 70 16 82 C26 88 44 82 48 73Z" fill="#c8a415" opacity=".55" />
        {/* Upper right */}
        <path d="M50 62 C58 53 76 44 86 54 C76 67 56 64 50 62Z" fill="#c8a415" opacity=".9" />
        {/* Upper right lower */}
        <path d="M51 67 C62 60 82 56 88 70 C78 78 58 73 51 67Z" fill="#c8a415" opacity=".75" />
        {/* Lower right */}
        <path d="M52 73 C60 70 78 70 84 82 C74 88 56 82 52 73Z" fill="#c8a415" opacity=".55" />
      </g>
    </svg>
  );
}

function CannaLeafWatermark() {
  return (
    <svg className="ag-leaf-watermark" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g opacity=".07">
        <line x1="100" y1="192" x2="100" y2="110" stroke="#c8a415" strokeWidth="5" strokeLinecap="round" />
        <path d="M100 110 C92 85 78 38 100 12 C122 38 108 85 100 110Z" fill="#c8a415" />
        <path d="M100 118 C84 102 48 84 26 104 C48 132 88 126 100 118Z" fill="#c8a415" />
        <path d="M98 130 C76 118 34 110 22 136 C42 152 82 144 98 130Z" fill="#c8a415" />
        <path d="M96 144 C78 138 42 138 30 160 C50 172 84 162 96 144Z" fill="#c8a415" />
        <path d="M100 118 C116 102 152 84 174 104 C152 132 112 126 100 118Z" fill="#c8a415" />
        <path d="M102 130 C124 118 166 110 178 136 C158 152 118 144 102 130Z" fill="#c8a415" />
        <path d="M104 144 C122 138 158 138 170 160 C150 172 116 162 104 144Z" fill="#c8a415" />
      </g>
    </svg>
  );
}
