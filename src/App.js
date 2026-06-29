import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  Paper,
} from '@mui/material';
import KPICard from './components/KPICard';
import SLABarchart from './components/SLABarchart';
import AgentTable from './components/AgentTable';
import CallVolumeChart from './components/CallVolumeChart';
import { useCallAggregates } from './hooks/useCallAggregates';
import { parseCDRLine } from './utils/cdrParser';
import { AUTHORIZED_AGENTS } from './config/agents';

// === Helpers (inchangés - logique métier préservée) ===
const isLunchBreak = (date) => {
  if (!date) return false;
  const totalMinutes = date.getHours() * 60 + date.getMinutes();
  return totalMinutes >= 750 && totalMinutes < 840;
};

const isAfterHours = (date) => {
  if (!date) return false;
  const h = date.getHours();
  return h >= 18;
};

const formatSecondsToMMSS = (totalSeconds) => {
  if (!totalSeconds || isNaN(totalSeconds) || totalSeconds <= 0) return '00:00';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const getInboundAHTColor = (seconds) => {
  if (!seconds || isNaN(seconds)) return 'default';
  if (seconds <= 600) return 'success';
  if (seconds <= 900) return 'warning';
  return 'error';
};

const getOutboundAHTColor = (seconds) => {
  if (!seconds || isNaN(seconds)) return 'default';
  if (seconds <= 1200) return 'success';
  if (seconds <= 1800) return 'warning';
  return 'error';
};

const getAbandonColor = (rateStr) => {
  const rate = parseInt(rateStr, 10);
  if (isNaN(rate)) return 'default';
  return rate <= 15 ? 'success' : 'error';
};

const isAbandonCritical = (rateStr) => {
  const rate = parseInt(rateStr, 10);
  return !isNaN(rate) && rate > 15;
};

const getLocalDateStr = (date) => {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().split('T')[0];
};

const generateHalfHourSlots = () => {
  const slots = [];
  for (let h = 8; h <= 18; h++) {
    slots.push(`${h.toString().padStart(2, '0')}:30`);
    if (h < 18) slots.push(`${(h + 1).toString().padStart(2, '0')}:00`);
  }
  return slots;
};

const halfHourSlots = generateHalfHourSlots();

const isInBusinessHours = (date) => {
  if (!date) return false;
  const h = date.getHours();
  const m = date.getMinutes();
  return !(h < 8 || (h === 8 && m < 30) || h > 18 || (h === 18 && m > 30));
};

const mmssToSeconds = (mmss) => {
  if (!mmss || mmss === '-') return null;
  const [m, s] = mmss.split(':').map(Number);
  return m * 60 + s;
};

// === 🦉 Clock – Version Soleil & Hibou (PLUS TRANSPARENT) ===
function Clock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);
  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');
  
  return (
    <Paper
      elevation={0}
      sx={{
        fontFamily: '"Orbitron", sans-serif',
        fontWeight: 'bold',
        fontSize: { xs: '1.8rem', sm: '2.4rem', md: '3rem' },
        color: '#ecf0f1',
        textShadow: '0 0 15px rgba(255, 200, 0, 0.6)',
        // Glassmorphism ULTRA-TRANSPARENT
        background: 'rgba(10, 14, 23, 0.25)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        padding: { xs: '0.5rem 1rem', md: '0.8rem 1.4rem' },
        borderRadius: '24px',
        display: 'inline-block',
        margin: '0 auto',
        border: '1px solid rgba(255, 200, 0, 0.3)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        transition: 'all 0.3s ease',
        '&:hover': {
          background: 'rgba(10, 14, 23, 0.35)',
          borderColor: 'rgba(255, 200, 0, 0.5)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 25px rgba(255, 200, 0, 0.2)',
          transform: 'translateY(-2px)',
        }
      }}
      role="status"
      aria-live="polite"
    >
      ☀️ {hours}:{minutes}:{seconds} ☀️
    </Paper>
  );
}

// === Schedulers & WebSocket (inchangés - logique préservée) ===
const useDailyResetScheduler = (resetFn) => { 
  useEffect(() => {
    const scheduleNextReset = () => {
      const now = new Date();
      const nextReset = new Date();
      nextReset.setHours(8, 0, 0, 0);
      if (now >= nextReset) nextReset.setDate(nextReset.getDate() + 1);
      const delay = nextReset.getTime() - now.getTime();
      const timeoutId = setTimeout(() => {
        resetFn();
        scheduleNextReset();
      }, delay);
      return () => clearTimeout(timeoutId);
    };
    return scheduleNextReset();
  }, [resetFn]);
};

