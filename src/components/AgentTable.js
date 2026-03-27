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
  if (!status) return { color: 'default', icon: '🎭' };
  const lower = status.toLowerCase();
  if (lower === 'available' || lower === 'online') return { color: 'success', icon: '🤡' };
  if (lower === 'unavailable') return { color: 'warning', icon: '🎪' };
  return { color: 'default', icon: '🎈' };
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
        backgroundColor: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderRadius: 3,
        border: '3px solid #DC143C',
        boxShadow: '0 4px 16px rgba(220, 20, 60, 0.3)',
      }}>
        <CardContent>
          <Typography variant="overline" sx={{
            fontFamily: '"Montserrat", sans-serif',
            color: '#8B0000',
            textShadow: '0 0 8px rgba(255, 255, 255, 0.8)',
            fontSize: '1.2rem',
            fontWeight: 'bold',
          }}>
            🎭 Équipe Poisson d'Avril 2026
          </Typography>
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Chip label="Préparation des farces..." size="small" sx={{
              mb: 2,
              background: 'linear-gradient(135deg, #DC143C, #4169E1, #FFD700)',
              color: '#FFFFFF',
              fontFamily: '"Montserrat", sans-serif',
              animation: 'pulse-april 2s infinite alternate',
              border: '2px solid #FFD700',
            }} />
            <Skeleton variant="rectangular" width="100%" height={400} sx={{ backgroundColor: 'rgba(220, 20, 60, 0.1)' }} />
          </Box>
        </CardContent>
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: '-50%',
          width: '200%',
          height: '100%',
          background: 'radial-gradient(circle at 50% 50%, rgba(220, 20, 60, 0.1), transparent 70%)',
          animation: 'april-glow 15s linear infinite',
          pointerEvents: 'none',
        }} />
        <style>{`
          @keyframes pulse-april {
            0% { transform: scale(1); box-shadow: 0 0 8px rgba(220, 20, 60, 0.4); }
            100% { transform: scale(1.04); box-shadow: 0 0 20px rgba(65, 105, 225, 0.6); }
          }
          @keyframes april-glow {
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
        backgroundColor: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderRadius: 3,
        border: '3px solid #DC143C',
        boxShadow: '0 4px 16px rgba(220, 20, 60, 0.3)',
      }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="overline" sx={{
              fontFamily: '"Montserrat", sans-serif',
              color: '#8B0000',
              textShadow: '0 0 8px rgba(255, 255, 255, 0.8)',
              fontSize: '1.2rem',
              fontWeight: 'bold',
            }}>
              🎭 Équipe Poisson d'Avril 2026
            </Typography>
            <Tooltip title={isConnected ? "Connecté au cirque" : "Déconnecté"}>
              <Box sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: isConnected ? '#32CD32' : '#c62828',
                animation: isConnected ? 'pulse-glow 2s infinite' : 'none',
              }} />
            </Tooltip>
          </Box>
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="#8B0000" sx={{ fontStyle: 'italic' }}>
              🐟 Aucun farceur disponible...
            </Typography>
          </Box>
        </CardContent>
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: '-50%',
          width: '200%',
          height: '100%',
          background: 'radial-gradient(circle at 50% 50%, rgba(220, 20, 60, 0.1), transparent 70%)',
          animation: 'april-glow 15s linear infinite',
          pointerEvents: 'none',
        }} />
      </Card>
    );
  }

  const sortedEmployees = useMemo(() => [...employees].sort((a, b) => ((b.inbound || 0) + (b.outbound || 0)) - ((a.inbound || 0) + (a.outbound || 0))), [employees]);
  const getMedalEmoji = (rank) => rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : '🐟';

  return (
    <Card sx={{
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: 'rgba(255, 255, 255, 0.75)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      borderRadius: 3,
      border: '3px solid #DC143C',
      boxShadow: '0 4px 16px rgba(220, 20, 60, 0.3)',
    }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="overline" sx={{
            fontFamily: '"Montserrat", sans-serif',
            color: '#8B0000',
            textShadow: '0 0 8px rgba(255, 255, 255, 0.8)',
            fontSize: '1.2rem',
            fontWeight: 'bold',
          }}>
            🐟 Équipe Poisson d'Avril 2026
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title={isConnected ? "Connecté au cirque" : "Déconnecté"}>
              <Box sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: isConnected ? '#32CD32' : '#c62828',
                animation: isConnected ? 'pulse-glow 2s infinite' : 'none',
              }} />
            </Tooltip>
            {lastUpdate && (
              <Typography variant="caption" color="#8B0000" sx={{ fontStyle: 'italic' }}>
                {`MàJ : ${lastUpdate.toLocaleTimeString()}`}
              </Typography>
            )}
          </Box>
        </Box>

        <TableContainer component={Box}>
          <Table size="small" aria-label="tableau des performances des farceurs">
            <TableHead>
              <TableRow>
                {['#', 'Farceur', 'Statut', '🐟 Poissons pris', 'Temps moyen (entrant)', '🐟 Poissons rappelés', 'Temps moyen (sortant)'].map((label, i) => (
                  <TableCell
                    key={i}
                    scope="col"
                    sx={{
                      fontWeight: 'bold',
                      color: '#8B0000',
                      fontFamily: '"Montserrat", sans-serif',
                      fontSize: '0.85rem',
                      borderBottom: '2px solid rgba(220, 20, 60, 0.6)',
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
                        backgroundColor: 'rgba(220, 20, 60, 0.1)',
                        boxShadow: 'inset 0 0 12px rgba(65, 105, 225, 0.25)',
                        transform: 'scale(1.02)',
                      },
                      transition: 'all 0.25s ease-in-out',
                      '&:not(:last-child)': {
                        borderBottom: '1px dashed rgba(220, 20, 60, 0.25)',
                      },
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {medal && (
                          <span
                            style={{
                              fontSize: '18px',
                              filter: 'drop-shadow(0 0 6px rgba(220, 20, 60, 0.5))',
                              animation: 'medal-glow 2.5s infinite alternate',
                            }}
                          >
                            {medal}
                          </span>
                        )}
                        <Typography sx={{ color: '#8B0000', fontWeight: 'bold' }}>{index + 1}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar
                          sx={{
                            bgcolor: '#DC143C',
                            color: '#FFFFFF',
                            width: 28,
                            height: 28,
                            fontSize: 12,
                            mr: 1,
                            border: '2px solid #FFD700',
                            transition: 'all 0.3s',
                            '&:hover': { transform: 'rotate(5deg) scale(1.1)' },
                          }}
                        >
                          {getInitials(emp.name) || '?'}
                        </Avatar>
                        <Typography sx={{ color: '#8B0000', fontWeight: 'bold' }}>{emp.name || '-'}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {statusConfig.icon}
                            {emp.status || 'en ligne'}
                          </Box>
                        }
                        size="small"
                        sx={{
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.1)',
                            boxShadow: '0 0 10px rgba(220, 20, 60, 0.4)',
                          },
                          ...(statusConfig.color === 'success'
                            ? { backgroundColor: '#32CD32', color: '#FFFFFF', border: '2px solid #FFD700' }
                            : statusConfig.color === 'warning'
                            ? { backgroundColor: '#FFD700', color: '#8B0000', border: '2px solid #DC143C' }
                            : { backgroundColor: '#4169E1', color: '#FFFFFF', border: '2px solid #32CD32' }),
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ color: '#8B0000', fontWeight: 500 }}>{emp.inbound != null ? emp.inbound : '-'}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      {emp.avgInboundAHT ? (
                        <Chip
                          label={emp.avgInboundAHT}
                          size="small"
                          sx={{
                            fontWeight: 'bold',
                            minWidth: 60,
                            border: '2px solid #FFD700',
                            ...(inboundCritical
                              ? {
                                  backgroundColor: '#c62828',
                                  color: '#fff',
                                  fontFamily: '"Montserrat", sans-serif',
                                  animation: 'pulse-critical 2s infinite alternate',
                                }
                              : getDurationColor(inboundSec) === 'warning'
                              ? { backgroundColor: '#FFD700', color: '#8B0000' }
                              : { backgroundColor: '#32CD32', color: '#FFFFFF' }),
                          }}
                        />
                      ) : (
                        <Typography sx={{ color: '#8B0000' }}>-</Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ color: '#8B0000', fontWeight: 500 }}>{emp.outbound != null ? emp.outbound : '-'}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      {emp.avgOutboundAHT ? (
                        <Chip
                          label={emp.avgOutboundAHT}
                          size="small"
                          sx={{
                            fontWeight: 'bold',
                            minWidth: 60,
                            border: '2px solid #FFD700',
                            ...(outboundCritical
                              ? {
                                  backgroundColor: '#c62828',
                                  color: '#fff',
                                  fontFamily: '"Montserrat", sans-serif',
                                  animation: 'pulse-critical 2s infinite alternate',
                                }
                              : getDurationColor(outboundSec) === 'warning'
                              ? { backgroundColor: '#FFD700', color: '#8B0000' }
                              : { backgroundColor: '#32CD32', color: '#FFFFFF' }),
                          }}
                        />
                      ) : (
                        <Typography sx={{ color: '#8B0000' }}>-</Typography>
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
          background: 'radial-gradient(circle at 50% 50%, rgba(220, 20, 60, 0.1), transparent 70%)',
          animation: 'april-glow 15s linear infinite',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <style>{`
        @keyframes medal-glow {
          0% { filter: drop-shadow(0 0 4px rgba(220, 20, 60, 0.4)); }
          100% { filter: drop-shadow(0 0 10px rgba(65, 105, 225, 0.6)) drop-shadow(0 0 16px rgba(255, 215, 0, 0.4)); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(220, 20, 60, 0.5); }
          50% { box-shadow: 0 0 0 8px rgba(220, 20, 60, 0); }
        }
        @keyframes pulse-april {
          0% { transform: scale(1); box-shadow: 0 0 8px rgba(220, 20, 60, 0.4); }
          100% { transform: scale(1.04); box-shadow: 0 0 20px rgba(65, 105, 225, 0.6); }
        }
        @keyframes april-glow {
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