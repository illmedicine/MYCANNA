import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { saveProfile } from "../services/userService.js";
import { logActivity } from "../services/activityService.js";
import BiSlider from "../components/BiSlider.jsx";

const QUESTIONS = [
  {
    id: "effect",
    step: 1,
    label: "Effect Direction",
    description: "When you use cannabis, what feeling are you primarily seeking?",
    leftLabel: "Deeply Relaxed",
    rightLabel: "Energized & Uplifted",
    leftEmoji: "🌙",
    rightEmoji: "⚡",
    leftColor: "#6d28d9",
    rightColor: "#f59e0b",
    leftHint: "Couch-lock, sleep, total calm",
    rightHint: "Creative energy, social spark, focus",
    defaultValue: 50,
  },
  {
    id: "thc_sensitivity",
    step: 2,
    label: "THC Sensitivity",
    description: "How strongly does THC typically affect you compared to others?",
    leftLabel: "Very Sensitive",
    rightLabel: "High Tolerance",
    leftEmoji: "🪶",
    rightEmoji: "🏔️",
    leftColor: "#ef4444",
    rightColor: "#10b981",
    leftHint: "Small amounts = strong effects",
    rightHint: "Need more to feel the effect",
    defaultValue: 50,
  },
  {
    id: "cbd_importance",
    step: 3,
    label: "CBD Priority",
    description: "How important is CBD content in your cannabis experience?",
    leftLabel: "Not a Factor",
    rightLabel: "Essential for Me",
    leftEmoji: "🌱",
    rightEmoji: "💊",
    leftColor: "#94a3b8",
    rightColor: "#0891b2",
    leftHint: "Pure THC experience is fine",
    rightHint: "CBD softens effects & reduces anxiety",
    defaultValue: 40,
  },
  {
    id: "anxiety",
    step: 4,
    label: "Anxiety Tendency",
    description: "Has cannabis ever triggered or worsened anxiety or paranoia for you?",
    leftLabel: "Often Anxious",
    rightLabel: "Never Anxious",
    leftEmoji: "😰",
    rightEmoji: "😌",
    leftColor: "#dc2626",
    rightColor: "#16a34a",
    leftHint: "Cannabis sometimes causes anxiety",
    rightHint: "Cannabis always calms me",
    defaultValue: 60,
  },
  {
    id: "experience",
    step: 5,
    label: "Experience Level",
    description: "How would you describe your overall experience with cannabis?",
    leftLabel: "Complete Beginner",
    rightLabel: "Seasoned User",
    leftEmoji: "🌱",
    rightEmoji: "🎓",
    leftColor: "#84cc16",
    rightColor: "#1d4ed8",
    leftHint: "New or returning after a long break",
    rightHint: "Years of regular use",
    defaultValue: 40,
  },
  {
    id: "terpene",
    step: 6,
    label: "Terpene Affinity",
    description: "What aroma and flavor profile appeals to you most?",
    leftLabel: "Earthy & Herbal",
    rightLabel: "Citrus & Fruity",
    leftEmoji: "🌍",
    rightEmoji: "🍋",
    leftColor: "#78350f",
    rightColor: "#f97316",
    leftHint: "Myrcene, pinene, woodsy notes",
    rightHint: "Limonene, terpinolene, bright notes",
    defaultValue: 50,
  },
  {
    id: "context",
    step: 7,
    label: "Usage Context",
    description: "Where and how do you primarily use cannabis?",
    leftLabel: "Solo & Private",
    rightLabel: "Social & Active",
    leftEmoji: "🛋️",
    rightEmoji: "🎉",
    leftColor: "#7c3aed",
    rightColor: "#ec4899",
    leftHint: "At home, unwinding, introspective",
    rightHint: "With friends, out and about, events",
    defaultValue: 45,
  },
  {
    id: "purpose",
    step: 8,
    label: "Primary Purpose",
    description: "What is the main reason you use cannabis?",
    leftLabel: "Recreational",
    rightLabel: "Therapeutic",
    leftEmoji: "🎭",
    rightEmoji: "🏥",
    leftColor: "#0284c7",
    rightColor: "#15803d",
    leftHint: "Enjoyment, fun, relaxation",
    rightHint: "Pain relief, sleep, anxiety, medical",
    defaultValue: 50,
  },
];

const CONSUMPTION_METHODS = [
  { id: "flower",       icon: "🌿", label: "Flower",       desc: "Classic, full-spectrum experience" },
  { id: "vape",         icon: "💨", label: "Vape",         desc: "Discreet, portable, fast onset" },
  { id: "edibles",      icon: "🍫", label: "Edibles",      desc: "Longer duration, no smoke" },
  { id: "concentrates", icon: "💎", label: "Concentrates", desc: "High potency, fast onset" },
  { id: "tinctures",    icon: "🧪", label: "Tinctures",    desc: "Precise dosing, sublingual" },
  { id: "topicals",     icon: "🧴", label: "Topicals",     desc: "Localized, non-psychoactive" },
];

