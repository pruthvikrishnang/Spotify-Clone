/* Spotify Clone - Core Audio Player Module */

import { songs } from "./data.js";
import { 
  addSongToRecentlyPlayed, 
  getPlayerSettings, 
  savePlayerSettings, 
  getSavedQueue, 
  saveQueue 
} from "./storage.js";

class AudioPlayer {
  constructor() {
    this.audio = null;
    this.currentTrack = null;
    
    // Playback queues
    this.queue = [];          // Active playing queue
    this.originalQueue = [];  // Unshuffled order backup
    this.queueIndex = -1;
    this.contextId = null;    // ID of active album/playlist context
    
    // Playback settings
    this.shuffle = false;
    this.repeatMode = "off";  // "off", "context" (repeat all), "track" (repeat one)
    this.isPlaying = false;
    this.volume = 0.7;
    this.isMuted = false;

    // Subscription listeners (registered by UI)
    this.listeners = {
      trackChanged: [],
      playbackStateChanged: [],
      timeUpdated: [],
      volumeChanged: [],
      queueChanged: [],
      shuffleChanged: [],
      repeatChanged: []
    };
  }

  /* ==========================================================================
     1. Initialization
     ========================================================================= */
  init() {
    this.audio = document.getElementById("main-audio-element");
    if (!this.audio) {
      console.error("Audio element not found in DOM");
      return;
    }

    // Load saved settings
    const settings = getPlayerSettings();
    this.volume = settings.volume;
    this.isMuted = settings.isMuted;
    this.shuffle = settings.shuffle;
    this.repeatMode = settings.repeatMode;

    // Apply volume settings
    this.audio.volume = this.isMuted ? 0 : this.volume;

    // Restore saved queue
    const savedQueueIds = getSavedQueue();
    if (savedQueueIds.length > 0) {
      this.queue = savedQueueIds.map(id => songs.find(s => s.id === id)).filter(Boolean);
      this.originalQueue = [...this.queue];
      
      // Restore last active track
      if (settings.currentSongId) {
        const restoredTrackIndex = this.queue.findIndex(s => s.id === settings.currentSongId);
        if (restoredTrackIndex !== -1) {
          this.queueIndex = restoredTrackIndex;
          this.currentTrack = this.queue[this.queueIndex];
          this.loadTrack(this.currentTrack, false);
          // Set current time offset
          if (settings.currentTime) {
            this.audio.currentTime = settings.currentTime;
          }
        }
      }
    }

    // Register HTML5 Audio listeners
    this.setupAudioEventListeners();
    this.notifyAll();
  }

  setupAudioEventListeners() {
    this.audio.addEventListener("play", () => {
      this.isPlaying = true;
      this.trigger("playbackStateChanged", true);
    });

    this.audio.addEventListener("pause", () => {
      this.isPlaying = false;
      this.trigger("playbackStateChanged", false);
    });

    this.audio.addEventListener("timeupdate", () => {
      const currentTime = this.audio.currentTime;
      const duration = this.audio.duration || 0;
      this.trigger("timeUpdated", { currentTime, duration });
      
      // Auto-save progress every 5 seconds to prevent data loss
      if (Math.floor(currentTime) % 5 === 0) {
        this.saveCurrentPlayerState();
      }
    });

    this.audio.addEventListener("loadedmetadata", () => {
      const duration = this.audio.duration || 0;
      this.trigger("timeUpdated", { currentTime: this.audio.currentTime, duration });
    });

    this.audio.addEventListener("ended", () => {
      this.handleTrackEnded();
    });

    this.audio.addEventListener("error", (e) => {
      console.error("Audio playback error details:", e);
      this.isPlaying = false;
      this.trigger("playbackStateChanged", false);
    });
  }

  /* ==========================================================================
     2. Subscription Pattern Methods
     ========================================================================== */
  subscribe(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }

  trigger(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }

