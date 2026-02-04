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
  if (lower === 'available' || lower === 'online') return { color: 'success', icon: '🎭' };
  if (lower === 'unavailable') return { color: 'warning', icon: '🎪' };
  return { color: 'default', icon: '🎪' };
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
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        borderRadius: 3,
        border: '2px solid transparent',
        backgroundClip: 'padding-box',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: '12px',
          padding: '2px',
          background: 'linear-gradient(135deg, #FF1493, #FF4500, #FFD700, #32CD32, #1E90FF)',
          backgroundSize: '400% 400%',
          animation: 'gradient-border-loading 8s ease infinite',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          zIndex: -1,
        },
      }}>
        <CardContent>
          <Typography variant="overline" sx={{
            fontFamily: '"Montserrat", sans-serif',
            background: 'linear-gradient(135deg, #FF1493, #FF4500, #FFD700, #32CD32, #1E90FF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundSize: '400% 400%',
            animation: 'color-shift-carnival 6s ease infinite',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            textShadow: '0 0 12px rgba(255, 255, 255, 0.6)',
          }}>
            🎭 Artistes du Carnaval 2026
          </Typography>
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Chip label="Préparation du spectacle..." size="small" sx={{
              mb: 2,
              background: 'linear-gradient(135deg, #FF1493, #FF4500, #FFD700, #32CD32, #1E90FF)',
              color: '#ffffff',
              fontFamily: '"Montserrat", sans-serif',
              animation: 'pulse-carnival 2s infinite alternate',
              border: '2px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 0 15px rgba(255, 20, 147, 0.6), 0 0 25px rgba(255, 69, 0, 0.4)',
            }} />
            <Skeleton variant="rectangular" width="100%" height={400} sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
          </Box>
        </CardContent>
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: '-50%',
          width: '200%',
          height: '100%',
          background: 'radial-gradient(circle at 50% 50%, rgba(255, 20, 147, 0.15), transparent 70%)',
          animation: 'carnival-glow 12s linear infinite',
          pointerEvents: 'none',
        }} />
        <style>{`
          @keyframes pulse-carnival {
            0% { transform: scale(1); box-shadow: 0 0 10px rgba(255, 20, 147, 0.6), 0 0 20px rgba(255, 69, 0, 0.4); }
            100% { transform: scale(1.04); box-shadow: 0 0 20px rgba(255, 20, 147, 0.9), 0 0 30px rgba(255, 69, 0, 0.7), 0 0 40px rgba(255, 215, 0, 0.5); }
          }
          @keyframes carnival-glow {
            0% { transform: translateX(0) translateY(0); }
            50% { transform: translateX(-6%) translateY(-3%); }
            100% { transform: translateX(0) translateY(0); }
          }
          @keyframes color-shift-carnival {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          @keyframes gradient-border-loading {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
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
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        borderRadius: 3,
        border: '2px solid transparent',
        backgroundClip: 'padding-box',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: '12px',
          padding: '2px',
          background: 'linear-gradient(135deg, #FF1493, #FF4500, #FFD700, #32CD32, #1E90FF)',
          backgroundSize: '400% 400%',
          animation: 'gradient-border-empty 8s ease infinite',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          zIndex: -1,
        },
      }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="overline" sx={{
              fontFamily: '"Montserrat", sans-serif',
              background: 'linear-gradient(135deg, #FF1493, #FF4500, #FFD700, #32CD32, #1E90FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundSize: '400% 400%',
              animation: 'color-shift-carnival 6s ease infinite',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              textShadow: '0 0 12px rgba(255, 255, 255, 0.6)',
            }}>
              🎭 Artistes du Carnaval 2026
            </Typography>
            <Tooltip title={isConnected ? "Connecté au carnaval" : "Déconnecté"}>
              <Box sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: isConnected ? '#FF1493' : '#c62828',
                animation: isConnected ? 'pulse-glow-carnival 2s infinite' : 'none',
                boxShadow: isConnected ? '0 0 10px rgba(255, 20, 147, 0.8)' : 'none',
              }} />
            </Tooltip>
          </Box>
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ 
              color: '#FFFFFF',
              fontStyle: 'italic',
              fontWeight: 'bold',
              textShadow: '0 0 8px rgba(0, 0, 0, 0.7)',
            }}>
              🌟 Aucun artiste sur scène...
            </Typography>
          </Box>
        </CardContent>
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: '-50%',
          width: '200%',
          height: '100%',
          background: 'radial-gradient(circle at 50% 50%, rgba(255, 20, 147, 0.15), transparent 70%)',
          animation: 'carnival-glow 12s linear infinite',
          pointerEvents: 'none',
        }} />
      </Card>
    );
  }

  const sortedEmployees = useMemo(() => [...employees].sort((a, b) => ((b.inbound || 0) + (b.outbound || 0)) - ((a.inbound || 0) + (a.outbound || 0))), [employees]);
  const getMedalEmoji = (rank) => rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : '🎪';

  return (
    <Card sx={{
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)',
      borderRadius: 3,
      border: '2px solid transparent',
      backgroundClip: 'padding-box',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: '12px',
        padding: '2px',
        background: 'linear-gradient(135deg, #FF1493, #FF4500, #FFD700, #32CD32, #1E90FF)',
        backgroundSize: '400% 400%',
        animation: 'gradient-border-table 8s ease infinite',
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
        zIndex: -1,
      },
    }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="overline" sx={{
            fontFamily: '"Montserrat", sans-serif',
            background: 'linear-gradient(135deg, #FF1493, #FF4500, #FFD700, #32CD32, #1E90FF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundSize: '400% 400%',
            animation: 'color-shift-carnival 6s ease infinite',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            textShadow: '0 0 12px rgba(255, 255, 255, 0.6)',
          }}>
            🎭 Artistes du Carnaval 2026
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title={isConnected ? "Connecté au carnaval" : "Déconnecté"}>
              <Box sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: isConnected ? '#FF1493' : '#c62828',
                animation: isConnected ? 'pulse-glow-carnival 2s infinite' : 'none',
                boxShadow: isConnected ? '0 0 10px rgba(255, 20, 147, 0.8)' : 'none',
              }} />
            </Tooltip>
            {lastUpdate && (
              <Typography variant="caption" sx={{ 
                color: '#FFFFFF',
                fontStyle: 'italic',
                fontWeight: 'bold',
                textShadow: '0 0 6px rgba(0, 0, 0, 0.7)',
              }}>
                {`MàJ : ${lastUpdate.toLocaleTimeString()}`}
              </Typography>
            )}
          </Box>
        </Box>

        <TableContainer component={Box}>
          <Table size="small" aria-label="tableau des performances des artistes du carnaval">
            <TableHead>
              <TableRow>
                {['#', 'Artiste', 'Statut', 'Appels entrants', 'Temps moyen (entrant)', 'Appels sortants', 'Temps moyen (sortant)'].map((label, i) => (
                  <TableCell
                    key={i}
                    scope="col"
                    sx={{
                      fontWeight: 'bold',
                      background: 'linear-gradient(135deg, #FF1493, #FF4500, #FFD700, #32CD32, #1E90FF)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundSize: '400% 400%',
                      animation: 'color-shift-carnival 8s ease infinite',
                      fontFamily: '"Montserrat", sans-serif',
                      fontSize: '0.85rem',
                      borderBottom: '2px solid rgba(255, 255, 255, 0.5)',
                      textShadow: '0 0 8px rgba(0, 0, 0, 0.7)',
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
                        backgroundColor: 'rgba(255, 20, 147, 0.1)',
                        boxShadow: 'inset 0 0 15px rgba(255, 20, 147, 0.4)',
                        transform: 'scale(1.02)',
                      },
                      transition: 'all 0.25s ease-in-out',
                      '&:not(:last-child)': {
                        borderBottom: '1px dashed rgba(255, 255, 255, 0.3)',
                      },
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {medal && (
                          <span
                            style={{
                              fontSize: '18px',
                              filter: 'drop-shadow(0 0 6px rgba(255, 20, 147, 0.7)) drop-shadow(0 0 12px rgba(255, 215, 0, 0.6))',
                              animation: 'medal-glow-carnival 2.5s infinite alternate',
                            }}
                          >
                            {medal}
                          </span>
                        )}
                        <Typography sx={{ 
                          color: '#FFFFFF',
                          fontWeight: 'bold',
                          textShadow: '0 0 6px rgba(0, 0, 0, 0.7)',
                        }}>{index + 1}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar
                          sx={{
                            background: 'linear-gradient(135deg, #FF1493, #FF4500, #FFD700)',
                            color: '#fff',
                            width: 28,
                            height: 28,
                            fontSize: 12,
                            mr: 1,
                            border: '2px solid rgba(255, 255, 255, 0.6)',
                            boxShadow: '0 0 10px rgba(255, 20, 147, 0.5)',
                            transition: 'all 0.3s',
                            '&:hover': { 
                              transform: 'rotate(10deg) scale(1.2)',
                              boxShadow: '0 0 15px rgba(255, 20, 147, 0.8), 0 0 25px rgba(255, 215, 0, 0.7)',
                            },
                          }}
                        >
                          {getInitials(emp.name) || '?'}
                        </Avatar>
                        <Typography sx={{ 
                          color: '#FFFFFF',
                          fontWeight: 'bold',
                          textShadow: '0 0 6px rgba(0, 0, 0, 0.7)',
                        }}>{emp.name || '-'}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {statusConfig.icon}
                            {emp.status || 'en représentation'}
                          </Box>
                        }
                        size="small"
                        sx={{
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.15)',
                            boxShadow: '0 0 15px rgba(255, 20, 147, 0.7), 0 0 25px rgba(255, 215, 0, 0.6)',
                          },
                          ...(statusConfig.color === 'success'
                            ? { 
                                background: 'linear-gradient(135deg, #4CAF50, #43A047)',
                                color: '#ffffff',
                                border: '2px solid rgba(255, 255, 255, 0.6)',
                                boxShadow: '0 0 10px rgba(76, 175, 80, 0.5)',
                              }
                            : statusConfig.color === 'warning'
                            ? { 
                                background: 'linear-gradient(135deg, #FFC107, #FFB300)',
                                color: '#fff',
                                border: '2px solid rgba(255, 255, 255, 0.6)',
                                boxShadow: '0 0 10px rgba(255, 193, 7, 0.5)',
                              }
                            : { 
                                background: 'linear-gradient(135deg, #9370DB, #8A2BE2)',
                                color: '#ffffff',
                                border: '2px solid rgba(255, 255, 255, 0.6)',
                                boxShadow: '0 0 10px rgba(147, 112, 219, 0.5)',
                              }),
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ 
                        color: '#FFFFFF',
                        fontWeight: 500,
                        textShadow: '0 0 6px rgba(0, 0, 0, 0.7)',
                      }}>{emp.inbound != null ? emp.inbound : '-'}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      {emp.avgInboundAHT ? (
                        <Chip
                          label={emp.avgInboundAHT}
                          size="small"
                          sx={{
                            fontWeight: 'bold',
                            minWidth: 60,
                            border: '2px solid rgba(255, 255, 255, 0.5)',
                            boxShadow: '0 0 10px rgba(255, 20, 147, 0.4)',
                            ...(inboundCritical
                              ? {
                                  background: 'linear-gradient(135deg, #c62828, #b71c1c)',
                                  color: '#ffffff',
                                  fontFamily: '"Montserrat", sans-serif',
                                  animation: 'pulse-critical-carnival 2s infinite alternate',
                                  border: '2px solid rgba(255, 255, 255, 0.7)',
                                }
                              : getDurationColor(inboundSec) === 'warning'
                              ? { 
                                  background: 'linear-gradient(135deg, #FFC107, #FFB300)',
                                  color: '#fff',
                                  border: '2px solid rgba(255, 255, 255, 0.6)',
                                }
                              : { 
                                  background: 'linear-gradient(135deg, #4CAF50, #43A047)',
                                  color: '#ffffff',
                                  border: '2px solid rgba(255, 255, 255, 0.6)',
                                }),
                          }}
                        />
                      ) : (
                        <Typography sx={{ 
                          color: '#FFFFFF',
                          textShadow: '0 0 6px rgba(0, 0, 0, 0.7)',
                        }}>-</Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ 
                        color: '#FFFFFF',
                        fontWeight: 500,
                        textShadow: '0 0 6px rgba(0, 0, 0, 0.7)',
                      }}>{emp.outbound != null ? emp.outbound : '-'}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      {emp.avgOutboundAHT ? (
                        <Chip
                          label={emp.avgOutboundAHT}
                          size="small"
                          sx={{
                            fontWeight: 'bold',
                            minWidth: 60,
                            border: '2px solid rgba(255, 255, 255, 0.5)',
                            boxShadow: '0 0 10px rgba(255, 20, 147, 0.4)',
                            ...(outboundCritical
                              ? {
                                  background: 'linear-gradient(135deg, #c62828, #b71c1c)',
                                  color: '#ffffff',
                                  fontFamily: '"Montserrat", sans-serif',
                                  animation: 'pulse-critical-carnival 2s infinite alternate',
                                  border: '2px solid rgba(255, 255, 255, 0.7)',
                                }
                              : getDurationColor(outboundSec) === 'warning'
                              ? { 
                                  background: 'linear-gradient(135deg, #FFC107, #FFB300)',
                                  color: '#fff',
                                  border: '2px solid rgba(255, 255, 255, 0.6)',
                                }
                              : { 
                                  background: 'linear-gradient(135deg, #4CAF50, #43A047)',
                                  color: '#ffffff',
                                  border: '2px solid rgba(255, 255, 255, 0.6)',
                                }),
                          }}
                        />
                      ) : (
                        <Typography sx={{ 
                          color: '#FFFFFF',
                          textShadow: '0 0 6px rgba(0, 0, 0, 0.7)',
                        }}>-</Typography>
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
          background: 'radial-gradient(circle at 50% 50%, rgba(255, 20, 147, 0.15), transparent 70%)',
          animation: 'carnival-glow 12s linear infinite',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <style>{`
        @keyframes medal-glow-carnival {
          0% { filter: drop-shadow(0 0 4px rgba(255, 20, 147, 0.6)) drop-shadow(0 0 8px rgba(255, 215, 0, 0.5)); }
          100% { filter: drop-shadow(0 0 12px rgba(255, 20, 147, 0.9)) drop-shadow(0 0 20px rgba(255, 215, 0, 0.8)); }
        }
        @keyframes pulse-glow-carnival {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255, 20, 147, 0.7); }
          50% { box-shadow: 0 0 0 10px rgba(255, 20, 147, 0); }
        }
        @keyframes pulse-carnival {
          0% { transform: scale(1); box-shadow: 0 0 10px rgba(255, 20, 147, 0.6), 0 0 20px rgba(255, 69, 0, 0.4); }
          100% { transform: scale(1.04); box-shadow: 0 0 20px rgba(255, 20, 147, 0.9), 0 0 30px rgba(255, 69, 0, 0.7), 0 0 40px rgba(255, 215, 0, 0.5); }
        }
        @keyframes carnival-glow {
          0% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(-6%) translateY(-3%); }
          100% { transform: translateX(0) translateY(0); }
        }
        @keyframes pulse-critical-carnival {
          0% { transform: scale(1); box-shadow: 0 0 10px #ff5252, 0 0 15px #ff1744; }
          100% { transform: scale(1.05); box-shadow: 0 0 15px #ff1744, 0 0 25px #d32f2f; }
        }
        @keyframes color-shift-carnival {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes gradient-border-table {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes gradient-border-empty {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </Card>
  );
}