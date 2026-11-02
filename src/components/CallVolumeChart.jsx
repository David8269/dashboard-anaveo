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

// === 🦉 Style "Tech Glass" INNOVEO (TRANSPARENCE MAXIMALE) ===
const ultraFrostedGlassSx = {
  backgroundColor: 'rgba(0, 15, 25, 0.15)', // ✅ Transparence accrue
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  borderRadius: 4,
  border: '1px solid rgba(0, 212, 255, 0.35)',
  borderTop: '2px solid #FFD700',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 0 20px rgba(0, 212, 255, 0.05)',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    backgroundColor: 'rgba(0, 20, 30, 0.20)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4), 0 0 30px rgba(0, 212, 255, 0.15)',
    transform: 'translateY(-4px)',
    borderColor: 'rgba(0, 212, 255, 0.6)',
  }
};

// === 🦉 Label personnalisé Pause Déjeuner – CENTRÉ ===
function CustomLabel({ dataLength }) {
  const centerIndex = (lunchStartIndex + lunchEndIndex) / 2; // = 9.5
  const xPosition = dataLength > 0 ? (centerIndex / (dataLength - 2)) * 100 : 50;
  
  return (
    <text 
      x={`${xPosition}%`} 
      y={25} 
      fill="#FFD700"
      fontSize={14} 
      textAnchor="middle" 
      dominantBaseline="middle"
      fontWeight="bold" 
      fontFamily='"Rajdhani", sans-serif'
      style={{ 
        textShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
        letterSpacing: '2px',
        textTransform: 'uppercase'
      }}
    >
      ⏸️ PAUSE DEJ' ⏸️
    </text>
  );
}

// === 🦉 Légende – Thème INNOVEO ===
function LegendComponent() {
  const itemStyle = { 
    display: 'flex', 
    alignItems: 'center', 
    gap: 6, 
    fontWeight: 600, 
    fontSize: 12,
    color: '#ffffff',
    fontFamily: '"Rajdhani", sans-serif',
    letterSpacing: '0.5px',
  };
  const squareStyle = (color) => ({ 
    width: 12,
    height: 12, 
    backgroundColor: color, 
    borderRadius: 2,
    boxShadow: `0 0 8px ${color}`,
    border: '1px solid rgba(255, 255, 255, 0.2)',
  });
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, py: 1, mt: 1 }}>
      <div style={itemStyle}>
        <span style={squareStyle('#00D4FF')}></span> Inbound
      </div>
      <div style={itemStyle}>
        <span style={squareStyle('#FFD700')}></span> Outbound
      </div>
      <div style={itemStyle}>
        <span style={squareStyle('#ff4500')}></span> Absys
      </div>
    </Box>
  );
}

// === 🦉 Label des barres – Animation critique ===
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
      fontFamily='"Orbitron", sans-serif'
      style={{
        animation: isAbsysCritical ? 'pulse-critical-tech 1.5s infinite alternate' : 'none',
        filter: isAbsysCritical ? 'drop-shadow(0 0 6px rgba(255, 69, 0, 0.8))' : 'none',
      }}
    >
      {value}
    </text>
  );
};