const useWeeklyResetScheduler = (resetFn) => {
  useEffect(() => {
    const scheduleNextReset = () => {
      const now = new Date();
      const nextReset = new Date();
      const dayOfWeek = now.getDay();
      let daysUntilMonday = 1 - dayOfWeek;
      if (daysUntilMonday <= 0) daysUntilMonday += 7;
      nextReset.setDate(now.getDate() + daysUntilMonday);
      nextReset.setHours(8, 0, 0, 0);
      if (dayOfWeek === 1 && now.getHours() >= 8) {
        nextReset.setDate(nextReset.getDate() + 7);
      }
      const delay = nextReset.getTime() - now.getTime();
      const timeoutId = setTimeout(() => {
        resetFn();
        scheduleNextReset();
      }, delay);
      return () => clearTimeout(timeoutId);
    };
    return scheduleNextReset();
  }, [resetFn]);
};

const useWebSocketData = (url, onLostCall) => {
  const [allCalls, setAllCalls] = useState([]);
  const [dailyCalls, setDailyCalls] = useState([]);
  const [weeklyCalls, setWeeklyCalls] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const connectionTimeoutRef = useRef(null);
  const pingIntervalRef = useRef(null);
  const isMountedRef = useRef(true);
  const reconnectAttemptsRef = useRef(0);

  const getStorageKey = () => `callData_${getLocalDateStr(new Date())}`;

  const cleanupOldStorage = () => {
    const now = new Date();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('callData_')) {
        const dateStr = key.split('_')[1];
        const date = new Date(dateStr + 'T00:00:00');
        const daysDiff = Math.floor((now - date) / (24 * 60 * 60 * 1000));
        if (daysDiff > 7) {
          localStorage.removeItem(key);
        }
      }
    }
  };

  const saveCallsToStorage = (calls) => {
    try {
      const key = getStorageKey();
      const serializableCalls = calls.map(call => ({
        ...call,
        startTime: call.startTime?.toISOString() || null,
        endTime: call.endTime?.toISOString() || null,
        receivedAt: call.receivedAt?.toISOString() || null,
      }));
      localStorage.setItem(key, JSON.stringify(serializableCalls));
    } catch (e) {
      console.warn('[Storage] ⚠️ Sauvegarde échouée', e);
    }
  };

  const loadCallsFromStorage = () => {
    const seen = new Set();
    const calls = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const key = `callData_${getLocalDateStr(date)}`;
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          const loadedCalls = parsed.map(call => ({
            ...call,
            startTime: call.startTime ? new Date(call.startTime) : null,
            endTime: call.endTime ? new Date(call.endTime) : null,
            receivedAt: call.receivedAt ? new Date(call.receivedAt) : null,
          })).filter(call => call.startTime && call.id);
          for (const call of loadedCalls) {
            if (!seen.has(call.id)) {
              seen.add(call.id);
              calls.push(call);
            }
          }
        }
      } catch (e) {
        console.warn(`[Storage] ⚠️ Chargement échoué pour ${key}`, e);
        localStorage.removeItem(key);
      }
    };
    console.log(`[Storage] ✅ ${calls.length} appels chargés depuis localStorage`);
    return calls;
  };

  const resetDailyData = () => {
    setDailyCalls([]);
    setLastUpdate(null);
    console.log('[Reset] 🌅 Réinitialisation quotidienne (KPI vidé, SLA conservé)');
  };

  const resetWeeklyData = () => {
    setAllCalls([]);
    setDailyCalls([]);
    setWeeklyCalls([]);
    setLastUpdate(null);
    Object.keys(localStorage)
      .filter(k => k.startsWith('callData_'))
      .forEach(k => localStorage.removeItem(k));
    console.log('[Reset] 📅 Réinitialisation hebdomadaire complète');
  };

  const stopPing = () => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
  };

  const startPing = () => {
    stopPing();
    pingIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        try {
          wsRef.current.send(JSON.stringify({ type: 'keepalive', ts: Date.now() }));
        } catch (e) {
          console.warn('[WS] ⚠️ Keepalive échoué', e);
        }
      }
    }, 45000);
  };

  const connect = () => {
    if (!isMountedRef.current) return;
    const baseDelay = 5000;
    const maxDelay = 30000;
    const delay = reconnectAttemptsRef.current === 0 ? 0 : Math.min(baseDelay * Math.pow(2, reconnectAttemptsRef.current - 1), maxDelay);
    console.log(`[WS] 🔄 Tentative de connexion dans ${delay / 1000}s (essai #${reconnectAttemptsRef.current})`);
    reconnectTimeoutRef.current = setTimeout(() => {
      if (!isMountedRef.current) return;
      console.log(`[WS] 🔄 Connexion à ${url}`);
      setError(null);
      setIsConnected(false);
      wsRef.current = new WebSocket(url);
      connectionTimeoutRef.current = setTimeout(() => {
        if (wsRef.current?.readyState === WebSocket.CONNECTING) {
          wsRef.current?.close();
        }
      }, 10000);
      wsRef.current.onopen = () => {
        if (!isMountedRef.current) return;
        clearTimeout(connectionTimeoutRef.current);
        console.log('[WS] ✅ Connecté');
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
        startPing();
        try {
          wsRef.current.send(JSON.stringify({ type: "subscribe", topic: "cdr/live" }));
        } catch (err) {
          console.warn('[WS] ⚠️ Souscription échouée:', err);
        }
      };
      wsRef.current.onmessage = (event) => {
        if (!isMountedRef.current) return;
        const msg = event.data;
        if (typeof msg === 'string') {
          if (msg.includes('"type":"keepalive"') || msg.includes('"type":"pong"')) {
            return;
          }
          console.log(`[WS] 📥 Message brut reçu :`, msg);
          const cdr = parseCDRLine(msg);
          if (!cdr) {
            console.debug('[CDR] ❌ Appel ignoré (parsing échoué)', msg);
            return;
          }
          console.log(`[CDR] 📋 Appel parsé :`, {
            id: cdr.id,
            type: cdr.callType,
            caller: cdr.caller,
            agent: cdr.agentName,
            duration: cdr.durationSec,
            startTime: cdr.startTime?.toISOString(),
            status: cdr.status,
          });
          if (!cdr.startTime || !cdr.id) {
            console.debug('[CDR] ❌ Appel ignoré (données manquantes)', cdr);
            return;
          }
          if (isLunchBreak(cdr.startTime)) {
            console.debug(`[Appel] 🥪 Pause déjeuner détectée pour : ${cdr.id}`);
          }
          const callWithSec = { ...cdr, receivedAt: new Date() };
          let isLostCall = false;
          
          if (cdr.callType === 'ABSYS' && !isLunchBreak(cdr.startTime) && !isAfterHours(cdr.startTime)) {
            isLostCall = cdr.durationSec >= 59;
          }
          
          if (isInBusinessHours(cdr.startTime)) {
            setAllCalls(prev => {
              const exists = prev.some(call => call.id === callWithSec.id);
              if (exists) {
                console.debug(`[Appel] 🔄 Ignoré (déjà présent) : ${callWithSec.id}`);
                return prev;
              }
              const updated = [...prev, callWithSec];
              saveCallsToStorage(updated);
              console.log(`[Appel] 🆕 Ajouté à l'historique : ${callWithSec.id}`);
              return updated;
            });
            setDailyCalls(prev => {
              if (prev.some(call => call.id === callWithSec.id)) return prev;
              return [...prev, callWithSec];
            });
            setWeeklyCalls(prev => {
              if (prev.some(call => call.id === callWithSec.id)) return prev;
              return [...prev, callWithSec];
            });
            if (isLostCall && onLostCall) {
              onLostCall(callWithSec.id);
            }
            setLastUpdate(new Date());
          } else {
            console.debug(`[Appel] 🕒 Ignoré (hors heures d'ouverture) : ${callWithSec.id}`);
          }
        }
      };
      wsRef.current.onerror = (err) => {
        if (!isMountedRef.current) return;
        console.error('[WS] ❌ Erreur:', err);
        setIsConnected(false);
      };
      wsRef.current.onclose = (e) => {
        if (!isMountedRef.current) return;
        console.warn(`[WS] 🔌 Déconnecté (code ${e.code})`);
        setIsConnected(false);
        stopPing();
        if (e.code !== 1000 && isMountedRef.current) {
          reconnectAttemptsRef.current += 1;
          connect();
        }
      };
    }, delay);
  };

  useEffect(() => {
    isMountedRef.current = true;
    reconnectAttemptsRef.current = 0;
    cleanupOldStorage();
    const storedCalls = loadCallsFromStorage();
    setAllCalls(storedCalls);
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const todayCalls = storedCalls.filter(call =>
      call.startTime && call.startTime >= startOfToday
    );
    setDailyCalls(todayCalls);
    const startOfWeek = new Date(today);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    const thisWeekCalls = storedCalls.filter(call =>
      call.startTime && call.startTime >= startOfWeek
    );
    setWeeklyCalls(thisWeekCalls);
    connect();
    return () => {
      isMountedRef.current = false;
      if (wsRef.current) wsRef.current.close(1000, 'Unmount');
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (connectionTimeoutRef.current) clearTimeout(connectionTimeoutRef.current);
      stopPing();
    };
  }, [url]);

  const reconnect = () => {
    reconnectAttemptsRef.current = 0;
    if (wsRef.current) wsRef.current.close(1000, 'Manual reconnect');
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    stopPing();
    connect();
  };

  return {
    dailyCalls,
    weeklyCalls,
    allCalls,
    lastUpdate,
    isConnected,
    error,
    reconnect,
    halfHourSlots,
    resetDailyData,
    resetWeeklyData,
  };
};

