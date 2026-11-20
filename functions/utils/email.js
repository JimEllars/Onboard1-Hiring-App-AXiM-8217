import { createClient } from '@supabase/supabase-js';

export async function sendMagicLinkEmail(email, token, env, origin) {
  const baseUrl = origin || 'http://localhost:5173';
  const verificationUrl = `${baseUrl}/api/verify?token=${token}`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <div style="margin-bottom: 20px;">
        <h2 style="color: #0f172a; margin: 0 0 8px 0; font-size: 24px; font-weight: 800;">Verify Your Application</h2>
        <span style="display: inline-block; background: #eff6ff; color: #2563eb; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 999px; text-transform: uppercase;">AXiM Talent Intake</span>
      </div>
      <p style="color: #475569; line-height: 1.6; font-size: 15px;">Thank you for applying to join the AXiM ecosystem. We are excited to review your background.</p>
      <p style="color: #475569; line-height: 1.6; font-size: 15px;">To verify your email address and continue to the screening questionnaire, please click the secure link below:</p>

      <div style="margin: 32px 0; text-align: center;">
        <a href="${verificationUrl}" style="background-color: #0f172a; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 15px; display: inline-block;">Verify & Continue</a>
      </div>

      <p style="color: #64748b; line-height: 1.6; font-size: 13px;">If the button does not work, copy and paste this secure link into your browser:</p>
      <p style="word-break: break-all; color: #334155; background: #f8fafc; padding: 12px; border-radius: 8px; font-size: 12px; font-family: monospace;">${verificationUrl}</p>

      <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">This verification link is valid for 30 minutes.<br>AXiM Global Human Capital Team</p>
    </div>
  `;

  const result = await sendHiringEmail({
    to: email,
    subject: 'Action Required: Verify your application — AXiM',
    html: htmlContent,
    env
  });

  await logApiUsage(env, '/api/emails/magic-link', result.provider, 200);
  return result.data;
}

export async function sendStageAdvancementEmail(email, stage, token, env, origin, candidateId = '') {
  const baseUrl = origin || 'http://localhost:5173';
  let subject = '';
  let headline = '';
  let bodyText = '';
  let buttonText = '';
  let actionUrl = '';

  if (stage === 'video-assessment') {
    subject = 'Next Step: Complete Your AXiM Video Assessment';
    headline = 'Next Step: Video Assessment';
    bodyText = 'Congratulations on advancing! The next step in our process is a brief asynchronous video assessment.';
    buttonText = 'Start Assessment';
    actionUrl = `${baseUrl}/apply/video-assessment?candidateId=${candidateId}&token=${token}`;
  } else if (stage === 'live-interview') {
    subject = 'Interview Confirmed: Join Your Live Meeting';
    headline = 'Interview Confirmed';
    bodyText = 'Your interview has been scheduled. Please use the link below to select your preferred time slot or join the room.';
    buttonText = 'Schedule or Join Interview';
    actionUrl = `${baseUrl}/apply/schedule?candidateId=${candidateId}&token=${token}`;
  } else if (stage === 'offer') {
    subject = 'Offer Letter Ready for Signature — AXiM';
    headline = 'Congratulations! Offer Enclosed';
    bodyText = 'We are thrilled to extend an offer for you to join our team! Please review and electronically execute your agreement.';
    buttonText = 'Review & Sign Offer';
    actionUrl = `${baseUrl}/offer/${candidateId}?token=${token}`;
  } else {
    throw new Error("Invalid stage provided for advancement email");
  }

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <h2 style="color: #0f172a; margin-top: 0; font-size: 24px; font-weight: 800;">${headline}</h2>
      <p style="color: #475569; line-height: 1.6; font-size: 15px;">${bodyText}</p>

      <div style="margin: 32px 0; text-align: center;">
        <a href="${actionUrl}" style="background-color: #2563eb; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 15px; display: inline-block;">${buttonText}</a>
      </div>

      <p style="color: #64748b; line-height: 1.6; font-size: 13px;">If the button does not work, copy and paste this link:</p>
      <p style="word-break: break-all; color: #334155; background: #f8fafc; padding: 12px; border-radius: 8px; font-size: 12px; font-family: monospace;">${actionUrl}</p>

      <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">Best regards,<br>AXiM Recruitment Team</p>
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
}

export async function sendRejectionEmail(email, env) {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <h2 style="color: #0f172a; margin-top: 0; font-size: 24px; font-weight: 800;">Application Status Update</h2>
      <p style="color: #475569; line-height: 1.6; font-size: 15px;">Thank you for your interest in joining the AXiM ecosystem and for taking the time to share your background with us.</p>
      <p style="color: #475569; line-height: 1.6; font-size: 15px;">While our team was impressed with your qualifications, we have decided to move forward with other candidates who more specifically align with our immediate hiring priorities for this role.</p>
      <p style="color: #475569; line-height: 1.6; font-size: 15px;">We will keep your profile in our candidate network for upcoming opportunities that fit your skillset.</p>
      <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">Sincerely,<br>AXiM Talent Operations</p>
    </div>
  `;

  const result = await sendHiringEmail({
    to: email,
    subject: 'Application Status Update — AXiM',
    html: htmlContent,
    env
  });

  await logApiUsage(env, '/api/emails/rejection', result.provider, 200);
  return result.data;
}

export async function sendHiringEmail({ to, subject, html, attachments, env }) {
  const emailitApiKey = env.EMAILIT_API_KEY;
  const resendApiKey = env.RESEND_API_KEY;

  const from = env.EMAIL_FROM || (resendApiKey ? 'AXiM Hiring <onboarding@resend.dev>' : 'AXiM Hiring <hiring@axim.us.com>');

  // Fallback to simulated delivery if neither key is configured in dev
  if (!emailitApiKey && !resendApiKey) {
    console.info(`[Email Service] Simulated dispatch to ${to}: "${subject}"`);
    return { provider: 'simulated', data: { id: `sim-${Date.now()}` } };
  }

  // Primary: EmailIt
  if (emailitApiKey) {
    try {
      const payload = {
        from,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        attachments
      };

      const response = await fetch('https://api.emailit.com/v2/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${emailitApiKey}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        return { provider: 'emailit', data };
      } else {
        const errorData = await response.text();
        console.warn(`EmailIt API failed (${response.status}): ${errorData}. Attempting fallback to Resend.`);
      }
    } catch (emailitError) {
      console.warn(`EmailIt provider error:`, emailitError);
    }
  }

  // Fallback: Resend
  if (resendApiKey) {
    try {
      const payload = {
        from: env.EMAIL_FROM || 'AXiM Hiring <onboarding@resend.dev>',
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        attachments
      };

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        return { provider: 'resend', data };
      } else {
        const errorData = await response.text();
        throw new Error(`Resend API failed: ${response.status} ${errorData}`);
      }
    } catch (resendError) {
      console.error(`Resend fallback failed:`, resendError);
      throw resendError;
    }
  }

  return { provider: 'simulated', data: { id: `sim-${Date.now()}` } };
}

async function logApiUsage(env, endpoint, provider, status) {
  if (env.SUPABASE_URL && env.SUPABASE_SERVICE_KEY) {
    try {
      const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
      await supabase.from('api_usage_logs').insert([{
        endpoint,
        method: 'POST',
        status,
        latency_ms: 80,
        provider,
        created_at: new Date().toISOString()
      }]);
    } catch (e) {
      console.warn("Notice: email api_usage_logs insert deferred:", e.message);
    }
  }
}
