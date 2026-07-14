const express = require("express");
const router = express.Router();
const axios = require("axios");
const Search = require("../models/Search");
const getAIInsights = require("../utils/ai");

const {
  getSkills,
  getTopLanguage,
  getDNA,
  getWeakness,
  getInsights,
  getDevScore,
} = require("../utils/analyze");

// 🚀 Project Impact
const getProjectImpact = (repos) => {
  if (!repos.length) return {};

  const topRepo = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count)[0];
  const mostForked = [...repos].sort((a, b) => b.forks_count - a.forks_count)[0];
  const mostActive = [...repos].sort(
    (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
  )[0];

  return {
    topRepo,
    mostForked,
    mostActive,
  };
};

// 📊 Activity Analytics
const getActivityAnalytics = (repos) => {
  const now = new Date();

  let last7 = 0;
  let last30 = 0;

  repos.forEach((repo) => {
    const diffDays =
      (now - new Date(repo.updated_at)) / (1000 * 60 * 60 * 24);

    if (diffDays <= 7) last7++;
    if (diffDays <= 30) last30++;
  });

  return {
    last7,
    last30,
    level: last7 > 5 ? "High" : last7 > 2 ? "Medium" : "Low",
  };
};

// 📈 TIMELINE (unchanged)
const getTimeline = (repos) => {
  if (!repos || repos.length === 0) return { repoGrowth: [] };

  const map = {};

  repos.forEach((repo) => {
    if (!repo.created_at) return;

    const date = new Date(repo.created_at);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;

    map[key] = (map[key] || 0) + 1;
  });

  const sorted = Object.keys(map).sort();

  let cumulative = 0;

  return {
    repoGrowth: sorted.map((key) => {
      cumulative += map[key];
      return {
        month: key,
        count: cumulative,
      };
    }),
  };
};

// ⚖️ Dynamic Benchmark Calculator from DB Search history
const getDynamicBenchmarks = async () => {
  const defaults = {
    avgFollowers: Number(process.env.DEFAULT_AVG_FOLLOWERS) || 100,
    avgRepos: Number(process.env.DEFAULT_AVG_REPOS) || 20,
    avgStars: Number(process.env.DEFAULT_AVG_STARS) || 50,
  };

  try {
    const stats = await Search.aggregate([
      {
        $group: {
          _id: null,
          avgFollowers: { $avg: "$followers" },
          avgRepos: { $avg: "$publicRepos" },
          avgStars: { $avg: "$totalStars" },
        },
      },
    ]);

    if (stats && stats.length > 0 && stats[0].avgFollowers !== null) {
      return {
        avgFollowers: Math.round(stats[0].avgFollowers) || defaults.avgFollowers,
        avgRepos: Math.round(stats[0].avgRepos) || defaults.avgRepos,
        avgStars: Math.round(stats[0].avgStars) || defaults.avgStars,
      };
    }
  } catch (err) {
    console.error("Failed to compute dynamic benchmarks from DB:", err.message);
  }

  return defaults;
};

// 🔥 MAIN ROUTE
router.get("/:username", async (req, res) => {
  try {
    const { username } = req.params;

    const config = {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
        "User-Agent": "devtrack-app",
      },
    };

    const [userRes, repoRes] = await Promise.all([
      axios.get(`https://api.github.com/users/${username}`, config),
      axios.get(`https://api.github.com/users/${username}/repos`, config),
    ]);

    const user = userRes.data;
    const repos = repoRes.data;

    // Calculate dynamic benchmarks from search history / config defaults
    const benchmarks = await getDynamicBenchmarks();

    // Quantitative Calculations (existing deterministic analytics)
    const skills = getSkills(repos);
    const topLanguage = getTopLanguage(skills);
    const totalStars = repos.reduce((a, r) => a + (r.stargazers_count || 0), 0);
    const totalForks = repos.reduce((a, r) => a + (r.forks_count || 0), 0);

    const impact = getProjectImpact(repos);
    const activity = getActivityAnalytics(repos);
    const score = getDevScore(user, repos, benchmarks);
    const timeline = getTimeline(repos);

    // Rule-based metrics to serve as first-level fallbacks
    const ruleBasedDna = getDNA(skills);
    const ruleBasedWeakness = getWeakness(user, repos, benchmarks);
    const ruleBasedInsights = getInsights(user, repos, skills, benchmarks);

    // Connecting OpenAI with double fallback logic
    let dna = ruleBasedDna;
    let weakness = ruleBasedWeakness;
    let insights = ruleBasedInsights;
    let aiAvailable = false;
    let aiSource = "RULE_BASED_FALLBACK";

    try {
      const topRepoSimplified = impact.topRepo ? {
        name: impact.topRepo.name,
        stars: impact.topRepo.stargazers_count,
        language: impact.topRepo.language
      } : null;

      const mostForkedSimplified = impact.mostForked ? {
        name: impact.mostForked.name,
        forks: impact.mostForked.forks_count,
        language: impact.mostForked.language
      } : null;

      const recentReposSimplified = [...repos]
        .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
        .slice(0, 3)
        .map(r => ({
          name: r.name,
          description: r.description,
          updated_at: r.updated_at,
          language: r.language
        }));

      const aiResult = await getAIInsights({
        username,
        followers: user.followers,
        publicRepos: repos.length,
        topLanguage,
        skills,
        totalStars,
        totalForks,
        activityLevel: activity.level,
        activityScore: score.activity,
        influenceScore: score.influence,
        qualityScore: score.quality,
        overallScore: score.total,
        topRepository: topRepoSimplified,
        mostForkedRepository: mostForkedSimplified,
        recentRepositories: recentReposSimplified
      });

      if (aiResult && aiResult.success !== false) {
        dna = aiResult.dna;
        weakness = aiResult.weakness;
        insights = aiResult.insights;
        aiAvailable = true;
        aiSource = "OPENAI";
      } else {
        console.warn("OpenAI returned a failed result, falling back to rule-based analysis.");
      }
    } catch (aiErr) {
      console.error("Failed to perform OpenAI analysis. Using rule-based fallback.", aiErr.message);
    }

    // Safety check: ensure dna, weakness, insights are present (Priority 3: generic fallback)
    if (!dna) {
      dna = ruleBasedDna || "Data-Driven Developer";
    }
    if (!weakness) {
      weakness = ruleBasedWeakness || "AI analysis is temporarily unavailable.";
    }
    if (!insights || !Array.isArray(insights) || insights.length === 0) {
      insights = (ruleBasedInsights && ruleBasedInsights.length > 0) ? ruleBasedInsights : [
        "Review repository consistency and recent activity.",
        "Improve project documentation and visibility."
      ];
    }

    // 🔥 SAVE SEARCH HISTORY (with newly tracked stats for future benchmarks)
    try {
      await Search.create({
        username,
        score: score.total,
        followers: user.followers,
        publicRepos: repos.length,
        totalStars: totalStars
      });
    } catch (e) {
      console.log("DB save failed:", e.message);
    }

    res.json({
      username,
      topLanguage,
      dna,
      weakness,
      insights,
      skills,
      impact,
      activity,
      score,
      timeline,
      aiAvailable,
      aiSource
    });

  } catch (err) {
    console.error("Main analyze route error:", err.message);
    res.status(500).json({ error: "Analysis failed" });
  }
});

module.exports = router;