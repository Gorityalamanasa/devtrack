import React, { useState } from "react";
import axios from "axios";

// 🔥 YOUR DEPLOYED BACKEND
const BASE_URL = "https://devtrack-backend-xmag.onrender.com";

function Signup({ setIsSignup, setUser, setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [githubUsername, setGithubUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    // 🔥 Validation
    if (!email || !password || !githubUsername) {
      alert("All fields are required!");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${BASE_URL}/auth/register`, {
        email,
        password,
        githubUsername,
      });

      // ✅ If backend later returns token → ready for future
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        setToken(res.data.token);
      }

      // ✅ Store user
      if (githubUsername) {
        localStorage.setItem("user", githubUsername);
        setUser(githubUsername);
      }

      alert("Signup successful 🚀");

      // 👉 Move to login screen
      setIsSignup(false);
    } catch (err) {
      alert(err.response?.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>DevTrack 🚀</h1>
        <h2 style={{ marginBottom: "20px", color: "#cbd5f5" }}>
          Create Account
        </h2>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        <input
          placeholder="GitHub Username"
          value={githubUsername}
          onChange={(e) => setGithubUsername(e.target.value)}
          style={styles.input}
        />

        <button
          style={styles.button}
          onClick={handleSignup}
          disabled={loading}
        >
          {loading ? "Creating..." : "Signup"}
        </button>

        <p style={styles.link} onClick={() => setIsSignup(false)}>
          Already have an account? Login
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#0f172a",
  },
  card: {
    background: "#1e293b",
    padding: "40px",
    borderRadius: "16px",
    width: "340px",
    textAlign: "center",
    boxShadow: "0 15px 40px rgba(0,0,0,0.6)",
  },
  title: {
    marginBottom: "10px",
    color: "#fff",
    fontSize: "26px",
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    padding: "12px",
    margin: "10px 0",
    borderRadius: "8px",
    border: "1px solid #334155",
    outline: "none",
    background: "#0f172a",
    color: "#fff",
  },
  button: {
    width: "100%",
    padding: "12px",
    background: "#00adb5",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginTop: "10px",
    fontWeight: "bold",
  },
  link: {
    marginTop: "15px",
    color: "#38bdf8",
    cursor: "pointer",
    fontSize: "14px",
  },
};

export default Signup;