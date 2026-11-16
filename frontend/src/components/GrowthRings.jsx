import React, { useMemo } from 'react';

// Tree rings = tenure. Each ring is a year of the team's growth; people sit on the ring
// of the year they joined. Rings draw themselves once on load, then stay still.
const CX = 260;
const wobble = (i, a) => {
  const k = i * 1.7 + 1;
  return Math.sin(a * 2 + k) * 0.018 + Math.sin(a * 3 + k * 2.3) * 0.012 + Math.sin(a * 5 + k * 0.7) * 0.006;
};
const radius = (i, a, count) => (46 + i * ((228 - 46) / (count - 1))) * (1 + wobble(i, a) * (1 + i / count));
const pointAt = (i, a, count) => [CX + Math.cos(a) * radius(i, a, count), CX + Math.sin(a) * radius(i, a, count)];

const ringPath = (i, count) => {
  const steps = 120;
  let d = '';
  for (let s = 0; s <= steps; s += 1) {
    const [x, y] = pointAt(i, (s / steps) * Math.PI * 2, count);
    d += `${s ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return `${d}Z`;
};

const halo = { paintOrder: 'stroke', stroke: 'rgb(var(--bg))', strokeWidth: 4, strokeLinejoin: 'round' };

const PEOPLE = [
  { ring: 7, angle: -0.62, initials: 'MH', name: 'Musabbir', note: 'this year' },
  { ring: 4, angle: 2.35, initials: 'TV', name: 'Thalapathy', note: 'joined 2020' },
  { ring: 9, angle: 0.95, initials: 'PB', name: 'Prabhas', note: 'joined 2019' },
  { ring: 2, angle: -2.2, initials: 'NTR', name: 'Tarak', note: 'joined 2021' },
];

export default function GrowthRings({ people = false, className = '' }) {
  const count = 11;
  const rings = useMemo(() => Array.from({ length: count }, (_, i) => ({ i, d: ringPath(i, count) })), []);
  const nodes = useMemo(() => PEOPLE.map((p) => ({ ...p, pos: pointAt(p.ring, p.angle, count) })), []);

  return (
    <svg viewBox="0 0 520 520" className={className} role="img" aria-label="Concentric growth rings with team members placed on the year they joined">
      <g fill="none" className="text-brand">
        {[...rings].reverse().map(({ i, d }) => (
          <path
            key={i}
            d={d}
            pathLength="1"
            className="ring-path animate-draw"
            stroke="currentColor"
            fill="currentColor"
            fillOpacity={i % 2 ? 0.07 : 0.015}
            strokeOpacity={0.3 + (i / count) * 0.6}
            strokeWidth={i % 3 === 0 ? 3 : 1.6}
            style={{ strokeDasharray: 1, strokeDashoffset: 1, animationDelay: `${i * 0.12}s` }}
          />
        ))}
      </g>
      <circle cx={CX} cy={CX} r="26" className="fill-pollen" />
      {people && nodes.map((n, idx) => (
        <g key={n.name} className="animate-rise" style={{ animationDelay: `${1.4 + idx * 0.18}s`, transformOrigin: `${n.pos[0]}px ${n.pos[1]}px`, transformBox: 'fill-box' }}>
          <circle cx={n.pos[0]} cy={n.pos[1]} r="19" className="fill-surface stroke-brand" strokeWidth="2" />
          <text x={n.pos[0]} y={n.pos[1] + 4.5} textAnchor="middle" className="fill-brand font-sans text-[12px] font-bold">{n.initials}</text>
          <text x={n.pos[0] + (n.pos[0] > CX ? 26 : -26)} y={n.pos[1] - 1} textAnchor={n.pos[0] > CX ? 'start' : 'end'} className="fill-ink font-sans text-[13px] font-semibold" style={halo}>{n.name}</text>
          <text x={n.pos[0] + (n.pos[0] > CX ? 26 : -26)} y={n.pos[1] + 14} textAnchor={n.pos[0] > CX ? 'start' : 'end'} className="fill-muted font-sans text-[11px]" style={halo}>{n.note}</text>
        </g>
      ))}
    </svg>
  );
}
