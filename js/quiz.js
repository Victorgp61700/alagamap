const quizQuestions = [
  {
    question: "O que deve fazer se a água de um alagamento atingir a altura do pneu do veículo?",
    options: [
      "Acelerar para passar o mais rápido possível.",
      "Não tentar atravessar, retornar ou procurar um local alto e seguro.",
      "Ligar o ar-condicionado e continuar devagar.",
      "Subir na calçada e seguir em frente."
    ],
    answer: 1,
    explanation: "Água na altura do pneu já pode fazer o veículo perder a aderência e ser arrastado pela correnteza."
  },
  {
    question: "Qual o número de emergência da Defesa Civil para reportar riscos ou pedir socorro em Pernambuco?",
    options: [
      "190",
      "192",
      "199",
      "193"
    ],
    answer: 2,
    explanation: "O 199 é o telefone direto da Defesa Civil para emergências de alagamentos e deslizamentos."
  },
  {
    question: "Por que não é recomendável andar a pé em vias alagadas?",
    options: [
      "Apenas para não molhar as roupas.",
      "Risco de choque elétrico, infecções (como leptospirose) e queda em bueiros abertos.",
      "Não há perigo, desde que esteja de botas de borracha.",
      "Porque a água da chuva é sempre purificada."
    ],
    answer: 1,
    explanation: "A água da enchente esconde bueiros sem tampa, fiação elétrica caída e carrega bactérias graves."
  },
  {
    question: "Em caso de tempestade forte com risco de alagamento na sua residência, o que deve fazer primeiro?",
    options: [
      "Desligar o disjuntor geral de energia e o registro de gás.",
      "Abrir todas as janelas para ventilar a casa.",
      "Lavar o quintal para desobstruir a água.",
      "Subir no telhado imediatamente."
    ],
    answer: 0,
    explanation: "Desligar a energia e o gás previne curtos-circuitos, choques elétricos e acidentes graves."
  },
  {
    question: "Se o seu carro desligar no meio de uma área alagada com água subindo, qual a atitude correta?",
    options: [
      "Tentar dar a partida várias vezes até o motor ligar.",
      "Ficar dentro do carro fechado esperando a água baixar.",
      "Abandonar o veículo imediatamente e ir para um local alto e seguro.",
      "Empurrar o carro sozinho contra a correnteza."
    ],
    answer: 2,
    explanation: "O nível da água pode subir rapidamente. A prioridade é sempre salvar a sua vida e sair do veículo."
  }
];

let currentQuizIndex = 0;
let quizScore = 0;
let selectedOption = null;

function toggleQuiz(show) {
  const modal = document.getElementById('quiz-modal');
  if (!modal) return;

  if (show) {
    currentQuizIndex = 0;
    quizScore = 0;
    modal.classList.add('modal-open');
    loadQuizQuestion();
  } else {
    modal.classList.remove('modal-open');
  }
}

function loadQuizQuestion() {
  selectedOption = null;
  const q = quizQuestions[currentQuizIndex];

  // Atualiza indicadores de progresso
  document.getElementById('quiz-count').textContent = `Questão ${currentQuizIndex + 1} de ${quizQuestions.length}`;
  document.getElementById('quiz-score').textContent = `Acertos: ${quizScore}`;
  
  const progressPercent = ((currentQuizIndex + 1) / quizQuestions.length) * 100;
  document.getElementById('quiz-progress-fill').style.width = `${progressPercent}%`;

  // Renderiza pergunta
  document.getElementById('quiz-question').textContent = q.question;

  // Renderiza opções
  const optionsBox = document.getElementById('quiz-options');
  optionsBox.innerHTML = '';

  q.options.forEach((optText, index) => {
    const btn = document.createElement('button');
    btn.className = 'w-full text-left p-3 rounded-xl bg-[#12171e] hover:bg-[#232d38] border border-[#2d3748] text-xs sm:text-sm transition flex items-center gap-2';
    btn.onclick = () => selectQuizOption(index, btn);
    btn.innerHTML = `<span class="w-6 h-6 rounded-full bg-[#232d38] flex items-center justify-center text-xs font-bold shrink-0">${String.fromCharCode(65 + index)}</span> <span>${optText}</span>`;
    optionsBox.appendChild(btn);
  });

  // Limpa feedback e ajusta botões
  document.getElementById('quiz-feedback').textContent = '';
  document.getElementById('quiz-next').disabled = true;
  document.getElementById('quiz-next').classList.remove('hidden');
  document.getElementById('quiz-restart').classList.add('hidden');
}

function selectQuizOption(index, buttonEl) {
  if (selectedOption !== null) return; // Evita troca após responder
  selectedOption = index;

  const q = quizQuestions[currentQuizIndex];
  const allButtons = document.getElementById('quiz-options').children;

  if (index === q.answer) {
    quizScore++;
    buttonEl.classList.add('bg-emerald-900/40', 'border-emerald-500', 'text-emerald-300');
    document.getElementById('quiz-feedback').innerHTML = `<span class="text-emerald-400">✓ Correto!</span> ${q.explanation}`;
  } else {
    buttonEl.classList.add('bg-rose-900/40', 'border-rose-500', 'text-rose-300');
    allButtons[q.answer].classList.add('bg-emerald-900/40', 'border-emerald-500', 'text-emerald-300');
    document.getElementById('quiz-feedback').innerHTML = `<span class="text-rose-400">✕ Incorreto.</span> ${q.explanation}`;
  }

  document.getElementById('quiz-score').textContent = `Acertos: ${quizScore}`;
  document.getElementById('quiz-next').disabled = false;
}

function nextQuizQuestion() {
  currentQuizIndex++;

  if (currentQuizIndex < quizQuestions.length) {
    loadQuizQuestion();
  } else {
    // Fim do Quiz
    document.getElementById('quiz-question').textContent = '🎉 Quiz Concluído!';
    document.getElementById('quiz-options').innerHTML = `
      <div class="text-center py-6 bg-[#12171e] rounded-xl border border-[#2d3748]">
        <p class="text-2xl font-bold text-[#3b9ee4] mb-2">${quizScore} / ${quizQuestions.length}</p>
        <p class="text-xs text-slate-300">${quizScore >= 4 ? 'Excelente! Estás bem preparado para enfrentar situações de risco.' : 'Bom treino! Revisa as dicas de segurança para se proteger ainda melhor.'}</p>
      </div>
    `;
    document.getElementById('quiz-feedback').textContent = '';
    document.getElementById('quiz-next').classList.add('hidden');
    document.getElementById('quiz-restart').classList.remove('hidden');
  }
}

function restartQuiz() {
  currentQuizIndex = 0;
  quizScore = 0;
  loadQuizQuestion();
}