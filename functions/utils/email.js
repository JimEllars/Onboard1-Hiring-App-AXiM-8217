export async function sendMagicLinkEmail(email, token, env, origin) {
  const resendApiKey = env.RESEND_API_KEY;
  if (!resendApiKey) {
    throw new Error("RESEND_API_KEY is not set.");
  }

  // Ensure origin is set for the verification URL, fallback to local dev
  const baseUrl = origin || 'http://localhost:5173';
  const verificationUrl = `${baseUrl}/api/verify?token=${token}`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
      <h2 style="color: #333; margin-top: 0;">Verify Your Application</h2>
      <p style="color: #555; line-height: 1.6;">Thank you for applying! We're excited to learn more about you.</p>
      <p style="color: #555; line-height: 1.6;">To complete your application and proceed to the questionnaire, please click the secure link below to verify your email address.</p>

      <div style="margin: 30px 0; text-align: center;">
        <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Verify Application</a>
      </div>

      <p style="color: #555; line-height: 1.6;">If the button doesn't work, you can copy and paste this link securely into your browser:</p>
      <p style="word-break: break-all; color: #777; background: #f9f9f9; padding: 12px; border-radius: 4px; font-size: 14px;">${verificationUrl}</p>

      <p style="color: #888; font-size: 13px; margin-top: 30px;">This verification link is valid for 30 minutes.</p>
      <p style="color: #888; font-size: 13px;">Best regards,<br>The Hiring Team</p>
    </div>
  `;

  const payload = {
    from: 'Acme Hiring <onboarding@resend.dev>',
    to: [email],
    subject: 'Action Required: Verify your application',
    html: htmlContent
  };

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Failed to send email via Resend API: ${response.status} ${errorData}`);
  }

  const responseData = await response.json();
  return responseData;
}
