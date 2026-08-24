function setTheme(theme) {
  document.body.classList.toggle('light', theme === 'light');
  document.querySelectorAll('.theme-toggle-icon').forEach((icon) => {
    icon.className = theme === 'light' ? 'bi bi-moon theme-toggle-icon' : 'bi bi-sun theme-toggle-icon';
  });
  localStorage.setItem('theme', theme);
}

function getPreferredTheme() {
  const stored = localStorage.getItem('theme');
  if (stored) return stored;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

const themeToggles = document.querySelectorAll('[data-theme-toggle]');
setTheme(getPreferredTheme());

themeToggles.forEach((btn) => {
  btn.addEventListener('click', () => {
    setTheme(document.body.classList.contains('light') ? 'dark' : 'light');
  });
});
