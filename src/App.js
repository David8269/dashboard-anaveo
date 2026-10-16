import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
} from '@mui/material';
import SLABarchart from './components/SLABarchart';
import AgentTable from './components/AgentTable';
import CallVolumeChart from './components/CallVolumeChart';
import { useCallAggregates } from './hooks/useCallAggregates';
import { parseCDRLine } from './utils/cdrParser';

// ============================================================================
// === HELPERS (Logique métier 100% préservée) ===
// ============================================================================
const isLunchBreak = (date) => {
  if (!date) return false;
  const totalMinutes = date.getHours() * 60 + date.getMinutes();
  return totalMinutes >= 750 && totalMinutes < 840;
};

const isAfterHours = (date) => {
  if (!date) return false;
  return date.getHours() >= 18;
};

const formatSecondsToMMSS = (totalSeconds) => {
  if (!totalSeconds || isNaN(totalSeconds) || totalSeconds <= 0) return '00:00';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const getInboundAHTColor = (seconds) => {
  if (!seconds || isNaN(seconds)) return 'default';
  if (seconds <= 600) return 'success';
  if (seconds <= 900) return 'warning';
  return 'error';
};

const getOutboundAHTColor = (seconds) => {
  if (!seconds || isNaN(seconds)) return 'default';
  if (seconds <= 1200) return 'success';
  if (seconds <= 1800) return 'warning';
  return 'error';
};

const getAbandonColor = (rateStr) => {
  const rate = parseInt(rateStr, 10);
  if (isNaN(rate)) return 'default';
  return rate <= 15 ? 'success' : 'error';
};

const isAbandonCritical = (rateStr) => {
  const rate = parseInt(rateStr, 10);
  return !isNaN(rate) && rate > 15;
};

const getLocalDateStr = (date) => {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().split('T')[0];
};

const generateHalfHourSlots = () => {
  const slots = [];
  for (let h = 8; h <= 19; h++) {
    slots.push(`${h.toString().padStart(2, '0')}:30`);
    if (h < 19) slots.push(`${(h + 1).toString().padStart(2, '0')}:00`);
  }
  return slots;
};

const halfHourSlots = generateHalfHourSlots();

const isInBusinessHours = (date) => {
  if (!date) return false;
  const h = date.getHours();
  const m = date.getMinutes();
  return !(h < 8 || (h === 8 && m < 30) || h > 18 || (h === 18 && m > 30));
};

const mmssToSeconds = (mmss) => {
  if (!mmss || mmss === '-') return null;
  const [m, s] = mmss.split(':').map(Number);
  return m * 60 + s;
};

// ============================================================================
// === 🏰 HEADER CATHÉDRALE GOTHIQUE ===
// ============================================================================
function GothicHeader({ isConnected }) {
  const [time, setTime] = useState(new Date());
  const [flameFlicker, setFlameFlicker] = useState({ h: 1, m: 1, s: 1 });
  
  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    const flickerId = setInterval(() => {
      setFlameFlicker({ h: 0.85 + Math.random() * 0.3, m: 0.85 + Math.random() * 0.3, s: 0.85 + Math.random() * 0.3 });
    }, 150);
    return () => { clearInterval(timerId); clearInterval(flickerId); };
  }, []);
  
  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');
  const dateStr = time.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const Candle = ({ height = 60, color = '#ff6b35' }) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mx: 0.5 }}>
      <Box sx={{ position: 'relative', width: '20px', height: '30px', mb: '-2px' }}>
        <Box sx={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '16px', height: '28px', background: `radial-gradient(ellipse at center bottom, ${color} 0%, #ff4500 40%, transparent 70%)`, borderRadius: '50% 50% 20% 20%', animation: 'flame-dance 0.8s ease-in-out infinite alternate', filter: `blur(1px)`, opacity: 0.9 }} />
        <Box sx={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '8px', height: '18px', background: 'radial-gradient(ellipse at center bottom, #ffeb3b 0%, #ffaa00 60%, transparent 80%)', borderRadius: '50% 50% 20% 20%', animation: 'flame-dance-inner 0.6s ease-in-out infinite alternate' }} />
        <Box sx={{ position: 'absolute', bottom: '-5px', left: '50%', transform: 'translateX(-50%)', width: '40px', height: '40px', background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`, borderRadius: '50%', animation: 'glow-pulse 2s ease-in-out infinite' }} />
      </Box>
      <Box sx={{ width: '12px', height: `${height}px`, background: `linear-gradient(180deg, #f5f5dc 0%, #d4c5a9 50%, #8b7355 100%)`, borderRadius: '2px 2px 4px 4px', boxShadow: 'inset -2px 0 4px rgba(0,0,0,0.3), inset 2px 0 4px rgba(255,255,255,0.2)', position: 'relative' }}>
        <Box sx={{ position: 'absolute', top: '-4px', left: '50%', transform: 'translateX(-50%)', width: '2px', height: '6px', background: '#2d1b0e', borderRadius: '1px' }} />
      </Box>
    </Box>
  );

  const TimeDigit = ({ value, label, color, flickerValue }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', px: 1 }}>
      <Candle height={50} color={color} />
      <Box sx={{ mx: 1, px: 2, py: 1, background: 'rgba(0, 0, 0, 0.5)', borderRadius: '12px', border: `2px solid ${color}`, boxShadow: `0 0 20px ${color}60, inset 0 0 20px ${color}20`, minWidth: '80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%', background: `linear-gradient(180deg, ${color}30 0%, transparent 100%)`, opacity: flickerValue, transition: 'opacity 0.15s' }} />
        <Typography sx={{ fontFamily: '"Creepster", cursive', fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 700, color: '#ffffff', textShadow: `0 0 10px ${color}, 0 0 20px ${color}80, 0 0 40px ${color}40, 2px 2px 4px rgba(0,0,0,0.95)`, position: 'relative', zIndex: 2, letterSpacing: '4px' }}>{value}</Typography>
        <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: '0.6rem', color: color, textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700, mt: -0.5, textShadow: `0 0 8px ${color}` }}>{label}</Typography>
      </Box>
      <Candle height={50} color={color} />
    </Box>
  );

  return (
    <Box sx={{
      position: 'relative',
      background: 'linear-gradient(135deg, rgba(10, 5, 10, 0.65) 0%, rgba(26, 15, 26, 0.55) 30%, rgba(45, 27, 78, 0.50) 70%, rgba(10, 5, 10, 0.65) 100%)',
      backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      padding: { xs: '1.5rem 1rem', md: '2rem 2rem' }, borderRadius: '24px',
      border: '1px solid rgba(255, 107, 53, 0.4)', borderTop: '3px solid #ffaa00', borderBottom: '3px solid #9d4edd',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 0 30px rgba(255, 107, 53, 0.05)',
      overflow: 'hidden', mb: 3,
    }}>
      <Box sx={{ position: 'absolute', top: 8, left: 8, fontSize: '1.5rem', opacity: 0.4, animation: 'gargoyle-watch 4s ease-in-out infinite' }}>🦇</Box>
      <Box sx={{ position: 'absolute', top: 8, right: 8, fontSize: '1.5rem', opacity: 0.4, animation: 'gargoyle-watch 4s ease-in-out infinite 2s' }}>🦇</Box>
      <Box sx={{ position: 'absolute', bottom: 8, left: 8, fontSize: '1.2rem', opacity: 0.3 }}>🕷️</Box>
      <Box sx={{ position: 'absolute', bottom: 8, right: 8, fontSize: '1.2rem', opacity: 0.3 }}>️</Box>
      
      <Box sx={{ position: 'absolute', top: '50%', left: '5%', right: '5%', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255, 107, 53, 0.3), rgba(157, 78, 221, 0.3), transparent)', transform: 'translateY(-50%)' }} />
      
      {[...Array(8)].map((_, i) => {
        const duration = 3 + Math.random() * 4;
        const delay = Math.random() * 3;
        return (
          <Box key={i} sx={{ 
            position: 'absolute', width: `${3 + Math.random() * 4}px`, height: `${3 + Math.random() * 4}px`,
            background: `radial-gradient(circle, ${['#ffaa00', '#ff6b35', '#9d4edd', '#39ff14'][i % 4]}, transparent)`,
            borderRadius: '50%', bottom: '10%', left: `${10 + (i * 12)}%`, opacity: 0,
            animation: `sparkle-rise ${duration}s ease-out ${delay}s infinite`,
            boxShadow: `0 0 10px ${['#ffaa00', '#ff6b35', '#9d4edd'][i % 3]}`,
          }} />
        );
      })}

      <Box sx={{ position: 'relative', zIndex: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: 'space-between', mb: 2, gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ fontSize: '2.5rem', animation: 'pumpkin-glow 2s ease-in-out infinite', filter: 'drop-shadow(0 0 15px rgba(255, 107, 53, 0.8))' }}>🎃</Box>
            <Box>
              <Typography sx={{ fontFamily: '"Creepster", cursive', fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 700, background: 'linear-gradient(135deg, #ffaa00 0%, #ff6b35 50%, #ff4500 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '0.08em', textShadow: '0 0 30px rgba(255, 107, 53, 0.5)', lineHeight: 1 }}>HALLOWEEN</Typography>
              <Typography sx={{ fontFamily: '"Dancing Script", cursive', fontSize: { xs: '0.9rem', md: '1.1rem' }, color: '#d484f0', letterSpacing: '1px', fontWeight: 600, textShadow: '0 0 10px rgba(157, 78, 221, 0.6)', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <span style={{ animation: 'star-twinkle 2s ease-in-out infinite' }}>✦</span> Une nuit pleine d'appels... <span style={{ animation: 'star-twinkle 2s ease-in-out infinite 1s' }}>✦</span>
              </Typography>
            </Box>
          </Box>

          <Box sx={{ px: 3, py: 1.5, background: 'rgba(0, 0, 0, 0.4)', borderRadius: '16px', border: '1px solid rgba(157, 78, 221, 0.5)', boxShadow: '0 0 20px rgba(157, 78, 221, 0.2)' }}>
            <Typography sx={{ fontFamily: '"Montserrat", sans-serif', fontSize: { xs: '1rem', md: '1.3rem' }, color: '#d484f0', fontWeight: 700, textTransform: 'capitalize', letterSpacing: '1.5px', textShadow: '0 0 12px rgba(157, 78, 221, 0.8)' }}>
               {dateStr}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, gap: 1 }}>
          <Box sx={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255, 107, 53, 0.5))' }} />
          <Typography sx={{ fontSize: '1rem', opacity: 0.6 }}>🕯️</Typography>
          <Box sx={{ width: '8px', height: '8px', background: '#ffaa00', borderRadius: '50%', boxShadow: '0 0 10px #ffaa00' }} />
          <Typography sx={{ fontSize: '1rem', opacity: 0.6 }}>🦇</Typography>
          <Box sx={{ width: '8px', height: '8px', background: '#9d4edd', borderRadius: '50%', boxShadow: '0 0 10px #9d4edd' }} />
          <Typography sx={{ fontSize: '1rem', opacity: 0.6 }}>🕯️</Typography>
          <Box sx={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(157, 78, 221, 0.5), transparent)' }} />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: { xs: 1, md: 2 }, py: 1 }}>
          <TimeDigit value={hours} label="Heures" color="#ffaa00" flickerValue={flameFlicker.h} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mx: 1 }}>
            <Box sx={{ width: '12px', height: '12px', background: '#ff6b35', borderRadius: '50%', boxShadow: '0 0 15px #ff6b35, 0 0 30px #ff6b35', animation: 'separator-pulse 1s ease-in-out infinite' }} />
            <Box sx={{ width: '12px', height: '12px', background: '#ff6b35', borderRadius: '50%', boxShadow: '0 0 15px #ff6b35, 0 0 30px #ff6b35', animation: 'separator-pulse 1s ease-in-out infinite 0.5s' }} />
          </Box>
          <TimeDigit value={minutes} label="Minutes" color="#ff6b35" flickerValue={flameFlicker.m} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mx: 1 }}>
            <Box sx={{ width: '12px', height: '12px', background: '#9d4edd', borderRadius: '50%', boxShadow: '0 0 15px #9d4edd, 0 0 30px #9d4edd', animation: 'separator-pulse 1s ease-in-out infinite' }} />
            <Box sx={{ width: '12px', height: '12px', background: '#9d4edd', borderRadius: '50%', boxShadow: '0 0 15px #9d4edd, 0 0 30px #9d4edd', animation: 'separator-pulse 1s ease-in-out infinite 0.5s' }} />
          </Box>
          <TimeDigit value={seconds} label="Secondes" color="#9d4edd" flickerValue={flameFlicker.s} />
        </Box>
      </Box>

      <style>{`
        @keyframes flame-dance { 0% { transform: translateX(-50%) scaleY(1) scaleX(1) rotate(-2deg); } 100% { transform: translateX(-50%) scaleY(1.15) scaleX(0.9) rotate(2deg); } }
        @keyframes flame-dance-inner { 0% { transform: translateX(-50%) scaleY(1) rotate(1deg); } 100% { transform: translateX(-50%) scaleY(1.1) rotate(-1deg); } }
        @keyframes glow-pulse { 0%, 100% { opacity: 0.6; transform: translateX(-50%) scale(1); } 50% { opacity: 1; transform: translateX(-50%) scale(1.2); } }
        @keyframes pumpkin-glow { 0%, 100% { filter: drop-shadow(0 0 15px rgba(255, 107, 53, 0.8)); transform: scale(1); } 50% { filter: drop-shadow(0 0 25px rgba(255, 107, 53, 1)); transform: scale(1.05); } }
        @keyframes star-twinkle { 0%, 100% { opacity: 0.5; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
        @keyframes separator-pulse { 0%, 100% { opacity: 0.5; transform: scale(1); } 50% { opacity: 1; transform: scale(1.3); } }
        @keyframes sparkle-rise { 0% { transform: translateY(0) scale(0); opacity: 0; } 20% { opacity: 1; transform: translateY(-20px) scale(1); } 100% { transform: translateY(-100px) scale(0); opacity: 0; } }
        @keyframes gargoyle-watch { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(5deg); } 75% { transform: rotate(-5deg); } }
      `}</style>
    </Box>
  );
}

