import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { keyframes } from '@emotion/react';

// Animation d'highlight subtile quand la valeur change
const highlightAnimation = keyframes`
  0% { background-color: rgba(255, 255, 255, 0.2); }
  100% { background-color: transparent; }
`;

function KPICard({ title, subtitle, value, valueColor, height, unit, tooltip }) {
  const [animate, setAnimate] = useState(false);
  const prevValueRef = useRef(value);

  // Déclenche l'animation quand la valeur change (sauf au premier rendu)
  useEffect(() => {
    if (prevValueRef.current !== value) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 800);
      return () => clearTimeout(timer);
    }
    prevValueRef.current = value;
  }, [value]);

  return (
    <Card
      sx={{
        backgroundColor: 'background.paper',
        height: height || 'auto',
        borderRadius: 3,
        transition: 'all 0.3s ease',
        ...(animate && {
          animation: `${highlightAnimation} 0.8s ease-out`,
        }),
        position: 'relative',
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
        }}
      >
        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 'bold' }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            {subtitle}
          </Typography>
        )}
        <Typography
          variant="h3"
          component="div"
          sx={{
            mt: 1,
            color: (theme) => {
              if (!valueColor) return theme.palette.text.primary;
              return theme.palette[valueColor]?.main || theme.palette.text.primary;
            },
            textAlign: 'center',
            fontWeight: 'bold',
            transition: 'color 0.3s ease',
            willChange: 'transform',
            transformOrigin: 'center',
            display: 'flex',
            alignItems: 'flex-end',
            gap: 0.5,
            ...(animate && {
              transform: 'scale(1.05)',
              transition: 'transform 0.2s ease',
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
              }}
            >
              {unit}
            </Typography>
          )}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default KPICard;