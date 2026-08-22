import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
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

    const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET, AWS_REGION } = env;

    let s3Client;

    // We check if credentials exist, otherwise fallback to dummy credentials for testing/mocking
    if (AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY) {
      s3Client = new S3Client({
        region: AWS_REGION || 'auto',
        endpoint: env.S3_ENDPOINT_URL || `https://${env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: AWS_ACCESS_KEY_ID,
          secretAccessKey: AWS_SECRET_ACCESS_KEY,
        },
      });
    } else {
      // Fallback/Mock behavior if env vars are missing
      const mockR2BucketUrl = env.R2_PUBLIC_URL || 'https://mock-r2-bucket.cloudflarestorage.com';
      const fileKey = `videos/${payload.candidateId}/chunk_${payload.chunkIndex}.webm`;
      const presignedUrl = `${mockR2BucketUrl}/${fileKey}?signature=mock_signature&Expires=mock_expiry`;
      return successResponse({ uploadUrl: presignedUrl, key: fileKey }, 200, headers);
    }

    const bucketName = AWS_S3_BUCKET || 'onboard1-videos';
    const fileKey = `videos/${payload.candidateId}/chunk_${payload.chunkIndex}.webm`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      ContentType: 'video/webm',
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    return successResponse({ uploadUrl: presignedUrl, key: fileKey }, 200, headers);
  } catch (error) {
    console.error('Error generating upload URL:', error);
    return errorResponse(error.message, "INTERNAL_ERROR", 500, headers);
  }
}
