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
  if (!status) return { color: 'default', icon: '' };
  const lower = status.toLowerCase();
  if (lower === 'available' || lower === 'online') return { color: 'success', icon: '🟢' };
  if (lower === 'unavailable') return { color: 'warning', icon: '⚠️' };
  return { color: 'default', icon: '' };
};

const getDurationColor = (seconds) => {
  if (!seconds || isNaN(seconds)) return 'default';
  if (seconds <= 600) return 'success';
  if (seconds <= 900) return 'warning';
  return 'error';
};

// === 🦉 Récupération de l'avatar personnalisé par prénom ===
const getAvatarSrc = (name = '') => {
  const firstName = name.split(' ')[0]?.toLowerCase() || '';
  
  const avatarMap = {
    'benjamin': 'Benjamin Lespeau.jpg',
    'gwenaëlle': 'Gwenaëlle Valenti.jpg',
    'julien': 'Julien Meyer.jpg',
    'malik': 'Malik Mounib.jpg',
    'marina': 'Marina Mignon.jpg',
    'nicolas': 'Nicolas Prele.jpg',
    'rana': 'Rana Al Kas Ellia.jpg',
    'romain': 'Romain Imperatori.jpg',
    'xavier': 'Xavier Rochard.jpg',
    'kévin': 'Yannick Mallon.jpg',
    'vivien': 'Yannick Mallon.jpg',
    'yannick': 'Yannick Mallon.jpg',
  };
  
  const imageFile = avatarMap[firstName];
  return imageFile ? `${process.env.PUBLIC_URL}/images/${imageFile}` : null;
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

// ===  Style de base pour l'effet "Ruban de Verre" Octobre Rose ===
const frostedGlassSx = {
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: 'rgba(45, 10, 30, 0.60)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  borderRadius: 4,
  border: '1px solid rgba(255, 77, 148, 0.3)',
  borderTop: '3px solid #ff4d94', // Effet Ruban Rose
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), inset 0 0 15px rgba(255, 255, 255, 0.05)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    backgroundColor: 'rgba(74, 14, 46, 0.70)',
    borderColor: 'rgba(255, 230, 240, 0.6)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 25px rgba(255, 77, 148, 0.2)',
    transform: 'translateY(-2px)',
  }
};

