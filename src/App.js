import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MapComponent from './MapComponent';
import SharedMapComponent from './SharedMapComponent';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MapComponent />} />
        <Route path="/shared-map/:shareId" element={<SharedMapComponent />} />
      </Routes>
    </Router>
  );
}

export default App;