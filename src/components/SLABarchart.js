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

// === 🦉 Couleurs thème Pluie & Hibou (MISES À JOUR) ===
const INBOUND_COLOR = '#27ae60';  // VERT au lieu d'ambre
const OUTBOUND_COLOR = '#ecf0f1'; // BLANC au lieu d'orangé

const formatNumber = (num) => (num >= 1000 ? (num / 1000).toFixed(1) + 'k' : num.toString());
const hideZeroLabels = (value) => (value === 0 ? '' : formatNumber(value));

// === 🦉 Tooltip personnalisé – Style sombre (couleurs mises à jour) ===
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          backgroundColor: 'rgba(10, 14, 23, 0.95)',
          border: '1px solid rgba(243, 156, 18, 0.3)',
          borderRadius: 2,
          p: 1.5,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <Typography 
          variant="caption" 
          sx={{ 
            color: '#f39c12', 
            fontWeight: 'bold', 
            display: 'block', 
            mb: 0.5,
            fontFamily: '"Montserrat", sans-serif',
          }}
        >
          {`Jour : ${label}`}
        </Typography>
        {payload.map((entry, index) => {
          const labels = { 
            inbound: ' Appels entrants', 
            outbound: '🌧️ Appels sortants'
          };
          const colors = {
            inbound: INBOUND_COLOR,   // VERT
            outbound: OUTBOUND_COLOR, // BLANC
          };
          return (
            <Typography 
              key={index} 
              variant="body2" 
              sx={{ 
                color: '#ecf0f1', 
                fontSize: 11,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
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
                }} 
              />
              {labels[entry.dataKey] || entry.name}: <strong>{formatNumber(entry.value)}</strong>
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

  // === 🦉 État vide – Ambiance nocturne ===
  if (data.length === 0) {
    return (
      <Card
        sx={{
          // Glassmorphism ULTRA-TRANSPARENT
          backgroundColor: 'rgba(10, 14, 23, 0.25)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          width: '100%',
          borderRadius: 3,
          border: '1px solid rgba(243, 156, 18, 0.2)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: 'rgba(243, 156, 18, 0.4)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 25px rgba(243, 156, 18, 0.1)',
          }
        }}
      >
        {/* Lueur ambiante hibou */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: '-50%',
          width: '200%',
          height: '100%',
          background: 'radial-gradient(circle at 40% 50%, rgba(243, 156, 18, 0.06), transparent 70%)',
          animation: 'owl-drift 22s linear infinite',
          pointerEvents: 'none',
          zIndex: 0,
        }} />
        <CardContent sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="overline"
            sx={{
              fontFamily: '"Montserrat", sans-serif',
              color: '#ecf0f1',
              textShadow: '0 0 12px rgba(243, 156, 18, 0.4)',
              fontSize: '1.3rem',
            }}
          >
            📊 Volume hebdomadaire des appels
          </Typography>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Chip
              label={wsConnected ? ' Aucun appel enregistré' : '🌧️ Connexion au flux...'}
              size="small"
              sx={{
                mb: 2,
                background: wsConnected
                  ? 'linear-gradient(135deg, #27ae60, #2ecc71)' // Dégradé vert
                  : 'linear-gradient(135deg, #34495e, #2c3e50)',
                color: wsConnected ? '#0a0e17' : '#ecf0f1',
                fontFamily: '"Montserrat", sans-serif',
                animation: wsConnected ? 'none' : 'pulse-owl 1.5s infinite alternate',
                border: '1px solid rgba(243, 156, 18, 0.3)',
                fontWeight: 600,
              }}
            />
            <Skeleton 
              variant="rectangular" 
              width="100%" 
              height={350} 
              sx={{ 
                backgroundColor: 'rgba(243, 156, 18, 0.08)',
                borderRadius: 2,
              }} 
            />
          </Box>
        </CardContent>
        <style>{`
          @keyframes pulse-owl {
            0% { transform: scale(1); box-shadow: 0 0 8px rgba(243, 156, 18, 0.3); }
            100% { transform: scale(1.04); box-shadow: 0 0 18px rgba(243, 156, 18, 0.5); }
          }
          @keyframes owl-drift {
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
          @keyframes pulse-owl {
            0% { transform: scale(1); box-shadow: 0 0 8px rgba(243, 156, 18, 0.3); }
            100% { transform: scale(1.04); box-shadow: 0 0 18px rgba(243, 156, 18, 0.5); }
          }

          @keyframes bar-rise-owl {
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

          @keyframes owl-glow {
            0%, 100% { text-shadow: 0 0 6px rgba(243, 156, 18, 0.3); }
            50% { text-shadow: 0 0 12px rgba(243, 156, 18, 0.5); }
          }

          @keyframes owl-drift-chart {
            0% { transform: translateX(0) translateY(0); opacity: 0.4; }
            50% { transform: translateX(-6%) translateY(-3%); opacity: 0.6; }
            100% { transform: translateX(0) translateY(0); opacity: 0.4; }
          }

          /* Effet goutte au survol */
          .droplet-hover-chart {
            position: relative;
            overflow: hidden;
          }
          .droplet-hover-chart::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
            opacity: 0;
            transform: scale(0.3);
            transition: all 0.4s ease;
            pointer-events: none;
            border-radius: 50%;
          }
          .droplet-hover-chart:hover::before {
            opacity: 1;
            transform: scale(1);
            animation: droplet-ripple 0.6s ease-out;
          }
          @keyframes droplet-ripple {
            0% { transform: scale(0.3); opacity: 0.8; }
            100% { transform: scale(1.5); opacity: 0; }
          }
        `}
      </style>

      <Card
        className="droplet-hover-chart"
        sx={{
          backgroundColor: 'rgba(10, 14, 23, 0.25)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          width: '100%',
          borderRadius: 3,
          border: '1px solid rgba(243, 156, 18, 0.2)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          ...(animate && {
            animation: 'pulse-owl 0.6s ease-in-out',
          }),
          '&:hover': {
            borderColor: 'rgba(243, 156, 18, 0.4)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 25px rgba(243, 156, 18, 0.1)',
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #27ae60, rgba(243, 156, 18, 0.5), #ecf0f1, transparent)', // Gradient mis à jour
            animation: 'owl-glow 3s infinite',
            zIndex: 2,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '15%',
            left: '-60%',
            width: '220%',
            height: '70%',
            background: 'radial-gradient(circle at 50% 40%, rgba(212, 160, 23, 0.06), transparent 80%)',
            pointerEvents: 'none',
            zIndex: 0,
            animation: 'owl-drift-chart 25s linear infinite',
          },
        }}
      >
        <CardContent sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0 }}>
            <Typography
              variant="overline"
              sx={{
                fontFamily: '"Montserrat", sans-serif',
                color: '#ecf0f1',
                textShadow: '0 0 12px rgba(243, 156, 18, 0.4)',
                fontSize: '1.3rem',
              }}
            >
              📊 Volume des appels
            </Typography>
            <Chip
              label="🟢 En direct"
              size="small"
              sx={{
                background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
                color: '#0a0e17',
                fontWeight: 'bold',
                fontFamily: '"Montserrat", sans-serif',
                animation: 'pulse-status 2s infinite',
                border: '1px solid rgba(243, 156, 18, 0.3)',
              }}
            />
          </Box>

          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={data}
              margin={{ top: 30, right: 20, left: 10, bottom: 20 }}
              barSize={100}
            >
              {/* Grille – Style sombre */}
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(243, 156, 18, 0.15)" 
                opacity={0.2} 
              />

              {/* Axe X – Texte gris clair */}
              <XAxis
                dataKey="dayLabel"
                stroke="#bdc3c7"
                tick={{
                  fill: '#bdc3c7',
                  fontSize: 11,
                  fontWeight: 500,
                  fontFamily: '"Montserrat", sans-serif',
                  textShadow: '0 0 4px rgba(0,0,0,0.5)',
                }}
              />

              {/* Axe Y – Texte gris clair */}
              <YAxis
                stroke="#bdc3c7"
                tick={{
                  fill: '#bdc3c7',
                  fontSize: 11,
                  fontWeight: 500,
                  fontFamily: '"Montserrat", sans-serif',
                }}
                tickFormatter={hideZeroLabels}
              />

              {/* Tooltip personnalisé sombre */}
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(243, 156, 18, 0.08)' }} />

              {/* Barre entrants – VERT (mis à jour) */}
              <Bar
                dataKey="inbound"
                name="Appels entrants"
                fill={INBOUND_COLOR}
                fillOpacity={0.85}
                animationDuration={1200}
                style={{ animation: 'bar-rise-owl 1s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }}
              >
                <LabelList
                  dataKey="inbound"
                  position="top"
                  fill="#ecf0f1"
                  fontWeight="bold"
                  fontSize={11}
                  formatter={hideZeroLabels}
                  style={{
                    textShadow: '0 0 6px rgba(39, 174, 96, 0.4)', // Ombre verte
                    fontFamily: '"Montserrat", sans-serif',
                    animation: 'owl-glow 3s infinite alternate',
                  }}
                />
              </Bar>

              {/* Barre sortants – BLANC (mis à jour) */}
              <Bar
                dataKey="outbound"
                name="Appels sortants"
                fill={OUTBOUND_COLOR}
                fillOpacity={0.85}
                animationDuration={1200}
                style={{ animation: 'bar-rise-owl 1s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }}
              >
                <LabelList
                  dataKey="outbound"
                  position="top"
                  fill="#0a0e17" // Texte sombre pour contraste sur fond blanc
                  fontWeight="bold"
                  fontSize={11}
                  formatter={hideZeroLabels}
                  style={{
                    textShadow: '0 0 6px rgba(236, 240, 241, 0.4)', // Ombre blanche
                    fontFamily: '"Montserrat", sans-serif',
                    animation: 'owl-glow 3s infinite alternate',
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Légende – Style sombre (couleurs mises à jour) */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 6, pt: 2, pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box 
                sx={{ 
                  width: 16, 
                  height: 16, 
                  bgcolor: INBOUND_COLOR, 
                  borderRadius: '2px', 
                  boxShadow: `0 0 6px ${INBOUND_COLOR}`, 
                  border: '1px solid rgba(243, 156, 18, 0.3)',
                  opacity: 0.9,
                }} 
              />
              <Typography
                variant="body1"
                sx={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontWeight: 'bold',
                  fontSize: 11,
                  color: '#ecf0f1',
                  textShadow: '0 0 4px rgba(0,0,0,0.5)',
                }}
              >
                🦉 Appels entrants
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box 
                sx={{ 
                  width: 16, 
                  height: 16, 
                  bgcolor: OUTBOUND_COLOR, 
                  borderRadius: '2px', 
                  boxShadow: `0 0 6px ${OUTBOUND_COLOR}`, 
                  border: '1px solid rgba(243, 156, 18, 0.3)',
                  opacity: 0.9,
                }} 
              />
              <Typography
                variant="body1"
                sx={{
                  fontFamily: '"Montserrat", sans-serif',
                  fontWeight: 'bold',
                  fontSize: 11,
                  color: '#ecf0f1',
                  textShadow: '0 0 4px rgba(0,0,0,0.5)',
                }}
              >
                ️ Appels sortants
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </>
  );
}

export default SLABarchart;