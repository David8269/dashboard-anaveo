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
    <text x="49.5%" y={25} fill={fill} fontSize={14} textAnchor="middle" fontWeight="bold" fontFamily='"Roboto", sans-serif'>
      🍕🍟🍔 LUNCH BREAK 🍔🍟🍕
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
    color: '#5D4037',
  };
  const squareStyle = (color) => ({ 
    width: 14,
    height: 14, 
    backgroundColor: color, 
    borderRadius: 2,
  });
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, py: 0.5 }}>
      <div style={itemStyle}>
        <span style={squareStyle('#F57C00')}></span> 📞 Inbound Calls
      </div>
      <div style={itemStyle}>
        <span style={squareStyle('#388E3C')}></span> 📞 Outbound Calls
      </div>
      <div style={itemStyle}>
        <span style={squareStyle('#D32F2F')}></span> ❌ Overflow Calls
      </div>
    </Box>
  );
}

const renderCustomLabel = ({ x, y, width, value, dataKey }) => {
  if (!value || value <= 0) return null;
  const isAbsysCritical = dataKey === 'ABSYS' && value > 5;
  const labelColor = isAbsysCritical ? '#D32F2F' : '#5D4037';

  return (
    <text
      x={x + width / 2}
      y={y - 6}
      fill={labelColor}
      textAnchor="middle"
      fontSize={10}
      fontWeight="bold"
      fontFamily='"Roboto", sans-serif'
    >
      {value}
    </text>
  );
};

// ✅ Style mis à jour : fond orange pastel + transparence accrue
const cardStyle = {
  backgroundColor: 'rgba(255, 235, 220, 0.8)', // 🍊 Orange crème pastel (80% opacité)
  borderRadius: 3,
  border: '1px solid #8D6E63', // Bordure marron automnale
  boxShadow: '0 4px 12px rgba(141, 110, 99, 0.2)', // Ombre cohérente
  position: 'relative',
  overflow: 'hidden',
};

function CallVolumeChart({ callVolumes = [], wsConnected = false, halfHourSlots = [] }) {
  const data = useMemo(() => 
    callVolumes.map((item, index) => ({ ...item, index })), 
    [callVolumes]
  );

  if (callVolumes.length === 0) {
    return (
      <Card sx={cardStyle}>
        <CardContent sx={{ p: 1 }}>
          <Typography
            variant="overline"
            sx={{
              fontFamily: '"Roboto", sans-serif',
              color: '#5D4037',
              fontWeight: 'bold',
              fontSize: '1.1rem',
            }}
          >
            📞 Call Volume
          </Typography>
          <Box sx={{ textAlign: 'center', py: 1, mt: 2 }}>
            <Chip
              label={wsConnected ? 'Aucune donnée disponible' : 'Connexion en cours...'}
              size="small"
              sx={{
                mb: 1,
                background: wsConnected 
                  ? 'linear-gradient(135deg, #D32F2F, #B71C1C)' 
                  : 'linear-gradient(135deg, #8D6E63, #5D4037)',
                color: 'white',
                fontWeight: 'bold',
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
    <Card sx={cardStyle}>
      <CardContent sx={{ p: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography
            variant="overline"
            sx={{
              fontFamily: '"Roboto", sans-serif',
              color: '#5D4037',
              fontWeight: 'bold',
              fontSize: '1.1rem',
            }}
          >
            📞 Call Volume
          </Typography>
          <Chip
            label={wsConnected ? '🟢 Live' : '🔴 Offline'}
            size="small"
            sx={{
              fontSize: 12,
              background: wsConnected 
                ? 'linear-gradient(135deg, #388E3C, #2E7D32)' 
                : 'linear-gradient(135deg, #D32F2F, #B71C1C)',
              color: 'white',
              fontWeight: 'bold',
            }}
          />
        </Box>

        <Box sx={{ width: '100%', height: 250, mt: 1.5 }} aria-label="Graphique des volumes d'appels">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 15, left: 15, bottom: 40 }}
              barSize={18}
              stackOffset="none"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" opacity={0.6} />

              <XAxis
                dataKey="index"
                tick={{ 
                  fill: '#5D4037', 
                  fontSize: 13,
                  fontWeight: 'bold',
                  fontFamily: '"Roboto", sans-serif',
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
                stroke="#8D6E63"
                tick={{ 
                  fill: '#5D4037', 
                  fontSize: 13,
                  fontWeight: 'bold',
                  fontFamily: '"Roboto", sans-serif',
                }}
                domain={[0, domainMax]}
                tickCount={tickCount}
                allowDecimals={false}
              />

              <Tooltip
                formatter={(value, name) => {
                  const labels = { CDS_IN: 'Appels entrants', CDS_OUT: 'Appels sortants', ABSYS: 'Appels perdus' };
                  return [value, labels[name] || name];
                }}
                labelFormatter={(index) => `Heure : ${halfHourSlots[index] || index}`}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #8D6E63',
                  borderRadius: 6,
                  color: '#5D4037',
                  fontSize: 12,
                  fontFamily: '"Roboto", sans-serif',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
              />

              <ReferenceArea
                x1={lunchStartIndex}
                x2={lunchEndIndex}
                y1={0}
                y2="dataMax"
                fill="#8D6E63"
                fillOpacity={0.1}
                stroke="#8D6E63"
                strokeOpacity={0.6}
                strokeDasharray="4 4"
              />
              <ReferenceLine x={lunchStartIndex} stroke="#8D6E63" strokeWidth={1.5} strokeDasharray="6 4" />
              <ReferenceLine x={lunchEndIndex} stroke="#8D6E63" strokeWidth={1.5} strokeDasharray="6 4" />
              <CustomLabel fill="#5D4037" />

              <Bar 
                dataKey="CDS_IN" 
                name="Appels entrants" 
                fill="#F57C00"  // 🟠 Changé ici : orange Material
                label={renderCustomLabel} 
                radius={[4, 4, 0, 0]} 
              />
              <Bar 
                dataKey="CDS_OUT" 
                name="Appels sortants" 
                fill="#388E3C" 
                label={renderCustomLabel} 
                radius={[4, 4, 0, 0]} 
              />
              <Bar 
                dataKey="ABSYS" 
                name="Appels perdus" 
                fill="#D32F2F" 
                label={renderCustomLabel} 
                radius={[4, 4, 0, 0]} 
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