import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import BiSlider from "../components/BiSlider.jsx";

const METHOD_GUIDANCE = {
  flower: {
    icon: "🌿", label: "Flower",
    tips: (a) => [
      `Look for strains with ${a.terpene < 40 ? "myrcene and caryophyllene" : "limonene and terpinolene"} in the terpene profile.`,
      a.thc_sensitivity < 45
        ? "Stick to 10–18% THC flower and avoid anything marketed primarily on potency."
        : "You can explore higher-THC cultivars — focus on terpene complexity over raw percentage.",
      a.purpose > 55 ? "Ask your budtender about therapeutic strains with specific cannabinoid ratios." : "Seek out craft or small-batch genetics for a more nuanced experience.",
    ],
  },
  vape: {
    icon: "💨", label: "Vape",
    tips: (a) => [
      "Choose live resin or full-spectrum oil cartridges to preserve the terpene profile that matches your preferences.",
      a.anxiety < 40 ? "Avoid distillate-only carts — the isolated THC can amplify anxiety without natural terpene balance." : "Distillate or full-spectrum both work for you. Look for hardware with temperature control.",
      "Start with 1–2 second draws. Vape onset is fast — wait 5 minutes before taking more.",
    ],
  },
  edibles: {
    icon: "🍫", label: "Edibles",
    tips: (a) => [
      a.thc_sensitivity < 45
        ? "Start with 2.5–5mg THC max. Edibles metabolize through the liver and hit much harder than inhaled cannabis."
        : "5–10mg is a reasonable starting dose. Always wait a full 2 hours before considering more.",
      "Choose nano-emulsion or fast-acting formats if onset time matters — they activate in 15–45 minutes vs. 1–2 hours.",
      a.anxiety < 40 ? "High-CBD edibles (1:1 or 2:1 CBD:THC) are strongly recommended to reduce anxiety risk." : "Any THC:CBD ratio should work well for you. Focus on quality ingredients and accurate lab dosing.",
    ],
  },
  concentrates: {
    icon: "💎", label: "Concentrates",
    tips: (a) => [
      a.experience < 50
        ? "⚠️ Concentrates are very high potency. Build your tolerance with flower or vape first before exploring dabs or wax."
        : "Rosin and live resin concentrates preserve the full terpene profile. Ideal if you're chasing specific effects.",
      "Low-temperature dabbing (below 450°F / 232°C) retains terpenes and produces a smoother, more flavorful experience.",
      "Start with a rice-grain-sized amount. Effects are near-immediate and significantly stronger than flower.",
    ],
  },
  tinctures: {
    icon: "🧪", label: "Tinctures",
    tips: (a) => [
      "Sublingual (under the tongue) dosing activates in 15–45 minutes. Hold for 60–90 seconds before swallowing.",
      a.thc_sensitivity < 45
        ? `Start with 1–2.5mg THC per dose. Tinctures allow precise control — your sensitivity makes this the ideal format.`
        : "A 5–10mg starting dose gives you good control. Tinctures are excellent for dialing in your exact sweet spot.",
      "Look for a 1:1 CBD:THC ratio if therapeutic relief is your primary goal — the CBD amplifies benefits and smooths the experience.",
    ],
  },
  topicals: {
    icon: "🧴", label: "Topicals",
    tips: () => [
      "Topicals do not enter the bloodstream and produce no psychoactive effect — ideal for localized pain, inflammation, or skin conditions.",
      "Transdermal patches are a different category — they do cross the bloodstream and will produce systemic effects.",
      "Look for formulations with menthol or arnica for added pain relief, or CBD-dominant topicals for anti-inflammatory benefit.",
    ],
  },
};

