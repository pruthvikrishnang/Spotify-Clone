/* Spotify Clone - UI Rendering & View Engine Module */

import { songs, albums, artists, searchCategories } from "./data.js";
import player from "./player.js";
import * as storage from "./storage.js";

class UIManager {
  constructor() {
    this.viewport = null;
    this.historyStack = [];
    this.historyIndex = -1;
    this.isHistoryNavigating = false;
    this.searchDebounceTimer = null;
    this.activePlaylistEditId = null;
  }

  /* ==========================================================================
     1. Init & Event Bindings
     ========================================================================== */
  init() {
    this.viewport = document.getElementById("page-content-viewport");
    
    // Setup LocalStorage Defaults
    storage.initializeStorage();

    // Setup SPA Routing
    window.addEventListener("hashchange", () => this.handleRouting());
    this.setupHistoryButtons();
    this.handleRouting(); // Call once on start

    // Bind bottom player controls
    this.bindPlayerControls();

    // Bind sidebar buttons
    this.bindSidebarControls();

    // Bind general window/document listeners (modals, shortcuts, etc.)
    this.bindGlobalListeners();

    // Listen to Player Events to sync Bottom Bar UI
    this.subscribeToPlayerEvents();
    
    // Refresh Sidebar playlists
    this.renderSidebarPlaylists();
  }

  /* ==========================================================================
     2. SPA Router & History
     ========================================================================== */
  handleRouting() {
    const hash = window.location.hash || "#home";
    const parts = hash.split("/");
    const route = parts[0];
    const param = parts[1] || null;

    // Track navigation history
    if (!this.isHistoryNavigating) {
      if (this.historyIndex < this.historyStack.length - 1) {
        this.historyStack = this.historyStack.slice(0, this.historyIndex + 1);
      }
      this.historyStack.push(hash);
      this.historyIndex = this.historyStack.length - 1;
    }
    this.isHistoryNavigating = false;
    this.updateHistoryButtonsState();

    // Sync Sidebar Active Item
    this.syncSidebarActiveState(route, param);

    // Dynamic header search bar visibility
    const searchContainer = document.getElementById("header-search-container");
    if (route === "#search") {
      searchContainer.classList.remove("hidden");
    } else {
      searchContainer.classList.add("hidden");
    }

    // Load Skeleton first, then actual view
    this.renderSkeleton(route);
    
    // Artificial mini-delay to show elegant Spotify-like skeleton transition
    setTimeout(() => {
      switch (route) {
        case "#home":
          this.viewHome();
          break;
        case "#search":
          this.viewSearch();
          break;
        case "#artist":
          if (param) this.viewArtist(param);
          else window.location.hash = "#home";
          break;
        case "#album":
          if (param) this.viewAlbum(param);
          else window.location.hash = "#home";
          break;
        case "#playlist":
          if (param) this.viewPlaylist(param);
          else window.location.hash = "#home";
          break;
        case "#favorites":
          this.viewPlaylist("favorites");
          break;
        default:
          this.viewHome();
      }
      lucide.createIcons();
      this.lazyLoadImages();
    }, 350);
  }

  setupHistoryButtons() {
    const backBtn = document.getElementById("history-back-btn");
    const forwardBtn = document.getElementById("history-forward-btn");

    backBtn.addEventListener("click", () => {
      if (this.historyIndex > 0) {
        this.isHistoryNavigating = true;
        this.historyIndex--;
        window.location.hash = this.historyStack[this.historyIndex];
      }
    });

    forwardBtn.addEventListener("click", () => {
      if (this.historyIndex < this.historyStack.length - 1) {
        this.isHistoryNavigating = true;
        this.historyIndex++;
        window.location.hash = this.historyStack[this.historyIndex];
      }
    });
  }

  updateHistoryButtonsState() {
    const backBtn = document.getElementById("history-back-btn");
    const forwardBtn = document.getElementById("history-forward-btn");
    
    backBtn.disabled = this.historyIndex <= 0;
    forwardBtn.disabled = this.historyIndex >= this.historyStack.length - 1;
  }

  syncSidebarActiveState(route, param) {
    document.querySelectorAll(".nav-item").forEach(item => item.classList.remove("active"));
    document.querySelectorAll(".library-item").forEach(item => item.classList.remove("active-item"));

    if (route === "#home") {
      document.getElementById("nav-home").classList.add("active");
    } else if (route === "#search") {
      document.getElementById("nav-search").classList.add("active");
    } else if (route === "#favorites") {
      document.getElementById("library-liked-songs").classList.add("active-item");
    } else if (route === "#playlist") {
      const el = document.getElementById(`sidebar-${param}`);
      if (el) el.classList.add("active-item");
    }
  }

  /* ==========================================================================
     3. Loading Skeletons
     ========================================================================== */
  renderSkeleton(route) {
    let content = "";
    if (route === "#home") {
      content = `
        <div class="page-wrapper">
          <div class="skeleton skeleton-text heading"></div>
          <div class="featured-grid" style="margin-bottom: 30px;">
            ${Array(6).fill('<div class="skeleton" style="height: 80px;"></div>').join("")}
          </div>
          <div class="skeleton skeleton-text heading"></div>
          <div class="shelf-grid">
            ${Array(5).fill('<div class="skeleton skeleton-card"></div>').join("")}
          </div>
        </div>
      `;
    } else if (route === "#artist") {
      content = `
        <div class="page-wrapper">
          <div class="skeleton skeleton-banner"></div>
          <div class="skeleton skeleton-text heading"></div>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${Array(5).fill('<div class="skeleton" style="height: 56px;"></div>').join("")}
          </div>
        </div>
      `;
    } else {
      content = `
        <div class="page-wrapper">
          <div style="display: flex; gap: 20px; align-items: flex-end; margin-bottom: 30px;">
            <div class="skeleton" style="width: 230px; height: 230px; border-radius: 8px;"></div>
            <div style="flex: 1;">
              <div class="skeleton skeleton-text" style="width: 100px;"></div>
              <div class="skeleton skeleton-text" style="width: 300px; height: 50px;"></div>
              <div class="skeleton skeleton-text" style="width: 200px;"></div>
            </div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${Array(6).fill('<div class="skeleton" style="height: 50px;"></div>').join("")}
          </div>
        </div>
      `;
    }
    this.viewport.innerHTML = content;
  }

  /* ==========================================================================
     4. Dynamic Page View Renderers
     ========================================================================== */

