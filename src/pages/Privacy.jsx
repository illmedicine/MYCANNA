import { Link } from "react-router-dom";

const LAST_UPDATED = "August 2026";

const SECTIONS = [
  { id: "overview",      label: "Overview" },
  { id: "data",          label: "Data We Collect" },
  { id: "health",        label: "Health & Medical Data" },
  { id: "hipaa",         label: "HIPAA Disclosure" },
  { id: "dao",           label: "DAO Medical Data Mesh" },
  { id: "sovereignty",   label: "Your Data Rights" },
  { id: "security",      label: "Security" },
  { id: "sharing",       label: "Third-Party Sharing" },
  { id: "cookies",       label: "Cookies & Analytics" },
  { id: "minors",        label: "Age Restriction" },
  { id: "medical",       label: "Medical Disclaimer" },
  { id: "contact",       label: "Contact" },
];

export default function Privacy() {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="privacy-page">
      {/* ── Hero ── */}
      <div className="privacy-hero">
        <div className="privacy-hero__inner">
          <div className="privacy-hero__badge">Privacy & Data Policy</div>
          <h1 className="privacy-hero__title">Your Data.<br />Your Sovereignty.</h1>
          <p className="privacy-hero__sub">
            Mycana is built on the principle that individuals — not corporations — own their
            health data. This page explains exactly what we collect, how it flows through the
            Fair Data Sovereignty DAO, and every right you hold over your information.
          </p>
          <p className="privacy-hero__date">Last updated: {LAST_UPDATED}</p>
        </div>
      </div>

      {/* ── Layout ── */}
      <div className="privacy-layout">

        {/* Sidebar nav */}
        <nav className="privacy-nav">
          <div className="privacy-nav__label">On This Page</div>
          {SECTIONS.map(s => (
            <button key={s.id} className="privacy-nav__link" onClick={() => scrollTo(s.id)}>
              {s.label}
            </button>
          ))}
        </nav>

        {/* Body */}
        <article className="privacy-body">

          {/* ── Overview ── */}
          <section id="overview" className="privacy-section">
            <h2>Overview</h2>
            <p>
              Mycana ("we", "our", "the platform") is a cannabis wellness education tool
              operated by Illy Robotic AI. We help users understand their personal
              endocannabinoid profile through an 8-factor assessment system and experience
              logging. All guidance we provide is <strong>educational and informational only</strong> —
              not medical advice.
            </p>
            <p>
              We are committed to three core data principles:
            </p>
            <div className="privacy-principles">
              <div className="privacy-principle">
                <span className="privacy-principle__icon">🔒</span>
                <div>
                  <strong>Minimal Collection</strong>
                  <p>We collect only what is necessary to deliver your personalized profile and power the research mesh.</p>
                </div>
              </div>
              <div className="privacy-principle">
                <span className="privacy-principle__icon">⚖️</span>
                <div>
                  <strong>User Sovereignty</strong>
                  <p>You own your data. You can access, export, correct, or delete it at any time.</p>
                </div>
              </div>
              <div className="privacy-principle">
                <span className="privacy-principle__icon">🌐</span>
                <div>
                  <strong>Transparent Monetization</strong>
                  <p>If your anonymized data enters the research mesh, you receive 60–70% of its value directly.</p>
                </div>
              </div>
            </div>
          </section>

          {/* ── Data We Collect ── */}
          <section id="data" className="privacy-section">
            <h2>Data We Collect</h2>

            <div className="privacy-table-wrap">
              <table className="privacy-table">
                <thead>
                  <tr>
                    <th>Data Type</th>
                    <th>What We Store</th>
                    <th>Required?</th>
                    <th>Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Identity</strong></td>
                    <td>Name, email, Google profile picture (from Google OAuth)</td>
                    <td>Yes</td>
                    <td>Account authentication; your dashboard display name</td>
                  </tr>
                  <tr>
                    <td><strong>Assessment Responses</strong></td>
                    <td>8 BiSlider values (effect direction, THC sensitivity, CBD priority, anxiety tendency, experience level, terpene affinity, context, purpose) — numeric scores 0–100</td>
                    <td>Yes (to use profile)</td>
                    <td>Generates your cannabis archetype and all personalized guidance</td>
                  </tr>
                  <tr>
                    <td><strong>Health Data</strong></td>
                    <td>Age, weight, height, biological sex indicator, medical conditions (text list)</td>
                    <td>No — entirely optional</td>
                    <td>Deepens personalized AI insights; never required to use the platform</td>
                  </tr>
                  <tr>
                    <td><strong>Experience Logs</strong></td>
                    <td>Product name, strain, vendor, THC/CBD %, category, your BiSlider readings at time of use, rating (1–5), notes, optional product photos</td>
                    <td>No — user-initiated</td>
                    <td>Builds your personal pattern library; contributes (anonymized) to research mesh</td>
                  </tr>
                  <tr>
                    <td><strong>Usage Analytics</strong></td>
                    <td>Page visits, session presence (timestamp only), anonymous session ID</td>
                    <td>Yes</td>
                    <td>Platform health metrics, live visitor count; never tied to your identity</td>
                  </tr>
                  <tr>
                    <td><strong>Prestige Activity</strong></td>
                    <td>Points balance, level, logged actions (experience logs, assessment completion)</td>
                    <td>Auto-generated</td>
                    <td>Leaderboard ranking and reward eligibility</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="privacy-callout privacy-callout--info">
              <span>📋</span>
              <p>
                All user data is stored in <strong>Google Cloud Firestore</strong>, scoped to your individual
                authenticated user ID. No other user can access your data. Firestore rules are enforced
                server-side; they cannot be bypassed by client code.
              </p>
            </div>
          </section>

          {/* ── Health & Medical Data ── */}
          <section id="health" className="privacy-section">
            <h2>Health & Medical Data</h2>
            <p>
              When you choose to enter health information — including age, weight, and medical
              conditions — that data is treated with the highest level of sensitivity we apply
              to any information on the platform. Specifically:
            </p>
            <ul className="privacy-list">
              <li>Health data is <strong>entirely optional</strong>. You can use every Mycana feature without providing any health information.</li>
              <li>Medical condition entries are stored as a <strong>plain text list</strong> within your private Firestore document, accessible only to your authenticated account.</li>
              <li>Health data is <strong>never included in raw form</strong> in any research mesh, analytics export, or third-party transfer. It is used exclusively to generate your personalized AI insights within your session.</li>
              <li>When health data is contributed to the DAO research mesh, it is first <strong>de-identified and aggregated</strong> according to the Safe Harbor method outlined in 45 CFR §164.514(b). No record can be re-identified to you personally.</li>
              <li>You can delete your health data at any time from your dashboard (<em>Health Data → Edit → Clear</em>), and it will be permanently removed from our database within 72 hours.</li>
            </ul>

            <div className="privacy-callout privacy-callout--warn">
              <span>⚠️</span>
              <p>
                <strong>Do not enter information you consider confidential healthcare records</strong> into
                Mycana. Our platform is a wellness education tool, not a clinical system.
                Use our platform for general preference tracking, not as a medical record repository.
              </p>
            </div>
          </section>

          {/* ── HIPAA ── */}
          <section id="hipaa" className="privacy-section">
            <h2>HIPAA Disclosure</h2>

            <div className="privacy-callout privacy-callout--legal">
              <span>⚖️</span>
              <div>
                <strong>Mycana is not a HIPAA Covered Entity.</strong>
                <p>
                  The Health Insurance Portability and Accountability Act (HIPAA) applies to
                  "covered entities" — specifically: healthcare providers who transmit health
                  information electronically, health insurance plans, and healthcare clearinghouses —
                  and to their "business associates." Mycana is a cannabis wellness education
                  platform operated by a technology company. We are not a healthcare provider,
                  health plan, or clearinghouse, and we do not act as a business associate of
                  any covered entity. Therefore, <strong>HIPAA's Privacy Rule and Security Rule do not
                  legally apply to Mycana</strong>.
                </p>
              </div>
            </div>

            <p>
              This does not mean your health information is unprotected. It means the legal
              framework governing our obligations is different. The protections Mycana
              implements voluntarily include:
            </p>

            <div className="privacy-grid">
              <div className="privacy-grid-card">
                <strong>🔐 Encryption at Rest & Transit</strong>
                <p>All data in Firestore is encrypted at rest (AES-256) and in transit (TLS 1.3) by default via Google Cloud infrastructure.</p>
              </div>
              <div className="privacy-grid-card">
                <strong>🏠 Minimum Necessary Access</strong>
                <p>Server-side Firestore security rules enforce that each user can only read and write their own records. No cross-user data access is possible.</p>
              </div>
              <div className="privacy-grid-card">
                <strong>🚫 No Sale of Identified Health Data</strong>
                <p>We never sell, license, or share any health data that contains or could reasonably identify you as an individual.</p>
              </div>
              <div className="privacy-grid-card">
                <strong>📣 Breach Notification</strong>
                <p>If a data breach occurs that affects your health information, we will notify you via email within 72 hours of discovery, consistent with HIPAA-equivalent standards.</p>
              </div>
            </div>

            <h3>What Applicable Laws Do Apply</h3>
            <ul className="privacy-list">
              <li><strong>California Consumer Privacy Act (CCPA / CPRA)</strong> — If you are a California resident, you have rights to access, delete, correct, and opt out of the sale/sharing of your personal information. See <em>Your Data Rights</em> below.</li>
              <li><strong>GDPR (EU/EEA users)</strong> — If you are located in the European Union or European Economic Area, you have rights under the General Data Protection Regulation. Contact us at privacy@mycana.app to exercise these rights.</li>
              <li><strong>FTC Act (Section 5)</strong> — We are prohibited from making deceptive or unfair data practices. All representations in this policy are enforced under FTC authority.</li>
              <li><strong>State Cannabis Privacy Laws</strong> — Some U.S. states with adult-use cannabis programs have enacted additional consumer data protections for cannabis-related records. We comply with applicable state regulations in jurisdictions where we operate.</li>
            </ul>
          </section>

          {/* ── DAO Medical Data Mesh ── */}
          <section id="dao" className="privacy-section">
            <h2>DAO Medical Data Mesh</h2>
            <div className="privacy-dao-hero">
              <span className="privacy-dao-hero__icon">⛓️</span>
              <div>
                <h3>The Fair Data Sovereignty DAO</h3>
                <p>
                  Every Mycana user generates approximately <strong>240 KB/year</strong> of
                  research-grade cannabis health data through our BiSlider effect-logging system.
                  Historically, this type of behavioral and health data was collected by corporations
                  and monetized without users receiving any benefit. Mycana is different.
                </p>
              </div>
            </div>

            <h3>How the Research Mesh Works</h3>
            <p>
              On the tokenized DAO mesh, pharmaceutical companies, academic institutions, and
              cannabis research organizations can purchase access to <strong>de-identified,
              aggregated datasets</strong> derived from Mycana user activity. These buyers
              gain statistical insights — correlation patterns, effect profiles, condition
              correlations — but never access individual records.
            </p>

            <div className="privacy-flow">
              <div className="privacy-flow__step">
                <div className="privacy-flow__num">1</div>
                <div>
                  <strong>You Log an Experience</strong>
                  <p>Product, effects, and your personal BiSlider readings are stored in your private Firestore document.</p>
                </div>
              </div>
              <div className="privacy-flow__arrow">→</div>
              <div className="privacy-flow__step">
                <div className="privacy-flow__num">2</div>
                <div>
                  <strong>Anonymization & Aggregation</strong>
                  <p>Your record is stripped of all identifying information (name, email, account ID) and combined with others using Safe Harbor de-identification standards.</p>
                </div>
              </div>
              <div className="privacy-flow__arrow">→</div>
              <div className="privacy-flow__step">
                <div className="privacy-flow__num">3</div>
                <div>
                  <strong>Research Marketplace</strong>
                  <p>Institutions bid on specific data cohorts (e.g., "anxiety profiles + indica preferences in users 35–50"). Prices are set by market demand.</p>
                </div>
              </div>
              <div className="privacy-flow__arrow">→</div>
              <div className="privacy-flow__step">
                <div className="privacy-flow__num">4</div>
                <div>
                  <strong>Revenue Distribution</strong>
                  <p>60–70% flows to users whose data was included; 30–40% is retained by Mycana as protocol fees. Distribution is tracked on-chain for full transparency.</p>
                </div>
              </div>
            </div>

            <h3>Your Control Over DAO Participation</h3>
            <ul className="privacy-list">
              <li><strong>Opt-In Only</strong> — Contribution to the research mesh is opt-in. Until you explicitly enable it, your data is used only to power your own personalized experience within the app.</li>
              <li><strong>Granular Control</strong> — You can choose which data categories to contribute (assessment responses only, experience logs, health context) and exclude others.</li>
              <li><strong>Instant Opt-Out</strong> — You can remove yourself from the mesh at any time. Data already incorporated into sold aggregated datasets cannot be recalled (because de-identified aggregate data cannot be disaggregated), but no new contributions will be made after opt-out.</li>
              <li><strong>Revenue Attribution</strong> — Your share of data revenue is tracked via your DAO wallet address (if connected). You choose how and when to redeem it.</li>
            </ul>

            <div className="privacy-callout privacy-callout--info">
              <span>🔬</span>
              <p>
                The research value of cannabis health data is significant: there is a substantial
                gap in peer-reviewed literature on cannabis effects across diverse physiological
                profiles. By participating, you directly advance the science that makes cannabis
                guidance better for everyone — and you get paid for it.
              </p>
            </div>
          </section>

          {/* ── Data Rights ── */}
          <section id="sovereignty" className="privacy-section">
            <h2>Your Data Rights</h2>
            <p>
              Regardless of where you live, Mycana honors the following rights for all users:
            </p>

            <div className="privacy-rights">
              <div className="privacy-right">
                <strong>👁 Right to Access</strong>
                <p>Request a complete export of all data we hold about you. We will provide it in JSON format within 30 days.</p>
              </div>
              <div className="privacy-right">
                <strong>✏️ Right to Correct</strong>
                <p>Update any inaccurate personal information directly in your profile settings, or contact us to correct information you cannot edit yourself.</p>
              </div>
              <div className="privacy-right">
                <strong>🗑 Right to Delete</strong>
                <p>Request deletion of your account and all associated data. We will purge your Firestore document, experience logs, and profile data within 30 days. Aggregated, de-identified contributions to completed research sales cannot be recalled.</p>
              </div>
              <div className="privacy-right">
                <strong>📦 Right to Portability</strong>
                <p>Export your full profile, assessment history, and experience logs in machine-readable format at any time from your dashboard.</p>
              </div>
              <div className="privacy-right">
                <strong>🚫 Right to Opt Out</strong>
                <p>Opt out of DAO mesh participation, targeted data use, or any marketing communications at any time, effective immediately.</p>
              </div>
              <div className="privacy-right">
                <strong>⚠️ Right to Restrict</strong>
                <p>While a data dispute is under review, you may request that we restrict processing of your data to storage only.</p>
              </div>
            </div>

            <p style={{ marginTop: "1.5rem" }}>
              To exercise any of these rights, email{" "}
              <a href="mailto:privacy@mycana.app" className="privacy-link">privacy@mycana.app</a>{" "}
              or use the data controls in your account settings. California residents may also
              use the CCPA-mandated opt-out link in the footer.
            </p>
          </section>

          {/* ── Security ── */}
          <section id="security" className="privacy-section">
            <h2>Security</h2>
            <ul className="privacy-list">
              <li><strong>Authentication</strong> — We use Google OAuth 2.0. Mycana never stores passwords. Your authentication token is managed entirely by Google.</li>
              <li><strong>Database Security</strong> — Firestore security rules are server-enforced. Your document is readable and writable only by your authenticated UID. Rules are version-controlled and audited with each deployment.</li>
              <li><strong>Transport Security</strong> — All traffic is served over HTTPS (TLS 1.3). Firebase Hosting enforces HSTS headers.</li>
              <li><strong>No Raw API Keys in Client</strong> — Firebase configuration keys are scoped to our specific project and domain, enforced by Firebase App Check. Backend Cloud Functions use server-only credentials.</li>
              <li><strong>Image Storage</strong> — Product photos you upload are stored in Firebase Storage under your authenticated user path. Signed URLs expire after 1 hour.</li>
              <li><strong>Incident Response</strong> — We maintain a documented incident response plan. In the event of a breach affecting your data, you will be notified within 72 hours via email.</li>
            </ul>
          </section>

          {/* ── Third-Party Sharing ── */}
          <section id="sharing" className="privacy-section">
            <h2>Third-Party Sharing</h2>

            <div className="privacy-table-wrap">
              <table className="privacy-table">
                <thead>
                  <tr>
                    <th>Third Party</th>
                    <th>What They Receive</th>
                    <th>Purpose</th>
                    <th>Their Privacy Policy</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Google (Firebase)</strong></td>
                    <td>Your Google account identity (name, email, photo) used for authentication; your Firestore data stored in our database</td>
                    <td>Authentication, database, hosting, storage</td>
                    <td><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="privacy-link">policies.google.com/privacy</a></td>
                  </tr>
                  <tr>
                    <td><strong>DAO Research Partners</strong></td>
                    <td>De-identified, aggregated statistical datasets — no names, no account IDs, no raw medical conditions</td>
                    <td>Cannabis health research (opt-in only)</td>
                    <td>Governed by DAO data purchase agreements, available on request</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p>
              We do <strong>not</strong> sell your personal information to advertisers. We do not
              use behavioral ad targeting. We do not share your identified data with any third
              party not listed above.
            </p>
          </section>

          {/* ── Cookies ── */}
          <section id="cookies" className="privacy-section">
            <h2>Cookies & Analytics</h2>
            <p>
              Mycana does not use third-party advertising cookies. We use the following
              limited first-party mechanisms:
            </p>
            <ul className="privacy-list">
              <li><strong>Firebase Authentication Cookie</strong> — A session token managed by Google Firebase Auth. Required for login persistence. Expires when you sign out or after 30 days of inactivity.</li>
              <li><strong>localStorage</strong> — Used to store UI preferences (e.g., accordion state, onboarding flags) locally in your browser. Contains no personally identifying information and is never transmitted to our servers.</li>
              <li><strong>Presence Tracking</strong> — An anonymous session ID (no user link) writes a timestamp to Firestore every 60 seconds while you are active. Used to power the real-time "active users" counter. The session ID is regenerated on every new browser session.</li>
            </ul>
            <p>
              We do not use Google Analytics, Meta Pixel, or any advertising network tracking.
            </p>
          </section>

          {/* ── Age ── */}
          <section id="minors" className="privacy-section">
            <h2>Age Restriction</h2>
            <div className="privacy-callout privacy-callout--warn">
              <span>🔞</span>
              <p>
                <strong>Mycana is strictly for adults 21 years of age or older</strong> (or the
                minimum legal age for cannabis use in your jurisdiction, whichever is higher).
                We do not knowingly collect data from anyone under 18. If you believe a minor
                has created an account, contact{" "}
                <a href="mailto:privacy@mycana.app" className="privacy-link">privacy@mycana.app</a>{" "}
                immediately and we will delete the account within 24 hours.
              </p>
            </div>
          </section>

          {/* ── Medical Disclaimer ── */}
          <section id="medical" className="privacy-section">
            <h2>Medical Disclaimer</h2>

            <div className="privacy-callout privacy-callout--legal">
              <span>⚕️</span>
              <div>
                <strong>Mycana does not provide medical advice.</strong>
                <p>
                  All content, profiles, insights, scores, and recommendations generated by
                  Mycana — including AI Insights, archetype profiles, terpene matches, potency
                  guidance, and format recommendations — are provided for <strong>educational and
                  informational purposes only</strong>. They do not constitute medical advice,
                  diagnosis, or treatment.
                </p>
                <p style={{ marginTop: "0.75rem" }}>
                  Mycana is not a licensed healthcare provider, medical device, or clinical
                  decision support system. Our platform has not been evaluated or cleared by the
                  U.S. Food and Drug Administration (FDA) or any other regulatory body. Nothing
                  on Mycana should be used as a substitute for professional medical advice,
                  diagnosis, or treatment from a qualified healthcare provider.
                </p>
                <p style={{ marginTop: "0.75rem" }}>
                  <strong>If you have a medical condition</strong>, consult a licensed physician
                  before making any changes to your health regimen. Cannabis interacts with many
                  medications and conditions in ways that require medical supervision.
                  <strong> Cannabis remains a Schedule I controlled substance under federal U.S. law.</strong>{" "}
                  Mycana does not encourage or facilitate any illegal activity.
                </p>
              </div>
            </div>

            <h3>Specific Limitations</h3>
            <ul className="privacy-list">
              <li>Insights based on medical conditions you enter are generated by a rule-based algorithm, not by a physician or licensed clinician. They reflect general research literature, not a clinical assessment of your individual health.</li>
              <li>References to scientific studies and surveys within AI Insights are provided for educational context. Mycana makes no guarantees about the accuracy, completeness, or applicability of cited research to your specific situation.</li>
              <li>Cannabis laws vary by jurisdiction. It is your responsibility to understand and comply with the laws where you live. Mycana does not guarantee that any activity, product, or usage described on the platform is legal in your location.</li>
              <li>The DAO research dataset is intended for research institutions under proper IRB oversight. It is not intended to serve as a substitute for clinical trials or peer-reviewed studies.</li>
            </ul>
          </section>

          {/* ── Contact ── */}
          <section id="contact" className="privacy-section">
            <h2>Contact & Policy Updates</h2>
            <p>
              For any privacy-related questions, data requests, or concerns, contact:
            </p>
            <div className="privacy-contact-card">
              <div><strong>Mycana Privacy</strong></div>
              <div>Illy Robotic AI</div>
              <div>
                <a href="mailto:privacy@mycana.app" className="privacy-link">privacy@mycana.app</a>
              </div>
              <div>
                <a href="mailto:dwilson@illyrobotic-ai.com" className="privacy-link">dwilson@illyrobotic-ai.com</a>
              </div>
            </div>

            <p style={{ marginTop: "1.5rem" }}>
              We reserve the right to update this policy at any time. When we make material
              changes, we will notify registered users via email at least 30 days before the
              changes take effect. Continued use of Mycana after the effective date constitutes
              your acceptance of the updated policy. The current version is always available
              at <code>/privacy</code>.
            </p>

            <p className="privacy-legal-note">
              This privacy policy was last reviewed and updated in {LAST_UPDATED}.
              It is intended to comply with CCPA, GDPR (to the extent Mycana has EU users),
              and applicable U.S. state privacy laws. It does not create a legally binding
              contract and should be reviewed by qualified legal counsel for your specific
              jurisdiction and use case.
            </p>
          </section>

          {/* ── Footer links ── */}
          <div className="privacy-footer-links">
            <Link to="/" className="privacy-link">← Back to Mycana</Link>
            <Link to="/dashboard" className="privacy-link">Dashboard</Link>
          </div>

        </article>
      </div>
    </div>
  );
}
