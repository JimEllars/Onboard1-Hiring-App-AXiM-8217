export async function onRequestPost({ request, env }) {
  try {
    const signature = request.headers.get('x-cal-signature-256');
    if (!signature) {
      return new Response(null, { status: 401 });
    }

    const rawBody = await request.text();
    const secret = env.CALCOM_WEBHOOK_SECRET;

    if (!secret) {
      return new Response(null, { status: 401 });
    }

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(rawBody)
    );

    const hashArray = Array.from(new Uint8Array(signatureBuffer));
    const expectedSignature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    if (signature !== expectedSignature) {
      return new Response(null, { status: 401 });
    }

    const data = JSON.parse(rawBody);

    if (data.triggerEvent === 'BOOKING_CREATED') {
      const payload = data.payload || {};
      const candidateId = payload.metadata?.candidateId || data.metadata?.candidateId;
      const startTime = payload.startTime || data.startTime;

      if (candidateId && env.TEMPORAL_REST_ENDPOINT) {
        // Dispatch signal to Temporal
        await fetch(env.TEMPORAL_REST_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            signal: 'LiveInterviewScheduledSignal',
            candidateId,
            scheduledTime: startTime
          })
        }).catch(() => {
           // fail silently as per requirements
        });
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(null, { status: 401 });
  }
}