  // HOME PAGE
  viewHome() {
    // Greeting
    const hour = new Date().getHours();
    let greeting = "Good evening";
    if (hour < 12) greeting = "Good morning";
    else if (hour < 18) greeting = "Good afternoon";

    // 6 Quick-play boxes
    const gridItems = [
      { name: "Liked Songs", cover: "linear-gradient(135deg, #450af5 0%, #c4efd9 100%)", type: "favorites", playContext: "favorites" },
      ...albums.slice(0, 5).map(a => ({ name: a.title, cover: a.cover, type: "album", playContext: a.id }))
    ];

    const featuredHtml = gridItems.map(item => `
      <div class="featured-card" data-type="${item.type}" data-id="${item.playContext}">
        <img data-src="${item.cover}" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E" class="featured-artwork lazy-image" alt="${item.name}">
        <div class="featured-info">${item.name}</div>
        <button class="featured-play-btn" data-action="play-card" data-type="${item.type}" data-id="${item.playContext}" aria-label="Play">
          <i data-lucide="play" fill="black"></i>
        </button>
      </div>
    `).join("");

    // Recommended Shelf
    const recAlbumsHtml = albums.map(a => `
      <div class="content-card" data-route="#album/${a.id}">
        <div class="card-artwork-wrapper">
          <img data-src="${a.cover}" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E" class="card-artwork lazy-image" alt="${a.title}">
          <button class="card-play-btn" data-action="play-card" data-type="album" data-id="${a.id}" aria-label="Play">
            <i data-lucide="play" fill="black"></i>
          </button>
        </div>
        <div class="card-info">
          <span class="card-title">${a.title}</span>
          <span class="card-desc">${a.artist}</span>
        </div>
      </div>
    `).join("");

    // Artists Shelf
    const artistsHtml = artists.map(art => `
      <div class="content-card card-artist" data-route="#artist/${art.id}">
        <div class="card-artwork-wrapper">
          <img data-src="${art.cover}" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E" class="card-artwork lazy-image" alt="${art.name}">
          <button class="card-play-btn" data-action="play-card" data-type="artist" data-id="${art.id}" aria-label="Play">
            <i data-lucide="play" fill="black"></i>
          </button>
        </div>
        <div class="card-info">
          <span class="card-title">${art.name}</span>
          <span class="card-desc">Artist</span>
        </div>
      </div>
    `).join("");

    this.viewport.innerHTML = `
      <div class="page-wrapper">
        <section class="welcome-section">
          <h1 class="welcome-title">${greeting}</h1>
          <div class="featured-grid">${featuredHtml}</div>
        </section>

        <section class="shelf-section">
          <div class="shelf-header">
            <h2 class="shelf-title">Recommended Albums</h2>
          </div>
          <div class="shelf-grid">${recAlbumsHtml}</div>
        </section>

        <section class="shelf-section">
          <div class="shelf-header">
            <h2 class="shelf-title">Popular Artists</h2>
          </div>
          <div class="shelf-grid">${artistsHtml}</div>
        </section>
      </div>
    `;

    // Dynamic routing trigger bindings
    this.bindCardRouting();
  }

  // SEARCH PAGE
  viewSearch() {
    const searchField = document.getElementById("search-input-field");
    const query = searchField.value.trim().toLowerCase();

    if (!query) {
      this.renderSearchCategories();
    } else {
      this.renderSearchResults(query);
    }
  }

  renderSearchCategories() {
    const categoriesHtml = searchCategories.map(c => `
      <div class="category-card" data-action="category-click" data-title="${c.title}">
        <div class="category-card-content" style="background-color: ${c.color}">
          <span class="category-title">${c.title}</span>
          <img data-src="${c.artwork}" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E" class="category-artwork lazy-image" alt="">
        </div>
      </div>
    `).join("");

    this.viewport.innerHTML = `
      <div class="page-wrapper search-categories-section">
        <h2 class="search-title">Browse all</h2>
        <div class="categories-grid">${categoriesHtml}</div>
      </div>
    `;

    // Category click handler (set search input & fire)
    this.viewport.querySelectorAll(".category-card").forEach(card => {
      card.addEventListener("click", () => {
        const title = card.getAttribute("data-title");
        const searchField = document.getElementById("search-input-field");
        searchField.value = title;
        document.getElementById("search-clear-btn").classList.remove("hidden");
        this.renderSearchResults(title.toLowerCase());
      });
    });
  }

