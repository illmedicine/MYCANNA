import { useState, useEffect, useCallback } from 'react';

const EVENTS = [
  { icon: '🌿', text: 'Marcus from Buffalo just joined Mycana' },
  { icon: '📊', text: 'Keisha just completed her cannabis profile' },
  { icon: '📝', text: 'Tyler logged Northern Lights · rated 9/10' },
  { icon: '🏆', text: 'Amanda earned Seasoned Explorer status' },
  { icon: '🗺️', text: 'Jordan found a vendor match in Amherst' },
  { icon: '👥', text: '14 people are browsing profiles right now' },
  { icon: '🌿', text: 'Priya from Cheektowaga just joined Mycana' },
  { icon: '📊', text: 'Devon completed the 8-factor assessment' },
  { icon: '📝', text: 'Simone logged Blue Dream · great experience' },
  { icon: '🏆', text: 'Chris just reached Certified Connoisseur' },
  { icon: '👥', text: '23 WNY residents joined this week' },
  { icon: '🌿', text: 'Ray from Tonawanda just discovered their profile' },
  { icon: '📝', text: 'Alex logged Gelato #33 · matched their profile' },
  { icon: '🗺️', text: 'A new dispensary is joining Mycana soon' },
  { icon: '🏆', text: 'Destiny reached 500 prestige points' },
];

const SHOW_MS  = 5000;
const GAP_MS   = 1800;
const DELAY_MS = 8000; // initial delay before first toast

export default function LiveActivity() {
  const [idx,     setIdx]     = useState(0);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const next = useCallback((current) => {
    setVisible(false);
    setTimeout(() => {
      setIdx((current + 1) % EVENTS.length);
      setVisible(true);
    }, GAP_MS);
  }, []);

  useEffect(() => {
    if (dismissed) return;

    // Initial delay so the page doesn't immediately pop something on load
    const init = setTimeout(() => {
      setMounted(true);
      setVisible(true);
    }, DELAY_MS);

    return () => clearTimeout(init);
  }, [dismissed]);

  useEffect(() => {
    if (!mounted || !visible || dismissed) return;

    const timer = setTimeout(() => next(idx), SHOW_MS);
    return () => clearTimeout(timer);
  }, [mounted, visible, idx, dismissed, next]);

  if (!mounted || dismissed) return null;

  const event = EVENTS[idx];

  return (
    <div
      className={`live-toast ${visible ? 'live-toast--in' : 'live-toast--out'}`}
      role="status"
      aria-live="polite"
    >
      <div className="live-toast__live">
        <span className="live-toast__dot" />
        LIVE
      </div>
      <div className="live-toast__icon">{event.icon}</div>
      <div className="live-toast__text">{event.text}</div>
      <button
        className="live-toast__close"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
