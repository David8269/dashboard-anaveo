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

// === 🦉 Couleurs thème INNOVEO ===
const INBOUND_COLOR = '#00D4FF';  // Cyan Tech
const OUTBOUND_COLOR = '#FFD700'; // Or

const formatNumber = (num) => (num >= 1000 ? (num / 1000).toFixed(1) + 'k' : num.toString());
const hideZeroLabels = (value) => (value === 0 ? '' : formatNumber(value));

// === 🦉 Tooltip personnalisé – Style "Tech Glass" ===
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          backgroundColor: 'rgba(0, 15, 25, 0.85)',
          border: '1px solid rgba(0, 212, 255, 0.4)',
          borderTop: '2px solid #FFD700',
          borderRadius: 2,
          p: 1.5,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <Typography 
          variant="caption" 
          sx={{ 
            color: '#FFD700', 
            fontWeight: 700, 
            display: 'block', 
            mb: 1,
            fontFamily: '"Rajdhani", sans-serif',
            fontSize: '1rem',
            letterSpacing: '1px',
            textTransform: 'uppercase',
          }}
        >
          ⏱️ {label}
        </Typography>
        {payload.map((entry, index) => {
          const labels = { 
            inbound: 'Appels entrants', 
            outbound: 'Appels sortants'
          };
          const colors = {
            inbound: INBOUND_COLOR,
            outbound: OUTBOUND_COLOR,
          };
          const icons = {
            inbound: '📥',
            outbound: '📤',
          };
          return (
            <Typography 
              key={index} 
              variant="body2" 
              sx={{ 
                color: '#ffffff', 
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 0.8,
                mb: 0.5,
                fontFamily: '"Inter", sans-serif',
              }}
            >
              <Box 
                component="span" 
                sx={{ 
                  width: 10, 
                  height: 10, 
                  bgcolor: colors[entry.dataKey], 
                  borderRadius: '2px',
                  display: 'inline-block',
                  boxShadow: `0 0 6px ${colors[entry.dataKey]}`,
                }} 
              />
              {icons[entry.dataKey]} {labels[entry.dataKey] || entry.name}: <strong style={{ color: colors[entry.dataKey], fontFamily: '"Orbitron", sans-serif' }}>{formatNumber(entry.value)}</strong>
            </Typography>
          );
        })}
      </Box>
    );
  }
  return null;
};

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

  // === 🦉 État vide – Ambiance Tech (TRANSPARENCE MAXIMALE) ===
  if (data.length === 0) {
    return (
      <Card
        sx={{
          backgroundColor: 'rgba(0, 15, 25, 0.15)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          width: '100%',
          borderRadius: 4,
          border: '1px solid rgba(0, 212, 255, 0.35)',
          borderTop: '2px solid #FFD700',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 0 20px rgba(0, 212, 255, 0.05)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.4s ease',
          '&:hover': {
            backgroundColor: 'rgba(0, 20, 30, 0.20)',
            borderColor: 'rgba(0, 212, 255, 0.6)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 212, 255, 0.2)',
            transform: 'translateY(-4px)',
          }
        }}
      >
        <CardContent sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="overline"
            sx={{
              fontFamily: '"Orbitron", sans-serif',
              color: '#00D4FF',
              textShadow: '0 0 10px rgba(0, 212, 255, 0.5)',
              fontSize: '1.5rem',
              fontWeight: 700,
              mb: 2,
              display: 'block',
              letterSpacing: '0.1em',
            }}
          >
            📊 Volume hebdomadaire des appels
          </Typography>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Chip
              label={wsConnected ? 'Aucune donnée disponible' : 'Synchronisation en cours...'}
              size="small"
              sx={{
                mb: 2,
                background: 'rgba(0, 212, 255, 0.15)',
                backdropFilter: 'blur(6px)',
                color: '#00D4FF',
                fontFamily: '"Rajdhani", sans-serif',
                fontWeight: 700,
                letterSpacing: '1px',
                animation: wsConnected ? 'none' : 'pulse-tech 2s infinite alternate',
                border: '1px solid rgba(0, 212, 255, 0.4)',
              }}
            />
            <Skeleton 
              variant="rectangular" 
              width="100%" 
              height={350} 
              sx={{ 
                backgroundColor: 'rgba(0, 20, 30, 0.2)',
                borderRadius: 2,
              }} 
            />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <style>
        {`
          @keyframes pulse-tech {
            0% { transform: scale(1); box-shadow: 0 0 10px rgba(0, 212, 255, 0.2); }
            100% { transform: scale(1.03); box-shadow: 0 0 20px rgba(0, 212, 255, 0.4); }
          }

          @keyframes bar-rise-tech {
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

          @keyframes tech-glow {
            0%, 100% { text-shadow: 0 0 8px rgba(0, 212, 255, 0.4); }
            50% { text-shadow: 0 0 15px rgba(0, 212, 255, 0.8); }
          }

          @keyframes tech-drift-chart {
            0% { transform: translateX(0) translateY(0); opacity: 0.3; }
            50% { transform: translateX(-6%) translateY(-3%); opacity: 0.6; }
            100% { transform: translateX(0) translateY(0); opacity: 0.3; }
          }

          @keyframes pulse-status-cyan {
            0%, 100% { box-shadow: 0 0 0 0 rgba(0, 212, 255, 0.5); }
            50% { box-shadow: 0 0 0 8px rgba(0, 212, 255, 0); }
          }

          .ribbon-hover-chart {
            position: relative;
            overflow: hidden;
          }
          .ribbon-hover-chart::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(0, 212, 255, 0.1) 0%, transparent 70%);
            opacity: 0;
            transform: scale(0.3);
            transition: all 0.4s ease;
            pointer-events: none;
            border-radius: 50%;
          }
          .ribbon-hover-chart:hover::before {
            opacity: 1;
            transform: scale(1);
            animation: ribbon-ripple-chart 0.6s ease-out;
          }
          @keyframes ribbon-ripple-chart {
            0% { transform: scale(0.3); opacity: 0.8; }
            100% { transform: scale(1.5); opacity: 0; }
          }
        `}
      </style>

      <Card
        className="ribbon-hover-chart"
        sx={{
          backgroundColor: 'rgba(0, 15, 25, 0.15)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          width: '100%',
          borderRadius: 4,
          border: '1px solid rgba(0, 212, 255, 0.35)',
          borderTop: '2px solid #FFD700',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 0 20px rgba(0, 212, 255, 0.05)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          ...(animate && {
            animation: 'pulse-tech 0.6s ease-in-out',
          }),
          '&:hover': {
            backgroundColor: 'rgba(0, 20, 30, 0.20)',
            borderColor: 'rgba(0, 212, 255, 0.6)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 212, 255, 0.2)',
            transform: 'translateY(-4px)',
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #00D4FF, rgba(255, 255, 255, 0.3), #FFD700, transparent)',
            animation: 'tech-glow 3s infinite',
            zIndex: 2,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '15%',
            left: '-60%',
            width: '220%',
            height: '70%',
            background: 'radial-gradient(circle at 50% 40%, rgba(0, 212, 255, 0.06), transparent 80%)',
            pointerEvents: 'none',
            zIndex: 0,
            animation: 'tech-drift-chart 25s linear infinite',
          },
        }}
      >
        <CardContent sx={{ position: 'relative', zIndex: 1, pt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography
              variant="overline"
              sx={{
                fontFamily: '"Orbitron", sans-serif',
                color: '#00D4FF',
                textShadow: '0 0 10px rgba(0, 212, 255, 0.5)',
                fontSize: '1.5rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
              }}
            >
               📊 Volume des appels
            </Typography>
            <Chip
              label={wsConnected ? '⚡ En direct' : '🔴 Déconnecté'}
              size="small"
              sx={{
                fontSize: 12,
                background: wsConnected 
                  ? 'rgba(0, 255, 100, 0.15)'
                  : 'rgba(255, 69, 0, 0.15)',
                backdropFilter: 'blur(6px)',
                color: wsConnected ? '#00ff64' : '#ff4500',
                fontWeight: 700,
                fontFamily: '"Rajdhani", sans-serif',
                letterSpacing: '1px',
                animation: wsConnected ? 'pulse-status-cyan 2s infinite' : 'none',
                border: `1px solid ${wsConnected ? 'rgba(0, 255, 100, 0.4)' : 'rgba(255, 69, 0, 0.4)'}`,
              }}
            />
          </Box>

          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={data}
              margin={{ top: 30, right: 20, left: 10, bottom: 20 }}
              barSize={100}
            >
              {/* Grille – Style Tech très subtil */}
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(0, 212, 255, 0.15)" 
                opacity={0.4} 
              />

              {/* Axe X */}
              <XAxis
                dataKey="dayLabel"
                stroke="#ffffff"
                tick={{
                  fill: '#ffffff',
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: '"Inter", sans-serif',
                }}
              />

              {/* Axe Y */}
              <YAxis
                stroke="#ffffff"
                tick={{
                  fill: '#ffffff',
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: '"Inter", sans-serif',
                }}
                tickFormatter={hideZeroLabels}
              />

              {/* Tooltip personnalisé */}
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 212, 255, 0.1)' }} />

              {/* Barre entrants – CYAN Tech */}
              <Bar
                dataKey="inbound"
                name="Appels entrants"
                fill={INBOUND_COLOR}
                fillOpacity={0.85}
                animationDuration={1200}
                style={{ animation: 'bar-rise-tech 1s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }}
              >
                <LabelList
                  dataKey="inbound"
                  position="top"
                  fill="#ffffff"
                  fontWeight="bold"
                  fontSize={12}
                  formatter={hideZeroLabels}
                  style={{
                    textShadow: '0 0 8px rgba(0, 212, 255, 0.6)',
                    fontFamily: '"Orbitron", sans-serif',
                    animation: 'tech-glow 3s infinite alternate',
                  }}
                />
              </Bar>

              {/* Barre sortants – OR Tech */}
              <Bar
                dataKey="outbound"
                name="Appels sortants"
                fill={OUTBOUND_COLOR}
                fillOpacity={0.85}
                animationDuration={1200}
                style={{ animation: 'bar-rise-tech 1s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }}
              >
                <LabelList
                  dataKey="outbound"
                  position="top"
                  fill="#ffffff"
                  fontWeight="bold"
                  fontSize={12}
                  formatter={hideZeroLabels}
                  style={{
                    textShadow: '0 0 8px rgba(255, 215, 0, 0.6)',
                    fontFamily: '"Orbitron", sans-serif',
                    animation: 'tech-glow 3s infinite alternate',
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Légende – Style INNOVEO */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 6, pt: 3, pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box 
                sx={{ 
                  width: 14, 
                  height: 14, 
                  bgcolor: INBOUND_COLOR, 
                  borderRadius: '2px', 
                  boxShadow: `0 0 8px ${INBOUND_COLOR}`, 
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  opacity: 0.9,
                }} 
              />
              <Typography
                variant="body1"
                sx={{
                  fontFamily: '"Rajdhani", sans-serif',
                  fontWeight: 600,
                  fontSize: 13,
                  letterSpacing: '0.5px',
                  color: '#ffffff',
                }}
              >
                Appels entrants
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box 
                sx={{ 
                  width: 14, 
                  height: 14, 
                  bgcolor: OUTBOUND_COLOR, 
                  borderRadius: '2px', 
                  boxShadow: `0 0 8px ${OUTBOUND_COLOR}`, 
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  opacity: 0.9,
                }} 
              />
              <Typography
                variant="body1"
                sx={{
                  fontFamily: '"Rajdhani", sans-serif',
                  fontWeight: 600,
                  fontSize: 13,
                  letterSpacing: '0.5px',
                  color: '#ffffff',
                }}
              >
                Appels sortants
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </>
  );
}

export default SLABarchart;