import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Box,
  Grid,
  Container,
  Typography,
  Button,
  keyframes,
  styled,
} from '@mui/material';
import KPICard from './components/KPICard';
import SLABarchart from './components/SLABarchart';
import AgentTable from './components/AgentTable';
import CallVolumeChart from './components/CallVolumeChart';

// 🔊 Lecture audio — utilise PUBLIC_URL
const playSound = (filename) => {
  try {
    const audio = new Audio(`${process.env.PUBLIC_URL}/sounds/${filename}`);
    audio.play().catch(e => console.warn(`Échec lecture ${filename} :`, e));
  } catch (error) {
    console.error('Erreur lecture son :', error);
  }
};

// 🎞️ Animations CSS pour l'horloge
const glitchDigital = keyframes`
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
`;

const ClockDisplay = styled('div')(({ theme }) => ({
  position: 'relative',
  fontFamily: "'Orbitron', 'Roboto', sans-serif",
  fontWeight: 900,
  fontSize: 'clamp(2rem, 8vw, 3.5rem)',
  letterSpacing: '0.1em',
  color: '#fff',
  userSelect: 'none',
  textAlign: 'center',
  textTransform: 'uppercase',
  textShadow:
    '0 0 8px rgba(255,255,255,0.7), 0 0 12px rgba(255,255,255,0.5), 0 0 16px rgba(255,255,255,0.3)',
  padding: '0.5rem 1rem',
  borderRadius: '4px',
  display: 'inline-block',
  background: 'transparent',
  '&::before, &::after': {
    content: 'attr(data-text)',
    position: 'absolute',
    left: 0,
    width: '100%',
    opacity: 0.8,
    pointerEvents: 'none',
  },
  '&::before': {
    animation: `${glitchDigital} 2.5s infinite linear alternate-reverse`,
    color: '#ff0',
    left: '-1px',
    mixBlendMode: 'screen',
  },
  '&::after': {
    animation: `${glitchDigital} 2s infinite linear alternate`,
    color: '#ffa500',
    left: '1px',
    mixBlendMode: 'screen',
    opacity: 0.6,
  },
}));

// 🕒 Horloge
function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');
  const timeStr = `${hours}:${minutes}:${seconds}`;

  return (
    <ClockDisplay
      data-text={timeStr}
      role="status"
      aria-live="polite"
    >
      {timeStr}
    </ClockDisplay>
  );
}

// 🔍 Pause déjeuner (12h30–14h00 heure locale)
const isLunchBreak = (date) => {
  if (!date) return false;
  const totalMinutes = date.getHours() * 60 + date.getMinutes();
  return totalMinutes >= 750 && totalMinutes < 840; // 12:30 à 14:00
};

