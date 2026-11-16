import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { MeResponse } from '@burkindi/shared-types';
export function useMe() { const [me, setMe] = useState<MeResponse | null>(null); useEffect(() => { api('/auth/me').then(setMe).catch(() => {}); }, []); return me; }
