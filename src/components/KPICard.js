import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const getIconForTitle = (title) => {
  const lower = title.toLowerCase();
  if (lower.includes('agent')) return '👨‍🍳';
  if (lower.includes('call') || lower.includes('appel') || lower.includes('crêpe')) return '🥞';
  if (lower.includes('abandon') || lower.includes('brûlée')) return '🔥';
  if (lower.includes('aht') || lower.includes('durée') || lower.includes('temps')) return '⏱️';
  if (lower.includes('missed')) return '⏱️';
  if (lower.includes('total') || lower.includes('nombre')) return '📊';
  if (lower.includes('retourn')) return '🔄';
  return '👨‍🍳';
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
    if (isValueCritical) return '#c62828'; // Rouge alerte
    switch (valueColor) {
      case 'success': return '#FFD700'; // Or doré
      case 'warning': return '#ff9800';
      case 'error':   return '#c62828'; // Rouge alerte
      case 'info':    return '#FFD700';
      default:        return '#FFD700';
    }
  };

  const icon = getIconForTitle(title);

  return (
    <>
      <style>{`
        @keyframes kpi-highlight-crepe {
          0% { 
            background-color: rgba(255, 215, 0, 0.15); 
            box-shadow: 0 0 15px rgba(255, 215, 0, 0.4); 
          }
          100% { 
            background-color: transparent; 
            box-shadow: 0 0 0 rgba(255, 215, 0, 0); 
          }
        }

        @keyframes pulse-critical-crepe {
          0%, 100% { box-shadow: 0 0 0 0 rgba(198, 40, 40, 0.7); }
          50% { box-shadow: 0 0 0 10px rgba(198, 40, 40, 0); }
        }

        @keyframes shake-critical-crepe {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
          20%, 40%, 60%, 80% { transform: translateX(3px); }
        }

        @keyframes twinkle-flicker-crepe {
          0%, 100% { opacity: 1; filter: brightness(1); }
          25% { opacity: 0.95; filter: brightness(1.1); }
          50% { opacity: 1; filter: brightness(0.95); }
          75% { opacity: 0.98; filter: brightness(1.05); }
        }

        @keyframes crepe-drift-kpi {
          0% { transform: translateX(0) translateY(0); opacity: 0.6; }
          50% { transform: translateX(-5%) translateY(-3%); opacity: 0.8; }
          100% { transform: translateX(0) translateY(0); opacity: 0.6; }
        }
      `}</style>

      <Card
        sx={{
          backgroundColor: 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          height: `${height}px`,
          borderRadius: 3,
          border: `1px solid ${isValueCritical ? '#c62828' : 'rgba(255, 215, 0, 0.6)'}`,
          boxShadow: isValueCritical 
            ? '0 0 20px rgba(198, 40, 40, 0.4)' 
            : '0 4px 16px rgba(0,0,0,0.4)',
          transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.4, 1)',
          ...(animate && {
            animation: `kpi-highlight-crepe 0.8s ease-out`,
          }),
          ...(isValueCritical && {
            animation: 'shake-critical-crepe 2.5s infinite, pulse-critical-crepe 2s infinite',
            '&:hover': {
              animation: 'pulse-critical-crepe 2s infinite',
            },
          }),
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: isValueCritical
              ? '0 8px 25px rgba(198, 40, 40, 0.5)'
              : '0 6px 20px rgba(255, 215, 0, 0.4)',
            border: `1px solid ${isValueCritical ? '#ff5252' : '#FFD700'}`,
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
              ? 'radial-gradient(circle at 50% 0%, rgba(198, 40, 40, 0.15) 0%, transparent 70%)'
              : 'radial-gradient(circle at 50% 0%, rgba(255, 215, 0, 0.1) 0%, transparent 70%)',
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
              ? 'radial-gradient(circle at 60% 40%, rgba(198, 40, 40, 0.1), transparent 75%)'
              : 'radial-gradient(circle at 40% 60%, rgba(93, 64, 55, 0.1), transparent 80%)',
            pointerEvents: 'none',
            zIndex: 0,
            animation: 'crepe-drift-kpi 18s linear infinite',
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
              color: '#FFD700',
              textShadow: '0 0 12px rgba(255, 215, 0, 0.8)',
              fontFamily: '"Montserrat", sans-serif',
              fontSize: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              textAlign: 'center',
              lineHeight: 1.3,
              ...(isValueCritical && {
                animation: 'twinkle-flicker-crepe 3s infinite alternate',
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
              fontFamily: '"Montserrat", sans-serif',
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
                textShadow: '0 0 8px rgba(198, 40, 40, 0.6), 0 0 16px rgba(255, 82, 82, 0.4)',
                animation: 'twinkle-flicker-crepe 2.5s infinite alternate',
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