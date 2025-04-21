import React, { useState, useEffect, useCallback } from 'react';
import songs from './songs';

const categories = ['Artist', 'Outfit', 'Bühne', 'Ohrwurm', 'Song'];
const emojiTags = ['❤️', '🔥'];

const SongList = () => {
  const [ratings, setRatings] = useState({});
  const [sortedSongs, setSortedSongs] = useState(songs);
  const [showLegend, setShowLegend] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('esc_theme') || 'light');

useEffect(() => {
  document.body.setAttribute('data-theme', theme);
  localStorage.setItem('esc_theme', theme);
}, [theme]);

const toggleTheme = () => {
  setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
};

  useEffect(() => {
    const storedRatings = localStorage.getItem('esc_ratings');
    const storedSortedSongs = localStorage.getItem('esc_sorted_songs');

    if (storedRatings) setRatings(JSON.parse(storedRatings));
    if (storedSortedSongs) setSortedSongs(JSON.parse(storedSortedSongs));
  }, []);

  useEffect(() => {
    localStorage.setItem('esc_ratings', JSON.stringify(ratings));
    localStorage.setItem('esc_sorted_songs', JSON.stringify(sortedSongs));
  }, [ratings, sortedSongs]);

  const hasAllRatings = useCallback((songId) => {
    const songRatings = ratings[songId];
    return categories.every((category) => songRatings && songRatings[category]);
  }, [ratings]);

  const calculateAverage = useCallback((songId) => {
    const songRatings = ratings[songId];
    if (!songRatings || !hasAllRatings(songId)) return '-';

    const values = categories.map((category) => parseFloat(songRatings[category]) || 0);
    const validValues = values.filter((v) => v > 0);

    if (validValues.length === 0) return '-';

    const sum = validValues.reduce((acc, curr) => acc + curr, 0);
    return (sum / validValues.length).toFixed(1);
  }, [ratings, hasAllRatings]);

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
    const confirmed = window.confirm('Möchtest du wirklich alle Bewertungen und die Sortierung zurücksetzen?');
    if (confirmed) {
      localStorage.removeItem('esc_ratings');
      localStorage.removeItem('esc_sorted_songs');
      setRatings({});
      setSortedSongs(songs);
    }
  };

  const handleTagToggle = (songId, tag) => {
    setRatings((prev) => {
      const prevTags = prev[songId]?.tags || [];
      const hasTag = prevTags.includes(tag);
      const updatedTags = hasTag
        ? prevTags.filter((t) => t !== tag)
        : [...prevTags, tag];

      return {
        ...prev,
        [songId]: {
          ...prev[songId],
          tags: updatedTags,
        },
      };
    });
  };

  return (
    <div className="song-list-container">
      <div style={{ marginBottom: '10px' }}>
        <button onClick={clearCache}>Cache leeren</button>
        <button onClick={toggleTheme}>
            {theme === 'light' ? '🌙 Dunkles Theme' : '☀️ Helles Theme'}
        </button>
        <button onClick={() => setShowLegend(prev => !prev)} style={{ marginLeft: '10px' }}>
          {showLegend ? 'Legende ausblenden' : 'Legende anzeigen'}
        </button>
      </div>

      {showLegend && (
        <div className="emoji-legend">
          <h3>Legende</h3>
          <ul>
            <li>❤️ – Lieblingslied</li>
            <li>🔥 – Gewinnerpotenzial</li>
            <li>🎉 – Partytauglich</li>
            <li>💤 – Eher langweilig</li>
            <li>😢 – Emotional</li>
            <li>🚀 – Oben bei den Wetten</li>
            <li>🤷‍♂️ – Neutral</li>
            <li>👎 – Nicht mein Fall</li>
          </ul>
        </div>
      )}

      <ul className="song-list">
        {sortedSongs.map((song, index) => {
          const songId = song.position;
          const currentPosition = index + 1;

          return (
            <li key={songId} className="song-item">
              <div className="song-header">
                <strong>{currentPosition}.</strong> {song.flag} <strong>{song.country}:</strong> {song.artist}  <em>{song.title}</em>

                {/* ❤️ & 🔥 Buttons */}
                <div className="song-tag-buttons" style={{ display: 'inline-block', marginLeft: '10px' }}>
                  {emojiTags.map((tag) => {
                    const isSelected = ratings[songId]?.tags?.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => handleTagToggle(songId, tag)}
                        className={`tag-button ${isSelected ? 'selected' : ''}`}
                        style={{ marginRight: '5px' }}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>

                <span style={{ float: 'right' }}>
                  Ø <strong>{calculateAverage(songId)}</strong> | Startposition: {song.position}
                </span>
              </div>

              {/* Tags anzeigen */}
              {(song.tags?.length > 0 || ratings[songId]?.tags?.length > 0) && (
                <div className="tags-display" style={{ marginTop: '4px', marginBottom: '4px' }}>
                  {song.tags?.length > 0 && (
                    <div>
                      🎼 <strong>Jessis Tags:</strong> {song.tags.join(' ')}
                    </div>
                  )}
                  {ratings[songId]?.tags?.length > 0 && (
                    <div>
                      ✍️ <strong>Meine Tags:</strong> {ratings[songId].tags.join(' ')}
                    </div>
                  )}
                </div>
              )}

              {/* Bewertungen */}
              <div className="ratings">
                {categories.map((category) => (
                  <label key={category} className="rating-label">
                    {category}:{' '}
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      min="1"
                      max="10"
                      autoComplete="off"
                      className="rating-input"
                      value={ratings[songId]?.[category] || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || (/^\d{1,2}$/.test(val) && +val <= 10 && +val >= 1)) {
                          handleRatingChange(songId, category, val);
                        }
                      }}
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
