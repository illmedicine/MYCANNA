import { useState, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import "./FounderCalc.css";

const ADMIN_EMAILS = [
  'dwilson@illyrobotic-ai.com',
  'jcgstone@yahoo.com',
  'jcgstone@gmail.com',
  'demarkuswilsone@gmail.com',
];

const MAX_STORES     = 700;
const STANDARD_PRICE = 49;
const PREMIUM_PRICE  = 149;

function fmt(n) {
  return '$' + Math.round(n).toLocaleString();
}

export default function FounderCalc() {
  const { user, loading } = useAuth();
  const [stores,      setStores]      = useState(320);
  const [standardPct, setStandardPct] = useState(60);

  const calc = useMemo(() => {
    const premPct    = 100 - standardPct;
    const stdStores  = Math.round(stores * standardPct / 100);
    const premStores = stores - stdStores;
    const stdRev     = stdStores  * STANDARD_PRICE;
    const premRev    = premStores * PREMIUM_PRICE;
    const totalRev   = stdRev + premRev;
    const split      = totalRev / 2;
    return { premPct, stdStores, premStores, stdRev, premRev, totalRev, split };
  }, [stores, standardPct]);

  if (loading) return <div className="app-loading">🌿</div>;
  if (!user || !ADMIN_EMAILS.includes(user.email)) return <Navigate to="/" replace />;

  /* CSS custom-property trick: drives ::webkit-slider-runnable-track gradient
     without needing element.style.background or a fill div */
  const storePct = ((stores - 1) / (MAX_STORES - 1)) * 100;

  return (
    <div className="fc-pg">
      <div className="fc-wrap">

        {/* ── Title ── */}
        <div className="fc-page-title">
          <span className="fc-gold">FOUNDER</span> PARTNERSHIP REVENUE CALCULATOR
        </div>

        {/* ── Main Card ── */}
        <div className="fc-card">

          {/* Controls */}
          <div className="fc-controls">
            <div className="fc-text-center">
              <div className="fc-sect-title">TOTAL PAID NY CANNABIS STOREFRONTS ON-PLATFORM</div>
              <div className="fc-sub">
                Slider: Adjust total stores (Range: 1&ndash;{MAX_STORES}) &middot; Currently:{' '}
                <span className="fc-gold fc-bold">{stores.toLocaleString()}</span>
              </div>
            </div>

            <div className="fc-slider-wrap">
              <input
                type="range" min={1} max={MAX_STORES} value={stores}
                onChange={e => setStores(Number(e.target.value))}
                className="fc-slider fc-slider--main"
                style={{'--pct': `${storePct.toFixed(2)}%`}}
                aria-label="Total paid storefronts"
              />
              <div className="fc-ticks">
                {[1,50,100,200,300,400,500,600,700].map(t => (
                  <span key={t} style={{left:`${((t-1)/(MAX_STORES-1))*100}%`}}>{t}</span>
                ))}
              </div>
            </div>

            <div className="fc-mix-row">
              <span className="fc-mix-lbl">PLAN MIX</span>
              <span className="fc-badge fc-badge--std">
                Std {standardPct}% &middot; {calc.stdStores} stores
              </span>
              <div className="fc-mix-slider-wrap">
                <input
                  type="range" min={0} max={100} value={standardPct}
                  onChange={e => setStandardPct(Number(e.target.value))}
                  className="fc-slider fc-slider--mix"
                  style={{'--pct': `${standardPct}%`}}
                  aria-label="Standard/Premium mix"
                />
              </div>
              <span className="fc-badge fc-badge--prem">
                Prem {calc.premPct}% &middot; {calc.premStores} stores
              </span>
            </div>
          </div>

          {/* Revenue header */}
          <div className="fc-rev-header">
            <span className="fc-leaf">🌿</span>
            <span className="fc-sect-title fc-inline-block">
              STOREFRONT SUBSCRIPTION REVENUE<br/>
              <span className="fc-sub-muted">(at selected state)</span>
            </span>
            <span className="fc-leaf">🌿</span>
            <div className="fc-sub">
              Assumed Split: {standardPct}% Standard / {calc.premPct}% Premium
            </div>
          </div>

          {/* 3-column grid */}
          <div className="fc-grid">

            {/* Left column */}
            <div className="fc-col">
              <div className="fc-box">
                <div className="fc-box__title">STANDARD PLAN<br/><span className="fc-box__sub">($49/mo)</span></div>
                <div className="fc-box__stats">
                  <strong>{calc.stdStores.toLocaleString()}</strong> Stores<br/>
                  ({standardPct}% of {stores})
                </div>
                <div className="fc-box__rev">{fmt(calc.stdRev)}</div>
              </div>

              <div className="fc-box fc-box--role">
                <div className="fc-box__role-title">
                  Co-Founder · Chief Technology Officer &amp; Dev Engineer<br/>
                  <span className="fc-box__role-name">(DeMarkus D Wilson)</span>
                </div>
                <div className="fc-box__emoji">👨🏾‍🔧</div>
              </div>
            </div>

            {/* Center column */}
            <div className="fc-center">
              <div className="fc-total-lbl">
                MONTHLY TOTAL REV: <span className="fc-gold">{fmt(calc.totalRev)}</span>
              </div>
              <div className="fc-split-sub">50/50 profit split</div>

              <div className="fc-split-circle">
                <span>👨🏾‍🦲</span>
                <span>🧔🏻‍♂️</span>
              </div>

              <div className="fc-split-stats">
                <div className="fc-split-item">
                  <div className="fc-split-amt">{fmt(calc.split)}</div>
                  <div className="fc-split-nm">Dev &amp; Architecture<br/>(DeMarkus)</div>
                </div>
                <div className="fc-split-item">
                  <div className="fc-split-amt">{fmt(calc.split)}</div>
                  <div className="fc-split-nm">Sales &amp; Marketing<br/>(John)</div>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="fc-col">
              <div className="fc-box">
                <div className="fc-box__title">PREMIUM PLAN<br/><span className="fc-box__sub">($149/mo)</span></div>
                <div className="fc-box__stats">
                  <strong>{calc.premStores.toLocaleString()}</strong> Stores<br/>
                  ({calc.premPct}% of {stores})
                </div>
                <div className="fc-box__rev">{fmt(calc.premRev)}</div>
              </div>

              <div className="fc-box fc-box--role">
                <div className="fc-box__role-title">
                  Co-Founder · Chief Marketing Strategist &amp; Visionary<br/>
                  <span className="fc-box__role-name">(John C Girdlestone)</span>
                </div>
                <div className="fc-box__emoji">🧔🏻‍♂️📣</div>
              </div>
            </div>

          </div>
        </div>

        <div className="fc-footer">
          *Model calculations are simulated states and not live web elements.
        </div>

      </div>
    </div>
  );
}
