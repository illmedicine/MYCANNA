import { useState, useMemo, useRef, useCallback } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import "./FounderCalc.css";

const ADMIN_EMAILS = [
  'dwilson@illyrobotic-ai.com',
  'jcgstone@yahoo.com',
  'jcgstone@gmail.com',
  'demarkuswilsone@gmail.com',
];
const STANDARD_PRICE = 49;
const PREMIUM_PRICE  = 149;
const MAX_STORES     = 700;
const TICKS          = [1, 50, 100, 200, 300, 400, 500, 600, 700];
const MILESTONES     = new Set([100, 200, 300, 400, 500, 600, 700]);

function fmtDollar(n) { return '$' + Math.round(n).toLocaleString(); }

/* ─── Sound engine ───────────────────────────────────────────────── */
const _snd = { t: 0 };
function playTick(stores, dir) {
  const now = Date.now();
  if (now - _snd.t < 75) return;
  _snd.t = now;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (stores >= MAX_STORES && dir === 'up') {
      [[0,.523],[.1,.659],[.2,.784],[.32,1.047],[.46,1.319]].forEach(([t,f]) => {
        const o=ctx.createOscillator(),g=ctx.createGain();
        o.connect(g);g.connect(ctx.destination);
        o.type='sine';o.frequency.value=f*1000;
        g.gain.setValueAtTime(.22,ctx.currentTime+t);
        g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+t+.45);
        o.start(ctx.currentTime+t);o.stop(ctx.currentTime+t+.48);
      });
    } else if (MILESTONES.has(stores) && dir === 'up') {
      [880,1047].forEach((f,i)=>{
        const o=ctx.createOscillator(),g=ctx.createGain();
        o.connect(g);g.connect(ctx.destination);
        o.type='sine';o.frequency.value=f;
        g.gain.setValueAtTime(.16,ctx.currentTime+i*.12);
        g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+i*.12+.35);
        o.start(ctx.currentTime+i*.12);o.stop(ctx.currentTime+i*.12+.38);
      });
    } else {
      const base = 260+(stores/MAX_STORES)*460;
      const freq = dir==='up' ? base : base*.72;
      const o=ctx.createOscillator(),g=ctx.createGain();
      o.connect(g);g.connect(ctx.destination);
      o.type='sine';o.frequency.value=freq;
      if(dir==='down') o.frequency.exponentialRampToValueAtTime(freq*.8,ctx.currentTime+.1);
      g.gain.setValueAtTime(.08,ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.13);
      o.start();o.stop(ctx.currentTime+.15);
    }
  } catch {}
}

/* ═══════════════════════════════════════════════════════════════════
   DEMARKUS HEAD  — plush felt puppet style
   ═══════════════════════════════════════════════════════════════════ */
