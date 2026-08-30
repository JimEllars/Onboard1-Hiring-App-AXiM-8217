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
          const events = [
            { type: 'toast', title: 'New Application Received', desc: 'Sarah Miller applied for Senior Designer', link: '/portal/candidates' },
            { type: 'toast', title: 'Video Assessment Submitted', desc: 'James Wilson completed their video task', link: '/portal/candidates' },
            { type: 'toast', title: 'Agreement Signed', desc: 'Eleanor Pena signed the offer letter', link: '/portal/onboarding' },
            { type: 'ping', timestamp: Date.now() }
          ];
          const randomEvent = events[Math.floor(Math.random() * events.length)];
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(randomEvent)}\n\n`));
        } catch (err) {
          clearInterval(interval);
        }
      }, 5000); // Send event every 5 seconds for demonstration

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


export async function onRequestPost(context) {
  const { request, env } = context;
  const origin = request.headers.get("Origin") || "*";

  const corsHeaders = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  try {
    const rawBody = await request.text();
    const payload = JSON.parse(rawBody);

    // Create the forwarded payload
    const forwardedPayload = {
      app_id: "axim-onboard1",
      event_type: payload.event_type || 'unknown',
      data: payload,
      timestamp: new Date().toISOString()
    };

    // Strip out PII if any exists dynamically
    if (forwardedPayload.data.ip) delete forwardedPayload.data.ip;
    if (forwardedPayload.data.userAgent) delete forwardedPayload.data.userAgent;

    const coreTelemetryUrl = `${env.AXIM_CORE_API_URL || 'https://mock.axim.us.com'}/api/v1/telemetry/micro-app`;

    // Attempt to sync to AXiM Core asynchronously
    context.waitUntil(
       fetch(coreTelemetryUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Axim-Signature': env.AXIM_INTERNAL_KEY || 'default-mock-key'
          },
          body: JSON.stringify(forwardedPayload)
       }).catch(err => {
          console.error("Failed to sync telemetry to AXiM Core", err);
       })
    );

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: "Invalid payload" }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  }
}
