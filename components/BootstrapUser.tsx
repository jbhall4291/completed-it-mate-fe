'use client';

import { useEffect } from 'react';
import axiosInstance from '@/lib/axiosInstance';

const DEVICE_KEY = 'clm_device_id';
const USER_READY_EVENT = 'clm:user-ready';

export default function BootstrapUser() {
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // if a user already exists this session, announce and bail
        const existing = sessionStorage.getItem('clm_user_id');
        if (existing) {
          window.dispatchEvent(new Event(USER_READY_EVENT));
          return;
        }

        // stable per-browser device id
        let deviceId = localStorage.getItem(DEVICE_KEY);
        if (!deviceId) {
          deviceId = crypto.randomUUID();
          localStorage.setItem(DEVICE_KEY, deviceId);
        }

        const { data } = await axiosInstance.post('/users/anonymous', { deviceId });
        if (!cancelled && data?.userId) {
          sessionStorage.setItem('clm_user_id', data.userId);
          window.dispatchEvent(new Event(USER_READY_EVENT)); // ← notify app
        }
      } catch (e) {
        console.error('anon bootstrap failed', e);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  return null;
}
