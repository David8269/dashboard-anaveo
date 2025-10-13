import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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

// ── UTILS ───────────────────────────────────────────────

const getLocalDateStr = (date) => {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().split('T')[0];
};

const isLunchBreak = (date) => {
  if (!date) return false;
  const totalMinutes = date.getHours() * 60 + date.getMinutes();
  return totalMinutes >= 750 && totalMinutes < 840; // 12:30 à 14:00
};

const isBusinessHourCall = (date) => {
  if (!date) return false;
  const day = date.getDay(); // 0 = dim, 1 = lun, ..., 5 = ven, 6 = sam
  const h = date.getHours();
  const m = date.getMinutes();

  if (day >= 1 && day <= 4) {
    // Lundi–Jeudi : 8h30–18h30
    return (h > 8 || (h === 8 && m >= 30)) && (h < 18 || (h === 18 && m <= 30));
  } else if (day === 5) {
    // Vendredi : 8h30–17h00
    return (h > 8 || (h === 8 && m >= 30)) && (h < 17 || (h === 17 && m === 0));
  }
  return false;
};

const isLostCall = (cdr) => {
  return (
    cdr.callType === 'ABSYS' &&
    (cdr.durationSec || 0) <= 59 &&
    !isLunchBreak(cdr.startTime)
  );
};

const parseDurationToSeconds = (durationStr = '00:00:00') => {
  const [h, m, s] = durationStr.split(':').map(Number);
  return (h || 0) * 3600 + (m || 0) * 60 + (s || 0);
};

const parseCDRDate = (str) => {
  if (!str) return null;
  const [datePart, timePart] = str.split(' ');
  if (!datePart || !timePart) return null;
  const [y, m, d] = datePart.split('/');
  const [hh, mm, ss] = timePart.split(':');
  return new Date(Date.UTC(Number(y), Number(m) - 1, Number(d), Number(hh), Number(mm), Number(ss)));
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

// ── AUDIO MANAGER ───────────────────────────────────────

const useAudioManager = () => {
  const [unlocked, setUnlocked] = useState(false);

  const unlock = useCallback(() => {
    const audio = new Audio(`${process.env.PUBLIC_URL}/sounds/silent.wav`);
    audio.play()
      .then(() => setUnlocked(true))
      .catch(console.warn);
  }, []);

  const play = useCallback((filename) => {
    if (!unlocked) return;
    const audio = new Audio(`${process.env.PUBLIC_URL}/sounds/${filename}`);
    audio.play().catch(e => console.warn(`Échec lecture ${filename}:`, e));
  }, [unlocked]);

  return { unlocked, unlock, play };
};

// ── PLANIFICATEURS ──────────────────────────────────────

const useMidnightReset = (onReset) => {
  useEffect(() => {
    const schedule = () => {
      const now = new Date();
      const nextMidnight = new Date(now);
      nextMidnight.setHours(24, 0, 0, 0);
      const delay = nextMidnight.getTime() - now.getTime();
      const id = setTimeout(() => {
        onReset();
        schedule();
      }, delay);
      return () => clearTimeout(id);
    };
    return schedule();
  }, [onReset]);
};

const useMonday8amReset = (onReset) => {
  useEffect(() => {
    const schedule = () => {
      const now = new Date();
      const day = now.getDay();
      let daysUntilMonday = (1 - day + 7) % 7;
      if (daysUntilMonday === 0 && now.getHours() >= 8) daysUntilMonday = 7;
      const nextMonday = new Date(now);
      nextMonday.setDate(now.getDate() + daysUntilMonday);
      nextMonday.setHours(8, 0, 0, 0);
      const delay = nextMonday.getTime() - now.getTime();
      const id = setTimeout(() => {
        onReset();
        schedule();
      }, delay);
      return () => clearTimeout(id);
    };
    return schedule();
  }, [onReset]);
};

// ── STOCKAGE LOCAL ──────────────────────────────────────

const cleanupStorage = () => {
  const now = new Date();
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key?.startsWith('callData_')) {
      const dateStr = key.split('_')[1];
      const date = new Date(dateStr + 'T00:00:00');
      const days = Math.floor((now - date) / (864e5));
      if (days > 7) localStorage.removeItem(key);
    }
  }
};

const saveCalls = (calls, date) => {
  try {
    const key = `callData_${getLocalDateStr(date)}`;
    const serializable = calls.map(c => ({
      ...c,
      startTime: c.startTime?.toISOString(),
      endTime: c.endTime?.toISOString(),
      receivedAt: c.receivedAt?.toISOString(),
    }));
    localStorage.setItem(key, JSON.stringify(serializable));
  } catch (e) {
    console.warn('Sauvegarde échouée', e);
  }
};

