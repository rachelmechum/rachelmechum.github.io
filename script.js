const root = document.documentElement;
const themeButtons = document.querySelectorAll('.swatch');
const savedTheme = localStorage.getItem('rachel-theme') || 'cosmic';

function setTheme(theme) {
  if (theme === 'cosmic') {
    root.removeAttribute('data-theme');
  } else {
    root.dataset.theme = theme;
  }
  themeButtons.forEach((button) => {
    const isActive = button.dataset.theme === theme;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
  localStorage.setItem('rachel-theme', theme);
}

themeButtons.forEach((button) => button.addEventListener('click', () => setTheme(button.dataset.theme)));
setTheme(savedTheme);

const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
menuToggle.addEventListener('click', () => {
  const isOpen = siteNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.textContent = isOpen ? 'Close' : 'Menu';
});

siteNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  siteNav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.textContent = 'Menu';
}));

document.querySelector('#year').textContent = new Date().getFullYear();
