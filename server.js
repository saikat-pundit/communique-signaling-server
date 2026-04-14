const WebSocket = require('ws');
const port = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: port });

const clients = new Map();

wss.on('connection', (ws) => {
    ws.on('message', (messageAsString) => {
        try {
            const data = JSON.parse(messageAsString);

            if (data.type === 'register') {
                clients.set(data.device, ws);
                ws.deviceName = data.device;
                console.log(`Device registered: ${data.device}`);
            } 
            else if (data.type === 'call_request' || data.type === 'call_response') {
                const targetWs = clients.get(data.target);
                if (targetWs && targetWs.readyState === WebSocket.OPEN) {
                    targetWs.send(JSON.stringify(data));
                    console.log(`Routed ${data.type} from ${data.caller || ws.deviceName} to ${data.target}`);
                }
            }
        } catch (e) {
            console.error(e);
        }
    });

    ws.on('close', () => {
        if (ws.deviceName) {
            clients.delete(ws.deviceName);
            console.log(`Device disconnected: ${ws.deviceName}`);
        }
    });
});

console.log("Signaling server running on port " + port);
