import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const getIconForTitle = (title) => {
  const lower = title.toLowerCase();
  if (lower.includes('agent')) return '🎅';
  if (lower.includes('call') || lower.includes('appel')) return '📞';
  if (lower.includes('abandon')) return '🎁';
  if (lower.includes('aht')) return '⏳';
  if (lower.includes('missed')) return '❄️';
  if (lower.includes('total')) return '📊';
  return '🎄';
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
    if (isValueCritical) return '#d42426';
    switch (valueColor) {
      case 'success': return '#228b22';
      case 'warning': return '#ffaa00';
      case 'error':   return '#c1272d';
      case 'info':    return '#4fc3f7';
      default:        return '#000';
    }
  };

  const icon = getIconForTitle(title);

  return (
    <>
      <style>{`
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
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
          20%, 40%, 60%, 80% { transform: translateX(3px); }
        }

        @keyframes twinkle-flicker {
          0%, 100% { opacity: 1; filter: brightness(1); }
          25% { opacity: 0.95; filter: brightness(1.1); }
          50% { opacity: 1; filter: brightness(0.95); }
          75% { opacity: 0.98; filter: brightness(1.05); }
        }

        @keyframes snow-drift-kpi {
          0% { transform: translateX(0) translateY(0); opacity: 0.6; }
          50% { transform: translateX(-5%) translateY(-3%); opacity: 0.8; }
          100% { transform: translateX(0) translateY(0); opacity: 0.6; }
        }
      `}</style>

      <Card
        sx={{
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
            },
          }),
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: isValueCritical
              ? '0 8px 25px rgba(193, 39, 45, 0.7)'
              : '0 6px 20px rgba(212, 36, 38, 0.5)',
            border: `1px solid ${isValueCritical ? '#ffd700' : '#d42426'}`,
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
              ? 'radial-gradient(circle at 50% 0%, rgba(193,39,45,0.2) 0%, transparent 70%)'
              : 'radial-gradient(circle at 50% 0%, rgba(212,36,38,0.1) 0%, transparent 70%)',
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
              ? 'radial-gradient(circle at 60% 40%, rgba(212,36,38,0.12), transparent 75%)'
              : 'radial-gradient(circle at 40% 60%, rgba(46,139,87,0.08), transparent 80%)',
            pointerEvents: 'none',
            zIndex: 0,
            animation: 'snow-drift-kpi 18s linear infinite',
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
          {/* Titre – déjà en police festive */}
          <Typography
            variant="overline"
            sx={{
              fontWeight: 'bold',
              color: '#000',
              textShadow: '0 0 4px rgba(255,215,0,0.5)',
              fontFamily: '"Mountains of Christmas", cursive',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              textAlign: 'center',
              lineHeight: 1.3,
              ...(isValueCritical && {
                animation: 'twinkle-flicker 3s infinite alternate',
              }),
            }}
          >
            {icon} {title}
          </Typography>

          {/* Sous-titre – en gras et légèrement agrandi */}
          {subtitle && (
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'text.secondary', 
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

          {/* ✅ Valeur principale – MAINTENANT EN POLICE FESTIVE POUR TOUS */}
          <Typography
            variant="h3"
            component="div"
            sx={{
              mt: 1,
              color: getValueColor(),
              textAlign: 'center',
              fontWeight: 'bold',
              fontFamily: '"Mountains of Christmas", cursive', // ← ajouté ici
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
                textShadow: '0 0 6px rgba(255,215,0,0.8), 0 0 12px rgba(212,36,38,0.6)',
                animation: 'twinkle-flicker 2.5s infinite alternate',
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
                  color: 'text.secondary',
                  fontWeight: 'normal',
                  fontSize: '1rem',
                  fontFamily: 'inherit', // ou laisser sans pour garder la police par défaut
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