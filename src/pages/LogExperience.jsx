import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { logExperience } from "../services/experienceService.js";
import BiSlider from "../components/BiSlider.jsx";

const SLIDERS = [
  { id: "effect",         label: "Effect Direction",  leftLabel: "Relaxing",      rightLabel: "Energizing",        leftEmoji: "🌙", rightEmoji: "⚡",  leftColor: "#6d28d9", rightColor: "#f59e0b" },
  { id: "thc_sensitivity",label: "Intensity Felt",    leftLabel: "Very Mild",     rightLabel: "Very Strong",       leftEmoji: "🪶", rightEmoji: "🏔️", leftColor: "#ef4444", rightColor: "#10b981" },
  { id: "cbd_importance", label: "Balance Felt",      leftLabel: "Pure THC Feel", rightLabel: "CBD-like Calm",     leftEmoji: "🌱", rightEmoji: "💊",  leftColor: "#94a3b8", rightColor: "#0891b2" },
  { id: "anxiety",        label: "Anxiety Level",     leftLabel: "Very Anxious",  rightLabel: "Totally Calm",      leftEmoji: "😰", rightEmoji: "😌",  leftColor: "#dc2626", rightColor: "#16a34a" },
  { id: "experience",     label: "Cognitive Clarity", leftLabel: "Foggy / Hazy",  rightLabel: "Clear & Focused",   leftEmoji: "🌫️", rightEmoji: "🎯",  leftColor: "#78350f", rightColor: "#1d4ed8" },
  { id: "terpene",        label: "Flavor Experience", leftLabel: "Earthy / Musky",rightLabel: "Citrus / Fruity",   leftEmoji: "🌍", rightEmoji: "🍋",  leftColor: "#78350f", rightColor: "#f97316" },
  { id: "context",        label: "Social Energy",     leftLabel: "Introspective", rightLabel: "Social & Open",     leftEmoji: "🛋️", rightEmoji: "🎉",  leftColor: "#7c3aed", rightColor: "#ec4899" },
  { id: "purpose",        label: "Therapeutic Effect",leftLabel: "Recreational",  rightLabel: "Deeply Therapeutic",leftEmoji: "🎭", rightEmoji: "🏥",  leftColor: "#0284c7", rightColor: "#15803d" },
];

function DeltaBar({ baseline, actual }) {
  if (baseline == null) return null;
  const diff = actual - baseline;
  const absDiff = Math.abs(diff);
  const dir = diff > 0 ? "right" : "left";
  return (
    <div className="delta-bar">
      <span className="delta-bar__label">vs. your baseline:</span>
      <span className={`delta-bar__val delta-bar__val--${dir}`}>
        {diff > 0 ? `+${diff}` : diff} {absDiff >= 20 ? "🔴 significant shift" : absDiff >= 10 ? "🟡 moderate shift" : "🟢 close to baseline"}
      </span>
    </div>
  );
}

