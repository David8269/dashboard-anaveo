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

// === 🎃 Style "Citrouille de Verre" (TRANSPARENCE MAXIMALE) ===
const ultraFrostedGlassSx = {
  backgroundColor: 'rgba(10, 5, 10, 0.35)', // ✅ Transparence accrue (était 0.60)
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  borderRadius: 4,
  boxShadow: '0 0 0 1px rgba(255, 107, 53, 0.4), 0 8px 32px rgba(0, 0, 0, 0.6), inset 0 0 20px rgba(255, 107, 53, 0.05)',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, transparent, #ffaa00, transparent)',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    zIndex: 1,
  },
  '&:hover': {
    backgroundColor: 'rgba(26, 15, 26, 0.45)', // ✅ Transparence accrue au hover (était 0.70)
    boxShadow: '0 0 0 1px rgba(255, 140, 100, 0.6), 0 12px 40px rgba(255, 107, 53, 0.3), 0 0 30px rgba(255, 107, 53, 0.2)',
    transform: 'translateY(-4px)',
  }
};

// === 🎃 Label personnalisé Pause Déjeuner – CENTRÉ ===
function CustomLabel({ dataLength }) {
  const centerIndex = (lunchStartIndex + lunchEndIndex) / 2; // = 9.5
  const xPosition = dataLength > 0 ? (centerIndex / (dataLength - 2)) * 100 : 50;
  
  return (
    <text 
      x={`${xPosition}%`} 
      y={25} 
      fill="#ffaa00"
      fontSize={20} 
      textAnchor="middle" 
      dominantBaseline="middle"
      fontWeight="bold" 
      fontFamily='"Creepster", "Dancing Script", cursive'
      style={{ 
        textShadow: '0 0 10px rgba(0,0,0,0.95), 0 2px 4px rgba(0,0,0,0.9)',
        letterSpacing: '6px'
      }}
    >
      🎃 Lunch Break 🎃
    </text>
  );
}

// === 🎃 Légende – Thème Halloween ===
function LegendComponent() {
  const itemStyle = { 
    display: 'flex', 
    alignItems: 'center', 
    gap: 6, 
    fontWeight: 600, 
    fontSize: 12,
    color: '#ffffff',
    textShadow: '0 0 10px rgba(0,0,0,0.95), 0 2px 4px rgba(0,0,0,0.9)',
    fontFamily: '"Inter", sans-serif',
  };
  const squareStyle = (color) => ({ 
    width: 15,
    height: 15, 
    backgroundColor: color, 
    borderRadius: 3,
    boxShadow: `0 0 8px ${color}`,
    border: '1px solid rgba(255, 255, 255, 0.3)',
  });
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, py: 1, mt: 1 }}>
      <div style={itemStyle}>
        <span style={squareStyle('#9d4edd')}></span> Inbound
      </div>
      <div style={itemStyle}>
        <span style={squareStyle('#ffaa00')}></span> Outbound
      </div>
      <div style={itemStyle}>
        <span style={squareStyle('#ff4500')}></span> Absys
      </div>
    </Box>
  );
}

// === 🎃 Label des barres – Animation critique ===
const renderCustomLabel = ({ x, y, width, value, dataKey }) => {
  if (!value || value <= 0) return null;
  const isAbsysCritical = dataKey === 'ABSYS' && value > 5;
  const labelColor = isAbsysCritical ? '#ff4500' : '#ffffff';

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
        animation: isAbsysCritical ? 'pulse-critical-halloween 1.5s infinite alternate' : 'none',
        filter: isAbsysCritical ? 'drop-shadow(0 0 6px rgba(255, 69, 0, 0.8))' : 'none',
        textShadow: '0 0 10px rgba(0,0,0,0.95), 0 2px 4px rgba(0,0,0,0.9)',
      }}
    >
      {value}
    </text>
  );
};

