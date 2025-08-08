// src/App.jsx

import './App.css';
import MapComponent from './components/Map.jsx';

function App() {
  return (
    // Kita menggunakan div sebagai pembungkus utama, bukan Fragment (<>)
    // agar kita bisa menatanya dengan CSS.
    <div className="App">
      <header className="App-header">
        <h1>Eco-Tourism Tracker</h1>
        <p>Temukan destinasi ramah lingkungan di seluruh Indonesia!</p>
      </header>

      <main className="App-main">
        <MapComponent />
      </main>
    </div>
  );
}

export default App;
