// src/components/Map.jsx

// 1. Impor 'useState' dari React
import React, { useState } from 'react';
// 2. Impor 'Map', 'Marker', dan sekarang 'Popup'
import { Map, Marker, Popup } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

function MapComponent({ destinations }) {
  // 3. Buat state baru untuk menyimpan informasi popup yang sedang aktif.
  // Awalnya null, yang berarti tidak ada popup yang ditampilkan.
  const [popupInfo, setPopupInfo] = useState(null);

  const initialViewState = {
    longitude: 118.015776,
    latitude: -2.548926,
    zoom: 4.5
  };

  const MAPTILER_API_KEY = import.meta.env.VITE_MAPTILER_API_KEY;
  const mapStyle = `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_API_KEY}`;

  return (
    <div style={{ height: '80vh', width: '100%' }}>
      <Map
        initialViewState={initialViewState}
        mapStyle={mapStyle}
      >
        {/* Looping untuk membuat Marker untuk setiap destinasi */}
        {destinations && destinations.map(dest => (
          <Marker
            key={dest.id}
            longitude={dest.longitude}
            latitude={dest.latitude}
            anchor="bottom"
          >
            {/* 4. Saat div emoji ini diklik, kita set popupInfo menjadi data destinasi ini */}
            <div 
              style={{ fontSize: '24px', cursor: 'pointer' }}
              onClick={e => {
                // Jangan biarkan klik ini juga dianggap sebagai klik pada peta
                e.stopPropagation( );
                setPopupInfo(dest);
              }}
            >
              📍
            </div>
          </Marker>
        ))}

        {/* 5. Bagian untuk menampilkan Popup */}
        {/* Jika popupInfo ada isinya (tidak null), maka tampilkan komponen Popup */}
        {popupInfo && (
          <Popup
            anchor="top"
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            // Saat tombol close (x) pada popup diklik, set popupInfo kembali ke null
            onClose={() => setPopupInfo(null)}
          >
            <div>
              <h3>{popupInfo.name}</h3>
              <p>{popupInfo.description}</p>
              <p>Tipe: {popupInfo.type}</p>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}

export default MapComponent;
