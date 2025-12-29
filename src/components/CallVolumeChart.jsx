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
<<<<<<< HEAD
    <text x="49.5%" y={25} fill={fill} fontSize={14} textAnchor="middle" fontWeight="bold" fontFamily='"Orbitron", sans-serif'>
      🥂 Champagne ! 🥂
=======
    <text x="49.8%" y={25} fill={fill} fontSize={14} textAnchor="middle" fontWeight="bold" fontFamily='"Mountains of Christmas", cursive'>
      🍬🍭☕ HOT CHOCOLATE ☕🍭🍬
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
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
    color: '#ffd700',
    textShadow: '0 0 4px rgba(212,175,55,0.6)',
=======
    color: '#000',
    textShadow: '0 0 4px rgba(255,215,0,0.5)',
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
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
        <span style={squareStyle('#d4af37')}></span> 📞 Inbound Calls
      </div>
      <div style={itemStyle}>
        <span style={squareStyle('#2e8b57')}></span> 📞 Outbound Calls
      </div>
      <div style={itemStyle}>
        <span style={squareStyle('#8b0000')}></span> ⚠️ Overflow Calls
=======
        <span style={squareStyle('#d42426')}></span> 📞 Inbound Calls
      </div>
      <div style={itemStyle}>
        <span style={squareStyle('#228b22')}></span> 🎄 Outbound Calls
      </div>
      <div style={itemStyle}>
        <span style={squareStyle('#c1272d')}></span> 🎁 Overflow Calls
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
      </div>
    </Box>
  );
}

