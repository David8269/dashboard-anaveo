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
  if (!status) return { color: 'default', icon: '🌷' };
  const lower = status.toLowerCase();
  if (lower === 'available' || lower === 'online') return { color: 'success', icon: '🌸' };
  if (lower === 'unavailable') return { color: 'warning', icon: '🦋' };
  return { color: 'default', icon: '🌼' };
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
  // === État de chargement ===
  if (isLoading) {
    return (
      <Card sx={{
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: 'rgba(255, 255, 255, 0.65)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderRadius: 3,
        border: '1px solid rgba(144, 238, 144, 0.6)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
      }}>
        <CardContent>
          <Typography variant="overline" sx={{
            fontFamily: '"Montserrat", sans-serif',
            color: '#2F4F4F',
            textShadow: '0 0 8px rgba(255, 255, 255, 0.8)',
            fontSize: '1.2rem',
            fontWeight: 'bold',
          }}>
            🌸 Équipe Printanière 2026
          </Typography>
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Chip label="Éveil du printemps..." size="small" sx={{
              mb: 2,
              background: 'linear-gradient(135deg, #87CEEB, #90EE90)',
              color: '#2F4F4F',
              fontFamily: '"Montserrat", sans-serif',
              animation: 'pulse-spring 2s infinite alternate',
              border: '1px solid rgba(144, 238, 144, 0.6)',
            }} />
            <Skeleton variant="rectangular" width="100%" height={400} sx={{ backgroundColor: 'rgba(144, 238, 144, 0.1)' }} />
          </Box>
        </CardContent>
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: '-50%',
          width: '200%',
          height: '100%',
          background: 'radial-gradient(circle at 50% 50%, rgba(144, 238, 144, 0.1), transparent 70%)',
          animation: 'spring-glow 15s linear infinite',
          pointerEvents: 'none',
        }} />
        <style>{`
          @keyframes pulse-spring {
            0% { transform: scale(1); box-shadow: 0 0 8px rgba(144, 238, 144, 0.4); }
            100% { transform: scale(1.04); box-shadow: 0 0 20px rgba(144, 238, 144, 0.6); }
          }
          @keyframes spring-glow {
            0% { transform: translateX(0) translateY(0); }
            50% { transform: translateX(-6%) translateY(-3%); }
            100% { transform: translateX(0) translateY(0); }
          }
        `}</style>
      </Card>
    );
  }

  // === État vide ===
  if (!employees || employees.length === 0) {
    return (
      <Card sx={{
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: 'rgba(255, 255, 255, 0.65)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderRadius: 3,
        border: '1px solid rgba(144, 238, 144, 0.6)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
      }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="overline" sx={{
              fontFamily: '"Montserrat", sans-serif',
              color: '#2F4F4F',
              textShadow: '0 0 8px rgba(255, 255, 255, 0.8)',
              fontSize: '1.2rem',
              fontWeight: 'bold',
            }}>
              🌸 Équipe Printanière 2026
            </Typography>
            <Tooltip title={isConnected ? "Connecté au jardin" : "Déconnecté"}>
              <Box sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: isConnected ? '#90EE90' : '#c62828',
                animation: isConnected ? 'pulse-glow 2s infinite' : 'none',
              }} />
            </Tooltip>
          </Box>
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="#2F4F4F" sx={{ fontStyle: 'italic' }}>
              🌼 Aucun agent disponible...
            </Typography>
          </Box>
        </CardContent>
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: '-50%',
          width: '200%',
          height: '100%',
          background: 'radial-gradient(circle at 50% 50%, rgba(144, 238, 144, 0.1), transparent 70%)',
          animation: 'spring-glow 15s linear infinite',
          pointerEvents: 'none',
        }} />
      </Card>
    );
  }

  const sortedEmployees = useMemo(() => 
    [...employees].sort((a, b) => 
      ((b.inbound || 0) + (b.outbound || 0)) - ((a.inbound || 0) + (a.outbound || 0))
    ), [employees]);
  
  const getMedalEmoji = (rank) => 
    rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : '🌸';

  return (
    <Card sx={{
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: 'rgba(255, 255, 255, 0.65)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      borderRadius: 3,
      border: '1px solid rgba(144, 238, 144, 0.6)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
    }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="overline" sx={{
            fontFamily: '"Montserrat", sans-serif',
            color: '#2F4F4F',
            textShadow: '0 0 8px rgba(255, 255, 255, 0.8)',
            fontSize: '1.2rem',
            fontWeight: 'bold',
          }}>
            🌸 Équipe Printanière 2026
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title={isConnected ? "Connecté au jardin" : "Déconnecté"}>
              <Box sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: isConnected ? '#90EE90' : '#c62828',
                animation: isConnected ? 'pulse-glow 2s infinite' : 'none',
              }} />
            </Tooltip>
            {lastUpdate && (
              <Typography variant="caption" color="#2F4F4F" sx={{ fontStyle: 'italic' }}>
                {`MàJ : ${lastUpdate.toLocaleTimeString()}`}
              </Typography>
            )}
          </Box>
        </Box>

        <TableContainer component={Box}>
          <Table size="small" aria-label="tableau des performances des agents">
            <TableHead>
              <TableRow>
                {['#', 'Agent', 'Statut', 'Fleurs cueillies', 'Temps moyen (entrant)', 'Papillons libérés', 'Temps moyen (sortant)'].map((label, i) => (
                  <TableCell
                    key={i}
                    scope="col"
                    sx={{
                      fontWeight: 'bold',
                      color: '#2F4F4F',
                      fontFamily: '"Montserrat", sans-serif',
                      fontSize: '0.85rem',
                      borderBottom: '2px solid rgba(144, 238, 144, 0.6)',
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
                        backgroundColor: 'rgba(144, 238, 144, 0.15)',
                        boxShadow: 'inset 0 0 12px rgba(144, 238, 144, 0.25)',
                        transform: 'scale(1.02)',
                      },
                      transition: 'all 0.25s ease-in-out',
                      '&:not(:last-child)': {
                        borderBottom: '1px dashed rgba(144, 238, 144, 0.25)',
                      },
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {medal && (
                          <span
                            style={{
                              fontSize: '18px',
                              filter: 'drop-shadow(0 0 6px rgba(144, 238, 144, 0.5))',
                              animation: 'medal-glow 2.5s infinite alternate',
                            }}
                          >
                            {medal}
                          </span>
                        )}
                        <Typography sx={{ color: '#2F4F4F', fontWeight: 'bold' }}>{index + 1}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar
                          sx={{
                            bgcolor: '#90EE90',
                            color: '#2F4F4F',
                            width: 28,
                            height: 28,
                            fontSize: 12,
                            mr: 1,
                            border: '1px solid rgba(144, 238, 144, 0.6)',
                            transition: 'all 0.3s',
                            '&:hover': { transform: 'rotate(5deg) scale(1.1)' },
                          }}
                        >
                          {getInitials(emp.name) || '?'}
                        </Avatar>
                        <Typography sx={{ color: '#2F4F4F', fontWeight: 'bold' }}>{emp.name || '-'}</Typography>
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
                            boxShadow: '0 0 10px rgba(144, 238, 144, 0.4)',
                          },
                          ...(statusConfig.color === 'success'
                            ? { backgroundColor: '#7CFC00', color: '#2F4F4F', border: '1px solid rgba(144, 238, 144, 0.6)' }
                            : statusConfig.color === 'warning'
                            ? { backgroundColor: '#FFD700', color: '#2F4F4F', border: '1px solid rgba(255, 215, 0, 0.5)' }
                            : { backgroundColor: '#FFB6C1', color: '#2F4F4F', border: '1px solid rgba(255, 182, 193, 0.5)' }),
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ color: '#2F4F4F', fontWeight: 500 }}>{emp.inbound != null ? emp.inbound : '-'}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      {emp.avgInboundAHT ? (
                        <Chip
                          label={emp.avgInboundAHT}
                          size="small"
                          sx={{
                            fontWeight: 'bold',
                            minWidth: 60,
                            border: '1px solid rgba(144, 238, 144, 0.6)',
                            ...(inboundCritical
                              ? {
                                  backgroundColor: '#c62828',
                                  color: '#fff',
                                  fontFamily: '"Montserrat", sans-serif',
                                  animation: 'pulse-critical 2s infinite alternate',
                                }
                              : getDurationColor(inboundSec) === 'warning'
                              ? { backgroundColor: '#FFD700', color: '#2F4F4F' }
                              : { backgroundColor: '#7CFC00', color: '#2F4F4F' }),
                          }}
                        />
                      ) : (
                        <Typography sx={{ color: '#2F4F4F' }}>-</Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ color: '#2F4F4F', fontWeight: 500 }}>{emp.outbound != null ? emp.outbound : '-'}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      {emp.avgOutboundAHT ? (
                        <Chip
                          label={emp.avgOutboundAHT}
                          size="small"
                          sx={{
                            fontWeight: 'bold',
                            minWidth: 60,
                            border: '1px solid rgba(144, 238, 144, 0.6)',
                            ...(outboundCritical
                              ? {
                                  backgroundColor: '#c62828',
                                  color: '#fff',
                                  fontFamily: '"Montserrat", sans-serif',
                                  animation: 'pulse-critical 2s infinite alternate',
                                }
                              : getDurationColor(outboundSec) === 'warning'
                              ? { backgroundColor: '#FFD700', color: '#2F4F4F' }
                              : { backgroundColor: '#7CFC00', color: '#2F4F4F' }),
                          }}
                        />
                      ) : (
                        <Typography sx={{ color: '#2F4F4F' }}>-</Typography>
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
          background: 'radial-gradient(circle at 50% 50%, rgba(144, 238, 144, 0.1), transparent 70%)',
          animation: 'spring-glow 15s linear infinite',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <style>{`
        @keyframes medal-glow {
          0% { filter: drop-shadow(0 0 4px rgba(144, 238, 144, 0.4)); }
          100% { filter: drop-shadow(0 0 10px rgba(144, 238, 144, 0.6)) drop-shadow(0 0 16px rgba(144, 238, 144, 0.4)); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(144, 238, 144, 0.5); }
          50% { box-shadow: 0 0 0 8px rgba(144, 238, 144, 0); }
        }
        @keyframes pulse-spring {
          0% { transform: scale(1); box-shadow: 0 0 8px rgba(144, 238, 144, 0.4); }
          100% { transform: scale(1.04); box-shadow: 0 0 20px rgba(144, 238, 144, 0.6); }
        }
        @keyframes spring-glow {
          0% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(-6%) translateY(-3%); }
          100% { transform: translateX(0) translateY(0); }
        }
        @keyframes pulse-critical {
          0% { transform: scale(1); box-shadow: 0 0 6px #ef9a9a; }
          100% { transform: scale(1.03); box-shadow: 0 0 12px #e57373; }
        }
      `}</style>
    </Card>
  );
}