export default function LogExperience() {
  const { user, savedProfile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=product, 2=sliders, 3=notes, 4=done
  const [saving, setSaving] = useState(false);

  const [product, setProduct] = useState({
    name: "",
    strain: "",
    vendor: "",
    thcPct: "",
    cbdPct: "",
    category: "flower",
    verifiedPurchase: false,
  });

  const [sliders, setSliders] = useState(() =>
    Object.fromEntries(SLIDERS.map((s) => [s.id, savedProfile?.[s.id] ?? 50]))
  );

  const [notes, setNotes] = useState({ overall: "", effects: "", wouldBuyAgain: null, rating: 0 });

  const setSlider = (id, v) => setSliders((p) => ({ ...p, [id]: v }));

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await logExperience(user.id, {
        productName: product.name,
        strainName: product.strain,
        vendorName: product.vendor,
        category: product.category,
        thcPct: parseFloat(product.thcPct) || null,
        cbdPct: parseFloat(product.cbdPct) || null,
        verifiedPurchase: product.verifiedPurchase,
        sliderReadings: sliders,
        baselineProfile: savedProfile || null,
        notes: notes.effects,
        overallNotes: notes.overall,
        rating: notes.rating,
        wouldBuyAgain: notes.wouldBuyAgain,
        isDetailed: !!notes.effects,
      });
      setStep(4);
    } catch (err) {
      console.error("Failed to log experience", err);
      setSaving(false);
    }
  };

  if (step === 4) {
    return (
      <div className="exp-success">
        <div className="exp-success__card">
          <div className="exp-success__icon">✨</div>
          <h2>Experience Logged!</h2>
          <p>You've earned <strong>prestige points</strong> for contributing to the Mycana community.</p>
          {notes.effects && <p>Detailed reviews earn <strong>40 points</strong> — thanks for going deep.</p>}
          <div className="exp-success__actions">
            <button className="btn btn--outline" onClick={() => { setStep(1); setNotes({ overall: "", effects: "", wouldBuyAgain: null, rating: 0 }); setProduct({ name: "", strain: "", vendor: "", thcPct: "", cbdPct: "", category: "flower", verifiedPurchase: false }); }}>
              Log Another
            </button>
            <button className="btn btn--primary" onClick={() => navigate("/leaderboard")}>
              See Leaderboard →
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progress = (step / 3) * 100;

  return (
    <div className="exp-page">
      <div className="exp-header">
        <div className="exp-progress-bar">
          <div className="exp-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="container container--narrow exp-header__meta">
          <span className="exp-header__step">Step {step} of 3 — {["Product Info", "Rate Your Effects", "Notes & Rating"][step - 1]}</span>
          <span className="exp-header__pts">+{step === 3 && notes.effects ? "40" : "25"} pts on submit</span>
        </div>
      </div>

      <div className="container container--narrow exp-body">

        {/* ── Step 1: Product ── */}
        {step === 1 && (
          <div className="exp-card">
            <h2 className="exp-card__title">What Did You Try?</h2>
            <p className="exp-card__sub">Enter the product details — the more info, the more useful your data is for the community.</p>

            <div className="form-row">
              <div className="form-group">
                <label>Product Name *</label>
                <input value={product.name} onChange={(e) => setProduct((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Wedding Cake Pre-Roll" />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={product.category} onChange={(e) => setProduct((p) => ({ ...p, category: e.target.value }))}>
                  <option value="flower">Flower</option>
                  <option value="preroll">Pre-Roll</option>
                  <option value="vape">Vape / Cartridge</option>
                  <option value="edible">Edible</option>
                  <option value="concentrate">Concentrate / Dab</option>
                  <option value="tincture">Tincture</option>
                  <option value="topical">Topical</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Strain Name</label>
                <input value={product.strain} onChange={(e) => setProduct((p) => ({ ...p, strain: e.target.value }))} placeholder="e.g. Wedding Cake" />
              </div>
              <div className="form-group">
                <label>Where Did You Buy It?</label>
                <input value={product.vendor} onChange={(e) => setProduct((p) => ({ ...p, vendor: e.target.value }))} placeholder="Dispensary name" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>THC %</label>
                <input value={product.thcPct} onChange={(e) => setProduct((p) => ({ ...p, thcPct: e.target.value }))} placeholder="e.g. 22" type="number" min="0" max="100" step="0.1" />
              </div>
              <div className="form-group">
                <label>CBD %</label>
                <input value={product.cbdPct} onChange={(e) => setProduct((p) => ({ ...p, cbdPct: e.target.value }))} placeholder="e.g. 1.2" type="number" min="0" max="100" step="0.1" />
              </div>
            </div>

            <label className="checkbox-label">
              <input type="checkbox" checked={product.verifiedPurchase} onChange={(e) => setProduct((p) => ({ ...p, verifiedPurchase: e.target.checked }))} />
              <span>I purchased this from a licensed NY dispensary (+15 prestige bonus)</span>
            </label>

            <button className="btn btn--primary btn--full" onClick={() => product.name && setStep(2)} disabled={!product.name}>
              Rate the Effects →
            </button>
          </div>
        )}

        {/* ── Step 2: Scientific Sliders ── */}
        {step === 2 && (
          <div className="exp-card">
            <h2 className="exp-card__title">How Did It Make You Feel?</h2>
            <p className="exp-card__sub">
              Move each slider to where <strong>{product.name}</strong> actually landed for you right now.
              {savedProfile && " The difference from your baseline profile is shown below each slider."}
            </p>

            {savedProfile && (
              <div className="baseline-legend">
                <span className="baseline-legend__dot" /> Your baseline profile position (for reference)
              </div>
            )}

            <div className="exp-sliders">
              {SLIDERS.map((s) => (
                <div key={s.id} className="exp-slider-wrap">
                  <BiSlider
                    {...s}
                    value={sliders[s.id]}
                    onChange={(v) => setSlider(s.id, v)}
                  />
                  <DeltaBar baseline={savedProfile?.[s.id]} actual={sliders[s.id]} />
                </div>
              ))}
            </div>

            <div className="exp-nav">
              <button className="btn btn--outline" onClick={() => setStep(1)}>← Back</button>
              <button className="btn btn--primary" onClick={() => setStep(3)}>Add Notes →</button>
            </div>
          </div>
        )}

        {/* ── Step 3: Notes ── */}
        {step === 3 && (
          <div className="exp-card">
            <h2 className="exp-card__title">Final Notes</h2>
            <p className="exp-card__sub">Adding detailed notes earns you <strong>40 prestige points</strong> instead of 25 — and helps the whole community.</p>

            <div className="star-rating">
              <label>Overall Rating</label>
              <div className="stars">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} className={`star ${notes.rating >= n ? "star--on" : ""}`} onClick={() => setNotes((p) => ({ ...p, rating: n }))}>★</button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Effect Notes <span className="form-label-bonus">+15 pts bonus</span></label>
              <textarea value={notes.effects} onChange={(e) => setNotes((p) => ({ ...p, effects: e.target.value }))} placeholder="Describe how this product made you feel in detail — onset time, duration, specific effects, anything unusual…" rows={4} />
            </div>

            <div className="form-group">
              <label>Overall Notes</label>
              <textarea value={notes.overall} onChange={(e) => setNotes((p) => ({ ...p, overall: e.target.value }))} placeholder="Quality, packaging, value for money, anything else to note…" rows={3} />
            </div>

            <div className="would-buy">
              <label>Would you buy this again?</label>
              <div className="would-buy__options">
                {["Yes", "Maybe", "No"].map((o) => (
                  <button key={o} className={`would-buy__btn ${notes.wouldBuyAgain === o ? "would-buy__btn--active" : ""}`} onClick={() => setNotes((p) => ({ ...p, wouldBuyAgain: o }))}>
                    {{ Yes: "👍 Yes", Maybe: "🤔 Maybe", No: "👎 No" }[o]}
                  </button>
                ))}
              </div>
            </div>

            <div className="exp-nav">
              <button className="btn btn--outline" onClick={() => setStep(2)}>← Back</button>
              <button className="btn btn--primary" onClick={handleSubmit} disabled={saving || !notes.rating}>
                {saving ? "Saving…" : "Submit & Earn Points ✨"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
