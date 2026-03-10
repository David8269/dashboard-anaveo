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
    <text x="49.5%" y={25} fill={fill} fontSize={14} textAnchor="middle" fontWeight="bold" fontFamily='"Creepster", cursive'>
      🔪 Cauchemar du Vendredi 13 🔪
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
    color: '#e0e0e0',
    textShadow: '0 0 4px rgba(0, 0, 0, 0.9)',
  };
  const squareStyle = (color) => ({ 
    width: 14,
    height: 14, 
    backgroundColor: color, 
    borderRadius: 2,
    boxShadow: `0 0 6px ${color}`,
  });
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, py: 0.5 }}>
      <div style={itemStyle}>
        <span style={squareStyle('#8b0000')}></span> 🔪 CDS_IN
      </div>
      <div style={itemStyle}>
        <span style={squareStyle('#ff0000')}></span> 🔪 CDS_OUT
      </div>
      <div style={itemStyle}>
        <span style={squareStyle('#c62828')}></span> 🔪 ABSYS
      </div>
    </Box>
  );
}

const renderCustomLabel = ({ x, y, width, value, dataKey }) => {
  if (!value || value <= 0) return null;
  const isAbsysCritical = dataKey === 'ABSYS' && value > 5;
  const labelColor = isAbsysCritical ? '#c62828' : '#e0e0e0';

  return (
    <text
      x={x + width / 2}
      y={y - 6}
      fill={labelColor}
      textAnchor="middle"
      fontSize={10}
      fontWeight="bold"
      fontFamily={isAbsysCritical ? '"Creepster", cursive' : 'inherit'}
      style={{
        animation: isAbsysCritical ? 'pulse-critical-friday 2s infinite alternate' : 'none',
        filter: isAbsysCritical ? 'drop-shadow(0 0 6px #c62828)' : 'none',
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
          backgroundColor: 'rgba(10, 10, 10, 0.85)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          borderRadius: 3,
          border: '2px solid transparent',
          backgroundClip: 'padding-box',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: '12px',
            padding: '2px',
            background: 'linear-gradient(135deg, #8b0000, #ff0000, #8b0000)',
            backgroundSize: '400% 400%',
            animation: 'gradient-border-chart-empty-friday 8s ease infinite',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            zIndex: -1,
          },
        }}
      >
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: '-50%',
          width: '200%',
          height: '100%',
          background: 'radial-gradient(circle at 40% 50%, rgba(139, 0, 0, 0.15), transparent 70%)',
          animation: 'friday-drift 22s linear infinite',
          pointerEvents: 'none',
          zIndex: 0,
        }} />
        <CardContent sx={{ p: 1, position: 'relative', zIndex: 1 }}>
          <Typography
            variant="overline"
            sx={{
              fontFamily: '"Creepster", cursive',
              background: 'linear-gradient(135deg, #8b0000, #ff0000, #8b0000)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundSize: '400% 400%',
              animation: 'color-shift-friday 6s ease infinite',
              fontSize: '1.2rem',
              textShadow: '0 0 12px rgba(255, 0, 0, 0.6)',
            }}
          >
            📊 Volume des appels
          </Typography>
          <Box sx={{ textAlign: 'center', py: 1, mt: 2 }}>
            <Chip
              label={wsConnected ? '🔪 Aucun appel enregistré' : '🔪 Connexion au cauchemar...'}
              size="small"
              sx={{
                mb: 1,
                background: wsConnected 
                  ? 'linear-gradient(135deg, #8b0000, #ff0000, #8b0000)' 
                  : 'linear-gradient(135deg, #8b0000, #c62828)',
                color: '#ffffff',
                fontFamily: '"Creepster", cursive',
                animation: wsConnected ? 'none' : 'pulse-friday 2s infinite alternate',
                border: '2px solid rgba(255, 0, 0, 0.5)',
                boxShadow: '0 0 15px rgba(139, 0, 0, 0.6), 0 0 25px rgba(255, 0, 0, 0.4)',
              }}
            />
            <Skeleton 
              variant="rectangular" 
              width="100%" 
              height={200} 
              sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} 
            />
          </Box>
        </CardContent>
        <style>{`
          @keyframes pulse-friday {
            0% { transform: scale(1); box-shadow: 0 0 10px rgba(139, 0, 0, 0.6), 0 0 20px rgba(255, 0, 0, 0.4); }
            100% { transform: scale(1.04); box-shadow: 0 0 20px rgba(139, 0, 0, 0.9), 0 0 30px rgba(255, 0, 0, 0.7), 0 0 40px rgba(139, 0, 0, 0.5); }
          }
          @keyframes friday-drift {
            0% { transform: translateX(0) translateY(0); }
            50% { transform: translateX(-8%) translateY(-4%); }
            100% { transform: translateX(0) translateY(0); }
          }
          @keyframes color-shift-friday {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          @keyframes gradient-border-chart-empty-friday {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
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
        backgroundColor: 'rgba(10, 10, 10, 0.85)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        borderRadius: 3,
        border: '2px solid transparent',
        backgroundClip: 'padding-box',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: '12px',
          padding: '2px',
          background: 'linear-gradient(135deg, #8b0000, #ff0000, #8b0000)',
          backgroundSize: '400% 400%',
          animation: 'gradient-border-chart-friday 8s ease infinite',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          zIndex: -1,
        },
      }}
    >
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: '-60%',
        width: '220%',
        height: '100%',
        background: 'radial-gradient(circle at 30% 40%, rgba(139, 0, 0, 0.15), transparent 80%)',
        animation: 'friday-drift 20s linear infinite',
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: '10%',
        right: '-70%',
        width: '240%',
        height: '60%',
        background: 'radial-gradient(circle at 70% 30%, rgba(255, 0, 0, 0.15), transparent 85%)',
        animation: 'friday-drift-reverse 28s linear infinite',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <CardContent sx={{ p: 1, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography
            variant="overline"
            sx={{
              fontFamily: '"Creepster", cursive',
              background: 'linear-gradient(135deg, #8b0000, #ff0000, #8b0000)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundSize: '400% 400%',
              animation: 'color-shift-friday 6s ease infinite',
              fontSize: '1.2rem',
              textShadow: '0 0 12px rgba(255, 0, 0, 0.6)',
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
                ? 'linear-gradient(135deg, #8b0000, #a52a2a)'
                : 'linear-gradient(135deg, #c62828, #b71c1c)',
              color: '#ffffff',
              fontWeight: 'bold',
              animation: wsConnected ? 'pulse-glow-friday 2s infinite' : 'none',
              border: '2px solid rgba(255, 0, 0, 0.5)',
              boxShadow: '0 0 15px rgba(139, 0, 0, 0.6)',
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
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 0, 0, 0.3)" opacity={0.3} />

              <XAxis
                dataKey="index"
                tick={{
                  fill: '#e0e0e0',
                  fontSize: 22,
                  fontWeight: 'bold',
                  textShadow: '0 0 8px rgba(0, 0, 0, 0.9), 0 0 12px rgba(255, 0, 0, 0.5)',
                  fontFamily: '"Creepster", cursive',
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
                stroke="#e0e0e0"
                tick={{
                  fill: '#e0e0e0',
                  fontSize: 16,
                  fontWeight: 'bold',
                  fontFamily: '"Creepster", cursive',
                  textShadow: '0 0 6px rgba(0, 0, 0, 0.9)',
                }}
                domain={[0, domainMax]}
                tickCount={tickCount}
                allowDecimals={false}
              />

              <Tooltip
                formatter={(value, name) => {
                  const labels = { 
                    CDS_IN: '🔪 Appels entrants', 
                    CDS_OUT: '🔪 Appels sortants', 
                    ABSYS: '🔪 Appels perdus' 
                  };
                  return [value, labels[name] || name];
                }}
                labelFormatter={(index) => `Heure : ${halfHourSlots[index] || index}`}
                contentStyle={{
                  backgroundColor: 'rgba(10, 10, 10, 0.95)',
                  border: '2px solid rgba(255, 0, 0, 0.5)',
                  borderRadius: 6,
                  color: '#e0e0e0',
                  fontSize: 12,
                  fontFamily: '"Roboto", sans-serif',
                  boxShadow: '0 0 20px rgba(139, 0, 0, 0.5), 0 0 30px rgba(255, 0, 0, 0.4)',
                }}
              />

              <ReferenceArea
                x1={lunchStartIndex}
                x2={lunchEndIndex}
                y1={0}
                y2="dataMax"
                fill="#8b0000"
                fillOpacity={0.1}
                stroke="rgba(255, 0, 0, 0.6)"
                strokeOpacity={0.7}
                strokeDasharray="4 4"
              />
              <ReferenceLine x={lunchStartIndex} stroke="#8b0000" strokeWidth={2} strokeDasharray="6 4" />
              <ReferenceLine x={lunchEndIndex} stroke="#8b0000" strokeWidth={2} strokeDasharray="6 4" />
              <CustomLabel fill="#8b0000" />

              <Bar 
                dataKey="CDS_IN" 
                name="Appels entrants" 
                fill="#8b0000"
                label={renderCustomLabel} 
                radius={[4, 4, 0, 0]} 
                style={{ animation: 'bar-rise-friday 1.2s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }} 
              />
              <Bar 
                dataKey="CDS_OUT" 
                name="Appels sortants" 
                fill="#ff0000"
                label={renderCustomLabel} 
                radius={[4, 4, 0, 0]} 
                style={{ animation: 'bar-rise-friday 1.2s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }} 
              />
              <Bar 
                dataKey="ABSYS" 
                name="Appels perdus" 
                fill="#c62828"
                label={renderCustomLabel} 
                radius={[4, 4, 0, 0]} 
                style={{ animation: 'bar-rise-friday 1.2s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }} 
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        <LegendComponent />
      </CardContent>

      <style>
        {`
          @keyframes bar-rise-friday {
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

          @keyframes pulse-friday {
            0% { 
              transform: scale(1); 
              box-shadow: 0 0 10px rgba(139, 0, 0, 0.6), 0 0 20px rgba(255, 0, 0, 0.4); 
            }
            100% { 
              transform: scale(1.04); 
              box-shadow: 0 0 20px rgba(139, 0, 0, 0.9), 0 0 30px rgba(255, 0, 0, 0.7), 0 0 40px rgba(139, 0, 0, 0.5); 
            }
          }

          @keyframes pulse-glow-friday {
            0%, 100% { box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7); }
            50% { box-shadow: 0 0 0 10px rgba(255, 0, 0, 0); }
          }

          @keyframes friday-drift {
            0% { transform: translateX(0) translateY(0); }
            50% { transform: translateX(-10%) translateY(-5%); }
            100% { transform: translateX(0) translateY(0); }
          }

          @keyframes friday-drift-reverse {
            0% { transform: translateX(0) translateY(0); }
            50% { transform: translateX(12%) translateY(3%); }
            100% { transform: translateX(0) translateY(0); }
          }

          @keyframes pulse-critical-friday {
            0% { transform: scale(1); box-shadow: 0 0 10px #c62828, 0 0 15px #b71c1c; }
            100% { transform: scale(1.05); box-shadow: 0 0 15px #b71c1c, 0 0 25px #8b0000; }
          }

          @keyframes color-shift-friday {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }

          @keyframes gradient-border-chart-friday {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
        `}
      </style>
    </Card>
  );
}

export default CallVolumeChart;