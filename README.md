# 🎵 Spotify Clone — Vanilla JS Web Player

[![Vite Build](https://img.shields.io/badge/Vite-Built-646CFF?logo=vite&logoColor=white&style=for-the-badge)](https://vitejs.dev/)
[![GitHub Pages](https://img.shields.io/badge/Github%20Pages-Compatible-181717?logo=github&style=for-the-badge)](https://pages.github.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

A pixel-perfect, production-quality, responsive **Spotify-inspired web music player** built from the ground up using semantic **HTML5**, **Vanilla CSS3**, and modern **JavaScript (ES6+)**. 

This is a pure frontend Single Page Application (SPA). It has **zero backend dependencies** and zero build compilation required to run, making it 100% compatible with static hosting environments like **GitHub Pages**.

🔗 **Live Preview**: [Access the Spotify Clone Preview](https://pruthvikrishnang.github.io/Spotify-Clone/)

---

## ✨ Design & Experience Highlights

*   **🎨 Premium Glassmorphism UI**: Unified theme layers featuring custom HSL gradients, frosted header glass overlays, deep charcoal hierarchy cards, and glowing hover elevations.
*   **📱 Fully Fluid Responsive Layout**: Adapts gracefully across devices. Sidebar collapses to a neat icon bar on tablet viewports, and morphs into a mobile-first player shell on smaller smartphone screens.
*   **⚡ Animated Loading Skeletons**: Interactive linear-gradient shimmering boxes occupy the screen during navigation transitions, preventing sudden content layout shifts (CLS).
*   **🔊 Immersive Bottom Playback Hub**: Features real-time track slider scrubbing, responsive volume dragging, mute indicators, and CSS audio equalizers that bounce in sync with active tracks.
*   **📂 LocalStorage Database CRUD**: Auto-creates a default user playlist on first boot. Allows full creation, description edits, cover previews, and deletions. Saved items persist across page reloads.
*   **🔍 Interactive Search & Suggestions**: Keyup debounced search matching artists, albums, and tracks alongside a "Recommended Songs" panel matching your custom playlists.
*   **🔀 Fisher-Yates Shuffling**: Full-featured randomized queue systems that back up original tracks, letting you toggle shuffle off and return to your previous album order seamlessly.
*   **⌨️ Global Keyboard Control**: Run the player completely hands-free with global hotkeys (automatically disabled while typing in search or input fields).

---

## ⌨️ Keyboard Shortcuts

| Hotkey | Action |
| :--- | :--- |
| <kbd>Spacebar</kbd> | Play / Pause Toggle |
| <kbd>Arrow Right</kbd> | Next Track |
| <kbd>Arrow Left</kbd> | Previous Track (or restarts track if played > 3s) |
| <kbd>Arrow Up</kbd> | Volume Up (increases by 5%) |
| <kbd>Arrow Down</kbd> | Volume Down (decreases by 5%) |
| <kbd>M</kbd> | Mute / Unmute Toggle |
| <kbd>L</kbd> | Favorite / Heart the current track |

---

## 🏗️ Folder Structure & Architecture

The application is structured into decoupled modules following clean separation of concerns:

```
Spotify-Clone/
├── index.html          # SPA semantic document shell (sidebar, viewport, Bottom bar, Modals)
├── package.json        # Node configurations (development server & bundles via Vite)
├── .gitignore          # Build ignore paths
├── css/
│   ├── variables.css   # Custom CSS tokens (color gradients, typography, transitions)
│   └── styles.css      # Core styles (grids, skeletons, custom scrollbars, media queries)
└── js/
    ├── app.js          # App orchestrator, keyboard hotkey bindings, offline-listeners
    ├── data.js         # Mock static database mapping artists, albums, and SoundHelix MP3s
    ├── storage.js      # LocalStorage wrapper (Playlists CRUD, Favorites, volume settings)
    ├── player.js       # HTML5 Audio Player Engine (queue index pointers, shuffle lists)
    └── ui.js           # UI View Controller (page routes, slider drags, drag-and-drop queues)
```

---

## 🚀 Local Development Setup

To run or build this application locally, ensure you have [Node.js](https://nodejs.org) installed.

### 1. Installation
Clone this repository and install the development dependencies (Vite server compiler):
```bash
git clone https://github.com/pruthvikrishnang/Spotify-Clone.git
cd Spotify-Clone
npm install
```

### 2. Run Local Development Server
Start Vite's fast, hot-reloading development server:
```bash
npm run dev
```
Once started, navigate your browser to `http://localhost:5173`.

### 3. Compile Production Bundle
Vite compiles and minifies the HTML, CSS, and JS modules into static assets inside a `/dist` directory:
```bash
npm run build
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](https://opensource.org/licenses/MIT) page for details.
