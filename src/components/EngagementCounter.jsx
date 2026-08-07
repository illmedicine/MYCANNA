import { useState, useEffect, useRef } from 'react';
import { getStats } from '../services/userService.js';

const ACTIVE_NOW = 18;

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
  const [totalUsers, setTotalUsers] = useState(null); // null = still loading

  useEffect(() => {
    getStats()
      .then((s) => setTotalUsers(s.totalUsers ?? 0))
      .catch(() => setTotalUsers(0));
  }, []);

  // IntersectionObserver — runs once on mount when the element IS in the DOM
  // because we no longer return null before this renders.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setTriggered(true); obs.disconnect(); } },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // When Firestore data arrives, check if the element is already visible
  // and trigger the animation immediately (handles above-the-fold placement).
  useEffect(() => {
    if (totalUsers === null || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) setTriggered(true);
  }, [totalUsers]);

  const displayUsers  = useCountUp(totalUsers ?? 0, 1400, triggered && totalUsers !== null);
  const displayActive = useCountUp(ACTIVE_NOW, 900, triggered);

  // Always render so the ref stays attached and the IntersectionObserver works.
  // Show a neutral placeholder while Firestore resolves.
  const userDisplay = totalUsers === null
    ? '…'
    : triggered ? displayUsers.toLocaleString() : totalUsers.toLocaleString();

  return (
    <div className="engagement-counter" ref={ref} aria-label="Community stats">
      <span className="engagement-counter__stat">
        <strong>{userDisplay}</strong> members joined
      </span>
      <span className="engagement-counter__sep">·</span>
      <span className="engagement-counter__stat engagement-counter__stat--live">
        <span className="engagement-counter__dot" />
        <strong>{triggered ? displayActive : ACTIVE_NOW}</strong> active now
      </span>
    </div>
  );
}
