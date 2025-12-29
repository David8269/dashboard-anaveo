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

const INBOUND_COLOR = '#d4af37';   // Or ancien
const OUTBOUND_COLOR = '#2e8b57'; // Vert forêt élégant

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

  if (data.length === 0) {
    return (
      <Card
        sx={{
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(6px)', // 👈 Flou ajouté
          WebkitBackdropFilter: 'blur(6px)', // compatibilité
          width: '100%',
          borderRadius: 3,
          border: '1px solid rgba(212, 175, 55, 0.7)',
          boxShadow: '0 0 15px rgba(212, 175, 55, 0.5)',
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
          background: 'radial-gradient(circle at 40% 50%, rgba(212,175,55,0.08), transparent 70%)',
          animation: 'gold-drift 22s linear infinite',
          pointerEvents: 'none',
          zIndex: 0,
        }} />
        <CardContent sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="overline"
            sx={{
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
              size="small"
              sx={{
                mb: 2,
                background: wsConnected
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
            />
          </Box>
        </CardContent>
        <style>{`
          @keyframes pulse-gold {
            0% { transform: scale(1); box-shadow: 0 0 10px rgba(255,215,0,0.6); }
            50% { transform: scale(1.03); box-shadow: 0 0 16px rgba(255,215,0,0.8); }
            100% { transform: scale(1); box-shadow: 0 0 10px rgba(255,215,0,0.6); }
          }
          @keyframes gold-drift {
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
          @keyframes pulse-gold {
            0% { transform: scale(1); box-shadow: 0 0 10px rgba(255,215,0,0.6); }
            50% { transform: scale(1.03); box-shadow: 0 0 16px rgba(255,215,0,0.8); }
            100% { transform: scale(1); box-shadow: 0 0 10px rgba(255,215,0,0.6); }
          }

          @keyframes bar-rise-gold {
            0% { 
              opacity: 0.6; 
              transform: scaleY(0); 
              transform-origin: bottom;
            }
            100% { 
              opacity: 1; 
              transform: scaleY(1); 
            }
          }

          @keyframes twinkle-gold {
            0%, 100% { text-shadow: 0 0 6px rgba(212,175,55,0.7); }
            50% { text-shadow: 0 0 12px rgba(255,215,0,0.9); }
          }

          @keyframes gold-drift-chart {
            0% { transform: translateX(0) translateY(0); opacity: 0.5; }
            50% { transform: translateX(-6%) translateY(-3%); opacity: 0.7; }
            100% { transform: translateX(0) translateY(0); opacity: 0.5; }
          }
        `}
      </style>

      <Card
        sx={{
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
          }),
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #ffd700, #d4af37, #ffd700, transparent)',
            animation: 'twinkle-gold 3s infinite',
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
            animation: 'gold-drift-chart 25s linear infinite',
          },
        }}
      >
        <CardContent sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0 }}>
            <Typography
              variant="overline"
              sx={{
                fontFamily: '"Orbitron", sans-serif',
                color: '#d4af37',
                textShadow: '0 0 8px rgba(212,175,55,0.8)',
                fontSize: '1.3rem',
              }}
            >
              📊 Number of Calls 
            </Typography>
            <Chip
              label="🟢 Live"
              size="small"
              sx={{
                background: 'linear-gradient(135deg, #d4af37, #b8860b)',
                color: '#000',
                fontWeight: 'bold',
                fontFamily: '"Orbitron", sans-serif',
                animation: 'pulse-gold 2s infinite',
              }}
            />
          </Box>

          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={data}
              margin={{ top: 30, right: 20, left: 10, bottom: 20 }}
              barSize={100}
            >
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
                }}
              />

              <YAxis
                stroke="#d4af37"
                tick={{
                  fill: '#ffd700',
                  fontSize: 22,
                  fontWeight: 'bold',
                  fontFamily: '"Orbitron", sans-serif',
                }}
                tickFormatter={hideZeroLabels}
              />

              <Tooltip
                formatter={(value, name) => {
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
                }}
              />

              <Bar
                dataKey="inbound"
                name="Entrants"
                fill={INBOUND_COLOR}
                animationDuration={1200}
                style={{ animation: 'bar-rise-gold 1s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }}
              >
                <LabelList
                  dataKey="inbound"
                  position="top"
                  fill="#ffd700"
                  fontWeight="bold"
                  fontSize={22}
                  formatter={hideZeroLabels}
                  style={{
                    textShadow: '0 0 6px rgba(212,175,55,0.8)',
                    fontFamily: '"Orbitron", sans-serif',
                    animation: 'twinkle-gold 3s infinite alternate',
                  }}
                />
              </Bar>

              <Bar
                dataKey="outbound"
                name="Sortants"
                fill={OUTBOUND_COLOR}
                animationDuration={1200}
                style={{ animation: 'bar-rise-gold 1s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }}
              >
                <LabelList
                  dataKey="outbound"
                  position="top"
                  fill="#2e8b57"
                  fontWeight="bold"
                  fontSize={22}
                  formatter={hideZeroLabels}
                  style={{
                    textShadow: '0 0 6px rgba(46,139,87,0.6)',
                    fontFamily: '"Orbitron", sans-serif',
                    animation: 'twinkle-gold 3s infinite alternate',
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 6, pt: 2, pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 16, height: 16, bgcolor: INBOUND_COLOR, borderRadius: '2px', boxShadow: `0 0 6px ${INBOUND_COLOR}` }} />
              <Typography
                variant="body1"
                sx={{
                  fontFamily: '"Orbitron", sans-serif',
                  fontWeight: 'bold',
                  fontSize: 22,
                  color: '#ffd700',
                  textShadow: '0 0 4px rgba(212,175,55,0.6)',
                }}
              >
                📞 Entrants
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 16, height: 16, bgcolor: OUTBOUND_COLOR, borderRadius: '2px', boxShadow: `0 0 6px ${OUTBOUND_COLOR}` }} />
              <Typography
                variant="body1"
                sx={{
                  fontFamily: '"Orbitron", sans-serif',
                  fontWeight: 'bold',
                  fontSize: 22,
                  color: '#2e8b57',
                  textShadow: '0 0 4px rgba(46,139,87,0.5)',
                }}
              >
                📞 Sortants
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </>
  );
}

export default SLABarchart;