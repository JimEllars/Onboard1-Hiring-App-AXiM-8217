import re

with open('functions/utils/email.js', 'r') as f:
    content = f.read()

# Add supabase client import if not exists
if "import { createClient } from '@supabase/supabase-js';" not in content:
    content = "import { createClient } from '@supabase/supabase-js';\n" + content


# Helper to log to API usage logs
log_helper = """
async function logApiUsage(env, endpoint, provider, status) {
  if (env.SUPABASE_URL && env.SUPABASE_SERVICE_KEY) {
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
    await supabase.from('api_usage_logs').insert([{
      endpoint,
      method: 'POST',
      status,
      latency_ms: 100, // mock
      provider,
      created_at: new Date().toISOString()
    }]);
  }
}
"""

if "async function logApiUsage" not in content:
    content += log_helper


# Now replace sendMagicLinkEmail
magic_link_pattern = r"export async function sendMagicLinkEmail\(email, token, env, origin\) \{.*?return responseData;\n\}"
new_magic_link = """export async function sendMagicLinkEmail(email, token, env, origin) {
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

  const result = await sendHiringEmail({
    to: email,
    subject: 'Action Required: Verify your application',
    html: htmlContent,
    env
  });

  await logApiUsage(env, '/api/emails/magic-link', result.provider, 200);
  return result.data;
}"""
content = re.sub(magic_link_pattern, new_magic_link, content, flags=re.DOTALL)


# Replace sendStageAdvancementEmail
stage_adv_pattern = r"export async function sendStageAdvancementEmail\(email, stage, token, env, origin\) \{.*?return responseData;\n\}"
new_stage_adv = """export async function sendStageAdvancementEmail(email, stage, token, env, origin) {
  const baseUrl = origin || 'http://localhost:5173';
  let subject = '';
  let headline = '';
  let bodyText = '';
  let buttonText = '';
  let actionUrl = '';

  if (stage === 'video-assessment') {
    subject = 'Next Step: Complete Your Video Assessment';
    headline = 'Next Step: Video Assessment';
    bodyText = 'Congratulations on advancing! The next step in our process is a brief video assessment.';
    buttonText = 'Start Assessment';
    actionUrl = `${baseUrl}/portal/video-assessment?token=${token}`;
  } else if (stage === 'live-interview') {
    subject = 'Interview Confirmed: Join Your Live Meeting';
    headline = 'Interview Confirmed';
    bodyText = 'Your live interview has been confirmed. Please use the link below to join the room at the scheduled time.';
    buttonText = 'Join Interview Room';
    actionUrl = `${baseUrl}/interview/room-1?token=${token}`;
  } else if (stage === 'offer') {
    subject = 'Offer Letter Ready for Signature';
    headline = 'Congratulations! Offer Enclosed';
    bodyText = 'We are thrilled to extend an offer for you to join our team! Please review and sign your offer letter.';
    buttonText = 'Review & Sign Offer';
    actionUrl = `${baseUrl}/portal/offer?token=${token}`;
  } else {
    throw new Error("Invalid stage provided for advancement email");
  }

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
      <h2 style="color: #333; margin-top: 0;">${headline}</h2>
      <p style="color: #555; line-height: 1.6;">${bodyText}</p>

      <div style="margin: 30px 0; text-align: center;">
        <a href="${actionUrl}" style="background-color: #007bff; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">${buttonText}</a>
      </div>

      <p style="color: #555; line-height: 1.6;">If the button doesn't work, copy and paste this link:</p>
      <p style="word-break: break-all; color: #777; background: #f9f9f9; padding: 12px; border-radius: 4px; font-size: 14px;">${actionUrl}</p>

      <p style="color: #888; font-size: 13px; margin-top: 30px;">Best regards,<br>The Hiring Team</p>
    </div>
  `;

  const result = await sendHiringEmail({
    to: email,
    subject: subject,
    html: htmlContent,
    env
  });

  await logApiUsage(env, `/api/emails/stage-advancement/${stage}`, result.provider, 200);
  return result.data;
}"""
content = re.sub(stage_adv_pattern, new_stage_adv, content, flags=re.DOTALL)


# Replace sendRejectionEmail
rejection_pattern = r"export async function sendRejectionEmail\(email, env\) \{.*?return await response\.json\(\);\n\}"
new_rejection = """export async function sendRejectionEmail(email, env) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
      <h2 style="color: #333; margin-top: 0;">Application Status Update</h2>
      <p style="color: #555; line-height: 1.6;">Thank you for taking the time to interview with us.</p>
      <p style="color: #555; line-height: 1.6;">While we were impressed with your background, we have decided to move forward with other candidates who more closely align with our current needs for this position.</p>
      <p style="color: #555; line-height: 1.6;">We appreciate your interest in our company and wish you the best of luck in your future endeavors.</p>
      <p style="color: #888; font-size: 13px; margin-top: 30px;">Best regards,<br>The Hiring Team</p>
    </div>
  `;

  const result = await sendHiringEmail({
    to: email,
    subject: 'Application Status Update',
    html: htmlContent,
    env
  });

  await logApiUsage(env, '/api/emails/rejection', result.provider, 200);
  return result.data;
}"""
content = re.sub(rejection_pattern, new_rejection, content, flags=re.DOTALL)

with open('functions/utils/email.js', 'w') as f:
    f.write(content)
