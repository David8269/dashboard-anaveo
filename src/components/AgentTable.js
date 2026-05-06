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
  if (lower === 'unavailable') return { color: 'warning', icon: '' };
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
  
  // Mapping prénom → fichier image (noms exacts depuis votre dossier)
  const avatarMap = {
    'benjamin': 'Benjamin Lespeau.jpg',
    'gwenaelle': 'Gwenaelle Valenti.jpg',
    'julien': 'Julien Meyer.jpg',
    'malik': 'Malik Mounib.jpg',
    'marina': 'Marina Mignon.jpg',
    'mathys': 'Mathys Accus.jpg',
    'nicolas': 'Nicolas Prele.jpg',
    'rana': 'Rana Al Kas Ellia.jpg',
    'romain': 'Romain Imperatori.jpg',
    'xavier': 'Xavier Rochard.jpg',
    'yannick': 'Yannick Mallon.jpg',
  };
  
  const imageFile = avatarMap[firstName];
  
  // Retourne le chemin complet ou null si pas trouvé
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

export default function AgentTable({ employees = [], isLoading = false, isConnected = false, lastUpdate = null }) {
  // === État de chargement – Thème Pluie & Hibou (ULTRA-TRANSPARENT) ===
  if (isLoading) {
    return (
      <Card sx={{
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: 'rgba(10, 14, 23, 0.25)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderRadius: 3,
        border: '1px solid rgba(243, 156, 18, 0.2)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      }}>
        <CardContent>
          <Typography variant="overline" sx={{
            fontFamily: '"Montserrat", sans-serif',
            color: '#ecf0f1',
            textShadow: '0 0 15px rgba(243, 156, 18, 0.4)',
            fontSize: '1.2rem',
            fontWeight: 'bold',
          }}>
            🦉 Équipe Nocturne
          </Typography>
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Chip label="Veille en cours..." size="small" sx={{
              mb: 2,
              background: 'linear-gradient(135deg, #d4a017, #e67e22)',
              color: '#0a0e17',
              fontFamily: '"Montserrat", sans-serif',
              animation: 'pulse-rain 2s infinite alternate',
              border: '1px solid rgba(243, 156, 18, 0.3)',
            }} />
            <Skeleton variant="rectangular" width="100%" height={400} sx={{ backgroundColor: 'rgba(243, 156, 18, 0.1)' }} />
          </Box>
        </CardContent>
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: '-50%',
          width: '200%',
          height: '100%',
          background: 'radial-gradient(circle at 50% 50%, rgba(243, 156, 18, 0.08), transparent 70%)',
          animation: 'rain-glow 15s linear infinite',
          pointerEvents: 'none',
        }} />
        <style>{`
          @keyframes pulse-rain {
            0% { transform: scale(1); box-shadow: 0 0 8px rgba(243, 156, 18, 0.3); }
            100% { transform: scale(1.04); box-shadow: 0 0 20px rgba(243, 156, 18, 0.5); }
          }
          @keyframes rain-glow {
            0% { transform: translateX(0) translateY(0); }
            50% { transform: translateX(-6%) translateY(-3%); }
            100% { transform: translateX(0) translateY(0); }
          }
        `}</style>
      </Card>
    );
  }

  // === État vide – Thème Pluie & Hibou (ULTRA-TRANSPARENT) ===
  if (!employees || employees.length === 0) {
    return (
      <Card sx={{
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: 'rgba(10, 14, 23, 0.25)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderRadius: 3,
        border: '1px solid rgba(243, 156, 18, 0.2)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="overline" sx={{
              fontFamily: '"Montserrat", sans-serif',
              color: '#ecf0f1',
              textShadow: '0 0 15px rgba(243, 156, 18, 0.4)',
              fontSize: '1.2rem',
              fontWeight: 'bold',
            }}>
               Équipe Nocturne
            </Typography>
            <Tooltip title={isConnected ? "Connecté au CDS" : "Déconnecté"}>
              <Box sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: isConnected ? '#27ae60' : '#e74c3c',
                animation: isConnected ? 'pulse-glow-rain 2s infinite' : 'none',
                boxShadow: isConnected ? '0 0 10px rgba(39, 174, 96, 0.6)' : 'none',
              }} />
            </Tooltip>
          </Box>
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="#ecf0f1" sx={{ fontStyle: 'italic', textShadow: '0 0 8px rgba(0,0,0,0.5)' }}>
              🌧️ Aucun agent en veille...
            </Typography>
          </Box>
        </CardContent>
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: '-50%',
          width: '200%',
          height: '100%',
          background: 'radial-gradient(circle at 50% 50%, rgba(243, 156, 18, 0.08), transparent 70%)',
          animation: 'rain-glow 15s linear infinite',
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
    rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : '🦉';

  return (
    <Card sx={{
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: 'rgba(10, 14, 23, 0.25)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      borderRadius: 3,
      border: '1px solid rgba(243, 156, 18, 0.2)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      transition: 'all 0.3s ease',
      '&:hover': {
        backgroundColor: 'rgba(10, 14, 23, 0.3)',
        borderColor: 'rgba(243, 156, 18, 0.35)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 25px rgba(243, 156, 18, 0.15)',
      }
    }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="overline" sx={{
            fontFamily: '"Montserrat", sans-serif',
            color: '#ecf0f1',
            textShadow: '0 0 15px rgba(243, 156, 18, 0.4)',
            fontSize: '1.2rem',
            fontWeight: 'bold',
          }}>
            🦉 Équipe
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title={isConnected ? "Connecté au CDS" : "Déconnecté"}>
              <Box sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: isConnected ? '#27ae60' : '#e74c3c',
                animation: isConnected ? 'pulse-glow-rain 2s infinite' : 'none',
                boxShadow: isConnected ? '0 0 10px rgba(39, 174, 96, 0.6)' : 'none',
              }} />
            </Tooltip>
            {lastUpdate && (
              <Typography variant="caption" color="#bdc3c7" sx={{ fontStyle: 'italic', textShadow: '0 0 5px rgba(0,0,0,0.5)' }}>
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
                      fontWeight: 'bold',
                      color: '#f39c12',
                      fontFamily: '"Montserrat", sans-serif',
                      fontSize: '0.85rem',
                      borderBottom: '2px solid rgba(243, 156, 18, 0.25)',
                      textShadow: '0 0 8px rgba(243, 156, 18, 0.3)',
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
                        backgroundColor: 'rgba(243, 156, 18, 0.1)',
                        boxShadow: 'inset 0 0 12px rgba(243, 156, 18, 0.2)',
                        transform: 'scale(1.01)',
                      },
                      transition: 'all 0.25s ease-in-out',
                      '&:not(:last-child)': {
                        borderBottom: '1px dashed rgba(243, 156, 18, 0.15)',
                      },
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {medal && (
                          <span
                            style={{
                              fontSize: '18px',
                              filter: 'drop-shadow(0 0 6px rgba(243, 156, 18, 0.5))',
                              animation: 'medal-glow-rain 2.5s infinite alternate',
                            }}
                          >
                            {medal}
                          </span>
                        )}
                        <Typography sx={{ color: '#ecf0f1', fontWeight: 'bold', textShadow: '0 0 5px rgba(0,0,0,0.5)' }}>{index + 1}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        {/* 🦉 Avatar personnalisé avec photo ou fallback initiales */}
                        <Avatar
                          src={avatarSrc}
                          alt={emp.name || 'Agent'}
                          sx={{
                            width: 40,
                            height: 40,
                            mr: 1.5,
                            border: '2px solid rgba(243, 156, 18, 0.3)',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
                            transition: 'all 0.3s',
                            objectFit: 'cover',
                            '&:hover': { 
                              transform: 'scale(1.15)',
                              boxShadow: '0 4px 16px rgba(243, 156, 18, 0.5)',
                              borderColor: 'rgba(243, 156, 18, 0.6)',
                            },
                            // Si pas d'image, affiche les initiales avec fond ambré
                            bgcolor: !avatarSrc ? 'rgba(243, 156, 18, 0.3)' : 'transparent',
                            color: !avatarSrc ? '#ecf0f1' : 'inherit',
                          }}
                        >
                          {!avatarSrc && getInitials(emp.name)}
                        </Avatar>
                        <Typography sx={{ color: '#ecf0f1', fontWeight: 'bold', textShadow: '0 0 5px rgba(0,0,0,0.5)' }}>{emp.name || '-'}</Typography>
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
                          backgroundColor: 'rgba(26, 35, 50, 0.6)',
                          color: '#ecf0f1',
                          border: '1px solid rgba(243, 156, 18, 0.2)',
                          backdropFilter: 'blur(4px)',
                          '&:hover': {
                            transform: 'scale(1.1)',
                            boxShadow: '0 0 10px rgba(243, 156, 18, 0.4)',
                            backgroundColor: 'rgba(26, 35, 50, 0.8)',
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ color: '#ecf0f1', fontWeight: 500, textShadow: '0 0 5px rgba(0,0,0,0.5)' }}>{emp.inbound != null ? emp.inbound : '-'}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      {emp.avgInboundAHT ? (
                        <Chip
                          label={emp.avgInboundAHT}
                          size="small"
                          sx={{
                            fontWeight: 'bold',
                            minWidth: 60,
                            border: '1px solid rgba(243, 156, 18, 0.2)',
                            backgroundColor: 'rgba(26, 35, 50, 0.6)',
                            color: '#ecf0f1',
                            backdropFilter: 'blur(4px)',
                            ...(inboundCritical
                              ? {
                                  backgroundColor: 'rgba(231, 76, 60, 0.7)',
                                  color: '#fff',
                                  fontFamily: '"Montserrat", sans-serif',
                                  animation: 'pulse-critical-rain 2s infinite alternate',
                                  border: '1px solid rgba(231, 76, 60, 0.5)',
                                }
                              : getDurationColor(inboundSec) === 'warning'
                              ? { backgroundColor: 'rgba(241, 196, 15, 0.6)', color: '#0a0e17' }
                              : { backgroundColor: 'rgba(39, 174, 96, 0.6)', color: '#ecf0f1' }),
                          }}
                        />
                      ) : (
                        <Typography sx={{ color: '#ecf0f1' }}>-</Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ color: '#ecf0f1', fontWeight: 500, textShadow: '0 0 5px rgba(0,0,0,0.5)' }}>{emp.outbound != null ? emp.outbound : '-'}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      {emp.avgOutboundAHT ? (
                        <Chip
                          label={emp.avgOutboundAHT}
                          size="small"
                          sx={{
                            fontWeight: 'bold',
                            minWidth: 60,
                            border: '1px solid rgba(243, 156, 18, 0.2)',
                            backgroundColor: 'rgba(26, 35, 50, 0.6)',
                            color: '#ecf0f1',
                            backdropFilter: 'blur(4px)',
                            ...(outboundCritical
                              ? {
                                  backgroundColor: 'rgba(231, 76, 60, 0.7)',
                                  color: '#fff',
                                  fontFamily: '"Montserrat", sans-serif',
                                  animation: 'pulse-critical-rain 2s infinite alternate',
                                  border: '1px solid rgba(231, 76, 60, 0.5)',
                                }
                              : getDurationColor(outboundSec) === 'warning'
                              ? { backgroundColor: 'rgba(241, 196, 15, 0.6)', color: '#0a0e17' }
                              : { backgroundColor: 'rgba(39, 174, 96, 0.6)', color: '#ecf0f1' }),
                          }}
                        />
                      ) : (
                        <Typography sx={{ color: '#ecf0f1' }}>-</Typography>
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
          background: 'radial-gradient(circle at 50% 50%, rgba(243, 156, 18, 0.08), transparent 70%)',
          animation: 'rain-glow 15s linear infinite',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <style>{`
        @keyframes medal-glow-rain {
          0% { filter: drop-shadow(0 0 4px rgba(243, 156, 18, 0.4)); }
          100% { filter: drop-shadow(0 0 10px rgba(243, 156, 18, 0.6)) drop-shadow(0 0 16px rgba(243, 156, 18, 0.4)); }
        }
        @keyframes pulse-glow-rain {
          0%, 100% { box-shadow: 0 0 0 0 rgba(39, 174, 96, 0.5); }
          50% { box-shadow: 0 0 0 8px rgba(39, 174, 96, 0); }
        }
        @keyframes pulse-rain {
          0% { transform: scale(1); box-shadow: 0 0 8px rgba(243, 156, 18, 0.3); }
          100% { transform: scale(1.04); box-shadow: 0 0 20px rgba(243, 156, 18, 0.5); }
        }
        @keyframes rain-glow {
          0% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(-6%) translateY(-3%); }
          100% { transform: translateX(0) translateY(0); }
        }
        @keyframes pulse-critical-rain {
          0% { transform: scale(1); box-shadow: 0 0 6px rgba(231, 76, 60, 0.5); }
          100% { transform: scale(1.03); box-shadow: 0 0 12px rgba(231, 76, 60, 0.7); }
        }
      `}</style>
    </Card>
  );
}