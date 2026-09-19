// src/test/__mocks__/supabaseMock.js
// Mock client Supabase untuk testing UI logic — TIDAK ada koneksi nyata dibuat.
//
// Behavior per-test diatur lewat objek `state` yang bisa diubah (data/error),
// karena vi.mock di-hoisted ke atas file sehingga factory harus murni.
//
// Rantai yang ditiru:
//   .from('destinations').select('*').order('id')          -> { data, error }
//   .from('destinations').update(patch).eq('id').select().single()  -> { data, error }
//   .from('destinations').insert(rows).select().single()            -> { data, error }
//   .from('destinations').delete().eq('id')                         -> { data, error }

export const DESTINATIONS = [
  {
    id: 1,
    name: 'Hutan Pinus Pengger',
    description: 'Hutan pinus asri di Pulau Lombok.',
    type: 'Alam',
    latitude: -8.6111,
    longitude: 116.3231,
  },
  {
    id: 2,
    name: 'Kampung Adat Sade',
    description: 'Desa adat Sasak yang melestarikan tradisi.',
    type: 'Budaya',
    latitude: -8.6511,
    longitude: 116.2831,
  },
  {
    id: 3,
    name: 'Warung Bebek Goreng',
    description: 'Kuliner bebek goreng khas Lombok.',
    type: 'Kuliner',
    latitude: -8.5811,
    longitude: 116.3531,
  },
  {
    id: 4,
    name: 'Eco Stay Gili Air',
    description: 'Akomodasi ramah lingkungan di Gili Air.',
    type: 'Akomodasi',
    latitude: -8.3511,
    longitude: 116.0831,
  },
];

// Buat client mock yang membaca/menulis state yang diberikan.
export function makeSupabaseMock(state) {
  const api = {
    from: () => ({
      select: () => ({
        order: () => Promise.resolve({ data: state.data, error: state.error }),
      }),
      update: (patch) => {
        state.calls.update = patch;
        return {
          eq: (col, val) => {
            state.calls.updateId = { col, val };
            return {
              select: () => ({
                single: () =>
                  Promise.resolve(
                    state.error
                      ? { data: null, error: state.error }
                      : {
                          data:
                            state.data || {
                              id: val,
                              ...patch,
                              latitude: Number(patch.latitude),
                              longitude: Number(patch.longitude),
                            },
                          error: null,
                        },
                  ),
              }),
            };
          },
        };
      },
      insert: (rows) => {
        state.calls.insert = rows;
        return {
          select: () => ({
            single: () =>
              Promise.resolve(
                state.error
                  ? { data: null, error: state.error }
                  : {
                      data: { id: 99, ...rows[0], latitude: Number(rows[0].latitude), longitude: Number(rows[0].longitude) },
                      error: null,
                    },
              ),
          }),
        };
      },
      delete: () => {
        state.calls.delete = true;
        return {
          eq: (col, val) => {
            state.calls.deleteId = { col, val };
            return Promise.resolve(state.error ? { data: null, error: state.error } : { data: null, error: null });
          },
        };
      },
    }),
  };
  return api;
}
