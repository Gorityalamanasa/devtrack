const express = require("express");
const router = express.Router();
const axios = require("axios");

const {
  getSkills,
  getTopLanguage,
  getDNA,
  getWeakness,
  getInsights,
} = require("../utils/analyze");

router.get("/:username", async (req, res) => {
  try {
    const { username } = req.params;

    // 🔥 Fetch GitHub data
    const [userRes, repoRes] = await Promise.all([
      axios.get(`https://api.github.com/users/${username}`),
      axios.get(`https://api.github.com/users/${username}/repos`),
    ]);

    const user = userRes.data;
    const repos = repoRes.data;

    // 🔥 Process data
    const skills = getSkills(repos);
    const topLanguage = getTopLanguage(skills);
    const dna = getDNA(skills);
    const weakness = getWeakness(user, repos);
    const insights = getInsights(user, repos, skills);

    // 🔥 Final response
    res.json({
      username,
      topLanguage,
      dna,
      weakness,
      insights,
      skills,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Analysis failed" });
  }
});

module.exports = router;