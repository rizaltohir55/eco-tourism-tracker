// src/App.tsx

import './App.css'; // Baris ini menghubungkan file App.tsx dengan file gayanya, App.css

function App() {
  // 'return' adalah bagian yang menentukan apa yang akan ditampilkan di layar.
  // JSX di bawah ini terlihat seperti HTML.
  return (
    // <> dan </> adalah Fragment, sebuah pembungkus tak terlihat.
    <>
      <h1>Eco-Tourism Tracker</h1>
      
      <div>
        <p>
          Selamat datang di platform untuk mempromosikan wisata ramah lingkungan di Indonesia!
        </p>
      </div>
    </>
  );
}

// Baris ini membuat komponen App bisa digunakan oleh file lain (khususnya main.tsx).
export default App;
