const express = require("express");
const router = express.Router();
const axios = require("axios");

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

// 🔥 Repo Quality Score
const getRepoQuality = (repos) => {
  if (!repos.length) return 0;

  const totalStars = repos.reduce((a, r) => a + r.stargazers_count, 0);
  const totalForks = repos.reduce((a, r) => a + r.forks_count, 0);

  const avgStars = totalStars / repos.length;
  const avgForks = totalForks / repos.length;

  return avgStars * 0.7 + avgForks * 0.3;
};

// 🔥 Activity Score (recent commits)
const getActivityScore = (repos) => {
  const now = new Date();

  const recent = repos.filter((r) => {
    const updated = new Date(r.updated_at);
    const diffDays = (now - updated) / (1000 * 60 * 60 * 24);
    return diffDays < 30;
  });

  return recent.length;
};

// 🔥 Normalized Score
const calcScore = (user, repos) => {
  const followersScore = Math.log(user.followers + 1) * 20;
  const repoQuality = getRepoQuality(repos);
  const activity = getActivityScore(repos);

  const total = followersScore + repoQuality * 2 + activity * 5;

  return {
    total,
    breakdown: {
      followersScore,
      repoQuality,
      activity,
    },
  };
};

// 🔥 Developer Type
const classifyDeveloper = (data) => {
  if (data.followers > 5000) return "Open Source Leader";
  if (data.repos > 20) return "Consistent Builder";
  if (data.breakdown.activity > 5) return "Active Developer";
  return "Beginner Developer";
};

// 🔥 Hiring Suggestion
const getHiringFit = (data) => {
  if (data.followers > 5000)
    return "Best for Open Source / Community roles";

  if (data.repos > 15)
    return "Best for Startup (builder mindset)";

  if (data.breakdown.activity > 5)
    return "Best for fast-paced teams";

  return "Best for learning / junior roles";
};

// 🔥 INSIGHT ENGINE
const generateInsight = (leaderboard) => {
  const top = leaderboard[0];
  const second = leaderboard[1];

  return `${top.username} dominates due to strong ${
    top.followers > second.followers
      ? "community presence"
      : "project impact"
  }, while ${second.username} shows potential in ${
    second.repos > top.repos ? "building projects" : "growing engagement"
  }.`;
};

// 🔥 MAIN API
router.post("/", async (req, res) => {
  try {
    const { users } = req.body;

    const results = await Promise.all(
      users.map(async (username) => {
        const [u, r] = await Promise.all([
          github.get(`/users/${username}`),
          github.get(`/users/${username}/repos`),
        ]);

        const scoreData = calcScore(u.data, r.data);

        const userData = {
          username,
          followers: u.data.followers,
          repos: u.data.public_repos,
          score: scoreData.total,
          breakdown: scoreData.breakdown,
          skills: getSkills(r.data),
        };

        return {
          ...userData,
          type: classifyDeveloper(userData),
          hiringFit: getHiringFit(userData),
        };
      })
    );

    results.sort((a, b) => b.score - a.score);

    res.json({
      leaderboard: results,
      winner: results[0].username,
      insight: generateInsight(results),
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Comparison failed" });
  }
});

module.exports = router;