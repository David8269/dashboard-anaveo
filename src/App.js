import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
} from '@mui/material';
import KPICard from './components/KPICard';
import SLABarchart from './components/SLABarchart';
import AgentTable from './components/AgentTable';
import CallVolumeChart from './components/CallVolumeChart';
import { useCallAggregates } from './hooks/useCallAggregates';
import { parseCDRLine } from './utils/cdrParser';
import { AUTHORIZED_AGENTS } from './config/agents';

// === Helpers ===
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

// === Clock (Halloweenisé) ===
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
    <>
      <style>
        {`
          @keyframes glitch-digital {
            0% { clip-path: inset(0 0 0 0); transform: translate(0); }
            10% { clip-path: inset(5% 0 85% 0); transform: translate(-2px, -2px); }
            20% { clip-path: inset(15% 0 75% 0); transform: translate(2px, 2px); }
            30% { clip-path: inset(25% 0 65% 0); transform: translate(-2px, 2px); }
            40% { clip-path: inset(35% 0 55% 0); transform: translate(2px, -2px); }
            50% { clip-path: inset(45% 0 45% 0); transform: translate(-2px, -2px); }
            60% { clip-path: inset(35% 0 55% 0); transform: translate(2px, 2px); }
            70% { clip-path: inset(25% 0 65% 0); transform: translate(-2px, 2px); }
            80% { clip-path: inset(15% 0 75% 0); transform: translate(2px, -2px); }
            90% { clip-path: inset(5% 0 85% 0); transform: translate(-2px, -2px); }
            100% { clip-path: inset(0 0 0 0); transform: translate(0); }
          }
          .clock-glitch {
            position: relative;
            font-family: 'Orbitron', 'Roboto', sans-serif;
            font-weight: 900;
            font-size: clamp(2rem, 8vw, 3.5rem);
            letter-spacing: 0.1em;
            color: #fff;
            user-select: none;
            text-align: center;
            text-transform: uppercase;
            text-shadow: 
              0 0 8px rgba(255,107,0,0.9),
              0 0 12px rgba(255,69,0,0.7),
              0 0 16px rgba(139,0,0,0.5);
            padding: 0.5rem 1rem;
            border-radius: 4px;
            background: transparent;
            display: inline-block;
          }
          .clock-glitch::before,
          .clock-glitch::after {
            content: attr(data-text);
            position: absolute;
            left: 0;
            width: 100%;
            opacity: 0.8;
          }
          .clock-glitch::before {
            animation: glitch-digital 2.5s infinite linear alternate-reverse;
            color: #ff0;
            left: -1px;
            mix-blend-mode: screen;
          }
          .clock-glitch::after {
            animation: glitch-digital 2s infinite linear alternate;
            color: #ffa500;
            left: 1px;
            mix-blend-mode: screen;
            opacity: 0.6;
          }
        `}
      </style>
      <Box
        className="clock-glitch"
        data-text={`${hours}:${minutes}:${seconds}`}
        role="status"
        aria-live="polite"
        sx={{
          display: 'inline-block',
          margin: '0 auto',
          '&::before, &::after': {
            pointerEvents: 'none'
          }
        }}
      >
        {hours}:{minutes}:{seconds}
      </Box>
    </>
  );
}

// === Schedulers ===
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

// === WebSocket Hook ===
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
    }
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
    }, 10000);
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

// === Sons ===
const playSound = (filename, context = '', volume = 1) => {
  try {
    const audio = new Audio(`${process.env.PUBLIC_URL}/sounds/${filename}`);
    const logContext = context ? `(${context})` : '';
    console.log(`[Son] 🔊 Tentative de lecture : ${filename} ${logContext}`);
    audio.play().then(() => {
      console.log(`[Son] ✅ Lecture réussie : ${filename} ${logContext}`);
    }).catch(e => {
      console.warn(`[Son] ❌ Échec lecture ${filename} ${logContext}:`, e.message || e);
    });
  } catch (error) {
    console.error(`[Son] 💥 Erreur critique lecture ${filename}:`, error);
  }
};

