const audio = document.getElementById("audio");
const search = document.getElementById("search");
const filter = document.getElementById("filter");

const homeWrapper = document.getElementById("homeWrapper");
const grid = document.getElementById("musicGrid");
const favGrid = document.getElementById("favGrid");
const recentGrid = document.getElementById("recentGrid");

const trendGrid = document.getElementById("trendGrid");
const popGrid = document.getElementById("popGrid");
const rockGrid = document.getElementById("rockGrid");
const hindiGrid = document.getElementById("hindiGrid");

const progress = document.getElementById("progress");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");

const fullPlayer = document.getElementById("fullPlayer");
const fullCover = document.getElementById("fullCover");
const fullTitle = document.getElementById("fullTitle");
const fullArtist = document.getElementById("fullArtist");
const fullProgress = document.getElementById("fullProgress");
const fullCurrent = document.getElementById("fullCurrent");
const fullDuration = document.getElementById("fullDuration");
const fullVolume = document.getElementById("fullVolume");

const sideMenu = document.getElementById("sideMenu");

let songs = [];
let currentIndex = 0;
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let recent = JSON.parse(localStorage.getItem("recent")) || [];

/* MENU */
function toggleMenu() {
  sideMenu.classList.toggle("show");
}
function goTo(id) {
  document.getElementById(id).scrollIntoView({ behavior: "smooth" });
  sideMenu.classList.remove("show");
}

/* SEARCH MODE */
function searchSongs() {
  let q = search.value.trim();
  if (!q) return;

  if (filter.value === "artist") q += " artist";
  if (filter.value === "song") q += " song";

  homeWrapper.style.display = "none";

  fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&limit=12`)
    .then(r => r.json())
    .then(d => {
      songs = d.results;
      render(grid, songs);
    });
}

function showHome() {
  homeWrapper.style.display = "block";
  grid.innerHTML = "";
  search.value = "";
}

/* RENDER */
function render(target, list) {
  target.innerHTML = "";
  list.forEach((song, i) => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <img src="${song.artworkUrl100.replace("100x100","300x300")}">
      <h4>${song.trackName}</h4>
      <p>${song.artistName}</p>
    `;
    div.onclick = () => playSong(list, i);
    target.appendChild(div);
  });
}

/* PLAY */
function playSong(list, i) {
  songs = list;
  currentIndex = i;
  const s = songs[i];
  audio.src = s.previewUrl;
  cover.src = s.artworkUrl100;
  title.textContent = s.trackName;
  artist.textContent = s.artistName;
  audio.play();
  updateRecent(s);
  syncFullPlayer();
}

/* CONTROLS */
function togglePlay() {
  audio.paused ? audio.play() : audio.pause();
}

audio.addEventListener("timeupdate", () => {
  const p = (audio.currentTime / audio.duration) * 100 || 0;
  progress.value = fullProgress.value = p;
  currentTimeEl.textContent = fullCurrent.textContent = formatTime(audio.currentTime);
  durationEl.textContent = fullDuration.textContent = formatTime(audio.duration);
});

progress.addEventListener("input", () => {
  audio.currentTime = (progress.value / 100) * audio.duration;
});
fullProgress.addEventListener("input", () => {
  audio.currentTime = (fullProgress.value / 100) * audio.duration;
});
fullVolume.addEventListener("input", () => {
  audio.volume = fullVolume.value;
});

/* FULL SCREEN */
function openFullPlayer() {
  fullPlayer.style.display = "block";
}
function closeFullPlayer() {
  fullPlayer.style.display = "none";
}
function syncFullPlayer() {
  const s = songs[currentIndex];
  fullCover.src = s.artworkUrl100.replace("100x100","600x600");
  fullTitle.textContent = s.trackName;
  fullArtist.textContent = s.artistName;
}

/* LYRICS */
function openLyrics() {
  const s = songs[currentIndex];
  lyricsModal.style.display = "block";
  lyricsTitle.textContent = `${s.trackName} – ${s.artistName}`;
  lyricsText.textContent = "Loading lyrics...";

  fetch(`https://api.lyrics.ovh/v1/${encodeURIComponent(s.artistName)}/${encodeURIComponent(s.trackName)}`)
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(d => lyricsText.textContent = d.lyrics || "Lyrics not available.")
    .catch(() => lyricsText.textContent = "Lyrics not available.");
}
function closeLyrics() {
  lyricsModal.style.display = "none";
}

/* FAVORITES */
function toggleFavorite() {
  const s = songs[currentIndex];
  if (!favorites.find(x => x.trackId === s.trackId)) {
    favorites.push(s);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    render(favGrid, favorites);
  }
}

/* RECENT */
function updateRecent(song) {
  recent = recent.filter(s => s.trackId !== song.trackId);
  recent.unshift(song);
  recent = recent.slice(0, 6);
  localStorage.setItem("recent", JSON.stringify(recent));
  render(recentGrid, recent);
}

/* THEME */
function toggleTheme() {
  document.body.classList.toggle("amoled");
}

/* HOME DATA */
function fetchHome(q, target) {
  fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&limit=12`)
    .then(r => r.json())
    .then(d => render(target, d.results));
}

fetchHome("top hits", trendGrid);
fetchHome("pop hits", popGrid);
fetchHome("rock classics", rockGrid);
fetchHome("hindi hits", hindiGrid);

/* KEYBOARD */
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    closeFullPlayer();
    showHome();
  }
  if (e.key === " ") {
    e.preventDefault();
    togglePlay();
  }
});

/* INIT */
render(favGrid, favorites);
render(recentGrid, recent);

function formatTime(t) {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

