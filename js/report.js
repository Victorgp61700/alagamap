// Abre/Fecha o Modal de Reportar
function toggleReportModal(show) {
  document.getElementById('report-modal')?.classList.toggle('modal-open', show);
}

// Preenche o campo de localização com as coordenadas GPS
function useCurrentLocation() {
  if (!navigator.geolocation) return showNotificationToast('GPS não disponível.');
  
  navigator.geolocation.getCurrentPosition(position => {
    document.getElementById('input-location').value = `GPS (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`;
    showNotificationToast('Coordenadas inseridas!');
  }, () => showNotificationToast('Não foi possível acessar o GPS.'), { enableHighAccuracy: true, timeout: 10000 });
}

// Envio do Formulário de Reporte
function handleReportSubmit(event) {
  event.preventDefault();
  const location = document.getElementById('input-location').value.trim();
  const severity = document.querySelector('input[name="severity"]:checked');
  if (!location || !severity) return;

  const description = document.getElementById('input-desc').value.trim() || 'Sem detalhes adicionais.';
  const file = document.getElementById('input-photo').files[0];

  const report = {
    id: Date.now(),
    location: location,
    severity: severity.value,
    desc: description,
    time: 'Agora mesmo',
    lat: -8.055 + (Math.random() - .5) * .04,
    lng: -34.9 + (Math.random() - .5) * .04,
    photos: []
  };

  const finish = () => {
    floodReports.unshift(report);
    renderMapMarkers();
    renderFeedItems();
    toggleReportModal(false);
    document.getElementById('form-report').reset();
    showNotificationToast('Alerta adicionado nesta sessão.');
  };

  if (!file) return finish();
  if (!file.type.startsWith('image/')) return showNotificationToast('Selecione uma imagem válida.');
  if (file.size > 6 * 1024 * 1024) return showNotificationToast('A imagem deve ter no máximo 6 MB.');

  const reader = new FileReader();
  reader.onload = () => {
    report.photos.push(reader.result);
    finish();
  };
  reader.onerror = () => showNotificationToast('Erro ao carregar a foto.');
  reader.readAsDataURL(file);
}

// Modal de Detalhes da Rua
function openStreetDetails(id) {
  const report = floodReports.find(item => item.id === id);
  if (!report) return;

  document.getElementById('street-title').textContent = report.location;
  document.getElementById('street-desc').textContent = report.desc;
  document.getElementById('street-time').textContent = `Atualização: ${report.time} · Gravidade: ${report.severity.toUpperCase()}`;
  document.getElementById('maps-link').href = googleMapsUrl(report);
  document.getElementById('streetview-link').href = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${report.lat},${report.lng}`;

  const photosBox = document.getElementById('street-photos');
  photosBox.replaceChildren();

  report.photos.forEach(src => {
    const image = document.createElement('img');
    image.src = src;
    image.alt = 'Foto do alagamento';
    image.className = 'w-full h-32 object-cover rounded-xl';
    photosBox.appendChild(image);
  });

  document.getElementById('photo-count').textContent = report.photos.length ? `${report.photos.length} foto(s)` : '';
  document.getElementById('no-photos').classList.toggle('hidden', report.photos.length > 0);
  document.getElementById('street-modal').classList.add('modal-open');
}

function closeStreetModal() {
  document.getElementById('street-modal')?.classList.remove('modal-open');
}