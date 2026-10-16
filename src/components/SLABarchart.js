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

// === 🎃 Couleurs thème Halloween ===
const INBOUND_COLOR = '#9d4edd';  // Violet Mystique
const OUTBOUND_COLOR = '#ffaa00'; // Orange Citrouille

const formatNumber = (num) => (num >= 1000 ? (num / 1000).toFixed(1) + 'k' : num.toString());
const hideZeroLabels = (value) => (value === 0 ? '' : formatNumber(value));

// === 🎃 Tooltip personnalisé – Style "Citrouille de Verre" ===
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          backgroundColor: 'rgba(10, 5, 10, 0.90)', // Fond très sombre pour lisibilité max
          border: '1px solid rgba(255, 107, 53, 0.5)',
          borderTop: '3px solid #ffaa00',
          borderRadius: 2,
          p: 1.5,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <Typography 
          variant="caption" 
          sx={{ 
            color: '#ffaa00', 
            fontWeight: 700, 
            display: 'block', 
            mb: 1,
            fontFamily: '"Dancing Script", cursive',
            fontSize: '1.1rem',
            letterSpacing: '0.5px',
            textShadow: '0 0 10px rgba(0,0,0,0.95)',
          }}
        >
          🕰️ {label}
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
                textShadow: '0 1px 3px rgba(0,0,0,0.9)',
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
              {icons[entry.dataKey]} {labels[entry.dataKey] || entry.name}: <strong style={{ color: colors[entry.dataKey] }}>{formatNumber(entry.value)}</strong>
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

  // === 🎃 État vide – Ambiance Halloween ===
  if (data.length === 0) {
    return (
      <Card
        sx={{
          backgroundColor: 'rgba(10, 5, 10, 0.65)', // Plus transparent
          backdropFilter: 'blur(24px)', // Flou renforcé
          WebkitBackdropFilter: 'blur(24px)',
          width: '100%',
          borderRadius: 4,
          border: '1px solid rgba(255, 107, 53, 0.4)',
          borderTop: '3px solid #ffaa00',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 0 20px rgba(255, 107, 53, 0.05)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.4s ease',
          '&:hover': {
            backgroundColor: 'rgba(26, 15, 26, 0.75)',
            borderColor: 'rgba(255, 140, 100, 0.6)',
            boxShadow: '0 12px 40px rgba(255, 107, 53, 0.3), 0 0 30px rgba(255, 107, 53, 0.2)',
            transform: 'translateY(-4px)',
          }
        }}
      >
        <CardContent sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="overline"
            sx={{
              fontFamily: '"Creepster", "Dancing Script", cursive',
              color: '#ffaa00',
              textShadow: '0 0 10px rgba(0,0,0,0.95), 0 2px 4px rgba(0,0,0,0.9)',
              fontSize: '1.5rem',
              fontWeight: 700,
              mb: 2,
              display: 'block',
            }}
          >
            🎃 Volume hebdomadaire des appels
          </Typography>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Chip
              label={wsConnected ? '🎃 Aucun appel enregistré' : '⚠️ Connexion au flux...'}
              size="small"
              sx={{
                mb: 2,
                background: 'rgba(255, 107, 53, 0.2)',
                backdropFilter: 'blur(6px)',
                color: '#ffffff',
                fontFamily: '"Montserrat", sans-serif',
                fontWeight: 700,
                animation: wsConnected ? 'none' : 'pulse-halloween 2s infinite alternate',
                border: '1px solid rgba(255, 170, 0, 0.5)',
              }}
            />
            <Skeleton 
              variant="rectangular" 
              width="100%" 
              height={350} 
              sx={{ 
                backgroundColor: 'rgba(255, 107, 53, 0.1)',
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
          @keyframes pulse-halloween {
            0% { transform: scale(1); box-shadow: 0 0 10px rgba(255, 107, 53, 0.3); }
            100% { transform: scale(1.05); box-shadow: 0 0 20px rgba(157, 78, 221, 0.5); }
          }

          @keyframes bar-rise-halloween {
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

          @keyframes halloween-glow {
            0%, 100% { text-shadow: 0 0 10px rgba(0,0,0,0.95), 0 2px 4px rgba(0,0,0,0.9), 0 0 6px rgba(255, 107, 53, 0.3); }
            50% { text-shadow: 0 0 10px rgba(0,0,0,0.95), 0 2px 4px rgba(0,0,0,0.9), 0 0 12px rgba(255, 107, 53, 0.6); }
          }

          @keyframes halloween-drift-chart {
            0% { transform: translateX(0) translateY(0); opacity: 0.4; }
            50% { transform: translateX(-6%) translateY(-3%); opacity: 0.6; }
            100% { transform: translateX(0) translateY(0); opacity: 0.4; }
          }

          @keyframes pulse-status-green {
            0%, 100% { box-shadow: 0 0 0 0 rgba(57, 255, 20, 0.5); }
            50% { box-shadow: 0 0 0 8px rgba(57, 255, 20, 0); }
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
            background: radial-gradient(circle, rgba(255, 107, 53, 0.1) 0%, transparent 70%);
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
          backgroundColor: 'rgba(10, 5, 10, 0.65)', // Transparence accrue
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          width: '100%',
          borderRadius: 4,
          border: '1px solid rgba(255, 107, 53, 0.4)',
          borderTop: '3px solid #ffaa00',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6), inset 0 0 20px rgba(255, 107, 53, 0.05)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          ...(animate && {
            animation: 'pulse-halloween 0.6s ease-in-out',
          }),
          '&:hover': {
            backgroundColor: 'rgba(26, 15, 26, 0.75)',
            borderColor: 'rgba(255, 140, 100, 0.6)',
            boxShadow: '0 12px 40px rgba(255, 107, 53, 0.3), 0 0 30px rgba(255, 107, 53, 0.2)',
            transform: 'translateY(-4px)',
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, transparent, #ffaa00, rgba(255, 255, 255, 0.3), #9d4edd, transparent)',
            animation: 'halloween-glow 3s infinite',
            zIndex: 2,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '15%',
            left: '-60%',
            width: '220%',
            height: '70%',
            background: 'radial-gradient(circle at 50% 40%, rgba(157, 78, 221, 0.08), transparent 80%)',
            pointerEvents: 'none',
            zIndex: 0,
            animation: 'halloween-drift-chart 25s linear infinite',
          },
        }}
      >
        <CardContent sx={{ position: 'relative', zIndex: 1, pt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography
              variant="overline"
              sx={{
                fontFamily: '"Creepster", "Dancing Script", cursive',
                color: '#ffaa00',
                textShadow: '0 0 10px rgba(0,0,0,0.95), 0 2px 4px rgba(0,0,0,0.9)',
                fontSize: '1.5rem',
                fontWeight: 700,
              }}
            >
               🎃 Volume des appels
            </Typography>
            <Chip
              label={wsConnected ? '🟢 En direct' : '🔴 Déconnecté'}
              size="small"
              sx={{
                fontSize: 12,
                background: wsConnected 
                  ? 'rgba(57, 255, 20, 0.2)'
                  : 'rgba(255, 0, 64, 0.2)',
                backdropFilter: 'blur(6px)',
                color: '#ffffff',
                fontWeight: 700,
                fontFamily: '"Montserrat", sans-serif',
                animation: wsConnected ? 'pulse-status-green 2s infinite' : 'none',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            />
          </Box>

          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={data}
              margin={{ top: 30, right: 20, left: 10, bottom: 20 }}
              barSize={100}
            >
              {/* Grille – Style Halloween très subtil */}
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(255, 107, 53, 0.15)" 
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
                  textShadow: '0 0 10px rgba(0,0,0,0.95), 0 2px 4px rgba(0,0,0,0.9)',
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
                  textShadow: '0 0 10px rgba(0,0,0,0.95), 0 2px 4px rgba(0,0,0,0.9)',
                }}
                tickFormatter={hideZeroLabels}
              />

              {/* Tooltip personnalisé */}
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 107, 53, 0.1)' }} />

              {/* Barre entrants – VIOLET Mystique */}
              <Bar
                dataKey="inbound"
                name="Appels entrants"
                fill={INBOUND_COLOR}
                fillOpacity={0.85}
                animationDuration={1200}
                style={{ animation: 'bar-rise-halloween 1s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }}
              >
                <LabelList
                  dataKey="inbound"
                  position="top"
                  fill="#ffffff"
                  fontWeight="bold"
                  fontSize={12}
                  formatter={hideZeroLabels}
                  style={{
                    textShadow: '0 0 10px rgba(0,0,0,0.95), 0 2px 4px rgba(0,0,0,0.9), 0 0 6px rgba(157, 78, 221, 0.6)',
                    fontFamily: '"Montserrat", sans-serif',
                    animation: 'halloween-glow 3s infinite alternate',
                  }}
                />
              </Bar>

              {/* Barre sortants – ORANGE Citrouille */}
              <Bar
                dataKey="outbound"
                name="Appels sortants"
                fill={OUTBOUND_COLOR}
                fillOpacity={0.85}
                animationDuration={1200}
                style={{ animation: 'bar-rise-halloween 1s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }}
              >
                <LabelList
                  dataKey="outbound"
                  position="top"
                  fill="#ffffff"
                  fontWeight="bold"
                  fontSize={12}
                  formatter={hideZeroLabels}
                  style={{
                    textShadow: '0 0 10px rgba(0,0,0,0.95), 0 2px 4px rgba(0,0,0,0.9), 0 0 6px rgba(255, 170, 0, 0.6)',
                    fontFamily: '"Montserrat", sans-serif',
                    animation: 'halloween-glow 3s infinite alternate',
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Légende – Style Halloween */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 6, pt: 3, pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box 
                sx={{ 
                  width: 16, 
                  height: 16, 
                  bgcolor: INBOUND_COLOR, 
                  borderRadius: '3px', 
                  boxShadow: `0 0 8px ${INBOUND_COLOR}`, 
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  opacity: 0.9,
                }} 
              />
              <Typography
                variant="body1"
                sx={{
                  fontFamily: '"Inter", sans-serif',
                  fontWeight: 600,
                  fontSize: 12,
                  color: '#ffffff',
                  textShadow: '0 0 10px rgba(0,0,0,0.95), 0 2px 4px rgba(0,0,0,0.9)',
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
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  opacity: 0.9,
                }} 
              />
              <Typography
                variant="body1"
                sx={{
                  fontFamily: '"Inter", sans-serif',
                  fontWeight: 600,
                  fontSize: 12,
                  color: '#ffffff',
                  textShadow: '0 0 10px rgba(0,0,0,0.95), 0 2px 4px rgba(0,0,0,0.9)',
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