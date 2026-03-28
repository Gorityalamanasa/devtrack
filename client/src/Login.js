import React, { useState } from "react";
import axios from "axios";

function Login({ setUser, setIsSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // 🔥 Validation
    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post("http://localhost:5000/auth/login", {
        email,
        password,
      });

      // 🔐 STORE TOKEN (VERY IMPORTANT)
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }

      // 👤 Set user (GitHub username)
      setUser(res.data.githubUsername);

      alert("Login successful 🚀");
    } catch (err) {
      alert(err.response?.data?.msg || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>DevTrack 🚀</h1>
        <h2 style={{ marginBottom: "20px", color: "#cbd5f5" }}>
          Welcome Back
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

        <button
          style={styles.button}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p style={styles.link} onClick={() => setIsSignup(true)}>
          Don't have an account? Signup
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

export default Login;