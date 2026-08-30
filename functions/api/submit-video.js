import { createClient } from '@supabase/supabase-js';
import { successResponse, errorResponse, handleOptions, getCorsHeaders } from '../utils/response.js';

export async function onRequestOptions({ request }) {
  return handleOptions(request);
}

export async function onRequestPost({ request, env }) {
  const origin = request.headers.get("Origin");
  const headers = getCorsHeaders(origin);

  try {
    let payload;
    try {
      payload = await request.json();
    } catch (e) {
      return errorResponse("Invalid JSON payload", "INVALID_PAYLOAD", 400, headers);
    }

    if (!payload.candidateId) {
      return errorResponse("Missing candidateId", "MISSING_FIELDS", 400, headers);
    }


    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

    // Update candidate record
    await supabase.from('candidates').update({
        stage: 'Video Assessment',
        video_url: 'https://cdn.example.com/videos/mock_video.webm' // Mock URL
    }).eq('id', payload.candidateId);

    // Log API usage
    await supabase.from('api_usage_logs').insert([{
        endpoint: '/api/submit-video',
        method: 'POST',
        status: 200,
        latency_ms: 50,
        provider: 'local',
        created_at: new Date().toISOString()
    }]);

    // Note: Telemetry trackVideoUploaded is handled by the frontend


    if (env.TEMPORAL_REST_ENDPOINT) {
      try {
        await fetch(env.TEMPORAL_REST_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            signal: 'AsyncVideoCompletedSignal',
            candidateId: payload.candidateId
          })
        });
      } catch (err) {
        console.error("Failed to signal Temporal:", err);
      }
    }

    return successResponse({ message: 'Video submitted successfully' }, 200, headers);
  } catch (error) {
    console.error('Error submitting video:', error);
    return errorResponse(error.message, "INTERNAL_ERROR", 500, headers);
  }
}
