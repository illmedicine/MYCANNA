import { useRef, useEffect, useState, useCallback } from 'react';
import { playSliderSound, valueToLevel } from '../utils/sliderSounds.js';

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function interpolateColor(colorA, colorB, t) {
  const [r1, g1, b1] = hexToRgb(colorA);
  const [r2, g2, b2] = hexToRgb(colorB);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r},${g},${b})`;
}

export default function BiSlider({
  id,
  label,
  description,
  leftLabel,
  rightLabel,
  leftEmoji,
  rightEmoji,
  value,
  onChange,
  min = 0,
  max = 100,
  leftColor = '#6366f1',
  rightColor = '#10b981',
  readonly = false,
}) {
  const inputRef   = useRef(null);
  const prevLevel  = useRef(valueToLevel(value)); // init silently — no sound on mount
  const [dragging, setDragging] = useState(false);

  // Reset level tracking whenever the slider identity changes (e.g. Assessment stepping through questions)
  useEffect(() => {
    prevLevel.current = valueToLevel(value);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  const percent    = ((value - min) / (max - min)) * 100;
  const thumbColor = interpolateColor(leftColor, rightColor, percent / 100);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.background = `linear-gradient(to right,
      ${leftColor} 0%,
      ${thumbColor} ${percent}%,
      rgba(255,255,255,0.18) ${percent}%,
      rgba(255,255,255,0.18) 100%)`;
  }, [value, leftColor, rightColor, percent, thumbColor]);

  const handleChange = (e) => {
    const newVal   = Number(e.target.value);
    const newLevel = valueToLevel(newVal);
    // Only fire sound when crossing a level threshold (every 20 pts)
    if (!readonly && id && newLevel !== prevLevel.current) {
      prevLevel.current = newLevel;
      playSliderSound(id, newVal);
    }
    onChange?.(newVal);
  };

  return (
    <div className={`bi-slider ${dragging ? 'bi-slider--dragging' : ''}`}>
      <div className="bi-slider__header">
        <p className="bi-slider__label">{label}</p>
        {description && <p className="bi-slider__desc">{description}</p>}
      </div>

      <div className="bi-slider__body">
        <div className="bi-slider__end bi-slider__end--left">
          <span className="bi-slider__emoji">{leftEmoji}</span>
          <span className="bi-slider__end-label">{leftLabel}</span>
        </div>

        <div className="bi-slider__track-wrap">
          <div
            className="bi-slider__bubble"
            style={{
              left: `${percent}%`,
              transform: `translateX(-50%) ${dragging ? 'scale(1.15)' : 'scale(1)'}`,
              background: thumbColor,
            }}
          >
            {Math.round(percent)}
          </div>
          <input
            ref={inputRef}
            type="range"
            min={min}
            max={max}
            value={value}
            disabled={readonly}
            className="bi-slider__input"
            style={{ '--thumb-color': thumbColor }}
            onChange={handleChange}
            onMouseDown={() => setDragging(true)}
            onMouseUp={() => setDragging(false)}
            onTouchStart={() => setDragging(true)}
            onTouchEnd={() => setDragging(false)}
          />
          <div className="bi-slider__ticks">
            {[0, 25, 50, 75, 100].map((t) => (
              <div
                key={t}
                className="bi-slider__tick"
                style={{ left: `${t}%`, opacity: Math.abs(percent - t) < 8 ? 0 : 0.35 }}
              />
            ))}
          </div>
        </div>

        <div className="bi-slider__end bi-slider__end--right">
          <span className="bi-slider__emoji">{rightEmoji}</span>
          <span className="bi-slider__end-label">{rightLabel}</span>
        </div>
      </div>
    </div>
  );
}
