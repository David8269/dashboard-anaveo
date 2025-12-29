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

// === Helpers (inchangés) ===
const isLunchBreak = (date) => {
  if (!date) return false;
  const totalMinutes = date.getHours() * 60 + date.getMinutes();
  return totalMinutes >= 750 && totalMinutes < 840;
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

<<<<<<< HEAD
// === Clock (version Nouvel An – avec flou) ===
=======
// === Clock (version Noël — transparence sans flou) ===
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
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
<<<<<<< HEAD
        fontFamily: '"Orbitron", sans-serif',
        fontWeight: 'bold',
        fontSize: { xs: '1.8rem', sm: '2.4rem', md: '3rem' },
        color: '#d4af37',
        textShadow: '0 0 12px rgba(212, 175, 55, 0.8), 0 2px 4px rgba(0,0,0,0.3)',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)', // 👈 Flou ajouté
        WebkitBackdropFilter: 'blur(4px)', // compatibilité
        padding: { xs: '0.5rem 1rem', md: '0.8rem 1.4rem' },
        borderRadius: '16px',
        display: 'inline-block',
        margin: '0 auto',
        border: '1px solid rgba(212, 175, 55, 0.6)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
=======
        fontFamily: '"Mountains of Christmas", cursive',
        fontWeight: 'bold',
        fontSize: { xs: '1.8rem', sm: '2.4rem', md: '3rem' },
        color: '#000',
        textShadow: '0 2px 6px rgba(255,215,0,0.7), 0 1px 2px rgba(0,0,0,0.1)',
        backgroundColor: 'rgba(255, 255, 255, 0.65)',
        padding: { xs: '0.4rem 0.8rem', md: '0.6rem 1.2rem' },
        borderRadius: '14px',
        display: 'inline-block',
        margin: '0 auto',
        border: '1px solid #d42426',
        boxShadow: '0 4px 12px rgba(212, 36, 38, 0.3)',
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
      }}
      role="status"
      aria-live="polite"
    >
      {hours}:{minutes}:{seconds}
    </Paper>
  );
}

<<<<<<< HEAD
// === Schedulers & WebSocket (inchangés) ===
=======
// === Schedulers & WebSocket (corrigé) ===
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
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
<<<<<<< HEAD
          wsRef.current.send(JSON.stringify({ type: 'keepalive', ts: Date.now() }));
        } catch (e) {
          console.warn('[WS] ⚠️ Keepalive échoué', e);
        }
      }
    }, 45000);
=======
          wsRef.current.send(JSON.stringify({ type: 'ping', ts: Date.now() }));
        } catch (e) {
          console.warn('[WS] ⚠️ Ping échoué', e);
          wsRef.current?.close();
        }
      }
    }, 30000);
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
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
<<<<<<< HEAD
      }, 10000);
