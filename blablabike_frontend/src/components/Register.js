// // src/components/Register.js
// import React, { useState, useContext } from "react";
// import AuthContext from "../context/AuthContext";
// import { Link } from "react-router-dom";

// function Register() {
//   const { register } = useContext(AuthContext);

//   const [formData, setFormData] = useState({
//     username: "",
//     email: "",
//     phone_number: "", // Custom field
//     password: "",
//     re_password: "", // Djoser requires 're_password' (password confirmation)
//   });

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     // The Djoser endpoint expects password and re_password fields
//     if (formData.password !== formData.re_password) {
//       alert("Passwords do not match!");
//       return;
//     }
//     register(formData);
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <h2>Register</h2>
//       <input
//         type="text"
//         name="username"
//         placeholder="Username"
//         onChange={handleChange}
//         required
//       />
//       <input
//         type="email"
//         name="email"
//         placeholder="Email"
//         onChange={handleChange}
//         required
//       />
//       <input
//         type="tel"
//         name="phone_number"
//         placeholder="Phone Number (Optional)"
//         onChange={handleChange}
//       />
//       <input
//         type="password"
//         name="password"
//         placeholder="Password"
//         onChange={handleChange}
//         required
//       />
//       <input
//         type="password"
//         name="re_password"
//         placeholder="Confirm Password"
//         onChange={handleChange}
//         required
//       />
//       <button type="submit">Register</button>
//       <p>
//         Already have an account? <Link to="/login">Login here</Link>
//       </p>
//     </form>
//   );
// }

// src/components/Register.js
import React, { useState, useContext } from "react";
import AuthContext from "../context/AuthContext";
import { Link } from "react-router-dom";

function Register() {
  const { register } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone_number: "",
    password: "",
    re_password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.re_password) {
      alert("Passwords do not match!");
      return;
    }
    register(formData);
  };

  return (
    <div className="glass-container">
      <div className="glass-card">
        {/* App Logo Placeholder */}
        <div className="app-logo"></div>

        <h2>Sign Up</h2>
        <p className="welcome-message">Create your BlaBlaBike account.</p>

        <form onSubmit={handleSubmit}>
          {/* Username/Full Name */}
          <div className="input-group">
            <input
              type="text"
              name="username"
              placeholder="Full Name (Username)"
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div className="input-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              onChange={handleChange}
              required
            />
          </div>

          {/* Phone Number */}
          <div className="input-group">
            <input
              type="tel"
              name="phone_number"
              placeholder="+1 123456789"
              onChange={handleChange}
            />
          </div>

          {/* Password */}
          <div className="input-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              required
            />
          </div>

          {/* Confirm Password */}
          <div className="input-group">
            <input
              type="password"
              name="re_password"
              placeholder="Confirm Password"
              onChange={handleChange}
              required
            />
          </div>

          {/* Register Button */}
          <button type="submit" className="primary-button">
            Sign Up
          </button>
        </form>

        {/* Bottom Login Link */}
        <p className="bottom-nav-text">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
