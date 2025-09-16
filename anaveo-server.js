// anaveo-server.js (version améliorée)
const WebSocket = require('ws');
const http = require('http');
const axios = require('axios');

const PORT = 3000;
const ALLOWED_IP = '62.160.4.40'; // IP autorisée côté 3CX
const CDR_SERVER = `http://${ALLOWED_IP}:3000/cdr`; // Endpoint CDR 3CX
const REFRESH_INTERVAL = 5000; // 5 secondes

const server = http.createServer();
const wss = new WebSocket.Server({ server, path: '/cdr' });

// Formate les secondes en mm:ss
function formatSecondsToMMSS(totalSeconds) {
  if (!totalSeconds || isNaN(totalSeconds) || totalSeconds <= 0) return '00:00';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;
}

// Récupération des CDR depuis 3CX
async function fetchCDR() {
  try {
    const response = await axios.get(CDR_SERVER, { timeout: 5000 });
    return response.data; // Tableau JSON de CDR
  } catch (err) {
    console.error('Erreur récupération CDR:', err.message);
    return [];
  }
}

// Reformate les CDR pour le dashboard
function mapCDR(cdrRaw) {
  return cdrRaw.map(cdr => {
    const answeredCalls = cdr['time-answered'] ? 1 : 0;
    const missed = !cdr['time-answered'] ? 1 : 0;
    const inbound = cdr['to-type'] === 'Agent' ? 1 : 0;
    const outbound = cdr['from-type'] === 'Agent' ? 1 : 0;
    const totalHandlingTimeSec = Number(cdr['duration']) || 0;
    const avgSec = answeredCalls > 0 ? totalHandlingTimeSec / answeredCalls : 0;

    return {
      id: cdr.id || null,
      name: cdr.agentName || 'Agent',
      status: cdr.status || 'available',
      answeredCalls,
      missed,
      inbound,
      outbound,
      totalHandlingTimeSec,
      ahtSec: avgSec,
      aht: formatSecondsToMMSS(avgSec), // prêt à afficher
    };
  });
}

// Envoie les données à tous les clients connectés
async function broadcastCDR() {
  const rawData = await fetchCDR();
  const mapped = mapCDR(rawData);

  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(mapped));
    }
  });

  // Log simplifié côté serveur pour suivre les agents
  console.clear();
  console.log(`=== CDR Update ${new Date().toLocaleTimeString()} ===`);
  mapped.forEach(agent => {
    console.log(
      `${agent.name} | Status: ${agent.status} | In: ${agent.inbound} | Missed: ${agent.missed} | Out: ${agent.outbound} | AHT: ${agent.aht}`
    );
  });
}

// Gestion des connexions WebSocket
wss.on('connection', (ws, req) => {
  const clientIP = req.socket.remoteAddress;
  console.log(`Nouvelle connexion WebSocket depuis ${clientIP}`);

  // Vérification IP autorisée
  if (clientIP !== ALLOWED_IP && !clientIP.endsWith(ALLOWED_IP)) {
    console.log(`IP non autorisée: ${clientIP}, fermeture de la connexion`);
    ws.close();
    return;
  }

  // Envoi initial
  fetchCDR().then(data => ws.send(JSON.stringify(mapCDR(data))));

  // Envoi régulier toutes les 5 secondes
  const interval = setInterval(broadcastCDR, REFRESH_INTERVAL);

  ws.on('close', () => {
    console.log(`Connexion fermée: ${clientIP}`);
    clearInterval(interval);
  });

  ws.on('error', (err) => {
    console.error(`Erreur WebSocket pour ${clientIP}:`, err);
    clearInterval(interval);
  });
});

server.listen(PORT, () => {
  console.log(`Serveur WebSocket Anaveo actif sur ws://localhost:${PORT}/cdr`);
});
