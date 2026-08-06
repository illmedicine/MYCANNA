import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import BodyViz from "../components/BodyViz.jsx";
import { getUserExperiences } from "../services/experienceService.js";
import { saveHealthData, getHealthData } from "../services/userService.js";
import { getUserPrestige } from "../services/prestigeService.js";

// ── Medical conditions ───────────────────────────────────────────────────────
const MEDICAL_CONDITIONS = [
  "Anxiety Disorder","Generalized Anxiety (GAD)","Social Anxiety","Panic Disorder",
  "Depression","Bipolar Disorder","PTSD","ADHD / ADD",
  "Chronic Pain","Neuropathic Pain","Back Pain / Spinal Issues","Fibromyalgia",
  "Arthritis","Rheumatoid Arthritis","Osteoarthritis","Gout",
  "Insomnia / Sleep Disorder","Sleep Apnea",
  "Multiple Sclerosis","Parkinson's Disease","Epilepsy / Seizure Disorder","ALS",
  "Migraine / Chronic Headaches","Cluster Headaches",
  "Crohn's Disease","Ulcerative Colitis","IBS (Irritable Bowel Syndrome)","Celiac Disease",
  "Cancer","Chemotherapy-related Nausea","Cachexia / Wasting Syndrome",
  "Glaucoma","Lupus","Psoriasis","Eczema",
  "Diabetes (Type 1)","Diabetes (Type 2)",
  "HIV/AIDS","Hepatitis C",
  "Tourette Syndrome","Autism Spectrum Disorder",
  "Endometriosis","PCOS","Menstrual Pain / Dysmenorrhea",
  "Hypertension","Cardiovascular Disease",
  "Opioid Use Disorder / Substance Recovery",
  "Anorexia / Eating Disorder",
  "TBI (Traumatic Brain Injury)","Muscle Spasms / Spasticity",
  "Post-surgical / Acute Pain","Nausea / Vomiting",
  "Palliative / End-of-Life Care","Alzheimer's / Dementia",
];

const CATEGORY_ICONS = {
  flower: "🌿", vape: "💨", edible: "🍫", edibles: "🍫",
  concentrate: "💎", concentrates: "💎", tincture: "🧪", tinctures: "🧪",
  topical: "🧴", topicals: "🧴", capsule: "💊", pre_roll: "🚬",
};

const PRESTIGE_LEVELS = [
  { min: 0,    label: "Seedling",   color: "#86efac" },
  { min: 100,  label: "Sprout",     color: "#4ade80" },
  { min: 300,  label: "Cultivar",   color: "#22c55e" },
  { min: 600,  label: "Curator",    color: "#16a34a" },
  { min: 1000, label: "Connoisseur",color: "#15803d" },
  { min: 1500, label: "Sommelier",  color: "#166534" },
  { min: 2500, label: "Mycologist", color: "#14532d" },
];

function getLevel(pts) {
  for (let i = PRESTIGE_LEVELS.length - 1; i >= 0; i--) {
    if (pts >= PRESTIGE_LEVELS[i].min) return PRESTIGE_LEVELS[i];
  }
  return PRESTIGE_LEVELS[0];
}

