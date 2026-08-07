import { useState, useEffect, useRef, useCallback } from 'react';
import { subscribeActivity, formatActivity } from '../services/activityService.js';

const SHOW_MS = 5000;
const GAP_MS  = 700;
const INITIAL_DELAY_MS = 6000; // wait before showing the first historical event

export default function LiveActivity() {
  const [current,   setCurrent]   = useState(null);
  const [visible,   setVisible]   = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const showing  = useRef(false);
  const queue    = useRef([]);
  const timerRef = useRef(null);

  const showEvent = useCallback((event) => {
    if (dismissed) return;
    const formatted = formatActivity(event);
    if (!formatted) return;

    showing.current = true;
    setCurrent(formatted);
    setVisible(true);

    timerRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        showing.current = false;
        setCurrent(null);
        if (queue.current.length > 0) {
          showEvent(queue.current.shift());
        }
      }, GAP_MS);
    }, SHOW_MS);
  }, [dismissed]);

  const enqueue = useCallback((event) => {
    if (dismissed) return;
    if (showing.current) {
      queue.current.push(event);
    } else {
      showEvent(event);
    }
  }, [dismissed, showEvent]);

  useEffect(() => {
    if (dismissed) return;

    let initTimer = null;

    const unsub = subscribeActivity({
      onInitial: (event) => {
        // Show the most recent real event after the initial page-load delay
        initTimer = setTimeout(() => enqueue(event), INITIAL_DELAY_MS);
      },
      onLive: (event) => {
        // New real platform event — show immediately (or queue)
        enqueue(event);
      },
    });

    return () => {
      unsub();
      clearTimeout(initTimer);
      clearTimeout(timerRef.current);
    };
  }, [dismissed, enqueue]);

  if (!current) return null;

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
      <div className="live-toast__icon">{current.icon}</div>
      <div className="live-toast__text">{current.text}</div>
      <button
        className="live-toast__close"
        onClick={() => { setDismissed(true); setCurrent(null); }}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
