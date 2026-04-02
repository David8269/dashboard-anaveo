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
  if (lower === 'available' || lower === 'online') return { color: 'success', icon: '🐰' };
  if (lower === 'unavailable') return { color: 'warning', icon: '🥚' };
  return { color: 'default', icon: '🐣' };
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
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderRadius: 3,
        border: '3px solid #DDA0DD',
        boxShadow: '0 4px 16px rgba(221, 160, 221, 0.3)',
      }}>
        <CardContent>
          <Typography variant="overline" sx={{
            fontFamily: '"Montserrat", sans-serif',
            color: '#5D4E60',
            textShadow: '0 0 8px rgba(255, 255, 255, 0.8)',
            fontSize: '1.2rem',
            fontWeight: 'bold',
          }}>
            🐰 Équipe de Pâques 2026
          </Typography>
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Chip label="Préparation des œufs..." size="small" sx={{
              mb: 2,
              background: 'linear-gradient(135deg, #FFB6C1, #DDA0DD, #98D8C8)',
              color: '#5D4E60',
              fontFamily: '"Montserrat", sans-serif',
              animation: 'pulse-easter 2s infinite alternate',
              border: '2px solid #FFD700',
            }} />
            <Skeleton variant="rectangular" width="100%" height={400} sx={{ backgroundColor: 'rgba(221, 160, 221, 0.1)' }} />
          </Box>
        </CardContent>
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: '-50%',
          width: '200%',
          height: '100%',
          background: 'radial-gradient(circle at 50% 50%, rgba(221, 160, 221, 0.1), transparent 70%)',
          animation: 'easter-glow 15s linear infinite',
          pointerEvents: 'none',
        }} />
        <style>{`
          @keyframes pulse-easter {
            0% { transform: scale(1); box-shadow: 0 0 8px rgba(221, 160, 221, 0.4); }
            100% { transform: scale(1.04); box-shadow: 0 0 20px rgba(152, 216, 200, 0.6); }
          }
          @keyframes easter-glow {
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
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderRadius: 3,
        border: '3px solid #DDA0DD',
        boxShadow: '0 4px 16px rgba(221, 160, 221, 0.3)',
      }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="overline" sx={{
              fontFamily: '"Montserrat", sans-serif',
              color: '#5D4E60',
              textShadow: '0 0 8px rgba(255, 255, 255, 0.8)',
              fontSize: '1.2rem',
              fontWeight: 'bold',
            }}>
              🌷 Équipe de Pâques 2026
            </Typography>
            <Tooltip title={isConnected ? "Connecté au jardin" : "Déconnecté"}>
              <Box sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: isConnected ? '#a5d6a7' : '#ef9a9a',
                animation: isConnected ? 'pulse-glow 2s infinite' : 'none',
              }} />
            </Tooltip>
          </Box>
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="#5D4E60" sx={{ fontStyle: 'italic' }}>
              🥚 Aucun chasseur d'œufs disponible...
            </Typography>
          </Box>
        </CardContent>
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: '-50%',
          width: '200%',
          height: '100%',
          background: 'radial-gradient(circle at 50% 50%, rgba(221, 160, 221, 0.1), transparent 70%)',
          animation: 'easter-glow 15s linear infinite',
          pointerEvents: 'none',
        }} />
      </Card>
    );
  }

  // === Données disponibles ===
  const sortedEmployees = useMemo(() => 
    [...employees].sort((a, b) => 
      ((b.inbound || 0) + (b.outbound || 0)) - ((a.inbound || 0) + (a.outbound || 0))
    ), [employees]);
  
  const getMedalEmoji = (rank) => 
    rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : '🐰';

  return (
    <Card sx={{
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      borderRadius: 3,
      border: '3px solid #DDA0DD',
      boxShadow: '0 4px 16px rgba(221, 160, 221, 0.3)',
    }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="overline" sx={{
            fontFamily: '"Montserrat", sans-serif',
            color: '#5D4E60',
            textShadow: '0 0 8px rgba(255, 255, 255, 0.8)',
            fontSize: '1.2rem',
            fontWeight: 'bold',
          }}>
            🐰 Équipe de Pâques 2026
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title={isConnected ? "Connecté au jardin" : "Déconnecté"}>
              <Box sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: isConnected ? '#a5d6a7' : '#ef9a9a',
                animation: isConnected ? 'pulse-glow 2s infinite' : 'none',
              }} />
            </Tooltip>
            {lastUpdate && (
              <Typography variant="caption" color="#5D4E60" sx={{ fontStyle: 'italic' }}>
                {`MàJ : ${lastUpdate.toLocaleTimeString()}`}
              </Typography>
            )}
          </Box>
        </Box>

        <TableContainer component={Box}>
          <Table size="small" aria-label="tableau des performances de l'équipe Pâques">
            <TableHead>
              <TableRow>
                {['#', 'Chasseur', 'Statut', '🥚 Œufs trouvés', 'Temps moyen (entrant)', '🐰 Œufs rappelés', 'Temps moyen (sortant)'].map((label, i) => (
                  <TableCell
                    key={i}
                    scope="col"
                    sx={{
                      fontWeight: 'bold',
                      color: '#5D4E60',
                      fontFamily: '"Montserrat", sans-serif',
                      fontSize: '0.85rem',
                      borderBottom: '2px solid rgba(221, 160, 221, 0.6)',
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
                        backgroundColor: 'rgba(221, 160, 221, 0.1)',
                        boxShadow: 'inset 0 0 12px rgba(152, 216, 200, 0.25)',
                        transform: 'scale(1.02)',
                      },
                      transition: 'all 0.25s ease-in-out',
                      '&:not(:last-child)': {
                        borderBottom: '1px dashed rgba(221, 160, 221, 0.25)',
                      },
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {medal && (
                          <span
                            style={{
                              fontSize: '18px',
                              filter: 'drop-shadow(0 0 6px rgba(221, 160, 221, 0.5))',
                              animation: 'medal-glow 2.5s infinite alternate',
                            }}
                          >
                            {medal}
                          </span>
                        )}
                        <Typography sx={{ color: '#5D4E60', fontWeight: 'bold' }}>{index + 1}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar
                          sx={{
                            bgcolor: '#FFB6C1',
                            color: '#5D4E60',
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
                        <Typography sx={{ color: '#5D4E60', fontWeight: 'bold' }}>{emp.name || '-'}</Typography>
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
                            boxShadow: '0 0 10px rgba(221, 160, 221, 0.4)',
                          },
                          ...(statusConfig.color === 'success'
                            ? { backgroundColor: '#a5d6a7', color: '#5D4E60', border: '2px solid #FFD700' }
                            : statusConfig.color === 'warning'
                            ? { backgroundColor: '#ffe082', color: '#5D4E60', border: '2px solid #FFB6C1' }
                            : { backgroundColor: '#B5EAD7', color: '#5D4E60', border: '2px solid #98D8C8' }),
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ color: '#5D4E60', fontWeight: 500 }}>{emp.inbound != null ? emp.inbound : '-'}</Typography>
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
                                  backgroundColor: '#ef9a9a',
                                  color: '#5D4E60',
                                  fontFamily: '"Montserrat", sans-serif',
                                  animation: 'pulse-critical 2s infinite alternate',
                                }
                              : getDurationColor(inboundSec) === 'warning'
                              ? { backgroundColor: '#ffe082', color: '#5D4E60' }
                              : { backgroundColor: '#a5d6a7', color: '#5D4E60' }),
                          }}
                        />
                      ) : (
                        <Typography sx={{ color: '#5D4E60' }}>-</Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ color: '#5D4E60', fontWeight: 500 }}>{emp.outbound != null ? emp.outbound : '-'}</Typography>
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
                                  backgroundColor: '#ef9a9a',
                                  color: '#5D4E60',
                                  fontFamily: '"Montserrat", sans-serif',
                                  animation: 'pulse-critical 2s infinite alternate',
                                }
                              : getDurationColor(outboundSec) === 'warning'
                              ? { backgroundColor: '#ffe082', color: '#5D4E60' }
                              : { backgroundColor: '#a5d6a7', color: '#5D4E60' }),
                          }}
                        />
                      ) : (
                        <Typography sx={{ color: '#5D4E60' }}>-</Typography>
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
          background: 'radial-gradient(circle at 50% 50%, rgba(221, 160, 221, 0.1), transparent 70%)',
          animation: 'easter-glow 15s linear infinite',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <style>{`
        @keyframes medal-glow {
          0% { filter: drop-shadow(0 0 4px rgba(221, 160, 221, 0.4)); }
          100% { filter: drop-shadow(0 0 10px rgba(152, 216, 200, 0.6)) drop-shadow(0 0 16px rgba(255, 215, 0, 0.4)); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(221, 160, 221, 0.5); }
          50% { box-shadow: 0 0 0 8px rgba(221, 160, 221, 0); }
        }
        @keyframes pulse-easter {
          0% { transform: scale(1); box-shadow: 0 0 8px rgba(221, 160, 221, 0.4); }
          100% { transform: scale(1.04); box-shadow: 0 0 20px rgba(152, 216, 200, 0.6); }
        }
        @keyframes easter-glow {
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