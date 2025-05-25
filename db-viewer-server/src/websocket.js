const WebSocket = require('ws');

function setupWebSocket(server) {
  const wss = new WebSocket.Server({ server });
  
  // Keep track of all connected clients
  const clients = new Set();

  wss.on('connection', (ws) => {
    // Add new client
    clients.add(ws);
    console.log('New client connected. Total clients:', clients.size);

    // Send initial connection success message
    ws.send(JSON.stringify({
      type: 'connection',
      status: 'connected',
      message: 'Connected to WebSocket server'
    }));

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    ws.on('close', () => {
      // Remove disconnected client
      clients.delete(ws);
      console.log('Client disconnected. Remaining clients:', clients.size);
    });

    // Handle incoming messages
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        console.log('Received message:', data);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });
  });

  // Function to broadcast updates to all connected clients
  function broadcastUpdate(tableName, action, data) {
    const message = JSON.stringify({
      type: 'update',
      table: tableName,
      action: action, // 'insert', 'update', or 'delete'
      data: data,
      timestamp: new Date().toISOString()
    });

    console.log('Broadcasting update:', {
      table: tableName,
      action: action,
      clients: clients.size
    });

    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message, (error) => {
          if (error) {
            console.error('Error sending message to client:', error);
          }
        });
      }
    });
  }

  return { broadcastUpdate };
}

module.exports = setupWebSocket; 