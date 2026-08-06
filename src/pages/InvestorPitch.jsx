import './InvestorPitch.css';
import { Link } from 'react-router-dom';

const fmt  = (n) => n.toLocaleString();
const fmtK = (n) => (n >= 1000 ? '$' + (n / 1000).toFixed(0) + 'K' : '$' + n);
const fmtUSD = (n) => '$' + n.toLocaleString();

/* ── Static data ─────────────────────────────────────────────────── */

const ASSUMPTIONS = [
  '2 Paid Plans · Standard $49/mo & Premium $149/mo',
  '582 Licensed NY Dispensaries',
  '~60 WNY Launch Dispensaries',
  'Free Profile Tier + Paid Ads',
  'DAO Data Mesh · Year 2+ Horizon',
];

const MARKET_STATS = [
  { n: '582+', label: 'NY Licensed Dispensaries', note: 'OCM projects 2,000+ by 2027' },
  { n: '$2.5B+', label: 'NY Cannabis Market 2026', note: '~57% year-over-year growth' },
  { n: '$4M', label: 'Avg Dispensary Annual Revenue', note: 'Source: MJBizDaily / OCM 2025' },
  { n: '~60', label: 'WNY Launch Dispensaries', note: 'Erie, Niagara, Chautauqua, Cattaraugus counties' },
];

/*
 * 4 adoption tiers across NY State's 582 licensed dispensaries.
 * WNY (~60 stores) is the Phase 1 launch beachhead — captured within Tier 1.
 * 3M-user DAO projections are a NATIONAL scale vision (Year 3+), clearly labeled.
 *
 * Store mix: 60% Standard ($49/mo) / 40% Premium ($149/mo) among paid subscribers.
 * Consumer users: NY State cannabis consumers (~3.75M potential) at realistic platform capture rates.
 * Dispensary customer throughput: avg 2,000 unique customers/store/month (based on $4M/yr avg revenue ÷ $55 avg ticket).
 */
const TIERS = [
  {
    num: 'TIER 1',
    label: 'WNY Traction',
    adoptionPct: '10%',
    adoptionScope: 'NY STATE',
    phaseNote: 'Phase 1 — WNY launch beachhead (60 WNY stores ≈ full Tier 1)',
    color: '#2d6a4f',
    accent: '#52b788',
    paidStores: 58,
    freeStores: 524,
    standardStores: 35,
    premiumStores: 23,
    standardRev: 1715,
    premiumRev: 3427,
    subMonthly: 5142,
    adMonthly: 175,
    totalMonthly: 5317,
    totalAnnual: 63804,
    freeUsers: 9600,         // ~3% of 320K active NY cannabis consumers in reach
    usersPerPaidStore: 165,  // avg unique Mycana users per paid store
    dispensaryCustomers: '~116K total dispensary customers/mo across paid stores (NY State)',
    payback: 'Month 19',
    paybackNote: 'Beyond Year 1',
    highlight: false,
  },
  {
    num: 'TIER 2',
    label: 'NY State Growth',
    adoptionPct: '30%',
    adoptionScope: 'NY STATE',
    phaseNote: 'Phase 2 — WNY saturated + NYC metro + Hudson Valley expansion',
    color: '#1b5e42',
    accent: '#4ade80',
    paidStores: 175,
    freeStores: 407,
    standardStores: 105,
    premiumStores: 70,
    standardRev: 5145,
    premiumRev: 10430,
    subMonthly: 15575,
    adMonthly: 750,
    totalMonthly: 16325,
    totalAnnual: 195900,
    freeUsers: 38500,        // ~1% of NY's ~3.75M cannabis consumers
    usersPerPaidStore: 220,
    dispensaryCustomers: '~350K dispensary customers/mo across paid stores (NY State)',
    payback: 'Month 7',
    paybackNote: 'Within Year 1',
    highlight: false,
  },
  {
    num: 'TIER 3',
    label: 'Statewide Footprint',
    adoptionPct: '55%',
    adoptionScope: 'NY STATE',
    phaseNote: 'Phase 3 — Majority of NY legal dispensaries on-platform',
    color: '#0d4f2e',
    accent: '#d4a843',
    paidStores: 320,
    freeStores: 262,
    standardStores: 192,
    premiumStores: 128,
    standardRev: 9408,
    premiumRev: 19072,
    subMonthly: 28480,
    adMonthly: 2250,
    totalMonthly: 30730,
    totalAnnual: 368760,
    freeUsers: 94000,        // ~2.5% of NY cannabis consumer base
    usersPerPaidStore: 294,
    dispensaryCustomers: '~640K dispensary customers/mo across paid stores (NY State)',
    payback: 'Month 4',
    paybackNote: 'Strong ROI',
    highlight: true,
  },
  {
    num: 'TIER 4',
    label: 'NY Market Dominance',
    adoptionPct: '85%',
    adoptionScope: 'NY STATE',
    phaseNote: 'Phase 4 — Standard of care for NY cannabis retail + national expansion begins',
    color: '#0a1f12',
    accent: '#f0c84e',
    paidStores: 495,
    freeStores: 87,
    standardStores: 297,
    premiumStores: 198,
    standardRev: 14553,
    premiumRev: 29502,
    subMonthly: 44055,
    adMonthly: 6000,
    totalMonthly: 50055,
    totalAnnual: 600660,
    freeUsers: 187500,       // 5% of NY's ~3.75M cannabis consumers
    usersPerPaidStore: 379,
    dispensaryCustomers: '~990K dispensary customers/mo across paid stores (NY State)',
    payback: 'Month 2',
    paybackNote: 'Rapid Return',
    highlight: false,
  },
];

