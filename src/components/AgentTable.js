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

// === 🎃 Style de base "Citrouille de Verre" (TRANSPARENCE MAXIMALE) ===
const frostedGlassSx = {
  position: 'relative',
  overflow: 'hidden',
  background: 'linear-gradient(135deg, rgba(10, 5, 10, 0.35), rgba(26, 15, 26, 0.25))', // ✅ Transparence accrue
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  borderRadius: '20px',
  border: '1px solid rgba(255, 107, 53, 0.4)',
  borderTop: '3px solid #ffaa00',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 0 20px rgba(255, 107, 53, 0.05)',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  '&::before': {
    content: '""', position: 'absolute', top: 0, left: '-100%', width: '100%', height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent)', transition: 'left 0.6s ease',
  },
  '&:hover': {
    borderColor: 'rgba(255, 140, 100, 0.6)',
    boxShadow: '0 12px 40px rgba(255, 107, 53, 0.3), 0 0 30px rgba(255, 107, 53, 0.2)',
    transform: 'translateY(-4px)',
    '&::before': { left: '100%' }
  }
};

export default function AgentTable({ employees = [], isLoading = false, isConnected = false, lastUpdate = null }) {
  if (isLoading) {
    return (
      <Card sx={frostedGlassSx}>
        <CardContent>
          <Typography variant="overline" sx={{ fontFamily: '"Creepster", "Dancing Script", cursive', color: '#ffaa00', textShadow: '0 0 10px rgba(0,0,0,0.95), 0 2px 4px rgba(0,0,0,0.9)', fontSize: '1.8rem', fontWeight: 700, mb: 2, letterSpacing: '0.05em' }}>🎃 Équipe</Typography>
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Chip label="Chargement en cours..." size="small" sx={{ mb: 2, background: 'rgba(255, 107, 53, 0.2)', backdropFilter: 'blur(6px)', color: '#ffffff', fontFamily: '"Montserrat", sans-serif', fontWeight: 700, animation: 'pulse-halloween 2s infinite alternate', border: '1px solid rgba(255, 170, 0, 0.5)' }} />
            <Skeleton variant="rectangular" width="100%" height={400} sx={{ backgroundColor: 'rgba(0, 0, 0, 0.25)', borderRadius: '12px' }} />
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
            <Typography variant="overline" sx={{ fontFamily: '"Creepster", "Dancing Script", cursive', color: '#ffaa00', textShadow: '0 0 10px rgba(0,0,0,0.95), 0 2px 4px rgba(0,0,0,0.9)', fontSize: '1.8rem', fontWeight: 700, letterSpacing: '0.05em' }}>🎃 Équipe</Typography>
            <Tooltip title={isConnected ? "Connecté au CDS" : "Déconnecté"}>
              <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: isConnected ? '#39ff14' : '#ff0040', animation: isConnected ? 'pulse-glow-green 2s infinite' : 'none', boxShadow: isConnected ? '0 0 12px rgba(57, 255, 20, 0.8)' : 'none', border: '2px solid rgba(255, 255, 255, 0.5)' }} />
            </Tooltip>
          </Box>
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography variant="body1" sx={{ color: '#ffffff', fontStyle: 'italic', textShadow: '0 0 10px rgba(0,0,0,0.95), 0 2px 4px rgba(0,0,0,0.9)', fontFamily: '"Inter", sans-serif', fontSize: '1.1rem' }}>Le cimetière est calme... Aucun agent en service. 👻</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const sortedEmployees = useMemo(() => [...employees].sort((a, b) => ((b.inbound || 0) + (b.outbound || 0)) - ((a.inbound || 0) + (a.outbound || 0))), [employees]);
  const getMedalEmoji = (rank) => rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : '🎃';

  return (
    <Card sx={frostedGlassSx}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="overline" sx={{ fontFamily: '"Creepster", "Dancing Script", cursive', color: '#ffaa00', textShadow: '0 0 10px rgba(0,0,0,0.95), 0 2px 4px rgba(0,0,0,0.9)', fontSize: '1.8rem', fontWeight: 700, letterSpacing: '0.05em' }}>🎃 Équipe</Typography>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Tooltip title={isConnected ? "Connecté au CDS" : "Déconnecté"}>
              <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: isConnected ? '#39ff14' : '#ff0040', animation: isConnected ? 'pulse-glow-green 2s infinite' : 'none', boxShadow: isConnected ? '0 0 12px rgba(57, 255, 20, 0.8)' : 'none', border: '2px solid rgba(255, 255, 255, 0.5)' }} />
            </Tooltip>
            {lastUpdate && (
              <Typography variant="caption" sx={{ color: '#ffffff', fontStyle: 'italic', textShadow: '0 0 8px rgba(0,0,0,0.95), 0 1px 3px rgba(0,0,0,0.9)', fontFamily: '"Inter", sans-serif', fontWeight: 600, fontSize: '0.85rem' }}>{`MàJ : ${lastUpdate.toLocaleTimeString()}`}</Typography>
            )}
          </Box>
        </Box>

        <TableContainer component={Box}>
          <Table size="small" aria-label="tableau des performances des agents">
            <TableHead>
              <TableRow>
                {['#', 'Agent', 'Statut', 'Appels entrants', 'AHT Entrant', 'Appels sortants', 'AHT Sortant'].map((label, i) => (
                  <TableCell key={i} scope="col" sx={{ fontWeight: 800, color: '#ffaa00', fontFamily: '"Montserrat", sans-serif', fontSize: '0.8rem', borderBottom: '2px solid rgba(255, 170, 0, 0.5)', backgroundColor: 'rgba(0, 0, 0, 0.25)', textShadow: '0 0 8px rgba(0,0,0,0.95), 0 2px 4px rgba(0,0,0,0.9)', letterSpacing: '0.5px', textTransform: 'uppercase', py: 1.5 }} align={i >= 3 ? 'right' : 'left'}>{label}</TableCell>
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
                  <TableRow key={emp.id || `emp-${index}`} hover sx={{ backgroundColor: 'rgba(0, 0, 0, 0.20)', '&:hover': { backgroundColor: 'rgba(255, 107, 53, 0.15)', boxShadow: 'inset 0 0 20px rgba(255, 107, 53, 0.1)' }, transition: 'all 0.3s ease', '&:not(:last-child)': { borderBottom: '1px solid rgba(255, 107, 53, 0.15)' } }}>
                    <TableCell sx={{ py: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {medal && <span style={{ fontSize: '22px', filter: 'drop-shadow(0 0 8px rgba(255, 170, 0, 0.8))', animation: 'medal-glow-halloween 2.5s infinite alternate' }}>{medal}</span>}
                        <Typography sx={{ color: '#ffffff', fontWeight: 800, textShadow: '0 0 10px rgba(0,0,0,0.95), 0 2px 4px rgba(0,0,0,0.9)', fontFamily: '"Montserrat", sans-serif', fontSize: '1rem' }}>{index + 1}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Box display="flex" alignItems="center">
                        <Avatar src={avatarSrc} alt={emp.name || 'Agent'} sx={{ width: 44, height: 44, mr: 1.5, border: '2px solid rgba(255, 170, 0, 0.6)', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.6)', transition: 'all 0.3s', objectFit: 'cover', '&:hover': { transform: 'scale(1.15)', boxShadow: '0 0 20px rgba(255, 107, 53, 0.6)', borderColor: '#9d4edd' }, bgcolor: !avatarSrc ? 'rgba(157, 78, 221, 0.4)' : 'transparent', color: !avatarSrc ? '#ffffff' : 'inherit', fontWeight: 700, fontSize: '1rem' }}>
                          {!avatarSrc && getInitials(emp.name)}
                        </Avatar>
                        <Typography sx={{ color: '#ffffff', fontWeight: 600, textShadow: '0 0 10px rgba(0,0,0,0.95), 0 2px 4px rgba(0,0,0,0.9)', fontFamily: '"Inter", sans-serif', fontSize: '0.95rem' }}>{emp.name || '-'}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Chip label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.8rem' }}>{statusConfig.icon}{emp.status || 'Online'}</Box>} size="small" sx={{ fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s ease', backgroundColor: 'rgba(0, 0, 0, 0.35)', backdropFilter: 'blur(4px)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.3)', '&:hover': { transform: 'scale(1.05)', boxShadow: '0 0 15px rgba(255, 107, 53, 0.5)', backgroundColor: 'rgba(255, 107, 53, 0.3)', borderColor: 'rgba(255, 107, 53, 0.8)' } }} />
                    </TableCell>
                    <TableCell align="right" sx={{ py: 1.5 }}>
                      <Typography sx={{ color: '#ffffff', fontWeight: 700, textShadow: '0 0 10px rgba(0,0,0,0.95), 0 2px 4px rgba(0,0,0,0.9)', fontFamily: '"Inter", sans-serif', fontSize: '0.95rem' }}>{emp.inbound != null ? emp.inbound : '-'}</Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ py: 1.5 }}>
                      {emp.avgInboundAHT ? (
                        <Chip label={emp.avgInboundAHT} size="small" sx={{ fontWeight: 700, minWidth: 65, border: '1px solid', backgroundColor: 'rgba(0, 0, 0, 0.35)', backdropFilter: 'blur(4px)', fontSize: '0.85rem', ...(inboundCritical ? { backgroundColor: 'rgba(255, 69, 0, 0.8)', color: '#ffffff', borderColor: '#ff4500', fontFamily: '"Montserrat", sans-serif', animation: 'pulse-critical-halloween 1.5s infinite alternate', boxShadow: '0 0 10px rgba(255, 69, 0, 0.6)' } : getDurationColor(inboundSec) === 'warning' ? { backgroundColor: 'rgba(255, 170, 0, 0.8)', color: '#000000', borderColor: '#ffaa00', boxShadow: '0 0 8px rgba(255, 170, 0, 0.4)' } : { backgroundColor: 'rgba(57, 255, 20, 0.8)', color: '#000000', borderColor: '#39ff14', boxShadow: '0 0 8px rgba(57, 255, 20, 0.4)' }) }} />
                      ) : <Typography sx={{ color: '#8b7355', textShadow: '0 0 8px rgba(0,0,0,0.95)' }}>-</Typography>}
                    </TableCell>
                    <TableCell align="right" sx={{ py: 1.5 }}>
                      <Typography sx={{ color: '#ffffff', fontWeight: 700, textShadow: '0 0 10px rgba(0,0,0,0.95), 0 2px 4px rgba(0,0,0,0.9)', fontFamily: '"Inter", sans-serif', fontSize: '0.95rem' }}>{emp.outbound != null ? emp.outbound : '-'}</Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ py: 1.5 }}>
                      {emp.avgOutboundAHT ? (
                        <Chip label={emp.avgOutboundAHT} size="small" sx={{ fontWeight: 700, minWidth: 65, border: '1px solid', backgroundColor: 'rgba(0, 0, 0, 0.35)', backdropFilter: 'blur(4px)', fontSize: '0.85rem', ...(outboundCritical ? { backgroundColor: 'rgba(255, 69, 0, 0.8)', color: '#ffffff', borderColor: '#ff4500', fontFamily: '"Montserrat", sans-serif', animation: 'pulse-critical-halloween 1.5s infinite alternate', boxShadow: '0 0 10px rgba(255, 69, 0, 0.6)' } : getDurationColor(outboundSec) === 'warning' ? { backgroundColor: 'rgba(255, 170, 0, 0.8)', color: '#000000', borderColor: '#ffaa00', boxShadow: '0 0 8px rgba(255, 170, 0, 0.4)' } : { backgroundColor: 'rgba(57, 255, 20, 0.8)', color: '#000000', borderColor: '#39ff14', boxShadow: '0 0 8px rgba(57, 255, 20, 0.4)' }) }} />
                      ) : <Typography sx={{ color: '#8b7355', textShadow: '0 0 8px rgba(0,0,0,0.95)' }}>-</Typography>}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
      <style>{`
        @keyframes medal-glow-halloween { 0% { filter: drop-shadow(0 0 4px rgba(255, 170, 0, 0.5)); } 100% { filter: drop-shadow(0 0 12px rgba(255, 170, 0, 0.8)) drop-shadow(0 0 18px rgba(157, 78, 221, 0.6)); } }
        @keyframes pulse-glow-green { 0%, 100% { box-shadow: 0 0 0 0 rgba(57, 255, 20, 0.5); } 50% { box-shadow: 0 0 0 8px rgba(57, 255, 20, 0); } }
        @keyframes pulse-halloween { 0% { transform: scale(1); box-shadow: 0 0 10px rgba(255, 107, 53, 0.3); } 100% { transform: scale(1.05); box-shadow: 0 0 20px rgba(157, 78, 221, 0.5); } }
        @keyframes pulse-critical-halloween { 0% { transform: scale(1); box-shadow: 0 0 8px rgba(255, 69, 0, 0.6); opacity: 1; } 100% { transform: scale(1.05); box-shadow: 0 0 16px rgba(255, 0, 0, 0.9); opacity: 0.8; } }
      `}</style>
    </Card>
  );
}