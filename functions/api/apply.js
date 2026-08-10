export async function onRequestOptions(context) {
  const request = context.request;
  const origin = request.headers.get("Origin");

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

  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function onRequestPost(context) {
  try {
    const request = context.request;
    const origin = request.headers.get("Origin");

    let allowedOrigin = "*";

    // Secure CORS validation
    if (origin) {
      try {
        const originUrl = new URL(origin);
        if (
          originUrl.hostname === "localhost" ||
          originUrl.hostname === "127.0.0.1" ||
          originUrl.hostname.endsWith(".pages.dev")
        ) {
          allowedOrigin = origin;
        } else {
          return new Response(JSON.stringify({ error: "Forbidden: Invalid Origin" }), {
            status: 403,
            headers: { "Content-Type": "application/json" }
          });
        }
      } catch (e) {
        return new Response(JSON.stringify({ error: "Forbidden: Invalid Origin URL" }), {
          status: 403,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    const headers = {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Content-Type": "application/json"
    };

    // Parse payload
    let payload;
    try {
      payload = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
        status: 400,
        headers
      });
    }

    // Validate required fields
    if (!payload.jobId || !payload.candidateEmail || !payload.candidateData || !payload.candidateData.name) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers
      });
    }

    // Here we would normally signal Temporal or insert into Supabase
    // Returning success
    return new Response(JSON.stringify({ success: true, message: "Application received successfully" }), {
      status: 200,
      headers
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal Server Error", message: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
}
