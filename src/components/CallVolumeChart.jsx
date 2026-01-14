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
    <text x="49.5%" y={25} fill={fill} fontSize={14} textAnchor="middle" fontWeight="bold" fontFamily='"Orbitron", sans-serif'>
<<<<<<< HEAD
      ⛷️ Départ de la descente ⛷️
=======
      🥂 Champagne ! 🥂
>>>>>>> 861fb5a0d3729959038e5eb57b4a15dfa2298129
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
<<<<<<< HEAD
    color: '#00bfff',
    textShadow: '0 0 4px rgba(0,168,232,0.6)',
=======
    color: '#ffd700',
    textShadow: '0 0 4px rgba(212,175,55,0.6)',
>>>>>>> 861fb5a0d3729959038e5eb57b4a15dfa2298129
  };
  const squareStyle = (color) => ({ 
    width: 14,
    height: 14, 
    backgroundColor: color, 
    borderRadius: 2,
    boxShadow: `0 0 4px ${color}`,
  });
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, py: 0.5 }}>
      <div style={itemStyle}>
<<<<<<< HEAD
        <span style={squareStyle('#00a8e8')}></span> ⛷️ CDS_IN
      </div>
      <div style={itemStyle}>
        <span style={squareStyle('#2e8b57')}></span> 🚠 CDS_OUT
      </div>
      <div style={itemStyle}>
        <span style={squareStyle('#8b0000')}></span> ❄️ Absys
=======
        <span style={squareStyle('#d4af37')}></span> 📞 Inbound Calls
      </div>
      <div style={itemStyle}>
        <span style={squareStyle('#2e8b57')}></span> 📞 Outbound Calls
      </div>
      <div style={itemStyle}>
        <span style={squareStyle('#8b0000')}></span> ⚠️ Overflow Calls
>>>>>>> 861fb5a0d3729959038e5eb57b4a15dfa2298129
      </div>
    </Box>
  );
}