const SEED = [
  {
    label: 'Platform Development & Infrastructure',
    amount: 50000,
    pct: 50,
    color: '#0d4f2e',
    items: ['React PWA build-out', 'Firebase / Firestore scale', 'DAO data pipeline architecture', 'QR scanner + AI integrations'],
  },
  {
    label: 'Marketing, Advertising & Signage',
    amount: 25000,
    pct: 25,
    color: '#1b5e42',
    items: ['In-dispensary signage & QR cards', 'Digital ad campaigns (Meta / Google)', 'WNY influencer + budtender outreach', 'Launch events & pop-ups'],
  },
  {
    label: 'Legal & Compliance',
    amount: 15000,
    pct: 15,
    color: '#d4a843',
    items: ['NY cannabis data privacy counsel', 'DAO token structure review', 'Vendor agreement templates', 'IP & trademark filing'],
  },
  {
    label: 'Operations (6-Month Runway)',
    amount: 10000,
    pct: 10,
    color: '#52b788',
    items: ['Customer support infrastructure', 'Vendor onboarding & verification', 'Analytics & reporting setup', 'Contingency buffer'],
  },
];

/*
 * DAO scenarios are shown at two user scales:
 *   NY Tier 4 (187,500 NY State users)  ← what this seed investment can realistically reach
 *   National 3M users                   ← long-term national vision (Year 3+, labeled clearly)
 * Platform retains 30-40% of each KB's market price as protocol fee.
 */
const DAO_SCENARIOS = [
  {
    label: 'Conservative',
    kb: '$0.05/KB',
    perUser: '$12/yr',
    userShare: '$7.20/yr',
    platformSharePer: '$4.80/yr',
    nyTier4: '$900K/yr',     // 187,500 × $4.80
    national3m: '$14.4M/yr', // 3,000,000 × $4.80
    color: '#2d6a4f',
  },
  {
    label: 'Realistic',
    kb: '$0.12/KB',
    perUser: '$28.80/yr',
    userShare: '$17.28/yr',
    platformSharePer: '$11.52/yr',
    nyTier4: '$2.16M/yr',    // 187,500 × $11.52
    national3m: '$34.6M/yr', // 3,000,000 × $11.52
    color: '#1b5e42',
  },
  {
    label: 'Optimistic',
    kb: '$0.25/KB',
    perUser: '$60/yr',
    userShare: '$36/yr',
    platformSharePer: '$24/yr',
    nyTier4: '$4.5M/yr',     // 187,500 × $24
    national3m: '$72M/yr',   // 3,000,000 × $24
    color: '#d4a843',
  },
];

