import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// 🔥 BACKEND URL
const BASE_URL = "https://devtrack-backend-xmag.onrender.com";

function Compare() {
  const navigate = useNavigate();

  const [user1, setUser1] = useState("");
  const [user2, setUser2] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCompare = async () => {
    if (!user1 || !user2) {
      setError("❌ Enter both usernames");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await axios.get(
        `${BASE_URL}/compare/${user1}/${user2}`
      );

      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError("❌ Comparison failed (check usernames)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <h1>Compare Developers ⚔️</h1>
        <button onClick={() => navigate("/")} style={styles.backBtn}>
          ← Back
        </button>
      </div>

      {/* INPUTS */}
      <div style={styles.inputBox}>
        <input
          placeholder="GitHub Username 1"
          value={user1}
          onChange={(e) => setUser1(e.target.value)}
          style={styles.input}
        />

        <input
          placeholder="GitHub Username 2"
          value={user2}
          onChange={(e) => setUser2(e.target.value)}
          style={styles.input}
        />

        <button onClick={handleCompare} style={styles.compareBtn}>
          Compare 🚀
        </button>
      </div>

      {/* ERROR */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* LOADING */}
      {loading && <p>Comparing...</p>}

      {/* RESULT */}
      {result && (
        <div style={styles.resultBox}>
          {/* USERS */}
          <div style={styles.users}>
            <div style={styles.card}>
              <h2>{result.user1.username}</h2>
              <p>Followers: {result.user1.followers}</p>
              <p>Repos: {result.user1.repos}</p>
              <p>Score: {Math.round(result.user1.score)}</p>
            </div>

            <div style={styles.card}>
              <h2>{result.user2.username}</h2>
              <p>Followers: {result.user2.followers}</p>
              <p>Repos: {result.user2.repos}</p>
              <p>Score: {Math.round(result.user2.score)}</p>
            </div>
          </div>

          {/* WINNER */}
          <div style={styles.winner}>
            🏆 Winner: <b>{result.winner}</b>
          </div>
        </div>
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
    alignItems: "center",
    marginBottom: "20px",
  },

  backBtn: {
    background: "#38bdf8",
    border: "none",
    padding: "10px",
    borderRadius: "6px",
    cursor: "pointer",
    color: "white",
  },

  inputBox: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
  },

  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "none",
  },

  compareBtn: {
    background: "#22c55e",
    border: "none",
    padding: "10px 15px",
    borderRadius: "6px",
    cursor: "pointer",
    color: "white",
  },

  resultBox: {
    marginTop: "30px",
  },

  users: {
    display: "flex",
    gap: "20px",
  },

  card: {
    background: "#1e293b",
    padding: "20px",
    borderRadius: "10px",
    width: "200px",
  },

  winner: {
    marginTop: "20px",
    fontSize: "20px",
    color: "#22c55e",
  },
};

export default Compare;