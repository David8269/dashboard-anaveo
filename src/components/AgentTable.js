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
<<<<<<< HEAD
  if (lower === 'available' || lower === 'online') return { color: 'success', icon: '🥂' };
  if (lower === 'unavailable') return { color: 'warning', icon: '⏸️' };
  return { color: 'default', icon: '⭐' };
=======
  if (lower === 'available' || lower === 'online') return { color: 'success', icon: '🎄' }; // Sapin = disponible
  if (lower === 'unavailable') return { color: 'error', icon: '🎁' }; // Cadeau fermé = indisponible
  return { color: 'default', icon: '❄️' }; // Flocon = autre
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
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
<<<<<<< HEAD
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(6px)', // 👈 Flou ajouté
        WebkitBackdropFilter: 'blur(6px)', // compatibilité
        borderRadius: 3,
        border: '1px solid rgba(212, 175, 55, 0.7)',
        boxShadow: '0 0 20px rgba(212, 175, 55, 0.5)',
      }}>
        <CardContent>
          <Typography variant="overline" sx={{
            fontFamily: '"Orbitron", sans-serif',
            color: '#d4af37',
            textShadow: '0 0 8px rgba(212, 175, 55, 0.8)',
            fontSize: '1.2rem',
            fontWeight: 'bold',
          }}>
            🥂 Célébration des excellences 2026
          </Typography>
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Chip label="Connexion au gala..." size="small" sx={{
              mb: 2,
              background: 'linear-gradient(135deg, #000, #333)',
              color: '#ffd700',
              fontFamily: '"Great Vibes", cursive',
              animation: 'pulse-gold 2s infinite alternate',
            }} />
            <Skeleton variant="rectangular" width="100%" height={400} sx={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
=======
        backgroundColor: 'rgba(255, 255, 255, 0.70)', // ✅ Transparence appliquée (cohérente avec le dashboard)
        borderRadius: 3,
        border: '1px solid var(--christmas-primary, #d42426)',
        boxShadow: '0 0 20px rgba(212, 36, 38, 0.4)',
      }}>
        <CardContent>
          <Typography variant="overline" sx={{
            fontFamily: '"Mountains of Christmas", cursive',
            color: '#d42426',
            textShadow: '0 0 6px rgba(255,215,0,0.6)',
            fontSize: '1.1rem',
          }}>
            🎁 Performance des lutins
          </Typography>
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Chip label="Connexion au traîneau..." size="small" sx={{
              mb: 2,
              background: 'linear-gradient(135deg, #d42426, #8b0000)',
              color: '#ffd700',
              fontFamily: '"Mountains of Christmas", cursive',
              animation: 'pulse-chip 2s infinite alternate',
            }} />
            <Skeleton variant="rectangular" width="100%" height={400} />
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
          </Box>
        </CardContent>
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: '-50%',
          width: '200%',
          height: '100%',
<<<<<<< HEAD
          background: 'radial-gradient(circle at 50% 50%, rgba(212,175,55,0.08), transparent 70%)',
          animation: 'gold-glow 15s linear infinite',
          pointerEvents: 'none',
        }} />
        <style>{`
          @keyframes pulse-gold {
            0% { transform: scale(1); box-shadow: 0 0 8px #ffd700; }
            100% { transform: scale(1.04); box-shadow: 0 0 20px #ffd700; }
          }
          @keyframes gold-glow {
            0% { transform: translateX(0) translateY(0); }
            50% { transform: translateX(-6%) translateY(-3%); }
=======
          background: 'radial-gradient(circle at 50% 50%, rgba(212,36,38,0.1), transparent 70%)',
          animation: 'snow-glow 15s linear infinite',
          pointerEvents: 'none',
        }} />
        <style>{`
          @keyframes pulse-chip {
            0% { transform: scale(1); box-shadow: 0 0 6px #ffd700; }
            100% { transform: scale(1.05); box-shadow: 0 0 16px #ffaa00; }
          }
          @keyframes snow-glow {
            0% { transform: translateX(0) translateY(0); }
            50% { transform: translateX(-8%) translateY(-4%); }
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
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
<<<<<<< HEAD
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(6px)', // 👈 Flou ajouté
        WebkitBackdropFilter: 'blur(6px)', // compatibilité
        borderRadius: 3,
        border: '1px solid rgba(212, 175, 55, 0.7)',
        boxShadow: '0 0 20px rgba(212, 175, 55, 0.5)',
=======
        backgroundColor: 'rgba(255, 255, 255, 0.70)', // ✅ Transparence appliquée
        borderRadius: 3,
        border: '1px solid var(--christmas-primary, #d42426)',
        boxShadow: '0 0 20px rgba(212, 36, 38, 0.4)',
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
      }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="overline" sx={{
<<<<<<< HEAD
              fontFamily: '"Orbitron", sans-serif',
              color: '#d4af37',
              textShadow: '0 0 8px rgba(212, 175, 55, 0.8)',
              fontSize: '1.2rem',
              fontWeight: 'bold',
            }}>
              🥂 Célébration des excellences 2026
            </Typography>
            <Tooltip title={isConnected ? "Connecté au gala" : "Déconnecté"}>
=======
              fontFamily: '"Mountains of Christmas", cursive',
              color: '#d42426',
              textShadow: '0 0 6px rgba(255,215,0,0.6)',
            }}>
              🎁 Performance des lutins
            </Typography>
            <Tooltip title={isConnected ? "Connecté au Père Noël" : "Déconnecté du traîneau"}>
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
              <Box sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
<<<<<<< HEAD
                bgcolor: isConnected ? '#d4af37' : '#8b0000',
                animation: isConnected ? 'pulse-glow 2s infinite' : 'none',
=======
                bgcolor: isConnected ? '#228b22' : '#d42426',
                animation: isConnected ? 'pulse-christmas 2s infinite' : 'none',
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
              }} />
            </Tooltip>
          </Box>
          <Box sx={{ py: 4, textAlign: 'center' }}>
