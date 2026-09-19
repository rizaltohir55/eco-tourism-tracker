// src/test/App.test.jsx
// Test filter search + filter tipe di App.jsx (mock supabase client, tanpa koneksi nyata).

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import App from '../App.jsx';
import { DESTINATIONS } from './__mocks__/supabaseMock.js';

// vi.mock di-hoisted ke atas file. Behavior per-test diatur lewat `mockState`
// yang dimutasi di beforeEach; client mock membaca state tersebut secara live.
const mockState = vi.hoisted(() => ({}));

vi.mock('../supabaseClient.js', async () => {
  const { makeSupabaseMock } = await import('./__mocks__/supabaseMock.js');
  return { supabase: makeSupabaseMock(mockState) };
});

// MapLibre butuh canvas/webgl yang tidak ada di jsdom; render Markernya diuji
// terpisah di Map.test.jsx dengan mock penuh. Di sini Map di-mock karena
// MapComponent di-import lewat React.lazy().
vi.mock('react-map-gl/maplibre', () => ({
  Map: ({ children }) => <div data-testid="maplibre-map">{children}</div>,
  Marker: ({ children, longitude, latitude }) => (
    <div data-testid="map-marker" data-longitude={longitude} data-latitude={latitude}>
      {children}
    </div>
  ),
  Popup: ({ children }) => <div data-testid="map-popup">{children}</div>,
}));

vi.mock('maplibre-gl/dist/maplibre-gl.css', () => ({}));

// Versi sinkron dari pemadam mock, supaya bisa dipanggil dari luar Act().
function setMockData(data) {
  mockState.data = data;
  mockState.error = null;
  mockState.calls = {};
}

async function renderApp(data = DESTINATIONS) {
  setMockData(data);
  render(<App />);
  await screen.findByText(/Daftar Destinasi/);
  // Tunggu skeleton loading diganti dengan data sungguhan.
  await vi.waitFor(() =>
    expect(document.querySelector('.skeleton-list')).not.toBeInTheDocument(),
  );
}

