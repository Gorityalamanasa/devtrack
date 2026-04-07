import React, { useEffect, useState } from "react";
import axios from "axios";
import { extractUsername } from "./utils/extractUsername";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

import Login from "./Login";
import Signup from "./Signup";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Compare from "./pages/Compare";

const BASE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:5000"
    : "https://devtrack-backend-xmag.onrender.com";

function App() {
  const [data, setData] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  const [user, setUser] = useState(localStorage.getItem("user"));
  const [token, setToken] = useState(localStorage.getItem("token"));

  const [searchUser, setSearchUser] = useState("");
  const [activeUser, setActiveUser] = useState(null);
  const [isSignup, setIsSignup] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    if (!activeUser) return;

    setLoading(true);
    setError("");

    axios
      .get(`${BASE_URL}/github/${activeUser}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      })
      .then((res) => setData(res.data))
      .catch(() => setError("❌ GitHub fetch failed"));

    axios
      .get(`${BASE_URL}/analyze/${activeUser}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      })
      .then((res) => setAnalysis(res.data))
      .catch(() => setError("❌ Analysis failed"))
      .finally(() => setLoading(false));
  }, [activeUser, token]);

  useEffect(() => {
    if (user) setActiveUser(user);
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.clear();
  };

  const isActiveRepo = (repo) => {
    const days =
      (Date.now() - new Date(repo.pushed_at)) /
      (1000 * 60 * 60 * 24);
    return days < 30;
  };

  const getSkills = () => {
    if (!data?.repos) return [];
    const map = {};
    data.repos.forEach((r) => {
      if (r.language) map[r.language] = (map[r.language] || 0) + 1;
    });

    const total = Object.values(map).reduce((a, b) => a + b, 0);

    return Object.keys(map).map((k) => ({
      name: k,
      percent: ((map[k] / total) * 100).toFixed(1),
    }));
  };

  const getTopRepos = () => {
    if (!data?.repos) return [];

    return data.repos
      .map((repo) => {
        const stars = repo.stargazers_count || 0;
        const forks = repo.forks_count || 0;
        const watchers = repo.watchers_count || 0;

        const daysAgo =
          (Date.now() - new Date(repo.pushed_at)) /
          (1000 * 60 * 60 * 24);

        const activityScore = daysAgo < 30 ? 10 : daysAgo < 90 ? 5 : 0;
        const sizeScore = repo.size > 500 ? 5 : 2;

        const score =
          stars * 0.4 +
          forks * 0.3 +
          watchers * 0.1 +
          activityScore +
          sizeScore;

        return { ...repo, score: Math.round(score) };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  };

  const getRepoInsight = (repos) => {
    if (!repos?.length) return "";

    const active = repos.filter(
      (r) =>
        new Date(r.pushed_at) >
        Date.now() - 1000 * 60 * 60 * 24 * 30
    ).length;

    if (active > 3) return "🚀 Highly active developer";
    if (active > 0) return "⚡ Moderately active developer";
    return "🐢 Low recent activity";
  };

  const getRepoType = (repo) => {
    if (repo.stargazers_count > 20) return "🚀 Popular";
    if (repo.forks_count > 5) return "🔁 Collaborative";
    if (repo.size > 500) return "🧠 Complex";
    return "📘 Learning";
  };

  if (!user) {
    return isSignup ? (
      <Signup setIsSignup={setIsSignup} setUser={setUser} setToken={setToken} />
    ) : (
      <Login setUser={setUser} setToken={setToken} setIsSignup={setIsSignup} />
    );
  }

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <h1>🚀 DevTrack</h1>

        <div style={styles.headerButtons}>
          <button onClick={() => navigate("/compare")} style={styles.compareBtn}>
            Compare ⚔️
          </button>
          <button onClick={handleLogout} style={styles.logout}>
            Logout
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div style={styles.searchContainer}>
        <input
          placeholder="Enter GitHub username or URL"
          value={searchUser}
          onChange={(e) => setSearchUser(e.target.value)}
          style={styles.input}
        />
        <button
          onClick={() => {
            const username = extractUsername(searchUser.trim());
            if (!username) return setError("❌ Invalid input");
            setActiveUser(username);
          }}
          style={styles.searchBtn}
        >
          Search
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading && <p>Loading...</p>}

      {data && (
        <>
          {/* PROFILE */}
          <div style={styles.profile}>
            <img src={data.user.avatar_url} style={styles.avatar} alt="" />
            <div>
              <h2>{data.user.name || data.user.login}</h2>
              <p>@{data.user.login}</p>
            </div>
          </div>

          {/* STATS */}
          <div style={styles.row}>
            <div style={styles.card}><h3>Followers</h3><p>{data.user.followers}</p></div>
            <div style={styles.card}><h3>Repos</h3><p>{data.user.public_repos}</p></div>
            <div style={styles.card}><h3>Following</h3><p>{data.user.following}</p></div>
          </div>

          {/* ANALYSIS */}
          {analysis && (
            <>
              <div style={styles.row}>
                <div style={styles.card}>
                  <h3>🧠 Developer DNA</h3>
                  <p>{analysis.dna}</p>
                </div>

                <div style={styles.card}>
                  <h3>⚠️ Weakness</h3>
                  <p>{analysis.weakness}</p>
                </div>

                <div style={styles.card}>
                  <h3>📊 Insights</h3>

                  {analysis.insights?.length > 0 ? (
                    analysis.insights.map((i, idx) => (
                      <p key={idx} style={{ color: "#22c55e" }}>
                        ⚡ {i}
                      </p>
                    ))
                  ) : (
                    <p style={{ color: "#94a3b8" }}>
                      ⚡ Not enough data
                    </p>
                  )}
                </div>
              </div>

              <div style={styles.bigScore}>
                <h2>🔥 Dev Score</h2>
                <h1>{analysis?.score?.total || 0} / 100</h1>

                <div style={styles.scoreBreak}>
                  <p>🔥 Influence: {analysis?.score?.influence || 0}</p>
                  <p>📊 Activity: {analysis?.score?.activity || 0}</p>
                  <p>⭐ Quality: {analysis?.score?.quality || 0}</p>
                </div>
              </div>

              {/* ✅ FIXED TIMELINE SCROLL */}
              <div style={styles.section}>
                <h2>📈 Growth Timeline</h2>

                <div style={{ overflowX: isMobile ? "auto" : "hidden" }}>
                  <div style={{ width: isMobile ? "600px" : "100%" }}>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={analysis?.timeline?.repoGrowth}>
                        <XAxis dataKey="month" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip />
                        <Line type="monotone" dataKey="count" stroke="#22c55e" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* REPO OVERVIEW */}
          <div style={styles.section}>
            <h2>Repositories Overview 📊</h2>

            <div style={{ overflowX: isMobile ? "auto" : "hidden" }}>
              <div style={{ width: isMobile ? "700px" : "100%" }}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getTopRepos()}>
                    <XAxis dataKey="name" stroke="#fff" />
                    <YAxis stroke="#fff" />
                    <Tooltip />
                    <Bar dataKey="stargazers_count" fill="#00adb5" />
                    <Bar dataKey="forks_count" fill="#f59e0b" />
                    <Bar dataKey="score" fill="#22c55e" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <p style={{ marginTop: "10px", color: "#22c55e" }}>
              {getRepoInsight(data.repos)}
            </p>
          </div>

          {/* ✅ FIXED REPO CLICK */}
          <div style={styles.section}>
            <h2>Top Repositories 🚀</h2>

            <div style={styles.repoGrid}>
              {getTopRepos().map((repo) => (
                <div
                  key={repo.id}
                  style={{
                    background: "#1e293b",
                    padding: "15px",
                    borderRadius: "12px",
                    flex: "1 1 200px",
                  }}
                >
                  <h4>
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#60a5fa",
                        textDecoration: "underline",
                      }}
                    >
                      {repo.name}
                    </a>
                  </h4>

                  <p>⭐ {repo.stargazers_count} | 🍴 {repo.forks_count}</p>
                  <p style={{ color: "#22c55e" }}>Score: {repo.score}</p>

                  <p style={{ color: isActiveRepo(repo) ? "#22c55e" : "#f87171" }}>
                    {isActiveRepo(repo) ? "🟢 Active" : "🔴 Inactive"}
                  </p>

                  <p>{getRepoType(repo)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* SKILLS */}
          <div style={styles.section}>
            <h2>Top Skills 💻</h2>
            {getSkills().map((s, i) => (
              <div key={i} style={styles.skillRow}>
                <span>{s.name}</span>
                <span>{s.percent}%</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function AppWrapper() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/compare" element={<Compare />} />
      </Routes>
    </BrowserRouter>
  );
}

const styles = {
  container: {
    background: "#0f172a",
    color: "white",
    padding: "20px",
    minHeight: "100vh",
    maxWidth: "100vw",
    overflowX: "hidden",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
  },
  headerButtons: { display: "flex", gap: "10px", flexWrap: "wrap" },
  compareBtn: { background: "#22c55e", padding: "10px", border: "none", borderRadius: "6px", color: "white" },
  logout: { background: "#ef4444", padding: "10px", border: "none", borderRadius: "6px", color: "white" },
  searchContainer: { display: "flex", gap: "10px", margin: "20px 0", flexWrap: "wrap" },
  input: { padding: "10px", flex: "1", borderRadius: "6px", minWidth: "0" },
  searchBtn: { background: "#00adb5", padding: "10px", border: "none", borderRadius: "6px", color: "white" },
  profile: { display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap" },
  avatar: { width: "80px", borderRadius: "50%" },
  row: { display: "flex", gap: "20px", marginTop: "20px", flexWrap: "wrap" },
  card: {
    background: "#1e293b",
    padding: "20px",
    borderRadius: "12px",
    flex: "1 1 250px",
    maxWidth: "100%",
  },
  bigScore: { background: "#1e293b", padding: "30px", borderRadius: "12px", textAlign: "center", marginTop: "30px" },
  scoreBreak: { display: "flex", justifyContent: "space-around", marginTop: "15px", flexWrap: "wrap" },
  section: { marginTop: "30px", background: "#1e293b", padding: "20px", borderRadius: "12px" },
  skillRow: { display: "flex", justifyContent: "space-between", marginTop: "10px", flexWrap: "wrap" },
  repoGrid: { display: "flex", gap: "15px", flexWrap: "wrap", width: "100%" },
};

export default AppWrapper;