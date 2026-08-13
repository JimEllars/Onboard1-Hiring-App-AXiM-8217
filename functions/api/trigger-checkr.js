import { createClient } from '@supabase/supabase-js';

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

    let payload;
    try {
      payload = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
        status: 400,
        headers
      });
    }

    const { candidateId, email, package: checkrPackage } = payload;

    if (!candidateId || !email || !checkrPackage) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers
      });
    }

    if (!env.CHECKR_API_KEY) {
      return new Response(JSON.stringify({ error: "Internal Server Error", message: "Checkr credentials are not configured" }), {
        status: 500,
        headers
      });
    }

    // Call Checkr API
    const authHeader = 'Basic ' + btoa(env.CHECKR_API_KEY + ':');
    const checkrResponse = await fetch('https://api.checkr.com/v1/invitations', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        candidate_id: candidateId, // Note: Checkr may require its own candidate ID if you haven't created one, but usually it accepts basic params for invitation
        package: checkrPackage,
      }).toString()
    });

    if (!checkrResponse.ok) {
      const errorData = await checkrResponse.text();
      console.error("Checkr API error:", errorData);
      return new Response(JSON.stringify({ error: "Failed to trigger Checkr background check" }), {
        status: 500,
        headers
      });
    }

    const checkrData = await checkrResponse.json();
    const invitationId = checkrData.id;

    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
      return new Response(JSON.stringify({ error: "Internal Server Error", message: "Supabase credentials are not configured" }), {
        status: 500,
        headers
      });
    }

    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

    // Update candidate record
    const { error: updateError } = await supabase
      .from('onboard1_candidates')
      .update({
        checkr_invitation_id: invitationId,
        stage: 'Background Check Pending'
      })
      .eq('id', candidateId);

    if (updateError) {
      console.error("Supabase update error:", updateError);
      return new Response(JSON.stringify({ error: "Failed to update candidate status" }), {
        status: 500,
        headers
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: "Background check triggered successfully",
      invitationId
    }), {
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
