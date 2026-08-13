import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import './Contact.css';

// Web Audio click — mechanical toggle feel
function playClick() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.06), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.007));
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const g = ctx.createGain();
    g.gain.value = 0.28;
    src.connect(g);
    g.connect(ctx.destination);
    src.start();
    setTimeout(() => ctx.close(), 400);
  } catch {}
}

function makeVCard(name, title, email) {
  const [last, ...first] = name.split(' ').reverse();
  return [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${name}`,
    `N:${last};${first.reverse().join(' ')};;;`,
    `TITLE:${title}`,
    'ORG:Mycana',
    `EMAIL:${email}`,
    'URL:https://mycana.info',
    'END:VCARD',
  ].join('\n');
}

const PANELS = {
  sales: {
    key: 'sales',
    path: '/contact/sales',
    toggleLabel: 'Sales & Marketing',
    person: 'John C Girdlestone',
    role: 'Co-Founder · Chief Marketing Strategist & Visionary',
    avatar: '/avatars/johnavatar.png',
    email: 'jcgstone@yahoo.com',
    emailSubject: 'Mycana Business Inquiry',
    qrContent: makeVCard(
      'John C Girdlestone',
      'Co-Founder, Chief Marketing Strategist',
      'jcgstone@yahoo.com'
    ),
    reasons: [
      { icon: '📣', text: 'Brand Partnerships & Co-Marketing' },
      { icon: '🏪', text: 'Retail & Dispensary Advertising' },
      { icon: '📊', text: 'Promotional Campaign Programs' },
      { icon: '🤝', text: 'Sales Inquiries & Vendor Outreach' },
      { icon: '📱', text: 'Media Placements & Sponsorships' },
      { icon: '🎉', text: 'Launch Events & Community Activation' },
    ],
    cta: 'Email John Directly',
    tagline: 'Reach out about partnerships, advertising, or sales opportunities.',
  },
  tech: {
    key: 'tech',
    path: '/contact/tech',
    toggleLabel: 'Tech Support',
    person: 'DeMarkus D Wilson',
    role: 'Co-Founder · CTO & Lead Engineer',
    avatar: '/avatars/demarkusavatar.png',
    email: 'dwilson@illyrobotic-ai.com',
    emailSubject: 'Mycana Technical Support',
    qrContent: makeVCard(
      'DeMarkus D Wilson',
      'Co-Founder, CTO & Lead Engineer',
      'dwilson@illyrobotic-ai.com'
    ),
    reasons: [
      { icon: '📦', text: 'Bulk Product Catalog Onboarding' },
      { icon: '💡', text: 'Feature Requests & Roadmap Ideas' },
      { icon: '🐛', text: 'Bug Reports & Platform Issues' },
      { icon: '⚙️', text: 'Technical Integration & API Access' },
      { icon: '🔧', text: 'Platform Setup & Configuration' },
      { icon: '🚀', text: 'Request Developer Support' },
    ],
    cta: 'Email DeMarkus Directly',
    tagline: 'Built on precision. Backed by support — reach out for any technical need.',
  },
};

export default function Contact() {
  const location = useLocation();
  const navigate  = useNavigate();
  const isTech    = location.pathname.includes('/tech');
  const panel     = isTech ? PANELS.tech : PANELS.sales;
  const [qrDataUrl, setQrDataUrl] = useState('');

  // Redirect bare /contact → /contact/sales
  useEffect(() => {
    if (location.pathname === '/contact') navigate('/contact/sales', { replace: true });
  }, [location.pathname, navigate]);

  // Regenerate QR whenever panel switches
  useEffect(() => {
    QRCode.toDataURL(panel.qrContent, {
      width: 220,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark:  isTech ? '#1a3329' : '#5c3d00',
        light: isTech ? '#c8e0cc' : '#faf3e5',
      },
    }).then(setQrDataUrl).catch(() => {});
  }, [panel.qrContent, isTech]);

  function handleToggle() {
    playClick();
    navigate(isTech ? PANELS.sales.path : PANELS.tech.path);
  }

  const mailto = `mailto:${panel.email}?subject=${encodeURIComponent(panel.emailSubject)}`;

  return (
    <div className={`ct-pg ct-pg--${panel.key}`}>
      <div className="ct-wrap">

        <h1 className="ct-page-title">
          <span className="ct-title-accent">CONTACT</span> THE TEAM
        </h1>

        {/* ── Toggle switch ── */}
        <div className="ct-toggle-bar" role="group" aria-label="Contact department">
          <span className={`ct-toggle-lbl${!isTech ? ' ct-toggle-lbl--active' : ''}`}>
            Sales &amp; Marketing
          </span>

          <button
            className={`ct-toggle ct-toggle--${isTech ? 'right' : 'left'}`}
            onClick={handleToggle}
            aria-pressed={isTech}
            aria-label="Switch contact department"
          >
            <span className="ct-toggle__track" />
            <span className="ct-toggle__knob" />
          </button>

          <span className={`ct-toggle-lbl${isTech ? ' ct-toggle-lbl--active' : ''}`}>
            Tech Support
          </span>
        </div>

        {/* ── Main card ── */}
        <div className="ct-card">

          {/* Left — identity */}
          <div className="ct-identity">
            <div className="ct-avatar-wrap">
              <img
                src={panel.avatar}
                alt={panel.person}
                className="ct-avatar"
              />
            </div>
            <div className="ct-name">{panel.person}</div>
            <div className="ct-role">{panel.role}</div>
            <a href={mailto} className="ct-email-badge">
              {panel.email}
            </a>
          </div>

          {/* Right — reasons + CTA */}
          <div className="ct-details">
            <div className="ct-sect-label">REASONS TO REACH OUT</div>
            <ul className="ct-reasons">
              {panel.reasons.map((r, i) => (
                <li key={i} className="ct-reason">
                  <span className="ct-reason__icon" aria-hidden="true">{r.icon}</span>
                  <span className="ct-reason__text">{r.text}</span>
                </li>
              ))}
            </ul>
            <p className="ct-tagline">{panel.tagline}</p>
            <a href={mailto} className="ct-cta-btn">
              {panel.cta} →
            </a>
          </div>

        </div>{/* /ct-card */}

        {/* ── QR Business Card ── */}
        <div className="ct-qr-section">
          <div className="ct-qr-frame">
            <div className="ct-qr-eyebrow">BUSINESS CARD — SCAN TO SAVE CONTACT</div>
            {qrDataUrl
              ? <img src={qrDataUrl} alt={`Contact QR for ${panel.person}`} className="ct-qr-img" />
              : <div className="ct-qr-placeholder">Generating…</div>
            }
            <div className="ct-qr-name">{panel.person}</div>
            <div className="ct-qr-email">{panel.email}</div>
          </div>
        </div>

      </div>{/* /ct-wrap */}
    </div>
  );
}
