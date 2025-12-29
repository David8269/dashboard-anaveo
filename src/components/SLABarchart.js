import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Skeleton,
  Chip,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

<<<<<<< HEAD
const INBOUND_COLOR = '#d4af37';   // Or ancien
const OUTBOUND_COLOR = '#2e8b57'; // Vert forêt élégant
=======
const INBOUND_COLOR = '#d42426'; // Rouge cadeau
const OUTBOUND_COLOR = '#228b22'; // Vert sapin
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5

const formatNumber = (num) => (num >= 1000 ? (num / 1000).toFixed(1) + 'k' : num.toString());

const hideZeroLabels = (value) => (value === 0 ? '' : formatNumber(value));

function SLABarchart({ slaData = [], wsConnected = false }) {
  const [data, setData] = useState([]);
  const [animate, setAnimate] = useState(false);
  const prevSlaDataRef = useRef([]);

  useEffect(() => {
    const prev = prevSlaDataRef.current;
    const hasChanged =
      prev.length !== slaData.length ||
      prev.some((d, i) => d.inbound !== slaData[i]?.inbound || d.outbound !== slaData[i]?.outbound);

    if (hasChanged) {
      setData(slaData);
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 600);
      return () => clearTimeout(timer);
    }

    prevSlaDataRef.current = slaData;
  }, [slaData]);

  const commonFont = { fontFamily: '"Mountains of Christmas", cursive', fontWeight: 'bold' };

  if (data.length === 0) {
    return (
      <Card
        sx={{
<<<<<<< HEAD
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(6px)', // 👈 Flou ajouté
          WebkitBackdropFilter: 'blur(6px)', // compatibilité
          width: '100%',
          borderRadius: 3,
          border: '1px solid rgba(212, 175, 55, 0.7)',
          boxShadow: '0 0 15px rgba(212, 175, 55, 0.5)',
=======
          backgroundColor: 'rgba(255, 255, 255, 0.70)', // ✅ Transparence appliquée
          width: '100%',
          borderRadius: 3,
          border: '1px solid #d42426',
          boxShadow: '0 0 15px rgba(212, 36, 38, 0.3)',
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: '-50%',
          width: '200%',
          height: '100%',
<<<<<<< HEAD
          background: 'radial-gradient(circle at 40% 50%, rgba(212,175,55,0.08), transparent 70%)',
          animation: 'gold-drift 22s linear infinite',
=======
          background: 'radial-gradient(circle at 40% 50%, rgba(212,36,38,0.08), transparent 70%)',
          animation: 'snow-drift 22s linear infinite',
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
          pointerEvents: 'none',
          zIndex: 0,
        }} />
        <CardContent sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="overline"
            sx={{
<<<<<<< HEAD
              fontFamily: '"Great Vibes", cursive',
              color: '#d4af37',
              textShadow: '0 0 8px rgba(212,175,55,0.8)',
              fontSize: '1.3rem',
            }}
          >
            📊 Volume hebdomadaire d'appels
          </Typography>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Chip
              label={wsConnected ? '✨ Aucune donnée disponible' : '🥂 Connexion au gala...'}
=======
              fontFamily: '"Mountains of Christmas", cursive',
              color: '#d42426',
              textShadow: '0 0 6px rgba(255,215,0,0.6)',
              fontSize: '1.2rem',
            }}
          >
            📞 NUMBER OF CALLS
          </Typography>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Chip
              label={wsConnected ? '🎄 Aucune donnée dans le traîneau' : '🎅 Connexion au Père Noël...'}
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
              size="small"
              sx={{
                mb: 2,
                background: wsConnected
<<<<<<< HEAD
                  ? 'linear-gradient(135deg, #8b0000, #000)'
                  : 'linear-gradient(135deg, #000, #333)',
                color: '#ffd700',
                fontFamily: '"Great Vibes", cursive',
                animation: wsConnected ? 'none' : 'pulse-gold 1.5s infinite alternate',
              }}
            />
            <Skeleton 
              variant="rectangular" 
              width="100%" 
              height={350} 
              sx={{ backgroundColor: 'rgba(255,255,255,0.1)' }} 