  renderSearchResults(query) {
    // Filter matching content
    const filteredSongs = songs.filter(s => 
      s.title.toLowerCase().includes(query) || s.artist.toLowerCase().includes(query)
    );
    const filteredArtists = artists.filter(a => a.name.toLowerCase().includes(query));
    const filteredAlbums = albums.filter(al => al.title.toLowerCase().includes(query));

    if (filteredSongs.length === 0 && filteredArtists.length === 0 && filteredAlbums.length === 0) {
      this.viewport.innerHTML = `
        <div class="page-wrapper" style="text-align: center; padding-top: 80px;">
          <h2 style="font-size: 24px; font-weight: 700; margin-bottom: var(--spacing-sm);">No results found for "${query}"</h2>
          <span style="color: var(--text-muted);">Please make sure your words are spelled correctly, or use fewer keywords.</span>
        </div>
      `;
      return;
    }

    // Top Result Selection (Prefer artist, then album, then song)
    let topResult = null;
    let topType = "song";

    if (filteredArtists.length > 0) {
      topResult = filteredArtists[0];
      topType = "artist";
    } else if (filteredAlbums.length > 0) {
      topResult = filteredAlbums[0];
      topType = "album";
    } else if (filteredSongs.length > 0) {
      topResult = filteredSongs[0];
      topType = "song";
    }

    let topResultCardHtml = "";
    if (topResult) {
      const isArtist = topType === "artist";
      const cover = isArtist ? topResult.cover : topResult.cover;
      const title = isArtist ? topResult.name : (topType === "album" ? topResult.title : topResult.title);
      const desc = isArtist ? "Artist" : (topType === "album" ? `Album &bull; ${topResult.artist}` : `Song &bull; ${topResult.artist}`);
      const linkHash = `#${topType}/${topResult.id}`;

      topResultCardHtml = `
        <div class="top-result-card" data-route="${linkHash}">
          <img data-src="${cover}" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E" class="top-result-artwork lazy-image ${isArtist ? 'top-result-artist-art' : ''}" alt="">
          <span class="top-result-name">${title}</span>
          <span class="top-result-type-badge">${desc}</span>
          <button class="top-result-play-btn" data-action="play-card" data-type="${topType}" data-id="${topResult.id}" aria-label="Play">
            <i data-lucide="play" fill="black"></i>
          </button>
        </div>
      `;
    }

    // Up to 4 matching tracks
    const tracksSectionHtml = filteredSongs.slice(0, 4).map((s, index) => {
      const isLiked = storage.isSongFavorited(s.id);
      return `
        <div class="song-row" data-id="${s.id}">
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 12px; border-radius: var(--border-radius-md);">
            <div class="song-title-cell" style="flex: 1; min-width: 0;">
              <img data-src="${s.cover}" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E" class="song-cell-artwork lazy-image" alt="">
              <div class="song-title-info">
                <span class="song-title-name">${s.title}</span>
                <span class="song-artist-link" data-route="#artist/${s.artistId}">${s.artist}</span>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: var(--spacing-lg);">
              <button class="song-row-like-btn ${isLiked ? 'liked' : ''}" data-action="toggle-like" data-id="${s.id}" aria-label="Like">
                <i data-lucide="heart" ${isLiked ? 'fill="var(--color-primary)"' : ''}></i>
              </button>
              <span style="color: var(--text-muted); font-size: 13px;">${this.formatTime(s.duration)}</span>
              <button class="song-row-options-btn" data-action="song-menu" data-id="${s.id}">
                <i data-lucide="more-horizontal"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join("");

    // Artist list rows
    const matchingArtistsHtml = filteredArtists.slice(0, 5).map(art => `
      <div class="content-card card-artist" data-route="#artist/${art.id}">
        <div class="card-artwork-wrapper">
          <img data-src="${art.cover}" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E" class="card-artwork lazy-image" alt="">
          <button class="card-play-btn" data-action="play-card" data-type="artist" data-id="${art.id}" aria-label="Play">
            <i data-lucide="play" fill="black"></i>
          </button>
        </div>
        <div class="card-info">
          <span class="card-title">${art.name}</span>
          <span class="card-desc">Artist</span>
        </div>
      </div>
    `).join("");

    // Album list rows
    const matchingAlbumsHtml = filteredAlbums.slice(0, 5).map(al => `
      <div class="content-card" data-route="#album/${al.id}">
        <div class="card-artwork-wrapper">
          <img data-src="${al.cover}" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E" class="card-artwork lazy-image" alt="">
          <button class="card-play-btn" data-action="play-card" data-type="album" data-id="${al.id}" aria-label="Play">
            <i data-lucide="play" fill="black"></i>
          </button>
        </div>
        <div class="card-info">
          <span class="card-title">${al.title}</span>
          <span class="card-desc">${al.artist}</span>
        </div>
      </div>
    `).join("");

    this.viewport.innerHTML = `
      <div class="page-wrapper search-results-wrapper">
        <div class="search-top-results-row">
          <div>
            <h2 class="search-title">Top Result</h2>
            ${topResultCardHtml}
          </div>
          <div>
            <h2 class="search-title">Songs</h2>
            <div style="display: flex; flex-direction: column; gap: var(--spacing-xs);">${tracksSectionHtml}</div>
          </div>
        </div>

        ${filteredAlbums.length > 0 ? `
          <section class="shelf-section">
            <h2 class="search-title">Albums</h2>
            <div class="shelf-grid">${matchingAlbumsHtml}</div>
          </section>
        ` : ''}

        ${filteredArtists.length > 0 ? `
          <section class="shelf-section">
            <h2 class="search-title">Artists</h2>
            <div class="shelf-grid">${matchingArtistsHtml}</div>
          </section>
        ` : ''}
      </div>
    `;

    this.bindCardRouting();
    this.bindSongsTableActionEvents();
    lucide.createIcons();
    this.lazyLoadImages();
  }

  // ARTIST PAGE
  viewArtist(id) {
    const artist = artists.find(a => a.id === id);
    if (!artist) {
      window.location.hash = "#home";
      return;
    }

    // Dynamic banner image and verified logo
    const topTracks = songs.filter(s => s.artistId === id).slice(0, 5);
    const relatedAlbums = albums.filter(al => al.artistId === id);

    const tracksHtml = this.buildTracksTable(topTracks, `artist-${id}`);

    const albumsHtml = relatedAlbums.map(al => `
      <div class="content-card" data-route="#album/${al.id}">
        <div class="card-artwork-wrapper">
          <img data-src="${al.cover}" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E" class="card-artwork lazy-image" alt="">
          <button class="card-play-btn" data-action="play-card" data-type="album" data-id="${al.id}" aria-label="Play">
            <i data-lucide="play" fill="black"></i>
          </button>
        </div>
        <div class="card-info">
          <span class="card-title">${al.title}</span>
          <span class="card-desc">${al.year} &bull; Album</span>
        </div>
      </div>
    `).join("");

    this.viewport.innerHTML = `
      <div class="page-wrapper">
        <div class="artist-banner-header" style="background-image: url('${artist.cover}')">
          <div class="artist-banner-content">
            <div class="artist-verified-wrapper">
              <i data-lucide="badge-check"></i>
              <span>Verified Artist</span>
            </div>
            <h1 class="artist-banner-title">${artist.name}</h1>
            <span class="artist-listeners-count">${artist.followers} monthly listeners</span>
          </div>
        </div>

        <div class="detail-actions-bar">
          <button class="detail-play-btn" data-action="play-card" data-type="artist" data-id="${artist.id}" aria-label="Play Artist">
            <i data-lucide="play" fill="black"></i>
          </button>
          <button class="upgrade-badge-btn" style="border: 1px solid var(--text-muted); background: none; color: white;">Follow</button>
        </div>

        <section class="shelf-section" style="margin-top: var(--spacing-xl);">
          <h2 class="shelf-title" style="margin-bottom: var(--spacing-lg);">Popular</h2>
          ${tracksHtml}
        </section>

        ${relatedAlbums.length > 0 ? `
          <section class="shelf-section">
            <h2 class="shelf-title" style="margin-bottom: var(--spacing-lg);">Albums</h2>
            <div class="shelf-grid">${albumsHtml}</div>
          </section>
        ` : ""}

        <section class="shelf-section">
          <h2 class="shelf-title" style="margin-bottom: var(--spacing-md);">About</h2>
          <div class="content-card" style="cursor: default; min-height: auto; padding: 24px; flex-direction: row; gap: 24px;">
            <div style="flex: 1;">
              <span style="display: block; font-size: 15px; font-weight: 500; color: var(--text-muted); line-height: 1.6;">${artist.bio}</span>
            </div>
          </div>
        </section>
      </div>
    `;

    this.bindCardRouting();
    this.bindSongsTableActionEvents();
  }

  // ALBUM PAGE
  viewAlbum(id) {
    const album = albums.find(al => al.id === id);
    if (!album) {
      window.location.hash = "#home";
      return;
    }

    const albumSongs = songs.filter(s => s.albumId === id);
    const totalDurationSec = albumSongs.reduce((acc, curr) => acc + curr.duration, 0);
    const formattedTotalDuration = this.formatTotalDuration(totalDurationSec);

    const tracksHtml = this.buildTracksTable(albumSongs, `album-${id}`, false);

    this.viewport.innerHTML = `
      <div class="page-wrapper">
        <div class="detail-header-wrapper">
          <div class="detail-header-bg" style="background-image: linear-gradient(to right, #181818, rgba(30,215,96,0.25))"></div>
          <div class="detail-artwork-wrapper">
            <img class="detail-artwork" src="${album.cover}" alt="${album.title}">
          </div>
          <div class="detail-meta-info">
            <span class="detail-type">Album</span>
            <h1 class="detail-title">${album.title}</h1>
            <div class="detail-owner-stats">
              <span class="detail-owner-name">${album.artist}</span>
              <span class="detail-stat-divider">&bull;</span>
              <span class="detail-stat-value">${album.year}</span>
              <span class="detail-stat-divider">&bull;</span>
              <span class="detail-stat-value">${albumSongs.length} songs</span>
              <span class="detail-stat-divider">&bull;</span>
              <span class="detail-stat-value">${formattedTotalDuration}</span>
            </div>
          </div>
        </div>

        <div class="detail-actions-bar">
          <button class="detail-play-btn" data-action="play-card" data-type="album" data-id="${album.id}" aria-label="Play Album">
            <i data-lucide="play" fill="black"></i>
          </button>
          <button class="detail-action-icon-btn" aria-label="Save to library"><i data-lucide="plus-circle"></i></button>
          <button class="detail-action-icon-btn" aria-label="More options"><i data-lucide="more-horizontal"></i></button>
        </div>

        <div class="songs-list-container">
          ${tracksHtml}
        </div>
      </div>
    `;

    this.bindCardRouting();
    this.bindSongsTableActionEvents();
  }

  // PLAYLIST PAGE
  viewPlaylist(id) {
    let playlist = null;
    let playlistSongs = [];
    let isFavorites = id === "favorites";

    if (isFavorites) {
      playlist = {
        id: "favorites",
        name: "Liked Songs",
        description: "Your favorite songs kept in sync on this device.",
        cover: "linear-gradient(135deg, #450af5 0%, #c4efd9 100%)",
        songs: storage.getFavorites()
      };
    } else {
      playlist = storage.getPlaylistById(id);
    }

    if (!playlist) {
      window.location.hash = "#home";
      return;
    }

    playlistSongs = playlist.songs.map(songId => songs.find(s => s.id === songId)).filter(Boolean);
    const totalDurationSec = playlistSongs.reduce((acc, curr) => acc + curr.duration, 0);
    const formattedTotalDuration = this.formatTotalDuration(totalDurationSec);

    const tracksHtml = playlistSongs.length > 0 
      ? this.buildTracksTable(playlistSongs, `playlist-${id}`, true, playlist.id) 
      : `
        <div style="text-align: center; padding: 40px; color: var(--text-muted);">
          <i data-lucide="music-4" style="width: 48px; height: 48px; margin-bottom: 12px; stroke-width: 1;"></i>
          <p style="font-size: 14px;">Songs you add will appear here.</p>
        </div>
      `;

    // Dynamic Playlist Header (Interactive with custom modals for user playlists)
    this.viewport.innerHTML = `
      <div class="page-wrapper">
        <div class="detail-header-wrapper">
          <div class="detail-header-bg" style="background-image: linear-gradient(to right, #181818, rgba(30,215,96,0.15))"></div>
          <div class="detail-artwork-wrapper" ${!isFavorites ? `id="playlist-header-artwork" data-id="${playlist.id}"` : ""}>
            ${isFavorites 
              ? `<div class="liked-songs-icon-wrapper" style="width: 100%; height: 100%; border-radius: 0;"><i data-lucide="heart" fill="white" style="width: 80px; height: 80px;"></i></div>`
              : (playlist.cover.startsWith("linear") 
                ? `<div style="background: ${playlist.cover}; width: 100%; height: 100%; border-radius: 0; display:flex; align-items:center; justify-content:center;"><i data-lucide="music" style="width: 80px; height: 80px; color: rgba(255,255,255,0.4)"></i></div>`
                : `<img class="detail-artwork" src="${playlist.cover}" alt="">`
              )
            }
            ${!isFavorites ? `
              <div class="detail-artwork-overlay">
                <i data-lucide="edit-3"></i>
                <span>Choose photo</span>
              </div>
            ` : ""}
          </div>
          <div class="detail-meta-info">
            <span class="detail-type">Playlist</span>
            <h1 class="detail-title" ${!isFavorites ? `id="playlist-header-name" data-id="${playlist.id}" style="cursor: pointer;"` : ""}>${playlist.name}</h1>
            <p class="detail-desc" ${!isFavorites ? `id="playlist-header-desc" data-id="${playlist.id}" style="cursor: pointer;"` : ""}>${playlist.description || "No description."}</p>
            <div class="detail-owner-stats">
              <span class="detail-owner-name">Guest User</span>
              <span class="detail-stat-divider">&bull;</span>
              <span class="detail-stat-value">${playlistSongs.length} songs</span>
              ${playlistSongs.length > 0 ? `
                <span class="detail-stat-divider">&bull;</span>
                <span class="detail-stat-value">${formattedTotalDuration}</span>
              ` : ""}
            </div>
          </div>
        </div>

        <div class="detail-actions-bar">
          ${playlistSongs.length > 0 ? `
            <button class="detail-play-btn" data-action="play-card" data-type="playlist" data-id="${playlist.id}" aria-label="Play Playlist">
              <i data-lucide="play" fill="black"></i>
            </button>
          ` : ""}
          ${!isFavorites ? `
            <button class="detail-action-icon-btn" id="delete-playlist-detail-btn" data-id="${playlist.id}" title="Delete Playlist" aria-label="Delete Playlist">
              <i data-lucide="trash-2"></i>
            </button>
          ` : ""}
        </div>

        <div class="songs-list-container" style="margin-bottom: var(--spacing-huge);">
          ${tracksHtml}
        </div>

        <!-- Dynamic Spotify-like Add Recommended Songs area at the bottom of user playlists -->
        ${!isFavorites ? this.buildRecommendationFinder(playlist.id) : ""}
      </div>
    `;

    // Bind triggers
    this.bindCardRouting();
    this.bindSongsTableActionEvents();
    this.bindPlaylistCRUDTriggers(playlist.id);
  }

  /* ==========================================================================
     5. Songs Table & Playlist Recommendation Builder helpers
     ========================================================================== */
  buildTracksTable(tracksList, contextId, showAlbumLink = true, playlistId = null) {
    let trs = tracksList.map((s, index) => {
      const isLiked = storage.isSongFavorited(s.id);
      const isCurrentPlaying = player.currentTrack?.id === s.id;
      
      return `
        <tr class="song-row ${isCurrentPlaying ? 'playing-row' : ''}" data-id="${s.id}" data-index="${index}" data-context="${contextId}">
          <td class="song-col-index">
            <span class="song-number-text">${index + 1}</span>
            <button class="song-row-play-btn" data-action="play-index" data-index="${index}" data-context="${contextId}">
              <i data-lucide="play" fill="white" style="width: 14px; height: 14px;"></i>
            </button>
          </td>
          <td>
            <div class="song-title-cell">
              <img data-src="${s.cover}" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E" class="song-cell-artwork lazy-image" alt="">
              <div class="song-title-info">
                <span class="song-title-name">${s.title}</span>
                <span class="song-artist-link" data-route="#artist/${s.artistId}">${s.artist}</span>
              </div>
            </div>
          </td>
          ${showAlbumLink ? `
            <td>
              <span class="song-album-link" data-route="#album/${s.albumId}">${s.album}</span>
            </td>
          ` : ""}
          <td>
            <span class="song-col-added">${s.dateAdded}</span>
          </td>
          <td>
            <div class="song-col-duration">
              <button class="song-row-like-btn ${isLiked ? 'liked' : ''}" data-action="toggle-like" data-id="${s.id}">
                <i data-lucide="heart" ${isLiked ? 'fill="var(--color-primary)"' : ''} style="width:16px; height:16px;"></i>
              </button>
              <span>${this.formatTime(s.duration)}</span>
              
              <!-- Options dots -->
              ${playlistId ? `
                <button class="song-row-options-btn" data-action="remove-from-playlist" data-playlist-id="${playlistId}" data-id="${s.id}" title="Remove from playlist">
                  <i data-lucide="minus-circle" style="width: 16px; height: 16px;"></i>
                </button>
              ` : `
                <button class="song-row-options-btn" data-action="song-menu" data-id="${s.id}">
                  <i data-lucide="more-horizontal" style="width: 16px; height: 16px;"></i>
                </button>
              `}
            </div>
          </td>
        </tr>
      `;
    }).join("");

    return `
      <table class="songs-table">
        <thead>
          <tr class="songs-table-header">
            <th>#</th>
            <th>Title</th>
            ${showAlbumLink ? `<th>Album</th>` : ""}
            <th>Date Added</th>
            <th><i data-lucide="clock" style="width: 16px; height: 16px; margin-right: var(--spacing-sm);"></i></th>
          </tr>
        </thead>
        <tbody>
          ${trs}
        </tbody>
      </table>
    `;
  }

  buildRecommendationFinder(playlistId) {
    const defaultRecs = songs.filter(s => {
      const pl = storage.getPlaylistById(playlistId);
      return pl ? !pl.songs.includes(s.id) : true;
    }).slice(0, 4);

    const listHtml = defaultRecs.map(s => `
      <div class="song-row" style="padding: var(--spacing-sm) 0; border-bottom: 1px solid rgba(255,255,255,0.03);">
        <div style="display:flex; align-items:center; justify-content:space-between;">
          <div class="song-title-cell">
            <img data-src="${s.cover}" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E" class="song-cell-artwork lazy-image" alt="">
            <div class="song-title-info">
              <span class="song-title-name">${s.title}</span>
              <span class="song-artist-link" data-route="#artist/${s.artistId}">${s.artist}</span>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap: var(--spacing-lg);">
            <span style="font-size: 13px; color: var(--text-muted);">${s.album}</span>
            <button class="upgrade-badge-btn" data-action="add-rec-song" data-playlist-id="${playlistId}" data-id="${s.id}" style="background: none; border: 1px solid var(--text-muted); color: white; padding: 4px 12px; font-size:12px;">Add</button>
          </div>
        </div>
      </div>
    `).join("");

    return `
      <section class="shelf-section" style="margin-top: 40px; padding-top: 30px; border-top: 1px solid rgba(255,255,255,0.1);">
        <h2 class="shelf-title" style="margin-bottom: var(--spacing-sm);">Let's add some songs to your playlist</h2>
        <span style="color: var(--text-muted); font-size:14px; display:block; margin-bottom: var(--spacing-lg);">Based on the tracks in this playlist</span>
        <div style="display:flex; flex-direction:column; gap: var(--spacing-xs);">${listHtml}</div>
      </section>
    `;
  }

  /* ==========================================================================
     6. Event Delegations & View Bindings
     ========================================================================== */
  bindCardRouting() {
    // Bind routing links
    this.viewport.querySelectorAll("[data-route]").forEach(el => {
      el.addEventListener("click", (e) => {
        // Prevent trigger if clicking buttons inside cards (like Play buttons)
        if (e.target.closest("button") || e.target.closest(".song-artist-link") || e.target.closest(".song-album-link")) return;
        window.location.hash = el.getAttribute("data-route");
      });
    });

    // Play action card trigger
    this.viewport.querySelectorAll("[data-action='play-card']").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const type = btn.getAttribute("data-type");
        const id = btn.getAttribute("data-id");
        this.playContext(type, id);
      });
    });
  }

  bindSongsTableActionEvents() {
    // Row click play song trigger
    this.viewport.querySelectorAll(".song-row").forEach(row => {
      row.addEventListener("dblclick", () => {
        const id = row.getAttribute("data-id");
        const songIdx = parseInt(row.getAttribute("data-index"));
        const context = row.getAttribute("data-context");
        this.playTrackFromContext(id, songIdx, context);
      });
    });

    // Inline play button row click
    this.viewport.querySelectorAll("[data-action='play-index']").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute("data-index"));
        const context = btn.getAttribute("data-context");
        
        let songList = [];
        if (context.startsWith("album-")) {
          const albumId = context.replace("album-", "");
          songList = songs.filter(s => s.albumId === albumId);
        } else if (context.startsWith("artist-")) {
          const artistId = context.replace("artist-", "");
          songList = songs.filter(s => s.artistId === artistId).slice(0, 5);
        } else if (context.startsWith("playlist-")) {
          const plId = context.replace("playlist-", "");
          if (plId === "favorites") {
            const favorites = storage.getFavorites();
            songList = favorites.map(id => songs.find(s => s.id === id)).filter(Boolean);
          } else {
            const pl = storage.getPlaylistById(plId);
            songList = pl ? pl.songs.map(id => songs.find(s => s.id === id)).filter(Boolean) : [];
          }
        }

        player.setContext(songList, idx, context);
      });
    });

    // Heart Like toggle
    this.viewport.querySelectorAll("[data-action='toggle-like']").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-id");
        const wasAdded = storage.toggleFavoriteSong(id);
        
        // Toggle class
        if (wasAdded) {
          btn.classList.add("liked");
          btn.innerHTML = `<i data-lucide="heart" fill="var(--color-primary)"></i>`;
          this.showToast("Saved to Liked Songs");
        } else {
          btn.classList.remove("liked");
          btn.innerHTML = `<i data-lucide="heart"></i>`;
          this.showToast("Removed from Liked Songs");
        }
        
        lucide.createIcons();

        // If currently viewing favorites page, reload view to remove unliked track immediately
        if (window.location.hash === "#favorites" || window.location.hash.startsWith("#playlist/favorites")) {
          this.viewPlaylist("favorites");
          lucide.createIcons();
        }

        // Sync with player if this is the active playing track
        if (player.currentTrack?.id === id) {
          this.syncPlayerLikeButton(id);
        }
      });
    });

    // Custom song options menus / lists
    this.viewport.querySelectorAll("[data-action='song-menu']").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const songId = btn.getAttribute("data-id");
        this.openSongContextMenu(songId, e.clientX, e.clientY);
      });
    });

    // Inner artist/album links
    this.viewport.querySelectorAll(".song-artist-link, .song-album-link").forEach(link => {
      link.addEventListener("click", (e) => {
        e.stopPropagation();
        window.location.hash = link.getAttribute("data-route");
      });
    });
  }

  bindPlaylistCRUDTriggers(playlistId) {
    const isFavorites = playlistId === "favorites";
    if (isFavorites) return;

    // Trigger details modal on clicking header title, description, or artwork preview overlay
    const titleHeader = document.getElementById("playlist-header-name");
    const descHeader = document.getElementById("playlist-header-desc");
    const artworkPreview = document.getElementById("playlist-header-artwork");

    const openModal = () => this.openPlaylistEditModal(playlistId);
    if (titleHeader) titleHeader.addEventListener("click", openModal);
    if (descHeader) descHeader.addEventListener("click", openModal);
    if (artworkPreview) artworkPreview.addEventListener("click", openModal);

    // Delete Playlist Button
    const deleteBtn = document.getElementById("delete-playlist-detail-btn");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to delete this playlist? This action cannot be undone.")) {
          storage.deletePlaylist(playlistId);
          this.showToast("Playlist deleted");
          this.renderSidebarPlaylists();
          window.location.hash = "#home";
        }
      });
    }

    // Recommended items section adding action
    this.viewport.querySelectorAll("[data-action='add-rec-song']").forEach(btn => {
      btn.addEventListener("click", () => {
        const sId = btn.getAttribute("data-id");
        const plId = btn.getAttribute("data-playlist-id");
        const res = storage.addSongToPlaylist(plId, sId);
        
        if (res.success) {
          this.showToast(res.message);
          this.viewPlaylist(plId); // Reload playlist view
          this.renderSidebarPlaylists();
        } else {
          this.showToast(res.message, true);
        }
      });
    });

    // Remove songs from playlist
    this.viewport.querySelectorAll("[data-action='remove-from-playlist']").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const sId = btn.getAttribute("data-id");
        const plId = btn.getAttribute("data-playlist-id");
        storage.removeSongFromPlaylist(plId, sId);
        this.showToast("Removed from playlist");
        this.viewPlaylist(plId); // Reload view
        this.renderSidebarPlaylists();
      });
    });
  }

  /* ==========================================================================
     7. Playing Context handlers
     ========================================================================== */
  playContext(type, id) {
    let list = [];
    let contextId = `${type}-${id}`;

    if (type === "album") {
      list = songs.filter(s => s.albumId === id);
    } else if (type === "artist") {
      list = songs.filter(s => s.artistId === id).slice(0, 5);
    } else if (type === "playlist") {
      if (id === "favorites") {
        const favorites = storage.getFavorites();
        list = favorites.map(fId => songs.find(s => s.id === fId)).filter(Boolean);
      } else {
        const pl = storage.getPlaylistById(id);
        list = pl ? pl.songs.map(fId => songs.find(s => s.id === fId)).filter(Boolean) : [];
      }
    } else if (type === "favorites") {
      const favorites = storage.getFavorites();
      list = favorites.map(fId => songs.find(s => s.id === fId)).filter(Boolean);
      contextId = "playlist-favorites";
    }

    if (list.length > 0) {
      player.setContext(list, 0, contextId);
      this.showToast(`Playing ${type}`);
    } else {
      this.showToast("No playable songs found in this context", true);
    }
  }

  playTrackFromContext(songId, index, context) {
    let songList = [];
    if (context.startsWith("album-")) {
      const albumId = context.replace("album-", "");
      songList = songs.filter(s => s.albumId === albumId);
    } else if (context.startsWith("artist-")) {
      const artistId = context.replace("artist-", "");
      songList = songs.filter(s => s.artistId === artistId).slice(0, 5);
    } else if (context.startsWith("playlist-")) {
      const plId = context.replace("playlist-", "");
      if (plId === "favorites") {
        const favorites = storage.getFavorites();
        songList = favorites.map(id => songs.find(s => s.id === id)).filter(Boolean);
      } else {
        const pl = storage.getPlaylistById(plId);
        songList = pl ? pl.songs.map(id => songs.find(s => s.id === id)).filter(Boolean) : [];
      }
    } else {
      // Standalone queue play
      const song = songs.find(s => s.id === songId);
      if (song) {
        player.setContext([song], 0, "single-track");
        return;
      }
    }

    player.setContext(songList, index, context);
  }

  /* ==========================================================================
     8. Playlist Modals Details CRUD
     ========================================================================== */
  openPlaylistEditModal(playlistId) {
    const playlist = storage.getPlaylistById(playlistId);
    if (!playlist) return;

    this.activePlaylistEditId = playlistId;

    const modal = document.getElementById("playlist-modal");
    const titleInput = document.getElementById("playlist-name-input");
    const descInput = document.getElementById("playlist-desc-input");
    const preview = document.getElementById("modal-artwork-preview");

    titleInput.value = playlist.name;
    descInput.value = playlist.description || "";
    
    if (playlist.cover.startsWith("linear")) {
      preview.style.background = playlist.cover;
      preview.innerHTML = `<i data-lucide="music" style="width: 48px; height: 48px; color: rgba(255,255,255,0.4)"></i>`;
    } else {
      preview.style.background = "none";
      preview.innerHTML = `<img src="${playlist.cover}" style="width:100%; height:100%; object-fit:cover; border-radius:var(--border-radius-md);">`;
    }

    modal.classList.remove("hidden");
    titleInput.focus();
    lucide.createIcons();
  }

  closePlaylistEditModal() {
    const modal = document.getElementById("playlist-modal");
    modal.classList.add("hidden");
    this.activePlaylistEditId = null;
    document.getElementById("playlist-modal-form").reset();
    document.getElementById("name-error").classList.add("hidden");
  }

  savePlaylistDetails(e) {
    e.preventDefault();
    const name = document.getElementById("playlist-name-input").value.trim();
    const desc = document.getElementById("playlist-desc-input").value.trim();

    if (!name) {
      document.getElementById("name-error").classList.remove("hidden");
      return;
    }

    if (this.activePlaylistEditId) {
      storage.updatePlaylistDetails(this.activePlaylistEditId, name, desc);
      this.showToast("Changes saved");
      this.viewPlaylist(this.activePlaylistEditId); // Reload page view
      this.renderSidebarPlaylists(); // Sync sidebar list
      this.closePlaylistEditModal();
    }
  }

  /* ==========================================================================
     9. Sidebar playlists renderer list
     ========================================================================== */
  renderSidebarPlaylists() {
    const container = document.getElementById("sidebar-playlists-container");
    
    // Select Liked Songs to preserve it
    const favoritesLi = document.getElementById("library-liked-songs");
    container.innerHTML = "";
    container.appendChild(favoritesLi);

    const userPlaylists = storage.getPlaylists();
    
    userPlaylists.forEach(pl => {
      const li = document.createElement("li");
      li.className = "library-item";
      li.id = `sidebar-${pl.id}`;

      let artHtml = "";
      if (pl.cover.startsWith("linear")) {
        artHtml = `<div style="background: ${pl.cover}; width: 48px; height: 48px; border-radius: var(--border-radius-md); display:flex; align-items:center; justify-content:center;"><i data-lucide="music" style="width: 22px; height: 22px; color: rgba(255,255,255,0.4)"></i></div>`;
      } else {
        artHtml = `<img src="${pl.cover}" class="library-item-artwork" alt="">`;
      }

      li.innerHTML = `
        <a href="#playlist/${pl.id}" class="library-link">
          ${artHtml}
          <div class="library-item-info">
            <span class="library-item-title">${pl.name}</span>
            <span class="library-item-type">Playlist &bull; Custom</span>
          </div>
        </a>
      `;

      container.appendChild(li);
    });

    lucide.createIcons();

    // Rebind sidebar routing
    container.querySelectorAll(".library-link").forEach(link => {
      link.addEventListener("click", () => {
        const hash = link.getAttribute("href");
        window.location.hash = hash;
      });
    });
  }

  bindSidebarControls() {
    const createBtn = document.getElementById("create-playlist-sidebar-btn");
    createBtn.addEventListener("click", () => {
      const playlist = storage.createPlaylist("New Playlist", "");
      this.showToast(`Created "${playlist.name}"`);
      this.renderSidebarPlaylists();
      window.location.hash = `#playlist/${playlist.id}`;
      // Open editor directly for details update
      this.openPlaylistEditModal(playlist.id);
    });
  }

