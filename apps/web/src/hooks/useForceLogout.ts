import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { WS_EVENTS } from '@burkindi/shared-types';

export function useForceLogout() {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_DEMO === '1') return;
    const s = io(process.env.NEXT_PUBLIC_WS_URL!, { withCredentials: true });  // identité = cookie HttpOnly
    s.on(WS_EVENTS.FORCE_LOGOUT, async () => {
      await fetch(process.env.NEXT_PUBLIC_API_URL + '/auth/logout', { method: 'POST', credentials: 'include' });
      location.href = '/apprenant/login?reason=autre-appareil';
    });
    return () => { s.disconnect(); };
  }, []);
}
