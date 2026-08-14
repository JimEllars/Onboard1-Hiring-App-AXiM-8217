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

    if (!payload.candidateId || payload.chunkIndex === undefined) {
      return errorResponse("Missing candidateId or chunkIndex", "MISSING_FIELDS", 400, headers);
    }

    // Since we are using R2 in Cloudflare Pages, we might be interacting with R2 directly or via an S3 compatible API.
    // Assuming S3 presigned URL generation logic or direct R2 token generation.
    // We will keep the original mock logic for now, adjusting response format.

    // MOCK R2 Presigned URL Generation
    const mockR2BucketUrl = env.R2_PUBLIC_URL || 'https://mock-r2-bucket.cloudflarestorage.com';
    const fileKey = `videos/${payload.candidateId}/chunk_${payload.chunkIndex}.webm`;

    // In a real implementation, you'd use aws4fetch or similar to sign a URL
    const presignedUrl = `${mockR2BucketUrl}/${fileKey}?signature=mock_signature&Expires=mock_expiry`;

    return successResponse({ uploadUrl: presignedUrl, key: fileKey }, 200, headers);
  } catch (error) {
    console.error('Error generating upload URL:', error);
    return errorResponse(error.message, "INTERNAL_ERROR", 500, headers);
  }
}