// 🦇 Chauve-souris Volante
function FlyingBat({ delay = 0, top = '10%' }) {
  return (
    <Box sx={{ position: 'fixed', top: top, left: '-50px', fontSize: '2rem', opacity: 0.6, pointerEvents: 'none', zIndex: 5, animation: `bat-fly-across 15s linear ${delay}s infinite`, filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.8))' }}>
      🦇
      <style>{`@keyframes bat-fly-across { 0% { left: -50px; transform: translateY(0) rotate(0deg); } 25% { transform: translateY(-30px) rotate(5deg); } 50% { transform: translateY(0) rotate(0deg); } 75% { transform: translateY(-20px) rotate(-5deg); } 100% { left: calc(100vw + 50px); transform: translateY(0) rotate(0deg); } }`}</style>
    </Box>
  );
}

// ============================================================================
// === SCHEDULERS & WEBSOCKET (Logique 100% préservée) ===
// ============================================================================
const useDailyResetScheduler = (resetFn) => { 
  useEffect(() => {
    const scheduleNextReset = () => {
      const now = new Date();
      const nextReset = new Date();
      nextReset.setHours(8, 0, 0, 0);
      if (now >= nextReset) nextReset.setDate(nextReset.getDate() + 1);
      const delay = nextReset.getTime() - now.getTime();
      const timeoutId = setTimeout(() => { resetFn(); scheduleNextReset(); }, delay);
      return () => clearTimeout(timeoutId);
    };
    return scheduleNextReset();
  }, [resetFn]);
};

