// src/utils/weeklyDataPersistence.js

const getWeekKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return `weeklyData_${year}-${String(weekNumber).padStart(2, '0')}`;
};

const isWeekday = (date = new Date()) => {
  const day = date.getDay();
  return day >= 1 && day <= 5; // lun = 1, ven = 5
};

export const formatDateToLocalISO = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const cleanupOldWeeks = (currentKey, keepWeeks = 4) => {
  const allKeys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('weeklyData_')) {
      allKeys.push(key);
    }
  }

  allKeys.sort((a, b) => {
    const aWeek = a.split('_')[1];
    const bWeek = b.split('_')[1];
    return aWeek.localeCompare(bWeek);
  });

  const toRemove = allKeys.slice(0, -keepWeeks);
  toRemove.forEach(key => {
    if (key !== currentKey) {
      localStorage.removeItem(key);
      console.log('[Persistence] 🧹 Nettoyé:', key);
    }
  });
};

// ✅ Exportez une fonction publique
export const cleanupOldWeeklyData = (keepWeeks = 4) => {
  const currentKey = getWeekKey();
  cleanupOldWeeks(currentKey, keepWeeks);
};

/**
 * Sauvegarde les données journalières (inbound/outbound) pour un jour donné.
 * Utilisé par App.js après chaque appel pertinent.
 */
export const saveDailyData = (data, date = new Date()) => {
  if (!isWeekday(date)) {
    console.log('[Persistence] ⏸️ Jour non ouvré – pas de sauvegarde');
    return;
  }

  const weekKey = getWeekKey();
  const dayKey = formatDateToLocalISO(date);

  try {
    let weeklyData = JSON.parse(localStorage.getItem(weekKey) || '{}');
    
    // Ne pas écraser si les nouvelles données sont inférieures (évite les régressions)
    const currentInbound = weeklyData[dayKey]?.inbound || 0;
    const currentOutbound = weeklyData[dayKey]?.outbound || 0;

    weeklyData[dayKey] = {
      inbound: Math.max(currentInbound, data.inbound || 0),
      outbound: Math.max(currentOutbound, data.outbound || 0),
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem(weekKey, JSON.stringify(weeklyData));
    cleanupOldWeeks(weekKey, 4); // Nettoyage automatique
    console.log(`[Persistence] ✅ Sauvegardé ${dayKey}: IN=${data.inbound}, OUT=${data.outbound}`);
  } catch (e) {
    console.error('[Persistence] ❌ Erreur sauvegarde:', e);
  }
};

/**
 * Charge toutes les données de la semaine en cours (lun–ven).
 * Retourne un objet avec les clés au format 'YYYY-MM-DD'.
 */
export const loadCurrentWeekData = () => {
  const weekKey = getWeekKey();
  try {
    const data = localStorage.getItem(weekKey);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error('[Persistence] ❌ Erreur chargement:', e);
    return {};
  }
};