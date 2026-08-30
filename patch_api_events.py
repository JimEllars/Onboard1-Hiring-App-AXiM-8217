import os

filepath = 'functions/api/events.js'
with open(filepath, 'r') as f:
    content = f.read()

new_content = content + """

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
"""

with open(filepath, 'w') as f:
    f.write(new_content)
