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

// === 🦉🎀 Couleurs thème Octobre Rose ===
const INBOUND_COLOR = '#6ee7b7';  // Vert doux (succès, cohérent avec CallVolumeChart)
const OUTBOUND_COLOR = '#fde047'; // Or doux (contraste élégant)

const formatNumber = (num) => (num >= 1000 ? (num / 1000).toFixed(1) + 'k' : num.toString());
const hideZeroLabels = (value) => (value === 0 ? '' : formatNumber(value));

// === 🦉🎀 Tooltip personnalisé – Style "Ruban de Verre" ===
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          backgroundColor: 'rgba(45, 10, 30, 0.75)',
          border: '1px solid rgba(255, 77, 148, 0.3)',
          borderTop: '3px solid #ff4d94', // Effet Ruban
          borderRadius: 2,
          p: 1.5,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <Typography 
          variant="caption" 
          sx={{ 
            color: '#ff4d94', 
            fontWeight: 700, 
            display: 'block', 
            mb: 1,
            fontFamily: '"Dancing Script", cursive',
            fontSize: '1.1rem',
            letterSpacing: '0.5px',
            textShadow: '0 2px 4px rgba(0,0,0,0.8)',
          }}
        >
          🕒 {label}
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
            inbound: '📞',
            outbound: '📤',
          };
          return (
            <Typography 
              key={index} 
              variant="body2" 
              sx={{ 
                color: '#ffe6f0', 
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 0.8,
                mb: 0.5,
                fontFamily: '"Inter", sans-serif',
                textShadow: '0 1px 3px rgba(0,0,0,0.8)',
              }}
            >
              <Box 
                component="span" 
                sx={{ 
                  width: 12, 
                  height: 12, 
                  bgcolor: colors[entry.dataKey], 
                  borderRadius: '3px',
                  display: 'inline-block',
                  boxShadow: `0 0 6px ${colors[entry.dataKey]}`,
                }} 
              />
              {icons[entry.dataKey]} {labels[entry.dataKey] || entry.name}: <strong style={{ color: '#ff4d94' }}>{formatNumber(entry.value)}</strong>
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

  // === 🦉 État vide – Ambiance Octobre Rose ===
  if (data.length === 0) {
    return (
      <Card
        sx={{
          backgroundColor: 'rgba(45, 10, 30, 0.60)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          width: '100%',
          borderRadius: 4,
          border: '1px solid rgba(255, 77, 148, 0.3)',
          borderTop: '3px solid #ff4d94', // Effet Ruban
          boxShadow: '0 4px 20px rgba(0,0,0,0.3), inset 0 0 15px rgba(255, 255, 255, 0.05)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: 'rgba(74, 14, 46, 0.70)',
            borderColor: 'rgba(255, 230, 240, 0.6)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(255, 77, 148, 0.2)',
            transform: 'translateY(-2px)',
          }
        }}
      >
        <CardContent sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="overline"
            sx={{
              fontFamily: '"Dancing Script", cursive',
              color: '#ff4d94',
              textShadow: '0 2px 8px rgba(0,0,0,0.6), 0 0 15px rgba(255, 77, 148, 0.4)',
              fontSize: '1.5rem',
              fontWeight: 700,
              mb: 2,
              display: 'block',
            }}
          >
            🎀 Volume hebdomadaire des appels
          </Typography>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Chip
              label={wsConnected ? '🎀 Aucun appel enregistré' : '⚠️ Connexion au flux...'}
              size="small"
              sx={{
                mb: 2,
                background: 'rgba(255, 77, 148, 0.2)',
                backdropFilter: 'blur(6px)',
                color: '#ffe6f0',
                fontFamily: '"Montserrat", sans-serif',
                fontWeight: 700,
                animation: wsConnected ? 'none' : 'pulse-rose 2s infinite alternate',
                border: '1px solid rgba(255, 230, 240, 0.5)',
              }}
            />
            <Skeleton 
              variant="rectangular" 
              width="100%" 
              height={350} 
              sx={{ 
                backgroundColor: 'rgba(255, 77, 148, 0.08)',
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
          @keyframes pulse-rose {
            0% { transform: scale(1); box-shadow: 0 0 10px rgba(255, 77, 148, 0.3); }
            100% { transform: scale(1.05); box-shadow: 0 0 20px rgba(255, 77, 148, 0.5); }
          }

          @keyframes bar-rise-rose {
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

          @keyframes rose-glow {
            0%, 100% { text-shadow: 0 2px 6px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.8), 0 0 6px rgba(255, 77, 148, 0.3); }
            50% { text-shadow: 0 2px 6px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.8), 0 0 12px rgba(255, 77, 148, 0.5); }
          }

          @keyframes rose-drift-chart {
            0% { transform: translateX(0) translateY(0); opacity: 0.4; }
            50% { transform: translateX(-6%) translateY(-3%); opacity: 0.6; }
            100% { transform: translateX(0) translateY(0); opacity: 0.4; }
          }

          @keyframes pulse-status-rose {
            0%, 100% { box-shadow: 0 0 0 0 rgba(110, 231, 183, 0.5); }
            50% { box-shadow: 0 0 0 8px rgba(110, 231, 183, 0); }
          }

          /* Effet ruban/ondulation au survol */
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
            background: radial-gradient(circle, rgba(255, 77, 148, 0.1) 0%, transparent 70%);
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
          backgroundColor: 'rgba(45, 10, 30, 0.60)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          width: '100%',
          borderRadius: 4,
          border: '1px solid rgba(255, 77, 148, 0.3)',
          borderTop: '3px solid #ff4d94', // Effet Ruban
          boxShadow: '0 4px 20px rgba(0,0,0,0.3), inset 0 0 15px rgba(255, 255, 255, 0.05)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          ...(animate && {
            animation: 'pulse-rose 0.6s ease-in-out',
          }),
          '&:hover': {
            backgroundColor: 'rgba(74, 14, 46, 0.70)',
            borderColor: 'rgba(255, 230, 240, 0.6)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(255, 77, 148, 0.2)',
            transform: 'translateY(-2px)',
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, transparent, #ff4d94, rgba(255, 230, 240, 0.5), #d4849c, transparent)',
            animation: 'rose-glow 3s infinite',
            zIndex: 2,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '15%',
            left: '-60%',
            width: '220%',
            height: '70%',
            background: 'radial-gradient(circle at 50% 40%, rgba(255, 153, 200, 0.06), transparent 80%)',
            pointerEvents: 'none',
            zIndex: 0,
            animation: 'rose-drift-chart 25s linear infinite',
          },
        }}
      >
        <CardContent sx={{ position: 'relative', zIndex: 1, pt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography
              variant="overline"
              sx={{
                fontFamily: '"Dancing Script", cursive',
                color: '#ff4d94',
                textShadow: '0 2px 8px rgba(0,0,0,0.6), 0 0 15px rgba(255, 77, 148, 0.4)',
                fontSize: '1.5rem',
                fontWeight: 700,
              }}
            >
               Volume des appels
            </Typography>
            <Chip
              label="En direct"
              size="small"
              sx={{
                fontSize: 12,
                background: wsConnected 
                  ? 'rgba(110, 231, 183, 0.2)'
                  : 'rgba(252, 165, 165, 0.2)',
                backdropFilter: 'blur(6px)',
                color: '#ffe6f0',
                fontWeight: 700,
                fontFamily: '"Montserrat", sans-serif',
                animation: wsConnected ? 'pulse-status-rose 2s infinite' : 'none',
                border: '1px solid rgba(255, 230, 240, 0.5)',
              }}
            />
          </Box>

          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={data}
              margin={{ top: 30, right: 20, left: 10, bottom: 20 }}
              barSize={100}
            >
              {/* Grille – Style rose très subtil */}
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(255, 77, 148, 0.15)" 
                opacity={0.4} 
              />

              {/* Axe X */}
              <XAxis
                dataKey="dayLabel"
                stroke="#ffe6f0"
                tick={{
                  fill: '#ffe6f0',
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: '"Inter", sans-serif',
                  textShadow: '0 2px 6px rgba(0,0,0,0.9)',
                }}
              />

              {/* Axe Y */}
              <YAxis
                stroke="#ffe6f0"
                tick={{
                  fill: '#ffe6f0',
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: '"Inter", sans-serif',
                  textShadow: '0 2px 6px rgba(0,0,0,0.9)',
                }}
                tickFormatter={hideZeroLabels}
              />

              {/* Tooltip personnalisé */}
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 77, 148, 0.08)' }} />

              {/* Barre entrants – VERT doux */}
              <Bar
                dataKey="inbound"
                name="Appels entrants"
                fill={INBOUND_COLOR}
                fillOpacity={0.85}
                animationDuration={1200}
                style={{ animation: 'bar-rise-rose 1s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }}
              >
                <LabelList
                  dataKey="inbound"
                  position="top"
                  fill="#ffe6f0"
                  fontWeight="bold"
                  fontSize={12}
                  formatter={hideZeroLabels}
                  style={{
                    textShadow: '0 2px 6px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.8), 0 0 6px rgba(110, 231, 183, 0.4)',
                    fontFamily: '"Montserrat", sans-serif',
                    animation: 'rose-glow 3s infinite alternate',
                  }}
                />
              </Bar>

              {/* Barre sortants – OR doux */}
              <Bar
                dataKey="outbound"
                name="Appels sortants"
                fill={OUTBOUND_COLOR}
                fillOpacity={0.85}
                animationDuration={1200}
                style={{ animation: 'bar-rise-rose 1s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }}
              >
                <LabelList
                  dataKey="outbound"
                  position="top"
                  fill="#ffffff" // ✅ Blanc pour meilleure visibilité
                  fontWeight="bold"
                  fontSize={12}
                  formatter={hideZeroLabels}
                  style={{
                    textShadow: '0 2px 6px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.8)', // ✅ Ombre portée renforcée
                    fontFamily: '"Montserrat", sans-serif',
                    animation: 'rose-glow 3s infinite alternate',
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Légende – Style Octobre Rose */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 6, pt: 3, pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box 
                sx={{ 
                  width: 16, 
                  height: 16, 
                  bgcolor: INBOUND_COLOR, 
                  borderRadius: '3px', 
                  boxShadow: `0 0 8px ${INBOUND_COLOR}`, 
                  border: '1px solid rgba(255, 230, 240, 0.5)',
                  opacity: 0.9,
                }} 
              />
              <Typography
                variant="body1"
                sx={{
                  fontFamily: '"Inter", sans-serif',
                  fontWeight: 600,
                  fontSize: 12,
                  color: '#ffe6f0',
                  textShadow: '0 2px 6px rgba(0,0,0,0.9)',
                }}
              >
                Appels entrants
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box 
                sx={{ 
                  width: 16, 
                  height: 16, 
                  bgcolor: OUTBOUND_COLOR, 
                  borderRadius: '3px', 
                  boxShadow: `0 0 8px ${OUTBOUND_COLOR}`, 
                  border: '1px solid rgba(255, 230, 240, 0.5)',
                  opacity: 0.9,
                }} 
              />
              <Typography
                variant="body1"
                sx={{
                  fontFamily: '"Inter", sans-serif',
                  fontWeight: 600,
                  fontSize: 12,
                  color: '#ffe6f0',
                  textShadow: '0 2px 6px rgba(0,0,0,0.9)',
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