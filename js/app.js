// js/app.js
import { initReportsListener } from './data.js';
import { getUserData } from './auth.js';
import { auth } from './firebase.js';

let toastTimer;
let selectedLocationFilter = 'todos';;

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({ 
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' 
  }[character]));
}

export function initLocationFilters() {
  const user = getUserData();
  const badge = document.getElementById('user-location-badge');
  if (badge) {
    const neigh = user.neighborhood ? `${user.neighborhood}, ` : '';
    const city = user.city || 'PE';
    badge.textContent = `${neigh}${city}`;
  }
}

export function filterFeedByLocation(value) {
  selectedLocationFilter = value;
  renderFeedItems();
}

export function renderFeedItems() {
  const box = document.getElementById('reports-feed');
  if (!box) return;
  box.replaceChildren();

  const user = getUserData();
  const currentUser = auth.currentUser;
  const reportsList = window.floodReports || [];
  const currentFilter = window.currentFilter || 'todos';

  let reports = reportsList.filter(report => currentFilter === 'todos' || report.severity === currentFilter);

  if (selectedLocationFilter === 'minha_zona') {
    const userCity = (user.city || '').toLowerCase();
    const userNeigh = (user.neighborhood || '').toLowerCase();

    const nearbyReports = reports.filter(report => {
      const loc = (report.location || '').toLowerCase();
      return (userNeigh && loc.includes(userNeigh)) || (userCity && loc.includes(userCity));
    });

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

    const isOwner = currentUser && report.userId === currentUser.uid;

    const card = document.createElement('article');
    card.className = 'report-feed-card';
    card.innerHTML = `
      <div class="flex items-start justify-between gap-2 mb-1">
        <strong class="text-xs font-bold text-slate-100 cursor-pointer hover:text-[#3b9ee4] transition leading-snug">${escapeHTML(report.location)}</strong>
        <span class="text-[10px] text-slate-400 whitespace-nowrap"><i class="fa-regular fa-clock mr-1"></i>${escapeHTML(report.time)}</span>
      </div>
      
      <p class="text-xs text-slate-300 my-2 leading-relaxed">${escapeHTML(report.desc)}</p>
      
      <div class="flex items-center justify-between pt-2 border-t border-[#232d38]">
        <div class="flex items-center gap-2">
          <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${badgeBg}">
            ${escapeHTML(report.severity)}
          </span>
          ${isOwner ? `<button class="btn-delete-report text-[10px] text-rose-400 hover:underline flex items-center gap-1"><i class="fa-solid fa-trash"></i> Excluir</button>` : ''}
        </div>
        <button class="btn-report-details">
          Detalhes e fotos <i class="fa-solid fa-chevron-right text-[10px] ml-1"></i>
        </button>
      </div>
    `;

    card.querySelector('strong').addEventListener('click', () => { 
      switchTab('map'); 
      if (window.map) window.map.flyTo([report.lat, report.lng], 16); 
    });
    card.querySelector('.btn-report-details').addEventListener('click', () => window.openStreetDetails(report.id));
    
    if (isOwner) {
      card.querySelector('.btn-delete-report')?.addEventListener('click', () => window.deleteReport(report.id));
    }

    box.appendChild(card);
  });

  const activeCountEl = document.getElementById('stat-active-count');
  const criticalCountEl = document.getElementById('stat-critical-count');
  if (activeCountEl) activeCountEl.textContent = reportsList.length;
  if (criticalCountEl) criticalCountEl.textContent = reportsList.filter(report => report.severity === 'grave').length;
}

export function switchTab(tab) {
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

  if (tab === 'map' && window.map) setTimeout(() => window.map.invalidateSize(), 120);
}

export function showNotificationToast(message) {
  const toast = document.getElementById('toast');
  const text = document.getElementById('toast-message');
  if (!toast || !text) return;

  text.textContent = message;
  toast.classList.remove('-translate-y-20', 'opacity-0');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add('-translate-y-20', 'opacity-0'), 3000);
}

window.initLocationFilters = initLocationFilters;
window.filterFeedByLocation = filterFeedByLocation;
window.renderFeedItems = renderFeedItems;
window.switchTab = switchTab;
window.showNotificationToast = showNotificationToast;

document.addEventListener('DOMContentLoaded', () => {
  const loadingScreen = document.getElementById('loading-screen');
  const authScreen = document.getElementById('auth-screen');

  initReportsListener();

  setTimeout(() => {
    if (loadingScreen) {
      loadingScreen.classList.add('opacity-0', 'pointer-events-none');
      setTimeout(() => loadingScreen.remove(), 400);
    }

    if (auth.currentUser) {
      if (window.showApp) window.showApp();
    } else {
      if (authScreen) authScreen.classList.remove('hidden');
      if (window.setAuthMode) window.setAuthMode('login');
    }
  }, 2000);
});