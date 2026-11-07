// js/report.js

import { db } from './firebase.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { auth } from './firebase.js';

// Coordenadas centrais aproximadas para as cidades de Pernambuco
const cityCoordinates = {
  "Recife": { lat: -8.05428, lng: -34.8813 },
  "Olinda": { lat: -8.0089, lng: -34.8553 },
  "Jaboatão dos Guararapes": { lat: -8.1127, lng: -35.0158 },
  "Paulista": { lat: -7.9408, lng: -34.8725 },
  "Camaragibe": { lat: -8.0247, lng: -34.9819 },
  "Caruaru": { lat: -8.2831, lng: -35.9758 }
};

export async function handleReportSubmit(e) {
  e.preventDefault();
  
  const city = document.getElementById('input-city').value;
  const neighborhood = document.getElementById('input-neighborhood').value.trim();
  const street = document.getElementById('input-street').value.trim();
  const number = document.getElementById('input-number').value.trim();
  const severity = document.querySelector('input[name="severity"]:checked')?.value || 'moderado';
  const desc = document.getElementById('input-desc').value.trim();
  
  const fullLocation = `${street}${number ? ', ' + number : ''} - ${neighborhood}, ${city}`;

  // Define as coordenadas com base na cidade selecionada ou usa Recife como padrão
  let coords = cityCoordinates[city] || { lat: -8.055, lng: -34.9 };

  // Se houver suporte a GPS ativo ou se quisermos refinar, podemos usar
  const reportData = {
    location: fullLocation,
    city: city,
    neighborhood: neighborhood,
    street: street,
    severity: severity,
    desc: desc,
    lat: coords.lat,
    lng: coords.lng,
    createdAt: serverTimestamp(),
    userId: auth.currentUser ? auth.currentUser.uid : null,
    photos: []
  };

  try {
    window.showNotificationToast('Enviando alerta...');
    await addDoc(collection(db, "reports"), reportData);
    
    window.showNotificationToast('Alerta enviado com sucesso!');
    toggleReportModal(false);
    document.getElementById('form-report').reset();
  } catch (error) {
    console.error("Erro ao salvar relato:", error);
    window.showNotificationToast('Erro ao enviar o alerta.');
  }
}

export function toggleReportModal(open) {
  const modal = document.getElementById('report-modal');
  if (!modal) return;
  modal.classList.toggle('modal-open', open);
  
  if (open) {
    // Se o modal abrir, podemos preencher a cidade padrão do usuário se desejado
  }
}

export function useCurrentLocation() {
  if (!navigator.geolocation) {
    window.showNotificationToast('GPS não suportado neste navegador.');
    return;
  }

  window.showNotificationToast('Obtendo sua localização atual...');
  navigator.geolocation.getCurrentPosition(position => {
    const { latitude, longitude } = position.coords;
    
    // Armazena temporariamente para o próximo submit se necessário
    window.tempUserCoords = { lat: latitude, lng: longitude };
    window.showNotificationToast('Localização obtida com sucesso via GPS!');
  }, () => {
    window.showNotificationToast('Não foi possível acessar o GPS.');
  }, { enableHighAccuracy: true });
}

window.handleReportSubmit = handleReportSubmit;
window.toggleReportModal = toggleReportModal;
window.useCurrentLocation = useCurrentLocation;