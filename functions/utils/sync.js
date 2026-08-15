export const syncPayload = async (url, payload, options = {}) => {
  const {
    maxRetries = 3,
    initialDelayMs = 1000,
    maxDelayMs = 10000,
    backoffFactor = 2,
    serviceName = "Downstream Service"
  } = options;

  let attempt = 0;

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Note: attempt 0 is the first try, retries are attempt 1, 2, 3
  // So maxRetries = 3 means 4 attempts total.
  while (attempt <= maxRetries) {
    try {
      console.log(`[Telemetry][Sync] Attempt ${attempt + 1}/${maxRetries + 1} to push to ${serviceName} (${url})`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log(`[Telemetry][Sync] Successfully synced to ${serviceName} on attempt ${attempt + 1}`);
        return { success: true, response };
      }

      if (response.status >= 500 && response.status < 600) {
        console.error(`[Telemetry][Sync] ${serviceName} returned ${response.status} on attempt ${attempt + 1}`);
        if (attempt === maxRetries) {
          return { success: false, error: `${serviceName} failed after ${maxRetries} retries with status ${response.status}`, status: response.status };
        }
      } else {
        // Non-retriable error
        console.error(`[Telemetry][Sync] ${serviceName} returned non-retriable error ${response.status}`);
        return { success: false, error: `Non-retriable error ${response.status}`, status: response.status };
      }
    } catch (error) {
      console.error(`[Telemetry][Sync] Network or execution error on attempt ${attempt + 1} for ${serviceName}:`, error.message);
      if (attempt === maxRetries) {
         return { success: false, error: error.message };
      }
    }

    const delayMs = Math.min(maxDelayMs, initialDelayMs * Math.pow(backoffFactor, attempt));
    console.log(`[Telemetry][Sync] Waiting ${delayMs}ms before next attempt for ${serviceName}`);
    await wait(delayMs);
    attempt++;
  }

  return { success: false, error: "Max retries exceeded" };
};
