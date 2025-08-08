// src/App.jsx

import { useState, useEffect } from 'react';
import './App.css';
import MapComponent from './components/Map.jsx';
// 1. Impor client supabase yang sudah kita buat
import { supabase } from './supabaseClient.js';

function App() {
  // 2. Siapkan "wadah" kosong untuk menyimpan data destinasi kita.
  // 'destinations' akan menjadi array, dan 'setDestinations' adalah fungsi untuk mengisinya.
  const [destinations, setDestinations] = useState([]);

  // 3. useEffect adalah "hook" React yang berjalan setelah komponen ditampilkan.
  // Ini adalah tempat yang tepat untuk mengambil data.
  useEffect(() => {
    // 4. Buat fungsi async di dalam useEffect untuk mengambil data.
    async function getDestinations() {
      // 5. Ini adalah perintah Supabase:
      // "Dari tabel 'destinations', pilih semua kolom (*), dan urutkan berdasarkan id"
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .order('id');

      if (error) {
        console.error('Error fetching data:', error);
      } else {
        // 6. Jika berhasil, isi "wadah" kita dengan data yang didapat.
        setDestinations(data);
      }
    }

    // Panggil fungsi tersebut
    getDestinations();
  }, []); // Array kosong [] berarti useEffect ini hanya berjalan satu kali saat komponen pertama kali dimuat.

  return (
    <div className="App">
      <header className="App-header">
        <h1>Eco-Tourism Tracker</h1>
        <p>Temukan destinasi ramah lingkungan di seluruh Indonesia!</p>
      </header>

      <main className="App-main">
        <MapComponent />

        {/* 7. Tampilkan daftar destinasi yang sudah kita ambil */}
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
