// src/utils/weeklyCallCounter.js

/**
 * Gère un compteur persistant du nombre total d'appels (inbound + outbound)
 * du lundi au vendredi, réinitialisé chaque lundi à 0h (mais utilisé avec reset à 8h via App.js).
 */

const STORAGE_KEY = 'weeklyCallCounter';

const getMonday = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // lundi
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

const isWeekday = (date = new Date()) => {
  const day = date.getDay();
  return day >= 1 && day <= 5; // lun = 1, ven = 5
};

const isSameWeek = (date1, date2) => {
  const mon1 = getMonday(date1);
  const mon2 = getMonday(date2);
  return mon1.getTime() === mon2.getTime();
};

export const getWeeklyCallCount = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return 0;

    const { count, lastReset } = JSON.parse(stored);
    const lastResetDate = new Date(lastReset);
    const now = new Date();

    // Si on est lundi et que la dernière réinitialisation n'est pas cette semaine → reset
    if (now.getDay() === 1 && !isSameWeek(now, lastResetDate)) {
      resetWeeklyCallCount();
      return 0;
    }

    // Si on est en week-end, ne pas compter (mais garder la valeur de vendredi)
    if (!isWeekday(now)) {
      return count;
    }

    return count || 0;
  } catch (e) {
    console.warn('[CallCounter] ⚠️ Erreur lecture compteur', e);
    return 0;
  }
};

export const incrementWeeklyCallCount = (increment = 1) => {
  const now = new Date();
  if (!isWeekday(now)) return; // n'incrémente que lun–ven

  try {
    const current = getWeeklyCallCount();
    const newCount = current + increment;

    const payload = {
      count: newCount,
      lastReset: getMonday(now).toISOString(),
      lastUpdate: now.toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    console.log(`[CallCounter] ➕ Compteur mis à jour: ${newCount}`);
    return newCount;
  } catch (e) {
    console.error('[CallCounter] ❌ Erreur incrémentation', e);
  }
};

export const resetWeeklyCallCount = () => {
  const now = new Date();
  const payload = {
    count: 0,
    lastReset: getMonday(now).toISOString(),
    lastUpdate: now.toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  console.log('[CallCounter] 🔄 Compteur réinitialisé (lundi)');
};