=======
                  ? 'linear-gradient(135deg, #c1272d, #8b0000)'
                  : 'linear-gradient(135deg, #d42426, #8b0000)',
                color: '#ffd700',
                fontFamily: '"Mountains of Christmas", cursive',
                animation: wsConnected ? 'none' : 'pulse-christmas 1.5s infinite alternate',
              }}
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
            />
          </Box>
        </CardContent>
        <style>{`
<<<<<<< HEAD
          @keyframes pulse-gold {
            0% { transform: scale(1); box-shadow: 0 0 10px rgba(255,215,0,0.6); }
            50% { transform: scale(1.03); box-shadow: 0 0 16px rgba(255,215,0,0.8); }
            100% { transform: scale(1); box-shadow: 0 0 10px rgba(255,215,0,0.6); }
          }
          @keyframes gold-drift {
=======
          @keyframes pulse-christmas {
            0% { transform: scale(1); box-shadow: 0 0 10px rgba(255,215,0,0.5); }
            50% { transform: scale(1.03); box-shadow: 0 0 16px rgba(255,215,0,0.7); }
            100% { transform: scale(1); box-shadow: 0 0 10px rgba(255,215,0,0.5); }
          }
          @keyframes snow-drift {
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
            0% { transform: translateX(0) translateY(0); }
            50% { transform: translateX(-8%) translateY(-4%); }
            100% { transform: translateX(0) translateY(0); }
          }
        `}</style>
      </Card>
    );
  }

  return (
    <>
      <style>
        {`
<<<<<<< HEAD
          @keyframes pulse-gold {
            0% { transform: scale(1); box-shadow: 0 0 10px rgba(255,215,0,0.6); }
            50% { transform: scale(1.03); box-shadow: 0 0 16px rgba(255,215,0,0.8); }
            100% { transform: scale(1); box-shadow: 0 0 10px rgba(255,215,0,0.6); }
          }

          @keyframes bar-rise-gold {
            0% { 
              opacity: 0.6; 
=======
          @keyframes pulse-christmas {
            0% { transform: scale(1); box-shadow: 0 0 10px rgba(255,215,0,0.5); }
            50% { transform: scale(1.03); box-shadow: 0 0 16px rgba(255,215,0,0.7); }
            100% { transform: scale(1); box-shadow: 0 0 10px rgba(255,215,0,0.5); }
          }

          @keyframes bar-rise {
            0% { 
              opacity: 0.5; 
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
              transform: scaleY(0); 
              transform-origin: bottom;
            }
            100% { 
              opacity: 1; 
              transform: scaleY(1); 
            }
          }

<<<<<<< HEAD
          @keyframes twinkle-gold {
            0%, 100% { text-shadow: 0 0 6px rgba(212,175,55,0.7); }
            50% { text-shadow: 0 0 12px rgba(255,215,0,0.9); }
          }

          @keyframes gold-drift-chart {
=======
          @keyframes twinkle-glow {
            0%, 100% { text-shadow: 0 0 6px rgba(255,215,0,0.7); }
            50% { text-shadow: 0 0 12px rgba(255,170,0,0.9); }
          }

          @keyframes snow-drift-chart {
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
            0% { transform: translateX(0) translateY(0); opacity: 0.5; }
            50% { transform: translateX(-6%) translateY(-3%); opacity: 0.7; }
            100% { transform: translateX(0) translateY(0); opacity: 0.5; }
          }
        `}
      </style>

      <Card
        sx={{
<<<<<<< HEAD
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(6px)', // 👈 Flou ajouté
          WebkitBackdropFilter: 'blur(6px)', // compatibilité
          width: '100%',
          borderRadius: 3,
          border: '1px solid rgba(212, 175, 55, 0.7)',
          boxShadow: '0 0 15px rgba(212, 175, 55, 0.5)',
          position: 'relative',
          overflow: 'hidden',
          ...(animate && {
            animation: 'pulse-gold 0.6s ease-in-out',
=======
          backgroundColor: 'rgba(255, 255, 255, 0.70)', // ✅ Transparence appliquée
          width: '100%',
          borderRadius: 3,
          border: '1px solid #d42426',
          boxShadow: '0 0 15px rgba(212, 36, 38, 0.3)',
          position: 'relative',
          overflow: 'hidden',
          ...(animate && {
            animation: 'pulse-christmas 0.6s ease-in-out',
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
          }),
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
<<<<<<< HEAD
            background: 'linear-gradient(90deg, transparent, #ffd700, #d4af37, #ffd700, transparent)',
            animation: 'twinkle-gold 3s infinite',
=======
            background: 'linear-gradient(90deg, transparent, #ffd700, #d42426, #ffd700, transparent)',
            animation: 'twinkle-glow 3s infinite',
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
            zIndex: 2,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '15%',
            left: '-60%',
            width: '220%',
            height: '70%',
            background: 'radial-gradient(circle at 50% 40%, rgba(46,139,87,0.07), transparent 80%)',
            pointerEvents: 'none',
            zIndex: 0,
<<<<<<< HEAD
            animation: 'gold-drift-chart 25s linear infinite',
=======
            animation: 'snow-drift-chart 25s linear infinite',
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
          },
        }}
      >
        <CardContent sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0 }}>
            <Typography
              variant="overline"
              sx={{
<<<<<<< HEAD
                fontFamily: '"Orbitron", sans-serif',
                color: '#d4af37',
                textShadow: '0 0 8px rgba(212,175,55,0.8)',
                fontSize: '1.3rem',
              }}
            >
              📊 Number of Calls 