  /* ==========================================================================
     10. Song Option Context Menu list helper
     ========================================================================== */
  openSongContextMenu(songId, x, y) {
    // Clear existing context menu
    this.closeSongContextMenu();

    const menu = document.createElement("div");
    menu.id = "song-custom-context-menu";
    menu.style.position = "fixed";
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    menu.style.backgroundColor = "rgba(40, 40, 40, 0.98)";
    menu.style.border = "1px solid rgba(255, 255, 255, 0.08)";
    menu.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.5)";
    menu.style.borderRadius = "var(--border-radius-md)";
    menu.style.padding = "4px 0";
    menu.style.zIndex = "1000";
    menu.style.width = "220px";
    menu.style.animation = "fadeIn 0.15s ease-out forwards";

    // Playlists suboptions
    const playlists = storage.getPlaylists();
    let plItems = playlists.map(pl => `
      <button class="context-submenu-item" data-action="add-to-pl" data-playlist-id="${pl.id}" data-song-id="${songId}">
        <span>${pl.name}</span>
      </button>
    `).join("");

    menu.innerHTML = `
      <button class="context-menu-item" data-action="add-to-queue" data-id="${songId}">
        <i data-lucide="play-square" style="width:16px; height:16px;"></i>
        <span>Add to queue</span>
      </button>
      <div style="height:1px; background:rgba(255,255,255,0.06); margin: 4px 0;"></div>
      <div class="context-menu-item parent-item">
        <i data-lucide="plus-circle" style="width:16px; height:16px;"></i>
        <span>Add to playlist</span>
        <i data-lucide="chevron-right" style="width:12px; height:12px; margin-left:auto;"></i>
        
        <!-- Submenu -->
        <div class="context-submenu custom-scrollbar">
          ${playlists.length > 0 ? plItems : '<span style="color:var(--text-subdued); padding: 8px 12px; font-size:12px; display:block;">No playlists. Create one in sidebar.</span>'}
        </div>
      </div>
    `;

