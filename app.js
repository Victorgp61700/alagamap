// Dados iniciais
const floodReports = [
  { id: 1, location: 'Av. Agamenon Magalhães - Derby', severity: 'grave', desc: 'Água na altura do pneu. Trânsito parado no sentido Boa Viagem.', time: 'Há 5 min', lat: -8.0581, lng: -34.8943, photos: [] },
  { id: 2, location: 'Rua do Espinheiro - Espinheiro', severity: 'moderado', desc: 'Acúmulo de água no meio-fio, carros altos conseguem passar.', time: 'Há 12 min', lat: -8.0440, lng: -34.8961, photos: [] },
  { id: 3, location: 'Avenida Caxangá - Zequinha', severity: 'grave', desc: 'Ponto crítico sob o viaduto. Evitem a área!', time: 'Há 25 min', lat: -8.0490, lng: -34.9220, photos: [] },
  { id: 4, location: 'Estrada dos Remédios - Afogados', severity: 'leve', desc: 'Pequenos pontos de alagamento, trânsito fluindo devagar.', time: 'Há 40 min', lat: -8.0735, lng: -34.9080, photos: [] }
];

let map, markersLayer, currentFilter = 'todos';

// Utilitários
const severityColor = s => ({ grave: '#f43f5e', moderado: '#f59e0b', leve: '#10b981' }[s] || '#0284c7');
const googleMapsUrl = r => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${r.location}, Recife, PE`)}`;

// Inicialização
window.addEventListener('load', () => {
  map = L.map('map', { zoomControl: false }).setView([-8.055, -34.900], 13);
  
  // Posiciona controle de zoom no topo direito
  L.control.zoom({ position: 'topright' }).addTo(map);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap',
    maxZoom: 19
  }).addTo(map);

  markersLayer = L.layerGroup().addTo(map);
  
  renderMapMarkers();
  renderFeedItems();
});

// Renderizar Marcadores no Mapa
function renderMapMarkers() {
  if (!markersLayer) return;
  markersLayer.clearLayers();

  floodReports
    .filter(r => currentFilter === 'todos' || r.severity === currentFilter)
    .forEach(r => {
      const color = severityColor(r.severity);
      const marker = L.circleMarker([r.lat, r.lng], {
        radius: 12,
        fillColor: color,
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.9
      }).addTo(markersLayer);

      marker.bindPopup(`
        <div class="p-1 max-w-[220px]">
          <strong class="text-xs sm:text-sm block leading-tight">${escapeHTML(r.location)}</strong>
          <p class="text-[11px] text-slate-300 mt-1">${escapeHTML(r.desc)}</p>
          <p class="text-[10px] text-slate-400 mt-1.5 font-medium">Nível: ${escapeHTML(r.severity.toUpperCase())} · ${escapeHTML(r.time)}</p>
          <div class="mt-2 pt-2 border-t border-slate-800 flex flex-col gap-1">
            <button onclick="openStreetDetails(${r.id})" class="text-sky-400 text-xs font-semibold text-left">
              Detalhes e Fotos <i class="fa-solid fa-chevron-right text-[10px]"></i>
            </button>
            <a href="${googleMapsUrl(r)}" target="_blank" rel="noopener noreferrer" class="text-emerald-400 text-xs font-semibold">
              Abrir no Google Maps ↗
            </a>
          </div>
        </div>
      `);
    });
}

