const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Start the server
const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

// Set up WebSocket server
const wss = new WebSocket.Server({ server });

let clients = {};

wss.on('connection', (ws) => {
    const playerId = uuidv4();
    clients[playerId] = ws;
    console.log(`New client connected: ${playerId}`);

    // Send the player's ID to the client
    ws.send(JSON.stringify({ type: 'init', playerId }));

    ws.on('message', (data) => {
        const message = JSON.parse(data);

        // Broadcast the state update to all other clients
        if (message.type === 'stateUpdate') {
            for (let id in clients) {
                if (id !== message.playerId && clients[id].readyState === WebSocket.OPEN) {
                    clients[id].send(JSON.stringify({
                        type: 'stateUpdate',
                        playerId: message.playerId,
                        state: message.state,
                    }));
                }
            }
        }
    });

    ws.on('close', () => {
        delete clients[playerId];
        console.log(`Client disconnected: ${playerId}`);

        // Notify other clients that this player has disconnected
        for (let id in clients) {
            if (clients[id].readyState === WebSocket.OPEN) {
                clients[id].send(JSON.stringify({
                    type: 'playerDisconnected',
                    playerId,
                }));
            }
        }
    });
});
