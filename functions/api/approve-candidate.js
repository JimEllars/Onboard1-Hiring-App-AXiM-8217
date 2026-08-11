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
    if (!payload.candidateId || !payload.decision) {
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

    // Get the candidate first to construct Temporal workflowId
    const { data: candidate, error: fetchError } = await supabase
      .from('onboard1_candidates')
      .select('*')
      .eq('id', payload.candidateId)
      .single();

    if (fetchError || !candidate) {
      return new Response(JSON.stringify({ error: "Candidate not found" }), {
        status: 404,
        headers
      });
    }

    const newStage = payload.decision === 'approved' ? 'Video Assessment' : 'Rejected';

    // Update candidate record
    const { error: dbError } = await supabase
      .from('onboard1_candidates')
      .update({
        stage: newStage
      })
      .eq('id', payload.candidateId);

    if (dbError) {
      console.error("Supabase update error:", dbError);
      return new Response(JSON.stringify({ error: "Failed to update candidate status" }), {
        status: 500,
        headers
      });
    }

    // Dispatch Temporal Signal
    const temporalEndpoint = env.TEMPORAL_REST_ENDPOINT || 'http://localhost:8080/api/v1/temporal/signal';
    const workflowId = `candidate-${candidate.email}-${candidate.job_id}`;

    const temporalPayload = {
      workflowId: workflowId,
      signalName: 'ManagerApprovalSignal',
      signalData: { decision: payload.decision }
    };

    context.waitUntil(
      fetch(temporalEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(temporalPayload)
      }).catch(err => console.error("Temporal signal failed:", err))
    );

    return new Response(JSON.stringify({ success: true, message: `Candidate ${payload.decision} successfully`, stage: newStage }), {
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
