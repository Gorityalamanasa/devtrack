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
import Login from "../Login";
import Signup from "../Signup";

import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";


// 🔥 DEPLOYED BACKEND
const BASE_URL = "https://devtrack-backend-xmag.onrender.com";

function App() {
  const [data, setData] = useState(null);
  const [user, setUser] = useState(localStorage.getItem("user"));
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [searchUser, setSearchUser] = useState("");
  const [activeUser, setActiveUser] = useState(null);
  const [isSignup, setIsSignup] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false); // 🔥 NEW

  const navigate = useNavigate();

  const extractUsername = (input) => {
    if (input.includes("github.com")) {
      const parts = input.split("/");
      return parts[parts.length - 1] || parts[parts.length - 2];
    }
    return input;
  };

  // 🔥 FETCH DATA (FIXED)
  useEffect(() => {
    if (activeUser) {
      setLoading(true);

      axios
        .get(`${BASE_URL}/github/${activeUser}`)
        .then((res) => setData(res.data))
        .catch((err) => {
          console.error(err);
          alert("Error fetching GitHub data (check username or rate limit)");
        });

      axios
        .get(`${BASE_URL}/analyze/${activeUser}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => setAnalysis(res.data))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [activeUser, token]);

  useEffect(() => {
    if (user) setActiveUser(user);
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.clear();
  };

  if (!user) {
    return isSignup ? (
      <Signup setIsSignup={setIsSignup} setUser={setUser} setToken={setToken} />
    ) : (
      <Login setUser={setUser} setToken={setToken} setIsSignup={setIsSignup} />
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

        <div>
          <button onClick={() => navigate("/compare")} style={styles.btn}>
            Compare ⚔️
          </button>
          <button onClick={handleLogout} style={styles.logout}>
            Logout
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div style={styles.searchBox}>
        <input
          placeholder="Enter GitHub username"
          value={searchUser}
          onChange={(e) => setSearchUser(e.target.value)}
          style={styles.input}
        />
        <button
          style={styles.btn}
          onClick={() => setActiveUser(extractUsername(searchUser))}
        >
          Search
        </button>
      </div>

      {/* 🔥 LOADING */}
      {loading && <p>Loading data...</p>}

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

          {/* CARDS */}
          <div style={styles.cards}>
            <div style={styles.card}>Followers: {data.user.followers}</div>
            <div style={styles.card}>Repos: {data.user.public_repos}</div>
            <div style={styles.card}>Following: {data.user.following}</div>
          </div>

          {/* AI */}
          {analysis && (
            <div style={styles.aiBox}>
              <div style={styles.card}>
                <h3>🧠 DNA</h3>
                <p>{analysis.dna}</p>
              </div>

              <div style={styles.card}>
                <h3>⚠️ Weakness</h3>
                <p>{analysis.weakness}</p>
              </div>

              <div style={styles.card}>
                <h3>📈 Insights</h3>
                {analysis.insights.map((i, idx) => (
                  <p key={idx}>{i}</p>
                ))}
              </div>
            </div>
          )}

          {/* CHART */}
          <div style={styles.chart}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.repos.slice(0, 5)}>
                <XAxis dataKey="name" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip />
                <Bar dataKey="stargazers_count" fill="#00adb5" />
                <Bar dataKey="forks_count" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* SKILLS */}
          <h2>Top Skills</h2>
          {getSkills().map((s, i) => (
            <div key={i} style={styles.skill}>
              {s.name} — {s.percent}%
            </div>
          ))}
        </>
      )}
    </div>
  );
}

/* 🔥 STYLES */
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
    marginBottom: "20px",
  },
  input: {
    padding: "10px",
    borderRadius: "6px",
    marginRight: "10px",
  },
  btn: {
    padding: "10px",
    background: "#00adb5",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginRight: "10px",
  },
  logout: {
    padding: "10px",
    background: "#ef4444",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  profile: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  avatar: {
    width: "80px",
    borderRadius: "50%",
  },
  cards: {
    display: "flex",
    gap: "20px",
    marginTop: "20px",
  },
  card: {
    background: "#1e293b",
    padding: "15px",
    borderRadius: "10px",
  },
  aiBox: {
    display: "flex",
    gap: "20px",
    marginTop: "20px",
  },
  chart: {
    marginTop: "30px",
  },
  skill: {
    marginTop: "10px",
  },
};

function AppWrapper() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default AppWrapper;