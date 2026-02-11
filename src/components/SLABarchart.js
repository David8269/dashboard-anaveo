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

const INBOUND_COLOR = '#e74c3c';   // Rouge passion
const OUTBOUND_COLOR = '#8B0000'; // Bordeaux profond

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
          backgroundColor: 'rgba(25, 25, 45, 0.85)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          width: '100%',
          borderRadius: 3,
          border: '1px solid rgba(231, 76, 60, 0.4)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
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
          background: 'radial-gradient(circle at 40% 50%, rgba(231, 76, 60, 0.08), transparent 70%)',
          animation: 'heart-drift 22s linear infinite',
          pointerEvents: 'none',
          zIndex: 0,
        }} />
        <CardContent sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="overline"
            sx={{
              fontFamily: '"Playfair Display", serif',
              color: '#ffffff',
              fontSize: '1.3rem',
              letterSpacing: '0.05em',
            }}
          >
            📊 Volume hebdomadaire des cœurs
          </Typography>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Chip
              label={wsConnected ? '❤️ Aucun cœur enregistré' : '💘 Connexion au Cœur du CDS...'}
              size="small"
              sx={{
                mb: 2,
                background: wsConnected
                  ? 'linear-gradient(135deg, #8B0000, #e74c3c)'
                  : 'linear-gradient(135deg, #8B0000, #ff6b6b)',
                color: '#ffffff',
                fontFamily: '"Playfair Display", serif',
                animation: wsConnected ? 'none' : 'heartbeat 1.8s ease-in-out infinite',
                border: '1px solid rgba(231, 76, 60, 0.4)',
              }}
            />
            <Skeleton 
              variant="rectangular" 
              width="100%" 
              height={350} 
              sx={{ backgroundColor: 'rgba(50, 50, 70, 0.3)' }} 
            />
          </Box>
        </CardContent>
        <style>{`
          @keyframes heartbeat {
            0%, 100% { transform: scale(1); }
            14%, 28% { transform: scale(1.08); }
            42%, 56% { transform: scale(1); }
            70% { transform: scale(1.12); }
          }
          @keyframes heart-drift {
            0% { transform: translateX(0) translateY(0); opacity: 0.8; }
            50% { transform: translateX(-6%) translateY(-3%); opacity: 1; }
            100% { transform: translateX(0) translateY(0); opacity: 0.8; }
          }
        `}</style>
      </Card>
    );
  }

  return (
    <>
      <style>
        {`
          @keyframes heartbeat-chart {
            0% { transform: scale(1); box-shadow: 0 0 10px rgba(231, 76, 60, 0.5); }
            50% { transform: scale(1.03); box-shadow: 0 0 16px rgba(231, 76, 60, 0.6); }
            100% { transform: scale(1); box-shadow: 0 0 10px rgba(231, 76, 60, 0.5); }
          }

          @keyframes bar-rise-heart {
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

          @keyframes twinkle-heart {
            0%, 100% { text-shadow: 0 0 6px rgba(231, 76, 60, 0.6); }
            50% { text-shadow: 0 0 12px rgba(231, 76, 60, 0.7); }
          }

          @keyframes heart-drift-chart {
            0% { transform: translateX(0) translateY(0); opacity: 0.5; }
            50% { transform: translateX(-6%) translateY(-3%); opacity: 0.8; }
            100% { transform: translateX(0) translateY(0); opacity: 0.5; }
          }
        `}
      </style>

      <Card
        sx={{
          backgroundColor: 'rgba(25, 25, 45, 0.85)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          width: '100%',
          borderRadius: 3,
          border: '1px solid rgba(231, 76, 60, 0.4)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
          position: 'relative',
          overflow: 'hidden',
          ...(animate && {
            animation: 'heartbeat-chart 0.6s ease-in-out',
          }),
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #e74c3c, rgba(231, 76, 60, 0.4), #e74c3c, transparent)',
            animation: 'twinkle-heart 3s infinite',
            zIndex: 2,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '15%',
            left: '-60%',
            width: '220%',
            height: '70%',
            background: 'radial-gradient(circle at 50% 40%, rgba(139, 0, 0, 0.1), transparent 80%)',
            pointerEvents: 'none',
            zIndex: 0,
            animation: 'heart-drift-chart 25s linear infinite',
          },
        }}
      >
        <CardContent sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0 }}>
            <Typography
              variant="overline"
              sx={{
                fontFamily: '"Playfair Display", serif',
                color: '#ffffff',
                fontSize: '1.3rem',
                letterSpacing: '0.05em',
              }}
            >
              📊 Volume des cœurs
            </Typography>
            <Chip
              label="🟢 En direct"
              size="small"
              sx={{
                background: 'linear-gradient(135deg, #e74c3c, #ff6b6b)',
                color: '#ffffff',
                fontWeight: 'bold',
                fontFamily: '"Playfair Display", serif',
                animation: 'heartbeat 1.8s ease-in-out infinite',
                border: '1px solid rgba(231, 76, 60, 0.4)',
              }}
            />
          </Box>

          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={data}
              margin={{ top: 30, right: 20, left: 10, bottom: 20 }}
              barSize={100}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.15)" opacity={0.3} />

              <XAxis
                dataKey="dayLabel"
                stroke="#ffffff"
                tick={{
                  fill: '#ffffff',
                  fontSize: 22,
                  fontWeight: 'bold',
                  fontFamily: '"Playfair Display", serif',
                }}
              />

              <YAxis
                stroke="#ffffff"
                tick={{
                  fill: '#ffffff',
                  fontSize: 22,
                  fontWeight: 'bold',
                  fontFamily: '"Playfair Display", serif',
                }}
                tickFormatter={hideZeroLabels}
              />

              <Tooltip
                formatter={(value, name) => {
                  const labels = { inbound: '❤️ Cœurs conquis', outbound: '💘 Cœurs partagés' };
                  return [formatNumber(value), labels[name] || name];
                }}
                labelFormatter={(label) => `Jour : ${label}`}
                contentStyle={{
                  backgroundColor: 'rgba(30, 30, 50, 0.95)',
                  border: '1px solid rgba(231, 76, 60, 0.5)',
                  borderRadius: 8,
                  color: '#ffffff',
                  fontSize: 12,
                  fontFamily: '"Roboto", sans-serif',
                  boxShadow: '0 0 12px rgba(231, 76, 60, 0.2)',
                }}
              />

              <Bar
                dataKey="inbound"
                name="Cœurs conquis"
                fill={INBOUND_COLOR}
                animationDuration={1200}
                style={{ animation: 'bar-rise-heart 1s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }}
              >
                <LabelList
                  dataKey="inbound"
                  position="top"
                  fill="#ffffff"
                  fontWeight="bold"
                  fontSize={22}
                  formatter={hideZeroLabels}
                  style={{
                    textShadow: '0 0 6px rgba(231, 76, 60, 0.6)',
                    fontFamily: '"Playfair Display", serif',
                    animation: 'twinkle-heart 3s infinite alternate',
                  }}
                />
              </Bar>

              <Bar
                dataKey="outbound"
                name="Cœurs partagés"
                fill={OUTBOUND_COLOR}
                animationDuration={1200}
                style={{ animation: 'bar-rise-heart 1s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }}
              >
                <LabelList
                  dataKey="outbound"
                  position="top"
                  fill="#ffffff"
                  fontWeight="bold"
                  fontSize={22}
                  formatter={hideZeroLabels}
                  style={{
                    textShadow: '0 0 6px rgba(139, 0, 0, 0.7)',
                    fontFamily: '"Playfair Display", serif',
                    animation: 'twinkle-heart 3s infinite alternate',
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* ✅ Textes parfaitement lisibles */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 6, pt: 2, pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box 
                sx={{ 
                  width: 16, 
                  height: 16, 
                  bgcolor: INBOUND_COLOR, 
                  borderRadius: '2px', 
                  boxShadow: `0 0 10px ${INBOUND_COLOR}, 0 0 15px rgba(255, 20, 147, 0.6)`,
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                }} 
              />
              <Typography
                variant="body1"
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  fontWeight: 'bold',
                  fontSize: 22,
                  color: '#ffffff',
                }}
              >
                ❤️ Cœurs conquis
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box 
                sx={{ 
                  width: 16, 
                  height: 16, 
                  bgcolor: OUTBOUND_COLOR, 
                  borderRadius: '2px', 
                  boxShadow: `0 0 10px ${OUTBOUND_COLOR}, 0 0 15px rgba(255, 69, 0, 0.6)`,
                  border: '1px solid rgba(255, 255, 255, 0.5)',
                }} 
              />
              <Typography
                variant="body1"
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  fontWeight: 'bold',
                  fontSize: 22,
                  color: '#ffffff',
                }}
              >
                💘 Cœurs partagés
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </>
  );
}

export default SLABarchart;