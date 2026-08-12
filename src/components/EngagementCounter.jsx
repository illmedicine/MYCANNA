import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase.js';
import { getStats } from '../services/userService.js';
import { getTotalVisits } from '../services/presenceService.js';

const ACTIVE_WINDOW_MS = 2 * 60_000; // match presenceService.js

// Simple polling hook for aggregate counts that can't use onSnapshot
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
  const [active, setActive] = useState(null);

  // Real-time active count: onSnapshot fires the moment any presence doc changes.
  // We filter client-side with the current timestamp so stale docs don't count.
  // A 30s interval re-evaluates the cached snapshot to age out sessions that
  // stopped heartbeating without triggering a beforeunload cleanup.
  useEffect(() => {
    let alive = true;
    let cachedDocs = [];

    const recount = () => {
      const cutoff = Date.now() - ACTIVE_WINDOW_MS;
      return cachedDocs.filter(d => {
        const ls = d.data().lastSeen;
        return ls && ls.toMillis() >= cutoff;
      }).length;
    };

    const unsub = onSnapshot(
      collection(db, 'presence'),
      (snap) => { if (alive) { cachedDocs = snap.docs; setActive(recount()); } },
      () => {}
    );

    // Re-evaluate every 30s to let aged-out sessions drop from the count
    const t = setInterval(() => { if (alive) setActive(recount()); }, 30_000);

    return () => { alive = false; unsub(); clearInterval(t); };
  }, []);

  // Poll visitor total every 60s (aggregate — can't use onSnapshot)
  const visits = usePoll(getTotalVisits, 60_000);

  // Poll member count every 60s so new sign-ons appear within a minute
  const [members, setMembers] = useState(null);
  useEffect(() => {
    let alive = true;
    const run = () => getStats()
      .then(s => { if (alive) setMembers(s?.totalUsers ?? 0); })
      .catch(() => {});
    run();
    const t = setInterval(run, 60_000);
    return () => { alive = false; clearInterval(t); };
  }, []);

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
