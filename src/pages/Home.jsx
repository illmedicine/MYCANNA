import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import BiSlider from '../components/BiSlider.jsx';
import EngagementCounter from '../components/EngagementCounter.jsx';

const DEMO_SLIDERS = [
  {
    id: 'effect',
    label: 'Effect Profile',
    description: 'What feeling are you chasing?',
    leftLabel: 'Relaxing',
    rightLabel: 'Energizing',
    leftEmoji: '🌙',
    rightEmoji: '⚡',
    leftColor: '#6d28d9',
    rightColor: '#f59e0b',
    defaultValue: 30,
  },
  {
    id: 'thc',
    label: 'THC Sensitivity',
    description: 'How strongly does THC affect you?',
    leftLabel: 'Very Sensitive',
    rightLabel: 'High Tolerance',
    leftEmoji: '🪶',
    rightEmoji: '🏔️',
    leftColor: '#ef4444',
    rightColor: '#10b981',
    defaultValue: 55,
  },
  {
    id: 'anxiety',
    label: 'Anxiety Tendency',
    description: 'Does cannabis ever make you anxious?',
    leftLabel: 'Anxiety-Prone',
    rightLabel: 'Anxiety-Resistant',
    leftEmoji: '😟',
    rightEmoji: '😌',
    leftColor: '#dc2626',
    rightColor: '#0891b2',
    defaultValue: 40,
  },
];

const SLIDER_INSIGHTS = {
  effect: [
    { max: 20,  text: 'Deep relaxation mode — ideal for unwinding, sleep, and stress relief. Look for indica-dominant strains.' },
    { max: 40,  text: 'Leaning relaxed — great for creative calm, light social settings, or evening decompression.' },
    { max: 60,  text: 'Right in the middle — balanced hybrids with versatile terpene profiles will serve you well.' },
    { max: 80,  text: 'Leaning energizing — sativa-dominant strains with limonene and pinene will match your vibe.' },
    { max: 100, text: 'Full energy mode — sativas and uplifting hybrids are your lane. Great for daytime or exercise.' },
  ],
  thc: [
    { max: 20,  text: 'Very THC-sensitive — low-dose products and CBD-forward ratios are your best friend. Start at 2–5mg.' },
    { max: 40,  text: 'Moderate sensitivity — start low and go slow. Mid-CBD strains will soften the edge of THC.' },
    { max: 60,  text: 'Average tolerance — you can explore standard potencies. Terpenes will be your differentiator.' },
    { max: 80,  text: 'Good tolerance — a wider range of potencies is comfortable. Lean into terpene complexity.' },
    { max: 100, text: 'High tolerance — potency alone won\'t move you much. Focus on unique terpene profiles for variety.' },
  ],
  anxiety: [
    { max: 20,  text: 'High anxiety risk — prioritize CBD-dominant strains and calming terpenes like linalool and myrcene.' },
    { max: 40,  text: 'Mild anxiety risk — balanced CBD:THC ratios and myrcene-heavy strains will help soften paranoia risk.' },
    { max: 60,  text: 'Low anxiety risk — most balanced hybrids work well. Avoid very high-THC strains to stay comfortable.' },
    { max: 80,  text: 'Anxiety-resilient — you tolerate THC well psychologically. Explore with confidence.' },
    { max: 100, text: 'Anxiety-resistant — sativas and high-THC strains are accessible to you without much concern.' },
  ],
};

function getSliderInsight(id, value) {
  const tiers = SLIDER_INSIGHTS[id];
  return tiers.find((t) => value <= t.max)?.text ?? tiers[tiers.length - 1].text;
}

const FACTORS = [
  { icon: '🧬', title: 'THC Sensitivity', desc: 'Your personal reaction to THC — not just the percentage on the label.' },
  { icon: '🌿', title: 'CBD Balance', desc: 'The ratio of CBD to THC dramatically changes how you feel.' },
  { icon: '🍋', title: 'Terpene Profile', desc: 'Terpenes like limonene and myrcene shape aroma, mood, and effects.' },
  { icon: '😌', title: 'Anxiety Profile', desc: 'Some strains calm anxiety; others can intensify it depending on your biology.' },
  { icon: '⚡', title: 'Effect Direction', desc: 'Do you want to wind down or spark up? Indica vs. Sativa matters — but it\'s more nuanced.' },
  { icon: '🎯', title: 'Use Case', desc: 'Recreational enjoyment, creative focus, pain relief, and sleep each call for different profiles.' },
  { icon: '📈', title: 'Experience Level', desc: 'Beginners and seasoned users need very different starting points.' },
  { icon: '🤝', title: 'Social Context', desc: 'Solo introspection or social settings each call for a different kind of session.' },
];

