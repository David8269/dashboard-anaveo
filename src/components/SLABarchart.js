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

const INBOUND_COLOR = '#ff6b00';
const OUTBOUND_COLOR = '#01b68a';

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

  const commonFont = { fontFamily: '"Orbitron", sans-serif', fontWeight: 600 };

  if (data.length === 0) {
    return (
      <Card
        sx={{
          backgroundColor: '#1a0a2e',
          width: '100%',
          borderRadius: 3,
          border: '1px solid #ff6b00',
          boxShadow: '0 0 15px rgba(255, 107, 0, 0.3)',
          backdropFilter: 'blur(4px)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Brume d'ambiance */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: '-50%',
          width: '200%',
          height: '100%',
          background: 'radial-gradient(circle at 40% 50%, rgba(255,107,0,0.08), transparent 70%)',
          animation: 'smoke-drift 22s linear infinite',
          pointerEvents: 'none',
          zIndex: 0,
        }} />
        <CardContent sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="overline"
            sx={{
              fontFamily: '"Nosifer", cursive',
              color: '#ff6b00',
              textShadow: '0 0 8px rgba(255,107,0,0.7)',
              fontSize: '1.2rem',
            }}
          >
            📞 NUMBER OF CALLS
          </Typography>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Chip
              label={wsConnected ? '🕸️ Aucune donnée disponible' : '🔮 Connexion aux esprits...'}
              size="small"
              sx={{
                mb: 2,
                background: wsConnected
                  ? 'linear-gradient(135deg, #d32f2f, #b71c1c)'
                  : 'linear-gradient(135deg, #ff8c00, #ff4500)',
                color: 'white',
                fontFamily: '"Nosifer", cursive',
                animation: wsConnected ? 'none' : 'pulse-halloween 1.5s infinite alternate',
              }}
            />
            <Skeleton variant="rectangular" width="100%" height={350} />
          </Box>
        </CardContent>
        <style>{`
          @keyframes pulse-halloween {
            0% { transform: scale(1); box-shadow: 0 0 10px rgba(255,107,0,0.5); }
            50% { transform: scale(1.03); box-shadow: 0 0 20px rgba(255,107,0,0.7); }
            100% { transform: scale(1); box-shadow: 0 0 10px rgba(255,107,0,0.5); }
          }
          @keyframes smoke-drift {
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
          @keyframes pulse-halloween {
            0% { transform: scale(1); box-shadow: 0 0 10px rgba(255,107,0,0.5); }
            50% { transform: scale(1.03); box-shadow: 0 0 20px rgba(255,107,0,0.7); }
            100% { transform: scale(1); box-shadow: 0 0 10px rgba(255,107,0,0.5); }
          }

          @keyframes bar-flame-rise {
            0% { 
              opacity: 0.5; 
              transform: scaleY(0); 
              transform-origin: bottom;
            }
            100% { 
              opacity: 1; 
              transform: scaleY(1); 
            }
          }

          @keyframes glitch-digital {
            0% { transform: translateX(0px); }
            20% { transform: translateX(-2px); }
            40% { transform: translateX(2px); }
            60% { transform: translateX(-1px); }
            80% { transform: translateX(1px); }
            100% { transform: translateX(0px); }
          }

          @keyframes label-glow {
            0%, 100% { text-shadow: 0 0 6px rgba(255,215,0,0.7); }
            50% { text-shadow: 0 0 12px rgba(255,107,0,0.9); }
          }

          @keyframes smoke-drift-chart {
            0% { transform: translateX(0) translateY(0); opacity: 0.5; }
            50% { transform: translateX(-6%) translateY(-3%); opacity: 0.7; }
            100% { transform: translateX(0) translateY(0); opacity: 0.5; }
          }
        `}
      </style>

      <Card
        sx={{
          backgroundColor: '#1a0a2e',
          width: '100%',
          borderRadius: 3,
          border: '1px solid #ff6b00',
          boxShadow: '0 0 15px rgba(255, 107, 0, 0.3)',
          backdropFilter: 'blur(4px)',
          position: 'relative',
          overflow: 'hidden',
          ...(animate && {
            animation: 'pulse-halloween 0.6s ease-in-out',
          }),
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #ff6b00, #ff0000, #ff6b00, transparent)',
            animation: 'glitch-digital 3s infinite',
            zIndex: 2,
          },
          // Couche de brume en arrière-plan
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '15%',
            left: '-60%',
            width: '220%',
            height: '70%',
            background: 'radial-gradient(circle at 50% 40%, rgba(138,43,226,0.07), transparent 80%)',
            pointerEvents: 'none',
            zIndex: 0,
            animation: 'smoke-drift-chart 25s linear infinite',
          },
        }}
      >
        <CardContent sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography
              variant="overline"
              sx={{
                fontFamily: '"Nosifer", cursive',
                color: '#ff6b00',
                textShadow: '0 0 8px rgba(255,107,0,0.7)',
                fontSize: '1.2rem',
              }}
            >
              📞 NUMBER OF CALLS
            </Typography>
            <Chip
              label="🟢 Live"
              size="small"
              sx={{
                background: 'linear-gradient(135deg, #01b68a, #00897b)',
                color: 'white',
                fontWeight: 'bold',
                animation: 'pulse-halloween 2s infinite',
              }}
            />
          </Box>

          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4a148c" opacity={0.4} />

              <XAxis
                dataKey="dayLabel"
                stroke="#8a2be2"
                tick={{ fill: '#ffd700', fontSize: 12, textShadow: '0 0 4px rgba(255,215,0,0.5)', fontFamily: '"Orbitron", sans-serif' }}
              />

              <YAxis
                stroke="#8a2be2"
                tick={{ ...commonFont, fill: '#ffd700' }}
                tickFormatter={hideZeroLabels}
              />

              <Tooltip
                formatter={(value, name) => {
                  const labels = { inbound: '📞 Inbound', outbound: '🎃 Outbound' };
                  return [formatNumber(value), labels[name] || name];
                }}
                labelFormatter={(label) => `Jour: ${label}`}
                contentStyle={{
                  backgroundColor: '#1a0a2e',
                  border: '1px solid #ff6b00',
                  borderRadius: 6,
                  color: '#ffd700',
                  fontSize: 12,
                  fontFamily: '"Orbitron", sans-serif',
                  boxShadow: '0 0 12px rgba(255, 107, 0, 0.5)',
                }}
              />

              <Bar 
                dataKey="inbound" 
                name="Inbound" 
                fill={INBOUND_COLOR} 
                maxBarSize={80} 
                animationDuration={1200}
                style={{ animation: 'bar-flame-rise 1s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }}
              >
                <LabelList
                  dataKey="inbound"
                  position="top"
                  fill="#ffd700"
                  fontWeight="bold"
                  fontSize={14}
                  formatter={hideZeroLabels}
                  style={{
                    textShadow: '0 0 6px rgba(255,215,0,0.7)',
                    fontFamily: '"Orbitron", sans-serif',
                    animation: 'label-glow 3s infinite alternate',
                  }}
                />
              </Bar>

              <Bar 
                dataKey="outbound" 
                name="Outbound" 
                fill={OUTBOUND_COLOR} 
                maxBarSize={80} 
                animationDuration={1200}
                style={{ animation: 'bar-flame-rise 1s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }}
              >
                <LabelList
                  dataKey="outbound"
                  position="top"
                  fill="#01b68a"
                  fontWeight="bold"
                  fontSize={14}
                  formatter={hideZeroLabels}
                  style={{
                    textShadow: '0 0 6px rgba(1,182,138,0.5)',
                    fontFamily: '"Orbitron", sans-serif',
                    animation: 'label-glow 3s infinite alternate',
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, pt: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 14, height: 14, bgcolor: INBOUND_COLOR, borderRadius: '2px', boxShadow: `0 0 6px ${INBOUND_COLOR}` }} />
              <Typography variant="body2" sx={{ ...commonFont, color: '#ffd700', textShadow: '0 0 4px rgba(255,215,0,0.5)' }}>
                📞 Inbound
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 14, height: 14, bgcolor: OUTBOUND_COLOR, borderRadius: '2px', boxShadow: `0 0 6px ${OUTBOUND_COLOR}` }} />
              <Typography variant="body2" sx={{ ...commonFont, color: '#01b68a', textShadow: '0 0 4px rgba(1,182,138,0.5)' }}>
                🎃 Outbound
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </>
  );
}

export default SLABarchart;