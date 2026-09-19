// src/components/DestinationDetails.jsx
// Panel detail destinasi: tampilkan info lengkap + aksi edit/hapus.

import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

function DestinationDetails({ destination, onClose, onUpdated, onDeleted }) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State lokal untuk mode edit (diisi saat tombol Edit diklik).
  const [form, setForm] = useState({
    name: destination.name,
    description: destination.description || '',
    type: destination.type || 'Alam',
    latitude: String(destination.latitude),
    longitude: String(destination.longitude),
  });

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: updateError } = await supabase
      .from('destinations')
      .update({
        name: form.name,
        description: form.description,
        type: form.type,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
      })
      .eq('id', destination.id)
      .select()
      .single();

    if (updateError) {
      setError(updateError.message);
    } else {
      onUpdated(data);
      setEditing(false);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    const { error: deleteError } = await supabase
      .from('destinations')
      .delete()
      .eq('id', destination.id);

    if (deleteError) {
      setError(deleteError.message);
    } else {
      onDeleted(destination);
    }
    setLoading(false);
  };

  const inputStyle = { display: 'block', width: '100%', marginBottom: '8px', padding: '6px' };

  return (
    <div className="details-panel">
      <button className="close-btn" onClick={onClose} aria-label="Tutup detail">✕</button>

      {editing ? (
        <form onSubmit={handleUpdate}>
          <h3>Edit Destinasi</h3>
          <input style={inputStyle} type="text" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <textarea style={inputStyle} value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Deskripsi" />
          <select style={inputStyle} value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="Alam">Alam</option>
            <option value="Budaya">Budaya</option>
            <option value="Kuliner">Kuliner</option>
            <option value="Akomodasi">Akomodasi</option>
          </select>
          <input style={inputStyle} type="number" step="any" value={form.latitude}
            onChange={(e) => setForm({ ...form, latitude: e.target.value })} required />
          <input style={inputStyle} type="number" step="any" value={form.longitude}
            onChange={(e) => setForm({ ...form, longitude: e.target.value })} required />
          <button type="submit" disabled={loading}>
            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
          <button type="button" onClick={() => setEditing(false)} disabled={loading}>Batal</button>
          {error && <p className="error-message">Error: {error}</p>}
        </form>
      ) : (
        <>
          <span className="detail-type-badge">{destination.type}</span>
          <h2>{destination.name}</h2>
          <p className="detail-description">
            {destination.description || 'Belum ada deskripsi untuk destinasi ini.'}
          </p>
          <p className="detail-coords">
            📍 {Number(destination.latitude).toFixed(4)}, {Number(destination.longitude).toFixed(4)}
          </p>

          <div className="detail-actions">
            <button onClick={() => setEditing(true)} disabled={loading}>✏️ Edit</button>
            <button className="danger" onClick={handleDelete} disabled={loading}>
              {loading ? 'Menghapus...' : '🗑️ Hapus'}
            </button>
          </div>
          {error && <p className="error-message">Error: {error}</p>}
        </>
      )}
    </div>
  );
}

export default DestinationDetails;