export default function AgentTable({ employees = [], isLoading = false, isConnected = false, lastUpdate = null }) {
  
  // === État de chargement – Thème Octobre Rose ===
  if (isLoading) {
    return (
      <Card sx={frostedGlassSx}>
        <CardContent>
          <Typography variant="overline" sx={{
            fontFamily: '"Dancing Script", cursive',
            color: '#ff4d94',
            textShadow: '0 2px 8px rgba(0,0,0,0.6), 0 0 15px rgba(255, 77, 148, 0.4)',
            fontSize: '1.5rem',
            fontWeight: 700,
            mb: 2,
          }}>
            🎀 Équipe
          </Typography>
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Chip label="Chargement en cours..." size="small" sx={{
              mb: 2,
              background: 'rgba(255, 77, 148, 0.2)',
              backdropFilter: 'blur(6px)',
              color: '#ffe6f0',
              fontFamily: '"Montserrat", sans-serif',
              fontWeight: 700,
              animation: 'pulse-rose 2s infinite alternate',
              border: '1px solid rgba(255, 230, 240, 0.5)',
            }} />
            <Skeleton variant="rectangular" width="100%" height={400} sx={{ backgroundColor: 'rgba(255, 77, 148, 0.08)', borderRadius: 2 }} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  // === État vide – Thème Octobre Rose ===
  if (!employees || employees.length === 0) {
    return (
      <Card sx={frostedGlassSx}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="overline" sx={{
              fontFamily: '"Dancing Script", cursive',
              color: '#ff4d94',
              textShadow: '0 2px 8px rgba(0,0,0,0.6), 0 0 15px rgba(255, 77, 148, 0.4)',
              fontSize: '1.5rem',
              fontWeight: 700,
            }}>
              🎀 Équipe
            </Typography>
            <Tooltip title={isConnected ? "Connecté au CDS" : "Déconnecté"}>
              <Box sx={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                bgcolor: isConnected ? '#6ee7b7' : '#fca5a5',
                animation: isConnected ? 'pulse-glow-rose 2s infinite' : 'none',
                boxShadow: isConnected ? '0 0 12px rgba(110, 231, 183, 0.8)' : 'none',
                border: '2px solid rgba(255, 230, 240, 0.5)',
              }} />
            </Tooltip>
          </Box>
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="#ffe6f0" sx={{ 
              fontStyle: 'italic', 
              textShadow: '0 2px 6px rgba(0,0,0,0.9)',
              fontFamily: '"Inter", sans-serif',
            }}>
               Aucun agent en service...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const sortedEmployees = useMemo(() => 
    [...employees].sort((a, b) => 
      ((b.inbound || 0) + (b.outbound || 0)) - ((a.inbound || 0) + (a.outbound || 0))
    ), [employees]);
  
  const getMedalEmoji = (rank) => 
    rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : '🎀';

  return (
    <Card sx={frostedGlassSx}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="overline" sx={{
            fontFamily: '"Dancing Script", cursive',
            color: '#ff4d94',
            textShadow: '0 2px 8px rgba(0,0,0,0.6), 0 0 15px rgba(255, 77, 148, 0.4)',
            fontSize: '1.5rem',
            fontWeight: 700,
          }}>
            🎀 Équipe
          </Typography>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Tooltip title={isConnected ? "Connecté au CDS" : "Déconnecté"}>
              <Box sx={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                bgcolor: isConnected ? '#6ee7b7' : '#fca5a5',
                animation: isConnected ? 'pulse-glow-rose 2s infinite' : 'none',
                boxShadow: isConnected ? '0 0 12px rgba(110, 231, 183, 0.8)' : 'none',
                border: '2px solid rgba(255, 230, 240, 0.5)',
              }} />
            </Tooltip>
            {lastUpdate && (
              <Typography variant="caption" color="#d4849c" sx={{ 
                fontStyle: 'italic', 
                textShadow: '0 1px 4px rgba(0,0,0,0.9)',
                fontFamily: '"Inter", sans-serif',
              }}>
                {`MàJ : ${lastUpdate.toLocaleTimeString()}`}
              </Typography>
            )}
          </Box>
        </Box>

        <TableContainer component={Box}>
          <Table size="small" aria-label="tableau des performances des agents">
            <TableHead>
              <TableRow>
                {['#', 'Agent', 'Statut', 'Appels entrants', 'AHT Entrant', 'Appels sortants', 'AHT Sortant'].map((label, i) => (
                  <TableCell
                    key={i}
                    scope="col"
                    sx={{
                      fontWeight: 700,
                      color: '#ff4d94',
                      fontFamily: '"Montserrat", sans-serif',
                      fontSize: '0.85rem',
                      borderBottom: '1px solid rgba(255, 77, 148, 0.3)',
                      textShadow: '0 2px 6px rgba(0,0,0,0.9)',
                      letterSpacing: '0.5px',
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
                const avatarSrc = getAvatarSrc(emp.name);

                return (
                  <TableRow
                    key={emp.id || `emp-${index}`}
                    hover
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(255, 77, 148, 0.1)',
                        boxShadow: 'inset 0 0 15px rgba(255, 77, 148, 0.15)',
                      },
                      transition: 'all 0.3s ease',
                      '&:not(:last-child)': {
                        borderBottom: '1px solid rgba(255, 77, 148, 0.15)',
                      },
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {medal && (
                          <span
                            style={{
                              fontSize: '20px',
                              filter: 'drop-shadow(0 0 8px rgba(255, 77, 148, 0.6))',
                              animation: 'medal-glow-rose 2.5s infinite alternate',
                            }}
                          >
                            {medal}
                          </span>
                        )}
                        <Typography sx={{ 
                          color: '#ffe6f0', 
                          fontWeight: 700, 
                          textShadow: '0 2px 6px rgba(0,0,0,0.9)',
                          fontFamily: '"Montserrat", sans-serif',
                        }}>
                          {index + 1}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar
                          src={avatarSrc}
                          alt={emp.name || 'Agent'}
                          sx={{
                            width: 42,
                            height: 42,
                            mr: 1.5,
                            border: '2px solid rgba(255, 77, 148, 0.5)',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
                            transition: 'all 0.3s',
                            objectFit: 'cover',
                            '&:hover': { 
                              transform: 'scale(1.15)',
                              boxShadow: '0 4px 16px rgba(255, 77, 148, 0.6)',
                              borderColor: 'rgba(255, 230, 240, 0.8)',
                            },
                            bgcolor: !avatarSrc ? 'rgba(255, 77, 148, 0.3)' : 'transparent',
                            color: !avatarSrc ? '#ffe6f0' : 'inherit',
                          }}
                        >
                          {!avatarSrc && getInitials(emp.name)}
                        </Avatar>
                        <Typography sx={{ 
                          color: '#ffe6f0', 
                          fontWeight: 600, 
                          textShadow: '0 2px 6px rgba(0,0,0,0.9)',
                          fontFamily: '"Inter", sans-serif',
                        }}>
                          {emp.name || '-'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {statusConfig.icon}
                            {emp.status || 'Online'}
                          </Box>
                        }
                        size="small"
                        sx={{
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          backgroundColor: 'rgba(45, 10, 30, 0.4)',
                          backdropFilter: 'blur(4px)',
                          color: '#ffe6f0',
                          border: '1px solid rgba(255, 77, 148, 0.3)',
                          '&:hover': {
                            transform: 'scale(1.1)',
                            boxShadow: '0 0 12px rgba(255, 77, 148, 0.5)',
                            backgroundColor: 'rgba(74, 14, 46, 0.5)',
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ 
                        color: '#ffe6f0', 
                        fontWeight: 600, 
                        textShadow: '0 2px 6px rgba(0,0,0,0.9)',
                        fontFamily: '"Inter", sans-serif',
                      }}>
                        {emp.inbound != null ? emp.inbound : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {emp.avgInboundAHT ? (
                        <Chip
                          label={emp.avgInboundAHT}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            minWidth: 60,
                            border: '1px solid rgba(255, 230, 240, 0.5)',
                            backgroundColor: 'rgba(45, 10, 30, 0.4)',
                            backdropFilter: 'blur(4px)',
                            color: '#ffe6f0',
                            ...(inboundCritical
                              ? {
                                  backgroundColor: 'rgba(252, 165, 165, 0.6)',
                                  color: '#ffe6f0',
                                  fontFamily: '"Montserrat", sans-serif',
                                  animation: 'pulse-critical-rose 2s infinite alternate',
                                  border: '1px solid rgba(255, 230, 240, 0.8)',
                                }
                              : getDurationColor(inboundSec) === 'warning'
                              ? { 
                                  backgroundColor: 'rgba(249, 168, 212, 0.6)', 
                                  color: '#2d0a1e',
                                  border: '1px solid rgba(255, 230, 240, 0.5)',
                                }
                              : { 
                                  backgroundColor: 'rgba(110, 231, 183, 0.6)', 
                                  color: '#ffe6f0',
                                  border: '1px solid rgba(255, 230, 240, 0.5)',
                                }),
                          }}
                        />
                      ) : (
                        <Typography sx={{ color: '#ffe6f0', textShadow: '0 2px 6px rgba(0,0,0,0.9)' }}>-</Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ 
                        color: '#ffe6f0', 
                        fontWeight: 600, 
                        textShadow: '0 2px 6px rgba(0,0,0,0.9)',
                        fontFamily: '"Inter", sans-serif',
                      }}>
                        {emp.outbound != null ? emp.outbound : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {emp.avgOutboundAHT ? (
                        <Chip
                          label={emp.avgOutboundAHT}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            minWidth: 60,
                            border: '1px solid rgba(255, 230, 240, 0.5)',
                            backgroundColor: 'rgba(45, 10, 30, 0.4)',
                            backdropFilter: 'blur(4px)',
                            color: '#ffe6f0',
                            ...(outboundCritical
                              ? {
                                  backgroundColor: 'rgba(252, 165, 165, 0.6)',
                                  color: '#ffe6f0',
                                  fontFamily: '"Montserrat", sans-serif',
                                  animation: 'pulse-critical-rose 2s infinite alternate',
                                  border: '1px solid rgba(255, 230, 240, 0.8)',
                                }
                              : getDurationColor(outboundSec) === 'warning'
                              ? { 
                                  backgroundColor: 'rgba(249, 168, 212, 0.6)', 
                                  color: '#2d0a1e',
                                  border: '1px solid rgba(255, 230, 240, 0.5)',
                                }
                              : { 
                                  backgroundColor: 'rgba(110, 231, 183, 0.6)', 
                                  color: '#ffe6f0',
                                  border: '1px solid rgba(255, 230, 240, 0.5)',
                                }),
                          }}
                        />
                      ) : (
                        <Typography sx={{ color: '#ffe6f0', textShadow: '0 2px 6px rgba(0,0,0,0.9)' }}>-</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
      
      <style>{`
        @keyframes medal-glow-rose {
          0% { filter: drop-shadow(0 0 4px rgba(255, 77, 148, 0.5)); }
          100% { filter: drop-shadow(0 0 12px rgba(255, 77, 148, 0.8)) drop-shadow(0 0 18px rgba(255, 77, 148, 0.6)); }
        }
        @keyframes pulse-glow-rose {
          0%, 100% { box-shadow: 0 0 0 0 rgba(110, 231, 183, 0.5); }
          50% { box-shadow: 0 0 0 8px rgba(110, 231, 183, 0); }
        }
        @keyframes pulse-rose {
          0% { transform: scale(1); box-shadow: 0 0 10px rgba(255, 77, 148, 0.3); }
          100% { transform: scale(1.05); box-shadow: 0 0 20px rgba(255, 77, 148, 0.5); }
        }
        @keyframes pulse-critical-rose {
          0% { transform: scale(1); box-shadow: 0 0 8px rgba(252, 165, 165, 0.6); }
          100% { transform: scale(1.04); box-shadow: 0 0 16px rgba(252, 165, 165, 0.9); }
        }
      `}</style>
    </Card>
  );
}