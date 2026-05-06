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

// === 🦉 Label personnalisé – Thème Pluie (TEXTE BLANC) ===
function CustomLabel({ fill }) {
  return (
    <text 
      x="49.5%" 
      y={25} 
      fill="#ecf0f1"  // Changé de #f39c12 (ambre) à #ecf0f1 (blanc)
      fontSize={14} 
      textAnchor="middle" 
      fontWeight="bold" 
      fontFamily='"Montserrat", sans-serif'
      style={{ textShadow: '0 0 8px rgba(255, 255, 255, 0.5)' }} // Ajout d'une lueur blanche pour lisibilité
    >
      🌧️ Lunch Break 🌧️
    </text>
  );
}

// === 🦉 Légende – Thème sombre (couleurs mises à jour) ===
function LegendComponent() {
  const itemStyle = { 
    display: 'flex', 
    alignItems: 'center', 
    gap: 6, 
    fontWeight: 'bold', 
    fontSize: 12,
    color: '#ecf0f1',
    textShadow: '0 0 6px rgba(243, 156, 18, 0.4)',
  };
  const squareStyle = (color) => ({ 
    width: 14,
    height: 14, 
    backgroundColor: color, 
    borderRadius: 2,
    boxShadow: `0 0 6px ${color}`,
    border: '1px solid rgba(243, 156, 18, 0.3)',
  });
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, py: 0.5 }}>
      <div style={itemStyle}>
        <span style={squareStyle('#27ae60')}></span> 🦉 CDS_IN
      </div>
      <div style={itemStyle}>
        <span style={squareStyle('#ecf0f1')}></span> ️ CDS_OUT
      </div>
      <div style={itemStyle}>
        <span style={squareStyle('#e74c3c')}></span> 🔴 ABSYS
      </div>
    </Box>
  );
}

// === 🦉 Label des barres – Animation critique ===
const renderCustomLabel = ({ x, y, width, value, dataKey }) => {
  if (!value || value <= 0) return null;
  const isAbsysCritical = dataKey === 'ABSYS' && value > 5;
  const labelColor = isAbsysCritical ? '#e74c3c' : '#ecf0f1';

  return (
    <text
      x={x + width / 2}
      y={y - 6}
      fill={labelColor}
      textAnchor="middle"
      fontSize={10}
      fontWeight="bold"
      fontFamily={isAbsysCritical ? '"Montserrat", sans-serif' : 'inherit'}
      style={{
        animation: isAbsysCritical ? 'pulse-critical 2s infinite alternate' : 'none',
        filter: isAbsysCritical ? 'drop-shadow(0 0 6px rgba(231, 76, 60, 0.6))' : 'none',
        textShadow: '0 0 4px rgba(0,0,0,0.5)',
      }}
    >
      {value}
    </text>
  );
};

