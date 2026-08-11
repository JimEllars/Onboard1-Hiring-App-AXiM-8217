import { verifyMagicLinkToken } from '../utils/auth.js';
import { createClient } from '@supabase/supabase-js';

export async function onRequestGet(context) {
  const request = context.request;
  const env = context.env;

  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  const origin = request.headers.get("Origin") || url.origin || 'http://localhost:5173';

  if (!token) {
    return new Response(JSON.stringify({ error: "Missing verification token" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const jwtSecret = env.JWT_SECRET || 'default-secret-key-for-development';
    const payload = await verifyMagicLinkToken(token, jwtSecret);

    // Log success for telemetry
    console.log(`Successfully verified candidate ${payload.candidateId}`);

    // Fetch candidate data from Supabase to send to Temporal
    if (env.SUPABASE_URL && env.SUPABASE_SERVICE_KEY) {
      const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
      const { data: candidate, error } = await supabase
        .from('onboard1_candidates')
        .select('*')
        .eq('id', payload.candidateId)
        .single();

      if (!error && candidate) {
        // Dispatch Temporal SignalWithStart
        const temporalEndpoint = env.TEMPORAL_REST_ENDPOINT || 'http://localhost:8080/api/v1/temporal/signal-with-start';
        const workflowId = `candidate-${candidate.email}-${candidate.job_id}`;

        const temporalPayload = {
          workflowId: workflowId,
          workflowType: 'CandidateOnboardingWorkflow',
          candidateData: candidate
        };

        // Fire and forget using context.waitUntil
        context.waitUntil(
          fetch(temporalEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(temporalPayload)
          }).catch(err => console.error("Temporal trigger failed:", err))
        );
      }
    }

    // Redirect to questionnaire route
    return Response.redirect(`${origin}/apply/questionnaire?verified=true&candidateId=${payload.candidateId}`, 302);
  } catch (error) {
    console.error("Token verification failed:", error.message);
    // Redirect to an error page or back to start
    return Response.redirect(`${origin}/apply?error=verification_failed`, 302);
  }
}
