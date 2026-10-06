let authMode = 'login';
const AUTH_KEY = 'alaga-map-auth-user';
const USERS_KEY = 'alaga-map-demo-users';

function getDemoUsers() {
  try { 
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '{}'); 
    return users && typeof users === 'object' ? users : {}; 
  } catch (_) { 
    return {}; 
  }
}

function setAuthMode(mode) {
  authMode = mode === 'signup' ? 'signup' : 'login';
  const isSignup = authMode === 'signup';
  
  document.getElementById('login-tab').classList.toggle('active', !isSignup);
  document.getElementById('signup-tab').classList.toggle('active', isSignup);
  document.getElementById('auth-submit').textContent = isSignup ? 'Criar conta e entrar' : 'Entrar';
  document.getElementById('auth-password').autocomplete = isSignup ? 'new-password' : 'current-password';
  document.getElementById('auth-message').textContent = '';
}

function handleAuthSubmit(event) {
  event.preventDefault();
  const email = document.getElementById('auth-email').value.trim().toLowerCase();
  const password = document.getElementById('auth-password').value;
  const message = document.getElementById('auth-message');

  if (!email || password.length < 6) {
    message.textContent = 'Informe um e-mail válido e uma senha com pelo menos 6 caracteres.';
    return;
  }

  const users = getDemoUsers();

  if (authMode === 'signup') {
    if (users[email]) { 
      message.textContent = 'Este e-mail já está cadastrado. Entre com sua senha.'; 
      return; 
    }
    // Salva o novo usuário no localStorage
    users[email] = password;
    try { localStorage.setItem(USERS_KEY, JSON.stringify(users)); } catch (_) {}
  } else {
    // Se for login e já houver usuários cadastrados, valida a senha
    if (Object.keys(users).length > 0 && users[email] && users[email] !== password) {
      message.textContent = 'Senha incorreta para este e-mail.';
      return;
    }
  }

  // Guarda o e-mail ativo na sessão
  try { localStorage.setItem(AUTH_KEY, email); } catch (_) {}
  showApp();
}

function showApp() {
  const authScreen = document.getElementById('auth-screen');
  const appScreen = document.getElementById('app-screen');
  
  if (!authScreen || !appScreen) return;
  authScreen.classList.add('hidden');
  appScreen.classList.remove('hidden');

  if (!map && window.L) {
    initMap();
  } else if (map) {
    setTimeout(() => map.invalidateSize(), 120);
  }
}

function logout() {
  try { localStorage.removeItem(AUTH_KEY); } catch (_) {}
  document.getElementById('app-screen').classList.add('hidden');
  document.getElementById('auth-screen').classList.remove('hidden');
  document.getElementById('auth-password').value = '';
  setAuthMode('login');
}