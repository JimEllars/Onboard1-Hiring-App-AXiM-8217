import os

filepath = 'src/lib/telemetry.js'
with open(filepath, 'r') as f:
    content = f.read()

new_content = """/**
 * Lightweight telemetry utility to capture non-PII events
 * Interfaces with Cloudflare Web Analytics when available.
 */

export const TELEMETRY_EVENTS = {
  AUTH_EVENT: 'auth_event',
  CANDIDATE_PIPELINE_EVENT: 'candidate_pipeline_event',
  MEDIA_STREAM_EVENT: 'media_stream_event',
  AUTOMATION_TRIGGER_EVENT: 'automation_trigger_event',
};

// Funnel helper triggers
export const trackSurveyCompleted = (candidateId, metadata = {}) => {
  logEvent('candidate.survey_completed', { candidateId, ...metadata });
};

export const trackVideoUploaded = (candidateId, metadata = {}) => {
  logEvent('candidate.video_uploaded', { candidateId, ...metadata });
};

export const trackInterviewScheduled = (candidateId, metadata = {}) => {
  logEvent('interview.scheduled', { candidateId, ...metadata });
};

export const trackCheckrCleared = (candidateId, metadata = {}) => {
  logEvent('candidate.checkr_cleared', { candidateId, ...metadata });
};

export const trackOfferSigned = (candidateId, metadata = {}) => {
  logEvent('offer.signed', { candidateId, ...metadata });
};

export const trackApplied = (candidateId, metadata = {}) => {
  logEvent('candidate.applied', { candidateId, ...metadata });
};

export const logEvent = (eventName, data = {}) => {
  if (typeof window === 'undefined') {
    return;
  }

  const payload = {
    event_type: eventName,
    ...data,
    timestamp: new Date().toISOString()
  };

  // Log locally for debugging in dev
  if (import.meta.env.DEV) {
    console.debug('[Telemetry]', payload);
  }

  // Interface with Cloudflare Web Analytics if available
  if (window.__cfBeacon || window.Cloudflare) {
     if (typeof window.cloudflareLogEvent === 'function') {
         window.cloudflareLogEvent(eventName, payload);
     }
  }

  // Route to the new API endpoint for telemetry normalizations
  fetch('/api/events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  }).catch(err => {
    // Fail silently for telemetry
  });
};
"""

with open(filepath, 'w') as f:
    f.write(new_content)
