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
  if (lower === 'available' || lower === 'online') return { color: 'success', icon: '🎃' };
  if (lower === 'unavailable') return { color: 'error', icon: '👻' };
  return { color: 'default', icon: '💀' };
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
        backgroundColor: 'var(--halloween-paper, #1a0a2e)',
        borderRadius: 3,
        border: '1px solid var(--halloween-primary, #ff6b00)',
        boxShadow: '0 0 25px rgba(255, 107, 0, 0.5)',
      }}>
        <CardContent>
          <Typography variant="overline" sx={{
            fontFamily: '"Nosifer", cursive',
            color: '#ff6b00',
            textShadow: '0 0 8px rgba(255,107,0,0.7)',
            fontSize: '1.1rem',
          }}>
            🧙‍♂️ Performance des agents
          </Typography>
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Chip label="Connexion magique..." size="small" sx={{
              mb: 2,
              background: 'linear-gradient(135deg, #ff8c00, #ff4500)',
              color: 'white',
              fontFamily: '"Nosifer", cursive',
              animation: 'pulse-chip 2s infinite alternate',
            }} />
            <Skeleton variant="rectangular" width="100%" height={400} />
          </Box>
        </CardContent>
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: '-50%',
          width: '200%',
          height: '100%',
          background: 'radial-gradient(circle at 50% 50%, rgba(255,140,0,0.15), transparent 70%)',
          animation: 'smoke-move 15s linear infinite',
          pointerEvents: 'none',
        }} />
        <style>{`
          @keyframes pulse-chip {
            0% { transform: scale(1); box-shadow: 0 0 6px #ff8c00; }
            100% { transform: scale(1.05); box-shadow: 0 0 20px #ff4500; }
          }
          @keyframes smoke-move {
            0% { transform: translateX(0) translateY(0); }
            50% { transform: translateX(-10%) translateY(-5%); }
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
        backgroundColor: 'var(--halloween-paper, #1a0a2e)',
        borderRadius: 3,
        border: '1px solid var(--halloween-primary, #ff6b00)',
        boxShadow: '0 0 25px rgba(255, 107, 0, 0.5)',
      }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="overline" sx={{
              fontFamily: '"Nosifer", cursive',
              color: '#ff6b00',
              textShadow: '0 0 8px rgba(255,107,0,0.7)',
            }}>
              🧙‍♂️ Performance des agents
            </Typography>
            <Tooltip title={isConnected ? "Connecté à la toile magique" : "Déconnecté du sort"}>
              <Box sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: isConnected ? '#01b68a' : '#ff0a0a',
                animation: isConnected ? 'pulse-halloween 2s infinite' : 'none',
              }} />
            </Tooltip>
          </Box>
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              🕸️ Aucun agent dans la citrouille...
            </Typography>
          </Box>
        </CardContent>
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: '-50%',
          width: '200%',
          height: '100%',
          background: 'radial-gradient(circle at 50% 50%, rgba(255,140,0,0.15), transparent 70%)',
          animation: 'smoke-move 15s linear infinite',
          pointerEvents: 'none',
        }} />
      </Card>
    );
  }

  const sortedEmployees = useMemo(() => [...employees].sort((a, b) => ((b.inbound||0)+(b.outbound||0)) - ((a.inbound||0)+(a.outbound||0))), [employees]);
  const getMedalEmoji = (rank) => rank === 0 ? '🥇' : rank === 1 ? '🥈' : rank === 2 ? '🥉' : null;

  return (
    <Card sx={{
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: 'var(--halloween-paper, #1a0a2e)',
      borderRadius: 3,
      border: '1px solid var(--halloween-primary, #ff6b00)',
      boxShadow: '0 0 25px rgba(255, 107, 0, 0.5)',
      backdropFilter: 'blur(4px)',
    }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="overline" sx={{
            fontFamily: '"Nosifer", cursive',
            color: '#ff6b00',
            textShadow: '0 0 8px rgba(255,107,0,0.7)',
            fontSize: '1.1rem',
          }}>
            🧙‍♂️ Performance des agents
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Tooltip title={isConnected ? "Connecté à la toile magique" : "Déconnecté du sort"}>
              <Box sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                bgcolor: isConnected ? '#01b68a' : '#ff0a0a',
                animation: isConnected ? 'pulse-halloween 2s infinite' : 'none',
              }} />
            </Tooltip>
            {lastUpdate && <Typography variant="caption" color="#fff">{`MàJ : ${lastUpdate.toLocaleTimeString()}`}</Typography>}
          </Box>
        </Box>

        <TableContainer component={Box}>
          <Table size="small" aria-label="tableau des performances des agents">
            <TableHead>
              <TableRow>
                {['#','Agent','Status','Appels entrants','Durée moyenne (entrant)','Appels sortants','Durée moyenne (sortant)'].map((label,i)=>(
                  <TableCell key={i} scope="col" sx={{
                    fontWeight:'bold',
                    color:i<=1?'#ffd700':'#ffd700', // ✅ Tous les titres en jaune
                    textShadow:'0 0 6px rgba(255,215,0,0.6)',
                    fontFamily:'"Orbitron", sans-serif',
                    fontSize:'0.85rem'
                  }} align={i>=3?'right':'left'}>{label}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedEmployees.map((emp,index)=>{
                const medal=getMedalEmoji(index);
                const inboundSec=mmssToSeconds(emp.avgInboundAHT);
                const outboundSec=mmssToSeconds(emp.avgOutboundAHT);
                const inboundCritical=getDurationColor(inboundSec)==='error';
                const outboundCritical=getDurationColor(outboundSec)==='error';
                const statusConfig=getStatusConfig(emp.status);

                return (
                  <TableRow key={emp.id||`emp-${index}`} hover sx={{
                    '&:hover': { backgroundColor:'rgba(255,107,0,0.12)', boxShadow:'inset 0 0 15px rgba(255,107,0,0.5)', transform:'scale(1.02)'},
                    transition:'all 0.25s ease-in-out'
                  }}>
                    <TableCell>
                      <Box sx={{display:'flex',alignItems:'center',gap:0.5}}>
                        {medal && <span style={{fontSize:'18px', filter:'drop-shadow(0 0 6px gold)', animation:'medal-glow 2.5s infinite alternate'}}>{medal}</span>}
                        <Typography sx={{color:'#ffd700',fontWeight:'bold'}}>{index+1}</Typography> {/* Numéro en jaune */}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{
                          bgcolor:'#546e7a', width:28, height:28, fontSize:12, mr:1, border:'1px solid #ff6b00',
                          transition:'all 0.3s', '&:hover':{transform:'rotate(10deg) scale(1.1)'}
                        }}>{getInitials(emp.name)||'?'}</Avatar>
                        <Typography sx={{color:'#ffd700',fontWeight:'bold'}}>{emp.name||'-'}</Typography> {/* Nom en jaune */}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={<Box sx={{display:'flex',alignItems:'center',gap:0.5}}>{statusConfig.icon}{emp.status||'online'}</Box>} size="small" sx={{
                        fontWeight:'bold', cursor:'pointer', transition:'all 0.3s ease', '&:hover':{transform:'scale(1.1)', boxShadow:'0 0 10px #ff6b00'},
                        ...(statusConfig.color==='success'?{backgroundColor:'#2e7d32',color:'#fff'}:statusConfig.color==='error'?{backgroundColor:'#d32f2f',color:'#fff'}:{backgroundColor:'#616161',color:'#fff'})
                      }}/>
                    </TableCell>
                    <TableCell align="right"><Typography sx={{color:'#ffd700'}}>{emp.inbound!=null?emp.inbound:'-'}</Typography></TableCell> {/* Appels entrants en jaune */}
                    <TableCell align="right">
                      {emp.avgInboundAHT ? (
                        <Chip
                          label={emp.avgInboundAHT}
                          size="small"
                          sx={{
                            fontWeight: 'bold',
                            minWidth: 60,
                            color: '#fff', // ✅ Texte blanc à l'intérieur de la bulle
                            transition: 'all 0.3s',
                            ...(inboundCritical
                              ? { backgroundColor: '#ff6b00', fontFamily: '"Orbitron", sans-serif', animation: 'pulse-chip 2s infinite alternate' }
                              : getDurationColor(inboundSec) === 'warning'
                              ? { backgroundColor: '#ffaa00' }
                              : { backgroundColor: '#01b68a' }),
                          }}
                        />
                      ) : (
                        <Typography sx={{ color: '#ffd700' }}>-</Typography>
                      )}
                    </TableCell>
                    <TableCell align="right"><Typography sx={{color:'#ffd700'}}>{emp.outbound!=null?emp.outbound:'-'}</Typography></TableCell> {/* Appels sortants en jaune */}
                    <TableCell align="right">
                      {emp.avgOutboundAHT ? (
                        <Chip
                          label={emp.avgOutboundAHT}
                          size="small"
                          sx={{
                            fontWeight: 'bold',
                            minWidth: 60,
                            color: '#fff', // ✅ Texte blanc à l'intérieur de la bulle
                            transition: 'all 0.3s',
                            ...(outboundCritical
                              ? { backgroundColor: '#ff6b00', fontFamily: '"Orbitron", sans-serif', animation: 'pulse-chip 2s infinite alternate' }
                              : getDurationColor(outboundSec) === 'warning'
                              ? { backgroundColor: '#ffaa00' }
                              : { backgroundColor: '#01b68a' }),
                          }}
                        />
                      ) : (
                        <Typography sx={{ color: '#ffd700' }}>-</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
      <Box sx={{
        position:'absolute',
        top:0,
        left:'-50%',
        width:'200%',
        height:'100%',
        background:'radial-gradient(circle at 50% 50%, rgba(255,140,0,0.15), transparent 70%)',
        animation:'smoke-move 15s linear infinite',
        pointerEvents:'none'
      }}/>
      <style>{`
        @keyframes medal-glow {
          0% { filter: drop-shadow(0 0 6px gold); }
          100% { filter: drop-shadow(0 0 12px gold) drop-shadow(0 0 20px orange); }
        }
        @keyframes pulse-halloween {
          0% { transform: scale(1); box-shadow: 0 0 6px #ff6b00; }
          50% { transform: scale(1.05); box-shadow: 0 0 15px #ff8c00; }
          100% { transform: scale(1); box-shadow: 0 0 6px #ff6b00; }
        }
        @keyframes pulse-chip {
          0% { transform: scale(1); box-shadow: 0 0 6px #ff8c00; }
          100% { transform: scale(1.05); box-shadow: 0 0 20px #ff4500; }
        }
        @keyframes smoke-move {
          0% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(-10%) translateY(-5%); }
          100% { transform: translateX(0) translateY(0); }
        }
      `}</style>
    </Card>
  );
}