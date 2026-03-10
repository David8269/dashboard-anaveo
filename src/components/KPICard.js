import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const getIconForTitle = (title) => {
  const lower = title.toLowerCase();
  if (lower.includes('agent')) return '🔪';
  if (lower.includes('call') || lower.includes('appel')) return '🔪';
  if (lower.includes('abandon') || lower.includes('perdu')) return '🔪';
  if (lower.includes('aht') || lower.includes('durée') || lower.includes('temps')) return '⏱️';
  if (lower.includes('missed')) return '🔪';
  if (lower.includes('total') || lower.includes('nombre')) return '📊';
  if (lower.includes('sortant')) return '🔪';
  return '🔪';
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
    if (isValueCritical) return '#c62828';
    switch (valueColor) {
      case 'success': return '#8b0000';
      case 'warning': return '#a52a2a';
      case 'error':   return '#c62828';
      case 'info':    return '#696969';
      default:        return '#e0e0e0';
    }
  };

  const icon = getIconForTitle(title);

  return (
    <>
      <style>{`
        @keyframes kpi-highlight-friday {
          0% { 
            background-color: rgba(139, 0, 0, 0.15); 
            box-shadow: 0 0 15px rgba(139, 0, 0, 0.4), 0 0 25px rgba(255, 0, 0, 0.3); 
          }
          100% { 
            background-color: transparent; 
            box-shadow: 0 0 0 rgba(139, 0, 0, 0); 
          }
        }

        @keyframes pulse-critical-friday {
          0%, 100% { box-shadow: 0 0 0 0 rgba(198, 40, 40, 0.7); }
          50% { box-shadow: 0 0 0 12px rgba(198, 40, 40, 0); }
        }

        @keyframes shake-critical-friday {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }

        @keyframes twinkle-flicker-friday {
          0%, 100% { opacity: 1; filter: brightness(1); }
          25% { opacity: 0.95; filter: brightness(1.2); }
          50% { opacity: 1; filter: brightness(0.9); }
          75% { opacity: 0.98; filter: brightness(1.1); }
        }

        @keyframes friday-drift-kpi {
          0% { transform: translateX(0) translateY(0); opacity: 0.6; }
          50% { transform: translateX(-6%) translateY(-4%); opacity: 0.8; }
          100% { transform: translateX(0) translateY(0); opacity: 0.6; }
        }

        @keyframes color-shift-friday {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes gradient-border-kpi-friday {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>

      <Card
        sx={{
          backgroundColor: 'rgba(10, 10, 10, 0.85)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          height: `${height}px`,
          borderRadius: 3,
          border: '2px solid transparent',
          backgroundClip: 'padding-box',
          position: 'relative',
          overflow: 'hidden',
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
              ? 'linear-gradient(135deg, #c62828, #b71c1c, #8b0000)'
              : 'linear-gradient(135deg, #8b0000, #ff0000, #8b0000)',
            backgroundSize: '400% 400%',
            animation: isValueCritical ? 'none' : 'gradient-border-kpi-friday 8s ease infinite',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            zIndex: -1,
          },
          boxShadow: isValueCritical 
            ? '0 0 25px rgba(198, 40, 40, 0.5), 0 0 40px rgba(139, 0, 0, 0.3)' 
            : '0 4px 20px rgba(0, 0, 0, 0.7)',
          transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.4, 1)',
          ...(animate && {
            animation: `kpi-highlight-friday 0.8s ease-out`,
          }),
          ...(isValueCritical && {
            animation: 'shake-critical-friday 2.5s infinite, pulse-critical-friday 2s infinite',
            '&:hover': {
              animation: 'pulse-critical-friday 2s infinite',
            },
          }),
          '&:hover': {
            transform: 'translateY(-8px) scale(1.03)',
            boxShadow: isValueCritical
              ? '0 10px 30px rgba(198, 40, 40, 0.6), 0 0 40px rgba(139, 0, 0, 0.4)'
              : '0 8px 25px rgba(139, 0, 0, 0.6), 0 0 35px rgba(255, 0, 0, 0.5)',
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
              background: isValueCritical
                ? 'linear-gradient(135deg, #c62828, #b71c1c)'
                : 'linear-gradient(135deg, #8b0000, #ff0000, #8b0000)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundSize: '400% 400%',
              animation: isValueCritical ? 'twinkle-flicker-friday 3s infinite alternate' : 'color-shift-friday 6s ease infinite',
              fontFamily: '"Creepster", cursive',
              fontSize: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              textAlign: 'center',
              lineHeight: 1.3,
              textShadow: '0 0 8px rgba(0, 0, 0, 0.9), 0 0 12px rgba(255, 0, 0, 0.6)',
            }}
          >
            {icon} {title}
          </Typography>

          {subtitle && (
            <Typography 
              variant="caption" 
              sx={{ 
                color: '#e0e0e0',
                display: 'block', 
                mb: 1,
                fontSize: '0.95rem',
                fontWeight: 'bold',
                textAlign: 'center',
                lineHeight: 1.3,
                textShadow: '0 0 6px rgba(0, 0, 0, 0.9)',
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
              fontFamily: '"Creepster", cursive',
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
                textShadow: '0 0 10px rgba(198, 40, 40, 0.7), 0 0 20px rgba(198, 40, 40, 0.5)',
                animation: 'twinkle-flicker-friday 2.5s infinite alternate',
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
                  color: '#e0e0e0',
                  fontWeight: 'normal',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  textShadow: '0 0 6px rgba(0, 0, 0, 0.9)',
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