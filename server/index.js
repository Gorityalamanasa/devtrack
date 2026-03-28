const express = require("express");
const cors = require("cors");
const axios = require("axios");
const mongoose = require("mongoose");
require("dotenv").config();

// ROUTES
const analyzeRoutes = require("./routes/analyze");
const authRoutes = require("./routes/auth");
const compareRoutes = require("./routes/compare");

const app = express();

// 🔥 MIDDLEWARE
app.use(cors({
  origin: "*"
}));
app.use(express.json());

// 🔥 ROUTES
app.use("/analyze", analyzeRoutes);
app.use("/auth", authRoutes);
app.use("/compare", compareRoutes);

// 🔥 TEST ROUTE
app.get("/", (req, res) => {
  res.send("DevTrack Backend Running 🚀");
});

// 🔥 GITHUB API (FIXED WITH TOKEN)
app.get("/github/:username", async (req, res) => {
  try {
    const { username } = req.params;

    const config = {
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
    };

    const user = await axios.get(
      `https://api.github.com/users/${username}`,
      config
    );

    const repos = await axios.get(
      `https://api.github.com/users/${username}/repos`,
      config
    );

    res.json({
      user: user.data,
      repos: repos.data,
    });

  } catch (err) {
    console.error("GitHub API Error:", err.response?.status, err.message);

    if (err.response?.status === 403) {
      return res.status(403).json({
        error: "GitHub API rate limit exceeded or access forbidden",
      });
    }

    res.status(500).json({
      error: "Error fetching GitHub data",
    });
  }
});

// 🔥 DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// 🔥 PORT (RENDER SUPPORT)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});