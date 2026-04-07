import React, { useState } from "react";
import axios from "axios";
import { extractUsername } from "../utils/extractUsername";
import { useNavigate } from "react-router-dom";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const BASE_URL = "https://devtrack-backend-xmag.onrender.com";
//const BASE_URL = "http://localhost:5000";

function Compare() {
  const [input, setInput] = useState("");
  const [data, setData] = useState([]);
  const [insight, setInsight] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const goDashboard = () => {
    navigate("/");
  };

  const handleCompare = async () => {
    const users = input
      .split(",")
      .map((u) => extractUsername(u.trim()))
      .filter((u) => u);

    if (users.length < 2) {
      alert("Enter at least 2 usernames");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${BASE_URL}/compare`, { users });

      setData(res.data.leaderboard);
      setInsight(res.data.insight);
    } catch (err) {
      console.error(err);
      alert("Error comparing users");
    } finally {
      setLoading(false);
    }
  };

  const scoreChart = data.map((u) => ({
    name: u.username,
    score: Math.round(u.score),
  }));

  const skillChart = Object.keys(data[0]?.skills || {}).map((lang) => {
    const obj = { language: lang };

    data.forEach((u) => {
      obj[u.username] = u.skills[lang] || 0;
    });

    return obj;
  });

  const colors = [
    "#22c55e",
    "#3b82f6",
    "#f59e0b",
    "#ef4444",
    "#a855f7",
    "#14b8a6",
  ];

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <h1>🔥 Developer Battle Arena</h1>

        <div style={styles.headerButtons}>
          <button onClick={goDashboard} style={styles.dashboardBtn}>
            🏠 Dashboard
          </button>

          <button onClick={handleLogout} style={styles.logout}>
            Logout
          </button>
        </div>
      </div>

      {/* INPUT + CLEAR BUTTON */}
      <div style={styles.inputBox}>
        <div style={styles.inputWrapper}>
          <input
            placeholder="Enter usernames or GitHub URLs (comma separated)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={styles.input}
          />

          {input && (
            <button onClick={() => setInput("")} style={styles.clearBtn}>
              ✕
            </button>
          )}
        </div>

        <button onClick={handleCompare} style={styles.btn}>
          Compare 🚀
        </button>
      </div>

      {loading && <p>Loading...</p>}

      {data.length > 0 && (
        <>
          {/* SCORE CHART */}
          <h2>📊 Score Comparison</h2>
          <div style={styles.chartWrapper}>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreChart}>
                  <XAxis dataKey="name" stroke="#fff" />
                  <YAxis stroke="#fff" />
                  <Tooltip />
                  <Bar dataKey="score" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* LEADERBOARD */}
          <h2>🏆 Leaderboard</h2>

          <div style={styles.cardGrid}>
            {data.map((u, i) => (
              <div key={i} style={styles.card}>
                <h3>
                  #{i + 1} {u.username}
                </h3>

                <p>🔥 Score: {Math.round(u.score)}</p>

                <div style={styles.breakdown}>
                  <p>
                    Influence: {u.breakdown.influence?.toFixed(1) || 0}
                  </p>
                  <p>
                    Quality: {u.breakdown.quality?.toFixed(1) || 0}
                  </p>
                  <p>
                    Activity: {u.breakdown.activity?.toFixed(1) || 0}
                  </p>
                </div>

                <p style={styles.type}>Type: {u.type}</p>
                <p style={styles.hiring}>💼 {u.hiringFit}</p>
              </div>
            ))}
          </div>

          {/* SKILL COMPARISON */}
          <h2>💻 Skill Comparison</h2>
          <div style={styles.chartWrapper}>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillChart}>
                  <XAxis dataKey="language" stroke="#fff" />
                  <YAxis stroke="#fff" />
                  <Tooltip />

                  {data.map((u, idx) => (
                    <Bar
                      key={idx}
                      dataKey={u.username}
                      fill={colors[idx % colors.length]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI INSIGHT */}
          <div style={styles.insight}>
            <h3>🧠 AI Insight</h3>
            <p>{insight}</p>
          </div>
        </>
      )}
    </div>
  );
}

/* STYLES */
const styles = {
  container: {
    background: "#0f172a",
    color: "white",
    minHeight: "100vh",
    padding: "20px",
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

  headerButtons: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  dashboardBtn: {
    background: "#22c55e",
    padding: "10px",
    border: "none",
    borderRadius: "6px",
    color: "white",
    cursor: "pointer",
  },

  logout: {
    background: "#ef4444",
    padding: "10px",
    border: "none",
    borderRadius: "6px",
    color: "white",
    cursor: "pointer",
  },

  inputBox: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },

  inputWrapper: {
    position: "relative",
    flex: "1",
    display: "flex",
    alignItems: "center",
  },

 input: {
  padding: "12px 40px 12px 12px",
  flex: "1",            // ✅ THIS FIXES EVERYTHING
  minWidth: "0",        // ✅ keep this
  borderRadius: "8px",
},

  clearBtn: {
    position: "absolute",
    right: "10px",
    background: "transparent",
    border: "none",
    color: "#94a3b8",
    fontSize: "16px",
    cursor: "pointer",
  },

  btn: {
    padding: "10px",
    background: "#22c55e",
    border: "none",
    color: "white",
    borderRadius: "6px",
    cursor: "pointer",
  },

  cardGrid: {
    display: "flex",
    gap: "15px",
    flexWrap: "wrap",
    width: "100%",
  },

  card: {
    background: "#1e293b",
    padding: "15px",
    marginTop: "15px",
    borderRadius: "10px",
    flex: "1 1 250px",
    maxWidth: "100%",
  },

  breakdown: {
    fontSize: "13px",
    color: "#94a3b8",
    marginTop: "5px",
  },

  type: {
    marginTop: "10px",
    color: "#38bdf8",
  },

  hiring: {
    marginTop: "5px",
    color: "#22c55e",
    fontWeight: "bold",
  },

  insight: {
    marginTop: "30px",
    background: "#1e293b",
    padding: "20px",
    borderRadius: "10px",
  },

  chartWrapper: {
    width: "100%",
    overflowX: "auto",
  },
};

export default Compare;