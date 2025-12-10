// // src/components/Home.js (Search Logic)

// import React, { useContext, useState } from "react";
// import { Link } from "react-router-dom";
// import AuthContext from "../context/AuthContext";
// import LocationAutosuggest from "./LocationAutosuggest"; // <-- IMPORT
// import api from "../api/axios"; // <-- IMPORT

// function Home() {
//   const { user, logout, authToken } = useContext(AuthContext);
//   const [searchResults, setSearchResults] = useState([]);
//   const [searchData, setSearchData] = useState({
//     start_lat: null,
//     start_lng: null,
//     end_lat: null,
//     end_lng: null,
//     date: "",
//   });

//   const handleLocationSelect = (field, place) => {
//     setSearchData((prev) => ({
//       ...prev,
//       [`${field}_lat`]: Number(place.latitude),
//       [`${field}_lng`]: Number(place.longitude),
//     }));
//   };

//   const handleDateChange = (e) => {
//     setSearchData((prev) => ({ ...prev, date: e.target.value }));
//   };

//   const handleSearch = async (e) => {
//     e.preventDefault();

//     if (!searchData.start_lat || !searchData.end_lat) {
//       alert(
//         "Please select both a starting point and a destination from the suggestions."
//       );
//       return;
//     }

//     try {
//       // Send the coordinates to the backend
//       const response = await api.get("/api/rides/", {
//         params: {
//           start_lat: searchData.start_lat,
//           start_lng: searchData.start_lng,
//           end_lat: searchData.end_lat,
//           end_lng: searchData.end_lng,
//           date: searchData.date,
//         },
//         headers: {
//           // Token is required to access the API endpoint
//           Authorization: `Token ${authToken}`,
//         },
//       });

//       setSearchResults(response.data);
//       console.log("Search Results:", response.data);
//     } catch (error) {
//       console.error("Ride search failed:", error.response || error);
//       alert("Failed to search rides.");
//     }
//   };

//   return (
//     <div className="glass-container">
//       <div
//         className="glass-card"
//         style={{ padding: "30px", maxWidth: "600px" }}
//       >
//         {/* User Info Section */}
//         {user && (
//           <div style={{ textAlign: "left", marginBottom: "30px" }}>
//             {/* ... other user info ... */}
//             <Link
//               to="/publish"
//               className="primary-button"
//               style={{
//                 display: "block",
//                 textDecoration: "none",
//                 textAlign: "center",
//                 marginBottom: "20px",
//               }}
//             >
//               🏍️ Publish a Ride
//             </Link>
//           </div>
//         )}

//         {/* 2. FIND A RIDE SEARCH INTERFACE */}
//         <h3 style={{ color: "#fff", textAlign: "left", marginBottom: "20px" }}>
//           Find a Ride
//         </h3>

//         <form onSubmit={handleSearch}>
//           {/* Start Location */}
//           <LocationAutosuggest
//             placeholder="Starting Location"
//             onPlaceSelected={(place) => handleLocationSelect("start", place)}
//           />

//           {/* Destination */}
//           <div style={{ marginTop: "15px" }}>
//             <LocationAutosuggest
//               placeholder="Destination"
//               onPlaceSelected={(place) => handleLocationSelect("end", place)}
//             />
//           </div>

//           {/* Date Input */}
//           <input
//             type="date"
//             onChange={handleDateChange}
//             style={{ marginTop: "15px" }}
//           />

//           <button
//             type="submit"
//             className="primary-button"
//             style={{ marginTop: "20px" }}
//           >
//             🔍 Search
//           </button>
//         </form>

//         {/* ------------------------------------------- */}
//         {/* 3. DISPLAY RESULTS */}
//         {/* ------------------------------------------- */}
//         <div style={{ marginTop: "30px" }}>
//           <h3 style={{ color: "#fff", textAlign: "left" }}>
//             Results ({searchResults.length})
//           </h3>

//           {searchResults.length > 0 ? (
//             searchResults.map((ride) => (
//               <div
//                 key={ride.id}
//                 className="result-card"
//                 style={{
//                   background: "#1a2a47",
//                   padding: "15px",
//                   borderRadius: "10px",
//                   marginBottom: "10px",
//                   textAlign: "left",
//                 }}
//               >
//                 <strong>{ride.pickup_address}</strong> to{" "}
//                 <strong>{ride.destination_address}</strong>
//                 <p style={{ margin: "5px 0", fontSize: "0.9rem" }}>
//                   Driver: {ride.driver_username} | Time:{" "}
//                   {new Date(ride.start_time).toLocaleString()} | Price: ₹
//                   {ride.price_per_seat}
//                 </p>
//               </div>
//             ))
//           ) : (
//             <p style={{ color: "#9cb1d4" }}>No rides found yet. Publish one!</p>
//           )}
//         </div>

