import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { registerVendor } from "../services/vendorService.js";
import PayPalButton, { PAYPAL_BUTTONS } from "../components/PayPalButton.jsx";

const TIERS = [
  {
    id: "free",
    name: "Free Listing",
    price: "$0/mo",
    color: "#64748b",
    features: ["Basic store profile", "Up to 10 products", "Standard search ranking", "Community reviews"],
    buttonId: null,
  },
  {
    id: "standard",
    name: "Standard",
    price: "$49/mo",
    color: "#d4a843",
    features: ["Unlimited products", "Profile-match ranking", "Deals & menu features", "Basic analytics"],
    buttonId: PAYPAL_BUTTONS.standard,
  },
  {
    id: "premium",
    name: "Premium",
    price: "$149/mo",
    color: "#6d28d9",
    features: ["Featured placement", "Full profile analytics", "Promoted products", "Priority support", "API data access"],
    buttonId: PAYPAL_BUTTONS.premium,
  },
];

const NY_LICENSE_PATTERN = /^[A-Z0-9\-]{5,30}$/i;

export default function VendorRegister() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=info, 2=tier, 3=submitted
  const [saving, setSaving] = useState(false);
  const [selectedTier, setSelectedTier] = useState("free");
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    storeName: "",
    address: "",
    city: "",
    state: "NY",
    zip: "",
    phone: "",
    website: "",
    licenseNumber: "",
    licenseType: "adult_use",
    description: "",
    region: "WNY",
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const validateStep1 = () => {
    const e = {};
    if (!form.storeName.trim())    e.storeName = "Store name is required";
    if (!form.address.trim())      e.address = "Address is required";
    if (!form.city.trim())         e.city = "City is required";
    if (!form.zip.trim())          e.zip = "ZIP code is required";
    if (!form.phone.trim())        e.phone = "Phone number is required";
    if (!form.licenseNumber.trim()) e.licenseNumber = "License number is required";
    else if (!NY_LICENSE_PATTERN.test(form.licenseNumber))
      e.licenseNumber = "Enter a valid NY cannabis license number";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await registerVendor(user.id, { ...form, tier: selectedTier });
      setStep(3);
    } catch (err) {
      console.error("Vendor registration failed", err);
      setSaving(false);
    }
  };

  if (step === 3) {
    return (
      <div className="vr-success">
        <div className="vr-success__card">
          <div className="vr-success__icon">🎉</div>
          <h1>Application Submitted!</h1>
          <p>
            We've received your listing for <strong>{form.storeName}</strong>.
            Our team will verify your NY cannabis license and approve your listing
            within 1–2 business days.
          </p>
          <p className="vr-success__sub">
            You'll be notified at <strong>{user?.email}</strong> once approved.
          </p>
          <button className="btn btn--primary" onClick={() => navigate("/discover")}>
            Browse Local Vendors →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="vr-page">
      <div className="vr-header">
        <div className="container container--narrow">
          <span className="eyebrow eyebrow--gold">Partner with Mycana</span>
          <h1 className="vr-header__title">List Your Dispensary</h1>
          <p className="vr-header__sub">
            Connect your WNY dispensary with thousands of customers whose
            cannabis profile matches your products.
          </p>
          <div className="vr-steps">
            {["Store Info", "Choose Plan", "Go Live"].map((s, i) => (
              <div key={s} className={`vr-step ${step > i ? "vr-step--done" : ""} ${step === i + 1 ? "vr-step--active" : ""}`}>
                <div className="vr-step__n">{step > i + 1 ? "✓" : i + 1}</div>
                <span className="vr-step__label">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container container--narrow vr-body">

        {/* ── Step 1: Store Info ── */}
        {step === 1 && (
          <div className="vr-card">
            <h2 className="vr-card__title">Store Information</h2>

            <div className="form-group">
              <label>Store Name *</label>
              <input className={errors.storeName ? "input--error" : ""} value={form.storeName} onChange={(e) => set("storeName", e.target.value)} placeholder="e.g. Buffalo Green Dispensary" />
              {errors.storeName && <span className="form-error">{errors.storeName}</span>}
            </div>

            <div className="form-group">
              <label>Street Address *</label>
              <input className={errors.address ? "input--error" : ""} value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="123 Main St" />
              {errors.address && <span className="form-error">{errors.address}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City *</label>
                <input className={errors.city ? "input--error" : ""} value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Buffalo" />
                {errors.city && <span className="form-error">{errors.city}</span>}
              </div>
              <div className="form-group form-group--sm">
                <label>State</label>
                <input value="NY" disabled />
              </div>
              <div className="form-group form-group--sm">
                <label>ZIP *</label>
                <input className={errors.zip ? "input--error" : ""} value={form.zip} onChange={(e) => set("zip", e.target.value)} placeholder="14201" maxLength={5} />
                {errors.zip && <span className="form-error">{errors.zip}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone *</label>
                <input className={errors.phone ? "input--error" : ""} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="(716) 555-0100" type="tel" />
                {errors.phone && <span className="form-error">{errors.phone}</span>}
              </div>
              <div className="form-group">
                <label>Website</label>
                <input value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://yourstore.com" type="url" />
              </div>
            </div>

            <div className="form-divider">
              <span>New York State License</span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>License Number *</label>
                <input className={errors.licenseNumber ? "input--error" : ""} value={form.licenseNumber} onChange={(e) => set("licenseNumber", e.target.value.toUpperCase())} placeholder="OCM-XXXX-XXXXXX" />
                {errors.licenseNumber && <span className="form-error">{errors.licenseNumber}</span>}
              </div>
              <div className="form-group">
                <label>License Type</label>
                <select value={form.licenseType} onChange={(e) => set("licenseType", e.target.value)}>
                  <option value="adult_use">Adult Use Retail</option>
                  <option value="medical">Medical Dispensary</option>
                  <option value="delivery">Delivery Service</option>
                  <option value="cultivator">Cultivator</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Brief Description</label>
              <textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Tell customers what makes your dispensary special..." rows={3} />
            </div>

            <div className="license-notice">
              🔒 Your license number will be verified against the NY Office of Cannabis Management registry before your listing goes live.
            </div>

            <button className="btn btn--primary btn--full" onClick={handleNext}>
              Continue to Plan Selection →
            </button>
          </div>
        )}

        {/* ── Step 2: Choose Tier ── */}
        {step === 2 && (
          <div className="vr-card">
            <h2 className="vr-card__title">Choose Your Plan</h2>
            <p className="vr-card__sub">
              Profile-matched customers see Standard and Premium vendors first.
              You can upgrade anytime.
            </p>

            <div className="tier-cards">
              {TIERS.map((t) => (
                <div
                  key={t.id}
                  className={`tier-card ${selectedTier === t.id ? "tier-card--selected" : ""}`}
                  style={{ "--tier-color": t.color }}
                  onClick={() => setSelectedTier(t.id)}
                >
                  <div className="tier-card__header">
                    <div className="tier-card__radio" />
                    <div>
                      <div className="tier-card__name">{t.name}</div>
                      <div className="tier-card__price">{t.price}</div>
                    </div>
                  </div>
                  <ul className="tier-card__features">
                    {t.features.map((f) => <li key={f}>✓ {f}</li>)}
                  </ul>
                </div>
              ))}
            </div>

            {/* PayPal button for paid tiers */}
            {selectedTier !== "free" && (
              <div className="paypal-section">
                <p className="paypal-section__note">
                  Complete payment below, then click Submit — your listing will activate once your license is verified.
                </p>
                <PayPalButton
                  hostedButtonId={TIERS.find((t) => t.id === selectedTier)?.buttonId}
                  label={`Pay for ${TIERS.find((t) => t.id === selectedTier)?.name} plan`}
                />
              </div>
            )}

            <div className="vr-nav">
              <button className="btn btn--outline" onClick={() => setStep(1)}>← Back</button>
              <button className="btn btn--primary" onClick={handleSubmit} disabled={saving}>
                {saving ? "Submitting…" : "Submit Application →"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