// === App ===
const App = () => {
  const WS_URL = 'wss://cds-on3cx.anaveo.com/cdr-ws/';
  const prevEmployeesRef = useRef([]);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const scheduledTimeoutsRef = useRef([]);

  // 🔁 Gestion de la visibilité de la scrollbar
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
    audio.play()
      .then(() => {
        console.log('✅ Audio déverrouillé avec succès (via silent.wav)');
        setAudioUnlocked(true);
      })
      .catch(err => {
        console.warn('❌ Échec du déverrouillage audio (silent.wav) :', err);
      });
  };

  useEffect(() => {
    const unlock = () => unlockAudio();
    window.addEventListener('click', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    window.addEventListener('touchstart', unlock, { once: true });
    return () => {
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };
  }, []);

  const handleLostCall = (callId) => {
    if (audioUnlocked) {
      playSound('fatality.mp3', `Appel perdu : ${callId}`);
    } else {
      console.log(`[Son] 🔇 Fatality ignoré (sons désactivés) - Appel : ${callId}`);
    }
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
      console.log(`[Top Agent] 🥇 Nouveau n°1 : ${currentTop.name} (précédent : ${prevTop?.name || 'aucun'})`);

      const allowedFirstNames = new Set([
        'xavier', 'rana', 'mathys', 'romain',
        'nicolas', 'julien', 'benjamin', 'malik'
      ]);
      const firstName = currentTop.name.split(' ')[0]?.toLowerCase() || '';
      const soundToPlay = allowedFirstNames.has(firstName) ? `${firstName}.mp3` : 'passage.mp3';
      playSound(soundToPlay, `Top agent : ${currentTop.name}`);
    }

    prevEmployeesRef.current = [...employees];
  }, [employees, audioUnlocked, kpi.totalAnsweredCalls, kpi.missedCallsTotal, kpi.totalOutboundCalls]);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Creepster&family=Nosifer&family=Orbitron:wght@700;900&display=swap" rel="stylesheet" />

      <style>
        {`
          /* === Scrollbar discrète === */
          ::-webkit-scrollbar {
            width: 8px;
          }
          ::-webkit-scrollbar-track {
            background: transparent;
          }
          ::-webkit-scrollbar-thumb {
            background: transparent;
            border-radius: 4px;
            transition: background 0.3s ease;
          }
          body.show-scrollbar ::-webkit-scrollbar-thumb {
            background: rgba(255, 107, 0, 0.6);
          }
          body.show-scrollbar ::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.2);
          }

          /* Firefox */
          * {
            scrollbar-width: thin;
            scrollbar-color: transparent transparent;
          }
          body.show-scrollbar {
            scrollbar-color: rgba(255, 107, 0, 0.6) rgba(0, 0, 0, 0.2);
          }

          /* === Animations existantes === */
          @keyframes floating {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          @keyframes flicker {
            0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% {
              opacity: 1;
            }
            20%, 24%, 55% {
              opacity: 0.4;
            }
          }
          @keyframes drip-fall {
            0% { transform: translateY(0); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(100vh); opacity: 0; }
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
          }
          .halloween-title {
            font-family: 'Creepster', cursive;
            font-size: clamp(2.5rem, 8vw, 4rem);
            text-shadow: 
              0 0 10px #ff6b00,
              0 0 20px #ff4500,
              0 0 30px #8a0000;
            letter-spacing: 0.1em;
            animation: flicker 3s infinite;
          }
          .floating {
            animation: floating 3s ease-in-out infinite;
          }
        `}
      </style>

      <Box
        sx={{
          minHeight: '100vh',
          backgroundImage: `url('${process.env.PUBLIC_URL}/images/halloween-bg.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          py: 4,
          position: 'relative',
        }}
        aria-label="Tableau de bord Halloween en temps réel"
      >
        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            color: '#fff',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            px: 0,
            mx: 0,
            width: '100%',
          }}
        >
          <Typography 
            variant="h1" 
            align="center" 
            className="halloween-title"
            sx={{ mb: 2 }}
          >
            ANAVEO - Nightmare Center
          </Typography>

          <Box textAlign="center" mb={1} className="floating">
            <Clock />
          </Box>

          {!isConnected && (
            <Box textAlign="center" mb={2} sx={{ color: '#ff6b00', fontWeight: 'bold', textShadow: '0 0 8px rgba(255,107,0,0.7)' }}>
              ⚠️ Connexion WebSocket perdue. Tentative de reconnexion...
              <Button
                size="small"
                variant="outlined"
                sx={{
                  ml: 1,
                  borderColor: '#ff6b00',
                  color: '#ff6b00',
                  '&:hover': {
                    backgroundColor: 'rgba(255,107,0,0.1)',
                    borderColor: '#ff6b00',
                  }
                }}
                onClick={reconnect}
              >
                Reconnecter
              </Button>
            </Box>
          )}

          <Grid container spacing={3} justifyContent="center" sx={{ mt: 2, px: { xs: 2, sm: 3, md: 4 } }} aria-label="KPI Principaux">
            {[
              { title: "Total Agents", value: kpi.totalAgents, color: "info", critical: false },
              { title: "Number of Calls", value: kpi.totalCallsThisWeek.toString(), color: "primary", critical: false },
              { 
                title: "Avg Inbound AHT", 
                value: kpi.avgInboundAHT, 
                color: getInboundAHTColor(mmssToSeconds(kpi.avgInboundAHT)),
                critical: isInboundAHTCritical
              },
              { 
                title: "Avg Outbound AHT", 
                value: kpi.avgOutboundAHT, 
                color: getOutboundAHTColor(mmssToSeconds(kpi.avgOutboundAHT)),
                critical: isOutboundAHTCritical
              },
            ].map((item, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
                <KPICard 
                  title={item.title} 
                  value={item.value.toString()} 
                  valueColor={item.color}
                  isCritical={item.critical}
                />
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={3} justifyContent="center" sx={{ mt: 2, px: { xs: 2, sm: 3, md: 4 } }} aria-label="KPI Détail Appels">
            {[
              { title: "Answered Calls", value: kpi.totalAnsweredCalls, color: "default", critical: false },
              { title: "Missed Calls", value: kpi.missedCallsTotal, color: "error", critical: false },
              { title: "Total Inbound Calls", value: kpi.totalInboundCalls, color: "info", critical: false },
              { title: "Total Outbound Calls", value: kpi.totalOutboundCalls, color: "success", critical: false },
              { 
                title: "Abandon Rate", 
                value: kpi.abandonRate, 
                color: getAbandonColor(kpi.abandonRate),
                critical: isAbandonRateCritical
              },
            ].map((item, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={i}>
                <KPICard 
                  title={item.title} 
                  value={item.value.toString()} 
                  valueColor={item.color}
                  isCritical={item.critical}
                />
              </Grid>
            ))}
          </Grid>

          <Box mt={3} px={{ xs: 2, sm: 3, md: 4 }}>
            <CallVolumeChart callVolumes={callVolumes} wsConnected={isConnected} halfHourSlots={halfHourSlots} />
          </Box>

          <Box mt={{ xs: 8, md: 10 }} pb={8} px={{ xs: 2, sm: 3, md: 4 }}>
            <Grid container spacing={4} direction="column">
              <Grid size={{ xs: 12 }}>
                <AgentTable
                  employees={employees.map(emp => ({
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
                  <SLABarchart 
                    slaData={slaDataForChart} 
                    wsConnected={isConnected}
                  />
                  {!audioUnlocked && (
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 16,
                        right: 16,
                        zIndex: 2,
                      }}
                    >
                      <Button
                        variant="contained"
                        onClick={unlockAudio}
                        sx={{
                          background: 'linear-gradient(135deg, #ff8c00, #ff4500)',
                          color: '#fff',
                          fontWeight: 'bold',
                          textTransform: 'none',
                          padding: '8px 16px',
                          fontSize: '0.95rem',
                          borderRadius: '50px',
                          border: '2px solid #ffd700',
                          boxShadow: '0 0 12px rgba(255, 69, 0, 0.7)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #ff6b00, #ff2a00)',
                            boxShadow: '0 0 20px rgba(255, 107, 0, 0.9)',
                            transform: 'scale(1.05)',
                          },
                          fontFamily: '"Nosifer", cursive',
                        }}
                      >
                        🎃 Activer les cris !
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