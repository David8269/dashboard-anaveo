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

const lunchStartIndex = 8;  // Correspond à 12:30
const lunchEndIndex = 11;   // Correspond à 14:00

function CustomLabel({ fill }) {
  return (
    <text x="49.5%" y={25} fill={fill} fontSize={14} textAnchor="middle" fontWeight="bold" fontFamily='"Orbitron", sans-serif'>
      ⛷️ Départ de la descente ⛷️
    </text>
  );
}

function LegendComponent() {
  const itemStyle = { 
    display: 'flex', 
    alignItems: 'center', 
    gap: 6, 
    fontWeight: 'bold', 
    fontSize: 12,
    color: '#00bfff',
    textShadow: '0 0 4px rgba(0,168,232,0.6)',
  };
  const squareStyle = (color) => ({ 
    width: 14,
    height: 14, 
    backgroundColor: color, 
    borderRadius: 2,
    boxShadow: `0 0 4px ${color}`,
  });
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, py: 0.5 }}>
      <div style={itemStyle}>
        <span style={squareStyle('#00a8e8')}></span> ⛷️ CDS_IN
      </div>
      <div style={itemStyle}>
        <span style={squareStyle('#2e8b57')}></span> 🚠 CDS_OUT
      </div>
      <div style={itemStyle}>
        <span style={squareStyle('#8b0000')}></span> ❄️ Absys
      </div>
    </Box>
  );
}

const renderCustomLabel = ({ x, y, width, value, dataKey }) => {
  if (!value || value <= 0) return null;
  const isAbsysCritical = dataKey === 'ABSYS' && value > 5;
  const labelColor = isAbsysCritical ? '#00bfff' : '#ffffff';

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
        animation: isAbsysCritical ? 'pulse-blue 2s infinite alternate' : 'none',
        filter: isAbsysCritical ? 'drop-shadow(0 0 6px #00bfff)' : 'none',
      }}
    >
      {value}
    </text>
  );
};

