// src/App.jsx

import { useState, useEffect } from 'react';
import './App.css';
import MapComponent from './components/Map.jsx';
import { supabase } from './supabaseClient.js';

function App() {
  const [destinations, setDestinations] = useState([]);

  useEffect(() => {
    async function getDestinations() {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .order('id');

      if (error) {
        console.error('Error fetching data:', error);
      } else {
        setDestinations(data);
      }
    }
    getDestinations();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Eco-Tourism Tracker</h1>
        <p>Temukan destinasi ramah lingkungan di seluruh Indonesia!</p>
      </header>

      <main className="App-main">
        {/* PERUBAHAN DI SINI: Kita mengirim data 'destinations' ke dalam MapComponent */}
        <MapComponent destinations={destinations} />

        {/* Kita bisa tetap menampilkan daftar teks untuk debugging */}
        <div className="destinations-list">
          <h2>Daftar Destinasi (dari Database)</h2>
          {destinations.length > 0 ? (
            <ul>
              {destinations.map((dest) => (
                <li key={dest.id}>{dest.name}</li>
              ))}
            </ul>
          ) : (
            <p>Memuat data destinasi atau tidak ada data...</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
