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
  if (lower === 'available' || lower === 'online') return { color: 'success', icon: '❤️' };
  if (lower === 'unavailable') return { color: 'warning', icon: '💔' };
  return { color: 'default', icon: '💘' };
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
        backgroundColor: 'rgba(25, 25, 45, 0.7)',
        borderRadius: 3,
        border: '1px solid rgba(231, 76, 60, 0.4)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
      }}>
        <CardContent>
          <Typography variant="overline" sx={{
            fontFamily: '"Playfair Display", serif',
            color: '#ffffff',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            letterSpacing: '0.05em',
          }}>
            ❤️ Ambassadeurs de l'Amour
          </Typography>
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Chip label="Préparation avec amour..." size="small" sx={{
              mb: 2,
              background: 'linear-gradient(135deg, #8B0000, #e74c3c)',
              color: '#ffffff',
              fontFamily: '"Playfair Display", serif',
              animation: 'heartbeat 1.8s ease-in-out infinite',
              border: '1px solid rgba(231, 76, 60, 0.4)',
            }} />
            <Skeleton variant="rectangular" width="100%" height={400} sx={{ backgroundColor: 'rgba(50, 50, 70, 0.3)' }} />
          </Box>
        </CardContent>
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: '-50%',
          width: '200%',
          height: '100%',
          background: 'radial-gradient(circle at 50% 50%, rgba(231, 76, 60, 0.08), transparent 70%)',
          animation: 'heart-glow 15s linear infinite',
          pointerEvents: 'none',
        }} />
        <style>{`
          @keyframes heartbeat {
            0%, 100% { transform: scale(1); }
            14%, 28% { transform: scale(1.08); }
            42%, 56% { transform: scale(1); }
            70% { transform: scale(1.12); }
          }
          @keyframes heart-glow {
            0% { transform: translateX(0) translateY(0); opacity: 0.8; }
            50% { transform: translateX(-4%) translateY(-2%); opacity: 1; }
            100% { transform: translateX(0) translateY(0); opacity: 0.8; }
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
        backgroundColor: 'rgba(25, 25, 45, 0.7)',
        borderRadius: 3,
        border: '1px solid rgba(231, 76, 60, 0.4)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
      }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="overline" sx={{
              fontFamily: '"Playfair Display", serif',
              color: '#ffffff',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              letterSpacing: '0.05em',
            }}>
              ❤️ Ambassadeurs de l'Amour
            </Typography>
            <Tooltip title={isConnected ? "Connecté au Cœur du CDS" : "Déconnecté"}>
              <Box sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: isConnected ? '#e74c3c' : '#c0392b',
                animation: isConnected ? 'pulse-heart 2s infinite' : 'none',
              }} />
            </Tooltip>
          </Box>
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="#ffffff" sx={{ fontStyle: 'italic' }}>
              💔 Aucun ambassadeur disponible...
            </Typography>
          </Box>
        </CardContent>
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: '-50%',
          width: '200%',
          height: '100%',
          background: 'radial-gradient(circle at 50% 50%, rgba(231, 76, 60, 0.08), transparent 70%)',
          animation: 'heart-glow 15s linear infinite',
          pointerEvents: 'none',
        }} />
      </Card>
    );
  }

  const sortedEmployees = useMemo(() => [...employees].sort((a, b) => ((b.inbound || 0) + (b.outbound || 0)) - ((a.inbound || 0) + (a.outbound || 0))), [employees]);
  const getMedalEmoji = (rank) => rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : '💕';

  return (
    <Card sx={{
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: 'rgba(25, 25, 45, 0.7)',
      borderRadius: 3,
      border: '1px solid rgba(231, 76, 60, 0.4)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
    }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="overline" sx={{
            fontFamily: '"Playfair Display", serif',
            color: '#ffffff',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            letterSpacing: '0.05em',
          }}>
            ❤️ Ambassadeurs de l'Amour
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title={isConnected ? "Connecté au Cœur du CDS" : "Déconnecté"}>
              <Box sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: isConnected ? '#e74c3c' : '#c0392b',
                animation: isConnected ? 'pulse-heart 2s infinite' : 'none',
              }} />
            </Tooltip>
            {lastUpdate && (
              <Typography variant="caption" color="#ffffff" sx={{ fontStyle: 'italic' }}>
                {`MàJ : ${lastUpdate.toLocaleTimeString()}`}
              </Typography>
            )}
          </Box>
        </Box>

        <TableContainer component={Box}>
          <Table size="small" aria-label="tableau des performances des ambassadeurs">
            <TableHead>
              <TableRow>
                {['#', 'Ambassadeur', 'Statut', 'Cœurs conquis', 'Temps moyen (réponse)', 'Cœurs partagés', 'Temps moyen (partage)'].map((label, i) => (
                  <TableCell
                    key={i}
                    scope="col"
                    sx={{
                      fontWeight: 'bold',
                      color: '#ffffff',
                      fontFamily: '"Playfair Display", serif',
                      fontSize: '0.85rem',
                      borderBottom: '2px solid rgba(231, 76, 60, 0.4)',
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
                        backgroundColor: 'rgba(231, 76, 60, 0.1)',
                        boxShadow: 'inset 0 0 12px rgba(255, 107, 107, 0.3)',
                        transform: 'scale(1.02)',
                      },
                      transition: 'all 0.25s ease-in-out',
                      '&:not(:last-child)': {
                        borderBottom: '1px dashed rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {medal && (
                          <span
                            style={{
                              fontSize: '18px',
                              filter: 'drop-shadow(0 0 6px rgba(231, 76, 60, 0.6))',
                              animation: 'medal-heartbeat 2.5s infinite alternate',
                            }}
                          >
                            {medal}
                          </span>
                        )}
                        <Typography sx={{ color: '#ffffff', fontWeight: 'bold' }}>{index + 1}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar
                          sx={{
                            bgcolor: '#e74c3c',
                            color: '#ffffff',
                            width: 28,
                            height: 28,
                            fontSize: 12,
                            mr: 1,
                            border: '1px solid rgba(231, 76, 60, 0.4)',
                            transition: 'all 0.3s',
                            '&:hover': { transform: 'scale(1.15)' },
                          }}
                        >
                          {getInitials(emp.name) || '?'}
                        </Avatar>
                        <Typography sx={{ color: '#ffffff', fontWeight: 'bold' }}>{emp.name || '-'}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {statusConfig.icon}
                            {emp.status || 'en mission d\'amour'}
                          </Box>
                        }
                        size="small"
                        sx={{
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.1)',
                            boxShadow: '0 0 8px rgba(231, 76, 60, 0.5)',
                          },
                          ...(statusConfig.color === 'success'
                            ? { backgroundColor: '#8B0000', color: '#ffffff', border: '1px solid rgba(231, 76, 60, 0.4)' }
                            : statusConfig.color === 'warning'
                            ? { backgroundColor: '#ff9800', color: '#fff', border: '1px solid rgba(255, 152, 0, 0.5)' }
                            : { backgroundColor: '#c0392b', color: '#ffffff', border: '1px solid rgba(192, 57, 43, 0.4)' }),
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ color: '#ffffff', fontWeight: 500 }}>{emp.inbound != null ? emp.inbound : '-'}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      {emp.avgInboundAHT ? (
                        <Chip
                          label={emp.avgInboundAHT}
                          size="small"
                          sx={{
                            fontWeight: 'bold',
                            minWidth: 60,
                            border: '1px solid rgba(231, 76, 60, 0.4)',
                            ...(inboundCritical
                              ? {
                                  backgroundColor: '#c0392b',
                                  color: '#ffffff',
                                  fontFamily: '"Playfair Display", serif',
                                  animation: 'pulse-critical-heart 2s infinite alternate',
                                }
                              : getDurationColor(inboundSec) === 'warning'
                              ? { backgroundColor: '#ff9800', color: '#fff' }
                              : { backgroundColor: '#8B0000', color: '#ffffff' }),
                          }}
                        />
                      ) : (
                        <Typography sx={{ color: '#ffffff' }}>-</Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ color: '#ffffff', fontWeight: 500 }}>{emp.outbound != null ? emp.outbound : '-'}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      {emp.avgOutboundAHT ? (
                        <Chip
                          label={emp.avgOutboundAHT}
                          size="small"
                          sx={{
                            fontWeight: 'bold',
                            minWidth: 60,
                            border: '1px solid rgba(231, 76, 60, 0.4)',
                            ...(outboundCritical
                              ? {
                                  backgroundColor: '#c0392b',
                                  color: '#ffffff',
                                  fontFamily: '"Playfair Display", serif',
                                  animation: 'pulse-critical-heart 2s infinite alternate',
                                }
                              : getDurationColor(outboundSec) === 'warning'
                              ? { backgroundColor: '#ff9800', color: '#fff' }
                              : { backgroundColor: '#8B0000', color: '#ffffff' }),
                          }}
                        />
                      ) : (
                        <Typography sx={{ color: '#ffffff' }}>-</Typography>
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
          background: 'radial-gradient(circle at 50% 50%, rgba(231, 76, 60, 0.08), transparent 70%)',
          animation: 'heart-glow 15s linear infinite',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <style>{`
        @keyframes medal-heartbeat {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 4px rgba(231, 76, 60, 0.6)); }
          50% { transform: scale(1.05); filter: drop-shadow(0 0 10px rgba(231, 76, 60, 0.8)) drop-shadow(0 0 15px rgba(255, 107, 107, 0.5)); }
        }
        @keyframes pulse-heart {
          0%, 100% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.7); }
          50% { box-shadow: 0 0 0 8px rgba(231, 76, 60, 0); }
        }
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          14%, 28% { transform: scale(1.08); }
          42%, 56% { transform: scale(1); }
          70% { transform: scale(1.12); }
        }
        @keyframes heart-glow {
          0% { transform: translateX(0) translateY(0); opacity: 0.8; }
          50% { transform: translateX(-4%) translateY(-2%); opacity: 1; }
          100% { transform: translateX(0) translateY(0); opacity: 0.8; }
        }
        @keyframes pulse-critical-heart {
          0% { transform: scale(1); box-shadow: 0 0 6px #ff5252; }
          100% { transform: scale(1.04); box-shadow: 0 0 14px #e74c3c, 0 0 20px rgba(231, 76, 60, 0.6); }
        }
      `}</style>
    </Card>
  );
}