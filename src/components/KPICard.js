import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const getIconForTitle = (title) => {
  const lower = title.toLowerCase();
<<<<<<< HEAD
  if (lower.includes('agent')) return '👔';
  if (lower.includes('call') || lower.includes('appel')) return '📞';
  if (lower.includes('abandon')) return '⚠️';
  if (lower.includes('aht')) return '⏱️';
  if (lower.includes('missed')) return '⏱️';
  if (lower.includes('total')) return '📊';
  return '🌟';
=======
  if (lower.includes('agent')) return '🎅';
  if (lower.includes('call') || lower.includes('appel')) return '📞';
  if (lower.includes('abandon')) return '🎁';
  if (lower.includes('aht')) return '⏳';
  if (lower.includes('missed')) return '❄️';
  if (lower.includes('total')) return '📊';
  return '🎄';
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
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
  const getValueColor = () => {
<<<<<<< HEAD
    if (isValueCritical) return '#ffd700';
    switch (valueColor) {
      case 'success': return '#2e8b57';
      case 'warning': return '#d4af37';
      case 'error':   return '#ffd700';
      case 'info':    return '#4fc3f7';
      default:        return '#ffffff';
=======
    if (isValueCritical) return '#d42426';
    switch (valueColor) {
      case 'success': return '#228b22';
      case 'warning': return '#ffaa00';
      case 'error':   return '#c1272d';
      case 'info':    return '#4fc3f7';
      default:        return '#000';
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
    }
  };

  const icon = getIconForTitle(title);

  return (
    <>
      <style>{`
<<<<<<< HEAD
        @keyframes kpi-highlight-ny {
          0% { 
            background-color: rgba(212, 175, 55, 0.15); 
            box-shadow: 0 0 15px rgba(212, 175, 55, 0.5); 
          }
          100% { 
            background-color: transparent; 
            box-shadow: 0 0 0 rgba(212, 175, 55, 0); 
          }
        }

        @keyframes pulse-critical-ny {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.7); }
          50% { box-shadow: 0 0 0 10px rgba(255, 215, 0, 0); }
        }

        @keyframes shake-critical-ny {
=======
        @keyframes kpi-highlight-christmas {
          0% { 
            background-color: rgba(212, 36, 38, 0.2); 
            box-shadow: 0 0 15px rgba(212, 36, 38, 0.5); 
          }
          100% { 
            background-color: transparent; 
            box-shadow: 0 0 0 rgba(212, 36, 38, 0); 
          }
        }

        @keyframes pulse-critical {
          0%, 100% { box-shadow: 0 0 0 0 rgba(212, 36, 38, 0.7); }
          50% { box-shadow: 0 0 0 10px rgba(212, 36, 38, 0); }
        }

        @keyframes shake-critical {
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
          20%, 40%, 60%, 80% { transform: translateX(3px); }
        }

<<<<<<< HEAD
        @keyframes twinkle-flicker-ny {
=======
        @keyframes twinkle-flicker {
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
          0%, 100% { opacity: 1; filter: brightness(1); }
          25% { opacity: 0.95; filter: brightness(1.1); }
          50% { opacity: 1; filter: brightness(0.95); }
          75% { opacity: 0.98; filter: brightness(1.05); }
        }

<<<<<<< HEAD
        @keyframes gold-drift-kpi {
=======
        @keyframes snow-drift-kpi {
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
          0% { transform: translateX(0) translateY(0); opacity: 0.6; }
          50% { transform: translateX(-5%) translateY(-3%); opacity: 0.8; }
          100% { transform: translateX(0) translateY(0); opacity: 0.6; }
        }
      `}</style>

      <Card
        sx={{
<<<<<<< HEAD
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(6px)', // 👈 Ajout du flou
          WebkitBackdropFilter: 'blur(6px)', // compatibilité WebKit
          height: `${height}px`,
          borderRadius: 3,
          border: `1px solid ${isValueCritical ? '#ffd700' : 'rgba(212, 175, 55, 0.7)'}`,
          boxShadow: isValueCritical 
            ? '0 0 20px rgba(255, 215, 0, 0.6)' 
            : '0 0 12px rgba(212, 175, 55, 0.4)',
          transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.4, 1)',
          ...(animate && {
            animation: `kpi-highlight-ny 0.8s ease-out`,
          }),
          ...(isValueCritical && {
            animation: 'shake-critical-ny 2.5s infinite, pulse-critical-ny 2s infinite',
            '&:hover': {
              animation: 'pulse-critical-ny 2s infinite',
=======
          backgroundColor: 'rgba(255, 255, 255, 0.70)',
          height: `${height}px`,
          borderRadius: 3,
          border: `1px solid ${isValueCritical ? '#c1272d' : 'var(--christmas-primary, #d42426)'}`,
          boxShadow: isValueCritical 
            ? '0 0 20px rgba(193, 39, 45, 0.5)' 
            : '0 0 12px rgba(212, 36, 38, 0.3)',
          transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.4, 1)',
          ...(animate && {
            animation: `kpi-highlight-christmas 0.8s ease-out`,
          }),
          ...(isValueCritical && {
            animation: 'shake-critical 2.5s infinite, pulse-critical 2s infinite',
            '&:hover': {
              animation: 'pulse-critical 2s infinite',
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
            },
          }),
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: isValueCritical
<<<<<<< HEAD
              ? '0 8px 25px rgba(255, 215, 0, 0.8)'
              : '0 6px 20px rgba(212, 175, 55, 0.6)',
            border: `1px solid ${isValueCritical ? '#ffd700' : '#d4af37'}`,
=======
              ? '0 8px 25px rgba(193, 39, 45, 0.7)'
              : '0 6px 20px rgba(212, 36, 38, 0.5)',
            border: `1px solid ${isValueCritical ? '#ffd700' : '#d42426'}`,
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
          },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: isValueCritical
<<<<<<< HEAD
              ? 'radial-gradient(circle at 50% 0%, rgba(255,215,0,0.2) 0%, transparent 70%)'
              : 'radial-gradient(circle at 50% 0%, rgba(212,175,55,0.1) 0%, transparent 70%)',
=======
              ? 'radial-gradient(circle at 50% 0%, rgba(193,39,45,0.2) 0%, transparent 70%)'
              : 'radial-gradient(circle at 50% 0%, rgba(212,36,38,0.1) 0%, transparent 70%)',
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
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
<<<<<<< HEAD
              ? 'radial-gradient(circle at 60% 40%, rgba(255,215,0,0.15), transparent 75%)'
              : 'radial-gradient(circle at 40% 60%, rgba(46,139,87,0.08), transparent 80%)',
            pointerEvents: 'none',
            zIndex: 0,
            animation: 'gold-drift-kpi 18s linear infinite',
=======
              ? 'radial-gradient(circle at 60% 40%, rgba(212,36,38,0.12), transparent 75%)'
              : 'radial-gradient(circle at 40% 60%, rgba(46,139,87,0.08), transparent 80%)',
            pointerEvents: 'none',
            zIndex: 0,
            animation: 'snow-drift-kpi 18s linear infinite',
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
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
<<<<<<< HEAD
=======
          {/* Titre – déjà en police festive */}
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
          <Typography
            variant="overline"
            sx={{
              fontWeight: 'bold',
<<<<<<< HEAD
              color: '#ffd700',
              textShadow: '0 0 6px rgba(212,175,55,0.7)',
              fontFamily: '"Orbitron", sans-serif',
              fontSize: '1.2rem',
=======
              color: '#000',
              textShadow: '0 0 4px rgba(255,215,0,0.5)',
              fontFamily: '"Mountains of Christmas", cursive',
              fontSize: '1.1rem',
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              textAlign: 'center',
              lineHeight: 1.3,
              ...(isValueCritical && {
<<<<<<< HEAD
                animation: 'twinkle-flicker-ny 3s infinite alternate',
=======
                animation: 'twinkle-flicker 3s infinite alternate',
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
              }),
            }}
          >
            {icon} {title}
          </Typography>

<<<<<<< HEAD
=======
          {/* Sous-titre – en gras et légèrement agrandi */}
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
          {subtitle && (
            <Typography 
              variant="caption" 
              sx={{ 
<<<<<<< HEAD
                color: '#d4af37', 
=======
                color: 'text.secondary', 
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
                display: 'block', 
                mb: 1,
                fontSize: '0.95rem',
                fontWeight: 'bold',
                textAlign: 'center',
                lineHeight: 1.3,
              }}
            >
              {subtitle}
            </Typography>
          )}

<<<<<<< HEAD
=======
          {/* ✅ Valeur principale – MAINTENANT EN POLICE FESTIVE POUR TOUS */}
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
          <Typography
            variant="h3"
            component="div"
            sx={{
              mt: 1,
              color: getValueColor(),
              textAlign: 'center',
              fontWeight: 'bold',
<<<<<<< HEAD
              fontFamily: '"Orbitron", sans-serif',
=======
              fontFamily: '"Mountains of Christmas", cursive', // ← ajouté ici
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
              transition: 'all 0.3s ease',
              willChange: 'transform',
              transformOrigin: 'center',
              display: 'flex',
              alignItems: 'flex-end',
              gap: 0.5,
              ...(animate && {
                transform: 'scale(1.15)',
                transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.4, 1)',
              }),
              ...(isValueCritical && {
<<<<<<< HEAD
                textShadow: '0 0 8px rgba(255,215,0,0.9), 0 0 16px rgba(212,175,55,0.7)',
                animation: 'twinkle-flicker-ny 2.5s infinite alternate',
=======
                textShadow: '0 0 6px rgba(255,215,0,0.8), 0 0 12px rgba(212,36,38,0.6)',
                animation: 'twinkle-flicker 2.5s infinite alternate',
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
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
<<<<<<< HEAD
                  color: '#d4af37',
                  fontWeight: 'normal',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
=======
                  color: 'text.secondary',
                  fontWeight: 'normal',
                  fontSize: '1rem',
                  fontFamily: 'inherit', // ou laisser sans pour garder la police par défaut
>>>>>>> b10f4178cd08d38775d6e21be334baa21a8b1ff5
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