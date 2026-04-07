const express = require("express");
const router = express.Router();
const axios = require("axios");
const Search = require("../models/Search");

const {
  getSkills,
  getTopLanguage,
  getDNA,
  getWeakness,
  getInsights,
  getDevScore,        // ✅ ADD THIS
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


// 🔥 MAIN ROUTE
router.get("/:username", async (req, res) => {
  try {
    const { username } = req.params;

    const [userRes, repoRes] = await Promise.all([
      axios.get(`https://api.github.com/users/${username}`),
      axios.get(`https://api.github.com/users/${username}/repos`),
    ]);

    const user = userRes.data;
    const repos = repoRes.data;

    // ✅ ADD THIS (VERY IMPORTANT FIX)
    const benchmarks = {
     avgFollowers: 100,
     avgRepos: 20,
     avgStars: 50,
     };

    // existing
    const skills = getSkills(repos);
    const topLanguage = getTopLanguage(skills);
    const dna = getDNA(skills);

    // ✅ FIXED (added benchmarks)
    const weakness = getWeakness(user, repos, benchmarks);
    const insights = getInsights(user, repos, skills, benchmarks);

    // existing
    const impact = getProjectImpact(repos);
    const activity = getActivityAnalytics(repos);
    const score = getDevScore(user, repos, benchmarks);
    const timeline = getTimeline(repos);
    // 🔥 SAVE SEARCH HISTORY
    try {
    await Search.create({
    username,
    score: score.total
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
      timeline
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Analysis failed" });
  }
});

module.exports = router;