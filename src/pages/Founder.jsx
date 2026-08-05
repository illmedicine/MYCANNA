export default function Founder() {
  return (
    <div className="founder">

      {/* HERO */}
      <div className="founder__hero">
        <img
          className="founder__hero-photo"
          src="/john-girdlestone.jpg"
          alt="John Girdlestone — Mycana Co-Founder"
        />
        <div className="founder__hero-gradient" />
        <div className="founder__hero-spine" />
        <div className="founder__hero-content">
          <div className="founder__eyebrow">Mycana Co-Founder &amp; Visionary</div>
          <h1 className="founder__hero-name">
            GIRDLE<em>STONE</em>
          </h1>
          <p className="founder__hero-deck">
            The girdle that holds these rocks together.<br />
            Where structural dexterity meets rock-solid principles.
          </p>
          <div className="founder__chips">
            <span className="founder__chip">Cannabis Industry</span>
            <span className="founder__chip">⚓ Navy Veteran</span>
            <span className="founder__chip">Co-Founder, Fenway</span>
            <span className="founder__chip">Regional Lead, FaM NY Co.</span>
            <span className="founder__chip">Western New York</span>
          </div>
        </div>
      </div>

      {/* STAT STRIP */}
      <div className="founder__stats">
        {[
          { n: "15+", l: "Yrs in Cannabis" },
          { n: "2",   l: "Co-Founded" },
          { n: "USN", l: "Navy Veteran" },
          { n: "WNY", l: "Regional Lead" },
          { n: "∞",   l: "Rock-Solid Takes" },
        ].map((s) => (
          <div key={s.l} className="founder__stat">
            <span className="founder__stat-n">{s.n}</span>
            <span className="founder__stat-l">{s.l}</span>
          </div>
        ))}
      </div>

      {/* BEDROCK SECTION */}
      <section className="founder__section founder__section--alt">
        <div className="founder__wrap founder__split">
          <div className="founder__copy">
            <div className="founder__eyebrow">The Foundation</div>
            <h2 className="founder__h2">The <em>Bedrock</em><br />Credentials</h2>
            <p>
              Some people build on solid ground. John Girdlestone <em>is</em> the solid
              ground. With years in the cannabis industry before it was fashionable —
              and frankly, before half of it was even legal — John has been laying
              foundations while everyone else was still reading the blueprint.
            </p>
            <p>
              Co-founder of Fenway. Regional Lead at FaM NY Co. dispensary.
              Cannabis SEO architect. Legislative advocate. NY cannabis legislation
              expert. The man has more layers than the geological record his last name
              implies, and somehow none of them are limestone. We asked. He confirmed.
            </p>
            <p>
              His expertise spans the full spectrum: ethics, legalization, compliance,
              legislation — the kind of market intelligence that only comes from being
              in the room, or the grow room, when the decisions were being made.
            </p>
          </div>
          <div className="founder__photo-wrap">
            <img
              className="founder__split-photo"
              src="/john-girdlestone.jpg"
              alt="John Girdlestone"
            />
            <div className="founder__photo-cap">The Rock Himself</div>
          </div>
        </div>
      </section>

      {/* PULL QUOTE 1 */}
      <blockquote className="founder__pq">
        <div className="founder__pq-inner">
          <span className="founder__pq-mark">&ldquo;</span>
          <p className="founder__pq-text">
            He doesn&apos;t just talk about the industry shifting — he&apos;s been one
            of the tectonic plates doing the shifting. Quietly. Steadily. The way rocks do.
          </p>
          <div className="founder__pq-attr">
            DeMarkus Wilson &nbsp;&middot;&nbsp; Founder, illyRobotic Instruments
          </div>
        </div>
      </blockquote>

      {/* CREDENTIALS GRID */}
      <section className="founder__section">
        <div className="founder__wrap">
          <div className="founder__eyebrow">Load-Bearing Expertise</div>
          <h2 className="founder__h2">Chiseled From <em>Experience</em></h2>
          <div className="founder__creds">
            {[
              { icon: "🏗️", title: "Co-Founder, Fenway", body: "Built from the ground up. Because that's what you do when your name is Girdlestone — you start with the foundation and you do not cut corners on the rebar." },
              { icon: "📍", title: "Regional Lead · FaM NY Co.", body: "Holding down Western New York's cannabis corridor with the quiet authority of someone who's been here the whole time. Because he has." },
              { icon: "🔍", title: "Cannabis SEO Pioneer", body: "Before the algorithms knew what to do with cannabis, John was telling them how. Medical. Recreational. He's fluent in both — and the legislation between them." },
              { icon: "⚖️", title: "Legislation & Ethics", body: "Years advocating for responsible NY legalization. Knows the regulatory landscape the way a geologist knows strata — by pressure, depth, and time." },
              { icon: "🌿", title: "Mycana Co-Founder", body: "The industry knowledge behind the profile engine. He knew exactly what was missing from cannabis discovery before we built the thing that fills the gap." },
              { icon: "🎯", title: "Market Intelligence", body: "The kind that can't be Googled. Built from years of watching, doing, failing, rebuilding — and then doing it significantly better. Granite-d. That's a pun. We're committed." },
            ].map((c) => (
              <div key={c.title} className="founder__cred">
                <div className="founder__cred-icon">{c.icon}</div>
                <div className="founder__cred-title">{c.title}</div>
                <div className="founder__cred-body">{c.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NAVY SECTION */}
      <section className="founder__section founder__section--navy">
        <div className="founder__wrap">
          <div className="founder__eyebrow founder__eyebrow--navy">Anchored in Service</div>
          <h2 className="founder__h2">Stone Cold<br /><em className="founder__em-navy">Sailor</em></h2>
          <p>
            Before the dispensaries, before the SEO, before any of this — there was
            the Navy. John Girdlestone served his country. So did his father.
            Two generations of people who understood that structure, discipline, and
            knowing exactly how much pressure a load-bearing element can take before
            it bends are not abstract concepts.
          </p>
          <p>
            That doesn&apos;t leave you. It shows up in how John operates — methodical,
            principled, and absolutely not the guy who panics when things get rocky.
            (We&apos;re doing this the whole page. Accept it.)
          </p>
          <p>
            Family of service. Family of integrity. Both of which, if you squint hard
            enough, are structural engineering terms.
          </p>
        </div>
      </section>

      {/* PULL QUOTE 2 */}
      <blockquote className="founder__pq founder__pq--alt">
        <div className="founder__pq-inner">
          <span className="founder__pq-mark">&ldquo;</span>
          <p className="founder__pq-text">
            Structural dexterity. Rock-solid principles. Two kids who will absolutely
            roll their eyes at this website. The full package.
          </p>
          <div className="founder__pq-attr">
            Mycana &nbsp;&middot;&nbsp; Official Founder Bio &nbsp;&middot;&nbsp; Not At All Peer-Reviewed
          </div>
        </div>
      </blockquote>

      {/* PERSONAL SECTION */}
      <section className="founder__section founder__section--alt">
        <div className="founder__wrap founder__split founder__split--rev">
          <div className="founder__photo-wrap">
            <img
              className="founder__split-photo founder__split-photo--right"
              src="/john-girdlestone.jpg"
              alt="John Girdlestone"
            />
          </div>
          <div className="founder__copy">
            <div className="founder__eyebrow">Off the Clock</div>
            <h2 className="founder__h2">The <em>Human</em><br />Behind the Stone</h2>
            <p>
              Here&apos;s what the LinkedIn version won&apos;t tell you: John Girdlestone
              is, by all credible accounts, a genuinely good human. Father of two.
              A man who shows up — not just at industry events, but for the people around
              him. The kind of friend you can call, and who picks up.
            </p>
            <p>
              DeMarkus Wilson — the creator of Mycana and founder of{" "}
              <a
                href="https://www.illyrobotic-ai.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="founder__link"
              >
                illyRobotic Instruments
              </a>{" "}
              — has known John for years and will tell you without hesitation that
              building this platform for John is an honor. That&apos;s not marketing copy.
              That&apos;s just what happens when the right person asks you to build
              something worth building.
            </p>
            <p>
              Two kids. Years of hard-won expertise. A beard that has clearly achieved
              sentience and made its own decisions about direction. A father who also
              served. The man contains multitudes. Mostly igneous.
            </p>
            <div className="founder__personal-grid">
              {[
                { icon: "👨‍👧‍👦", title: "Father of Two",      sub: "The most load-bearing title on this page." },
                { icon: "🤝",    title: "Community Builder", sub: "WNY's scene didn't build itself. John helped." },
                { icon: "🧭",    title: "Principled Operator",sub: "Ethics aren't a checkbox. They're the blueprint." },
                { icon: "🪨",    title: "Actual Girdlestone", sub: "Not just a metaphor. Although also a metaphor." },
              ].map((item) => (
                <div key={item.title} className="founder__personal-item">
                  <div className="founder__personal-icon">{item.icon}</div>
                  <div className="founder__personal-title">{item.title}</div>
                  <div className="founder__personal-sub">{item.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FINAL PULL QUOTE */}
      <blockquote className="founder__pq">
        <div className="founder__pq-inner">
          <span className="founder__pq-mark">&ldquo;</span>
          <p className="founder__pq-text">
            Mycana exists because the cannabis industry needed someone who understood
            it deeply enough to know what was missing. That&apos;s John.
            He&apos;s the cornerstone. Everything else is just architecture.
          </p>
          <div className="founder__pq-attr">
            DeMarkus Wilson &nbsp;&middot;&nbsp;{" "}
            <a
              href="https://www.illyrobotic-ai.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="founder__link"
            >
              illyRobotic Instruments
            </a>
            {" "}&nbsp;&middot;&nbsp; Proud to Build This
          </div>
        </div>
      </blockquote>

      {/* PAGE FOOTER */}
      <footer className="founder__footer">
        <div className="founder__footer-brand">🌿 Mycana</div>
        <div className="founder__footer-credit">
          Conceived &amp; built by{" "}
          <a
            href="https://www.illyrobotic-ai.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="founder__link"
          >
            DeMarkus Wilson · illyRobotic Instruments
          </a>
          <br />
          <span className="founder__footer-copy">
            © 2025 Mycana · Western New York&apos;s Cannabis Profile Platform
          </span>
        </div>
      </footer>

    </div>
  );
}
