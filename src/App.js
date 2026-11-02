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
// === 🦉 HEADER TECH INNOVEO (TRANSPARENCE MAXIMISÉE) ===
// ============================================================================
function TechHeader({ isConnected }) {
  const [time, setTime] = useState(new Date());
  const [energyPulse, setEnergyPulse] = useState({ h: 1, m: 1, s: 1 });
  
  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    const pulseId = setInterval(() => {
      setEnergyPulse({ h: 0.85 + Math.random() * 0.3, m: 0.85 + Math.random() * 0.3, s: 0.85 + Math.random() * 0.3 });
    }, 150);
    return () => { clearInterval(timerId); clearInterval(pulseId); };
  }, []);
  
  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');
  const dateStr = time.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const TechElement = ({ color = '#00D4FF' }) => (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      mx: 0.5,
      position: 'relative'
    }}>
      <Box sx={{ 
        width: '3px', 
        height: '20px', 
        background: `linear-gradient(180deg, ${color} 0%, transparent 100%)`,
        borderRadius: '2px',
        boxShadow: `0 0 10px ${color}`,
        animation: 'antenna-pulse 2s ease-in-out infinite'
      }} />
      <Box sx={{ 
        width: '14px', 
        height: '14px', 
        background: `radial-gradient(circle, ${color} 0%, #006699 100%)`,
        borderRadius: '50%',
        border: `2px solid ${color}`,
        boxShadow: `0 0 20px ${color}, inset 0 0 10px rgba(255,255,255,0.3)`,
        position: 'relative',
        zIndex: 2,
        my: 0.5
      }}>
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '6px', height: '6px', background: '#ffffff', borderRadius: '50%', opacity: 0.8
        }} />
      </Box>
      <Box sx={{ 
        width: '20px', 
        height: '3px', 
        background: `linear-gradient(90deg, transparent 0%, ${color} 50%, transparent 100%)`,
        borderRadius: '2px',
        boxShadow: `0 0 8px ${color}`
      }} />
    </Box>
  );

  const TimeDigit = ({ value, label, color, pulseValue }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', px: 1 }}>
      <TechElement color={color} />
      <Box sx={{ 
        mx: 1.5, px: 2.5, py: 1.5, 
        background: 'rgba(0, 15, 25, 0.25)', // ✅ Plus transparent
        borderRadius: '16px', 
        border: `1.5px solid ${color}60`, // ✅ Bordure plus subtile
        boxShadow: `0 0 25px ${color}40, inset 0 0 20px ${color}15`, 
        minWidth: '90px', textAlign: 'center', position: 'relative', overflow: 'hidden',
        backdropFilter: 'blur(12px)' // ✅ Blur légèrement réduit pour plus de clarté du fond
      }}>
        <Box sx={{ 
          position: 'absolute', top: 0, left: 0, right: 0, height: '50%', 
          background: `linear-gradient(180deg, ${color}20 0%, transparent 100%)`, 
          opacity: pulseValue, transition: 'opacity 0.15s' 
        }} />
        <Box sx={{
          position: 'absolute', top: '5px', left: '5px', right: '5px', bottom: '5px',
          border: `1px solid ${color}25`, borderRadius: '10px', pointerEvents: 'none'
        }} />
        <Typography sx={{ 
          fontFamily: '"Orbitron", sans-serif', fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 800, 
          color: '#ffffff', textShadow: `0 0 10px ${color}, 0 0 20px ${color}80`, 
          position: 'relative', zIndex: 2, letterSpacing: '4px' 
        }}>
          {value}
        </Typography>
        <Typography sx={{ 
          fontFamily: '"Rajdhani", sans-serif', fontSize: '0.65rem', color: color, 
          textTransform: 'uppercase', letterSpacing: '3px', fontWeight: 700, mt: 0.5, textShadow: `0 0 8px ${color}` 
        }}>
          {label}
        </Typography>
      </Box>
      <TechElement color={color} />
    </Box>
  );

  return (
    <Box sx={{
      position: 'relative',
      // ✅ TRANSPARENCE ACCRUE (0.40→0.25, 0.30→0.20, 0.25→0.15)
      background: 'linear-gradient(135deg, rgba(0, 20, 30, 0.25) 0%, rgba(0, 30, 50, 0.20) 30%, rgba(0, 50, 80, 0.15) 70%, rgba(0, 20, 30, 0.25) 100%)',
      backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      padding: { xs: '1.5rem 1rem', md: '2rem 2rem' }, borderRadius: '24px',
      border: '1px solid rgba(0, 212, 255, 0.3)', borderTop: '2px solid #FFD700', borderBottom: '2px solid #00D4FF',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 0 30px rgba(0, 212, 255, 0.05)',
      overflow: 'hidden', mb: 3,
    }}>
      <Box sx={{ position: 'absolute', top: 8, left: 8, fontSize: '1.5rem', opacity: 0.4, animation: 'circuit-pulse 4s ease-in-out infinite' }}>📡</Box>
      <Box sx={{ position: 'absolute', top: 8, right: 8, fontSize: '1.5rem', opacity: 0.4, animation: 'circuit-pulse 4s ease-in-out infinite 2s' }}>🛰️</Box>
      <Box sx={{ position: 'absolute', bottom: 8, left: 8, fontSize: '1.2rem', opacity: 0.3 }}>🔌</Box>
      <Box sx={{ position: 'absolute', bottom: 8, right: 8, fontSize: '1.2rem', opacity: 0.3 }}>⚡</Box>
      
      <Box sx={{ 
        position: 'absolute', top: '50%', left: '5%', right: '5%', height: '1px', 
        background: 'linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.2), rgba(245, 197, 24, 0.2), transparent)', 
        transform: 'translateY(-50%)' 
      }} />
      
      {[...Array(8)].map((_, i) => {
        const duration = 3 + Math.random() * 4;
        const delay = Math.random() * 3;
        return (
          <Box key={i} sx={{ 
            position: 'absolute', width: `${3 + Math.random() * 4}px`, height: `${3 + Math.random() * 4}px`,
            background: `radial-gradient(circle, ${['#FFD700', '#00D4FF', '#00BFFF', '#F5C518'][i % 4]}, transparent)`,
            borderRadius: '50%', bottom: '10%', left: `${10 + (i * 12)}%`, opacity: 0,
            animation: `data-sparkle ${duration}s ease-out ${delay}s infinite`,
            boxShadow: `0 0 10px ${['#FFD700', '#00D4FF', '#00BFFF'][i % 3]}`,
          }} />
        );
      })}

      <Box sx={{ position: 'relative', zIndex: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', justifyContent: 'space-between', mb: 2, gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ fontSize: '2.5rem', animation: 'owl-glow 2s ease-in-out infinite', filter: 'drop-shadow(0 0 15px rgba(0, 212, 255, 0.8))' }}>🦉</Box>
            <Box>
              <Typography sx={{ 
                fontFamily: '"Orbitron", sans-serif', fontSize: { xs: '2rem', md: '2.5rem' }, fontWeight: 900, 
                background: 'linear-gradient(135deg, #FFD700 0%, #00D4FF 50%, #00BFFF 100%)', 
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', 
                letterSpacing: '0.08em', textShadow: '0 0 30px rgba(0, 212, 255, 0.5)', lineHeight: 1 
              }}>
                INNOVEO
              </Typography>
              <Typography sx={{ 
                fontFamily: '"Rajdhani", sans-serif', fontSize: { xs: '1.4rem', md: '1.8rem' }, color: '#00D4FF', 
                letterSpacing: '1px', fontWeight: 600, textShadow: '0 0 10px rgba(0, 212, 255, 0.6)', 
                display: 'flex', alignItems: 'center', gap: 0.5 
              }}>
                <span style={{ animation: 'tech-twinkle 2s ease-in-out infinite' }}>◈</span> 
                L'intelligence au service de vos données... 
                <span style={{ animation: 'tech-twinkle 2s ease-in-out infinite 1s' }}>◈</span>
              </Typography>
            </Box>
          </Box>

          <Box sx={{ 
            px: 3, py: 1.5, background: 'rgba(0, 0, 0, 0.20)', borderRadius: '16px', 
            border: '1px solid rgba(0, 212, 255, 0.3)', boxShadow: '0 0 20px rgba(0, 212, 255, 0.15)' 
          }}>
            <Typography sx={{ 
              fontFamily: '"Rajdhani", sans-serif', fontSize: { xs: '1rem', md: '1.3rem' }, color: '#00D4FF', 
              fontWeight: 700, textTransform: 'capitalize', letterSpacing: '1.5px', textShadow: '0 0 12px rgba(0, 212, 255, 0.8)' 
            }}>
               📅 {dateStr}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, gap: 1 }}>
          <Box sx={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.4))' }} />
          <Typography sx={{ fontSize: '1rem', opacity: 0.6 }}>⚡</Typography>
          <Box sx={{ width: '8px', height: '8px', background: '#FFD700', borderRadius: '50%', boxShadow: '0 0 10px #FFD700' }} />
          <Typography sx={{ fontSize: '1rem', opacity: 0.6 }}>📡</Typography>
          <Box sx={{ width: '8px', height: '8px', background: '#00D4FF', borderRadius: '50%', boxShadow: '0 0 10px #00D4FF' }} />
          <Typography sx={{ fontSize: '1rem', opacity: 0.6 }}>⚡</Typography>
          <Box sx={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(0, 212, 255, 0.4), transparent)' }} />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: { xs: 1, md: 2 }, py: 1 }}>
          <TimeDigit value={hours} label="Heures" color="#FFD700" pulseValue={energyPulse.h} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mx: 1 }}>
            <Box sx={{ width: '12px', height: '12px', background: '#00D4FF', borderRadius: '50%', boxShadow: '0 0 15px #00D4FF, 0 0 30px #00D4FF', animation: 'separator-pulse 1s ease-in-out infinite' }} />
            <Box sx={{ width: '12px', height: '12px', background: '#00D4FF', borderRadius: '50%', boxShadow: '0 0 15px #00D4FF, 0 0 30px #00D4FF', animation: 'separator-pulse 1s ease-in-out infinite 0.5s' }} />
          </Box>
          <TimeDigit value={minutes} label="Minutes" color="#00D4FF" pulseValue={energyPulse.m} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mx: 1 }}>
            <Box sx={{ width: '12px', height: '12px', background: '#00BFFF', borderRadius: '50%', boxShadow: '0 0 15px #00BFFF, 0 0 30px #00BFFF', animation: 'separator-pulse 1s ease-in-out infinite' }} />
            <Box sx={{ width: '12px', height: '12px', background: '#00BFFF', borderRadius: '50%', boxShadow: '0 0 15px #00BFFF, 0 0 30px #00BFFF', animation: 'separator-pulse 1s ease-in-out infinite 0.5s' }} />
          </Box>
          <TimeDigit value={seconds} label="Secondes" color="#00BFFF" pulseValue={energyPulse.s} />
        </Box>
      </Box>

      <style>{`
        @keyframes antenna-pulse { 0%, 100% { opacity: 0.6; transform: scaleY(1); } 50% { opacity: 1; transform: scaleY(1.1); } }
        @keyframes owl-glow { 0%, 100% { filter: drop-shadow(0 0 15px rgba(0, 212, 255, 0.8)); transform: scale(1); } 50% { filter: drop-shadow(0 0 25px rgba(0, 212, 255, 1)); transform: scale(1.05); } }
        @keyframes tech-twinkle { 0%, 100% { opacity: 0.5; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
        @keyframes separator-pulse { 0%, 100% { opacity: 0.5; transform: scale(1); } 50% { opacity: 1; transform: scale(1.3); } }
        @keyframes data-sparkle { 0% { transform: translateY(0) scale(0); opacity: 0; } 20% { opacity: 1; transform: translateY(-20px) scale(1); } 100% { transform: translateY(-100px) scale(0); opacity: 0; } }
        @keyframes circuit-pulse { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(5deg); } 75% { transform: rotate(-5deg); } }
      `}</style>
    </Box>
  );
}

