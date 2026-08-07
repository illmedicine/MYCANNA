import { useState, useEffect } from 'react';
import { getStats } from '../services/userService.js';

const ACTIVE_NOW = 18;

export default function EngagementCounter() {
  const [totalUsers, setTotalUsers] = useState(null);

  useEffect(() => {
    getStats()
      .then((s) => setTotalUsers(s?.totalUsers ?? 0))
      .catch(() => setTotalUsers(0));
  }, []);

  // Show placeholder while Firestore resolves; then show real number
  const userDisplay = totalUsers === null ? '…' : totalUsers.toLocaleString();

  return (
    <div className="engagement-counter" aria-label="Community stats">
      <span className="engagement-counter__stat">
        <strong>{userDisplay}</strong> members joined
      </span>
      <span className="engagement-counter__sep">·</span>
      <span className="engagement-counter__stat engagement-counter__stat--live">
        <span className="engagement-counter__dot" />
        <strong>{ACTIVE_NOW}</strong> active now
      </span>
    </div>
  );
}
