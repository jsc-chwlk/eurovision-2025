import React, { useState, useCallback } from 'react';
import './App.css';
import SongList from './SongList';
import songs from './songs';

function App() {
  const [ratings, setRatings] = useState(() => {
    const storedRatings = localStorage.getItem('esc_ratings');
    return storedRatings ? JSON.parse(storedRatings) : {};
  });

  const [sortedSongs, setSortedSongs] = useState(() => {
    const storedSortedSongs = localStorage.getItem('esc_sorted_songs');
    return storedSortedSongs ? JSON.parse(storedSortedSongs) : songs;
  });

  const [manualSort, setManualSort] = useState(() => {
    const storedManualRatings = localStorage.getItem('esc_manual_ratings');
    return storedManualRatings ? JSON.parse(storedManualRatings) : {};
  });

  const [showSettings, setShowSettings] = useState(false);

  const clearCache = useCallback(() => {
    const confirmation = window.confirm('Bist du sicher, dass du den Cache leeren möchtest? Alle Bewertungen gehen verloren.');
    if (confirmation) {
      localStorage.removeItem('esc_ratings');
      localStorage.removeItem('esc_sorted_songs');
      localStorage.removeItem('esc_manual_songs');
      setRatings({});
      setSortedSongs(songs);
      setManualSort({});
      alert('Cache wurde erfolgreich gelöscht!');
    }
  }, []);

  return (
    <div className="App">
      {/* Header + Zahnrad */}
      <div className="app-header-container">
        <h1 className="app-header-title">Eurovision 2025 – Beiträge</h1>

        {/* Zahnrad-Button */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowSettings(prev => !prev)}
            className="app-settings-button"
            title="Einstellungen"
          >
            ⚙️
          </button>

          {/* Dropdown-Menü */}
          {showSettings && (
            <div className="app-settings-dropdown">
              <button 
                onClick={clearCache}
                className="app-settings-dropdown-button"
              >
                🗑️ Cache leeren
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SongList */}
      <SongList 
        ratings={ratings}
        setRatings={setRatings}
        sortedSongs={sortedSongs}
        setSortedSongs={setSortedSongs}
        manualSort={manualSort}
        setManualSort={setManualSort}
      />
    </div>
  );
}

export default App;