const STEPS = [
  { n: '01', title: 'Sign In Securely', desc: 'Use your Google account — no passwords to remember.' },
  { n: '02', title: 'Answer 8 Questions', desc: 'Our intuitive slider system maps your personal preferences in under 3 minutes.' },
  { n: '03', title: 'Get Your Profile', desc: 'Receive a detailed cannabis profile with tailored guidance on what to look for.' },
];

export default function Home() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const [demoValues, setDemoValues] = useState(() =>
    Object.fromEntries(DEMO_SLIDERS.map((s) => [s.id, s.defaultValue]))
  );

  const handleCTA = async () => {
    if (user) {
      navigate('/assessment');
    } else {
      try {
        await signIn();
        navigate('/assessment');
      } catch (err) {
        console.error('Sign-in failed', err);
      }
    }
  };

  return (
    <main className="home">

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero__glow" />
        <div className="hero__content">
          <div className="hero__badge">Cannabis Profile Assessment</div>
          <h1 className="hero__title">
            You Are More Than<br />
            <span className="hero__title-accent">A THC Percentage</span>
          </h1>
          <p className="hero__sub">
            Mycana maps the 8 biological and lifestyle factors that actually determine
            how cannabis will make <em>you</em> feel — and guides you to the right product.
          </p>
          <button className="btn btn--primary btn--lg hero__cta" onClick={handleCTA}>
            {user ? 'View My Profile →' : 'Discover My Profile — It\'s Free'}
          </button>
          {!user && (
            <p className="hero__footnote">Sign in with Google · Takes under 3 minutes</p>
          )}
          <EngagementCounter />
        </div>
        <div className="hero__preview">
          <div className="hero__card">
            <p className="hero__card-label">Your profile snapshot</p>
            <div className="hero__card-sliders">
              {DEMO_SLIDERS.slice(0, 2).map((s) => (
                <BiSlider
                  key={s.id}
                  {...s}
                  value={demoValues[s.id]}
                  onChange={(v) => setDemoValues((p) => ({ ...p, [s.id]: v }))}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Problem ── */}
      <section className="section section--light">
        <div className="container">
          <div className="problem-split">
            <div className="problem-split__text">
              <span className="eyebrow">The Problem</span>
              <h2 className="section__title">THC% Tells You Almost Nothing</h2>
              <p className="section__body">
                Walk into any dispensary and you'll see products marketed almost entirely on THC
                potency. But two people can smoke the same 28% THC flower and have completely
                opposite experiences — one relaxed, one anxious; one euphoric, one flat.
              </p>
              <p className="section__body">
                That's because cannabis effects are shaped by <strong>terpene profiles,
                CBD ratios, your personal physiology, tolerance, anxiety biology,</strong> and
                how you're using it. THC percentage is just one variable in a complex equation.
              </p>
            </div>
            <div className="problem-split__stat-col">
              {[
                { n: '70%', label: 'of cannabis consumers report inconsistent effects from same-potency products' },
                { n: '3×', label: 'more variables beyond THC determine your actual experience' },
                { n: '1 in 5', label: 'users experience anxiety — often preventable with the right profile match' },
              ].map((s) => (
                <div key={s.n} className="stat-card">
                  <span className="stat-card__n">{s.n}</span>
                  <span className="stat-card__label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Live Demo ── */}
      <section className="section section--demo">
        <div className="container container--narrow">
          <span className="eyebrow eyebrow--gold">Interactive Demo</span>
          <h2 className="section__title">Try the Slider System</h2>
          <p className="section__body section__body--center">
            Drag these sliders to see how Mycana captures your personal preferences.
            Each position on the scale tells us something important about which
            products will work best for you.
          </p>

          <div className="demo-card">
            <div className="demo-card__header">
              <span className="demo-card__chip">🎛️ Live Preview</span>
              <span className="demo-card__note">These are just examples — your real assessment saves your answers</span>
            </div>
            {DEMO_SLIDERS.map((s) => (
              <div key={s.id} className="demo-slider-row">
                <BiSlider
                  {...s}
                  value={demoValues[s.id]}
                  onChange={(v) => setDemoValues((p) => ({ ...p, [s.id]: v }))}
                />
                <div className="demo-slider-insight">
                  <span className="demo-slider-insight__dot" />
                  <span className="demo-slider-insight__text">
                    {getSliderInsight(s.id, demoValues[s.id])}
                  </span>
                </div>
              </div>
            ))}
            <div className="demo-card__insight">
              <span className="demo-card__insight-icon">🧬</span>
              <p className="demo-card__insight-text">
                {demoValues.anxiety < 30 && demoValues.effect < 45
                  ? 'Your profile suggests a calm, low-key experience — CBD-rich indicas with linalool are your best match.'
                  : demoValues.anxiety < 30
                  ? 'Despite your energetic lean, prioritize CBD balance to keep anxiety in check. Look for limonene + CBD combos.'
                  : demoValues.effect > 65 && demoValues.thc > 55
                  ? 'High-energy, high-tolerance profile — you\'re built for sativas. Pinene and limonene-forward strains are your lane.'
                  : demoValues.effect < 40
                  ? 'Relaxation-first with solid tolerance — myrcene-rich hybrids for evening calm are your sweet spot.'
                  : 'Balanced profile — a versatile hybrid with a rich terpene mix will consistently work well for you.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8 Factors ── */}
      <section className="section section--light">
        <div className="container">
          <span className="eyebrow">What We Assess</span>
          <h2 className="section__title">8 Factors That Define Your Profile</h2>
          <div className="factors-grid">
            {FACTORS.map((f) => (
              <div key={f.title} className="factor-card">
                <span className="factor-card__icon">{f.icon}</span>
                <h3 className="factor-card__title">{f.title}</h3>
                <p className="factor-card__desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="section">
        <div className="container container--narrow">
          <span className="eyebrow eyebrow--gold">Simple Process</span>
          <h2 className="section__title">How It Works</h2>
          <div className="steps">
            {STEPS.map((s, i) => (
              <div key={s.n} className="step">
                <div className="step__num">{s.n}</div>
                {i < STEPS.length - 1 && <div className="step__line" />}
                <div className="step__content">
                  <h3 className="step__title">{s.title}</h3>
                  <p className="step__desc">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Bottom ── */}
      <section className="section section--cta">
        <div className="container container--narrow cta-bottom">
          <h2 className="cta-bottom__title">Ready to Know Your Profile?</h2>
          <p className="cta-bottom__sub">
            Join thousands of cannabis users who've moved beyond THC percentages
            to find products that truly work for them.
          </p>
          <button className="btn btn--primary btn--lg" onClick={handleCTA}>
            {user ? 'Continue to My Assessment →' : 'Get Started with Google'}
          </button>
          {!user && <p className="cta-bottom__footnote">Free · Private · Takes under 3 minutes</p>}
        </div>
      </section>

      <footer className="footer">
        <p>© 2025 Mycana · For educational purposes only · Not medical advice</p>
        <p style={{ marginTop: '8px', fontSize: '.72rem', opacity: '.5' }}>
          <Link to="/investors" style={{ color: 'inherit', textDecoration: 'underline' }}>Investor Overview</Link>
          {' · '}A product of <a href="https://www.illyrobotic-ai.com" style={{ color: 'inherit', textDecoration: 'underline' }} target="_blank" rel="noopener noreferrer">Illy Robotic Instruments</a>
        </p>
        <Link
          to="/admin"
          style={{
            display: 'inline-block',
            marginTop: '20px',
            fontSize: '.65rem',
            opacity: '.18',
            color: 'inherit',
            letterSpacing: '.06em',
          }}
        >
          ⚙
        </Link>
      </footer>
    </main>
  );
}