function deriveProfile(answers) {
  const { effect, thc_sensitivity, cbd_importance, anxiety, experience, terpene, context, purpose, consumptionPrefs = [] } = answers;

  let archetype, archetypeEmoji, archetypeSub;
  if (anxiety < 35 && thc_sensitivity < 40) {
    archetype = "The Gentle Healer";
    archetypeEmoji = "🌸";
    archetypeSub = "You need gentle, balanced products. High CBD, low THC, calming terpenes.";
  } else if (effect > 65 && experience > 55) {
    archetype = "The Creative Explorer";
    archetypeEmoji = "🚀";
    archetypeSub = "You chase inspiration and energy. Sativa-leaning, terpene-forward, mid-to-high potency.";
  } else if (effect < 35 && purpose > 55) {
    archetype = "The Restful Restorer";
    archetypeEmoji = "🌙";
    archetypeSub = "Sleep, pain relief, and deep relaxation are your goals. Indica-dominant, myrcene-rich.";
  } else if (context > 60 && effect > 50) {
    archetype = "The Social Connector";
    archetypeEmoji = "🎉";
    archetypeSub = "You thrive socially with cannabis. Uplifting hybrids and citrus terpenes are your match.";
  } else if (experience > 65 && thc_sensitivity > 60) {
    archetype = "The Connoisseur";
    archetypeEmoji = "🎓";
    archetypeSub = "You're experienced and discerning. Terpene complexity and craft genetics excite you.";
  } else {
    archetype = "The Balanced Seeker";
    archetypeEmoji = "⚖️";
    archetypeSub = "You value versatility and balance. Well-rounded hybrids with moderate potency suit you best.";
  }

  const terpenes = [];
  if (terpene < 40) {
    terpenes.push({ name: "Myrcene", desc: "Earthy, musky — deeply relaxing", emoji: "🌿" });
    terpenes.push({ name: "Beta-Caryophyllene", desc: "Peppery — anti-anxiety, anti-inflammatory", emoji: "🌶️" });
  } else {
    terpenes.push({ name: "Limonene", desc: "Citrusy — mood-elevating, stress relief", emoji: "🍋" });
    terpenes.push({ name: "Terpinolene", desc: "Floral and fruity — uplifting, energizing", emoji: "🌺" });
  }
  if (anxiety < 45) terpenes.push({ name: "Linalool", desc: "Lavender — calming, anti-anxiety", emoji: "💜" });
  if (effect > 55) terpenes.push({ name: "Pinene", desc: "Pine — alertness, mental clarity", emoji: "🌲" });

  let potencyGuide;
  if (thc_sensitivity < 30)      potencyGuide = "Start with 5–10% THC max. Even small amounts are powerful for you.";
  else if (thc_sensitivity < 50) potencyGuide = "10–18% THC is your sweet spot. Avoid very high-potency products.";
  else if (thc_sensitivity < 70) potencyGuide = "18–25% THC works well for you. Experiment within this range.";
  else                           potencyGuide = "25%+ THC is appropriate for your tolerance. Focus on strain quality over raw potency.";

  let cbdGuide;
  if (cbd_importance > 60)      cbdGuide = "Prioritize a 1:1 or 2:1 CBD:THC ratio. CBD will meaningfully improve your experience.";
  else if (cbd_importance > 35) cbdGuide = "A small CBD presence (5–10%) is beneficial for softening harsh effects.";
  else                          cbdGuide = "Pure THC strains are fine for you — CBD is optional but never harmful.";

  const avoid = [];
  if (anxiety < 40) avoid.push("Very high THC (>25%) without CBD");
  if (anxiety < 40) avoid.push("THCV-dominant strains (can amplify anxiety)");
  if (effect < 40 && context > 55) avoid.push("Heavy indicas before social activities");
  if (experience < 35) avoid.push("Concentrates, dabs, or ultra-high potency products");
  if (thc_sensitivity < 40) avoid.push("Edibles without precise dosing information");
  if (experience < 40 && consumptionPrefs.includes("concentrates"))
    avoid.push("Concentrates selected — build tolerance with flower or vape first");
  if (thc_sensitivity < 35 && consumptionPrefs.includes("edibles"))
    avoid.push("Edibles with your sensitivity: always start at 2.5mg and wait the full 2 hours");

  // Build format guidance for selected methods
  const formatGuidance = consumptionPrefs
    .filter((id) => METHOD_GUIDANCE[id])
    .map((id) => ({
      id,
      ...METHOD_GUIDANCE[id],
      tips: METHOD_GUIDANCE[id].tips({ effect, thc_sensitivity, cbd_importance, anxiety, experience, terpene, context, purpose }),
    }));

  return { archetype, archetypeEmoji, archetypeSub, terpenes, potencyGuide, cbdGuide, avoid, formatGuidance, consumptionPrefs };
}

const SLIDER_META = [
  { id: "effect",          label: "Effect Direction",  leftLabel: "Relaxing",       rightLabel: "Energizing",          leftEmoji: "🌙", rightEmoji: "⚡",  leftColor: "#6d28d9", rightColor: "#f59e0b" },
  { id: "thc_sensitivity", label: "THC Sensitivity",   leftLabel: "Very Sensitive",  rightLabel: "High Tolerance",      leftEmoji: "🪶", rightEmoji: "🏔️", leftColor: "#ef4444", rightColor: "#10b981" },
  { id: "cbd_importance",  label: "CBD Priority",      leftLabel: "Not a Factor",    rightLabel: "Essential",           leftEmoji: "🌱", rightEmoji: "💊",  leftColor: "#94a3b8", rightColor: "#0891b2" },
  { id: "anxiety",         label: "Anxiety Tendency",  leftLabel: "Anxiety-Prone",   rightLabel: "Anxiety-Resistant",   leftEmoji: "😰", rightEmoji: "😌",  leftColor: "#dc2626", rightColor: "#16a34a" },
  { id: "experience",      label: "Experience Level",  leftLabel: "Beginner",        rightLabel: "Seasoned",            leftEmoji: "🌱", rightEmoji: "🎓",  leftColor: "#84cc16", rightColor: "#1d4ed8" },
  { id: "terpene",         label: "Terpene Affinity",  leftLabel: "Earthy",          rightLabel: "Citrus & Fruity",     leftEmoji: "🌍", rightEmoji: "🍋",  leftColor: "#78350f", rightColor: "#f97316" },
  { id: "context",         label: "Usage Context",     leftLabel: "Solo & Private",  rightLabel: "Social & Active",     leftEmoji: "🛋️", rightEmoji: "🎉",  leftColor: "#7c3aed", rightColor: "#ec4899" },
  { id: "purpose",         label: "Primary Purpose",   leftLabel: "Recreational",    rightLabel: "Therapeutic",         leftEmoji: "🎭", rightEmoji: "🏥",  leftColor: "#0284c7", rightColor: "#15803d" },
];