<<<<<<< HEAD
            <Typography variant="body2" color="#ffd700" sx={{ textShadow: '0 0 6px rgba(212,175,55,0.6)' }}>
              🌟 Aucun agent en scène...
=======
            <Typography variant="body2" color="text.secondary">
              🎄 Aucun lutin dans l’atelier...
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
            </Typography>
          </Box>
        </CardContent>
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: '-50%',
          width: '200%',
          height: '100%',
<<<<<<< HEAD
          background: 'radial-gradient(circle at 50% 50%, rgba(212,175,55,0.08), transparent 70%)',
          animation: 'gold-glow 15s linear infinite',
=======
          background: 'radial-gradient(circle at 50% 50%, rgba(212,36,38,0.1), transparent 70%)',
          animation: 'snow-glow 15s linear infinite',
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
          pointerEvents: 'none',
        }} />
      </Card>
    );
  }

<<<<<<< HEAD
  const sortedEmployees = useMemo(() => [...employees].sort((a, b) => ((b.inbound || 0) + (b.outbound || 0)) - ((a.inbound || 0) + (a.outbound || 0))), [employees]);
  const getMedalEmoji = (rank) => rank === 0 ? '🏆' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : null;
=======
  const sortedEmployees = useMemo(() => [...employees].sort((a, b) => ((b.inbound||0)+(b.outbound||0)) - ((a.inbound||0)+(a.outbound||0))), [employees]);
  const getMedalEmoji = (rank) => rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : null;
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5

  return (
    <Card sx={{
      position: 'relative',
      overflow: 'hidden',
<<<<<<< HEAD
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
      backdropFilter: 'blur(6px)', // 👈 Flou ajouté
      WebkitBackdropFilter: 'blur(6px)', // compatibilité
      borderRadius: 3,
      border: '1px solid rgba(212, 175, 55, 0.7)',
      boxShadow: '0 0 20px rgba(212, 175, 55, 0.5)',
=======
      backgroundColor: 'rgba(255, 255, 255, 0.70)', // ✅ Transparence appliquée
      borderRadius: 3,
      border: '1px solid var(--christmas-primary, #d42426)',
      boxShadow: '0 0 20px rgba(212, 36, 38, 0.4)',
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
    }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="overline" sx={{
<<<<<<< HEAD
            fontFamily: '"Orbitron", sans-serif',
            color: '#d4af37',
            textShadow: '0 0 8px rgba(212, 175, 55, 0.8)',
            fontSize: '1.2rem',
            fontWeight: 'bold',
          }}>
            🥂 Célébration des excellences 2026
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title={isConnected ? "Connecté au gala" : "Déconnecté"}>
=======
            fontFamily: '"Mountains of Christmas", cursive',
            color: '#d42426',
            textShadow: '0 0 6px rgba(255,215,0,0.6)',
            fontSize: '1.1rem',
          }}>
            🎁 Performance des lutins
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title={isConnected ? "Connecté au Père Noël" : "Déconnecté du traîneau"}>
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
              <Box sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
