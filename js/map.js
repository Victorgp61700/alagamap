// js/map.js
let map = null;
let markersLayer = null;
let userMarker = null;
let currentFilter = 'todos';

const severityColor = level => ({ grave: '#f43f5e', moderado: '#f59e0b', leve: '#10b981' }[level] || '#0284c7');
export const googleMapsUrl = report => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${report.location}, PE`)}`;

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({ 
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' 
  }[character]));
}

export function initMap() {
  const mapElement = document.getElementById('map');
  if (!mapElement || !window.L || map) return;

  map = L.map(mapElement, { zoomControl: false }).setView([-8.055, -34.9], 13);
  L.control.zoom({ position: 'topright' }).addTo(map);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
    maxZoom: 19
  }).addTo(map);

  markersLayer = L.layerGroup().addTo(map);
  
  renderMapMarkers();
  if (window.renderFeedItems) window.renderFeedItems();
  setTimeout(() => map.invalidateSize(), 150);
}

export function renderMapMarkers() {
  if (!markersLayer) return;
  markersLayer.clearLayers();

  const reports = window.floodReports || [];

  reports
    .filter(report => currentFilter === 'todos' || report.severity === currentFilter)
    .forEach(report => {
      L.circleMarker([report.lat, report.lng], { 
        radius: 12, 
        fillColor: severityColor(report.severity), 
        color: '#fff', 
        weight: 2, 
        opacity: 1, 
        fillOpacity: .9 
      })
      .addTo(markersLayer)
      .bindPopup(`
        <div class="p-1">
          <strong>${escapeHTML(report.location)}</strong>
          <p class="mt-1 text-xs">${escapeHTML(report.desc)}</p>
          <p class="mt-1 text-[11px] font-bold">${escapeHTML(report.severity.toUpperCase())} · ${escapeHTML(report.time)}</p>
          <button onclick="openStreetDetails('${report.id}')" class="text-sky-400 mt-2 text-xs font-semibold">Detalhes e fotos</button><br>
          <a href="${googleMapsUrl(report)}" target="_blank" rel="noopener noreferrer" class="text-emerald-400 text-xs font-semibold">Abrir no Google Maps ↗</a>
        </div>
      `);
    });
}

export function filterMap(type, button) {
  currentFilter = type;
  window.currentFilter = type;
  document.querySelectorAll('.filter-btn').forEach(item => item.classList.toggle('active-filter', item === button));
  renderMapMarkers();
  if (window.renderFeedItems) window.renderFeedItems();
}

export function getUserLocation() {
  if (!navigator.geolocation) return window.showNotificationToast('GPS não suportado neste navegador.');
  
  window.showNotificationToast('Obtendo sua localização...');
  navigator.geolocation.getCurrentPosition(position => {
    const { latitude, longitude } = position.coords;
    if (window.switchTab) window.switchTab('map');
    if (!map) return;

    map.flyTo([latitude, longitude], 16);
    if (userMarker) map.removeLayer(userMarker);
    
    userMarker = L.marker([latitude, longitude]).addTo(map).bindPopup('Você está aqui!').openPopup();
    window.showNotificationToast('Localização centralizada!');
  }, () => window.showNotificationToast('Não foi possível acessar o GPS.'), { enableHighAccuracy: true, timeout: 10000 });
}

export function searchLocation() {
  const query = document.getElementById('map-search').value.trim();
  if (!query) return;
  window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${query}, PE`)}`, '_blank', 'noopener,noreferrer');
  window.showNotificationToast('Abrindo busca no Google Maps.');
}

window.map = map;
window.currentFilter = currentFilter;
window.googleMapsUrl = googleMapsUrl;
window.initMap = initMap;
window.renderMapMarkers = renderMapMarkers;
window.filterMap = filterMap;
window.getUserLocation = getUserLocation;
window.searchLocation = searchLocation;