// ── Insight engine ───────────────────────────────────────────────────────────
function generateInsights(profile, healthData, experiences) {
  if (!profile) return [{
    type: "profile", priority: 3, icon: "🧬", area: null,
    title: "Complete Your Assessment",
    text: "Take the assessment to unlock your personalized endocannabinoid profile and AI-driven cannabis insights.",
  }];

  const { effect = 50, anxiety = 50, thc_sensitivity = 50, cbd_importance = 50,
          experience: expLevel = 50, consumptionPrefs = [] } = profile;
  const conditions = healthData?.conditions ?? [];
  const age = parseInt(healthData?.age) || null;
  const insights = [];

  // ─ Condition-based ─
  const painMatch = conditions.filter(c => /pain|arthritis|fibro|spinal|gout|spasm/i.test(c));
  if (painMatch.length) insights.push({
    type: "health", priority: 1, icon: "🌿", area: "spine",
    title: "Pain Management Profile",
    text: `For ${painMatch.slice(0,2).join(" & ")}: beta-caryophyllene (BCP) and myrcene have the strongest anti-inflammatory evidence. Target strains with >0.3% BCP on the COA. 1:1 CBD:THC ratios reduce pain without heavy sedation during daylight hours.`,
  });

  const anxietyMatch = conditions.filter(c => /anxiety|ptsd|panic|depression|bipolar/i.test(c));
  if (anxietyMatch.length || anxiety < 40) insights.push({
    type: "health", priority: 1, icon: "😌", area: "brain",
    title: "Mental Health Optimization",
    text: `${anxietyMatch.length ? `Your ${anxietyMatch[0]} diagnosis` : "Your anxiety score"} signals elevated CB1 sensitivity in the amygdala. Prioritize linalool + CBD products. Avoid strains >20% THC or high THCV — these amplify anxiety. Full-spectrum CBD with terpenes outperforms isolate.`,
  });

  const sleepMatch = conditions.filter(c => /insomnia|sleep/i.test(c));
  if (sleepMatch.length) insights.push({
    type: "health", priority: 2, icon: "🌙", area: "brainstem",
    title: "Sleep Cycle Support",
    text: "Indica-dominant strains with myrcene + CBN (found in aged cannabis) 30–45 min before bed. Edibles extend effect duration to 6–8 hours — ideal for sleep maintenance. Avoid sativas and high-THCV after 6 PM.",
  });

  const gutMatch = conditions.filter(c => /crohn|colitis|ibs|bowel|celiac/i.test(c));
  if (gutMatch.length) insights.push({
    type: "health", priority: 2, icon: "🌿", area: "gut",
    title: "GI Tract Support",
    text: `CB1 and CB2 receptors in your enteric nervous system directly address ${gutMatch[0]}. CBD-dominant products reduce gut inflammation without psychoactivity. Tinctures and capsules avoid airway irritation and allow precise enteric dosing.`,
  });

  const neuroMatch = conditions.filter(c => /epilepsy|seizure|multiple sclerosis|parkinson|als|tbi/i.test(c));
  if (neuroMatch.length) insights.push({
    type: "health", priority: 1, icon: "🧠", area: "brain",
    title: "Neurological Consideration",
    text: `For ${neuroMatch[0]}: high-CBD products (>15% CBD, minimal THC) have the strongest clinical evidence. FDA-approved Epidiolex (pure CBD) was derived from this research. Always coordinate with your neurologist before adjusting prescriptions.`,
  });

  if (age && age >= 60) insights.push({
    type: "safety", priority: 1, icon: "⚠️", area: "heart",
    title: "Dosage Adjustment for Age",
    text: "CYP450 enzyme activity declines ~30% with age, slowing cannabis metabolism. Start at 25–50% of standard doses; wait 2 hours before redosing edibles. THC temporarily raises heart rate — CBD-forward products reduce cardiovascular strain.",
  });

  // ─ Profile-based ─
  if (effect < 30) insights.push({
    type: "profile", priority: 2, icon: "🌙", area: "immune",
    title: "Indica-forward Body Response",
    text: "Your deep-relaxation preference maps to CB1-dense basal ganglia regions controlling motor and tension. Myrcene-heavy indicas activate these pathways for muscle relaxation and sedation. Best for evening, recovery, and sleep.",
  });
  else if (effect > 70) insights.push({
    type: "profile", priority: 2, icon: "⚡", area: "brain",
    title: "Sativa-forward Cognitive Effects",
    text: "Your energy preference maps to dopaminergic pathways in the prefrontal cortex. Limonene and pinene terpenes boost dopamine and serotonin activity, producing focus and sociability. Best for daytime, creative work, and social settings.",
  });

  if (thc_sensitivity < 35) insights.push({
    type: "profile", priority: 1, icon: "⚠️", area: "brain",
    title: "High THC Sensitivity",
    text: "Your profile indicates elevated CB1 receptor density or lower CYP2C9/CYP3A4 enzyme activity. Begin at 2.5–5mg THC and wait 90 min before redosing. CBD (50–100mg) acts as a partial CB1 antagonist and can moderate over-intoxication.",
  });

  if (cbd_importance > 65) insights.push({
    type: "profile", priority: 3, icon: "💊", area: "immune",
    title: "High CBD Affinity",
    text: "High CBD priority correlates with anxiety sensitivity or therapeutic focus. CBD activates 5-HT1A serotonin receptors (the same target as SSRIs) while moderating THC's psychoactivity. Optimal ratios: 1:1 to 2:1 CBD:THC for balanced therapeutic effect.",
  });

  // ─ Experience log patterns ─
  if (experiences.length > 0) {
    const rated = experiences.filter(e => e.rating > 0);
    if (rated.length >= 2) {
      const avg = rated.reduce((s, e) => s + e.rating, 0) / rated.length;
      const best = rated.reduce((a, b) => b.rating > a.rating ? b : a);
      const vendorMap = {};
      experiences.forEach(e => { if (e.vendor) vendorMap[e.vendor] = (vendorMap[e.vendor] || 0) + 1; });
      const topVendor = Object.entries(vendorMap).sort(([,a],[,b]) => b - a)[0]?.[0];
      insights.push({
        type: "pattern", priority: 3, icon: "📊", area: null,
        title: `${experiences.length} Sessions Analyzed`,
        text: `Average satisfaction: ${avg.toFixed(1)}/5. Best session: "${best.productName || "your top product"}" (${best.rating}/5)${best.vendor ? ` at ${best.vendor}` : ""}.${topVendor ? ` You return to ${topVendor} most often.` : ""} More logs = sharper recommendations.`,
      });
    }
    // Best category
    const catMap = {};
    experiences.filter(e => e.rating > 0 && e.category).forEach(e => {
      if (!catMap[e.category]) catMap[e.category] = [];
      catMap[e.category].push(e.rating);
    });
    const bestCat = Object.entries(catMap)
      .map(([cat, r]) => ({ cat, avg: r.reduce((a,b)=>a+b,0)/r.length }))
      .sort((a,b)=>b.avg-a.avg)[0];
    if (bestCat && bestCat.avg >= 3.8) insights.push({
      type: "recommendation", priority: 2, icon: "⭐", area: null,
      title: `${bestCat.cat.charAt(0).toUpperCase() + bestCat.cat.slice(1)} Is Your Best Format`,
      text: `Your ${bestCat.cat} sessions average ${bestCat.avg.toFixed(1)}/5 — highest of any delivery method. This aligns with your bioavailability profile and consumption preferences.`,
    });
  }

  if (insights.length === 0) insights.push({
    type: "profile", priority: 3, icon: "🧬", area: null,
    title: "Add Health Data for Personalized Insights",
    text: "Your assessment profile is ready. Add your health conditions and log some experiences to unlock deeper endocannabinoid insights tailored to your physiology.",
  });

  return insights.sort((a, b) => a.priority - b.priority);
}

