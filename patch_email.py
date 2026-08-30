import os

filepath = 'functions/utils/email.js'
with open(filepath, 'r') as f:
    content = f.read()

new_content = content + """

export async function sendHiringEmail({ to, subject, html, attachments, env }) {
  const emailitApiKey = env.EMAILIT_API_KEY || env.RESEND_API_KEY; // Fallback to RESEND if not set for testing
  const resendApiKey = env.RESEND_API_KEY;

  if (!resendApiKey) {
    throw new Error("RESEND_API_KEY is not set.");
  }

  const from = 'Acme Hiring <onboarding@resend.dev>'; // Using resend.dev for test purposes

  // Primary: EmailIt
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
        'Authorization': `Bearer ${emailitApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, provider: 'emailit', data };
    } else {
      console.warn(`EmailIt failed with status ${response.status}. Falling back to Resend.`);
    }
  } catch (error) {
    console.warn(`EmailIt request error: ${error.message}. Falling back to Resend.`);
  }

  // Fallback: Resend
  try {
    const payload = {
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      attachments
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, provider: 'resend', data };
    } else {
      const errorData = await response.text();
      throw new Error(`Failed to send email via Resend API: ${response.status} ${errorData}`);
    }
  } catch (error) {
    console.error(`Both primary and fallback email providers failed.`, error);
    throw error;
  }
}
"""

with open(filepath, 'w') as f:
    f.write(new_content)