=======
                fontFamily: '"Mountains of Christmas", cursive',
                color: '#d42426',
                textShadow: '0 0 6px rgba(255,215,0,0.6)',
                fontSize: '1.2rem',
              }}
            >
              📞 NUMBER OF CALLS
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
            </Typography>
            <Chip
              label="🟢 Live"
              size="small"
              sx={{
<<<<<<< HEAD
                background: 'linear-gradient(135deg, #d4af37, #b8860b)',
                color: '#000',
                fontWeight: 'bold',
                fontFamily: '"Orbitron", sans-serif',
                animation: 'pulse-gold 2s infinite',
=======
                background: 'linear-gradient(135deg, #228b22, #1e7a1e)',
                color: '#fff',
                fontWeight: 'bold',
                animation: 'pulse-christmas 2s infinite',
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
              }}
            />
          </Box>

          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={data}
              margin={{ top: 30, right: 20, left: 10, bottom: 20 }}
              barSize={100}
            >
<<<<<<< HEAD
              <CartesianGrid strokeDasharray="3 3" stroke="#d4af37" opacity={0.3} />

              <XAxis
                dataKey="dayLabel"
                stroke="#d4af37"
                tick={{
                  fill: '#ffd700',
                  fontSize: 22,
                  fontWeight: 'bold',
                  fontFamily: '"Orbitron", sans-serif',
                  textShadow: '0 0 4px rgba(212,175,55,0.5)',
=======
              <CartesianGrid strokeDasharray="3 3" stroke="#2e8b57" opacity={0.4} />

              <XAxis
                dataKey="dayLabel"
                stroke="#2e8b57"
                tick={{
                  fill: '#000',
                  fontSize: 25,
                  fontWeight: 'bold',
                  textShadow: '0 0 3px rgba(255,215,0,0.4)',
                  fontFamily: '"Mountains of Christmas", cursive',
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
                }}
              />

              <YAxis
<<<<<<< HEAD
                stroke="#d4af37"
                tick={{
                  fill: '#ffd700',
                  fontSize: 22,
                  fontWeight: 'bold',
                  fontFamily: '"Orbitron", sans-serif',
=======
                stroke="#2e8b57"
                tick={{
                  ...commonFont,
                  fill: '#000',
                  fontSize: 25,
                  fontWeight: 'bold',
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
                }}
                tickFormatter={hideZeroLabels}
              />

              <Tooltip
                formatter={(value, name) => {
<<<<<<< HEAD
                  const labels = { inbound: '📞 Entrants', outbound: '📞 Sortants' };
                  return [formatNumber(value), labels[name] || name];
                }}
                labelFormatter={(label) => `Jour : ${label}`}
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.9)',
                  border: '1px solid #d4af37',
                  borderRadius: 6,
                  color: '#ffd700',
                  fontSize: 12,
                  fontFamily: '"Orbitron", sans-serif',
                  boxShadow: '0 0 12px rgba(212, 175, 55, 0.6)',
=======
                  const labels = { inbound: '📞 Inbound', outbound: '🎄 Outbound' };
                  return [formatNumber(value), labels[name] || name];
                }}
                labelFormatter={(label) => `Jour: ${label}`}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', // ✅ Légère transparence pour lisibilité
                  border: '1px solid #d42426',
                  borderRadius: 6,
                  color: '#000',
                  fontSize: 12,
                  fontFamily: '"Mountains of Christmas", cursive',
                  boxShadow: '0 0 10px rgba(212, 36, 38, 0.4)',
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
                }}
              />

              <Bar
                dataKey="inbound"
