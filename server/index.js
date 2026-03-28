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

// 🔥 GITHUB API
app.get("/github/:username", async (req, res) => {
  try {
    const { username } = req.params;

    const user = await axios.get(`https://api.github.com/users/${username}`);
    const repos = await axios.get(`https://api.github.com/users/${username}/repos`);

    res.json({
      user: user.data,
      repos: repos.data,
    });
  } catch (err) {
    res.status(500).json({ error: "Error fetching GitHub data" });
  }
});

// 🔥 DATABASE CONNECTION (USE ENV)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// 🔥 PORT FIX (IMPORTANT FOR DEPLOYMENT)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});