// ⏱️ Formatage secondes → MM:SS
const formatSecondsToMMSS = (totalSeconds) => {
  if (!totalSeconds || isNaN(totalSeconds) || totalSeconds <= 0) return '00:00';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// 🎨 Couleurs KPI
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

// 📅 Parsing robuste de la date CDR
const parseCDRDate = (str) => {
  if (!str) return null;
  const [datePart, timePart] = str.split(' ');
  if (!datePart || !timePart) return null;
  const [y, m, d] = datePart.split('/');
  const [hh, mm, ss] = timePart.split(':');
  const year = Number(y);
  const month = Number(m) - 1;
  const day = Number(d);
  const hour = Number(hh);
  const minute = Number(mm);
  const second = Number(ss);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  return new Date(Date.UTC(year, month, day, hour, minute, second));
};

// 🕐 Génération des plages horaires (8h30 à 18h30)
const generateHalfHourSlots = () => {
  const slots = [];
  for (let h = 8; h <= 18; h++) {
    slots.push(`${h.toString().padStart(2, '0')}:30`);
    if (h < 18) slots.push(`${(h + 1).toString().padStart(2, '0')}:00`);
  }
  return slots;
};

const halfHourSlots = generateHalfHourSlots();

// ✅ UTILISER DATE LOCALE POUR STOCKAGE ET FILTRAGE
const getLocalDateStr = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 🔄 Réinitialisation quotidienne à minuit (heure locale)
const useMidnightResetScheduler = (resetFn) => {
  useEffect(() => {
    const scheduleNextReset = () => {
      const now = new Date();
      const nextMidnight = new Date(now);
      nextMidnight.setHours(24, 0, 0, 0);
      const delay = nextMidnight.getTime() - now.getTime();
      const timeoutId = setTimeout(() => {
        resetFn();
        scheduleNextReset();
      }, delay);
      return () => clearTimeout(timeoutId);
    };
    return scheduleNextReset();
  }, [resetFn]);
};

// 🔄 Réinitialisation hebdomadaire le lundi à 8h (heure locale)
const useWeeklyResetScheduler = (resetFn) => {
  useEffect(() => {
    const scheduleNextReset = () => {
      const now = new Date();
      const dayOfWeek = now.getDay();
      let daysUntilMonday = (1 - dayOfWeek + 7) % 7;
      if (daysUntilMonday === 0 && now.getHours() >= 8) {
        daysUntilMonday = 7;
      }
      const nextReset = new Date(now);
      nextReset.setDate(now.getDate() + daysUntilMonday);
      nextReset.setHours(8, 0, 0, 0);
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

// 📡 Hook WebSocket + gestion locale
const useWebSocketData = (url, onLostCall) => {
  const [cumulativeAgents, setCumulativeAgents] = useState({});
  const [allCalls, setAllCalls] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const connectionTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);

  const getStorageKey = (date = new Date()) => `callData_${getLocalDateStr(date)}`;

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

  const saveCallsToStorage = (calls, date = new Date()) => {
    try {
      const key = getStorageKey(date);
      const serializableCalls = calls.map(call => ({
        ...call,
        startTime: call.startTime?.toISOString() || null,
        endTime: call.endTime?.toISOString() || null,
        receivedAt: call.receivedAt?.toISOString() || null,
      }));
      localStorage.setItem(key, JSON.stringify(serializableCalls));
      console.log(`[Storage] ✅ Sauvegardé ${calls.length} appels sous ${key}`);
    } catch (e) {
      console.warn('[Storage] ⚠️ Sauvegarde échouée', e);
    }
  };

  const loadCallsFromStorage = (date) => {
    const key = getStorageKey(date);
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        const calls = parsed.map(call => ({
          ...call,
          startTime: call.startTime ? new Date(call.startTime) : null,
          endTime: call.endTime ? new Date(call.endTime) : null,
          receivedAt: call.receivedAt ? new Date(call.receivedAt) : null,
        })).filter(call => call.startTime);
        console.log(`[Storage] 🔽 Chargé ${calls.length} appels depuis ${key}`);
        return calls;
      } else {
        console.log(`[Storage] 📁 Aucun appel trouvé pour ${key}`);
      }
    } catch (e) {
      console.warn(`[Storage] ⚠️ Chargement échoué pour ${key}`, e);
      localStorage.removeItem(key);
    }
    return [];
  };

  const rebuildAgentsFromCalls = (calls) => {
    const agents = {};
    calls.forEach(cdr => {
      if (cdr.callType === 'ABSYS') return;
      const { callType, agentName } = cdr;
      if (!agentName) return;
      if (!agents[agentName]) {
        agents[agentName] = {
          name: agentName,
          status: 'online',
          inbound: 0,
          missed: 0,
          outbound: 0,
          inboundHandlingTimeSec: 0,
          outboundHandlingTimeSec: 0,
        };
      }
      const agent = agents[agentName];
      if (callType === 'CDS_IN') {
        if (['src_participant_terminated', 'dst_participant_terminated'].includes(cdr.status)) {
          agent.inbound += 1;
          agent.inboundHandlingTimeSec += cdr.durationSec || 0;
        } else if (cdr.status.includes('missed') || cdr.status.includes('abandoned')) {
          agent.missed += 1;
        }
      } else if (callType === 'CDS_OUT') {
        agent.outbound += 1;
        agent.outboundHandlingTimeSec += cdr.durationSec || 0;
      }
    });
    return agents;
  };

  const parseCDRLine = (line) => {
    try {
      if (!line || !line.startsWith('Call ')) return null;
      const fields = line.substring(5).split(',');
      const caller = fields[7] || '';
      const status = fields[6] || '';
      const durationStr = fields[2] || '00:00:00';
      const technicalKeywords = new Set([
        'provider', 'queue', 'extension', 'external_line', 'default',
        'ReplacedDst', 'Chain:', 'Front Office', 'Sortante', 'outbound_rule',
        '', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
      ]);
      const isLikelyName = (str) => {
        const clean = str.trim();
        if (!clean) return false;
        if (technicalKeywords.has(clean)) return false;
        if (/^\d+$/.test(clean)) return false;
        if (!/[a-zA-ZÀ-ÿ]/.test(clean)) return false;
        return true;
      };
      let agentName = '';
      for (let i = fields.length - 1; i >= 0; i--) {
        const field = (fields[i] || '').trim();
        if (isLikelyName(field)) {
          agentName = field
            .replace(/\(.*?\)/g, '')
            .replace(/\.+$/, '')
            .trim();
          break;
        }
      }
      const isFrontOffice = line.includes(',Front Office,');
      let callType = 'OTHER';
      if (agentName && (/^\d+$/.test(agentName) || agentName.startsWith('Chain:'))) {
        agentName = '';
      }
      if (isFrontOffice) {
        callType = agentName ? 'CDS_IN' : 'ABSYS';
      } else if (caller.startsWith('Ext.')) {
        callType = agentName ? 'CDS_OUT' : 'OTHER';
      }
      return {
        id: fields[0] || '',
        startTime: parseCDRDate(fields[3]),
        endTime: parseCDRDate(fields[5]),
        status,
        caller,
        queue: isFrontOffice ? 'Front Office' : '',
        agentName: agentName || '',
        duration: durationStr,
        callType,
      };
    } catch (err) {
      console.error('[CDR Parsing] Erreur:', err, 'Ligne:', line);
      return null;
    }
  };

  // ✅ CORRECTION MAJEURE : utiliser getHours() (locale), pas getUTCHours()
  const isInBusinessHours = (date) => {
    if (!date) return false;
    const h = date.getHours();       // ← HEURE LOCALE
    const m = date.getMinutes();     // ← MINUTES LOCALES
    return !(h < 8 || (h === 8 && m < 30) || h > 18 || (h === 18 && m > 30));
  };

  const getLocalSlotIndex = (date) => {
    if (!date) return -1;
    const h = date.getHours();
    const m = date.getMinutes();
    if (h < 8 || (h === 8 && m < 30) || h > 18 || (h === 18 && m > 30)) {
      return -1;
    }
    for (let i = halfHourSlots.length - 1; i >= 0; i--) {
      const [slotH, slotM] = halfHourSlots[i].split(':').map(Number);
      if (h > slotH || (h === slotH && m >= slotM)) {
        return i;
      }
    }
    return -1;
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
      if (typeof msg === 'string' && msg.startsWith('Call ')) {
        console.log(`[WS] 📥 Message brut reçu :`, msg);
        const cdr = parseCDRLine(msg);
        if (!cdr) {
          console.warn('[WS] ❌ Parsing échoué pour ce message');
          return;
        }
        if (!cdr.startTime) {
          console.warn('[WS] ⚠️ Appel sans startTime valide', cdr);
          return;
        }

        const dur = cdr.duration.split(':').map(Number);
        const durationSec = (dur[0] || 0) * 3600 + (dur[1] || 0) * 60 + (dur[2] || 0);
        const callWithSec = { ...cdr, durationSec, receivedAt: new Date() };

        if (isLunchBreak(callWithSec.startTime)) {
          callWithSec.callType = 'ABSYS';
          callWithSec.agentName = '';
        }

        console.log(`[WS] 📞 Appel parsé :`, {
          id: callWithSec.id,
          startTime: callWithSec.startTime,
          callType: callWithSec.callType,
          agent: callWithSec.agentName,
          durationSec,
          status: callWithSec.status,
          localDate: getLocalDateStr(callWithSec.startTime),
        });

        if (callWithSec.callType === 'ABSYS' && durationSec <= 59 && !isLunchBreak(callWithSec.startTime)) {
          console.log('[Appel perdu détecté] 💀 Joue fatality.mp3');
          if (onLostCall) onLostCall();
          return;
        }
        if (callWithSec.callType === 'CDS_IN' && (callWithSec.status.includes('missed') || callWithSec.status.includes('abandoned'))) {
          console.log('[Appel manqué détecté] 💀 Joue fatality.mp3');
          if (onLostCall) onLostCall();
        }

        if (isInBusinessHours(callWithSec.startTime)) {
          const today = new Date();
          const todayStr = getLocalDateStr(today);
          const callDateStr = getLocalDateStr(callWithSec.startTime);
          console.log(`[Filtre] Appel du ${callDateStr}, aujourd’hui = ${todayStr}`);

          if (callDateStr === todayStr) {
            setAllCalls(prev => {
              const updated = [...prev, callWithSec];
              saveCallsToStorage(updated, today);
              console.log(`[State] ➕ Ajouté à allCalls (total: ${updated.length})`);
              return updated;
            });

            if (callWithSec.agentName && callWithSec.callType !== 'ABSYS') {
              setCumulativeAgents(prev => {
                const agent = prev[callWithSec.agentName] || {
                  name: callWithSec.agentName,
                  status: 'online',
                  inbound: 0,
                  missed: 0,
                  outbound: 0,
                  inboundHandlingTimeSec: 0,
                  outboundHandlingTimeSec: 0,
                };
                const updated = { ...agent };
                if (callWithSec.callType === 'CDS_IN') {
                  if (['src_participant_terminated', 'dst_participant_terminated'].includes(callWithSec.status)) {
                    updated.inbound += 1;
                    updated.inboundHandlingTimeSec += durationSec;
                  } else if (callWithSec.status.includes('missed') || callWithSec.status.includes('abandoned')) {
                    updated.missed += 1;
                  }
                } else if (callWithSec.callType === 'CDS_OUT') {
                  updated.outbound += 1;
                  updated.outboundHandlingTimeSec += durationSec;
                }
                console.log(`[Agent] Mise à jour :`, updated);
                return { ...prev, [callWithSec.agentName]: updated };
              });
            }
          } else {
            console.log(`[Filtre] ❌ Appel ignoré (pas aujourd’hui) : ${callDateStr}`);
          }
        } else {
          console.log(`[Filtre] ❌ Hors heures d’ouverture :`, callWithSec.startTime);
        }
        setLastUpdate(new Date());
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

  const resetDailyData = () => {
    const today = new Date();
    const todayCalls = loadCallsFromStorage(today);
    setAllCalls(todayCalls);
    const rebuiltAgents = rebuildAgentsFromCalls(todayCalls);
    setCumulativeAgents(rebuiltAgents);
    setLastUpdate(new Date());
    console.log(`[Reset] 🔄 Données quotidiennes réinitialisées (${todayCalls.length} appels chargés)`);
  };

  const resetWeeklyData = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + daysToMonday);
    for (let i = 0; i < 5; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      localStorage.removeItem(getStorageKey(date));
    }
    resetDailyData();
    console.log(`[Reset] 📅 Données hebdomadaires réinitialisées`);
  };

  useEffect(() => {
    isMountedRef.current = true;
    cleanupOldStorage();
    const today = new Date();
    const todayCalls = loadCallsFromStorage(today);
    setAllCalls(todayCalls);
    const rebuiltAgents = rebuildAgentsFromCalls(todayCalls);
    setCumulativeAgents(rebuiltAgents);
    console.log(`[Init] Chargement initial terminé (${todayCalls.length} appels)`);
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

  const now = new Date();
  const recentCalls = allCalls.filter(call =>
    call.startTime && (now - call.startTime) < 24 * 60 * 60 * 1000
  );

  const callVolumes = halfHourSlots.map((time, index) => ({
    index,
    time,
    CDS_IN: 0,
    CDS_OUT: 0,
    ABSYS: 0,
  }));

  recentCalls.forEach(call => {
    const slotIndex = getLocalSlotIndex(call.startTime);
    if (slotIndex >= 0 && slotIndex < callVolumes.length) {
      if (call.callType === 'CDS_IN') callVolumes[slotIndex].CDS_IN += 1;
      else if (call.callType === 'CDS_OUT') callVolumes[slotIndex].CDS_OUT += 1;
      else if (call.callType === 'ABSYS') callVolumes[slotIndex].ABSYS += 1;
    }
  });

  const employees = Object.values(cumulativeAgents);
  const totalInboundFromAgents = employees.reduce((sum, a) => sum + a.inbound + a.missed, 0);
  const totalMissedFromAgents = employees.reduce((sum, a) => sum + a.missed, 0);
  const achieved = totalInboundFromAgents > 0 ? Math.max(60, 100 - Math.round((totalMissedFromAgents / totalInboundFromAgents) * 100)) : 100;
  const slaData = [{ queue: 'Front Office', target: 90, achieved }];

  return {
    employees,
    callVolumes,
    slaData,
    lastUpdate,
    isConnected,
    error,
    reconnect,
    halfHourSlots,
    allCalls,
    resetDailyData,
    resetWeeklyData,
  };
};

const useTodayCallStats = (calls = []) => {
  return useMemo(() => {
    const today = new Date();
    const todayStr = getLocalDateStr(today);
    const todayCalls = calls.filter(call => {
      const callDateStr = getLocalDateStr(call.startTime);
      return callDateStr === todayStr;
    });
    console.log(`[Stats] Appels d’aujourd’hui (${todayStr}) : ${todayCalls.length}`);
    let inbound = 0, outbound = 0;
    todayCalls.forEach(call => {
      if (call.callType === 'CDS_IN') inbound++;
      else if (call.callType === 'CDS_OUT') outbound++;
    });
    return { inbound, outbound, total: inbound + outbound };
  }, [calls]);
};

const useWeeklyCallStats = (calls = []) => {
  return useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + daysToMonday);
    monday.setHours(0, 0, 0, 0);

    const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'];
    const weekData = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const isoDate = getLocalDateStr(date);
      weekData.push({
        date: isoDate,
        dayLabel: dayNames[i],
        inbound: 0,
        outbound: 0,
      });
    }

    calls.forEach(call => {
      if (!call.startTime || call.callType === 'ABSYS') return;
      const callDate = getLocalDateStr(call.startTime);
      const dayIndex = weekData.findIndex(d => d.date === callDate);
      if (dayIndex !== -1) {
        if (call.callType === 'CDS_IN') {
          weekData[dayIndex].inbound += 1;
        } else if (call.callType === 'CDS_OUT') {
          weekData[dayIndex].outbound += 1;
        }
      }
    });

    console.log(`[Stats] Données hebdomadaires :`, weekData);
    return weekData;
  }, [calls]);
};