=======
      }, 15000);
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5

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
<<<<<<< HEAD
          if (msg.includes('"type":"keepalive"') || msg.includes('"type":"pong"')) {
=======
          if (msg.includes('"type":"keepalive"') || msg.includes('"type":"pong"') || msg.includes('"type":"ping"') || msg.includes('"type":"pong"')) {
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
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
          if (cdr.callType === 'ABSYS' && !isLunchBreak(cdr.startTime)) {
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
<<<<<<< HEAD
        console.warn(`[WS] 🔌 Déconnecté (code ${e.code})`);
=======
        console.warn(`[WS] 🔌 Déconnecté (code ${e.code}, raison: ${e.reason})`);
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
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

<<<<<<< HEAD
// === Sons (inchangés) ===
=======
// === Sons (inchangés — noms conservés) ===
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
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

// === App ===
const App = () => {
  const WS_URL = 'wss://cds-on3cx.anaveo.com/cdr-ws/';
  const prevEmployeesRef = useRef([]);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const scheduledTimeoutsRef = useRef([]);

  // Gestion scrollbar
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

<<<<<<< HEAD
  // 🔊 Sons horaires
=======
  // 🔊 Sons horaires (noms conservés)
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
  useEffect(() => {
    if (!audioUnlocked) return;
    scheduledTimeoutsRef.current.forEach(id => clearTimeout(id));
    scheduledTimeoutsRef.current = [];
    const scheduleSoundAt = (targetHour, targetMinute, soundFile, label) => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), targetHour, targetMinute, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const scheduledTime = today > now ? today : tomorrow;
      const delay = scheduledTime.getTime() - now.getTime();
      const timeoutId = setTimeout(() => {
        playSound(soundFile, label);
        const nextId = scheduleSoundAt(targetHour, targetMinute, soundFile, label);
        scheduledTimeoutsRef.current.push(nextId);
      }, delay);
      return timeoutId;
    };
    const timeouts = [
      scheduleSoundAt(8, 30, 'debut.mp3', 'Début journée'),
      scheduleSoundAt(12, 30, 'pause.mp3', 'Pause déjeuner'),
      scheduleSoundAt(14, 0, 'reprise.mp3', 'Reprise après pause'),
      scheduleSoundAt(18, 0, 'fin.mp3', 'Fin journée'),
    ];
    scheduledTimeoutsRef.current = timeouts;
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        scheduledTimeoutsRef.current.forEach(id => clearTimeout(id));
        scheduledTimeoutsRef.current = [];
        const newTimeouts = [
          scheduleSoundAt(8, 30, 'debut.mp3', 'Début journée'),
          scheduleSoundAt(12, 30, 'pause.mp3', 'Pause déjeuner'),
          scheduleSoundAt(14, 0, 'reprise.mp3', 'Reprise après pause'),
          scheduleSoundAt(18, 0, 'fin.mp3', 'Fin journée'),
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

<<<<<<< HEAD
  // 🔊 Top agent
=======
  // 🔊 Top agent (noms conservés)
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
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
      const allowedFirstNames = new Set(['xavier', 'rana', 'mathys', 'romain', 'nicolas', 'julien', 'benjamin', 'malik']);
      const firstName = currentTop.name.split(' ')[0]?.toLowerCase() || '';
      const soundToPlay = allowedFirstNames.has(firstName) ? `${firstName}.mp3` : 'passage.mp3';
      playSound(soundToPlay, `Top agent : ${currentTop.name}`);
    }
    prevEmployeesRef.current = [...employees];
  }, [employees, audioUnlocked, kpi]);

  return (
    <>
<<<<<<< HEAD
      {/* ✅ POLICES */}
      <link
        href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Orbitron:wght@700;900&family=Roboto:wght@300;400;500;700&display=swap"
        rel="stylesheet"
      />

      <style>
        {`
          /* ✨ Paillettes subtiles */
          @keyframes sparkle {
            0% { transform: translateY(-10px) rotate(0deg); opacity: 0; }
            20% { opacity: 1; }
            100% { transform: translateY(100vh) rotate(360deg); opacity: 0.7; }
          }
          .sparkle {
            position: fixed;
            top: -20px;
            font-size: 1rem;
            color: #d4af37;
            z-index: 1;
            opacity: 0;
            animation: sparkle 8s linear forwards;
            pointer-events: none;
            text-shadow: 0 0 8px rgba(212, 175, 55, 0.8);
          }
          .sparkle:nth-child(2n) { left: 10%; animation-duration: 10s; animation-delay: 1s; }
          .sparkle:nth-child(3n) { left: 20%; animation-duration: 12s; animation-delay: 2s; }
          .sparkle:nth-child(4n) { left: 35%; animation-duration: 9s; animation-delay: 0.5s; }
          .sparkle:nth-child(5n) { left: 50%; animation-duration: 11s; animation-delay: 3s; }
          .sparkle:nth-child(6n) { left: 65%; animation-duration: 8s; animation-delay: 1.5s; }
          .sparkle:nth-child(7n) { left: 80%; animation-duration: 13s; animation-delay: 4s; }
          .sparkle:nth-child(8n) { left: 90%; animation-duration: 10s; animation-delay: 2.5s; }

          /* Scrollbar dorée */
          ::-webkit-scrollbar { width: 8px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { 
            background: linear-gradient(to bottom, #d4af37, #b8860b);
=======
      {/* Polices */}
      <link href="https://fonts.googleapis.com/css2?family=Mountains+of+Christmas:wght@700&family=Orbitron:wght@700;900&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet" />

      <style>
        {`
          /* ❄️ Neige opaque — sans lueur dorée */
          @keyframes snow {
            0% { transform: translateY(-10px) rotate(0deg); opacity: 0; }
            10% { opacity: 1; }
            100% { transform: translateY(100vh) rotate(360deg); opacity: 1; }
          }
          .snowflake {
            position: fixed;
            top: -20px;
            color: #ffffff;
            font-size: 1.2rem;
            z-index: 1;
            opacity: 0;
            animation: snow 10s linear forwards;
            pointer-events: none;
          }
          .snowflake:nth-child(2n) { left: 8%; animation-duration: 12s; animation-delay: 2s; }
          .snowflake:nth-child(3n) { left: 18%; animation-duration: 15s; animation-delay: 4s; }
          .snowflake:nth-child(4n) { left: 28%; animation-duration: 11s; animation-delay: 1s; }
          .snowflake:nth-child(5n) { left: 38%; animation-duration: 13s; animation-delay: 3s; }
          .snowflake:nth-child(6n) { left: 48%; animation-duration: 9s; animation-delay: 0s; }
          .snowflake:nth-child(7n) { left: 58%; animation-duration: 14s; animation-delay: 5s; }
          .snowflake:nth-child(8n) { left: 68%; animation-duration: 10s; animation-delay: 2s; }
          .snowflake:nth-child(9n) { left: 78%; animation-duration: 12s; animation-delay: 6s; }
          .snowflake:nth-child(10n) { left: 88%; animation-duration: 11s; animation-delay: 1s; }

          /* Scrollbar Noël */
          ::-webkit-scrollbar { width: 8px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { 
            background: linear-gradient(to bottom, #d42426, #8b0000);
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
            border-radius: 5px;
            border: 2px solid transparent;
            background-clip: padding-box;
            transition: all 0.3s ease;
          }
<<<<<<< HEAD
          body.show-scrollbar ::-webkit-scrollbar-thumb { 
            background: linear-gradient(to bottom, #ffd700, #d4af37); 
          }
          body.show-scrollbar ::-webkit-scrollbar-track { 
            background: rgba(212, 175, 55, 0.1); 
          }

          /* Firefox */
          * { scrollbar-width: thin; scrollbar-color: transparent transparent; }
          body.show-scrollbar { 
            scrollbar-color: #d4af37 rgba(212, 175, 55, 0.1); 
          }
        `}
      </style>

      {/* 🎉 Fond d’écran */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url('${process.env.PUBLIC_URL}/images/newyear-bg.jpg')`,
          backgroundSize: '100% auto',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: 0,
        }}
      />

      {/* ✨ Paillettes */}
      {[...Array(8)].map((_, i) => (
        <div key={i} className="sparkle">✨</div>
=======
          body.show-scrollbar ::-webkit-scrollbar-thumb { background: linear-gradient(to bottom, #ffaa00, #d42426); }
          body.show-scrollbar ::-webkit-scrollbar-track { background: rgba(212, 36, 38, 0.1); }

          /* Firefox */
          * { scrollbar-width: thin; scrollbar-color: transparent transparent; }
          body.show-scrollbar { scrollbar-color: #d42426 rgba(212, 36, 38, 0.1); }

          :root {
            --christmas-bg: #ffffff;
            --christmas-text: #000;
            --christmas-accent: #ffd700;
            --christmas-primary: #d42426;
          }
        `}
      </style>

      {/* ❄️ Fond d’écran : ton hibou en bonnet */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url('${process.env.PUBLIC_URL}/images/christmas-bg.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: 0,
        }}
      />

      {/* ❄️ Neige opaque et sans lueur */}
      {[...Array(10)].map((_, i) => (
        <div key={i} className="snowflake">❄</div>
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
      ))}

      {/* Conteneur principal */}
      <Box
        sx={{
          minHeight: '100vh',
          py: { xs: 2, md: 4 },
          position: 'relative',
          zIndex: 2,
<<<<<<< HEAD
          color: '#ffffff',
          fontFamily: '"Roboto", sans-serif',
          px: { xs: 0.5, sm: 1, md: 2 },
        }}
        aria-label="Tableau de bord du Nouvel An en temps réel"
      >
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%' }}>
          {/* Titre élégant avec flou */}
          <Box
            sx={{
              mb: 2,
              backgroundColor: 'rgba(0, 0, 0, 0.55)',
              backdropFilter: 'blur(4px)', // 👈 Flou ajouté
              WebkitBackdropFilter: 'blur(4px)', // compatibilité
              borderRadius: '18px',
              border: '2px solid rgba(212, 175, 55, 0.7)',
              boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
              padding: { xs: '0.8rem 1.4rem', md: '1.2rem 2.2rem' },
=======
          color: 'var(--christmas-text)',
          fontFamily: '"Roboto", sans-serif',
          px: { xs: 0.5, sm: 1, md: 2 },
        }}
        aria-label="Tableau de bord de Noël en temps réel"
      >
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%' }}>
          {/* ✅ Titre — avec textShadow vert */}
          <Box
            sx={{
              mb: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.70)',
              borderRadius: '16px',
              border: '2px solid #d42426',
              boxShadow: '0 6px 20px rgba(212, 36, 38, 0.3)',
              padding: { xs: '0.7rem 1.2rem', md: '1rem 2rem' },
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
              display: 'inline-block',
              margin: '0 auto',
              textAlign: 'center',
            }}
          >
<<<<<<< HEAD
            <Typography
              variant="h1"
              align="center"
              sx={{
                fontFamily: '"Great Vibes", cursive',
                fontWeight: 'bold',
                fontSize: { xs: '2rem', sm: '2.8rem', md: '3.6rem' },
                color: '#d4af37',
                textShadow: '0 0 14px rgba(212, 175, 55, 0.9), 2px 2px 6px rgba(0,0,0,0.4)',
                margin: 0,
                letterSpacing: '0.02em',
              }}
            >
             🥂 Anaveo - Bonne Année 2026 ! 🥂
=======
            <Typography 
              variant="h1" 
              align="center" 
              sx={{ 
                fontFamily: '"Mountains of Christmas", cursive',
                fontWeight: 'bold',
                fontSize: { xs: '1.8rem', sm: '2.4rem', md: '3.2rem' },
                color: '#d42426',
                textShadow: '0 0 8px rgba(0, 255, 0, 0.8), 2px 2px 4px rgba(0, 100, 0, 0.5)',
                margin: 0,
                letterSpacing: '0.03em',
                '&::before': {
                  content: '"🎄🎅"',
                  marginRight: '0.5rem',
                  fontSize: '1.2em',
                  verticalAlign: 'middle',
                },
                '&::after': {
                  content: '"🎅🎄"',
                  marginLeft: '0.5rem',
                  fontSize: '1.2em',
                  verticalAlign: 'middle',
                },
              }}
            >
              ANAVEO - Christmas Center
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
            </Typography>
          </Box>

          <Box textAlign="center" mb={2}>
            <Clock />
          </Box>

          {!isConnected && (
<<<<<<< HEAD
            <Box
              textAlign="center"
              mb={2}
              sx={{
                color: '#ffd700',
                fontWeight: 'bold',
                fontFamily: '"Roboto", sans-serif',
                textShadow: '0 1px 3px rgba(0,0,0,0.6)',
                px: { xs: 2, sm: 3 },
              }}
            >
              ⚠️ Connexion WebSocket perdue. Tentative de reconnexion...
              <Button
                size="small"
                variant="outlined"
                sx={{
                  ml: 1,
                  borderColor: '#d4af37',
                  color: '#ffd700',
                  borderRadius: '20px',
                  fontWeight: 600,
                  fontFamily: '"Orbitron", sans-serif',
                }}
=======
            <Box textAlign="center" mb={2} sx={{ 
              color: '#d42426', 
              fontWeight: 'bold', 
              textShadow: '0 1px 3px rgba(255,215,0,0.5)',
              px: { xs: 2, sm: 3 }
            }}>
              ⚠️ Connexion WebSocket perdue. Tentative de reconnexion...
              <Button 
                size="small" 
                variant="outlined" 
                sx={{ 
                  ml: 1, 
                  borderColor: '#d42426', 
                  color: '#d42426',
                  borderRadius: '20px',
                  fontWeight: 600,
                }} 
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
                onClick={reconnect}
              >
                Reconnecter
              </Button>
            </Box>
          )}

          <Grid container spacing={2.5} justifyContent="center" sx={{ mt: 1.5, px: { xs: 1.5, sm: 2.5, md: 3.5 } }} aria-label="KPI Principaux">
            {[
              { title: "Total Agents", value: kpi.totalAgents, color: "info", critical: false },
              { title: "Number of Calls", value: kpi.totalCallsThisWeek.toString(), color: "primary", critical: false },
              { title: "Avg Inbound AHT", value: kpi.avgInboundAHT, color: getInboundAHTColor(mmssToSeconds(kpi.avgInboundAHT)), critical: isInboundAHTCritical },
              { title: "Avg Outbound AHT", value: kpi.avgOutboundAHT, color: getOutboundAHTColor(mmssToSeconds(kpi.avgOutboundAHT)), critical: isOutboundAHTCritical },
            ].map((item, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                <KPICard title={item.title} value={item.value.toString()} valueColor={item.color} isCritical={item.critical} />
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={2.5} justifyContent="center" sx={{ mt: 2, px: { xs: 1.5, sm: 2.5, md: 3.5 } }} aria-label="KPI Détail Appels">
            {[
              { title: "Answered Calls", value: kpi.totalAnsweredCalls, color: "default", critical: false },
              { title: "Missed Calls", value: kpi.missedCallsTotal, color: "error", critical: false },
              { title: "Total Inbound Calls", value: kpi.totalInboundCalls, color: "info", critical: false },
              { title: "Total Outbound Calls", value: kpi.totalOutboundCalls, color: "success", critical: false },
              { title: "Abandon Rate", value: kpi.abandonRate, color: getAbandonColor(kpi.abandonRate), critical: isAbandonRateCritical },
            ].map((item, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={i}>
                <KPICard title={item.title} value={item.value.toString()} valueColor={item.color} isCritical={item.critical} />
              </Grid>
            ))}
          </Grid>

          <Box mt={3} px={{ xs: 1.5, sm: 2.5, md: 3.5 }}>
            <CallVolumeChart callVolumes={callVolumes} wsConnected={isConnected} halfHourSlots={halfHourSlots} />
          </Box>

<<<<<<< HEAD
          <Box mt={{ xs: 7, md: 9 }} pb={7} px={{ xs: 1.5, sm: 2.5, md: 3.5 }}>
            <Grid container spacing={4} direction="column">
              <Grid size={{ xs: 12 }}>
                <AgentTable
                  employees={employees.map((emp) => ({
=======
          {/* 🔽 ESPACE AJOUTÉ ICI : mt augmenté pour descendre les widgets du bas */}
          <Box mt={{ xs: 12, md: 16 }} pb={7} px={{ xs: 1.5, sm: 2.5, md: 3.5 }}>
            <Grid container spacing={4} direction="column">
              <Grid size={{ xs: 12 }}>
                <AgentTable
                  employees={employees.map(emp => ({
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
                    ...emp,
                    avgInboundAHT: formatSecondsToMMSS(emp.inbound > 0 ? Math.floor(emp.inboundHandlingTimeSec / emp.inbound) : 0),
                    avgOutboundAHT: formatSecondsToMMSS(emp.outbound > 0 ? Math.floor(emp.outboundHandlingTimeSec / emp.outbound) : 0),
                  }))}
                  isLoading={!isConnected && employees.length === 0}
                  isConnected={isConnected}
                  lastUpdate={lastUpdate}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Box position="relative">
                  <SLABarchart slaData={slaDataForChart} wsConnected={isConnected} />
                  {!audioUnlocked && (
                    <Box sx={{ position: 'absolute', bottom: 16, right: 16, zIndex: 2 }}>
                      <Button
                        variant="contained"
                        onClick={unlockAudio}
                        sx={{
<<<<<<< HEAD
                          background: 'linear-gradient(135deg, #000, #333)',
=======
                          background: 'linear-gradient(135deg, #d42426, #8b0000)',
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
                          color: '#ffd700',
                          fontWeight: 'bold',
                          textTransform: 'none',
                          padding: '10px 20px',
                          fontSize: '1rem',
                          borderRadius: '50px',
<<<<<<< HEAD
                          border: '2px solid #d4af37',
                          boxShadow: '0 0 14px rgba(212, 175, 55, 0.7), 0 4px 8px rgba(0,0,0,0.3)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #222, #000)',
                            boxShadow: '0 0 20px rgba(255, 215, 0, 0.9), 0 6px 12px rgba(0,0,0,0.4)',
                            transform: 'scale(1.05)',
                          },
                          fontFamily: '"Orbitron", sans-serif',
                        }}
                      >
                        🥂 Célébrer la nouvelle année !
=======
                          border: '2px solid #ffd700',
                          boxShadow: '0 0 12px rgba(212, 36, 38, 0.6), 0 4px 8px rgba(0,0,0,0.15)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #b01e1e, #660000)',
                            boxShadow: '0 0 18px rgba(255, 215, 0, 0.8), 0 6px 12px rgba(0,0,0,0.2)',
                            transform: 'scale(1.05)',
                          },
                          fontFamily: '"Mountains of Christmas", cursive',
                        }}
                      >
                        🎄 Allumer les cloches !
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
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