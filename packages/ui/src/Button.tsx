import React from 'react';
export const Button = (p: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button {...p} style={{ padding: '10px 18px', borderRadius: 8, ...p.style }} />
);
