// Abre/Fecha o Modal de Reportar
function toggleReportModal(show) {
  document.getElementById('report-modal')?.classList.toggle('modal-open', show);
}

// Preenche os campos caso o usuário escolha o GPS
function useCurrentLocation() {
  if (!navigator.geolocation) return showNotificationToast('GPS não disponível.');
  
  navigator.geolocation.getCurrentPosition(position => {
    const lat = position.coords.latitude.toFixed(4);
    const lng = position.coords.longitude.toFixed(4);
    
    // Preenche o campo de rua com as coordenadas GPS
    const streetInput = document.getElementById('input-street');
    if (streetInput) streetInput.value = `Ponto GPS (${lat}, ${lng})`;
    
    showNotificationToast('Coordenadas obtidas pelo GPS!');
  }, () => showNotificationToast('Não foi possível acessar o GPS.'), { enableHighAccuracy: true, timeout: 10000 });
}

// Envio do Formulário de Reporte
function handleReportSubmit(event) {
  event.preventDefault();
  
  const city = document.getElementById('input-city').value;
  const neighborhood = document.getElementById('input-neighborhood').value.trim();
  const street = document.getElementById('input-street').value.trim();
  const number = document.getElementById('input-number').value.trim();
  const severity = document.querySelector('input[name="severity"]:checked');

  if (!city || !neighborhood || !street || !severity) {
    return showNotificationToast('Preencha os campos obrigatórios de endereço.');
  }

  // Formata o texto final para exibição nos cards
  const numText = number ? `, ${number}` : '';
  const locationFormatted = `${street}${numText}, ${neighborhood} — ${city}`;

  const description = document.getElementById('input-desc').value.trim() || 'Sem detalhes adicionais.';
  const file = document.getElementById('input-photo').files[0];

  const report = {
    id: Date.now(),
    location: locationFormatted,
    severity: severity.value,
    desc: description,
    time: 'Agora mesmo',
    lat: -8.055 + (Math.random() - .5) * .04,
    lng: -34.9 + (Math.random() - .5) * .04,
    photos: []
  };

  const finish = () => {
    floodReports.unshift(report);
    if (typeof renderMapMarkers === 'function') renderMapMarkers();
    if (typeof renderFeedItems === 'function') renderFeedItems();
    
    toggleReportModal(false);
    document.getElementById('form-report').reset();
    showNotificationToast('Alerta cadastrado com sucesso!');
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
  
  if (typeof googleMapsUrl === 'function') {
    document.getElementById('maps-link').href = googleMapsUrl(report);
  }
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