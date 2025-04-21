import React, { useState, useEffect, useCallback } from 'react';
import songs from './songs';

const categories = ['Artist', 'Outfit', 'Bühne', 'Ohrwurm', 'Song'];

const SongList = () => {
  const [ratings, setRatings] = useState({});
  const [sortedSongs, setSortedSongs] = useState(songs);

  // Lade gespeicherte Daten
  useEffect(() => {
    const storedRatings = localStorage.getItem('esc_ratings');
    const storedSortedSongs = localStorage.getItem('esc_sorted_songs');

    if (storedRatings) setRatings(JSON.parse(storedRatings));
    if (storedSortedSongs) setSortedSongs(JSON.parse(storedSortedSongs));
  }, []);

  // Speichern bei Änderungen
  useEffect(() => {
    localStorage.setItem('esc_ratings', JSON.stringify(ratings));
    localStorage.setItem('esc_sorted_songs', JSON.stringify(sortedSongs));
  }, [ratings, sortedSongs]);

  // Prüfen, ob alle Kategorien bewertet wurden
  const hasAllRatings = useCallback((songId) => {
    const songRatings = ratings[songId];
    return categories.every((category) => songRatings && songRatings[category]);
  }, [ratings]);

  // Durchschnitt berechnen
  const calculateAverage = useCallback((songId) => {
    const songRatings = ratings[songId];
    if (!songRatings || !hasAllRatings(songId)) return '-';

    const values = categories.map((category) => parseFloat(songRatings[category]) || 0);
    const validValues = values.filter((v) => v > 0);

    if (validValues.length === 0) return '-';

    const sum = validValues.reduce((acc, curr) => acc + curr, 0);
    return (sum / validValues.length).toFixed(1);
  }, [ratings, hasAllRatings]);

  // Sortieren wenn Bewertungen sich ändern
  useEffect(() => {
    const sorted = [...songs].sort((a, b) => {
      const avgA = calculateAverage(a.position);
      const avgB = calculateAverage(b.position);

      if (avgA !== '-' && avgB !== '-') {
        return parseFloat(avgB) - parseFloat(avgA);
      }
      return 0;
    });
    setSortedSongs(sorted);
  }, [ratings, calculateAverage]);

  const handleRatingChange = (songId, category, value) => {
    setRatings((prev) => ({
      ...prev,
      [songId]: {
        ...prev[songId],
        [category]: value,
      },
    }));
  };

  const clearCache = () => {
    localStorage.removeItem('esc_ratings');
    localStorage.removeItem('esc_sorted_songs');
    setRatings({});
    setSortedSongs(songs);
  };

  return (
    <div className="song-list-container">
      <button onClick={clearCache}>Cache leeren</button>
      <ul className="song-list">
        {sortedSongs.map((song, index) => {
          const songId = song.position;
          const currentPosition = index + 1;
          return (
            <li key={songId} className="song-item">
              <div className="song-header">
                <strong>{currentPosition}.</strong> {song.flag} <strong>{song.country}</strong>: {song.artist} – <em>{song.title}</em>
                <span style={{ float: 'right' }}>
                  Ø <strong>{calculateAverage(songId)}</strong> | Startposition: {song.position}
                </span>
              </div>
              <div className="ratings">
                {categories.map((category) => (
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