const useKpiCalculations = (employees = [], todayStats = {}, allCalls = []) => {
  return useMemo(() => {
    if (!Array.isArray(employees)) employees = [];
    if (!Array.isArray(allCalls)) allCalls = [];

    const totals = employees.reduce((acc, emp) => {
      acc.totalInboundCalls += (emp.inbound || 0) + (emp.missed || 0);
      acc.totalAnsweredCalls += emp.inbound || 0;
      acc.missedFromAgents += emp.missed || 0;
      acc.totalOutboundCalls += emp.outbound || 0;
      acc.totalInboundHandling += emp.inboundHandlingTimeSec || 0;
      acc.totalOutboundHandling += emp.outboundHandlingTimeSec || 0;
      acc.totalAnsweredInbound += emp.inbound || 0;
      acc.totalAnsweredOutbound += emp.outbound || 0;
      return acc;
    }, {
      totalInboundCalls: 0,
      totalAnsweredCalls: 0,
      missedFromAgents: 0,
      totalOutboundCalls: 0,
      totalInboundHandling: 0,
      totalOutboundHandling: 0,
      totalAnsweredInbound: 0,
      totalAnsweredOutbound: 0,
    });

    const absysMissed = allCalls.filter(call => {
      if (call.callType !== 'ABSYS' || call.durationSec < 60) return false;
      const start = call.startTime;
      if (!start) return true;
      const h = start.getHours();
      const m = start.getMinutes();
      const totalMinutes = h * 60 + m;
      return !(totalMinutes >= 750 && totalMinutes < 840);
    }).length;

    const totalMissed = totals.missedFromAgents + absysMissed;
    const totalInbound = totals.totalInboundCalls + absysMissed;
    const avgInboundAHTSec = totals.totalAnsweredInbound > 0
      ? Math.floor(totals.totalInboundHandling / totals.totalAnsweredInbound)
      : 0;
    const avgOutboundAHTSec = totals.totalAnsweredOutbound > 0
      ? Math.floor(totals.totalOutboundHandling / totals.totalAnsweredOutbound)
      : 0;
    const globalAHTSec = (totals.totalAnsweredInbound + totals.totalAnsweredOutbound) > 0
      ? Math.floor((totals.totalInboundHandling + totals.totalOutboundHandling) / (totals.totalAnsweredInbound + totals.totalAnsweredOutbound))
      : 0;
    const abandonRate = totalInbound > 0
      ? `${Math.round((totalMissed / totalInbound) * 100)}%`
      : '0%';

    return {
      totalAgents: employees.length,
      onlineAgents: employees.length,
      totalInboundCalls: totalInbound,
      totalAnsweredCalls: totals.totalAnsweredCalls,
      missedCallsTotal: totalMissed,
      totalOutboundCalls: totals.totalOutboundCalls,
      globalAHTSec,
      averageHandlingTime: formatSecondsToMMSS(globalAHTSec),
      abandonRate,
      avgInboundAHT: formatSecondsToMMSS(avgInboundAHTSec),
      avgOutboundAHT: formatSecondsToMMSS(avgOutboundAHTSec),
      cdsInboundTotal: todayStats.inbound || 0,
      cdsOutboundTotal: todayStats.outbound || 0,
      numberOfCallsToday: todayStats.total || 0,
    };
  }, [employees, todayStats, allCalls]);
};