<<<<<<< HEAD
                bgcolor: isConnected ? '#d4af37' : '#8b0000',
                animation: isConnected ? 'pulse-glow 2s infinite' : 'none',
              }} />
            </Tooltip>
            {lastUpdate && (
              <Typography variant="caption" color="#ffd700" sx={{ textShadow: '0 0 4px rgba(212,175,55,0.5)' }}>
                {`MàJ : ${lastUpdate.toLocaleTimeString()}`}
              </Typography>
            )}
=======
                bgcolor: isConnected ? '#228b22' : '#d42426',
                animation: isConnected ? 'pulse-christmas 2s infinite' : 'none',
              }} />
            </Tooltip>
            {lastUpdate && <Typography variant="caption" color="#000">{`MàJ : ${lastUpdate.toLocaleTimeString()}`}</Typography>}
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
          </Box>
        </Box>

        <TableContainer component={Box}>
          <Table size="small" aria-label="tableau des performances des agents">
            <TableHead>
              <TableRow>
<<<<<<< HEAD
                {['#', 'Agent', 'Statut', 'Appels entrants', 'Durée moy (entrant)', 'Appels sortants', 'Durée moy (sortant)'].map((label, i) => (
                  <TableCell
                    key={i}
                    scope="col"
                    sx={{
                      fontWeight: 'bold',
                      color: '#ffd700',
                      textShadow: '0 0 6px rgba(212,175,55,0.7)',
                      fontFamily: '"Orbitron", sans-serif',
                      fontSize: '0.85rem',
                    }}
                    align={i >= 3 ? 'right' : 'left'}
                  >
                    {label}
                  </TableCell>
=======
                {['#','Agent','Status','Appels entrants','Durée moyenne (entrant)','Appels sortants','Durée moyenne (sortant)'].map((label,i)=>(
                  <TableCell key={i} scope="col" sx={{
                    fontWeight:'bold',
                    color: '#000',
                    textShadow:'0 0 4px rgba(255,215,0,0.5)',
                    fontFamily:'"Mountains of Christmas", cursive',
                    fontSize:'0.85rem'
                  }} align={i>=3?'right':'left'}>{label}</TableCell>
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
<<<<<<< HEAD
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
                        backgroundColor: 'rgba(212, 175, 55, 0.08)',
                        boxShadow: 'inset 0 0 12px rgba(212, 175, 55, 0.4)',
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
                              filter: 'drop-shadow(0 0 8px gold)',
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
                            bgcolor: '#d4af37',
                            color: '#000',
                            width: 28,
                            height: 28,
                            fontSize: 12,
                            mr: 1,
                            border: '1px solid #ffd700',
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
                            {emp.status || 'actif'}
                          </Box>
                        }
                        size="small"
                        sx={{
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.1)',
                            boxShadow: '0 0 12px #ffd700',
                          },
                          ...(statusConfig.color === 'success'
                            ? { backgroundColor: '#228b22', color: '#fff' }
                            : statusConfig.color === 'warning'
                            ? { backgroundColor: '#ffaa00', color: '#000' }
                            : { backgroundColor: '#616161', color: '#fff' }),
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ color: '#fff' }}>{emp.inbound != null ? emp.inbound : '-'}</Typography>
                    </TableCell>
=======
              {sortedEmployees.map((emp,index)=>{
                const medal=getMedalEmoji(index);
                const inboundSec=mmssToSeconds(emp.avgInboundAHT);
                const outboundSec=mmssToSeconds(emp.avgOutboundAHT);
                const inboundCritical=getDurationColor(inboundSec)==='error';
                const outboundCritical=getDurationColor(outboundSec)==='error';
                const statusConfig=getStatusConfig(emp.status);

                return (
                  <TableRow key={emp.id||`emp-${index}`} hover sx={{
                    '&:hover': { backgroundColor:'rgba(212,36,38,0.08)', boxShadow:'inset 0 0 12px rgba(212,36,38,0.4)', transform:'scale(1.02)'},
                    transition:'all 0.25s ease-in-out'
                  }}>
                    <TableCell>
                      <Box sx={{display:'flex',alignItems:'center',gap:0.5}}>
                        {medal && <span style={{fontSize:'18px', filter:'drop-shadow(0 0 6px gold)', animation:'medal-glow 2.5s infinite alternate'}}>{medal}</span>}
                        <Typography sx={{color:'#000',fontWeight:'bold'}}>{index+1}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{
                          bgcolor:'#2e8b57', width:28, height:28, fontSize:12, mr:1, border:'1px solid #d42426',
                          transition:'all 0.3s', '&:hover':{transform:'rotate(5deg) scale(1.1)'}
                        }}>{getInitials(emp.name)||'?'}</Avatar>
                        <Typography sx={{color:'#000',fontWeight:'bold'}}>{emp.name||'-'}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={<Box sx={{display:'flex',alignItems:'center',gap:0.5}}>{statusConfig.icon}{emp.status||'online'}</Box>} size="small" sx={{
                        fontWeight:'bold',
                        cursor:'pointer',
                        transition:'all 0.3s ease',
                        '&:hover':{transform:'scale(1.1)', boxShadow:'0 0 10px #ffd700'},
                        ...(statusConfig.color==='success'
                          ? { backgroundColor: '#228b22', color: '#fff' }
                          : statusConfig.color==='error'
                          ? { backgroundColor: '#d42426', color: '#fff' }
                          : { backgroundColor: '#616161', color: '#fff' })
                      }}/>
                    </TableCell>
                    <TableCell align="right"><Typography sx={{color:'#000'}}>{emp.inbound!=null?emp.inbound:'-'}</Typography></TableCell>
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
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
<<<<<<< HEAD
                              ? {
                                  backgroundColor: '#8b0000',
                                  fontFamily: '"Great Vibes", cursive',
                                  animation: 'pulse-gold 2s infinite alternate',
                                }
=======
                              ? { backgroundColor: '#d42426', fontFamily: '"Mountains of Christmas", cursive', animation: 'pulse-chip 2s infinite alternate' }
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
                              : getDurationColor(inboundSec) === 'warning'
                              ? { backgroundColor: '#ffaa00', color: '#000' }
                              : { backgroundColor: '#228b22' }),
                          }}
                        />
                      ) : (
<<<<<<< HEAD
                        <Typography sx={{ color: '#fff' }}>-</Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ color: '#fff' }}>{emp.outbound != null ? emp.outbound : '-'}</Typography>
                    </TableCell>
=======
                        <Typography sx={{ color: '#000' }}>-</Typography>
                      )}
                    </TableCell>
                    <TableCell align="right"><Typography sx={{color:'#000'}}>{emp.outbound!=null?emp.outbound:'-'}</Typography></TableCell>
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
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
<<<<<<< HEAD
                              ? {
                                  backgroundColor: '#8b0000',
                                  fontFamily: '"Great Vibes", cursive',
                                  animation: 'pulse-gold 2s infinite alternate',
                                }