//         <button
//           onClick={logout}
//           className="utility-link"
//           style={{
//             marginTop: "40px",
//             background: "none",
//             border: "none",
//             cursor: "pointer",
//           }}
//         >
//           Logout
//         </button>
//       </div>
//     </div>
//   );
// }

// export default Home;
// src/components/Home.js

import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import LocationAutosuggest from "./LocationAutosuggest";
import api from "../api/axios";

const Home = () => {
  const { user, logout, authToken } = useContext(AuthContext);
  const [searchResults, setSearchResults] = useState([]);
  const [searchData, setSearchData] = useState({
    start_lat: null,
    start_lng: null,
    end_lat: null,
    end_lng: null,
    date: "",
  });
  // State for tracking which ride the user is trying to book seats for
  const [seatsToBook, setSeatsToBook] = useState({});

  // --- Search Logic ---
  const handleLocationSelect = (field, place) => {
    setSearchData((prev) => ({
      ...prev,
      [`${field}_lat`]: Number(place.latitude),
      [`${field}_lng`]: Number(place.longitude),
    }));
  };

  const handleDateChange = (e) => {
    setSearchData((prev) => ({ ...prev, date: e.target.value }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchData.start_lat || !searchData.end_lat) {
      alert(
        "Please select both a starting point and a destination from the suggestions."
      );
      return;
    }

    try {
      const response = await api.get("/api/rides/", {
        params: {
          start_lat: searchData.start_lat,
          start_lng: searchData.start_lng,
          end_lat: searchData.end_lat,
          end_lng: searchData.end_lng,
          date: searchData.date,
        },
        headers: {
          Authorization: `Token ${authToken}`,
        },
      });

      setSearchResults(response.data);
      setSeatsToBook({}); // Clear booking state when new search runs
    } catch (error) {
      console.error("Ride search failed:", error.response || error);
      alert("Failed to search rides. Check console for details.");
    }
  };

  // --- Booking Logic ---
  const handleBookRide = async (rideId, seats) => {
    if (!seats || seats <= 0) {
      alert("Please enter a valid number of seats (1 or more).");
      return;
    }

    try {
      await api.post(
        "/api/bookings/",
        {
          ride: rideId,
          seats_booked: seats,
        },
        {
          headers: {
            Authorization: `Token ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert("Ride booked successfully! Waiting for driver acceptance.");
      // OPTIONAL: Re-run search to update seat count display, or remove the card
      handleSearch({ preventDefault: () => {} });
    } catch (error) {
      // Check for specific error message from Django (e.g., not enough seats)
      const errorDetail =
        error.response?.data?.non_field_errors?.[0] ||
        error.response?.data?.seats_booked?.[0] ||
        "Could not book ride.";

      console.error("Booking failed:", error.response || error);
      alert(`Booking Failed: ${errorDetail}`);
    }
  };

  // --- Seats Input Handler ---
  const handleSeatsInputChange = (rideId, value) => {
    // Ensure value is numeric and within bounds
    const seats = Math.max(1, Math.min(Number(value) || 1, 10)); // Max 10 seats
    setSeatsToBook((prev) => ({
      ...prev,
      [rideId]: seats,
    }));
  };

  return (
    <div className="glass-container">
      <div
        className="glass-card"
        style={{ padding: "30px", maxWidth: "600px" }}
      >
        {/* ------------------------------------------- */}
        {/* 1. TOP DASHBOARD LINKS & USER INFO */}
        {/* ------------------------------------------- */}
        {user && (
          <div style={{ textAlign: "left", marginBottom: "30px" }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "10px" }}>
              Hello, {user.username}!
            </h2>

            {/* Action Buttons Container */}
            <div
              style={{ display: "flex", gap: "15px", flexDirection: "column" }}
            >
              <Link
                to="/publish"
                className="primary-button"
                style={{
                  display: "block",
                  textDecoration: "none",
                  textAlign: "center",
                }}
              >
                🏍️ Publish a Ride
              </Link>

              <Link // Link for the Driver to check requests
                to="/driver/requests"
                className="primary-button"
                style={{
                  display: "block",
                  textDecoration: "none",
                  textAlign: "center",
                  backgroundColor: "#1a4e7f", // Different color for a secondary action
                }}
              >
                📥 Check Ride Requests
              </Link>
              <Link
                to="/my-bookings" // <-- The destination path registered in App.js
                className="primary-button"
                style={{
                  display: "block",
                  textDecoration: "none",
                  textAlign: "center",
                  backgroundColor: "#4A69BD", // Styling for visibility
                }}
              >
                📋 My Booked Rides
              </Link>
            </div>
          </div>
        )}

        {/* ------------------------------------------- */}
        {/* 2. FIND A RIDE SEARCH INTERFACE */}
        {/* ------------------------------------------- */}
        <h3 style={{ color: "#fff", textAlign: "left", marginBottom: "20px" }}>
          Find a Ride
        </h3>

        <form onSubmit={handleSearch}>
          {/* Start Location */}
          <LocationAutosuggest
            placeholder="Starting Location"
            onPlaceSelected={(place) => handleLocationSelect("start", place)}
          />

          {/* Destination */}
          <div style={{ marginTop: "15px" }}>
            <LocationAutosuggest
              placeholder="Destination"
              onPlaceSelected={(place) => handleLocationSelect("end", place)}
            />
          </div>

          {/* Date Input */}
          <input
            type="date"
            onChange={handleDateChange}
            style={{ marginTop: "15px" }}
          />

          <button
            type="submit"
            className="primary-button"
            style={{ marginTop: "20px" }}
          >
            🔍 Search
          </button>
        </form>

        {/* ------------------------------------------- */}
        {/* 3. DISPLAY RESULTS & BOOKING */}
        {/* ------------------------------------------- */}
        <div style={{ marginTop: "30px" }}>
          <h3 style={{ color: "#fff", textAlign: "left" }}>
            Results ({searchResults.length})
          </h3>

          {searchResults.length > 0 ? (
            searchResults.map((ride) => (
              <div
                key={ride.id}
                className="result-card"
                style={{
                  background: "#1a2a47",
                  padding: "15px",
                  borderRadius: "10px",
                  marginBottom: "10px",
                  textAlign: "left",
                }}
              >
                <strong>{ride.pickup_address}</strong> to{" "}
                <strong>{ride.destination_address}</strong>
                <p style={{ margin: "5px 0", fontSize: "0.9rem" }}>
                  Driver: {ride.driver_username} | Time:{" "}
                  {new Date(ride.start_time).toLocaleString()} | Price: ₹
                  {ride.price_per_seat}
                </p>
                <p
                  style={{
                    margin: "5px 0",
                    fontSize: "0.9rem",
                    color: ride.seats_available > 0 ? "#4CAF50" : "#f44336",
                  }}
                >
                  Seats Available: {ride.seats_available}
                </p>
                {/* --- BOOKING INTERFACE --- */}
                {ride.seats_available > 0 &&
                  ride.driver.id !== user.id && ( // Cannot book your own ride
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        marginTop: "10px",
                        alignItems: "center",
                      }}
                    >
                      <input
                        type="number"
                        placeholder="Seats"
                        min="1"
                        max={ride.seats_available}
                        value={seatsToBook[ride.id] || 1}
                        onChange={(e) =>
                          handleSeatsInputChange(ride.id, e.target.value)
                        }
                        style={{
                          width: "80px",
                          padding: "8px",
                          borderRadius: "5px",
                          background: "rgba(0,0,0,0.2)",
                          border: "1px solid #364966",
                        }}
                      />
                      <button
                        type="button"
                        className="primary-button"
                        onClick={() =>
                          handleBookRide(ride.id, seatsToBook[ride.id] || 1)
                        }
                        style={{
                          flexGrow: 1,
                          padding: "8px 15px",
                          fontSize: "0.9rem",
                        }}
                      >
                        Book Seat(s)
                      </button>
                    </div>
                  )}
              </div>
            ))
          ) : (
            <p style={{ color: "#9cb1d4" }}>No rides found yet. Publish one!</p>
          )}
        </div>

        {/* ------------------------------------------- */}
        {/* 4. LOGOUT */}
        {/* ------------------------------------------- */}
        <button
          onClick={logout}
          className="utility-link"
          style={{
            marginTop: "40px",
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "block",
            width: "100%",
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Home;
