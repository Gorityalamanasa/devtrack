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

// 🔥 Score calc
const calcScore = (user, repos) => {
  const totalStars = repos.reduce(
    (sum, repo) => sum + repo.stargazers_count,
    0
  );

  return (
    user.followers * 0.4 +
    user.public_repos * 0.3 +
    totalStars * 0.3
  );
};

// 🔥 MULTI USER COMPARE
router.post("/", async (req, res) => {
  try {
    const { users } = req.body;

    if (!users || users.length < 2) {
      return res.status(400).json({
        error: "Provide at least 2 users",
      });
    }

    // 🔥 Fetch all users
    const results = await Promise.all(
      users.map(async (username) => {
        const [u, r] = await Promise.all([
          github.get(`/users/${username}`),
          github.get(`/users/${username}/repos`),
        ]);

        const score = calcScore(u.data, r.data);

        return {
          username,
          followers: u.data.followers,
          repos: u.data.public_repos,
          score,
        };
      })
    );

    // 🔥 Sort leaderboard
    results.sort((a, b) => b.score - a.score);

    res.json({
      leaderboard: results,
      winner: results[0].username,
    });

  } catch (err) {
    console.error(err.message);

    res.status(500).json({
      error: "Comparison failed",
    });
  }
});

module.exports = router;