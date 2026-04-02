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
    <text x="49.5%" y={25} fill={fill} fontSize={14} textAnchor="middle" fontWeight="bold" fontFamily='"Montserrat", sans-serif'>
      🐰 Pause déjeuner 🥚
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
    color: '#5D4E60',
    textShadow: '0 0 4px rgba(255, 255, 255, 0.6)',
  };
  const squareStyle = (color) => ({ 
    width: 14,
    height: 14, 
    backgroundColor: color, 
    borderRadius: 2,
    boxShadow: `0 0 4px ${color}`,
    border: '1px solid #FFD700',
  });
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, py: 0.5 }}>
      <div style={itemStyle}>
        <span style={squareStyle('#FFB6C1')}></span> 🥚 CDS_IN
      </div>
      <div style={itemStyle}>
        <span style={squareStyle('#98D8C8')}></span> 🐰 CDS_OUT
      </div>
      <div style={itemStyle}>
        <span style={squareStyle('#ef9a9a')}></span> 🔴 ABSYS
      </div>
    </Box>
  );
}

const renderCustomLabel = ({ x, y, width, value, dataKey }) => {
  if (!value || value <= 0) return null;
  const isAbsysCritical = dataKey === 'ABSYS' && value > 5;
  const labelColor = isAbsysCritical ? '#ef9a9a' : '#5D4E60';

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
        filter: isAbsysCritical ? 'drop-shadow(0 0 6px #e57373)' : 'none',
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

  // === État vide ===
  if (callVolumes.length === 0) {
    return (
      <Card
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderRadius: 3,
          border: '3px solid #DDA0DD',
          boxShadow: '0 4px 16px rgba(221, 160, 221, 0.3)',
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
          background: 'radial-gradient(circle at 40% 50%, rgba(221, 160, 221, 0.1), transparent 70%)',
          animation: 'easter-drift 22s linear infinite',
          pointerEvents: 'none',
          zIndex: 0,
        }} />
        <CardContent sx={{ p: 1, position: 'relative', zIndex: 1 }}>
          <Typography
            variant="overline"
            sx={{
              fontFamily: '"Montserrat", sans-serif',
              color: '#5D4E60',
              textShadow: '0 0 8px rgba(255, 255, 255, 0.8)',
              fontSize: '1.2rem',
            }}
          >
            📊 Volume des appels
          </Typography>
          <Box sx={{ textAlign: 'center', py: 1, mt: 2 }}>
            <Chip
              label={wsConnected ? '🥚 Aucun œuf collecté' : '🐰 Connexion au jardin...'}
              size="small"
              sx={{
                mb: 1,
                background: wsConnected 
                  ? 'linear-gradient(135deg, #FFB6C1, #98D8C8)' 
                  : 'linear-gradient(135deg, #DDA0DD, #FFD700)',
                color: '#5D4E60',
                fontFamily: '"Montserrat", sans-serif',
                animation: wsConnected ? 'none' : 'pulse-easter 2s infinite alternate',
                border: '2px solid #FFD700',
              }}
            />
            <Skeleton 
              variant="rectangular" 
              width="100%" 
              height={200} 
              sx={{ backgroundColor: 'rgba(221, 160, 221, 0.1)' }} 
            />
          </Box>
        </CardContent>
        <style>{`
          @keyframes pulse-easter {
            0% { transform: scale(1); box-shadow: 0 0 8px rgba(221, 160, 221, 0.4); }
            100% { transform: scale(1.04); box-shadow: 0 0 20px rgba(152, 216, 200, 0.6); }
          }
          @keyframes easter-drift {
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
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderRadius: 3,
        border: '3px solid #DDA0DD',
        boxShadow: '0 4px 16px rgba(221, 160, 221, 0.3)',
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
        background: 'radial-gradient(circle at 30% 40%, rgba(221, 160, 221, 0.1), transparent 80%)',
        animation: 'easter-drift 20s linear infinite',
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: '10%',
        right: '-70%',
        width: '240%',
        height: '60%',
        background: 'radial-gradient(circle at 70% 30%, rgba(152, 216, 200, 0.08), transparent 85%)',
        animation: 'easter-drift-reverse 28s linear infinite',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <CardContent sx={{ p: 1, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography
            variant="overline"
            sx={{
              fontFamily: '"Montserrat", sans-serif',
              color: '#5D4E60',
              textShadow: '0 0 8px rgba(255, 255, 255, 0.8)',
              fontSize: '1.2rem',
            }}
          >
            ☎️ Volume d'appels
          </Typography>
          <Chip
            label={wsConnected ? '🟢 En ligne' : '🔴 Hors ligne'}
            size="small"
            sx={{
              fontSize: 12,
              background: wsConnected 
                ? 'linear-gradient(135deg, #a5d6a7, #FFD700)'
                : 'linear-gradient(135deg, #DDA0DD, #ef9a9a)',
              color: wsConnected ? '#5D4E60' : '#fff',
              fontWeight: 'bold',
              animation: wsConnected ? 'pulse-glow 2s infinite' : 'none',
              border: '2px solid #FFD700',
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
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(221, 160, 221, 0.35)" opacity={0.35} />

              <XAxis
                dataKey="index"
                tick={{
                  fill: '#5D4E60',
                  fontSize: 22,
                  fontWeight: 'bold',
                  textShadow: '0 0 4px rgba(255, 255, 255, 0.6)',
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

              <YAxis
                stroke="#5D4E60"
                tick={{
                  fill: '#5D4E60',
                  fontSize: 16,
                  fontWeight: 'bold',
                  fontFamily: '"Montserrat", sans-serif',
                }}
                domain={[0, domainMax]}
                tickCount={tickCount}
                allowDecimals={false}
              />

              <Tooltip
                formatter={(value, name) => {
                  const labels = { 
                    CDS_IN: '🥚 Œufs collectés', 
                    CDS_OUT: '🐰 Œufs livrés', 
                    ABSYS: '🔴 Appels perdus' 
                  };
                  return [value, labels[name] || name];
                }}
                labelFormatter={(index) => `Heure : ${halfHourSlots[index] || index}`}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '2px solid #DDA0DD',
                  borderRadius: 6,
                  color: '#5D4E60',
                  fontSize: 12,
                  fontFamily: '"Roboto", sans-serif',
                  boxShadow: '0 0 12px rgba(221, 160, 221, 0.3)',
                }}
              />

              <ReferenceArea
                x1={lunchStartIndex}
                x2={lunchEndIndex}
                y1={0}
                y2="dataMax"
                fill="#FFD700"
                fillOpacity={0.15}
                stroke="#DDA0DD"
                strokeOpacity={0.6}
                strokeDasharray="4 4"
              />
              <ReferenceLine x={lunchStartIndex} stroke="#DDA0DD" strokeWidth={2} strokeDasharray="6 4" />
              <ReferenceLine x={lunchEndIndex} stroke="#DDA0DD" strokeWidth={2} strokeDasharray="6 4" />
              <CustomLabel fill="#5D4E60" />

              <Bar 
                dataKey="CDS_IN" 
                name="Œufs collectés" 
                fill="#FFB6C1"
                label={renderCustomLabel} 
                radius={[4, 4, 0, 0]} 
                style={{ animation: 'bar-rise-easter 1.2s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }} 
              />
              <Bar 
                dataKey="CDS_OUT" 
                name="Œufs livrés" 
                fill="#98D8C8"
                label={renderCustomLabel} 
                radius={[4, 4, 0, 0]} 
                style={{ animation: 'bar-rise-easter 1.2s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }} 
              />
              <Bar 
                dataKey="ABSYS" 
                name="Appels perdus" 
                fill="#ef9a9a"
                label={renderCustomLabel} 
                radius={[4, 4, 0, 0]} 
                style={{ animation: 'bar-rise-easter 1.2s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }} 
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        <LegendComponent />
      </CardContent>

      <style>
        {`
          @keyframes bar-rise-easter {
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

          @keyframes pulse-easter {
            0% { 
              transform: scale(1); 
              box-shadow: 0 0 8px rgba(221, 160, 221, 0.4); 
            }
            100% { 
              transform: scale(1.04); 
              box-shadow: 0 0 20px rgba(152, 216, 200, 0.6); 
            }
          }

          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 0 0 rgba(221, 160, 221, 0.5); }
            50% { box-shadow: 0 0 0 8px rgba(221, 160, 221, 0); }
          }

          @keyframes easter-drift {
            0% { transform: translateX(0) translateY(0); }
            50% { transform: translateX(-10%) translateY(-5%); }
            100% { transform: translateX(0) translateY(0); }
          }

          @keyframes easter-drift-reverse {
            0% { transform: translateX(0) translateY(0); }
            50% { transform: translateX(12%) translateY(3%); }
            100% { transform: translateX(0) translateY(0); }
          }

          @keyframes pulse-critical {
            0% { transform: scale(1); box-shadow: 0 0 6px #e57373; }
            100% { transform: scale(1.03); box-shadow: 0 0 12px #ef9a9a; }
          }
        `}
      </style>
    </Card>
  );
}

export default CallVolumeChart;