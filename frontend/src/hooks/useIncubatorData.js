'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

function getStatus(temperature) {
  if (temperature > 38.5 || temperature < 35.5) {
    return { status: 'critical', message: temperature > 38.5 ? `CRITICAL: Temperature too high (${temperature}°C)` : `CRITICAL: Temperature too low (${temperature}°C)` };
  }
  if (temperature > 38 || temperature < 36) {
    return { status: 'warning', message: temperature > 38 ? `WARNING: Temperature elevated (${temperature}°C)` : `WARNING: Temperature low (${temperature}°C)` };
  }
  return { status: 'normal', message: 'All vitals normal' };
}

export function useIncubatorData() {
  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState({ status: 'normal', message: 'Awaiting data...' });
  const [alerts, setAlerts] = useState([]);
  const [connected, setConnected] = useState(false);
  const [settings, setSettings] = useState({ targetTemperature: 37.0, targetHumidity: 55 });
  const socketRef = useRef(null);
  const pollRef = useRef(null);

  // Add alert (max 50)
  const addAlert = useCallback((newStatus) => {
    if (newStatus.status !== 'normal') {
      setAlerts(prev => [{
        id: Date.now(),
        ...newStatus,
        timestamp: new Date().toISOString(),
      }, ...prev].slice(0, 50));
    }
  }, []);

  // Fetch history on mount
  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch(`${API_URL}/api/incubator/history?limit=100`);
        const json = await res.json();
        if (json.success && json.data) {
          setHistory(json.data.reverse());
          if (json.data.length > 0) {
            const lastReading = json.data[0];
            setLatest(lastReading);
            setStatus(getStatus(lastReading.temperature));
          }
        }
      } catch (e) {
        console.error('Failed to fetch history:', e);
      }
    }
    fetchHistory();
  }, []);

  // Fetch settings on mount
  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch(`${API_URL}/api/incubator/settings`);
        const json = await res.json();
        if (json.success && json.data) {
          setSettings(json.data);
        }
      } catch (e) {
        console.error('Failed to fetch settings:', e);
      }
    }
    fetchSettings();
  }, []);

  // WebSocket connection
  useEffect(() => {
    const socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      console.log('WebSocket connected');
    });

    socket.on('disconnect', () => {
      setConnected(false);
      console.log('WebSocket disconnected');
    });

    socket.on('newReading', (data) => {
      const { reading, status: newStatus } = data;
      setLatest(reading);
      setStatus(newStatus);
      setHistory(prev => [...prev, reading].slice(-100));
      addAlert(newStatus);
    });

    socket.on('settingsUpdate', (newSettings) => {
      setSettings(newSettings);
    });

    return () => {
      socket.disconnect();
    };
  }, [addAlert]);

  // Fallback polling when WebSocket is disconnected
  useEffect(() => {
    if (connected) {
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/api/incubator/latest`);
        const json = await res.json();
        if (json.success && json.data) {
          setLatest(json.data);
          setStatus(json.status);
          setHistory(prev => {
            const lastId = prev.length > 0 ? prev[prev.length - 1].id : 0;
            if (json.data.id > lastId) {
              addAlert(json.status);
              return [...prev, json.data].slice(-100);
            }
            return prev;
          });
        }
      } catch (e) {
        console.error('Polling error:', e);
      }
    }, 3000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [connected, addAlert]);

  // Update settings on server
  const updateSettings = useCallback(async (newSettings) => {
    try {
      const res = await fetch(`${API_URL}/api/incubator/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY || 'incubator-secure-key-2024',
        },
        body: JSON.stringify(newSettings),
      });
      const json = await res.json();
      if (json.success) {
        setSettings(json.data);
      }
    } catch (e) {
      console.error('Failed to update settings:', e);
    }
  }, []);

  const clearAlerts = useCallback(() => setAlerts([]), []);

  return {
    latest,
    history,
    status,
    alerts,
    connected,
    settings,
    updateSettings,
    clearAlerts,
  };
}
