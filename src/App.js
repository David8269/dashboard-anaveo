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

// === Clock (inchangée) ===
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
    <Box
      sx={{
        fontFamily: '"Orbitron", "Roboto", sans-serif',
        fontWeight: 700,
        fontSize: { xs: '2rem', md: '3rem' },
        color: '#5D4037',
        textShadow: '0 2px 4px rgba(255,255,255,0.7)',
        letterSpacing: '0.05em',
        backgroundColor: 'rgba(255, 235, 220, 0.8)',
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        display: 'inline-block',
        margin: '0 auto',
        border: '1px solid #8D6E63',
        boxShadow: '0 2px 6px rgba(141, 110, 99, 0.2)',
      }}
      role="status"
      aria-live="polite"
    >
      {hours}:{minutes}:{seconds}
    </Box>
  );
}

// === Schedulers & WebSocket (corrigé) ===
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
    // Envoi de ping toutes les 30 secondes au lieu de 10
    pingIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        try {
          wsRef.current.send(JSON.stringify({ type: 'ping', ts: Date.now() }));
        } catch (e) {
          console.warn('[WS] ⚠️ Ping échoué', e);
          // Fermeture proactive en cas d'erreur d'envoi
          wsRef.current?.close();
        }
      }
    }, 30000);
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

      // Timeout de connexion plus long
      connectionTimeoutRef.current = setTimeout(() => {
        if (wsRef.current?.readyState === WebSocket.CONNECTING) {
          wsRef.current?.close();
        }
      }, 15000);

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
          // Gestion des messages de ping/pong
          if (msg.includes('"type":"keepalive"') || msg.includes('"type":"pong"') || msg.includes('"type":"ping"') || msg.includes('"type":"pong"')) {
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
        console.warn(`[WS] 🔌 Déconnecté (code ${e.code}, raison: ${e.reason})`);
        setIsConnected(false);
        stopPing();

        // Ne pas reconnecter si la fermeture est normale (code 1000)
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

// === Sons (inchangés) ===
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

  // 🔊 Sons horaires
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

  // 🔊 Top agent
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
      const allowedFirstNames = new Set(['xavier', 'rana', 'mathys', 'romain', 'nicolas', 'julien', 'benjamin', 'marina', 'malik']);
      const firstName = currentTop.name.split(' ')[0]?.toLowerCase() || '';
      const soundToPlay = allowedFirstNames.has(firstName) ? `${firstName}.mp3` : 'passage.mp3';
      playSound(soundToPlay, `Top agent : ${currentTop.name}`);
    }
    prevEmployeesRef.current = [...employees];
  }, [employees, audioUnlocked, kpi]);

  return (
    <>
      {/* Polices élégantes */}
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet" />

      {/* === Styles globaux pour corriger la largeur === */}
      <style>
        {`
          /* Correction essentielle : body occupe toute la largeur */
          body, #root {
            width: 100vw;
            margin: 0;
            padding: 0;
            overflow-x: hidden;
            box-sizing: border-box;
          }

          /* Scrollbar vigneron */
          ::-webkit-scrollbar { width: 8px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { 
            background: #5D4037; 
            border-radius: 4px; 
            transition: background 0.3s ease; 
          }
          body.show-scrollbar ::-webkit-scrollbar-thumb { background: #8D6E63; }
          body.show-scrollbar ::-webkit-scrollbar-track { background: rgba(93, 64, 55, 0.1); }

          /* Firefox */
          * { scrollbar-width: thin; scrollbar-color: #5D4037 transparent; }
          body.show-scrollbar { scrollbar-color: #8D6E63 rgba(93, 64, 55, 0.1); }

          :root {
            --wine-text: #5D4037;
            --wine-accent: #8D6E63;
            --wine-primary: #795548;
            --wine-secondary: #A1887F;
            --wine-gold: #D4AF37;
            --wine-light: #EFEBE9;
          }

          .wine-title {
            font-family: 'Playfair Display', serif;
            font-weight: 700;
            font-size: clamp(2.2rem, 6vw, 3.5rem);
            letter-spacing: 0.03em;
            text-transform: uppercase;
          }
        `}
      </style>

      {/* 🍇 Fond d'écran vigneron */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url('${process.env.PUBLIC_URL}/images/vineyard-bg.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed', // Pour un effet parallaxe subtil
          zIndex: 0,
        }}
      />

      {/* Overlay de transparence pour lisibilité */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          zIndex: 1,
        }}
      />

      {/* Conteneur principal fixé pour éviter le débordement */}
      <Box
        sx={{
          position: 'relative',
          width: '100vw',
          minWidth: '100%',
          overflowX: 'hidden',
          margin: 0,
          padding: 0,
          boxSizing: 'border-box',
          zIndex: 2,
          color: 'var(--wine-text)',
          minHeight: '100vh',
        }}
        aria-label="Tableau de bord vigneron en temps réel"
      >
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            maxWidth: '100%',
            margin: 0,
            padding: 0,
            boxSizing: 'border-box',
          }}
        >
          
          {/* ✅ Titre : fond orange pastel et bordure marron (comme l'horloge) */}
          <Box
            sx={{
              mb: 2,
              backgroundColor: 'rgba(255, 235, 220, 0.8)', // 🍊 Orange pastel (comme l'horloge)
              borderRadius: '12px',
              border: '1px solid #8D6E63', // Bordure marron (comme l'horloge)
              boxShadow: '0 2px 6px rgba(141, 110, 99, 0.2)', // Ombre subtile (comme l'horloge)
              padding: { xs: '0.8rem 1.5rem', md: '1rem 2rem' },
              display: 'inline-block',
              margin: '0 auto',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Typography 
              variant="h1" 
              align="center" 
              className="wine-title" 
              sx={{ 
                color: 'var(--wine-primary)',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                margin: 0,
                position: 'relative',
                zIndex: 2,
              }}
            >
              🍇🍷 ANAVEO - Service Center 🍷🍇
            </Typography>
          </Box>

          <Box textAlign="center" mb={1}>
            <Clock />
          </Box>

          {!isConnected && (
            <Box textAlign="center" mb={2} sx={{ color: '#D2691E', fontWeight: 'bold', textShadow: '0 1px 3px rgba(255,255,255,0.8)' }}>
              ⚠️ Connexion WebSocket perdue. Tentative de reconnexion...
              <Button size="small" variant="outlined" sx={{ ml: 1, borderColor: '#D2691E', color: '#D2691E' }} onClick={reconnect}>
                Reconnecter
              </Button>
            </Box>
          )}

          {/* KPI Principaux — padding réduit pour éviter le débordement */}
          <Grid container spacing={3} justifyContent="center" sx={{ mt: 2, px: { xs: 1.5, sm: 2, md: 2 } }} aria-label="KPI Principaux">
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

          {/* KPI Détail Appels — padding réduit */}
          <Grid container spacing={3} justifyContent="center" sx={{ mt: 2, px: { xs: 1.5, sm: 2, md: 2 } }} aria-label="KPI Détail Appels">
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

          {/* Graphique des volumes — padding réduit */}
          <Box mt={3} px={{ xs: 1.5, sm: 2, md: 2 }}>
            <CallVolumeChart callVolumes={callVolumes} wsConnected={isConnected} halfHourSlots={halfHourSlots} />
          </Box>

          {/* Tableau et graphique SLA — padding réduit */}
          <Box mt={{ xs: 8, md: 10 }} pb={8} px={{ xs: 1.5, sm: 2, md: 2 }}>
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
                  <SLABarchart slaData={slaDataForChart} wsConnected={isConnected} />
                  {!audioUnlocked && (
                    <Box sx={{ position: 'absolute', bottom: 16, right: 16, zIndex: 2 }}>
                      <Button
                        variant="contained"
                        onClick={unlockAudio}
                        sx={{
                          background: 'linear-gradient(135deg, var(--wine-primary), var(--wine-secondary))',
                          color: '#fff',
                          fontWeight: 'bold',
                          textTransform: 'none',
                          padding: '8px 16px',
                          fontSize: '0.95rem',
                          borderRadius: '50px',
                          border: '2px solid var(--wine-gold)',
                          boxShadow: '0 0 8px rgba(212, 175, 55, 0.5)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #6D4C41, #5D4037)',
                            boxShadow: '0 0 12px rgba(212, 175, 55, 0.7)',
                            transform: 'scale(1.05)',
                          },
                        }}
                      >
                        🍷 Activer les sons
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