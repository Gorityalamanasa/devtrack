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
  const [usersData, setUsersData] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔥 Parse input (comma separated)
  const getUsernames = () => {
    return input
      .split(",")
      .map((u) => u.trim())
      .filter((u) => u.length > 0);
  };

  const handleCompare = async () => {
    const usernames = getUsernames();

    if (usernames.length < 2) {
      alert("Enter at least 2 users");
      return;
    }

    setLoading(true);

    try {
      // 🔥 Fetch all users
      const results = await Promise.all(
        usernames.map(async (username) => {
          const res = await axios.get(
            `${BASE_URL}/github/${username}`
          );

          const repos = res.data.repos;

          const totalStars = repos.reduce(
            (sum, r) => sum + r.stargazers_count,
            0
          );

          const score =
            res.data.user.followers * 0.4 +
            res.data.user.public_repos * 0.3 +
            totalStars * 0.3;

          return {
            username,
            followers: res.data.user.followers,
            repos: res.data.user.public_repos,
            stars: totalStars,
            score,
          };
        })
      );

      // 🔥 Sort leaderboard
      results.sort((a, b) => b.score - a.score);

      setUsersData(results);
    } catch (err) {
      console.error(err);
      alert("Error comparing users");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Chart Data
  const chartData = usersData.map((u) => ({
    name: u.username,
    score: u.score,
  }));

  // 🔥 AI Insight
  const getInsight = () => {
    if (!usersData.length) return "";

    const top = usersData[0];
    const bottom = usersData[usersData.length - 1];

    return `
🏆 ${top.username} dominates with highest score.

📉 ${bottom.username} needs improvement in activity or impact.

💡 Tip: Focus on stars + consistency for better ranking.
    `;
  };

  return (
    <div style={styles.container}>
      <h1>🔥 Developer Battle Arena</h1>

      {/* INPUT */}
      <input
        placeholder="Enter usernames (comma separated)"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={styles.input}
      />

      <button onClick={handleCompare} style={styles.btn}>
        Compare 🚀
      </button>

      {loading && <p>Loading...</p>}

      {/* 🔥 CHART */}
      {usersData.length > 0 && (
        <>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip />
                <Bar dataKey="score" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 🏆 LEADERBOARD */}
          <h2>🏆 Leaderboard</h2>
          {usersData.map((u, i) => (
            <div key={i} style={styles.card}>
              #{i + 1} {u.username} — Score: {Math.round(u.score)}
            </div>
          ))}

          {/* 🧠 INSIGHT */}
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