import { useState, useEffect } from 'react';
import { getStats } from '../services/userService.js';
import { getActiveCount, getTotalVisits } from '../services/presenceService.js';

function usePoll(fetchFn, intervalMs) {
  const [value, setValue] = useState(null);
  useEffect(() => {
    let alive = true;
    const run = () => fetchFn().then(v => { if (alive) setValue(v); }).catch(() => {});
    run();
    const t = setInterval(run, intervalMs);
    return () => { alive = false; clearInterval(t); };
  }, [fetchFn, intervalMs]);
  return value;
}

export default function EngagementCounter() {
  const [members, setMembers] = useState(null);

  // One-shot — member count changes rarely
  useEffect(() => {
    getStats()
      .then(s => setMembers(s?.totalUsers ?? 0))
      .catch(() => setMembers(0));
  }, []);

  // Poll visits + active count every 60 s
  const visits = usePoll(getTotalVisits, 60_000);
  const active = usePoll(getActiveCount, 60_000);

  const fmt = v => (v === null ? '…' : v.toLocaleString());

  return (
    <div className="engagement-counter" aria-label="Community stats">
      <span className="engagement-counter__stat">
        <strong>{fmt(visits)}</strong> visitors
      </span>
      <span className="engagement-counter__sep">·</span>
      <span className="engagement-counter__stat">
        <strong>{fmt(members)}</strong> members
      </span>
      <span className="engagement-counter__sep">·</span>
      <span className="engagement-counter__stat engagement-counter__stat--live">
        <span className="engagement-counter__dot" />
        <strong>{fmt(active)}</strong> active now
      </span>
    </div>
  );
}