=======
                              ? { backgroundColor: '#d42426', fontFamily: '"Mountains of Christmas", cursive', animation: 'pulse-chip 2s infinite alternate' }
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
                              : getDurationColor(outboundSec) === 'warning'
                              ? { backgroundColor: '#ffaa00', color: '#000' }
                              : { backgroundColor: '#228b22' }),
                          }}
                        />
                      ) : (
<<<<<<< HEAD
                        <Typography sx={{ color: '#fff' }}>-</Typography>
=======
                        <Typography sx={{ color: '#000' }}>-</Typography>
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
<<<<<<< HEAD
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: '-50%',
          width: '200%',
          height: '100%',
          background: 'radial-gradient(circle at 50% 50%, rgba(212,175,55,0.08), transparent 70%)',
          animation: 'gold-glow 15s linear infinite',
          pointerEvents: 'none',
        }}
      />
=======
      <Box sx={{
        position:'absolute',
        top:0,
        left:'-50%',
        width:'200%',
        height:'100%',
        background:'radial-gradient(circle at 50% 50%, rgba(212,36,38,0.1), transparent 70%)',
        animation:'snow-glow 15s linear infinite',
        pointerEvents:'none'
      }}/>
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
      <style>{`
        @keyframes medal-glow {
          0% { filter: drop-shadow(0 0 6px gold); }
          100% { filter: drop-shadow(0 0 12px gold) drop-shadow(0 0 20px #ffd700); }
        }
<<<<<<< HEAD
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.7); }
          50% { box-shadow: 0 0 0 8px rgba(212, 175, 55, 0); }
        }
        @keyframes pulse-gold {
          0% { transform: scale(1); box-shadow: 0 0 8px #ffd700; }
          100% { transform: scale(1.04); box-shadow: 0 0 20px #ffd700; }
        }
        @keyframes gold-glow {
          0% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(-6%) translateY(-3%); }
=======
        @keyframes pulse-christmas {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34, 139, 34, 0.7); }
          50% { box-shadow: 0 0 0 8px rgba(34, 139, 34, 0); }
        }
        @keyframes pulse-chip {
          0% { transform: scale(1); box-shadow: 0 0 6px #ffd700; }
          100% { transform: scale(1.05); box-shadow: 0 0 16px #ffaa00; }
        }
        @keyframes snow-glow {
          0% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(-8%) translateY(-4%); }
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
          100% { transform: translateX(0) translateY(0); }
        }
      `}</style>
    </Card>
  );
}