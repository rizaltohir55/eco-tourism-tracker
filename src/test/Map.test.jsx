// src/test/Map.test.jsx
// Test render marker peta per destinasi (react-map-gl di-mock penuh di jsdom).

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import MapComponent from '../components/Map.jsx';
import { DESTINATIONS } from './__mocks__/supabaseMock.js';

vi.mock('react-map-gl/maplibre', () => ({
  Map: ({ children }) => <div data-testid="maplibre-map">{children}</div>,
  Marker: ({ children, longitude, latitude, anchor }) => (
    <div
      data-testid="map-marker"
      data-longitude={String(longitude)}
      data-latitude={String(latitude)}
      data-anchor={anchor}
    >
      {children}
    </div>
  ),
  Popup: ({ children, longitude, latitude, onClose }) => (
    <div data-testid="map-popup" data-longitude={String(longitude)} data-latitude={String(latitude)}>
      <button data-testid="popup-close" onClick={onClose}>x</button>
      {children}
    </div>
  ),
}));

vi.mock('maplibre-gl/dist/maplibre-gl.css', () => ({}));

describe('MapComponent — render marker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('merender satu marker untuk setiap destinasi', () => {
    render(<MapComponent destinations={DESTINATIONS} onSelect={() => {}} />);

    const markers = screen.getAllByTestId('map-marker');
    expect(markers).toHaveLength(DESTINATIONS.length);
  });

  it('mengiris marker sesuai daftar yang dikirim (subset)', () => {
    const subset = DESTINATIONS.slice(0, 2);
    render(<MapComponent destinations={subset} onSelect={() => {}} />);

    expect(screen.getAllByTestId('map-marker')).toHaveLength(2);
  });

  it('tidak merender marker saat daftar kosong', () => {
    render(<MapComponent destinations={[]} onSelect={() => {}} />);
    expect(screen.queryAllByTestId('map-marker')).toHaveLength(0);
  });

  it('membaca koordinat setiap marker dari data destinasi', () => {
    render(<MapComponent destinations={DESTINATIONS} onSelect={() => {}} />);

    const markers = screen.getAllByTestId('map-marker');
    DESTINATIONS.forEach((dest, i) => {
      expect(markers[i]).toHaveAttribute('data-latitude', String(dest.latitude));
      expect(markers[i]).toHaveAttribute('data-longitude', String(dest.longitude));
    });
  });

  it('menampilkan title nama + tipe pada marker', () => {
    render(<MapComponent destinations={DESTINATIONS} onSelect={() => {}} />);

    const titles = screen.getAllByTestId('map-marker').map((m) => m.querySelector('span').getAttribute('title'));
    expect(titles).toEqual(DESTINATIONS.map((d) => `${d.name} (${d.type})`));
  });

  it('memanggil onSelect dengan destinasi yang benar saat marker di-klik', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<MapComponent destinations={DESTINATIONS} onSelect={onSelect} />);

    const markers = screen.getAllByTestId('map-marker');
    await user.click(markers[1].querySelector('div'));

    expect(onSelect).toHaveBeenCalledWith(DESTINATIONS[1]);
    expect(screen.getByTestId('map-popup')).toBeInTheDocument();
  });

  it('menampilkan popup berisi info destinasi saat marker di-klik', async () => {
    const user = userEvent.setup();
    render(<MapComponent destinations={DESTINATIONS} onSelect={() => {}} />);

    const markers = screen.getAllByTestId('map-marker');
    await user.click(markers[0].querySelector('div'));

    const popup = screen.getByTestId('map-popup');
    expect(withinEl(popup, DESTINATIONS[0].name)).toBe(true);
    expect(withinEl(popup, DESTINATIONS[0].type)).toBe(true);
  });

  it('menutup popup via tombol close', async () => {
    const user = userEvent.setup();
    render(<MapComponent destinations={DESTINATIONS} onSelect={() => {}} />);

    const markers = screen.getAllByTestId('map-marker');
    await user.click(markers[0].querySelector('div'));
    expect(screen.getByTestId('map-popup')).toBeInTheDocument();

    await user.click(screen.getByTestId('popup-close'));
    expect(screen.queryByTestId('map-popup')).not.toBeInTheDocument();
  });
});

// Helper kecil: cari teks di dalam sebuah element.
function withinEl(container, text) {
  return container.textContent.includes(text);
}
