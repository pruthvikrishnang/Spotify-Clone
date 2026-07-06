/* Spotify Clone - Application Bootstrap & Controller Entry */

import player from "./player.js";
import ui from "./ui.js";

document.addEventListener("DOMContentLoaded", () => {
  try {
    // 1. Initialize Audio Engine
    player.init();

    // 2. Initialize UI View Manager & Routing
    ui.init();

    // 3. Register Global Keyboard Shortcuts
    registerKeyboardShortcuts();

    // 4. Handle Global Offline/Online States
    window.addEventListener("online", () => ui.showToast("Back online. Connected to streaming content."));
    window.addEventListener("offline", () => ui.showToast("Connection lost. Operating in offline mode.", true));

    console.log("Spotify Clone application successfully initialized.");
  } catch (error) {
    console.error("Critical error during application bootstrap:", error);
    // Render basic user error banner if initialization fails
    const viewport = document.getElementById("page-content-viewport");
    if (viewport) {
      viewport.innerHTML = `
        <div style="text-align: center; padding: 100px 20px; color: var(--text-main);">
          <h1 style="font-size: 32px; margin-bottom: 20px;">Playback Error</h1>
          <p style="color: var(--text-muted); margin-bottom: 30px;">We encountered a problem launching the music player.</p>
          <button onclick="window.location.reload()" style="background-color: var(--color-primary); color: #000; padding: 12px 30px; font-weight: 700; border-radius: var(--border-radius-xl);">Reload Player</button>
        </div>
      `;
    }
  }
});

/* ==========================================================================
   Keyboard Shortcuts Bindings
   ========================================================================== */
function registerKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
    // Ignore keyboard shortcuts if user is typing in text fields/inputs
    const activeEl = document.activeElement;
    if (
      activeEl && 
      (activeEl.tagName === "INPUT" || 
       activeEl.tagName === "TEXTAREA" || 
       activeEl.isContentEditable)
    ) {
      return;
    }

    const key = e.code;
    
    switch (key) {
      // Space: Play / Pause toggle
      case "Space":
        e.preventDefault(); // Stop default web page scrolling on Spacebar
        player.togglePlay();
        ui.showToast(player.isPlaying ? "Playback Resumed" : "Playback Paused");
        break;

      // ArrowRight: Skip next
      case "ArrowRight":
        e.preventDefault();
        player.next();
        if (player.currentTrack) {
          ui.showToast(`Skipping to next: ${player.currentTrack.title}`);
        }
        break;

      // ArrowLeft: Skip prev
      case "ArrowLeft":
        e.preventDefault();
        player.prev();
        if (player.currentTrack) {
          ui.showToast(`Playing previous: ${player.currentTrack.title}`);
        }
        break;

      // ArrowUp: Increase volume
      case "ArrowUp":
        e.preventDefault();
        const nextVolUp = Math.min(1, player.volume + 0.05);
        player.setVolume(nextVolUp);
        break;

      // ArrowDown: Decrease volume
      case "ArrowDown":
        e.preventDefault();
        const nextVolDown = Math.max(0, player.volume - 0.05);
        player.setVolume(nextVolDown);
        break;

      // KeyM: Mute / Unmute toggle
      case "KeyM":
        player.toggleMute();
        ui.showToast(player.isMuted ? "Volume Muted" : "Volume Unmuted");
        break;

      // KeyL: Favorite current song
      case "KeyL":
        if (player.currentTrack) {
          const isAdded = player.currentTrack.id;
          ui.viewport.querySelectorAll("[data-action='toggle-like']").forEach(btn => {
            if (btn.getAttribute("data-id") === isAdded) {
              btn.click(); // Trigger like button flow
            }
          });
        }
        break;
      
      default:
        break;
    }
  });
}
