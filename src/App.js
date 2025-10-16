import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Grid,
  Container,
  Typography,
  Button,
} from '@mui/material';
import KPICard from './components/KPICard';
import SLABarchart from './components/SLABarchart';
import AgentTable from './components/AgentTable';
import CallVolumeChart from './components/CallVolumeChart';
import { useCallAggregates } from './hooks/useCallAggregates';
import { AUTHORIZED_AGENTS } from './config/agents';

// === CDR PARSER INTERNE (avec génération d'ID fiable) ===
const parseCDRLine = (line) => {
  if (!line || typeof line !== 'string') return null;

  try {
    const parts = line.trim().split('|');
    if (parts.length < 10) return null;

    const [
      callId,
      callType,
      startTimeStr,
      endTimeStr,
      durationSecStr,
      caller,
      callee,
      agentName,
      status,
      direction
    ] = parts;

    const startTime = startTimeStr ? new Date(startTimeStr) : null;
    const endTime = endTimeStr ? new Date(endTimeStr) : null;
    const durationSec = parseInt(durationSecStr, 10) || 0;

    // 🔑 Génération d'un ID unique et stable
    const id = callId || `${callType}_${startTime?.toISOString() || 'unknown'}_${caller || 'unknown'}_${durationSec}`;

    return {
      id,
      callId,
      callType,
      startTime,
      endTime,
      durationSec,
      caller,
      callee,
      agentName: agentName || '',
      status: status || '',
      direction: direction || '',
    };
  } catch (e) {
    console.warn('[CDR Parser] ⚠️ Erreur parsing ligne:', line, e);
    return null;
  }
};

