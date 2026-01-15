// BootstrapUser.tsx
'use client';

import { useEffect } from 'react';
import axiosInstance from '@/lib/axiosInstance';

const DEVICE_KEY = 'clm_device_id_v2';
const USER_READY_EVENT = 'clm:user-ready';

export default function BootstrapUser() {
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // If a user already exists for this tab, just announce readiness
        const existing = sessionStorage.getItem('clm_user_id_v2');
        if (existing) {
          window.dispatchEvent(new Event(USER_READY_EVENT));
          return;
        }

        // Stable per-browser device ID
        let deviceId = localStorage.getItem(DEVICE_KEY);
        if (!deviceId) {
          deviceId = crypto.randomUUID();
          localStorage.setItem(DEVICE_KEY, deviceId);
        }

        const { data } = await axiosInstance.post('/users/anonymous', { deviceId });

        if (!cancelled && data?.userId) {
          sessionStorage.setItem('clm_user_id_v2', data.userId);
          window.dispatchEvent(new Event(USER_READY_EVENT));
        }
      } catch (e) {
        console.error('anon bootstrap failed', e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
