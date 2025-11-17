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
  if (!status) return { color: 'default', label: 'Inconnu' };
  const lower = status.toLowerCase();
  if (lower === 'available' || lower === 'online') return { color: 'success', label: 'Disponible' };
  if (lower === 'unavailable') return { color: 'error', label: 'Occupé' };
  return { color: 'default', label: 'Hors ligne' };
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

// ✅ Style réutilisable : fond orange pastel et bordure marron (comme l'horloge)
const cardStyle = {
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: 'rgba(255, 235, 220, 0.8)', // 🍊 Orange pastel (comme l'horloge)
  borderRadius: 3,
  border: '1px solid #8D6E63', // Bordure marron (comme l'horloge)
  boxShadow: '0 2px 6px rgba(141, 110, 99, 0.2)', // Ombre subtile (comme l'horloge)
};

export default function AgentTable({ employees = [], isLoading = false, isConnected = false, lastUpdate = null }) {
  if (isLoading) {
    return (
      <Card sx={cardStyle}>
        <CardContent>
          <Typography variant="overline" sx={{
            fontFamily: '"Playfair Display", serif',
            color: 'var(--wine-primary)',
            fontWeight: 'bold',
            fontSize: '1.2rem',
            zIndex: 2, // Pour être au-dessus de l'ornement
            position: 'relative',
          }}>
            🍷 Performance des agents
          </Typography>
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Chip 
              label="Chargement..." 
              size="small" 
              sx={{
                mb: 2,
                background: 'linear-gradient(135deg, var(--wine-primary), var(--wine-secondary))',
                color: 'white',
                fontWeight: 'bold',
              }} 
            />
            <Skeleton variant="rectangular" width="100%" height={400} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!employees || employees.length === 0) {
    return (
      <Card sx={cardStyle}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="overline" sx={{
              fontFamily: '"Playfair Display", serif',
              color: 'var(--wine-primary)',
              fontWeight: 'bold',
              zIndex: 2,
              position: 'relative',
            }}>
              🍷 Performance des agents
            </Typography>
            <Tooltip title={isConnected ? "Connecté" : "Déconnecté"}>
              <Box sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: isConnected ? '#388E3C' : '#D32F2F',
                zIndex: 2,
                position: 'relative',
              }} />
            </Tooltip>
          </Box>
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="var(--wine-text)" zIndex={2} position="relative">
              Aucun agent disponible.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const sortedEmployees = useMemo(() => 
    [...employees].sort((a, b) => ((b.inbound || 0) + (b.outbound || 0)) - ((a.inbound || 0) + (a.outbound || 0)))
  , [employees]);

  const getMedalEmoji = (rank) => 
    rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : null;

  return (
    <Card sx={cardStyle}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="overline" sx={{
            fontFamily: '"Playfair Display", serif',
            color: 'var(--wine-primary)',
            fontWeight: 'bold',
            fontSize: '1.2rem',
            zIndex: 2,
            position: 'relative',
          }}>
            🍷 Performance des agents
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title={isConnected ? "Connecté" : "Déconnecté"}>
              <Box sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: isConnected ? '#388E3C' : '#D32F2F',
                zIndex: 2,
                position: 'relative',
              }} />
            </Tooltip>
            {lastUpdate && (
              <Typography variant="caption" color="var(--wine-text)" zIndex={2} position="relative">
                {`MàJ : ${lastUpdate.toLocaleTimeString()}`}
              </Typography>
            )}
          </Box>
        </Box>

        <TableContainer component={Box} sx={{ zIndex: 2, position: 'relative' }}> {/* Pour être au-dessus de l'ornement */}
          <Table size="small" aria-label="tableau des performances des agents">
            <TableHead>
              <TableRow>
                {['#','Agent','Statut','Appels entrants','Durée moyenne (entrant)','Appels sortants','Durée moyenne (sortant)'].map((label, i) => (
                  <TableCell 
                    key={i} 
                    scope="col" 
                    sx={{
                      fontWeight: 'bold',
                      color: 'var(--wine-text)',
                      fontFamily: '"Roboto", sans-serif',
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
                        backgroundColor: 'rgba(141, 110, 99, 0.15)', // Hover plus foncé
                        transform: 'scale(1.01)'
                      },
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {medal && <span style={{ fontSize: '18px' }}>{medal}</span>}
                        <Typography sx={{ color: 'var(--wine-text)', fontWeight: 'bold' }}>
                          {index + 1}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar 
                          sx={{
                            bgcolor: 'var(--wine-accent)', 
                            width: 28, 
                            height: 28, 
                            fontSize: 12, 
                            mr: 1,
                            color: '#fff'
                          }}
                        >
                          {getInitials(emp.name) || '?'}
                        </Avatar>
                        <Typography sx={{ color: 'var(--wine-text)', fontWeight: 'bold' }}>
                          {emp.name || '-'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={statusConfig.label}
                        size="small"
                        sx={{
                          fontWeight: 'bold',
                          color: '#fff',
                          ...(statusConfig.color === 'success' 
                            ? { backgroundColor: '#388E3C' }
                            : statusConfig.color === 'error' 
                            ? { backgroundColor: '#D32F2F' }
                            : { backgroundColor: '#9E9E9E' }),
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ color: 'var(--wine-text)' }}>
                        {emp.inbound != null ? emp.inbound : '-'}
                      </Typography>
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
                            ...(inboundCritical
                              ? { backgroundColor: '#D32F2F' }
                              : getDurationColor(inboundSec) === 'warning'
                              ? { backgroundColor: '#F57C00' }
                              : { backgroundColor: '#388E3C' }),
                          }}
                        />
                      ) : (
                        <Typography sx={{ color: 'var(--wine-text)' }}>-</Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ color: 'var(--wine-text)' }}>
                        {emp.outbound != null ? emp.outbound : '-'}
                      </Typography>
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
                            ...(outboundCritical
                              ? { backgroundColor: '#D32F2F' }
                              : getDurationColor(outboundSec) === 'warning'
                              ? { backgroundColor: '#F57C00' }
                              : { backgroundColor: '#388E3C' }),
                          }}
                        />
                      ) : (
                        <Typography sx={{ color: 'var(--wine-text)' }}>-</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}