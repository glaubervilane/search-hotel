import React from 'react';
import './App.css';
import HotelSearch from './components/HotelSearch';

function App() {
  return (
    <div className="App">
      <HotelSearch
        initialCenter={{ lat: 51.049999, lng: -114.066666 }}
      />
    </div>
  );
}

export default App;
