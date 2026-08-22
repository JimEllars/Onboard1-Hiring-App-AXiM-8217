import { errorResponse, handleOptions, getCorsHeaders } from '../utils/response.js';

export async function onRequestOptions({ request }) {
  return handleOptions(request);
}

export async function onRequest(context) {
  const { request } = context;

  const origin = request.headers.get("Origin");
  const headers = getCorsHeaders(origin);

  const upgradeHeader = request.headers.get('Upgrade');
  if (!upgradeHeader || upgradeHeader !== 'websocket') {
    return errorResponse('Expected Upgrade: websocket', "UPGRADE_REQUIRED", 426, headers);
  }

  const url = new URL(request.url);
  const roomId = url.searchParams.get('roomId');

  if (!roomId) {
    return errorResponse("roomId query parameter is required", "MISSING_PARAMS", 400, headers);
  }

  const webSocketPair = new WebSocketPair();
  const [client, server] = Object.values(webSocketPair);

  server.accept();

  if (!globalThis.rooms) {
    globalThis.rooms = new Map();
  }

  if (!globalThis.rooms.has(roomId)) {
    globalThis.rooms.set(roomId, new Set());
  }

  const room = globalThis.rooms.get(roomId);
  room.add(server);

  server.addEventListener('message', event => {
    let data;
    try {
      // Just check if it's parseable to validate we're routing SDP/ICE properly
      data = JSON.parse(event.data);
    } catch (e) {
      // Do nothing, maybe it's not JSON
    }

    // Broadcast message to everyone else in the room
    for (const participant of room) {
      if (participant !== server) {
        try {
           participant.send(event.data);
        } catch (e) {
           room.delete(participant);
        }
      }
    }
  });

  server.addEventListener('close', () => {
    room.delete(server);
    if (room.size === 0) {
      globalThis.rooms.delete(roomId);
    }
  });

  server.addEventListener('error', () => {
    room.delete(server);
    if (room.size === 0) {
      globalThis.rooms.delete(roomId);
    }
  });

  return new Response(null, {
    status: 101,
    webSocket: client,
    headers: headers
  });
}
