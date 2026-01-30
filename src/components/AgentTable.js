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
  if (lower === 'available' || lower === 'online') return { color: 'success', icon: '🥞' };
  if (lower === 'unavailable') return { color: 'warning', icon: '⏳' };
  return { color: 'default', icon: '🧈' };
};

const getDurationColor = (seconds) => {
  if (!seconds || isNaN(seconds)) return 'default';
  if (seconds <= 600) return 'success';
  if (seconds <= 900) return 'warning';
  return 'error';
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
      <Card sx={{
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        borderRadius: 3,
        border: '1px solid rgba(255, 215, 0, 0.6)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
      }}>
        <CardContent>
          <Typography variant="overline" sx={{
            fontFamily: '"Montserrat", sans-serif',
            color: '#FFD700',
            textShadow: '0 0 12px rgba(255, 215, 0, 0.8)',
            fontSize: '1.2rem',
            fontWeight: 'bold',
          }}>
            🥞 Maîtres Crêpiers 2026
          </Typography>
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Chip label="Préparation de la pâte..." size="small" sx={{
              mb: 2,
              background: 'linear-gradient(135deg, #5D4037, #FFD700)',
              color: '#FFD700',
              fontFamily: '"Montserrat", sans-serif',
              animation: 'pulse-crepe 2s infinite alternate',
              border: '1px solid rgba(255, 215, 0, 0.6)',
            }} />
            <Skeleton variant="rectangular" width="100%" height={400} sx={{ backgroundColor: 'rgba(255, 215, 0, 0.1)' }} />
          </Box>
        </CardContent>
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: '-50%',
          width: '200%',
          height: '100%',
          background: 'radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.1), transparent 70%)',
          animation: 'crepe-glow 15s linear infinite',
          pointerEvents: 'none',
        }} />
        <style>{`
          @keyframes pulse-crepe {
            0% { transform: scale(1); box-shadow: 0 0 8px rgba(255, 215, 0, 0.6); }
            100% { transform: scale(1.04); box-shadow: 0 0 20px rgba(255, 215, 0, 0.9); }
          }
          @keyframes crepe-glow {
            0% { transform: translateX(0) translateY(0); }
            50% { transform: translateX(-6%) translateY(-3%); }
            100% { transform: translateX(0) translateY(0); }
          }
        `}</style>
      </Card>
    );
  }

  if (!employees || employees.length === 0) {
    return (
      <Card sx={{
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        borderRadius: 3,
        border: '1px solid rgba(255, 215, 0, 0.6)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
      }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="overline" sx={{
              fontFamily: '"Montserrat", sans-serif',
              color: '#FFD700',
              textShadow: '0 0 12px rgba(255, 215, 0, 0.8)',
              fontSize: '1.2rem',
              fontWeight: 'bold',
            }}>
              🥞 Maîtres Crêpiers 2026
            </Typography>
            <Tooltip title={isConnected ? "Connecté à la cuisine" : "Déconnecté"}>
              <Box sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: isConnected ? '#FFD700' : '#c62828',
                animation: isConnected ? 'pulse-glow 2s infinite' : 'none',
              }} />
            </Tooltip>
          </Box>
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="#FFD700" sx={{ fontStyle: 'italic' }}>
              🌟 Aucun crêpier à la poêle...
            </Typography>
          </Box>
        </CardContent>
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: '-50%',
          width: '200%',
          height: '100%',
          background: 'radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.1), transparent 70%)',
          animation: 'crepe-glow 15s linear infinite',
          pointerEvents: 'none',
        }} />
      </Card>
    );
  }

  const sortedEmployees = useMemo(() => [...employees].sort((a, b) => ((b.inbound || 0) + (b.outbound || 0)) - ((a.inbound || 0) + (a.outbound || 0))), [employees]);
  const getMedalEmoji = (rank) => rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : '👨‍🍳';

  return (
    <Card sx={{
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: 'rgba(0, 0, 0, 0.55)',
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)',
      borderRadius: 3,
      border: '1px solid rgba(255, 215, 0, 0.6)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
    }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="overline" sx={{
            fontFamily: '"Montserrat", sans-serif',
            color: '#FFD700',
            textShadow: '0 0 12px rgba(255, 215, 0, 0.8)',
            fontSize: '1.2rem',
            fontWeight: 'bold',
          }}>
            🥞 Maîtres Crêpiers 2026
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title={isConnected ? "Connecté à la cuisine" : "Déconnecté"}>
              <Box sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: isConnected ? '#FFD700' : '#c62828',
                animation: isConnected ? 'pulse-glow 2s infinite' : 'none',
              }} />
            </Tooltip>
            {lastUpdate && (
              <Typography variant="caption" color="#FFD700" sx={{ fontStyle: 'italic' }}>
                {`MàJ : ${lastUpdate.toLocaleTimeString()}`}
              </Typography>
            )}
          </Box>
        </Box>

        <TableContainer component={Box}>
          <Table size="small" aria-label="tableau des performances des crêpiers">
            <TableHead>
              <TableRow>
                {['#', 'Crêpier', 'Statut', 'Crêpes dorées', 'Temps moyen (cuisson)', 'Crêpes retournées', 'Temps moyen (retournement)'].map((label, i) => (
                  <TableCell
                    key={i}
                    scope="col"
                    sx={{
                      fontWeight: 'bold',
                      color: '#FFD700',
                      fontFamily: '"Montserrat", sans-serif',
                      fontSize: '0.85rem',
                      borderBottom: '2px solid rgba(255, 215, 0, 0.6)',
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
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(255, 215, 0, 0.1)',
                        boxShadow: 'inset 0 0 12px rgba(255, 215, 0, 0.3)',
                        transform: 'scale(1.02)',
                      },
                      transition: 'all 0.25s ease-in-out',
                      '&:not(:last-child)': {
                        borderBottom: '1px dashed rgba(255, 215, 0, 0.3)',
                      },
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {medal && (
                          <span
                            style={{
                              fontSize: '18px',
                              filter: 'drop-shadow(0 0 6px rgba(255, 215, 0, 0.7))',
                              animation: 'medal-glow 2.5s infinite alternate',
                            }}
                          >
                            {medal}
                          </span>
                        )}
                        <Typography sx={{ color: '#FFD700', fontWeight: 'bold' }}>{index + 1}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar
                          sx={{
                            bgcolor: '#FFD700',
                            color: '#000',
                            width: 28,
                            height: 28,
                            fontSize: 12,
                            mr: 1,
                            border: '1px solid rgba(255, 215, 0, 0.6)',
                            transition: 'all 0.3s',
                            '&:hover': { transform: 'rotate(5deg) scale(1.1)' },
                          }}
                        >
                          {getInitials(emp.name) || '?'}
                        </Avatar>
                        <Typography sx={{ color: '#FFD700', fontWeight: 'bold' }}>{emp.name || '-'}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {statusConfig.icon}
                            {emp.status || 'à la poêle'}
                          </Box>
                        }
                        size="small"
                        sx={{
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.1)',
                            boxShadow: '0 0 10px rgba(255, 215, 0, 0.6)',
                          },
                          ...(statusConfig.color === 'success'
                            ? { backgroundColor: '#5D4037', color: '#FFD700', border: '1px solid rgba(255, 215, 0, 0.6)' }
                            : statusConfig.color === 'warning'
                            ? { backgroundColor: '#ff9800', color: '#fff', border: '1px solid rgba(255, 215, 0, 0.6)' }
                            : { backgroundColor: '#a67c52', color: '#FFD700', border: '1px solid rgba(255, 215, 0, 0.6)' }),
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ color: '#FFD700', fontWeight: 500 }}>{emp.inbound != null ? emp.inbound : '-'}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      {emp.avgInboundAHT ? (
                        <Chip
                          label={emp.avgInboundAHT}
                          size="small"
                          sx={{
                            fontWeight: 'bold',
                            minWidth: 60,
                            border: '1px solid rgba(255, 215, 0, 0.6)',
                            ...(inboundCritical
                              ? {
                                  backgroundColor: '#c62828',
                                  color: '#FFD700',
                                  fontFamily: '"Montserrat", sans-serif',
                                  animation: 'pulse-critical 2s infinite alternate',
                                }
                              : getDurationColor(inboundSec) === 'warning'
                              ? { backgroundColor: '#ff9800', color: '#fff' }
                              : { backgroundColor: '#5D4037', color: '#FFD700' }),
                          }}
                        />
                      ) : (
                        <Typography sx={{ color: '#FFD700' }}>-</Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ color: '#FFD700', fontWeight: 500 }}>{emp.outbound != null ? emp.outbound : '-'}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      {emp.avgOutboundAHT ? (
                        <Chip
                          label={emp.avgOutboundAHT}
                          size="small"
                          sx={{
                            fontWeight: 'bold',
                            minWidth: 60,
                            border: '1px solid rgba(255, 215, 0, 0.6)',
                            ...(outboundCritical
                              ? {
                                  backgroundColor: '#c62828',
                                  color: '#FFD700',
                                  fontFamily: '"Montserrat", sans-serif',
                                  animation: 'pulse-critical 2s infinite alternate',
                                }
                              : getDurationColor(outboundSec) === 'warning'
                              ? { backgroundColor: '#ff9800', color: '#fff' }
                              : { backgroundColor: '#5D4037', color: '#FFD700' }),
                          }}
                        />
                      ) : (
                        <Typography sx={{ color: '#FFD700' }}>-</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: '-50%',
          width: '200%',
          height: '100%',
          background: 'radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.1), transparent 70%)',
          animation: 'crepe-glow 15s linear infinite',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <style>{`
        @keyframes medal-glow {
          0% { filter: drop-shadow(0 0 4px rgba(255, 215, 0, 0.6)); }
          100% { filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.8)) drop-shadow(0 0 16px rgba(255, 215, 0, 0.6)); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.7); }
          50% { box-shadow: 0 0 0 8px rgba(255, 215, 0, 0); }
        }
        @keyframes pulse-crepe {
          0% { transform: scale(1); box-shadow: 0 0 8px rgba(255, 215, 0, 0.6); }
          100% { transform: scale(1.04); box-shadow: 0 0 20px rgba(255, 215, 0, 0.9); }
        }
        @keyframes crepe-glow {
          0% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(-6%) translateY(-3%); }
          100% { transform: translateX(0) translateY(0); }
        }
        @keyframes pulse-critical {
          0% { transform: scale(1); box-shadow: 0 0 6px #ff5252; }
          100% { transform: scale(1.03); box-shadow: 0 0 12px #ff1744; }
        }
      `}</style>
    </Card>
  );
}