  notifyAll() {
    this.trigger("trackChanged", this.currentTrack);
    this.trigger("playbackStateChanged", this.isPlaying);
    this.trigger("volumeChanged", { volume: this.volume, isMuted: this.isMuted });
    this.trigger("shuffleChanged", this.shuffle);
    this.trigger("repeatChanged", this.repeatMode);
    this.trigger("queueChanged", this.queue);
  }

  /* ==========================================================================
     3. Playback Controls
     ========================================================================== */
  loadTrack(track, autoPlay = true) {
    if (!track) return;
    this.currentTrack = track;
    this.audio.src = track.url;
    this.audio.load();

    this.trigger("trackChanged", track);
    this.saveCurrentPlayerState();

    if (autoPlay) {
      this.play();
      addSongToRecentlyPlayed(track.id);
    }
  }

  play() {
    if (!this.currentTrack && this.queue.length > 0) {
      this.setTrackIndex(0);
      return;
    }
    
    if (this.currentTrack) {
      this.audio.play()
        .then(() => {
          this.isPlaying = true;
          this.trigger("playbackStateChanged", true);
        })
        .catch(err => {
          console.warn("Autoplay blocked or stream failure:", err);
          this.isPlaying = false;
          this.trigger("playbackStateChanged", false);
        });
    }
  }

