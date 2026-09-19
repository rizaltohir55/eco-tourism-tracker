-- supabase/seed.sql
-- Data contoh: 14 destinasi wisata ramah lingkungan Indonesia.
-- Idempoten -- INSERT ... ON CONFLICT (id) DO NOTHING, aman dijalankan ulang.
-- Jalankan setelah schema.sql.

BEGIN;

INSERT INTO destinations (id, name, description, latitude, longitude, type) VALUES
(
  1,
  'Taman Nasional Komodo',
  'Satu-satunya habitat komodo di dunia, dengan pantai pasir merah jambu dan terumbu karang yang kaya. Park ini juga adalah salah satu situs warisan dunia UNESCO.',
  -8.583300, 119.483300, 'Alam'
),
(
  2,
  'Raja Ampat',
  'Surga bawah laut dengan biodiversitas laut tertinggi di dunia, lebih dari 75% spesies karang dunia bisa ditemukan di sini.',
  -0.423200, 130.818600, 'Alam'
),
(
  3,
  'Gunung Bromo',
  'Gunung berapi aktif yang terletak di tengah lautan pasir, dengan pemandangan matahari terbit yang spektakuler.',
  -7.941670, 112.950000, 'Alam'
),
(
  4,
  'Danau Toba',
  'Danau vulkanik terbesar di dunia yang berasal dari letusan supervolcano, dengan Pusuk Buhit di tengahnya sebagai pusat budaya Batak.',
  2.616700, 98.833300, 'Alam'
),
(
  5,
  'Wakatobi National Park',
  'Taman nasional laut dengan 750 spesies karang di Segitiga Terumbu Karang dunia, terdiri dari empat pulau utama: Wangi-wangi, Kaledupa, Tomia, dan Binongko.',
  -5.683300, 124.000000, 'Alam'
),
(
  6,
  'Borobudur',
  'Candi Buddha terbesar di dunia yang dibangun abad ke-9, tersusun dari 2.672 panel relief dan 504 patung Buddha.',
  -7.607874, 110.203751, 'Budaya'
),
(
  7,
  'Candi Prambanan',
  'Candi Hindu terbesar di Indonesia yang dibangun abad ke-9, terkenal dengan menara-menara lancipnya dan relief Ramayana.',
  -7.752150, 110.489450, 'Budaya'
),
(
  8,
  'Tana Toraja',
  'Pegunungan mistis di Sulawesi Selatan dengan rumah adat Tongkonan dan upacara pemakaman Rambu Solo yang megah.',
  -3.185833, 119.917750, 'Budaya'
),
(
  9,
  'Pulau Samosir',
  'Pulau di tengah Danau Toba yang merupakan pusat budaya Batak Toba, dengan desa-desa tradisional, rumah Bolon, dan festival Danau Toba.',
  2.583300, 98.833300, 'Budaya'
),
(
  10,
  'Taman Nasional Gunung Leuser',
  'Salah satu hutan hujan tropis tertua di dunia dan habitat terakhir orangutan, badak, harimau Sumatra, dan gajah yang hidup berdampingan.',
  3.750000, 97.650000, 'Alam'
),
(
  11,
  'Kawah Ijen',
  'Kawah belerang dengan api biru yang hanya bisa dilihat di dua tempat di dunia, dan danau asam berwarna toska sepanjang hari.',
  -8.058300, 114.242000, 'Alam'
),
(
  12,
  'Selong Selo Resort & Glamping',
  'Resort ramah lingkungan di perbukitan Selong Belanak, Lombok Selatan, dengan vila-vila low-density yang menyusuri kontur alami dan kolam renang overflow menghadap teluk.',
  -8.880000, 116.200000, 'Akomodasi'
),
(
  13,
  'Bambu Indah',
  'Resort butik ramah lingkungan di Sayan, Ubud, dengan struktur bangunan yang menggunakan material bambu dan kayu jati tua daur ulang.',
  -8.512000, 115.237800, 'Akomodasi'
),
(
  14,
  'Nasi Goreng Kampoeng (Kuta)',
  'Warung makan legendaris di Kuta, Bali, dengan racikan bumbu tradisional yang khas dan porsi yang melimpah.',
  -8.723200, 115.168500, 'Kuliner'
)
ON CONFLICT (id) DO NOTHING;

-- Reset sequence SEQUENCE agar insert manual berikutnya tidak bentrok dengan id di atas.
SELECT setval(
  pg_get_serial_sequence('destinations', 'id'),
  GREATEST((SELECT MAX(id) FROM destinations), 14),
  true
);

COMMIT;
