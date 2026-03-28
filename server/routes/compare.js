const express = require("express");
const router = express.Router();
const axios = require("axios");

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

// 🔥 Compare API
router.get("/:user1/:user2", async (req, res) => {
  try {
    const { user1, user2 } = req.params;

    const [u1, u2, r1, r2] = await Promise.all([
      axios.get(`https://api.github.com/users/${user1}`),
      axios.get(`https://api.github.com/users/${user2}`),
      axios.get(`https://api.github.com/users/${user1}/repos`),
      axios.get(`https://api.github.com/users/${user2}/repos`),
    ]);

    const calcScore = (user, repos) => {
      const stars = repos.reduce((a, r) => a + r.stargazers_count, 0);
      return (
        user.followers * 0.4 +
        user.public_repos * 0.3 +
        stars * 0.3
      );
    };

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
    console.error(err);
    res.status(500).json({ error: "Comparison failed" });
  }
});

module.exports = router;