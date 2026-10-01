// Procura o formulário na página
const form = document.querySelector('.meu-formulario');


// Quando alguém clicar em enviar...
form.addEventListener('submit', function(event) {
  event.preventDefault(); // Impede a página de recarregar
  alert('✅ Cadastro enviado com sucesso! (Parabénssss, tá liberado!)');
});