// === 🦉 Tooltip personnalisé – Style sombre (couleurs mises à jour) ===
const CustomTooltip = ({ active, payload, label, halfHourSlots }) => {
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
          {`Heure : ${halfHourSlots[label] || label}`}
        </Typography>
        {payload.map((entry, index) => {
          const labels = { 
            CDS_IN: '🦉 Appels entrants', 
            CDS_OUT: '🌧️ Appels sortants', 
            ABSYS: ' Appels perdus' 
          };
          const colors = {
            CDS_IN: '#27ae60',    // VERT au lieu de jaune
            CDS_OUT: '#ecf0f1',   // BLANC au lieu d'orange
            ABSYS: '#e74c3c',
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
              {labels[entry.dataKey] || entry.name}: <strong>{entry.value}</strong>
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

  // === 🦉 État vide – Ambiance nocturne ===
  if (callVolumes.length === 0) {
    return (
      <Card
        sx={{
          // Glassmorphism ULTRA-TRANSPARENT
          backgroundColor: 'rgba(10, 14, 23, 0.25)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
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
        <CardContent sx={{ p: 1, position: 'relative', zIndex: 1 }}>
          <Typography
            variant="overline"
            sx={{
              fontFamily: '"Montserrat", sans-serif',
              color: '#ecf0f1',
              textShadow: '0 0 12px rgba(243, 156, 18, 0.4)',
              fontSize: '1.2rem',
            }}
          >
            📊 Call Volume
          </Typography>
          <Box sx={{ textAlign: 'center', py: 1, mt: 2 }}>
            <Chip
              label={wsConnected ? '🦉 Aucun appel enregistré' : '🌧️ Connexion au flux...'}
              size="small"
              sx={{
                mb: 1,
                background: wsConnected 
                  ? 'linear-gradient(135deg, #27ae60, #2ecc71)' 
                  : 'linear-gradient(135deg, #34495e, #2c3e50)',
                color: wsConnected ? '#0a0e17' : '#ecf0f1',
                fontFamily: '"Montserrat", sans-serif',
                animation: wsConnected ? 'none' : 'pulse-owl 2s infinite alternate',
                border: '1px solid rgba(243, 156, 18, 0.3)',
                fontWeight: 600,
              }}
            />
            <Skeleton 
              variant="rectangular" 
              width="100%" 
              height={200} 
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

  const maxY = data.reduce((max, d) => {
    const currentMax = Math.max(d.CDS_IN || 0, d.CDS_OUT || 0, d.ABSYS || 0);
    return currentMax > max ? currentMax : max;
  }, 0);

  const yMax = Math.max(1, isNaN(maxY) ? 1 : maxY);
  const domainMax = Math.ceil(yMax * 1.3);
  const tickCount = Math.min(6, domainMax + 1);

  return (
    <Card
      sx={{
        backgroundColor: 'rgba(10, 14, 23, 0.25)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
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
      {/* Lueurs ambiantes hibou */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: '-60%',
        width: '220%',
        height: '100%',
        background: 'radial-gradient(circle at 30% 40%, rgba(243, 156, 18, 0.06), transparent 80%)',
        animation: 'owl-drift 20s linear infinite',
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: '10%',
        right: '-70%',
        width: '240%',
        height: '60%',
        background: 'radial-gradient(circle at 70% 30%, rgba(212, 160, 23, 0.05), transparent 85%)',
        animation: 'owl-drift-reverse 28s linear infinite',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <CardContent sx={{ p: 1, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography
            variant="overline"
            sx={{
              fontFamily: '"Montserrat", sans-serif',
              color: '#ecf0f1',
              textShadow: '0 0 12px rgba(243, 156, 18, 0.4)',
              fontSize: '1.2rem',
            }}
          >
            ☎️ Call Volume
          </Typography>
          <Chip
            label={wsConnected ? '🟢 Online' : ' Offline'}
            size="small"
            sx={{
              fontSize: 12,
              background: wsConnected 
                ? 'linear-gradient(135deg, #27ae60, #2ecc71)'
                : 'linear-gradient(135deg, #34495e, #e74c3c)',
              color: wsConnected ? '#0a0e17' : '#ecf0f1',
              fontWeight: 'bold',
              animation: wsConnected ? 'pulse-status 2s infinite' : 'none',
              border: '1px solid rgba(243, 156, 18, 0.3)',
            }}
          />
        </Box>

        <Box sx={{ width: '100%', height: 250, mt: 1.5 }} aria-label="Graphique des volumes d'appels">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 15, left: 15, bottom: 45 }}
              barSize={18}
              stackOffset="none"
            >
              {/* Grille – Style sombre */}
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="rgba(243, 156, 18, 0.15)" 
                opacity={0.2} 
              />

              {/* Axe X – Texte blanc */}
              <XAxis
                dataKey="index"
                tick={{
                  fill: '#bdc3c7',
                  fontSize: 11,
                  fontWeight: 500,
                  textShadow: '0 0 4px rgba(0,0,0,0.5)',
                  fontFamily: '"Montserrat", sans-serif',
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
                height={40}
                tickMargin={12}
              />

              {/* Axe Y – Texte blanc */}
              <YAxis
                stroke="#bdc3c7"
                tick={{
                  fill: '#bdc3c7',
                  fontSize: 11,
                  fontWeight: 500,
                  fontFamily: '"Montserrat", sans-serif',
                }}
                domain={[0, domainMax]}
                tickCount={tickCount}
                allowDecimals={false}
              />

              {/* Tooltip personnalisé sombre */}
              <Tooltip
                content={<CustomTooltip halfHourSlots={halfHourSlots} />}
                cursor={{ fill: 'rgba(243, 156, 18, 0.08)' }}
              />

              {/* Zone pause déjeuner – Style ambré */}
              <ReferenceArea
                x1={lunchStartIndex}
                x2={lunchEndIndex}
                y1={0}
                y2="dataMax"
                fill="#d4a017"
                fillOpacity={0.08}
                stroke="rgba(243, 156, 18, 0.3)"
                strokeOpacity={0.4}
                strokeDasharray="4 4"
              />
              <ReferenceLine x={lunchStartIndex} stroke="#d4a017" strokeWidth={1.5} strokeDasharray="6 4" opacity={0.5} />
              <ReferenceLine x={lunchEndIndex} stroke="#d4a017" strokeWidth={1.5} strokeDasharray="6 4" opacity={0.5} />
              <CustomLabel fill="#f39c12" />

              {/* Barres – Couleurs thème hibou MISES À JOUR */}
              <Bar 
                dataKey="CDS_IN" 
                name="Appels entrants" 
                fill="#27ae60"        // VERT au lieu de jaune
                fillOpacity={0.85}
                label={renderCustomLabel} 
                radius={[4, 4, 0, 0]} 
                style={{ animation: 'bar-rise-owl 1.2s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }} 
              />
              <Bar 
                dataKey="CDS_OUT" 
                name="Appels sortants" 
                fill="#ecf0f1"       // BLANC au lieu d'orange
                fillOpacity={0.85}
                label={renderCustomLabel} 
                radius={[4, 4, 0, 0]} 
                style={{ animation: 'bar-rise-owl 1.2s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }} 
              />
              <Bar 
                dataKey="ABSYS" 
                name="Appels perdus" 
                fill="#e74c3c"
                fillOpacity={0.9}
                label={renderCustomLabel} 
                radius={[4, 4, 0, 0]} 
                style={{ animation: 'bar-rise-owl 1.2s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }} 
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        <LegendComponent />
      </CardContent>

      <style>
        {`
          @keyframes bar-rise-owl {
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

          @keyframes pulse-owl {
            0% { 
              transform: scale(1); 
              box-shadow: 0 0 8px rgba(243, 156, 18, 0.3); 
            }
            100% { 
              transform: scale(1.04); 
              box-shadow: 0 0 18px rgba(243, 156, 18, 0.5); 
            }
          }

          @keyframes pulse-status {
            0%, 100% { box-shadow: 0 0 0 0 rgba(39, 174, 96, 0.4); }
            50% { box-shadow: 0 0 0 8px rgba(39, 174, 96, 0); }
          }

          @keyframes owl-drift {
            0% { transform: translateX(0) translateY(0); }
            50% { transform: translateX(-10%) translateY(-5%); }
            100% { transform: translateX(0) translateY(0); }
          }

          @keyframes owl-drift-reverse {
            0% { transform: translateX(0) translateY(0); }
            50% { transform: translateX(12%) translateY(3%); }
            100% { transform: translateX(0) translateY(0); }
          }

          @keyframes pulse-critical {
            0% { transform: scale(1); box-shadow: 0 0 6px rgba(231, 76, 60, 0.4); }
            100% { transform: scale(1.03); box-shadow: 0 0 12px rgba(231, 76, 60, 0.6); }
          }
        `}
      </style>
    </Card>
  );
}

export default CallVolumeChart;