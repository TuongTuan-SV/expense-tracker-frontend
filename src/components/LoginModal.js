// expense-tracker-frontend/src/components/LoginModal.js
import React, { useState } from "react";

export default function LoginModal({ onLoginSuccess }) {
  const [username, setUsername]         = useState("");
  const [password, setPassword]         = useState("");
  const [error, setError]               = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Hard‐coded credentials
    if (username === "Admin123" && password === "Qwer1234") {
      // Build Basic Auth header
      const token = btoa(`${username}:${password}`);
      const authHeader = `Basic ${token}`;
      onLoginSuccess(authHeader);
    } else {
      setError("Invalid credentials.");
    }
  };

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <>
      {/* Modal backdrop */}
      <div className="modal-backdrop"></div>

      {/* Modal content */}
      <div className="modal-content">
        <h3>Login</h3>

        <form onSubmit={handleSubmit}>
          {/* Username field */}
          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", marginBottom: "4px" }}>
              Username:
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                fontFamily: "inherit",
                borderRadius: "4px",
                border: "1px solid #ccc",
                fontSize: "1rem",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Password field with "Show"/"Hide" */}
          <div style={{ marginBottom: "12px", position: "relative" }}>
            <label style={{ display: "block", marginBottom: "4px" }}>
              Password:
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 60px 8px 8px", // right padding for Show/Hide
                fontFamily: "inherit",
                borderRadius: "4px",
                border: "1px solid #ccc",
                fontSize: "1rem",
                boxSizing: "border-box",
              }}
            />
            {/* "Show"/"Hide" button inside input */}
            <button
              type="button"
              onClick={toggleShowPassword}
              style={{
                position: "absolute",
                right: "8px",
                top: "69%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "0.9rem",
                color: "black",
                padding: 0,
                lineHeight: 1,
              }}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "10px",
              fontFamily: "inherit",
              borderRadius: "4px",
              border: "none",
              backgroundColor: "#007bff",
              color: "white",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            Login
          </button>

          {error && <p style={{ color: "red", marginTop: "8px" }}>{error}</p>}
        </form>
      </div>
    </>
  );
}
