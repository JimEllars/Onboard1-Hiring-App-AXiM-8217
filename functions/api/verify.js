import { verifyMagicLinkToken } from '../utils/auth.js';

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

    // Redirect to questionnaire route
    return Response.redirect(`${origin}/apply/questionnaire?verified=true`, 302);
  } catch (error) {
    console.error("Token verification failed:", error.message);
    // Redirect to an error page or back to start
    return Response.redirect(`${origin}/apply?error=verification_failed`, 302);
  }
}
