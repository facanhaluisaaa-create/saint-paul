import { GROUPS, GROUP_IDS, type GroupId } from '../../shared/topics';

export function MasteryBars({ values, labels = 'short' }: { values: Partial<Record<GroupId, number>>; labels?: 'short' | 'long' }) {
  return (
    <ul className="bars" aria-label="Domínio por tema">
      {GROUP_IDS.map((g) => {
        const v = values[g];
        const tone = v == null ? 'none' : v >= 80 ? 'high' : v >= 60 ? 'mid' : 'low';
        return (
          <li key={g}>
            <span className="bar-label">{labels === 'short' ? GROUPS[g].short : GROUPS[g].label}</span>
            <span className="bar-track" role="img" aria-label={v == null ? 'não iniciado' : `${v}%`}>
              <span className={`bar-fill ${tone}`} style={{ width: `${v ?? 0}%` }} />
            </span>
            <span className="bar-value">{v == null ? '—' : v}</span>
          </li>
        );
      })}
    </ul>
  );
}

export function PercentBars({ rows }: { rows: { label: string; pct: number; detail?: string }[] }) {
  return (
    <ul className="bars">
      {rows.map((r) => {
        const tone = r.pct >= 80 ? 'high' : r.pct >= 60 ? 'mid' : 'low';
        return (
          <li key={r.label}>
            <span className="bar-label">{r.label}</span>
            <span className="bar-track" role="img" aria-label={`${r.pct.toFixed(0)}%`}>
              <span className={`bar-fill ${tone}`} style={{ width: `${Math.max(0, Math.min(100, r.pct))}%` }} />
            </span>
            <span className="bar-value">
              {r.pct.toFixed(0)}%{r.detail && <small> {r.detail}</small>}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/** Evolução da nota nos simulados (linha simples em SVG). */
export function TrendChart({ points }: { points: { date: number; percent: number }[] }) {
  if (points.length < 2) return <p className="muted">A evolução aparece a partir do segundo simulado.</p>;
  const W = 320;
  const H = 110;
  const pad = 18;
  const x = (i: number) => pad + (i * (W - 2 * pad)) / (points.length - 1);
  const y = (p: number) => H - pad - (p / 100) * (H - 2 * pad);
  const d = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.percent).toFixed(1)}`).join(' ');
  return (
    <svg className="trend" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Evolução: ${points.map((p) => p.percent.toFixed(0) + '%').join(', ')}`}>
      {[0, 50, 100].map((g) => (
        <g key={g}>
          <line x1={pad} x2={W - pad} y1={y(g)} y2={y(g)} className="grid" />
          <text x={2} y={y(g) + 3} className="axis">
            {g}
          </text>
        </g>
      ))}
      <path d={d} className="line" />
      {points.map((p, i) => (
        <circle key={i} cx={x(i)} cy={y(p.percent)} r={3} className="dot" />
      ))}
    </svg>
  );
}
