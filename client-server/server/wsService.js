const WSS_URL = 'ws://127.0.0.1:3000/';
export const wsConnection = new WebSocket(WSS_URL);

wsConnection.onopen = function () {
    console.log('WS: connection established');
};

wsConnection.onclose = function () {
    console.log('WS: connection closed');
};

wsConnection.onerror = function (error) {
    console.log(`WS error: ${error.message}`);
};
