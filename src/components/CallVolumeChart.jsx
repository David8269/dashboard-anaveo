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

function CustomLabel({ fill }) {
  return (
    <text x="49.5%" y={25} fill={fill} fontSize={14} textAnchor="middle" fontWeight="bold" fontFamily='"Playfair Display", serif'>
      ❤️ Pause déjeuner ❤️
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
    color: '#ffffff',
    textShadow: '0 0 2px rgba(0,0,0,0.5)',
  };
  const squareStyle = (color) => ({ 
    width: 14,
    height: 14, 
    backgroundColor: color, 
    borderRadius: 2,
    boxShadow: `0 0 3px ${color}`,
  });
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, py: 0.5 }}>
      <div style={itemStyle}>
        <span style={squareStyle('#e74c3c')}></span> ❤️ CDS_IN
      </div>
      <div style={itemStyle}>
        <span style={squareStyle('#8B0000')}></span> 💘 CDS_OUT
      </div>
      <div style={itemStyle}>
        <span style={squareStyle('#c0392b')}></span> 💔 ABSYS
      </div>
    </Box>
  );
}

const renderCustomLabel = ({ x, y, width, value, dataKey }) => {
  if (!value || value <= 0) return null;
  const isAbsysCritical = dataKey === 'ABSYS' && value > 5;
  const labelColor = isAbsysCritical ? '#c0392b' : '#ffffff';

  return (
    <text
      x={x + width / 2}
      y={y - 6}
      fill={labelColor}
      textAnchor="middle"
      fontSize={10}
      fontWeight="bold"
      fontFamily={isAbsysCritical ? '"Playfair Display", serif' : 'inherit'}
      style={{
        animation: isAbsysCritical ? 'pulse-critical-heart 2s infinite alternate' : 'none',
        filter: isAbsysCritical ? 'drop-shadow(0 0 4px #ff5252)' : 'none',
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
          backgroundColor: 'rgba(25, 25, 45, 0.7)',
          borderRadius: 3,
          border: '1px solid rgba(231, 76, 60, 0.4)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
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
          background: 'radial-gradient(circle at 40% 50%, rgba(231, 76, 60, 0.08), transparent 70%)',
          animation: 'heart-drift 22s linear infinite',
          pointerEvents: 'none',
          zIndex: 0,
        }} />
        <CardContent sx={{ p: 1, position: 'relative', zIndex: 1 }}>
          <Typography
            variant="overline"
            sx={{
              fontFamily: '"Playfair Display", serif',
              color: '#ffffff',
              fontSize: '1.2rem',
              letterSpacing: '0.05em',
            }}
          >
            📊 Volume des appels
          </Typography>
          <Box sx={{ textAlign: 'center', py: 1, mt: 2 }}>
            <Chip
              label={wsConnected ? '❤️ Aucun appel enregistré' : '💘 Connexion au Cœur du CDS...'}
              size="small"
              sx={{
                mb: 1,
                background: wsConnected 
                  ? 'linear-gradient(135deg, #8B0000, #e74c3c)' 
                  : 'linear-gradient(135deg, #8B0000, #ff6b6b)',
                color: '#ffffff',
                fontFamily: '"Playfair Display", serif',
                animation: wsConnected ? 'none' : 'heartbeat 1.8s ease-in-out infinite',
                border: '1px solid rgba(231, 76, 60, 0.4)',
              }}
            />
            <Skeleton 
              variant="rectangular" 
              width="100%" 
              height={200} 
              sx={{ backgroundColor: 'rgba(50, 50, 70, 0.3)' }} 
            />
          </Box>
        </CardContent>
        <style>{`
          @keyframes heartbeat {
            0%, 100% { transform: scale(1); }
            14%, 28% { transform: scale(1.08); }
            42%, 56% { transform: scale(1); }
            70% { transform: scale(1.12); }
          }
          @keyframes heart-drift {
            0% { transform: translateX(0) translateY(0); opacity: 0.8; }
            50% { transform: translateX(-6%) translateY(-3%); opacity: 1; }
            100% { transform: translateX(0) translateY(0); opacity: 0.8; }
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
        backgroundColor: 'rgba(25, 25, 45, 0.7)',
        borderRadius: 3,
        border: '1px solid rgba(231, 76, 60, 0.4)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
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
        background: 'radial-gradient(circle at 30% 40%, rgba(231, 76, 60, 0.08), transparent 80%)',
        animation: 'heart-drift 20s linear infinite',
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: '10%',
        right: '-70%',
        width: '240%',
        height: '60%',
        background: 'radial-gradient(circle at 70% 30%, rgba(139, 0, 0, 0.08), transparent 85%)',
        animation: 'heart-drift-reverse 28s linear infinite',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <CardContent sx={{ p: 1, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography
            variant="overline"
            sx={{
              fontFamily: '"Playfair Display", serif',
              color: '#ffffff',
              fontSize: '1.2rem',
              letterSpacing: '0.05em',
            }}
          >
            ☎️ Call Volume
          </Typography>
          <Chip
            label={wsConnected ? '🟢 Online' : '🔴 Offline'}
            size="small"
            sx={{
              fontSize: 12,
              background: wsConnected 
                ? 'linear-gradient(135deg, #e74c3c, #ff6b6b)'
                : 'linear-gradient(135deg, #8B0000, #c0392b)',
              color: '#ffffff',
              fontWeight: 'bold',
              animation: wsConnected ? 'pulse-heart 2s infinite' : 'none',
              border: '1px solid rgba(231, 76, 60, 0.4)',
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
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.15)" opacity={0.3} />

              {/* Axe X – polices et couleurs claires */}
              <XAxis
                dataKey="index"
                tick={{
                  fill: '#ffffff',
                  fontSize: 18,
                  fontWeight: 'bold',
                  fontFamily: '"Playfair Display", serif',
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

              {/* Axe Y – blanc pur pour une meilleure lisibilité */}
              <YAxis
                stroke="#ffffff"
                tick={{
                  fill: '#ffffff',
                  fontSize: 16,
                  fontWeight: 'bold',
                  fontFamily: '"Playfair Display", serif',
                }}
                domain={[0, domainMax]}
                tickCount={tickCount}
                allowDecimals={false}
              />

              <Tooltip
                formatter={(value, name) => {
                  const labels = { 
                    CDS_IN: '❤️ Cœurs conquis', 
                    CDS_OUT: '💘 Cœurs partagés', 
                    ABSYS: '💔 Cœurs perdus' 
                  };
                  return [value, labels[name] || name];
                }}
                labelFormatter={(index) => `Heure : ${halfHourSlots[index] || index}`}
                contentStyle={{
                  backgroundColor: 'rgba(30, 30, 50, 0.95)',
                  border: '1px solid rgba(231, 76, 60, 0.5)',
                  borderRadius: 8,
                  color: '#ffffff',
                  fontSize: 12,
                  fontFamily: '"Roboto", sans-serif',
                  boxShadow: '0 0 12px rgba(231, 76, 60, 0.2)',
                }}
              />

              <ReferenceArea
                x1={lunchStartIndex}
                x2={lunchEndIndex}
                y1={0}
                y2="dataMax"
                fill="#e74c3c"
                fillOpacity={0.15}
                stroke="rgba(231, 76, 60, 0.4)"
                strokeOpacity={0.7}
                strokeDasharray="4 4"
              />
              <ReferenceLine x={lunchStartIndex} stroke="#ffffff" strokeWidth={1} strokeDasharray="6 4" />
              <ReferenceLine x={lunchEndIndex} stroke="#ffffff" strokeWidth={1} strokeDasharray="6 4" />
              <CustomLabel fill="#ffffff" />

              <Bar 
                dataKey="CDS_IN" 
                name="Cœurs conquis" 
                fill="#e74c3c"
                label={renderCustomLabel} 
                radius={[4, 4, 0, 0]} 
                style={{ animation: 'bar-rise-heart 1.2s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }} 
              />
              <Bar 
                dataKey="CDS_OUT" 
                name="Cœurs partagés" 
                fill="#8B0000"
                label={renderCustomLabel} 
                radius={[4, 4, 0, 0]} 
                style={{ animation: 'bar-rise-heart 1.2s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }} 
              />
              <Bar 
                dataKey="ABSYS" 
                name="Cœurs perdus" 
                fill="#c0392b"
                label={renderCustomLabel} 
                radius={[4, 4, 0, 0]} 
                style={{ animation: 'bar-rise-heart 1.2s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }} 
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        <LegendComponent />
      </CardContent>

      <style>
        {`
          @keyframes bar-rise-heart {
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

          @keyframes heartbeat {
            0%, 100% { transform: scale(1); }
            14%, 28% { transform: scale(1.08); }
            42%, 56% { transform: scale(1); }
            70% { transform: scale(1.12); }
          }

          @keyframes pulse-heart {
            0%, 100% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.7); }
            50% { box-shadow: 0 0 0 8px rgba(231, 76, 60, 0); }
          }

          @keyframes heart-drift {
            0% { transform: translateX(0) translateY(0); opacity: 0.8; }
            50% { transform: translateX(-8%) translateY(-4%); opacity: 1; }
            100% { transform: translateX(0) translateY(0); opacity: 0.8; }
          }

          @keyframes heart-drift-reverse {
            0% { transform: translateX(0) translateY(0); opacity: 0.8; }
            50% { transform: translateX(10%) translateY(3%); opacity: 1; }
            100% { transform: translateX(0) translateY(0); opacity: 0.8; }
          }

          @keyframes pulse-critical-heart {
            0% { transform: scale(1); box-shadow: 0 0 6px #ff5252; }
            100% { transform: scale(1.04); box-shadow: 0 0 14px #e74c3c, 0 0 20px rgba(231, 76, 60, 0.6); }
          }
        `}
      </style>
    </Card>
  );
}

export default CallVolumeChart;