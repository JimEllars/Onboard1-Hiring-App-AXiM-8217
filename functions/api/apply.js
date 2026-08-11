import { createClient } from '@supabase/supabase-js';
import { issueMagicLinkToken } from '../utils/auth.js';
import { sendMagicLinkEmail } from '../utils/email.js';


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
    const env = context.env;

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

    // Initialize Supabase Client
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
      return new Response(JSON.stringify({ error: "Internal Server Error", message: "Supabase credentials are not configured" }), {
        status: 500,
        headers
      });
    }
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

    // Insert candidate into onboard1_candidates table
    const { data: candidate, error: dbError } = await supabase
      .from('onboard1_candidates')
      .insert({
        job_id: payload.jobId,
        email: payload.candidateEmail,
        name: payload.candidateData.name,
        phone: payload.candidateData.phone || null,
        linkedin: payload.candidateData.linkedin || null,
        portfolio: payload.candidateData.portfolio || null,
        status: 'applied'
      })
      .select('id')
      .single();

    if (dbError) {
      console.error("Supabase insert error:", dbError);
      return new Response(JSON.stringify({ error: "Failed to save application data" }), {
        status: 500,
        headers
      });
    }

    // Issue JWT magic link token
    const jwtSecret = env.JWT_SECRET || 'default-secret-key-for-development';
    const magicLinkToken = await issueMagicLinkToken(candidate.id, jwtSecret);
    console.log("Magic link token generated successfully");

    // Dispatch email
    try {
      await sendMagicLinkEmail(payload.candidateEmail, magicLinkToken, env, origin);
      console.log("Magic link email dispatched successfully");
    } catch (emailError) {
      // Log error for telemetry but don't fail the request
      console.error("Failed to send magic link email:", emailError);
    }

    // Returning success
    return new Response(JSON.stringify({ success: true, message: "Application received successfully", token: magicLinkToken }), {
      status: 200,
      headers
    });
  } catch (error) {
    console.error("Internal server error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error", message: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
}
