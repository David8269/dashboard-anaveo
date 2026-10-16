import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, Typography } from '@mui/material';

// === 🎃 Icônes thème Halloween ===
const getIconForTitle = (title) => {
  const lower = title.toLowerCase();
  if (lower.includes('agent')) return '🦉';
  if (lower.includes('call') || lower.includes('appel') || lower.includes('entrant')) return '📞';
  if (lower.includes('abandon') || lower.includes('perdu') || lower.includes('missed')) return '🚫';
  if (lower.includes('aht') || lower.includes('durée') || lower.includes('temps')) return '⏱️';
  if (lower.includes('total') || lower.includes('nombre')) return '📊';
  if (lower.includes('outbound') || lower.includes('sortant')) return '📤';
  if (lower.includes('rate') || lower.includes('taux')) return '📈';
  return '🎃';
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
  
  // === 🎃 Couleurs adaptées au thème Halloween ===
  const getValueColor = () => {
    if (isValueCritical) return '#ff4500'; // Rouge Feu (alerte)
    switch (valueColor) {
      case 'success': return '#39ff14';    // Vert Néon (succès)
      case 'warning': return '#ffaa00';    // Orange Ambre (attention)
      case 'error':   return '#ff4500';    // Rouge Feu (erreur)
      case 'info':    return '#9d4edd';    // Violet Mystique (info)
      default:        return '#ffffff';    // Blanc Pur (défaut, lisibilité max)
    }
  };

  const icon = getIconForTitle(title);

  return (
    <>
      <style>{`
        /* 🎃 Animation mise à jour KPI (Lueur orange ultra-transparente) */
        @keyframes kpi-highlight-halloween {
          0% { 
            background-color: rgba(255, 107, 53, 0.30); 
            box-shadow: 0 0 25px rgba(255, 107, 53, 0.4); 
          }
          100% { 
            background-color: rgba(10, 5, 10, 0.60); 
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), inset 0 0 20px rgba(255, 107, 53, 0.05); 
          }
        }

        /* 🔴 Animation critique – Lueur Rouge/Orange vif */
        @keyframes pulse-critical-halloween {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255, 69, 0, 0.6); }
          50% { box-shadow: 0 0 0 12px rgba(255, 69, 0, 0); }
        }

        /* 🎃 Secousse subtile pour alerte */
        @keyframes shake-critical {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }

        /* ✨ Scintillement Halloween */
        @keyframes twinkle-halloween {
          0%, 100% { opacity: 1; filter: brightness(1); }
          25% { opacity: 0.9; filter: brightness(1.2); }
          50% { opacity: 1; filter: brightness(0.9); }
          75% { opacity: 0.95; filter: brightness(1.1); }
        }

        /* 🌫️ Lueur ambiante flottante (Orange/Violet) */
        @keyframes halloween-drift-kpi {
          0% { transform: translateX(0) translateY(0); opacity: 0.4; }
          50% { transform: translateX(-5%) translateY(-3%); opacity: 0.7; }
          100% { transform: translateX(0) translateY(0); opacity: 0.4; }
        }

        /* 🧪 Effet potion/ondulation au survol */
        .kpi-potion-ripple::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255, 107, 53, 0.2) 0%, transparent 70%);
          opacity: 0;
          transform: scale(0.3);
          transition: all 0.4s ease;
          pointer-events: none;
          border-radius: 50%;
          z-index: 2;
        }
        .kpi-potion-ripple:hover::before {
          opacity: 1;
          transform: scale(1);
          animation: potion-ripple-anim 0.6s ease-out;
        }
        @keyframes potion-ripple-anim {
          0% { transform: scale(0.3); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>

      <Card
        className="kpi-potion-ripple"
        sx={{
          // === Glassmorphism "Citrouille de Verre" (Transparence accrue) ===
          backgroundColor: 'rgba(10, 5, 10, 0.60)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          height: `${height}px`,
          borderRadius: 4,
          border: `1px solid ${isValueCritical ? 'rgba(255, 69, 0, 0.6)' : 'rgba(255, 107, 53, 0.4)'}`,
          borderTop: `3px solid #ffaa00`, // Bordure Orange
          boxShadow: isValueCritical 
            ? '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 20px rgba(255, 69, 0, 0.3)' 
            : '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 0 20px rgba(255, 107, 53, 0.05)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          ...(animate && {
            animation: `kpi-highlight-halloween 0.8s ease-out`,
          }),
          ...(isValueCritical && {
            animation: 'shake-critical 2.5s infinite, pulse-critical-halloween 2s infinite',
            '&:hover': {
              animation: 'pulse-critical-halloween 2s infinite',
            },
          }),
          '&:hover': {
            transform: 'translateY(-4px)',
            backgroundColor: 'rgba(26, 15, 26, 0.70)',
            borderColor: isValueCritical
              ? 'rgba(255, 69, 0, 0.8)'
              : 'rgba(255, 140, 100, 0.7)',
            boxShadow: isValueCritical
              ? '0 12px 40px rgba(0, 0, 0, 0.7), 0 0 30px rgba(255, 69, 0, 0.4)'
              : '0 12px 40px rgba(0, 0, 0, 0.7), 0 0 30px rgba(255, 107, 53, 0.3)',
          },
          position: 'relative',
          overflow: 'hidden',
          // === Lueur ambiante Halloween ===
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: isValueCritical
              ? 'radial-gradient(circle at 50% 0%, rgba(255, 69, 0, 0.15) 0%, transparent 70%)'
              : 'radial-gradient(circle at 50% 0%, rgba(255, 107, 53, 0.1) 0%, transparent 70%)',
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
              ? 'radial-gradient(circle at 60% 40%, rgba(255, 69, 0, 0.08), transparent 75%)'
              : 'radial-gradient(circle at 40% 60%, rgba(157, 78, 221, 0.08), transparent 80%)',
            pointerEvents: 'none',
            zIndex: 0,
            animation: 'halloween-drift-kpi 18s linear infinite',
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
              color: '#ffffff',
              textShadow: '0 0 10px rgba(0,0,0,0.95), 0 2px 4px rgba(0,0,0,0.9)', // Ombre forte pour lisibilité
              fontFamily: '"Creepster", "Dancing Script", cursive',
              fontSize: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              textAlign: 'center',
              lineHeight: 1.3,
              letterSpacing: '0.5px',
              ...(isValueCritical && {
                animation: 'twinkle-halloween 3s infinite alternate',
                color: '#ff4500',
                textShadow: '0 0 15px rgba(255, 69, 0, 0.8), 0 2px 4px rgba(0,0,0,0.9)',
              }),
            }}
          >
            {icon} {title}
          </Typography>

          {subtitle && (
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#d484f0', // Violet clair
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
              fontWeight: 800,
              fontFamily: '"Montserrat", sans-serif',
              transition: 'all 0.3s ease',
              willChange: 'transform',
              transformOrigin: 'center',
              display: 'flex',
              alignItems: 'flex-end',
              gap: 0.5,
              textShadow: '0 0 15px rgba(0,0,0,0.95), 0 2px 4px rgba(0,0,0,0.9)', // Ombre forte garantie
              ...(animate && {
                transform: 'scale(1.12)',
                transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.4, 1)',
              }),
              ...(isValueCritical && {
                textShadow: '0 0 20px rgba(255, 69, 0, 0.8), 0 2px 4px rgba(0,0,0,0.9)',
                animation: 'twinkle-halloween 2.5s infinite alternate',
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
                  color: '#d484f0',
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