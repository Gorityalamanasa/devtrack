import React, { useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// 🔥 DEPLOYED BACKEND URL
const BASE_URL = "https://devtrack-backend-xmag.onrender.com";

function Compare() {
  const [userA, setUserA] = useState("");
  const [userB, setUserB] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔥 Extract username from GitHub URL
  const extract = (input) => {
    if (input.includes("github.com")) {
      const parts = input.split("/");
      return parts.filter(Boolean).pop();
    }
    return input;
  };

  const handleCompare = async () => {
    const u1 = extract(userA.trim());
    const u2 = extract(userB.trim());

    if (!u1 || !u2) {
      alert("Please enter both usernames");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${BASE_URL}/compare/${u1}/${u2}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // 🔐 JWT ready
          },
        }
      );

      setResult(res.data);
    } catch (err) {
      alert("Comparison failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Compare Developers ⚔️</h1>

      {/* INPUT */}
      <div style={styles.inputContainer}>
        <input
          placeholder="User 1 (username or URL)"
          value={userA}
          onChange={(e) => setUserA(e.target.value)}
          style={styles.input}
        />
        <input
          placeholder="User 2 (username or URL)"
          value={userB}
          onChange={(e) => setUserB(e.target.value)}
          style={styles.input}
        />
        <button style={styles.btn} onClick={handleCompare}>
          {loading ? "Comparing..." : "Compare"}
        </button>
      </div>

      {result && (
        <>
          {/* WINNER */}
          <h2 style={styles.winner}>
            🏆 Winner: {result.winner}
          </h2>

          {/* CARDS */}
          <div style={styles.cards}>
            <div style={styles.card}>
              <h3>{result.user1.username}</h3>
              <p>Followers: {result.user1.followers}</p>
              <p>Repos: {result.user1.repos}</p>
              <p>Score: {result.user1.score.toFixed(2)}</p>
            </div>

            <div style={styles.card}>
              <h3>{result.user2.username}</h3>
              <p>Followers: {result.user2.followers}</p>
              <p>Repos: {result.user2.repos}</p>
              <p>Score: {result.user2.score.toFixed(2)}</p>
            </div>
          </div>

          {/* GRAPH */}
          <div style={styles.chartBox}>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={[
                  {
                    name: "Followers",
                    A: result.user1.followers,
                    B: result.user2.followers,
                  },
                  {
                    name: "Repos",
                    A: result.user1.repos,
                    B: result.user2.repos,
                  },
                  {
                    name: "Score",
                    A: result.user1.score,
                    B: result.user2.score,
                  },
                ]}
              >
                <XAxis dataKey="name" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip />
                <Legend />
                <Bar dataKey="A" fill="#00adb5" />
                <Bar dataKey="B" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* SKILLS */}
          <div style={styles.skills}>
            <h3>🧠 Skills Comparison</h3>
            <p>
              <strong>{result.user1.username}:</strong>{" "}
              {Object.keys(result.user1.skills).join(", ")}
            </p>
            <p>
              <strong>{result.user2.username}:</strong>{" "}
              {Object.keys(result.user2.skills).join(", ")}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    background: "#0f172a",
    minHeight: "100vh",
    color: "white",
    padding: "40px",
    textAlign: "center",
  },
  title: {
    marginBottom: "20px",
    fontSize: "28px",
  },
  inputContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "30px",
  },
  input: {
    padding: "12px",
    borderRadius: "8px",
    width: "220px",
    border: "1px solid #334155",
    background: "#1e293b",
    color: "#fff",
  },
  btn: {
    background: "#00adb5",
    border: "none",
    padding: "12px 18px",
    color: "white",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  winner: {
    color: "#22c55e",
    marginBottom: "20px",
    fontSize: "20px",
  },
  cards: {
    display: "flex",
    justifyContent: "center",
    gap: "30px",
    marginBottom: "30px",
    flexWrap: "wrap",
  },
  card: {
    background: "#1e293b",
    padding: "20px",
    borderRadius: "12px",
    width: "220px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
  },
  chartBox: {
    margin: "30px auto",
    maxWidth: "700px",
    background: "#1e293b",
    padding: "20px",
    borderRadius: "12px",
  },
  skills: {
    marginTop: "20px",
    fontSize: "16px",
  },
};

export default Compare;