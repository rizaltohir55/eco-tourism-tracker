// src/components/Map.jsx

import React from 'react';
// 1. Impor 'Map' dan juga 'Marker'
import { Map, Marker } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

// 2. Komponen sekarang menerima 'destinations' sebagai sebuah prop
function MapComponent({ destinations }) {
  const initialViewState = {
    longitude: 118.015776,
    latitude: -2.548926,
    zoom: 4.5
  };

  const MAPTILER_API_KEY = import.meta.env.VITE_MAPTILER_API_KEY; // Mengambil dari .env
  const mapStyle = `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_API_KEY}`;

  return (
    <div style={{ height: '80vh', width: '100%' }}>
      <Map
        initialViewState={initialViewState}
        mapStyle={mapStyle}
      >
        {/* 3. Di sini kita melakukan looping pada data destinations */}
        {/* Pastikan destinations tidak kosong sebelum melakukan map */}
        {destinations && destinations.map(dest => (
          // 4. Untuk setiap destinasi, kita membuat sebuah komponen Marker
          // 'key' sangat penting untuk performa React
          <Marker
            key={dest.id}
            longitude={dest.longitude}
            latitude={dest.latitude}
            anchor="bottom" // Posisi ujung peniti marker
          >
            {/* Ini adalah tampilan marker kita. Untuk sekarang, kita gunakan emoji saja! */}
            <div style={{ fontSize: '24px', cursor: 'pointer' }}>📍</div>
          </Marker>
         ))}
      </Map>
    </div>
  );
}

export default MapComponent;
