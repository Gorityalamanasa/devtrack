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

  const handleCompare = async () => {
    const users = input.split(",").map((u) => u.trim());

    const res = await axios.post(`${BASE_URL}/compare`, { users });
    setData(res.data.leaderboard);
  };

  // 🔥 Score Chart
  const scoreChart = data.map((u) => ({
    name: u.username,
    score: Math.round(u.score),
  }));

  // 🔥 Skill Chart (top 3 users only)
  const skillChart = Object.keys(data[0]?.skills || {}).map((lang) => {
    const obj = { language: lang };
    data.slice(0, 3).forEach((u) => {
      obj[u.username] = u.skills[lang] || 0;
    });
    return obj;
  });

  // 🔥 AI Insight
  const getInsight = () => {
    if (!data.length) return "";

    const top = data[0];
    const second = data[1];

    let msg = `🏆 ${top.username} leads because:\n`;

    if (top.followers > second.followers)
      msg += "• Strong community (followers)\n";

    if (top.breakdown.totalStars > second.breakdown.totalStars)
      msg += "• High repo impact (stars)\n";

    if (top.repos > second.repos)
      msg += "• More active development\n";

    return msg;
  };

  return (
    <div style={styles.container}>
      <h1>🔥 Developer Battle Arena</h1>

      <input
        placeholder="Enter users (comma separated)"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={styles.input}
      />

      <button onClick={handleCompare} style={styles.btn}>
        Compare 🚀
      </button>

      {/* 🔥 SCORE CHART */}
      {data.length > 0 && (
        <>
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
              <p>Score: {Math.round(u.score)}</p>

              {/* 🔥 BREAKDOWN */}
              <p>Followers: {u.followers}</p>
              <p>Repos: {u.repos}</p>
              <p>Stars: {u.breakdown.totalStars}</p>
            </div>
          ))}

          {/* 🔥 SKILL GRAPH */}
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
                    fill={["#22c55e", "#3b82f6", "#f59e0b"][idx]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 🧠 AI INSIGHT */}
          <div style={styles.insight}>
            <h3>🧠 AI Insight</h3>
            <pre>{getInsight()}</pre>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    background: "#0f172a",
    color: "white",
    minHeight: "100vh",
    padding: "20px",
  },
  input: {
    padding: "10px",
    width: "400px",
    marginRight: "10px",
  },
  btn: {
    padding: "10px",
    background: "#22c55e",
    border: "none",
    color: "white",
  },
  card: {
    background: "#1e293b",
    padding: "10px",
    marginTop: "10px",
    borderRadius: "6px",
  },
  insight: {
    marginTop: "20px",
    background: "#1e293b",
    padding: "15px",
    borderRadius: "10px",
  },
};

export default Compare;