export default function Profile() {
  const { user, savedProfile } = useAuth();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState(savedProfile);

  // savedProfile arrives from AuthContext Firestore load; wait for it
  useEffect(() => {
    if (savedProfile) {
      setAnswers(savedProfile);
    } else if (savedProfile === null) {
      // Firestore returned no profile — send them to assessment
      navigate("/assessment");
    }
  }, [savedProfile, navigate]);

  if (!answers) {
    return <div className="app-loading">🌿</div>;
  }

  const profile = deriveProfile(answers);

  return (
    <div className="profile-page">
      <div className="profile-hero">
        <div className="profile-hero__bg" />
        <div className="profile-hero__content">
          {user?.picture && (
            <img src={user.picture} alt={user.name} className="profile-hero__avatar" />
          )}
          <p className="profile-hero__greeting">{user?.name?.split(" ")[0]}'s Cannabis Profile</p>
          <div className="profile-hero__archetype">
            <span className="profile-hero__emoji">{profile.archetypeEmoji}</span>
            <h1 className="profile-hero__title">{profile.archetype}</h1>
          </div>
          <p className="profile-hero__sub">{profile.archetypeSub}</p>
        </div>
      </div>

      <div className="profile-body container container--narrow">

        <section className="profile-section">
          <h2 className="profile-section__title">🌿 Your Terpene Matches</h2>
          <div className="terpene-grid">
            {profile.terpenes.map((t) => (
              <div key={t.name} className="terpene-card">
                <span className="terpene-card__emoji">{t.emoji}</span>
                <strong className="terpene-card__name">{t.name}</strong>
                <p className="terpene-card__desc">{t.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="profile-section">
          <h2 className="profile-section__title">⚗️ Potency Guidance</h2>
          <div className="guide-card guide-card--thc">
            <span className="guide-card__icon">🔬</span>
            <div>
              <strong>THC Level</strong>
              <p>{profile.potencyGuide}</p>
            </div>
          </div>
          <div className="guide-card guide-card--cbd">
            <span className="guide-card__icon">🌿</span>
            <div>
              <strong>CBD Approach</strong>
              <p>{profile.cbdGuide}</p>
            </div>
          </div>
        </section>

        {profile.formatGuidance.length > 0 && (
          <section className="profile-section">
            <h2 className="profile-section__title">🎯 Your Recommended Formats</h2>
            <p className="profile-section__sub">
              Personalized tips for your preferred consumption methods, matched to your profile.
            </p>
            <div className="format-guidance">
              {profile.formatGuidance.map((f) => (
                <div key={f.id} className="format-card">
                  <div className="format-card__header">
                    <span className="format-card__icon">{f.icon}</span>
                    <strong className="format-card__label">{f.label}</strong>
                  </div>
                  <ul className="format-card__tips">
                    {f.tips.map((tip, i) => (
                      <li key={i} className={tip.startsWith("⚠️") ? "format-tip format-tip--warn" : "format-tip"}>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <button
              className="btn btn--outline btn--sm format-edit-btn"
              onClick={() => navigate("/assessment")}
            >
              ✏️ Update Preferences
            </button>
          </section>
        )}

        {profile.avoid.length > 0 && (
          <section className="profile-section">
            <h2 className="profile-section__title">⚠️ What to Avoid</h2>
            <ul className="avoid-list">
              {profile.avoid.map((a) => (
                <li key={a} className="avoid-item">
                  <span className="avoid-item__icon">✕</span>
                  {a}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="profile-section">
          <h2 className="profile-section__title">🎛️ Your Full Profile Snapshot</h2>
          <div className="snapshot-sliders">
            {SLIDER_META.map((q) => (
              <BiSlider key={q.id} {...q} value={answers[q.id]} readonly />
            ))}
          </div>
        </section>

        <div className="profile-actions">
          <button className="btn btn--outline" onClick={() => navigate("/assessment")}>
            Retake Assessment
          </button>
          <button className="btn btn--primary" onClick={() => window.print()}>
            Save Profile
          </button>
        </div>

        <p className="profile-disclaimer">
          Mycana profiles are educational tools only and do not constitute medical advice.
          Consult a healthcare professional regarding any medical conditions.
        </p>
      </div>
    </div>
  );
}
