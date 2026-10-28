// js/auth.js
import { auth, db } from './firebase.js';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  doc, 
  setDoc, 
  getDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const AUTH_KEY = 'alaga_map_user';

onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);
      
      let userData = { email: user.email, city: 'Recife', neighborhood: 'Boa Vista', state: 'PE' };
      if (userSnap.exists()) {
        userData = userSnap.data();
      }
      
      localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
      if (window.showApp) window.showApp();
    } catch (e) {
      console.error("Erro ao recuperar perfil do usuário:", e);
    }
  } else {
    localStorage.removeItem(AUTH_KEY);
  }
});

export function setAuthMode(mode) {
  const isLogin = mode === 'login';
  document.getElementById('login-tab')?.classList.toggle('active', isLogin);
  document.getElementById('signup-tab')?.classList.toggle('active', !isLogin);
  document.getElementById('form-login')?.classList.toggle('hidden', !isLogin);
  document.getElementById('form-signup')?.classList.toggle('hidden', isLogin);
  const msgEl = document.getElementById('auth-message');
  if (msgEl) msgEl.textContent = '';
}

export function toggleHouseNumber(checkbox) {
  const numberInput = document.getElementById('signup-number');
  if (numberInput) {
    numberInput.disabled = checkbox.checked;
    if (checkbox.checked) numberInput.value = '';
  }
}

export async function handleLoginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const msgEl = document.getElementById('auth-message');

  try {
    if (msgEl) msgEl.textContent = 'Entrando...';
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    if (msgEl) msgEl.textContent = "Erro ao entrar: Verifique seu e-mail e senha.";
  }
}

export async function handleSignupSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const msgEl = document.getElementById('auth-message');

  const userData = {
    email: email,
    phone: document.getElementById('signup-phone').value.trim(),
    state: 'PE',
    city: document.getElementById('signup-city').value.trim() || 'Recife',
    neighborhood: document.getElementById('signup-neighborhood').value.trim() || 'Centro',
    street: document.getElementById('signup-street').value.trim(),
    number: document.getElementById('signup-number').value.trim()
  };

  try {
    if (msgEl) msgEl.textContent = 'Criando conta...';
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", userCredential.user.uid), userData);
  } catch (error) {
    if (msgEl) msgEl.textContent = "Erro no cadastro: " + error.message;
  }
}

export function getUserData() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY)) || { city: 'Recife', neighborhood: 'Boa Vista', state: 'PE' };
  } catch (_) {
    return { city: 'Recife', neighborhood: 'Boa Vista', state: 'PE' };
  }
}

export function logout() {
  signOut(auth).then(() => {
    localStorage.removeItem(AUTH_KEY);
    location.reload();
  });
}

export function showApp() {
  document.getElementById('auth-screen')?.classList.add('hidden');
  document.getElementById('app-screen')?.classList.remove('hidden');
  
  if (typeof window.initMap === 'function') window.initMap();
  if (typeof window.initLocationFilters === 'function') window.initLocationFilters();
  if (typeof window.renderFeedItems === 'function') window.renderFeedItems();
}

window.setAuthMode = setAuthMode;
window.toggleHouseNumber = toggleHouseNumber;
window.handleLoginSubmit = handleLoginSubmit;
window.handleSignupSubmit = handleSignupSubmit;
window.getUserData = getUserData;
window.logout = logout;
window.showApp = showApp;