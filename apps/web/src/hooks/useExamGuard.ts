import { useEffect } from 'react';
import { api } from '@/lib/api';

/** Anti-triche : perte de focus (visibilitychange/blur) journalisée côté serveur, copier/coller et clic droit bloqués.
 *  Note : FLAG_SECURE n'existe que dans une app Android native (WebView/TWA) ; sur le web, ce hook est la limite du possible. */
export function useExamGuard(active: boolean, onLost: (count: number) => void) {
  useEffect(() => {
    if (!active) return;
    const lost = async (reason: string) => {
      document.body.style.filter = 'blur(12px)';
      try { onLost((await api('/exams/focus-loss', { method: 'POST', body: JSON.stringify({ reason }) })).focusLossCount); } catch { onLost(-1); }
    };
    const vis = () => { if (document.hidden) lost('Sortie de fenêtre'); };
    const blur = () => lost('Perte de focus');
    const block = (e: Event) => e.preventDefault();
    document.addEventListener('visibilitychange', vis); window.addEventListener('blur', blur);
    ['copy', 'cut', 'paste', 'contextmenu'].forEach(ev => document.addEventListener(ev, block));
    return () => {
      document.body.style.filter = '';
      document.removeEventListener('visibilitychange', vis); window.removeEventListener('blur', blur);
      ['copy', 'cut', 'paste', 'contextmenu'].forEach(ev => document.removeEventListener(ev, block));
    };
  }, [active, onLost]);
}
