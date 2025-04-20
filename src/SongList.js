import React, { useState, useEffect } from 'react';
import songs from './songs';

const categories = ['Artist', 'Outfit', 'Bühne', 'Ohrwurm', 'Song'];

const SongList = () => {
  const [ratings, setRatings] = useState({});

  // Load saved ratings on mount
  useEffect(() => {
    const stored = localStorage.getItem('esc_ratings');
    if (stored) setRatings(JSON.parse(stored));
  }, []);

  // Save ratings to localStorage on change
  useEffect(() => {
    localStorage.setItem('esc_ratings', JSON.stringify(ratings));
  }, [ratings]);

  const handleRatingChange = (songId, category, value) => {
    setRatings(prev => ({
      ...prev,
      [songId]: {
        ...prev[songId],
        [category]: value
      }
    }));
  };

  // 👉 Neue Funktion zur Berechnung des Durchschnitts
  const calculateAverage = (songId) => {
    const songRatings = ratings[songId];
    if (!songRatings) return '-';

    const values = categories.map(category => parseFloat(songRatings[category]) || 0);
    const validValues = values.filter(v => v > 0);

    if (validValues.length === 0) return '-';

    const sum = validValues.reduce((acc, curr) => acc + curr, 0);
    const average = sum / validValues.length;
    return average.toFixed(1);
  };

  return (
    <div className="song-list-container">
      <ul className="song-list">
        {songs.map((song) => {
          const songId = song.position; // unique key
          return (
            <li key={songId} className="song-item">
              <div className="song-header">
                <strong>{song.position}.</strong> {song.flag} <strong>{song.country}</strong>: {song.artist} – <em>{song.title}</em>
                <span style={{ float: 'right' }}>
                  Ø <strong>{calculateAverage(songId)}</strong>
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
