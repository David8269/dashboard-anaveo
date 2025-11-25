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

const INBOUND_COLOR = '#d42426'; // Rouge cadeau
const OUTBOUND_COLOR = '#228b22'; // Vert sapin

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
          backgroundColor: 'rgba(255, 255, 255, 0.70)', // ✅ Transparence appliquée
          width: '100%',
          borderRadius: 3,
          border: '1px solid #d42426',
          boxShadow: '0 0 15px rgba(212, 36, 38, 0.3)',
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
          background: 'radial-gradient(circle at 40% 50%, rgba(212,36,38,0.08), transparent 70%)',
          animation: 'snow-drift 22s linear infinite',
          pointerEvents: 'none',
          zIndex: 0,
        }} />
        <CardContent sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="overline"
            sx={{
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
              size="small"
              sx={{
                mb: 2,
                background: wsConnected
                  ? 'linear-gradient(135deg, #c1272d, #8b0000)'
                  : 'linear-gradient(135deg, #d42426, #8b0000)',
                color: '#ffd700',
                fontFamily: '"Mountains of Christmas", cursive',
                animation: wsConnected ? 'none' : 'pulse-christmas 1.5s infinite alternate',
              }}
            />
            <Skeleton variant="rectangular" width="100%" height={350} />
          </Box>
        </CardContent>
        <style>{`
          @keyframes pulse-christmas {
            0% { transform: scale(1); box-shadow: 0 0 10px rgba(255,215,0,0.5); }
            50% { transform: scale(1.03); box-shadow: 0 0 16px rgba(255,215,0,0.7); }
            100% { transform: scale(1); box-shadow: 0 0 10px rgba(255,215,0,0.5); }
          }
          @keyframes snow-drift {
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
          @keyframes pulse-christmas {
            0% { transform: scale(1); box-shadow: 0 0 10px rgba(255,215,0,0.5); }
            50% { transform: scale(1.03); box-shadow: 0 0 16px rgba(255,215,0,0.7); }
            100% { transform: scale(1); box-shadow: 0 0 10px rgba(255,215,0,0.5); }
          }

          @keyframes bar-rise {
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

          @keyframes twinkle-glow {
            0%, 100% { text-shadow: 0 0 6px rgba(255,215,0,0.7); }
            50% { text-shadow: 0 0 12px rgba(255,170,0,0.9); }
          }

          @keyframes snow-drift-chart {
            0% { transform: translateX(0) translateY(0); opacity: 0.5; }
            50% { transform: translateX(-6%) translateY(-3%); opacity: 0.7; }
            100% { transform: translateX(0) translateY(0); opacity: 0.5; }
          }
        `}
      </style>

      <Card
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.70)', // ✅ Transparence appliquée
          width: '100%',
          borderRadius: 3,
          border: '1px solid #d42426',
          boxShadow: '0 0 15px rgba(212, 36, 38, 0.3)',
          position: 'relative',
          overflow: 'hidden',
          ...(animate && {
            animation: 'pulse-christmas 0.6s ease-in-out',
          }),
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #ffd700, #d42426, #ffd700, transparent)',
            animation: 'twinkle-glow 3s infinite',
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
            animation: 'snow-drift-chart 25s linear infinite',
          },
        }}
      >
        <CardContent sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0 }}>
            <Typography
              variant="overline"
              sx={{
                fontFamily: '"Mountains of Christmas", cursive',
                color: '#d42426',
                textShadow: '0 0 6px rgba(255,215,0,0.6)',
                fontSize: '1.2rem',
              }}
            >
              📞 NUMBER OF CALLS
            </Typography>
            <Chip
              label="🟢 Live"
              size="small"
              sx={{
                background: 'linear-gradient(135deg, #228b22, #1e7a1e)',
                color: '#fff',
                fontWeight: 'bold',
                animation: 'pulse-christmas 2s infinite',
              }}
            />
          </Box>

          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={data}
              margin={{ top: 30, right: 20, left: 10, bottom: 20 }}
              barSize={100}
            >
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
                }}
              />

              <YAxis
                stroke="#2e8b57"
                tick={{
                  ...commonFont,
                  fill: '#000',
                  fontSize: 25,
                  fontWeight: 'bold',
                }}
                tickFormatter={hideZeroLabels}
              />

              <Tooltip
                formatter={(value, name) => {
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
                }}
              />

              <Bar
                dataKey="inbound"
                name="Inbound"
                fill={INBOUND_COLOR}
                animationDuration={1200}
                style={{ animation: 'bar-rise 1s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }}
              >
                <LabelList
                  dataKey="inbound"
                  position="top"
                  fill="#d42426"
                  fontWeight="bold"
                  fontSize={25}
                  formatter={hideZeroLabels}
                  style={{
                    textShadow: '0 0 6px rgba(255,215,0,0.7)',
                    fontFamily: '"Mountains of Christmas", cursive',
                    animation: 'twinkle-glow 3s infinite alternate',
                  }}
                />
              </Bar>

              <Bar
                dataKey="outbound"
                name="Outbound"
                fill={OUTBOUND_COLOR}
                animationDuration={1200}
                style={{ animation: 'bar-rise 1s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }}
              >
                <LabelList
                  dataKey="outbound"
                  position="top"
                  fill="#228b22"
                  fontWeight="bold"
                  fontSize={25}
                  formatter={hideZeroLabels}
                  style={{
                    textShadow: '0 0 6px rgba(34,139,34,0.5)',
                    fontFamily: '"Mountains of Christmas", cursive',
                    animation: 'twinkle-glow 3s infinite alternate',
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Légende – inchangée mais cohérente */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 6, pt: 2, pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 16, height: 16, bgcolor: INBOUND_COLOR, borderRadius: '2px', boxShadow: `0 0 6px ${INBOUND_COLOR}` }} />
              <Typography
                variant="body1"
                sx={{
                  fontFamily: '"Mountains of Christmas", cursive',
                  fontWeight: 'bold',
                  fontSize: 25,
                  color: '#d42426',
                  textShadow: '0 0 4px rgba(255,215,0,0.5)',
                }}
              >
                📞 Inbound
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 16, height: 16, bgcolor: OUTBOUND_COLOR, borderRadius: '2px', boxShadow: `0 0 6px ${OUTBOUND_COLOR}` }} />
              <Typography
                variant="body1"
                sx={{
                  fontFamily: '"Mountains of Christmas", cursive',
                  fontWeight: 'bold',
                  fontSize: 25,
                  color: '#228b22',
                  textShadow: '0 0 4px rgba(34,139,34,0.5)',
                }}
              >
                🎄 Outbound
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </>
  );
}

export default SLABarchart;