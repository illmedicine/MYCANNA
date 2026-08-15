import { useState, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { logExperience } from "../services/experienceService.js";
import { logActivity } from "../services/activityService.js";
import { lookupProduct } from "../services/productLookup.js";
import {
  scrapeLabPhotos,
  decodeQRFromImage,
  mapAIDataToProduct,
  isConfigured as aiIsConfigured,
} from "../services/aiScrape.js";
import { NY_DISPENSARIES } from "../data/nyDispensaries.js";
import BiSlider from "../components/BiSlider.jsx";

// ── Searchable NY dispensary dropdown ────────────────────────────────────────
function StorefrontDropdown({ value, onChange }) {
  const [query,  setQuery]  = useState(value || "");
  const [open,   setOpen]   = useState(false);
  const wrapRef = useRef(null);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return NY_DISPENSARIES.slice(0, 8);
    return NY_DISPENSARIES
      .filter(d => d.name.toLowerCase().includes(q))
      .slice(0, 10);
  }, [query]);

  const select = (d) => {
    setQuery(d.name);
    onChange(d.name);
    setOpen(false);
  };

  const handleBlur = () => {
    // Delay so click on option fires first
    setTimeout(() => setOpen(false), 150);
  };

  return (
    <div className="storefront-wrap" ref={wrapRef}>
      <input
        value={query}
        onChange={e => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={handleBlur}
        placeholder="Search dispensary name…"
        autoComplete="off"
      />
      {open && matches.length > 0 && (
        <ul className="storefront-list">
          {matches.map(d => (
            <li key={d.name} className="storefront-list__item" onMouseDown={() => select(d)}>
              <span className="storefront-list__name">{d.name}</span>
              <span className="storefront-list__city">{d.city}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const SLIDERS = [
  { id: "effect",          label: "Effect Direction",   leftLabel: "Relaxing",       rightLabel: "Energizing",         leftEmoji: "🌙", rightEmoji: "⚡",  leftColor: "#6d28d9", rightColor: "#f59e0b" },
  { id: "thc_sensitivity", label: "Intensity Felt",     leftLabel: "Very Mild",      rightLabel: "Very Strong",        leftEmoji: "🪶", rightEmoji: "🏔️", leftColor: "#ef4444", rightColor: "#10b981" },
  { id: "cbd_importance",  label: "Balance Felt",       leftLabel: "Pure THC Feel",  rightLabel: "CBD-like Calm",      leftEmoji: "🌱", rightEmoji: "💊",  leftColor: "#94a3b8", rightColor: "#0891b2" },
  { id: "anxiety",         label: "Anxiety Level",      leftLabel: "Very Anxious",   rightLabel: "Totally Calm",       leftEmoji: "😰", rightEmoji: "😌",  leftColor: "#dc2626", rightColor: "#16a34a" },
  { id: "experience",      label: "Cognitive Clarity",  leftLabel: "Foggy / Hazy",   rightLabel: "Clear & Focused",    leftEmoji: "🌫️", rightEmoji: "🎯",  leftColor: "#78350f", rightColor: "#1d4ed8" },
  { id: "terpene",         label: "Flavor Experience",  leftLabel: "Earthy / Musky", rightLabel: "Citrus / Fruity",    leftEmoji: "🌍", rightEmoji: "🍋",  leftColor: "#78350f", rightColor: "#f97316" },
  { id: "context",         label: "Social Energy",      leftLabel: "Introspective",  rightLabel: "Social & Open",      leftEmoji: "🛋️", rightEmoji: "🎉",  leftColor: "#7c3aed", rightColor: "#ec4899" },
  { id: "purpose",         label: "Therapeutic Effect", leftLabel: "Recreational",   rightLabel: "Deeply Therapeutic", leftEmoji: "🎭", rightEmoji: "🏥",  leftColor: "#0284c7", rightColor: "#15803d" },
];

const CATEGORIES = [
  { value: "flower",      label: "Flower" },
  { value: "preroll",     label: "Pre-Roll" },
  { value: "vape",        label: "Vape / Cart" },
  { value: "edible",      label: "Edible" },
  { value: "concentrate", label: "Concentrate" },
  { value: "tincture",    label: "Tincture" },
  { value: "topical",     label: "Topical" },
  { value: "capsule",     label: "Capsule" },
];

// ── Processing step UI ───────────────────────────────────────────────────────
const STEP_ICONS = { pending: "○", running: "⟳", done: "✓", skip: "—", error: "✕" };

function ProcessStep({ status, label, detail }) {
  return (
    <div className={`proc-step proc-step--${status}`}>
      <span className="proc-step__icon">{STEP_ICONS[status]}</span>
      <span className="proc-step__label">{label}</span>
      {detail && <span className="proc-step__detail">{detail}</span>}
    </div>
  );
}

function DeltaBar({ baseline, actual }) {
  if (baseline == null) return null;
  const diff = actual - baseline;
  const absDiff = Math.abs(diff);
  const dir = diff > 0 ? "right" : "left";
  return (
    <div className="delta-bar">
      <span className="delta-bar__label">vs. your baseline:</span>
      <span className={`delta-bar__val delta-bar__val--${dir}`}>
        {diff > 0 ? `+${diff}` : diff}{" "}
        {absDiff >= 20 ? "🔴 significant shift" : absDiff >= 10 ? "🟡 moderate shift" : "🟢 close to baseline"}
      </span>
    </div>
  );
}

function VerifiedBadge({ packageTag, sourceUrl, ocmLicense }) {
  return (
    <div className="qr-badge qr-badge--verified">
      <div className="qr-badge__icon">✅</div>
      <div className="qr-badge__content">
        <div className="qr-badge__title">NYS Licensed Product</div>
        {packageTag && <div className="qr-badge__tag">Package ID: <code>{packageTag}</code></div>}
        {ocmLicense && <div className="qr-badge__tag">OCM License: <code>{ocmLicense}</code></div>}
        {sourceUrl && (
          <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="qr-badge__link">
            View COA / Lab Results ↗
          </a>
        )}
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function LogExperience() {
  const { user, savedProfile } = useAuth();
  const navigate = useNavigate();
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const moreInputRef = useRef(null);

  // Steps: 0=photo capture, 1=product verify, 2=sliders, 3=notes, 4=done
  const [step,        setStep]        = useState(0);
  const [saving,      setSaving]      = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [ratingHint,  setRatingHint]  = useState(false);

  // Step 0 photo state
  const [photos,       setPhotos]       = useState([]);   // File[]
  const [previews,     setPreviews]     = useState([]);   // string[] (object URLs)
  const [processing,   setProcessing]   = useState(false);
  const [procSteps,    setProcSteps]    = useState([]);
  const [procProgress, setProcProgress] = useState(0);

  // Product data from scan + AI
  const [packageData, setPackageData] = useState(null);
  const [product, setProduct] = useState({
    name: "", strain: "", vendor: "", cultivator: "", storefront: "",
    thcPct: "", cbdPct: "", tacPct: "", thcvPct: "", thcMg: "",
    category: "flower",
    terpenes: [], batchNumber: "", testDate: "",
    ocmLicense: "", expirationDate: "", netWeight: "", servings: "",
    processorAddress: "", contactEmail: "",
  });

  const [sliders, setSliders] = useState(() =>
    Object.fromEntries(SLIDERS.map(s => [s.id, savedProfile?.[s.id] ?? 50]))
  );
  const [notes, setNotes] = useState({
    overall: "", effects: "", wouldBuyAgain: null, rating: 0,
  });

  const setProd    = (key, val) => setProduct(p => ({ ...p, [key]: val }));
  const setSlider  = (id, v)   => setSliders(p => ({ ...p, [id]: v }));

  // ── Photo capture helpers ──────────────────────────────────────────────────
  const addPhotos = useCallback((files) => {
    const arr = Array.from(files).filter(f => f.type.startsWith("image/")).slice(0, 4);
    if (!arr.length) return;
    setPhotos(prev => {
      const combined = [...prev, ...arr].slice(0, 4);
      setPreviews(combined.map(f => URL.createObjectURL(f)));
      return combined;
    });
  }, []);

  const removePhoto = (idx) => {
    setPhotos(prev => {
      const next = prev.filter((_, i) => i !== idx);
      setPreviews(next.map(f => URL.createObjectURL(f)));
      return next;
    });
  };

  // ── Processing pipeline ───────────────────────────────────────────────────
  const updateStep = (idx, status, detail) => {
    setProcSteps(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], status, detail };
      return next;
    });
  };

  const processPhotos = useCallback(async () => {
    if (!photos.length) return;
    setProcessing(true);
    setProcProgress(0);

    const steps = [
      { label: "Reading QR codes from photos",   status: "running", detail: "" },
      { label: "Looking up official COA data",   status: "pending", detail: "" },
      { label: "AI scanning label text",          status: "pending", detail: "" },
      { label: "Building product profile",        status: "pending", detail: "" },
    ];
    setProcSteps(steps);

    let qrUrl       = null;
    let productData = null;
    let aiData      = null;

    // ── Step 0: QR decode from images ──
    try {
      const qrResults = await Promise.all(photos.map(decodeQRFromImage));
      qrUrl = qrResults.find(Boolean) ?? null;
      updateStep(0, "done", qrUrl ? "QR detected" : "No QR found");
    } catch {
      updateStep(0, "skip", "Could not read QR");
    }
    setProcProgress(25);

    // ── Step 1: Product lookup from QR ──
    updateStep(1, "running");
    if (qrUrl) {
      try {
        const result = await lookupProduct(qrUrl);
        if (result?.valid) {
          productData = result;
          updateStep(1, "done", result.fetchedData ? "COA loaded" : "Package verified");
        } else {
          updateStep(1, "skip", "Not an NYS product QR");
        }
      } catch {
        updateStep(1, "skip", "Lookup unavailable");
      }
    } else {
      updateStep(1, "skip", "No QR to look up");
    }
    setProcProgress(50);

    // ── Step 2: AI label OCR ──
    updateStep(2, "running");
    if (aiIsConfigured()) {
      try {
        const raw = await scrapeLabPhotos(photos);
        aiData = mapAIDataToProduct(raw);

        // If AI found a QR URL in the label text and we didn't get one from image decode
        if (!qrUrl && aiData.qrUrlFromLabel) {
          qrUrl = aiData.qrUrlFromLabel;
          // Quick secondary lookup
          try {
            const r2 = await lookupProduct(qrUrl);
            if (r2?.valid) productData = r2;
          } catch { /* ignore */ }
        }

        updateStep(2, "done", `Fields extracted`);
      } catch (err) {
        if (err.message === "AI_NOT_CONFIGURED") {
          updateStep(2, "skip", "AI unavailable — check connection");
        } else {
          updateStep(2, "error", "AI couldn't read the label");
        }
      }
    } else {
      updateStep(2, "skip", "AI not configured");
    }
    setProcProgress(85);

    // ── Step 3: Merge + fill form ──
    updateStep(3, "running");

    // Merge: COA/product lookup takes precedence for scientific fields;
    // AI label scan fills everything else
    const merged = {
      name:           productData?.name        || aiData?.name        || "",
      strain:         productData?.strain      || aiData?.strain      || "",
      vendor:         productData?.vendor      || aiData?.vendor      || "",
      cultivator:     productData?.cultivator  || aiData?.cultivator  || "",
      category:       productData?.category    || aiData?.category    || "flower",
      thcPct:         productData?.thcPct != null ? String(productData.thcPct) : (aiData?.thcPct || ""),
      cbdPct:         productData?.cbdPct != null ? String(productData.cbdPct) : (aiData?.cbdPct || ""),
      terpenes:       productData?.terpenes?.length ? productData.terpenes : (aiData?.terpenes ?? []),
      batchNumber:    productData?.batchNumber || aiData?.batchNumber || "",
      testDate:       productData?.testDate    || aiData?.testDate    || "",
      netWeight:      aiData?.netWeight        || "",
      ocmLicense:     aiData?.ocmLicense       || aiData?.labLicense  || "",
      expirationDate: aiData?.expirationDate   || "",
    };

    setProduct(merged);
    setPackageData({
      packageTag:  productData?.packageTag || aiData?.packageTag || null,
      sourceUrl:   productData?.sourceUrl  || (qrUrl ?? null),
      qrVerified:  !!productData?.qrVerified,
      fetchedData: !!productData?.fetchedData,
      aiScanned:   !!aiData,
      ocmLicense:  aiData?.ocmLicense || "",
    });

    updateStep(3, "done", "Ready to review");
    setProcProgress(100);

    // Auto-advance after a short pause so user sees completed progress
    setTimeout(() => setStep(1), 800);
  }, [photos]);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!notes.rating) { setRatingHint(true); return; }
    setSubmitError("");
    setRatingHint(false);
    setSaving(true);
    try {
      await logExperience(user.id, {
        productName:     product.name,
        strainName:      product.strain,
        vendor:          product.vendor,
        storefront:      product.storefront || null,
        cultivator:      product.cultivator,
        category:        product.category,
        thcPct:          parseFloat(product.thcPct) || null,
        cbdPct:          parseFloat(product.cbdPct) || null,
        tacPct:          parseFloat(product.tacPct) || null,
        thcvPct:         parseFloat(product.thcvPct) || null,
        thcMg:           parseFloat(product.thcMg) || null,
        terpenes:        product.terpenes,
        batchNumber:     product.batchNumber,
        testDate:        product.testDate,
        ocmLicense:      product.ocmLicense,
        expirationDate:  product.expirationDate,
        netWeight:       product.netWeight || null,
        servings:        parseInt(product.servings) || null,
        packageTag:      packageData?.packageTag  ?? null,
        sourceUrl:       packageData?.sourceUrl   ?? null,
        qrVerified:      packageData?.qrVerified  ?? false,
        fetchedData:     packageData?.fetchedData ?? false,
        aiScanned:       packageData?.aiScanned   ?? false,
        sliderReadings:  sliders,
        baselineProfile: savedProfile || null,
        notes:           notes.effects,
        overallNotes:    notes.overall,
        rating:          notes.rating,
        wouldBuyAgain:   notes.wouldBuyAgain,
        isDetailed:      !!notes.effects,
      });
      logActivity("experience_logged", {
        productName: product.name || null,
        rating: notes.rating || null,
      });
      setStep(4);
    } catch (err) {
      console.error("Failed to log experience", err);
      setSubmitError("Could not save. Check your connection and try again.");
      setSaving(false);
    }
  };

  // ── Success ────────────────────────────────────────────────────────────────
  if (step === 4) {
    return (
      <div className="exp-success">
        <div className="exp-success__card">
          <div className="exp-success__icon">✨</div>
          <h2>Experience Logged!</h2>
          {packageData?.qrVerified && (
            <p className="exp-success__verified">
              🏛️ Product verified via NYS Metrc track-and-trace system.
            </p>
          )}
          <p>You&apos;ve earned <strong>prestige points</strong> for contributing scientifically traceable data.</p>
          {notes.effects && <p>Detailed notes earn <strong>40 points</strong> — thanks for going deep.</p>}
          <div className="exp-success__actions">
            <button className="btn btn--outline" onClick={() => {
              setStep(0);
              setPhotos([]); setPreviews([]); setProcessing(false); setProcSteps([]);
              setPackageData(null);
              setProduct({ name: "", strain: "", vendor: "", cultivator: "", storefront: "", thcPct: "", cbdPct: "", tacPct: "", thcvPct: "", thcMg: "", category: "flower", terpenes: [], batchNumber: "", testDate: "", ocmLicense: "", expirationDate: "", netWeight: "", servings: "", processorAddress: "", contactEmail: "" });
              setNotes({ overall: "", effects: "", wouldBuyAgain: null, rating: 0 });
            }}>Log Another</button>
            <button className="btn btn--primary" onClick={() => navigate("/dashboard")}>My Dashboard →</button>
          </div>
        </div>
      </div>
    );
  }

  const STEP_LABELS = ["Scan Product", "Verify Details", "Rate Effects", "Notes & Rating"];
  const progress = step === 0 ? 0 : (step / 3) * 100;

  return (
    <div className="exp-page">

      {/* ── Progress bar ── */}
      {step > 0 && (
        <div className="exp-header">
          <div className="exp-progress-bar">
            <div className="exp-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="container container--narrow exp-header__meta">
            <span className="exp-header__step">Step {step} of 3 — {STEP_LABELS[step]}</span>
            <span className="exp-header__pts">+{step === 3 && notes.effects ? "40" : "25"} pts on submit</span>
          </div>
        </div>
      )}

      <div className={step === 0 ? "exp-scan-wrapper" : "container container--narrow exp-body"}>

        {/* ══════════════════════════════════════════
            STEP 0: Photo capture
        ══════════════════════════════════════════ */}
        {step === 0 && !processing && (
          <div className="photo-capture">
            <div className="photo-capture__header">
              <h2 className="photo-capture__title">📸 Photograph Your Product</h2>
              <p className="photo-capture__sub">
                Take a photo of the label — AI will auto-fill all product data and pull the lab results.
                {!aiIsConfigured() && (
                  <span className="photo-capture__ai-note"> Sign in to enable AI label scanning.</span>
                )}
              </p>
            </div>

            {/* Photo previews */}
            {previews.length > 0 && (
              <div className="photo-capture__previews">
                {previews.map((src, i) => (
                  <div key={i} className="photo-thumb">
                    <img src={src} alt={`Label photo ${i + 1}`} className="photo-thumb__img" />
                    <button className="photo-thumb__remove" onClick={() => removePhoto(i)} aria-label="Remove">✕</button>
                  </div>
                ))}
                {previews.length < 4 && (
                  <button className="photo-thumb photo-thumb--add" onClick={() => moreInputRef.current?.click()}>
                    <span>＋</span>
                    <span>Add photo</span>
                    <input ref={moreInputRef} type="file" accept="image/*" multiple style={{ display: "none" }}
                      onChange={e => addPhotos(e.target.files)} />
                  </button>
                )}
              </div>
            )}

            {/* Primary capture buttons */}
            {previews.length === 0 && (
              <div className="photo-capture__btns">
                <button className="photo-btn photo-btn--camera" onClick={() => cameraInputRef.current?.click()}>
                  <span className="photo-btn__icon">📷</span>
                  <span className="photo-btn__label">Take Photo</span>
                  <span className="photo-btn__sub">Opens camera</span>
                  <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }}
                    onChange={e => addPhotos(e.target.files)} />
                </button>
                <button className="photo-btn photo-btn--gallery" onClick={() => galleryInputRef.current?.click()}>
                  <span className="photo-btn__icon">🖼️</span>
                  <span className="photo-btn__label">Upload Photo</span>
                  <span className="photo-btn__sub">From gallery</span>
                  <input ref={galleryInputRef} type="file" accept="image/*" multiple style={{ display: "none" }}
                    onChange={e => addPhotos(e.target.files)} />
                </button>
              </div>
            )}

            {/* Tip for multi-photo */}
            {previews.length > 0 && (
              <p className="photo-capture__tip">
                💡 Add a second photo if the front and back labels are separate.
              </p>
            )}

            {/* Process button */}
            {previews.length > 0 && (
              <button className="btn btn--primary btn--lg photo-capture__process" onClick={processPhotos}>
                Analyze Label{photos.length > 1 ? "s" : ""} →
              </button>
            )}

            <div className="photo-capture__divider">or</div>
            <button className="btn btn--outline photo-capture__skip" onClick={() => setStep(1)}>
              Skip — I&apos;ll enter details manually
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════
            STEP 0: Processing animation
        ══════════════════════════════════════════ */}
        {step === 0 && processing && (
          <div className="proc-screen">
            <div className="proc-screen__card">
              <h2 className="proc-screen__title">Analyzing Your Product</h2>
              <p className="proc-screen__sub">Sit tight — this takes about 5–10 seconds</p>

              {/* Animated progress bar */}
              <div className="proc-bar">
                <div
                  className="proc-bar__fill"
                  style={{ width: `${procProgress}%`, transition: "width 0.6s ease" }}
                />
              </div>

              {/* Step-by-step status */}
              <div className="proc-steps">
                {procSteps.map((s, i) => (
                  <ProcessStep key={i} status={s.status} label={s.label} detail={s.detail} />
                ))}
              </div>

              {/* Photo thumbnails (small) */}
              <div className="proc-screen__thumbs">
                {previews.map((src, i) => (
                  <img key={i} src={src} alt="" className="proc-screen__thumb" />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            STEP 1: Verify product details
        ══════════════════════════════════════════ */}
        {step === 1 && (
          <div className="exp-card">
            <h2 className="exp-card__title">Verify Product Details</h2>
            <p className="exp-card__sub">
              {packageData?.aiScanned
                ? "Fields auto-filled from your photo — review and correct anything that looks off."
                : "Enter the product details from your package label."}
            </p>

            {(packageData?.packageTag || packageData?.ocmLicense || packageData?.sourceUrl) && (
              <VerifiedBadge
                packageTag={packageData.packageTag}
                sourceUrl={packageData.sourceUrl}
                ocmLicense={packageData.ocmLicense || product.ocmLicense}
              />
            )}

            {packageData?.aiScanned && (
              <div className="ai-scrape-success">✓ Label read by AI — review the fields below</div>
            )}

            {/* ── Always required ── */}
            <div className="form-row">
              <div className="form-group">
                <label>Product Name <span className="req">*</span></label>
                <input value={product.name} onChange={e => setProd("name", e.target.value)} placeholder="e.g. Holiday" />
              </div>
              <div className="form-group">
                <label>Category <span className="req">*</span></label>
                <select value={product.category} onChange={e => setProd("category", e.target.value)}>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Strain / Flavor Name <span className="req">*</span></label>
                <input value={product.strain} onChange={e => setProd("strain", e.target.value)} placeholder="e.g. Coffee Break" />
              </div>
              <div className="form-group">
                <label>Dispensary / Vendor</label>
                <input value={product.vendor} onChange={e => setProd("vendor", e.target.value)} placeholder="Brand or vendor name" />
              </div>
            </div>

            {/* ── Storefront (always shown, manual) ── */}
            <div className="form-group">
              <label>Storefront <span className="req">*</span> <span className="form-label-bonus">Where was it purchased?</span></label>
              <StorefrontDropdown
                value={product.storefront}
                onChange={v => setProd("storefront", v)}
              />
            </div>

            {/* ── Conditional: THC / CBD (show if AI found either) ── */}
            {(product.thcPct || product.cbdPct) && (
              <div className="form-row">
                <div className="form-group">
                  <label>THC %</label>
                  <input value={product.thcPct} onChange={e => setProd("thcPct", e.target.value)}
                    placeholder="e.g. 28.5" type="number" min="0" max="100" step="0.01" />
                </div>
                <div className="form-group">
                  <label>CBD %</label>
                  <input value={product.cbdPct} onChange={e => setProd("cbdPct", e.target.value)}
                    placeholder="e.g. 1.2" type="number" min="0" max="100" step="0.01" />
                </div>
              </div>
            )}
            {/* Allow manual THC entry if AI didn't find it */}
            {!product.thcPct && !product.cbdPct && (
              <div className="form-row">
                <div className="form-group">
                  <label>THC %</label>
                  <input value={product.thcPct} onChange={e => setProd("thcPct", e.target.value)}
                    placeholder="e.g. 28.5" type="number" min="0" max="100" step="0.01" />
                </div>
                <div className="form-group">
                  <label>CBD %</label>
                  <input value={product.cbdPct} onChange={e => setProd("cbdPct", e.target.value)}
                    placeholder="e.g. 1.2" type="number" min="0" max="100" step="0.01" />
                </div>
              </div>
            )}

            {/* ── Conditional extras (only if AI populated) ── */}
            {(product.tacPct || product.thcvPct || product.thcMg) && (
              <div className="form-row">
                {product.tacPct && (
                  <div className="form-group">
                    <label>TAC %</label>
                    <input value={product.tacPct} onChange={e => setProd("tacPct", e.target.value)}
                      type="number" min="0" max="100" step="0.01" />
                  </div>
                )}
                {product.thcMg && (
                  <div className="form-group">
                    <label>THC (mg)</label>
                    <input value={product.thcMg} onChange={e => setProd("thcMg", e.target.value)}
                      type="number" min="0" step="0.01" />
                  </div>
                )}
              </div>
            )}

            {product.cultivator && (
              <div className="form-row">
                <div className="form-group">
                  <label>Cultivator / Manufacturer</label>
                  <input value={product.cultivator} onChange={e => setProd("cultivator", e.target.value)}
                    placeholder="Grower or processor name" />
                </div>
                {product.batchNumber && (
                  <div className="form-group">
                    <label>Batch / Lot #</label>
                    <input value={product.batchNumber} onChange={e => setProd("batchNumber", e.target.value)} />
                  </div>
                )}
              </div>
            )}

            {!product.cultivator && product.batchNumber && (
              <div className="form-group">
                <label>Batch / Lot #</label>
                <input value={product.batchNumber} onChange={e => setProd("batchNumber", e.target.value)} />
              </div>
            )}

            {(product.ocmLicense || product.expirationDate) && (
              <div className="form-row">
                {product.ocmLicense && (
                  <div className="form-group">
                    <label>OCM License #</label>
                    <input value={product.ocmLicense} onChange={e => setProd("ocmLicense", e.target.value)} />
                  </div>
                )}
                {product.expirationDate && (
                  <div className="form-group">
                    <label>Expiration Date</label>
                    <input value={product.expirationDate} onChange={e => setProd("expirationDate", e.target.value)}
                      placeholder="MM/DD/YYYY" />
                  </div>
                )}
              </div>
            )}

            {(product.netWeight || product.servings) && (
              <div className="form-row">
                {product.netWeight && (
                  <div className="form-group">
                    <label>Net Weight</label>
                    <input value={product.netWeight} onChange={e => setProd("netWeight", e.target.value)} />
                  </div>
                )}
                {product.servings && (
                  <div className="form-group">
                    <label>Servings</label>
                    <input value={product.servings} onChange={e => setProd("servings", e.target.value)} type="number" min="1" />
                  </div>
                )}
              </div>
            )}

            {product.terpenes?.length > 0 && (
              <div className="form-group">
                <label>Terpene Profile <span className="form-label-bonus">from COA</span></label>
                <div className="terpene-chips">
                  {product.terpenes.map(t => <span key={t} className="terpene-chip">{t}</span>)}
                </div>
              </div>
            )}

            <div className="exp-nav">
              <button className="btn btn--outline" onClick={() => { setProcessing(false); setStep(0); }}>← Retake</button>
              <button className="btn btn--primary" onClick={() => setStep(2)} disabled={!product.name}>
                Rate Effects →
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            STEP 2: Scientific sliders
        ══════════════════════════════════════════ */}
        {step === 2 && (
          <div className="exp-card">
            <h2 className="exp-card__title">How Did It Make You Feel?</h2>
            <p className="exp-card__sub">
              Slide each bar to where <strong>{product.name || "this product"}</strong> actually landed for you.
              {savedProfile && " Your baseline is shown for comparison."}
            </p>
            {savedProfile && (
              <div className="baseline-legend">
                <span className="baseline-legend__dot" /> Your baseline profile position
              </div>
            )}
            <div className="exp-sliders">
              {SLIDERS.map(s => (
                <div key={s.id} className="exp-slider-wrap">
                  <BiSlider {...s} value={sliders[s.id]} onChange={v => setSlider(s.id, v)} />
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

        {/* ══════════════════════════════════════════
            STEP 3: Notes + rating
        ══════════════════════════════════════════ */}
        {step === 3 && (
          <div className="exp-card">
            <h2 className="exp-card__title">Final Notes</h2>
            <p className="exp-card__sub">
              Detailed notes earn <strong>40 prestige points</strong> and contribute to our scientific dataset.
            </p>

            <div className="star-rating">
              <label>Overall Rating <span style={{ color: "#ef4444", fontWeight: 700 }}>*</span></label>
              <div className="stars">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} className={`star ${notes.rating >= n ? "star--on" : ""}`}
                    onClick={() => { setNotes(p => ({ ...p, rating: n })); setRatingHint(false); }}>★</button>
                ))}
              </div>
              {ratingHint && <p style={{ color: "#ef4444", fontSize: ".82rem", marginTop: 6 }}>Please select a star rating.</p>}
            </div>

            <div className="form-group">
              <label>Effect Notes <span className="form-label-bonus">+15 pts bonus</span></label>
              <textarea
                value={notes.effects}
                onChange={e => setNotes(p => ({ ...p, effects: e.target.value }))}
                placeholder="Describe how this product made you feel — onset time, duration, specific effects…"
                rows={4}
              />
            </div>

            <div className="form-group">
              <label>Overall Notes</label>
              <textarea
                value={notes.overall}
                onChange={e => setNotes(p => ({ ...p, overall: e.target.value }))}
                placeholder="Quality, packaging, value, anything else…"
                rows={3}
              />
            </div>

            <div className="would-buy">
              <label>Would you buy this again?</label>
              <div className="would-buy__options">
                {["Yes", "Maybe", "No"].map(o => (
                  <button key={o}
                    className={`would-buy__btn ${notes.wouldBuyAgain === o ? "would-buy__btn--active" : ""}`}
                    onClick={() => setNotes(p => ({ ...p, wouldBuyAgain: o }))}>
                    {{ Yes: "👍 Yes", Maybe: "🤔 Maybe", No: "👎 No" }[o]}
                  </button>
                ))}
              </div>
            </div>

            {submitError && (
              <p style={{ color: "#ef4444", fontSize: ".82rem", marginTop: 8, textAlign: "center" }}>{submitError}</p>
            )}
            <div className="exp-nav">
              <button className="btn btn--outline" onClick={() => setStep(2)}>← Back</button>
              <button className="btn btn--primary" onClick={handleSubmit} disabled={saving}>
                {saving ? "Saving…" : "Submit & Earn Points ✨"}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
