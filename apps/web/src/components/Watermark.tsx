'use client';
import type { WatermarkInfo } from '@burkindi/shared-types';
export function Watermark({ info }: { info: WatermarkInfo }) {
  const text = `${info.name} • ${info.phone} • ${info.ip}`;
  return (<div aria-hidden style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 40, opacity: 0.055, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
    transform: 'rotate(-20deg) scale(1.3)', userSelect: 'none', color: '#2A2118', fontWeight: 700 }}>
    {Array.from({ length: 40 }).map((_, i) => <span key={i} style={{ padding: 22, fontSize: 13 }}>{text}</span>)}</div>);
}