// Renderizar Lista / Feed
function renderFeedItems() {
  const box = document.getElementById('reports-feed');
  box.innerHTML = '';

  const list = floodReports.filter(r => currentFilter === 'todos' || r.severity === currentFilter);

  if (!list.length) {
    box.innerHTML = '<div class="text-center py-8 text-slate-500 text-xs">Nenhum alerta registrado com esse filtro.</div>';
    return;
  }

  list.forEach(r => {
    const card = document.createElement('article');
    card.className = 'bg-slate-900/90 border border-slate-700/60 rounded-xl p-3 hover:border-sky-500/60 transition active:bg-slate-800/80';
    card.innerHTML = `
      <div class="flex items-start justify-between gap-2 mb-1">
        <div class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background:${severityColor(r.severity)}"></span>
          <h4 class="text-xs font-bold text-slate-200">${escapeHTML(r.location)}</h4>
        </div>
        <span class="text-[10px] text-slate-400 shrink-0">${escapeHTML(r.time)}</span>
      </div>
      <p class="text-xs text-slate-400 pl-4 line-clamp-2">${escapeHTML(r.desc)}</p>
      <div class="flex items-center justify-between mt-2.5 pl-4">
        <span class="text-[10px] uppercase font-bold" style="color:${severityColor(r.severity)}">${escapeHTML(r.severity)}</span>
        <button class="text-xs text-sky-400 hover:text-sky-300 font-semibold" onclick="openStreetDetails(${r.id})">
          Detalhes e fotos
        </button>
      </div>
    `;

    // Ao clicar no título, foca no mapa
    card.querySelector('h4').addEventListener('click', () => {
      switchTab('map');
      map.flyTo([r.lat, r.lng], 16, { duration: 1 });
    });

    box.appendChild(card);
  });

  document.getElementById('stat-active-count').textContent = floodReports.length;
  document.getElementById('stat-critical-count').textContent = floodReports.filter(r => r.severity === 'grave').length;
}

// Filtros de Alagamento
function filterMap(type, button) {
  currentFilter = type;
  document.querySelectorAll('.filter-btn').forEach(b => {
    b.classList.remove('bg-sky-600', 'text-white');
    b.classList.add('text-slate-300');
  });
  button.classList.add('bg-sky-600', 'text-white');
  button.classList.remove('text-slate-300');

  renderMapMarkers();
  renderFeedItems();
}

// Alternar abas no Celular (Mobile Bottom Nav)
function switchTab(tab) {
  const mapSec = document.getElementById('section-map');
  const feedSec = document.getElementById('section-feed');
  const statsSec = document.getElementById('section-stats');

  // Resetar classes das abas da barra inferior
  document.getElementById('nav-btn-map').className = 'flex flex-col items-center gap-1 text-slate-400 w-1/4';
  document.getElementById('nav-btn-feed').className = 'flex flex-col items-center gap-1 text-slate-400 w-1/4';
  document.getElementById('nav-btn-stats').className = 'flex flex-col items-center gap-1 text-slate-400 w-1/4';

  if (tab === 'map') {
    mapSec.classList.remove('hidden');
    feedSec.classList.add('hidden');
    feedSec.classList.remove('flex');
    statsSec.classList.remove('hidden');
    document.getElementById('nav-btn-map').className = 'flex flex-col items-center gap-1 text-sky-400 w-1/4';
    setTimeout(() => map.invalidateSize(), 100);
  } else if (tab === 'feed') {
    mapSec.classList.add('hidden');
    feedSec.classList.remove('hidden');
    feedSec.classList.add('flex');
    statsSec.classList.add('hidden');
    document.getElementById('nav-btn-feed').className = 'flex flex-col items-center gap-1 text-sky-400 w-1/4';
  } else if (tab === 'stats') {
    mapSec.classList.add('hidden');
    feedSec.classList.add('hidden');
    feedSec.classList.remove('flex');
    statsSec.classList.remove('hidden');
    document.getElementById('nav-btn-stats').className = 'flex flex-col items-center gap-1 text-sky-400 w-1/4';
  }
}

