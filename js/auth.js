const AUTH_KEY = 'alaga_map_user';

function setAuthMode(mode) {
  const isLogin = mode === 'login';
  document.getElementById('login-tab')?.classList.toggle('active', isLogin);
  document.getElementById('signup-tab')?.classList.toggle('active', !isLogin);
  document.getElementById('form-login')?.classList.toggle('hidden', !isLogin);
  document.getElementById('form-signup')?.classList.toggle('hidden', isLogin);
  const msgEl = document.getElementById('auth-message');
  if (msgEl) msgEl.textContent = '';
}

function toggleHouseNumber(checkbox) {
  const numberInput = document.getElementById('signup-number');
  if (numberInput) {
    numberInput.disabled = checkbox.checked;
    if (checkbox.checked) numberInput.value = '';
  }
}

function handleLoginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  
  // Dados padrão para login direto
  const userData = {
    email: email,
    state: 'PE',
    city: 'Recife',
    neighborhood: 'Boa Vista'
  };
  
  localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
  showApp();
}

function handleSignupSubmit(e) {
  e.preventDefault();
  
  const userData = {
    email: document.getElementById('signup-email').value.trim(),
    phone: document.getElementById('signup-phone').value.trim(),
    state: 'PE',
    city: document.getElementById('signup-city').value.trim() || 'Recife',
    neighborhood: document.getElementById('signup-neighborhood').value.trim() || 'Centro',
    street: document.getElementById('signup-street').value.trim(),
    number: document.getElementById('signup-number').value.trim()
  };

  localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
  showApp();
}

function getUserData() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY)) || { city: 'Recife', neighborhood: 'Boa Vista', state: 'PE' };
  } catch (_) {
    return { city: 'Recife', neighborhood: 'Boa Vista', state: 'PE' };
  }
}

function logout() {
  localStorage.removeItem(AUTH_KEY);
  location.reload();
}

function showApp() {
  document.getElementById('auth-screen')?.classList.add('hidden');
  document.getElementById('app-screen')?.classList.remove('hidden');
  
  if (typeof initMap === 'function') initMap();
  if (typeof initLocationFilters === 'function') initLocationFilters();
  if (typeof renderFeedItems === 'function') renderFeedItems();
}