    document.body.appendChild(menu);
    lucide.createIcons();

    // Event Bindings
    menu.querySelector("[data-action='add-to-queue']").addEventListener("click", () => {
      const song = songs.find(s => s.id === songId);
      if (song) {
        player.addToQueue(song);
        this.showToast("Added to play queue");
      }
      this.closeSongContextMenu();
    });

    menu.querySelectorAll("[data-action='add-to-pl']").forEach(btn => {
      btn.addEventListener("click", () => {
        const plId = btn.getAttribute("data-playlist-id");
        const sId = btn.getAttribute("data-song-id");
        const res = storage.addSongToPlaylist(plId, sId);
        if (res.success) {
          this.showToast(res.message);
          this.renderSidebarPlaylists();
        } else {
          this.showToast(res.message, true);
        }
        this.closeSongContextMenu();
      });
    });

    // Close on click outside
    const clickOutsideHandler = (e) => {
      if (!menu.contains(e.target)) {
        this.closeSongContextMenu();
        document.removeEventListener("mousedown", clickOutsideHandler);
      }
    };
    document.addEventListener("mousedown", clickOutsideHandler);

    // Prevent context menu boundary overflow
    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      menu.style.left = `${window.innerWidth - rect.width - 10}px`;
    }
    if (rect.bottom > window.innerHeight) {
      menu.style.top = `${window.innerHeight - rect.height - 10}px`;
    }
  }

  closeSongContextMenu() {
    const existing = document.getElementById("song-custom-context-menu");
    if (existing) existing.remove();
  }

  /* ==========================================================================
     11. Volume, Seek slider logic bottom player bindings
     ========================================================================== */
  bindPlayerControls() {
    const playBtn = document.getElementById("player-play-btn");
    const prevBtn = document.getElementById("player-prev-btn");
    const nextBtn = document.getElementById("player-next-btn");
    const shuffleBtn = document.getElementById("player-shuffle-btn");
    const repeatBtn = document.getElementById("player-repeat-btn");
    const muteBtn = document.getElementById("player-mute-btn");
    const likeBtn = document.getElementById("player-like-btn");
    const queueBtn = document.getElementById("player-queue-btn");

    playBtn.addEventListener("click", () => player.togglePlay());
    prevBtn.addEventListener("click", () => player.prev());
    nextBtn.addEventListener("click", () => player.next());
    shuffleBtn.addEventListener("click", () => player.toggleShuffle());
    repeatBtn.addEventListener("click", () => player.toggleRepeat());
    muteBtn.addEventListener("click", () => player.toggleMute());
    
    likeBtn.addEventListener("click", () => {
      if (player.currentTrack) {
        const wasAdded = storage.toggleFavoriteSong(player.currentTrack.id);
        this.syncPlayerLikeButton(player.currentTrack.id);
        
        if (wasAdded) {
          this.showToast("Saved to Liked Songs");
        } else {
          this.showToast("Removed from Liked Songs");
          // If viewing favorites, reload immediately
          if (window.location.hash === "#favorites" || window.location.hash.startsWith("#playlist/favorites")) {
            this.viewPlaylist("favorites");
            lucide.createIcons();
          }
        }
      }
    });

    queueBtn.addEventListener("click", () => this.toggleQueueFlyout());

    // Progress Bar Slider Seek logic
    const progressSlider = document.getElementById("progress-slider-container");
    this.setupSliderDragging(progressSlider, (percent) => {
      player.seek(percent);
    });

    // Volume Bar Slider logic
    const volumeSlider = document.getElementById("volume-slider-container");
    this.setupSliderDragging(volumeSlider, (percent) => {
      player.setVolume(percent / 100);
    });
  }

  setupSliderDragging(containerEl, onValueChange) {
    let isDragging = false;

    const updateSlider = (e) => {
      const rect = containerEl.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percentage = (x / rect.width) * 100;
      onValueChange(percentage);
    };

    containerEl.addEventListener("mousedown", (e) => {
      isDragging = true;
      updateSlider(e);
      
      const onMouseMove = (moveEvent) => {
        if (!isDragging) return;
        updateSlider(moveEvent);
      };
      
      const onMouseUp = () => {
        isDragging = false;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      };
      
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });

    // Mobile touch events
    containerEl.addEventListener("touchstart", (e) => {
      isDragging = true;
      updateSlider(e);
      
      const onTouchMove = (moveEvent) => {
        if (!isDragging) return;
        updateSlider(moveEvent);
      };
      
      const onTouchEnd = () => {
        isDragging = false;
        document.removeEventListener("touchmove", onTouchMove);
        document.removeEventListener("touchend", onTouchEnd);
      };
      
      document.addEventListener("touchmove", onTouchMove);
      document.addEventListener("touchend", onTouchEnd);
    });
  }

  /* ==========================================================================
     12. Synchronizing DOM elements based on Player Subscriptions
     ========================================================================== */
  subscribeToPlayerEvents() {
    // 1. Current playing track update
    player.subscribe("trackChanged", (track) => {
      this.syncActiveTrackMetadata(track);
    });

    // 2. Play state toggling (Play/Pause button icons & EQ lines animation)
    player.subscribe("playbackStateChanged", (isPlaying) => {
      const playBtn = document.getElementById("player-play-btn");
      const eqAnim = document.getElementById("playing-eq-animation");

      if (isPlaying) {
        playBtn.innerHTML = `<i data-lucide="pause" fill="black" style="width: 18px; height: 18px;"></i>`;
        eqAnim.classList.remove("hidden");
      } else {
        playBtn.innerHTML = `<i data-lucide="play" class="play-svg-icon" fill="black" style="width: 18px; height: 18px; transform: translate(1px, 0px);"></i>`;
        eqAnim.classList.add("hidden");
      }
      lucide.createIcons();
      this.syncActiveSongRowsHighlights();
    });

    // 3. Time progress bar updates
    player.subscribe("timeUpdated", ({ currentTime, duration }) => {
      const elapsedEl = document.getElementById("player-time-elapsed");
      const durationEl = document.getElementById("player-time-duration");
      const fillEl = document.getElementById("player-progress-fill");
      const handleEl = document.getElementById("player-progress-handle");

      elapsedEl.textContent = this.formatTime(currentTime);
      durationEl.textContent = duration ? this.formatTime(duration) : "0:00";
      
      const percentage = duration ? (currentTime / duration) * 100 : 0;
      fillEl.style.width = `${percentage}%`;
      handleEl.style.left = `${percentage}%`;
    });

    // 4. Volume indicators sync
    player.subscribe("volumeChanged", ({ volume, isMuted }) => {
      const volumeFill = document.getElementById("player-volume-fill");
      const volumeHandle = document.getElementById("player-volume-handle");
      const volumeIcon = document.getElementById("volume-icon");

      const percentage = isMuted ? 0 : volume * 100;
      volumeFill.style.width = `${percentage}%`;
      volumeHandle.style.left = `${percentage}%`;

      // Update speaker icon classes based on levels
      if (isMuted || volume === 0) {
        volumeIcon.setAttribute("data-lucide", "volume-x");
      } else if (volume < 0.3) {
        volumeIcon.setAttribute("data-lucide", "volume");
      } else if (volume < 0.7) {
        volumeIcon.setAttribute("data-lucide", "volume-1");
      } else {
        volumeIcon.setAttribute("data-lucide", "volume-2");
      }
      lucide.createIcons();
    });

    // 5. Shuffle button sync
    player.subscribe("shuffleChanged", (isShuffle) => {
      const shuffleBtn = document.getElementById("player-shuffle-btn");
      if (isShuffle) {
        shuffleBtn.classList.add("active");
      } else {
        shuffleBtn.classList.remove("active");
      }
    });

    // 6. Repeat button settings loop sync
    player.subscribe("repeatChanged", (repeatMode) => {
      const repeatBtn = document.getElementById("player-repeat-btn");
      repeatBtn.classList.remove("active");
      
      if (repeatMode === "off") {
        repeatBtn.innerHTML = `<i data-lucide="repeat"></i>`;
      } else if (repeatMode === "context") {
        repeatBtn.classList.add("active");
        repeatBtn.innerHTML = `<i data-lucide="repeat"></i>`;
      } else if (repeatMode === "track") {
        repeatBtn.classList.add("active");
        // Spotify style repeat-one indicator (usually showing a small '1' tag or badge inside icon)
        repeatBtn.innerHTML = `<i data-lucide="repeat-1"></i>`;
      }
      lucide.createIcons();
    });

    // 7. Queue listing sync
    player.subscribe("queueChanged", () => {
      this.renderQueueFlyoutList();
    });
  }

  syncActiveTrackMetadata(track) {
    const artwork = document.getElementById("player-artwork");
    const title = document.getElementById("player-title");
    const artist = document.getElementById("player-artist");

    if (track) {
      artwork.src = track.cover;
      title.textContent = track.title;
      artist.textContent = track.artist;

      // Add routing navigation to player details elements
      title.onclick = () => window.location.hash = `#album/${track.albumId}`;
      artist.onclick = () => window.location.hash = `#artist/${track.artistId}`;

      this.syncPlayerLikeButton(track.id);
      this.syncActiveSongRowsHighlights();
    } else {
      artwork.src = "https://images.unsplash.com/photo-1614680376593-902f74fa0d41?q=80&w=80&auto=format&fit=crop";
      title.textContent = "Select a track";
      artist.textContent = "Artist";
      title.onclick = null;
      artist.onclick = null;
    }
  }

  syncPlayerLikeButton(songId) {
    const likeBtn = document.getElementById("player-like-btn");
    const isLiked = storage.isSongFavorited(songId);

    if (isLiked) {
      likeBtn.classList.add("liked");
      likeBtn.innerHTML = `<i data-lucide="heart" fill="var(--color-primary)"></i>`;
    } else {
      likeBtn.classList.remove("liked");
      likeBtn.innerHTML = `<i data-lucide="heart"></i>`;
    }
    lucide.createIcons();
  }

  syncActiveSongRowsHighlights() {
    document.querySelectorAll(".song-row").forEach(row => {
      const rowSongId = row.getAttribute("data-id");
      const isCurrentPlayingRow = player.currentTrack?.id === rowSongId;

      if (isCurrentPlayingRow) {
        row.classList.add("playing-row");
        const idxText = row.querySelector(".song-number-text");
        if (idxText && player.isPlaying) {
          // Replace index number with active styling or minor dots if needed
          // Green color highlight applied through CSS classes
        }
      } else {
        row.classList.remove("playing-row");
      }
    });
  }

  /* ==========================================================================
     13. Queue flyout panel list rendering
     ========================================================================== */
  toggleQueueFlyout() {
    const flyout = document.getElementById("queue-flyout");
    flyout.classList.toggle("hidden");
    if (!flyout.classList.contains("hidden")) {
      this.renderQueueFlyoutList();
    }
  }

  renderQueueFlyoutList() {
    const nowPlayingContainer = document.getElementById("queue-now-playing-container");
    const nextContainer = document.getElementById("queue-next-container");
    const clearBtn = document.getElementById("clear-queue-btn");

    if (!player.currentTrack) {
      nowPlayingContainer.innerHTML = `<span style="color:var(--text-subdued); padding: 8px;">No song playing.</span>`;
      nextContainer.innerHTML = "";
      return;
    }

    // Now Playing Row
    nowPlayingContainer.innerHTML = `
      <img src="${player.currentTrack.cover}" style="width: 40px; height: 40px; border-radius:4px; object-fit:cover;" alt="">
      <div class="queue-track-meta">
        <span class="queue-track-title" style="color:var(--color-primary);">${player.currentTrack.title}</span>
        <span class="queue-track-artist">${player.currentTrack.artist}</span>
      </div>
      <span style="font-size:12px; color:var(--text-muted);">${this.formatTime(player.currentTrack.duration)}</span>
    `;

    // Next Up rows list
    const upcoming = player.queue.slice(player.queueIndex + 1);
    if (upcoming.length === 0) {
      nextContainer.innerHTML = `<span style="color:var(--text-subdued); padding: 8px; font-size:13px; display:block;">Queue is empty.</span>`;
      clearBtn.style.display = "none";
      return;
    }

    clearBtn.style.display = "block";
    nextContainer.innerHTML = upcoming.map((song, index) => `
      <div class="queue-track-row-next" data-id="${song.id}" draggable="true" data-index="${index + player.queueIndex + 1}">
        <i data-lucide="grip-vertical" style="color:var(--text-subdued); width:14px; height:14px; cursor:grab; flex-shrink:0;"></i>
        <img src="${song.cover}" style="width: 40px; height: 40px; border-radius:4px; object-fit:cover;" alt="">
        <div class="queue-track-meta">
          <span class="queue-track-title">${song.title}</span>
          <span class="queue-track-artist">${song.artist}</span>
        </div>
        <button class="queue-item-remove-btn" data-action="remove-queue-item" data-id="${song.id}">
          <i data-lucide="trash" style="width:14px; height:14px;"></i>
        </button>
      </div>
    `).join("");

    lucide.createIcons();

    // Event handles for deletion in queue flyout
    nextContainer.querySelectorAll("[data-action='remove-queue-item']").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-id");
        player.removeFromQueue(id);
        this.showToast("Removed from queue");
      });
    });

    // Add drag and drop reordering inside queue
    this.setupQueueDragAndDrop();
  }

  setupQueueDragAndDrop() {
    const rows = document.querySelectorAll(".queue-track-row-next");
    const container = document.getElementById("queue-next-container");
    let dragSrcEl = null;

    rows.forEach(row => {
      row.addEventListener("dragstart", (e) => {
        dragSrcEl = row;
        row.style.opacity = "0.4";
        e.dataTransfer.effectAllowed = "move";
      });

      row.addEventListener("dragend", () => {
        row.style.opacity = "1";
        rows.forEach(r => r.classList.remove("over"));
      });

      row.addEventListener("dragover", (e) => {
        e.preventDefault();
        return false;
      });

      row.addEventListener("dragenter", () => {
        row.classList.add("over");
      });

      row.addEventListener("dragleave", () => {
        row.classList.remove("over");
      });

      row.addEventListener("drop", (e) => {
        e.stopPropagation();
        e.preventDefault();
        
        if (dragSrcEl !== row) {
          const dragIdx = parseInt(dragSrcEl.getAttribute("data-index"));
          const dropIdx = parseInt(row.getAttribute("data-index"));
          
          // Reorder list in player
          const reorderedQueue = [...player.queue];
          const [removed] = reorderedQueue.splice(dragIdx, 1);
          reorderedQueue.splice(dropIdx, 0, removed);
          
          player.reorderQueue(reorderedQueue);
        }
        return false;
      });
    });
  }

  /* ==========================================================================
     14. Image Lazy Loading (Intersection Observer)
     ========================================================================== */
  lazyLoadImages() {
    const images = document.querySelectorAll(".lazy-image");
    
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.getAttribute("data-src");
            img.classList.remove("lazy-image");
            img.onload = () => img.style.opacity = "1"; // Smooth fade-in
            obs.unobserve(img);
          }
        });
      }, {
        root: this.viewport,
        rootMargin: "0px 0px 100px 0px",
        threshold: 0.01
      });

      images.forEach(img => observer.observe(img));
    } else {
      // Fallback
      images.forEach(img => {
        img.src = img.getAttribute("data-src");
        img.style.opacity = "1";
      });
    }
  }

  /* ==========================================================================
     15. Toast Alert Notifications
     ========================================================================== */
  showToast(message, isError = false) {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast-message ${isError ? 'toast-error' : ''}`;
    
    // Add dynamic system icon based on type
    const iconName = isError ? "alert-circle" : "check-circle";
    toast.innerHTML = `
      <i data-lucide="${iconName}" style="width:18px; height:18px;"></i>
      <span>${message}</span>
    `;
    
    container.appendChild(toast);
    lucide.createIcons();

    // Auto-remove after 3 seconds
    setTimeout(() => {
      toast.classList.add("fade-out");
      toast.addEventListener("animationend", () => {
        toast.remove();
      });
    }, 3000);
  }

  /* ==========================================================================
     16. Global Window Modal / Document Listeners
     ========================================================================== */
  bindGlobalListeners() {
    // Playlist Editor Submit Form
    const editForm = document.getElementById("playlist-modal-form");
    editForm.addEventListener("submit", (e) => this.savePlaylistDetails(e));

    // Close Modal Button
    const closeBtn = document.getElementById("playlist-modal-close-btn");
    closeBtn.addEventListener("click", () => this.closePlaylistEditModal());

    // Close Queue Button
    const queueCloseBtn = document.getElementById("queue-close-btn");
    queueCloseBtn.addEventListener("click", () => this.toggleQueueFlyout());

    // Clear Queue Button inside flyout
    const clearQueueBtn = document.getElementById("clear-queue-btn");
    clearQueueBtn.addEventListener("click", () => {
      player.clearQueue();
      this.showToast("Play queue cleared");
    });

    // Close modal when clicking on backdrop shadow
    const playlistModal = document.getElementById("playlist-modal");
    playlistModal.addEventListener("click", (e) => {
      if (e.target === playlistModal) {
        this.closePlaylistEditModal();
      }
    });

    // Debounced search field keyup listeners
    const searchField = document.getElementById("search-input-field");
    const searchClear = document.getElementById("search-clear-btn");
    
    searchField.addEventListener("keyup", () => {
      const q = searchField.value.trim();
      if (q) {
        searchClear.classList.remove("hidden");
      } else {
        searchClear.classList.add("hidden");
      }

      clearTimeout(this.searchDebounceTimer);
      this.searchDebounceTimer = setTimeout(() => {
        if (window.location.hash.startsWith("#search")) {
          this.viewSearch();
        }
      }, 300);
    });

    searchClear.addEventListener("click", () => {
      searchField.value = "";
      searchClear.classList.add("hidden");
      searchField.focus();
      this.viewSearch();
    });
  }

  /* ==========================================================================
     17. Time Format converters
     ========================================================================== */
  formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  formatTotalDuration(seconds) {
    if (isNaN(seconds) || seconds === 0) return "0 min";
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours} hr ${mins} min`;
    }
    return `${mins} min`;
  }
}

// Export singleton UIManager instance
const uiInstance = new UIManager();
export default uiInstance;
