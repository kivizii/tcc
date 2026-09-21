/**
 * Mapa de apoio — Leaflet + OpenStreetMap (São Paulo).
 */
window.ZL = window.ZL || {};

const SP_CENTER = [-23.5505, -46.6333];
const SP_ZOOM = 12;
const SP_USER_ZOOM = 14;

const DEFAULT_POIS = [
  {
    name: "DEAM 1ª RGD",
    category: "DEAM",
    lat: -23.5343,
    lng: -46.6362,
    address: "R. Brigadeiro Tobias, 332 — Luz, São Paulo",
    phone: "190",
  },
  {
    name: "DEAM 6ª RGD",
    category: "DEAM",
    lat: -23.5858,
    lng: -46.6124,
    address: "Av. Nazaré, 570 — Ipiranga, São Paulo",
    phone: "190",
  },
  {
    name: "Hospital das Clínicas FMUSP",
    category: "Hospital",
    lat: -23.5558,
    lng: -46.6699,
    address: "Av. Dr. Arnaldo, 455 — Cerqueira César, São Paulo",
    phone: "(11) 2661-0000",
  },
  {
    name: "Instituto da Mulher HC-FMUSP",
    category: "Hospital",
    lat: -23.5565,
    lng: -46.6705,
    address: "Av. Dr. Enéas de Carvalho Aguiar, 255 — Cerqueira César, São Paulo",
    phone: "(11) 2661-8000",
  },
  {
    name: "Casa da Mulher Brasileira",
    category: "ONG",
    lat: -23.5652,
    lng: -46.6721,
    address: "R. Capote Valente, 494 — Jardim Paulista, São Paulo",
    phone: "180",
  },
  {
    name: "Centro de Referência da Mulher",
    category: "ONG",
    lat: -23.5481,
    lng: -46.6382,
    address: "Av. Rio Branco, 124 — Centro, São Paulo",
    phone: "180",
  },
  {
    name: "DDM 1º Distrito",
    category: "Delegacia",
    lat: -23.5475,
    lng: -46.6355,
    address: "R. Líbero Badaró, 390 — Centro, São Paulo",
    phone: "197",
  },
  {
    name: "CREAS Centro",
    category: "ONG",
    lat: -23.5502,
    lng: -46.6338,
    address: "R. Barão de Itapetininga, 373 — Centro, São Paulo",
    phone: "156",
  },
];

const MARKER_COLORS = {
  DEAM: "#c97596",
  Delegacia: "#a88a96",
  Hospital: "#e891b8",
  ONG: "#f0b8d0",
};

const MAP_POPUP_OPTIONS = { className: "map-popup" };
let mapInitStarted = false;

/** Fontes de tiles (CARTO → Esri) — mais estáveis que tile.openstreetmap.org direto */
const MAP_TILE_SOURCES = [
  {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    options: {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 20,
    },
  },
  {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    options: {
      attribution: "Tiles &copy; Esri",
      maxZoom: 19,
    },
  },
];

function addMapTiles(L, map) {
  function trySource(index) {
    if (index >= MAP_TILE_SOURCES.length) {
      setMapStatus("Não foi possível carregar as ruas do mapa. Verifique sua conexão.", true);
      return;
    }

    const { url, options } = MAP_TILE_SOURCES[index];
    const layer = L.tileLayer(url, options);
    let switched = false;

    layer.on("tileerror", () => {
      if (switched) return;
      switched = true;
      map.removeLayer(layer);
      trySource(index + 1);
    });

    layer.addTo(map);
  }

  trySource(0);
}

function setMapStatus(message, isError) {
  const statusEl = document.getElementById("map-status");
  if (!statusEl) return;
  statusEl.hidden = false;
  statusEl.textContent = message;
  statusEl.classList.toggle("map-status--error", Boolean(isError));
}

function loadLeaflet() {
  return new Promise((resolve, reject) => {
    if (window.L) {
      resolve(window.L);
      return;
    }

    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.crossOrigin = "anonymous";
      document.head.appendChild(link);
    }

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.crossOrigin = "anonymous";
    script.onload = () => {
      if (window.L) resolve(window.L);
      else reject(new Error("Não foi possível carregar o mapa."));
    };
    script.onerror = () => reject(new Error("Não foi possível carregar o mapa. Verifique sua conexão."));
    document.head.appendChild(script);
  });
}

function getOptionalLocation(spBounds) {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (spBounds.contains([latitude, longitude])) {
          resolve({ lat: latitude, lng: longitude });
        } else {
          resolve(null);
        }
      },
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
    );
  });
}

function distanceKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function createCategoryIcon(L, category) {
  const color = MARKER_COLORS[category] || "#7a7579";
  return L.divIcon({
    className: "map-marker",
    html: `<span style="background:${color};width:14px;height:14px;border-radius:50%;display:block;border:2px solid #fff;box-shadow:0 1px 4px rgba(74,69,72,.25)"></span>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function createUserIcon(L) {
  return L.divIcon({
    className: "map-marker",
    html: `<span style="background:#e891b8;width:16px;height:16px;border-radius:50%;display:block;border:3px solid #fff;box-shadow:0 2px 6px rgba(74,69,72,.3)"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

window.ZL.initMapPage = async function () {
  const mapEl = document.getElementById("map");
  const listEl = document.getElementById("poi-list");
  const filterContainer = document.getElementById("map-filters");
  if (!mapEl) return;

  if (mapInitStarted || mapEl.dataset.mapReady === "true" || mapEl.classList.contains("leaflet-container")) {
    return;
  }
  mapInitStarted = true;

  setMapStatus("Carregando mapa…", false);

  try {
    let pois = DEFAULT_POIS;
    try {
      if (typeof window.ZL.loadContent === "function") {
        const data = await window.ZL.loadContent();
        if (data.pois?.length) pois = data.pois;
      }
    } catch {
      /* usa POIs padrão */
    }

    const L = await loadLeaflet();
    const spBounds = L.latLngBounds([-23.82, -46.95], [-23.35, -46.35]);

    const map = L.map(mapEl, {
      maxBounds: spBounds,
      maxBoundsViscosity: 0.8,
    }).setView(SP_CENTER, SP_ZOOM);

    addMapTiles(L, map);

    mapEl.dataset.mapReady = "true";

    const markers = [];
    const markersByIndex = {};
    let userMarker = null;
    let activeFilter = "all";
    let userLocation = null;
    let userLat = SP_CENTER[0];
    let userLng = SP_CENTER[1];

    function renderMarkers() {
      markers.forEach((m) => map.removeLayer(m));
      markers.length = 0;
      Object.keys(markersByIndex).forEach((k) => delete markersByIndex[k]);

      const filtered = activeFilter === "all" ? pois : pois.filter((p) => p.category === activeFilter);

      const refPoint = userLocation ? { lat: userLat, lng: userLng } : { lat: SP_CENTER[0], lng: SP_CENTER[1] };

      const withDist = filtered.map((p) => ({
        ...p,
        distance: distanceKm(refPoint, p),
      }));
      withDist.sort((a, b) => a.distance - b.distance);

      withDist.forEach((p, index) => {
        const marker = L.marker([p.lat, p.lng], { icon: createCategoryIcon(L, p.category) })
          .addTo(map)
          .bindPopup(
            `<strong>${p.name}</strong><br>${p.category}<br>${p.address}<br>${p.phone}`,
            MAP_POPUP_OPTIONS
          );
        markers.push(marker);
        markersByIndex[index] = marker;
      });

      if (listEl) {
        if (withDist.length === 0) {
          listEl.innerHTML = '<p class="text-muted">Nenhum local encontrado para este filtro.</p>';
          return;
        }

        listEl.innerHTML = withDist
          .map(
            (p, index) => `
        <div class="card poi-card" data-poi-index="${index}" tabindex="0" role="button" aria-label="Ver ${p.name} no mapa">
          <h3 class="card__title">${p.name}</h3>
          <p class="card__text">${p.category} · ${p.distance.toFixed(1)} km<br>${p.address}<br>${p.phone}</p>
        </div>`
          )
          .join("");

        listEl.querySelectorAll(".poi-card").forEach((card) => {
          const focusPoi = () => {
            const idx = Number(card.dataset.poiIndex);
            const marker = markersByIndex[idx];
            const poi = withDist[idx];
            if (!marker || !poi) return;
            map.setView([poi.lat, poi.lng], Math.max(map.getZoom(), 14), { animate: true });
            marker.openPopup();
          };

          card.addEventListener("click", focusPoi);
          card.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              focusPoi();
            }
          });
        });
      }
    }

    if (filterContainer) {
      const cats = ["all", ...new Set(pois.map((p) => p.category))];
      filterContainer.innerHTML = cats
        .map(
          (c) =>
            `<button type="button" class="tag${c === "all" ? " tag--active" : ""}" data-cat="${c}">${
              c === "all" ? "Todos" : c
            }</button>`
        )
        .join("");

      filterContainer.querySelectorAll(".tag").forEach((btn) => {
        btn.addEventListener("click", () => {
          filterContainer.querySelectorAll(".tag").forEach((t) => t.classList.remove("tag--active"));
          btn.classList.add("tag--active");
          activeFilter = btn.dataset.cat;
          renderMarkers();
        });
      });
    }

    renderMarkers();
    setMapStatus("Mapa de São Paulo", false);

    const refreshSize = () => map.invalidateSize();
    setTimeout(refreshSize, 0);
    setTimeout(refreshSize, 150);
    window.addEventListener("resize", refreshSize);

    getOptionalLocation(spBounds).then((loc) => {
      if (!loc) return;
      userLocation = loc;
      userLat = loc.lat;
      userLng = loc.lng;
      if (userMarker) map.removeLayer(userMarker);
      userMarker = L.marker([userLat, userLng], { icon: createUserIcon(L) })
        .addTo(map)
        .bindPopup("<strong>Você está aqui</strong>", MAP_POPUP_OPTIONS);
      map.setView([userLat, userLng], SP_USER_ZOOM, { animate: true });
      setMapStatus("Mapa de São Paulo — localização ativa", false);
      renderMarkers();
    });
  } catch (err) {
    mapInitStarted = false;
    console.error("Zela map error:", err);
    setMapStatus(err.message || "Erro ao carregar o mapa. Use um servidor local e verifique sua conexão.", true);
  }
};

function bootMapPage() {
  if (document.body.dataset.page !== "map") return;
  window.ZL.initMapPage();
}

document.addEventListener("zela:ready", bootMapPage);

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(bootMapPage, 2500);
  });
} else {
  setTimeout(bootMapPage, 2500);
}
