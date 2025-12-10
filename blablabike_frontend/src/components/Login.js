// // src/components/Login.js
// import React, { useState, useContext } from "react";
// import AuthContext from "../context/AuthContext";
// import { Link } from "react-router-dom";

// function Login() {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const { login } = useContext(AuthContext);

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     login(username, password);
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <h2>Login</h2>
//       <input
//         type="text"
//         placeholder="Username"
//         value={username}
//         onChange={(e) => setUsername(e.target.value)}
//         required
//       />
//       <input
//         type="password"
//         placeholder="Password"
//         value={password}
//         onChange={(e) => setPassword(e.target.value)}
//         required
//       />
//       <button type="submit">Login</button>
//       <p>
//         Don't have an account? <Link to="/register">Register here</Link>
//       </p>
//     </form>
//   );
// }

// export default Login;

// src/components/Login.js
import React, { useState, useContext } from "react";
import AuthContext from "../context/AuthContext";
import { Link } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useContext(AuthContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    login(username, password);
  };

  return (
    <div className="glass-container">
      <div className="glass-card">
        {/* App Logo Placeholder */}
        <div className="app-logo"></div>

        <h2>Log in to your Account</h2>
        <p className="welcome-message">
          Welcome back! Select method to log in:
        </p>

        <form onSubmit={handleSubmit}>
          {/* Username/Email Input */}
          <div className="input-group">
            <input
              type="text"
              placeholder="Email or username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          {/* Password Input */}
          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Remember Me and Forgot Password in a flex container (optional for now) */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "-10px",
            }}
          >
            <label style={{ fontSize: "0.9rem", color: "#9cb1d4" }}>
              <input type="checkbox" style={{ marginRight: "8px" }} />
              Remember me
            </label>
          </div>

          {/* LOGIN Button */}
          <button type="submit" className="primary-button">
            Log In
          </button>
        </form>

        {/* Forgot Password Link is separate in the original design */}
        <Link
          to="/forgot-password"
          className="utility-link"
          style={{ textAlign: "center" }}
        >
          Forgot password
        </Link>

        {/* Bottom Register Link */}
        <p className="bottom-nav-text">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
