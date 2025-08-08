// src/supabaseClient.js

import { createClient } from '@supabase/supabase-js';

// Mengambil URL dan Kunci dari environment variables yang kita buat di .env.local
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Membuat dan mengekspor satu instance client Supabase yang akan kita gunakan di seluruh aplikasi
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
