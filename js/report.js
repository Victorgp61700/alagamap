// js/report.js

import { db } from './firebase.js';
import { collection, addDoc, deleteDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { auth } from './firebase.js';

let tempCoords = null;

export async function handleReportSubmit(e) {
  e.preventDefault();
  
  const city = document.getElementById('input-city').value;
  const neighborhood = document.getElementById('input-neighborhood').value.trim();
  const street = document.getElementById('input-street').value.trim();
  const number = document.getElementById('input-number').value.trim();
  const severity = document.querySelector('input[name="severity"]:checked')?.value || 'moderado';
  const desc = document.getElementById('input-desc').value.trim();
  
  const fullLocationText = `${street}${number ? ', ' + number : ''} - ${neighborhood}, ${city}`;
  
  const queryAddress = number 
    ? `${street}, ${number}, ${neighborhood}, ${city}, Pernambuco, Brasil`
    : `${street}, ${neighborhood}, ${city}, Pernambuco, Brasil`;

  window.showNotificationToast('Buscando coordenada exata do endereço...');

  let lat = -8.055; // Fallback padrão
  let lng = -34.9;

  if (tempCoords) {
    lat = tempCoords.lat;
    lng = tempCoords.lng;
    tempCoords = null;
  } else {
    try {
      let response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryAddress)}&limit=1&addressdetails=1`);
      let data = await response.json();
      
      if (data && data.length > 0) {
        lat = parseFloat(data[0].lat);
        lng = parseFloat(data[0].lon);
      } else if (number) {
        const fallbackQuery = `${street}, ${neighborhood}, ${city}, Pernambuco, Brasil`;
        response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fallbackQuery)}&limit=1`);
        data = await response.json();
        
        if (data && data.length > 0) {
          lat = parseFloat(data[0].lat);
          lng = parseFloat(data[0].lon);
        }
      }
    } catch (err) {
      console.error("Erro na geocodificação:", err);
    }
  }

  const reportData = {
    location: fullLocationText,
    city: city,
    neighborhood: neighborhood,
    street: street,
    severity: severity,
    desc: desc,
    lat: lat,
    lng: lng,
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

export async function deleteReport(reportId) {
  if (!confirm('Deseja realmente excluir este relato?')) return;

  try {
    await deleteDoc(doc(db, "reports", reportId));
    window.showNotificationToast('Relato excluído com sucesso!');
  } catch (error) {
    console.error("Erro ao excluir relato:", error);
    window.showNotificationToast('Erro ao excluir o relato.');
  }
}

export function toggleReportModal(open) {
  const modal = document.getElementById('report-modal');
  if (!modal) return;
  modal.classList.toggle('modal-open', open);
}

export function useCurrentLocation() {
  if (!navigator.geolocation) {
    window.showNotificationToast('GPS não suportado neste navegador.');
    return;
  }

  window.showNotificationToast('Obtendo sua localização atual...');
  navigator.geolocation.getCurrentPosition(position => {
    const { latitude, longitude } = position.coords;
    tempCoords = { lat: latitude, lng: longitude };
    window.showNotificationToast('Localização obtida com sucesso via GPS!');
  }, () => {
    window.showNotificationToast('Não foi possível acessar o GPS.');
  }, { enableHighAccuracy: true });
}

window.handleReportSubmit = handleReportSubmit;
window.deleteReport = deleteReport;
window.toggleReportModal = toggleReportModal;
window.useCurrentLocation = useCurrentLocation;