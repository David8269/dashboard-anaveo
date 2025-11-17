import React, { useState, useEffect, useRef } from 'react';
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
} from 'recharts';

const INBOUND_COLOR = '#F57C00'; // 🟠 Orange Material-UI
const OUTBOUND_COLOR = '#388E3C'; // 🟢 Vert forêt

const formatNumber = (num) => (num >= 1000 ? (num / 1000).toFixed(1) + 'k' : num.toString());

const hideZeroLabels = (value) => (value === 0 ? '' : formatNumber(value));

// ✅ Style mis à jour : fond orange pastel et bordure marron (comme l'horloge)
const cardStyle = {
  backgroundColor: 'rgba(255, 235, 220, 0.8)', // 🍊 Orange pastel (comme l'horloge)
  width: '100%',
  borderRadius: 3,
  border: '1px solid #8D6E63', // Bordure marron (comme l'horloge)
  boxShadow: '0 2px 6px rgba(141, 110, 99, 0.2)', // Ombre subtile (comme l'horloge)
  position: 'relative',
  overflow: 'hidden',
};

function SLABarchart({ slaData = [], wsConnected = false }) {
  const [data, setData] = useState([]);
  const [animate, setAnimate] = useState(false);
  const prevSlaDataRef = useRef([]);

  useEffect(() => {
    const prev = prevSlaDataRef.current;
    const hasChanged =
      prev.length !== slaData.length ||
      prev.some((d, i) => d.inbound !== slaData[i]?.inbound || d.outbound !== slaData[i]?.outbound);

    if (hasChanged) {
      setData(slaData);
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 500);
      return () => clearTimeout(timer);
    }

    prevSlaDataRef.current = slaData;
  }, [slaData]);

  if (data.length === 0) {
    return (
      <Card sx={cardStyle}>
        <CardContent>
          <Typography
            variant="overline"
            sx={{
              fontFamily: '"Playfair Display", serif',
              color: 'var(--wine-primary)',
              fontWeight: 'bold',
              fontSize: '1.3rem',
              zIndex: 2,
              position: 'relative',
            }}
          >
            📞 Volume d'appels par jour
          </Typography>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Chip
              label={wsConnected ? 'Aucune donnée disponible' : 'Connexion en cours...'}
              size="small"
              sx={{
                mb: 2,
                background: wsConnected
                  ? 'linear-gradient(135deg, #D32F2F, #B71C1C)'
                  : 'linear-gradient(135deg, var(--wine-primary), var(--wine-secondary))',
                color: 'white',
                fontWeight: 'bold',
              }}
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
        ...cardStyle,
        ...(animate && {
          boxShadow: '0 6px 16px rgba(141, 110, 99, 0.3)',
        }),
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography
            variant="overline"
            sx={{
              fontFamily: '"Playfair Display", serif',
              color: 'var(--wine-primary)',
              fontWeight: 'bold',
              fontSize: '1.3rem',
              zIndex: 2,
              position: 'relative',
            }}
          >
            📞 Volume d'appels par jour
          </Typography>
          <Chip
            label={wsConnected ? '🟢 En direct' : '🔴 Déconnecté'}
            size="small"
            sx={{
              background: wsConnected
                ? 'linear-gradient(135deg, #388E3C, #2E7D32)'
                : 'linear-gradient(135deg, #D32F2F, #B71C1C)',
              color: 'white',
              fontWeight: 'bold',
            }}
          />
        </Box>

        <ResponsiveContainer width="100%" height={400} sx={{ zIndex: 2, position: 'relative' }}>
          <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" opacity={0.6} />

            <XAxis
              dataKey="dayLabel"
              stroke="var(--wine-accent)"
              tick={{
                fill: 'var(--wine-text)',
                fontSize: 15,
                fontWeight: 'bold',
                fontFamily: '"Roboto", sans-serif',
              }}
            />

            <YAxis
              stroke="var(--wine-accent)"
              tick={{
                fill: 'var(--wine-text)',
                fontSize: 15,
                fontWeight: 'bold',
                fontFamily: '"Roboto", sans-serif',
              }}
              tickFormatter={hideZeroLabels}
            />

            <Tooltip
              formatter={(value, name) => {
                const labels = { inbound: 'Appels entrants', outbound: 'Appels sortants' };
                return [formatNumber(value), labels[name] || name];
              }}
              labelFormatter={(label) => `Jour : ${label}`}
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid var(--wine-accent)',
                borderRadius: 6,
                color: 'var(--wine-text)',
                fontSize: 12,
                fontFamily: '"Roboto", sans-serif',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
            />

            <Bar 
              dataKey="inbound" 
              name="Appels entrants" 
              fill={INBOUND_COLOR} 
              maxBarSize={160}
              animationDuration={800}
            >
              <LabelList
                dataKey="inbound"
                position="top"
                fill={INBOUND_COLOR}
                fontWeight="bold"
                fontSize={15}
                formatter={hideZeroLabels}
                fontFamily='"Roboto", sans-serif'
              />
            </Bar>

            <Bar 
              dataKey="outbound" 
              name="Appels sortants" 
              fill={OUTBOUND_COLOR} 
              maxBarSize={160}
              animationDuration={800}
            >
              <LabelList
                dataKey="outbound"
                position="top"
                fill={OUTBOUND_COLOR}
                fontWeight="bold"
                fontSize={15}
                formatter={hideZeroLabels}
                fontFamily='"Roboto", sans-serif'
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, pt: 1, zIndex: 2, position: 'relative' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 14, height: 14, bgcolor: INBOUND_COLOR, borderRadius: '2px' }} />
            <Typography variant="body2" sx={{ color: INBOUND_COLOR, fontWeight: 'bold', fontFamily: '"Roboto", sans-serif' }}>
              📞 Appels entrants
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 14, height: 14, bgcolor: OUTBOUND_COLOR, borderRadius: '2px' }} />
            <Typography variant="body2" sx={{ color: OUTBOUND_COLOR, fontWeight: 'bold', fontFamily: '"Roboto", sans-serif' }}>
              📞 Appels sortants
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default SLABarchart;