// src/components/AddDestinationForm.jsx

import React, { useState } from 'react';
import { supabase } from '../supabaseClient'; // Impor koneksi Supabase

// Komponen ini menerima sebuah fungsi 'onNewDestination' sebagai prop
// Fungsi ini akan dipanggil setelah destinasi baru berhasil ditambahkan
function AddDestinationForm({ onNewDestination }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [type, setType] = useState('Alam'); // Nilai default untuk dropdown
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Mencegah form dari refresh halaman
    setLoading(true);
    setError(null);

    // Mengirim data ke tabel 'destinations' di Supabase
    const { data, error: insertError } = await supabase
      .from('destinations')
      .insert([
        { name, description, latitude, longitude, type },
      ])
      .select() // .select() akan mengembalikan data yang baru saja dimasukkan
      .single(); // Kita tahu kita hanya memasukkan satu baris

    if (insertError) {
      setError(insertError.message);
      console.error('Error inserting data:', insertError);
    } else {
      // Jika berhasil, panggil fungsi onNewDestination dari parent (App.jsx)
      // untuk memberitahu bahwa ada data baru
      onNewDestination(data);

      // Kosongkan kembali form
      setName('');
      setDescription('');
      setLatitude('');
      setLongitude('');
      setType('Alam');
    }

    setLoading(false);
  };

  return (
    <div className="form-container">
      <h2>Tambah Destinasi Baru</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Nama Destinasi" value={name} onChange={(e) => setName(e.target.value)} required />
        <textarea placeholder="Deskripsi" value={description} onChange={(e) => setDescription(e.target.value)} />
        <input type="number" step="any" placeholder="Latitude" value={latitude} onChange={(e) => setLatitude(e.target.value)} required />
        <input type="number" step="any" placeholder="Longitude" value={longitude} onChange={(e) => setLongitude(e.target.value)} required />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="Alam">Alam</option>
          <option value="Budaya">Budaya</option>
          <option value="Kuliner">Kuliner</option>
          <option value="Akomodasi">Akomodasi</option>
        </select>
        <button type="submit" disabled={loading}>
          {loading ? 'Menyimpan...' : 'Simpan Destinasi'}
        </button>
        {error && <p className="error-message">Error: {error}</p>}
      </form>
    </div>
  );
}

export default AddDestinationForm;
