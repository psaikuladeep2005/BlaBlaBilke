// src/components/MyBookedRides.js (Passenger History View)

import React, { useState, useEffect, useContext, useCallback } from "react";
import api from "../api/axios";
import AuthContext from "../context/AuthContext";

// Helper function for styling based on status
const getStatusStyles = (status) => {
  switch (status) {
    case "PENDING":
      return {
        color: "#f4a543",
        border: "1px solid #007aff",
        background: "#2a3d60",
      };
    case "ACCEPTED":
      return {
        color: "#4CAF50",
        border: "1px solid #4CAF50",
        background: "#1a3340",
      };
    case "REJECTED":
      return {
        color: "#f44336",
        border: "1px solid #f44336",
        background: "#332733",
      };
    default:
      return { color: "#fff", border: "none", background: "#1f3458" };
  }
};

const MyBookedRides = () => {
  const { authToken } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Endpoint registered as /api/passenger/bookings/
  const PASSENGER_BOOKINGS_URL = "/api/passenger/bookings/";

  const fetchBookings = useCallback(async () => {
    if (!authToken) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Fetch bookings where the current user is the passenger
      const response = await api.get(PASSENGER_BOOKINGS_URL, {
        headers: { Authorization: `Token ${authToken}` },
      });
      setBookings(response.data);
    } catch (error) {
      console.error(
        "Error fetching passenger bookings:",
        error.response || error
      );
    } finally {
      setLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  if (loading) return <p>Loading your booked rides...</p>;

  return (
    <div className="glass-container">
      <div className="glass-card" style={{ maxWidth: "700px" }}>
        <h2>My Booked Rides History</h2>

        {bookings.length === 0 ? (
          <p>
            You have not booked any rides yet. Find a ride on the Home page!
          </p>
        ) : (
          bookings.map((booking) => {
            const { color, border, background } = getStatusStyles(
              booking.status
            );

            return (
              <div
                key={booking.id}
                className="result-card"
                style={{
                  marginBottom: "15px",
                  padding: "15px",
                  border: border,
                  backgroundColor: background,
                  borderRadius: "10px",
                  textAlign: "left",
                  color: "#fff",
                }}
              >
                <p>
                  <strong>Ride:</strong> {booking.ride_info}
                </p>
                <p>
                  <strong>Seats Booked:</strong> {booking.seats_booked}
                </p>

                <p style={{ marginBottom: "10px" }}>
                  <strong>Status:</strong>
                  <span
                    style={{
                      color: color,
                      fontWeight: "bold",
                      marginLeft: "10px",
                    }}
                  >
                    {booking.status}
                  </span>
                </p>

                {/* CRITICAL: DRIVER CONTACT DISPLAY LOGIC */}
                {/* The 'booking.driver_contact' field ONLY exists in the API response 
                                   if the status is 'ACCEPTED' due to backend serializer logic. */}
                {booking.status === "ACCEPTED" && booking.driver_contact && (
                  <div
                    style={{
                      borderTop: "1px solid rgba(255,255,255,0.1)",
                      paddingTop: "10px",
                      marginTop: "10px",
                    }}
                  >
                    <p style={{ color: color, fontWeight: "bold" }}>
                      Ride Confirmed! Contact Driver:
                    </p>
                    <p>
                      <strong>Driver:</strong> {booking.driver_contact.username}
                    </p>
                    <p>
                      <strong>Phone:</strong>
                      <a
                        href={`tel:${booking.driver_contact.phone_number}`}
                        style={{ color: "#007aff", textDecoration: "none" }}
                      >
                        {booking.driver_contact.phone_number}
                      </a>
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MyBookedRides;
