# Eco-Tourism Tracker

Platform untuk melacak dan mempromosikan destinasi wisata ramah lingkungan di Indonesia.
Dibangun dengan React 19 + Vite 7, peta MapLibre GL, dan backend Supabase.

## Fitur

- **Peta interaktif** — marker destinasi di seluruh Indonesia dengan warna per tipe
  (Alam, Budaya, Kuliner, Akomodasi), popup info, dan fly-to saat destinasi dipilih.
- **CRUD destinasi** — tambah destinasi baru lewat form, edit & hapus dari panel detail.
  Semua operasi langsung tersimpan ke database Supabase.
- **Pencarian & filter** — cari berdasarkan nama/deskripsi dan saring per tipe destinasi.
- **Daftar destinasi** — klik item untuk memilih destinasi dan terbang ke lokasinya di peta.
- **Responsif** — layout sidebar + peta pada layar lebar, menumpuk vertikal pada layar sempit.

## Teknologi

| Bagian | Teknologi |
|---|---|
| Frontend | React 19, Vite 7 |
| Peta | MapLibre GL + react-map-gl, tile dari MapTiler |
| Backend | Supabase (PostgreSQL + REST instan) |

## Setup

1. **Clone & install**

   ```bash
   git clone https://github.com/rizaltohir55/eco-tourism-tracker.git
   cd eco-tourism-tracker
   npm install
   ```

2. **Siapkan Supabase**

   Buat project baru di [supabase.com](https://supabase.com), lalu jalankan SQL berikut
   di SQL Editor untuk membuat tabel `destinations`:

   ```sql
   create table destinations (
     id serial primary key,
     name text not null,
     description text,
     latitude double precision not null,
     longitude double precision not null,
     type text not null default 'Alam'
   );

   alter table destinations enable row level security;

   -- Kebijakan anon agar aplikasi bisa baca & tulis destinasi.
   -- Sesuaikan/pertegas sesuai kebutuhan keamanan Anda.
   create policy "Destinations are viewable by everyone"
     on destinations for select using (true);

   create policy "Anyone can add destinations"
     on destinations for insert with check (true);

   create policy "Anyone can update destinations"
     on destinations for update using (true);

   create policy "Anyone can delete destinations"
     on destinations for delete using (true);
   ```

3. **Ambil API key MapTiler**

   Daftar gratis di [maptiler.com](https://www.maptiler.com) dan buat key untuk
   map style `streets-v2`.

4. **Konfigurasi environment variables**

   Salin `.env.example` menjadi `.env.local` dan isi:

   ```env
   VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   VITE_MAPTILER_API_KEY=your_maptiler_key
   ```

   > `.env.local` di-gitignore dan tidak akan pernah ikut ter-commit.

5. **Jalankan/Build**

   ```bash
   npm run dev      # development server di http://localhost:5173
   npm run build    # build produksi ke folder dist/
   npm run preview  # preview hasil build
   npm run lint     # cek ESLint
   ```

## Struktur Proyek

```
eco-tourism-tracker/
├── public/
└── src/
    ├── components/
    │   ├── AddDestinationForm.jsx   # form tambah destinasi (insert Supabase)
    │   ├── DestinationDetails.jsx   # panel detail + edit/hapus (update/delete)
    │   └── Map.jsx                  # peta MapLibre, marker, popup, fly-to
    ├── App.jsx                      # state terpusat: search, filter, select, CRUD
    ├── App.css                      # styling utama
    ├── index.css
    ├── main.jsx
    └── supabaseClient.js            # instance client Supabase
```

## Catatan Keamanan

Kebijakan RLS di contoh SQL di atas terbuka untuk anon (`using (true)`/`with check (true)`)
agar mudah dicoba. Untuk penggunaan produksi, pertegas kebijakan tersebut — misalnya
hanya izinkan insert/update/delete bagi user yang terautentikasi.
