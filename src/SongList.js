import React, { useState, useEffect, useCallback } from 'react';
import songs from './songs'; // Deine Song-Datenquelle

const categories = ['Artist', 'Outfit', 'Bühne', 'Ohrwurm', 'Song'];

const SongList = () => {
  const [ratings, setRatings] = useState({});
  const [sortedSongs, setSortedSongs] = useState(songs); // Start mit der ursprünglichen Song-Reihenfolge

  // Lade gespeicherte Bewertungen und die sortierte Liste aus localStorage
  useEffect(() => {
    const storedRatings = localStorage.getItem('esc_ratings');
    const storedSortedSongs = localStorage.getItem('esc_sorted_songs');

    if (storedRatings) {
      setRatings(JSON.parse(storedRatings)); // Setze gespeicherte Bewertungen
    }

    if (storedSortedSongs) {
      setSortedSongs(JSON.parse(storedSortedSongs)); // Setze die gespeicherte Reihenfolge
    }
  }, []);

  // Speichern der Bewertungen und der sortierten Liste in localStorage, wenn sich der Zustand ändert
  useEffect(() => {
    localStorage.setItem('esc_ratings', JSON.stringify(ratings)); // Speichern der Bewertungen
    localStorage.setItem('esc_sorted_songs', JSON.stringify(sortedSongs)); // Speichern der sortierten Liste
  }, [ratings, sortedSongs]);

  // Berechnet die Durchschnittsbewertung eines Songs
  const calculateAverage = useCallback((songId) => {
    const songRatings = ratings[songId];
    if (!songRatings || !hasAllRatings(songId)) return '-'; // Berechne nur, wenn alle Kategorien bewertet wurden

    const values = categories.map((category) => parseFloat(songRatings[category]) || 0);
    const validValues = values.filter((v) => v > 0);

    if (validValues.length === 0) return '-';

    const sum = validValues.reduce((acc, curr) => acc + curr, 0);
    const average = sum / validValues.length;
    return average.toFixed(1);
  }, [ratings, hasAllRatings]); // Die Funktion wird nur neu erstellt, wenn sich 'ratings' ändern

  // Überprüfen, ob alle Kategorien für einen Song bewertet wurden
  const hasAllRatings = (songId) => {
    const songRatings = ratings[songId];
    return categories.every((category) => songRatings && songRatings[category]);
  };

  // Sortiere die Songs nach ihrer Durchschnittsbewertung, nur wenn alle Bewertungen vorliegen
  useEffect(() => {
    const sorted = [...songs].sort((a, b) => {
      const avgA = calculateAverage(a.position);
      const avgB = calculateAverage(b.position);

      // Wenn beide Songs Bewertungen haben, sortiere nach der Durchschnittsbewertung
      if (avgA !== '-' && avgB !== '-') {
        return parseFloat(avgB) - parseFloat(avgA); // absteigende Reihenfolge
      }

      // Behalte die ursprüngliche Reihenfolge bei, wenn einer der Songs keine vollständige Bewertung hat
      return 0;
    });
    setSortedSongs(sorted); // Setze die sortierte Liste
  }, [ratings, calculateAverage]); // Die Liste wird immer dann neu sortiert, wenn die Bewertungen oder die Durchschnittsfunktion sich ändern

  // Handle Bewertung ändern
  const handleRatingChange = (songId, category, value) => {
    setRatings((prev) => ({
      ...prev,
      [songId]: {
        ...prev[songId],
        [category]: value,
      },
    }));
  };

  // Cache löschen (localStorage)
  const clearCache = () => {
    localStorage.removeItem('esc_ratings');
    localStorage.removeItem('esc_sorted_songs');
    setRatings({});
    setSortedSongs(songs); // Zurücksetzen auf die ursprüngliche Reihenfolge der Songs
  };

  return (
    <div className="song-list-container">
      <button onClick={clearCache}>Cache leeren</button>
      <ul className="song-list">
        {sortedSongs.map((song, index) => {
          const songId = song.position; // eindeutige ID
          const currentPosition = index + 1; // aktuelle Position in der sortierten Liste
          return (
            <li key={songId} className="song-item">
              <div className="song-header">
                <strong>{currentPosition}.</strong> {song.flag} <strong>{song.country}</strong>: {song.artist} – <em>{song.title}</em>
                <span style={{ float: 'right' }}>
                  Ø <strong>{calculateAverage(songId)}</strong> | Startposition: {song.position}
                </span>
              </div>
              <div className="ratings">
                {categories.map(category => (
                  <label key={category} className="rating-label">
                    {category}:{' '}
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={ratings[songId]?.[category] || ''}
                      onChange={(e) => handleRatingChange(songId, category, e.target.value)}
                    />
                  </label>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default SongList;
