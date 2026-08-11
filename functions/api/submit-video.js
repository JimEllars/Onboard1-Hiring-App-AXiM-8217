export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { candidateId } = await request.json();

    if (!candidateId) {
      return new Response(JSON.stringify({ error: 'Missing candidateId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Update Supabase candidate status
    const supabaseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
    const supabaseKey = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const updateResponse = await fetch(`${supabaseUrl}/rest/v1/onboard1_candidates?id=eq.${candidateId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          status: 'Video Submitted'
        })
      });

      if (!updateResponse.ok) {
        console.error('Failed to update candidate status in Supabase:', await updateResponse.text());
        // We'll proceed anyway to try signaling Temporal, but in a real app might fail here
      }
    } else {
      console.warn('Supabase credentials not found in environment, skipping status update.');
    }

    // Dispatch VideoSubmittedSignal to Temporal
    if (env.TEMPORAL_REST_ENDPOINT) {
      const temporalResponse = await fetch(`${env.TEMPORAL_REST_ENDPOINT}/api/v1/namespaces/default/workflows/${candidateId}/signal/VideoSubmittedSignal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          // Empty payload or any required Temporal payload
        })
      });

      if (!temporalResponse.ok) {
        console.error('Failed to signal Temporal:', await temporalResponse.text());
      }
    } else {
      console.warn('TEMPORAL_REST_ENDPOINT not found in environment, skipping Temporal signal.');
    }

    return new Response(JSON.stringify({ success: true, message: 'Video submitted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error submitting video:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
