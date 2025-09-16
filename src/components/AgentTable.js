import React, { useMemo, useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  Box,
  Skeleton,
  Tooltip,
} from '@mui/material';

const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds) || seconds <= 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

// 🎯 URL du WebSocket — À ADAPTER selon votre backend
const WEBSOCKET_URL = 'ws://anaveo.on3cx.fr:3000/ws/agents';

export default function AgentTable() {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  // 💡 Calcul des métriques enrichies
  const processedEmployees = useMemo(() =>
    employees.map((emp, index) => {
      const inboundAnswered = emp.answeredCalls || 0;
      const inboundTime = emp.totalHandlingTimeSec || 0;
      const ahtInboundSec = inboundAnswered > 0 ? Math.floor(inboundTime / inboundAnswered) : 0;

      const outboundAnswered = emp.outbound || 0;
      const outboundTime = emp.totalOutboundTimeSec || 0;
      const ahtOutboundSec = outboundAnswered > 0 && outboundTime > 0
        ? Math.floor(outboundTime / outboundAnswered)
        : 0;

      return {
        ...emp,
        id: emp.id ?? `emp-${index}`,
        rank: emp.rank ?? index + 1,
        ahtInboundSec,
        ahtOutboundSec,
      };
    }), [employees]
  );

  // 🎨 Couleurs selon statut
  const getStatusColor = (status) => {
    if (!status) return 'default';
    switch (status.toLowerCase()) {
      case 'available': return 'success';
      case 'online': return 'warning';
      case 'unavailable': return 'error';
      default: return 'default';
    }
  };

  // 🎨 Couleurs selon durée
  const getDurationColor = (seconds) => {
    if (!seconds || isNaN(seconds)) return 'default';
    if (seconds <= 600) return 'success'; // ≤ 10min
    if (seconds <= 900) return 'warning'; // ≤ 15min
    return 'error'; // > 15min
  };

  // 👤 Initiales pour avatar
  const getInitials = (name = '') =>
    name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

  // 🔄 Gestion de la connexion WebSocket
  useEffect(() => {
    let ws;
    let reconnectTimeout;

    const connectWebSocket = () => {
      setIsLoading(true);
      setError(null);

      ws = new WebSocket(WEBSOCKET_URL);

      ws.onopen = () => {
        console.log('✅ WebSocket connecté');
        setIsConnected(true);
        setIsLoading(false);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setEmployees(Array.isArray(data) ? data : []);
          setLastUpdate(new Date());
        } catch (err) {
          console.error("Erreur parsing WebSocket message:", err);
          setError("Données invalides reçues");
        }
      };

      ws.onerror = (err) => {
        console.error('❌ WebSocket erreur:', err);
        setError("Erreur de connexion WebSocket");
        setIsConnected(false);
      };

      ws.onclose = (event) => {
        console.log('🔌 WebSocket déconnecté', event.reason || event.code);
        setIsConnected(false);
        setIsLoading(false);

        // Tentative de reconnexion après 3 secondes
        if (!event.wasClean) {
          reconnectTimeout = setTimeout(() => {
            console.log('🔄 Reconnexion WebSocket...');
            connectWebSocket();
          }, 3000);
        }
      };
    };

    // Lancer la 1ère connexion
    connectWebSocket();

    // 🧹 Nettoyage à la destruction du composant
    return () => {
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);

  // 🔄 Affichage placeholder pendant la connexion
  if (isLoading) {
    return (
      <Card sx={{ backgroundColor: 'background.paper', borderRadius: 3 }}>
        <CardContent>
          <Typography variant="overline" color="text.secondary" gutterBottom>
            Performance des agents (Live)
          </Typography>
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Chip label="Connexion WebSocket..." color="warning" size="small" sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" width="100%" height={400} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  // ❌ Affichage erreur
  if (error) {
    return (
      <Card sx={{ backgroundColor: 'background.paper', borderRadius: 3 }}>
        <CardContent>
          <Typography variant="overline" color="text.secondary" gutterBottom>
            Performance des agents (Live)
          </Typography>
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="error" gutterBottom>
              ❌ {error}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              Reconnexion automatique en cours...
            </Typography>
            <Skeleton variant="rectangular" width="100%" height={300} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  // 🟡 Affichage "Aucune donnée" si chargement terminé mais tableau vide
  if (!employees || employees.length === 0) {
    return (
      <Card sx={{ backgroundColor: 'background.paper', borderRadius: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="overline" color="text.secondary">
              Performance des agents (Live)
            </Typography>
            <Tooltip title={isConnected ? "Connecté en temps réel" : "Déconnecté"}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: isConnected ? 'success.main' : 'error.main',
                  animation: isConnected ? 'pulse 2s infinite' : 'none',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.5 },
                  },
                }}
              />
            </Tooltip>
          </Box>
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Aucune donnée disponible.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ backgroundColor: 'background.paper', borderRadius: 3 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="overline" color="text.secondary">
            Performance des agents (Live)
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title={isConnected ? "Connecté en temps réel" : "Déconnecté"}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: isConnected ? 'success.main' : 'error.main',
                  animation: isConnected ? 'pulse 2s infinite' : 'none',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.5 },
                  },
                }}
              />
            </Tooltip>
            {lastUpdate && (
              <Typography variant="caption" color="text.secondary">
                {`MàJ : ${lastUpdate.toLocaleTimeString()}`}
              </Typography>
            )}
          </Box>
        </Box>
        <TableContainer component={Box}>
          <Table size="small" aria-label="tableau des performances des agents">
            <TableHead>
              <TableRow>
                <TableCell scope="col" sx={{ fontWeight: 'bold' }}>#</TableCell>
                <TableCell scope="col" sx={{ fontWeight: 'bold' }}>Agent</TableCell>
                <TableCell scope="col" sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell scope="col" align="right" sx={{ fontWeight: 'bold' }}>Appels entrants</TableCell>
                <TableCell scope="col" align="right" sx={{ fontWeight: 'bold' }}>Appels manqués</TableCell>
                <TableCell scope="col" align="right" sx={{ fontWeight: 'bold' }}>Durée moyenne (entrant)</TableCell>
                <TableCell scope="col" align="right" sx={{ fontWeight: 'bold' }}>Appels sortants</TableCell>
                <TableCell scope="col" align="right" sx={{ fontWeight: 'bold' }}>Durée moyenne (sortant)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {processedEmployees.map((emp) => (
                <TableRow key={emp.id} hover tabIndex={-1} role="row">
                  <TableCell>{emp.rank}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar
                        sx={{
                          bgcolor: '#546e7a',
                          width: 24,
                          height: 24,
                          fontSize: 12,
                          mr: 1,
                        }}
                      >
                        {getInitials(emp.name) || '?'}
                      </Avatar>
                      {emp.name || '-'}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={emp.status || '-'}
                      color={getStatusColor(emp.status)}
                      size="small"
                      variant="filled"
                    />
                  </TableCell>
                  <TableCell align="right">{emp.inbound != null ? emp.inbound : '-'}</TableCell>
                  <TableCell align="right">{emp.missed != null ? emp.missed : '-'}</TableCell>
                  <TableCell align="right">
                    <Chip
                      label={formatDuration(emp.ahtInboundSec)}
                      color={getDurationColor(emp.ahtInboundSec)}
                      size="small"
                      sx={{ fontWeight: 'bold', minWidth: 60 }}
                    />
                  </TableCell>
                  <TableCell align="right">{emp.outbound != null ? emp.outbound : '-'}</TableCell>
                  <TableCell align="right">
                    {emp.totalOutboundTimeSec != null ? (
                      <Chip
                        label={formatDuration(emp.ahtOutboundSec)}
                        color={getDurationColor(emp.ahtOutboundSec)}
                        size="small"
                        sx={{ fontWeight: 'bold', minWidth: 60 }}
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary" component="span">
                        -
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}