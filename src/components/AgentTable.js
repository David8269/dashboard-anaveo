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
  if (!status) return { color: 'default', icon: '⚪' };
  const lower = status.toLowerCase();
  if (lower === 'available' || lower === 'online') return { color: 'success', icon: '⚡' };
  if (lower === 'unavailable' || lower === 'break') return { color: 'warning', icon: '⏸️' };
  return { color: 'default', icon: '🔴' };
};

const getDurationColor = (seconds) => {
  if (!seconds || isNaN(seconds)) return 'default';
  if (seconds <= 600) return 'success';
  if (seconds <= 900) return 'warning';
  return 'error';
};

const getAvatarSrc = (name = '') => {
  const firstName = name.split(' ')[0]?.toLowerCase() || '';
  const avatarMap = {
    'benjamin': 'Benjamin Lespeau.jpg', 'gwenaëlle': 'Gwenaëlle Valenti.jpg', 'julien': 'Julien Meyer.jpg',
    'malik': 'Malik Mounib.jpg', 'marina': 'Marina Mignon.jpg', 'nicolas': 'Nicolas Prele.jpg',
    'rana': 'Rana Al Kas Ellia.jpg', 'romain': 'Romain Imperatori.jpg', 'xavier': 'Xavier Rochard.jpg',
    'kévin': 'Yannick Mallon.jpg', 'vivien': 'Yannick Mallon.jpg', 'yannick': 'Yannick Mallon.jpg',
  };
  const imageFile = avatarMap[firstName];
  return imageFile ? `${process.env.PUBLIC_URL}/images/${imageFile}` : null;
};

const getInitials = (name = '') => name.split(' ').filter(Boolean).map((n) => n[0]).join('').toUpperCase().substring(0, 2);

const mmssToSeconds = (mmss) => {
  if (!mmss || mmss === '-') return null;
  const [m, s] = mmss.split(':').map(Number);
  return m * 60 + s;
};

// === 🦉 Style de base "Tech Glass" INNOVEO (TRANSPARENCE MAXIMALE) ===
const frostedGlassSx = {
  position: 'relative',
  overflow: 'hidden',
  background: 'linear-gradient(135deg, rgba(0, 15, 25, 0.15), rgba(0, 30, 50, 0.10))',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  borderRadius: '20px',
  border: '1px solid rgba(0, 212, 255, 0.35)',
  borderTop: '2px solid #FFD700',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 0 20px rgba(0, 212, 255, 0.05)',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  '&::before': {
    content: '""', position: 'absolute', top: 0, left: '-100%', width: '100%', height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.05), transparent)', transition: 'left 0.6s ease',
  },
  '&:hover': {
    borderColor: 'rgba(0, 212, 255, 0.6)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), 0 0 30px rgba(0, 212, 255, 0.15)',
    transform: 'translateY(-4px)',
    '&::before': { left: '100%' }
  }
};

// === 📐 Styles d'alignement et d'espacement des colonnes ===
const tableStyles = {
  headerCell: {
    fontWeight: 700,
    color: '#FFD700',
    fontFamily: '"Rajdhani", sans-serif',
    fontSize: '0.85rem',
    letterSpacing: '1.2px',
    textTransform: 'uppercase',
    py: 2,
    verticalAlign: 'middle',
    backgroundColor: 'rgba(0, 20, 30, 0.3)',
    borderBottom: '2px solid rgba(0, 212, 255, 0.4)',
    // Largeurs fixes pour un espacement parfait
    '&:nth-of-type(1)': { width: '70px', minWidth: '70px', textAlign: 'center' }, // #
    '&:nth-of-type(2)': { width: '260px', minWidth: '260px', textAlign: 'left' }, // Technicien
    '&:nth-of-type(3)': { width: '140px', minWidth: '140px', textAlign: 'center' }, // Statut
    '&:nth-of-type(4)': { width: '140px', minWidth: '140px', textAlign: 'center' }, // Appels entrants
    '&:nth-of-type(5)': { width: '130px', minWidth: '130px', textAlign: 'center' }, // AHT Entrant
    '&:nth-of-type(6)': { width: '140px', minWidth: '140px', textAlign: 'center' }, // Appels sortants
    '&:nth-of-type(7)': { width: '130px', minWidth: '130px', textAlign: 'center' }, // AHT Sortant
  },
  bodyCell: {
    py: 2,
    verticalAlign: 'middle',
    borderBottom: '1px solid rgba(0, 212, 255, 0.1)',
  }
};

