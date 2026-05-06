import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, Typography } from '@mui/material';

// === 🦉 Icônes thème Pluie & Hibou ===
const getIconForTitle = (title) => {
  const lower = title.toLowerCase();
  if (lower.includes('agent')) return '🦉';
  if (lower.includes('call') || lower.includes('appel') || lower.includes('entrant')) return '📞';
  if (lower.includes('abandon') || lower.includes('perdu') || lower.includes('missed')) return '🔴';
  if (lower.includes('aht') || lower.includes('durée') || lower.includes('temps')) return '⏱️';
  if (lower.includes('total') || lower.includes('nombre')) return '📊';
  if (lower.includes('outbound') || lower.includes('sortant')) return '📤';
  if (lower.includes('rate') || lower.includes('taux')) return '📈';
  return '🌧️';
};

export default function KPICard({ 
  title, 
  subtitle, 
  value, 
  valueColor, 
  height = 130,
  unit, 
  tooltip,
  isCritical = false
}) {
  const [animate, setAnimate] = useState(false);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (prevValueRef.current !== value) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 800);
      return () => clearTimeout(timer);
    }
    prevValueRef.current = value;
  }, [value]);

  const isValueCritical = isCritical || valueColor === 'error';
  
  // === 🦉 Couleurs adaptées au thème sombre ===
  const getValueColor = () => {
    if (isValueCritical) return '#e74c3c';
    switch (valueColor) {
      case 'success': return '#2ecc71';    // Vert émeraude (lisible sur fond sombre)
      case 'warning': return '#f1c40f';    // Jaune doré
      case 'error':   return '#e74c3c';    // Rouge vif
      case 'info':    return '#3498db';    // Bleu clair
      default:        return '#ecf0f1';    // Blanc cassé
    }
  };

  const icon = getIconForTitle(title);

  return (
    <>
      <style>{`
        /* 🦉 Animation mise à jour KPI */
        @keyframes kpi-highlight-owl {
          0% { 
            background-color: rgba(243, 156, 18, 0.15); 
            box-shadow: 0 0 15px rgba(243, 156, 18, 0.4); 
          }
          100% { 
            background-color: transparent; 
            box-shadow: 0 0 0 rgba(243, 156, 18, 0); 
          }
        }

        /* 🔴 Animation critique – Lueur rouge ambrée */
        @keyframes pulse-critical {
          0%, 100% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.6); }
          50% { box-shadow: 0 0 0 12px rgba(231, 76, 60, 0); }
        }

        /* 🌧️ Secousse subtile pour alerte */
        @keyframes shake-critical {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }

        /* ✨ Scintillement yeux de hibou */
        @keyframes twinkle-owl {
          0%, 100% { opacity: 1; filter: brightness(1); }
          25% { opacity: 0.95; filter: brightness(1.15); }
          50% { opacity: 1; filter: brightness(0.9); }
          75% { opacity: 0.98; filter: brightness(1.08); }
        }

        /* 🌫️ Lueur ambiante flottante */
        @keyframes owl-drift-kpi {
          0% { transform: translateX(0) translateY(0); opacity: 0.5; }
          50% { transform: translateX(-5%) translateY(-3%); opacity: 0.75; }
          100% { transform: translateX(0) translateY(0); opacity: 0.5; }
        }

        /* 💧 Effet goutte au survol */
        .kpi-droplet::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          opacity: 0;
          transform: scale(0.3);
          transition: all 0.4s ease;
          pointer-events: none;
          border-radius: 50%;
          z-index: 2;
        }
        .kpi-droplet:hover::before {
          opacity: 1;
          transform: scale(1);
          animation: droplet-ripple 0.6s ease-out;
        }
        @keyframes droplet-ripple {
          0% { transform: scale(0.3); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>

      <Card
        className="kpi-droplet"
        sx={{
          // === Glassmorphism ULTRA-TRANSPARENT ===
          backgroundColor: 'rgba(10, 14, 23, 0.25)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          height: `${height}px`,
          borderRadius: 3,
          border: `1px solid ${isValueCritical ? 'rgba(231, 76, 60, 0.4)' : 'rgba(243, 156, 18, 0.2)'}`,
          boxShadow: isValueCritical 
            ? '0 4px 20px rgba(231, 76, 60, 0.25), 0 0 15px rgba(231, 76, 60, 0.15)' 
            : '0 4px 20px rgba(0,0,0,0.3)',
          transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.4, 1)',
          ...(animate && {
            animation: `kpi-highlight-owl 0.8s ease-out`,
          }),
          ...(isValueCritical && {
            animation: 'shake-critical 2.5s infinite, pulse-critical 2s infinite',
            '&:hover': {
              animation: 'pulse-critical 2s infinite',
            },
          }),
          '&:hover': {
            transform: 'translateY(-4px)',
            backgroundColor: 'rgba(10, 14, 23, 0.35)',
            borderColor: isValueCritical
              ? 'rgba(231, 76, 60, 0.6)'
              : 'rgba(243, 156, 18, 0.4)',
            boxShadow: isValueCritical
              ? '0 8px 32px rgba(231, 76, 60, 0.35), 0 0 25px rgba(231, 76, 60, 0.2)'
              : '0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(243, 156, 18, 0.15)',
          },
          position: 'relative',
          overflow: 'hidden',
          // === Lueur ambiante hibou ===
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: isValueCritical
              ? 'radial-gradient(circle at 50% 0%, rgba(231, 76, 60, 0.1) 0%, transparent 70%)'
              : 'radial-gradient(circle at 50% 0%, rgba(243, 156, 18, 0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 0,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '10%',
            left: '-40%',
            width: '180%',
            height: '80%',
            background: isValueCritical
              ? 'radial-gradient(circle at 60% 40%, rgba(231, 76, 60, 0.06), transparent 75%)'
              : 'radial-gradient(circle at 40% 60%, rgba(212, 160, 23, 0.05), transparent 80%)',
            pointerEvents: 'none',
            zIndex: 0,
            animation: 'owl-drift-kpi 18s linear infinite',
          },
        }}
      >
        <CardContent
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: tooltip ? 'help' : 'default',
            position: 'relative',
            zIndex: 1,
            padding: '16px !important',
          }}
        >
          <Typography
            variant="overline"
            sx={{
              fontWeight: 'bold',
              color: '#ecf0f1',
              textShadow: '0 0 10px rgba(243, 156, 18, 0.4)',
              fontFamily: '"Montserrat", sans-serif',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              textAlign: 'center',
              lineHeight: 1.3,
              ...(isValueCritical && {
                animation: 'twinkle-owl 3s infinite alternate',
                color: '#e74c3c',
                textShadow: '0 0 8px rgba(231, 76, 60, 0.5)',
              }),
            }}
          >
            {icon} {title}
          </Typography>

          {subtitle && (
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#bdc3c7',
                display: 'block', 
                mb: 1,
                fontSize: '0.9rem',
                fontWeight: 500,
                textAlign: 'center',
                lineHeight: 1.3,
              }}
            >
              {subtitle}
            </Typography>
          )}

          <Typography
            variant="h3"
            component="div"
            sx={{
              mt: 1,
              color: getValueColor(),
              textAlign: 'center',
              fontWeight: 'bold',
              fontFamily: '"Montserrat", sans-serif',
              transition: 'all 0.3s ease',
              willChange: 'transform',
              transformOrigin: 'center',
              display: 'flex',
              alignItems: 'flex-end',
              gap: 0.5,
              textShadow: '0 2px 8px rgba(0,0,0,0.4)',
              ...(animate && {
                transform: 'scale(1.12)',
                transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.4, 1)',
              }),
              ...(isValueCritical && {
                textShadow: '0 0 10px rgba(231, 76, 60, 0.6), 0 0 20px rgba(231, 76, 60, 0.3)',
                animation: 'twinkle-owl 2.5s infinite alternate',
              }),
            }}
            aria-live="polite"
          >
            {value != null ? value : '-'}
            {unit && (
              <Typography
                component="span"
                variant="subtitle1"
                sx={{
                  color: '#bdc3c7',
                  fontWeight: 'normal',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                }}
              >
                {unit}
              </Typography>
            )}
          </Typography>
        </CardContent>
      </Card>
    </>
  );
}