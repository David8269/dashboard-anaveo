import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  useTheme,
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
    <text x="50%" y={25} fill={fill} fontSize={12} textAnchor="middle" fontWeight="bold">
      Lunch break
    </text>
  );
}

// ✅ Légende séparée, placée en dessous du graphique
function LegendComponent() {
  const itemStyle = { 
    display: 'flex', 
    alignItems: 'center', 
    gap: 6, 
    fontWeight: 'bold', 
    fontSize: 12, // ← réduit de 14 à 12
    color: '#fff' 
  };
  const squareStyle = (color) => ({ 
    width: 14,  // ← réduit de 16 à 14
    height: 14, 
    backgroundColor: color, 
    borderRadius: 2 
  });
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, py: 0.5 }}>
      <div style={itemStyle}>
        <span style={squareStyle('#42A5F5')}></span> CDS In
      </div>
      <div style={itemStyle}>
        <span style={squareStyle('#66BB6A')}></span> CDS Out
      </div>
      <div style={itemStyle}>
        <span style={squareStyle('#EF5350')}></span> Absys
      </div>
    </Box>
  );
}

const renderCustomLabel = (props) => {
  const { y, value } = props;
  if (value === 0) return null;
  return (
    <text
      x={props.x + props.width / 2}
      y={y - 6}
      fill="#fff"
      textAnchor="middle"
      fontSize={10} // ← réduit de 12 à 10
      fontWeight="bold"
    >
      {value}
    </text>
  );
};

function CallVolumeChart({ callVolumes = [], wsConnected = false, halfHourSlots = [] }) {
  const theme = useTheme();

  const data = useMemo(() => 
    callVolumes.map((item, index) => ({ ...item, index })), 
    [callVolumes]
  );

  if (callVolumes.length === 0) {
    return (
      <Card sx={{ backgroundColor: 'background.paper', borderRadius: 3 }}>
        <CardContent sx={{ p: 1 }}> {/* ← réduit le padding */}
          <Typography variant="overline" color="text.secondary" gutterBottom>
            Call Volume
          </Typography>
          <Box sx={{ textAlign: 'center', py: 1 }}>
            <Chip
              label={wsConnected ? 'No data received' : 'Connecting...'}
              color={wsConnected ? 'warning' : 'info'}
              size="small"
              sx={{ mb: 1 }}
            />
            <Skeleton variant="rectangular" width="100%" height={200} /> {/* ← réduit */}
          </Box>
        </CardContent>
      </Card>
    );
  }

  // ✅ Sécuriser le calcul de maxY
  const maxY = data.reduce((max, d) => {
    const currentMax = Math.max(d.CDS_IN || 0, d.CDS_OUT || 0, d.ABSYS || 0);
    return currentMax > max ? currentMax : max;
  }, 0);

  const yMax = Math.max(1, isNaN(maxY) ? 1 : maxY);
  const domainMax = Math.ceil(yMax * 1.3);
  const tickCount = Math.min(6, domainMax + 1);

  return (
    <Card sx={{ backgroundColor: 'background.paper', borderRadius: 3 }}>
      <CardContent sx={{ p: 1 }}> {/* ← padding réduit pour gagner de la hauteur */}

        {/* Titre + état Live */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
          <Typography variant="overline" color="text.secondary" fontSize={12}>
            Call Volume
          </Typography>
          <Chip
            label={wsConnected ? '🟢 Live' : '🔴 Disconnected'}
            size="small"
            color={wsConnected ? 'success' : 'error'}
            sx={{ fontSize: 12 }}
          />
        </Box>

        {/* Graphique */}
        <div style={{ width: '100%', height: 250 }} aria-label="Graphique des volumes d'appels">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 15, left: 15, bottom: 5 }} // ← marges réduites
              barSize={18} // ← légèrement réduit pour compacité
              stackOffset="none"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2f3a49" />

              <XAxis
                dataKey="index"
                tick={{ fill: '#fff', fontSize: 11 }} // ← police réduite
                tickFormatter={(index) => {
                  const time = halfHourSlots[index] || '';
                  if (time.endsWith(':30')) return time.replace(':30', 'h30');
                  if (time.endsWith(':00')) return time.replace(':00', 'h');
                  return time;
                }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={30} // ← réduit de 40 à 30
                tickMargin={3}
              />

              <YAxis
                stroke="#8884d8"
                tick={{ fill: '#fff', fontSize: 11 }}
                domain={[0, domainMax]}
                tickCount={tickCount}
                allowDecimals={false}
              />

              <Tooltip
                formatter={(value, name) => {
                  const labels = { CDS_IN: 'CDS In', CDS_OUT: 'CDS Out', ABSYS: 'Absys' };
                  return [value, labels[name] || name];
                }}
                labelFormatter={(index) => `Time: ${halfHourSlots[index] || index}`}
                contentStyle={{
                  backgroundColor: '#2c3e50',
                  border: 'none',
                  borderRadius: 4,
                  color: '#fff',
                  fontSize: 12,
                }}
              />

              <ReferenceArea
                x1={lunchStartIndex}
                x2={lunchEndIndex}
                y1={0}
                y2="dataMax"
                fill="#FF0000"
                fillOpacity={0.15}
                stroke="#b30000"
                strokeOpacity={0.6}
              />
              <ReferenceLine x={lunchStartIndex} stroke="#b30000" strokeWidth={1} />
              <ReferenceLine x={lunchEndIndex} stroke="#b30000" strokeWidth={1} />
              <CustomLabel fill={theme.palette.text.secondary} />

              <Bar dataKey="CDS_IN" name="CDS In" fill="#42A5F5" label={renderCustomLabel} radius={[4, 4, 0, 0]} />
              <Bar dataKey="CDS_OUT" name="CDS Out" fill="#66BB6A" label={renderCustomLabel} radius={[4, 4, 0, 0]} />
              <Bar dataKey="ABSYS" name="Absys" fill="#EF5350" label={renderCustomLabel} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ✅ Légende placée EN DEHORS du graphique */}
        <LegendComponent />

      </CardContent>
    </Card>
  );
}

export default CallVolumeChart;