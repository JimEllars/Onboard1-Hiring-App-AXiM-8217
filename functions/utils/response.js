export function successResponse(data, status = 200, headers = {}) {
  return new Response(JSON.stringify({ success: true, data }), {
    status,
    headers: { "Content-Type": "application/json", ...headers }
  });
}

export function errorResponse(message, code, status = 500, headers = {}) {
  return new Response(JSON.stringify({ success: false, error: { message, code } }), {
    status,
    headers: { "Content-Type": "application/json", ...headers }
  });
}

export function getCorsHeaders(origin) {
  let allowedOrigin = "*";
  if (origin) {
    try {
      const originUrl = new URL(origin);
      if (
        originUrl.hostname === "localhost" ||
        originUrl.hostname === "127.0.0.1" ||
        originUrl.hostname.endsWith(".pages.dev")
      ) {
        allowedOrigin = origin;
      }
    } catch (e) {
      // Ignore
    }
  }
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };
}

export function handleOptions(request) {
  const origin = request.headers.get("Origin");
  return new Response(null, { headers: getCorsHeaders(origin) });
}
