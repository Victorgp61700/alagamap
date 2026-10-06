let currentQuizIndex = 0;
let quizScore = 0;

function toggleQuiz(show) {
  const modal = document.getElementById('quiz-modal');
  if (!modal) return;
  modal.classList.toggle('modal-open', show);
  if (show && currentQuizIndex === 0) loadQuizQuestion();
}

function loadQuizQuestion() {
  const q = quizQuestions[currentQuizIndex];
  if (!q) return renderQuizFinished();

  document.getElementById('quiz-count').textContent = `Questão ${currentQuizIndex + 1} de ${quizQuestions.length}`;
  document.getElementById('quiz-score').textContent = `Acertos: ${quizScore}`;
  document.getElementById('quiz-progress-fill').style.width = `${((currentQuizIndex + 1) / quizQuestions.length) * 100}%`;
  document.getElementById('quiz-question').textContent = q.q;
  document.getElementById('quiz-feedback').textContent = '';
  document.getElementById('quiz-next').disabled = true;
  document.getElementById('quiz-restart').classList.add('hidden');
  document.getElementById('quiz-next').classList.remove('hidden');

  const optionsBox = document.getElementById('quiz-options');
  optionsBox.replaceChildren();

  q.options.forEach((optText, index) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option';
    btn.textContent = optText;
    btn.onclick = () => selectQuizAnswer(index);
    optionsBox.appendChild(btn);
  });
}

function selectQuizAnswer(selectedIndex) {
  const q = quizQuestions[currentQuizIndex];
  const buttons = document.querySelectorAll('#quiz-options .quiz-option');

  buttons.forEach((btn, index) => {
    btn.disabled = true;
    if (index === q.answer) btn.classList.add('correct');
    else if (index === selectedIndex) btn.classList.add('incorrect');
  });

  if (selectedIndex === q.answer) {
    quizScore++;
    document.getElementById('quiz-feedback').textContent = '✨ Correto! ' + q.explanation;
    document.getElementById('quiz-feedback').className = 'min-h-6 mt-3 text-sm font-semibold text-emerald-400';
  } else {
    document.getElementById('quiz-feedback').textContent = '❌ Incorreto. ' + q.explanation;
    document.getElementById('quiz-feedback').className = 'min-h-6 mt-3 text-sm font-semibold text-rose-400';
  }

  document.getElementById('quiz-score').textContent = `Acertos: ${quizScore}`;
  document.getElementById('quiz-next').disabled = false;
}

function nextQuizQuestion() {
  currentQuizIndex++;
  if (currentQuizIndex < quizQuestions.length) loadQuizQuestion();
  else renderQuizFinished();
}

function renderQuizFinished() {
  document.getElementById('quiz-count').textContent = 'Quiz concluído!';
  document.getElementById('quiz-progress-fill').style.width = '100%';
  document.getElementById('quiz-question').textContent = `Parabéns! Você acertou ${quizScore} de ${quizQuestions.length} perguntas.`;
  document.getElementById('quiz-options').replaceChildren();
  document.getElementById('quiz-feedback').textContent = 'Manter-se informado sobre a prevenção de alagamentos ajuda a salvar vidas!';
  document.getElementById('quiz-feedback').className = 'min-h-6 mt-3 text-sm font-semibold text-teal-300';
  document.getElementById('quiz-next').classList.add('hidden');
  document.getElementById('quiz-restart').classList.remove('hidden');
}

function restartQuiz() {
  currentQuizIndex = 0;
  quizScore = 0;
  loadQuizQuestion();
}