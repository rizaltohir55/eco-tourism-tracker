// src/App.jsx

import { useState, useEffect } from 'react';
import './App.css';
import MapComponent from './components/Map.jsx';
// 1. Impor komponen form baru kita
import AddDestinationForm from './components/AddDestinationForm.jsx';
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

  // 2. Buat fungsi untuk menangani data baru dari form
  // Fungsi ini akan menerima 'newDestination' dari komponen anak (form)
  const handleNewDestination = (newDestination) => {
    // Tambahkan destinasi baru ke dalam state 'destinations' yang sudah ada
    // Ini akan secara otomatis memicu re-render dan memperbarui peta serta daftar
    setDestinations(currentDestinations => [...currentDestinations, newDestination]);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Eco-Tourism Tracker</h1>
        <p>Temukan destinasi ramah lingkungan di seluruh Indonesia!</p>
      </header>

      <main className="App-main">
        {/* 3. Tampilkan komponen form dan teruskan fungsi handleNewDestination sebagai prop */}
        <AddDestinationForm onNewDestination={handleNewDestination} />

        <MapComponent destinations={destinations} />

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