const renderCustomLabel = ({ x, y, width, value, dataKey }) => {
  if (!value || value <= 0) return null;
  const isAbsysCritical = dataKey === 'ABSYS' && value > 5;
<<<<<<< HEAD
  const labelColor = isAbsysCritical ? '#00bfff' : '#ffffff';
=======
  const labelColor = isAbsysCritical ? '#ffd700' : '#ffffff';
>>>>>>> 861fb5a0d3729959038e5eb57b4a15dfa2298129

  return (
    <text
      x={x + width / 2}
      y={y - 6}
      fill={labelColor}
      textAnchor="middle"
      fontSize={10}
      fontWeight="bold"
<<<<<<< HEAD
      fontFamily={isAbsysCritical ? '"Montserrat", sans-serif' : 'inherit'}
      style={{
        animation: isAbsysCritical ? 'pulse-blue 2s infinite alternate' : 'none',
        filter: isAbsysCritical ? 'drop-shadow(0 0 6px #00bfff)' : 'none',
=======
      fontFamily={isAbsysCritical ? '"Great Vibes", cursive' : 'inherit'}
      style={{
        animation: isAbsysCritical ? 'pulse-gold 2s infinite alternate' : 'none',
        filter: isAbsysCritical ? 'drop-shadow(0 0 6px #ffd700)' : 'none',
>>>>>>> 861fb5a0d3729959038e5eb57b4a15dfa2298129
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
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          borderRadius: 3,
<<<<<<< HEAD
          border: '1px solid rgba(0, 168, 232, 0.7)',
          boxShadow: '0 0 15px rgba(0, 168, 232, 0.5)',
=======
          border: '1px solid rgba(212, 175, 55, 0.7)',
          boxShadow: '0 0 15px rgba(212, 175, 55, 0.5)',
>>>>>>> 861fb5a0d3729959038e5eb57b4a15dfa2298129
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
<<<<<<< HEAD
          background: 'radial-gradient(circle at 40% 50%, rgba(0,168,232,0.08), transparent 70%)',
          animation: 'blue-drift 22s linear infinite',
=======
          background: 'radial-gradient(circle at 40% 50%, rgba(212,175,55,0.08), transparent 70%)',
          animation: 'gold-drift 22s linear infinite',
>>>>>>> 861fb5a0d3729959038e5eb57b4a15dfa2298129
          pointerEvents: 'none',
          zIndex: 0,
        }} />
        <CardContent sx={{ p: 1, position: 'relative', zIndex: 1 }}>
          <Typography
            variant="overline"
            sx={{
<<<<<<< HEAD
              fontFamily: '"Montserrat", sans-serif',
              color: '#00a8e8',
              textShadow: '0 0 8px rgba(0,168,232,0.8)',
              fontSize: '1.2rem',
            }}
          >
            📊 Volume des descentes
          </Typography>
          <Box sx={{ textAlign: 'center', py: 1, mt: 2 }}>
            <Chip
              label={wsConnected ? '❄️ Aucune descente enregistrée' : '🏂 Connexion à la station...'}
=======
              fontFamily: '"Great Vibes", cursive',
              color: '#d4af37',
              textShadow: '0 0 8px rgba(212,175,55,0.8)',
              fontSize: '1.2rem',
            }}
          >
            📊 Volume d'appels
          </Typography>
          <Box sx={{ textAlign: 'center', py: 1, mt: 2 }}>
            <Chip
              label={wsConnected ? '✨ Aucun appel enregistré' : '🥂 Connexion au gala...'}
>>>>>>> 861fb5a0d3729959038e5eb57b4a15dfa2298129
              size="small"
              sx={{
                mb: 1,
                background: wsConnected 
                  ? 'linear-gradient(135deg, #8b0000, #000)' 
<<<<<<< HEAD
                  : 'linear-gradient(135deg, #000, #1a365d)',
                color: '#00bfff',
                fontFamily: '"Montserrat", sans-serif',
                animation: wsConnected ? 'none' : 'pulse-blue 2s infinite alternate',
=======
                  : 'linear-gradient(135deg, #000, #333)',
                color: '#ffd700',
                fontFamily: '"Great Vibes", cursive',
                animation: wsConnected ? 'none' : 'pulse-gold 2s infinite alternate',
>>>>>>> 861fb5a0d3729959038e5eb57b4a15dfa2298129
              }}
            />
            <Skeleton 
              variant="rectangular" 
              width="100%" 
              height={200} 
              sx={{ backgroundColor: 'rgba(255,255,255,0.1)' }} 
            />
          </Box>
        </CardContent>
        <style>{`
<<<<<<< HEAD
          @keyframes pulse-blue {
            0% { transform: scale(1); box-shadow: 0 0 8px #00bfff; }
            100% { transform: scale(1.04); box-shadow: 0 0 20px #00bfff; }
          }
          @keyframes blue-drift {
=======
          @keyframes pulse-gold {
            0% { transform: scale(1); box-shadow: 0 0 8px #ffd700; }
            100% { transform: scale(1.04); box-shadow: 0 0 20px #ffd700; }
          }
          @keyframes gold-drift {
>>>>>>> 861fb5a0d3729959038e5eb57b4a15dfa2298129
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
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        borderRadius: 3,
<<<<<<< HEAD
        border: '1px solid rgba(0, 168, 232, 0.7)',
        boxShadow: '0 0 15px rgba(0, 168, 232, 0.5)',
=======
        border: '1px solid rgba(212, 175, 55, 0.7)',
        boxShadow: '0 0 15px rgba(212, 175, 55, 0.5)',
>>>>>>> 861fb5a0d3729959038e5eb57b4a15dfa2298129
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
<<<<<<< HEAD
        background: 'radial-gradient(circle at 30% 40%, rgba(0,168,232,0.07), transparent 80%)',
        animation: 'blue-drift 20s linear infinite',
=======
        background: 'radial-gradient(circle at 30% 40%, rgba(212,175,55,0.07), transparent 80%)',
        animation: 'gold-drift 20s linear infinite',
>>>>>>> 861fb5a0d3729959038e5eb57b4a15dfa2298129
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: '10%',
        right: '-70%',
        width: '240%',
        height: '60%',
        background: 'radial-gradient(circle at 70% 30%, rgba(46, 139, 87, 0.06), transparent 85%)',
<<<<<<< HEAD
        animation: 'blue-drift-reverse 28s linear infinite',
=======
        animation: 'gold-drift-reverse 28s linear infinite',
>>>>>>> 861fb5a0d3729959038e5eb57b4a15dfa2298129
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <CardContent sx={{ p: 1, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography
            variant="overline"
            sx={{
              fontFamily: '"Orbitron", sans-serif',
<<<<<<< HEAD
              color: '#00a8e8',
              textShadow: '0 0 8px rgba(0,168,232,0.8)',
=======
              color: '#d4af37',
              textShadow: '0 0 8px rgba(212,175,55,0.8)',
>>>>>>> 861fb5a0d3729959038e5eb57b4a15dfa2298129
              fontSize: '1.2rem',
            }}
          >
            📊 Call Volume
          </Typography>
          <Chip
            label={wsConnected ? '🟢 Live' : '🔴 Offline'}
            size="small"
            sx={{
              fontSize: 12,
              background: wsConnected 
<<<<<<< HEAD
                ? 'linear-gradient(135deg, #00a8e8, #0077cc)' 
                : 'linear-gradient(135deg, #8b0000, #000)',
              color: wsConnected ? '#fff' : '#00bfff',
=======
                ? 'linear-gradient(135deg, #d4af37, #b8860b)' 
                : 'linear-gradient(135deg, #8b0000, #000)',
              color: wsConnected ? '#000' : '#ffd700',
>>>>>>> 861fb5a0d3729959038e5eb57b4a15dfa2298129
              fontWeight: 'bold',
              animation: wsConnected ? 'pulse-glow 2s infinite' : 'none',
            }}
          />
        </Box>

        <Box sx={{ width: '100%', height: 250, mt: 1.5 }} aria-label="Graphique des volumes de descentes et remontées">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 15, left: 15, bottom: 45 }}
              barSize={18}
              stackOffset="none"
            >
<<<<<<< HEAD
              <CartesianGrid strokeDasharray="3 3" stroke="#00a8e8" opacity={0.3} />

              {/* Axe X – polices et couleurs bleues */}
              <XAxis
                dataKey="index"
                tick={{
                  fill: '#00bfff',
                  fontSize: 22,
                  fontWeight: 'bold',
                  textShadow: '0 0 4px rgba(0,168,232,0.6)',
                  fontFamily: '"Montserrat", sans-serif',
=======
              <CartesianGrid strokeDasharray="3 3" stroke="#d4af37" opacity={0.3} />

              {/* Axe X – polices et couleurs dorées */}
              <XAxis
                dataKey="index"
                tick={{
                  fill: '#ffd700',
                  fontSize: 22,
                  fontWeight: 'bold',
                  textShadow: '0 0 4px rgba(212,175,55,0.6)',
                  fontFamily: '"Great Vibes", cursive',
>>>>>>> 861fb5a0d3729959038e5eb57b4a15dfa2298129
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

<<<<<<< HEAD
              {/* Axe Y – bleu et élégant */}
              <YAxis
                stroke="#00a8e8"
                tick={{
                  fill: '#00bfff',
                  fontSize: 16,
                  fontWeight: 'bold',
                  fontFamily: '"Orbitron", sans-serif',
=======
              {/* Axe Y – doré et élégant */}
              <YAxis
                stroke="#d4af37"
                tick={{
                  fill: '#ffd700',
                  fontSize: 16,
                  fontWeight: 'bold',
                  fontFamily: '"Great Vibes", cursive',
>>>>>>> 861fb5a0d3729959038e5eb57b4a15dfa2298129
                }}
                domain={[0, domainMax]}
                tickCount={tickCount}
                allowDecimals={false}
              />

              <Tooltip
                formatter={(value, name) => {
<<<<<<< HEAD
                  const labels = { 
                    CDS_IN: '⛷️ CDS_IN', 
                    CDS_OUT: '🚠 CDS_OUT', 
                    ABSYS: '❄️ ABSYS' 
                  };
=======
                  const labels = { CDS_IN: '📞 Entrants', CDS_OUT: '📞 Sortants', ABSYS: '⚠️ Perdus' };
>>>>>>> 861fb5a0d3729959038e5eb57b4a15dfa2298129
                  return [value, labels[name] || name];
                }}
                labelFormatter={(index) => `Heure : ${halfHourSlots[index] || index}`}
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.9)',
<<<<<<< HEAD
                  border: '1px solid #00a8e8',
                  borderRadius: 6,
                  color: '#00bfff',
                  fontSize: 12,
                  fontFamily: '"Montserrat", sans-serif',
                  boxShadow: '0 0 12px rgba(0, 168, 232, 0.6)',
=======
                  border: '1px solid #d4af37',
                  borderRadius: 6,
                  color: '#ffd700',
                  fontSize: 12,
                  fontFamily: '"Great Vibes", cursive',
                  boxShadow: '0 0 12px rgba(212, 175, 55, 0.6)',
>>>>>>> 861fb5a0d3729959038e5eb57b4a15dfa2298129
                }}
              />

              <ReferenceArea
                x1={lunchStartIndex}
                x2={lunchEndIndex}
                y1={0}
                y2="dataMax"
<<<<<<< HEAD
                fill="#00a8e8"
                fillOpacity={0.1}
                stroke="#0077cc"
                strokeOpacity={0.7}
                strokeDasharray="4 4"
              />
              <ReferenceLine x={lunchStartIndex} stroke="#00a8e8" strokeWidth={2} strokeDasharray="6 4" />
              <ReferenceLine x={lunchEndIndex} stroke="#00a8e8" strokeWidth={2} strokeDasharray="6 4" />
              <CustomLabel fill="#00a8e8" />

              <Bar 
                dataKey="CDS_IN" 
                name="CDS_IN" 
                fill="#00a8e8" 
                label={renderCustomLabel} 
                radius={[4, 4, 0, 0]} 
                style={{ animation: 'bar-rise-blue 1.2s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }} 
              />
              <Bar 
                dataKey="CDS_OUT" 
                name="CDS_OUT" 
                fill="#2e8b57" 
                label={renderCustomLabel} 
                radius={[4, 4, 0, 0]} 
                style={{ animation: 'bar-rise-blue 1.2s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }} 
              />
              <Bar 
                dataKey="ABSYS" 
                name="ABSYS" 
                fill="#8b0000" 
                label={renderCustomLabel} 
                radius={[4, 4, 0, 0]} 
                style={{ animation: 'bar-rise-blue 1.2s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }} 
=======
                fill="#d4af37"
                fillOpacity={0.1}
                stroke="#b8860b"
                strokeOpacity={0.7}
                strokeDasharray="4 4"
              />
              <ReferenceLine x={lunchStartIndex} stroke="#d4af37" strokeWidth={2} strokeDasharray="6 4" />
              <ReferenceLine x={lunchEndIndex} stroke="#d4af37" strokeWidth={2} strokeDasharray="6 4" />
              <CustomLabel fill="#d4af37" />

              <Bar 
                dataKey="CDS_IN" 
                name="Entrants" 
                fill="#d4af37" 
                label={renderCustomLabel} 
                radius={[4, 4, 0, 0]} 
                style={{ animation: 'bar-rise-gold 1.2s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }} 
              />
              <Bar 
                dataKey="CDS_OUT" 
                name="Sortants" 
                fill="#2e8b57" 
                label={renderCustomLabel} 
                radius={[4, 4, 0, 0]} 
                style={{ animation: 'bar-rise-gold 1.2s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }} 
              />
              <Bar 
                dataKey="ABSYS" 
                name="Perdus" 
                fill="#8b0000" 
                label={renderCustomLabel} 
                radius={[4, 4, 0, 0]} 
                style={{ animation: 'bar-rise-gold 1.2s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }} 
>>>>>>> 861fb5a0d3729959038e5eb57b4a15dfa2298129
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        <LegendComponent />
      </CardContent>

      <style>
        {`
<<<<<<< HEAD
          @keyframes bar-rise-blue {
=======
          @keyframes bar-rise-gold {
>>>>>>> 861fb5a0d3729959038e5eb57b4a15dfa2298129
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

<<<<<<< HEAD
          @keyframes pulse-blue {
            0% { 
              transform: scale(1); 
              box-shadow: 0 0 8px #00bfff; 
            }
            100% { 
              transform: scale(1.04); 
              box-shadow: 0 0 20px #00bfff; 
=======
          @keyframes pulse-gold {
            0% { 
              transform: scale(1); 
              box-shadow: 0 0 8px #ffd700; 
            }
            100% { 
              transform: scale(1.04); 
              box-shadow: 0 0 20px #ffd700; 
>>>>>>> 861fb5a0d3729959038e5eb57b4a15dfa2298129
            }
          }

          @keyframes pulse-glow {
<<<<<<< HEAD
            0%, 100% { box-shadow: 0 0 0 0 rgba(0, 168, 232, 0.7); }
            50% { box-shadow: 0 0 0 8px rgba(0, 168, 232, 0); }
          }

          @keyframes blue-drift {
=======
            0%, 100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.7); }
            50% { box-shadow: 0 0 0 8px rgba(212, 175, 55, 0); }
          }

          @keyframes gold-drift {
>>>>>>> 861fb5a0d3729959038e5eb57b4a15dfa2298129
            0% { transform: translateX(0) translateY(0); }
            50% { transform: translateX(-10%) translateY(-5%); }
            100% { transform: translateX(0) translateY(0); }
          }

<<<<<<< HEAD
          @keyframes blue-drift-reverse {
=======
          @keyframes gold-drift-reverse {
>>>>>>> 861fb5a0d3729959038e5eb57b4a15dfa2298129
            0% { transform: translateX(0) translateY(0); }
            50% { transform: translateX(12%) translateY(3%); }
            100% { transform: translateX(0) translateY(0); }
          }
        `}
      </style>
    </Card>
  );
}

export default CallVolumeChart;