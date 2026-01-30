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

const INBOUND_COLOR = '#FFD700';   // Or doré
const OUTBOUND_COLOR = '#5D4037'; // Marron chocolat

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
          backgroundColor: 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          width: '100%',
          borderRadius: 3,
          border: '1px solid rgba(255, 215, 0, 0.6)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
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
          background: 'radial-gradient(circle at 40% 50%, rgba(255, 215, 0, 0.1), transparent 70%)',
          animation: 'crepe-drift 22s linear infinite',
          pointerEvents: 'none',
          zIndex: 0,
        }} />
        <CardContent sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="overline"
            sx={{
              fontFamily: '"Montserrat", sans-serif',
              color: '#FFD700',
              textShadow: '0 0 12px rgba(255, 215, 0, 0.8)',
              fontSize: '1.3rem',
            }}
          >
            📊 Volume hebdomadaire des crêpes
          </Typography>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Chip
              label={wsConnected ? '🥞 Aucune crêpe enregistrée' : '🍳 Connexion à la cuisine...'}
              size="small"
              sx={{
                mb: 2,
                background: wsConnected
                  ? 'linear-gradient(135deg, #5D4037, #FFD700)'
                  : 'linear-gradient(135deg, #5D4037, #f9a825)',
                color: '#FFD700',
                fontFamily: '"Montserrat", sans-serif',
                animation: wsConnected ? 'none' : 'pulse-crepe 1.5s infinite alternate',
                border: '1px solid rgba(255, 215, 0, 0.6)',
              }}
            />
            <Skeleton 
              variant="rectangular" 
              width="100%" 
              height={350} 
              sx={{ backgroundColor: 'rgba(255, 215, 0, 0.1)' }} 
            />
          </Box>
        </CardContent>
        <style>{`
          @keyframes pulse-crepe {
            0% { transform: scale(1); box-shadow: 0 0 10px rgba(255, 215, 0, 0.6); }
            50% { transform: scale(1.03); box-shadow: 0 0 16px rgba(255, 215, 0, 0.7); }
            100% { transform: scale(1); box-shadow: 0 0 10px rgba(255, 215, 0, 0.6); }
          }
          @keyframes crepe-drift {
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
          @keyframes pulse-crepe {
            0% { transform: scale(1); box-shadow: 0 0 10px rgba(255, 215, 0, 0.6); }
            50% { transform: scale(1.03); box-shadow: 0 0 16px rgba(255, 215, 0, 0.7); }
            100% { transform: scale(1); box-shadow: 0 0 10px rgba(255, 215, 0, 0.6); }
          }

          @keyframes bar-rise-crepe {
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

          @keyframes twinkle-crepe {
            0%, 100% { text-shadow: 0 0 6px rgba(255, 215, 0, 0.6); }
            50% { text-shadow: 0 0 12px rgba(255, 215, 0, 0.7); }
          }

          @keyframes crepe-drift-chart {
            0% { transform: translateX(0) translateY(0); opacity: 0.5; }
            50% { transform: translateX(-6%) translateY(-3%); opacity: 0.7; }
            100% { transform: translateX(0) translateY(0); opacity: 0.5; }
          }
        `}
      </style>

      <Card
        sx={{
          backgroundColor: 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          width: '100%',
          borderRadius: 3,
          border: '1px solid rgba(255, 215, 0, 0.6)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
          position: 'relative',
          overflow: 'hidden',
          ...(animate && {
            animation: 'pulse-crepe 0.6s ease-in-out',
          }),
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #FFD700, rgba(255, 215, 0, 0.6), #FFD700, transparent)',
            animation: 'twinkle-crepe 3s infinite',
            zIndex: 2,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '15%',
            left: '-60%',
            width: '220%',
            height: '70%',
            background: 'radial-gradient(circle at 50% 40%, rgba(93, 64, 55, 0.1), transparent 80%)',
            pointerEvents: 'none',
            zIndex: 0,
            animation: 'crepe-drift-chart 25s linear infinite',
          },
        }}
      >
        <CardContent sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0 }}>
            <Typography
              variant="overline"
              sx={{
                fontFamily: '"Montserrat", sans-serif',
                color: '#FFD700',
                textShadow: '0 0 12px rgba(255, 215, 0, 0.8)',
                fontSize: '1.3rem',
              }}
            >
              📊 Volume des crêpes
            </Typography>
            <Chip
              label="🟢 En direct"
              size="small"
              sx={{
                background: 'linear-gradient(135deg, #FFD700, #e6a85b)',
                color: '#000',
                fontWeight: 'bold',
                fontFamily: '"Montserrat", sans-serif',
                animation: 'pulse-crepe 2s infinite',
                border: '1px solid rgba(255, 215, 0, 0.6)',
              }}
            />
          </Box>

          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={data}
              margin={{ top: 30, right: 20, left: 10, bottom: 20 }}
              barSize={100}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 215, 0, 0.3)" opacity={0.3} />

              <XAxis
                dataKey="dayLabel"
                stroke="#FFD700"
                tick={{
                  fill: '#FFD700',
                  fontSize: 22,
                  fontWeight: 'bold',
                  fontFamily: '"Montserrat", sans-serif',
                  textShadow: '0 0 4px rgba(255, 215, 0, 0.4)',
                }}
              />

              <YAxis
                stroke="#FFD700"
                tick={{
                  fill: '#FFD700',
                  fontSize: 22,
                  fontWeight: 'bold',
                  fontFamily: '"Montserrat", sans-serif',
                }}
                tickFormatter={hideZeroLabels}
              />

              <Tooltip
                formatter={(value, name) => {
                  const labels = { inbound: '🥞 Crêpes dorées', outbound: '🔄 Crêpes retournées' };
                  return [formatNumber(value), labels[name] || name];
                }}
                labelFormatter={(label) => `Jour : ${label}`}
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(255, 215, 0, 0.6)',
                  borderRadius: 6,
                  color: '#FFD700',
                  fontSize: 12,
                  fontFamily: '"Roboto", sans-serif',
                  boxShadow: '0 0 12px rgba(255, 215, 0, 0.4)',
                }}
              />

              <Bar
                dataKey="inbound"
                name="Crêpes dorées"
                fill={INBOUND_COLOR}
                animationDuration={1200}
                style={{ animation: 'bar-rise-crepe 1s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }}
              >
                <LabelList
                  dataKey="inbound"
                  position="top"
                  fill="#FFD700"
                  fontWeight="bold"
                  fontSize={22}
                  formatter={hideZeroLabels}
                  style={{
                    textShadow: '0 0 6px rgba(255, 215, 0, 0.6)',
                    fontFamily: '"Montserrat", sans-serif',
                    animation: 'twinkle-crepe 3s infinite alternate',
                  }}
                />
              </Bar>

              <Bar
                dataKey="outbound"
                name="Crêpes retournées"
                fill={OUTBOUND_COLOR}
                animationDuration={1200}
                style={{ animation: 'bar-rise-crepe 1s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }}
              >
                <LabelList
                  dataKey="outbound"
                  position="top"
                  fill="#FFD700"
                  fontWeight="bold"
                  fontSize={22}
                  formatter={hideZeroLabels}
                  style={{
                    textShadow: '0 0 6px rgba(93, 64, 55, 0.7)',
                    fontFamily: '"Montserrat", sans-serif',
                    animation: 'twinkle-crepe 3s infinite alternate',
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* ✅ CORRECTION : Textes parfaitement lisibles */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 6, pt: 2, pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 16, height: 16, bgcolor: INBOUND_COLOR, borderRadius: '2px', boxShadow: `0 0 6px ${INBOUND_COLOR}` }} />
              <Typography
                variant="body1"
                sx={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontWeight: 'bold',
                  fontSize: 22,
                  color: '#FFD700',
                  textShadow: '0 0 4px rgba(255, 215, 0, 0.3)',
                }}
              >
                🥞 Crêpes dorées
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 16, height: 16, bgcolor: OUTBOUND_COLOR, borderRadius: '2px', boxShadow: `0 0 6px ${OUTBOUND_COLOR}` }} />
              <Typography
                variant="body1"
                sx={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontWeight: 'bold',
                  fontSize: 22,
                  color: '#FFD700',
                  textShadow: '0 0 4px rgba(93, 64, 55, 0.3)',
                }}
              >
                🔄 Crêpes retournées
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </>
  );
}

export default SLABarchart;