  pause() {
    this.audio.pause();
    this.isPlaying = false;
    this.trigger("playbackStateChanged", false);
    this.saveCurrentPlayerState();
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  next() {
    if (this.queue.length === 0) return;

    if (this.repeatMode === "track") {
      this.audio.currentTime = 0;
      this.play();
      return;
    }

    let nextIndex = this.queueIndex + 1;
    if (nextIndex >= this.queue.length) {
      if (this.repeatMode === "context") {
        nextIndex = 0; // Loop back to start
      } else {
        // End of queue, no loop
        this.pause();
        this.audio.currentTime = 0;
        return;
      }
    }

    this.setTrackIndex(nextIndex);
  }

  prev() {
    if (this.queue.length === 0) return;

    // If track is > 3s, restart track instead of skipping backward
    if (this.audio.currentTime > 3) {
      this.audio.currentTime = 0;
      this.trigger("timeUpdated", { currentTime: 0, duration: this.audio.duration });
      return;
    }

    let prevIndex = this.queueIndex - 1;
    if (prevIndex < 0) {
      if (this.repeatMode === "context") {
        prevIndex = this.queue.length - 1; // Go to last item
      } else {
        // Stay on first track, reset progress
        this.audio.currentTime = 0;
        return;
      }
    }

    this.setTrackIndex(prevIndex);
  }

  setTrackIndex(index) {
    if (index >= 0 && index < this.queue.length) {
      this.queueIndex = index;
      this.loadTrack(this.queue[this.queueIndex], true);
    }
  }

  seek(percentage) {
    if (!this.audio.duration) return;
    const time = (percentage / 100) * this.audio.duration;
    this.audio.currentTime = time;
    this.trigger("timeUpdated", { currentTime: time, duration: this.audio.duration });
  }

  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, value));
    this.isMuted = this.volume === 0;
    this.audio.volume = this.isMuted ? 0 : this.volume;
    this.trigger("volumeChanged", { volume: this.volume, isMuted: this.isMuted });
    this.saveCurrentPlayerState();
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.audio.volume = this.isMuted ? 0 : this.volume;
    this.trigger("volumeChanged", { volume: this.volume, isMuted: this.isMuted });
    this.saveCurrentPlayerState();
  }

  /* ==========================================================================
     4. Queue Context Management
     ========================================================================== */
  setContext(songList, startIndex = 0, contextId = null) {
    if (!songList || songList.length === 0) return;

    this.contextId = contextId;
    this.originalQueue = [...songList];

    if (this.shuffle) {
      // Build shuffled queue, keeping active track at start
      const firstTrack = songList[startIndex];
      const remainingTracks = songList.filter((_, idx) => idx !== startIndex);
      this.queue = [firstTrack, ...this.shuffleList(remainingTracks)];
      this.queueIndex = 0;
    } else {
      this.queue = [...songList];
      this.queueIndex = startIndex;
    }

    saveQueue(this.queue.map(s => s.id));
    this.trigger("queueChanged", this.queue);
    this.loadTrack(this.queue[this.queueIndex], true);
  }

  addToQueue(track) {
    // Avoid double entries
    if (this.queue.some(s => s.id === track.id)) return;
    
    this.queue.splice(this.queueIndex + 1, 0, track);
    this.originalQueue.push(track);
    
    saveQueue(this.queue.map(s => s.id));
    this.trigger("queueChanged", this.queue);
  }

  removeFromQueue(songId) {
    const removeIdx = this.queue.findIndex(s => s.id === songId);
    if (removeIdx === -1) return;

    // Handle index shifts if we remove tracks before or at current playing index
    if (removeIdx === this.queueIndex) {
      this.next(); // Skip to next track
    }
    
    this.queue = this.queue.filter(s => s.id !== songId);
    this.originalQueue = this.originalQueue.filter(s => s.id !== songId);
    
    // Readjust active playing pointer
    this.queueIndex = this.queue.findIndex(s => s.id === this.currentTrack?.id);

    saveQueue(this.queue.map(s => s.id));
    this.trigger("queueChanged", this.queue);
  }

  clearQueue() {
    this.queue = this.currentTrack ? [this.currentTrack] : [];
    this.originalQueue = [...this.queue];
    this.queueIndex = 0;

    saveQueue(this.queue.map(s => s.id));
    this.trigger("queueChanged", this.queue);
  }

  reorderQueue(newQueueList) {
    this.queue = newQueueList;
    this.queueIndex = this.queue.findIndex(s => s.id === this.currentTrack?.id);
    saveQueue(this.queue.map(s => s.id));
    this.trigger("queueChanged", this.queue);
  }

  /* ==========================================================================
     5. Shuffle & Repeat Toggle Engines
     ========================================================================== */
  toggleShuffle() {
    this.shuffle = !this.shuffle;
    
    if (this.shuffle) {
      // Shuffle the queue, putting current track at index 0
      if (this.currentTrack) {
        const remaining = this.queue.filter(s => s.id !== this.currentTrack.id);
        this.queue = [this.currentTrack, ...this.shuffleList(remaining)];
        this.queueIndex = 0;
      } else {
        this.queue = this.shuffleList(this.queue);
      }
    } else {
      // Restore original queue order
      this.queue = [...this.originalQueue];
      if (this.currentTrack) {
        this.queueIndex = this.queue.findIndex(s => s.id === this.currentTrack.id);
      }
    }

    saveQueue(this.queue.map(s => s.id));
    this.trigger("shuffleChanged", this.shuffle);
    this.trigger("queueChanged", this.queue);
    this.saveCurrentPlayerState();
  }

  toggleRepeat() {
    // Cycle modes: off -> context (repeat all) -> track (repeat one) -> off
    if (this.repeatMode === "off") {
      this.repeatMode = "context";
    } else if (this.repeatMode === "context") {
      this.repeatMode = "track";
    } else {
      this.repeatMode = "off";
    }

    this.trigger("repeatChanged", this.repeatMode);
    this.saveCurrentPlayerState();
  }

  /* ==========================================================================
     6. Helper Implementations
     ========================================================================== */
  shuffleList(list) {
    const arr = [...list];
    // Fisher-Yates shuffle
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  handleTrackEnded() {
    if (this.repeatMode === "track") {
      this.audio.currentTime = 0;
      this.play();
    } else {
      this.next();
    }
  }

  saveCurrentPlayerState() {
    savePlayerSettings({
      volume: this.volume,
      isMuted: this.isMuted,
      shuffle: this.shuffle,
      repeatMode: this.repeatMode,
      currentSongId: this.currentTrack ? this.currentTrack.id : null,
      currentTime: this.audio ? this.audio.currentTime : 0
    });
  }
}

// Singleton pattern export
const playerInstance = new AudioPlayer();
export default playerInstance;