const loadCalls = (date) => {
  const key = `callData_${getLocalDateStr(date)}`;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw).map(c => ({
      ...c,
      startTime: c.startTime ? new Date(c.startTime) : null,
      endTime: c.endTime ? new Date(c.endTime) : null,
      receivedAt: c.receivedAt ? new Date(c.receivedAt) : null,
    })).filter(c => c.startTime);
  } catch (e) {
    console.warn('Chargement échoué', e);
    localStorage.removeItem(key);
    return [];
  }
};

// ── TRAITEMENT DES APPELS ───────────────────────────────

const useCallSystem = (onLostCall) => {
  const [agents, setAgents] = useState({});
  const [allCalls, setAllCalls] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    cleanupStorage();
    const today = new Date();
    const calls = loadCalls(today);
    setAllCalls(calls);
    rebuildAgents(calls);
  }, []);

  const rebuildAgents = (calls) => {
    const newAgents = {};
    calls.forEach(cdr => {
      if (cdr.callType === 'ABSYS') return;
      const { agentName, callType } = cdr;
      if (!agentName) return;
      if (!newAgents[agentName]) {
        newAgents[agentName] = {
          name: agentName,
          status: 'online',
          inbound: 0,
          missed: 0,
          outbound: 0,
          inboundHandlingTimeSec: 0,
          outboundHandlingTimeSec: 0,
        };
      }
      const a = newAgents[agentName];
      if (callType === 'CDS_IN') {
        if (['src_participant_terminated', 'dst_participant_terminated'].includes(cdr.status)) {
          a.inbound += 1;
          a.inboundHandlingTimeSec += cdr.durationSec || 0;
        } else if (cdr.status.includes('missed') || cdr.status.includes('abandoned')) {
          a.missed += 1;
        }
      } else if (callType === 'CDS_OUT') {
        a.outbound += 1;
        a.outboundHandlingTimeSec += cdr.durationSec || 0;
      }
    });
    setAgents(newAgents);
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
    const startTime = parseCDRDate(fields[3]);
    if (!startTime) return null;
    return {
      id: fields[0] || '',
      startTime,
      endTime: parseCDRDate(fields[5]),
      status,
      caller,
      queue: isFrontOffice ? 'Front Office' : '',
      agentName: agentName || '',
      duration: durationStr,
      callType,
      durationSec: parseDurationToSeconds(durationStr),
    };
  };

  const connectWebSocket = () => {
    const ws = new WebSocket('wss://cds-on3cx.anaveo.com/cdr-ws/');
    ws.onopen = () => {
      setIsConnected(true);
      ws.send(JSON.stringify({ type: "subscribe", topic: "cdr/live" }));
    };
    ws.onmessage = (event) => {
      const msg = event.data;
      if (typeof msg !== 'string' || !msg.startsWith('Call ')) return;
      const cdr = parseCDRLine(msg);
      if (!cdr || !cdr.startTime) return;

      if (isLunchBreak(cdr.startTime)) {
        cdr.callType = 'ABSYS';
        cdr.agentName = '';
      }

      if (isLostCall(cdr)) {
        onLostCall();
        return;
      }

      if (isBusinessHourCall(cdr.startTime)) {
        const today = new Date();
        const todayStr = getLocalDateStr(today);
        const callDateStr = getLocalDateStr(cdr.startTime);
        if (callDateStr === todayStr) {
          setAllCalls(prev => {
            const updated = [...prev, cdr];
            saveCalls(updated, today);
            return updated;
          });
          rebuildAgents([...allCalls, cdr]);
        }
      }
      setLastUpdate(new Date());
    };
    ws.onclose = () => {
      setIsConnected(false);
      setTimeout(connectWebSocket, 5000);
    };
    ws.onerror = () => {
      setIsConnected(false);
    };
    return ws;
  };

  useEffect(() => {
    const ws = connectWebSocket();
    return () => ws.close();
  }, []);

  const resetDailyKPI = useCallback(() => {
    // Réinitialise agents et volumes, mais PAS allCalls → Number of Calls reste actif
    setAgents({});
  }, []);

  const resetWeekly = useCallback(() => {
    // Lundi 8h : tout réinitialiser + nettoyer localStorage
    const now = new Date();
    const day = now.getDay();
    const daysToMon = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + daysToMon);
    for (let i = 0; i < 5; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      localStorage.removeItem(`callData_${getLocalDateStr(d)}`);
    }
    setAllCalls([]);
    setAgents({});
  }, []);

  return {
    agents: Object.values(agents),
    allCalls,
    lastUpdate,
    isConnected,
    resetDailyKPI,
    resetWeekly,
  };
};

