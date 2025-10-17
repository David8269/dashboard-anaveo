import { useMemo } from 'react';

const isLunchBreak = (date) => {
  if (!date) return false;
  const totalMinutes = date.getHours() * 60 + date.getMinutes();
  return totalMinutes >= 750 && totalMinutes < 840; // 12:30 à 14:00
};

const formatSecondsToMMSS = (totalSeconds) => {
  if (!totalSeconds || isNaN(totalSeconds) || totalSeconds <= 0) return '00:00';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const getSlotIndex = (date, slots) => {
  if (!date) return -1;
  const h = date.getHours();
  const m = date.getMinutes();
  if (h < 8 || (h === 8 && m < 30) || h > 18 || (h === 18 && m > 30)) {
    return -1;
  }
  for (let i = slots.length - 1; i >= 0; i--) {
    const [slotH, slotM] = slots[i].split(':').map(Number);
    if (h > slotH || (h === slotH && m >= slotM)) {
      return i;
    }
  }
  return -1;
};

// 🔴 Fonction unique de filtrage — utilisée partout
const isSignificantAbSysCall = (call) => {
  return (
    call.callType === 'ABSYS' &&
    call.queue === 'Front Office' &&
    call.durationSec >= 59 &&
    !isLunchBreak(call.startTime)
  );
};

export const useCallAggregates = (allCalls = [], halfHourSlots = []) => {
  return useMemo(() => {
    const now = new Date();
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
    
    const recentCalls = allCalls.filter(call => 
      call &&
      call.startTime instanceof Date &&
      !isNaN(call.startTime) &&
      (now - call.startTime) < SEVEN_DAYS
    );

    const callVolumes = halfHourSlots.map((time, index) => ({
      index,
      time,
      CDS_IN: 0,
      CDS_OUT: 0,
      ABSYS: 0,
    }));

    recentCalls.forEach(call => {
      if (call.callType === 'CDS_IN' || call.callType === 'CDS_OUT') {
        const slotIndex = getSlotIndex(call.startTime, halfHourSlots);
        if (slotIndex >= 0 && slotIndex < callVolumes.length) {
          if (call.callType === 'CDS_IN') callVolumes[slotIndex].CDS_IN += 1;
          else if (call.callType === 'CDS_OUT') callVolumes[slotIndex].CDS_OUT += 1;
        }
        return;
      }

      // 🔴 Seulement les ABSYS significatifs sont affichés dans le graphique
      if (isSignificantAbSysCall(call)) {
        const slotIndex = getSlotIndex(call.startTime, halfHourSlots);
        if (slotIndex >= 0 && slotIndex < callVolumes.length) {
          callVolumes[slotIndex].ABSYS += 1;
        }
      }
    });

    const agentsMap = {};
    const counts = {
      totalInbound: 0,
      totalOutbound: 0,
      answeredInbound: 0,
      answeredOutbound: 0,
      missedFromAgents: 0,
      missedAbSys: 0,
      inboundHandlingTime: 0,
      outboundHandlingTime: 0,
    };

    for (const call of recentCalls) {
      if (call.callType === 'CDS_IN') {
        counts.totalInbound += 1;
        if (call.durationSec === 0) {
          counts.missedFromAgents += 1;
        } else {
          counts.answeredInbound += 1;
          counts.inboundHandlingTime += call.durationSec || 0;
        }
      } else if (call.callType === 'CDS_OUT') {
        counts.totalOutbound += 1;
        counts.answeredOutbound += 1;
        counts.outboundHandlingTime += call.durationSec || 0;
      } else if (isSignificantAbSysCall(call)) {
        counts.missedAbSys += 1;
      }

      if (call.agentName) {
        if (!agentsMap[call.agentName]) {
          agentsMap[call.agentName] = {
            name: call.agentName,
            status: 'online',
            inbound: 0,
            missed: 0,
            outbound: 0,
            inboundHandlingTimeSec: 0,
            outboundHandlingTimeSec: 0,
          };
        }
        const agent = agentsMap[call.agentName];
        if (call.callType === 'CDS_IN') {
          if (call.durationSec === 0) {
            agent.missed += 1;
          } else {
            agent.inbound += 1;
            agent.inboundHandlingTimeSec += call.durationSec || 0;
          }
        } else if (call.callType === 'CDS_OUT') {
          agent.outbound += 1;
          agent.outboundHandlingTimeSec += call.durationSec || 0;
        }
      }
    }

    const employees = Object.values(agentsMap);
    const totalMissed = counts.missedFromAgents + counts.missedAbSys;
    const totalInbound = counts.totalInbound;

    const avgInboundAHTSec = counts.answeredInbound > 0
      ? Math.floor(counts.inboundHandlingTime / counts.answeredInbound)
      : 0;
    const avgOutboundAHTSec = counts.answeredOutbound > 0
      ? Math.floor(counts.outboundHandlingTime / counts.answeredOutbound)
      : 0;
    const globalAHTSec = (counts.answeredInbound + counts.answeredOutbound) > 0
      ? Math.floor((counts.inboundHandlingTime + counts.outboundHandlingTime) / (counts.answeredInbound + counts.answeredOutbound))
      : 0;
    const abandonRate = (totalInbound + counts.missedAbSys) > 0
      ? `${Math.round((totalMissed / (totalInbound + counts.missedAbSys)) * 100)}%`
      : '0%';

    const kpi = {
      totalAgents: employees.length,
      onlineAgents: employees.length,
      totalInboundCalls: totalInbound,
      totalAnsweredCalls: counts.answeredInbound,
      missedCallsTotal: totalMissed,
      totalOutboundCalls: counts.totalOutbound,
      globalAHTSec,
      averageHandlingTime: formatSecondsToMMSS(globalAHTSec),
      abandonRate,
      avgInboundAHT: formatSecondsToMMSS(avgInboundAHTSec),
      avgOutboundAHT: formatSecondsToMMSS(avgOutboundAHTSec),
      totalCallsThisWeek: counts.totalInbound + counts.totalOutbound + counts.missedAbSys,
    };

    return {
      employees,
      callVolumes,
      kpi,
    };
  }, [allCalls, halfHourSlots]);
};