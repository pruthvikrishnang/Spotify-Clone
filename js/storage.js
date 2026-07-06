/* Spotify Clone - LocalStorage Persistence Module */

const STORAGE_KEYS = {
  PLAYLISTS: "spotify_clone_playlists",
  FAVORITES: "spotify_clone_favorites",
  RECENTLY_PLAYED: "spotify_clone_recently_played",
  PLAYER_SETTINGS: "spotify_clone_player_settings",
  CURRENT_QUEUE: "spotify_clone_current_queue"
};

// Default playlist gradient templates for cover fallback
const DEFAULT_GRADIENTS = [
  "linear-gradient(135deg, #f53d3d 0%, #ff8c00 100%)",
  "linear-gradient(135deg, #1e90ff 0%, #20b2aa 100%)",
  "linear-gradient(135deg, #da70d6 0%, #ba55d3 100%)",
  "linear-gradient(135deg, #32cd32 0%, #00fa9a 100%)",
  "linear-gradient(135deg, #4b0082 0%, #0000ff 100%)"
];

function getSafeJSON(key, defaultValue) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.error(`Error reading key "${key}" from localStorage:`, e);
    return defaultValue;
  }
}

function setSafeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing key "${key}" to localStorage:`, e);
  }
}

/* ==========================================================================
   1. Initializer / Defaults
   ========================================================================== */
export function initializeStorage() {
  // Setup default playlists if none exist
  const existingPlaylists = getSafeJSON(STORAGE_KEYS.PLAYLISTS, null);
  if (!existingPlaylists) {
    const defaultPlaylists = [
      {
        id: "playlist-user-1",
        name: "My Chill Beats",
        description: "Your custom relaxation playlist.",
        cover: "linear-gradient(135deg, #450af5 0%, #c4efd9 100%)",
        songs: ["song-1", "song-2", "song-3"],
        createdAt: new Date().toISOString()
      }
    ];
    setSafeJSON(STORAGE_KEYS.PLAYLISTS, defaultPlaylists);
  }

  // Setup empty favorites if none exist
  const existingFavs = getSafeJSON(STORAGE_KEYS.FAVORITES, null);
  if (!existingFavs) {
    setSafeJSON(STORAGE_KEYS.FAVORITES, ["song-1", "song-4", "song-7"]); // Pre-like a few
  }

  // Setup empty recently played if none exist
  const existingHistory = getSafeJSON(STORAGE_KEYS.RECENTLY_PLAYED, null);
  if (!existingHistory) {
    setSafeJSON(STORAGE_KEYS.RECENTLY_PLAYED, ["song-2", "song-5"]);
  }
}

/* ==========================================================================
   2. Playlists CRUD Operations
   ========================================================================== */
export function getPlaylists() {
  return getSafeJSON(STORAGE_KEYS.PLAYLISTS, []);
}

export function getPlaylistById(id) {
  const playlists = getPlaylists();
  return playlists.find(p => p.id === id) || null;
}

export function createPlaylist(name = "New Playlist", description = "") {
  const playlists = getPlaylists();
  const index = playlists.length + 1;
  const newPlaylist = {
    id: `playlist-user-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: name === "New Playlist" ? `My Playlist #${index}` : name,
    description: description,
    cover: DEFAULT_GRADIENTS[Math.floor(Math.random() * DEFAULT_GRADIENTS.length)],
    songs: [],
    createdAt: new Date().toISOString()
  };
  playlists.push(newPlaylist);
  setSafeJSON(STORAGE_KEYS.PLAYLISTS, playlists);
  return newPlaylist;
}

export function updatePlaylistDetails(id, name, description) {
  const playlists = getPlaylists();
  const playlistIndex = playlists.findIndex(p => p.id === id);
  if (playlistIndex !== -1) {
    playlists[playlistIndex].name = name.trim();
    playlists[playlistIndex].description = description.trim();
    setSafeJSON(STORAGE_KEYS.PLAYLISTS, playlists);
    return playlists[playlistIndex];
  }
  return null;
}

export function deletePlaylist(id) {
  const playlists = getPlaylists();
  const filtered = playlists.filter(p => p.id !== id);
  setSafeJSON(STORAGE_KEYS.PLAYLISTS, filtered);
  return true;
}

export function addSongToPlaylist(playlistId, songId) {
  const playlists = getPlaylists();
  const playlistIndex = playlists.findIndex(p => p.id === playlistId);
  if (playlistIndex !== -1) {
    const playlist = playlists[playlistIndex];
    if (!playlist.songs.includes(songId)) {
      playlist.songs.push(songId);
      setSafeJSON(STORAGE_KEYS.PLAYLISTS, playlists);
      return { success: true, message: `Added to "${playlist.name}"` };
    }
    return { success: false, message: "Song already in playlist" };
  }
  return { success: false, message: "Playlist not found" };
}

export function removeSongFromPlaylist(playlistId, songId) {
  const playlists = getPlaylists();
  const playlistIndex = playlists.findIndex(p => p.id === playlistId);
  if (playlistIndex !== -1) {
    const playlist = playlists[playlistIndex];
    playlist.songs = playlist.songs.filter(id => id !== songId);
    setSafeJSON(STORAGE_KEYS.PLAYLISTS, playlists);
    return true;
  }
  return false;
}

/* ==========================================================================
   3. Favorite Songs Operations
   ========================================================================== */
export function getFavorites() {
  return getSafeJSON(STORAGE_KEYS.FAVORITES, []);
}

export function isSongFavorited(songId) {
  const favorites = getFavorites();
  return favorites.includes(songId);
}

export function toggleFavoriteSong(songId) {
  const favorites = getFavorites();
  const index = favorites.indexOf(songId);
  let isAdded = false;
  if (index === -1) {
    favorites.push(songId);
    isAdded = true;
  } else {
    favorites.splice(index, 1);
  }
  setSafeJSON(STORAGE_KEYS.FAVORITES, favorites);
  return isAdded;
}

/* ==========================================================================
   4. Recently Played History
   ========================================================================== */
export function getRecentlyPlayed() {
  return getSafeJSON(STORAGE_KEYS.RECENTLY_PLAYED, []);
}

export function addSongToRecentlyPlayed(songId) {
  let history = getRecentlyPlayed();
  // Remove duplicate if it exists
  history = history.filter(id => id !== songId);
  // Add to front of history
  history.unshift(songId);
  // Keep only the last 10 tracks
  if (history.length > 10) {
    history = history.slice(0, 10);
  }
  setSafeJSON(STORAGE_KEYS.RECENTLY_PLAYED, history);
}

/* ==========================================================================
   5. Player Settings & Queue Persistence
   ========================================================================== */
export function getPlayerSettings() {
  const defaults = {
    volume: 0.7,
    isMuted: false,
    shuffle: false,
    repeatMode: "off", // "off", "context" (repeat-all), "track" (repeat-one)
    currentSongId: null,
    currentTime: 0
  };
  return getSafeJSON(STORAGE_KEYS.PLAYER_SETTINGS, defaults);
}

export function savePlayerSettings(settings) {
  const current = getPlayerSettings();
  const merged = { ...current, ...settings };
  setSafeJSON(STORAGE_KEYS.PLAYER_SETTINGS, merged);
}

export function getSavedQueue() {
  return getSafeJSON(STORAGE_KEYS.CURRENT_QUEUE, []);
}

export function saveQueue(queueArray) {
  setSafeJSON(STORAGE_KEYS.CURRENT_QUEUE, queueArray);
}
