// // src/components/MyBookings.js (FIXED and ROBUST)

// import React, { useState, useEffect, useContext, useCallback } from "react";
// import api from "../api/axios";
// import AuthContext from "../context/AuthContext";

// const MyBookings = () => {
//   const { authToken } = useContext(AuthContext);
//   const [bookings, setBookings] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // FIX 1: Change the API endpoint URL in the GET request.
//   const DRIVER_REQUESTS_URL = "/api/driver/requests/";

//   const fetchBookings = useCallback(async () => {
//     if (!authToken) {
//       setLoading(false);
//       return;
//     }
//     setLoading(true);
//     try {
//       // Use the correct dedicated endpoint for the driver's dashboard
//       const response = await api.get(DRIVER_REQUESTS_URL, {
//         headers: { Authorization: `Token ${authToken}` },
//       });
//       setBookings(response.data);
//     } catch (error) {
//       // Log the full error response for easier debugging
//       console.error("Error fetching bookings:", error.response || error);
//     } finally {
//       setLoading(false);
//     }
//   }, [authToken]);

//   // The useEffect hook correctly includes the stabilized function
//   useEffect(() => {
//     fetchBookings();
//   }, [fetchBookings]);

//   const handleAction = async (bookingId, actionType) => {
//     try {
//       // The PATCH action URLs are structured correctly based on the ViewSet:
//       // /api/driver/requests/{id}/accept/ or /api/driver/requests/{id}/reject/
//       await api.patch(
//         `${DRIVER_REQUESTS_URL}${bookingId}/${actionType}/`,
//         null,
//         {
//           headers: { Authorization: `Token ${authToken}` },
//         }
//       );
//       alert(`Booking ${actionType}ed successfully!`);
//       fetchBookings(); // Refresh the list after action
//     } catch (error) {
//       // Improved error display for specific backend messages
//       const errorDetail =
//         error.response?.data?.detail ||
//         error.response?.data?.status ||
//         "Check console for details.";

//       console.error(
//         `Error performing ${actionType}:`,
//         error.response?.data || error
//       );
//       alert(`Failed to ${actionType} booking: ${errorDetail}`);
//     }
//   };

//   if (loading) return <p>Loading ride requests...</p>;

//   return (
//     <div className="glass-container">
//       <div className="glass-card" style={{ maxWidth: "700px" }}>
//         <h2>Ride Requests Dashboard</h2>
//         {/* ... (rest of the component JSX is unchanged and correct) ... */}
//         {bookings.length === 0 ? (
//           <p>No ride requests found for your published rides.</p>
//         ) : (
//           bookings.map((booking) => (
//             <div
//               key={booking.id}
//               className="result-card"
//               style={{
//                 marginBottom: "15px",
//                 padding: "15px",
//                 border:
//                   booking.status === "PENDING" ? "1px solid #007aff" : "none",
//                 backgroundColor: "#1f3458",
//                 borderRadius: "10px",
//                 textAlign: "left",
//               }}
//             >
//               <p>
//                 <strong>Passenger:</strong> {booking.passenger.username} (Seats:{" "}
//                 {booking.seats_booked})
//               </p>
//               <p>
//                 <strong>Ride:</strong> {booking.ride_info}
//               </p>
//               <p>
//                 <strong>Status:</strong> {booking.status}
//               </p>

//               {booking.status === "PENDING" && (
//                 <div style={{ marginTop: "10px" }}>
//                   <button
//                     className="primary-button"
//                     onClick={() => handleAction(booking.id, "accept")}
//                     style={{
//                       width: "100px",
//                       marginRight: "10px",
//                       backgroundColor: "#4CAF50",
//                     }}
//                   >
//                     Accept
//                   </button>
//                   <button
//                     className="primary-button"
//                     onClick={() => handleAction(booking.id, "reject")}
//                     style={{ width: "100px", backgroundColor: "#f44336" }}
//                   >
//                     Reject
//                   </button>
//                 </div>
//               )}
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

// export default MyBookings;
// src / components / MyBookings.js;

// import React, { useState, useEffect, useContext, useCallback } from "react";
// import api from "../api/axios";
// import AuthContext from "../context/AuthContext";

// const MyBookings = () => {
//   const { authToken } = useContext(AuthContext);
//   const [bookings, setBookings] = useState([]);
//   const [rides, setRides] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const DRIVER_REQUESTS_URL = "/api/driver/requests/";
//   const DRIVER_PUBLISHED_URL = "/api/driver/published/";

//   // ✅ Fetch both rides & booking requests
//   const fetchData = useCallback(async () => {
//     if (!authToken) {
//       setLoading(false);
//       return;
//     }
//     setLoading(true);
//     try {
//       const [requestsRes, ridesRes] = await Promise.all([
//         api.get(DRIVER_REQUESTS_URL, {
//           headers: { Authorization: `Token ${authToken}` },
//         }),
//         api.get(DRIVER_PUBLISHED_URL, {
//           headers: { Authorization: `Token ${authToken}` },
//         }),
//       ]);

