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
  LabelList,
  ResponsiveContainer,
  Tooltip,
  Legend,
  ReferenceArea,
  ReferenceLine,
} from 'recharts';

// Définition des index pour la pause déjeuner
const lunchStartIndex = 8;
const lunchEndIndex = 11;

// Composant Label personnalisé pour la pause
function CustomLabel({ fill }) {
  return (
    <text x="51%" y={40} fill={fill} fontSize={14} textAnchor="middle">
      Pause déjeuner
    </text>
  );
}

// Label personnalisé pour CDS (masqué pendant la pause)
function CustomCDSLabel({ x, y, width, value, index }) {
  if (index >= lunchStartIndex && index <= lunchEndIndex) return null;
  return (
    <text x={x + width / 2} y={y - 6} fill="#fff" fontSize={12} fontWeight="bold" textAnchor="middle">
      {value}
    </text>
  );
}

// Transformation des données : masque CDS pendant la pause
function getModifiedData(data) {
  return data.map((item, index) => {
    if (index >= lunchStartIndex && index <= lunchEndIndex) {
      return { ...item, CDS: 0, index };
    }
    return { ...item, index };
  });
}

// Légende personnalisée
function CustomLegend() {
  const style = { display: 'flex', justifyContent: 'center', gap: 20, marginTop: 10 };
  const itemStyle = { display: 'flex', alignItems: 'center', gap: 6, fontWeight: 'bold', fontSize: 14, color: '#fff' };
  const squareStyle = (color) => ({ width: 16, height: 16, backgroundColor: color, borderRadius: 3 });
  return (
    <div style={style}>
      <div style={itemStyle}><span style={squareStyle('#42A5F5')}></span> CDS</div>
      <div style={itemStyle}><span style={squareStyle('#EF5350')}></span> Absys</div>
    </div>
  );
}

function CallVolumeChart({ callVolumes = [], wsConnected = false }) {
  const theme = useTheme();

  // ✅ Memoïsation pour éviter les recalculs inutiles
  const modifiedData = useMemo(() => getModifiedData(callVolumes), [callVolumes]);

  // 🟡 Affichage placeholder si aucune donnée
  if (callVolumes.length === 0) {
    return (
      <Card sx={{ backgroundColor: 'background.paper', borderRadius: 3 }}>
        <CardContent>
          <Typography variant="overline" color="text.secondary" gutterBottom>
            Call Volume (Live)
          </Typography>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Chip
              label={wsConnected ? 'Aucune donnée reçue' : 'Connexion en cours...'}
              color={wsConnected ? 'warning' : 'info'}
              size="small"
              sx={{ mb: 2 }}
            />
            <Skeleton variant="rectangular" width="100%" height={350} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ backgroundColor: 'background.paper', borderRadius: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="overline" color="text.secondary">
            Call Volume (Live)
          </Typography>
          <Chip
            label={wsConnected ? '🟢 Connecté' : '🔴 Déconnecté'}
            size="small"
            color={wsConnected ? 'success' : 'error'}
          />
        </Box>
        <div style={{ width: '100%', height: 450 }} aria-label="Graphique des volumes d'appels">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={modifiedData} margin={{ top: 60, right: 30, left: 0, bottom: 100 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2f3a49" />
              <XAxis
                dataKey="index"
                tick={{ fill: '#fff' }}
                tickFormatter={(index) => modifiedData[index]?.time || `Heure ${index}`}
                interval={0}
              />
              <YAxis stroke="#8884d8" tick={{ fill: '#fff' }} />
              <Tooltip labelFormatter={(value) => modifiedData[value]?.time || `Heure ${value}`} />
              <Legend content={<CustomLegend />} />
              <ReferenceArea
                x1={lunchStartIndex}
                x2={lunchEndIndex}
                y1={0}
                y2="dataMax"
                fill="#FF0000"
                fillOpacity={0.2}
                stroke="#b30000"
                strokeOpacity={0.8}
              />
              <ReferenceLine x={lunchStartIndex} stroke="#b30000" strokeWidth={2} />
              <ReferenceLine x={lunchEndIndex} stroke="#b30000" strokeWidth={2} />
              <CustomLabel fill={theme.palette.text.secondary} />
              <Bar dataKey="CDS" fill="#42A5F5">
                <LabelList dataKey="CDS" content={CustomCDSLabel} />
              </Bar>
              <Bar dataKey="Absys" fill="#EF5350">
                <LabelList dataKey="Absys" position="top" fill="#fff" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default CallVolumeChart;