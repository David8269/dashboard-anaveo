import React, { useMemo } from 'react';
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
  ResponsiveContainer,
  Tooltip,
  ReferenceArea,
  ReferenceLine,
} from 'recharts';

const lunchStartIndex = 8;
const lunchEndIndex = 11;

// === 🍺 Style "Verre à bière ULTRA-TRANSPARENT" (20% d'opacité, blur 4px) ===
const ultraFrostedGlassSx = {
  backgroundColor: 'rgba(10, 5, 0, 0.20)', // TRANSPARENCE EXTRÊME (20%)
  backdropFilter: 'blur(4px)', // Flou minimal pour voir l'image de fond
  WebkitBackdropFilter: 'blur(4px)',
  borderRadius: 4,
  border: '1px solid rgba(255, 170, 0, 0.25)', // Bordure très subtile
  borderTop: '2px solid rgba(255, 248, 231, 0.5)', // Mousse fine mais visible
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), inset 0 0 15px rgba(255, 255, 255, 0.05)',
  // Texture de condensation/givre (discrète)
  backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08) 1px, transparent 1px), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.08) 1px, transparent 1px)',
  backgroundSize: '15px 15px',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    backgroundColor: 'rgba(10, 5, 0, 0.30)', // Légèrement plus opaque au survol
    borderColor: 'rgba(255, 248, 231, 0.5)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 170, 0, 0.15)',
    transform: 'translateY(-2px)',
  }
};

// === 🦉 Label personnalisé – CENTRÉ entre les deux lignes ===
function CustomLabel({ dataLength }) {
  // Calcul du centre exact entre lunchStartIndex (8) et lunchEndIndex (11)
  const centerIndex = (lunchStartIndex + lunchEndIndex) / 2; // = 9.5
  const xPosition = dataLength > 0 ? (centerIndex / (dataLength - 1)) * 100 : 50;
  
  return (
    <text 
      x={`${xPosition}%`} 
      y={25} 
      fill="#fff8e7"
      fontSize={13} 
      textAnchor="middle" 
      fontWeight="bold" 
      fontFamily='"Rye", serif'
      style={{ 
        textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 0 12px rgba(0,0,0,0.8), 0 0 15px rgba(255, 170, 0, 0.6)',
        letterSpacing: '1px'
      }}
    >
      🥨 Lunch Break 🥨
    </text>
  );
}

// === 🍺 Légende – Thème Oktoberfest ===
function LegendComponent() {
  const itemStyle = { 
    display: 'flex', 
    alignItems: 'center', 
    gap: 6, 
    fontWeight: 600, 
    fontSize: 12,
    color: '#fff8e7',
    textShadow: '0 2px 6px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.8)',
    fontFamily: '"Inter", sans-serif',
  };
  const squareStyle = (color) => ({ 
    width: 14,
    height: 14, 
    backgroundColor: color, 
    borderRadius: 3,
    boxShadow: `0 0 8px ${color}`,
    border: '1px solid rgba(255, 248, 231, 0.5)',
  });
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, py: 1, mt: 1 }}>
      <div style={itemStyle}>
        <span style={squareStyle('#4ade80')}></span> Inbound
      </div>
      <div style={itemStyle}>
        <span style={squareStyle('#fbbf24')}></span> Outbound
      </div>
      <div style={itemStyle}>
        <span style={squareStyle('#f87171')}></span> Absys
      </div>
    </Box>
  );
}

// === 🦉🍺 Label des barres – Animation critique ===
const renderCustomLabel = ({ x, y, width, value, dataKey }) => {
  if (!value || value <= 0) return null;
  const isAbsysCritical = dataKey === 'ABSYS' && value > 5;
  const labelColor = isAbsysCritical ? '#f87171' : '#fff8e7';

  return (
    <text
      x={x + width / 2}
      y={y - 6}
      fill={labelColor}
      textAnchor="middle"
      fontSize={11}
      fontWeight="bold"
      fontFamily='"Montserrat", sans-serif'
      style={{
        animation: isAbsysCritical ? 'pulse-critical-amber 2s infinite alternate' : 'none',
        filter: isAbsysCritical ? 'drop-shadow(0 0 6px rgba(248, 113, 113, 0.8))' : 'none',
        textShadow: '0 2px 6px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.8)', // Ombre renforcée
      }}
    >
      {value}
    </text>
  );
};

