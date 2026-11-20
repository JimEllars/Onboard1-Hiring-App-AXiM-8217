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
      const host = originUrl.hostname.toLowerCase();
      if (
        host === "localhost" ||
        host === "127.0.0.1" ||
        host.endsWith(".pages.dev") ||
        host === "axim.us.com" ||
        host.endsWith(".axim.us.com") ||
        host === "axim.com" ||
        host.endsWith(".axim.com")
      ) {
        allowedOrigin = origin;
      }
    } catch (e) {
      // Ignore URL parsing errors
    }
  }
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-AXiM-Service-Key",
    "Access-Control-Allow-Credentials": "true",
    "Content-Type": "application/json"
  };
}

export function handleOptions(request) {
  const origin = request.headers.get("Origin");
  return new Response(null, { headers: getCorsHeaders(origin) });
}
