const ws = require('ws');

class WSS {
    constructor() {
        this.webSocketServer = null;
    }

    init(server) {
        this.webSocketServer = new ws.Server({server});
    }

    send(message) {
        if (!this.webSocketServer) {
            console.error('Message cannot be sent until webSocketServer is initialized');
            return;
        }
        this.webSocketServer.clients.forEach(client => {
            client.send(typeof (message) !== 'string' ? JSON.stringify(message) : message)
        });
    }
}

module.exports = new WSS;