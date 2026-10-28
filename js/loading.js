// Esconde a tela de carregamento após a página carregar
window.addEventListener('load', () => {
  const loadingScreen = document.getElementById('loading-screen');
  
  setTimeout(() => {
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 500);
  }, 1000); // 1 segundo de espera
});