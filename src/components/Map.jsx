// src/components/Map.jsx
// Peta MapLibre dengan marker per tipe destinasi, popup, dan fly-to
// saat destinasi dipilih dari panel daftar/search.
//
// TILE SOURCE: gratis, tanpa registrasi.
//   - Utama  : OSM Americana (vector) — openstreetmap.us
//   - Fallback: raster OSM standar — tile.openstreetmap.org
// MapLibre bisa pakai tile raster langsung lewat style.sources; style
// raster di-define inline di bawah (tanpa style.json eksternal).

import React, { useState, useRef, useEffect } from 'react';
// "react-map-gl/maplibre" = entry khusus MapLibre (v8 memisahkan entry.mapbox
// dan entry.maplibre). Import ini pula yang membawa maplibre-gl ke chunk peta.
import { Map, Marker, Popup } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

// Warna marker per tipe destinasi (default hijau untuk tipe tak dikenal).
const TYPE_COLORS = {
  Alam: '#2e7d32',
  Budaya: '#7b1fa2',
  Kuliner: '#e65100',
  Akomodasi: '#1565c0',
};

// Style utama: OSM Americana (vector tiles gratis, tanpa key).
const VECTOR_STYLE = 'https://americanamap.org/style.json';
// Style fallback: raster OSM standar, di-define inline (peta tetap jalan
// walau CDN vector sedang down).
const RASTER_STYLE = {
  version: 8,
  name: 'OSM Standard (raster fallback)',
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'osm-raster',
      type: 'raster',
      source: 'osm',
      paint: {},
    },
  ],
};

function MapComponent({ destinations, selected, onSelect }) {
  const [popupInfo, setPopupInfo] = useState(null);
  const [mapStyle, setMapStyle] = useState(VECTOR_STYLE);
  const [sourceOk, setSourceOk] = useState(null); // null = belum dicek
  const mapRef = useRef(null);

  const initialViewState = {
    longitude: 118.015776,
    latitude: -2.548926,
    zoom: 4.5
  };

  // Cek ketersediaan vector style sekali saat mount; kalau gagal, pakai raster.
  useEffect(() => {
    let cancelled = false;
    fetch(VECTOR_STYLE)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(() => {
        if (!cancelled) {
          setSourceOk(true);
          setMapStyle(VECTOR_STYLE);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSourceOk(false);
          setMapStyle(RASTER_STYLE);
        }
      });
    return () => { cancelled = true; };
  }, []);

  // Terbang ke destinasi yang dipilih dari daftar/search.
  useEffect(() => {
    if (selected && mapRef.current) {
      mapRef.current.flyTo({
        center: [selected.longitude, selected.latitude],
        zoom: Math.max(mapRef.current.getZoom(), 8),
        duration: 800,
      });
      setPopupInfo(selected);
    }
  }, [selected]);

  return (
    <div style={{ height: '80vh', width: '100%', position: 'relative' }}>
      <Map
        ref={mapRef}
        initialViewState={initialViewState}
        mapStyle={mapStyle}
      >
        {destinations && destinations.map(dest => {
          const isSelected = selected && selected.id === dest.id;
          const color = TYPE_COLORS[dest.type] || '#2e7d32';
          return (
            <Marker
              key={dest.id}
              longitude={dest.longitude}
              latitude={dest.latitude}
              anchor="bottom"
            >
              <div
                style={{
                  fontSize: isSelected ? '34px' : '24px',
                  cursor: 'pointer',
                  filter: isSelected
                    ? 'drop-shadow(0 0 6px rgba(0,0,0,0.45))'
                    : 'none',
                  transition: 'font-size 120ms',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(dest);
                  setPopupInfo(dest);
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: color,
                    border: '2px solid white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                  }}
                  title={`${dest.name} (${dest.type})`}
                />
              </div>
            </Marker>
          );
        })}

        {popupInfo && (
          <Popup
            anchor="top"
            longitude={popupInfo.longitude}
            latitude={popupInfo.latitude}
            onClose={() => setPopupInfo(null)}
            closeOnClick={false}
          >
            <div className="popup-content">
              <h3>{popupInfo.name}</h3>
              <p>{popupInfo.description}</p>
              <p>Tipe: {popupInfo.type}</p>
            </div>
          </Popup>
        )}
      </Map>

      {sourceOk === false && (
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            left: 12,
            zIndex: 5,
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #ccc',
            borderRadius: 6,
            padding: '6px 10px',
            fontSize: '0.75rem',
            color: '#555',
          }}
        >
          Peta raster fallback (tile OSM) — style utama sedang tidak tersedia
        </div>
      )}
    </div>
  );
}

export default MapComponent;
