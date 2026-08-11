import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const { candidateId, chunkIndex } = await request.json();

    if (!candidateId || chunkIndex === undefined) {
      return new Response(JSON.stringify({ error: 'Missing candidateId or chunkIndex' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const s3Client = new S3Client({
      region: env.AWS_REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    });

    const fileKey = `videos/${candidateId}/chunk_${chunkIndex}.webm`;

    const command = new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: fileKey,
      ContentType: 'video/webm',
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    return new Response(JSON.stringify({ uploadUrl: presignedUrl, key: fileKey }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