// ── STATISTIQUES ────────────────────────────────────────

const useTodayStats = (calls) => {
  return useMemo(() => {
    const today = getLocalDateStr(new Date());
    const filtered = calls.filter(c => getLocalDateStr(c.startTime) === today);
    let inbound = 0, outbound = 0;
    filtered.forEach(c => {
      if (c.callType === 'CDS_IN') inbound++;
      else if (c.callType === 'CDS_OUT') outbound++;
    });
    return { inbound, outbound, total: inbound + outbound };
  }, [calls]);
};

const useWeeklyStats = (calls) => {
  return useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const daysToMon = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + daysToMon);
    monday.setHours(0, 0, 0, 0);

    const labels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'];
    const data = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      data.push({
        date: getLocalDateStr(date),
        dayLabel: labels[i],
        inbound: 0,
        outbound: 0,
        total: 0,
      });
    }

    calls.forEach(call => {
      if (!call.startTime || call.callType === 'ABSYS') return;
      const callDate = getLocalDateStr(call.startTime);
      const idx = data.findIndex(d => d.date === callDate);
      if (idx !== -1) {
        if (call.callType === 'CDS_IN') {
          data[idx].inbound++;
        } else if (call.callType === 'CDS_OUT') {
          data[idx].outbound++;
        }
        data[idx].total = data[idx].inbound + data[idx].outbound;
      }
    });

    return data;
  }, [calls]);
};

// ── HORLOGE ─────────────────────────────────────────────

const Clock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const h = time.getHours().toString().padStart(2, '0');
  const m = time.getMinutes().toString().padStart(2, '0');
  const s = time.getSeconds().toString().padStart(2, '0');
  return (
    <Box sx={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 900, fontSize: '2.5rem', color: '#fff', textShadow: '0 0 10px rgba(255,255,255,0.7)' }}>
      {h}:{m}:{s}
    </Box>
  );
};

// ── COMPOSANT PRINCIPAL ─────────────────────────────────