const TOTAL_STEPS = QUESTIONS.length + 1; // 8 factors + consumption prefs

export default function Assessment() {
  const { user, savedProfile, setSavedProfile } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const [answers, setAnswers] = useState(() =>
    Object.fromEntries(
      QUESTIONS.map((q) => [q.id, savedProfile?.[q.id] ?? q.defaultValue])
    )
  );

  const [consumptionPrefs, setConsumptionPrefs] = useState(
    () => savedProfile?.consumptionPrefs ?? []
  );

  const isConsumptionStep = currentStep === QUESTIONS.length;
  const q = !isConsumptionStep ? QUESTIONS[currentStep] : null;
  const isLast = isConsumptionStep;
  const progress = ((currentStep + 1) / TOTAL_STEPS) * 100;

  const toggleMethod = (id) => {
    setConsumptionPrefs((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleNext = async () => {
    if (isLast) {
      setSaving(true);
      try {
        const fullProfile = { ...answers, consumptionPrefs };
        await saveProfile(user.id, fullProfile);
        setSavedProfile(fullProfile);
        logActivity("assessment_completed", { archetype: fullProfile.archetype ?? null });
        navigate("/dashboard");
      } catch (err) {
        console.error("Failed to save profile", err);
        setSaving(false);
      }
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => setCurrentStep((s) => s - 1);

  return (
    <div className="assessment">
      <div className="assessment__header">
        <div className="assessment__progress-bar">
          <div className="assessment__progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="assessment__meta">
          <span className="assessment__step-label">
            {isConsumptionStep
              ? "Final Step — Preferences"
              : `Question ${currentStep + 1} of ${QUESTIONS.length}`}
          </span>
          <span className="assessment__user">
            {user?.picture && (
              <img src={user.picture} alt="" className="assessment__avatar" />
            )}
            {user?.name?.split(" ")[0]}
          </span>
        </div>
      </div>

      <div className="assessment__body">

        {/* ── Slider steps 1–8 ── */}
        {!isConsumptionStep && (
          <div className="assessment__question-card">
            <div className="assessment__step-badge">Factor {q.step} of 8</div>
            <h2 className="assessment__question-title">{q.label}</h2>
            <p className="assessment__question-desc">{q.description}</p>
            <div className="assessment__slider-wrap">
              <BiSlider
                key={q.id}
                {...q}
                value={answers[q.id]}
                onChange={(v) => setAnswers((prev) => ({ ...prev, [q.id]: v }))}
              />
            </div>
            <div className="assessment__hints">
              <span className="assessment__hint assessment__hint--left">💭 {q.leftHint}</span>
              <span className="assessment__hint assessment__hint--right">💭 {q.rightHint}</span>
            </div>
          </div>
        )}

        {/* ── Consumption preference step ── */}
        {isConsumptionStep && (
          <div className="assessment__question-card">
            <div className="assessment__step-badge assessment__step-badge--pref">Your Preferences</div>
            <h2 className="assessment__question-title">How Do You Prefer to Consume?</h2>
            <p className="assessment__question-desc">
              Select all methods you use or are open to. We&apos;ll tailor product
              recommendations to your preferred formats.
            </p>
            <div className="consumption-grid">
              {CONSUMPTION_METHODS.map((m) => {
                const selected = consumptionPrefs.includes(m.id);
                return (
                  <button
                    key={m.id}
                    className={`consumption-card ${selected ? "consumption-card--selected" : ""}`}
                    onClick={() => toggleMethod(m.id)}
                    type="button"
                  >
                    <span className="consumption-card__icon">{m.icon}</span>
                    <span className="consumption-card__label">{m.label}</span>
                    <span className="consumption-card__desc">{m.desc}</span>
                    {selected && <span className="consumption-card__check">✓</span>}
                  </button>
                );
              })}
            </div>
            {consumptionPrefs.length === 0 && (
              <p className="consumption-note">Select at least one method to personalize your recommendations.</p>
            )}
          </div>
        )}

        <div className="assessment__nav">
          {currentStep > 0 && (
            <button className="btn btn--outline" onClick={handleBack} disabled={saving}>
              ← Back
            </button>
          )}
          <button
            className="btn btn--primary assessment__next-btn"
            onClick={handleNext}
            disabled={saving || (isConsumptionStep && consumptionPrefs.length === 0)}
          >
            {saving ? "Saving…" : isLast ? "✨ Calculate My Profile" : "Next →"}
          </button>
        </div>

        <div className="assessment__dots">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <button
              key={i}
              className={`assessment__dot ${i === currentStep ? "assessment__dot--active" : ""} ${i < currentStep ? "assessment__dot--done" : ""} ${i === QUESTIONS.length ? "assessment__dot--pref" : ""}`}
              onClick={() => !saving && setCurrentStep(i)}
              aria-label={i === QUESTIONS.length ? "Consumption preferences" : `Go to question ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