// Modal de Detalhes da Rua
function openStreetDetails(id) {
  const r = floodReports.find(item => item.id === id);
  if (!r) return;

  document.getElementById('street-title').textContent = r.location;
  document.getElementById('street-desc').textContent = r.desc;
  document.getElementById('street-time').textContent = `Atualização: ${r.time} · Gravidade: ${r.severity.toUpperCase()}`;
  document.getElementById('maps-link').href = googleMapsUrl(r);
  document.getElementById('streetview-link').href = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${r.lat},${r.lng}`;

  const photos = document.getElementById('street-photos');
  photos.innerHTML = '';
  r.photos.forEach(src => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = `Foto de alagamento`;
    img.className = 'w-full h-32 object-cover rounded-xl border border-slate-700';
    photos.appendChild(img);
  });

  document.getElementById('photo-count').textContent = r.photos.length ? `${r.photos.length} foto(s)` : '';
  document.getElementById('no-photos').classList.toggle('hidden', r.photos.length > 0);

  const modal = document.getElementById('street-modal');
  modal.classList.remove('opacity-0', 'pointer-events-none');
}

function closeStreetModal() {
  document.getElementById('street-modal').classList.add('opacity-0', 'pointer-events-none');
}

// Modal de Novo Reporte
function toggleReportModal(show) {
  const modal = document.getElementById('report-modal');
  const content = document.getElementById('report-modal-content');

  modal.classList.toggle('opacity-0', !show);
  modal.classList.toggle('pointer-events-none', !show);

  if (show) {
    content.classList.remove('translate-y-full', 'sm:scale-95');
    content.classList.add('translate-y-0', 'sm:scale-100');
  } else {
    content.classList.add('translate-y-full', 'sm:scale-95');
    content.classList.remove('translate-y-0', 'sm:scale-100');
  }
}

// Enviar Novo Alerta
function handleReportSubmit(e) {
  e.preventDefault();
  const location = document.getElementById('input-location').value.trim();
  const severity = document.querySelector('input[name="severity"]:checked').value;
  const desc = document.getElementById('input-desc').value.trim() || 'Sem detalhes adicionais.';
  const file = document.getElementById('input-photo').files[0];

  const report = {
    id: Date.now(),
    location,
    severity,
    desc,
    time: 'Agora mesmo',
    lat: -8.055 + (Math.random() - 0.5) * 0.04,
    lng: -34.900 + (Math.random() - 0.5) * 0.04,
    photos: []
  };

  const finish = () => {
    floodReports.unshift(report);
    renderMapMarkers();
    renderFeedItems();
    toggleReportModal(false);
    document.getElementById('form-report').reset();
    showNotificationToast('Alerta enviado com sucesso!');
  };

  if (file) {
    if (file.size > 6 * 1024 * 1024) {
      showNotificationToast('A imagem deve ter no máximo 6 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      report.photos.push(reader.result);
      finish();
    };
    reader.onerror = () => showNotificationToast('Erro ao carregar a foto.');
    reader.readAsDataURL(file);
  } else {
    finish();
  }
}

// Funções de Localização / GPS
function getUserLocation() {
  if (!navigator.geolocation) {
    showNotificationToast('GPS não suportado no seu navegador.');
    return;
  }
  showNotificationToast('Obtendo sua localização...');
  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude, longitude } = pos.coords;
      switchTab('map');
      map.flyTo([latitude, longitude], 16);
      L.marker([latitude, longitude]).addTo(map).bindPopup('Você está aqui!').openPopup();
      showNotificationToast('Localização centralizada!');
    },
    () => showNotificationToast('Permissão de GPS negada.')
  );
}

function useCurrentLocation() {
  if (!navigator.geolocation) {
    showNotificationToast('GPS não disponível.');
    return;
  }
  navigator.geolocation.getCurrentPosition(
    pos => {
      document.getElementById('input-location').value = `GPS (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`;
      showNotificationToast('Coordenadas inseridas!');
    },
    () => showNotificationToast('Erro ao acessar o GPS.')
  );
}

function searchLocation() {
  const query = document.getElementById('map-search').value.trim();
  if (!query) return;
  window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query + ', Recife, PE')}`, '_blank');
  showNotificationToast('Abrindo busca no Google Maps.');
}

// Sistema de Toast
function showNotificationToast(msg) {
  const toast = document.getElementById('toast');
  document.getElementById('toast-message').textContent = msg;
  toast.classList.remove('-translate-y-20', 'opacity-0');

  setTimeout(() => {
    toast.classList.add('-translate-y-20', 'opacity-0');
  }, 3000);
}

function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Fechar com ESC
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeStreetModal();
    toggleReportModal(false);
  }
});