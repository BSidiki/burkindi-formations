/** « La montée » : les scores des dernières sessions forment la flèche du logo, qui vise l'étoile (l'objectif). */
export function Trajectory({ scores, objective = 70, labels, height = 190 }:
  { scores: number[]; objective?: number; labels?: string[]; height?: number }) {
  const W = 340, H = 190, L = 34, R = 40, T = 22, B = 30;
  const x = (i: number) => (scores.length <= 1 ? L + (W - L - R) / 2 : L + (i * (W - L - R)) / (scores.length - 1));
  const y = (v: number) => T + ((100 - v) * (H - T - B)) / 100;
  const pts = scores.map((s, i) => [x(i), y(s)] as const);
  const path = pts.map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(1)} ${py.toFixed(1)}`).join(' ');
  const last = pts[pts.length - 1], prev = pts[pts.length - 2];
  const angle = last && prev ? (Math.atan2(last[1] - prev[1], last[0] - prev[0]) * 180) / Math.PI : -30;
  const star = (cx: number, cy: number, r: number) => Array.from({ length: 10 }, (_, k) => {
    const a = (Math.PI / 5) * k - Math.PI / 2, rr = k % 2 ? r * 0.45 : r; return `${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`; }).join(' ');
  const reached = scores.length > 0 && scores[scores.length - 1] >= objective;
  const aria = scores.length ? `Scores des dernières sessions : ${scores.join(', ')} pour cent. Objectif : ${objective} pour cent.` : 'Aucune session pour le moment.';
  return (
    <svg className="traj" viewBox={`0 0 ${W} ${H}`} style={{ maxHeight: height }} role="img" aria-label={aria}>
      {[0, 50, 100].map(v => <g key={v}><line className="grille" x1={L} x2={W - R + 10} y1={y(v)} y2={y(v)} /><text x={L - 6} y={y(v) + 4} textAnchor="end">{v}</text></g>)}
      <line className="seuil" x1={L} x2={W - R + 10} y1={y(objective)} y2={y(objective)} />
      <polygon points={star(W - R + 22, y(objective), 13)} fill="#E4C048" stroke="#8A6A0C" strokeWidth="1.5" strokeLinejoin="round" />
      <text x={L + 4} y={y(objective) - 6}>Objectif {objective} %</text>
      {scores.length > 1 && <path className="ligne" d={path} pathLength={1000} />}
      {pts.slice(0, -1).map(([px, py], i) => <circle key={i} className="pt" cx={px} cy={py} r="5" />)}
      {last && <polygon points="0,0 -16,-9 -16,9" fill="#B03020" transform={`translate(${last[0]} ${last[1]}) rotate(${angle})`} />}
      {labels?.map((l, i) => <text key={i} x={x(i)} y={H - 8} textAnchor="middle">{l}</text>)}
      {reached && <text x={W - R + 22} y={y(objective) + 28} textAnchor="middle" style={{ fill: '#0A7A3C' }}>Atteint</text>}
    </svg>
  );
}
