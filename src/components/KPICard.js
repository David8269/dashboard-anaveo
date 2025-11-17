import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const getIconForTitle = (title) => {
  const lower = title.toLowerCase();
  if (lower.includes('agent')) return '👥';
  if (lower.includes('call') || lower.includes('appel')) return '📞';
  if (lower.includes('abandon')) return '⚠️';
  if (lower.includes('aht')) return '⏱️';
  if (lower.includes('missed')) return '❌';
  if (lower.includes('total')) return '📊';
  return '📈';
};

// Utilitaire : convertit une valeur en nombre si possible, sinon null
const toNumberOrNull = (val) => {
  if (typeof val === 'number' && !isNaN(val)) return val;
  if (typeof val === 'string') {
    const num = Number(val);
    return isNaN(num) ? null : num;
  }
  return null;
};

// ✅ Style de base avec transparence et fond orange pastel (comme l'horloge)
const baseCardStyle = {
  height: '100%',
  borderRadius: 3,
  position: 'relative',
  overflow: 'hidden',
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

  // 🔁 Animation douce au changement de valeur (sauf pour missed calls = 0)
  useEffect(() => {
    if (prevValueRef.current !== value) {
      const isMissedCallKPI = title?.toLowerCase().includes('missed');
      const numericValue = toNumberOrNull(value);
      const shouldSkipAnimation = isMissedCallKPI && numericValue === 0;

      if (!shouldSkipAnimation) {
        setAnimate(true);
        const timer = setTimeout(() => setAnimate(false), 600);
        return () => clearTimeout(timer);
      }
    }
    prevValueRef.current = value;
  }, [value, title]);

  // 🔤 Logique d'affichage dynamique
  const isMissedCallKPI = title?.toLowerCase().includes('missed');
  const numericValue = toNumberOrNull(value);

  let displayTitle = title || 'KPI';
  let computedValueColor = valueColor;

  if (isMissedCallKPI && numericValue !== null) {
    if (numericValue === 0) {
      displayTitle = 'missed call';
      computedValueColor = 'success';
    } else if (numericValue === 1) {
      displayTitle = 'missed call';
      computedValueColor = 'error';
    } else if (numericValue >= 2) {
      displayTitle = 'missed calls';
      computedValueColor = 'error';
    }
  }

  const isValueCritical = isCritical || computedValueColor === 'error';

  const getValueColor = () => {
    if (isValueCritical) return '#D32F2F'; // Rouge doux
    switch (computedValueColor) {
      case 'success': return '#388E3C'; // Vert forêt
      case 'warning': return '#F57C00'; // Orange automnal
      case 'error':   return '#D32F2F';
      case 'info':    return '#1976D2'; // Bleu discret
      default:        return 'var(--wine-primary)'; // Marron foncé du thème
    }
  };

  const icon = getIconForTitle(title || '');
  const displayValue = value != null ? String(value) : '-';

  // ✅ Calcul dynamique du style de la carte avec fond orange pastel (comme l'horloge)
  const cardSx = {
    ...baseCardStyle,
    backgroundColor: 'rgba(255, 235, 220, 0.8)', // 🍊 Orange pastel (comme l'horloge)
    height: `${height}px`,
    border: `1px solid ${isValueCritical ? '#D32F2F' : '#8D6E63'}`, // Bordure marron (comme l'horloge), rouge si critique
    boxShadow: isValueCritical 
      ? '0 4px 12px rgba(211, 47, 47, 0.25)'
      : '0 2px 6px rgba(141, 110, 99, 0.2)', // Ombre subtile (comme l'horloge)
    transition: 'all 0.3s ease',
    ...(animate && {
      transform: 'scale(1.03)',
      boxShadow: '0 6px 16px rgba(141, 110, 99, 0.3)',
    }),
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: isValueCritical
        ? '0 6px 16px rgba(211, 47, 47, 0.35)'
        : '0 6px 16px rgba(141, 110, 99, 0.3)',
      border: `1px solid ${isValueCritical ? '#C62828' : '#5D4037'}`, // Bordure marron foncé au hover, rouge si critique
    },
  };

  return (
    <Card sx={cardSx}>
      <CardContent
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: tooltip ? 'help' : 'default',
          padding: '16px !important',
        }}
      >
        <Typography
          variant="overline"
          sx={{
            fontWeight: 'bold',
            color: 'var(--wine-primary)',
            fontFamily: '"Roboto", sans-serif',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            textAlign: 'center',
            lineHeight: 1.3,
          }}
        >
          {icon} {displayTitle}
        </Typography>

        {subtitle && (
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'var(--wine-text)', // Utilise la couleur de texte générale
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
            transition: 'transform 0.2s ease',
            ...(animate && {
              transform: 'scale(1.1)',
            }),
          }}
          aria-live="polite"
        >
          {displayValue}
          {unit && (
            <Typography
              component="span"
              variant="subtitle1"
              sx={{
                color: 'var(--wine-text)', // Couleur de texte secondaire
                fontWeight: 'normal',
                fontSize: '1rem',
                ml: 0.5,
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