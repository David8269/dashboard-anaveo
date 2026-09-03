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

// ============================================================================
// === HELPERS (Logique métier 100% préservée) ===
// ============================================================================
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
  for (let h = 8; h <= 19; h++) {  // Changé de 18 à 19
    slots.push(`${h.toString().padStart(2, '0')}:30`);
    if (h < 19) slots.push(`${(h + 1).toString().padStart(2, '0')}:00`);  // Changé de 18 à 19
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

// ============================================================================
// === COMPOSANTS UI ENHANCED OKTOBERFEST ===
// ============================================================================

// 🍺 Clock – Version Verre à bière ULTRA-TRANSPARENT
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
        fontFamily: '"Rye", serif',
        fontWeight: 400,
        fontSize: { xs: '1.5rem', sm: '2rem', md: '2.2rem' },
        color: '#fff8e7',
        // Ombre portée renforcée pour lisibilité sur fond transparent
        textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 0 12px rgba(0,0,0,0.8), 0 0 15px rgba(255, 170, 0, 0.6)',
        background: 'rgba(10, 5, 0, 0.20)', // ULTRA-TRANSPARENT (20%)
        backdropFilter: 'blur(4px)', // Flou minimal
        WebkitBackdropFilter: 'blur(4px)',
        padding: { xs: '0.5rem 1.2rem', md: '0.8rem 1.8rem' },
        borderRadius: '16px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.8rem',
        border: '1px solid rgba(255, 170, 0, 0.25)',
        borderTop: '2px solid rgba(255, 248, 231, 0.5)', // Mousse fine
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), inset 0 0 15px rgba(255, 255, 255, 0.05)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        // Texture givre/condensation discrète
        backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08) 1px, transparent 1px), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.08) 1px, transparent 1px)',
        backgroundSize: '15px 15px',
        '&:hover': {
          background: 'rgba(10, 5, 0, 0.30)',
          borderColor: 'rgba(255, 248, 231, 0.5)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 170, 0, 0.15)',
          transform: 'translateY(-2px)',
        }
      }}
      role="status"
      aria-live="polite"
    >
      <span style={{ fontSize: '0.8em', filter: 'drop-shadow(0 0 5px rgba(255,170,0,0.8))' }}>🍺</span>
      {hours}:{minutes}:<span style={{ color: '#ffaa00', fontFamily: '"Montserrat", sans-serif', fontWeight: 700 }}>{seconds}</span>
    </Paper>
  );
}

// ============================================================================
// === SCHEDULERS & WEBSOCKET (Logique 100% préservée) ===
// ============================================================================
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
      console.log(`[WS]  Connexion à ${url}`);
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
          console.log(`[WS]  Message brut reçu :`, msg);
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

// ============================================================================
// === GESTION AUDIO (Logique 100% préservée) ===
// ============================================================================
const playSound = (filename, context = '', volume = 0.8) => {
  try {
    const audio = new Audio(`${process.env.PUBLIC_URL}/sounds/${filename}`);
    audio.volume = volume;
    const logContext = context ? `(${context})` : '';
    console.log(`[Son] 🔊 Lecture : ${filename} ${logContext}`);
    audio.play().catch(e => {
      console.warn(`[Son]  Échec lecture ${filename}:`, e.message);
    });
  } catch (error) {
    console.error(`[Son] 💥 Erreur :`, error);
  }
};

