import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Box,
  Grid,
  Container,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import KPICard from './components/KPICard';
import SLABarchart from './components/SLABarchart';
import AgentTable from './components/AgentTable';
import CallVolumeChart from './components/CallVolumeChart';

// 🕒 Composant d'horloge — isolé pour la clarté
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
      {/* ✅ Remplacement de styled-jsx par <style> standard */}
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
          .glitch-digital {
            position: relative;
            font-family: 'Orbitron', 'Roboto', sans-serif;
            font-weight: 900;
            font-size: clamp(2rem, 8vw, 3.5rem);
            letter-spacing: 0.1em;
            color: #fff;
            user-select: none;
            text-align: center;
            text-transform: uppercase;
            text-shadow: 0 0 8px rgba(255,255,255,0.7);
          }
          .glitch-digital::before,
          .glitch-digital::after {
            content: attr(data-text);
            position: absolute;
            left: 0;
            width: 100%;
            opacity: 0.8;
          }
          .glitch-digital::before {
            animation: glitch-digital 2.5s infinite linear alternate-reverse;
            color: #ff0;
            left: -1px;
            mix-blend-mode: screen;
          }
          .glitch-digital::after {
            animation: glitch-digital 2s infinite linear alternate;
            color: #ffa500;
            left: 1px;
            mix-blend-mode: screen;
            opacity: 0.6;
          }
        `}
      </style>
      <Box
        className="glitch-digital"
        data-text={`${hours}:${minutes}:${seconds}`}
        role="status"
        aria-live="polite"
      >
        {hours}:{minutes}:{seconds}
      </Box>
    </>
  );
}

// 🧮 Utilitaire de formatage — déplacé en haut pour réutilisation
const formatSecondsToMMSS = (totalSeconds) => {
  if (!totalSeconds || isNaN(totalSeconds) || totalSeconds <= 0) return '00:00';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// 📅 Formatteur de "il y a X secondes/minutes"
const formatLastUpdate = (date) => {
  if (!date) return 'Jamais';
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `il y a ${diffSec}s`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `il y a ${diffMin}min`;
  const diffHrs = Math.floor(diffMin / 60);
  return `il y a ${diffHrs}h`;
};

// 🎨 Logique de couleur pour les KPI
const getAHTColor = (sec) => (sec > 120 ? 'error' : sec > 60 ? 'warning' : 'success');
const getAbandonColor = (rateStr) => {
  const rate = parseInt(rateStr, 10);
  if (isNaN(rate)) return 'default';
  return rate > 10 ? 'error' : rate > 5 ? 'warning' : 'success';
};

// 🎨 Couleur pour le temps d'attente (ajoutée pour remplacer getWaitTimeColor manquant)
const getWaitTimeColor = (sec) => (sec > 120 ? 'error' : sec > 30 ? 'warning' : 'success');

// 🌐 Hook custom pour la gestion WebSocket — isolé, réutilisable
const useWebSocketData = (url) => {
  const [data, setData] = useState({
    employees: [],
    callVolumes: [],
    slaData: [],
  });
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const connectionTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);

  const connect = () => {
    if (!isMountedRef.current) return;

    console.log(`[WS] 🔄 Tentative de connexion à ${url}`);
    wsRef.current = new WebSocket(url);

    // Timeout de connexion (10s)
    connectionTimeoutRef.current = setTimeout(() => {
      if (wsRef.current?.readyState === WebSocket.CONNECTING) {
        console.error('[WS] ❌ Timeout de connexion');
        setError('Timeout de connexion au serveur');
        setIsConnected(false);
        wsRef.current?.close();
      }
    }, 10000);

    wsRef.current.onopen = () => {
      if (!isMountedRef.current) return;
      clearTimeout(connectionTimeoutRef.current);
      console.log('[WS] ✅ Connecté');
      setIsConnected(true);
      setError(null);
    };

    wsRef.current.onmessage = (event) => {
      if (!isMountedRef.current) return;
      try {
        const payload = JSON.parse(event.data);
        setData({
          employees: Array.isArray(payload.employees) ? payload.employees : data.employees,
          callVolumes: Array.isArray(payload.callVolumes) ? payload.callVolumes : data.callVolumes,
          slaData: Array.isArray(payload.slaData) ? payload.slaData : data.slaData,
        });
        setLastUpdate(new Date());
      } catch (err) {
        console.error('[WS] ❌ Erreur parsing message:', err);
      }
    };

    wsRef.current.onerror = (err) => {
      if (!isMountedRef.current) return;
      console.error('[WS] ❌ Erreur:', err);
      setError('Erreur de connexion WebSocket');
      setIsConnected(false);
    };

    wsRef.current.onclose = (e) => {
      if (!isMountedRef.current) return;
      console.warn(`[WS] 🔌 Déconnecté (code ${e.code})`);
      setIsConnected(false);
      setError(`Déconnecté (code ${e.code})`);

      if (e.code !== 1000 && isMountedRef.current) {
        reconnectTimeoutRef.current = setTimeout(connect, 5000);
      }
    };
  };

  useEffect(() => {
    isMountedRef.current = true;
    connect();

    return () => {
      isMountedRef.current = false;
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (connectionTimeoutRef.current) clearTimeout(connectionTimeoutRef.current);
    };
  }, [url]);

  // ✅ Ajout d'une fonction de reconnexion propre (sans reload)
  const reconnect = () => {
    if (wsRef.current) wsRef.current.close();
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    connect();
  };

  return { ...data, lastUpdate, isConnected, error, reconnect };
};

// 🧮 Hook pour les calculs KPI — isolé pour la clarté
const useKpiCalculations = (employees = []) => {
  return useMemo(() => {
    if (!Array.isArray(employees) || employees.length === 0) {
      return {
        totalAgents: 0,
        onlineAgents: 0,
        availableAgents: 0,
        unavailableAgents: 0,
        totalInboundCalls: 0,
        totalAnsweredCalls: 0,
        missedCallsTotal: 0,
        totalOutboundCalls: 0,
        globalAHTSec: 0,
        averageHandlingTime: '00:00',
        abandonRate: '0%',
        avgWaitTimeSec: 0, // ✅ ajouté
        averageWaitTime: '00:00', // ✅ ajouté
      };
    }

    const totals = employees.reduce(
      (acc, emp) => {
        acc.totalInboundCalls += (emp.inbound || 0) + (emp.missed || 0);
        acc.totalAnsweredCalls += emp.inbound || 0;
        acc.missedCallsTotal += emp.missed || 0;
        acc.totalOutboundCalls += emp.outbound || 0;
        acc.totalHandlingTime += emp.totalHandlingTimeSec || 0;
        acc.totalAnswered += emp.answeredCalls || 0;
        acc.totalWaitTime += emp.totalWaitTimeSec || 0; // ✅ ajouté

        if (emp.status === 'available') acc.availableAgents++;
        else if (emp.status === 'unavailable') acc.unavailableAgents++;
        else if (emp.status === 'online') acc.onlineAgents++;

        return acc;
      },
      {
        totalInboundCalls: 0,
        totalAnsweredCalls: 0,
        missedCallsTotal: 0,
        totalOutboundCalls: 0,
        totalHandlingTime: 0,
        totalAnswered: 0,
        totalWaitTime: 0, // ✅ ajouté
        availableAgents: 0,
        unavailableAgents: 0,
        onlineAgents: 0,
      }
    );

    const globalAHTSec =
      totals.totalAnswered > 0
        ? Math.floor(totals.totalHandlingTime / totals.totalAnswered)
        : 0;

    const avgWaitTimeSec =
      totals.totalAnswered > 0
        ? Math.floor(totals.totalWaitTime / totals.totalAnswered)
        : 0;

    const abandonRate =
      totals.totalInboundCalls > 0
        ? `${Math.round((totals.missedCallsTotal / totals.totalInboundCalls) * 100)}%`
        : '0%';

    return {
      totalAgents: employees.length,
      onlineAgents: totals.onlineAgents,
      availableAgents: totals.availableAgents,
      unavailableAgents: totals.unavailableAgents,
      totalInboundCalls: totals.totalInboundCalls,
      totalAnsweredCalls: totals.totalAnsweredCalls,
      missedCallsTotal: totals.missedCallsTotal,
      totalOutboundCalls: totals.totalOutboundCalls,
      globalAHTSec,
      averageHandlingTime: formatSecondsToMMSS(globalAHTSec),
      abandonRate,
      avgWaitTimeSec, // ✅ exposé
      averageWaitTime: formatSecondsToMMSS(avgWaitTimeSec), // ✅ exposé
    };
  }, [employees]);
};

// 🎯 Composant principal
const App = () => {
  const WS_URL = 'wss://anaveo.on3cx.fr:3000';
  const { employees, callVolumes, slaData, lastUpdate, isConnected, error, reconnect } =
    useWebSocketData(WS_URL);

  const kpi = useKpiCalculations(employees);

  // 🎨 Overlay pour lisibilité sur fond d'image
  const overlaySx = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 0,
  };

  const contentSx = {
    position: 'relative',
    zIndex: 1,
    color: '#fff',
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage: `url('/images/background-dashboard.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        py: 4,
        position: 'relative',
        '& > *': { position: 'relative', zIndex: 1 },
      }}
      aria-label="Tableau de bord en temps réel du centre d'appels"
    >
      {/* Overlay sombre pour contraste */}
      <Box sx={overlaySx} />

      <Container maxWidth="lg" sx={contentSx}>
        {/* 🔴 Bandeau d'alerte si déconnecté */}
        {!isConnected && (
          <Alert
            severity="error"
            variant="filled"
            sx={{ mb: 3, borderRadius: 2, fontWeight: 'bold' }}
            action={
              <Button color="inherit" size="small" onClick={reconnect}>
                Reconnecter
              </Button>
            }
          >
            ⚠️ {error || 'Connexion WebSocket perdue. Tentative de reconnexion...'}
          </Alert>
        )}

        {/* 🎯 Titre principal */}
        <Typography
          variant="h1"
          align="center"
          sx={{
            fontWeight: 'bold',
            fontSize: { xs: '2rem', md: '3rem' },
            textShadow: '0 0 10px rgba(0,0,0,0.9)',
            mb: 2,
          }}
        >
          ANAVEO - Service Center
        </Typography>

        {/* 🕒 Horloge + timestamp */}
        <Box textAlign="center" mb={1}>
          <Clock />
          <Typography variant="caption" display="block" mt={0.5}>
            Dernière mise à jour : {formatLastUpdate(lastUpdate)}
          </Typography>
        </Box>

        {/* 📊 KPI Cards — 1ère rangée */}
        <Grid container spacing={3} justifyContent="center" sx={{ mt: 4 }} aria-label="KPI Agents">
          <Grid item xs={12} sm={6} md={2}>
            <KPICard title="Total Agents" value={kpi.totalAgents.toString()} valueColor="info" />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <KPICard title="Online Agents" value={kpi.onlineAgents.toString()} valueColor="warning" />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <KPICard title="Available Agents" value={kpi.availableAgents.toString()} valueColor="success" />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <KPICard title="Unavailable Agents" value={kpi.unavailableAgents.toString()} valueColor="error" />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <KPICard
              title="Average Handling Time"
              value={kpi.averageHandlingTime}
              valueColor={getAHTColor(kpi.globalAHTSec)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <KPICard
              title="Average Wait Time"
              value={kpi.averageWaitTime}
              valueColor={getWaitTimeColor(kpi.avgWaitTimeSec)}
            />
          </Grid>
        </Grid>

        {/* 📞 KPI Cards — 2ème rangée */}
        <Grid container spacing={3} justifyContent="center" sx={{ mt: 3 }} aria-label="KPI Appels">
          <Grid item xs={12} sm={6} md={2}>
            <KPICard title="Answered Calls" value={kpi.totalAnsweredCalls.toString()} />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <KPICard title="Total Inbound Calls" value={kpi.totalInboundCalls.toString()} valueColor="info" />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <KPICard title="Missed Calls" value={kpi.missedCallsTotal.toString()} valueColor="error" />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <KPICard title="Total Outbound Calls" value={kpi.totalOutboundCalls.toString()} valueColor="success" />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <KPICard
              title="Abandon Rate"
              value={kpi.abandonRate}
              valueColor={getAbandonColor(kpi.abandonRate)}
            />
          </Grid>
        </Grid>

        {/* 📈 Graphiques */}
        <Box mt={6}>
          <CallVolumeChart callVolumes={callVolumes} />
        </Box>

        <Box mt={{ xs: 8, md: 10 }}>
          <Grid container spacing={4} direction="column">
            <Grid item xs={12}>
              <AgentTable
                employees={employees}
                isLoading={!isConnected && !employees.length}
              />
            </Grid>
            <Grid item xs={12}>
              <SLABarchart slaData={slaData} />
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default App;