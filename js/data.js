// js/data.js
import { db } from './firebase.js';
import { collection, onSnapshot, query } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

export let floodReports = [];

function getRelativeTime(timestamp) {
  if (!timestamp) return "Agora mesmo";

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Agora mesmo";
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `Há ${diffInMinutes} min`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `Há ${diffInHours} h`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `Há ${diffInDays} dia(s)`;
}

export function initReportsListener() {
  const reportsRef = collection(db, "reports");

  onSnapshot(reportsRef, (snapshot) => {
    const now = new Date();

    floodReports = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        location: data.location || "Local não informado",
        severity: data.severity || "moderado",
        desc: data.desc || "",
        createdAt: data.createdAt,
        time: getRelativeTime(data.createdAt),
        lat: typeof data.lat === 'number' ? data.lat : -8.055,
        lng: typeof data.lng === 'number' ? data.lng : -34.9,
        photos: data.photos || [],
        userId: data.userId || null
      };
    }).filter(report => {
      // Se por algum motivo o registro não tiver data, exibe por segurança
      if (!report.createdAt) return true;

      const reportDate = report.createdAt.toDate ? report.createdAt.toDate() : new Date(report.createdAt);
      const hoursDiff = (now - reportDate) / (1000 * 60 * 60);
      
      // Mantém apenas os registros com menos de 24 horas (você pode alterar para 12, 48, etc., se preferir)
      return hoursDiff <= 24;
    });

    window.floodReports = floodReports;

    if (typeof window.renderMapMarkers === 'function') window.renderMapMarkers();
    if (typeof window.renderFeedItems === 'function') window.renderFeedItems();
  }, (error) => {
    console.error("Erro ao escutar relatos do Firestore:", error);
  });
}

window.floodReports = floodReports;