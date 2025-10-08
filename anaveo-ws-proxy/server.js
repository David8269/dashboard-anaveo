// server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

// Autoriser les requêtes depuis votre frontend
const FRONTEND_ORIGIN = 'https://david8269.github.io';

// Servir un fichier statique (optionnel, pour tests)
app.get('/', (req, res) => {
  res.send('WebSocket proxy for ANAVEO dashboard is running.');
});

// WebSocket server pour les clients frontend
const wss = new WebSocket.Server({
  server,
  verifyClient: (info, done) => {
    const origin = info.origin;
    if (origin === FRONTEND_ORIGIN || origin === 'http://localhost:3000') {
      done(true);
    } else {
      console.warn('❌ Rejeté:', origin);
      done(false, 403, 'Forbidden origin');
    }
  }
});

wss.on('connection', (frontendWs, request) => {
  console.log('🌐 Nouveau client frontend connecté', request.headers.origin);

  // Se connecter au backend WebSocket (CDR)
  const backendWs = new WebSocket('wss://cds-on3cx.anaveo.com/cdr-ws/');

  backendWs.on('open', () => {
    console.log('✅ Connecté au backend CDR');
  });

  backendWs.on('message', (data) => {
    // Transmettre les données au frontend
    if (frontendWs.readyState === WebSocket.OPEN) {
      frontendWs.send(data);
    }
  });

  backendWs.on('error', (err) => {
    console.error('🔴 Erreur backend:', err.message);
    if (frontendWs.readyState === WebSocket.OPEN) {
      frontendWs.send(JSON.stringify({ error: 'Backend error' }));
    }
  });

  backendWs.on('close', (code, reason) => {
    console.log(`🔌 Backend fermé (${code}):`, reason?.toString());
    if (frontendWs.readyState === WebSocket.OPEN) {
      frontendWs.close(1011, 'Backend disconnected');
    }
  });

  frontendWs.on('close', () => {
    console.log('👋 Client frontend déconnecté');
    if (backendWs.readyState === WebSocket.OPEN) {
      backendWs.close();
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Proxy WebSocket en écoute sur le port ${PORT}`);
  console.log(`   Frontend attendu: ${FRONTEND_ORIGIN}`);
});