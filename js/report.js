
import { db, auth } from './firebase.js';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  doc, 
  deleteDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
export function toggleReportModal(show) {
  document.getElementById('report-modal')?.classList.toggle('modal-open', show);
}

export function useCurrentLocation() {
  if (!navigator.geolocation) return window.showNotificationToast('GPS não disponível.');
  
  navigator.geolocation.getCurrentPosition(position => {
    const lat = position.coords.latitude.toFixed(4);
    const lng = position.coords.longitude.toFixed(4);
    
    const streetInput = document.getElementById('input-street');
    if (streetInput) streetInput.value = `Ponto GPS (${lat}, ${lng})`;
    
    window.showNotificationToast('Coordenadas obtidas pelo GPS!');
  }, () => window.showNotificationToast('Não foi possível acessar o GPS.'), { enableHighAccuracy: true, timeout: 10000 });
}

export async function handleReportSubmit(event) {
  event.preventDefault();
  
  const currentUser = auth.currentUser;
  if (!currentUser) {
    return window.showNotificationToast('Você precisa estar logado para reportar.');
  }

  const city = document.getElementById('input-city').value;
  const neighborhood = document.getElementById('input-neighborhood').value.trim();
  const street = document.getElementById('input-street').value.trim();
  const number = document.getElementById('input-number').value.trim();
  const severity = document.querySelector('input[name="severity"]:checked');

  if (!city || !neighborhood || !street || !severity) {
    return window.showNotificationToast('Preencha os campos obrigatórios de endereço.');
  }

  const numText = number ? `, ${number}` : '';
  const locationFormatted = `${street}${numText}, ${neighborhood} — ${city}`;
  const description = document.getElementById('input-desc').value.trim() || 'Sem detalhes adicionais.';
  const file = document.getElementById('input-photo').files[0];

  const saveReportToFirebase = async (photoBase64 = null) => {
    const reportData = {
      location: locationFormatted,
      severity: severity.value,
      desc: description,
      lat: -8.055 + (Math.random() - .5) * .04,
      lng: -34.9 + (Math.random() - .5) * .04,
      photos: photoBase64 ? [photoBase64] : [],
      userId: currentUser.uid, // Associa o registro ao ID do usuário do Firebase Auth
      createdAt: serverTimestamp()
    };

    try {
      await addDoc(collection(db, "reports"), reportData);
      toggleReportModal(false);
      document.getElementById('form-report').reset();
      window.showNotificationToast('Alerta cadastrado com sucesso!');
    } catch (error) {
      console.error("Erro ao salvar no Firebase:", error);
      window.showNotificationToast('Erro ao salvar no banco de dados.');
    }
  };

  if (!file) {
    await saveReportToFirebase();
    return;
  }

  if (!file.type.startsWith('image/')) return window.showNotificationToast('Selecione uma imagem válida.');
  if (file.size > 6 * 1024 * 1024) return window.showNotificationToast('A imagem deve ter no máximo 6 MB.');

  const reader = new FileReader();
  reader.onload = async () => {
    await saveReportToFirebase(reader.result);
  };
  reader.onerror = () => window.showNotificationToast('Erro ao carregar a foto.');
  reader.readAsDataURL(file);
}

// Função para excluir um relato cadastrado pelo próprio usuário
export async function deleteReport(reportId) {
  if (!confirm('Deseja realmente remover este alerta? Utilize isso apenas se o local não estiver mais alagado.')) {
    return;
  }

  try {
    await deleteDoc(doc(db, "reports", reportId));
    window.showNotificationToast('Alerta removido com sucesso!');
  } catch (error) {
    console.error("Erro ao remover o relato:", error);
    window.showNotificationToast('Não foi possível excluir o registro.');
  }
}

export function openStreetDetails(id) {
  const reports = window.floodReports || [];
  const report = reports.find(item => item.id === id);
  if (!report) return;

  document.getElementById('street-title').textContent = report.location;
  document.getElementById('street-desc').textContent = report.desc;
  document.getElementById('street-time').textContent = `Atualização: ${report.time} · Gravidade: ${report.severity.toUpperCase()}`;
  
  if (typeof window.googleMapsUrl === 'function') {
    document.getElementById('maps-link').href = window.googleMapsUrl(report);
  }
  document.getElementById('streetview-link').href = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${report.lat},${report.lng}`;

  const photosBox = document.getElementById('street-photos');
  photosBox.replaceChildren();

  (report.photos || []).forEach(src => {
    const image = document.createElement('img');
    image.src = src;
    image.alt = 'Foto do alagamento';
    image.className = 'w-full h-32 object-cover rounded-xl';
    photosBox.appendChild(image);
  });

  const photoCount = (report.photos || []).length;
  document.getElementById('photo-count').textContent = photoCount ? `${photoCount} foto(s)` : '';
  document.getElementById('no-photos').classList.toggle('hidden', photoCount > 0);
  document.getElementById('street-modal').classList.add('modal-open');
}

// ... (todo o resto do código do report.js que você já colocou)

export function closeStreetModal() {
  document.getElementById('street-modal')?.classList.remove('modal-open');
}

// Garante que fiquem disponíveis globalmente para o HTML e para os modais
window.toggleReportModal = toggleReportModal;
window.useCurrentLocation = useCurrentLocation;
window.handleReportSubmit = handleReportSubmit;
window.deleteReport = deleteReport;
window.openStreetDetails = openStreetDetails;
window.closeStreetModal = closeStreetModal;