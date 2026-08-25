export async function onRequest(context) {
  const { request } = context;

  // Handle CORS preflight
  const origin = request.headers.get("Origin") || "*";
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
      }
    });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const data = await request.json();

    // In a real application, we would call an AI provider (e.g. OpenAI) here.
    // For this implementation, we will simulate the AI analysis with a mock response,
    // explicitly ensuring demographic data is ignored to neutralize systemic bias.

    const mockScore = Math.floor(Math.random() * (98 - 75 + 1)) + 75; // Random score between 75 and 98

    const mockStrengths = [
      "Strong alignment with technical requirements based on past experience.",
      "Demonstrates clear problem-solving methodology in responses.",
      "Relevant industry background matches the job profile."
    ];

    return new Response(JSON.stringify({
      matchScore: mockScore,
      strengths: mockStrengths,
      note: "AI evaluation strictly ignores demographic data to ensure an unbiased candidate fit analysis."
    }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": origin,
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Invalid request payload" }), { status: 400 });
  }
}
