const axios = require("axios");

/**
 * Calls an OpenAI-compatible chat completions endpoint.
 * Does NOT use response_format so it works across all providers.
 */
const callChatAPI = async (url, model, apiKey, prompt) => {
  const response = await axios.post(
    url,
    {
      model,
      messages: [
        {
          role: "system",
          content: "You are a developer productivity analyst. Analyze only the provided GitHub metrics. Return valid JSON only, no extra text."
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.4,
      max_tokens: 500
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      timeout: 20000
    }
  );

  let content = response.data.choices[0].message.content;
  if (!content) throw new Error("Empty content from AI API");

  // Extract JSON from response (handles markdown wrappers and extra text)
  content = content.trim();
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON found in AI response");
  content = jsonMatch[0];

  const parsed = JSON.parse(content);
  if (!parsed.dna || !parsed.weakness || !Array.isArray(parsed.insights)) {
    throw new Error("Parsed JSON missing required fields");
  }

  return {
    success: true,
    dna: parsed.dna,
    weakness: parsed.weakness,
    insights: parsed.insights.slice(0, 3)
  };
};

/**
 * Fetches qualitative AI analysis.
 * Priority: Groq → Gemini → OpenAI → GitHub Models → Rule-based fallback
 */
const getAIInsights = async (developerData) => {
  const fallbackResponse = {
    success: false,
    dna: "Data-Driven Developer",
    weakness: "AI analysis is temporarily unavailable.",
    insights: [
      "Review repository consistency and recent activity.",
      "Improve project documentation and visibility."
    ]
  };

  const prompt = `Analyze this GitHub developer profile and return ONLY a JSON object (no extra text):

- Username: ${developerData.username}
- Followers: ${developerData.followers}
- Public Repositories: ${developerData.publicRepos}
- Primary Language: ${developerData.topLanguage}
- Skills: ${JSON.stringify(developerData.skills)}
- Total Stars: ${developerData.totalStars}
- Total Forks: ${developerData.totalForks}
- Activity Level: ${developerData.activityLevel}
- Overall Score: ${developerData.overallScore}/100
- Top Repository: ${JSON.stringify(developerData.topRepository)}
- Recent Repositories: ${JSON.stringify(developerData.recentRepositories)}

Return this exact JSON structure:
{
  "dna": "short developer type label",
  "weakness": "one specific weakness based on the data",
  "insights": ["insight 1", "insight 2", "insight 3"]
}`;

  // ── Strategy 1: Groq (FREE — fast) ────────────────────────────────────
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    try {
      console.log("[AI] Trying Groq...");
      const result = await callChatAPI(
        "https://api.groq.com/openai/v1/chat/completions",
        "llama-3.1-8b-instant",
        groqKey,
        prompt
      );
      console.log("[AI] Groq succeeded ✅");
      return result;
    } catch (err) {
      console.warn("[AI] Groq failed:", err.response?.status, err.response?.data?.error?.message || err.message);
    }
  } else {
    console.warn("[AI] GROQ_API_KEY not set.");
  }

  // ── Strategy 2: Google Gemini (free tier) ──────────────────────────────
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      console.log("[AI] Trying Gemini...");
      const result = await callChatAPI(
        "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
        "gemini-1.5-flash",
        geminiKey,
        prompt
      );
      console.log("[AI] Gemini succeeded ✅");
      return result;
    } catch (err) {
      console.warn("[AI] Gemini failed:", err.response?.status, err.response?.data?.error?.message || err.message);
    }
  }

  // ── Strategy 3: OpenAI ─────────────────────────────────────────────────
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    try {
      console.log("[AI] Trying OpenAI...");
      const result = await callChatAPI(
        "https://api.openai.com/v1/chat/completions",
        "gpt-3.5-turbo",
        openaiKey,
        prompt
      );
      console.log("[AI] OpenAI succeeded ✅");
      return result;
    } catch (err) {
      console.warn("[AI] OpenAI failed:", err.response?.status, err.response?.data?.error?.message || err.message);
    }
  }

  // ── Strategy 4: GitHub Models ──────────────────────────────────────────
  const githubToken = process.env.GITHUB_TOKEN;
  const aiUrl = process.env.GITHUB_AI_URL || "https://models.inference.ai.azure.com/chat/completions";
  const aiModel = process.env.GITHUB_AI_MODEL || "gpt-4o-mini";
  if (githubToken) {
    try {
      console.log("[AI] Trying GitHub Models...");
      const result = await callChatAPI(aiUrl, aiModel, githubToken, prompt);
      console.log("[AI] GitHub Models succeeded ✅");
      return result;
    } catch (err) {
      console.warn("[AI] GitHub Models failed:", err.response?.status, err.message);
    }
  }

  console.error("[AI] All strategies failed. Using rule-based fallback.");
  return fallbackResponse;
};

module.exports = getAIInsights;