/* ── Component ───────────────────────────────────────────────────── */
export default function InvestorPitch() {
  return (
    <div className="inv-wrap">

      {/* ── Header ── */}
      <header className="inv-header">
        <div className="inv-header__inner">
          <div className="inv-header__brand">
            <span className="inv-header__leaf">🌿</span>
            <div>
              <div className="inv-header__title">MYCANA</div>
              <div className="inv-header__sub">A product of Illy Robotic Instruments</div>
            </div>
          </div>
          <div className="inv-header__badge">INVESTOR BRIEF · 2026</div>
        </div>

        <div className="inv-headline">
          <h1 className="inv-headline__h1">NY Cannabis Market · Seed ROI Projection</h1>
          <p className="inv-headline__p">$100K Seed Ask · Subscription + Ad + DAO Revenue · 4-Tier Payback Analysis</p>
        </div>

        <div className="inv-chips">
          {ASSUMPTIONS.map((a) => (
            <span key={a} className="inv-chip">{a}</span>
          ))}
        </div>
      </header>

      <div className="inv-body">

        {/* ── Market Overview ── */}
        <section className="inv-section">
          <div className="inv-section__label">TOTAL ADDRESSABLE MARKET · NEW YORK STATE 2026</div>
          <div className="inv-stats-row">
            {MARKET_STATS.map((s) => (
              <div key={s.n} className="inv-stat-card">
                <div className="inv-stat-card__n">{s.n}</div>
                <div className="inv-stat-card__label">{s.label}</div>
                <div className="inv-stat-card__note">{s.note}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── WNY Launch Spotlight ── */}
        <div className="inv-wny-banner" style={{ marginTop: '24px' }}>
          <span className="inv-wny-banner__icon">📍</span>
          <div>
            <div className="inv-wny-banner__head">WNY Launch Market — Phase 1 Beachhead</div>
            <div className="inv-wny-banner__sub">
              Buffalo, Niagara Falls, Jamestown & surrounding communities. Densest dispensary cluster outside NYC metro. Industry advisor John G is an active WNY cannabis professional.
            </div>
          </div>
          <div className="inv-wny-banner__stats">
            <div className="inv-wny-stat">
              <span className="inv-wny-stat__n">~60</span>
              <span className="inv-wny-stat__l">WNY Stores</span>
            </div>
            <div className="inv-wny-stat">
              <span className="inv-wny-stat__n">$240M</span>
              <span className="inv-wny-stat__l">WNY Market Est.</span>
            </div>
            <div className="inv-wny-stat">
              <span className="inv-wny-stat__n">1.2M</span>
              <span className="inv-wny-stat__l">WNY Residents</span>
            </div>
          </div>
        </div>

        {/* ── Revenue Pillars ── */}
        <section className="inv-section">
          <div className="inv-section__label">THREE REVENUE PILLARS</div>
          <div className="inv-pillars">
            <div className="inv-pillar inv-pillar--1">
              <div className="inv-pillar__icon">🏪</div>
              <div className="inv-pillar__title">Vendor Subscriptions</div>
              <div className="inv-pillar__desc">
                Free store profiles drive organic adoption — dispensaries claim their listing at no cost, appearing in Discover search results. Standard ($49/mo) and Premium ($149/mo) unlock analytics, featured placement, unlimited products, and promoted items. Two-sided flywheel: more free users → more vendor value → more upgrades.
              </div>
              <div className="inv-pillar__tag">IMMEDIATE RECURRING REVENUE</div>
            </div>
            <div className="inv-pillar inv-pillar--2">
              <div className="inv-pillar__icon">📊</div>
              <div className="inv-pillar__title">Platform Advertising</div>
              <div className="inv-pillar__desc">
                CPM-based display ads, promoted product cards, and featured placement across the Discover feed and consumer experience logs. As free consumer users scale, ad inventory becomes a meaningful revenue layer — scaling alongside the user base without incremental subscription effort.
              </div>
              <div className="inv-pillar__tag">SCALES WITH FREE USER GROWTH</div>
            </div>
            <div className="inv-pillar inv-pillar--3">
              <div className="inv-pillar__icon">⛓️</div>
              <div className="inv-pillar__title">DAO Medical Data Mesh</div>
              <div className="inv-pillar__desc">
                Every Mycana user generates ~240 KB/year of research-grade cannabis health data through our BiSlider effect-logging system. On the tokenized DAO mesh, pharma and research institutions purchase data at market-set prices. Users receive 60–70% of their data's value; Mycana retains 30–40% as protocol fees.
              </div>
              <div className="inv-pillar__tag">YEAR 2+ · HIGH-MARGIN UPSIDE</div>
            </div>
          </div>
        </section>

        {/* ── 4-Tier ROI Infographic ── */}
        <section className="inv-section">
          <div className="inv-section__header">
            <div className="inv-section__label">
              4 TIERS OF MARKET ADOPTION · CONSERVATIVE REVENUE PROJECTIONS
            </div>
            <div className="inv-section__sub">
              Based on 582 licensed NY dispensaries · 60% Standard / 40% Premium split among paid subscribers · ~2,000 unique customers/store/month
            </div>
          </div>

          <div className="inv-tiers-grid">
            {TIERS.map((t) => (
              <div
                key={t.num}
                className={`inv-tier${t.highlight ? ' inv-tier--highlight' : ''}`}
                style={{ '--tier-color': t.color, '--tier-accent': t.accent }}
              >
                {t.highlight && (
                  <div className="inv-tier__recommended">★ MOST LIKELY SCENARIO</div>
                )}

                <div className="inv-tier__head">
                  <div className="inv-tier__num">{t.num}</div>
                  <div className="inv-tier__label">{t.label}</div>
                  <div className="inv-tier__adopt">
                    <span className="inv-tier__adopt-n">{t.adoptionPct}</span>
                    <span className="inv-tier__adopt-label">{t.adoptionScope} ADOPTION</span>
                  </div>
                </div>

                <div className="inv-tier__body">
                  {/* Store breakdown */}
                  <div className="inv-tier__section-label">STORE BREAKDOWN</div>
                  <div className="inv-tier__store-row">
                    <div className="inv-tier__store-item inv-tier__store-item--free">
                      <span className="inv-tier__store-n">{fmt(t.freeStores)}</span>
                      <span className="inv-tier__store-type">Free Profiles</span>
                    </div>
                    <div className="inv-tier__store-vs">→</div>
                    <div className="inv-tier__store-paid">
                      <div className="inv-tier__store-item">
                        <span className="inv-tier__store-n inv-tier__store-n--paid">{t.standardStores}</span>
                        <span className="inv-tier__store-type">Standard $49</span>
                      </div>
                      <div className="inv-tier__store-item">
                        <span className="inv-tier__store-n inv-tier__store-n--premium">{t.premiumStores}</span>
                        <span className="inv-tier__store-type">Premium $149</span>
                      </div>
                    </div>
                  </div>
                  <div className="inv-tier__total-stores">
                    {t.paidStores} PAID · {fmt(t.freeStores)} FREE PROFILES
                  </div>

                  {/* End-user customers */}
                  <div className="inv-tier__section-label" style={{ marginTop: '12px' }}>
                    CONSUMER REACH
                  </div>
                  <div className="inv-tier__user-stat">
                    <span className="inv-tier__user-n">{fmt(t.freeUsers)}</span>
                    <span className="inv-tier__user-label">Free Mycana Users</span>
                  </div>
                  <div className="inv-tier__user-note">
                    ~{t.usersPerPaidStore} Mycana users/paid store<br />
                    {t.dispensaryCustomers}
                  </div>
                  <div className="inv-tier__user-note" style={{ marginTop: '4px', fontStyle: 'italic' }}>
                    {t.phaseNote}
                  </div>

                  {/* Revenue */}
                  <div className="inv-tier__section-label" style={{ marginTop: '12px' }}>
                    MONTHLY REVENUE
                  </div>
                  <div className="inv-tier__rev-row">
                    <span>Standard ({t.standardStores} × $49)</span>
                    <span>{fmtUSD(t.standardRev)}</span>
                  </div>
                  <div className="inv-tier__rev-row">
                    <span>Premium ({t.premiumStores} × $149)</span>
                    <span>{fmtUSD(t.premiumRev)}</span>
                  </div>
                  <div className="inv-tier__rev-row">
                    <span>Advertising (CPM)</span>
                    <span>{fmtUSD(t.adMonthly)}</span>
                  </div>
                  <div className="inv-tier__rev-total">
                    <span>TOTAL / MONTH</span>
                    <span>{fmtUSD(t.totalMonthly)}</span>
                  </div>
                  <div className="inv-tier__annual">Annual: {fmtUSD(t.totalAnnual)}</div>
                </div>

                <div className="inv-tier__payback">
                  <div className="inv-tier__payback-label">$100K SEED PAYBACK</div>
                  <div className="inv-tier__payback-val">{t.payback}</div>
                  <div className="inv-tier__payback-note">{t.paybackNote}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── DAO Data Value ── */}
        <section className="inv-section inv-section--dark">
          <div className="inv-section__label inv-section__label--light">
            DAO MEDICAL DATA MESH · YEAR 2+ REVENUE HORIZON
          </div>

          {/* Scope ladder: WNY → NY State → National */}
          <div className="inv-scope-bar">
            <div className="inv-scope-seg inv-scope-seg--1">
              <span className="inv-scope-seg__label">PHASE 1 · NOW</span>
              <span className="inv-scope-seg__val">WNY Launch</span>
              <span className="inv-scope-seg__sub">~60 dispensaries · 1.2M residents</span>
            </div>
            <div className="inv-scope-seg inv-scope-seg--2">
              <span className="inv-scope-seg__label">PHASE 2–3 · YEAR 1–2</span>
              <span className="inv-scope-seg__val">NY State</span>
              <span className="inv-scope-seg__sub">582 dispensaries · ~188K platform users</span>
            </div>
            <div className="inv-scope-seg inv-scope-seg--3">
              <span className="inv-scope-seg__label">PHASE 4 · YEAR 3+</span>
              <span className="inv-scope-seg__val">National Expansion</span>
              <span className="inv-scope-seg__sub">10K+ dispensaries · 3M users target</span>
            </div>
            <div className="inv-scope-seg inv-scope-seg--4">
              <span className="inv-scope-seg__label">DAO DATA ASSET</span>
              <span className="inv-scope-seg__val">$400M–$900M</span>
              <span className="inv-scope-seg__sub">Platform valuation at 3M user maturity</span>
            </div>
          </div>

          <p className="inv-dao-desc" style={{ marginTop: '24px' }}>
            Mycana's BiSlider experience-logging system is the only platform capturing before-and-after cannabinoid effect profiles — a dataset no competitor can replicate. Each user generates ~240 KB/year of research-grade cannabis health data. On the tokenized DAO mesh, pharma companies, research institutions, and clinical trial sponsors purchase KB-level data at market-set prices via smart contract. Users receive 60% of their data's value directly; Mycana retains 40% as protocol fees. <strong>Note: the 3M-user projections below represent national scale (Year 3+), not WNY or even NY State alone.</strong> NY Tier 4 (~188K users) is the immediate addressable scale from this seed investment.
          </p>

          <div className="inv-dao-grid">
            {DAO_SCENARIOS.map((s) => (
              <div
                key={s.label}
                className="inv-dao-card"
                style={{ '--dao-color': s.color }}
              >
                <div className="inv-dao-card__label">{s.label} SCENARIO</div>
                <div className="inv-dao-card__kb">{s.kb} data price</div>
                <div className="inv-dao-rows">
                  <div className="inv-dao-row">
                    <span>User earns / year (60%)</span>
                    <span>{s.userShare}</span>
                  </div>
                  <div className="inv-dao-row">
                    <span>Platform fee / user (40%)</span>
                    <span>{s.platformSharePer}</span>
                  </div>
                  <div className="inv-dao-row inv-dao-row--highlight">
                    <span>NY Tier 4 (~188K users)</span>
                    <span>{s.nyTier4}</span>
                  </div>
                  <div className="inv-dao-row inv-dao-row--highlight">
                    <span>National vision (3M users)</span>
                    <span>{s.national3m}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="inv-dao-compounding">
            <div className="inv-dao-comp-title">WHY DATA VALUE COMPOUNDS</div>
            <div className="inv-dao-comp-grid">
              {[
                { icon: '🔗', h: 'Network Effect Premium', d: '+30-50% price lift when you hold 15-20% of global cannabis users. Researchers pay premium for large, statistically representative cohorts.' },
                { icon: '📈', h: 'Longitudinal Compounding', d: 'Year 1 data = baseline. Year 2 = 2-3× value. Year 3+ = 5-10× value. Long-term efficacy patterns are rare and highly valued by pharma.' },
                { icon: '💊', h: 'Research Cohort Premiums', d: 'CBD for anxiety: $0.15-0.25/KB. THC:CBD pain ratios: $0.20-0.30/KB. Drug interaction data: $0.30-0.50/KB. Premium niches command premium prices.' },
                { icon: '⚖️', h: 'DAO Governance Floor', d: 'Token holders vote to maximize pricing. Smart contracts auto-adjust based on demand. Bulk licensing deals locked at premium rates as DAO matures.' },
              ].map((c) => (
                <div key={c.h} className="inv-dao-comp-card">
                  <span className="inv-dao-comp-icon">{c.icon}</span>
                  <div className="inv-dao-comp-h">{c.h}</div>
                  <div className="inv-dao-comp-d">{c.d}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="inv-dao-note">
            Cannabis pharmaceuticals market expected to reach <strong>$111.1B by 2032</strong> — creating insatiable demand for real-world evidence. Cannabis research data is scarce and proprietary. Regulatory moat: FDA and health agencies will increasingly require real-world evidence for cannabis approvals. Total platform data asset value at 3M users: <strong>$400M–$900M</strong> (5–10× annual revenue multiple common in data licensing).
          </div>
        </section>

        {/* ── Seed Capital ── */}
        <section className="inv-section">
          <div className="inv-section__label">$100,000 SEED CAPITAL ALLOCATION</div>
          <div className="inv-seed-total">
            <span className="inv-seed-total__n">$100K</span>
            <span className="inv-seed-total__label">Total Seed Ask · Designed for credit-leveraged business loans with sub-12-month payback at Tier 2+ adoption</span>
          </div>
          <div className="inv-seed-grid">
            {SEED.map((s) => (
              <div key={s.label} className="inv-seed-card">
                <div className="inv-seed-bar" style={{ width: `${s.pct}%`, background: s.color }} />
                <div className="inv-seed-content">
                  <div className="inv-seed-top">
                    <div>
                      <div className="inv-seed-label">{s.label}</div>
                      <ul className="inv-seed-items">
                        {s.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="inv-seed-right">
                      <div className="inv-seed-amount">{fmtUSD(s.amount)}</div>
                      <div className="inv-seed-pct">{s.pct}%</div>
                    </div>
                  </div>
                  <div className="inv-seed-prog">
                    <div className="inv-seed-prog-fill" style={{ width: `${s.pct}%`, background: s.color }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Year 2 Projection ── */}
        <section className="inv-section">
          <div className="inv-section__label">YEAR 2 REVENUE PROJECTION · NY STATE SUBSCRIPTIONS + DAO DATA LAYER</div>
          <div className="inv-section__sub" style={{ marginBottom: '16px' }}>
            DAO data revenue enters Year 2 as platform users accumulate longitudinal logging data. Platform retains 40% of KB-level data licensing fees.
          </div>
          <div className="inv-y2-grid">
            {TIERS.map((t) => {
              /* Platform's 40% share of data value: conservative $4.80/user/yr, realistic $11.52/user/yr */
              const daoLow  = Math.round(t.freeUsers * 4.80);
              const daoHigh = Math.round(t.freeUsers * 11.52);
              const y2Low   = t.totalAnnual + daoLow;
              const y2High  = t.totalAnnual + daoHigh;
              return (
                <div key={t.num} className="inv-y2-card" style={{ '--tier-color': t.color, '--tier-accent': t.accent }}>
                  <div className="inv-y2-tier">{t.num} · {t.adoptionPct} NY</div>
                  <div className="inv-y2-label">{t.label}</div>
                  <div className="inv-y2-row">
                    <span>Year 1 (Sub + Ads)</span>
                    <span>{fmtUSD(t.totalAnnual)}</span>
                  </div>
                  <div className="inv-y2-row">
                    <span>DAO Data ({fmt(t.freeUsers)} users × 40%)</span>
                    <span>+{fmtUSD(daoLow)}–{fmtUSD(daoHigh)}</span>
                  </div>
                  <div className="inv-y2-total">
                    <span>Year 2 Range</span>
                    <span>{fmtUSD(y2Low)}–{fmtUSD(y2High)}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <p style={{ marginTop: '12px', fontSize: '.78rem', color: 'var(--c-text-muted)', fontStyle: 'italic' }}>
            Note: 3M-user national scale DAO revenue ($14M–$72M/yr platform share) is a Year 3+ national expansion milestone — not included in NY State projections above.
          </p>
        </section>

        {/* ── Investor Takeaway ── */}
        <section className="inv-takeaway">
          <div className="inv-takeaway__icon">🌿</div>
          <div className="inv-takeaway__content">
            <div className="inv-takeaway__title">INVESTOR TAKEAWAY</div>
            <p className="inv-takeaway__text">
              Mycana's two-sided network creates immediate, predictable recurring revenue from day one. With 582 licensed NY dispensaries averaging $4M in annual sales, even 10% platform adoption generates over $63K in Year 1 — and 30% adoption returns the $100K seed within 7 months. At 55% adoption (Tier 3, our most-likely scenario based on the market's lack of existing digital tools), Mycana generates $368K annually with a 4-month seed payback. Investors leveraging credit for a $100K business loan see full payback well within the loan term at Tier 2+ levels. The DAO medical data layer then transforms a SaaS subscription business into a multi-million dollar data asset — reaching $7M–$108M in annual data revenue at full national scale (3M users). Total platform data asset value: <strong>$400M–$900M</strong> at 3M user maturity. This is a consumer wellness platform, a B2B vendor tool, and a medical data infrastructure play — three compounding revenue streams from a single $100K seed.
            </p>
          </div>
        </section>

      </div>

      {/* ── Footer ── */}
      <footer className="inv-footer">
        <span>🌿 Mycana</span>
        <span>·</span>
        <span>A product of</span>
        <a
          href="https://www.illyrobotic-ai.com"
          className="inv-footer__link"
          target="_blank"
          rel="noopener noreferrer"
        >
          Illy Robotic Instruments
        </a>
        <span>·</span>
        <Link to="/" className="inv-footer__link">mycanna-b2284.web.app</Link>
        <span>·</span>
        <span>For accredited investor review only · Not a public securities offering · Data projections are estimates</span>
      </footer>

    </div>
  );
}
