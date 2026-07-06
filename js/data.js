/* Spotify Clone - Mock Database Module */

export const artists = [
  {
    id: "artist-1",
    name: "Lofi Dreamer",
    followers: "1,248,390",
    verified: true,
    bio: "Chill beats to study, relax, and code to. Based in Tokyo, combining vintage samples with modern boom-bap drums.",
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "artist-2",
    name: "Synthwave Arcade",
    followers: "892,104",
    verified: true,
    bio: "Retro-futuristic electronic music inspired by 1980s film soundtracks, video games, and cybernetic aesthetics.",
    cover: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "artist-3",
    name: "Acoustic Horizon",
    followers: "420,119",
    verified: false,
    bio: "Warm folk harmonies, fingerpicked steel guitars, and poetry inspired by the winds of the Pacific Northwest.",
    cover: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "artist-4",
    name: "Midnight Jazz Trio",
    followers: "2,050,442",
    verified: true,
    bio: "Smooth, late-night acoustic jazz standards recorded live in historical venues across New York and Chicago.",
    cover: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "artist-5",
    name: "Ambient Odyssey",
    followers: "610,753",
    verified: true,
    bio: "Ethereal drone soundscapes, modular synthesizer pads, and field recordings designed for deep sleep and focus.",
    cover: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=600&auto=format&fit=crop"
  }
];

export const albums = [
  {
    id: "album-1",
    title: "Chill Study Session",
    artistId: "artist-1",
    artist: "Lofi Dreamer",
    year: 2023,
    cover: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=400&auto=format&fit=crop",
    genre: "Lofi Chill"
  },
  {
    id: "album-2",
    title: "Neon Retroverse",
    artistId: "artist-2",
    artist: "Synthwave Arcade",
    year: 2022,
    cover: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop",
    genre: "Synthwave"
  },
  {
    id: "album-3",
    title: "Woodland Whispers",
    artistId: "artist-3",
    artist: "Acoustic Horizon",
    year: 2024,
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&auto=format&fit=crop",
    genre: "Acoustic Folk"
  },
  {
    id: "album-4",
    title: "Blue Note Café",
    artistId: "artist-4",
    artist: "Midnight Jazz Trio",
    year: 2021,
    cover: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=400&auto=format&fit=crop",
    genre: "Jazz Classics"
  },
  {
    id: "album-5",
    title: "Cosmic Meditations",
    artistId: "artist-5",
    artist: "Ambient Odyssey",
    year: 2023,
    cover: "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=400&auto=format&fit=crop",
    genre: "Ambient drone"
  }
];

