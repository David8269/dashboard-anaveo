import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const getIconForTitle = (title) => {
  const lower = title.toLowerCase();
  if (lower.includes('agent')) return '🧙‍♂️';
  if (lower.includes('call') || lower.includes('appel')) return '📞';
  if (lower.includes('abandon')) return '👻';
  if (lower.includes('aht')) return '⏳';
  if (lower.includes('missed')) return '💀';
  if (lower.includes('total')) return '📊';
  return '🔮';
};

export default function KPICard({ 
  title, 
  subtitle, 
  value, 
  valueColor, 
  height = 130, // ✅ Hauteur par défaut : 130px
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
    if (isValueCritical) return '#ff6b00';
    switch (valueColor) {
      case 'success': return '#01b68a';
      case 'warning': return '#ffaa00';
      case 'error':   return '#ff0a0a';
      case 'info':    return '#4fc3f7';
      default:        return '#ffd700';
    }
  };

  const icon = getIconForTitle(title);

  return (
    <>
      <style>{`
        @keyframes kpi-highlight-halloween {
          0% { 
            background-color: rgba(255, 107, 0, 0.3); 
            box-shadow: 0 0 15px rgba(255, 107, 0, 0.6); 
          }
          100% { 
            background-color: transparent; 
            box-shadow: 0 0 0 rgba(255, 107, 0, 0); 
          }
        }
        @keyframes pulse-critical {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255, 107, 0, 0.7); }
          50% { box-shadow: 0 0 0 10px rgba(255, 107, 0, 0); }
        }
        @keyframes shake-critical {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
          20%, 40%, 60%, 80% { transform: translateX(3px); }
        }
      `}</style>

      <Card
        sx={{
          backgroundColor: 'var(--halloween-paper, #1a0a2e)',
          height: `${height}px`, // ✅ Applique la hauteur fixe
          borderRadius: 3,
          border: `1px solid ${isValueCritical ? '#ff0a0a' : 'var(--halloween-primary, #ff6b00)'}`,
          boxShadow: isValueCritical 
            ? '0 0 20px rgba(255, 10, 10, 0.5)' 
            : '0 0 12px rgba(255, 107, 0, 0.3)',
          backdropFilter: 'blur(4px)',
          transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.4, 1)',
          ...(animate && {
            animation: `kpi-highlight-halloween 0.8s ease-out`,
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
              ? '0 8px 25px rgba(255, 10, 10, 0.7)'
              : '0 6px 20px rgba(255, 107, 0, 0.5)',
            border: `1px solid ${isValueCritical ? '#ff6b00' : '#ffd700'}`,
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
              ? 'radial-gradient(circle at 50% 0%, rgba(255,10,10,0.2) 0%, transparent 70%)'
              : 'radial-gradient(circle at 50% 0%, rgba(255,107,0,0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
          },
        }}
      >
        <CardContent
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center', // ✅ Centre verticalement le contenu
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
              textShadow: '0 0 6px rgba(255,215,0,0.6)',
              fontFamily: '"Orbitron", sans-serif',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              textAlign: 'center',
              lineHeight: 1.3,
            }}
          >
            {icon} {title}
          </Typography>

          {subtitle && (
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'text.secondary', 
                display: 'block', 
                mb: 1,
                fontSize: '0.75rem',
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
                fontFamily: '"Orbitron", sans-serif',
                textShadow: '0 0 8px rgba(255,107,0,0.9), 0 0 16px rgba(255,10,10,0.7)',
              }),
            }}
            aria-live="polite"
            className={isValueCritical ? 'flame-text' : ''}
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