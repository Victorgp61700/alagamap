// Dados Iniciais dos Pontos de Alagamento em Recife
const floodReports = [
  { id: 1, location: 'Av. Agamenon Magalhães — Derby', severity: 'grave', desc: 'Água na altura do pneu. Trânsito parado no sentido Boa Viagem.', time: 'Há 5 min', lat: -8.0581, lng: -34.8943, photos: [] },
  { id: 2, location: 'Rua do Espinheiro — Espinheiro', severity: 'moderado', desc: 'Acúmulo de água no meio-fio; carros altos conseguem passar.', time: 'Há 12 min', lat: -8.044, lng: -34.8961, photos: [] },
  { id: 3, location: 'Avenida Caxangá — Zequinha', severity: 'grave', desc: 'Ponto crítico sob o viaduto. Evite a área.', time: 'Há 25 min', lat: -8.049, lng: -34.922, photos: [] },
  { id: 4, location: 'Estrada dos Remédios — Afogados', severity: 'leve', desc: 'Pequenos pontos de alagamento, trânsito fluindo devagar.', time: 'Há 40 min', lat: -8.0735, lng: -34.908, photos: [] }
];

// Perguntas do Quiz de Segurança
const quizQuestions = [
  {
    q: "O que você deve fazer ao se deparar com uma rua alagada enquanto dirige?",
    options: ["Acelerar para passar rápido", "Dar a volta e procurar uma rota alternativa segura", "Engatar a primeira marcha e avançar mesmo sem ver o chão", "Parar no meio da água e esperar abaixar"],
    answer: 1,
    explanation: "Nunca tente atravessar pontos de alagamento se não conseguir ver o solo. Procure rotas alternativas."
  },
  {
    q: "Qual é o número de emergência da Defesa Civil em Recife?",
    options: ["190", "192", "193", "199"],
    answer: 3,
    explanation: "O número correto da Defesa Civil é 199. Guarde este número para emergências em dias de fortes chuvas."
  },
  {
    q: "Ao caminhar em áreas alagadas, qual é o principal risco invisível?",
    options: ["Insectos voadores", "Bueiros abertos, fiação energizada e contaminação da água", "Perder os sapatos", "Chuva forte"],
    answer: 1,
    explanation: "A água pode esconder bueiros sem tampa, buracos e fiação elétrica caída, além de transmitir doenças como leptospirose."
  }
];