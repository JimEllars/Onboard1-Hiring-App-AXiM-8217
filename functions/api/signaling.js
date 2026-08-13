// In-memory store for signaling rooms. Note: In production with multiple isolates,
// a Durable Object or Redis (KV/D1) is recommended.
const rooms = new Map();

export async function onRequest(context) {
  const { request } = context;
  const upgradeHeader = request.headers.get('Upgrade');

  if (!upgradeHeader || upgradeHeader !== 'websocket') {
    return new Response('Expected Upgrade: websocket', { status: 426 });
  }

  // Use URL to get the room/interview ID
  const url = new URL(request.url);
  const roomId = url.searchParams.get('roomId');

  if (!roomId) {
    return new Response('roomId query parameter is required', { status: 400 });
  }

  const [client, server] = Object.values(new WebSocketPair());

  server.accept();

  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set());
  }
  const room = rooms.get(roomId);
  room.add(server);

  server.addEventListener('message', (event) => {
    // Broadcast message to other peers in the room
    for (const peer of room) {
      if (peer !== server) {
        try {
          peer.send(event.data);
        } catch (e) {
          console.error('Error sending to peer:', e);
        }
      }
    }
  });

  server.addEventListener('close', () => {
    room.delete(server);
    if (room.size === 0) {
      rooms.delete(roomId);
    }
  });

  server.addEventListener('error', () => {
    room.delete(server);
    if (room.size === 0) {
      rooms.delete(roomId);
    }
  });

  return new Response(null, {
    status: 101,
    webSocket: client,
  });
}
