const BUILDINGS = [
  {
    id: "hub",
    name: "The Hub",
    stop: 1,
    video: "https://github.com/SamiIbna/LSBU-360-Virtual-Tour/releases/download/v1.0-demo/hub.mp4",
    photos: [
      "assets/photos/hub/hub_01.jpg",
      "assets/photos/hub/hub_02.jpg",
      "assets/photos/hub/hub_03.jpg",
      "assets/photos/hub/hub_04.jpg"
    ],
    info: "Central student support and community space."
  },
  {
    id: "keyworth",
    name: "Keyworth",
    stop: 2,
    video: "https://github.com/SamiIbna/LSBU-360-Virtual-Tour/releases/download/v1.0-demo/keyworth.mp4",
    photos: [
      "assets/photos/keyworth/keyworth_01.jpg",
      "assets/photos/keyworth/keyworth_02.jpg",
      "assets/photos/keyworth/keyworth_03.jpg",
      "assets/photos/keyworth/keyworth_04.jpg"
    ],
    info: "Main learning and teaching spaces."
  },
  {
    id: "faraday",
    name: "Faraday Wing",
    stop: 3,
    video: "https://github.com/SamiIbna/LSBU-360-Virtual-Tour/releases/download/v1.0-demo/faraday.mp4",
    photos: [
      "assets/photos/faraday/faraday_01.jpg",
      "assets/photos/faraday/faraday_02.jpg",
      "assets/photos/faraday/faraday_03.jpg",
      "assets/photos/faraday/faraday_04.jpg"
    ],
    info: "Engineering labs and technical spaces."
  },
  {
    id: "perry",
    name: "Perry Building",
    stop: 4,
    video: "https://github.com/SamiIbna/LSBU-360-Virtual-Tour/releases/download/v1.0-demo/perry.mp4",
    photos: [
      "assets/photos/perry/perry_01.jpg",
      "assets/photos/perry/perry_02.jpg",
      "assets/photos/perry/perry_03.jpg",
      "assets/photos/perry/perry_04.jpg"
    ],
    info: "Campus landmark with student-facing departments."
  },
  {
    id: "overview",
    name: "Campus Overview",
    stop: 5,
    video: "https://github.com/SamiIbna/LSBU-360-Virtual-Tour/releases/download/v1.0-demo/overview.mp4",
    photos: [],
    info: "Transition and overview clip."
  }
];

let currentIndex = 0;
let currentPhotoIndex = 0;
let currentPhotoPaths = [];
let currentVideoAvailable = false;
let playing = false;
let audioOn = false;
let currentVolume = 1;
let toastTimer = null;
let loadToken = 0;

const pageMode = document.body.dataset.pageMode;
const scene = document.getElementById("scene");
const htmlHud = document.getElementById("htmlHud");
const videoEl = document.getElementById("video360");
const videoSphere = document.getElementById("videoSphere");
const photoSphere = document.getElementById("photoSphere");
const vrPanel = document.getElementById("vrPanel");
const loadingScreen = document.getElementById("loadingScreen");
const toast = document.getElementById("toast");
const debugBar = document.getElementById("debugBar");

const buildingTabs = document.getElementById("buildingTabs");
const playBtn = document.getElementById("playBtn");
const rewindBtn = document.getElementById("rewindBtn");
const forwardBtn = document.getElementById("forwardBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const photoPageBtn = document.getElementById("photoPageBtn");
const videoPageBtn = document.getElementById("videoPageBtn");
const audioBtn = document.getElementById("audioBtn");
const volumeSlider = document.getElementById("volumeSlider");
const volumeValue = document.getElementById("volumeValue");

const infoName = document.getElementById("infoName");
const infoDesc = document.getElementById("infoDesc");
const stopPill = document.getElementById("stopPill");
const vrStopText = document.getElementById("vrStopText");
const vrPlayText = document.getElementById("vr-play-text");

const photoPrevBtn = document.getElementById("photoPrevBtn");
const photoNextBtn = document.getElementById("photoNextBtn");
const photoCounter = document.getElementById("photoCounter");
const photoNum = document.getElementById("photoNum");
const photoTotal = document.getElementById("photoTotal");

function qs(name) {
  const params = new URLSearchParams(window.location.search);
  return (params.get(name) || "").toLowerCase();
}

function setToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 1800);
}

