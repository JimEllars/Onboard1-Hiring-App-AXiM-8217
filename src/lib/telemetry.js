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
