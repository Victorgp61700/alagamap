let toastTimer;

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({ 
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' 
  }[character]));
}

function renderFeedItems() {
  const box = document.getElementById('reports-feed');
  if (!box) return;
  box.replaceChildren();

  const reports = floodReports.filter(report => currentFilter === 'todos' || report.severity === currentFilter);

  if (!reports.length) {
    box.innerHTML = '<p class="text-center py-8 text-slate-500 text-xs">Nenhum alerta neste filtro.</p>';
    return;
  }

  reports.forEach(report => {
    const card = document.createElement('article');
    card.className = 'bg-slate-900/90 border border-slate-700/60 rounded-xl p-3 hover:border-slate-600 transition';
    card.innerHTML = `
      <div class="flex justify-between gap-2">
        <strong class="text-xs cursor-pointer hover:text-sky-400 transition">${escapeHTML(report.location)}</strong>
        <span class="text-[10px] text-slate-400">${escapeHTML(report.time)}</span>
      </div>
      <p class="text-xs text-slate-400 mt-1">${escapeHTML(report.desc)}</p>
      <div class="flex justify-between items-center mt-2">
        <span style="color:${severityColor(report.severity)}" class="text-[10px] uppercase font-bold">${escapeHTML(report.severity)}</span>
        <button class="text-xs text-sky-400 font-semibold hover:underline">Detalhes e fotos</button>
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

// Inicialização e Fluxo das Telas
// Inicialização e Fluxo das Telas
document.addEventListener('DOMContentLoaded', () => {
  const loadingScreen = document.getElementById('loading-screen');
  const authScreen = document.getElementById('auth-screen');

  // 1. Simula o carregamento inicial
  setTimeout(() => {
    if (loadingScreen) {
      loadingScreen.classList.add('opacity-0', 'pointer-events-none');
      setTimeout(() => loadingScreen.remove(), 400);
    }

    // 2. Verifica se o usuário já fez login anteriormente
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
  }, 4000); // 👈 ALTERE ESTE VALOR AQUI!
});