// ============================================================================
// === COMPOSANT PRINCIPAL APP ===
// ============================================================================
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

  // 🔊 Sons horaires (Logique préservée)
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
        const isAllowed = !allowedDays || (Array.isArray(allowedDays) && allowedDays.includes(currentDate.getDay()));
        
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

  // 🔊 Top agent (Logique préservée)
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
      const allowedFirstNames = new Set(['xavier', 'rana', 'mathys', 'romain', 'nicolas', 'julien', 'benjamin', 'malik','marina','vivien','kévin','christophe','gwenaëlle']);
      const firstName = currentTop.name.split(' ')[0]?.toLowerCase() || '';
      const soundToPlay = allowedFirstNames.has(firstName) ? `${firstName}.mp3` : 'passage.mp3';
      playSound(soundToPlay, `Top agent : ${currentTop.name}`);
    }
    prevEmployeesRef.current = [...employees];
  }, [employees, audioUnlocked, kpi]);

  // === STYLE INJECTOR (Thème OKTOBERFEST ULTRA-TRANSPARENT) ===
  const glassSx = {
    '& .MuiPaper-root': {
      background: 'rgba(10, 5, 0, 0.20) !important', // ULTRA-TRANSPARENT (20%)
      backdropFilter: 'blur(4px) !important', // Flou minimal
      WebkitBackdropFilter: 'blur(4px) !important',
      border: '1px solid rgba(255, 170, 0, 0.25) !important',
      borderTop: '2px solid rgba(255, 248, 231, 0.5) !important', // Mousse fine
      borderRadius: '16px !important',
      boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.3), inset 0 0 15px rgba(255, 255, 255, 0.05) !important',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important',
      // Texture givre/condensation discrète
      backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08) 1px, transparent 1px), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.08) 1px, transparent 1px) !important',
      backgroundSize: '15px 15px !important',
      '&:hover': {
        background: 'rgba(10, 5, 0, 0.30) !important',
        borderColor: 'rgba(255, 248, 231, 0.5) !important',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 170, 0, 0.15) !important',
        transform: 'translateY(-2px)',
      }
    }
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Montserrat:wght@500;700;800&family=Rye&display=swap"
        rel="stylesheet"
      />
      <style>
        {`
        /* === VARIABLES OKTOBERFEST === */
        :root {
          --okto-amber: #ffaa00;
          --okto-foam: #fff8e7;
          --okto-wood: #2c1e12;
          --okto-bavarian: #0044cc;
        }

        /* === BULLES DE BIÈRE (Effervescence réaliste) === */
        .beer-bubble {
          position: fixed;
          bottom: -20px;
          background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.95), rgba(255, 215, 0, 0.75));
          border-radius: 50%;
          opacity: 0;
          pointer-events: none;
          z-index: 1;
          box-shadow: 0 0 4px rgba(255, 255, 255, 0.6), inset 0 0 2px rgba(255, 255, 255, 0.4);
          animation: rise-wobble linear infinite;
        }

        @keyframes rise-wobble {
          0% { transform: translateY(0) translateX(0) scale(0.3); opacity: 0; }
          10% { opacity: 0.85; }
          25% { transform: translateY(-25vh) translateX(6px) scale(0.7); }
          50% { transform: translateY(-50vh) translateX(-6px) scale(1); opacity: 0.6; }
          75% { transform: translateY(-75vh) translateX(4px) scale(0.85); }
          90% { opacity: 0.3; }
          100% { transform: translateY(-110vh) translateX(-4px) scale(0.5); opacity: 0; }
        }

        /* === GLASSMORPHISM "VERRE À BIÈRE" (Ultra Transparent) === */
        .glass-panel {
          background: rgba(10, 5, 0, 0.20) !important; /* ULTRA-TRANSPARENT (20%) */
          backdrop-filter: blur(4px) !important; /* Flou minimal */
          -webkit-backdrop-filter: blur(4px) !important;
          border: 1px solid rgba(255, 170, 0, 0.25) !important;
          border-top: 2px solid rgba(255, 248, 231, 0.5) !important; /* Mousse fine */
          border-radius: 16px !important;
          box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.3), inset 0 0 15px rgba(255, 255, 255, 0.05) !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          /* Texture givre/condensation discrète */
          background-image: radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08) 1px, transparent 1px), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.08) 1px, transparent 1px) !important;
          background-size: 15px 15px !important;
        }
        .glass-panel:hover {
          background: rgba(10, 5, 0, 0.30) !important;
          border-color: rgba(255, 248, 231, 0.5) !important;
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 170, 0, 0.15) !important;
          transform: translateY(-2px);
        }

        /* === Bouton Oktoberfest === */
        .btn-oktoberfest {
          background: rgba(255, 170, 0, 0.20) !important;
          backdrop-filter: blur(4px);
          color: var(--okto-amber) !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          border-radius: 8px !important;
          border: 1px solid rgba(255, 170, 0, 0.4) !important;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3) !important;
          transition: all 0.3s ease !important;
          font-family: "Montserrat", sans-serif !important;
          letter-spacing: 1px;
        }
        .btn-oktoberfest:hover {
          background: rgba(255, 170, 0, 0.35) !important;
          border-color: var(--okto-foam) !important;
          color: var(--okto-foam) !important;
          box-shadow: 0 0 20px rgba(255, 170, 0, 0.4) !important;
          transform: translateY(-2px) !important;
        }

        /* === Scrollbar === */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 170, 0, 0.3);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover { background: var(--okto-amber); }
        * { scrollbar-width: thin; scrollbar-color: rgba(255, 170, 0, 0.3) transparent; }
        `}
      </style>

      {/* 🍻 Fond d'écran OKTOBERFEST - SANS ZOOM, PLEIN ÉCRAN */}
<Box
  sx={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: `url('${process.env.PUBLIC_URL}/images/oktoberfest.png')`,
    backgroundSize: '100% 100%', // ✅ Changé de 'cover' à '100% 100%'
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    zIndex: 0
  }}