// === 🦉 Tooltip personnalisé – Style Maßkrug (Ultra-Transparent) ===
const CustomTooltip = ({ active, payload, label, halfHourSlots }) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          backgroundColor: 'rgba(10, 5, 0, 0.40)', // 40% pour garder un minimum de lisibilité
          border: '1px solid rgba(255, 170, 0, 0.3)',
          borderTop: '2px solid rgba(255, 248, 231, 0.6)',
          borderRadius: 2,
          p: 1.5,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(6px)',
        }}
      >
        <Typography 
          variant="caption" 
          sx={{ 
            color: '#ffaa00', 
            fontWeight: 700, 
            display: 'block', 
            mb: 1,
            fontFamily: '"Rye", serif',
            fontSize: '0.9rem',
            letterSpacing: '0.5px',
            textShadow: '0 2px 4px rgba(0,0,0,0.8)',
          }}
        >
           {halfHourSlots[label] || label}
        </Typography>
        {payload.map((entry, index) => {
          const labels = { 
            CDS_IN: 'Appels entrants', 
            CDS_OUT: 'Appels sortants', 
            ABSYS: 'Appels perdus' 
          };
          const colors = {
            CDS_IN: '#4ade80',
            CDS_OUT: '#fbbf24',
            ABSYS: '#f87171',
          };
          const icons = {
            CDS_IN: '📞',
            CDS_OUT: '📤',
            ABSYS: '❌',
          };
          return (
            <Typography 
              key={index} 
              variant="body2" 
              sx={{ 
                color: '#fff8e7', 
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
              {icons[entry.dataKey]} {labels[entry.dataKey] || entry.name}: <strong style={{ color: '#ffaa00' }}>{entry.value}</strong>
            </Typography>
          );
        })}
      </Box>
    );
  }
  return null;
};