const useWeeklyResetScheduler = (resetFn) => {
  useEffect(() => {
    const scheduleNextReset = () => {
      const now = new Date();
      const nextReset = new Date();
      const dayOfWeek = now.getDay();
      let daysUntilMonday = 1 - dayOfWeek;
      if (daysUntilMonday <= 0) daysUntilMonday += 7;
      nextReset.setDate(now.getDate() + daysUntilMonday);
      nextReset.setHours(8, 0, 0, 0);
      if (dayOfWeek === 1 && now.getHours() >= 8) nextReset.setDate(nextReset.getDate() + 7);
      const delay = nextReset.getTime() - now.getTime();
      const timeoutId = setTimeout(() => { resetFn(); scheduleNextReset(); }, delay);
      return () => clearTimeout(timeoutId);
    };
    return scheduleNextReset();
  }, [resetFn]);
};

const useWebSocketData = (url, onLostCall) => {
  const [allCalls, setAllCalls] = useState([]);
  const [dailyCalls, setDailyCalls] = useState([]);
  const [weeklyCalls, setWeeklyCalls] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const connectionTimeoutRef = useRef(null);
  const pingIntervalRef = useRef(null);
  const isMountedRef = useRef(true);
  const reconnectAttemptsRef = useRef(0);

  const getStorageKey = () => `callData_${getLocalDateStr(new Date())}`;

  const cleanupOldStorage = () => {
    const now = new Date();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('callData_')) {
        const dateStr = key.split('_')[1];
        const date = new Date(dateStr + 'T00:00:00');
        const daysDiff = Math.floor((now - date) / (24 * 60 * 60 * 1000));
        if (daysDiff > 7) localStorage.removeItem(key);
      }
    }
  };

  const saveCallsToStorage = (calls) => {
    try {
      const key = getStorageKey();
      const serializableCalls = calls.map(call => ({ ...call, startTime: call.startTime?.toISOString() || null, endTime: call.endTime?.toISOString() || null, receivedAt: call.receivedAt?.toISOString() || null }));
      localStorage.setItem(key, JSON.stringify(serializableCalls));
    } catch (e) { console.warn('[Storage] ⚠️ Sauvegarde échouée', e); }
  };

  const loadCallsFromStorage = () => {
    const seen = new Set();
    const calls = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const key = `callData_${getLocalDateStr(date)}`;
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          const loadedCalls = parsed.map(call => ({ ...call, startTime: call.startTime ? new Date(call.startTime) : null, endTime: call.endTime ? new Date(call.endTime) : null, receivedAt: call.receivedAt ? new Date(call.receivedAt) : null })).filter(call => call.startTime && call.id);
          for (const call of loadedCalls) { if (!seen.has(call.id)) { seen.add(call.id); calls.push(call); } }
        }
      } catch (e) { console.warn(`[Storage] ⚠️ Chargement échoué pour ${key}`, e); localStorage.removeItem(key); }
    }
    return calls;
  };

  const resetDailyData = () => { setDailyCalls([]); setLastUpdate(null); };
  const resetWeeklyData = () => { setAllCalls([]); setDailyCalls([]); setWeeklyCalls([]); setLastUpdate(null); Object.keys(localStorage).filter(k => k.startsWith('callData_')).forEach(k => localStorage.removeItem(k)); };
  const stopPing = () => { if (pingIntervalRef.current) { clearInterval(pingIntervalRef.current); pingIntervalRef.current = null; } };
  const startPing = () => {
    stopPing();
    pingIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) { try { wsRef.current.send(JSON.stringify({ type: 'keepalive', ts: Date.now() })); } catch (e) {} }
    }, 45000);
  };

  const connect = () => {
    if (!isMountedRef.current) return;
    const baseDelay = 5000; const maxDelay = 30000;
    const delay = reconnectAttemptsRef.current === 0 ? 0 : Math.min(baseDelay * Math.pow(2, reconnectAttemptsRef.current - 1), maxDelay);
    reconnectTimeoutRef.current = setTimeout(() => {
      if (!isMountedRef.current) return;
      setError(null); setIsConnected(false);
      wsRef.current = new WebSocket(url);
      connectionTimeoutRef.current = setTimeout(() => { if (wsRef.current?.readyState === WebSocket.CONNECTING) wsRef.current?.close(); }, 10000);
      wsRef.current.onopen = () => {
        if (!isMountedRef.current) return;
        clearTimeout(connectionTimeoutRef.current); setIsConnected(true); setError(null); reconnectAttemptsRef.current = 0; startPing();
        try { wsRef.current.send(JSON.stringify({ type: "subscribe", topic: "cdr/live" })); } catch (err) {}
      };
      wsRef.current.onmessage = (event) => {
        if (!isMountedRef.current) return;
        const msg = event.data;
        if (typeof msg === 'string') {
          if (msg.includes('"type":"keepalive"') || msg.includes('"type":"pong"')) return;
          const cdr = parseCDRLine(msg);
          if (!cdr || !cdr.startTime || !cdr.id) return;
          const callWithSec = { ...cdr, receivedAt: new Date() };
          let isLostCall = false;
          if (cdr.callType === 'ABSYS' && !isLunchBreak(cdr.startTime) && !isAfterHours(cdr.startTime)) isLostCall = cdr.durationSec >= 59;
          if (isInBusinessHours(cdr.startTime)) {
            setAllCalls(prev => { if (prev.some(call => call.id === callWithSec.id)) return prev; const updated = [...prev, callWithSec]; saveCallsToStorage(updated); return updated; });
            setDailyCalls(prev => prev.some(call => call.id === callWithSec.id) ? prev : [...prev, callWithSec]);
            setWeeklyCalls(prev => prev.some(call => call.id === callWithSec.id) ? prev : [...prev, callWithSec]);
            if (isLostCall && onLostCall) onLostCall(callWithSec.id);
            setLastUpdate(new Date());
          }
        }
      };
      wsRef.current.onerror = () => { if (isMountedRef.current) setIsConnected(false); };
      wsRef.current.onclose = (e) => { if (!isMountedRef.current) return; setIsConnected(false); stopPing(); if (e.code !== 1000 && isMountedRef.current) { reconnectAttemptsRef.current += 1; connect(); } };
    }, delay);
  };

  useEffect(() => {
    isMountedRef.current = true; reconnectAttemptsRef.current = 0; cleanupOldStorage();
    const storedCalls = loadCallsFromStorage(); setAllCalls(storedCalls);
    const today = new Date(); const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    setDailyCalls(storedCalls.filter(call => call.startTime && call.startTime >= startOfToday));
    const startOfWeek = new Date(today); const day = startOfWeek.getDay(); const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff); startOfWeek.setHours(0, 0, 0, 0);
    setWeeklyCalls(storedCalls.filter(call => call.startTime && call.startTime >= startOfWeek));
    connect();
    return () => { isMountedRef.current = false; if (wsRef.current) wsRef.current.close(1000, 'Unmount'); if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current); if (connectionTimeoutRef.current) clearTimeout(connectionTimeoutRef.current); stopPing(); };
  }, [url]);

  const reconnect = () => { reconnectAttemptsRef.current = 0; if (wsRef.current) wsRef.current.close(1000, 'Manual reconnect'); if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current); stopPing(); connect(); };
  return { dailyCalls, weeklyCalls, allCalls, lastUpdate, isConnected, error, reconnect, halfHourSlots, resetDailyData, resetWeeklyData };
};

