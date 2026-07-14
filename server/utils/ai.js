const axios = require("axios");

/**
 * Fetches qualitative analysis (DNA, weaknesses, insights) from the free GitHub Models API
 * (running GPT-4o-mini) using the existing GITHUB_TOKEN.
 * 
 * @param {Object} developerData Processed developer statistics
 * @returns {Promise<Object>} Object containing dna, weakness, insights, and a success flag
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

  // Authenticate using the existing GITHUB_TOKEN in your environment (Free inference tier)
  const apiKey = process.env.GITHUB_TOKEN;
  if (!apiKey) {
    console.warn("GITHUB_TOKEN is missing. Skipping AI insights.");
    return fallbackResponse;
  }

  const aiUrl = process.env.GITHUB_AI_URL || "https://models.inference.ai.azure.com/chat/completions";
  const aiModel = process.env.GITHUB_AI_MODEL || "gpt-4o-mini";

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
3. "insights": Exactly three concise, professional, and action-oriented insights or improvement suggestions.

Rules:
- Keep the response concise, professional, and constructive.
- Do NOT generate insulting, dismissive, or overly negative feedback.
- Base all suggestions strictly on the supplied statistics. Do NOT invent repositories, skills, achievements, or experience.
- Return valid JSON only, using the specified format.

Desired JSON Format:
{
  "dna": "...",
  "weakness": "...",
  "insights": [
    "Insight 1",
    "Insight 2",
    "Insight 3"
  ]
}
`;

  const makeAIRequest = async () => {
    return await axios.post(
      aiUrl,
      {
        model: aiModel,
        messages: [
          {
            role: "system",
            content: "You are a developer productivity analyst. Analyze only the provided GitHub metrics. Return valid JSON only."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        timeout: 15000 // 15-second timeout
      }
    );
  };

  try {
    let response;
    try {
      response = await makeAIRequest();
    } catch (err) {
      // Retry once for HTTP 429 (Rate Limit) after a short delay
      if (err.response && err.response.status === 429) {
        const errCode = err.response.data?.error?.code;
        if (errCode === "insufficient_quota") {
          console.warn("Inference billing quota exceeded. Skipping retry.");
          throw err;
        }
        console.warn("AI model rate limit hit (429). Retrying in 1.5 seconds...");
        await new Promise((resolve) => setTimeout(resolve, 1500));
        response = await makeAIRequest();
      } else {
        throw err;
      }
    }

    let content = response.data.choices[0].message.content;
    if (!content) {
      throw new Error("Received empty content from AI API");
    }

    // Clean any markdown wrapper formatting (e.g. ```json ... ```)
    content = content.trim();
    if (content.startsWith("```json")) {
      content = content.replace(/^```json\s*/i, "");
    }
    if (content.endsWith("```")) {
      content = content.replace(/\s*```$/i, "");
    }
    content = content.trim();

    const parsed = JSON.parse(content);

    // Validate structure
    if (!parsed.dna || !parsed.weakness || !Array.isArray(parsed.insights)) {
      throw new Error("Parsed JSON response is missing required fields");
    }

    return {
      success: true,
      dna: parsed.dna,
      weakness: parsed.weakness,
      insights: parsed.insights.slice(0, 3)
    };

  } catch (err) {
    console.error("AI utility error:", err.message);
    return fallbackResponse;
  }
};

module.exports = getAIInsights;