function DeMarkusHead({ anim='', size=110 }) {
  return (
    <svg className={`fc-head fc-head--de ${anim}`}
         viewBox="0 0 180 200" width={size} style={{height:'auto'}}
         xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="dh-face" cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#c87840"/>
          <stop offset="40%" stopColor="#8c4e1e"/>
          <stop offset="80%" stopColor="#5c2e0e"/>
          <stop offset="100%" stopColor="#3a1a06"/>
        </radialGradient>
        <radialGradient id="dh-chain-link" cx="30%" cy="28%" r="70%">
          <stop offset="0%" stopColor="#f8f8f8"/>
          <stop offset="35%" stopColor="#d0d0d0"/>
          <stop offset="70%" stopColor="#909090"/>
          <stop offset="100%" stopColor="#606060"/>
        </radialGradient>
        <radialGradient id="dh-ear" cx="60%" cy="38%" r="65%">
          <stop offset="0%" stopColor="#b06835"/>
          <stop offset="100%" stopColor="#5c2e0e"/>
        </radialGradient>
        <filter id="dh-shadow" x="-15%" y="-15%" width="130%" height="140%">
          <feGaussianBlur stdDeviation="5" in="SourceAlpha" result="blur"/>
          <feOffset dx="2" dy="6" result="shadow"/>
          <feFlood floodColor="rgba(0,0,0,0.45)" result="color"/>
          <feComposite in="color" in2="shadow" operator="in" result="coloredShadow"/>
          <feMerge><feMergeNode in="coloredShadow"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      <g filter="url(#dh-shadow)">
        <rect x="66" y="158" width="48" height="38" rx="20" fill="#8c4e1e"/>
        <rect x="68" y="158" width="44" height="28" rx="18" fill="#7a4018"/>
        <ellipse cx="18" cy="110" rx="18" ry="22" fill="#8c4e1e"/>
        <ellipse cx="162" cy="110" rx="18" ry="22" fill="#8c4e1e"/>
        <ellipse cx="18" cy="110" rx="10" ry="14" fill="url(#dh-ear)"/>
        <ellipse cx="162" cy="110" rx="10" ry="14" fill="url(#dh-ear)"/>
        <path d="M13 103 Q18 110 13 117" stroke="rgba(0,0,0,0.3)" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M167 103 Q162 110 167 117" stroke="rgba(0,0,0,0.3)" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <ellipse cx="90" cy="100" rx="75" ry="80" fill="#3a1a06" opacity="0.35"/>
        <ellipse cx="90" cy="96" rx="73" ry="77" fill="url(#dh-face)"/>
        <ellipse cx="70" cy="48" rx="38" ry="28" fill="rgba(220,140,70,0.18)" transform="rotate(-15 70 48)"/>
        <ellipse cx="62" cy="40" rx="20" ry="13" fill="rgba(255,190,110,0.10)"/>
        <path d="M48 30 Q90 18 132 30" stroke="rgba(0,0,0,0.12)" strokeWidth="1.5" fill="none"/>
        {/* Eyebrows */}
        <rect x="42" y="74" width="36" height="9" rx="4.5" fill="#2a1008" transform="rotate(-8 60 78)"/>
        <rect x="102" y="74" width="36" height="9" rx="4.5" fill="#2a1008" transform="rotate(8 120 78)"/>
        {/* Eyes — sclera + iris + pupil matching reference figures */}
        <ellipse cx="62" cy="96" rx="15" ry="13" fill="#f5efe6"/>
        <ellipse cx="118" cy="96" rx="15" ry="13" fill="#f5efe6"/>
        <circle cx="63" cy="97" r="9.5" fill="#3a1e0a"/>
        <circle cx="119" cy="97" r="9.5" fill="#3a1e0a"/>
        <circle cx="63" cy="97" r="5.5" fill="#080200"/>
        <circle cx="119" cy="97" r="5.5" fill="#080200"/>
        <circle cx="58.5" cy="93" r="2.8" fill="rgba(255,255,255,0.92)"/>
        <circle cx="114.5" cy="93" r="2.8" fill="rgba(255,255,255,0.92)"/>
        {/* Nose — subtle */}
        <ellipse cx="90" cy="116" rx="10" ry="7" fill="rgba(0,0,0,0.18)"/>
        <ellipse cx="84" cy="119" rx="5" ry="4.5" fill="rgba(0,0,0,0.22)"/>
        <ellipse cx="96" cy="119" rx="5" ry="4.5" fill="rgba(0,0,0,0.22)"/>
        {/* Open smile with teeth */}
        <path d="M56 132 Q90 160 124 132 Q119 153 90 157 Q61 153 56 132 Z" fill="#1e0a04"/>
        <path d="M62 133 Q90 157 118 133 Q113 149 90 153 Q67 149 62 133 Z" fill="#f2ede2"/>
        <line x1="90" y1="134" x2="90" y2="152" stroke="rgba(190,185,175,0.45)" strokeWidth="1.2"/>
        <line x1="76" y1="134" x2="75" y2="151" stroke="rgba(190,185,175,0.38)" strokeWidth="1"/>
        <line x1="104" y1="134" x2="105" y2="151" stroke="rgba(190,185,175,0.38)" strokeWidth="1"/>
        {/* Lips */}
        <path d="M55 131 Q72 124 90 129 Q108 124 125 131" stroke="#2a0e04" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
        <path d="M62 155 Q90 165 118 155" stroke="#2a0e04" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        {/* Chin stubble shadow */}
        <ellipse cx="90" cy="166" rx="36" ry="13" fill="rgba(12,4,0,0.2)"/>
        {/* Chunky chain */}
        <path d="M30 172 Q90 195 150 172" stroke="rgba(0,0,0,0.35)" strokeWidth="20" fill="none" strokeLinecap="round"/>
        <path d="M30 170 Q90 193 150 170" stroke="#888" strokeWidth="16" fill="none" strokeLinecap="round"/>
        <path d="M32 167 Q90 189 148 167" stroke="url(#dh-chain-link)" strokeWidth="12" fill="none" strokeLinecap="round"/>
        <path d="M34 164 Q90 186 146 164" stroke="rgba(255,255,255,0.5)" strokeWidth="4" fill="none" strokeLinecap="round"/>
        {[
          {cx:34,cy:170,rx:9,ry:7},{cx:50,cy:175,rx:9,ry:7},{cx:66,cy:179,rx:9,ry:7},
          {cx:78,cy:181,rx:8,ry:6.5},{cx:90,cy:182,rx:8,ry:6.5},{cx:102,cy:181,rx:8,ry:6.5},
          {cx:114,cy:179,rx:9,ry:7},{cx:130,cy:175,rx:9,ry:7},{cx:146,cy:170,rx:9,ry:7},
        ].map(({cx,cy,rx,ry},i) => (
          <g key={i}>
            <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke="#606060" strokeWidth="2.5"/>
            <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke="#d8d8d8" strokeWidth="1.5"/>
            <ellipse cx={cx-rx*0.25} cy={cy-ry*0.3} rx={rx*0.45} ry={ry*0.35} fill="rgba(255,255,255,0.7)"/>
          </g>
        ))}
        {/* Wrench badge */}
        <g transform="translate(145,28)">
          <circle cx="0" cy="0" r="17" fill="#1c3d1e" stroke="#c8a415" strokeWidth="2"/>
          <circle cx="0" cy="0" r="13" fill="#1a3a1a"/>
          <rect x="-3.5" y="-10" width="7" height="18" rx="3.5" fill="#d4a820"/>
          <circle cx="0" cy="-10" r="7" fill="#d4a820"/>
          <circle cx="0" cy="-10" r="3.5" fill="#1a3a1a"/>
          <rect x="-2.5" y="8" width="5" height="6" rx="2.5" fill="#d4a820"/>
        </g>
      </g>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   JOHN HEAD  — plush felt puppet style
   ═══════════════════════════════════════════════════════════════════ */
function JohnHead({ anim='', size=110 }) {
  return (
    <svg className={`fc-head fc-head--john ${anim}`}
         viewBox="0 0 180 210" width={size} style={{height:'auto'}}
         xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="jh-face" cx="38%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#f0c88a"/>
          <stop offset="45%" stopColor="#d4a060"/>
          <stop offset="80%" stopColor="#a87038"/>
          <stop offset="100%" stopColor="#7a4e20"/>
        </radialGradient>
        <radialGradient id="jh-beard" cx="35%" cy="22%" r="72%">
          <stop offset="0%" stopColor="#ffffff"/>
          <stop offset="35%" stopColor="#eeece4"/>
          <stop offset="70%" stopColor="#d8d4c8"/>
          <stop offset="100%" stopColor="#bab6aa"/>
        </radialGradient>
        <radialGradient id="jh-cap" cx="32%" cy="28%" r="68%">
          <stop offset="0%" stopColor="#3a7840"/>
          <stop offset="55%" stopColor="#1e4824"/>
          <stop offset="100%" stopColor="#0d2212"/>
        </radialGradient>
        <radialGradient id="jh-ear" cx="55%" cy="38%" r="65%">
          <stop offset="0%" stopColor="#e0a870"/>
          <stop offset="100%" stopColor="#8a5030"/>
        </radialGradient>
        <filter id="jh-shadow" x="-15%" y="-15%" width="130%" height="140%">
          <feGaussianBlur stdDeviation="5" in="SourceAlpha" result="blur"/>
          <feOffset dx="2" dy="6" result="shadow"/>
          <feFlood floodColor="rgba(0,0,0,0.4)" result="color"/>
          <feComposite in="color" in2="shadow" operator="in" result="coloredShadow"/>
          <feMerge><feMergeNode in="coloredShadow"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="jh-beard-soft">
          <feGaussianBlur stdDeviation="2.5" in="SourceGraphic" result="blurred"/>
          <feMerge><feMergeNode in="blurred"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      <g filter="url(#jh-shadow)">
        <rect x="68" y="168" width="44" height="38" rx="20" fill="#c4906a"/>
        <rect x="70" y="168" width="40" height="28" rx="18" fill="#b87e58"/>
        {/* Cap */}
        <ellipse cx="90" cy="42" rx="75" ry="40" fill="#0d2212"/>
        <ellipse cx="90" cy="32" rx="62" ry="33" fill="url(#jh-cap)"/>
        <path d="M15 38 Q-8 36 -10 50 Q-10 62 18 58 Q28 53 26 44 Z" fill="#0d2212"/>
        <ellipse cx="68" cy="24" rx="30" ry="18" fill="rgba(255,255,255,0.08)" transform="rotate(-10 68 24)"/>
        <path d="M20 44 Q90 60 160 44" stroke="rgba(0,0,0,0.2)" strokeWidth="2" fill="none"/>
        <text x="90" y="38" textAnchor="middle" fontSize="18" fontWeight="900"
              fill="rgba(200,164,21,0.9)" fontFamily="Georgia,serif" letterSpacing="-1">M</text>
        <path d="M90 10 L90 60" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" fill="none"/>
        <path d="M55 12 Q68 36 68 60" stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="none"/>
        <path d="M125 12 Q112 36 112 60" stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="none"/>
        {/* Ears */}
        <ellipse cx="16" cy="115" rx="17" ry="21" fill="#c4906a"/>
        <ellipse cx="164" cy="115" rx="17" ry="21" fill="#c4906a"/>
        <ellipse cx="16" cy="115" rx="10" ry="13" fill="url(#jh-ear)"/>
        <ellipse cx="164" cy="115" rx="10" ry="13" fill="url(#jh-ear)"/>
        <path d="M11 108 Q16 115 11 122" stroke="rgba(0,0,0,0.25)" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        <path d="M169 108 Q164 115 169 122" stroke="rgba(0,0,0,0.25)" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        {/* Head */}
        <ellipse cx="90" cy="108" rx="77" ry="75" fill="#7a4e20" opacity="0.3"/>
        <ellipse cx="90" cy="104" rx="75" ry="72" fill="url(#jh-face)"/>
        <ellipse cx="68" cy="72" rx="32" ry="25" fill="rgba(255,220,160,0.14)" transform="rotate(-12 68 72)"/>
        {/* Felt-frame glasses — thick frames, button eyes behind */}
        <circle cx="65" cy="108" r="22" fill="none" stroke="#1a0e04" strokeWidth="5.5"/>
        <circle cx="115" cy="108" r="22" fill="none" stroke="#1a0e04" strokeWidth="5.5"/>
        <path d="M87 108 L93 108" stroke="#1a0e04" strokeWidth="5" strokeLinecap="round"/>
        <path d="M16 108 L43 108" stroke="#1a0e04" strokeWidth="4" strokeLinecap="round"/>
        <path d="M137 108 L164 108" stroke="#1a0e04" strokeWidth="4" strokeLinecap="round"/>
        {/* Eyes inside glasses — sclera + iris + pupil */}
        <ellipse cx="65" cy="108" rx="13" ry="12" fill="#f5efe6"/>
        <ellipse cx="115" cy="108" rx="13" ry="12" fill="#f5efe6"/>
        <circle cx="65" cy="109" r="8.5" fill="#4a3020"/>
        <circle cx="115" cy="109" r="8.5" fill="#4a3020"/>
        <circle cx="65" cy="109" r="5" fill="#080400"/>
        <circle cx="115" cy="109" r="5" fill="#080400"/>
        <circle cx="61" cy="105" r="2.5" fill="rgba(255,255,255,0.9)"/>
        <circle cx="111" cy="105" r="2.5" fill="rgba(255,255,255,0.9)"/>
        {/* Massive fluffy beard */}
        <ellipse cx="93" cy="162" rx="78" ry="58" fill="#909090" opacity="0.4" filter="url(#jh-beard-soft)"/>
        <ellipse cx="90" cy="158" rx="75" ry="54" fill="url(#jh-beard)"/>
        <ellipse cx="38" cy="132" rx="20" ry="18" fill="#eeeae0" filter="url(#jh-beard-soft)"/>
        <ellipse cx="62" cy="126" rx="22" ry="20" fill="#f5f2e8" filter="url(#jh-beard-soft)"/>
        <ellipse cx="90" cy="124" rx="24" ry="21" fill="#ffffff" filter="url(#jh-beard-soft)"/>
        <ellipse cx="118" cy="126" rx="22" ry="20" fill="#f5f2e8" filter="url(#jh-beard-soft)"/>
        <ellipse cx="142" cy="132" rx="20" ry="18" fill="#eeeae0" filter="url(#jh-beard-soft)"/>
        <ellipse cx="55" cy="195" rx="22" ry="20" fill="#dedad0" filter="url(#jh-beard-soft)"/>
        <ellipse cx="90" cy="200" rx="25" ry="20" fill="#e8e4da" filter="url(#jh-beard-soft)"/>
        <ellipse cx="125" cy="195" rx="22" ry="20" fill="#dedad0" filter="url(#jh-beard-soft)"/>
        <ellipse cx="68" cy="140" rx="28" ry="22" fill="rgba(255,255,255,0.22)" transform="rotate(-8 68 140)"/>
        {[38,52,68,84,90,96,112,128,142].map((x,i)=>{
          const yS=128+(Math.abs(i-4)*2);
          return <path key={x} d={`M${x} ${yS} Q${x+4} ${yS+25} ${x-3} ${yS+50}`}
                       stroke="rgba(180,174,160,0.35)" strokeWidth="2" fill="none" strokeLinecap="round"/>;
        })}
        <path d="M62 134 Q90 144 118 134" stroke="#d8d4c8" strokeWidth="7" fill="none" strokeLinecap="round"/>
        <path d="M65 132 Q90 140 115 132" stroke="rgba(90,70,40,0.4)" strokeWidth="3" fill="none" strokeLinecap="round"/>
        {/* Megaphone badge */}
        <g transform="translate(145,28)">
          <circle cx="0" cy="0" r="17" fill="#1c3d1e" stroke="#c8a415" strokeWidth="2"/>
          <circle cx="0" cy="0" r="13" fill="#1a3a1a"/>
          <path d="M-9 -5 L-3 -5 L6 -11 L6 11 L-3 5 L-9 5 Z" fill="#d4a820"/>
          <path d="M6 -11 Q15 0 6 11" stroke="#d4a820" strokeWidth="3" fill="none" strokeLinecap="round"/>
          <path d="M9 -7 Q16 0 9 7" stroke="#c8a415" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.7"/>
          <rect x="-12" y="3" width="5" height="7" rx="2.5" fill="#d4a820"/>
        </g>
      </g>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   DEMARKUS BODY  — full plush puppet figure
   ═══════════════════════════════════════════════════════════════════ */
function DeMarkusBody({ anim='', size=185 }) {
  return (
    <svg className={`fc-body fc-body--de ${anim}`}
         viewBox="0 0 200 340" width={size} style={{height:'auto'}}
         xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="db-face" cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#c87840"/>
          <stop offset="40%" stopColor="#8c4e1e"/>
          <stop offset="80%" stopColor="#5c2e0e"/>
          <stop offset="100%" stopColor="#3a1a06"/>
        </radialGradient>
        <radialGradient id="db-skin-hand" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#b06835"/>
          <stop offset="100%" stopColor="#6a3810"/>
        </radialGradient>
        <radialGradient id="db-sweater" cx="32%" cy="28%" r="68%">
          <stop offset="0%" stopColor="#faf8f0"/>
          <stop offset="45%" stopColor="#e8e4d8"/>
          <stop offset="80%" stopColor="#ccc8bc"/>
          <stop offset="100%" stopColor="#b0aca0"/>
        </radialGradient>
        <radialGradient id="db-jeans" cx="35%" cy="25%" r="68%">
          <stop offset="0%" stopColor="#6a92c0"/>
          <stop offset="55%" stopColor="#4268a0"/>
          <stop offset="100%" stopColor="#254878"/>
        </radialGradient>
        <radialGradient id="db-chain-body" cx="30%" cy="28%" r="70%">
          <stop offset="0%" stopColor="#ffffff"/>
          <stop offset="40%" stopColor="#d8d8d8"/>
          <stop offset="75%" stopColor="#909090"/>
          <stop offset="100%" stopColor="#606060"/>
        </radialGradient>
        <radialGradient id="db-ear" cx="60%" cy="38%" r="65%">
          <stop offset="0%" stopColor="#b06835"/>
          <stop offset="100%" stopColor="#5c2e0e"/>
        </radialGradient>
        <pattern id="db-knit" x="0" y="0" width="12" height="14" patternUnits="userSpaceOnUse">
          <path d="M0,1 Q3,7 6,1 Q9,7 12,1" stroke="rgba(175,172,162,0.5)" strokeWidth="1.2" fill="none"/>
          <path d="M-6,8 Q-3,14 0,8 Q3,14 6,8 Q9,14 12,8 Q15,14 18,8" stroke="rgba(175,172,162,0.5)" strokeWidth="1.2" fill="none"/>
        </pattern>
        <filter id="db-shadow" x="-12%" y="-8%" width="124%" height="130%">
          <feGaussianBlur stdDeviation="6" in="SourceAlpha" result="blur"/>
          <feOffset dx="3" dy="8" result="shadow"/>
          <feFlood floodColor="rgba(0,0,0,0.5)" result="color"/>
          <feComposite in="color" in2="shadow" operator="in" result="coloredShadow"/>
          <feMerge><feMergeNode in="coloredShadow"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      <g filter="url(#db-shadow)">
        {/* Ears */}
        <ellipse cx="36" cy="100" rx="18" ry="22" fill="#8c4e1e"/>
        <ellipse cx="164" cy="100" rx="18" ry="22" fill="#8c4e1e"/>
        <ellipse cx="36" cy="100" rx="10" ry="14" fill="url(#db-ear)"/>
        <ellipse cx="164" cy="100" rx="10" ry="14" fill="url(#db-ear)"/>
        {/* Neck */}
        <rect x="78" y="158" width="44" height="22" rx="18" fill="#7a4018"/>
        {/* Head */}
        <ellipse cx="102" cy="98" rx="68" ry="72" fill="#1a0800" opacity="0.35"/>
        <ellipse cx="100" cy="93" rx="66" ry="69" fill="url(#db-face)"/>
        <ellipse cx="78" cy="48" rx="36" ry="27" fill="rgba(220,140,70,0.17)" transform="rotate(-15 78 48)"/>
        <ellipse cx="68" cy="38" rx="18" ry="12" fill="rgba(255,190,110,0.09)"/>
        {/* Brows */}
        <rect x="50" y="75" width="38" height="10" rx="5" fill="#2a1008" transform="rotate(-7 69 80)"/>
        <rect x="112" y="75" width="38" height="10" rx="5" fill="#2a1008" transform="rotate(7 131 80)"/>
        {/* Eyes — sclera + iris + pupil */}
        <ellipse cx="72" cy="95" rx="16" ry="14" fill="#f5efe6"/>
        <ellipse cx="128" cy="95" rx="16" ry="14" fill="#f5efe6"/>
        <circle cx="73" cy="96" r="10" fill="#3a1e0a"/>
        <circle cx="129" cy="96" r="10" fill="#3a1e0a"/>
        <circle cx="73" cy="96" r="6" fill="#080200"/>
        <circle cx="129" cy="96" r="6" fill="#080200"/>
        <circle cx="68.5" cy="92" r="3" fill="rgba(255,255,255,0.92)"/>
        <circle cx="124.5" cy="92" r="3" fill="rgba(255,255,255,0.92)"/>
        {/* Nose — subtle */}
        <ellipse cx="100" cy="116" rx="10" ry="7" fill="rgba(0,0,0,0.18)"/>
        <ellipse cx="93" cy="119" rx="5" ry="4.5" fill="rgba(0,0,0,0.2)"/>
        <ellipse cx="107" cy="119" rx="5" ry="4.5" fill="rgba(0,0,0,0.2)"/>
        {/* Open smile with teeth */}
        <path d="M64 135 Q100 164 136 135 Q131 156 100 160 Q69 156 64 135 Z" fill="#1e0a04"/>
        <path d="M71 136 Q100 162 129 136 Q124 152 100 156 Q76 152 71 136 Z" fill="#f2ede2"/>
        <line x1="100" y1="137" x2="100" y2="155" stroke="rgba(190,185,175,0.45)" strokeWidth="1.2"/>
        <line x1="86" y1="137" x2="85" y2="154" stroke="rgba(190,185,175,0.38)" strokeWidth="1"/>
        <line x1="114" y1="137" x2="115" y2="154" stroke="rgba(190,185,175,0.38)" strokeWidth="1"/>
        {/* Lips */}
        <path d="M63 133 Q81 126 100 131 Q119 126 137 133" stroke="#2a0e04" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
        <path d="M72 158 Q100 168 128 158" stroke="#2a0e04" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        {/* Chin stubble shadow */}
        <ellipse cx="100" cy="170" rx="42" ry="14" fill="rgba(12,4,0,0.2)"/>
        {/* Chunky chain */}
        <path d="M38 180 Q100 206 162 180" stroke="rgba(0,0,0,0.45)" strokeWidth="24" fill="none" strokeLinecap="round"/>
        <path d="M38 178 Q100 204 162 178" stroke="#787878" strokeWidth="18" fill="none" strokeLinecap="round"/>
        <path d="M40 174 Q100 199 160 174" stroke="url(#db-chain-body)" strokeWidth="14" fill="none" strokeLinecap="round"/>
        <path d="M42 171 Q100 195 158 171" stroke="rgba(255,255,255,0.55)" strokeWidth="5" fill="none" strokeLinecap="round"/>
        {[
          {cx:44,cy:178,rx:12,ry:9},{cx:62,cy:185,rx:11,ry:8.5},{cx:78,cy:190,rx:11,ry:8},
          {cx:90,cy:193,rx:10,ry:8},{cx:100,cy:194,rx:10,ry:8},{cx:110,cy:193,rx:10,ry:8},
          {cx:122,cy:190,rx:11,ry:8},{cx:138,cy:185,rx:11,ry:8.5},{cx:156,cy:178,rx:12,ry:9},
        ].map(({cx,cy,rx,ry},i) => (
          <g key={i}>
            <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke="#505050" strokeWidth="3.5"/>
            <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke="#cccccc" strokeWidth="1.8"/>
            <ellipse cx={cx-rx*0.3} cy={cy-ry*0.35} rx={rx*0.5} ry={ry*0.4} fill="rgba(255,255,255,0.65)"/>
          </g>
        ))}
        {/* Sweater body */}
        <ellipse cx="102" cy="248" rx="78" ry="62" fill="rgba(0,0,0,0.25)"/>
        <rect x="38" y="206" width="124" height="100" rx="34" fill="url(#db-sweater)"/>
        <rect x="38" y="206" width="124" height="100" rx="34" fill="url(#db-knit)" opacity="0.9"/>
        <ellipse cx="78" cy="228" rx="35" ry="24" fill="rgba(255,255,255,0.18)" transform="rotate(-8 78 228)"/>
        <rect x="38" y="280" width="124" height="28" rx="0 0 34 34" fill="rgba(0,0,0,0.12)"/>
        {/* JD badge */}
        <g transform="translate(100,248)">
          <circle cx="0" cy="0" r="16" fill="#1c4020" stroke="#c8a415" strokeWidth="2"/>
          <circle cx="0" cy="0" r="12" fill="#183518"/>
          <text x="0" y="5" textAnchor="middle" fontSize="13" fontWeight="900"
                fill="#c8a415" fontFamily="Georgia,serif">JD</text>
        </g>
        <path d="M68 206 Q100 200 132 206" stroke="rgba(170,168,158,0.5)" strokeWidth="2" fill="none"/>
        {/* Left arm — screwdriver */}
        <ellipse cx="40" cy="218" rx="22" ry="20" fill="url(#db-sweater)"/>
        <rect x="8" y="210" width="38" height="68" rx="19" fill="url(#db-sweater)"/>
        <rect x="8" y="210" width="38" height="68" rx="19" fill="url(#db-knit)" opacity="0.8"/>
        <ellipse cx="27" cy="278" rx="20" ry="19" fill="url(#db-sweater)"/>
        <ellipse cx="27" cy="298" rx="17" ry="16" fill="url(#db-skin-hand)"/>
        <ellipse cx="27" cy="296" rx="14" ry="13" fill="#a86030"/>
        <path d="M16 292 Q27 286 38 292" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" fill="none"/>
        {/* Screwdriver */}
        <rect x="19" y="308" width="16" height="26" rx="8" fill="#e8a818"/>
        <rect x="21" y="310" width="12" height="22" rx="6" fill="#d49812"/>
        <line x1="21" y1="316" x2="33" y2="316" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5"/>
        <line x1="21" y1="321" x2="33" y2="321" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5"/>
        <line x1="21" y1="326" x2="33" y2="326" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5"/>
        <ellipse cx="27" cy="310" rx="8" ry="5" fill="rgba(255,255,255,0.25)"/>
        <rect x="25" y="332" width="4" height="28" rx="2" fill="#c0c0c0"/>
        <line x1="25" y1="332" x2="25" y2="360" stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>
        <rect x="23" y="357" width="8" height="4" rx="1.5" fill="#909090"/>
        {/* Right arm — wrench */}
        <ellipse cx="160" cy="218" rx="22" ry="20" fill="url(#db-sweater)"/>
        <rect x="154" y="210" width="38" height="68" rx="19" fill="url(#db-sweater)"/>
        <rect x="154" y="210" width="38" height="68" rx="19" fill="url(#db-knit)" opacity="0.8"/>
        <ellipse cx="173" cy="278" rx="20" ry="19" fill="url(#db-sweater)"/>
        <ellipse cx="173" cy="298" rx="17" ry="16" fill="url(#db-skin-hand)"/>
        <ellipse cx="173" cy="296" rx="14" ry="13" fill="#a86030"/>
        <path d="M162 292 Q173 286 184 292" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" fill="none"/>
        {/* Wrench */}
        <rect x="168" y="310" width="10" height="36" rx="5" fill="#c8c8c8"/>
        <line x1="173" y1="312" x2="173" y2="345" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5"/>
        <rect x="160" y="306" width="26" height="14" rx="7" fill="#c0c0c0"/>
        <circle cx="165" cy="313" r="7" fill="#b8b8b8"/>
        <circle cx="165" cy="313" r="3.5" fill="#c8c8c8"/>
        <circle cx="165" cy="313" r="1.8" fill="#a8a8a8"/>
        <circle cx="181" cy="313" r="7" fill="#b8b8b8"/>
        <circle cx="181" cy="313" r="3.5" fill="#c8c8c8"/>
        <circle cx="181" cy="313" r="1.8" fill="#a8a8a8"/>
        <ellipse cx="164" cy="308" rx="8" ry="3" fill="rgba(255,255,255,0.5)" transform="rotate(-15 164 308)"/>
        {/* Jeans */}
        <rect x="42" y="302" width="120" height="14" rx="7" fill="#4a3218"/>
        <rect x="88" y="298" width="24" height="20" rx="5" fill="#c8a415"/>
        <rect x="92" y="302" width="16" height="12" rx="3" fill="#1a3d1e"/>
        <ellipse cx="100" cy="308" rx="4" ry="4" fill="#c8a415"/>
        <rect x="42" y="312" width="54" height="68" rx="20" fill="url(#db-jeans)"/>
        <rect x="104" y="312" width="54" height="68" rx="20" fill="url(#db-jeans)"/>
        <path d="M99 316 Q97 355 99 378" stroke="rgba(0,0,0,0.2)" strokeWidth="2" fill="none"/>
        <path d="M52 320 Q64 316 76 320" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="none"/>
        <path d="M124 320 Q136 316 148 320" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="none"/>
        <ellipse cx="69" cy="348" rx="20" ry="12" fill="rgba(106,146,192,0.35)"/>
        <ellipse cx="131" cy="348" rx="20" ry="12" fill="rgba(106,146,192,0.35)"/>
        {/* Shoes */}
        <ellipse cx="69" cy="380" rx="30" ry="15" fill="#2a1a08" opacity="0.4"/>
        <ellipse cx="131" cy="380" rx="30" ry="15" fill="#2a1a08" opacity="0.4"/>
        <ellipse cx="67" cy="377" rx="28" ry="13" fill="#1e1208"/>
        <ellipse cx="129" cy="377" rx="28" ry="13" fill="#1e1208"/>
        <ellipse cx="60" cy="372" rx="22" ry="8" fill="#2e1e10"/>
        <ellipse cx="122" cy="372" rx="22" ry="8" fill="#2e1e10"/>
        <ellipse cx="56" cy="369" rx="12" ry="4" fill="rgba(255,255,255,0.12)" transform="rotate(-10 56 369)"/>
        <ellipse cx="118" cy="369" rx="12" ry="4" fill="rgba(255,255,255,0.12)" transform="rotate(-10 118 369)"/>
      </g>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   JOHN BODY  — full plush puppet figure
   ═══════════════════════════════════════════════════════════════════ */
function JohnBody({ anim='', size=185 }) {
  return (
    <svg className={`fc-body fc-body--john ${anim}`}
         viewBox="0 0 200 350" width={size} style={{height:'auto'}}
         xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="jb-face" cx="38%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#f0c88a"/>
          <stop offset="45%" stopColor="#d4a060"/>
          <stop offset="80%" stopColor="#a87038"/>
          <stop offset="100%" stopColor="#7a4e20"/>
        </radialGradient>
        <radialGradient id="jb-beard" cx="35%" cy="22%" r="72%">
          <stop offset="0%" stopColor="#ffffff"/>
          <stop offset="35%" stopColor="#eeeae0"/>
          <stop offset="70%" stopColor="#d8d4c8"/>
          <stop offset="100%" stopColor="#b8b4a8"/>
        </radialGradient>
        <radialGradient id="jb-cap" cx="32%" cy="28%" r="68%">
          <stop offset="0%" stopColor="#3a7840"/>
          <stop offset="55%" stopColor="#1e4824"/>
          <stop offset="100%" stopColor="#0d2212"/>
        </radialGradient>
        <radialGradient id="jb-sweater" cx="32%" cy="28%" r="68%">
          <stop offset="0%" stopColor="#faf8f0"/>
          <stop offset="45%" stopColor="#e8e4d8"/>
          <stop offset="80%" stopColor="#ccc8bc"/>
          <stop offset="100%" stopColor="#b0aca0"/>
        </radialGradient>
        <radialGradient id="jb-jeans" cx="35%" cy="25%" r="68%">
          <stop offset="0%" stopColor="#6a92c0"/>
          <stop offset="55%" stopColor="#4268a0"/>
          <stop offset="100%" stopColor="#254878"/>
        </radialGradient>
        <radialGradient id="jb-skin-hand" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#e8b880"/>
          <stop offset="100%" stopColor="#a87038"/>
        </radialGradient>
        <radialGradient id="jb-ear" cx="55%" cy="38%" r="65%">
          <stop offset="0%" stopColor="#e0a870"/>
          <stop offset="100%" stopColor="#8a5030"/>
        </radialGradient>
        <pattern id="jb-knit" x="0" y="0" width="12" height="14" patternUnits="userSpaceOnUse">
          <path d="M0,1 Q3,7 6,1 Q9,7 12,1" stroke="rgba(175,172,162,0.5)" strokeWidth="1.2" fill="none"/>
          <path d="M-6,8 Q-3,14 0,8 Q3,14 6,8 Q9,14 12,8 Q15,14 18,8" stroke="rgba(175,172,162,0.5)" strokeWidth="1.2" fill="none"/>
        </pattern>
        <filter id="jb-shadow" x="-12%" y="-8%" width="124%" height="130%">
          <feGaussianBlur stdDeviation="6" in="SourceAlpha" result="blur"/>
          <feOffset dx="3" dy="8" result="shadow"/>
          <feFlood floodColor="rgba(0,0,0,0.45)" result="color"/>
          <feComposite in="color" in2="shadow" operator="in" result="coloredShadow"/>
          <feMerge><feMergeNode in="coloredShadow"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <filter id="jb-beard-soft">
          <feGaussianBlur stdDeviation="2.5" in="SourceGraphic" result="blurred"/>
          <feMerge><feMergeNode in="blurred"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      <g filter="url(#jb-shadow)">
        {/* Cap */}
        <ellipse cx="100" cy="44" rx="74" ry="42" fill="#0d2212"/>
        <ellipse cx="100" cy="34" rx="61" ry="34" fill="url(#jb-cap)"/>
        <path d="M26 42 Q4 40 2 54 Q2 66 30 62 Q40 56 38 46 Z" fill="#0d2212"/>
        <ellipse cx="77" cy="25" rx="28" ry="18" fill="rgba(255,255,255,0.09)" transform="rotate(-10 77 25)"/>
        <path d="M26 48 Q100 64 174 48" stroke="rgba(0,0,0,0.22)" strokeWidth="2" fill="none"/>
        <path d="M100 10 L100 64" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" fill="none"/>
        <text x="100" y="40" textAnchor="middle" fontSize="20" fontWeight="900"
              fill="rgba(200,164,21,0.9)" fontFamily="Georgia,serif">M</text>
        {/* Ears */}
        <ellipse cx="26" cy="118" rx="17" ry="21" fill="#c4906a"/>
        <ellipse cx="174" cy="118" rx="17" ry="21" fill="#c4906a"/>
        <ellipse cx="26" cy="118" rx="10" ry="13" fill="url(#jb-ear)"/>
        <ellipse cx="174" cy="118" rx="10" ry="13" fill="url(#jb-ear)"/>
        <path d="M21 111 Q26 118 21 125" stroke="rgba(0,0,0,0.22)" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        <path d="M179 111 Q174 118 179 125" stroke="rgba(0,0,0,0.22)" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        {/* Head */}
        <ellipse cx="102" cy="109" rx="74" ry="73" fill="#7a4e20" opacity="0.3"/>
        <ellipse cx="100" cy="105" rx="72" ry="70" fill="url(#jb-face)"/>
        <ellipse cx="76" cy="70" rx="30" ry="22" fill="rgba(255,220,160,0.13)" transform="rotate(-12 76 70)"/>
        {/* Felt-frame glasses — thick, chunky */}
        <circle cx="70" cy="108" r="22" fill="none" stroke="#1a0e04" strokeWidth="5.5"/>
        <circle cx="130" cy="108" r="22" fill="none" stroke="#1a0e04" strokeWidth="5.5"/>
        <path d="M92 108 L108 108" stroke="#1a0e04" strokeWidth="5" strokeLinecap="round"/>
        <path d="M26 108 L48 108" stroke="#1a0e04" strokeWidth="4" strokeLinecap="round"/>
        <path d="M152 108 L174 108" stroke="#1a0e04" strokeWidth="4" strokeLinecap="round"/>
        {/* Eyes inside glasses — sclera + iris + pupil */}
        <ellipse cx="70" cy="108" rx="14" ry="13" fill="#f5efe6"/>
        <ellipse cx="130" cy="108" rx="14" ry="13" fill="#f5efe6"/>
        <circle cx="70" cy="109" r="9" fill="#4a3020"/>
        <circle cx="130" cy="109" r="9" fill="#4a3020"/>
        <circle cx="70" cy="109" r="5.5" fill="#080400"/>
        <circle cx="130" cy="109" r="5.5" fill="#080400"/>
        <circle cx="66" cy="105" r="2.8" fill="rgba(255,255,255,0.9)"/>
        <circle cx="126" cy="105" r="2.8" fill="rgba(255,255,255,0.9)"/>
        {/* Neck */}
        <rect x="76" y="170" width="48" height="24" rx="20" fill="#c4906a"/>
        {/* Massive fluffy beard */}
        <ellipse cx="103" cy="168" rx="82" ry="62" fill="#909090" opacity="0.4" filter="url(#jb-beard-soft)"/>
        <ellipse cx="100" cy="164" rx="80" ry="58" fill="url(#jb-beard)"/>
        <ellipse cx="35" cy="136" rx="22" ry="20" fill="#eeead8" filter="url(#jb-beard-soft)"/>
        <ellipse cx="60" cy="128" rx="24" ry="22" fill="#f5f2e5" filter="url(#jb-beard-soft)"/>
        <ellipse cx="88" cy="124" rx="26" ry="23" fill="#ffffff" filter="url(#jb-beard-soft)"/>
        <ellipse cx="116" cy="127" rx="25" ry="22" fill="#f5f2e5" filter="url(#jb-beard-soft)"/>
        <ellipse cx="143" cy="134" rx="22" ry="20" fill="#eeead8" filter="url(#jb-beard-soft)"/>
        <ellipse cx="52" cy="204" rx="26" ry="24" fill="#dedad0" filter="url(#jb-beard-soft)"/>
        <ellipse cx="100" cy="212" rx="30" ry="24" fill="#e8e4da" filter="url(#jb-beard-soft)"/>
        <ellipse cx="148" cy="204" rx="26" ry="24" fill="#dedad0" filter="url(#jb-beard-soft)"/>
        <ellipse cx="72" cy="148" rx="30" ry="24" fill="rgba(255,255,255,0.24)" transform="rotate(-8 72 148)"/>
        {[35,52,68,84,100,116,133,148,165].map((x,i)=>{
          const yS=130+(Math.abs(i-4)*2);
          return <path key={x} d={`M${x} ${yS} Q${x+5} ${yS+28} ${x-4} ${yS+58}`}
                       stroke="rgba(185,180,168,0.3)" strokeWidth="2" fill="none" strokeLinecap="round"/>;
        })}
        <path d="M68 138 Q100 150 132 138" stroke="#d8d4c8" strokeWidth="8" fill="none" strokeLinecap="round"/>
        <path d="M72 136 Q100 144 128 136" stroke="rgba(80,58,30,0.4)" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
        {/* Sweater body */}
        <ellipse cx="102" cy="266" rx="74" ry="60" fill="rgba(0,0,0,0.22)"/>
        <rect x="40" y="220" width="120" height="96" rx="34" fill="url(#jb-sweater)"/>
        <rect x="40" y="220" width="120" height="96" rx="34" fill="url(#jb-knit)" opacity="0.9"/>
        <ellipse cx="78" cy="244" rx="32" ry="22" fill="rgba(255,255,255,0.17)" transform="rotate(-8 78 244)"/>
        <rect x="40" y="290" width="120" height="28" rx="0 0 34 34" fill="rgba(0,0,0,0.1)"/>
        {/* Mycana badge */}
        <g transform="translate(100,260)">
          <circle cx="0" cy="0" r="16" fill="#1c4020" stroke="#c8a415" strokeWidth="2"/>
          <circle cx="0" cy="0" r="12" fill="#183518"/>
          <text x="0" y="5" textAnchor="middle" fontSize="15" fontWeight="900"
                fill="#c8a415" fontFamily="Georgia,serif">M</text>
        </g>
        {/* Left arm — raised, pointing up */}
        <ellipse cx="40" cy="232" rx="22" ry="20" fill="url(#jb-sweater)"/>
        <rect x="5" y="168" width="38" height="72" rx="19" fill="url(#jb-sweater)"
              transform="rotate(-30 24 204)"/>
        <rect x="5" y="168" width="38" height="72" rx="19" fill="url(#jb-knit)" opacity="0.8"
              transform="rotate(-30 24 204)"/>
        <ellipse cx="22" cy="154" rx="16" ry="17" fill="url(#jb-skin-hand)"/>
        <ellipse cx="22" cy="152" rx="13" ry="14" fill="#d4a060"/>
        <rect x="16" y="128" width="12" height="28" rx="6" fill="#d4a060"/>
        <ellipse cx="22" cy="128" rx="6" ry="6.5" fill="#c49050"/>
        <rect x="14" y="148" width="9" height="15" rx="5" fill="#c09050"/>
        <rect x="24" y="148" width="9" height="15" rx="5" fill="#c09050"/>
        {/* Right arm — megaphone */}
        <ellipse cx="160" cy="232" rx="22" ry="20" fill="url(#jb-sweater)"/>
        <rect x="158" y="224" width="38" height="72" rx="19" fill="url(#jb-sweater)"/>
        <rect x="158" y="224" width="38" height="72" rx="19" fill="url(#jb-knit)" opacity="0.8"/>
        <ellipse cx="176" cy="296" rx="17" ry="15" fill="url(#jb-skin-hand)"/>
        <ellipse cx="176" cy="294" rx="14" ry="12" fill="#d4a060"/>
        <path d="M164 290 Q176 284 188 290" stroke="rgba(0,0,0,0.18)" strokeWidth="1.8" fill="none"/>
        {/* Megaphone */}
        <path d="M164 278 L176 278 L196 260 L196 298 L176 298 L164 298 Z" fill="rgba(0,0,0,0.2)"
              transform="translate(3,5)"/>
        <path d="M164 278 L176 278 L196 260 L196 298 L176 298 L164 298 Z" fill="#1a8c3e"/>
        <path d="M196 260 Q216 279 196 298" stroke="#1a8c3e" strokeWidth="3" fill="#1a7a34"/>
        <ellipse cx="196" cy="279" rx="10" ry="19" fill="#1a7a34"/>
        <path d="M167 280 Q174 278 183 266" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M167 286 Q174 284 182 272" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <rect x="160" y="282" width="7" height="14" rx="3.5" fill="#167030"/>
        <path d="M210 270 Q218 279 210 288" stroke="#c8a415" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.85"/>
        <path d="M216 264 Q228 279 216 294" stroke="#c8a415" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.55"/>
        {/* Jeans */}
        <rect x="42" y="312" width="56" height="70" rx="20" fill="url(#jb-jeans)"/>
        <rect x="102" y="312" width="56" height="70" rx="20" fill="url(#jb-jeans)"/>
        <path d="M99 316 Q97 356 99 380" stroke="rgba(0,0,0,0.2)" strokeWidth="2" fill="none"/>
        <rect x="41" y="312" width="118" height="13" rx="6" fill="#3a2810"/>
        <rect x="88" y="308" width="24" height="20" rx="5" fill="#c8a415"/>
        <rect x="92" y="312" width="16" height="12" rx="3" fill="#1a3d1e"/>
        <ellipse cx="100" cy="318" rx="4" ry="4" fill="#c8a415"/>
        <ellipse cx="70" cy="358" rx="20" ry="12" fill="rgba(106,146,192,0.35)"/>
        <ellipse cx="130" cy="358" rx="20" ry="12" fill="rgba(106,146,192,0.35)"/>
        {/* Shoes */}
        <ellipse cx="70" cy="384" rx="30" ry="14" fill="#1c1206" opacity="0.4"/>
        <ellipse cx="130" cy="384" rx="30" ry="14" fill="#1c1206" opacity="0.4"/>
        <ellipse cx="68" cy="380" rx="28" ry="12" fill="#161008"/>
        <ellipse cx="128" cy="380" rx="28" ry="12" fill="#161008"/>
        <ellipse cx="60" cy="376" rx="22" ry="8" fill="#221810"/>
        <ellipse cx="120" cy="376" rx="22" ry="8" fill="#221810"/>
        <ellipse cx="56" cy="372" rx="12" ry="4" fill="rgba(255,255,255,0.1)" transform="rotate(-10 56 372)"/>
        <ellipse cx="116" cy="372" rx="12" ry="4" fill="rgba(255,255,255,0.1)" transform="rotate(-10 116 372)"/>
      </g>
    </svg>
  );
}

/* ─── Watermark ──────────────────────────────────────────────────── */
function CannaLeafWatermark() {
  return (
    <svg className="fc-watermark" viewBox="0 0 200 200"
         xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g opacity=".05">
        <line x1="100" y1="192" x2="100" y2="110" stroke="#c8a415" strokeWidth="5" strokeLinecap="round"/>
        <path d="M100 110 C92 85 78 38 100 12 C122 38 108 85 100 110Z" fill="#c8a415"/>
        <path d="M100 118 C84 102 48 84 26 104 C48 132 88 126 100 118Z" fill="#c8a415"/>
        <path d="M98 130 C76 118 34 110 22 136 C42 152 82 144 98 130Z" fill="#c8a415"/>
        <path d="M100 118 C116 102 152 84 174 104 C152 132 112 126 100 118Z" fill="#c8a415"/>
        <path d="M102 130 C124 118 166 110 178 136 C158 152 118 144 102 130Z" fill="#c8a415"/>
      </g>
    </svg>
  );
}

/* ─── Main page ──────────────────────────────────────────────────── */
export default function FounderCalc() {
  const { user, loading } = useAuth();
  const [stores,      setStores]      = useState(320);
  const [standardPct, setStandardPct] = useState(60);
  const [animClass,   setAnimClass]   = useState('');

  const prevStores = useRef(320);
  const animTimer  = useRef(null);

  const calc = useMemo(() => {
    const premPct      = 100 - standardPct;
    const stdStores    = Math.round(stores * standardPct / 100);
    const premStores   = stores - stdStores;
    const stdRev       = stdStores  * STANDARD_PRICE;
    const premRev      = premStores * PREMIUM_PRICE;
    const totalMonthly = stdRev + premRev;
    const each         = totalMonthly * 0.5;
    return { premPct, stdStores, premStores, stdRev, premRev, totalMonthly, each,
             totalAnnual: totalMonthly * 12, eachAnnual: each * 12 };
  }, [stores, standardPct]);

  const revLevel = calc.totalMonthly >= 60000 ? 'max'
                 : calc.totalMonthly >= 25000 ? 'high'
                 : calc.totalMonthly >= 8000  ? 'mid' : 'low';

  const handleStores = useCallback((e) => {
    const val = Number(e.target.value);
    const dir = val >= prevStores.current ? 'up' : 'down';
    const cls = val >= MAX_STORES               ? 'fc-head--celebrate'
              : MILESTONES.has(val) && dir==='up' ? 'fc-head--big-bounce'
              : dir === 'up'                    ? 'fc-head--bounce'
              :                                   'fc-head--droop';
    if (animTimer.current) clearTimeout(animTimer.current);
    setAnimClass(cls);
    animTimer.current = setTimeout(() => setAnimClass(''), 900);
    playTick(val, dir);
    prevStores.current = val;
    setStores(val);
  }, []);

  if (loading) return <div className="app-loading">🌿</div>;
  if (!user || !ADMIN_EMAILS.includes(user.email)) return <Navigate to="/" replace />;

  const sliderPct = ((stores - 1) / (MAX_STORES - 1)) * 100;

  return (
    <div className="fc-page">
      <div className="fc-card">
        <div className="fc-stitch" aria-hidden="true"/>
        <CannaLeafWatermark/>

        <div className="fc-inner">

          <h1 className="fc-title">
            <span className="fc-title--gold">Founder</span>{" "}
            Partnership Revenue Calculator
          </h1>

          <div className="fc-section fc-section--slider">
            <p className="fc-section__heading">
              TOTAL PAID NY CANNABIS STOREFRONTS ON-PLATFORM
            </p>
            <p className="fc-section__sub">
              Slider: Adjust total stores (Range: 1 – {MAX_STORES}) ·{" "}
              Currently: <strong style={{color:'#d4a820'}}>{stores.toLocaleString()}</strong>
            </p>
            <div className="fc-slider-wrap">
              <input type="range" min={1} max={MAX_STORES} value={stores}
                     onChange={handleStores} className="fc-slider"
                     aria-label="Total paid storefronts"
                     style={{background:`linear-gradient(to right,#b87c06 0%,#e0a818 ${Math.max(sliderPct-0.5,0)}%,#c8b070 ${sliderPct}%,#4a3a20 ${Math.min(sliderPct+0.5,100)}%,#3a2c14 100%)`}}/>
              <div className="fc-ticks" aria-hidden="true">
                {TICKS.map(t => (
                  <span key={t} className="fc-tick"
                        style={{left:`${((t-1)/(MAX_STORES-1))*100}%`}}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="fc-mix-row">
            <span className="fc-mix-label">Plan Mix</span>
            <span className="fc-mix-badge fc-mix-badge--std">
              Std {standardPct}% · {calc.stdStores} stores
            </span>
            <input type="range" min={10} max={90} step={5} value={standardPct}
                   onChange={e => setStandardPct(Number(e.target.value))}
                   className="fc-slider fc-slider--mix"
                   aria-label="Standard/Premium mix"
                   style={{background:`linear-gradient(to right,#b87c06 0%,#e0a818 ${standardPct-1}%,#c8b070 ${standardPct}%,#4a3a20 ${standardPct+1}%,#3a2c14 100%)`}}/>
            <span className="fc-mix-badge fc-mix-badge--prem">
              Prem {calc.premPct}% · {calc.premStores} stores
            </span>
          </div>

          <div className="fc-rev-grid">

            <div className="fc-plan-card fc-plan-card--std">
              <div className="fc-plan-card__name">STANDARD PLAN<br/><span>($49/mo)</span></div>
              <div className="fc-plan-card__stores">
                {calc.stdStores.toLocaleString()} Stores
                <span>({standardPct}% of {stores})</span>
              </div>
              <div className="fc-plan-card__rev">{fmtDollar(calc.stdRev)}</div>
            </div>

            <div className="fc-center">
              <div className="fc-center__sub-title">STOREFRONT SUBSCRIPTION REVENUE</div>
              <div className="fc-center__at">(at selected state)</div>
              <div className="fc-center__assumed">
                Assumed Split: {standardPct}% Standard / {calc.premPct}% Premium
              </div>

              <div className={`fc-split-circle fc-split-circle--${revLevel}`}>
                <div className="fc-split-half-wrap fc-split-half-wrap--de">
                  <DeMarkusHead anim={animClass} size={88}/>
                  <div className="fc-split-who">DeMarkus Wilson</div>
                  <div className="fc-split-amt">{fmtDollar(calc.each)}</div>
                  <div className="fc-split-name">Development &amp; Architecture</div>
                </div>
                <div className="fc-split-divider">
                  <div className="fc-split-divider__line"/>
                  <div className="fc-split-divider__label">50/50</div>
                  <div className="fc-split-divider__line"/>
                </div>
                <div className="fc-split-half-wrap fc-split-half-wrap--john">
                  <JohnHead anim={animClass} size={88}/>
                  <div className="fc-split-who">John C Girdlestone</div>
                  <div className="fc-split-amt">{fmtDollar(calc.each)}</div>
                  <div className="fc-split-name">Sales &amp; Marketing</div>
                </div>
              </div>

              <div className="fc-center__total-label">MONTHLY TOTAL REV:</div>
              <div className="fc-center__total">{fmtDollar(calc.totalMonthly)}</div>
              <div className="fc-center__split-note">50/50 profit split · Co-Founders</div>
            </div>

            <div className="fc-plan-card fc-plan-card--prem">
              <div className="fc-plan-card__name">PREMIUM PLAN<br/><span>($149/mo)</span></div>
              <div className="fc-plan-card__stores">
                {calc.premStores.toLocaleString()} Stores
                <span>({calc.premPct}% of {stores})</span>
              </div>
              <div className="fc-plan-card__rev">{fmtDollar(calc.premRev)}</div>
            </div>

          </div>

          {/* Annual strip — combined total centered, splits flanking */}
          <div className="fc-annual-strip">
            <div className="fc-annual-combined">
              <div className="fc-annual-combined__label">COMBINED ANNUAL REVENUE</div>
              <div className="fc-annual-combined__val">{fmtDollar(calc.totalAnnual)}</div>
            </div>
            <div className="fc-annual-splits">
              <div className="fc-annual-item">
                <div className="fc-annual-item__label">DeMarkus / yr</div>
                <div className="fc-annual-item__val fc-annual-item__val--de">
                  {fmtDollar(calc.eachAnnual)}
                </div>
              </div>
              <div className="fc-annual-divider"/>
              <div className="fc-annual-item">
                <div className="fc-annual-item__label">John / yr</div>
                <div className="fc-annual-item__val fc-annual-item__val--john">
                  {fmtDollar(calc.eachAnnual)}
                </div>
              </div>
            </div>
          </div>

          <div className="fc-founders-row">
            <div className="fc-founder fc-founder--de">
              <DeMarkusBody anim={animClass} size={185}/>
              <div className="fc-founder__name">DeMarkus Wilson</div>
              <div className="fc-founder__title">Co-Founder · Development &amp; Architecture</div>
              <div className="fc-founder__annual">
                {fmtDollar(calc.eachAnnual)}<span className="fc-founder__annual-label"> / yr</span>
              </div>
            </div>
            <div className="fc-founder fc-founder--john">
              <JohnBody anim={animClass} size={185}/>
              <div className="fc-founder__name">John C Girdlestone</div>
              <div className="fc-founder__title">Co-Founder · Visionary &amp; Growth</div>
              <div className="fc-founder__annual">
                {fmtDollar(calc.eachAnnual)}<span className="fc-founder__annual-label"> / yr</span>
              </div>
            </div>
          </div>

          <p className="fc-disclaimer">
            *Model calculations are simulated projections and not live platform data.
          </p>

        </div>
      </div>

      <div className="fc-footer-nav">
        <Link to="/investors" className="fc-back">← Back to Investor Pitch</Link>
      </div>
    </div>
  );
}