// === 🦉 Tooltip personnalisé – Style "Tech Glass" ===
const CustomTooltip = ({ active, payload, label, halfHourSlots }) => {
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
           🕰️ {halfHourSlots[label] || label}
        </Typography>
        {payload.map((entry, index) => {
          const labels = { 
            CDS_IN: 'Appels entrants', 
            CDS_OUT: 'Appels sortants', 
            ABSYS: 'Appels perdus' 
          };
          const colors = {
            CDS_IN: '#00D4FF',
            CDS_OUT: '#FFD700',
            ABSYS: '#ff4500',
          };
          const icons = {
            CDS_IN: '📥',
            CDS_OUT: '📤',
            ABSYS: '⚠️',
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
              {icons[entry.dataKey]} {labels[entry.dataKey] || entry.name}: <strong style={{ color: colors[entry.dataKey], fontFamily: '"Orbitron", sans-serif' }}>{entry.value}</strong>
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

  // === 🦉 État vide – Ambiance Tech ===
  if (callVolumes.length === 0) {
    return (
      <Card sx={{ ...ultraFrostedGlassSx }}>
        <CardContent sx={{ p: 2, position: 'relative', zIndex: 1 }}>
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
            📊 Volume d'appels
          </Typography>
          <Box sx={{ textAlign: 'center', py: 2 }}>
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

  const maxY = data.reduce((max, d) => {
    const currentMax = Math.max(d.CDS_IN || 0, d.CDS_OUT || 0, d.ABSYS || 0);
    return currentMax > max ? currentMax : max;
  }, 0);

  const yMax = Math.max(1, isNaN(maxY) ? 1 : maxY);
  const domainMax = Math.ceil(yMax * 1.3);
  const tickCount = Math.min(6, domainMax + 1);

  return (
    <Card sx={{ ...ultraFrostedGlassSx }}>
      {/* Lueurs ambiantes Tech (Effet Bokeh subtil en arrière-plan du graphique) */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: '-60%',
        width: '220%',
        height: '100%',
        background: 'radial-gradient(circle at 30% 40%, rgba(0, 212, 255, 0.06), transparent 80%)',
        animation: 'tech-drift 20s linear infinite',
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: '10%',
        right: '-70%',
        width: '240%',
        height: '60%',
        background: 'radial-gradient(circle at 70% 30%, rgba(255, 215, 0, 0.06), transparent 85%)',
        animation: 'tech-drift-reverse 28s linear infinite',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <CardContent sx={{ p: 2, position: 'relative', zIndex: 1 }}>
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
            📊 Call Volume
          </Typography>
          <Chip
            label={wsConnected ? '⚡ Online' : '🔴 Offline'}
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

        <Box sx={{ width: '100%', height: 340, mt: 1 }} aria-label="Graphique des volumes d'appels">
          <ResponsiveContainer width="100%" height="110%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
              barSize={20}
              stackOffset="none"
            >
              {/* Grille – Style Tech très subtil */}
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(0, 212, 255, 0.15)" 
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
                }}
                domain={[0, domainMax]}
                tickCount={tickCount}
                allowDecimals={false}
              />

              {/* Tooltip personnalisé */}
              <Tooltip
                content={<CustomTooltip halfHourSlots={halfHourSlots} />}
                cursor={{ fill: 'rgba(0, 212, 255, 0.1)' }}
              />

              {/* Zone pause déjeuner – Style Tech */}
              <ReferenceArea
                x1={lunchStartIndex}
                x2={lunchEndIndex}
                y1={0}
                y2="dataMax"
                fill="#FFD700"
                fillOpacity={0.08}
                stroke="rgba(255, 215, 0, 0.3)"
                strokeOpacity={0.5}
                strokeDasharray="4 4"
              />
              <ReferenceLine x={lunchStartIndex} stroke="#FFD700" strokeWidth={1.5} strokeDasharray="6 4" opacity={0.5} />
              <ReferenceLine x={lunchEndIndex} stroke="#FFD700" strokeWidth={1.5} strokeDasharray="6 4" opacity={0.5} />
              <CustomLabel dataLength={data.length} />

              {/* Barres – Couleurs harmonisées INNOVEO */}
              <Bar 
                dataKey="CDS_IN" 
                name="Appels entrants" 
                fill="#00D4FF"
                fillOpacity={0.85}
                label={renderCustomLabel} 
                radius={[4, 4, 0, 0]} 
                style={{ animation: 'bar-rise-tech 1.2s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }} 
              />
              <Bar 
                dataKey="CDS_OUT" 
                name="Appels sortants" 
                fill="#FFD700"
                fillOpacity={0.85}
                label={renderCustomLabel} 
                radius={[4, 4, 0, 0]} 
                style={{ animation: 'bar-rise-tech 1.2s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }} 
              />
              <Bar 
                dataKey="ABSYS" 
                name="Appels perdus" 
                fill="#ff4500"
                fillOpacity={0.9}
                label={renderCustomLabel} 
                radius={[4, 4, 0, 0]} 
                style={{ animation: 'bar-rise-tech 1.2s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }} 
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        <LegendComponent />
      </CardContent>

      <style>
        {`
          @keyframes bar-rise-tech {
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

          @keyframes pulse-tech {
            0% { 
              transform: scale(1); 
              box-shadow: 0 0 10px rgba(0, 212, 255, 0.2); 
            }
            100% { 
              transform: scale(1.03); 
              box-shadow: 0 0 20px rgba(0, 212, 255, 0.4); 
            }
          }

          @keyframes pulse-status-cyan {
            0%, 100% { box-shadow: 0 0 0 0 rgba(0, 212, 255, 0.5); }
            50% { box-shadow: 0 0 0 8px rgba(0, 212, 255, 0); }
          }

          @keyframes tech-drift {
            0% { transform: translateX(0) translateY(0); }
            50% { transform: translateX(-10%) translateY(-5%); }
            100% { transform: translateX(0) translateY(0); }
          }

          @keyframes tech-drift-reverse {
            0% { transform: translateX(0) translateY(0); }
            50% { transform: translateX(12%) translateY(3%); }
            100% { transform: translateX(0) translateY(0); }
          }

          @keyframes pulse-critical-tech {
            0% { transform: scale(1); box-shadow: 0 0 8px rgba(255, 69, 0, 0.4); opacity: 1; }
            100% { transform: scale(1.05); box-shadow: 0 0 16px rgba(255, 69, 0, 0.7); opacity: 0.8; }
          }
        `}
      </style>
    </Card>
  );
}

export default CallVolumeChart;