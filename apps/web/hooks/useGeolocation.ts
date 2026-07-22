'use client';

import { useState, useEffect, useCallback } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  permission: 'granted' | 'denied' | 'prompt';
  loading: boolean;
  error: string | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    permission: 'prompt',
    loading: false,
    error: null,
  });

  const requestPermission = useCallback(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, error: 'Geolocation not supported', permission: 'denied' }));
      return;
    }

    setState((s) => ({ ...s, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          permission: 'granted',
          loading: false,
          error: null,
        });
      },
      (error) => {
        const permission = error.code === 1 || error.code === 2 ? 'denied' : 'prompt';
        setState((s) => ({
          ...s,
          loading: false,
          permission,
          error: error.message || 'Location access denied',
        }));
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setState((s) => ({ ...s, permission: result.state as 'granted' | 'denied' | 'prompt' }));
        if (result.state === 'granted') {
          requestPermission();
        }
      });
    }
  }, [requestPermission]);

  return { ...state, requestPermission };
}