function setDebug(message) {
  if (!debugBar) return;
  debugBar.textContent = message || "";
  debugBar.classList.toggle("visible", Boolean(message));
}

function setLoading(isLoading) {
  if (!loadingScreen) return;
  loadingScreen.classList.toggle("hidden", !isLoading);
}

function getIdxById(id) {
  const index = BUILDINGS.findIndex((building) => building.id === id);
  return index >= 0 ? index : 0;
}

function updatePlayUi() {
  if (playBtn) playBtn.textContent = playing ? "Pause" : "Play";
  if (vrPlayText) vrPlayText.setAttribute("value", playing ? "Pause" : "Play");
}

function updateHeader(building) {
  if (infoName) infoName.textContent = building.name;
  if (infoDesc) infoDesc.textContent = building.info;
  if (stopPill) stopPill.textContent = `Stop ${building.stop} / ${BUILDINGS.length}`;
  if (vrStopText) {
    vrStopText.setAttribute("value", `Stop ${building.stop}/${BUILDINGS.length} - ${building.name}`);
  }
  if (photoPageBtn) photoPageBtn.href = `photo.html?stop=${building.id}`;
  if (videoPageBtn) videoPageBtn.href = `video.html?stop=${building.id}`;
}

function setPhotoCounter() {
  if (!photoCounter || !photoNum || !photoTotal) return;
  const total = currentPhotoPaths.length;
  photoTotal.textContent = String(total);
  photoNum.textContent = total > 0 ? String(currentPhotoIndex + 1) : "0";
  photoCounter.classList.toggle("visible", pageMode === "photo" && total > 0);
}

function setActiveTab() {
  if (!buildingTabs) return;
  [...buildingTabs.children].forEach((tab, index) => {
    tab.classList.toggle("active", index === currentIndex);
  });
}

function stopVideo() {
  try {
    videoEl.pause();
  } catch (_) {
    // Ignore pause errors from partially loaded media.
  }
  playing = false;
  updatePlayUi();
}

function resetVideoSource() {
  stopVideo();
  videoEl.removeAttribute("src");
  videoEl.load();
}

function showVideoMode() {
  photoSphere.setAttribute("visible", "false");
  videoSphere.setAttribute("visible", currentVideoAvailable ? "true" : "false");
}

function showPhotoMode() {
  stopVideo();
  videoSphere.setAttribute("visible", "false");
  photoSphere.setAttribute("visible", currentPhotoPaths.length > 0 ? "true" : "false");
}

function buildTabs() {
  if (!buildingTabs) return;
  buildingTabs.innerHTML = "";
  BUILDINGS.forEach((building, index) => {
    const button = document.createElement("button");
    button.className = "btab";
    button.textContent = building.name;
    button.addEventListener("click", () => {
      void loadBuilding(index);
    });
    buildingTabs.appendChild(button);
  });
}

function waitForMesh(element) {
  return new Promise((resolve) => {
    const mesh = element.getObject3D("mesh");
    if (mesh) {
      resolve(mesh);
      return;
    }

    const onSet = (event) => {
      if (event.detail && event.detail.type === "mesh") {
        element.removeEventListener("object3dset", onSet);
        resolve(element.getObject3D("mesh"));
      }
    };

    element.addEventListener("object3dset", onSet);
  });
}

async function refreshVideoTexture() {
  videoSphere.setAttribute("src", "#video360");
  const mesh = await waitForMesh(videoSphere);
  if (!mesh || !mesh.material) return;

  const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  for (const material of materials) {
    if (material.map) material.map.needsUpdate = true;
    material.needsUpdate = true;
  }
}

function applyAudioState() {
  videoEl.volume = currentVolume;
  videoEl.muted = !audioOn || currentVolume === 0;
  if (audioBtn) audioBtn.textContent = audioOn && currentVolume > 0 ? "Audio: On" : "Audio: Off";
  if (volumeValue) volumeValue.textContent = `${Math.round(currentVolume * 100)}%`;
}

function openPhotoPage() {
  const building = BUILDINGS[currentIndex];
  window.location.href = `photo.html?stop=${building.id}`;
}

function openVideoPage() {
  const building = BUILDINGS[currentIndex];
  window.location.href = `video.html?stop=${building.id}`;
}

