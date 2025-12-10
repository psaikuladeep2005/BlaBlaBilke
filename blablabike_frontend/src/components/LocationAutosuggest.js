// src/components/LocationAutosuggest.js

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

const LocationAutosuggest = ({ placeholder, onPlaceSelected }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      setIsSearching(true);

      axios
        .get(NOMINATIM_URL, {
          params: {
            q: query,
            format: "json",
            limit: 5,
            countrycodes: "in",
          },
        })
        .then((response) => {
          const mappedSuggestions = response.data.map((item) => ({
            address: item.display_name,
            // CRITICAL: Ensure these are passed as floating point numbers
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
          }));
          setSuggestions(mappedSuggestions);
        })
        .catch((error) => console.error("Nominatim search failed:", error))
        .finally(() => setIsSearching(false));
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const handleSelect = (suggestion) => {
    onPlaceSelected(suggestion);
    setQuery(suggestion.address);
    setSuggestions([]);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setSuggestions([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  return (
    <div
      className="input-group"
      ref={wrapperRef}
      style={{ position: "relative" }}
    >
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        required
      />
      {(suggestions.length > 0 || isSearching) && (
        <ul className="suggestions-list">
          {isSearching && suggestions.length === 0 && <li>Searching...</li>}
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onMouseDown={(e) => {
                // Use onMouseDown to prevent input blur before click registers
                e.preventDefault();
                handleSelect(suggestion);
              }}
            >
              {suggestion.address}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationAutosuggest;
