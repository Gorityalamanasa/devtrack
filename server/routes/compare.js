const express = require("express");
const router = express.Router();
const axios = require("axios");

// 🔥 GitHub API CONFIG (FIX 403 ERROR)
const github = axios.create({
  baseURL: "https://api.github.com",
  headers: {
    Accept: "application/vnd.github+json",
    "User-Agent": "devtrack-app",
    Authorization: process.env.GITHUB_TOKEN
      ? `token ${process.env.GITHUB_TOKEN}` // ✅ FIXED
      : undefined,
  },
});

// 🔥 Skill extraction
const getSkills = (repos) => {
  const map = {};
  repos.forEach((repo) => {
    if (repo.language) {
      map[repo.language] = (map[repo.language] || 0) + 1;
    }
  });
  return map;
};

// 🔥 Score calculation
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

// 🔥 Compare API
router.get("/:user1/:user2", async (req, res) => {
  try {
    const { user1, user2 } = req.params;

    // 🔥 Parallel API calls (fast)
    const [u1, u2, r1, r2] = await Promise.all([
      github.get(`/users/${user1}`),
      github.get(`/users/${user2}`),
      github.get(`/users/${user1}/repos`),
      github.get(`/users/${user2}/repos`),
    ]);

    const score1 = calcScore(u1.data, r1.data);
    const score2 = calcScore(u2.data, r2.data);

    const winner =
      score1 > score2 ? user1 : score2 > score1 ? user2 : "Tie";

    res.json({
      user1: {
        username: user1,
        followers: u1.data.followers,
        repos: u1.data.public_repos,
        score: score1,
        skills: getSkills(r1.data),
      },
      user2: {
        username: user2,
        followers: u2.data.followers,
        repos: u2.data.public_repos,
        score: score2,
        skills: getSkills(r2.data),
      },
      winner,
    });

  } catch (err) {
    console.error("Compare API Error:", err.response?.status, err.message);

    // 🔥 Handle GitHub API rate limit / forbidden
    if (err.response?.status === 403) {
      return res.status(403).json({
        error: "GitHub API rate limit exceeded or access forbidden",
      });
    }

    // 🔥 Handle user not found
    if (err.response?.status === 404) {
      return res.status(404).json({
        error: "One or both GitHub users not found",
      });
    }

    res.status(500).json({
      error: "Comparison failed",
    });
  }
});

module.exports = router;