import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, Typography } from '@mui/material';

// === 🦉 Icônes thème INNOVEO ===
const getIconForTitle = (title) => {
  const lower = title.toLowerCase();
  if (lower.includes('agent') || lower.includes('tech')) return '🦉';
  if (lower.includes('call') || lower.includes('appel') || lower.includes('entrant')) return '📥';
  if (lower.includes('abandon') || lower.includes('perdu') || lower.includes('missed')) return '⚠️';
  if (lower.includes('aht') || lower.includes('durée') || lower.includes('temps')) return '⏱️';
  if (lower.includes('total') || lower.includes('nombre')) return '📊';
  if (lower.includes('outbound') || lower.includes('sortant')) return '📤';
  if (lower.includes('rate') || lower.includes('taux')) return '📈';
  return '💠';
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
  
  // === 🦉 Couleurs adaptées au thème INNOVEO ===
  const getValueColor = () => {
    if (isValueCritical) return '#ff4500'; // Rouge Alerte
    switch (valueColor) {
      case 'success': return '#00ff64';    // Vert Tech (succès)
      case 'warning': return '#FFD700';    // Or (attention)
      case 'error':   return '#ff4500';    // Rouge Alerte (erreur)
      case 'info':    return '#00D4FF';    // Cyan (info)
      default:        return '#ffffff';    // Blanc Pur (défaut)
    }
  };

  const icon = getIconForTitle(title);
  const textColor = getValueColor();

  return (
    <>
      <style>{`
        /* 🦉 Animation mise à jour KPI (Lueur Cyan/Or ultra-transparente) */
        @keyframes kpi-highlight-tech {
          0% { 
            background-color: rgba(0, 212, 255, 0.15); 
            box-shadow: 0 0 25px rgba(0, 212, 255, 0.3); 
          }
          100% { 
            background-color: rgba(0, 15, 25, 0.15); 
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), inset 0 0 20px rgba(0, 212, 255, 0.05); 
          }
        }

        /* 🔴 Animation critique – Lueur Rouge vif */
        @keyframes pulse-critical-tech {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255, 69, 0, 0.5); }
          50% { box-shadow: 0 0 0 12px rgba(255, 69, 0, 0); }
        }

        /* 📳 Secousse subtile pour alerte */
        @keyframes shake-critical {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }

        /* ✨ Scintillement Tech */
        @keyframes twinkle-tech {
          0%, 100% { opacity: 1; filter: brightness(1); }
          50% { opacity: 0.9; filter: brightness(1.2); }
        }

        /* 🌫️ Lueur ambiante flottante (Cyan/Or) */
        @keyframes tech-drift-kpi {
          0% { transform: translateX(0) translateY(0); opacity: 0.3; }
          50% { transform: translateX(-5%) translateY(-3%); opacity: 0.6; }
          100% { transform: translateX(0) translateY(0); opacity: 0.3; }
        }

        /* ⚡ Effet onde/ondulation au survol */
        .kpi-tech-ripple::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(0, 212, 255, 0.15) 0%, transparent 70%);
          opacity: 0;
          transform: scale(0.3);
          transition: all 0.4s ease;
          pointer-events: none;
          border-radius: 50%;
          z-index: 2;
        }
        .kpi-tech-ripple:hover::before {
          opacity: 1;
          transform: scale(1);
          animation: tech-ripple-anim 0.6s ease-out;
        }
        @keyframes tech-ripple-anim {
          0% { transform: scale(0.3); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>

      <Card
        className="kpi-tech-ripple"
        sx={{
          // === Glassmorphism "Tech Glass" INNOVEO (TRANSPARENCE MAXIMALE) ===
          backgroundColor: 'rgba(0, 15, 25, 0.15)', // ✅ Transparence accrue
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          height: `${height}px`,
          borderRadius: 4,
          border: `1px solid ${isValueCritical ? 'rgba(255, 69, 0, 0.4)' : 'rgba(0, 212, 255, 0.35)'}`,
          borderTop: `2px solid #FFD700`, // Bordure Or
          boxShadow: isValueCritical 
            ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 69, 0, 0.2)' 
            : '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 0 20px rgba(0, 212, 255, 0.05)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          ...(animate && {
            animation: `kpi-highlight-tech 0.8s ease-out`,
          }),
          ...(isValueCritical && {
            animation: 'shake-critical 2.5s infinite, pulse-critical-tech 2s infinite',
            '&:hover': {
              animation: 'pulse-critical-tech 2s infinite',
            },
          }),
          '&:hover': {
            transform: 'translateY(-4px)',
            backgroundColor: 'rgba(0, 20, 30, 0.20)', // ✅ Transparence accrue au hover
            borderColor: isValueCritical
              ? 'rgba(255, 69, 0, 0.7)'
              : 'rgba(0, 212, 255, 0.6)',
            boxShadow: isValueCritical
              ? '0 12px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(255, 69, 0, 0.3)'
              : '0 12px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 212, 255, 0.2)',
          },
          position: 'relative',
          overflow: 'hidden',
          // === Lueur ambiante Tech ===
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: isValueCritical
              ? 'radial-gradient(circle at 50% 0%, rgba(255, 69, 0, 0.1) 0%, transparent 70%)'
              : 'radial-gradient(circle at 50% 0%, rgba(0, 212, 255, 0.08) 0%, transparent 70%)',
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
              ? 'radial-gradient(circle at 60% 40%, rgba(255, 69, 0, 0.06), transparent 75%)'
              : 'radial-gradient(circle at 40% 60%, rgba(255, 215, 0, 0.06), transparent 80%)',
            pointerEvents: 'none',
            zIndex: 0,
            animation: 'tech-drift-kpi 18s linear infinite',
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
              color: isValueCritical ? '#ff4500' : '#00D4FF',
              textShadow: isValueCritical ? '0 0 10px rgba(255, 69, 0, 0.6)' : '0 0 10px rgba(0, 212, 255, 0.5)',
              fontFamily: '"Orbitron", sans-serif',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              textAlign: 'center',
              lineHeight: 1.3,
              letterSpacing: '0.5px',
              ...(isValueCritical && {
                animation: 'twinkle-tech 3s infinite alternate',
              }),
            }}
          >
            {icon} {title}
          </Typography>

          {subtitle && (
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#FFD700',
                display: 'block', 
                mb: 1,
                fontSize: '0.85rem',
                fontWeight: 600,
                textAlign: 'center',
                lineHeight: 1.3,
                fontFamily: '"Rajdhani", sans-serif',
                letterSpacing: '0.5px',
                textShadow: '0 0 8px rgba(255, 215, 0, 0.4)',
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
              color: textColor,
              textAlign: 'center',
              fontWeight: 800,
              fontFamily: '"Orbitron", sans-serif',
              transition: 'all 0.3s ease',
              willChange: 'transform',
              transformOrigin: 'center',
              display: 'flex',
              alignItems: 'flex-end',
              gap: 0.5,
              textShadow: `0 0 15px ${isValueCritical ? 'rgba(255, 69, 0, 0.6)' : 'rgba(255, 255, 255, 0.3)'}`,
              ...(animate && {
                transform: 'scale(1.12)',
                transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.4, 1)',
              }),
              ...(isValueCritical && {
                textShadow: '0 0 20px rgba(255, 69, 0, 0.8)',
                animation: 'twinkle-tech 2.5s infinite alternate',
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
                  color: '#FFD700',
                  fontWeight: 600,
                  fontSize: '1rem',
                  fontFamily: '"Rajdhani", sans-serif',
                  ml: 0.5,
                  textShadow: '0 0 8px rgba(255, 215, 0, 0.4)',
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