function goHome() {
  window.location.href = "index.html";
}

function probeVideo(src) {
  return new Promise((resolve) => {
    const probe = document.createElement("video");
    let settled = false;

    const finish = (result) => {
      if (settled) return;
      settled = true;
      probe.removeAttribute("src");
      probe.load();
      resolve(result);
    };

    probe.preload = "metadata";
    probe.muted = true;
    probe.playsInline = true;
    probe.onloadeddata = () => finish(true);
    probe.onerror = () => finish(false);
    window.setTimeout(() => finish(false), 3000);
    probe.src = src;
    probe.load();
  });
}

function probeImage(src) {
  return new Promise((resolve) => {
    const image = new Image();
    let settled = false;

    const finish = (result) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    image.onload = () => finish(true);
    image.onerror = () => finish(false);
    window.setTimeout(() => finish(false), 3000);
    image.src = src;
  });
}

async function loadAvailablePhotos(building) {
  const results = await Promise.all(
    building.photos.map(async (path) => (await probeImage(path)) ? path : null)
  );
  return results.filter(Boolean);
}

async function loadBuilding(index) {
  const token = ++loadToken;
  const building = BUILDINGS[index];

  currentIndex = index;
  currentPhotoIndex = 0;
  currentPhotoPaths = [];
  currentVideoAvailable = false;

  setLoading(true);
  setDebug("");
  updateHeader(building);
  setActiveTab();
  setPhotoCounter();
  stopVideo();

  if (pageMode === "video") {
    showVideoMode();
    currentVideoAvailable = await probeVideo(building.video);
    if (token !== loadToken) return;

    if (currentVideoAvailable) {
      videoEl.src = building.video;
      videoEl.load();
      showVideoMode();
    } else {
      resetVideoSource();
      showVideoMode();
      setDebug(`Missing video file: ${building.video}`);
      setToast("Add the MP4 file to assets/videos.");
    }
  } else {
    currentPhotoPaths = await loadAvailablePhotos(building);
    if (token !== loadToken) return;

    if (currentPhotoPaths.length > 0) {
      photoSphere.setAttribute("src", currentPhotoPaths[currentPhotoIndex]);
      showPhotoMode();
    } else {
      showPhotoMode();
      if (building.photos.length > 0) {
        setDebug(`No photo files found for ${building.name}. Add JPG files under assets/photos/${building.id}/.`);
        setToast("Add JPG files to the photo folder.");
      } else {
        setDebug("No photos are assigned to this stop.");
      }
    }
  }

  setPhotoCounter();
  setLoading(false);
}

async function playPauseFromClick() {
  if (pageMode !== "video") {
    setToast("Open Video Page to play video.");
    return;
  }

  if (!currentVideoAvailable) {
    setDebug(`Missing video file: ${BUILDINGS[currentIndex].video}`);
    setToast("This stop does not have a playable MP4 yet.");
    return;
  }

  if (playing) {
    stopVideo();
    return;
  }

  setDebug("");
  showVideoMode();
  videoSphere.setAttribute("visible", "false");

  try {
    const playPromise = videoEl.play();
    if (playPromise) await playPromise;
  } catch (_) {
    setDebug("Playback blocked. Click Play again.");
    return;
  }

  if (!videoEl.videoWidth || !videoEl.videoHeight) {
    stopVideo();
    setDebug("Video decoded as 0x0. Re-export as H.264 / yuv420p MP4.");
    return;
  }

  playing = true;
  updatePlayUi();
  videoSphere.setAttribute("visible", "true");
  await refreshVideoTexture();
}

function seek(seconds) {
  if (!videoEl.duration || !Number.isFinite(videoEl.duration)) return;
  const nextTime = Math.max(0, Math.min(videoEl.duration - 0.1, videoEl.currentTime + seconds));
  videoEl.currentTime = nextTime;
}

function nextBuilding() {
  void loadBuilding((currentIndex + 1) % BUILDINGS.length);
}

function prevBuilding() {
  void loadBuilding((currentIndex - 1 + BUILDINGS.length) % BUILDINGS.length);
}

