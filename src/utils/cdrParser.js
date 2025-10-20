// src/utils/cdrParser.js
import { AUTHORIZED_AGENTS } from '../config/agents';

/**
 * Ensemble de mots-clés techniques qui ne peuvent pas être des noms d'agent.
 */
const TECHNICAL_KEYWORDS = new Set([
  'provider', 'queue', 'extension', 'external_line', 'default',
  'replaceddst', 'chain:', 'front office', 'sortante', 'entrante', 'outbound_rule',
  'anonymous', 'unknown', 'caller', 'callee', 'system',
  '', 'null', 'undefined'
]);

/**
 * Détermine si une chaîne ressemble à un nom humain.
 */
const isLikelyName = (str) => {
  if (typeof str !== 'string') return false;
  
  const clean = str.trim();
  if (!clean) return false;
  
  if (TECHNICAL_KEYWORDS.has(clean.toLowerCase())) return false;
  
  // Rejeter les chaînes purement numériques (même avec des espaces)
  if (/^\s*\d+\s*$/.test(clean)) return false;
  
  // Rejeter si aucune lettre alphabétique (y compris accentuée)
  if (!/[a-zA-ZÀ-ÿ]/.test(clean)) return false;
  
  // Rejeter les chaînes trop longues
  if (clean.length > 50) return false;
  
  return true;
};

/**
 * Parse une date au format "YYYY/MM/DD HH:MM:SS".
 */
export const parseCDRDate = (str) => {
  if (!str || typeof str !== 'string') return null;
  
  const [datePart, timePart] = str.split(' ');
  if (!datePart || !timePart) return null;
  
  const [y, m, d] = datePart.split('/');
  const [hh, mm, ss] = timePart.split(':');
  
  if (
    !y || !m || !d || !hh || !mm || !ss ||
    isNaN(y) || isNaN(m) || isNaN(d) ||
    isNaN(hh) || isNaN(mm) || isNaN(ss)
  ) {
    return null;
  }

  const year = Number(y);
  const month = Number(m) - 1;
  const day = Number(d);
  const hour = Number(hh);
  const minute = Number(mm);
  const second = Number(ss);

  if (
    year < 2000 || year > 2100 ||
    month < 0 || month > 11 ||
    day < 1 || day > 31 ||
    hour < 0 || hour > 23 ||
    minute < 0 || minute > 59 ||
    second < 0 || second > 59
  ) {
    return null;
  }

  const date = new Date(Date.UTC(year, month, day, hour, minute, second));
  
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
};

/**
 * Parse une ligne CDR brute venant du WebSocket 3CX.
 */
export const parseCDRLine = (line) => {
  if (!line || typeof line !== 'string' || !line.startsWith('Call ')) {
    return null;
  }

  try {
    const rawFields = line.substring(5).split(',');
    
    if (rawFields.length < 8) {
      console.warn('[CDR] Ligne ignorée : moins de 8 champs', { line, fieldCount: rawFields.length });
      return null;
    }

    const id = (rawFields[0] || '').trim();
    const durationStr = (rawFields[2] || '00:00:00').trim();
    const startTimeStr = (rawFields[3] || '').trim();
    const endTimeStr = (rawFields[5] || '').trim();
    const status = (rawFields[6] || '').trim();
    const caller = (rawFields[7] || '').trim();

    const startTime = parseCDRDate(startTimeStr);
    if (!startTime) {
      console.warn('[CDR] Date de début invalide', { startTimeStr, line });
      return null;
    }

    // 🔧 CORRECTION : détection robuste de "Front Office" dans n'importe quel champ
    const hasFrontOffice = rawFields.some(field => 
      field.trim().toLowerCase() === 'front office'
    );

    // Extraction du nom de l'agent (de la fin vers le début)
    let agentName = '';
    for (let i = rawFields.length - 1; i >= 0; i--) {
      const field = (rawFields[i] || '').trim();
      if (isLikelyName(field)) {
        agentName = field
          .replace(/\s*\(.*?\)\s*/g, '')
          .replace(/\s*\..*$/, '')
          .replace(/\s+/g, ' ')
          .trim();
        break;
      }
    }

    // 🔒 CORRECTION CRUCIALE : rejeter les "noms" purement numériques
    if (agentName && /^\d+$/.test(agentName.replace(/\s+/g, ''))) {
      agentName = '';
    }

    // 🔒 CORRECTION SUPPLÉMENTAIRE : ne conserver que les agents autorisés
    if (agentName && !AUTHORIZED_AGENTS.has(agentName.toLowerCase())) {
      agentName = ''; // Ignore les noms non présents dans la liste officielle
    }

    // 🔧 CORRECTION : logique de callType robuste
    let callType = 'OTHER';

    if (hasFrontOffice) {
      // Appel entrant via Front Office
      if (agentName) {
        callType = 'CDS_IN';
      } else {
        callType = 'ABSYS'; // Orphelin ou non autorisé
      }
    } else if (caller.startsWith('Ext.')) {
      // Appel sortant : on garde CDS_OUT uniquement si agent autorisé
      callType = agentName ? 'CDS_OUT' : 'OTHER';
    }

    // Conversion durée en secondes
    const durParts = durationStr.split(':').map(part => {
      const num = Number(part);
      return isNaN(num) ? 0 : num;
    });
    const [h = 0, m = 0, s = 0] = durParts;
    const durationSec = h * 3600 + m * 60 + s;

    return {
      id,
      startTime,
      endTime: parseCDRDate(endTimeStr),
      status,
      caller,
      queue: hasFrontOffice ? 'Front Office' : '',
      agentName,
      duration: durationStr,
      durationSec,
      callType,
    };
  } catch (error) {
    console.error('[CDR] Erreur critique lors du parsing', { line, error: error.message });
    return null;
  }
};