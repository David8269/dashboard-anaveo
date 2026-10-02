import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, Typography } from '@mui/material';

// === 🦉🎀 Icônes thème Octobre Rose ===
const getIconForTitle = (title) => {
  const lower = title.toLowerCase();
  if (lower.includes('agent')) return '🦉';
  if (lower.includes('call') || lower.includes('appel') || lower.includes('entrant')) return '📞';
  if (lower.includes('abandon') || lower.includes('perdu') || lower.includes('missed')) return '🚫';
  if (lower.includes('aht') || lower.includes('durée') || lower.includes('temps')) return '⏱️';
  if (lower.includes('total') || lower.includes('nombre')) return '📊';
  if (lower.includes('outbound') || lower.includes('sortant')) return '📤';
  if (lower.includes('rate') || lower.includes('taux')) return '📈';
  return '🎀';
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
  
  // === 🦉🎀 Couleurs adaptées au thème Octobre Rose ===
  const getValueColor = () => {
    if (isValueCritical) return '#fca5a5'; // Rouge rosé (alerte)
    switch (valueColor) {
      case 'success': return '#6ee7b7';    // Vert doux (succès)
      case 'warning': return '#f9a8d4';    // Rose pastel (attention)
      case 'error':   return '#fca5a5';    // Rouge rosé (erreur)
      case 'info':    return '#ff4d94';    // Rose vif (info)
      default:        return '#ffe6f0';    // Rose poudré (défaut)
    }
  };

  const icon = getIconForTitle(title);

  return (
    <>
      <style>{`
        /* 🎀 Animation mise à jour KPI (Lueur rose ultra-transparente) */
        @keyframes kpi-highlight-rose {
          0% { 
            background-color: rgba(255, 77, 148, 0.25); 
            box-shadow: 0 0 20px rgba(255, 77, 148, 0.4); 
          }
          100% { 
            background-color: rgba(45, 10, 30, 0.60); 
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3), inset 0 0 15px rgba(255, 255, 255, 0.05); 
          }
        }

        /* 🔴 Animation critique – Lueur rose vif */
        @keyframes pulse-critical-rose {
          0%, 100% { box-shadow: 0 0 0 0 rgba(252, 165, 165, 0.6); }
          50% { box-shadow: 0 0 0 12px rgba(252, 165, 165, 0); }
        }

        /* 🎀 Secousse subtile pour alerte */
        @keyframes shake-critical {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }

        /* ✨ Scintillement rose */
        @keyframes twinkle-rose {
          0%, 100% { opacity: 1; filter: brightness(1); }
          25% { opacity: 0.95; filter: brightness(1.15); }
          50% { opacity: 1; filter: brightness(0.9); }
          75% { opacity: 0.98; filter: brightness(1.08); }
        }

        /* 🌫️ Lueur ambiante flottante (Rose/Or rose) */
        @keyframes rose-drift-kpi {
          0% { transform: translateX(0) translateY(0); opacity: 0.5; }
          50% { transform: translateX(-5%) translateY(-3%); opacity: 0.75; }
          100% { transform: translateX(0) translateY(0); opacity: 0.5; }
        }

        /* 🎀 Effet ruban/ondulation au survol */
        .kpi-ribbon-ripple::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255, 77, 148, 0.15) 0%, transparent 70%);
          opacity: 0;
          transform: scale(0.3);
          transition: all 0.4s ease;
          pointer-events: none;
          border-radius: 50%;
          z-index: 2;
        }
        .kpi-ribbon-ripple:hover::before {
          opacity: 1;
          transform: scale(1);
          animation: ribbon-ripple-anim 0.6s ease-out;
        }
        @keyframes ribbon-ripple-anim {
          0% { transform: scale(0.3); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>

      <Card
        className="kpi-ribbon-ripple"
        sx={{
          // === Glassmorphism "Ruban de Verre" ===
          backgroundColor: 'rgba(45, 10, 30, 0.60)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          height: `${height}px`,
          borderRadius: 4,
          border: `1px solid ${isValueCritical ? 'rgba(252, 165, 165, 0.4)' : 'rgba(255, 77, 148, 0.3)'}`,
          borderTop: `3px solid #ff4d94`, // Effet Ruban Rose
          boxShadow: isValueCritical 
            ? '0 4px 20px rgba(0, 0, 0, 0.3), 0 0 15px rgba(252, 165, 165, 0.2)' 
            : '0 4px 20px rgba(0, 0, 0, 0.3), inset 0 0 15px rgba(255, 255, 255, 0.05)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          ...(animate && {
            animation: `kpi-highlight-rose 0.8s ease-out`,
          }),
          ...(isValueCritical && {
            animation: 'shake-critical 2.5s infinite, pulse-critical-rose 2s infinite',
            '&:hover': {
              animation: 'pulse-critical-rose 2s infinite',
            },
          }),
          '&:hover': {
            transform: 'translateY(-4px)',
            backgroundColor: 'rgba(74, 14, 46, 0.70)',
            borderColor: isValueCritical
              ? 'rgba(252, 165, 165, 0.6)'
              : 'rgba(255, 230, 240, 0.6)',
            boxShadow: isValueCritical
              ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(252, 165, 165, 0.3)'
              : '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 77, 148, 0.2)',
          },
          position: 'relative',
          overflow: 'hidden',
          // === Lueur ambiante rose ===
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: isValueCritical
              ? 'radial-gradient(circle at 50% 0%, rgba(252, 165, 165, 0.1) 0%, transparent 70%)'
              : 'radial-gradient(circle at 50% 0%, rgba(255, 77, 148, 0.08) 0%, transparent 70%)',
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
              ? 'radial-gradient(circle at 60% 40%, rgba(252, 165, 165, 0.06), transparent 75%)'
              : 'radial-gradient(circle at 40% 60%, rgba(255, 153, 200, 0.05), transparent 80%)',
            pointerEvents: 'none',
            zIndex: 0,
            animation: 'rose-drift-kpi 18s linear infinite',
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
              fontWeight: 700,
              color: '#ffe6f0',
              textShadow: '0 2px 8px rgba(0,0,0,0.6), 0 0 15px rgba(255, 77, 148, 0.4)',
              fontFamily: '"Dancing Script", cursive', // Calligraphie élégante
              fontSize: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              textAlign: 'center',
              lineHeight: 1.3,
              letterSpacing: '0.5px',
              ...(isValueCritical && {
                animation: 'twinkle-rose 3s infinite alternate',
                color: '#fca5a5',
                textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 0 15px rgba(252, 165, 165, 0.6)',
              }),
            }}
          >
            {icon} {title}
          </Typography>

          {subtitle && (
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#d4849c', // Or rose
                display: 'block', 
                mb: 1,
                fontSize: '0.85rem',
                fontWeight: 500,
                textAlign: 'center',
                lineHeight: 1.3,
                fontFamily: '"Inter", sans-serif',
                textShadow: '0 1px 4px rgba(0,0,0,0.9)',
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
              fontWeight: 700,
              fontFamily: '"Montserrat", sans-serif',
              transition: 'all 0.3s ease',
              willChange: 'transform',
              transformOrigin: 'center',
              display: 'flex',
              alignItems: 'flex-end',
              gap: 0.5,
              textShadow: '0 2px 6px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.8)',
              ...(animate && {
                transform: 'scale(1.12)',
                transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.4, 1)',
              }),
              ...(isValueCritical && {
                textShadow: '0 2px 6px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.8), 0 0 15px rgba(252, 165, 165, 0.6)',
                animation: 'twinkle-rose 2.5s infinite alternate',
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
                  color: '#d4849c',
                  fontWeight: 500,
                  fontSize: '1rem',
                  fontFamily: '"Inter", sans-serif',
                  ml: 0.5,
                  textShadow: '0 1px 4px rgba(0,0,0,0.9)',
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