// 🔥 SKILL EXTRACTION
const getSkills = (repos) => {
  const map = {};

  repos.forEach((repo) => {
    if (repo.language) {
      map[repo.language] = (map[repo.language] || 0) + 1;
    }
  });

  return map;
};

// 🔥 TOP LANGUAGE
const getTopLanguage = (skills) => {
  let max = 0;
  let top = "Unknown";

  for (let lang in skills) {
    if (skills[lang] > max) {
      max = skills[lang];
      top = lang;
    }
  }

  return top;
};

// 🧬 DEVELOPER DNA PROFILE
const getDNA = (skills) => {
  const js = skills["JavaScript"] || 0;
  const python = skills["Python"] || 0;
  const java = skills["Java"] || 0;
  const cpp = skills["C++"] || 0;

  if (js > python && js > java)
    return "Frontend / Fullstack Developer";

  if (python > js && python > java)
    return "Data / Machine Learning Developer";

  if (java > js)
    return "Backend / System Developer";

  if (cpp > js)
    return "Competitive Programmer / Systems Developer";

  return "Generalist Developer";
};

// ⚠️ WEAKNESS DETECTOR
const getWeakness = (user, repos) => {
  const totalStars = repos.reduce(
    (sum, repo) => sum + repo.stargazers_count,
    0
  );

  if (user.public_repos < 5) {
    return "You have very few projects. Try building more real-world applications.";
  }

  if (totalStars < 10) {
    return "Your projects lack visibility. Improve README, documentation, and deployment.";
  }

  if (user.followers < 5) {
    return "Low community presence. Contribute to open source and engage more.";
  }

  return "No major weaknesses detected. Keep growing!";
};

// 📈 SMART INSIGHTS ENGINE
const getInsights = (user, repos, skills) => {
  const insights = [];

  if (user.followers > 100) {
    insights.push("🔥 Strong community presence");
  }

  if (repos.length > 10) {
    insights.push("🚀 Active project builder");
  }

  if (skills["JavaScript"]) {
    insights.push("💻 Strong in JavaScript ecosystem");
  }

  if (repos.some((r) => r.stargazers_count > 50)) {
    insights.push("⭐ Some projects are gaining good attention");
  }

  if (repos.some((r) => r.fork_count > 20)) {
    insights.push("🍴 Projects are being forked — good collaboration signal");
  }

  return insights;
};

module.exports = {
  getSkills,
  getTopLanguage,
  getDNA,
  getWeakness,
  getInsights,
};