// === Helpers ===
const isLunchBreak = (date) => {
  if (!date) return false;
  const totalMinutes = date.getHours() * 60 + date.getMinutes();
  return totalMinutes >= 750 && totalMinutes < 840; // 12:30 à 14:00
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

// === Clock ===
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
              0 0 8px rgba(255,255,255,0.7),
              0 0 12px rgba(255,255,255,0.5),
              0 0 16px rgba(255,255,255,0.3);
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
  const isMountedRef = useRef(true);

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
            } else {
              console.debug(`[Storage] 🔄 Appel ignoré (déjà chargé) : ${call.id}`);
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

  const connect = () => {
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
      try {
        wsRef.current.send(JSON.stringify({ type: "subscribe", topic: "cdr/live" }));
      } catch (err) {
        console.warn('[WS] ⚠️ Souscription échouée:', err);
      }

      const heartbeatInterval = setInterval(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          try {
            wsRef.current.send('{"type":"ping"}');
          } catch (e) {
            console.warn('[WS] ⚠️ Heartbeat échoué');
          }
        }
      }, 30000);
      wsRef.current.heartbeatInterval = heartbeatInterval;
    };
    wsRef.current.onmessage = (event) => {
      if (!isMountedRef.current) return;
      const msg = event.data;
      if (typeof msg === 'string') {
        const cdr = parseCDRLine(msg);
        if (!cdr || !cdr.startTime || !cdr.id) {
          console.debug('[CDR] ❌ Appel ignoré (données invalides)', msg);
          return;
        }

        if (isLunchBreak(cdr.startTime)) {
          cdr.callType = 'ABSYS';
          cdr.agentName = '';
        }

        const callWithSec = { ...cdr, receivedAt: new Date() };

        // 🔊 Détection d'appel perdu
        let isLostCall = false;
        if (cdr.callType === 'CDS_IN') {
          isLostCall = 
            cdr.durationSec > 0 && 
            (cdr.status.includes('missed') || cdr.status.includes('abandoned'));
        } else if (cdr.callType === 'ABSYS' || cdr.callType === 'OTHER') {
          isLostCall = cdr.durationSec >= 60 && !isLunchBreak(cdr.startTime);
        }

        if (isInBusinessHours(cdr.startTime)) {
          // 🔑 DÉDUPLICATION
          setAllCalls(prev => {
            const exists = prev.some(call => call.id === callWithSec.id);
            if (exists) {
              console.debug(`[Appel] 🔄 Ignoré (déjà présent) : ${callWithSec.id}`);
              return prev;
            }
            const updated = [...prev, callWithSec];
            saveCallsToStorage(updated);
            console.log(`[Appel] 🆕 Nouvel appel ajouté : ${callWithSec.id}`, {
              type: callWithSec.callType,
              agent: callWithSec.agentName || '—',
              caller: callWithSec.caller,
              duration: callWithSec.durationSec,
              startTime: callWithSec.startTime?.toISOString(),
            });
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
            onLostCall(callWithSec.id); // Passer l'ID pour le log
          }

          setLastUpdate(new Date());
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

      if (wsRef.current?.heartbeatInterval) {
        clearInterval(wsRef.current.heartbeatInterval);
        wsRef.current.heartbeatInterval = null;
      }

      if (e.code !== 1000 && isMountedRef.current) {
        reconnectTimeoutRef.current = setTimeout(connect, 5000);
      }
    };
  };

  useEffect(() => {
    isMountedRef.current = true;
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
      if (wsRef.current?.heartbeatInterval) clearInterval(wsRef.current.heartbeatInterval);
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (connectionTimeoutRef.current) clearTimeout(connectionTimeoutRef.current);
    };
  }, [url]);

  const reconnect = () => {
    if (wsRef.current) wsRef.current.close();
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
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
const playSound = (filename, context = '') => {
  try {
    const audio = new Audio(`${process.env.PUBLIC_URL}/sounds/${filename}`);
    audio.play().then(() => {
      console.log(`[Son] 🔊 Joué : ${filename} ${context ? `(${context})` : ''}`);
    }).catch(e => {
      console.warn(`[Son] ⚠️ Échec lecture ${filename} :`, e);
    });
  } catch (error) {
    console.error('[Son] ❌ Erreur lecture son :', error);
  }
};

// === App ===
const App = () => {
  const WS_URL = 'wss://cds-on3cx.anaveo.com/cdr-ws/';
  const prevEmployeesRef = useRef([]);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

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

  // 🔊 Sons horaires
  useEffect(() => {
    if (!audioUnlocked) return;

    const scheduleSoundAt = (targetHour, targetMinute, soundFile, label) => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), targetHour, targetMinute, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const scheduledTime = today > now ? today : tomorrow;
      const delay = scheduledTime.getTime() - now.getTime();

      const timeoutId = setTimeout(() => {
        playSound(soundFile, label);
        scheduleSoundAt(targetHour, targetMinute, soundFile, label);
      }, delay);
      return timeoutId;
    };

    const timeouts = [
      scheduleSoundAt(8, 30, 'debut.mp3', 'Début journée'),
      scheduleSoundAt(12, 30, 'pause.mp3', 'Pause déjeuner'),
      scheduleSoundAt(14, 0, 'reprise.mp3', 'Reprise après pause'),
      scheduleSoundAt(18, 0, 'fin.mp3', 'Fin journée'),
    ];

    return () => timeouts.forEach(id => clearTimeout(id));
  }, [audioUnlocked]);

  // 🔊 Son top agent
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

const unlockAudio = () => {
  // silent.wav est requis pour déverrouiller l'API Audio
  const audio = new Audio(`${process.env.PUBLIC_URL}/sounds/silent.wav`);
  audio.play()
    .then(() => {
      console.log('✅ Sons activés via silent.wav');
      setAudioUnlocked(true);
      // 🔊 Aucun autre son ici → pas de 404
    })
    .catch(err => {
      console.warn('❌ Échec activation des sons (silent.wav) :', err);
    });
};

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage: `url('${process.env.PUBLIC_URL}/images/background-dashboard.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        py: 4,
        position: 'relative',
        '& > *': { position: 'relative', zIndex: 1 },
      }}
      aria-label="Tableau de bord en temps réel du centre d'appels"
    >
      <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 0 }} />
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, color: '#fff' }}>
        <Typography variant="h1" align="center" sx={{ fontWeight: 'bold', fontSize: { xs: '2rem', md: '3rem' }, textShadow: '0 0 10px rgba(0,0,0,0.9)', mb: 2 }}>
          ANAVEO - Service Center
        </Typography>

        <Box textAlign="center" mb={1}>
          <Clock />
        </Box>

        <Grid container spacing={3} justifyContent="center" sx={{ mt: 4 }} aria-label="KPI Principaux">
          {[
            { title: "Total Agents", value: kpi.totalAgents, color: "info" },
            { title: "Number of Calls", value: kpi.totalCallsThisWeek.toString(), color: "primary" },
            { 
              title: "Avg Inbound AHT", 
              value: kpi.avgInboundAHT, 
              color: getInboundAHTColor(
                parseInt(kpi.avgInboundAHT.split(':')[0]) * 60 + 
                parseInt(kpi.avgInboundAHT.split(':')[1])
              ) 
            },
            { 
              title: "Avg Outbound AHT", 
              value: kpi.avgOutboundAHT, 
              color: getOutboundAHTColor(
                parseInt(kpi.avgOutboundAHT.split(':')[0]) * 60 + 
                parseInt(kpi.avgOutboundAHT.split(':')[1])
              ) 
            },
          ].map((item, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
              <KPICard title={item.title} value={item.value.toString()} valueColor={item.color} />
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3} justifyContent="center" sx={{ mt: 3 }} aria-label="KPI Détail Appels">
          {[
            { title: "Answered Calls", value: kpi.totalAnsweredCalls, color: "default" },
            { title: "Missed Calls", value: kpi.missedCallsTotal, color: "error" },
            { title: "Total Inbound Calls", value: kpi.totalInboundCalls, color: "info" },
            { title: "Total Outbound Calls", value: kpi.totalOutboundCalls, color: "success" },
            { title: "Abandon Rate", value: kpi.abandonRate, color: getAbandonColor(kpi.abandonRate) },
          ].map((item, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={i}>
              <KPICard title={item.title} value={item.value.toString()} valueColor={item.color} />
            </Grid>
          ))}
        </Grid>

        <Box mt={6}>
          <CallVolumeChart callVolumes={callVolumes} wsConnected={isConnected} halfHourSlots={halfHourSlots} />
        </Box>

        <Box mt={{ xs: 8, md: 10 }}>
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
                      color="success"
                      size="small"
                      onClick={unlockAudio}
                      sx={{
                        fontWeight: 'bold',
                        textTransform: 'none',
                        padding: '6px 12px',
                        fontSize: '0.875rem',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                      }}
                    >
                      🔊 Activer les sons
                    </Button>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default App;