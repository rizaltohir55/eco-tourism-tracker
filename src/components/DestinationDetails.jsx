// src/components/DestinationDetails.jsx
// Panel detail destinasi: tampilkan info lengkap + aksi edit/hapus.
// Dirender sebagai dialog modal (role="dialog", aria-modal) dengan
// fokus otomatis ke tombol close, tombol Escape untuk menutup,
// dan focus trap sederhana agar Tab tetap di dalam panel.

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';

function DestinationDetails({ destination, onClose, onUpdated, onDeleted }) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const panelRef = useRef(null);
  const closeBtnRef = useRef(null);

  // State lokal untuk mode edit (diisi saat tombol Edit diklik).
  const [form, setForm] = useState({
    name: destination.name,
    description: destination.description || '',
    type: destination.type || 'Alam',
    latitude: String(destination.latitude),
    longitude: String(destination.longitude),
  });

  // Pindahkan fokus ke tombol close saat dialog dibuka, dan pasang
  // listener Escape untuk menutup panel.
  useEffect(() => {
    if (closeBtnRef.current) closeBtnRef.current.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }

      // Focus trap: pastikan Tab / Shift+Tab tetap di dalam dialog.
      if (e.key === 'Tab' && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

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
    <div
      className="details-panel"
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-title"
    >
      <button
        className="close-btn"
        ref={closeBtnRef}
        onClick={onClose}
        aria-label="Tutup detail destinasi"
      >
        ✕
      </button>

      {editing ? (
        <form onSubmit={handleUpdate}>
          <h3 id="detail-title">Edit Destinasi</h3>
          <label className="visually-hidden" htmlFor="edit-name">Nama destinasi</label>
          <input style={inputStyle} id="edit-name" type="text" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <label className="visually-hidden" htmlFor="edit-description">Deskripsi destinasi</label>
          <textarea style={inputStyle} id="edit-description" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Deskripsi" />
          <label className="visually-hidden" htmlFor="edit-type">Tipe destinasi</label>
          <select style={inputStyle} id="edit-type" value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="Alam">Alam</option>
            <option value="Budaya">Budaya</option>
            <option value="Kuliner">Kuliner</option>
            <option value="Akomodasi">Akomodasi</option>
          </select>
          <label className="visually-hidden" htmlFor="edit-latitude">Latitude</label>
          <input style={inputStyle} id="edit-latitude" type="number" step="any" value={form.latitude}
            onChange={(e) => setForm({ ...form, latitude: e.target.value })} required />
          <label className="visually-hidden" htmlFor="edit-longitude">Longitude</label>
          <input style={inputStyle} id="edit-longitude" type="number" step="any" value={form.longitude}
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
          <h2 id="detail-title">{destination.name}</h2>
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
