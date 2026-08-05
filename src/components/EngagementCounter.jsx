import { useState, useEffect, useRef } from 'react';

// Seeded numbers — swap for real Firestore aggregates later
const PROFILES_TOTAL = 2847;
const ACTIVE_NOW     = 18;

function useCountUp(target, duration = 1400, active = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [active, target, duration]);

  return count;
}

export default function EngagementCounter() {
  const ref  = useRef(null);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setTriggered(true); obs.disconnect(); } },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const profiles = useCountUp(PROFILES_TOTAL, 1400, triggered);
  const active   = useCountUp(ACTIVE_NOW,     900,  triggered);

  return (
    <div className="engagement-counter" ref={ref} aria-label="Community stats">
      <span className="engagement-counter__pulse" />
      <span className="engagement-counter__stat">
        <strong>{triggered ? profiles.toLocaleString() : '0'}</strong> profiles created
      </span>
      <span className="engagement-counter__sep">·</span>
      <span className="engagement-counter__stat engagement-counter__stat--live">
        <span className="engagement-counter__dot" />
        <strong>{triggered ? active : '0'}</strong> active now
      </span>
    </div>
  );
}
