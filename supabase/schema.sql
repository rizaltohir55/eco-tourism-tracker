-- supabase/schema.sql
-- Skema database Eco-Tourism Tracker.
-- Jalankan di Supabase Studio > SQL Editor, atau: supabase db push

-- ===========================================================================
-- Tabel: destinations
-- ===========================================================================
CREATE TABLE IF NOT EXISTS destinations (
  id          serial        PRIMARY KEY,
  name        text          NOT NULL,
  description text,
  latitude    double precision NOT NULL,
  longitude   double precision NOT NULL,
  type        text          NOT NULL DEFAULT 'Alam'
                              CHECK (type IN ('Alam', 'Budaya', 'Kuliner', 'Akomodasi')),
  created_at  timestamptz   NOT NULL DEFAULT now()
);

-- Index untuk pencarian nama (search bar memakai ILIKE pada name).
CREATE INDEX IF NOT EXISTS destinations_name_idx ON destinations (name);

-- Index untuk filter tipe destinasi.
CREATE INDEX IF NOT EXISTS destinations_type_idx ON destinations (type);

-- ===========================================================================
-- Row Level Security
-- ===========================================================================
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;

-- Read terbuka untuk semua orang (anon + authenticated) — daftar destinasi
-- bersifat publik.
DROP POLICY IF EXISTS "Destinations are publicly readable" ON destinations;
CREATE POLICY "Destinations are publicly readable"
  ON destinations
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Write (insert/update/delete) terbatas untuk pengguna yang terautentikasi.
DROP POLICY IF EXISTS "Authenticated users can insert destinations" ON destinations;
CREATE POLICY "Authenticated users can insert destinations"
  ON destinations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can update destinations" ON destinations;
CREATE POLICY "Authenticated users can update destinations"
  ON destinations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can delete destinations" ON destinations;
CREATE POLICY "Authenticated users can delete destinations"
  ON destinations
  FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);
