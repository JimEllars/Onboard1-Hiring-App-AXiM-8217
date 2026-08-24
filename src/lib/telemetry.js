/**
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
  logEvent(TELEMETRY_EVENTS.CANDIDATE_PIPELINE_EVENT, { stage: 'survey_completed', candidateId, ...metadata });
};

export const trackVideoUploaded = (candidateId, metadata = {}) => {
  logEvent(TELEMETRY_EVENTS.CANDIDATE_PIPELINE_EVENT, { stage: 'video_uploaded', candidateId, ...metadata });
};

export const trackInterviewScheduled = (candidateId, metadata = {}) => {
  logEvent(TELEMETRY_EVENTS.CANDIDATE_PIPELINE_EVENT, { stage: 'interview_scheduled', candidateId, ...metadata });
};

export const trackCheckrCleared = (candidateId, metadata = {}) => {
  logEvent(TELEMETRY_EVENTS.CANDIDATE_PIPELINE_EVENT, { stage: 'checkr_cleared', candidateId, ...metadata });
};

export const trackOfferSigned = (candidateId, metadata = {}) => {
  logEvent(TELEMETRY_EVENTS.CANDIDATE_PIPELINE_EVENT, { stage: 'offer_signed', candidateId, ...metadata });
};

export const logEvent = (eventName, data = {}) => {
  if (typeof window === 'undefined') {
    return;
  }

  const payload = {
    event: eventName,
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
};
