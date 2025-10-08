import React, { useMemo } from 'react';
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

// 🎨 Couleurs selon statut
const getStatusColor = (status) => {
  if (!status) return 'default';
  switch (status.toLowerCase()) {
    case 'available': return 'success';
    case 'online': return 'info';
    case 'unavailable': return 'error';
    default: return 'default';
  }
};

// 🎨 Couleurs selon durée (en secondes)
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

export default function AgentTable({ employees = [], isLoading = false, isConnected = false, lastUpdate = null }) {
  if (isLoading) {
    return (
      <Card sx={{ backgroundColor: 'background.paper', borderRadius: 3 }}>
        <CardContent>
          <Typography variant="overline" color="text.secondary" gutterBottom>
            Performance des agents
          </Typography>
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Chip label="Connexion WebSocket..." color="warning" size="small" sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" width="100%" height={400} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!employees || employees.length === 0) {
    return (
      <Card sx={{ backgroundColor: 'background.paper', borderRadius: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="overline" color="text.secondary">
              Performance des agents
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

  // ✅ Tri des agents par total d'appels (entrants + sortants), du plus élevé au plus faible
  const sortedEmployees = useMemo(() => {
    return [...employees].sort((a, b) => {
      const totalA = (a.inbound || 0) + (a.outbound || 0);
      const totalB = (b.inbound || 0) + (b.outbound || 0);
      return totalB - totalA; // Décroissant
    });
  }, [employees]);

  // 🏆 Fonction utilitaire pour obtenir l'emoji médaille
  const getMedalEmoji = (rank) => {
    if (rank === 0) return '🥇';
    if (rank === 1) return '🥈';
    if (rank === 2) return '🥉';
    return null;
  };

  return (
    <Card sx={{ backgroundColor: 'background.paper', borderRadius: 3 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="overline" color="text.secondary">
            Performance des agents
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
                {/* ❌ COLONNE "Appels manqués" SUPPRIMÉE */}
                <TableCell scope="col" align="right" sx={{ fontWeight: 'bold' }}>Durée moyenne (entrant)</TableCell>
                <TableCell scope="col" align="right" sx={{ fontWeight: 'bold' }}>Appels sortants</TableCell>
                <TableCell scope="col" align="right" sx={{ fontWeight: 'bold' }}>Durée moyenne (sortant)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedEmployees.map((emp, index) => {
                const medal = getMedalEmoji(index);

                return (
                  <TableRow key={emp.id || `emp-${index}`} hover tabIndex={-1} role="row">
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        {medal && (
                          <span style={{ marginRight: '6px', fontSize: '18px' }}>
                            {medal}
                          </span>
                        )}
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
                        label={emp.status || 'online'}
                        color={getStatusColor(emp.status)}
                        size="small"
                        variant="filled"
                      />
                    </TableCell>
                    <TableCell align="right">{emp.inbound != null ? emp.inbound : '-'}</TableCell>
                    {/* ❌ CELLULE "Appels manqués" SUPPRIMÉE */}
                    <TableCell align="right">
                      {emp.avgInboundAHT ? (
                        <Chip
                          label={emp.avgInboundAHT}
                          color={getDurationColor(
                            parseInt(emp.avgInboundAHT.split(':')[0]) * 60 +
                              parseInt(emp.avgInboundAHT.split(':')[1])
                          )}
                          size="small"
                          sx={{ fontWeight: 'bold', minWidth: 60 }}
                        />
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell align="right">{emp.outbound != null ? emp.outbound : '-'}</TableCell>
                    <TableCell align="right">
                      {emp.avgOutboundAHT ? (
                        <Chip
                          label={emp.avgOutboundAHT}
                          color={getDurationColor(
                            parseInt(emp.avgOutboundAHT.split(':')[0]) * 60 +
                              parseInt(emp.avgOutboundAHT.split(':')[1])
                          )}
                          size="small"
                          sx={{ fontWeight: 'bold', minWidth: 60 }}
                        />
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}