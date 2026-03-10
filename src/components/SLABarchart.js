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

const INBOUND_COLOR = '#8b0000';   // Rouge sang foncé
const OUTBOUND_COLOR = '#ff0000'; // Rouge vif

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
          backgroundColor: 'rgba(10, 10, 10, 0.85)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          width: '100%',
          borderRadius: 3,
          border: '2px solid rgba(255, 0, 0, 0.5)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.7)',
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
          background: 'radial-gradient(circle at 40% 50%, rgba(139, 0, 0, 0.15), transparent 70%)',
          animation: 'friday-drift 22s linear infinite',
          pointerEvents: 'none',
          zIndex: 0,
        }} />
        <CardContent sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="overline"
            sx={{
              fontFamily: '"Creepster", cursive',
              background: 'linear-gradient(135deg, #8b0000, #ff0000, #8b0000)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundSize: '400% 400%',
              animation: 'color-shift-friday 6s ease infinite',
              fontSize: '1.3rem',
              textShadow: '0 0 12px rgba(255, 0, 0, 0.6)',
            }}
          >
            📊 Volume hebdomadaire du Vendredi 13
          </Typography>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Chip
              label={wsConnected ? '🔪 Aucun cauchemar enregistré' : '🔪 Connexion au cauchemar...'}
              size="small"
              sx={{
                mb: 2,
                background: wsConnected
                  ? 'linear-gradient(135deg, #8b0000, #ff0000, #8b0000)'
                  : 'linear-gradient(135deg, #8b0000, #c62828)',
                color: '#ffffff',
                fontFamily: '"Creepster", cursive',
                animation: wsConnected ? 'none' : 'pulse-friday 1.5s infinite alternate',
                border: '2px solid rgba(255, 0, 0, 0.5)',
                boxShadow: '0 0 15px rgba(139, 0, 0, 0.6), 0 0 25px rgba(255, 0, 0, 0.4)',
              }}
            />
            <Skeleton 
              variant="rectangular" 
              width="100%" 
              height={350} 
              sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '&::after': {
                  background: 'linear-gradient(90deg, transparent, rgba(139, 0, 0, 0.2), transparent)',
                }
              }} 
            />
          </Box>
        </CardContent>
        <style>{`
          @keyframes pulse-friday {
            0% { 
              transform: scale(1); 
              box-shadow: 0 0 10px rgba(139, 0, 0, 0.6), 0 0 20px rgba(255, 0, 0, 0.4); 
            }
            50% { 
              transform: scale(1.05); 
              box-shadow: 0 0 20px rgba(139, 0, 0, 0.8), 0 0 35px rgba(255, 0, 0, 0.6), 0 0 45px rgba(139, 0, 0, 0.5); 
            }
            100% { 
              transform: scale(1); 
              box-shadow: 0 0 10px rgba(139, 0, 0, 0.6), 0 0 20px rgba(255, 0, 0, 0.4); 
            }
          }
          @keyframes friday-drift {
            0% { transform: translateX(0) translateY(0); }
            50% { transform: translateX(-8%) translateY(-4%); }
            100% { transform: translateX(0) translateY(0); }
          }
          @keyframes color-shift-friday {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
        `}</style>
      </Card>
    );
  }

  return (
    <>
      <style>
        {`
          @keyframes pulse-friday {
            0% { 
              transform: scale(1); 
              box-shadow: 0 0 10px rgba(139, 0, 0, 0.6), 0 0 20px rgba(255, 0, 0, 0.4); 
            }
            50% { 
              transform: scale(1.05); 
              box-shadow: 0 0 20px rgba(139, 0, 0, 0.8), 0 0 35px rgba(255, 0, 0, 0.6), 0 0 45px rgba(139, 0, 0, 0.5); 
            }
            100% { 
              transform: scale(1); 
              box-shadow: 0 0 10px rgba(139, 0, 0, 0.6), 0 0 20px rgba(255, 0, 0, 0.4); 
            }
          }

          @keyframes bar-rise-friday {
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

          @keyframes twinkle-friday {
            0%, 100% { text-shadow: 0 0 8px rgba(255, 0, 0, 0.7); }
            50% { text-shadow: 0 0 16px rgba(255, 0, 0, 0.9), 0 0 24px rgba(139, 0, 0, 0.5); }
          }

          @keyframes friday-drift-chart {
            0% { transform: translateX(0) translateY(0); opacity: 0.5; }
            50% { transform: translateX(-6%) translateY(-3%); opacity: 0.8; }
            100% { transform: translateX(0) translateY(0); opacity: 0.5; }
          }

          @keyframes color-shift-friday {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }

          @keyframes gradient-border-friday {
            0% { background-position: 0% 50%; }
            100% { background-position: 100% 50%; }
          }
        `}
      </style>

      <Card
        sx={{
          backgroundColor: 'rgba(10, 10, 10, 0.85)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          width: '100%',
          borderRadius: 3,
          border: '2px solid transparent',
          backgroundClip: 'padding-box',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: '14px',
            padding: '2px',
            background: 'linear-gradient(135deg, #8b0000, #ff0000, #8b0000)',
            backgroundSize: '400% 400%',
            animation: 'gradient-border-friday 8s ease infinite',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            zIndex: 3,
          },
          ...(animate && {
            animation: 'pulse-friday 0.6s ease-in-out',
          }),
        }}
      >
        <CardContent sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0 }}>
            <Typography
              variant="overline"
              sx={{
                fontFamily: '"Creepster", cursive',
                background: 'linear-gradient(135deg, #8b0000, #ff0000, #8b0000)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundSize: '400% 400%',
                animation: 'color-shift-friday 6s ease infinite',
                fontSize: '1.3rem',
                textShadow: '0 0 12px rgba(255, 0, 0, 0.6)',
              }}
            >
              📊 Volume du Vendredi 13
            </Typography>
            <Chip
              label="🟢 En direct"
              size="small"
              sx={{
                background: 'linear-gradient(135deg, #8b0000, #a52a2a)',
                color: '#ffffff',
                fontWeight: 'bold',
                fontFamily: '"Creepster", cursive',
                animation: 'pulse-friday 2s infinite',
                border: '2px solid rgba(255, 0, 0, 0.5)',
                boxShadow: '0 0 15px rgba(139, 0, 0, 0.6)',
              }}
            />
          </Box>

          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={data}
              margin={{ top: 30, right: 20, left: 10, bottom: 20 }}
              barSize={100}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 0, 0, 0.3)" opacity={0.3} />

              <XAxis
                dataKey="dayLabel"
                stroke="#e0e0e0"
                tick={{
                  fill: '#e0e0e0',
                  fontSize: 22,
                  fontWeight: 'bold',
                  fontFamily: '"Creepster", cursive',
                  textShadow: '0 0 8px rgba(0, 0, 0, 0.9), 0 0 12px rgba(255, 0, 0, 0.5)',
                }}
              />

              <YAxis
                stroke="#e0e0e0"
                tick={{
                  fill: '#e0e0e0',
                  fontSize: 22,
                  fontWeight: 'bold',
                  fontFamily: '"Creepster", cursive',
                  textShadow: '0 0 8px rgba(0, 0, 0, 0.9)',
                }}
                tickFormatter={hideZeroLabels}
              />

              <Tooltip
                formatter={(value, name) => {
                  const labels = { inbound: '🔪 Appels entrants', outbound: '🔪 Appels sortants' };
                  return [formatNumber(value), labels[name] || name];
                }}
                labelFormatter={(label) => `Jour : ${label}`}
                contentStyle={{
                  backgroundColor: 'rgba(10, 10, 10, 0.95)',
                  border: '2px solid rgba(255, 0, 0, 0.5)',
                  borderRadius: 6,
                  color: '#e0e0e0',
                  fontSize: 12,
                  fontFamily: '"Roboto", sans-serif',
                  boxShadow: '0 0 20px rgba(139, 0, 0, 0.5), 0 0 30px rgba(255, 0, 0, 0.4)',
                }}
              />

              <Bar
                dataKey="inbound"
                name="Appels entrants"
                fill={INBOUND_COLOR}
                animationDuration={1200}
                style={{ 
                  animation: 'bar-rise-friday 1s cubic-bezier(0.2, 0.8, 0.4, 1) forwards',
                  boxShadow: '0 0 15px rgba(139, 0, 0, 0.5)',
                }}
              >
                <LabelList
                  dataKey="inbound"
                  position="top"
                  fill="#e0e0e0"
                  fontWeight="bold"
                  fontSize={22}
                  formatter={hideZeroLabels}
                  style={{
                    textShadow: '0 0 10px rgba(139, 0, 0, 0.7), 0 0 15px rgba(0, 0, 0, 0.8)',
                    fontFamily: '"Creepster", cursive',
                    animation: 'twinkle-friday 3s infinite alternate',
                  }}
                />
              </Bar>

              <Bar
                dataKey="outbound"
                name="Appels sortants"
                fill={OUTBOUND_COLOR}
                animationDuration={1200}
                style={{ 
                  animation: 'bar-rise-friday 1s cubic-bezier(0.2, 0.8, 0.4, 1) forwards',
                  boxShadow: '0 0 15px rgba(255, 0, 0, 0.5)',
                }}
              >
                <LabelList
                  dataKey="outbound"
                  position="top"
                  fill="#e0e0e0"
                  fontWeight="bold"
                  fontSize={22}
                  formatter={hideZeroLabels}
                  style={{
                    textShadow: '0 0 10px rgba(255, 0, 0, 0.7), 0 0 15px rgba(0, 0, 0, 0.8)',
                    fontFamily: '"Creepster", cursive',
                    animation: 'twinkle-friday 3s infinite alternate',
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* ✅ Textes parfaitement lisibles avec couleurs horrifiques */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 6, pt: 2, pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box 
                sx={{ 
                  width: 16, 
                  height: 16, 
                  bgcolor: INBOUND_COLOR, 
                  borderRadius: '2px', 
                  boxShadow: `0 0 10px ${INBOUND_COLOR}, 0 0 15px rgba(139, 0, 0, 0.6)`,
                  border: '1px solid rgba(255, 0, 0, 0.5)',
                }} 
              />
              <Typography
                variant="body1"
                sx={{
                  fontFamily: '"Creepster", cursive',
                  fontWeight: 'bold',
                  fontSize: 22,
                  background: 'linear-gradient(135deg, #8b0000, #ff0000)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 0 8px rgba(0, 0, 0, 0.9)',
                }}
              >
                🔪 Appels entrants
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box 
                sx={{ 
                  width: 16, 
                  height: 16, 
                  bgcolor: OUTBOUND_COLOR, 
                  borderRadius: '2px', 
                  boxShadow: `0 0 10px ${OUTBOUND_COLOR}, 0 0 15px rgba(255, 0, 0, 0.6)`,
                  border: '1px solid rgba(255, 0, 0, 0.5)',
                }} 
              />
              <Typography
                variant="body1"
                sx={{
                  fontFamily: '"Creepster", cursive',
                  fontWeight: 'bold',
                  fontSize: 22,
                  background: 'linear-gradient(135deg, #ff0000, #8b0000)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 0 8px rgba(0, 0, 0, 0.9)',
                }}
              >
                🔪 Appels sortants
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </>
  );
}

export default SLABarchart;