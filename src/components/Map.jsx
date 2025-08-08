// src/components/Map.jsx

import React from 'react';
// PERUBAHAN 1: Kita mengimpor Map dari sub-folder spesifik untuk maplibre
import Map from 'react-map-gl/maplibre'; 
import 'maplibre-gl/dist/maplibre-gl.css';

function MapComponent() {
  const initialViewState = {
    longitude: 118.015776,
    latitude: -2.548926,
    zoom: 4.5
  };

  // Pastikan Anda sudah mengganti ini dengan API Key Anda
  const MAPTILER_API_KEY = 'LWFRGqhnZVLXjV3w4PXK'; 
  const mapStyle = `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_API_KEY}`;

  return (
    // Kita beri style langsung di sini untuk memastikan peta terlihat
    <div style={{ height: '80vh', width: '100%' }}>
      <Map
        initialViewState={initialViewState}
        mapStyle={mapStyle}
        // PERUBAHAN 2: Baris mapLib={...} sudah tidak diperlukan lagi
        // karena kita sudah mengimpor versi MapLibre secara langsung.
      />
    </div>
   );
}

export default MapComponent;
