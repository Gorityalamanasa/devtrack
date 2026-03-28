const axios = require("axios");

const getAIInsights = async (user) => {
  try {
    const prompt = `
    Analyze this GitHub profile:

    Followers: ${user.followers}
    Repos: ${user.public_repos}

    Return JSON ONLY:
    {
      "dna": "...",
      "weakness": "...",
      "insights": ["...", "..."]
    }
    `;

    const res = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const text = res.data.choices[0].message.content;

    return JSON.parse(text); // 🔥 important
  } catch (err) {
    console.log(err.message);
    return {
      dna: "Unknown",
      weakness: "Could not analyze",
      insights: ["Try again later"],
    };
  }
};

module.exports = getAIInsights;