//       setBookings(requestsRes.data);
//       setRides(ridesRes.data);
//     } catch (error) {
//       console.error("Error fetching data:", error.response || error);
//     } finally {
//       setLoading(false);
//     }
//   }, [authToken]);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   // ✅ Handle Accept/Reject
//   const handleAction = async (bookingId, actionType) => {
//     try {
//       await api.patch(
//         `${DRIVER_REQUESTS_URL}${bookingId}/${actionType}/`,
//         null,
//         { headers: { Authorization: `Token ${authToken}` } }
//       );
//       alert(`Booking ${actionType}ed successfully!`);
//       fetchData();
//     } catch (error) {
//       const errorDetail =
//         error.response?.data?.detail ||
//         error.response?.data?.status ||
//         "Check console for details.";

//       console.error(
//         `Error performing ${actionType}:`,
//         error.response?.data || error
//       );
//       alert(`Failed to ${actionType} booking: ${errorDetail}`);
//     }
//   };

//   if (loading) return <p>Loading your rides and requests...</p>;

//   return (
//     <div className="glass-container">
//       {/* ==================== SECTION 1: Published Rides ==================== */}
//       <div
//         className="glass-card"
//         style={{ maxWidth: "700px", marginBottom: "30px" }}
//       >
//         <h2>Your Published Rides</h2>
//         {rides.length === 0 ? (
//           <p>You haven’t published any rides yet.</p>
//         ) : (
//           rides.map((ride) => (
//             <div
//               key={ride.id}
//               className="result-card"
//               style={{
//                 marginBottom: "15px",
//                 padding: "15px",
//                 backgroundColor: "#14223a",
//                 borderRadius: "10px",
//                 textAlign: "left",
//               }}
//             >
//               <p>
//                 <strong>From:</strong> {ride.pickup_address}
//               </p>
//               <p>
//                 <strong>To:</strong> {ride.destination_address}
//               </p>
//               <p>
//                 <strong>Date & Time:</strong>{" "}
//                 {new Date(ride.start_time).toLocaleString()}
//               </p>
//               <p>
//                 <strong>Seats Available:</strong> {ride.seats_available}
//               </p>
//               <p>
//                 <strong>Price/Seat:</strong> ₹{ride.price_per_seat}
//               </p>
//               <p>
//                 <strong>Status:</strong>{" "}
//                 {ride.is_active ? "Active" : "Inactive"}
//               </p>
//             </div>
//           ))
//         )}
//       </div>

//       {/* ==================== SECTION 2: Ride Requests ==================== */}
//       <div className="glass-card" style={{ maxWidth: "700px" }}>
//         <h2>Ride Requests Dashboard</h2>
//         {bookings.length === 0 ? (
//           <p>No ride requests found for your published rides.</p>
//         ) : (
//           bookings.map((booking) => (
//             <div
//               key={booking.id}
//               className="result-card"
//               style={{
//                 marginBottom: "15px",
//                 padding: "15px",
//                 border:
//                   booking.status === "PENDING" ? "1px solid #007aff" : "none",
//                 backgroundColor: "#1f3458",
//                 borderRadius: "10px",
//                 textAlign: "left",
//               }}
//             >
//               <p>
//                 <strong>Passenger:</strong> {booking.passenger.username} (Seats:{" "}
//                 {booking.seats_booked})
//               </p>
//               <p>
//                 <strong>Ride:</strong> {booking.ride?.pickup_address} →{" "}
//                 {booking.ride?.destination_address}
//               </p>
//               <p>
//                 <strong>Status:</strong> {booking.status}
//               </p>

//               {booking.status === "PENDING" && (
//                 <div style={{ marginTop: "10px" }}>
//                   <button
//                     className="primary-button"
//                     onClick={() => handleAction(booking.id, "accept")}
//                     style={{
//                       width: "100px",
//                       marginRight: "10px",
//                       backgroundColor: "#4CAF50",
//                     }}
//                   >
//                     Accept
//                   </button>
//                   <button
//                     className="primary-button"
//                     onClick={() => handleAction(booking.id, "reject")}
//                     style={{ width: "100px", backgroundColor: "#f44336" }}
//                   >
//                     Reject
//                   </button>
//                 </div>
//               )}
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// };

import React, { useState, useEffect, useContext, useCallback } from "react";
import api from "../api/axios";
import AuthContext from "../context/AuthContext";

