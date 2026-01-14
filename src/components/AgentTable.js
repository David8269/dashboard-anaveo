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
  if (lower === 'available' || lower === 'online') return { color: 'success', icon: '⛷️' };
  if (lower === 'unavailable') return { color: 'warning', icon: '⏸️' };
  return { color: 'default', icon: '❄️' };
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
        border: '1px solid rgba(0, 216, 255, 0.7)', // Bordure bleu plus clair
        boxShadow: '0 0 20px rgba(0, 216, 255, 0.5)', // Ombre bleu plus clair
      }}>
        <CardContent>
          <Typography variant="overline" sx={{
            fontFamily: '"Orbitron", sans-serif',
            color: '#00d8ff', // Bleu plus clair
            textShadow: '0 0 8px rgba(0, 216, 255, 0.8)', // Ombre plus claire
            fontSize: '1.2rem',
            fontWeight: 'bold',
          }}>
            🏂 Championnat des pistes 2026
          </Typography>
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Chip label="Connexion à la station..." size="small" sx={{
              mb: 2,
              background: 'linear-gradient(135deg, #000, #005580)', // Dégradé bleu plus foncé mais plus vif
              color: '#00e6ff', // Texte plus clair
              fontFamily: '"Montserrat", sans-serif',
              animation: 'pulse-blue 2s infinite alternate',
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
          background: 'radial-gradient(circle at 50% 50%, rgba(0,216,255,0.08), transparent 70%)', // Fond avec nouveau bleu
          animation: 'blue-glow 15s linear infinite',
          pointerEvents: 'none',
        }} />
        <style>{`
          @keyframes pulse-blue {
            0% { transform: scale(1); box-shadow: 0 0 8px #00e6ff; } /* Couleur plus claire */
            100% { transform: scale(1.04); box-shadow: 0 0 20px #00e6ff; } /* Couleur plus claire */
          }
          @keyframes blue-glow {
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
        border: '1px solid rgba(0, 216, 255, 0.7)', // Bordure bleu plus clair
        boxShadow: '0 0 20px rgba(0, 216, 255, 0.5)', // Ombre bleu plus clair
      }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="overline" sx={{
              fontFamily: '"Orbitron", sans-serif',
              color: '#00d8ff', // Bleu plus clair
              textShadow: '0 0 8px rgba(0, 216, 255, 0.8)', // Ombre plus claire
              fontSize: '1.2rem',
              fontWeight: 'bold',
            }}>
              🏂 Championnat des pistes 2026
            </Typography>
            <Tooltip title={isConnected ? "Connecté à la station" : "Déconnecté"}>
              <Box sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: isConnected ? '#00d8ff' : '#8b0000', // Point de connection plus visible
                animation: isConnected ? 'pulse-glow 2s infinite' : 'none',
              }} />
            </Tooltip>
          </Box>
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="#00e6ff" sx={{ textShadow: '0 0 6px rgba(0,216,255,0.6)' }}> {/* Texte plus clair */}
              🌟 Aucun skieur sur les pistes...
            </Typography>
          </Box>
        </CardContent>
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: '-50%',
          width: '200%',
          height: '100%',
          background: 'radial-gradient(circle at 50% 50%, rgba(0,216,255,0.08), transparent 70%)', // Fond avec nouveau bleu
          animation: 'blue-glow 15s linear infinite',
          pointerEvents: 'none',
        }} />
      </Card>
    );
  }

  const sortedEmployees = useMemo(() => [...employees].sort((a, b) => ((b.inbound || 0) + (b.outbound || 0)) - ((a.inbound || 0) + (a.outbound || 0))), [employees]);
  const getMedalEmoji = (rank) => rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : '⛷️';

  return (
    <Card sx={{
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
      borderRadius: 3,
      border: '1px solid rgba(0, 216, 255, 0.7)', // Bordure bleu plus clair
      boxShadow: '0 0 20px rgba(0, 216, 255, 0.5)', // Ombre bleu plus clair
    }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="overline" sx={{
            fontFamily: '"Orbitron", sans-serif',
            color: '#00d8ff', // Bleu plus clair
            textShadow: '0 0 8px rgba(0, 216, 255, 0.8)', // Ombre plus claire
            fontSize: '1.2rem',
            fontWeight: 'bold',
          }}>
            🏂 Championnat des pistes 2026
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title={isConnected ? "Connecté à la station" : "Déconnecté"}>
              <Box sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: isConnected ? '#00d8ff' : '#8b0000', // Point de connection plus visible
                animation: isConnected ? 'pulse-glow 2s infinite' : 'none',
              }} />
            </Tooltip>
            {lastUpdate && (
              <Typography variant="caption" color="#00e6ff" sx={{ textShadow: '0 0 4px rgba(0,216,255,0.5)' }}> {/* Texte plus clair */}
                {`MàJ : ${lastUpdate.toLocaleTimeString()}`}
              </Typography>
            )}
          </Box>
        </Box>

        <TableContainer component={Box}>
          <Table size="small" aria-label="tableau des performances des skieurs">
            <TableHead>
              <TableRow>
                {['#', 'Skieur', 'Statut', 'Descente réussie', 'Temps moyen (descente)', 'Remontée', 'Temps moyen (remontée)'].map((label, i) => (
                  <TableCell
                    key={i}
                    scope="col"
                    sx={{
                      fontWeight: 'bold',
                      color: '#00e6ff', // Texte plus clair
                      textShadow: '0 0 6px rgba(0,216,255,0.7)', // Ombre plus prononcée
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
                        backgroundColor: 'rgba(0, 216, 255, 0.08)', // Fond hover plus clair
                        boxShadow: 'inset 0 0 12px rgba(0, 216, 255, 0.4)', // Ombre plus prononcée
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
                              filter: 'drop-shadow(0 0 8px #00e6ff)', // Ombre plus prononcée
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
                            bgcolor: '#00d8ff', // Bleu plus clair
                            color: '#000', // Texte noir pour meilleur contraste
                            width: 28,
                            height: 28,
                            fontSize: 12,
                            mr: 1,
                            border: '1px solid #00e6ff', // Bordure plus claire
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
                            {emp.status || 'sur piste'}
                          </Box>
                        }
                        size="small"
                        sx={{
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.1)',
                            boxShadow: '0 0 12px #00e6ff', // Ombre plus prononcée
                          },
                          ...(statusConfig.color === 'success'
                            ? { backgroundColor: '#00ff80', color: '#000' } // Vert plus voyant avec texte noir
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
                                  backgroundColor: '#ff5252', // Rouge plus visible
                                  fontFamily: '"Montserrat", sans-serif',
                                  animation: 'pulse-blue 2s infinite alternate',
                                }
                              : getDurationColor(inboundSec) === 'warning'
                              ? { backgroundColor: '#ffaa00', color: '#000' }
                              : { backgroundColor: '#00ff80', color: '#000' }), // Vert plus voyant avec texte noir
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
                                  backgroundColor: '#ff5252', // Rouge plus visible
                                  fontFamily: '"Montserrat", sans-serif',
                                  animation: 'pulse-blue 2s infinite alternate',
                                }
                              : getDurationColor(outboundSec) === 'warning'
                              ? { backgroundColor: '#ffaa00', color: '#000' }
                              : { backgroundColor: '#00ff80', color: '#000' }), // Vert plus voyant avec texte noir
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
          background: 'radial-gradient(circle at 50% 50%, rgba(0,216,255,0.08), transparent 70%)', // Fond avec nouveau bleu
          animation: 'blue-glow 15s linear infinite',
          pointerEvents: 'none',
        }}
      />
      <style>{`
        @keyframes medal-glow {
          0% { filter: drop-shadow(0 0 6px #00e6ff); } /* Couleur plus claire */
          100% { filter: drop-shadow(0 0 12px #00e6ff) drop-shadow(0 0 20px rgba(0,230,255,0.8)); } /* Couleur plus claire */
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0, 216, 255, 0.7); } /* Nouveau bleu */
          50% { box-shadow: 0 0 0 8px rgba(0, 216, 255, 0); } /* Nouveau bleu */
        }
        @keyframes pulse-blue {
          0% { transform: scale(1); box-shadow: 0 0 8px #00e6ff; } /* Couleur plus claire */
          100% { transform: scale(1.04); box-shadow: 0 0 20px #00e6ff; } /* Couleur plus claire */
        }
        @keyframes blue-glow {
          0% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(-6%) translateY(-3%); }
          100% { transform: translateX(0) translateY(0); }
        }
      `}</style>
    </Card>
  );
}