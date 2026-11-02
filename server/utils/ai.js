const axios = require("axios");

/**
 * Calls an OpenAI-compatible chat completions endpoint.
 */
const callChatAPI = async (url, model, apiKey, prompt) => {
  const response = await axios.post(
    url,
    {
      model,
      messages: [
        {
          role: "system",
          content: "You are a developer productivity analyst. Analyze only the provided GitHub metrics. Return valid JSON only."
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
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

  content = content.trim()
    .replace(/^```json\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

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
 * Priority: Groq (free) → Gemini (free) → OpenAI → GitHub Models → Fallback
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

  const prompt = `
Analyze the following processed GitHub developer profile metrics:
- Username: ${developerData.username}
- Followers: ${developerData.followers}
- Public Repositories: ${developerData.publicRepos}
- Primary Language: ${developerData.topLanguage}
- Top Skills & Language distribution: ${JSON.stringify(developerData.skills)}
- Total Stars: ${developerData.totalStars}
- Total Forks: ${developerData.totalForks}
- Activity Level: ${developerData.activityLevel}
- Activity Score: ${developerData.activityScore}/30
- Influence Score: ${developerData.influenceScore}/40
- Repository Quality Score: ${developerData.qualityScore}/30
- Overall Developer Score: ${developerData.overallScore}/100
- Top Repository: ${JSON.stringify(developerData.topRepository)}
- Most Forked Repository: ${JSON.stringify(developerData.mostForkedRepository)}
- Recent Repositories: ${JSON.stringify(developerData.recentRepositories)}

Based strictly on these metrics, generate a qualitative assessment:
1. "dna": A short developer classification (e.g., "Full-Stack Specialist", "Open Source Collaborator").
2. "weakness": One meaningful weakness or area for improvement.
3. "insights": Exactly three concise, professional, and action-oriented insights.

Rules:
- Keep it concise, professional, and constructive.
- Base all suggestions strictly on the supplied statistics only.
- Return valid JSON only in exactly this format:

{
  "dna": "...",
  "weakness": "...",
  "insights": ["Insight 1", "Insight 2", "Insight 3"]
}
`;

  // ── Strategy 1: Groq (FREE — fast, no billing needed) ─────────────────
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    try {
      console.log("[AI] Trying Groq...");
      const result = await callChatAPI(
        "https://api.groq.com/openai/v1/chat/completions",
        "llama3-8b-8192",
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
  } else {
    console.warn("[AI] GEMINI_API_KEY not set.");
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
