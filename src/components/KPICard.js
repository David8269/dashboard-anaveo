import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const getIconForTitle = (title) => {
  const lower = title.toLowerCase();
  if (lower.includes('agent')) return '👔';
  if (lower.includes('call') || lower.includes('appel')) return '📞';
  if (lower.includes('abandon')) return '⚠️';
  if (lower.includes('aht')) return '⏱️';
  if (lower.includes('missed')) return '⏱️';
  if (lower.includes('total')) return '📊';
  return '🌟';
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
    if (isValueCritical) return '#ffd700';
    switch (valueColor) {
      case 'success': return '#2e8b57';
      case 'warning': return '#d4af37';
      case 'error':   return '#ffd700';
      case 'info':    return '#4fc3f7';
      default:        return '#ffffff';
    }
  };

  const icon = getIconForTitle(title);

  return (
    <>
      <style>{`
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
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
          20%, 40%, 60%, 80% { transform: translateX(3px); }
        }

        @keyframes twinkle-flicker-ny {
          0%, 100% { opacity: 1; filter: brightness(1); }
          25% { opacity: 0.95; filter: brightness(1.1); }
          50% { opacity: 1; filter: brightness(0.95); }
          75% { opacity: 0.98; filter: brightness(1.05); }
        }

        @keyframes gold-drift-kpi {
          0% { transform: translateX(0) translateY(0); opacity: 0.6; }
          50% { transform: translateX(-5%) translateY(-3%); opacity: 0.8; }
          100% { transform: translateX(0) translateY(0); opacity: 0.6; }
        }
      `}</style>

      <Card
        sx={{
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
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
            },
          }),
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: isValueCritical
              ? '0 8px 25px rgba(255, 215, 0, 0.8)'
              : '0 6px 20px rgba(212, 175, 55, 0.6)',
            border: `1px solid ${isValueCritical ? '#ffd700' : '#d4af37'}`,
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
              ? 'radial-gradient(circle at 50% 0%, rgba(255,215,0,0.2) 0%, transparent 70%)'
              : 'radial-gradient(circle at 50% 0%, rgba(212,175,55,0.1) 0%, transparent 70%)',
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
              ? 'radial-gradient(circle at 60% 40%, rgba(255,215,0,0.15), transparent 75%)'
              : 'radial-gradient(circle at 40% 60%, rgba(46,139,87,0.08), transparent 80%)',
            pointerEvents: 'none',
            zIndex: 0,
            animation: 'gold-drift-kpi 18s linear infinite',
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
              color: '#ffd700',
              textShadow: '0 0 6px rgba(212,175,55,0.7)',
              fontFamily: '"Orbitron", sans-serif',
              fontSize: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              textAlign: 'center',
              lineHeight: 1.3,
              ...(isValueCritical && {
                animation: 'twinkle-flicker-ny 3s infinite alternate',
              }),
            }}
          >
            {icon} {title}
          </Typography>

          {subtitle && (
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#d4af37', 
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

          <Typography
            variant="h3"
            component="div"
            sx={{
              mt: 1,
              color: getValueColor(),
              textAlign: 'center',
              fontWeight: 'bold',
              fontFamily: '"Orbitron", sans-serif',
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
                textShadow: '0 0 8px rgba(255,215,0,0.9), 0 0 16px rgba(212,175,55,0.7)',
                animation: 'twinkle-flicker-ny 2.5s infinite alternate',
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
                  color: '#d4af37',
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