// ===============================
// 🔧 UTILS
// ===============================
const normalize = (value, max) => (max === 0 ? 0 : value / max);

const sum = (arr, key) =>
  arr.reduce((acc, item) => acc + (item[key] || 0), 0);

// ===============================
// 🔥 SKILL EXTRACTION
// ===============================
const getSkills = (repos) => {
  const map = {};

  repos.forEach((repo) => {
    if (repo.language) {
      map[repo.language] = (map[repo.language] || 0) + 1;
    }
  });

  return map;
};

// ===============================
// 🔥 TOP LANGUAGE
// ===============================
const getTopLanguage = (skills) => {
  const sorted = Object.entries(skills).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] || "Unknown";
};

// ===============================
// 🧬 DEVELOPER DNA (SCALABLE)
// ===============================
const getDNA = (skills) => {
  const sorted = Object.entries(skills).sort((a, b) => b[1] - a[1]);
  const top = sorted[0]?.[0];

  if (!top) return "Generalist Developer";

  if (["JavaScript", "TypeScript"].includes(top))
    return "Frontend / Fullstack Developer";

  if (["Python"].includes(top))
    return "Data / Machine Learning Developer";

  if (["Java", "Go", "Node"].includes(top))
    return "Backend / System Developer";

  if (["C++", "C"].includes(top))
    return "Competitive Programmer / Systems Developer";

  return "Generalist Developer";
};

// ===============================
// 📊 REPO QUALITY SCORE
// ===============================
const getRepoQualityScore = (repos) => {
  if (repos.length === 0) return 0;

  let score = 0;

  repos.forEach((repo) => {
    let repoScore = 0;

    if (repo.stargazers_count > 0) repoScore += 2;
    if (repo.forks_count > 0) repoScore += 1;
    if (repo.description) repoScore += 1;
    if (!repo.fork) repoScore += 1; // original work

    score += repoScore;
  });

  return score / repos.length;
};

// ===============================
// ⚖️ BENCHMARK CALCULATOR (KEY AI-LIKE PART)
// ===============================
const getBenchmarks = (usersData) => {
  const totalUsers = usersData.length;

  const totalFollowers = usersData.reduce(
    (sum, u) => sum + u.user.followers,
    0
  );

  const totalRepos = usersData.reduce(
    (sum, u) => sum + u.repos.length,
    0
  );

  const totalStars = usersData.reduce(
    (sum, u) => sum + sum(u.repos, "stargazers_count"),
    0
  );

  return {
    avgFollowers: totalFollowers / totalUsers || 0,
    avgRepos: totalRepos / totalUsers || 0,
    avgStars: totalStars / totalUsers || 0,
  };
};

// ===============================
// ⚠️ SMART WEAKNESS DETECTOR (RELATIVE)
// ===============================
const getWeakness = (user, repos, benchmarks) => {
  const totalStars = sum(repos, "stargazers_count");

  if (repos.length < benchmarks.avgRepos * 0.5) {
    return "Below average project count. Build more real-world applications.";
  }

  if (totalStars < benchmarks.avgStars * 0.5) {
    return "Projects lack visibility. Improve README, deployment, and sharing.";
  }

  if (user.followers < benchmarks.avgFollowers * 0.5) {
    return "Low community presence. Contribute to open source and network more.";
  }

  return "No major weaknesses detected. Consistent performer.";
};

// ===============================
// 📈 SMART INSIGHTS ENGINE (DATA-DRIVEN)
// ===============================
const getInsights = (user, repos, skills, benchmarks) => {
  const insights = [];

  const totalStars = sum(repos, "stargazers_count");

  if (user.followers > benchmarks.avgFollowers) {
    insights.push("🔥 Above average community presence");
  }

  if (repos.length > benchmarks.avgRepos) {
    insights.push("🚀 Highly active project builder");
  }

  if (totalStars > benchmarks.avgStars) {
    insights.push("⭐ Projects gaining strong traction");
  }

  if (Object.keys(skills).length >= 4) {
    insights.push("🧠 Versatile tech stack");
  }

  if (repos.some((r) => r.forks_count > 20)) {
    insights.push("🍴 Strong collaboration and open-source impact");
  }

  return insights;
};

// ===============================
// 🔥 FINAL DEV SCORE (NORMALIZED)
// ===============================
const getDevScore = (user, repos, benchmarks) => {
  const totalStars = sum(repos, "stargazers_count");

  const maxFollowers = Math.max(user.followers, benchmarks.avgFollowers);
  const maxRepos = Math.max(repos.length, benchmarks.avgRepos);
  const maxStars = Math.max(totalStars, benchmarks.avgStars);

  const influence = normalize(user.followers, maxFollowers) * 40;
  const activity = normalize(repos.length, maxRepos) * 30;
  const repoQuality = getRepoQualityScore(repos);
  const maxQuality = Math.max(repoQuality, 5);

  const quality = normalize(repoQuality, maxQuality) * 30;
  return {
    total: Math.round(influence + activity + quality),
    influence: Math.round(influence),
    activity: Math.round(activity),
    quality: Math.round(quality),
  };
};

// ===============================
// 🏆 DEVELOPER TYPE CLASSIFIER
// ===============================
const getDevType = (score) => {
  if (score > 75) return "Open Source Leader";
  if (score > 50) return "Consistent Builder";
  if (score > 25) return "Growing Developer";
  return "Beginner Developer";
};

// ===============================
// 🎯 EXPORTS
// ===============================
module.exports = {
  getSkills,
  getTopLanguage,
  getDNA,
  getRepoQualityScore,
  getBenchmarks,
  getWeakness,
  getInsights,
  getDevScore,
  getDevType,
};