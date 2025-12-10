// src/components/PublishRide.js (Final Fixed Version)

import React, { useState, useContext } from "react";
import api from "../api/axios";
import AuthContext from "../context/AuthContext";
import LocationAutosuggest from "./LocationAutosuggest";

// Define a constant for required decimal precision
const COORDINATE_PRECISION = 6;

const PublishRide = () => {
  const { authToken } = useContext(AuthContext);

  const [rideData, setRideData] = useState({
    pickup_address: "",
    destination_address: "",
    // Initialized to null for required fields until selection is made
    pickup_latitude: null,
    pickup_longitude: null,
    destination_latitude: null,
    destination_longitude: null,
    start_time: "",
    seats_available: 1,
    price_per_seat: 0.0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    let newValue = value;
    // Ensure seats and price are sent as numbers
    if (name === "seats_available" || name === "price_per_seat") {
      newValue = Number(value) || 0;
    }

    setRideData({ ...rideData, [name]: newValue });
  };

  const handlePickupSelected = (place) => {
    setRideData((prevData) => ({
      ...prevData,
      pickup_address: place.address,
      // Store raw float value from autosuggest
      pickup_latitude: parseFloat(place.latitude),
      pickup_longitude: parseFloat(place.longitude),
    }));
  };

  const handleDestinationSelected = (place) => {
    setRideData((prevData) => ({
      ...prevData,
      destination_address: place.address,
      // Store raw float value from autosuggest
      destination_latitude: parseFloat(place.latitude),
      destination_longitude: parseFloat(place.longitude),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!authToken) {
      alert("Please log in to publish a ride.");
      return;
    }

    // -----------------------------------------------------------------
    // CRITICAL FIX: Rounding the coordinates to 6 decimal places (String conversion)
    // toFixed(6) returns a string, so we must parse it back to a number!
    // -----------------------------------------------------------------

    // Helper to safely round and convert to number
    const roundCoord = (coord) => {
      if (coord === null || isNaN(coord)) return 0;
      // 1. Round to 6 decimals (returns string) -> 2. Convert back to Number
      return Number(coord.toFixed(COORDINATE_PRECISION));
    };

    const finalData = {
      ...rideData,
      // Apply rounding and ensure non-null status for required fields
      pickup_latitude: roundCoord(rideData.pickup_latitude),
      pickup_longitude: roundCoord(rideData.pickup_longitude),
      destination_latitude: roundCoord(rideData.destination_latitude),
      destination_longitude: roundCoord(rideData.destination_longitude),

      // Ensure time is not empty before sending
      start_time: new Date(rideData.start_time).toISOString(),
    };

    try {
      // The API call uses finalData which now contains correctly rounded numbers
      await api.post("/api/rides/", finalData, {
        headers: {
          Authorization: `Token ${authToken}`,
          "Content-Type": "application/json",
        },
      });
      alert("Ride published successfully!");
      // TODO: Implement form clear/reset here
    } catch (error) {
      console.error("Ride publication failed:", error.response.data);
      // If any validation errors remain, they will be logged here.
      alert("Failed to publish ride. Check console for details.");
    }
  };

  return (
    <div className="glass-container">
      <div className="glass-card">
        <h2>Publish a New BlaBlaBike Ride</h2>
        <form onSubmit={handleSubmit}>
          <LocationAutosuggest
            placeholder="Pickup Point"
            onPlaceSelected={handlePickupSelected}
          />

          <LocationAutosuggest
            placeholder="Destination Point"
            onPlaceSelected={handleDestinationSelected}
          />

          <input
            type="datetime-local"
            name="start_time"
            value={rideData.start_time}
            onChange={handleChange}
            required
          />

          <input
            type="number"
            name="seats_available"
            placeholder="Seats Available"
            value={rideData.seats_available}
            onChange={handleChange}
            min="1"
            max="10"
            required
          />

          <input
            type="number"
            name="price_per_seat"
            placeholder="Price per Seat (e.g., 50.00)"
            value={rideData.price_per_seat}
            onChange={handleChange}
            step="0.01"
            required
          />

          <button type="submit" className="primary-button">
            Publish Ride
          </button>
        </form>
      </div>
    </div>
  );
};

export default PublishRide;
