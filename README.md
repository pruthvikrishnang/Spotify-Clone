# Spotify Clone 🎧

A pixel-perfect, production-quality Spotify-inspired web music player built entirely with HTML5, CSS3, and modern Vanilla JavaScript (ES6+). This project operates fully on the client-side with zero backend dependencies, making it perfectly optimized for hosting on **GitHub Pages**.

---

## 🚀 Key Features

*   **Sleek Spotify Aesthetics**: Beautiful glassmorphism, responsive sidebar navigation, dark theme grids, smooth CSS transitions, and glowing hover states.
*   **Persistent Audio Engine**: Bottom player bar that remains fixed. Supports play, pause, next/prev tracks, shuffle (Fisher-Yates list randomized), repeat context/track, seek, volume adjust, and mute.
*   **Auto-equalizer Animations**: CSS bars that bounce in sync with the audio play state overlayed over the active album artwork.
*   **Playlists CRUD**: Create, rename, view, and delete custom playlists directly in the sidebar. Playlists are persisted across page reloads via `localStorage`.
*   **Recommendations Finder**: A section at the bottom of user playlists suggesting songs not currently inside it, with quick single-click "Add" helpers.
*   **Favorites & Likes**: Heart tracks to automatically add them to the permanent "Liked Songs" context, with interactive DOM syncing across all lists.
*   **Recently Played**: Keeps track of the last 10 songs played, updating dynamically as you stream.
*   **Interactive Play Queue**: View upcoming songs in a dedicated panel. drag-and-drop to reorder tracks, or delete them from the queue.
*   **Lighthouse Performance**: Native ES modules, semantic layout structures, lazy-loaded images, and clean responsive CSS variables.
*   **UX Enhancements**: Custom scrollbars, sliding toast notifications, and animated loading skeletons mimicking Spotify loading states.
*   **Keyboard Shortcuts**: Run the player instantly via hotkeys without using your mouse.

---

## ⌨️ Keyboard Shortcuts

The app listens to global keyboard events (safely ignored when you are typing inside search bars or edit forms):

| Key | Action |
| :--- | :--- |
| **Spacebar** | Play / Pause toggle |
| **Arrow Right** | Skip to next track |
| **Arrow Left** | Skip to previous track (or restart song if >3s) |
| **Arrow Up** | Increase volume by 5% |
| **Arrow Down** | Decrease volume by 5% |
| **M** | Mute / Unmute audio toggle |
| **L** | Heart / Unheart current playing song |

---

## 🛠️ Architecture & Modules

The application follows a clean, decoupled MVC/Publish-Subscribe design pattern:
1.  [`index.html`](file:///D:/Projects/Spotify-Clone/index.html): Semantic layout shell. Contains the grid containers, bottoms bars, dialog modals, and toast entry points.
2.  [`css/variables.css`](file:///D:/Projects/Spotify-Clone/css/variables.css): System variables for color, fonts, shadows, transitions, spacing, and dimensions.
3.  [`css/styles.css`](file:///D:/Projects/Spotify-Clone/css/styles.css): Page layouts, scrollbars, skeletons, keyframe animations, and mobile/tablet responsive media queries.
4.  [`js/data.js`](file:///D:/Projects/Spotify-Clone/js/data.js): Mock database listing tracks, albums, verified artists, bios, and royalty-free SoundHelix audio stream links.
5.  [`js/storage.js`](file:///D:/Projects/Spotify-Clone/js/storage.js): Wrapper functions for reading and writing playlists, likes, player settings, and history states to `localStorage`.
6.  [`js/player.js`](file:///D:/Projects/Spotify-Clone/js/player.js): Core Class encapsulating the HTML5 `<audio>` player, queue index pointers, and emitting event notifications to registered listeners.
7.  [`js/ui.js`](file:///D:/Projects/Spotify-Clone/js/ui.js): UI controller which builds active view cards, listens to audio engine changes to sync progress/volume bars, handles search debouncing, and triggers toast alerts.
8.  [`js/app.js`](file:///D:/Projects/Spotify-Clone/js/app.js): Application bootstrap entry initializing controllers and binding key event listeners.

---

## 💻 Local Development Setup

To run this project locally, ensure you have [Node.js](https://nodejs.org) installed.

1.  **Clone and navigate** to the folder:
    ```bash
    git clone https://github.com/your-username/Spotify-Clone.git
    cd Spotify-Clone
    ```

2.  **Install development dependencies** (Vite server):
    ```bash
    npm install
    ```

3.  **Start the local development server**:
    ```bash
    npm run dev
    ```
    This spins up a hot-reloading web server (usually at `http://localhost:5173`).

4.  **Production build**:
    ```bash
    npm run build
    ```
    This will generate optimized, minified production assets inside the `/dist` directory.
