import { useState, useEffect, useRef } from 'react';
import { getStats } from '../services/userService.js';

const ACTIVE_NOW = 18; // real presence tracking is a future feature

function useCountUp(target, duration = 1400, active = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active || target === 0) return;
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [active, target, duration]);

  return count;
}

export default function EngagementCounter() {
  const ref = useRef(null);
  const [triggered, setTriggered] = useState(false);
  const [totalUsers, setTotalUsers] = useState(null);

  useEffect(() => {
    getStats().then((s) => setTotalUsers(s.totalUsers ?? 0));
  }, []);

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

  const displayUsers = useCountUp(totalUsers ?? 0, 1400, triggered && totalUsers !== null);
  const displayActive = useCountUp(ACTIVE_NOW, 900, triggered);

  if (totalUsers === null) return null;

  return (
    <div className="engagement-counter" ref={ref} aria-label="Community stats">
      <span className="engagement-counter__stat">
        <strong>{triggered ? displayUsers.toLocaleString() : '0'}</strong> members joined
      </span>
      <span className="engagement-counter__sep">·</span>
      <span className="engagement-counter__stat engagement-counter__stat--live">
        <span className="engagement-counter__dot" />
        <strong>{triggered ? displayActive : '0'}</strong> active now
      </span>
    </div>
  );
}
