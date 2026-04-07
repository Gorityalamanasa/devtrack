const express = require("express");
const router = express.Router();
const axios = require("axios");
const Comparison = require("../models/Comparison");
const Leaderboard = require("../models/Leaderboard");

// 🔥 GitHub API
const github = axios.create({
  baseURL: "https://api.github.com",
  headers: {
    Accept: "application/vnd.github+json",
    "User-Agent": "devtrack-app",
    Authorization: process.env.GITHUB_TOKEN
      ? `token ${process.env.GITHUB_TOKEN}`
      : undefined,
  },
});

// 🔥 Skill extraction
const getSkills = (repos) => {
  const map = {};
  repos.forEach((r) => {
    if (r.language) {
      map[r.language] = (map[r.language] || 0) + 1;
    }
  });
  return map;
};

// 🔥 Repo Quality
const getRepoQuality = (repos) => {
  if (!repos.length) return 0;

  const totalStars = repos.reduce((a, r) => a + r.stargazers_count, 0);
  return totalStars / repos.length;
};

// 🔥 Activity Score
const getActivityScore = (repos) => {
  const now = new Date();

  return repos.filter((r) => {
    const diffDays =
      (now - new Date(r.updated_at)) / (1000 * 60 * 60 * 24);
    return diffDays < 30;
  }).length;
};

// 🔥 BENCHMARKS (NEW 🔥)
const getBenchmarks = (usersData) => {
  const total = usersData.length;

  const avgFollowers =
    usersData.reduce((sum, u) => sum + u.user.followers, 0) / total;

  const avgRepos =
    usersData.reduce((sum, u) => sum + u.repos.length, 0) / total;

  const avgStars =
    usersData.reduce(
      (sum, u) =>
        sum +
        u.repos.reduce((a, r) => a + r.stargazers_count, 0),
      0
    ) / total;

  return { avgFollowers, avgRepos, avgStars };
};

// 🔥 NORMALIZED SCORE (UPDATED 🔥)
const calcScore = (user, repos, benchmarks) => {
  const totalStars = repos.reduce((a, r) => a + r.stargazers_count, 0);

  // 🔥 Smooth scaling using tanh (VERY IMPORTANT)
  const normalize = (value) => Math.tanh(value); // keeps values between 0–1

  const influenceRaw =
    Math.log(user.followers + 1) /
    Math.log((benchmarks.avgFollowers || 1) + 1);

  const activityRaw =
    repos.length / (benchmarks.avgRepos || 1);

  const qualityRaw =
    totalStars / (benchmarks.avgStars || 1);

  const influence = normalize(influenceRaw) * 35;
  const activity = normalize(activityRaw) * 25;
  const quality = normalize(qualityRaw) * 25;

  const total = Math.round(influence + activity + quality);

  return {
    total,
    breakdown: {
      influence: Math.round(influence),
      activity: Math.round(activity),
      quality: Math.round(quality),
    },
  };
};
// 🔥 Developer Type
const classifyDeveloper = (data) => {
  const score = data.score;

  if (score >= 80) return "Open Source Leader";
  if (score >= 60) return "Advanced Developer";
  if (score >= 40) return "Consistent Builder";
  if (score >= 20) return "Growing Developer";
  return "Beginner Developer";
};
// 🔥 Hiring Suggestion
const getHiringFit = (data) => {
  if (data.score > 75) return "Best for high-impact engineering teams";
  if (data.score > 50) return "Best for startups and product teams";
  if (data.score > 25) return "Best for mid-level roles";
  return "Best for junior roles";
};

// 🔥 INSIGHT ENGINE
const generateInsight = (leaderboard) => {
  const top = leaderboard[0];
  const second = leaderboard[1];

  if (!second) return `${top.username} is leading strongly.`;

  return `${top.username} dominates due to strong ${
    top.score > second.score ? "overall performance" : "consistency"
  }, while ${second.username} shows growth potential.`;
};

// 🔥 MAIN API
router.post("/", async (req, res) => {
  try {
    const { users } = req.body;

    // ✅ STEP 1: FETCH ALL USERS FIRST
    const usersData = await Promise.all(
      users.map(async (username) => {
        const [u, r] = await Promise.all([
          github.get(`/users/${username}`),
          github.get(`/users/${username}/repos`),
        ]);

        return {
          username,
          user: u.data,
          repos: r.data,
        };
      })
    );

    // ✅ STEP 2: CREATE BENCHMARKS
    const benchmarks = getBenchmarks(usersData);

    // ✅ STEP 3: ANALYZE USERS
    const results = usersData.map(({ username, user, repos }) => {
      const skills = getSkills(repos);

      const scoreData = calcScore(user, repos, benchmarks);

      return {
        username,
        followers: user.followers,
        repos: user.public_repos,
        score: scoreData.total,
        breakdown: scoreData.breakdown,
        skills,
        type: classifyDeveloper({ score: scoreData.total }),
        hiringFit: getHiringFit({ score: scoreData.total }),
      };
    });

    results.sort((a, b) => b.score - a.score);
    // 🔥 SAVE COMPARISON HISTORY
    try {
    await Comparison.create({
    users,
    winner: results[0]?.username,
    scores: results
    });
    } catch (e) {
    console.log("Comparison save failed:", e.message);
    }
    try {
    for (const user of results) {
    await Leaderboard.findOneAndUpdate(
      { username: user.username },
      { score: user.score, updatedAt: new Date() },
      { upsert: true }
    );
    }
    } catch (e) {
    console.log("Leaderboard update failed:", e.message);
    }

    res.json({
      leaderboard: results,
      winner: results[0]?.username,
      insight: generateInsight(results),
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Comparison failed" });
  }
});

module.exports = router;