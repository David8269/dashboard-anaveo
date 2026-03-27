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

const INBOUND_COLOR = '#DC143C';
const OUTBOUND_COLOR = '#4169E1';

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
          backgroundColor: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          width: '100%',
          borderRadius: 3,
          border: '3px solid #DC143C',
          boxShadow: '0 4px 16px rgba(220, 20, 60, 0.2)',
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
          background: 'radial-gradient(circle at 40% 50%, rgba(220, 20, 60, 0.1), transparent 70%)',
          animation: 'april-drift 22s linear infinite',
          pointerEvents: 'none',
          zIndex: 0,
        }} />
        <CardContent sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="overline"
            sx={{
              fontFamily: '"Montserrat", sans-serif',
              color: '#8B0000',
              textShadow: '0 0 8px rgba(255, 255, 255, 0.8)',
              fontSize: '1.3rem',
            }}
          >
            📊 Volume hebdomadaire des appels
          </Typography>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Chip
              label={wsConnected ? '🐟 Aucun appel enregistré' : '🎭 Connexion au cirque...'}
              size="small"
              sx={{
                mb: 2,
                background: wsConnected
                  ? 'linear-gradient(135deg, #DC143C, #4169E1)'
                  : 'linear-gradient(135deg, #4169E1, #FFD700)',
                color: '#FFFFFF',
                fontFamily: '"Montserrat", sans-serif',
                animation: wsConnected ? 'none' : 'pulse-april 1.5s infinite alternate',
                border: '2px solid #FFD700',
              }}
            />
            <Skeleton 
              variant="rectangular" 
              width="100%" 
              height={350} 
              sx={{ backgroundColor: 'rgba(220, 20, 60, 0.1)' }} 
            />
          </Box>
        </CardContent>
        <style>{`
          @keyframes pulse-april {
            0% { transform: scale(1); box-shadow: 0 0 10px rgba(220, 20, 60, 0.45); }
            50% { transform: scale(1.03); box-shadow: 0 0 16px rgba(65, 105, 225, 0.55); }
            100% { transform: scale(1); box-shadow: 0 0 10px rgba(220, 20, 60, 0.45); }
          }
          @keyframes april-drift {
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
          @keyframes pulse-april {
            0% { transform: scale(1); box-shadow: 0 0 10px rgba(220, 20, 60, 0.45); }
            50% { transform: scale(1.03); box-shadow: 0 0 16px rgba(65, 105, 225, 0.55); }
            100% { transform: scale(1); box-shadow: 0 0 10px rgba(220, 20, 60, 0.45); }
          }

          @keyframes bar-rise-april {
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

          @keyframes twinkle-april {
            0%, 100% { text-shadow: 0 0 6px rgba(220, 20, 60, 0.45); }
            50% { text-shadow: 0 0 12px rgba(65, 105, 225, 0.55); }
          }

          @keyframes april-drift-chart {
            0% { transform: translateX(0) translateY(0); opacity: 0.5; }
            50% { transform: translateX(-6%) translateY(-3%); opacity: 0.7; }
            100% { transform: translateX(0) translateY(0); opacity: 0.5; }
          }
        `}
      </style>

      <Card
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          width: '100%',
          borderRadius: 3,
          border: '3px solid #DC143C',
          boxShadow: '0 4px 16px rgba(220, 20, 60, 0.2)',
          position: 'relative',
          overflow: 'hidden',
          ...(animate && {
            animation: 'pulse-april 0.6s ease-in-out',
          }),
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #DC143C, rgba(220, 20, 60, 0.55), #FFD700, transparent)',
            animation: 'twinkle-april 3s infinite',
            zIndex: 2,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '15%',
            left: '-60%',
            width: '220%',
            height: '70%',
            background: 'radial-gradient(circle at 50% 40%, rgba(65, 105, 225, 0.08), transparent 80%)',
            pointerEvents: 'none',
            zIndex: 0,
            animation: 'april-drift-chart 25s linear infinite',
          },
        }}
      >
        <CardContent sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0 }}>
            <Typography
              variant="overline"
              sx={{
                fontFamily: '"Montserrat", sans-serif',
                color: '#8B0000',
                textShadow: '0 0 8px rgba(255, 255, 255, 0.8)',
                fontSize: '1.3rem',
              }}
            >
              📊 Volume des appels
            </Typography>
            <Chip
              label="🟢 En direct"
              size="small"
              sx={{
                background: 'linear-gradient(135deg, #32CD32, #FFD700)',
                color: '#8B0000',
                fontWeight: 'bold',
                fontFamily: '"Montserrat", sans-serif',
                animation: 'pulse-april 2s infinite',
                border: '2px solid #FFD700',
              }}
            />
          </Box>

          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={data}
              margin={{ top: 30, right: 20, left: 10, bottom: 20 }}
              barSize={100}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(220, 20, 60, 0.35)" opacity={0.35} />

              <XAxis
                dataKey="dayLabel"
                stroke="#8B0000"
                tick={{
                  fill: '#8B0000',
                  fontSize: 22,
                  fontWeight: 'bold',
                  fontFamily: '"Montserrat", sans-serif',
                  textShadow: '0 0 4px rgba(255, 255, 255, 0.6)',
                }}
              />

              <YAxis
                stroke="#8B0000"
                tick={{
                  fill: '#8B0000',
                  fontSize: 22,
                  fontWeight: 'bold',
                  fontFamily: '"Montserrat", sans-serif',
                }}
                tickFormatter={hideZeroLabels}
              />

              <Tooltip
                formatter={(value, name) => {
                  const labels = { inbound: '🐟 Poissons attrapés', outbound: '🐟 Poissons relachés' };
                  return [formatNumber(value), labels[name] || name];
                }}
                labelFormatter={(label) => `Jour : ${label}`}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '2px solid #DC143C',
                  borderRadius: 6,
                  color: '#8B0000',
                  fontSize: 12,
                  fontFamily: '"Roboto", sans-serif',
                  boxShadow: '0 0 12px rgba(220, 20, 60, 0.3)',
                }}
              />

              <Bar
                dataKey="inbound"
                name="Poissons attrapés"
                fill={INBOUND_COLOR}
                animationDuration={1200}
                style={{ animation: 'bar-rise-april 1s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }}
              >
                <LabelList
                  dataKey="inbound"
                  position="top"
                  fill="#8B0000"
                  fontWeight="bold"
                  fontSize={22}
                  formatter={hideZeroLabels}
                  style={{
                    textShadow: '0 0 6px rgba(220, 20, 60, 0.45)',
                    fontFamily: '"Montserrat", sans-serif',
                    animation: 'twinkle-april 3s infinite alternate',
                  }}
                />
              </Bar>

              <Bar
                dataKey="outbound"
                name="Ballons envoyés"
                fill={OUTBOUND_COLOR}
                animationDuration={1200}
                style={{ animation: 'bar-rise-april 1s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }}
              >
                <LabelList
                  dataKey="outbound"
                  position="top"
                  fill="#8B0000"
                  fontWeight="bold"
                  fontSize={22}
                  formatter={hideZeroLabels}
                  style={{
                    textShadow: '0 0 6px rgba(65, 105, 225, 0.45)',
                    fontFamily: '"Montserrat", sans-serif',
                    animation: 'twinkle-april 3s infinite alternate',
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 6, pt: 2, pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 16, height: 16, bgcolor: INBOUND_COLOR, borderRadius: '2px', boxShadow: `0 0 6px ${INBOUND_COLOR}`, border: '1px solid #FFD700' }} />
              <Typography
                variant="body1"
                sx={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontWeight: 'bold',
                  fontSize: 22,
                  color: '#8B0000',
                  textShadow: '0 0 4px rgba(255, 255, 255, 0.6)',
                }}
              >
                🐟 Poissons attrapés
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 16, height: 16, bgcolor: OUTBOUND_COLOR, borderRadius: '2px', boxShadow: `0 0 6px ${OUTBOUND_COLOR}`, border: '1px solid #FFD700' }} />
              <Typography
                variant="body1"
                sx={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontWeight: 'bold',
                  fontSize: 22,
                  color: '#8B0000',
                  textShadow: '0 0 4px rgba(255, 255, 255, 0.6)',
                }}
              >
                🐟 Poissons relachés
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </>
  );
}

export default SLABarchart;