// src/App.js
import React, { useState, useEffect, useMemo, useRef } from 'react';
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

const playSound = (filename) => {
  try {
    const audio = new Audio(`${process.env.PUBLIC_URL}/sounds/${filename}`);
    audio.play().catch(e => console.warn(`Échec lecture ${filename} :`, e));
  } catch (error) {
    console.error('Erreur lecture son :', error);
  }
};

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

const parseCDRDate = (str) => {
  if (!str) return null;
  const [datePart, timePart] = str.split(' ');
  if (!datePart || !timePart) return null;
  const [y, m, d] = datePart.split('/');
  const [hh, mm, ss] = timePart.split(':');
  return new Date(Date.UTC(Number(y), Number(m) - 1, Number(d), Number(hh), Number(mm), Number(ss)));
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

const getSlotIndex = (date) => {
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

const getLocalDateStr = (date) => {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().split('T')[0];
};

// 🔁 Hooks de planification — à utiliser DANS LE COMPOSANT PRINCIPAL
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
  const [cumulativeAgents, setCumulativeAgents] = useState({});
  const [allCalls, setAllCalls] = useState([]);
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
          })).filter(call => call.startTime);
          calls.push(...loadedCalls);
        }
      } catch (e) {
        console.warn(`[Storage] ⚠️ Chargement échoué pour ${key}`, e);
        localStorage.removeItem(key);
      }
    }
    return calls;
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
  };

  const isInBusinessHours = (date) => {
    if (!date) return false;
    const h = date.getHours();
    const m = date.getMinutes();
    return !(h < 8 || (h === 8 && m < 30) || h > 18 || (h === 18 && m > 30));
  };

  // 🔹 Fonctions de reset — maintenant exposées
  const resetDailyData = () => {
    setCumulativeAgents({});
    setLastUpdate(null);
    console.log('[Reset] Réinitialisation quotidienne des KPI (agents effacés, appels conservés)');
  };

  const resetWeeklyData = () => {
    setAllCalls([]);
    setCumulativeAgents({});
    setLastUpdate(null);
    Object.keys(localStorage)
      .filter(k => k.startsWith('callData_'))
      .forEach(k => localStorage.removeItem(k));
    console.log('[Reset] Réinitialisation hebdomadaire complète');
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
        const cdr = parseCDRLine(msg);
        if (cdr && cdr.startTime) {
          if (isLunchBreak(cdr.startTime)) {
            cdr.callType = 'ABSYS';
            cdr.agentName = '';
          }

          const { callType, status } = cdr;
          const dur = cdr.duration.split(':').map(Number);
          const durationSec = (dur[0] || 0) * 3600 + (dur[1] || 0) * 60 + (dur[2] || 0);

          const callWithSec = { ...cdr, durationSec, receivedAt: new Date() };

          if (callType !== 'ABSYS' || (callType === 'ABSYS' && durationSec > 59)) {
            console.log('[Appel reçu]', {
              id: callWithSec.id,
              type: callWithSec.callType,
              agent: callWithSec.agentName || '—',
              caller: callWithSec.caller,
              status: callWithSec.status,
              durationSec: callWithSec.durationSec,
              startTime: callWithSec.startTime?.toISOString(),
              missed: callWithSec.callType === 'CDS_IN' && 
                      !['src_participant_terminated', 'dst_participant_terminated'].includes(callWithSec.status),
            });
          }

          const isLostCall = 
            callType === 'CDS_IN' && 
            (status.includes('missed') || status.includes('abandoned') || durationSec === 0);

          if (isLostCall && !isLunchBreak(cdr.startTime)) {
            if (onLostCall) onLostCall();
          }

          if (isInBusinessHours(cdr.startTime)) {
            setAllCalls(prev => {
              const updated = [...prev, callWithSec];
              saveCallsToStorage(updated);
              return updated;
            });

            const { agentName } = cdr;
            if (agentName && callType !== 'ABSYS') {
              setCumulativeAgents(prev => {
                const agent = prev[agentName] || {
                  name: agentName,
                  status: 'online',
                  inbound: 0,
                  missed: 0,
                  outbound: 0,
                  inboundHandlingTimeSec: 0,
                  outboundHandlingTimeSec: 0,
                };
                const updated = { ...agent };
                if (callType === 'CDS_IN') {
                  if (['src_participant_terminated', 'dst_participant_terminated'].includes(cdr.status)) {
                    updated.inbound += 1;
                    updated.inboundHandlingTimeSec += durationSec;
                  } else if (cdr.status.includes('missed') || cdr.status.includes('abandoned')) {
                    updated.missed += 1;
                  }
                } else if (callType === 'CDS_OUT') {
                  updated.outbound += 1;
                  updated.outboundHandlingTimeSec += durationSec;
                }
                return { ...prev, [agentName]: updated };
              });
            }
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
    const rebuiltAgents = rebuildAgentsFromCalls(storedCalls);
    setCumulativeAgents(rebuiltAgents);
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
    call.startTime && (now - call.startTime) < 7 * 24 * 60 * 60 * 1000
  );

  const callVolumes = halfHourSlots.map((time, index) => ({
    index,
    time,
    CDS_IN: 0,
    CDS_OUT: 0,
    ABSYS: 0,
  }));

  recentCalls.forEach(call => {
    const slotIndex = getSlotIndex(call.startTime);
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

  // ✅ Expose les fonctions de reset
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

const useKpiCalculations = (employees = [], allCalls = []) => {
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

    const totalCallsThisWeek = allCalls.filter(
      call => call.callType === 'CDS_IN' || call.callType === 'CDS_OUT'
    ).length;

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
      totalCallsThisWeek,
    };
  }, [employees, allCalls]);
};

const App = () => {
  const WS_URL = 'wss://cds-on3cx.anaveo.com/cdr-ws/';
  const [lastScheduledSounds, setLastScheduledSounds] = useState({});
  const prevEmployeesRef = useRef([]);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  const handleLostCall = () => {
    if (audioUnlocked) {
      playSound('fatality.mp3');
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

  // ✅ Planification des resets — AU NIVEAU RACINE DU COMPOSANT
  useDailyResetScheduler(resetDailyData);
  useWeeklyResetScheduler(resetWeeklyData);

  // 🔹 Normalisation : toujours afficher Lun–Ven
  const currentWeekTemplate = [
    { dayLabel: 'Lun', inbound: 0, outbound: 0 },
    { dayLabel: 'Mar', inbound: 0, outbound: 0 },
    { dayLabel: 'Mer', inbound: 0, outbound: 0 },
    { dayLabel: 'Jeu', inbound: 0, outbound: 0 },
    { dayLabel: 'Ven', inbound: 0, outbound: 0 },
  ];

  const slaDataForChart = allCalls
    .filter(call => call.startTime)
    .reduce((acc, call) => {
      const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
      const dayLabel = dayNames[call.startTime.getDay()];
      if (!['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'].includes(dayLabel)) return acc;

      const day = acc.find(d => d.dayLabel === dayLabel);
      if (day) {
        if (call.callType === 'CDS_IN') day.inbound += 1;
        else if (call.callType === 'CDS_OUT') day.outbound += 1;
      }
      return acc;
    }, [...currentWeekTemplate]);

  const kpi = useKpiCalculations(employees, allCalls);

  useEffect(() => {
    if (!audioUnlocked) return;

    const interval = setInterval(() => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const timeKey = `${hours}:${minutes}`;

      if (lastScheduledSounds[timeKey]) return;

      let soundToPlay = null;
      if (hours === 8 && minutes === 30) {
        soundToPlay = 'debut.mp3';
      } else if (hours === 12 && minutes === 30) {
        soundToPlay = 'pause.mp3';
      } else if (hours === 14 && minutes === 0) {
        soundToPlay = 'reprise.mp3';
      } else if (hours === 18 && minutes === 0) {
        soundToPlay = 'fin.mp3';
      }

      if (soundToPlay) {
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
    const currentEmployees = [...employees].sort((a, b) => (b.inbound + b.outbound) - (a.inbound + a.outbound));
    const prevSorted = [...prevEmployees].sort((a, b) => (b.inbound + b.outbound) - (a.inbound + a.outbound));

    const currentTopAgent = currentEmployees[0];
    const wasTopBefore = prevSorted.length > 0 && prevSorted[0]?.name === currentTopAgent.name;

    if (!wasTopBefore && currentTopAgent) {
      const allowedFirstNames = new Set([
        'xavier', 'rana', 'mathys', 'romain',
        'nicolas', 'julien', 'benjamin', 'malik'
      ]);

      const firstName = currentTopAgent.name.split(' ')[0]?.toLowerCase() || '';

      let soundToPlay = 'passage.mp3';
      if (allowedFirstNames.has(firstName)) {
        soundToPlay = `${firstName}.mp3`;
      }

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

        <Grid container spacing={3} justifyContent="center" sx={{ mt: 4 }} aria-label="KPI Principaux">
          {[
            { title: "Total Agents", value: kpi.totalAgents, color: "info" },
            { 
              title: "Number of Calls",
              value: kpi.totalCallsThisWeek.toString(),
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