// === 🎃 Tooltip personnalisé – Style "Citrouille de Verre" ===
const CustomTooltip = ({ active, payload, label, halfHourSlots }) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          backgroundColor: 'rgba(10, 5, 10, 0.90)',
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
           🕰️ {halfHourSlots[label] || label}
        </Typography>
        {payload.map((entry, index) => {
          const labels = { 
            CDS_IN: 'Appels entrants', 
            CDS_OUT: 'Appels sortants', 
            ABSYS: 'Appels perdus' 
          };
          const colors = {
            CDS_IN: '#9d4edd',
            CDS_OUT: '#ffaa00',
            ABSYS: '#ff4500',
          };
          const icons = {
            CDS_IN: '📥',
            CDS_OUT: '📤',
            ABSYS: '🚫',
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
              {icons[entry.dataKey]} {labels[entry.dataKey] || entry.name}: <strong style={{ color: colors[entry.dataKey] }}>{entry.value}</strong>
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

  // === 🎃 État vide – Ambiance Halloween ===
  if (callVolumes.length === 0) {
    return (
      <Card sx={{ ...ultraFrostedGlassSx, border: 'none', outline: 'none' }}>
        <CardContent sx={{ p: 2, position: 'relative', zIndex: 1 }}>
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
            🎃 Volume d'appels
          </Typography>
          <Box sx={{ textAlign: 'center', py: 2 }}>
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

  const maxY = data.reduce((max, d) => {
    const currentMax = Math.max(d.CDS_IN || 0, d.CDS_OUT || 0, d.ABSYS || 0);
    return currentMax > max ? currentMax : max;
  }, 0);

  const yMax = Math.max(1, isNaN(maxY) ? 1 : maxY);
  const domainMax = Math.ceil(yMax * 1.3);
  const tickCount = Math.min(6, domainMax + 1);

  return (
    <Card sx={{ ...ultraFrostedGlassSx, border: 'none', outline: 'none' }}>
      {/* Lueurs ambiantes Halloween (Effet Bokeh subtil en arrière-plan du graphique) */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: '-60%',
        width: '220%',
        height: '100%',
        background: 'radial-gradient(circle at 30% 40%, rgba(255, 107, 53, 0.08), transparent 80%)',
        animation: 'halloween-drift 20s linear infinite',
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: '10%',
        right: '-70%',
        width: '240%',
        height: '60%',
        background: 'radial-gradient(circle at 70% 30%, rgba(157, 78, 221, 0.08), transparent 85%)',
        animation: 'halloween-drift-reverse 28s linear infinite',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <CardContent sx={{ p: 2, position: 'relative', zIndex: 1 }}>
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
            🎃 Call Volume
          </Typography>
          <Chip
            label={wsConnected ? '🟢 Online' : '🔴 Offline'}
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

        <Box sx={{ width: '100%', height: 340, mt: 1 }} aria-label="Graphique des volumes d'appels">
          <ResponsiveContainer width="100%" height="110%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
              barSize={20}
              stackOffset="none"
            >
              {/* Grille – Style Halloween très subtil */}
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(255, 107, 53, 0.15)" 
                opacity={0.4} 
              />

              {/* Axe X */}
              <XAxis
                dataKey="index"
                stroke="#ffffff"
                tick={{
                  fill: '#ffffff',
                  fontSize: 11,
                  fontWeight: 600,
                  textShadow: '0 0 10px rgba(0,0,0,0.95), 0 2px 4px rgba(0,0,0,0.9)',
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

              {/* Axe Y */}
              <YAxis
                stroke="#ffffff"
                tick={{
                  fill: '#ffffff',
                  fontSize: 11,
                  fontWeight: 600,
                  fontFamily: '"Inter", sans-serif',
                  textShadow: '0 0 10px rgba(0,0,0,0.95), 0 2px 4px rgba(0,0,0,0.9)',
                }}
                domain={[0, domainMax]}
                tickCount={tickCount}
                allowDecimals={false}
              />

              {/* Tooltip personnalisé */}
              <Tooltip
                content={<CustomTooltip halfHourSlots={halfHourSlots} />}
                cursor={{ fill: 'rgba(255, 107, 53, 0.1)' }}
              />

              {/* Zone pause déjeuner – Style Orange Halloween */}
              <ReferenceArea
                x1={lunchStartIndex}
                x2={lunchEndIndex}
                y1={0}
                y2="dataMax"
                fill="#ffaa00"
                fillOpacity={0.1}
                stroke="rgba(255, 170, 0, 0.4)"
                strokeOpacity={0.5}
                strokeDasharray="4 4"
              />
              <ReferenceLine x={lunchStartIndex} stroke="#ffaa00" strokeWidth={2} strokeDasharray="6 4" opacity={0.5} />
              <ReferenceLine x={lunchEndIndex} stroke="#ffaa00" strokeWidth={2} strokeDasharray="6 4" opacity={0.5} />
              <CustomLabel dataLength={data.length} />

              {/* Barres – Couleurs harmonisées Halloween */}
              <Bar 
                dataKey="CDS_IN" 
                name="Appels entrants" 
                fill="#9d4edd"
                fillOpacity={0.85}
                label={renderCustomLabel} 
                radius={[4, 4, 0, 0]} 
                style={{ animation: 'bar-rise-halloween 1.2s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }} 
              />
              <Bar 
                dataKey="CDS_OUT" 
                name="Appels sortants" 
                fill="#ffaa00"
                fillOpacity={0.85}
                label={renderCustomLabel} 
                radius={[4, 4, 0, 0]} 
                style={{ animation: 'bar-rise-halloween 1.2s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }} 
              />
              <Bar 
                dataKey="ABSYS" 
                name="Appels perdus" 
                fill="#ff4500"
                fillOpacity={0.9}
                label={renderCustomLabel} 
                radius={[4, 4, 0, 0]} 
                style={{ animation: 'bar-rise-halloween 1.2s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }} 
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        <LegendComponent />
      </CardContent>

      <style>
        {`
          @keyframes bar-rise-halloween {
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

          @keyframes pulse-halloween {
            0% { 
              transform: scale(1); 
              box-shadow: 0 0 10px rgba(255, 107, 53, 0.3); 
            }
            100% { 
              transform: scale(1.05); 
              box-shadow: 0 0 20px rgba(157, 78, 221, 0.5); 
            }
          }

          @keyframes pulse-status-green {
            0%, 100% { box-shadow: 0 0 0 0 rgba(57, 255, 20, 0.5); }
            50% { box-shadow: 0 0 0 8px rgba(57, 255, 20, 0); }
          }

          @keyframes halloween-drift {
            0% { transform: translateX(0) translateY(0); }
            50% { transform: translateX(-10%) translateY(-5%); }
            100% { transform: translateX(0) translateY(0); }
          }

          @keyframes halloween-drift-reverse {
            0% { transform: translateX(0) translateY(0); }
            50% { transform: translateX(12%) translateY(3%); }
            100% { transform: translateX(0) translateY(0); }
          }

          @keyframes pulse-critical-halloween {
            0% { transform: scale(1); box-shadow: 0 0 8px rgba(255, 69, 0, 0.6); opacity: 1; }
            100% { transform: scale(1.05); box-shadow: 0 0 16px rgba(255, 0, 0, 0.9); opacity: 0.8; }
          }
        `}
      </style>
    </Card>
  );
}

export default CallVolumeChart;