function CallVolumeChart({ callVolumes = [], wsConnected = false, halfHourSlots = [] }) {
  const data = useMemo(() => 
    callVolumes.map((item, index) => ({ ...item, index })), 
    [callVolumes]
  );

  // === 🦉🍺 État vide – Ambiance Brasserie Ultra-Transparente ===
  if (callVolumes.length === 0) {
    return (
      <Card sx={ultraFrostedGlassSx}>
        <CardContent sx={{ p: 2, position: 'relative', zIndex: 1 }}>
          <Typography
            variant="overline"
            sx={{
              fontFamily: '"Rye", serif',
              color: '#fff8e7',
              textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 0 15px rgba(255, 170, 0, 0.6)',
              fontSize: '1.3rem',
              fontWeight: 400,
              mb: 2,
              display: 'block',
            }}
          >
            🍺 Call volume
          </Typography>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Chip
              label={wsConnected ? '🍺 Aucun appel enregistré' : '⚠️ Connexion au flux...'}
              size="small"
              sx={{
                mb: 2,
                background: 'rgba(255, 170, 0, 0.2)',
                backdropFilter: 'blur(6px)',
                color: '#fff8e7',
                fontFamily: '"Montserrat", sans-serif',
                fontWeight: 700,
                animation: wsConnected ? 'none' : 'pulse-amber 2s infinite alternate',
                border: '1px solid rgba(255, 248, 231, 0.5)',
              }}
            />
            <Skeleton 
              variant="rectangular" 
              width="100%" 
              height={350} 
              sx={{ 
                backgroundColor: 'rgba(255, 170, 0, 0.08)',
                borderRadius: 2,
              }} 
            />
          </Box>
        </CardContent>
      </Card>
    );
  }

  const maxY = data.reduce((max, d) => {
    const currentMax = Math.max(d.CDS_IN || 0, d.CDS_OUT || 0, d.ABSYS || 0);
    return currentMax > max ? currentMax : max;
  }, 0);

  const yMax = Math.max(1, isNaN(maxY) ? 1 : maxY);
  const domainMax = Math.ceil(yMax * 1.3);
  const tickCount = Math.min(6, domainMax + 1);

  return (
    <Card sx={ultraFrostedGlassSx}>
      {/* Lueurs ambiantes ambrées (très atténuées pour ne pas masquer le fond) */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: '-60%',
        width: '220%',
        height: '100%',
        background: 'radial-gradient(circle at 30% 40%, rgba(255, 170, 0, 0.06), transparent 80%)',
        animation: 'amber-drift 20s linear infinite',
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: '10%',
        right: '-70%',
        width: '240%',
        height: '60%',
        background: 'radial-gradient(circle at 70% 30%, rgba(255, 221, 136, 0.04), transparent 85%)',
        animation: 'amber-drift-reverse 28s linear infinite',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <CardContent sx={{ p: 2, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography
            variant="overline"
            sx={{
              fontFamily: '"Rye", serif',
              color: '#fff8e7',
              textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 0 15px rgba(255, 170, 0, 0.6)',
              fontSize: '1.3rem',
              fontWeight: 400,
            }}
          >
            🍺 Call volume
          </Typography>
          <Chip
            label={wsConnected ? '🟢 Online' : '🔴 Offline'}
            size="small"
            sx={{
              fontSize: 12,
              background: wsConnected 
                ? 'rgba(74, 222, 128, 0.2)'
                : 'rgba(248, 113, 113, 0.2)',
              backdropFilter: 'blur(6px)',
              color: '#fff8e7',
              fontWeight: 700,
              fontFamily: '"Montserrat", sans-serif',
              animation: wsConnected ? 'pulse-status-green 2s infinite' : 'none',
              border: '1px solid rgba(255, 248, 231, 0.5)',
            }}
          />
        </Box>

        {/* 📊 HAUTEUR AGRANDIE : 400px (au lieu de 260px) */}
        <Box sx={{ width: '100%', height: 260, mt: 1 }} aria-label="Graphique des volumes d'appels">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
              barSize={20}
              stackOffset="none"
            >
              {/* Grille – Style ambré très subtil */}
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(255, 170, 0, 0.1)" 
                opacity={0.4} 
              />

              {/* Axe X – Texte avec ombre portée forte */}
              <XAxis
                dataKey="index"
                stroke="#fff8e7"
                tick={{
                  fill: '#fff8e7',
                  fontSize: 11,
                  fontWeight: 600,
                  textShadow: '0 2px 6px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.8)',
                  fontFamily: '"Inter", sans-serif',
                }}
                tickFormatter={(index) => {
                  const time = halfHourSlots[index] || '';
                  if (time.endsWith(':30')) return time.replace(':30', 'h30');
                  if (time.endsWith(':00')) return time.replace(':00', 'h');
                  return time;
                }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={70}
                tickMargin={12}
              />

              {/* Axe Y – Texte avec ombre portée forte */}
              <YAxis
                stroke="#fff8e7"
                tick={{
                  fill: '#fff8e7',
                  fontSize: 11,
                  fontWeight: 600,
                  fontFamily: '"Inter", sans-serif',
                  textShadow: '0 2px 6px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.8)',
                }}
                domain={[0, domainMax]}
                tickCount={tickCount}
                allowDecimals={false}
              />

              {/* Tooltip personnalisé */}
              <Tooltip
                content={<CustomTooltip halfHourSlots={halfHourSlots} />}
                cursor={{ fill: 'rgba(255, 170, 0, 0.08)' }}
              />

              {/* Zone pause déjeuner – Style ambré */}
              <ReferenceArea
                x1={lunchStartIndex}
                x2={lunchEndIndex}
                y1={0}
                y2="dataMax"
                fill="#ffaa00"
                fillOpacity={0.08}
                stroke="rgba(255, 170, 0, 0.3)"
                strokeOpacity={0.5}
                strokeDasharray="4 4"
              />
              <ReferenceLine x={lunchStartIndex} stroke="#ffaa00" strokeWidth={2} strokeDasharray="6 4" opacity={0.5} />
              <ReferenceLine x={lunchEndIndex} stroke="#ffaa00" strokeWidth={2} strokeDasharray="6 4" opacity={0.5} />
              <CustomLabel dataLength={data.length} />

              {/* Barres – Couleurs Oktoberfest */}
              <Bar 
                dataKey="CDS_IN" 
                name="Appels entrants" 
                fill="#4ade80"
                fillOpacity={0.85}
                label={renderCustomLabel} 
                radius={[4, 4, 0, 0]} 
                style={{ animation: 'bar-rise-amber 1.2s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }} 
              />
              <Bar 
                dataKey="CDS_OUT" 
                name="Appels sortants" 
                fill="#fbbf24"
                fillOpacity={0.85}
                label={renderCustomLabel} 
                radius={[4, 4, 0, 0]} 
                style={{ animation: 'bar-rise-amber 1.2s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }} 
              />
              <Bar 
                dataKey="ABSYS" 
                name="Appels perdus" 
                fill="#f87171"
                fillOpacity={0.9}
                label={renderCustomLabel} 
                radius={[4, 4, 0, 0]} 
                style={{ animation: 'bar-rise-amber 1.2s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }} 
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        <LegendComponent />
      </CardContent>

      <style>
        {`
          @keyframes bar-rise-amber {
            0% { 
              transform: scaleY(0); 
              opacity: 0; 
              transform-origin: bottom;
            }
            100% { 
              transform: scaleY(1); 
              opacity: 1; 
            }
          }

          @keyframes pulse-amber {
            0% { 
              transform: scale(1); 
              box-shadow: 0 0 10px rgba(255, 170, 0, 0.3); 
            }
            100% { 
              transform: scale(1.05); 
              box-shadow: 0 0 20px rgba(255, 170, 0, 0.5); 
            }
          }

          @keyframes pulse-status-green {
            0%, 100% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.5); }
            50% { box-shadow: 0 0 0 8px rgba(74, 222, 128, 0); }
          }

          @keyframes amber-drift {
            0% { transform: translateX(0) translateY(0); }
            50% { transform: translateX(-10%) translateY(-5%); }
            100% { transform: translateX(0) translateY(0); }
          }

          @keyframes amber-drift-reverse {
            0% { transform: translateX(0) translateY(0); }
            50% { transform: translateX(12%) translateY(3%); }
            100% { transform: translateX(0) translateY(0); }
          }

          @keyframes pulse-critical-amber {
            0% { transform: scale(1); box-shadow: 0 0 8px rgba(248, 113, 113, 0.6); }
            100% { transform: scale(1.04); box-shadow: 0 0 16px rgba(248, 113, 113, 0.9); }
          }
        `}
      </style>
    </Card>
  );
}

export default CallVolumeChart;