const playSound = (filename, context = '', volume = 0.8) => {
  try { const audio = new Audio(`${process.env.PUBLIC_URL}/sounds/${filename}`); audio.volume = volume; audio.play().catch(e => console.warn(`[Son] Échec lecture ${filename}:`, e.message)); } 
  catch (error) { console.error(`[Son] Erreur :`, error); }
};

// ============================================================================
// === COMPOSANT PRINCIPAL APP ===
// ============================================================================
const App = () => {
  const WS_URL = 'wss://cds-on3cx.anaveo.com/cdr-ws/';
  const prevEmployeesRef = useRef([]);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const scheduledTimeoutsRef = useRef([]);

  useEffect(() => {
    let hideScrollTimeout;
    const handleScroll = () => { document.body.classList.add('show-scrollbar'); clearTimeout(hideScrollTimeout); hideScrollTimeout = setTimeout(() => document.body.classList.remove('show-scrollbar'), 1000); };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => { window.removeEventListener('scroll', handleScroll); clearTimeout(hideScrollTimeout); };
  }, []);

  const unlockAudio = () => {
    if (audioUnlocked) return;
    const audio = new Audio(`${process.env.PUBLIC_URL}/sounds/silent.wav`);
    audio.play().then(() => setAudioUnlocked(true)).catch(() => {});
  };

  useEffect(() => {
    const unlock = () => unlockAudio();
    ['click', 'keydown', 'touchstart'].forEach(e => window.addEventListener(e, unlock, { once: true }));
    return () => ['click', 'keydown', 'touchstart'].forEach(e => window.removeEventListener(e, unlock));
  }, []);

  const handleLostCall = (callId) => {
    const audio = new Audio(`${process.env.PUBLIC_URL}/sounds/fatality.mp3`);
    audio.volume = 0.9; audio.play().catch(() => {});
  };

  const { dailyCalls, weeklyCalls, lastUpdate, isConnected, error, reconnect, halfHourSlots } = useWebSocketData(WS_URL, handleLostCall);
  useDailyResetScheduler(() => {});
  useWeeklyResetScheduler(() => {});
  const { employees, callVolumes, kpi } = useCallAggregates(dailyCalls, halfHourSlots);

  const slaDataForChart = useMemo(() => {
    const template = [{ dayLabel: 'Lun', inbound: 0, outbound: 0 }, { dayLabel: 'Mar', inbound: 0, outbound: 0 }, { dayLabel: 'Mer', inbound: 0, outbound: 0 }, { dayLabel: 'Jeu', inbound: 0, outbound: 0 }, { dayLabel: 'Ven', inbound: 0, outbound: 0 }];
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    return weeklyCalls.reduce((acc, call) => {
      if (!call.startTime || !['CDS_IN', 'CDS_OUT'].includes(call.callType)) return acc;
      const dayLabel = dayNames[call.startTime.getDay()];
      const day = acc.find(d => d.dayLabel === dayLabel);
      if (day) { if (call.callType === 'CDS_IN') day.inbound += 1; else if (call.callType === 'CDS_OUT') day.outbound += 1; }
      return acc;
    }, [...template]);
  }, [weeklyCalls]);

  const isInboundAHTCritical = useMemo(() => getInboundAHTColor(mmssToSeconds(kpi.avgInboundAHT)) === 'error', [kpi.avgInboundAHT]);
  const isOutboundAHTCritical = useMemo(() => getOutboundAHTColor(mmssToSeconds(kpi.avgOutboundAHT)) === 'error', [kpi.avgOutboundAHT]);
  const isAbandonRateCritical = useMemo(() => isAbandonCritical(kpi.abandonRate), [kpi.abandonRate]);

  useEffect(() => {
    if (!audioUnlocked) return;
    scheduledTimeoutsRef.current.forEach(id => clearTimeout(id));
    scheduledTimeoutsRef.current = [];
    const scheduleSoundAt = (targetHour, targetMinute, soundFile, label, allowedDays = null) => {
      const now = new Date();
      let scheduledTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), targetHour, targetMinute, 0, 0);
      if (Array.isArray(allowedDays) && allowedDays.length > 0) {
        let attempts = 0, found = false;
        while (attempts < 7) { if (allowedDays.includes(scheduledTime.getDay()) && scheduledTime > now) { found = true; break; } scheduledTime.setDate(scheduledTime.getDate() + 1); attempts++; }
        if (!found) scheduledTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, targetHour, targetMinute, 0, 0);
      } else { if (scheduledTime <= now) scheduledTime.setDate(scheduledTime.getDate() + 1); }
      const delay = Math.max(scheduledTime.getTime() - now.getTime(), 100);
      const timeoutId = setTimeout(() => {
        const currentDate = new Date();
        const isAllowed = !allowedDays || (Array.isArray(allowedDays) && allowedDays.includes(currentDate.getDay()));
        if (isAllowed) playSound(soundFile, label);
        const nextId = scheduleSoundAt(targetHour, targetMinute, soundFile, label, allowedDays);
        scheduledTimeoutsRef.current.push(nextId);
      }, delay);
      return timeoutId;
    };
    scheduledTimeoutsRef.current = [
      scheduleSoundAt(8, 30, 'debut.mp3', 'Début journée', [1, 2, 3, 4, 5]),
      scheduleSoundAt(12, 30, 'pause.mp3', 'Pause déjeuner', [1, 2, 3, 4, 5]),
      scheduleSoundAt(14, 0, 'reprise.mp3', 'Reprise après pause', [1, 2, 3, 4, 5]),
      scheduleSoundAt(18, 0, 'fin.mp3', 'Fin journée (Lun-Jeu)', [1, 2, 3, 4]),
      scheduleSoundAt(17, 0, 'fin.mp3', 'Fin journée (Vendredi)', [5])
    ];
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        scheduledTimeoutsRef.current.forEach(id => clearTimeout(id));
        scheduledTimeoutsRef.current = [
          scheduleSoundAt(8, 30, 'debut.mp3', 'Début journée', [1, 2, 3, 4, 5]),
          scheduleSoundAt(12, 30, 'pause.mp3', 'Pause déjeuner', [1, 2, 3, 4, 5]),
          scheduleSoundAt(14, 0, 'reprise.mp3', 'Reprise après pause', [1, 2, 3, 4, 5]),
          scheduleSoundAt(18, 0, 'fin.mp3', 'Fin journée (Lun-Jeu)', [1, 2, 3, 4]),
          scheduleSoundAt(17, 0, 'fin.mp3', 'Fin journée (Vendredi)', [5])
        ];
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => { document.removeEventListener('visibilitychange', handleVisibilityChange); scheduledTimeoutsRef.current.forEach(id => clearTimeout(id)); };
  }, [audioUnlocked]);

  useEffect(() => {
    if (!audioUnlocked || employees.length === 0) return;
    const totalCalls = kpi.totalAnsweredCalls + kpi.missedCallsTotal + kpi.totalOutboundCalls;
    if (totalCalls < 50) return;
    const prevEmployees = prevEmployeesRef.current;
    const currentTop = employees.reduce((top, a) => (a.inbound + a.outbound) > (top?.inbound + top?.outbound || 0) ? a : top, null);
    const prevTop = prevEmployees.reduce((top, a) => (a.inbound + a.outbound) > (top?.inbound + top?.outbound || 0) ? a : top, null);
    if (currentTop && (!prevTop || prevTop.name !== currentTop.name)) {
      const allowedFirstNames = new Set(['xavier', 'rana', 'romain', 'nicolas', 'julien', 'benjamin', 'malik','marina','vivien','kévin','christophe','gwenaëlle']);
      const firstName = currentTop.name.split(' ')[0]?.toLowerCase() || '';
      const soundToPlay = allowedFirstNames.has(firstName) ? `${firstName}.mp3` : 'passage.mp3';
      playSound(soundToPlay, `Top agent : ${currentTop.name}`);
    }
    prevEmployeesRef.current = [...employees];
  }, [employees, audioUnlocked, kpi]);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Creepster&family=Dancing+Script:wght@600;700&family=Inter:wght@300;400;500;600&family=Montserrat:wght@500;700;800;900&display=swap" rel="stylesheet" />
      
      <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: `url('${process.env.PUBLIC_URL}/images/halloween-bg.png')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed', zIndex: 0 }} />
      <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(180deg, transparent 0%, rgba(157, 78, 221, 0.05) 50%, transparent 100%)', pointerEvents: 'none', zIndex: 1, animation: 'fog-drift 20s ease-in-out infinite' }} />
      <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.2) 100%)', pointerEvents: 'none', zIndex: 2 }} />
      
      <FlyingBat delay={0} top="15%" />
      <FlyingBat delay={5} top="35%" />
      <FlyingBat delay={10} top="55%" />
      
      <Box id="particles-container">
        {[...Array(60)].map((_, i) => {
          const colors = ['particle-orange', 'particle-purple', 'particle-green'];
          const randomColor = colors[Math.floor(Math.random() * colors.length)];
          const duration = 8 + Math.random() * 12;
          const delay = Math.random() * 10;
          
          return (
            <div 
              key={i} 
              className={`halloween-particle ${randomColor}`} 
              style={{ 
                left: `${Math.random() * 100}%`,
                width: `${4 + Math.random() * 12}px`,
                height: `${4 + Math.random() * 12}px`,
                position: 'fixed',
                bottom: '-20px',
                borderRadius: '50%',
                opacity: 0,
                pointerEvents: 'none',
                zIndex: 3,
                animation: `float-ghost ${duration}s linear ${delay}s infinite`
              }} 
            />
          );
        })}
      </Box>

      <Box sx={{ minHeight: '100vh', py: { xs: 2, md: 3 }, position: 'relative', zIndex: 10, color: '#ffffff', fontFamily: '"Inter", sans-serif', px: { xs: 1, sm: 1.5, md: 2 } }}>
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%' }}>
          
          <GothicHeader isConnected={isConnected} />
          
          {!isConnected && (
            <Box sx={{ mb: 3, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, borderRadius: '16px', border: '2px solid rgba(255, 0, 64, 0.8)', background: 'rgba(255, 0, 64, 0.2)', backdropFilter: 'blur(12px)', animation: 'alert-pulse 2s infinite' }}>
              <Typography sx={{ color: '#ffffff', fontWeight: 700, fontFamily: '"Montserrat", sans-serif', letterSpacing: '1px', textShadow: '0 0 10px rgba(255, 0, 64, 0.8)' }}>⚠️ CONNEXION WEBSOCKET PERDUE</Typography>
              <Button size="small" variant="outlined" onClick={reconnect} sx={{ background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.9), rgba(157, 78, 221, 0.7))', color: '#ffffff', border: '2px solid rgba(255, 200, 100, 0.8)', '&:hover': { background: 'linear-gradient(135deg, rgba(255, 123, 77, 0.9), rgba(173, 98, 255, 0.7))' } }}> Reconnecter</Button>
            </Box>
          )}

          <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ 
                background: 'linear-gradient(135deg, rgba(10, 5, 10, 0.60), rgba(26, 15, 26, 0.50))', 
                backdropFilter: 'blur(20px)', 
                borderRadius: '20px', 
                p: 2, 
                border: '1px solid rgba(157, 78, 221, 0.5)', 
                boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                minHeight: '140px', // ✅ Augmentation de la hauteur
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <Typography sx={{ fontSize: '0.75rem', color: '#d484f0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>👥 Total Techs</Typography>
                <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', textShadow: '0 0 15px rgba(157, 78, 221, 0.6), 0 2px 4px rgba(0,0,0,0.9)' }}>{kpi.totalAgents}</Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ 
                background: 'linear-gradient(135deg, rgba(10, 5, 10, 0.60), rgba(26, 15, 26, 0.50))', 
                backdropFilter: 'blur(20px)', 
                borderRadius: '20px', 
                p: 2, 
                border: '1px solid rgba(255, 170, 0, 0.5)', 
                boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                minHeight: '140px', // ✅ Augmentation de la hauteur
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <Typography sx={{ fontSize: '0.75rem', color: '#ffaa00', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>📞 Number of Calls</Typography>
                <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', textShadow: '0 0 15px rgba(255, 170, 0, 0.6), 0 2px 4px rgba(0,0,0,0.9)' }}>{kpi.totalCallsThisWeek}</Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ 
                background: 'linear-gradient(135deg, rgba(10, 5, 10, 0.60), rgba(26, 15, 26, 0.50))', 
                backdropFilter: 'blur(20px)', 
                borderRadius: '20px', 
                p: 2, 
                border: `1px solid ${isInboundAHTCritical ? 'rgba(255, 69, 0, 0.6)' : 'rgba(57, 255, 20, 0.6)'}`, 
                boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                minHeight: '140px', // ✅ Augmentation de la hauteur
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <Typography sx={{ fontSize: '0.75rem', color: isInboundAHTCritical ? '#ff4500' : '#39ff14', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>⏱️ Avg Inbound AHT</Typography>
                <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', textShadow: `0 0 15px ${isInboundAHTCritical ? 'rgba(255, 69, 0, 0.6)' : 'rgba(57, 255, 20, 0.6)'}, 0 2px 4px rgba(0,0,0,0.9)` }}>{kpi.avgInboundAHT}</Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ 
                background: 'linear-gradient(135deg, rgba(10, 5, 10, 0.60), rgba(26, 15, 26, 0.50))', 
                backdropFilter: 'blur(20px)', 
                borderRadius: '20px', 
                p: 2, 
                border: `1px solid ${isOutboundAHTCritical ? 'rgba(255, 69, 0, 0.6)' : 'rgba(57, 255, 20, 0.6)'}`, 
                boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                minHeight: '140px', // ✅ Augmentation de la hauteur
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <Typography sx={{ fontSize: '0.75rem', color: isOutboundAHTCritical ? '#ff4500' : '#39ff14', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>📤 Avg Outbound AHT</Typography>
                <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', textShadow: `0 0 15px ${isOutboundAHTCritical ? 'rgba(255, 69, 0, 0.6)' : 'rgba(57, 255, 20, 0.6)'}, 0 2px 4px rgba(0,0,0,0.9)` }}>{kpi.avgOutboundAHT}</Typography>
              </Box>
            </Grid>
          </Grid>

          <Grid container spacing={2.5} sx={{ mt: 2 }}>
            {[
              { title: "Answered Calls", value: kpi.totalAnsweredCalls, icon: "✅", color: "#39ff14" },
              { title: "Missed Calls", value: kpi.missedCallsTotal, icon: "", color: "#ff4500" },
              { title: "Total Inbound", value: kpi.totalInboundCalls, icon: "", color: "#9d4edd" },
              { title: "Total Outbound", value: kpi.totalOutboundCalls, icon: "", color: "#ffaa00" },
              { title: "Abandon Rate", value: kpi.abandonRate, icon: "", color: isAbandonRateCritical ? "#ff4500" : "#39ff14" },
            ].map((item, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={i}>
                <Box sx={{ 
                  background: 'linear-gradient(135deg, rgba(10, 5, 10, 0.60), rgba(26, 15, 26, 0.50))', 
                  backdropFilter: 'blur(20px)', 
                  borderRadius: '20px', 
                  p: 2, 
                  border: `1px solid ${item.color}80`, 
                  boxShadow: '0 8px 32px rgba(0,0,0,0.6)', 
                  textAlign: 'center',
                  minHeight: '140px', // ✅ Augmentation de la hauteur
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center'
                }}>
                  <Typography sx={{ fontSize: '1.5rem', mb: 0.5 }}>{item.icon}</Typography>
                  <Typography sx={{ fontSize: '0.7rem', color: item.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.title}</Typography>
                  <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', mt: 0.5, textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}>{item.value}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Box mt={4} sx={{ background: 'transparent', p: 0 }}>
            <CallVolumeChart callVolumes={callVolumes} wsConnected={isConnected} halfHourSlots={halfHourSlots} />
          </Box>

          <Box mt={4} pb={4} sx={{ width: '100%' }}>
            <Grid container spacing={4} direction="column">
              <Grid size={{ xs: 12 }}>
                <AgentTable employees={employees.map((emp) => ({ ...emp, avgInboundAHT: formatSecondsToMMSS(emp.inbound > 0 ? Math.floor(emp.inboundHandlingTimeSec / emp.inbound) : 0), avgOutboundAHT: formatSecondsToMMSS(emp.outbound > 0 ? Math.floor(emp.outboundHandlingTimeSec / emp.outbound) : 0) }))} isLoading={!isConnected && employees.length === 0} isConnected={isConnected} lastUpdate={lastUpdate} />
              </Grid>
              
              <Grid size={{ xs: 12 }}>
                <Box position="relative" sx={{ background: 'transparent', p: 0 }}>
                  <SLABarchart slaData={slaDataForChart} wsConnected={isConnected} />
                  {!audioUnlocked && (
                    <Box sx={{ position: 'absolute', bottom: 24, right: 24, zIndex: 20 }}>
                      <Button variant="contained" onClick={unlockAudio} sx={{ background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.9), rgba(157, 78, 221, 0.7))', color: '#ffffff', fontWeight: 700, borderRadius: '12px', border: '2px solid rgba(255, 200, 100, 0.8)', boxShadow: '0 4px 20px rgba(255, 107, 53, 0.5)', '&:hover': { transform: 'translateY(-3px) scale(1.05)' } }}>🧪 Activer les Alertes Sonores</Button>
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>
      
      <style>{`
        @keyframes fog-drift { 0%, 100% { transform: translateY(0); opacity: 0.3; } 50% { transform: translateY(-30px); opacity: 0.6; } }
        .halloween-particle { pointer-events: none; z-index: 3; }
        @keyframes alert-pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(255, 0, 64, 0.7); } 50% { box-shadow: 0 0 0 15px rgba(255, 0, 64, 0); } }
        .particle-orange { background: radial-gradient(circle at 30% 30%, #ffaa00, #ff6b35); box-shadow: 0 0 15px #ff6b35, 0 0 30px #ffaa00; }
        .particle-purple { background: radial-gradient(circle at 30% 30%, #d484f0, #9d4edd); box-shadow: 0 0 15px #9d4edd, 0 0 30px #7b2cbf; }
        .particle-green { background: radial-gradient(circle at 30% 30%, #7fff00, #39ff14); box-shadow: 0 0 15px #39ff14, 0 0 30px #00ff00; }
        
        /* ✅ Masquer la barre de défilement tout en gardant le scroll fonctionnel */
        html, body {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;     /* Firefox */
        }
        html::-webkit-scrollbar, body::-webkit-scrollbar {
          display: none;             /* Chrome, Safari, Opera */
        }
      `}</style>
    </>
  );
};

export default App;