export const songs = [
  {
    id: "song-1",
    title: "Midnight Rain",
    artistId: "artist-1",
    artist: "Lofi Dreamer",
    albumId: "album-1",
    album: "Chill Study Session",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    cover: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=400&auto=format&fit=crop",
    duration: 372, // 6:12
    dateAdded: "2024-05-12"
  },
  {
    id: "song-2",
    title: "Coffee & Vinyl",
    artistId: "artist-1",
    artist: "Lofi Dreamer",
    albumId: "album-1",
    album: "Chill Study Session",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    cover: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=400&auto=format&fit=crop",
    duration: 425, // 7:05
    dateAdded: "2024-05-12"
  },
  {
    id: "song-3",
    title: "Tokyo Station Lights",
    artistId: "artist-1",
    artist: "Lofi Dreamer",
    albumId: "album-1",
    album: "Chill Study Session",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    cover: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=400&auto=format&fit=crop",
    duration: 344, // 5:44
    dateAdded: "2024-05-15"
  },
  {
    id: "song-4",
    title: "Cyber Sunset",
    artistId: "artist-2",
    artist: "Synthwave Arcade",
    albumId: "album-2",
    album: "Neon Retroverse",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    cover: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop",
    duration: 302, // 5:02
    dateAdded: "2024-03-20"
  },
  {
    id: "song-5",
    title: "Laser Grid Run",
    artistId: "artist-2",
    artist: "Synthwave Arcade",
    albumId: "album-2",
    album: "Neon Retroverse",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    cover: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop",
    duration: 362, // 6:02
    dateAdded: "2024-03-22"
  },
  {
    id: "song-6",
    title: "Overdrive Memory",
    artistId: "artist-2",
    artist: "Synthwave Arcade",
    albumId: "album-2",
    album: "Neon Retroverse",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    cover: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop",
    duration: 340, // 5:40
    dateAdded: "2024-03-25"
  },
  {
    id: "song-7",
    title: "Mist in the Pines",
    artistId: "artist-3",
    artist: "Acoustic Horizon",
    albumId: "album-3",
    album: "Woodland Whispers",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&auto=format&fit=crop",
    duration: 328, // 5:28
    dateAdded: "2024-06-01"
  },
  {
    id: "song-8",
    title: "Campfire Embers",
    artistId: "artist-3",
    artist: "Acoustic Horizon",
    albumId: "album-3",
    album: "Woodland Whispers",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&auto=format&fit=crop",
    duration: 311, // 5:11
    dateAdded: "2024-06-02"
  },
  {
    id: "song-9",
    title: "River Song",
    artistId: "artist-3",
    artist: "Acoustic Horizon",
    albumId: "album-3",
    album: "Woodland Whispers",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&auto=format&fit=crop",
    duration: 339, // 5:39
    dateAdded: "2024-06-05"
  },
  {
    id: "song-10",
    title: "Velvet Saxophone",
    artistId: "artist-4",
    artist: "Midnight Jazz Trio",
    albumId: "album-4",
    album: "Blue Note Café",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
    cover: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=400&auto=format&fit=crop",
    duration: 288, // 4:48
    dateAdded: "2024-01-10"
  },
  {
    id: "song-11",
    title: "Rainy Window Session",
    artistId: "artist-4",
    artist: "Midnight Jazz Trio",
    albumId: "album-4",
    album: "Blue Note Café",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
    cover: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=400&auto=format&fit=crop",
    duration: 312, // 5:12
    dateAdded: "2024-01-12"
  },
  {
    id: "song-12",
    title: "Last Call Waltz",
    artistId: "artist-4",
    artist: "Midnight Jazz Trio",
    albumId: "album-4",
    album: "Blue Note Café",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
    cover: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=400&auto=format&fit=crop",
    duration: 350, // 5:50
    dateAdded: "2024-01-15"
  },
  {
    id: "song-13",
    title: "Stardust Whispers",
    artistId: "artist-5",
    artist: "Ambient Odyssey",
    albumId: "album-5",
    album: "Cosmic Meditations",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
    cover: "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=400&auto=format&fit=crop",
    duration: 410, // 6:50
    dateAdded: "2024-04-02"
  },
  {
    id: "song-14",
    title: "Solar Winds",
    artistId: "artist-5",
    artist: "Ambient Odyssey",
    albumId: "album-5",
    album: "Cosmic Meditations",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
    cover: "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=400&auto=format&fit=crop",
    duration: 395, // 6:35
    dateAdded: "2024-04-05"
  },
  {
    id: "song-15",
    title: "Event Horizon",
    artistId: "artist-5",
    artist: "Ambient Odyssey",
    albumId: "album-5",
    album: "Cosmic Meditations",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3",
    cover: "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=400&auto=format&fit=crop",
    duration: 388, // 6:28
    dateAdded: "2024-04-08"
  }
];

export const searchCategories = [
  { title: "Podcasts", color: "#e1306c", artwork: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=150" },
  { title: "Made For You", color: "#1e3264", artwork: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=150" },
  { title: "New Releases", color: "#e8115b", artwork: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=150" },
  { title: "Lofi & Chill", color: "#8d67ab", artwork: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=150" },
  { title: "Synthwave", color: "#e8125c", artwork: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=150" },
  { title: "Acoustic folk", color: "#bc5900", artwork: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=150" },
  { title: "Jazz", color: "#777777", artwork: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=150" },
  { title: "Ambient drone", color: "#27856a", artwork: "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=150" }
];
