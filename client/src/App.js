import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Login from "./Login";
import Signup from "./Signup";

import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Compare from "./pages/Compare";

function App() {
  const [data, setData] = useState(null);
  const [user, setUser] = useState(null);
  const [searchUser, setSearchUser] = useState("");
  const [activeUser, setActiveUser] = useState(null);
  const [isSignup, setIsSignup] = useState(false);

  // 🧠 NEW STATE
  const [analysis, setAnalysis] = useState(null);

  const navigate = useNavigate();

  const extractUsername = (input) => {
    if (input.includes("github.com")) {
      const parts = input.split("/");
      return parts[parts.length - 1] || parts[parts.length - 2];
    }
    return input;
  };

  // 🔥 FETCH GITHUB DATA
  useEffect(() => {
    if (activeUser) {
      axios
        .get(`http://127.0.0.1:5000/github/${activeUser}`)
        .then((res) => setData(res.data))
        .catch((err) => console.log(err));

      // 🔥 FETCH ANALYSIS ALSO
      axios
        .get(`http://127.0.0.1:5000/analyze/${activeUser}`)
        .then((res) => setAnalysis(res.data))
        .catch((err) => console.log(err));
    }
  }, [activeUser]);

  useEffect(() => {
    if (user) setActiveUser(user);
  }, [user]);

  if (!user) {
    return isSignup ? (
      <Signup setIsSignup={setIsSignup} />
    ) : (
      <Login setUser={setUser} setIsSignup={setIsSignup} />
    );
  }

  const getSkills = () => {
    if (!data || !data.repos) return [];

    const map = {};
    data.repos.forEach((r) => {
      if (r.language) map[r.language] = (map[r.language] || 0) + 1;
    });

    const total = Object.values(map).reduce((a, b) => a + b, 0);

    return Object.keys(map)
      .map((k) => ({
        name: k,
        percent: ((map[k] / total) * 100).toFixed(1),
      }))
      .sort((a, b) => b.percent - a.percent);
  };

  return (
    <div style={styles.container}>
      
      {/* HEADER */}
      <div style={styles.header}>
        <h1>DevTrack 🚀</h1>

        <div style={styles.headerButtons}>
          <button onClick={() => navigate("/compare")} style={styles.compareBtn}>
            Compare ⚔️
          </button>

          <button onClick={() => setUser(null)} style={styles.logout}>
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
            setActiveUser(username);
          }}
          style={styles.searchBtn}
        >
          Search
        </button>
      </div>

      {data && (
        <>
          {/* PROFILE */}
          <div style={styles.profile}>
            <img src={data.user.avatar_url} style={styles.avatar} alt="" />
            <div>
              <h2 style={{ fontSize: "28px" }}>
                {data.user.name || data.user.login}
              </h2>
              <p style={{ color: "#94a3b8" }}>@{data.user.login}</p>
            </div>
          </div>

          {/* CARDS */}
          <div style={styles.cardContainer}>
            <div style={styles.card}>
              <h3>Followers</h3>
              <p>{data.user.followers}</p>
            </div>
            <div style={styles.card}>
              <h3>Repos</h3>
              <p>{data.user.public_repos}</p>
            </div>
            <div style={styles.card}>
              <h3>Following</h3>
              <p>{data.user.following}</p>
            </div>
          </div>

          {/* 🧠 AI SECTION (🔥 NEW FEATURE) */}
          {analysis && (
            <div style={styles.aiSection}>
              <div style={styles.dnaCard}>
                <h3>🧠 Developer DNA</h3>
                <p>{analysis.dna}</p>
              </div>

              <div style={styles.weakness}>
                <h3>⚠️ Weakness</h3>
                <p>{analysis.weakness}</p>
              </div>

              <div style={styles.smartInsights}>
                <h3>📈 Smart Insights</h3>
                {analysis.insights.map((i, idx) => (
                  <p key={idx}>{i}</p>
                ))}
              </div>
            </div>
          )}

          {/* CHART */}
          <div style={styles.chart}>
            <div style={{
              display: "flex",
              justifyContent: "center",
              gap: "20px",
              marginBottom: "10px"
            }}>
              <span style={{ color: "#f59e0b" }}>■ forks_count</span>
              <span style={{ color: "#00adb5" }}>■ stargazers_count</span>
            </div>

            <h2>Repositories Overview 📊</h2>

            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={[...data.repos]
                  .sort((a, b) => b.stargazers_count - a.stargazers_count)
                  .slice(0, 4)}
                margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
              >
                <XAxis
                  dataKey="name"
                  stroke="#fff"
                  angle={-20}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis stroke="#fff" />
                <Tooltip />

                <Bar dataKey="stargazers_count" fill="#00adb5" />
                <Bar dataKey="forks_count" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* SKILLS */}
          <div style={{ marginTop: "40px" }}>
            <h2>Top Skills 💻</h2>

            {getSkills().slice(0, 5).map((s, i) => (
              <div key={i} style={styles.skillItem}>
                <span>{s.name}</span>
                <span>{s.percent}%</span>
              </div>
            ))}
          </div>

          {/* REPOS */}
          <div style={styles.repoList}>
            <h2>All Repositories 📂</h2>

            {data.repos.slice(0, 10).map((repo) => (
              <div key={repo.id} style={styles.repoCard}>
                <div style={styles.repoTop}>
                  <h4>{repo.name}</h4>
                  <a href={repo.html_url} target="_blank" rel="noreferrer" style={styles.link}>
                    View →
                  </a>
                </div>

                <p style={styles.repoMeta}>
                  {repo.language || "No language"} • Updated:{" "}
                  {new Date(repo.updated_at).toLocaleDateString()}
                </p>
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

export default AppWrapper;

const styles = {
  container: {
    background: "#0f172a",
    minHeight: "100vh",
    color: "white",
    padding: "20px",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerButtons: {
    display: "flex",
    gap: "10px",
  },

  logout: {
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: "6px",
  },

  compareBtn: {
    background: "#22c55e",
    color: "white",
    border: "none",
    padding: "8px 12px",
    borderRadius: "6px",
  },

  searchContainer: {
    display: "flex",
    gap: "10px",
    marginTop: "20px",
  },

  input: {
    padding: "10px",
    borderRadius: "6px",
  },

  searchBtn: {
    background: "#00adb5",
    border: "none",
    color: "white",
    padding: "10px",
    borderRadius: "6px",
  },

  profile: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginTop: "30px",
  },

  avatar: {
    width: "110px",
    borderRadius: "50%",
  },

  cardContainer: {
    display: "flex",
    gap: "20px",
    marginTop: "20px",
  },

  card: {
    background: "#1e293b",
    padding: "20px",
    borderRadius: "10px",
    width: "150px",
    textAlign: "center",
  },

  // 🔥 AI SECTION
  aiSection: {
    marginTop: "30px",
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
  },

  dnaCard: {
    background: "#1e293b",
    padding: "20px",
    borderRadius: "12px",
    color: "#00adb5",
    textAlign: "center",
  },

  weakness: {
    background: "#1e293b",
    padding: "20px",
    borderRadius: "12px",
    color: "#f87171",
    textAlign: "center",
  },

  smartInsights: {
    background: "#1e293b",
    padding: "20px",
    borderRadius: "12px",
    color: "#facc15",
    textAlign: "center",
  },

  chart: {
    marginTop: "40px",
    background: "#1e293b",
    padding: "20px",
    borderRadius: "12px",
  },

  repoList: {
    marginTop: "40px",
  },

  repoCard: {
    background: "#1e293b",
    padding: "15px",
    marginTop: "12px",
    borderRadius: "10px",
  },

  repoTop: {
    display: "flex",
    justifyContent: "space-between",
  },

  repoMeta: {
    color: "#94a3b8",
    marginTop: "5px",
  },

  link: {
    color: "#38bdf8",
  },

  skillItem: {
    display: "flex",
    justifyContent: "space-between",
    background: "#1e293b",
    padding: "10px",
    borderRadius: "8px",
    marginTop: "10px",
    width: "300px",
  },
};