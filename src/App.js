import React, { useState } from 'react';
import './App.css';
import HotelSearch from './components/HotelSearch';

function App() {
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState({ lat: 51.049999, lng: -114.066666 });

  const handleLocationChange = (e) => {
    setLocation(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (location) {
      const newCoordinates = await fetchCoordinates(location);
      setCoordinates(newCoordinates);
    }
  };

  const fetchCoordinates = async (location) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${process.env.REACT_APP_GOOGLE_API_KEY}`
      );
      const data = await response.json();
      if (data.status === 'OK' && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        return { lat, lng };
      } else {
        console.error('Location not found');
        return coordinates; // Return the current coordinates if the location is not found
      }
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      return coordinates; // Return the current coordinates on error
    }
  };

  return (
    <div className="App">
      <form onSubmit={handleSubmit}>
        <input
          className="input-field"
          type="text"
          placeholder="Enter location (e.g., city name)"
          value={location}
          onChange={handleLocationChange}
        />
        <button className="search-button" type="submit">Search</button>
      </form>
      <HotelSearch initialCenter={coordinates} />
    </div>
  );
}

export default App;
