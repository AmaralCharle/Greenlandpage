// Menu Mobile
export function setupMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const authButtons = document.querySelector('.auth-buttons');
  if (menuToggle && navLinks && authButtons) {
    menuToggle.addEventListener('click', function () {
      navLinks.classList.toggle('active');
      authButtons.classList.toggle('active');
    });
  }
}

// Detalhes das trilhas
export function toggleDetalhes(id) {
  const detalhes = document.getElementById(id);
  const btn = detalhes ? detalhes.previousElementSibling : null;
  if (!detalhes || !btn) return;
  detalhes.classList.toggle('detalhes-ativo');
  if (detalhes.classList.contains('detalhes-ativo')) {
    btn.innerHTML = '<i class="fas fa-chevron-up"></i> Ocultar detalhes';
  } else {
    btn.innerHTML = '<i class="fas fa-chevron-down"></i> Ver detalhes';
  }
}

// Modal functions
export function openModal(type) {
  const modal = document.getElementById(type + 'Modal');
  if (modal) modal.style.display = 'flex';
}

export function closeModal(type) {
  const modal = document.getElementById(type + 'Modal');
  if (modal) modal.style.display = 'none';
}

export function switchToRegister() {
  closeModal('login');
  openModal('register');
}

export function switchToLogin() {
  closeModal('register');
  openModal('login');
}
