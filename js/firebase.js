// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDGh5NNA8hMvRU76I4As8VQsPRcPo0isQo",
  authDomain: "alagamap-fd522.firebaseapp.com",
  projectId: "alagamap-fd522",
  storageBucket: "alagamap-fd522.firebasestorage.app",
  messagingSenderId: "642947938473",
  appId: "1:642947938473:web:df6c6a599be6c6a689d1b8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);