// 📊 Flux de Données Tech
function DataStream({ delay = 0, top = '10%' }) {
  return (
    <Box sx={{ position: 'fixed', top: top, left: '-100px', fontFamily: 'Orbitron, monospace', fontSize: '0.8rem', color: '#00D4FF', opacity: 0.3, pointerEvents: 'none', zIndex: 5, animation: `data-flow 20s linear ${delay}s infinite`, textShadow: '0 0 10px rgba(0, 212, 255, 0.5)' }}>
      01001000 1101001
      <style>{`@keyframes data-flow { 0% { left: -100px; transform: translateY(0); opacity: 0; } 10% { opacity: 0.6; } 90% { opacity: 0.6; } 100% { left: calc(100vw + 100px); transform: translateY(-20px); opacity: 0; } }`}</style>
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
      <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Rajdhani:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      
      <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: `url('${process.env.PUBLIC_URL}/images/innoveo-bg.png')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed', zIndex: 0 }} />
      <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(180deg, transparent 0%, rgba(0, 212, 255, 0.05) 50%, transparent 100%)', pointerEvents: 'none', zIndex: 1, animation: 'tech-pulse 15s ease-in-out infinite' }} />
      <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.2) 100%)', pointerEvents: 'none', zIndex: 2 }} />
      
      <DataStream delay={0} top="15%" />
      <DataStream delay={7} top="35%" />
      <DataStream delay={14} top="55%" />
      
      <Box id="particles-container">
        {[...Array(60)].map((_, i) => {
          const colors = ['particle-cyan', 'particle-yellow', 'particle-blue'];
          const randomColor = colors[Math.floor(Math.random() * colors.length)];
          const duration = 8 + Math.random() * 12;
          const delay = Math.random() * 10;
          
          return (
            <div 
              key={i} 
              className={`innoveo-particle ${randomColor}`} 
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
                animation: `float-tech ${duration}s linear ${delay}s infinite`
              }} 
            />
          );
        })}
      </Box>

      <Box 
        className="dashboard-scroll"
        sx={{ 
          minHeight: '100vh', maxHeight: '100vh', overflowY: 'auto', py: { xs: 2, md: 3 }, 
          position: 'relative', zIndex: 10, color: '#ffffff', fontFamily: '"Inter", sans-serif', px: { xs: 1, sm: 1.5, md: 2 } 
        }}
      >
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%' }}>
          
          <TechHeader isConnected={isConnected} />
          
          {!isConnected && (
            <Box sx={{ mb: 3, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, borderRadius: '16px', border: '2px solid rgba(255, 69, 0, 0.6)', background: 'rgba(255, 69, 0, 0.10)', backdropFilter: 'blur(12px)', animation: 'alert-pulse 2s infinite' }}>
              <Typography sx={{ color: '#ffffff', fontWeight: 700, fontFamily: '"Orbitron", sans-serif', letterSpacing: '1px', textShadow: '0 0 10px rgba(255, 69, 0, 0.8)' }}>⚠️ CONNEXION WEBSOCKET PERDUE</Typography>
              <Button size="small" variant="outlined" onClick={reconnect} sx={{ background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.8), rgba(245, 197, 24, 0.6))', color: '#ffffff', border: '1.5px solid rgba(0, 212, 255, 0.6)', '&:hover': { background: 'linear-gradient(135deg, rgba(0, 191, 255, 0.9), rgba(255, 215, 0, 0.7))' } }}>🔄 Reconnecter</Button>
            </Box>
          )}

          {/* ✅ KPI DU HAUT : TRANSPARENCE MAXIMISÉE (0.35→0.15 / 0.25→0.10) */}
          <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ 
                background: 'linear-gradient(135deg, rgba(0, 20, 30, 0.15), rgba(0, 30, 50, 0.10))', 
                backdropFilter: 'blur(16px)', 
                borderRadius: '20px', p: 2, 
                border: '1px solid rgba(0, 212, 255, 0.35)', 
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                minHeight: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center'
              }}>
                <Typography sx={{ fontSize: '0.75rem', color: '#00D4FF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>👥 Total Techs</Typography>
                <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', textShadow: '0 0 15px rgba(0, 212, 255, 0.6), 0 2px 4px rgba(0,0,0,0.9)' }}>{kpi.totalAgents}</Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ 
                background: 'linear-gradient(135deg, rgba(0, 20, 30, 0.15), rgba(0, 30, 50, 0.10))', 
                backdropFilter: 'blur(16px)', 
                borderRadius: '20px', p: 2, 
                border: '1px solid rgba(255, 215, 0, 0.35)', 
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                minHeight: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center'
              }}>
                <Typography sx={{ fontSize: '0.75rem', color: '#FFD700', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>📞 Number of Calls</Typography>
                <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', textShadow: '0 0 15px rgba(255, 215, 0, 0.6), 0 2px 4px rgba(0,0,0,0.9)' }}>{kpi.totalCallsThisWeek}</Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ 
                background: 'linear-gradient(135deg, rgba(0, 20, 30, 0.15), rgba(0, 30, 50, 0.10))', 
                backdropFilter: 'blur(16px)', 
                borderRadius: '20px', p: 2, 
                border: `1px solid ${isInboundAHTCritical ? 'rgba(255, 69, 0, 0.4)' : 'rgba(0, 255, 100, 0.4)'}`, 
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                minHeight: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center'
              }}>
                <Typography sx={{ fontSize: '0.75rem', color: isInboundAHTCritical ? '#ff4500' : '#00ff64', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>⏱️ Avg Inbound AHT</Typography>
                <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', textShadow: `0 0 15px ${isInboundAHTCritical ? 'rgba(255, 69, 0, 0.6)' : 'rgba(0, 255, 100, 0.6)'}, 0 2px 4px rgba(0,0,0,0.9)` }}>{kpi.avgInboundAHT}</Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{ 
                background: 'linear-gradient(135deg, rgba(0, 20, 30, 0.15), rgba(0, 30, 50, 0.10))', 
                backdropFilter: 'blur(16px)', 
                borderRadius: '20px', p: 2, 
                border: `1px solid ${isOutboundAHTCritical ? 'rgba(255, 69, 0, 0.4)' : 'rgba(0, 255, 100, 0.4)'}`, 
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                minHeight: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center'
              }}>
                <Typography sx={{ fontSize: '0.75rem', color: isOutboundAHTCritical ? '#ff4500' : '#00ff64', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>📤 Avg Outbound AHT</Typography>
                <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', textShadow: `0 0 15px ${isOutboundAHTCritical ? 'rgba(255, 69, 0, 0.6)' : 'rgba(0, 255, 100, 0.6)'}, 0 2px 4px rgba(0,0,0,0.9)` }}>{kpi.avgOutboundAHT}</Typography>
              </Box>
            </Grid>
          </Grid>

          {/* ✅ KPI DU BAS : TRANSPARENCE MAXIMISÉE */}
          <Grid container spacing={2.5} sx={{ mt: 2 }}>
            {[
              { title: "Answered Calls", value: kpi.totalAnsweredCalls, icon: "✅", color: "#00ff64" },
              { title: "Missed Calls", value: kpi.missedCallsTotal, icon: "❌", color: "#ff4500" },
              { title: "Total Inbound", value: kpi.totalInboundCalls, icon: "📥", color: "#00D4FF" },
              { title: "Total Outbound", value: kpi.totalOutboundCalls, icon: "📤", color: "#FFD700" },
              { title: "Abandon Rate", value: kpi.abandonRate, icon: "📉", color: isAbandonRateCritical ? "#ff4500" : "#00ff64" },
            ].map((item, i) => (
              <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={i}>
                <Box sx={{ 
                  background: 'linear-gradient(135deg, rgba(0, 20, 30, 0.15), rgba(0, 30, 50, 0.10))', 
                  backdropFilter: 'blur(16px)', 
                  borderRadius: '20px', p: 2, 
                  border: `1px solid ${item.color}50`, 
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)', 
                  textAlign: 'center', minHeight: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
                }}>
                  <Typography sx={{ fontSize: '1.5rem', mb: 0.5 }}>{item.icon}</Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: item.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {item.title}
                  </Typography>
                  <Typography sx={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', mt: 0.5, textShadow: '0 0 15px rgba(255, 255, 255, 0.3), 0 2px 4px rgba(0,0,0,0.9)' }}>
                    {item.value}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Box mt={4} sx={{ background: 'transparent', p: 0, minHeight: '400px' }}>
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
                      <Button variant="contained" onClick={unlockAudio} sx={{ background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.8), rgba(245, 197, 24, 0.6))', color: '#ffffff', fontWeight: 700, borderRadius: '12px', border: '1.5px solid rgba(0, 212, 255, 0.6)', boxShadow: '0 4px 20px rgba(0, 212, 255, 0.4)', '&:hover': { transform: 'translateY(-3px) scale(1.05)' } }}>⚡ Activer les Alertes Sonores</Button>
                    </Box>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>
      
      <style>{`
        html, body { overflow: hidden; height: 100%; -ms-overflow-style: none; scrollbar-width: none; }
        html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; }
        .dashboard-scroll { scrollbar-width: none; -ms-overflow-style: none; }
        .dashboard-scroll::-webkit-scrollbar { display: none; }
        @keyframes tech-pulse { 0%, 100% { transform: translateY(0); opacity: 0.3; } 50% { transform: translateY(-30px); opacity: 0.6; } }
        .innoveo-particle { pointer-events: none; z-index: 3; }
        @keyframes alert-pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(255, 69, 0, 0.5); } 50% { box-shadow: 0 0 0 15px rgba(255, 69, 0, 0); } }
        .particle-cyan { background: radial-gradient(circle at 30% 30%, #00ffff, #00D4FF); box-shadow: 0 0 15px #00D4FF, 0 0 30px #00BFFF; }
        .particle-yellow { background: radial-gradient(circle at 30% 30%, #FFD700, #F5C518); box-shadow: 0 0 15px #F5C518, 0 0 30px #FFD700; }
        .particle-blue { background: radial-gradient(circle at 30% 30%, #0099FF, #0066CC); box-shadow: 0 0 15px #0099FF, 0 0 30px #0066CC; }
        @keyframes float-tech { 0% { transform: translateY(100vh) scale(0.5); opacity: 0; } 10% { opacity: 0.6; } 50% { transform: translateY(50vh) scale(1.2) translateX(10px); opacity: 0.4; } 100% { transform: translateY(-10vh) scale(0.8) translateX(-10px); opacity: 0; } }
      `}</style>
    </>
  );
};

export default App;