export default function AgentTable({ employees = [], isLoading = false, isConnected = false, lastUpdate = null }) {
  if (isLoading) {
    return (
      <Card sx={frostedGlassSx}>
        <CardContent>
          <Typography variant="overline" sx={{ fontFamily: '"Orbitron", sans-serif', color: '#00D4FF', textShadow: '0 0 10px rgba(0, 212, 255, 0.5)', fontSize: '1.5rem', fontWeight: 700, mb: 2, letterSpacing: '0.1em' }}>💠 Équipe & Performances</Typography>
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Chip label="Synchronisation des données..." size="small" sx={{ mb: 2, background: 'rgba(0, 212, 255, 0.15)', backdropFilter: 'blur(6px)', color: '#00D4FF', fontFamily: '"Rajdhani", sans-serif', fontWeight: 700, letterSpacing: '1px', animation: 'pulse-tech 2s infinite alternate', border: '1px solid rgba(0, 212, 255, 0.4)' }} />
            <Skeleton variant="rectangular" width="100%" height={400} sx={{ backgroundColor: 'rgba(0, 20, 30, 0.2)', borderRadius: '12px' }} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!employees || employees.length === 0) {
    return (
      <Card sx={frostedGlassSx}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="overline" sx={{ fontFamily: '"Orbitron", sans-serif', color: '#00D4FF', textShadow: '0 0 10px rgba(0, 212, 255, 0.5)', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.1em' }}>💠 Équipe & Performances</Typography>
            <Tooltip title={isConnected ? "Connecté au flux de données" : "Déconnecté"}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: isConnected ? '#00D4FF' : '#ff4500', animation: isConnected ? 'pulse-glow-cyan 2s infinite' : 'none', boxShadow: isConnected ? '0 0 12px rgba(0, 212, 255, 0.8)' : 'none', border: '2px solid rgba(255, 255, 255, 0.3)' }} />
            </Tooltip>
          </Box>
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography variant="body1" sx={{ color: '#ffffff', fontStyle: 'italic', textShadow: '0 0 10px rgba(0,0,0,0.5)', fontFamily: '"Inter", sans-serif', fontSize: '1.1rem', opacity: 0.8 }}>Aucun technicien en service actuellement. En attente de données... 📡</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const sortedEmployees = useMemo(() => [...employees].sort((a, b) => ((b.inbound || 0) + (b.outbound || 0)) - ((a.inbound || 0) + (a.outbound || 0))), [employees]);
  const getMedalEmoji = (rank) => rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : '🏅';

  return (
    <Card sx={frostedGlassSx}>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="overline" sx={{ fontFamily: '"Orbitron", sans-serif', color: '#00D4FF', textShadow: '0 0 10px rgba(0, 212, 255, 0.5)', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.1em' }}>🦉 Techniciens en ligne</Typography>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Tooltip title={isConnected ? "Connecté au flux de données" : "Déconnecté"}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: isConnected ? '#00D4FF' : '#ff4500', animation: isConnected ? 'pulse-glow-cyan 2s infinite' : 'none', boxShadow: isConnected ? '0 0 12px rgba(0, 212, 255, 0.8)' : 'none', border: '2px solid rgba(255, 255, 255, 0.3)' }} />
            </Tooltip>
            {lastUpdate && (
              <Typography variant="caption" sx={{ color: '#FFD700', fontStyle: 'italic', fontFamily: '"Rajdhani", sans-serif', fontWeight: 600, fontSize: '0.9rem', letterSpacing: '0.5px' }}>{`MàJ : ${lastUpdate.toLocaleTimeString()}`}</Typography>
            )}
          </Box>
        </Box>

        <TableContainer component={Box} sx={{ 
          maxHeight: '600px', 
          overflowY: 'auto', 
          '&::-webkit-scrollbar': { width: '6px' }, 
          '&::-webkit-scrollbar-thumb': { background: 'rgba(0, 212, 255, 0.3)', borderRadius: '3px' } 
        }}>
          <Table size="small" aria-label="tableau des performances des techniciens">
            <TableHead>
              <TableRow>
                {['#', 'Technicien', 'Statut', 'Appels entrants', 'AHT Entrant', 'Appels sortants', 'AHT Sortant'].map((label, i) => (
                  <TableCell key={i} scope="col" sx={tableStyles.headerCell}>
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
                const inboundWarning = getDurationColor(inboundSec) === 'warning';
                const outboundCritical = getDurationColor(outboundSec) === 'error';
                const outboundWarning = getDurationColor(outboundSec) === 'warning';
                const statusConfig = getStatusConfig(emp.status);
                const avatarSrc = getAvatarSrc(emp.name);

                return (
                  <TableRow 
                    key={emp.id || `emp-${index}`} 
                    hover 
                    sx={{ 
                      backgroundColor: 'rgba(0, 20, 30, 0.1)', 
                      '&:hover': { 
                        backgroundColor: 'rgba(0, 212, 255, 0.08)', 
                        boxShadow: 'inset 0 0 20px rgba(0, 212, 255, 0.05)' 
                      }, 
                      transition: 'all 0.3s ease', 
                    }}
                  >
                    {/* Colonne # */}
                    <TableCell sx={{ ...tableStyles.bodyCell, textAlign: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        {medal && <span style={{ fontSize: '20px', filter: 'drop-shadow(0 0 6px rgba(255, 215, 0, 0.6))', animation: 'medal-glow-innoveo 2.5s infinite alternate' }}>{medal}</span>}
                        <Typography sx={{ color: '#ffffff', fontWeight: 700, fontFamily: '"Orbitron", sans-serif', fontSize: '0.95rem' }}>{index + 1}</Typography>
                      </Box>
                    </TableCell>

                    {/* Colonne Technicien */}
                    <TableCell sx={{ ...tableStyles.bodyCell, textAlign: 'left', pl: 2 }}>
                      <Box display="flex" alignItems="center">
                        <Avatar 
                          src={avatarSrc} 
                          alt={emp.name || 'Agent'} 
                          sx={{ 
                            width: 42, height: 42, mr: 1.5, 
                            border: '2px solid rgba(0, 212, 255, 0.5)', 
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)', 
                            transition: 'all 0.3s', 
                            objectFit: 'cover', 
                            '&:hover': { transform: 'scale(1.1)', boxShadow: '0 0 15px rgba(0, 212, 255, 0.5)', borderColor: '#FFD700' }, 
                            bgcolor: !avatarSrc ? 'rgba(0, 212, 255, 0.2)' : 'transparent', 
                            color: !avatarSrc ? '#00D4FF' : 'inherit', 
                            fontWeight: 700, fontSize: '0.9rem' 
                          }}
                        >
                          {!avatarSrc && getInitials(emp.name)}
                        </Avatar>
                        <Typography sx={{ color: '#ffffff', fontWeight: 600, fontFamily: '"Inter", sans-serif', fontSize: '0.95rem' }}>{emp.name || '-'}</Typography>
                      </Box>
                    </TableCell>

                    {/* Colonne Statut */}
                    <TableCell sx={{ ...tableStyles.bodyCell, textAlign: 'center' }}>
                      <Chip 
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, fontSize: '0.8rem' }}>
                            {statusConfig.icon} {emp.status || 'Online'}
                          </Box>
                        } 
                        size="small" 
                        sx={{ 
                          fontWeight: 600, 
                          fontFamily: '"Rajdhani", sans-serif',
                          letterSpacing: '0.5px',
                          backgroundColor: 'rgba(0, 20, 30, 0.3)', 
                          backdropFilter: 'blur(4px)', 
                          color: '#ffffff', 
                          border: '1px solid rgba(0, 212, 255, 0.3)',
                          display: 'inline-flex',
                          '&:hover': { 
                            transform: 'scale(1.05)', 
                            boxShadow: '0 0 12px rgba(0, 212, 255, 0.3)', 
                            backgroundColor: 'rgba(0, 212, 255, 0.15)', 
                            borderColor: 'rgba(0, 212, 255, 0.6)' 
                          } 
                        }} 
                      />
                    </TableCell>

                    {/* Colonne Appels entrants */}
                    <TableCell sx={{ ...tableStyles.bodyCell, textAlign: 'center' }}>
                      <Typography sx={{ color: '#ffffff', fontWeight: 700, fontFamily: '"Orbitron", sans-serif', fontSize: '1rem' }}>
                        {emp.inbound != null ? emp.inbound : '-'}
                      </Typography>
                    </TableCell>

                    {/* Colonne AHT Entrant */}
                    <TableCell sx={{ ...tableStyles.bodyCell, textAlign: 'center' }}>
                      {emp.avgInboundAHT ? (
                        <Chip 
                          label={emp.avgInboundAHT} 
                          size="small" 
                          sx={{ 
                            fontWeight: 700, 
                            minWidth: 75,
                            fontFamily: '"Orbitron", sans-serif',
                            fontSize: '0.85rem',
                            backgroundColor: 'rgba(0, 20, 30, 0.3)', 
                            backdropFilter: 'blur(4px)', 
                            display: 'inline-flex',
                            justifyContent: 'center',
                            ...(inboundCritical ? { 
                              backgroundColor: 'rgba(255, 69, 0, 0.15)', 
                              color: '#ff4500', 
                              borderColor: 'rgba(255, 69, 0, 0.5)', 
                              animation: 'pulse-critical-tech 1.5s infinite alternate', 
                              boxShadow: '0 0 10px rgba(255, 69, 0, 0.3)' 
                            } : inboundWarning ? { 
                              backgroundColor: 'rgba(255, 215, 0, 0.15)', 
                              color: '#FFD700', 
                              borderColor: 'rgba(255, 215, 0, 0.5)', 
                              boxShadow: '0 0 8px rgba(255, 215, 0, 0.2)' 
                            } : { 
                              backgroundColor: 'rgba(0, 255, 100, 0.15)', 
                              color: '#00ff64', 
                              borderColor: 'rgba(0, 255, 100, 0.5)', 
                              boxShadow: '0 0 8px rgba(0, 255, 100, 0.2)' 
                            }) 
                          }} 
                        />
                      ) : <Typography sx={{ color: 'rgba(255,255,255,0.3)' }}>-</Typography>}
                    </TableCell>

                    {/* Colonne Appels sortants */}
                    <TableCell sx={{ ...tableStyles.bodyCell, textAlign: 'center' }}>
                      <Typography sx={{ color: '#ffffff', fontWeight: 700, fontFamily: '"Orbitron", sans-serif', fontSize: '1rem' }}>
                        {emp.outbound != null ? emp.outbound : '-'}
                      </Typography>
                    </TableCell>

                    {/* Colonne AHT Sortant */}
                    <TableCell sx={{ ...tableStyles.bodyCell, textAlign: 'center' }}>
                      {emp.avgOutboundAHT ? (
                        <Chip 
                          label={emp.avgOutboundAHT} 
                          size="small" 
                          sx={{ 
                            fontWeight: 700, 
                            minWidth: 75,
                            fontFamily: '"Orbitron", sans-serif',
                            fontSize: '0.85rem',
                            backgroundColor: 'rgba(0, 20, 30, 0.3)', 
                            backdropFilter: 'blur(4px)', 
                            display: 'inline-flex',
                            justifyContent: 'center',
                            ...(outboundCritical ? { 
                              backgroundColor: 'rgba(255, 69, 0, 0.15)', 
                              color: '#ff4500', 
                              borderColor: 'rgba(255, 69, 0, 0.5)', 
                              animation: 'pulse-critical-tech 1.5s infinite alternate', 
                              boxShadow: '0 0 10px rgba(255, 69, 0, 0.3)' 
                            } : outboundWarning ? { 
                              backgroundColor: 'rgba(255, 215, 0, 0.15)', 
                              color: '#FFD700', 
                              borderColor: 'rgba(255, 215, 0, 0.5)', 
                              boxShadow: '0 0 8px rgba(255, 215, 0, 0.2)' 
                            } : { 
                              backgroundColor: 'rgba(0, 255, 100, 0.15)', 
                              color: '#00ff64', 
                              borderColor: 'rgba(0, 255, 100, 0.5)', 
                              boxShadow: '0 0 8px rgba(0, 255, 100, 0.2)' 
                            }) 
                          }} 
                        />
                      ) : <Typography sx={{ color: 'rgba(255,255,255,0.3)' }}>-</Typography>}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
      <style>{`
        @keyframes medal-glow-innoveo { 
          0% { filter: drop-shadow(0 0 4px rgba(255, 215, 0, 0.4)); } 
          100% { filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.7)) drop-shadow(0 0 15px rgba(0, 212, 255, 0.5)); } 
        }
        @keyframes pulse-glow-cyan { 
          0%, 100% { box-shadow: 0 0 0 0 rgba(0, 212, 255, 0.5); } 
          50% { box-shadow: 0 0 0 8px rgba(0, 212, 255, 0); } 
        }
        @keyframes pulse-tech { 
          0% { transform: scale(1); box-shadow: 0 0 10px rgba(0, 212, 255, 0.2); } 
          100% { transform: scale(1.03); box-shadow: 0 0 20px rgba(0, 212, 255, 0.4); } 
        }
        @keyframes pulse-critical-tech { 
          0% { transform: scale(1); box-shadow: 0 0 8px rgba(255, 69, 0, 0.4); opacity: 1; } 
          100% { transform: scale(1.05); box-shadow: 0 0 16px rgba(255, 69, 0, 0.7); opacity: 0.8; } 
        }
      `}</style>
    </Card>
  );
}