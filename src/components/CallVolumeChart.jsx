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
    <text x="50%" y={25} fill={fill} fontSize={14} textAnchor="middle" fontWeight="bold" fontFamily='"Nosifer", cursive'>
     LUNCH BREAK
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
    color: '#ffd700',
    textShadow: '0 0 6px rgba(255,215,0,0.6)',
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
        <span style={squareStyle('#ff6b00')}></span> 📞 CDS In
      </div>
      <div style={itemStyle}>
        <span style={squareStyle('#01b68a')}></span> 🎃 CDS Out
      </div>
      <div style={itemStyle}>
        <span style={squareStyle('#ff0a0a')}></span> 👻 Absys
      </div>
    </Box>
  );
}

const renderCustomLabel = (props) => {
  const { x, y, width, value, dataKey } = props;
  if (!value || value <= 0) return null;

  const isAbsysCritical = dataKey === 'ABSYS' && value > 5;
  const labelColor = isAbsysCritical ? '#ff6b00' : '#fff';

  return (
    <text
      x={x + width / 2}
      y={y - 6}
      fill={labelColor}
      textAnchor="middle"
      fontSize={10}
      fontWeight="bold"
      className={isAbsysCritical ? 'flame-text' : ''}
      style={{ 
        fontFamily: isAbsysCritical ? '"Orbitron", sans-serif' : 'inherit',
        filter: isAbsysCritical ? 'drop-shadow(0 0 4px #ff6b00)' : 'none',
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
          backgroundColor: 'var(--halloween-paper, #1a0a2e)',
          borderRadius: 3,
          border: '1px solid var(--halloween-primary, #ff6b00)',
          boxShadow: '0 0 15px rgba(255, 107, 0, 0.3)',
          backdropFilter: 'blur(4px)',
        }}
      >
        <CardContent sx={{ p: 1 }}>
          <Typography
            variant="overline"
            sx={{
              fontFamily: '"Nosifer", cursive',
              color: '#ff6b00',
              textShadow: '0 0 8px rgba(255,107,0,0.7)',
              fontSize: '1.1rem',
            }}
          >
            📞 Call Volume
          </Typography>
          <Box sx={{ textAlign: 'center', py: 1, mt: 2 }}>
            <Chip
              label={wsConnected ? '🕸️ No data in the cauldron' : '🔮 Connecting to spirits...'}
              size="small"
              sx={{
                mb: 1,
                background: wsConnected 
                  ? 'linear-gradient(135deg, #d32f2f, #b71c1c)' 
                  : 'linear-gradient(135deg, #ff8c00, #ff4500)',
                color: 'white',
                fontFamily: '"Nosifer", cursive',
              }}
            />
            <Skeleton variant="rectangular" width="100%" height={200} />
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
    <Card
      sx={{
        backgroundColor: 'var(--halloween-paper, #1a0a2e)',
        borderRadius: 3,
        border: '1px solid var(--halloween-primary, #ff6b00)',
        boxShadow: '0 0 15px rgba(255, 107, 0, 0.3)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <CardContent sx={{ p: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography
            variant="overline"
            sx={{
              fontFamily: '"Nosifer", cursive',
              color: '#ff6b00',
              textShadow: '0 0 8px rgba(255,107,0,0.7)',
              fontSize: '1.1rem',
            }}
          >
            📞 Call Volume
          </Typography>
          <Chip
            label={wsConnected ? '🟢 Live' : '🔴 Disconnected'}
            size="small"
            sx={{
              fontSize: 12,
              background: wsConnected 
                ? 'linear-gradient(135deg, #01b68a, #00897b)' 
                : 'linear-gradient(135deg, #d32f2f, #b71c1c)',
              color: 'white',
              fontWeight: 'bold',
            }}
          />
        </Box>

        {/* ✅ Graphique descendu légèrement avec mt: 1.5 */}
        <Box
          sx={{
            width: '100%',
            height: 250,
            mt: 1.5, // ← descendre un peu plus
          }}
          aria-label="Graphique des volumes d'appels"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 15, left: 15, bottom: 40 }}
              barSize={18}
              stackOffset="none"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#4a148c" opacity={0.4} />

              <XAxis
                dataKey="index"
                tick={{ 
                  fill: '#ffd700', 
                  fontSize: 11, 
                  textShadow: '0 0 4px rgba(255,215,0,0.5)',
                  fontFamily: '"Orbitron", sans-serif',
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
                height={30}
                tickMargin={10}
              />

              <YAxis
                stroke="#8a2be2"
                tick={{ 
                  fill: '#ffd700', 
                  fontSize: 11,
                  fontFamily: '"Orbitron", sans-serif',
                }}
                domain={[0, domainMax]}
                tickCount={tickCount}
                allowDecimals={false}
              />

              <Tooltip
                formatter={(value, name) => {
                  const labels = { 
                    CDS_IN: '📞 CDS In', 
                    CDS_OUT: '🎃 CDS Out', 
                    ABSYS: '👻 Absys' 
                  };
                  return [value, labels[name] || name];
                }}
                labelFormatter={(index) => `Time: ${halfHourSlots[index] || index}`}
                contentStyle={{
                  backgroundColor: '#1a0a2e',
                  border: '1px solid #ff6b00',
                  borderRadius: 6,
                  color: '#ffd700',
                  fontSize: 12,
                  fontFamily: '"Orbitron", sans-serif',
                  boxShadow: '0 0 12px rgba(255, 107, 0, 0.5)',
                }}
              />

              <ReferenceArea
                x1={lunchStartIndex}
                x2={lunchEndIndex}
                y1={0}
                y2="dataMax"
                fill="#8a2be2"
                fillOpacity={0.2}
                stroke="#ffd700"
                strokeOpacity={0.8}
                strokeDasharray="4 4"
              />
              <ReferenceLine 
                x={lunchStartIndex} 
                stroke="#ffd700"
                strokeWidth={2}
                strokeDasharray="6 4"
              />
              <ReferenceLine 
                x={lunchEndIndex} 
                stroke="#ffd700"
                strokeWidth={2}
                strokeDasharray="6 4"
              />
              <CustomLabel fill="#ffd700" />

              <Bar 
                dataKey="CDS_IN" 
                name="CDS In" 
                fill="#ff6b00" 
                label={renderCustomLabel} 
                radius={[4, 4, 0, 0]}
                style={{
                  animation: 'bar-flame-rise 1.2s cubic-bezier(0.2, 0.8, 0.4, 1) forwards',
                }}
              />
              <Bar 
                dataKey="CDS_OUT" 
                name="CDS Out" 
                fill="#01b68a" 
                label={renderCustomLabel} 
                radius={[4, 4, 0, 0]}
                style={{
                  animation: 'bar-flame-rise 1.2s cubic-bezier(0.2, 0.8, 0.4, 1) forwards',
                }}
              />
              <Bar 
                dataKey="ABSYS" 
                name="Absys" 
                fill="#ff0a0a" 
                label={renderCustomLabel} 
                radius={[4, 4, 0, 0]}
                style={{
                  animation: 'bar-flame-rise 1.2s cubic-bezier(0.2, 0.8, 0.4, 1) forwards',
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        <LegendComponent />
      </CardContent>
    </Card>
  );
}

export default CallVolumeChart;