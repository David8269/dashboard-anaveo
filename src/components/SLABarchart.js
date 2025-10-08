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

const highlightAnimation = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.02); opacity: 0.9; }
  100% { transform: scale(1); opacity: 1; }
`;

// Couleurs fixes pour la légende et les barres
const INBOUND_COLOR = '#42A5F5'; // bleu
const OUTBOUND_COLOR = '#66BB6A'; // vert

const formatNumber = (num) => {
  if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
  return num.toString();
};

// Masque les labels "0"
const hideZeroLabels = (value) => {
  return value === 0 ? '' : formatNumber(value);
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
          animation: `${highlightAnimation} 0.6s ease-in-out`,
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
              <XAxis dataKey="dayLabel" stroke="#8884d8" tick={{ fill: '#fff' }} />
              <YAxis stroke="#8884d8" tick={{ fill: '#fff' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a2333',
                  border: '1px solid #333',
                  borderRadius: 8,
                  color: '#fff',
                }}
              />
              {/* 🔥 Légende personnalisée : carrés colorés + texte BLANC */}
              <Legend
                content={() => (
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, pt: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 12, height: 12, bgcolor: INBOUND_COLOR, borderRadius: '2px' }} />
                      <Typography variant="body2" sx={{ color: '#fff', fontWeight: 500 }}>
                        Inbound
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 12, height: 12, bgcolor: OUTBOUND_COLOR, borderRadius: '2px' }} />
                      <Typography variant="body2" sx={{ color: '#fff', fontWeight: 500 }}>
                        Outbound
                      </Typography>
                    </Box>
                  </Box>
                )}
              />

              {/* Inbound */}
              <Bar dataKey="inbound" name="Inbound" fill={INBOUND_COLOR} maxBarSize={80}>
                {data.map((entry, index) => (
                  <Cell key={`inbound-${index}`} fill={INBOUND_COLOR} />
                ))}
                <LabelList
                  dataKey="inbound"
                  position="top"
                  fill="#fff"
                  fontWeight="bold"
                  fontSize={14}
                  formatter={hideZeroLabels}
                />
              </Bar>

              {/* Outbound */}
              <Bar dataKey="outbound" name="Outbound" fill={OUTBOUND_COLOR} maxBarSize={80}>
                {data.map((entry, index) => (
                  <Cell key={`outbound-${index}`} fill={OUTBOUND_COLOR} />
                ))}
                <LabelList
                  dataKey="outbound"
                  position="top"
                  fill="#fff"
                  fontWeight="bold"
                  fontSize={14}
                  formatter={hideZeroLabels}
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