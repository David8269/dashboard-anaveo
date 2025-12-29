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
  if (lower === 'available' || lower === 'online') return { color: 'success', icon: '🥂' };
  if (lower === 'unavailable') return { color: 'warning', icon: '⏸️' };
  return { color: 'default', icon: '⭐' };
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
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        borderRadius: 3,
        border: '1px solid rgba(212, 175, 55, 0.7)',
        boxShadow: '0 0 20px rgba(212, 175, 55, 0.5)',
      }}>
        <CardContent>
          <Typography variant="overline" sx={{
            fontFamily: '"Orbitron", sans-serif',
            color: '#d4af37',
            textShadow: '0 0 8px rgba(212, 175, 55, 0.8)',
            fontSize: '1.2rem',
            fontWeight: 'bold',
          }}>
            🥂 Célébration des excellences 2026
          </Typography>
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Chip label="Connexion au gala..." size="small" sx={{
              mb: 2,
              background: 'linear-gradient(135deg, #000, #333)',
              color: '#ffd700',
              fontFamily: '"Great Vibes", cursive',
              animation: 'pulse-gold 2s infinite alternate',
            }} />
            <Skeleton variant="rectangular" width="100%" height={400} sx={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
          </Box>
        </CardContent>
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: '-50%',
          width: '200%',
          height: '100%',
          background: 'radial-gradient(circle at 50% 50%, rgba(212,175,55,0.08), transparent 70%)',
          animation: 'gold-glow 15s linear infinite',
          pointerEvents: 'none',
        }} />
        <style>{`
          @keyframes pulse-gold {
            0% { transform: scale(1); box-shadow: 0 0 8px #ffd700; }
            100% { transform: scale(1.04); box-shadow: 0 0 20px #ffd700; }
          }
          @keyframes gold-glow {
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
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        borderRadius: 3,
        border: '1px solid rgba(212, 175, 55, 0.7)',
        boxShadow: '0 0 20px rgba(212, 175, 55, 0.5)',
      }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="overline" sx={{
              fontFamily: '"Orbitron", sans-serif',
              color: '#d4af37',
              textShadow: '0 0 8px rgba(212, 175, 55, 0.8)',
              fontSize: '1.2rem',
              fontWeight: 'bold',
            }}>
              🥂 Célébration des excellences 2026
            </Typography>
            <Tooltip title={isConnected ? "Connecté au gala" : "Déconnecté"}>
              <Box sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: isConnected ? '#d4af37' : '#8b0000',
                animation: isConnected ? 'pulse-glow 2s infinite' : 'none',
              }} />
            </Tooltip>
          </Box>
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="#ffd700" sx={{ textShadow: '0 0 6px rgba(212,175,55,0.6)' }}>
              🌟 Aucun agent en scène...
            </Typography>
          </Box>
        </CardContent>
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: '-50%',
          width: '200%',
          height: '100%',
          background: 'radial-gradient(circle at 50% 50%, rgba(212,175,55,0.08), transparent 70%)',
          animation: 'gold-glow 15s linear infinite',
          pointerEvents: 'none',
        }} />
      </Card>
    );
  }

  const sortedEmployees = useMemo(() => [...employees].sort((a, b) => ((b.inbound || 0) + (b.outbound || 0)) - ((a.inbound || 0) + (a.outbound || 0))), [employees]);
  const getMedalEmoji = (rank) => rank === 0 ? '🏆' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : null;

  return (
    <Card sx={{
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
      borderRadius: 3,
      border: '1px solid rgba(212, 175, 55, 0.7)',
      boxShadow: '0 0 20px rgba(212, 175, 55, 0.5)',
    }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="overline" sx={{
            fontFamily: '"Orbitron", sans-serif',
            color: '#d4af37',
            textShadow: '0 0 8px rgba(212, 175, 55, 0.8)',
            fontSize: '1.2rem',
            fontWeight: 'bold',
          }}>
            🥂 Célébration des excellences 2026
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title={isConnected ? "Connecté au gala" : "Déconnecté"}>
              <Box sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: isConnected ? '#d4af37' : '#8b0000',
                animation: isConnected ? 'pulse-glow 2s infinite' : 'none',
              }} />
            </Tooltip>
            {lastUpdate && (
              <Typography variant="caption" color="#ffd700" sx={{ textShadow: '0 0 4px rgba(212,175,55,0.5)' }}>
                {`MàJ : ${lastUpdate.toLocaleTimeString()}`}
              </Typography>
            )}
          </Box>
        </Box>

        <TableContainer component={Box}>
          <Table size="small" aria-label="tableau des performances des agents">
            <TableHead>
              <TableRow>
                {['#', 'Agent', 'Statut', 'Appels entrants', 'Durée moy (entrant)', 'Appels sortants', 'Durée moy (sortant)'].map((label, i) => (
                  <TableCell
                    key={i}
                    scope="col"
                    sx={{
                      fontWeight: 'bold',
                      color: '#ffd700',
                      textShadow: '0 0 6px rgba(212,175,55,0.7)',
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
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(212, 175, 55, 0.08)',
                        boxShadow: 'inset 0 0 12px rgba(212, 175, 55, 0.4)',
                        transform: 'scale(1.02)',
                      },
                      transition: 'all 0.25s ease-in-out',
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {medal && (
                          <span
                            style={{
                              fontSize: '18px',
                              filter: 'drop-shadow(0 0 8px gold)',
                              animation: 'medal-glow 2.5s infinite alternate',
                            }}
                          >
                            {medal}
                          </span>
                        )}
                        <Typography sx={{ color: '#fff', fontWeight: 'bold' }}>{index + 1}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar
                          sx={{
                            bgcolor: '#d4af37',
                            color: '#000',
                            width: 28,
                            height: 28,
                            fontSize: 12,
                            mr: 1,
                            border: '1px solid #ffd700',
                            transition: 'all 0.3s',
                            '&:hover': { transform: 'rotate(5deg) scale(1.1)' },
                          }}
                        >
                          {getInitials(emp.name) || '?'}
                        </Avatar>
                        <Typography sx={{ color: '#fff', fontWeight: 'bold' }}>{emp.name || '-'}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {statusConfig.icon}
                            {emp.status || 'actif'}
                          </Box>
                        }
                        size="small"
                        sx={{
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.1)',
                            boxShadow: '0 0 12px #ffd700',
                          },
                          ...(statusConfig.color === 'success'
                            ? { backgroundColor: '#228b22', color: '#fff' }
                            : statusConfig.color === 'warning'
                            ? { backgroundColor: '#ffaa00', color: '#000' }
                            : { backgroundColor: '#616161', color: '#fff' }),
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ color: '#fff' }}>{emp.inbound != null ? emp.inbound : '-'}</Typography>
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
                            transition: 'all 0.3s',
                            ...(inboundCritical
                              ? {
                                  backgroundColor: '#8b0000',
                                  fontFamily: '"Great Vibes", cursive',
                                  animation: 'pulse-gold 2s infinite alternate',
                                }
                              : getDurationColor(inboundSec) === 'warning'
                              ? { backgroundColor: '#ffaa00', color: '#000' }
                              : { backgroundColor: '#228b22' }),
                          }}
                        />
                      ) : (
                        <Typography sx={{ color: '#fff' }}>-</Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ color: '#fff' }}>{emp.outbound != null ? emp.outbound : '-'}</Typography>
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
                            transition: 'all 0.3s',
                            ...(outboundCritical
                              ? {
                                  backgroundColor: '#8b0000',
                                  fontFamily: '"Great Vibes", cursive',
                                  animation: 'pulse-gold 2s infinite alternate',
                                }
                              : getDurationColor(outboundSec) === 'warning'
                              ? { backgroundColor: '#ffaa00', color: '#000' }
                              : { backgroundColor: '#228b22' }),
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
      </CardContent>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: '-50%',
          width: '200%',
          height: '100%',
          background: 'radial-gradient(circle at 50% 50%, rgba(212,175,55,0.08), transparent 70%)',
          animation: 'gold-glow 15s linear infinite',
          pointerEvents: 'none',
        }}
      />
      <style>{`
        @keyframes medal-glow {
          0% { filter: drop-shadow(0 0 6px gold); }
          100% { filter: drop-shadow(0 0 12px gold) drop-shadow(0 0 20px #ffd700); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.7); }
          50% { box-shadow: 0 0 0 8px rgba(212, 175, 55, 0); }
        }
        @keyframes pulse-gold {
          0% { transform: scale(1); box-shadow: 0 0 8px #ffd700; }
          100% { transform: scale(1.04); box-shadow: 0 0 20px #ffd700; }
        }
        @keyframes gold-glow {
          0% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(-6%) translateY(-3%); }
          100% { transform: translateX(0) translateY(0); }
        }
      `}</style>
    </Card>
  );
}