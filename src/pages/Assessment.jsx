import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { saveProfile } from "../services/userService.js";
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

export default function Assessment() {
  const { user, savedProfile, setSavedProfile } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Pre-fill from any existing Firestore profile
  const [answers, setAnswers] = useState(() =>
    Object.fromEntries(
      QUESTIONS.map((q) => [q.id, savedProfile?.[q.id] ?? q.defaultValue])
    )
  );

  const q = QUESTIONS[currentStep];
  const isLast = currentStep === QUESTIONS.length - 1;
  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;

  const handleNext = async () => {
    if (isLast) {
      setSaving(true);
      try {
        await saveProfile(user.id, answers);
        setSavedProfile(answers); // update context so Profile page has it immediately
        navigate("/profile");
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
            Question {currentStep + 1} of {QUESTIONS.length}
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
        <div className="assessment__question-card">
          <div className="assessment__step-badge">Factor {q.step} of 8</div>
          <h2 className="assessment__question-title">{q.label}</h2>
          <p className="assessment__question-desc">{q.description}</p>

          <div className="assessment__slider-wrap">
            <BiSlider
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

        <div className="assessment__nav">
          {currentStep > 0 && (
            <button className="btn btn--outline" onClick={handleBack} disabled={saving}>
              ← Back
            </button>
          )}
          <button
            className="btn btn--primary assessment__next-btn"
            onClick={handleNext}
            disabled={saving}
          >
            {saving ? "Saving…" : isLast ? "✨ Calculate My Profile" : "Next →"}
          </button>
        </div>

        <div className="assessment__dots">
          {QUESTIONS.map((_, i) => (
            <button
              key={i}
              className={`assessment__dot ${i === currentStep ? "assessment__dot--active" : ""} ${i < currentStep ? "assessment__dot--done" : ""}`}
              onClick={() => !saving && setCurrentStep(i)}
              aria-label={`Go to question ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
