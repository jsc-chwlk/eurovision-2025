import React, { useState, useCallback, useEffect } from 'react';
import songs from './songs';

const categories = ['Artist', 'Outfit', 'Bühne', 'Ohrwurm', 'Song'];
const emojiTags = ['❤️', '🔥'];

const SongList = () => {
  const [ratings, setRatings] = useState(() => {
    // Laden der Bewertungen aus dem localStorage, wenn vorhanden
    const storedRatings = localStorage.getItem('esc_ratings');
    return storedRatings ? JSON.parse(storedRatings) : {};
  });

  const [sortedSongs, setSortedSongs] = useState(() => {
    // Laden der sortierten Songs aus dem localStorage, wenn vorhanden
    const storedSortedSongs = localStorage.getItem('esc_sorted_songs');
    return storedSortedSongs ? JSON.parse(storedSortedSongs) : songs;
  });

  const [manualSort, setManualSort] = useState(() => {
  // Laden der Bewertungen aus dem localStorage, wenn vorhanden
  const storedManualRatings = localStorage.getItem('esc_manual_ratings');
  return storedManualRatings ? JSON.parse(storedManualRatings) : {};
});

  const moveSong = (position, direction) => {
    setSortedSongs((prev) => {
      const index = prev.findIndex((s) => s.position === position);
      if (index < 0) return prev;

      const newSongs = [...prev];
      const swapIndex = direction === 'up' ? index - 1 : index + 1;

      if (swapIndex < 0 || swapIndex >= newSongs.length) return prev;

      [newSongs[index], newSongs[swapIndex]] = [newSongs[swapIndex], newSongs[index]];

      return newSongs;
    });

    setManualSort(true);
  };

  const sortByAverage = () => {
    const sorted = [...songs].sort((a, b) => {
      const avgA = calculateAverage(a.position);
      const avgB = calculateAverage(b.position);

      if (avgA !== '-' && avgB !== '-') {
        return parseFloat(avgB) - parseFloat(avgA);
      }
      return 0;
    });
    setSortedSongs(sorted);
    setManualSort(false);
  };

  // Nur ausführen, wenn nicht manuell sortiert wurde
  useEffect(() => {
    if (!manualSort) {
      sortByAverage();
    }
  }, [ratings]);

  const [showLegend, setShowLegend] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('esc_theme') || 'light');

  useEffect(() => {
    // Beim Theme-Wechsel das Theme im localStorage speichern
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('esc_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Speichern der Bewertungen und der sortierten Songs im localStorage
  useEffect(() => {
    localStorage.setItem('esc_ratings', JSON.stringify(ratings));
  }, [ratings]);

  useEffect(() => {
    localStorage.setItem('esc_sorted_songs', JSON.stringify(sortedSongs));
  }, [sortedSongs]);

  useEffect(() => {
    localStorage.setItem('esc_manual_songs', JSON.stringify(manualSort));
  }, [manualSort]);

  // Überprüfen, ob alle Kategorien bewertet wurden und den Durchschnitt berechnen
  const calculateAverage = (songId) => {
    const songRatings = ratings[songId];

    // Überprüfen, ob alle Kategorien bewertet wurden
    if (!songRatings || categories.some((category) => !songRatings[category])) {
      return '-'; // Rückgabe von '-' wenn nicht alle Kategorien bewertet wurden
    }

    // Berechnen des Durchschnitts
    const values = categories.map((category) => parseFloat(songRatings[category]) || 0);
    const validValues = values.filter((v) => v > 0);
    if (validValues.length === 0) return '-';
    const sum = validValues.reduce((acc, curr) => acc + curr, 0);
    return (sum / validValues.length).toFixed(1);
  };

  // Sortieren der Songs nach Durchschnittsbewertung, nur wenn alle Kategorien bewertet wurden
  useEffect(() => {
    const sorted = [...songs].sort((a, b) => {
      const avgA = calculateAverage(a.position);
      const avgB = calculateAverage(b.position);

      // Sortieren nur, wenn beide Songs vollständig bewertet wurden
      if (avgA !== '-' && avgB !== '-') {
        return parseFloat(avgB) - parseFloat(avgA);
      }
      return 0;
    });
    setSortedSongs(sorted);
  }, [ratings]);

  const handleRatingChange = (songId, category, value) => {
    setRatings((prev) => ({
      ...prev,
      [songId]: {
        ...prev[songId],
        [category]: value,
      },
    }));
  };

  const copyToClipboard = useCallback(() => {
    const tableHeader = `+------------+------|------------------+------------------+------------------+------------------+------------------+-------------------+---------------------------------------------+-------------------------+--------------------------+`;
    const tableSubHeader = `| Position   | Flag | Artist           | Title            | Outfit           | Bühne            | Ohrwurm          | Song             | Ø Average Rating  | Jessis Tags      | Meine Tags        |`;
    const tableDivider = `+------------+------|------------------+------------------+------------------+------------------+------------------+-------------------+---------------------------------------------+-------------------------+--------------------------+`;

    const tableRows = sortedSongs.map((song) => {
      const songId = song.position;
      const artistRating = ratings[songId]?.Artist || '-';
      const outfitRating = ratings[songId]?.Outfit || '-';
      const bühneRating = ratings[songId]?.Bühne || '-';
      const ohrwurmRating = ratings[songId]?.Ohrwurm || '-';
      const songRating = ratings[songId]?.Song || '-';
      const avgRating = calculateAverage(songId);
      const songTags = song.tags ? song.tags.join(' ') : '';
      const userTags = ratings[songId]?.tags ? ratings[songId].tags.join(' ') : '';
      const flag = song.flag || ''; // Flagge des Landes

      return `| ${song.position.toString().padEnd(10)} | ${flag.padEnd(4)} | ${song.artist.padEnd(16)} | ${song.title.padEnd(16)} | ${outfitRating.padEnd(16)} | ${bühneRating.padEnd(16)} | ${ohrwurmRating.padEnd(16)} | ${songRating.padEnd(16)} | ${avgRating.padEnd(17)} | ${songTags.padEnd(20)} | ${userTags.padEnd(20)} |`;
    });

    const tableContent = [tableHeader, tableSubHeader, tableDivider, ...tableRows, tableDivider].join('\n');

    navigator.clipboard.writeText(tableContent).then(
      () => {
        alert('Songs wurden erfolgreich in die Zwischenablage kopiert!');
      },
      (err) => {
        console.error('Fehler beim Kopieren: ', err);
      }
    );
  }, [ratings, sortedSongs]);

  // Funktion zum Leeren des Caches
  const clearCache = () => {
    const confirmation = window.confirm('Bist du sicher, dass du den Cache leeren möchtest? Alle Bewertungen gehen verloren.');
    if (confirmation) {
        // localStorage-Daten löschen
        localStorage.removeItem('esc_ratings');
        localStorage.removeItem('esc_sorted_songs');
        localStorage.removeItem('esc_manual_songs')

        // Zustand zurücksetzen
        setRatings({});
        setSortedSongs(songs);  // Setzt die Songs auf den Anfangszustand zurück
        setManualSort({});
        alert('Cache wurde erfolgreich gelöscht!');
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
      <div className="button-bar">
    <button onClick={toggleTheme}>
        {theme === 'light' ? '🌙' : '☀️'}
    </button>
    <button onClick={() => setShowLegend((prev) => !prev)}>
        {showLegend ? 'Legende ausblenden' : 'Legende anzeigen'}
    </button>
    <button onClick={copyToClipboard}>
        Kopiere Song-Liste als ASCII-Tabelle in die Zwischenablage
    </button>
    <button onClick={clearCache} style={{ backgroundColor: 'red', color: 'white' }}>
        Cache leeren
    </button>
    <button onClick={sortByAverage}>
        Nach Durchschnitt sortieren
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
            <li key={songId} className="song-item" style={{ display: 'flex', alignItems: 'center' }}>
  {/* Links: Sortier-Buttons */}
  <div className="move-buttons" style={{ marginRight: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    <button
      onClick={() => moveSong(songId, 'up')}
      disabled={index === 0}
      style={{ marginBottom: '4px' }}
    >
      🔼
    </button>
    <button
      onClick={() => moveSong(songId, 'down')}
      disabled={index === sortedSongs.length - 1}
    >
      🔽
    </button>
  </div>

  {/* Rechts: Song-Details */}
  <div style={{ flexGrow: 1 }}>
    <div className="song-header">
      <strong>{index + 1}.</strong> {song.flag} <strong>{song.country}:</strong> {song.artist} <em>{song.title}</em>
      <span style={{ float: 'right' }}>
        Ø <strong>{calculateAverage(songId)}</strong> | Startposition: {song.position}
      </span>
    </div>

    <div className="tag-div">
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
    </div>

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
                setRatings((prev) => ({
                  ...prev,
                  [songId]: {
                    ...prev[songId],
                    [category]: val,
                  },
                }));
              }
            }}
          />
        </label>
      ))}
    </div>
  </div>
</li>

          );
        })}
      </ul>
    </div>
  );
};

export default SongList;