<<<<<<< HEAD
                name="Entrants"
                fill={INBOUND_COLOR}
                animationDuration={1200}
                style={{ animation: 'bar-rise-gold 1s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }}
=======
                name="Inbound"
                fill={INBOUND_COLOR}
                animationDuration={1200}
                style={{ animation: 'bar-rise 1s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }}
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
              >
                <LabelList
                  dataKey="inbound"
                  position="top"
<<<<<<< HEAD
                  fill="#ffd700"
                  fontWeight="bold"
                  fontSize={22}
                  formatter={hideZeroLabels}
                  style={{
                    textShadow: '0 0 6px rgba(212,175,55,0.8)',
                    fontFamily: '"Orbitron", sans-serif',
                    animation: 'twinkle-gold 3s infinite alternate',
=======
                  fill="#d42426"
                  fontWeight="bold"
                  fontSize={25}
                  formatter={hideZeroLabels}
                  style={{
                    textShadow: '0 0 6px rgba(255,215,0,0.7)',
                    fontFamily: '"Mountains of Christmas", cursive',
                    animation: 'twinkle-glow 3s infinite alternate',
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
                  }}
                />
              </Bar>

              <Bar
                dataKey="outbound"
<<<<<<< HEAD
                name="Sortants"
                fill={OUTBOUND_COLOR}
                animationDuration={1200}
                style={{ animation: 'bar-rise-gold 1s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }}
=======
                name="Outbound"
                fill={OUTBOUND_COLOR}
                animationDuration={1200}
                style={{ animation: 'bar-rise 1s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }}
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
              >
                <LabelList
                  dataKey="outbound"
                  position="top"
<<<<<<< HEAD
                  fill="#2e8b57"
                  fontWeight="bold"
                  fontSize={22}
                  formatter={hideZeroLabels}
                  style={{
                    textShadow: '0 0 6px rgba(46,139,87,0.6)',
                    fontFamily: '"Orbitron", sans-serif',
                    animation: 'twinkle-gold 3s infinite alternate',
=======
                  fill="#228b22"
                  fontWeight="bold"
                  fontSize={25}
                  formatter={hideZeroLabels}
                  style={{
                    textShadow: '0 0 6px rgba(34,139,34,0.5)',
                    fontFamily: '"Mountains of Christmas", cursive',
                    animation: 'twinkle-glow 3s infinite alternate',
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>

<<<<<<< HEAD
=======
          {/* Légende – inchangée mais cohérente */}
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 6, pt: 2, pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 16, height: 16, bgcolor: INBOUND_COLOR, borderRadius: '2px', boxShadow: `0 0 6px ${INBOUND_COLOR}` }} />
              <Typography
                variant="body1"
                sx={{
<<<<<<< HEAD
                  fontFamily: '"Orbitron", sans-serif',
                  fontWeight: 'bold',
                  fontSize: 22,
                  color: '#ffd700',
                  textShadow: '0 0 4px rgba(212,175,55,0.6)',
                }}
              >
                📞 Entrants
=======
                  fontFamily: '"Mountains of Christmas", cursive',
                  fontWeight: 'bold',
                  fontSize: 25,
                  color: '#d42426',
                  textShadow: '0 0 4px rgba(255,215,0,0.5)',
                }}
              >
                📞 Inbound
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 16, height: 16, bgcolor: OUTBOUND_COLOR, borderRadius: '2px', boxShadow: `0 0 6px ${OUTBOUND_COLOR}` }} />
              <Typography
                variant="body1"
                sx={{
<<<<<<< HEAD
                  fontFamily: '"Orbitron", sans-serif',
                  fontWeight: 'bold',
                  fontSize: 22,
                  color: '#2e8b57',
                  textShadow: '0 0 4px rgba(46,139,87,0.5)',
                }}
              >
                📞 Sortants
=======
                  fontFamily: '"Mountains of Christmas", cursive',
                  fontWeight: 'bold',
                  fontSize: 25,
                  color: '#228b22',
                  textShadow: '0 0 4px rgba(34,139,34,0.5)',
                }}
              >
                🎄 Outbound
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </>
  );
}

export default SLABarchart;