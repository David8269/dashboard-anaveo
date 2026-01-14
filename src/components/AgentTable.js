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
<<<<<<< HEAD
  if (lower === 'available' || lower === 'online') return { color: 'success', icon: '⛷️' };
  if (lower === 'unavailable') return { color: 'warning', icon: '⏸️' };
  return { color: 'default', icon: '❄️' };
=======
  if (lower === 'available' || lower === 'online') return { color: 'success', icon: '🥂' };
  if (lower === 'unavailable') return { color: 'warning', icon: '⏸️' };
  return { color: 'default', icon: '⭐' };
>>>>>>> 861fb5a0d3729959038e5eb57b4a15dfa2298129
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
<<<<<<< HEAD
        border: '1px solid rgba(0, 168, 232, 0.7)',
        boxShadow: '0 0 20px rgba(0, 168, 232, 0.5)',
=======
        border: '1px solid rgba(212, 175, 55, 0.7)',
        boxShadow: '0 0 20px rgba(212, 175, 55, 0.5)',
>>>>>>> 861fb5a0d3729959038e5eb57b4a15dfa2298129
      }}>
        <CardContent>
          <Typography variant="overline" sx={{
            fontFamily: '"Orbitron", sans-serif',
<<<<<<< HEAD
            color: '#00a8e8',
            textShadow: '0 0 8px rgba(0, 168, 232, 0.8)',
            fontSize: '1.2rem',
            fontWeight: 'bold',
          }}>
            🏂 Championnat des pistes 2026
          </Typography>
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Chip label="Connexion à la station..." size="small" sx={{
              mb: 2,
              background: 'linear-gradient(135deg, #000, #1a365d)',
              color: '#00bfff',
              fontFamily: '"Montserrat", sans-serif',
              animation: 'pulse-blue 2s infinite alternate',
=======
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
>>>>>>> 861fb5a0d3729959038e5eb57b4a15dfa2298129
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
<<<<<<< HEAD
          background: 'radial-gradient(circle at 50% 50%, rgba(0,168,232,0.08), transparent 70%)',
          animation: 'blue-glow 15s linear infinite',
          pointerEvents: 'none',
        }} />
        <style>{`
          @keyframes pulse-blue {
            0% { transform: scale(1); box-shadow: 0 0 8px #00bfff; }
            100% { transform: scale(1.04); box-shadow: 0 0 20px #00bfff; }
          }
          @keyframes blue-glow {
=======
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
>>>>>>> 861fb5a0d3729959038e5eb57b4a15dfa2298129
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
<<<<<<< HEAD
        border: '1px solid rgba(0, 168, 232, 0.7)',
        boxShadow: '0 0 20px rgba(0, 168, 232, 0.5)',
=======
        border: '1px solid rgba(212, 175, 55, 0.7)',
        boxShadow: '0 0 20px rgba(212, 175, 55, 0.5)',
>>>>>>> 861fb5a0d3729959038e5eb57b4a15dfa2298129
      }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="overline" sx={{
              fontFamily: '"Orbitron", sans-serif',
<<<<<<< HEAD
              color: '#00a8e8',
              textShadow: '0 0 8px rgba(0, 168, 232, 0.8)',
              fontSize: '1.2rem',
              fontWeight: 'bold',
            }}>
              🏂 Championnat des pistes 2026
            </Typography>
            <Tooltip title={isConnected ? "Connecté à la station" : "Déconnecté"}>
=======
              color: '#d4af37',
              textShadow: '0 0 8px rgba(212, 175, 55, 0.8)',
              fontSize: '1.2rem',
              fontWeight: 'bold',
            }}>
              🥂 Célébration des excellences 2026
            </Typography>
            <Tooltip title={isConnected ? "Connecté au gala" : "Déconnecté"}>
>>>>>>> 861fb5a0d3729959038e5eb57b4a15dfa2298129
              <Box sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
<<<<<<< HEAD
                bgcolor: isConnected ? '#00a8e8' : '#8b0000',
=======
                bgcolor: isConnected ? '#d4af37' : '#8b0000',
>>>>>>> 861fb5a0d3729959038e5eb57b4a15dfa2298129
                animation: isConnected ? 'pulse-glow 2s infinite' : 'none',
              }} />
            </Tooltip>
          </Box>
          <Box sx={{ py: 4, textAlign: 'center' }}>
<<<<<<< HEAD
            <Typography variant="body2" color="#00bfff" sx={{ textShadow: '0 0 6px rgba(0,168,232,0.6)' }}>
              🌟 Aucun skieur sur les pistes...
=======
            <Typography variant="body2" color="#ffd700" sx={{ textShadow: '0 0 6px rgba(212,175,55,0.6)' }}>
              🌟 Aucun agent en scène...
>>>>>>> 861fb5a0d3729959038e5eb57b4a15dfa2298129
            </Typography>
          </Box>
        </CardContent>
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: '-50%',
          width: '200%',
          height: '100%',
<<<<<<< HEAD
          background: 'radial-gradient(circle at 50% 50%, rgba(0,168,232,0.08), transparent 70%)',
          animation: 'blue-glow 15s linear infinite',
=======
          background: 'radial-gradient(circle at 50% 50%, rgba(212,175,55,0.08), transparent 70%)',
          animation: 'gold-glow 15s linear infinite',
>>>>>>> 861fb5a0d3729959038e5eb57b4a15dfa2298129
          pointerEvents: 'none',
        }} />
      </Card>
    );
  }

  const sortedEmployees = useMemo(() => [...employees].sort((a, b) => ((b.inbound || 0) + (b.outbound || 0)) - ((a.inbound || 0) + (a.outbound || 0))), [employees]);
<<<<<<< HEAD
  const getMedalEmoji = (rank) => rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : '⛷️';
=======
  const getMedalEmoji = (rank) => rank === 0 ? '🏆' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : null;
>>>>>>> 861fb5a0d3729959038e5eb57b4a15dfa2298129

  return (
    <Card sx={{
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
      borderRadius: 3,
<<<<<<< HEAD
      border: '1px solid rgba(0, 168, 232, 0.7)',
      boxShadow: '0 0 20px rgba(0, 168, 232, 0.5)',
=======
      border: '1px solid rgba(212, 175, 55, 0.7)',
      boxShadow: '0 0 20px rgba(212, 175, 55, 0.5)',
>>>>>>> 861fb5a0d3729959038e5eb57b4a15dfa2298129
    }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="overline" sx={{
            fontFamily: '"Orbitron", sans-serif',
<<<<<<< HEAD
            color: '#00a8e8',
            textShadow: '0 0 8px rgba(0, 168, 232, 0.8)',
            fontSize: '1.2rem',
            fontWeight: 'bold',
          }}>
            🏂 Championnat des pistes 2026
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title={isConnected ? "Connecté à la station" : "Déconnecté"}>
=======
            color: '#d4af37',
            textShadow: '0 0 8px rgba(212, 175, 55, 0.8)',
            fontSize: '1.2rem',
            fontWeight: 'bold',
          }}>
            🥂 Célébration des excellences 2026
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title={isConnected ? "Connecté au gala" : "Déconnecté"}>
>>>>>>> 861fb5a0d3729959038e5eb57b4a15dfa2298129
              <Box sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
<<<<<<< HEAD
                bgcolor: isConnected ? '#00a8e8' : '#8b0000',
=======
                bgcolor: isConnected ? '#d4af37' : '#8b0000',
>>>>>>> 861fb5a0d3729959038e5eb57b4a15dfa2298129
                animation: isConnected ? 'pulse-glow 2s infinite' : 'none',
              }} />
            </Tooltip>
            {lastUpdate && (
<<<<<<< HEAD
              <Typography variant="caption" color="#00bfff" sx={{ textShadow: '0 0 4px rgba(0,168,232,0.5)' }}>
=======
              <Typography variant="caption" color="#ffd700" sx={{ textShadow: '0 0 4px rgba(212,175,55,0.5)' }}>
>>>>>>> 861fb5a0d3729959038e5eb57b4a15dfa2298129
                {`MàJ : ${lastUpdate.toLocaleTimeString()}`}
              </Typography>
            )}
          </Box>
        </Box>

        <TableContainer component={Box}>
          <Table size="small" aria-label="tableau des performances des skieurs">
            <TableHead>
              <TableRow>
<<<<<<< HEAD
                {['#', 'Skieur', 'Statut', 'Descente réussie', 'Temps moyen (descente)', 'Remontée', 'Temps moyen (remontée)'].map((label, i) => (
=======
                {['#', 'Agent', 'Statut', 'Appels entrants', 'Durée moy (entrant)', 'Appels sortants', 'Durée moy (sortant)'].map((label, i) => (
>>>>>>> 861fb5a0d3729959038e5eb57b4a15dfa2298129
                  <TableCell
                    key={i}
                    scope="col"
                    sx={{
                      fontWeight: 'bold',
<<<<<<< HEAD
                      color: '#00bfff',
                      textShadow: '0 0 6px rgba(0,168,232,0.7)',
=======
                      color: '#ffd700',
                      textShadow: '0 0 6px rgba(212,175,55,0.7)',
>>>>>>> 861fb5a0d3729959038e5eb57b4a15dfa2298129
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
<<<<<<< HEAD
                        backgroundColor: 'rgba(0, 168, 232, 0.08)',
                        boxShadow: 'inset 0 0 12px rgba(0, 168, 232, 0.4)',
=======
                        backgroundColor: 'rgba(212, 175, 55, 0.08)',
                        boxShadow: 'inset 0 0 12px rgba(212, 175, 55, 0.4)',
>>>>>>> 861fb5a0d3729959038e5eb57b4a15dfa2298129
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
<<<<<<< HEAD
                              filter: 'drop-shadow(0 0 8px #00bfff)',
=======
                              filter: 'drop-shadow(0 0 8px gold)',
>>>>>>> 861fb5a0d3729959038e5eb57b4a15dfa2298129
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
<<<<<<< HEAD
                            bgcolor: '#00a8e8',
                            color: '#fff',
=======
                            bgcolor: '#d4af37',
                            color: '#000',
>>>>>>> 861fb5a0d3729959038e5eb57b4a15dfa2298129
                            width: 28,
                            height: 28,
                            fontSize: 12,
                            mr: 1,
<<<<<<< HEAD
                            border: '1px solid #00bfff',
=======
                            border: '1px solid #ffd700',
>>>>>>> 861fb5a0d3729959038e5eb57b4a15dfa2298129
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
<<<<<<< HEAD
                            {emp.status || 'sur piste'}
=======
                            {emp.status || 'actif'}
>>>>>>> 861fb5a0d3729959038e5eb57b4a15dfa2298129
                          </Box>
                        }
                        size="small"
                        sx={{
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.1)',
<<<<<<< HEAD
                            boxShadow: '0 0 12px #00bfff',
=======
                            boxShadow: '0 0 12px #ffd700',
>>>>>>> 861fb5a0d3729959038e5eb57b4a15dfa2298129
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
<<<<<<< HEAD
                                  fontFamily: '"Montserrat", sans-serif',
                                  animation: 'pulse-blue 2s infinite alternate',
=======
                                  fontFamily: '"Great Vibes", cursive',
                                  animation: 'pulse-gold 2s infinite alternate',
>>>>>>> 861fb5a0d3729959038e5eb57b4a15dfa2298129
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
<<<<<<< HEAD
                                  fontFamily: '"Montserrat", sans-serif',
                                  animation: 'pulse-blue 2s infinite alternate',
=======
                                  fontFamily: '"Great Vibes", cursive',
                                  animation: 'pulse-gold 2s infinite alternate',
>>>>>>> 861fb5a0d3729959038e5eb57b4a15dfa2298129
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
<<<<<<< HEAD
          background: 'radial-gradient(circle at 50% 50%, rgba(0,168,232,0.08), transparent 70%)',
          animation: 'blue-glow 15s linear infinite',
=======
          background: 'radial-gradient(circle at 50% 50%, rgba(212,175,55,0.08), transparent 70%)',
          animation: 'gold-glow 15s linear infinite',
>>>>>>> 861fb5a0d3729959038e5eb57b4a15dfa2298129
          pointerEvents: 'none',
        }}
      />
      <style>{`
        @keyframes medal-glow {
          0% { filter: drop-shadow(0 0 6px #00bfff); }
          100% { filter: drop-shadow(0 0 12px #00bfff) drop-shadow(0 0 20px rgba(0,191,255,0.8)); }
        }
        @keyframes pulse-glow {
<<<<<<< HEAD
          0%, 100% { box-shadow: 0 0 0 0 rgba(0, 168, 232, 0.7); }
          50% { box-shadow: 0 0 0 8px rgba(0, 168, 232, 0); }
        }
        @keyframes pulse-blue {
          0% { transform: scale(1); box-shadow: 0 0 8px #00bfff; }
          100% { transform: scale(1.04); box-shadow: 0 0 20px #00bfff; }
        }
        @keyframes blue-glow {
=======
          0%, 100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.7); }
          50% { box-shadow: 0 0 0 8px rgba(212, 175, 55, 0); }
        }
        @keyframes pulse-gold {
          0% { transform: scale(1); box-shadow: 0 0 8px #ffd700; }
          100% { transform: scale(1.04); box-shadow: 0 0 20px #ffd700; }
        }
        @keyframes gold-glow {
>>>>>>> 861fb5a0d3729959038e5eb57b4a15dfa2298129
          0% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(-6%) translateY(-3%); }
          100% { transform: translateX(0) translateY(0); }
        }
      `}</style>
    </Card>
  );
}