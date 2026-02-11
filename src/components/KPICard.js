import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const getIconForTitle = (title) => {
  const lower = title.toLowerCase();
  if (lower.includes('agent')) return '❤️';
  if (lower.includes('call') || lower.includes('appel') || lower.includes('cœur')) return '💘';
  if (lower.includes('abandon') || lower.includes('perdu')) return '💔';
  if (lower.includes('aht') || lower.includes('durée') || lower.includes('temps')) return '⏱️';
  if (lower.includes('missed')) return '⏱️';
  if (lower.includes('total') || lower.includes('nombre')) return '📊';
  if (lower.includes('partag')) return '💕';
  return '❤️';
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
    if (isValueCritical) return '#c0392b'; // Rouge alerte
    switch (valueColor) {
      case 'success': return '#e74c3c'; // Rouge passion
      case 'warning': return '#ff9800';
      case 'error':   return '#c0392b'; // Rouge alerte
      case 'info':    return '#e74c3c';
      default:        return '#e74c3c';
    }
  };

  const icon = getIconForTitle(title);

  return (
    <>
      <style>{`
        @keyframes kpi-highlight-heart {
          0% { 
            background-color: rgba(231, 76, 60, 0.15); 
            box-shadow: 0 0 15px rgba(231, 76, 60, 0.4); 
          }
          100% { 
            background-color: transparent; 
            box-shadow: 0 0 0 rgba(231, 76, 60, 0); 
          }
        }

        @keyframes pulse-critical-heart {
          0%, 100% { box-shadow: 0 0 0 0 rgba(192, 57, 43, 0.7); }
          50% { box-shadow: 0 0 0 10px rgba(192, 57, 43, 0); }
        }

        @keyframes shake-critical-heart {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }

        @keyframes twinkle-flicker-heart {
          0%, 100% { opacity: 1; filter: brightness(1); }
          25% { opacity: 0.95; filter: brightness(1.2); }
          50% { opacity: 1; filter: brightness(0.9); }
          75% { opacity: 0.98; filter: brightness(1.1); }
        }

        @keyframes heart-drift-kpi {
          0% { transform: translateX(0) translateY(0); opacity: 0.6; }
          50% { transform: translateX(-6%) translateY(-4%); opacity: 0.8; }
          100% { transform: translateX(0) translateY(0); opacity: 0.6; }
        }
      `}</style>

      <Card
        sx={{
          backgroundColor: 'rgba(25, 25, 45, 0.85)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          height: `${height}px`,
          borderRadius: 3,
          border: `1px solid ${isValueCritical ? '#c0392b' : 'rgba(231, 76, 60, 0.4)'}`,
          boxShadow: isValueCritical 
            ? '0 0 20px rgba(192, 57, 43, 0.4)' 
            : '0 4px 16px rgba(0,0,0,0.5)',
          transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.4, 1)',
          ...(animate && {
            animation: `kpi-highlight-heart 0.8s ease-out`,
          }),
          ...(isValueCritical && {
            animation: 'shake-critical-heart 2.5s infinite, pulse-critical-heart 2s infinite',
            '&:hover': {
              animation: 'pulse-critical-heart 2s infinite',
            },
          }),
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: isValueCritical
              ? '0 8px 25px rgba(192, 57, 43, 0.5)'
              : '0 6px 20px rgba(231, 76, 60, 0.3)',
            border: `1px solid ${isValueCritical ? '#e74c3c' : '#ff6b6b'}`,
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: '10px',
            padding: '2px',
            background: isValueCritical
              ? 'radial-gradient(circle at 50% 0%, rgba(192, 57, 43, 0.15) 0%, transparent 70%)'
              : 'radial-gradient(circle at 50% 0%, rgba(231, 76, 60, 0.1) 0%, transparent 70%)',
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
              ? 'radial-gradient(circle at 60% 40%, rgba(192, 57, 43, 0.1), transparent 75%)'
              : 'radial-gradient(circle at 40% 60%, rgba(139, 0, 0, 0.1), transparent 80%)',
            pointerEvents: 'none',
            zIndex: 0,
            animation: 'heart-drift-kpi 18s linear infinite',
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
              color: '#ffffff',
              fontFamily: '"Playfair Display", serif',
              fontSize: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              textAlign: 'center',
              lineHeight: 1.3,
              letterSpacing: '0.05em',
              ...(isValueCritical && {
                animation: 'twinkle-flicker-heart 3s infinite alternate',
              }),
            }}
          >
            {icon} {title}
          </Typography>

          {subtitle && (
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#ffffff',
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
              fontFamily: '"Playfair Display", serif',
              transition: 'all 0.3s ease',
              willChange: 'transform',
              transformOrigin: 'center',
              display: 'flex',
              alignItems: 'flex-end',
              gap: 0.5,
              ...(animate && {
                transform: 'scale(1.2)',
                transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.4, 1)',
              }),
              ...(isValueCritical && {
                textShadow: '0 0 8px rgba(192, 57, 43, 0.6), 0 0 16px rgba(231, 76, 60, 0.4)',
                animation: 'twinkle-flicker-heart 2.5s infinite alternate',
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
                  color: '#ffffff',
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