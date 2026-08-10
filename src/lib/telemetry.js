/**
 * Lightweight telemetry utility to capture non-PII events
 * Interfaces with Cloudflare Web Analytics when available.
 */
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
  // Cloudflare beacon typically exposes window.__cfBeacon
  // For custom event logging in Cloudflare, if supported by the plan,
  // we could push events. Since Cloudflare Web Analytics is mostly automatic,
  // if they expose a custom events API or global script, we would call it here.

  if (window.__cfBeacon || window.Cloudflare) {
     // Currently, CF Web Analytics handles page views automatically.
     // Custom events aren't natively supported in the free tier of CF Web Analytics in a `logEvent` way,
     // but if a global function exists (e.g. from an enterprise script), we'd call it here.
     // Example placeholder:
     if (typeof window.cloudflareLogEvent === 'function') {
         window.cloudflareLogEvent(eventName, payload);
     }
  }
};
