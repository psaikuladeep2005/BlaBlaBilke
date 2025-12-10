// // src/App.js
// import React from "react";
// import PublishRide from "./components/PublishRide";
// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   Navigate,
// } from "react-router-dom";
// import { AuthProvider } from "./context/AuthContext";
// import AuthContext from "./context/AuthContext";

// // Components
// import Home from "./components/Home";
// import Login from "./components/Login";
// import Register from "./components/Register";
// import "./App.css";
// // A simple wrapper component for protected routes
// const PrivateRoute = ({ children }) => {
//   const { authToken } = React.useContext(AuthContext);
//   // Redirect to login if no token is present
//   return authToken ? children : <Navigate to="/login" replace />;
// };

// function App() {
//   return (
//     <Router>
//       <AuthProvider>
//         <div className="App">
//           <header>
//             <h1>BlaBlaBike 🏍️</h1>
//           </header>
//           <main>
//             <Routes>
//               <Route path="/login" element={<Login />} />
//               <Route path="/register" element={<Register />} />

//               {/* Protected Route Example */}
//               <Route
//                 path="/"
//                 element={
//                   <PrivateRoute>
//                     <Home />
//                   </PrivateRoute>
//                 }
//               />
//               {/* You'll add more routes here, like /publish-ride, /find-ride, etc. */}
//             </Routes>
//           </main>
//         </div>
//       </AuthProvider>
//     </Router>
//   );
// }

// export default App;

// src/App.js (Updated)
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import AuthContext from "./context/AuthContext";

// Components
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import PublishRide from "./components/PublishRide"; // <-- NEW IMPORT
import "./App.css";
import MyBookings from "./components/MyBookings";
import MyBookedRides from "./components/MyBookedRides";

// A simple wrapper component for protected routes
const PrivateRoute = ({ children }) => {
  const { authToken } = React.useContext(AuthContext);
  // Redirect to login if no token is present
  return authToken ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <header>
            <h1>BlaBlaBike 🏍️</h1>
          </header>
          <main>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              {/* Protected Routes */}
              {/* Home/Dashboard (Shows Search or Feed) */}
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <Home />
                  </PrivateRoute>
                }
              />
              {/* Ride Publishing Route */}
              <Route // <-- NEW ROUTE ADDED
                path="/publish"
                element={
                  <PrivateRoute>
                    <PublishRide />
                  </PrivateRoute>
                }
              />
              <Route
                path="/driver/requests"
                element={
                  <PrivateRoute>
                    <MyBookings />
                  </PrivateRoute>
                }
              />
              <Route
                path="/my-bookings"
                element={
                  <PrivateRoute>
                    <MyBookedRides />
                  </PrivateRoute>
                }
              />{" "}
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
