// src/App.jsx
// Eco-Tourism Tracker — peta + daftar destinasi dengan search, filter tipe,
// form tambah, edit/hapus, dan panel detail.

import { useState, useEffect, useMemo, useRef, lazy, Suspense } from 'react';
import './App.css';

// Code-splitting: MapComponent menarik maplibre-gl (~1MB). Dengan lazy import,
// bundle peta hanya diunduh saat peta benar-benar dirender, bukan saat first load.
const MapComponent = lazy(() => import('./components/Map.jsx'));

import AddDestinationForm from './components/AddDestinationForm.jsx';
import DestinationDetails from './components/DestinationDetails.jsx';
import { supabase } from './supabaseClient.js';

const TYPES = ['Alam', 'Budaya', 'Kuliner', 'Akomodasi'];

// Jumlah baris skeleton yang dirender saat data masih dimuat.
const SKELETON_ROWS = 5;

function App() {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState('Semua');
  const [selected, setSelected] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const listRef = useRef(null);

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

  // Kosongkan pencarian dan kembalikan filter tipe ke 'Semua'.
  const handleResetFilter = () => {
    setSearchQuery('');
    setActiveType('Semua');
  };

  // Pindahkan destinasi yang dipilih dengan panah atas/bawah pada daftar.
  const handleListKeyDown = (e) => {
    if (filteredDestinations.length === 0) return;

    const currentIndex = selected
      ? filteredDestinations.findIndex((d) => d.id === selected.id)
      : -1;

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      let nextIndex;
      if (e.key === 'ArrowDown') {
        nextIndex = currentIndex < filteredDestinations.length - 1
          ? currentIndex + 1
          : 0;
      } else {
        nextIndex = currentIndex > 0
          ? currentIndex - 1
          : filteredDestinations.length - 1;
      }
      setSelected(filteredDestinations[nextIndex]);

      // Pastikan item yang dipilih selalu terlihat di dalam scroll container.
      const list = listRef.current;
      if (list && list.children[nextIndex]) {
        list.children[nextIndex].scrollIntoView({ block: 'nearest' });
      }
    } else if ((e.key === 'Enter' || e.key === ' ') && currentIndex >= 0) {
      e.preventDefault();
      setSelected(filteredDestinations[currentIndex]);
    }
  };

  // Indikator jumlah hasil yang sedang ditampilkan.
  const resultCount = loading
    ? 'Memuat...'
    : `${filteredDestinations.length} destinasi${activeType !== 'Semua' ? ` tipe ${activeType}` : ''}`;

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
              aria-label="Cari destinasi berdasarkan nama atau deskripsi"
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
              aria-label={showForm ? 'Tutup formulir tambah destinasi' : 'Buka formulir tambah destinasi'}
              aria-expanded={showForm}
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
            <div className="destinations-list-head">
              <h2>Daftar Destinasi</h2>
              <span className="result-count" role="status" aria-live="polite">
                {resultCount}
              </span>
            </div>
            {fetchError && (
              <p className="error-message">Gagal memuat data: {fetchError}</p>
            )}
            {loading ? (
              <ul className="skeleton-list" aria-hidden="true">
                {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                  <li key={i} className="skeleton-row">
                    <span className="skeleton-badge shimmer" />
                    <span className="skeleton-line shimmer" />
                  </li>
                ))}
              </ul>
            ) : filteredDestinations.length > 0 ? (
              <ul
                ref={listRef}
                role="listbox"
                aria-label="Daftar destinasi"
                tabIndex="0"
                onKeyDown={handleListKeyDown}
              >
                {filteredDestinations.map((dest) => {
                  const isSelected = selected && selected.id === dest.id;
                  return (
                    <li
                      key={dest.id}
                      role="option"
                      aria-selected={isSelected ? 'true' : 'false'}
                      className={isSelected ? 'selected' : ''}
                      onClick={() => setSelected(dest)}
                    >
                      <span className={`type-badge type-${String(dest.type).toLowerCase()}`}>
                        {dest.type}
                      </span>
                      <span className="dest-name">{dest.name}</span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon" aria-hidden="true">🗺️🔍</div>
                <p className="empty-state-title">
                  Tidak ada destinasi yang cocok
                </p>
                <p className="empty-state-hint">
                  Coba kata kunci lain atau setel ulang filter untuk melihat
                  semua destinasi.
                </p>
                <button
                  className="reset-filter-btn"
                  onClick={handleResetFilter}
                  aria-label="Reset filter pencarian dan tipe destinasi"
                >
                  ⟲ Reset filter
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="map-wrap">
          <Suspense fallback={
            <div className="map-loading" role="status" aria-live="polite">
              Memuat peta…
            </div>
          }>
            <MapComponent
              destinations={filteredDestinations}
              selected={selected}
              onSelect={setSelected}
            />
          </Suspense>
        </div>
      </main>
    </div>
  );
}

export default App;