const renderCustomLabel = ({ x, y, width, value, dataKey }) => {
  if (!value || value <= 0) return null;
  const isAbsysCritical = dataKey === 'ABSYS' && value > 5;
<<<<<<< HEAD
  const labelColor = isAbsysCritical ? '#ffd700' : '#ffffff';
=======
  const labelColor = isAbsysCritical ? '#d42426' : '#000';
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5

  return (
    <text
      x={x + width / 2}
      y={y - 6}
      fill={labelColor}
      textAnchor="middle"
      fontSize={10}
      fontWeight="bold"
<<<<<<< HEAD
      fontFamily={isAbsysCritical ? '"Great Vibes", cursive' : 'inherit'}
      style={{
        animation: isAbsysCritical ? 'pulse-gold 2s infinite alternate' : 'none',
        filter: isAbsysCritical ? 'drop-shadow(0 0 6px #ffd700)' : 'none',
=======
      fontFamily={isAbsysCritical ? '"Mountains of Christmas", cursive' : 'inherit'}
      style={{
        animation: isAbsysCritical ? 'twinkle-text-pulse 2s infinite alternate' : 'none',
        filter: isAbsysCritical ? 'drop-shadow(0 0 4px #ffd700)' : 'none',
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
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
<<<<<<< HEAD
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(6px)', // 👈 Flou ajouté
          WebkitBackdropFilter: 'blur(6px)', // compatibilité
          borderRadius: 3,
          border: '1px solid rgba(212, 175, 55, 0.7)',
          boxShadow: '0 0 15px rgba(212, 175, 55, 0.5)',
=======
          backgroundColor: 'rgba(255, 255, 255, 0.70)',
          borderRadius: 3,
          border: '1px solid var(--christmas-primary, #d42426)',
          boxShadow: '0 0 15px rgba(212, 36, 38, 0.3)',
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
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
          background: 'radial-gradient(circle at 40% 50%, rgba(212,175,55,0.08), transparent 70%)',
          animation: 'gold-drift 22s linear infinite',
=======
          background: 'radial-gradient(circle at 40% 50%, rgba(212,36,38,0.08), transparent 70%)',
          animation: 'snow-drift 22s linear infinite',
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
          pointerEvents: 'none',
          zIndex: 0,
        }} />
        <CardContent sx={{ p: 1, position: 'relative', zIndex: 1 }}>
          <Typography
            variant="overline"
            sx={{
<<<<<<< HEAD
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
=======
              fontFamily: '"Mountains of Christmas", cursive',
              color: '#d42426',
              textShadow: '0 0 6px rgba(255,215,0,0.6)',
              fontSize: '1.1rem',
            }}
          >
            📞 Call Volume
          </Typography>
          <Box sx={{ textAlign: 'center', py: 1, mt: 2 }}>
            <Chip
              label={wsConnected ? '🎄 Aucun appel dans le traîneau' : '🎅 Connexion au Père Noël...'}
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
              size="small"
              sx={{
                mb: 1,
                background: wsConnected 
<<<<<<< HEAD
                  ? 'linear-gradient(135deg, #8b0000, #000)' 
                  : 'linear-gradient(135deg, #000, #333)',
                color: '#ffd700',
                fontFamily: '"Great Vibes", cursive',
                animation: wsConnected ? 'none' : 'pulse-gold 2s infinite alternate',
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
          @keyframes pulse-gold {
            0% { transform: scale(1); box-shadow: 0 0 8px #ffd700; }
            100% { transform: scale(1.04); box-shadow: 0 0 20px #ffd700; }
          }
          @keyframes gold-drift {
=======
                  ? 'linear-gradient(135deg, #c1272d, #8b0000)' 
                  : 'linear-gradient(135deg, #d42426, #8b0000)',
                color: '#ffd700',
                fontFamily: '"Mountains of Christmas", cursive',
                animation: wsConnected ? 'none' : 'pulse-chip 2s infinite alternate',
              }}
            />
            <Skeleton variant="rectangular" width="100%" height={200} />
          </Box>
        </CardContent>
        <style>{`
          @keyframes pulse-chip {
            0% { transform: scale(1); box-shadow: 0 0 6px #ffd700; }
            100% { transform: scale(1.05); box-shadow: 0 0 16px #ffaa00; }
          }
          @keyframes snow-drift {
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
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
<<<<<<< HEAD
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(6px)', // 👈 Flou ajouté
        WebkitBackdropFilter: 'blur(6px)', // compatibilité
        borderRadius: 3,
        border: '1px solid rgba(212, 175, 55, 0.7)',
        boxShadow: '0 0 15px rgba(212, 175, 55, 0.5)',
=======
        backgroundColor: 'rgba(255, 255, 255, 0.70)',
        borderRadius: 3,
        border: '1px solid var(--christmas-primary, #d42426)',
        boxShadow: '0 0 15px rgba(212, 36, 38, 0.3)',
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
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
        background: 'radial-gradient(circle at 30% 40%, rgba(212,175,55,0.07), transparent 80%)',
        animation: 'gold-drift 20s linear infinite',
=======
        background: 'radial-gradient(circle at 30% 40%, rgba(212,36,38,0.07), transparent 80%)',
        animation: 'snow-drift 20s linear infinite',
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
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
        animation: 'gold-drift-reverse 28s linear infinite',
=======
        animation: 'snow-drift-reverse 28s linear infinite',
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <CardContent sx={{ p: 1, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography
            variant="overline"
            sx={{
<<<<<<< HEAD
              fontFamily: '"Orbitron", sans-serif',
              color: '#d4af37',
              textShadow: '0 0 8px rgba(212,175,55,0.8)',
              fontSize: '1.2rem',
            }}
          >
            📊 Call Volume
=======
              fontFamily: '"Mountains of Christmas", cursive',
              color: '#d42426',
              textShadow: '0 0 6px rgba(255,215,0,0.6)',
              fontSize: '1.1rem',
            }}
          >
            📞 Call Volume
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
          </Typography>
          <Chip
            label={wsConnected ? '🟢 Live' : '🔴 Offline'}
            size="small"
            sx={{
              fontSize: 12,
              background: wsConnected 
<<<<<<< HEAD
                ? 'linear-gradient(135deg, #d4af37, #b8860b)' 
                : 'linear-gradient(135deg, #8b0000, #000)',
              color: wsConnected ? '#000' : '#ffd700',
              fontWeight: 'bold',
              animation: wsConnected ? 'pulse-glow 2s infinite' : 'none',
=======
                ? 'linear-gradient(135deg, #228b22, #1e7a1e)' 
                : 'linear-gradient(135deg, #c1272d, #8b0000)',
              color: '#fff',
              fontWeight: 'bold',
              animation: wsConnected ? 'pulse-live 2s infinite' : 'none',
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
            }}
          />
        </Box>

        <Box sx={{ width: '100%', height: 250, mt: 1.5 }} aria-label="Graphique des volumes d'appels">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
<<<<<<< HEAD
              margin={{ top: 5, right: 15, left: 15, bottom: 45 }}
              barSize={18}
              stackOffset="none"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#d4af37" opacity={0.3} />
=======
              margin={{ top: 5, right: 15, left: 15, bottom: 45 }} // légère augmentation du bottom pour éviter le chevauchement
              barSize={18}
              stackOffset="none"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2e8b57" opacity={0.4} />
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5

              {/* ✅ Axe X – plus grande et en gras */}
              <XAxis
                dataKey="index"
                tick={{
<<<<<<< HEAD
                  fill: '#ffd700',
                  fontSize: 22,
                  fontWeight: 'bold',
                  textShadow: '0 0 4px rgba(212,175,55,0.6)',
                  fontFamily: '"Great Vibes", cursive',
=======
                  fill: '#000',
                  fontSize: 25, // 👈 Plus grande
                  fontWeight: 'bold', // 👈 Gras
                  textShadow: '0 0 3px rgba(255,215,0,0.4)',
                  fontFamily: '"Mountains of Christmas", cursive',
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
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

              {/* ✅ Axe Y – plus grande et en gras */}
              <YAxis
<<<<<<< HEAD
                stroke="#d4af37"
                tick={{
                  fill: '#ffd700',
                  fontSize: 16,
                  fontWeight: 'bold',
                  fontFamily: '"Great Vibes", cursive',
=======
                stroke="#2e8b57"
                tick={{
                  fill: '#000',
                  fontSize: 18, // 👈 Plus grande
                  fontWeight: 'bold', // 👈 Gras
                  fontFamily: '"Mountains of Christmas", cursive',
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
                }}
                domain={[0, domainMax]}
                tickCount={tickCount}
                allowDecimals={false}
              />

              <Tooltip
                formatter={(value, name) => {
<<<<<<< HEAD
                  const labels = { CDS_IN: '📞 Entrants', CDS_OUT: '📞 Sortants', ABSYS: '⚠️ Perdus' };
=======
                  const labels = { CDS_IN: '📞 CDS In', CDS_OUT: '🎄 CDS Out', ABSYS: '🎁 Absys' };
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
                  return [value, labels[name] || name];
                }}
                labelFormatter={(index) => `Heure : ${halfHourSlots[index] || index}`}
                contentStyle={{
<<<<<<< HEAD
                  backgroundColor: 'rgba(0, 0, 0, 0.9)',
                  border: '1px solid #d4af37',
                  borderRadius: 6,
                  color: '#ffd700',
                  fontSize: 12,
                  fontFamily: '"Great Vibes", cursive',
                  boxShadow: '0 0 12px rgba(212, 175, 55, 0.6)',
=======
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #d42426',
                  borderRadius: 6,
                  color: '#000',
                  fontSize: 12,
                  fontFamily: '"Mountains of Christmas", cursive',
                  boxShadow: '0 0 10px rgba(212, 36, 38, 0.4)',
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
                }}
              />

              <ReferenceArea
                x1={lunchStartIndex}
                x2={lunchEndIndex}
                y1={0}
                y2="dataMax"
<<<<<<< HEAD
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
=======
                fill="#2e8b57"
                fillOpacity={0.15}
                stroke="#d42426"
                strokeOpacity={0.8}
                strokeDasharray="4 4"
              />
              <ReferenceLine x={lunchStartIndex} stroke="#d42426" strokeWidth={2} strokeDasharray="6 4" />
              <ReferenceLine x={lunchEndIndex} stroke="#d42426" strokeWidth={2} strokeDasharray="6 4" />
              <CustomLabel fill="#d42426" />

              <Bar 
                dataKey="CDS_IN" 
                name="CDS In" 
                fill="#d42426" 
                label={renderCustomLabel} 
                radius={[4, 4, 0, 0]} 
                style={{ animation: 'bar-rise 1.2s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }} 
              />
              <Bar 
                dataKey="CDS_OUT" 
                name="CDS Out" 
                fill="#228b22" 
                label={renderCustomLabel} 
                radius={[4, 4, 0, 0]} 
                style={{ animation: 'bar-rise 1.2s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }} 
              />
              <Bar 
                dataKey="ABSYS" 
                name="Absys" 
                fill="#c1272d" 
                label={renderCustomLabel} 
                radius={[4, 4, 0, 0]} 
                style={{ animation: 'bar-rise 1.2s cubic-bezier(0.2, 0.8, 0.4, 1) forwards' }} 
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
              />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        <LegendComponent />
      </CardContent>

      <style>
        {`
<<<<<<< HEAD
          @keyframes bar-rise-gold {
=======
          @keyframes bar-rise {
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
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
          @keyframes pulse-gold {
            0% { 
              transform: scale(1); 
              box-shadow: 0 0 8px #ffd700; 
            }
            100% { 
              transform: scale(1.04); 
              box-shadow: 0 0 20px #ffd700; 
            }
          }

          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.7); }
            50% { box-shadow: 0 0 0 8px rgba(212, 175, 55, 0); }
          }

          @keyframes gold-drift {
=======
          @keyframes twinkle-text-pulse {
            0% { 
              filter: drop-shadow(0 0 4px #ffd700); 
              text-shadow: 0 0 6px rgba(255,215,0,0.7);
            }
            50% { 
              filter: drop-shadow(0 0 10px #ffaa00); 
              text-shadow: 0 0 10px rgba(255,170,0,0.9);
            }
            100% { 
              filter: drop-shadow(0 0 4px #ffd700); 
              text-shadow: 0 0 6px rgba(255,215,0,0.7);
            }
          }

          @keyframes pulse-live {
            0% { box-shadow: 0 0 4px #228b22; }
            50% { box-shadow: 0 0 10px #32cd32; }
            100% { box-shadow: 0 0 4px #228b22; }
          }

          @keyframes snow-drift {
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
            0% { transform: translateX(0) translateY(0); }
            50% { transform: translateX(-10%) translateY(-5%); }
            100% { transform: translateX(0) translateY(0); }
          }

<<<<<<< HEAD
          @keyframes gold-drift-reverse {
=======
          @keyframes snow-drift-reverse {
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
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