function CallVolumeChart({ callVolumes = [], wsConnected = false, halfHourSlots = [] }) {
  const data = useMemo(() => 
    callVolumes.map((item, index) => ({ ...item, index })), 
    [callVolumes]
  );

  if (callVolumes.length === 0) {
    return (
      <Card
        sx={{
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          borderRadius: 3,
          border: '1px solid rgba(0, 168, 232, 0.7)',
          boxShadow: '0 0 15px rgba(0, 168, 232, 0.5)',
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
          background: 'radial-gradient(circle at 40% 50%, rgba(0,168,232,0.08), transparent 70%)',
          animation: 'blue-drift 22s linear infinite',
          pointerEvents: 'none',
          zIndex: 0,
        }} />
        <CardContent sx={{ p: 1, position: 'relative', zIndex: 1 }}>
          <Typography
            variant="overline"
            sx={{
              fontFamily: '"Montserrat", sans-serif',
              color: '#00a8e8',
              textShadow: '0 0 8px rgba(0,168,232,0.8)',
              fontSize: '1.2rem',
            }}
          >
            📊 Volume des descentes
          </Typography>
          <Box sx={{ textAlign: 'center', py: 1, mt: 2 }}>
            <Chip
              label={wsConnected ? '❄️ Aucune descente enregistrée' : '🏂 Connexion à la station...'}
              size="small"
              sx={{
                mb: 1,
                background: wsConnected 
                  ? 'linear-gradient(135deg, #8b0000, #000)' 
                  : 'linear-gradient(135deg, #000, #1a365d)',
                color: '#00bfff',
                fontFamily: '"Montserrat", sans-serif',
                animation: wsConnected ? 'none' : 'pulse-blue 2s infinite alternate',
              }}
            />
            <Skeleton 
              variant="rectangular" 
              width="100%" 
              height={200} 
              sx={{ backgroundColor: 'rgba(255,255,255,0.1)' }} 
            />
          </Box>
        </CardContent>
        <style>{`
          @keyframes pulse-blue {
            0% { transform: scale(1); box-shadow: 0 0 8px #00bfff; }
            100% { transform: scale(1.04); box-shadow: 0 0 20px #00bfff; }
          }
          @keyframes blue-drift {
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
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        borderRadius: 3,
        border: '1px solid rgba(0, 168, 232, 0.7)',
        boxShadow: '0 0 15px rgba(0, 168, 232, 0.5)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: '-60%',
        width: '220%',
        height: '100%',
        background: 'radial-gradient(circle at 30% 40%, rgba(0,168,232,0.07), transparent 80%)',
        animation: 'blue-drift 20s linear infinite',
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: '10%',
        right: '-70%',
        width: '240%',
        height: '60%',
        background: 'radial-gradient(circle at 70% 30%, rgba(46, 139, 87, 0.06), transparent 85%)',
        animation: 'blue-drift-reverse 28s linear infinite',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <CardContent sx={{ p: 1, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography
            variant="overline"
            sx={{
              fontFamily: '"Orbitron", sans-serif',
              color: '#00a8e8',
              textShadow: '0 0 8px rgba(0,168,232,0.8)',
              fontSize: '1.2rem',
            }}
          >
            📊 Call Volume
          </Typography>
          <Chip
            label={wsConnected ? '🟢 Live' : '🔴 Offline'}
            size="small"
            sx={{
              fontSize: 12,
              background: wsConnected 
                ? 'linear-gradient(135deg, #00a8e8, #0077cc)' 
                : 'linear-gradient(135deg, #8b0000, #000)',
              color: wsConnected ? '#fff' : '#00bfff',
              fontWeight: 'bold',
              animation: wsConnected ? 'pulse-glow 2s infinite' : 'none',
            }}
          />
        </Box>

        <Box sx={{ width: '100%', height: 250, mt: 1.5 }} aria-label="Graphique des volumes de descentes et remontées">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 15, left: 15, bottom: 45 }}
              barSize={18}
              stackOffset="none"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#00a8e8" opacity={0.3} />

              {/* Axe X – polices et couleurs bleues */}
              <XAxis
                dataKey="index"
                tick={{
                  fill: '#00bfff',
                  fontSize: 22,
                  fontWeight: 'bold',
                  textShadow: '0 0 4px rgba(0,168,232,0.6)',
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

              {/* Axe Y – bleu et élégant */}
              <YAxis
                stroke="#00a8e8"
                tick={{
                  fill: '#00bfff',
                  fontSize: 16,
                  fontWeight: 'bold',
                  fontFamily: '"Orbitron", sans-serif',
                }}
                domain={[0, domainMax]}
                tickCount={tickCount}
                allowDecimals={false}
              />

              <Tooltip
                formatter={(value, name) => {
                  const labels = { 
                    CDS_IN: '⛷️ CDS_IN', 
                    CDS_OUT: '🚠 CDS_OUT', 
                    ABSYS: '❄️ ABSYS' 
                  };
                  return [value, labels[name] || name];
                }}
                labelFormatter={(index) => `Heure : ${halfHourSlots[index] || index}`}
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.9)',
                  border: '1px solid #00a8e8',
                  borderRadius: 6,
                  color: '#00bfff',
                  fontSize: 12,
                  fontFamily: '"Montserrat", sans-serif',
                  boxShadow: '0 0 12px rgba(0, 168, 232, 0.6)',
                }}
              />

              <ReferenceArea
                x1={lunchStartIndex}
                x2={lunchEndIndex}
                y1={0}
                y2="dataMax"
                fill="#00a8e8"
                fillOpacity={0.1}
                stroke="#0077cc"
                strokeOpacity={0.7}
                strokeDasharray="4 4"
              />
              <ReferenceLine x={lunchStartIndex} stroke="#00a8e8" strokeWidth={2} strokeDasharray="6 4" />
              <ReferenceLine x={lunchEndIndex} stroke="#00a8e8" strokeWidth={2} strokeDasharray="6 4" />
              <CustomLabel fill="#00a8e8" />

              <Bar 
                dataKey="CDS_IN" 
                name="CDS_IN" 
                fill="#00a8e8" 
                label={renderCustomLabel} 
                radius={[4, 4, 0, 0]} 
                style={{ animation: 'bar-rise-blue 1.2s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }} 
              />
              <Bar 
                dataKey="CDS_OUT" 
                name="CDS_OUT" 
                fill="#2e8b57" 
                label={renderCustomLabel} 
                radius={[4, 4, 0, 0]} 
                style={{ animation: 'bar-rise-blue 1.2s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }} 
              />
              <Bar 
                dataKey="ABSYS" 
                name="ABSYS" 
                fill="#8b0000" 
                label={renderCustomLabel} 
                radius={[4, 4, 0, 0]} 
                style={{ animation: 'bar-rise-blue 1.2s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }} 
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        <LegendComponent />
      </CardContent>

      <style>
        {`
          @keyframes bar-rise-blue {
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

          @keyframes pulse-blue {
            0% { 
              transform: scale(1); 
              box-shadow: 0 0 8px #00bfff; 
            }
            100% { 
              transform: scale(1.04); 
              box-shadow: 0 0 20px #00bfff; 
            }
          }

          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 0 0 rgba(0, 168, 232, 0.7); }
            50% { box-shadow: 0 0 0 8px rgba(0, 168, 232, 0); }
          }

          @keyframes blue-drift {
            0% { transform: translateX(0) translateY(0); }
            50% { transform: translateX(-10%) translateY(-5%); }
            100% { transform: translateX(0) translateY(0); }
          }

          @keyframes blue-drift-reverse {
            0% { transform: translateX(0) translateY(0); }
            50% { transform: translateX(12%) translateY(3%); }
            100% { transform: translateX(0) translateY(0); }
          }
        `}
      </style>
    </Card>
  );
}

export default CallVolumeChart;