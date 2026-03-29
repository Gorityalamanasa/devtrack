import React, { useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const BASE_URL = "https://devtrack-backend-xmag.onrender.com";

function Compare() {
  const [input, setInput] = useState("");
  const [data, setData] = useState([]);
  const [insight, setInsight] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCompare = async () => {
    const users = input
      .split(",")
      .map((u) => u.trim())
      .filter(Boolean);

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

  // 🔥 SCORE CHART
  const scoreChart = data.map((u) => ({
    name: u.username,
    score: Math.round(u.score),
  }));

  // 🔥 SKILL CHART (top 3 users)
  const skillChart = Object.keys(data[0]?.skills || {}).map((lang) => {
    const obj = { language: lang };
    data.slice(0, 3).forEach((u) => {
      obj[u.username] = u.skills[lang] || 0;
    });
    return obj;
  });

  return (
    <div style={styles.container}>
      <h1>🔥 Developer Battle Arena</h1>

      {/* INPUT */}
      <div style={styles.inputBox}>
        <input
          placeholder="Enter usernames (comma separated)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={styles.input}
        />

        <button onClick={handleCompare} style={styles.btn}>
          Compare 🚀
        </button>
      </div>

      {loading && <p>Loading...</p>}

      {data.length > 0 && (
        <>
          {/* 📊 SCORE CHART */}
          <h2>📊 Score Comparison</h2>
          <div style={{ height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={scoreChart}>
                <XAxis dataKey="name" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip />
                <Bar dataKey="score" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 🏆 LEADERBOARD */}
          <h2>🏆 Leaderboard</h2>

          {data.map((u, i) => (
            <div key={i} style={styles.card}>
              <h3>
                #{i + 1} {u.username}
              </h3>

              <p>🔥 Score: {Math.round(u.score)}</p>

              {/* 🔥 BREAKDOWN */}
              <div style={styles.breakdown}>
                <p>
                  Followers Score:{" "}
                  {u.breakdown.followersScore.toFixed(1)}
                </p>
                <p>
                  Repo Quality:{" "}
                  {u.breakdown.repoQuality.toFixed(1)}
                </p>
                <p>Activity Score: {u.breakdown.activity}</p>
              </div>

              {/* 👨‍💻 TYPE */}
              <p style={styles.type}>Type: {u.type}</p>

              {/* 🎯 HIRING */}
              <p style={styles.hiring}>💼 {u.hiringFit}</p>
            </div>
          ))}

          {/* 💻 SKILL COMPARISON */}
          <h2>💻 Skill Comparison</h2>
          <div style={{ height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={skillChart}>
                <XAxis dataKey="language" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip />
                {data.slice(0, 3).map((u, idx) => (
                  <Bar
                    key={idx}
                    dataKey={u.username}
                    fill={
                      ["#22c55e", "#3b82f6", "#f59e0b"][idx]
                    }
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 🧠 AI INSIGHT */}
          <div style={styles.insight}>
            <h3>🧠 AI Insight</h3>
            <p>{insight}</p>
          </div>
        </>
      )}
    </div>
  );
}

/* 🔥 STYLES */
const styles = {
  container: {
    background: "#0f172a",
    color: "white",
    minHeight: "100vh",
    padding: "20px",
  },

  inputBox: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
  },

  input: {
    padding: "10px",
    width: "400px",
    borderRadius: "6px",
    border: "none",
  },

  btn: {
    padding: "10px",
    background: "#22c55e",
    border: "none",
    color: "white",
    borderRadius: "6px",
    cursor: "pointer",
  },

  card: {
    background: "#1e293b",
    padding: "15px",
    marginTop: "15px",
    borderRadius: "10px",
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
};

export default Compare;