function photoNext() {
  if (currentPhotoPaths.length === 0) {
    setToast("No photos available for this stop.");
    return;
  }

  currentPhotoIndex = (currentPhotoIndex + 1) % currentPhotoPaths.length;
  photoSphere.setAttribute("src", currentPhotoPaths[currentPhotoIndex]);
  setPhotoCounter();
}

function photoPrev() {
  if (currentPhotoPaths.length === 0) {
    setToast("No photos available for this stop.");
    return;
  }

  currentPhotoIndex = (currentPhotoIndex - 1 + currentPhotoPaths.length) % currentPhotoPaths.length;
  photoSphere.setAttribute("src", currentPhotoPaths[currentPhotoIndex]);
  setPhotoCounter();
}

if (playBtn) {
  playBtn.addEventListener("click", () => {
    void playPauseFromClick();
  });
}
if (rewindBtn) rewindBtn.addEventListener("click", () => seek(-10));
if (forwardBtn) forwardBtn.addEventListener("click", () => seek(10));
if (prevBtn) prevBtn.addEventListener("click", prevBuilding);
if (nextBtn) nextBtn.addEventListener("click", nextBuilding);
if (photoPrevBtn) photoPrevBtn.addEventListener("click", photoPrev);
if (photoNextBtn) photoNextBtn.addEventListener("click", photoNext);

if (audioBtn) {
  audioBtn.addEventListener("click", async () => {
    audioOn = !audioOn;
    if (audioOn && currentVolume === 0) currentVolume = 1;
    if (volumeSlider) volumeSlider.value = String(currentVolume);
    applyAudioState();

    if (audioOn && currentVideoAvailable && pageMode === "video" && videoEl.paused) {
      try {
        await videoEl.play();
        playing = true;
        updatePlayUi();
        videoSphere.setAttribute("visible", "true");
        await refreshVideoTexture();
      } catch (_) {
        // Leave the state unchanged if the browser blocks autoplay.
      }
    }
  });
}

if (volumeSlider) {
  volumeSlider.addEventListener("input", () => {
    currentVolume = Number(volumeSlider.value);
    if (currentVolume === 0) audioOn = false;
    applyAudioState();
  });
}

if (scene) {
  scene.addEventListener("click", (event) => {
    const target = event.target && event.target.closest ? event.target.closest("[data-action]") : null;
    if (!target || !target.classList.contains("vr-clickable")) return;

    const action = target.getAttribute("data-action");
    const id = target.getAttribute("data-id");

    if (action === "building") void loadBuilding(getIdxById(id));
    if (action === "prev") prevBuilding();
    if (action === "next") nextBuilding();
    if (action === "play") void playPauseFromClick();
    if (action === "photo-page") openPhotoPage();
    if (action === "video-page") openVideoPage();
    if (action === "photo-next") photoNext();
    if (action === "photo-prev") photoPrev();
    if (action === "home") goHome();
  });

  scene.addEventListener("enter-vr", () => {
    if (vrPanel) vrPanel.setAttribute("visible", "true");
    if (htmlHud) htmlHud.classList.add("vr-mode");
  });

  scene.addEventListener("exit-vr", () => {
    if (vrPanel) vrPanel.setAttribute("visible", "false");
    if (htmlHud) htmlHud.classList.remove("vr-mode");
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === " " && pageMode === "video") {
    event.preventDefault();
    void playPauseFromClick();
  }
  if (event.key === "ArrowRight") nextBuilding();
  if (event.key === "ArrowLeft") prevBuilding();
  if (event.key === "ArrowUp" && pageMode === "photo") photoPrev();
  if (event.key === "ArrowDown" && pageMode === "photo") photoNext();
  if (event.key.toLowerCase() === "p") {
    if (pageMode === "video") openPhotoPage();
    else openVideoPage();
  }
  if (event.key === "Escape") goHome();
});

videoEl.addEventListener("error", () => {
  currentVideoAvailable = false;
  stopVideo();
  showVideoMode();
  setDebug(`Missing video file: ${BUILDINGS[currentIndex].video}`);
});

(function init() {
  buildTabs();
  updatePlayUi();
  applyAudioState();

  if (window.location.protocol === "file:") {
    setDebug("Open via HTTP: python server.py --port 8080");
  }

  const startStop = qs("stop") || "hub";
  void loadBuilding(getIdxById(startStop));
})();
