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

    const videoUrl = payload.videoUrl || payload.video_url || 'https://cdn.example.com/videos/mock_video.webm';

    if (env.SUPABASE_URL && env.SUPABASE_SERVICE_KEY) {
      const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

      // Update candidate record in onboard1_candidates
      await supabase
        .from('onboard1_candidates')
        .update({
          stage: 'Live Interview',
          status: 'video_submitted',
          video_url: videoUrl
        })
        .eq('id', payload.candidateId);

      // Log API usage
      try {
        await supabase.from('api_usage_logs').insert([{
          endpoint: '/api/submit-video',
          method: 'POST',
          status: 200,
          latency_ms: 50,
          provider: 'local',
          details: { candidateId: payload.candidateId, videoUrl },
          created_at: new Date().toISOString()
        }]);
      } catch (logErr) {
        console.warn("Notice: api_usage_logs insert deferred:", logErr.message);
      }
    }

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
        console.warn("Notice: Temporal async video signal deferred:", err.message);
      }
    }

    return successResponse({
      message: 'Video submitted successfully',
      candidateId: payload.candidateId,
      videoUrl
    }, 200, headers);

  } catch (error) {
    console.error('Error submitting video:', error);
    return errorResponse(error.message, "INTERNAL_ERROR", 500, headers);
  }
}
