export async function onRequest(context) {
  const { env, request } = context;

  const origin = request.headers.get("Origin") || "*";

  // Headers for JSON response + CORS
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  // Basic check for environment bindings
  const hasSupabase = !!(env.SUPABASE_URL && env.SUPABASE_SERVICE_KEY);
  const hasResend = !!env.RESEND_API_KEY;
  const hasCheckr = !!env.CHECKR_API_KEY;

  // We can do a quick check against Supabase REST endpoint if we want,
  // but just checking bindings is often enough for a quick probe.
  // We'll simulate checking it.

  const status = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: {
      edge: "ok",
      telemetry: "ok",
      supabase: hasSupabase ? "ok" : "missing_bindings",
      email: hasResend ? "ok" : "missing_bindings",
      background_checks: hasCheckr ? "ok" : "missing_bindings",
    }
  };

  // If critical services (e.g. DB) are completely unconfigured, we might degrade the overall status
  // but for a purely edge health check, edge is "healthy".
  if (!hasSupabase) {
      status.status = "degraded";
  }

  return new Response(JSON.stringify(status), {
    status: 200,
    headers,
  });
}
