// relay-server.js
const WebSocket = require('ws');
const net = require('net');

// Configuration - À ADAPTER
const WEBSOCKET_PORT = 3001; // Port local d'écoute du relais WS
const TCP_HOST = '4.211.183.208'; // IP du serveur 3CX
const TCP_PORT = 3000; // Port du socket passif 3CX

// Créer le serveur WebSocket
const wss = new WebSocket.Server({ port: WEBSOCKET_PORT });

console.log(`[Relay] Serveur WebSocket démarré sur le port ${WEBSOCKET_PORT}`);
console.log(`[Relay] Relai vers TCP ${TCP_HOST}:${TCP_PORT}`);

wss.on('connection', (ws, req) => {
    const clientIP = req.socket.remoteAddress;
    console.log(`[Relay] Nouvelle connexion WebSocket depuis ${clientIP}`);

    // Créer la connexion TCP vers 3CX
    const tcpClient = new net.Socket();

    tcpClient.connect(TCP_PORT, TCP_HOST, () => {
        console.log('[Relay] Connecté au serveur 3CX via TCP');
    });

    // Relay TCP → WebSocket
    tcpClient.on('data', (data) => {
        try {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(data.toString());
            }
        } catch (error) {
            console.error('[Relay] Erreur envoi WebSocket:', error);
        }
    });

    tcpClient.on('close', () => {
        console.log('[Relay] Connexion TCP fermée');
        if (ws.readyState === WebSocket.OPEN) {
            ws.close();
        }
    });

    tcpClient.on('error', (err) => {
        console.error('[Relay] Erreur TCP:', err);
        if (ws.readyState === WebSocket.OPEN) {
            ws.close();
        }
    });

    // Relay WebSocket → TCP (si nécessaire, bien que CDR soit passif)
    ws.on('message', (message) => {
        try {
            tcpClient.write(message);
        } catch (error) {
            console.error('[Relay] Erreur envoi TCP:', error);
        }
    });

    ws.on('close', () => {
        console.log('[Relay] Connexion WebSocket fermée');
        tcpClient.destroy();
    });

    ws.on('error', (err) => {
        console.error('[Relay] Erreur WebSocket:', err);
        tcpClient.destroy();
    });
});

console.log(`[Relay] Serveur relay démarré. Connectez-vous à ws://localhost:${WEBSOCKET_PORT}`);