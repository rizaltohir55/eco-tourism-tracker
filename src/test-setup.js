// src/test-setup.js
// Setup global untuk Vitest + React Testing Library.
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Otomatis unmount komponen setelah setiap test agar tidak ada bocoran state.
afterEach(() => {
  cleanup();
});
