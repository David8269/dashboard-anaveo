import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  LabelList,
  ResponsiveContainer,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import { keyframes } from '@emotion/react';

// ✅ Animation définie avec keyframes
const highlightAnimation = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.02); opacity: 0.9; }
  100% { transform: scale(1); opacity: 1; }
`;

// 🎨 Fonction de couleur
const getBarColor = (value, type) => {
  if (type === 'inbound') {
    if (value > 50) return '#f44336';
    if (value > 20) return '#ff9800';
    return '#42A5F5';
  } else if (type === 'outbound') {
    if (value > 50) return '#d32f2f';
    if (value > 20) return '#ffa726';
    return '#66BB6A';
  }
  return '#8884d8';
};

// 📊 Formatteur de nombres (optionnel)
const formatNumber = (num) => {
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
};

function SLABarchart({ slaData = [], wsConnected = false }) {
  const [data, setData] = useState([]);
  const [animate, setAnimate] = useState(false);
  const prevSlaDataRef = useRef();

  useEffect(() => {
    const prev = prevSlaDataRef.current;

    if (JSON.stringify(slaData) !== JSON.stringify(prev)) {
      setData(slaData);
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 600);
      return () => clearTimeout(timer);
    }

    prevSlaDataRef.current = slaData;
  }, [slaData]);

  const inboundColors = useMemo(() => data.map(entry => getBarColor(entry.inbound, 'inbound')), [data]);
  const outboundColors = useMemo(() => data.map(entry => getBarColor(entry.outbound, 'outbound')), [data]);

  // 🟡 Affichage placeholder
  if (data.length === 0) {
    return (
      <Card sx={{ backgroundColor: 'background.paper', maxWidth: 1150, width: '100%', borderRadius: 3 }}>
        <CardContent>
          <Typography variant="overline" color="text.secondary" gutterBottom>
            NUMBER OF CALLS
          </Typography>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Chip
              label={wsConnected ? "Aucune donnée disponible" : "Connexion en cours..."}
              color={wsConnected ? "warning" : "info"}
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
    <Card
      sx={{
        backgroundColor: 'background.paper',
        maxWidth: 1150,
        width: '100%',
        borderRadius: 3,
        ...(animate && {
          animation: `0.6s ease-in-out ${highlightAnimation}`,
        }),
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="overline" color="text.secondary">
            NUMBER OF CALLS
          </Typography>
          <Chip label="🟢 Live" size="small" color="success" />
        </Box>
        <div aria-label="Graphique à barres du nombre d'appels entrants et sortants">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2f3a49" />
              <XAxis dataKey="date" stroke="#8884d8" tick={{ fill: '#fff' }} />
              <YAxis stroke="#8884d8" tick={{ fill: '#fff' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a2333',
                  border: '1px solid #333',
                  borderRadius: 8,
                  color: '#fff',
                }}
              />
              <Legend wrapperStyle={{ color: '#fff', paddingTop: 10 }} />
              <Bar dataKey="inbound" name="Inbound" maxBarSize={80}>
                {data.map((entry, index) => (
                  <Cell key={`inbound-${index}`} fill={inboundColors[index]} />
                ))}
                <LabelList
                  dataKey="inbound"
                  position="top"
                  fill="#fff"
                  fontWeight="bold"
                  fontSize={14}
                  formatter={formatNumber} // ← Format court
                />
              </Bar>
              <Bar dataKey="outbound" name="Outbound" maxBarSize={80}>
                {data.map((entry, index) => (
                  <Cell key={`outbound-${index}`} fill={outboundColors[index]} />
                ))}
                <LabelList
                  dataKey="outbound"
                  position="top"
                  fill="#fff"
                  fontWeight="bold"
                  fontSize={14}
                  formatter={formatNumber} // ← Format court
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default SLABarchart;