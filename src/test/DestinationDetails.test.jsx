// src/test/DestinationDetails.test.jsx
// Test tombol Edit & Hapus + handler onUpdated/onDeleted setelah mock resolve.
//
// vi.mock di-hoisted ke atas file, jadi behavior per-test diatur lewat
// `mockState` (vi.hoisted) — TIDAK ada koneksi Supabase nyata.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import DestinationDetails from '../components/DestinationDetails.jsx';

const DESTINATION = {
  id: 2,
  name: 'Kampung Adat Sade',
  description: 'Desa adat Sasak yang melestarikan tradisi.',
  type: 'Budaya',
  latitude: -8.6511,
  longitude: 116.2831,
};

// State mock yang bisa diubah per-test (di-hoisted bersama vi.mock).
const mockState = vi.hoisted(() => ({ data: null, error: null, calls: {} }));

vi.mock('../supabaseClient.js', async () => {
  const { makeSupabaseMock } = await import('./__mocks__/supabaseMock.js');
  return { supabase: makeSupabaseMock(mockState) };
});

function renderPanel() {
  const onUpdated = vi.fn();
  const onDeleted = vi.fn();
  const onClose = vi.fn();

  const utils = render(
    <DestinationDetails
      destination={DESTINATION}
      onClose={onClose}
      onUpdated={onUpdated}
      onDeleted={onDeleted}
    />,
  );

  return { utils, onUpdated, onDeleted, onClose, calls: mockState.calls };
}

describe('DestinationDetails — tombol Edit & Hapus', () => {
  beforeEach(() => {
    mockState.data = null;
    mockState.error = null;
    mockState.calls = {};
    vi.clearAllMocks();
  });

  it('merender tombol Edit dan Hapus', () => {
    renderPanel();

    expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Hapus/i })).toBeInTheDocument();
  });

  it('menampilkan info destinasi (nama, tipe, koordinat, deskripsi)', () => {
    renderPanel();

    expect(screen.getByRole('heading', { name: 'Kampung Adat Sade' })).toBeInTheDocument();
    expect(screen.getByText('Budaya')).toBeInTheDocument();
    expect(screen.getByText(/8\.6511,\s*116\.2831/)).toBeInTheDocument();
    expect(screen.getByText(/Desa adat Sasak yang melestarikan tradisi/)).toBeInTheDocument();
  });

  it('memanggil onUpdated dengan hasil mock update setelah tombol Simpan', async () => {
    const user = userEvent.setup();
    mockState.data = { ...DESTINATION, name: 'Kampung Adat Sade Renovasi' };
    const { onUpdated, calls } = renderPanel();

    await user.click(screen.getByRole('button', { name: /Edit/i }));
    const nameInput = screen.getByDisplayValue('Kampung Adat Sade');
    await user.clear(nameInput);
    await user.type(nameInput, 'Kampung Adat Sade Renovasi');

    await user.click(screen.getByRole('button', { name: /Simpan Perubahan/i }));

    // Payload update diteruskan ke supabase mock.
    expect(calls.update).toMatchObject({ name: 'Kampung Adat Sade Renovasi', type: 'Budaya' });
    // Handler dipanggil dengan data hasil mock (bukan input mentah).
    await vi.waitFor(() =>
      expect(onUpdated).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Kampung Adat Sade Renovasi', id: 2 }),
      ),
    );
    // Keluar dari mode edit setelah sukses: tombol Edit kembali tampil.
    await vi.waitFor(() =>
      expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument(),
    );
    // Form edit tidak lagi dirender.
    expect(screen.queryByText('Edit Destinasi')).not.toBeInTheDocument();
  });

  it('mengubah tipe destinasi lewat form edit', async () => {
    const user = userEvent.setup();
    const { onUpdated, calls } = renderPanel();

    await user.click(screen.getByRole('button', { name: /Edit/i }));
    const typeSelect = screen.getByDisplayValue('Budaya');
    await user.selectOptions(typeSelect, 'Alam');

    await user.click(screen.getByRole('button', { name: /Simpan Perubahan/i }));

    expect(calls.update).toMatchObject({ type: 'Alam' });
    await vi.waitFor(() => expect(onUpdated).toHaveBeenCalled());
    expect(onUpdated).toHaveBeenCalledWith(expect.objectContaining({ type: 'Alam' }));
  });

  it('memanggil onDeleted dengan destinasi setelah mock delete resolve', async () => {
    const user = userEvent.setup();
    const { onDeleted, calls } = renderPanel();

    await user.click(screen.getByRole('button', { name: /Hapus/i }));

    await vi.waitFor(() => expect(calls.delete).toBe(true));
    await vi.waitFor(() =>
      expect(onDeleted).toHaveBeenCalledWith(expect.objectContaining({ id: 2 })),
    );
    expect(onDeleted).toHaveBeenCalledTimes(1);
  });

  it('menampilkan error tanpa memanggil handler saat update gagal', async () => {
    const user = userEvent.setup();
    mockState.error = { message: 'Gagal memperbarui data (mock)' };
    const { onUpdated, onDeleted } = renderPanel();

    await user.click(screen.getByRole('button', { name: /Edit/i }));
    await user.click(screen.getByRole('button', { name: /Simpan Perubahan/i }));

    expect(await screen.findByText(/Gagal memperbarui data \(mock\)/)).toBeInTheDocument();
    expect(onUpdated).not.toHaveBeenCalled();
    expect(onDeleted).not.toHaveBeenCalled();
  });

  it('menampilkan error tanpa memanggil handler saat delete gagal', async () => {
    const user = userEvent.setup();
    mockState.error = { message: 'Gagal menghapus data (mock)' };
    const { onDeleted } = renderPanel();

    await user.click(screen.getByRole('button', { name: /Hapus/i }));

    expect(await screen.findByText(/Gagal menghapus data \(mock\)/)).toBeInTheDocument();
    expect(onDeleted).not.toHaveBeenCalled();
  });

  it('bisa batal dari mode edit', async () => {
    const user = userEvent.setup();
    renderPanel();

    await user.click(screen.getByRole('button', { name: /Edit/i }));
    expect(screen.getByText('Edit Destinasi')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Batal' }));
    expect(screen.queryByText('Edit Destinasi')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument();
  });

  it('memanggil onClose saat tombol tutup diklik', async () => {
    const user = userEvent.setup();
    const { onClose } = renderPanel();

    await user.click(screen.getByRole('button', { name: /Tutup detail/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
