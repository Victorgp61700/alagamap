let toastTimer;
let selectedLocationFilter = 'minha_zona';

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({ 
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' 
  }[character]));
}

function initLocationFilters() {
  const user = getUserData();
  const badge = document.getElementById('user-location-badge');
  if (badge) {
    const neigh = user.neighborhood ? `${user.neighborhood}, ` : '';
    const city = user.city || 'PE';
    badge.textContent = `${neigh}${city}`;
  }
}

function filterFeedByLocation(value) {
  selectedLocationFilter = value;
  renderFeedItems();
}

function renderFeedItems() {
  const box = document.getElementById('reports-feed');
  if (!box) return;
  box.replaceChildren();

  const user = getUserData();

  // 1. Aplica o filtro global de gravidade (todos, leve, moderado, grave)
  let reports = floodReports.filter(report => currentFilter === 'todos' || report.severity === currentFilter);

  // 2. Aplica o filtro de localização
  if (selectedLocationFilter === 'minha_zona') {
    const userCity = (user.city || '').toLowerCase();
    const userNeigh = (user.neighborhood || '').toLowerCase();

    // Filtra relatos que correspondam ao bairro ou cidade cadastrados do usuário
    const nearbyReports = reports.filter(report => {
      const loc = (report.location || '').toLowerCase();
      return (userNeigh && loc.includes(userNeigh)) || (userCity && loc.includes(userCity));
    });

    // Se houver registros na zona do usuário, exibe-os. Se não houver nenhum próximo, mostra todos de Pernambuco.
    if (nearbyReports.length > 0) {
      reports = nearbyReports;
    }
  } else if (selectedLocationFilter !== 'todos') {
    reports = reports.filter(report => 
      (report.location || '').toLowerCase().includes(selectedLocationFilter.toLowerCase())
    );
  }

  if (!reports.length) {
    box.innerHTML = '<p class="text-center py-8 text-slate-500 text-xs">Nenhum alerta nesta localização.</p>';
    return;
  }

  reports.forEach(report => {
    let badgeBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    if (report.severity === 'grave') {
      badgeBg = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    } else if (report.severity === 'moderado') {
      badgeBg = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }

    const card = document.createElement('article');
    card.className = 'report-feed-card';
    card.innerHTML = `
      <div class="flex items-start justify-between gap-2 mb-1">
        <strong class="text-xs font-bold text-slate-100 cursor-pointer hover:text-[#3b9ee4] transition leading-snug">${escapeHTML(report.location)}</strong>
        <span class="text-[10px] text-slate-400 whitespace-nowrap">${escapeHTML(report.time)}</span>
      </div>
      
      <p class="text-xs text-slate-300 my-2 leading-relaxed">${escapeHTML(report.desc)}</p>
      
      <div class="flex items-center justify-between pt-2 border-t border-[#232d38]">
        <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${badgeBg}">
          ${escapeHTML(report.severity)}
        </span>
        <button class="btn-report-details">
          Detalhes e fotos <i class="fa-solid fa-chevron-right text-[10px] ml-1"></i>
        </button>
      </div>
    `;

    card.querySelector('strong').addEventListener('click', () => { 
      switchTab('map'); 
      if (map) map.flyTo([report.lat, report.lng], 16); 
    });
    card.querySelector('button').addEventListener('click', () => openStreetDetails(report.id));
    box.appendChild(card);
  });

  document.getElementById('stat-active-count').textContent = floodReports.length;
  document.getElementById('stat-critical-count').textContent = floodReports.filter(report => report.severity === 'grave').length;
}

function switchTab(tab) {
  const mapSection = document.getElementById('section-map');
  const feed = document.getElementById('section-feed');
  const stats = document.getElementById('section-stats');

  if (!mapSection || !feed || !stats) return;

  ['map', 'feed', 'stats'].forEach(name => {
    const button = document.getElementById(`nav-btn-${name}`);
    if (button) button.classList.toggle('active-nav', name === tab);
  });

  mapSection.classList.toggle('hidden', tab !== 'map');
  feed.classList.toggle('hidden', tab !== 'feed');
  feed.classList.toggle('flex', tab === 'feed');
  stats.classList.toggle('hidden', tab === 'feed');

  if (tab === 'map' && map) setTimeout(() => map.invalidateSize(), 120);
}

function showNotificationToast(message) {
  const toast = document.getElementById('toast');
  const text = document.getElementById('toast-message');
  if (!toast || !text) return;

  text.textContent = message;
  toast.classList.remove('-translate-y-20', 'opacity-0');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add('-translate-y-20', 'opacity-0'), 3000);
}

// Inicialização e Fluxo
document.addEventListener('DOMContentLoaded', () => {
  const loadingScreen = document.getElementById('loading-screen');
  const authScreen = document.getElementById('auth-screen');

  setTimeout(() => {
    if (loadingScreen) {
      loadingScreen.classList.add('opacity-0', 'pointer-events-none');
      setTimeout(() => loadingScreen.remove(), 400);
    }

    let authenticated = false;
    try {
      authenticated = Boolean(localStorage.getItem(AUTH_KEY));
    } catch (_) {}

    if (authenticated) {
      showApp();
    } else {
      if (authScreen) authScreen.classList.remove('hidden');
      setAuthMode('login');
    }
  }, 4000);
});