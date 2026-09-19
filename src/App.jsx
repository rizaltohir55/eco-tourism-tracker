// src/App.jsx
// Eco-Tourism Tracker — peta + daftar destinasi dengan search, filter tipe,
// form tambah, edit/hapus, dan panel detail.

import { useState, useEffect, useMemo } from 'react';
import './App.css';
import MapComponent from './components/Map.jsx';
import AddDestinationForm from './components/AddDestinationForm.jsx';
import DestinationDetails from './components/DestinationDetails.jsx';
import { supabase } from './supabaseClient.js';

const TYPES = ['Alam', 'Budaya', 'Kuliner', 'Akomodasi'];

function App() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState('Semua');
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    async function getDestinations() {
      setLoading(true);
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .order('id');

      if (error) {
        setFetchError(error.message);
        console.error('Error fetching data:', error);
      } else {
        setDestinations(data);
      }
      setLoading(false);
    }
    getDestinations();
  }, []);

  // Destinasi yang sudah difilter berdasarkan search + filter tipe.
  const filteredDestinations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return destinations.filter((dest) => {
      const matchesQuery = !q ||
        dest.name.toLowerCase().includes(q) ||
        (dest.description || '').toLowerCase().includes(q);
      const matchesType = activeType === 'Semua' || dest.type === activeType;
      return matchesQuery && matchesType;
    });
  }, [destinations, searchQuery, activeType]);

  const handleNewDestination = (newDestination) => {
    setDestinations(current => [...current, newDestination]);
  };

  const handleUpdatedDestination = (updated) => {
    setDestinations(current =>
      current.map((d) => (d.id === updated.id ? updated : d))
    );
    setSelected(updated);
  };

  const handleDeletedDestination = (deleted) => {
    setDestinations(current => current.filter((d) => d.id !== deleted.id));
    setSelected(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Eco-Tourism Tracker</h1>
        <p>Temukan destinasi ramah lingkungan di seluruh Indonesia!</p>
      </header>

      <main className="App-main">
        <div className="sidebar">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Cari nama / deskripsi destinasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              value={activeType}
              onChange={(e) => setActiveType(e.target.value)}
              aria-label="Filter tipe destinasi"
            >
              <option value="Semua">Semua Tipe</option>
              {TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <button
              className="toggle-form-btn"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? 'Tutup Form' : '+ Tambah Destinasi'}
            </button>
          </div>

          {showForm && (
            <AddDestinationForm
              onNewDestination={(d) => {
                handleNewDestination(d);
                setShowForm(false);
                setSelected(d);
              }}
            />
          )}

          {selected && (
            <DestinationDetails
              destination={selected}
              onClose={() => setSelected(null)}
              onUpdated={handleUpdatedDestination}
              onDeleted={handleDeletedDestination}
            />
          )}

          <div className="destinations-list">
            <h2>Daftar Destinasi ({filteredDestinations.length})</h2>
            {fetchError && (
              <p className="error-message">Gagal memuat data: {fetchError}</p>
            )}
            {loading ? (
              <p>Memuat data destinasi...</p>
            ) : filteredDestinations.length > 0 ? (
              <ul>
                {filteredDestinations.map((dest) => (
                  <li
                    key={dest.id}
                    className={selected && selected.id === dest.id ? 'selected' : ''}
                    onClick={() => setSelected(dest)}
                  >
                    <span className={`type-badge type-${String(dest.type).toLowerCase()}`}>
                      {dest.type}
                    </span>
                    <span className="dest-name">{dest.name}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Tidak ada destinasi yang cocok.</p>
            )}
          </div>
        </div>

        <div className="map-wrap">
          <MapComponent
            destinations={filteredDestinations}
            selected={selected}
            onSelect={setSelected}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
