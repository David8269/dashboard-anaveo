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

const getStatusConfig = (status) => {
  if (!status) return { color: 'default', icon: '❓' };
  const lower = status.toLowerCase();
  if (lower === 'available' || lower === 'online') {
    return { color: 'success', icon: '🎃' };
  }
  if (lower === 'unavailable') {
    return { color: 'error', icon: '👻' };
  }
  return { color: 'default', icon: '💀' };
};

const getDurationColor = (seconds) => {
  if (!seconds || isNaN(seconds)) return 'default';
  if (seconds <= 600) return 'success';      // 0 à 10 min → vert
  if (seconds <= 900) return 'warning';      // 10 à 15 min → orange
  return 'error';                            // 15+ min → rouge
};

const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

const mmssToSeconds = (mmss) => {
  if (!mmss || mmss === '-') return null;
  const [m, s] = mmss.split(':').map(Number);
  return m * 60 + s;
};

export default function AgentTable({ employees = [], isLoading = false, isConnected = false, lastUpdate = null }) {
  if (isLoading) {
    return (
      <Card
        sx={{
          backgroundColor: 'var(--halloween-paper, #1a0a2e)',
          borderRadius: 3,
          border: '1px solid var(--halloween-primary, #ff6b00)',
          boxShadow: '0 0 15px rgba(255, 107, 0, 0.3)',
        }}
      >
        <CardContent>
          <Typography
            variant="overline"
            sx={{
              fontFamily: '"Nosifer", cursive',
              color: '#ff6b00',
              textShadow: '0 0 8px rgba(255,107,0,0.7)',
              fontSize: '1.1rem',
            }}
          >
            🧙‍♂️ Performance des agents
          </Typography>
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Chip
              label="Connexion magique..."
              size="small"
              sx={{
                mb: 2,
                background: 'linear-gradient(135deg, #ff8c00, #ff4500)',
                color: 'white',
                fontFamily: '"Nosifer", cursive',
              }}
            />
            <Skeleton variant="rectangular" width="100%" height={400} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!employees || employees.length === 0) {
    return (
      <Card
        sx={{
          backgroundColor: 'var(--halloween-paper, #1a0a2e)',
          borderRadius: 3,
          border: '1px solid var(--halloween-primary, #ff6b00)',
          boxShadow: '0 0 15px rgba(255, 107, 0, 0.3)',
        }}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography
              variant="overline"
              sx={{
                fontFamily: '"Nosifer", cursive',
                color: '#ff6b00',
                textShadow: '0 0 8px rgba(255,107,0,0.7)',
              }}
            >
              🧙‍♂️ Performance des agents
            </Typography>
            <Tooltip title={isConnected ? "Connecté à la toile magique" : "Déconnecté du sort"}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: isConnected ? '#01b68a' : '#ff0a0a',
                  animation: isConnected ? 'pulse-halloween 2s infinite' : 'none',
                }}
              />
            </Tooltip>
          </Box>
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              🕸️ Aucun agent dans la citrouille...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const sortedEmployees = useMemo(() => {
    return [...employees].sort((a, b) => {
      const totalA = (a.inbound || 0) + (a.outbound || 0);
      const totalB = (b.inbound || 0) + (b.outbound || 0);
      return totalB - totalA;
    });
  }, [employees]);

  const getMedalEmoji = (rank) => {
    if (rank === 0) return '🥇';
    if (rank === 1) return '🥈';
    if (rank === 2) return '🥉';
    return null;
  };

  return (
    <Card
      sx={{
        backgroundColor: 'var(--halloween-paper, #1a0a2e)',
        borderRadius: 3,
        border: '1px solid var(--halloween-primary, #ff6b00)',
        boxShadow: '0 0 15px rgba(255, 107, 0, 0.3)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography
            variant="overline"
            sx={{
              fontFamily: '"Nosifer", cursive',
              color: '#ff6b00',
              textShadow: '0 0 8px rgba(255,107,0,0.7)',
              fontSize: '1.1rem',
            }}
          >
            🧙‍♂️ Performance des agents
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title={isConnected ? "Connecté à la toile magique" : "Déconnecté du sort"}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: isConnected ? '#01b68a' : '#ff0a0a',
                  animation: isConnected ? 'pulse-halloween 2s infinite' : 'none',
                }}
              />
            </Tooltip>
            {lastUpdate && (
              <Typography variant="caption" color="#fff">
                {`MàJ : ${lastUpdate.toLocaleTimeString()}`}
              </Typography>
            )}
          </Box>
        </Box>

        <TableContainer component={Box}>
          <Table size="small" aria-label="tableau des performances des agents">
            <TableHead>
              <TableRow>
                {['#', 'Agent', 'Status', 'Appels entrants', 'Durée moyenne (entrant)', 'Appels sortants', 'Durée moyenne (sortant)'].map((label, i) => (
                  <TableCell
                    key={i}
                    scope="col"
                    sx={{
                      fontWeight: 'bold',
                      color: i === 0 || i === 1 ? '#fff' : '#ffd700',
                      textShadow: '0 0 6px rgba(255,215,0,0.6)',
                      fontFamily: '"Orbitron", sans-serif',
                      fontSize: '0.85rem',
                    }}
                    align={i >= 3 ? 'right' : 'left'}
                  >
                    {label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedEmployees.map((emp, index) => {
                const medal = getMedalEmoji(index);
                const inboundSec = mmssToSeconds(emp.avgInboundAHT);
                const outboundSec = mmssToSeconds(emp.avgOutboundAHT);
                const inboundCritical = getDurationColor(inboundSec) === 'error';
                const outboundCritical = getDurationColor(outboundSec) === 'error';
                const statusConfig = getStatusConfig(emp.status);

                return (
                  <TableRow
                    key={emp.id || `emp-${index}`}
                    hover
                    tabIndex={-1}
                    role="row"
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(255, 107, 0, 0.08)',
                        boxShadow: 'inset 0 0 10px rgba(255, 107, 0, 0.3)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {medal && (
                          <span
                            style={{
                              fontSize: '18px',
                              filter: 'drop-shadow(0 0 6px gold)',
                              animation: 'medal-glow 3s infinite alternate',
                            }}
                          >
                            {medal}
                          </span>
                        )}
                        <Typography sx={{ color: '#fff', fontWeight: 'bold' }}>
                          {index + 1}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar
                          sx={{
                            bgcolor: '#546e7a',
                            width: 24,
                            height: 24,
                            fontSize: 12,
                            mr: 1,
                            border: '1px solid #ff6b00',
                          }}
                        >
                          {getInitials(emp.name) || '?'}
                        </Avatar>
                        <Typography sx={{ color: '#fff', fontWeight: 'bold' }}>
                          {emp.name || '-'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <span>{statusConfig.icon}</span>
                            {emp.status || 'online'}
                          </Box>
                        }
                        size="small"
                        sx={{
                          fontWeight: 'bold',
                          ...(statusConfig.color === 'success' && {
                            backgroundColor: '#2e7d32',
                            color: 'white',
                          }),
                          ...(statusConfig.color === 'error' && {
                            backgroundColor: '#d32f2f',
                            color: 'white',
                          }),
                          ...(statusConfig.color === 'default' && {
                            backgroundColor: '#616161',
                            color: 'white',
                          }),
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ color: '#fff' }}>
                        {emp.inbound != null ? emp.inbound : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {emp.avgInboundAHT ? (
                        <Chip
                          label={emp.avgInboundAHT}
                          size="small"
                          sx={{
                            fontWeight: 'bold',
                            minWidth: 60,
                            color: '#fff',
                            ...(inboundCritical
                              ? {
                                  backgroundColor: '#ff6b00', // 🔴
                                  fontFamily: '"Orbitron", sans-serif',
                                }
                              : getDurationColor(inboundSec) === 'warning'
                                ? {
                                    backgroundColor: '#ffaa00', // 🟠
                                  }
                                : {
                                    backgroundColor: '#01b68a', // 🟢
                                  }),
                          }}
                        />
                      ) : (
                        <Typography sx={{ color: '#fff' }}>-</Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ color: '#fff' }}>
                        {emp.outbound != null ? emp.outbound : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {emp.avgOutboundAHT ? (
                        <Chip
                          label={emp.avgOutboundAHT}
                          size="small"
                          sx={{
                            fontWeight: 'bold',
                            minWidth: 60,
                            color: '#fff',
                            ...(outboundCritical
                              ? {
                                  backgroundColor: '#ff6b00', // 🔴
                                  fontFamily: '"Orbitron", sans-serif',
                                }
                              : getDurationColor(outboundSec) === 'warning'
                                ? {
                                    backgroundColor: '#ffaa00', // 🟠
                                  }
                                : {
                                    backgroundColor: '#01b68a', // 🟢
                                  }),
                          }}
                        />
                      ) : (
                        <Typography sx={{ color: '#fff' }}>-</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <style>
          {`
            @keyframes medal-glow {
              0% { filter: drop-shadow(0 0 6px gold); }
              100% { filter: drop-shadow(0 0 12px gold) drop-shadow(0 0 20px orange); }
            }
          `}
        </style>
      </CardContent>
    </Card>
  );
}