// 🔊 Composant principal
const App = () => {
  const WS_URL = 'wss://cds-on3cx.anaveo.com/cdr-ws/';
  const [lastScheduledSounds, setLastScheduledSounds] = useState({});
  const prevEmployeesRef = useRef([]);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  const handleLostCall = () => {
    if (audioUnlocked) {
      console.log('🔊 Lecture de fatality.mp3');
      playSound('fatality.mp3');
    } else {
      console.log('🔇 Sons non déverrouillés – fatality.mp3 ignoré');
    }
  };

  const {
    employees,
    callVolumes,
    slaData,
    lastUpdate,
    isConnected,
    error,
    reconnect,
    halfHourSlots,
    allCalls,
    resetDailyData,
    resetWeeklyData,
  } = useWebSocketData(WS_URL, handleLostCall);

  useMidnightResetScheduler(resetDailyData);
  useWeeklyResetScheduler(resetWeeklyData);

  const todayStats = useTodayCallStats(allCalls);
  const weeklyStats = useWeeklyCallStats(allCalls);
  const kpi = useKpiCalculations(employees, todayStats, allCalls);

  useEffect(() => {
    if (!audioUnlocked) return;
    const interval = setInterval(() => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();
      if (seconds !== 0) return;
      const timeKey = `${hours}:${minutes}:00`;
      if (lastScheduledSounds[timeKey]) return;
      let soundToPlay = null;
      if (hours === 8 && minutes === 30) soundToPlay = 'debut.mp3';
      else if (hours === 12 && minutes === 30) soundToPlay = 'pause.mp3';
      else if (hours === 14 && minutes === 0) soundToPlay = 'reprise.mp3';
      else if (hours === 18 && minutes === 0) soundToPlay = 'fin.mp3';
      if (soundToPlay) {
        console.log(`🔊 Lecture de ${soundToPlay} à ${timeKey}`);
        playSound(soundToPlay);
        setLastScheduledSounds(prev => ({ ...prev, [timeKey]: true }));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [audioUnlocked, lastScheduledSounds]);

  useEffect(() => {
    if (!audioUnlocked || employees.length === 0) return;
    const totalCalls = kpi.totalAnsweredCalls + kpi.missedCallsTotal + kpi.totalOutboundCalls;
    if (totalCalls < 50) return;
    const prevEmployees = prevEmployeesRef.current;
    const currentTopAgent = employees.reduce((best, emp) => {
      const total = (emp.inbound || 0) + (emp.outbound || 0);
      return total > (best.total || 0) ? { ...emp, total } : best;
    }, { total: -1, name: '' });
    const prevTopAgent = prevEmployees.reduce((best, emp) => {
      const total = (emp.inbound || 0) + (emp.outbound || 0);
      return total > (best.total || 0) ? { ...emp, total } : best;
    }, { total: -1, name: '' });
    if (currentTopAgent.name && currentTopAgent.name !== prevTopAgent.name) {
      const allowedFirstNames = new Set(['xavier', 'rana', 'mathys', 'romain', 'nicolas', 'julien', 'benjamin', 'malik']);
      const firstName = currentTopAgent.name.split(' ')[0]?.toLowerCase() || '';
      const soundToPlay = allowedFirstNames.has(firstName) ? `${firstName}.mp3` : 'passage.mp3';
      console.log(`🔊 ${currentTopAgent.name} est en tête ! Lecture de ${soundToPlay}`);
      playSound(soundToPlay);
    }
    prevEmployeesRef.current = [...employees];
  }, [employees, audioUnlocked, kpi.totalAnsweredCalls, kpi.missedCallsTotal, kpi.totalOutboundCalls]);

  const unlockAudio = () => {
    const audio = new Audio(`${process.env.PUBLIC_URL}/sounds/silent.wav`);
    audio.play()
      .then(() => {
        console.log('✅ Sons activés via silent.wav');
        setAudioUnlocked(true);
      })
      .catch(err => {
        console.warn('❌ Échec activation sons :', err);
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

        {/* 🔹 LIGNE 1 */}
        <Grid container spacing={3} justifyContent="center" sx={{ mt: 4 }} aria-label="KPI Principaux">
          {[
            { title: "Total Agents", value: kpi.totalAgents, color: "info" },
            { 
              title: "Number of Calls",
              value: kpi.numberOfCallsToday.toString(),
              color: "primary" 
            },
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

        {/* 🔹 LIGNE 2 */}
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
                  slaData={weeklyStats} 
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