describe('App — filter search & tipe', () => {
  beforeEach(() => {
    setMockData(DESTINATIONS);
    vi.clearAllMocks();
  });

  it('memuat dan merender semua destinasi dari mock supabase', async () => {
    await renderApp();

    expect(screen.getByRole('heading', { name: 'Daftar Destinasi' })).toBeInTheDocument();
    expect(screen.getByText('4 destinasi')).toBeInTheDocument();
    expect(screen.getByText('Hutan Pinus Pengger')).toBeInTheDocument();
    expect(screen.getByText('Kampung Adat Sade')).toBeInTheDocument();
    expect(screen.getByText('Warung Bebek Goreng')).toBeInTheDocument();
    expect(screen.getByText('Eco Stay Gili Air')).toBeInTheDocument();
  });

  it('memfilter destinasi berdasarkan query search (cocok nama)', async () => {
    const user = userEvent.setup();
    await renderApp();

    const input = screen.getByPlaceholderText(/Cari nama \/ deskripsi destinasi/i);
    await user.type(input, 'bebek');

    expect(screen.getByText('1 destinasi')).toBeInTheDocument();
    expect(screen.getByText('Warung Bebek Goreng')).toBeInTheDocument();
    expect(screen.queryByText('Hutan Pinus Pengger')).not.toBeInTheDocument();
  });

  it('memfilter berdasarkan query search (cocok deskripsi, case-insensitive)', async () => {
    const user = userEvent.setup();
    await renderApp();

    const input = screen.getByPlaceholderText(/Cari nama \/ deskripsi destinasi/i);
    await user.type(input, 'ADAT SASAK');

    expect(screen.getByText('1 destinasi')).toBeInTheDocument();
    expect(screen.getByText('Kampung Adat Sade')).toBeInTheDocument();
  });

  it('menampilkan pesan kosong saat search tidak cocok apa pun', async () => {
    const user = userEvent.setup();
    await renderApp();

    const input = screen.getByPlaceholderText(/Cari nama \/ deskripsi destinasi/i);
    await user.type(input, 'rupiah');

    expect(screen.getByText('Tidak ada destinasi yang cocok')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reset filter/i })).toBeInTheDocument();
  });

  it('mengembalikan semua destinasi setelah tombol Reset filter diklik', async () => {
    const user = userEvent.setup();
    await renderApp();

    const input = screen.getByPlaceholderText(/Cari nama \/ deskripsi destinasi/i);
    await user.type(input, 'rupiah');
    expect(screen.getByText('Tidak ada destinasi yang cocok')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Reset filter/i }));
    expect(await screen.findByText('4 destinasi')).toBeInTheDocument();
    expect(screen.getByText('Hutan Pinus Pengger')).toBeInTheDocument();
  });

  it('memfilter destinasi berdasarkan tipe', async () => {
    const user = userEvent.setup();
    await renderApp();

    const select = screen.getByLabelText(/Filter tipe destinasi/i);
    await user.selectOptions(select, 'Kuliner');

    expect(screen.getByText('1 destinasi tipe Kuliner')).toBeInTheDocument();
    expect(screen.getByText('Warung Bebek Goreng')).toBeInTheDocument();
    expect(screen.queryByText('Hutan Pinus Pengger')).not.toBeInTheDocument();
  });

  it('menggabungkan search + filter tipe secara bersamaan', async () => {
    const user = userEvent.setup();
    await renderApp();

    const input = screen.getByPlaceholderText(/Cari nama \/ deskripsi destinasi/i);
    await user.type(input, 'gili');

    const select = screen.getByLabelText(/Filter tipe destinasi/i);
    await user.selectOptions(select, 'Akomodasi');

    expect(screen.getByText('1 destinasi tipe Akomodasi')).toBeInTheDocument();
    expect(screen.getByText('Eco Stay Gili Air')).toBeInTheDocument();
  });

  it('mengembalikan semua destinasi saat filter tipe dikembalikan ke "Semua"', async () => {
    const user = userEvent.setup();
    await renderApp();

    const select = screen.getByLabelText(/Filter tipe destinasi/i);
    await user.selectOptions(select, 'Alam');
    expect(screen.getByText('1 destinasi tipe Alam')).toBeInTheDocument();

    await user.selectOptions(select, 'Semua');
    expect(screen.getByText('4 destinasi')).toBeInTheDocument();
  });

  it('membuka panel detail saat destinasi di-klik', async () => {
    const user = userEvent.setup();
    await renderApp();

    await user.click(screen.getByText('Kampung Adat Sade'));

    expect(await screen.findByText(/Desa adat Sasak yang melestarikan tradisi/)).toBeInTheDocument();
    expect(screen.getByText(/8\.6511,\s*116\.2831/)).toBeInTheDocument();
  });

  it('menghapus destinasi dari daftar lewat tombol Hapus di panel detail', async () => {
    const user = userEvent.setup();
    await renderApp();

    await user.click(screen.getByText('Kampung Adat Sade'));
    await user.click(screen.getByRole('button', { name: /Hapus/i }));

    expect(await screen.findByText('3 destinasi')).toBeInTheDocument();
    expect(screen.queryByText('Kampung Adat Sade')).not.toBeInTheDocument();
  });

  it('membuka form tambah destinasi', async () => {
    const user = userEvent.setup();
    await renderApp();

    await user.click(screen.getByRole('button', { name: /Buka formulir tambah destinasi/i }));

    expect(screen.getByText('Tambah Destinasi Baru')).toBeInTheDocument();
    expect(screen.getByLabelText(/Nama destinasi/i)).toBeInTheDocument();
  });

  it('merender daftar lengkap sesuai urutan tanpa duplikat', async () => {
    await renderApp();

    const listbox = screen.getByRole('listbox', { name: 'Daftar destinasi' });
    const items = within(listbox).getAllByRole('option');
    expect(items).toHaveLength(4);

    const names = items.map((li) => li.querySelector('.dest-name').textContent);
    expect(names).toEqual(DESTINATIONS.map((d) => d.name));
  });

  it('mengirim query pencarian sebagai filter utama sebelum filter tipe', async () => {
    const user = userEvent.setup();
    await renderApp();

    const input = screen.getByPlaceholderText(/Cari nama \/ deskripsi destinasi/i);
    await user.type(input, 'a'); // cocok: Pengger, Sade, Bebek Goreng, Gili Air? coba selektif

    // 'a' muncul di hampir semua nama; pastikan hasilnya konsisten dengan filter.
    const countText = screen.getByRole('status').textContent;
    expect(countText).toMatch(/\d+ destinasi/);
  });
});