const MyBookings = () => {
  const { authToken } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("rides");

  const DRIVER_REQUESTS_URL = "/api/driver/requests/";
  const DRIVER_PUBLISHED_URL = "/api/driver/published/";

  // Fetch rides & requests
  const fetchData = useCallback(async () => {
    if (!authToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [requestsRes, ridesRes] = await Promise.all([
        api.get(DRIVER_REQUESTS_URL, {
          headers: { Authorization: `Token ${authToken}` },
        }),
        api.get(DRIVER_PUBLISHED_URL, {
          headers: { Authorization: `Token ${authToken}` },
        }),
      ]);

      // FIX: Sort by booked_at (correct field from backend)
      const sortedRequests = [...requestsRes.data].sort(
        (a, b) => new Date(b.booked_at) - new Date(a.booked_at)
      );

      setBookings(sortedRequests);
      setRides(ridesRes.data);
    } catch (error) {
      console.error("Error fetching data:", error.response || error);
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Accept/Reject actions
  const handleAction = async (bookingId, actionType) => {
    try {
      await api.patch(
        `${DRIVER_REQUESTS_URL}${bookingId}/${actionType}/`,
        null,
        { headers: { Authorization: `Token ${authToken}` } }
      );
      alert(`Booking ${actionType}ed successfully!`);
      fetchData();
    } catch (error) {
      const errorDetail =
        error.response?.data?.detail ||
        error.response?.data?.status ||
        "Check console for details.";
      console.error(
        `Error performing ${actionType}:`,
        error.response?.data || error
      );
      alert(`Failed to ${actionType} booking: ${errorDetail}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-gray-700 text-lg">
        Loading your rides and requests...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center py-10 px-4">
      <div className="max-w-3xl w-full bg-gray-50 shadow-lg rounded-2xl overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-black text-white">
          <button
            className={`flex-1 py-3 font-semibold transition ${
              activeTab === "rides"
                ? "bg-white text-black"
                : "bg-black text-gray-300 hover:bg-gray-800"
            }`}
            onClick={() => setActiveTab("rides")}
          >
            Published Rides
          </button>
          <button
            className={`flex-1 py-3 font-semibold transition ${
              activeTab === "requests"
                ? "bg-white text-black"
                : "bg-black text-gray-300 hover:bg-gray-800"
            }`}
            onClick={() => setActiveTab("requests")}
          >
            Ride Requests
          </button>
        </div>

        {/* Published Rides */}
        {activeTab === "rides" && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Your Published Rides</h2>
            {rides.length === 0 ? (
              <p className="text-gray-600">
                You haven’t published any rides yet.
              </p>
            ) : (
              rides.map((ride) => (
                <div
                  key={ride.id}
                  className="border border-gray-300 rounded-xl p-4 mb-4 bg-white hover:shadow-md transition"
                >
                  <p>
                    <strong>From:</strong> {ride.pickup_address}
                  </p>
                  <p>
                    <strong>To:</strong> {ride.destination_address}
                  </p>
                  <p>
                    <strong>Date & Time:</strong>{" "}
                    {new Date(ride.start_time).toLocaleString()}
                  </p>
                  <p>
                    <strong>Seats Available:</strong> {ride.seats_available}
                  </p>
                  <p>
                    <strong>Price/Seat:</strong> ₹{ride.price_per_seat}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={`${
                        ride.is_active ? "text-green-600" : "text-red-500"
                      } font-semibold`}
                    >
                      {ride.is_active ? "Active" : "Inactive"}
                    </span>
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Ride Requests */}
        {activeTab === "requests" && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Ride Requests Dashboard</h2>
            {bookings.length === 0 ? (
              <p className="text-gray-600">
                No ride requests found for your published rides.
              </p>
            ) : (
              bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border border-gray-300 rounded-xl p-4 mb-4 bg-white hover:shadow-md transition"
                >
                  <p>
                    <strong>Passenger:</strong> {booking.passenger.username}{" "}
                    (Seats: {booking.seats_booked})
                  </p>

                  <p>
                    <strong>Ride:</strong> {booking.ride?.pickup_address} →{" "}
                    {booking.ride?.destination_address}
                  </p>

                  <p>
                    <strong>Ride Date & Time:</strong>{" "}
                    {booking.ride?.start_time
                      ? new Date(booking.ride.start_time).toLocaleString(
                          "en-IN",
                          {
                            dateStyle: "medium",
                            timeStyle: "short",
                          }
                        )
                      : "N/A"}
                  </p>

                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={`${
                        booking.status === "PENDING"
                          ? "text-yellow-600"
                          : booking.status === "ACCEPTED"
                          ? "text-green-600"
                          : "text-red-500"
                      } font-semibold`}
                    >
                      {booking.status}
                    </span>
                  </p>

                  {/* FIX: backend uses booked_at, not created_at */}
                  <p>
                    <strong>Requested At:</strong>{" "}
                    {booking.booked_at
                      ? new Date(booking.booked_at).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "N/A"}
                  </p>

                  {booking.status === "PENDING" && (
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={() => handleAction(booking.id, "accept")}
                        className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleAction(booking.id, "reject")}
                        className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
