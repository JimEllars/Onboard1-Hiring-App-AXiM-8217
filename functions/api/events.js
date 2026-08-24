export async function onRequest(context) {
  const { request } = context;

  const origin = request.headers.get("Origin") || "*";

  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
      }
    });
  }

  // Create an SSE stream
  let controller;
  const stream = new ReadableStream({
    start(c) {
      controller = c;

      // Send an initial connected event
      const initialEvent = { type: 'connected', timestamp: Date.now() };
      controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(initialEvent)}\n\n`));

      // Mock emitting occasional events for demonstration, normally this would connect to a DB or Pub/Sub
      const interval = setInterval(() => {
        try {
          // Send a heartbeat ping to keep connection alive
          const ping = { type: 'ping', timestamp: Date.now() };
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(ping)}\n\n`));
        } catch (err) {
          clearInterval(interval);
        }
      }, 15000); // 15s keepalive

      // Clean up when the client disconnects
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        try {
            controller.close();
        } catch (e) { /* ignore */ }
      });
    },
    cancel() {
       // Cleanup if cancelled by reader
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": origin,
    },
  });
}
