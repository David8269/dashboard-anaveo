import { useMemo } from 'react';

// === Helpers internes ===
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

// Fonction pour détecter un appel abandonné (utilisée uniquement pour les appels SANS agent)
const isAbandonedCall = (call) => {
  const status = (call.status || '').toLowerCase();
  return (
    status === 'src_participant_terminated' ||
    status === 'dst_participant_terminated' ||
    status.includes('missed') ||
    status.includes('abandoned') ||
    call.durationSec === 0
  );
};

// === Hook principal ===
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

    // ✅ Call Volumes :
    // - TOUS les appels avec agent (CDS_IN / CDS_OUT) sont inclus, même < 60s
    // - Seuls les appels SANS agent (ABSYS/OTHER) abandonnés < 59s sont exclus
    const callVolumes = halfHourSlots.map((time, index) => ({
      index,
      time,
      CDS_IN: 0,
      CDS_OUT: 0,
      ABSYS: 0,
    }));

    recentCalls
      .filter(call => {
        // ✅ Toujours inclure les appels liés à un agent
        if (call.callType === 'CDS_IN' || call.callType === 'CDS_OUT') {
          return true;
        }

        // ❌ Exclure les appels orphelins abandonnés de MOINS DE 59 secondes
        if (call.durationSec < 59 && isAbandonedCall(call)) {
          return false;
        }

        return true;
      })
      .forEach(call => {
        const slotIndex = getSlotIndex(call.startTime, halfHourSlots);
        if (slotIndex >= 0 && slotIndex < callVolumes.length) {
          if (call.callType === 'CDS_IN') callVolumes[slotIndex].CDS_IN += 1;
          else if (call.callType === 'CDS_OUT') callVolumes[slotIndex].CDS_OUT += 1;
          else callVolumes[slotIndex].ABSYS += 1;
        }
      });

    // ✅ KPI et agents : SEULEMENT appels autorisés (CDS_IN / CDS_OUT avec agent)
    const authorizedCalls = recentCalls.filter(call => 
      (call.callType === 'CDS_IN' || call.callType === 'CDS_OUT') && call.agentName
    );

    const agentsMap = {};
    const counts = {
      totalInbound: 0,
      totalOutbound: 0,
      answeredInbound: 0,
      answeredOutbound: 0,
      missedFromAgents: 0,
      inboundHandlingTime: 0,
      outboundHandlingTime: 0,
    };

    for (const call of authorizedCalls) {
      if (call.callType === 'CDS_IN') {
        counts.totalInbound += 1;
        if (isAbandonedCall(call)) {
          counts.missedFromAgents += 1;
        } else {
          counts.answeredInbound += 1;
          counts.inboundHandlingTime += call.durationSec || 0;
        }
      } else if (call.callType === 'CDS_OUT') {
        counts.totalOutbound += 1;
        counts.answeredOutbound += 1;
        counts.outboundHandlingTime += call.durationSec || 0;
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
          if (isAbandonedCall(call)) {
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
    const totalMissed = counts.missedFromAgents;
    const totalInbound = counts.totalInbound;

    const avgInboundAHTSec = counts.answeredInbound > 0
      ? Math.floor(counts.inboundHandlingTime / counts.answeredInbound)
      : 0;
    const avgOutboundAHTSec = counts.answeredOutbound > 0
      ? Math.floor(counts.outboundHandlingTime / counts.answeredOutbound)
      : 0;
    const globalAHTSec = (counts.answeredInbound + counts.answeredOutbound) > 0
      ? Math.floor(
          (counts.inboundHandlingTime + counts.outboundHandlingTime) /
          (counts.answeredInbound + counts.answeredOutbound)
        )
      : 0;
    const abandonRate = totalInbound > 0
      ? `${Math.round((totalMissed / totalInbound) * 100)}%`
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
      totalCallsThisWeek: counts.totalInbound + counts.totalOutbound,
    };

    return {
      employees,
      callVolumes,
      kpi,
    };
  }, [allCalls, halfHourSlots]);
};