// ── Health form ──────────────────────────────────────────────────────────────
function HealthForm({ initial, onSave, onCancel }) {
  const [draft, setDraft] = useState(initial ?? { height: "", weight: "", age: "", gender: "neutral", conditions: [] });
  const [condSearch, setCondSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const filtered = condSearch.trim().length > 1
    ? MEDICAL_CONDITIONS.filter(c => c.toLowerCase().includes(condSearch.toLowerCase())).slice(0, 8)
    : [];

  const toggleCond = (c) => setDraft(d => ({
    ...d,
    conditions: d.conditions.includes(c)
      ? d.conditions.filter(x => x !== c)
      : [...d.conditions, c],
  }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(draft);
    setSaving(false);
  };

  return (
    <form className="health-form" onSubmit={submit}>
      <div className="health-form__row">
        <label>
          <span>Age</span>
          <input type="number" min="18" max="100" placeholder="—" value={draft.age}
            onChange={e => setDraft(d => ({ ...d, age: e.target.value }))} />
        </label>
        <label>
          <span>Weight (lbs)</span>
          <input type="number" min="50" max="500" placeholder="—" value={draft.weight}
            onChange={e => setDraft(d => ({ ...d, weight: e.target.value }))} />
        </label>
        <label>
          <span>Height (ft&apos;in&quot;)</span>
          <input type="text" placeholder="e.g. 5ft 10in" value={draft.height}
            onChange={e => setDraft(d => ({ ...d, height: e.target.value }))} />
        </label>
      </div>

      <div className="health-form__gender">
        <span className="health-form__label">Body visualization</span>
        <div className="health-form__gender-btns">
          {["neutral","male","female"].map(g => (
            <button key={g} type="button"
              className={`health-form__gender-btn ${draft.gender === g ? "active" : ""}`}
              onClick={() => setDraft(d => ({ ...d, gender: g }))}>
              {g === "neutral" ? "⚪ Neutral" : g === "male" ? "♂ Male" : "♀ Female"}
            </button>
          ))}
        </div>
      </div>

      <div className="health-form__conditions">
        <span className="health-form__label">Medical Conditions <span className="health-form__optional">(optional — used for personalized insights)</span></span>

        {draft.conditions.length > 0 && (
          <div className="health-form__tags">
            {draft.conditions.map(c => (
              <button key={c} type="button" className="health-form__tag" onClick={() => toggleCond(c)}>
                {c} ×
              </button>
            ))}
          </div>
        )}

        <input
          type="text"
          className="health-form__search"
          placeholder="Search conditions (e.g. arthritis, PTSD…)"
          value={condSearch}
          onChange={e => setCondSearch(e.target.value)}
        />
        {filtered.length > 0 && (
          <ul className="health-form__suggestions">
            {filtered.map(c => (
              <li key={c}>
                <button type="button" className={`health-form__suggestion ${draft.conditions.includes(c) ? "selected" : ""}`}
                  onClick={() => { toggleCond(c); setCondSearch(""); }}>
                  {draft.conditions.includes(c) ? "✓ " : ""}{c}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="health-form__actions">
        <button type="submit" className="btn btn--primary btn--sm" disabled={saving}>
          {saving ? "Saving…" : "Save Profile"}
        </button>
        <button type="button" className="btn btn--outline btn--sm" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}

// ── Experience card ──────────────────────────────────────────────────────────
function ExperienceCard({ exp }) {
  const icon = CATEGORY_ICONS[exp.category] ?? "🌿";
  const date = exp.createdAt?.toDate ? exp.createdAt.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";
  return (
    <div className="exp-card">
      <div className="exp-card__header">
        <span className="exp-card__icon">{icon}</span>
        <div className="exp-card__info">
          <div className="exp-card__name">{exp.productName || "Unnamed Product"}</div>
          {exp.strain && <div className="exp-card__strain">{exp.strain}</div>}
        </div>
        <div className="exp-card__meta">
          {exp.rating > 0 && (
            <div className="exp-card__rating">
              {"★".repeat(exp.rating)}{"☆".repeat(5 - exp.rating)}
            </div>
          )}
          {date && <div className="exp-card__date">{date}</div>}
        </div>
      </div>
      <div className="exp-card__footer">
        {exp.vendor && <span className="exp-card__vendor">📍 {exp.vendor}</span>}
        {exp.thcPct && <span className="exp-card__pct">THC {exp.thcPct}%</span>}
        {exp.cbdPct && <span className="exp-card__pct">CBD {exp.cbdPct}%</span>}
        {exp.notes?.overall && (
          <p className="exp-card__note">{exp.notes.overall.slice(0, 90)}{exp.notes.overall.length > 90 ? "…" : ""}</p>
        )}
      </div>
    </div>
  );
}

// ── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, savedProfile } = useAuth();
  const [experiences, setExperiences]   = useState([]);
  const [healthData,  setHealthData]    = useState(null);
  const [insights,    setInsights]      = useState([]);
  const [loading,     setLoading]       = useState(true);
  const [editingHealth, setEditingHealth] = useState(false);
  const [prestige,    setPrestige]      = useState({ points: 0 });
  const [activeTab,   setActiveTab]     = useState("journal");

  useEffect(() => {
    if (!user) return;
    const uid = user.id;
    Promise.all([
      getUserExperiences(uid),
      getHealthData(uid),
      getUserPrestige(uid),
    ]).then(([exps, hd, pres]) => {
      setExperiences(exps);
      setHealthData(hd);
      setInsights(generateInsights(savedProfile, hd, exps));
      setPrestige(pres ?? { points: 0 });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user, savedProfile]);

  const handleSaveHealth = useCallback(async (data) => {
    await saveHealthData(user.id, data);
    setHealthData(data);
    setInsights(generateInsights(savedProfile, data, experiences));
    setEditingHealth(false);
  }, [user, savedProfile, experiences]);

  const gender = healthData?.gender ?? "neutral";
  const level  = getLevel(prestige.points ?? 0);
  const activeConditions = healthData?.conditions ?? [];

  if (loading) return (
    <div className="dash-loading">
      <span className="dash-loading__leaf">🌿</span>
      <p>Loading your dashboard…</p>
    </div>
  );

  return (
    <div className="dashboard">

      {/* ── Header ── */}
      <header className="dash-header">
        <div className="dash-header__left">
          <img src={user.picture} alt="" className="dash-header__avatar" />
          <div>
            <h1 className="dash-header__name">Welcome back, {user.name.split(" ")[0]}.</h1>
            <div className="dash-header__sub">
              <span className="dash-level-badge" style={{ color: level.color }}>
                ● {level.label}
              </span>
              <span className="dash-pts">{prestige.points ?? 0} pts</span>
              {savedProfile ? (
                <span className="dash-profile-complete">✓ Assessment complete</span>
              ) : (
                <Link to="/assessment" className="dash-cta-link">Take your assessment →</Link>
              )}
            </div>
          </div>
        </div>
        <div className="dash-header__right">
          <Link to="/log" className="btn btn--primary btn--sm">+ Log Experience</Link>
          <Link to="/profile" className="btn btn--outline btn--sm">Full Profile</Link>
        </div>
      </header>

      {/* ── Main grid ── */}
      <div className="dash-main">

        {/* ─ Body Visualization ─ */}
        <section className="dash-body-section">
          <div className="dash-section-label">
            <span>Endocannabinoid System</span>
            <span className="dash-section-hint">Tap hotspots to explore</span>
          </div>
          <BodyViz gender={gender} activeConditions={activeConditions} />
          <div className="dash-body-legend-hint">
            {[
              { color: "#a78bfa", label: "Brain / CNS" },
              { color: "#f87171", label: "Cardiovascular" },
              { color: "#34d399", label: "GI System" },
              { color: "#fbbf24", label: "Immune" },
              { color: "#6ee7b7", label: "Muscles / Joints" },
            ].map(d => (
              <span key={d.label} className="dash-legend-pill">
                <span className="dash-legend-dot" style={{ background: d.color }} />
                {d.label}
              </span>
            ))}
          </div>
        </section>

        {/* ─ Insights Panel ─ */}
        <section className="dash-insights">
          <div className="dash-section-label">
            <span>AI Insights</span>
            <span className="dash-section-hint">Based on your profile{experiences.length > 0 ? ` · ${experiences.length} sessions` : ""}</span>
          </div>
          <div className="dash-insights__list">
            {insights.map((ins, i) => (
              <div
                key={i}
                className={`insight-card insight-card--${ins.type}`}
                onClick={() => {}}
              >
                <div className="insight-card__head">
                  <span className="insight-card__icon">{ins.icon}</span>
                  <span className="insight-card__title">{ins.title}</span>
                  {ins.type === "health" && <span className="insight-card__badge">Health</span>}
                  {ins.type === "safety" && <span className="insight-card__badge insight-card__badge--warn">Safety</span>}
                </div>
                <p className="insight-card__text">{ins.text}</p>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* ── Lower grid ── */}
      <div className="dash-lower">

        {/* ─ Journal / Health tabs ─ */}
        <div className="dash-tabs">
          <button className={`dash-tab ${activeTab === "journal" ? "active" : ""}`}
            onClick={() => setActiveTab("journal")}>
            📋 Experience Journal
            {experiences.length > 0 && <span className="dash-tab__count">{experiences.length}</span>}
          </button>
          <button className={`dash-tab ${activeTab === "health" ? "active" : ""}`}
            onClick={() => setActiveTab("health")}>
            ❤️ Health Profile
            {activeConditions.length > 0 && <span className="dash-tab__count">{activeConditions.length}</span>}
          </button>
        </div>

        {/* Journal tab */}
        {activeTab === "journal" && (
          <div className="dash-journal">
            {experiences.length === 0 ? (
              <div className="dash-empty">
                <div className="dash-empty__icon">📋</div>
                <h3>No experiences logged yet</h3>
                <p>Log your first product experience to start building your personalized cannabis profile.</p>
                <Link to="/log" className="btn btn--primary">Log Your First Experience</Link>
              </div>
            ) : (
              <div className="dash-journal__grid">
                {experiences.slice(0, 12).map(exp => (
                  <ExperienceCard key={exp.id} exp={exp} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Health tab */}
        {activeTab === "health" && (
          <div className="dash-health">
            {editingHealth ? (
              <HealthForm
                initial={healthData}
                onSave={handleSaveHealth}
                onCancel={() => setEditingHealth(false)}
              />
            ) : (
              <div className="dash-health__view">
                <div className="dash-health__vitals">
                  {[
                    { label: "Age",    value: healthData?.age    ? `${healthData.age} yrs`  : "—" },
                    { label: "Weight", value: healthData?.weight ? `${healthData.weight} lbs`: "—" },
                    { label: "Height", value: healthData?.height || "—" },
                    { label: "Body",   value: healthData?.gender ? healthData.gender.charAt(0).toUpperCase() + healthData.gender.slice(1) : "Neutral" },
                  ].map(v => (
                    <div key={v.label} className="dash-health__vital">
                      <span className="dash-health__vital-label">{v.label}</span>
                      <span className="dash-health__vital-value">{v.value}</span>
                    </div>
                  ))}
                </div>
                {activeConditions.length > 0 && (
                  <div className="dash-health__conditions">
                    <span className="dash-health__conditions-label">Conditions</span>
                    <div className="dash-health__condition-tags">
                      {activeConditions.map(c => (
                        <span key={c} className="dash-health__condition-tag">{c}</span>
                      ))}
                    </div>
                  </div>
                )}
                <button className="btn btn--outline btn--sm dash-health__edit-btn"
                  onClick={() => setEditingHealth(true)}>
                  {healthData ? "Edit Health Profile" : "Add Health Data"}
                </button>
                {!healthData && (
                  <p className="dash-health__hint">
                    Health data is optional and only used to personalize your cannabis insights. It's never shared.
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