// === Gestion audio (inchangée) ===
const playSound = (filename, context = '', volume = 0.8) => {
  try {
    const audio = new Audio(`${process.env.PUBLIC_URL}/sounds/${filename}`);
    audio.volume = volume;
    const logContext = context ? `(${context})` : '';
    console.log(`[Son] 🔊 Lecture : ${filename} ${logContext}`);
    audio.play().catch(e => {
      console.warn(`[Son] ❌ Échec lecture ${filename}:`, e.message);
    });
  } catch (error) {
    console.error(`[Son] 💥 Erreur :`, error);
  }
};

// === 🦉 App principale – Thème Soleil & Hibou (TRANSPARENCE MAX) ===
const App = () => {
  const WS_URL = 'wss://cds-on3cx.anaveo.com/cdr-ws/';
  const prevEmployeesRef = useRef([]);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const scheduledTimeoutsRef = useRef([]);

  // Scrollbar dynamique
  useEffect(() => {
    let hideScrollTimeout;
    const handleScroll = () => {
      document.body.classList.add('show-scrollbar');
      clearTimeout(hideScrollTimeout);
      hideScrollTimeout = setTimeout(() => {
        document.body.classList.remove('show-scrollbar');
      }, 1000);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(hideScrollTimeout);
    };
  }, []);

  const unlockAudio = () => {
    if (audioUnlocked) return;
    const audio = new Audio(`${process.env.PUBLIC_URL}/sounds/silent.wav`);
    audio.play().then(() => setAudioUnlocked(true)).catch(() => {});
  };

  useEffect(() => {
    const unlock = () => unlockAudio();
    ['click', 'keydown', 'touchstart'].forEach(e => window.addEventListener(e, unlock, { once: true }));
    return () => {
      ['click', 'keydown', 'touchstart'].forEach(e => window.removeEventListener(e, unlock));
    };
  }, []);

  const handleLostCall = (callId) => {
    const audio = new Audio(`${process.env.PUBLIC_URL}/sounds/fatality.mp3`);
    audio.volume = 0.9;
    audio.play().catch(() => {});
  };

  const {
    dailyCalls,
    weeklyCalls,
    lastUpdate,
    isConnected,
    error,
    reconnect,
    halfHourSlots,
    resetDailyData,
    resetWeeklyData,
  } = useWebSocketData(WS_URL, handleLostCall);

  useDailyResetScheduler(resetDailyData);
  useWeeklyResetScheduler(resetWeeklyData);

  const { employees, callVolumes, kpi } = useCallAggregates(dailyCalls, halfHourSlots);

  const slaDataForChart = useMemo(() => {
    const template = [
      { dayLabel: 'Lun', inbound: 0, outbound: 0 },
      { dayLabel: 'Mar', inbound: 0, outbound: 0 },
      { dayLabel: 'Mer', inbound: 0, outbound: 0 },
      { dayLabel: 'Jeu', inbound: 0, outbound: 0 },
      { dayLabel: 'Ven', inbound: 0, outbound: 0 },
    ];
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    return weeklyCalls.reduce((acc, call) => {
      if (!call.startTime || !['CDS_IN', 'CDS_OUT'].includes(call.callType)) return acc;
      const dayLabel = dayNames[call.startTime.getDay()];
      const day = acc.find(d => d.dayLabel === dayLabel);
      if (day) {
        if (call.callType === 'CDS_IN') day.inbound += 1;
        else if (call.callType === 'CDS_OUT') day.outbound += 1;
      }
      return acc;
    }, [...template]);
  }, [weeklyCalls]);

  const isInboundAHTCritical = useMemo(() => {
    const seconds = mmssToSeconds(kpi.avgInboundAHT);
    return getInboundAHTColor(seconds) === 'error';
  }, [kpi.avgInboundAHT]);

  const isOutboundAHTCritical = useMemo(() => {
    const seconds = mmssToSeconds(kpi.avgOutboundAHT);
    return getOutboundAHTColor(seconds) === 'error';
  }, [kpi.avgOutboundAHT]);

  const isAbandonRateCritical = useMemo(() => isAbandonCritical(kpi.abandonRate), [kpi.abandonRate]);

  // 🔊 Sons horaires (inchangés)
  useEffect(() => {
    if (!audioUnlocked) return;
    scheduledTimeoutsRef.current.forEach(id => clearTimeout(id));
    scheduledTimeoutsRef.current = [];

    const scheduleSoundAt = (targetHour, targetMinute, soundFile, label, allowedDays = null) => {
      const now = new Date();
      let scheduledTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), targetHour, targetMinute, 0, 0);

      if (Array.isArray(allowedDays) && allowedDays.length > 0) {
        let attempts = 0;
        let found = false;
        while (attempts < 7) {
          if (allowedDays.includes(scheduledTime.getDay()) && scheduledTime > now) {
            found = true;
            break;
          }
          scheduledTime.setDate(scheduledTime.getDate() + 1);
          attempts++;
        }
        if (!found) {
          scheduledTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, targetHour, targetMinute, 0, 0);
        }
      } else {
        if (scheduledTime <= now) {
          scheduledTime.setDate(scheduledTime.getDate() + 1);
        }
      }

      const delay = Math.max(scheduledTime.getTime() - now.getTime(), 100);

      const timeoutId = setTimeout(() => {
        const currentDate = new Date();
        const isAllowed = !allowedDays || 
                         (Array.isArray(allowedDays) && allowedDays.includes(currentDate.getDay()));
        
        if (!isAllowed) {
          console.log(`[Son] ⏰ ${label} ignoré - jour non autorisé (${currentDate.toLocaleDateString()})`);
        } else {
          playSound(soundFile, label);
        }
        
        const nextId = scheduleSoundAt(targetHour, targetMinute, soundFile, label, allowedDays);
        scheduledTimeoutsRef.current.push(nextId);
      }, delay);

      return timeoutId;
    };

    const WEEKDAY_DAYS = [1, 2, 3, 4, 5];
    const MON_THU_DAYS = [1, 2, 3, 4];
    const FRI_DAY = [5];

    const timeouts = [
      scheduleSoundAt(8, 30, 'debut.mp3', 'Début journée', WEEKDAY_DAYS),
      scheduleSoundAt(12, 30, 'pause.mp3', 'Pause déjeuner', WEEKDAY_DAYS),
      scheduleSoundAt(14, 0, 'reprise.mp3', 'Reprise après pause', WEEKDAY_DAYS),
      scheduleSoundAt(18, 0, 'fin.mp3', 'Fin journée (Lun-Jeu)', MON_THU_DAYS),
      scheduleSoundAt(17, 0, 'fin.mp3', 'Fin journée (Vendredi)', FRI_DAY)
    ];

    scheduledTimeoutsRef.current = timeouts;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        scheduledTimeoutsRef.current.forEach(id => clearTimeout(id));
        scheduledTimeoutsRef.current = [];
        
        const newTimeouts = [
          scheduleSoundAt(8, 30, 'debut.mp3', 'Début journée', WEEKDAY_DAYS),
          scheduleSoundAt(12, 30, 'pause.mp3', 'Pause déjeuner', WEEKDAY_DAYS),
          scheduleSoundAt(14, 0, 'reprise.mp3', 'Reprise après pause', WEEKDAY_DAYS),
          scheduleSoundAt(18, 0, 'fin.mp3', 'Fin journée (Lun-Jeu)', MON_THU_DAYS),
          scheduleSoundAt(17, 0, 'fin.mp3', 'Fin journée (Vendredi)', FRI_DAY)
        ];
        scheduledTimeoutsRef.current = newTimeouts;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      scheduledTimeoutsRef.current.forEach(id => clearTimeout(id));
    };
  }, [audioUnlocked]);

  // 🔊 Top agent (inchangé)
  useEffect(() => {
    if (!audioUnlocked || employees.length === 0) return;
    const totalCalls = kpi.totalAnsweredCalls + kpi.missedCallsTotal + kpi.totalOutboundCalls;
    if (totalCalls < 50) return;
    const prevEmployees = prevEmployeesRef.current;
    const currentTop = employees.reduce((top, a) =>
      (a.inbound + a.outbound) > (top?.inbound + top?.outbound || 0) ? a : top, null
    );
    const prevTop = prevEmployees.reduce((top, a) =>
      (a.inbound + a.outbound) > (top?.inbound + top?.outbound || 0) ? a : top, null
    );
    if (currentTop && (!prevTop || prevTop.name !== currentTop.name)) {
      const allowedFirstNames = new Set(['xavier', 'rana', 'mathys', 'romain', 'nicolas', 'julien', 'benjamin', 'malik','marina','gwenaelle']);
      const firstName = currentTop.name.split(' ')[0]?.toLowerCase() || '';
      const soundToPlay = allowedFirstNames.has(firstName) ? `${firstName}.mp3` : 'passage.mp3';
      playSound(soundToPlay, `Top agent : ${currentTop.name}`);
    }
    prevEmployeesRef.current = [...employees];
  }, [employees, audioUnlocked, kpi]);

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Orbitron:wght@700;900&family=Roboto:wght@300;400;500;700&display=swap"
        rel="stylesheet"
      />
      <style>
        {`
/* ☀️ Rayons de soleil – Animation lumineuse */
@keyframes sun-float {
  0% { 
    transform: translateY(0) translateX(0) scale(1); 
    opacity: 0;
  }
  10% { 
    opacity: 0.8;
  }
  50% { 
    transform: translateY(-30vh) translateX(20px) scale(1.2);
    opacity: 0.9;
  }
  90% { 
    opacity: 0.6;
  }
  100% { 
    transform: translateY(-100vh) translateX(-10px) scale(0.8); 
    opacity: 0;
  }
}
.sunray {
  position: fixed;
  bottom: -20px;
  width: 4px;
  height: 4px;
  background: radial-gradient(circle, rgba(255, 220, 0, 0.9), rgba(255, 180, 0, 0.5), transparent);
  border-radius: 50%;
  z-index: 1;
  opacity: 0;
  animation: sun-float linear infinite;
  pointer-events: none;
  box-shadow: 0 0 10px rgba(255, 220, 0, 0.6), 0 0 20px rgba(255, 180, 0, 0.3);
  will-change: transform, opacity;
}
.sunray:nth-child(odd) { animation-duration: 4s; }
.sunray:nth-child(even) { animation-duration: 6s; }
.sunray:nth-child(3n) { animation-duration: 5s; width: 6px; height: 6px; }
.sunray:nth-child(5n) { animation-duration: 7s; width: 8px; height: 8px; opacity: 0.95; }

/* === Glassmorphism ULTRA-TRANSPARENT === */
.glass-panel {
  background: rgba(10, 14, 23, 0.25) !important;
  backdrop-filter: blur(8px) !important;
  -webkit-backdrop-filter: blur(8px) !important;
  border: 1px solid rgba(255, 200, 0, 0.25) !important;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}
.glass-panel:hover {
  background: rgba(10, 14, 23, 0.35) !important;
  border-color: rgba(255, 200, 0, 0.45) !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 25px rgba(255, 200, 0, 0.2);
  transform: translateY(-2px);
}

/* === Effet lumineux au survol === */
.sunray-hover {
  position: relative;
  overflow: hidden;
}
.sunray-hover::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 220, 0, 0.15) 0%, transparent 70%);
  opacity: 0;
  transform: scale(0.3);
  transition: all 0.4s ease;
  pointer-events: none;
  border-radius: 50%;
}
.sunray-hover:hover::before {
  opacity: 1;
  transform: scale(1);
  animation: sunray-ripple 0.6s ease-out;
}
@keyframes sunray-ripple {
  0% { transform: scale(0.3); opacity: 0.8; }
  100% { transform: scale(1.5); opacity: 0; }
}

/* === Scrollbar sombre discrète === */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb {
  background: rgba(52, 73, 94, 0.4);
  border-radius: 3px;
  transition: all 0.3s ease;
}
body.show-scrollbar ::-webkit-scrollbar-thumb {
  background: rgba(93, 109, 126, 0.6);
}
* { scrollbar-width: thin; scrollbar-color: rgba(52, 73, 94, 0.4) transparent; }

/* === Boutons thème soleil === */
.btn-sun {
  background: linear-gradient(135deg, #ffd700, #ffaa00) !important;
  color: #0a0e17 !important;
  font-weight: 600 !important;
  text-transform: none !important;
  border-radius: 50px !important;
  border: 2px solid rgba(255, 200, 0, 0.5) !important;
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4) !important;
  transition: all 0.3s ease !important;
  font-family: "Orbitron", sans-serif !important;
}
.btn-sun:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 25px rgba(255, 215, 0, 0.6) !important;
  border-color: rgba(255, 200, 0, 0.8) !important;
}
`}
      </style>

      {/* 🦉☀️ Fond d'écran – Hibou sous le soleil (OVERLAY TRÈS LÉGER) */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url('${process.env.PUBLIC_URL}/images/OwlSun.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: 0,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(10, 14, 23, 0.15)', // Overlay très léger pour lisibilité
            pointerEvents: 'none',
          }
        }}
      />

      {/* ☀️ Particules de soleil animées */}
      {[...Array(30)].map((_, i) => (
        <div 
          key={i} 
          className="sunray"
          style={{ 
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${4 + Math.random() * 4}s`
          }}
        />
      ))}

      {/* Conteneur principal – Transparent */}
      <Box
        sx={{
          minHeight: '100vh',
          py: { xs: 2, md: 4 },
          position: 'relative',
          zIndex: 2,
          color: '#ecf0f1',
          fontFamily: '"Roboto", sans-serif',
          px: { xs: 0.5, sm: 1, md: 2 },
        }}
        aria-label="Tableau de bord ensoleillé ANAVEO"
      >
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%' }}>
          
          {/* Titre – Glassmorphism ultra-transparent */}
          <Box
            sx={{
              mb: 1,
              background: 'rgba(10, 14, 23, 0.25)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 200, 0, 0.25)',
              borderRadius: '24px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              padding: { xs: '0.8rem 1.4rem', md: '1.2rem 2.2rem' },
              display: 'inline-block',
              margin: '0 auto',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'rgba(10, 14, 23, 0.35)',
                borderColor: 'rgba(255, 200, 0, 0.45)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 25px rgba(255, 200, 0, 0.2)',
              }
            }}
          >
            <Typography
              variant="h1"
              align="center"
              sx={{
                fontFamily: '"Montserrat", sans-serif',
                fontWeight: 'bold',
                fontSize: { xs: '2rem', sm: '2.8rem', md: '3.6rem' },
                color: '#ecf0f1',
                textShadow: '0 2px 10px rgba(0,0,0,0.4), 0 0 20px rgba(255, 200, 0, 0.4)',
                margin: 0,
                letterSpacing: '0.02em',
              }}
            >
              🦉 Anaveo - Centre de Services 🦉
            </Typography>
          </Box>

          <Box textAlign="center" mb={0.5}>
            <Clock />
          </Box>

          {!isConnected && (
            <Box
              textAlign="center"
              mb={2}
              sx={{
                color: '#ecf0f1',
                fontWeight: 'bold',
                textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                px: { xs: 2, sm: 3 },
                background: 'rgba(10, 14, 23, 0.3)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                borderRadius: '16px',
                py: 1,
                border: '1px solid rgba(231, 76, 60, 0.3)',
                boxShadow: '0 4px 20px rgba(231, 76, 60, 0.1)',
              }}
            >
              ☀️ Connexion WebSocket perdue. Reconnexion en cours...
              <Button
                size="small"
                variant="outlined"
                className="btn-sun"
                onClick={reconnect}
              >
                🔄 Reconnecter
              </Button>
            </Box>
          )}

          {/* KPI Principaux – Ultra-transparents */}
          <Grid container spacing={2.5} justifyContent="center" sx={{ mt: 0.5, px: { xs: 1.5, sm: 2.5, md: 3.5 } }} aria-label="KPI Principaux">
            {[
              { title: "Total Agents", value: kpi.totalAgents, color: "info", critical: false },
              { title: "Number of Calls", value: kpi.totalCallsThisWeek.toString(), color: "primary", critical: false },
              { title: "Avg Inbound AHT", value: kpi.avgInboundAHT, color: getInboundAHTColor(mmssToSeconds(kpi.avgInboundAHT)), critical: isInboundAHTCritical },
              { title: "Avg Outbound AHT", value: kpi.avgOutboundAHT, color: getOutboundAHTColor(mmssToSeconds(kpi.avgOutboundAHT)), critical: isOutboundAHTCritical },
            ].map((item, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                <KPICard 
                  title={item.title} 
                  value={item.value.toString()} 
                  valueColor={item.color} 
                  isCritical={item.critical} 
                  sx={{
                    '& .MuiPaper-root': {
                      background: 'rgba(10, 14, 23, 0.25) !important',
                      backdropFilter: 'blur(8px) !important',
                      border: '1px solid rgba(255, 255, 255, 0.1) !important',
                      borderRadius: '20px !important',
                      color: '#ecf0f1 !important',
                    }
                  }}
                />
              </Grid>
            ))}
          </Grid>

          {/* KPI Détail Appels – Ultra-transparents */}
          <Grid container spacing={2.5} justifyContent="center" sx={{ mt: 1, px: { xs: 1.5, sm: 2.5, md: 3.5 } }} aria-label="KPI Détail Appels">
            {[
              { title: "Answered Calls", value: kpi.totalAnsweredCalls, color: "default", critical: false },
              { title: "Missed Calls", value: kpi.missedCallsTotal, color: "error", critical: false },
              { title: "Total Inbound Calls", value: kpi.totalInboundCalls, color: "info", critical: false },
              { title: "Total Outbound Calls", value: kpi.totalOutboundCalls, color: "success", critical: false },
              { title: "Abandon Rate", value: kpi.abandonRate, color: getAbandonColor(kpi.abandonRate), critical: isAbandonRateCritical },
            ].map((item, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={i}>
                <KPICard 
                  title={item.title} 
                  value={item.value.toString()} 
                  valueColor={item.color} 
                  isCritical={item.critical}
                  sx={{
                    '& .MuiPaper-root': {
                      background: 'rgba(10, 14, 23, 0.25) !important',
                      backdropFilter: 'blur(8px) !important',
                      border: '1px solid rgba(255, 255, 255, 0.1) !important',
                      borderRadius: '20px !important',
                      color: '#ecf0f1 !important',
                    }
                  }}
                />
              </Grid>
            ))}
          </Grid>

          <Box mt={2} px={{ xs: 1.5, sm: 2.5, md: 3.5 }}>
            <CallVolumeChart 
              callVolumes={callVolumes} 
              wsConnected={isConnected} 
              halfHourSlots={halfHourSlots} 
              sx={{
                '& .MuiPaper-root': {
                  background: 'rgba(10, 14, 23, 0.25) !important',
                  backdropFilter: 'blur(8px) !important',
                  border: '1px solid rgba(255, 255, 255, 0.1) !important',
                }
              }}
            />
          </Box>

          <Box mt={{ xs: 7, md: 9 }} pb={7} px={{ xs: 1.5, sm: 2.5, md: 3.5 }}>
            <Grid container spacing={4} direction="column">
              <Grid size={{ xs: 12 }}>
                <AgentTable
                  employees={employees.map((emp) => ({
                    ...emp,
                    avgInboundAHT: formatSecondsToMMSS(emp.inbound > 0 ? Math.floor(emp.inboundHandlingTimeSec / emp.inbound) : 0),
                    avgOutboundAHT: formatSecondsToMMSS(emp.outbound > 0 ? Math.floor(emp.outboundHandlingTimeSec / emp.outbound) : 0),
                  }))}
                  isLoading={!isConnected && employees.length === 0}
                  isConnected={isConnected}
                  lastUpdate={lastUpdate}
                  sx={{
                    '& .MuiPaper-root': {
                      background: 'rgba(10, 14, 23, 0.25) !important',
                      backdropFilter: 'blur(8px) !important',
                      border: '1px solid rgba(255, 255, 255, 0.1) !important',
                    },
                    '& th': {
                      color: '#ffd700 !important',
                      fontWeight: 600,
                    },
                    '& td': {
                      color: '#ecf0f1 !important',
                      borderBottomColor: 'rgba(255, 255, 255, 0.1) !important',
                    }
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Box position="relative">
                  <SLABarchart 
                    slaData={slaDataForChart} 
                    wsConnected={isConnected}
                    sx={{
                      '& .MuiPaper-root': {
                        background: 'rgba(10, 14, 23, 0.25) !important',
                        backdropFilter: 'blur(8px) !important',
                        border: '1px solid rgba(255, 255, 255, 0.1) !important',
                      }
                    }}
                  />
                  {!audioUnlocked && (
                    <Box sx={{ position: 'absolute', bottom: 16, right: 16, zIndex: 2 }}>
                      <Button
                        variant="contained"
                        onClick={unlockAudio}
                        className="btn-sun sunray-hover"
                      >
                        ☀️ Activer l'ambiance sonore ☀️
                      </Button>
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default App;