const App = () => {
  const { unlocked: audioUnlocked, unlock: unlockAudio, play: playSound } = useAudioManager();
  const handleLostCall = useCallback(() => playSound('fatality.mp3'), [playSound]);

  const {
    agents,
    allCalls,
    lastUpdate,
    isConnected,
    resetDailyKPI,
    resetWeekly,
  } = useCallSystem(handleLostCall);

  const prevAgentsRef = useRef([]);

  useMidnightReset(resetDailyKPI);     // Minuit : réinit KPI (sauf Number of Calls)
  useMonday8amReset(resetWeekly);      // Lundi 8h : réinit TOUT

  const todayStats = useTodayStats(allCalls);
  const weeklyStats = useWeeklyStats(allCalls);

  // ── SONS HORAIRE ───────────────────────────────────────

  useEffect(() => {
    if (!audioUnlocked) return;

    const interval = setInterval(() => {
      const now = new Date();
      const day = now.getDay(); // 1=lun, ..., 5=ven
      const h = now.getHours();
      const m = now.getMinutes();

      // Seulement lundi–vendredi
      if (day < 1 || day > 5) return;

      if (h === 8 && m === 30) {
        playSound('debut.mp3');
      } else if (h === 12 && m === 30) {
        playSound('pause.mp3');
      } else if (h === 14 && m === 0) {
        playSound('reprise.mp3');
      } else if (day <= 4 && h === 18 && m === 0) {
        // Lundi–Jeudi à 18h
        playSound('fin.mp3');
      } else if (day === 5 && h === 17 && m === 0) {
        // Vendredi à 17h
        playSound('fin.mp3');
      }
    }, 60000); // Vérifie chaque minute

    return () => clearInterval(interval);
  }, [audioUnlocked, playSound]);

  // ── SON TECHNICIEN 1ER ─────────────────────────────────

  useEffect(() => {
    if (!audioUnlocked || agents.length === 0) return;

    const totalCalls = agents.reduce((sum, a) => sum + a.inbound + a.outbound + a.missed, 0);
    if (totalCalls < 50) return;

    const currentTop = [...agents].sort((a, b) => (b.inbound + b.outbound) - (a.inbound + a.outbound))[0];
    const prevTop = [...prevAgentsRef.current].sort((a, b) => (b.inbound + b.outbound) - (a.inbound + a.outbound))[0];

    if (!prevTop || currentTop.name !== prevTop.name) {
      const firstName = currentTop.name.split(' ')[0]?.toLowerCase() || '';
      const allowed = new Set(['xavier', 'rana', 'mathys', 'romain', 'nicolas', 'julien', 'benjamin', 'malik']);
      const sound = allowed.has(firstName) ? `${firstName}.mp3` : 'passage.mp3';
      playSound(sound);
    }

    prevAgentsRef.current = [...agents];
  }, [agents, audioUnlocked, playSound]);

  // ── CALCUL DES KPI ────────────────────────────────────

  const kpi = useMemo(() => {
    const totalInboundFromAgents = agents.reduce((sum, a) => sum + a.inbound + a.missed, 0);
    const totalMissedFromAgents = agents.reduce((sum, a) => sum + a.missed, 0);
    const totalOutboundCalls = agents.reduce((sum, a) => sum + a.outbound, 0);
    const totalInboundHandling = agents.reduce((sum, a) => sum + a.inboundHandlingTimeSec, 0);
    const totalOutboundHandling = agents.reduce((sum, a) => sum + a.outboundHandlingTimeSec, 0);
    const totalAnsweredInbound = agents.reduce((sum, a) => sum + a.inbound, 0);
    const totalAnsweredOutbound = agents.reduce((sum, a) => sum + a.outbound, 0);

    const absysMissed = allCalls.filter(call => {
      if (call.callType !== 'ABSYS' || call.durationSec >= 60) return false;
      return !isLunchBreak(call.startTime);
    }).length;

    const totalMissed = totalMissedFromAgents + absysMissed;
    const totalInbound = totalInboundFromAgents + absysMissed;

    const avgInboundAHTSec = totalAnsweredInbound > 0 ? Math.floor(totalInboundHandling / totalAnsweredInbound) : 0;
    const avgOutboundAHTSec = totalAnsweredOutbound > 0 ? Math.floor(totalOutboundHandling / totalAnsweredOutbound) : 0;
    const globalAHTSec = (totalAnsweredInbound + totalAnsweredOutbound) > 0
      ? Math.floor((totalInboundHandling + totalOutboundHandling) / (totalAnsweredInbound + totalAnsweredOutbound))
      : 0;
    const abandonRate = totalInbound > 0 ? `${Math.round((totalMissed / totalInbound) * 100)}%` : '0%';

    return {
      totalAgents: agents.length,
      numberOfCallsToday: todayStats.total,
      totalAnsweredCalls: totalAnsweredInbound,
      missedCallsTotal: totalMissed,
      totalOutboundCalls,
      globalAHTSec,
      averageHandlingTime: formatSecondsToMMSS(globalAHTSec),
      abandonRate,
      avgInboundAHT: formatSecondsToMMSS(avgInboundAHTSec),
      avgOutboundAHT: formatSecondsToMMSS(avgOutboundAHTSec),
    };
  }, [agents, allCalls, todayStats]);

  // ── RENDU ─────────────────────────────────────────────

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage: `url('${process.env.PUBLIC_URL}/images/background-dashboard.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        py: 4,
        position: 'relative',
        '& > *': { position: 'relative', zIndex: 1 },
      }}
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
            { title: "Total Inbound Calls", value: kpi.totalAnsweredCalls + kpi.missedCallsTotal, color: "info" },
            { title: "Total Outbound Calls", value: kpi.totalOutboundCalls, color: "success" },
            { title: "Abandon Rate", value: kpi.abandonRate, color: getAbandonColor(kpi.abandonRate) },
          ].map((item, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={i}>
              <KPICard title={item.title} value={item.value.toString()} valueColor={item.color} />
            </Grid>
          ))}
        </Grid>

        <Box mt={6}>
          <CallVolumeChart callVolumes={[]} wsConnected={isConnected} halfHourSlots={[]} />
        </Box>

        <Box mt={{ xs: 8, md: 10 }}>
          <Grid container spacing={4} direction="column">
            <Grid size={{ xs: 12 }}>
              <AgentTable
                employees={agents.map(emp => ({
                  ...emp,
                  avgInboundAHT: formatSecondsToMMSS(emp.inbound > 0 ? Math.floor(emp.inboundHandlingTimeSec / emp.inbound) : 0),
                  avgOutboundAHT: formatSecondsToMMSS(emp.outbound > 0 ? Math.floor(emp.outboundHandlingTimeSec / emp.outbound) : 0),
                }))}
                isLoading={!isConnected && agents.length === 0}
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
                  <Box sx={{ position: 'absolute', bottom: 16, right: 16, zIndex: 2 }}>
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