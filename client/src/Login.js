import React, { useState } from "react";
import axios from "axios";

// 🔥 YOUR DEPLOYED BACKEND
const BASE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:5000"
    : "https://devtrack-backend-xmag.onrender.com";

function Login({ setUser, setIsSignup, setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // 🔥 Validation
    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${BASE_URL}/auth/login`, {
        email,
        password,
      });

      // 🔐 STORE TOKEN
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        setToken(res.data.token);
      }

      // 👤 STORE USER
      if (res.data.githubUsername) {
        localStorage.setItem("user", res.data.githubUsername);
        setUser(res.data.githubUsername);
      }

      alert("Login successful 🚀");
    } catch (err) {
      const msg =
        err.response?.data?.msg ||
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Login failed";

      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>DevTrack 🚀</h1>

        <h2 style={styles.subtitle}>
          Welcome Back
        </h2>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        <input
        type={showPassword ? "text" : "password"}   // ✅ change here
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={styles.input}
        />
        <div
        onClick={() => setShowPassword(!showPassword)}
        style={{
         color: "#38bdf8",
        fontSize: "13px",
        textAlign: "right",
        cursor: "pointer",
        marginTop: "-5px",
        marginBottom: "10px",
        }}
        >
       {showPassword ? "Hide Password" : "Show Password"}
       </div>

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
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#0f172a",
    padding: "20px", // ✅ mobile spacing
  },

  card: {
    background: "#1e293b",
    padding: "30px",
    borderRadius: "16px",
    width: "100%",          // ✅ responsive
    maxWidth: "380px",      // ✅ limit for desktop
    textAlign: "center",
    boxShadow: "0 15px 40px rgba(0,0,0,0.6)",
  },

  title: {
    marginBottom: "10px",
    color: "#fff",
    fontSize: "24px",
    fontWeight: "bold",
  },

  subtitle: {
    marginBottom: "20px",
    color: "#cbd5f5",
    fontSize: "18px",
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
    fontSize: "14px",
    boxSizing: "border-box", // ✅ FIX overflow
  },

  button: {
    width: "100%",
    padding: "12px",          // ✅ SAME as input
    background: "#00adb5",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginTop: "10px",
    fontWeight: "bold",
    fontSize: "15px",
  },

  link: {
    marginTop: "15px",
    color: "#38bdf8",
    cursor: "pointer",
    fontSize: "14px",
  },
};

export default Login;