/>

      {/* ✨ Bulles de bière animées (Effervescence réaliste - 70 bulles) */}
      <Box id="bubbles-container">
        {[...Array(70)].map((_, i) => (
          <div 
            key={i} 
            className="beer-bubble"
            style={{ 
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${4 + Math.random() * 6}s`,
              width: `${3 + Math.random() * 8}px`,
              height: `${3 + Math.random() * 8}px`,
            }}
          />
        ))}
      </Box>

      {/* 📊 Conteneur principal PLEINE LARGEUR */}
      <Box
        sx={{
          minHeight: '100vh',
          py: { xs: 2, md: 3 },
          position: 'relative',
          zIndex: 10,
          color: '#fff8e7',
          fontFamily: '"Inter", sans-serif',
          px: { xs: 1, sm: 1.5, md: 2 },
        }}
        aria-label="Tableau de bord ANAVEO Oktoberfest"
      >
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%' }}>
          
          {/* 🏷️ En-tête Bavarois */}
          <Box
            className="glass-panel"
            sx={{
              mb: 2,
              padding: { xs: '1rem', md: '1.5rem 2.5rem' },
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              width: '100%',
            }}
          >
            <Typography
              variant="h1"
              sx={{
                fontFamily: '"Rye", serif',
                fontWeight: 400,
                fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.8rem' },
                color: '#fff8e7',
                textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 0 12px rgba(0,0,0,0.8), 0 0 15px rgba(255, 170, 0, 0.6)',
                letterSpacing: '0.02em',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <span style={{ fontSize: '1.1em', filter: 'drop-shadow(0 0 8px rgba(255,170,0,0.6))' }}>🍻</span> 
              <span>OKTOBERFEST</span> 
              <span style={{ color: '#ffaa00', fontWeight: 400, fontSize: '0.5em', marginLeft: '0.5rem', fontFamily: '"Montserrat", sans-serif', letterSpacing: '2px' }}>
                - Centre De Services 🍻
              </span>
            </Typography>
            
            <Clock />
          </Box>

          {/* ⚠️ Alerte de connexion */}
          {!isConnected && (
            <Box
              className="glass-panel"
              sx={{
                mb: 2,
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                borderColor: 'rgba(255, 170, 0, 0.5) !important',
                background: 'rgba(255, 170, 0, 0.10) !important',
                animation: 'pulse-amber 2s infinite',
              }}
            >
              <style>{`@keyframes pulse-amber { 0%, 100% { box-shadow: 0 0 0 0 rgba(255, 170, 0, 0.4); } 50% { box-shadow: 0 0 0 10px rgba(255, 170, 0, 0); } }`}</style>
              <Typography sx={{ color: '#ffdd88', fontWeight: 700, fontFamily: '"Montserrat", sans-serif', letterSpacing: '1px', textShadow: '0 2px 6px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.8)' }}>
                ⚠️ CONNEXION WEBSOCKET PERDUE
              </Typography>
              <Button
                size="small"
                variant="outlined"
                className="btn-oktoberfest"
                onClick={reconnect}
                sx={{ borderColor: '#ffaa00 !important', color: '#ffaa00 !important' }}
              >
                🔄 Reconnecter
              </Button>
            </Box>
          )}

          {/* 📈 KPI Principaux */}
          <Grid container spacing={2.5} sx={{ mt: 0.5 }} aria-label="KPI Principaux">
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
                  sx={glassSx}
                />
              </Grid>
            ))}
          </Grid>

          {/* 📊 KPI Détail Appels */}
          <Grid container spacing={2.5} sx={{ mt: 1 }} aria-label="KPI Détail Appels">
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
                  sx={glassSx}
                />
              </Grid>
            ))}
          </Grid>

          {/* 📉 Graphique Volume d'appels */}
          <Box mt={3} sx={glassSx}>
            <CallVolumeChart 
              callVolumes={callVolumes} 
              wsConnected={isConnected} 
              halfHourSlots={halfHourSlots} 
            />
          </Box>

          {/* 📋 Tableaux et Graphiques SLA */}
          <Box mt={4} pb={4} sx={{ width: '100%' }}>
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
                    ...glassSx,
                    '& th': {
                      color: '#ffaa00 !important',
                      fontWeight: 700,
                      fontFamily: '"Montserrat", sans-serif',
                      letterSpacing: '0.05em',
                      borderBottom: '1px solid rgba(255, 170, 0, 0.3) !important',
                      textShadow: '0 2px 6px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.8)',
                    },
                    '& td': {
                      color: '#fff8e7 !important',
                      borderBottomColor: 'rgba(255, 170, 0, 0.15) !important',
                      fontFamily: '"Inter", sans-serif',
                      textShadow: '0 1px 4px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.8)',
                    },
                    '& tr:hover td': {
                      background: 'rgba(255, 170, 0, 0.10) !important',
                    }
                  }}
                />
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <Box position="relative" sx={glassSx}>
                  <SLABarchart 
                    slaData={slaDataForChart} 
                    wsConnected={isConnected}
                  />
                  
                  {!audioUnlocked && (
                    <Box sx={{ position: 'absolute', bottom: 24, right: 24, zIndex: 20 }}>
                      <Button
                        variant="contained"
                        onClick={unlockAudio}
                        className="btn-oktoberfest"
                        startIcon={<span style={{ fontSize: '1.2em' }}>🍻</span>}
                        sx={{ 
                          boxShadow: '0 0 20px rgba(255, 170, 0, 0.3) !important',
                          animation: 'pulse-glow-amber 2s infinite'
                        }}
                      >
                        Activer l'Ambiance Bavaroise
                      </Button>
                      <style>{`@keyframes pulse-glow-amber { 0%, 100% { box-shadow: 0 0 15px rgba(255, 170, 0, 0.3); } 50% { box-shadow: 0 0 30px rgba(255, 170, 0, 0.6); } }`}</style>
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