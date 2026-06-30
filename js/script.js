(function () {
  const themeToggle = document.getElementById('theme-toggle');
  const toggleIcon = document.getElementById('toggle-icon');

  function setTheme(theme) {
    document.body.classList.toggle('light', theme === 'light');
    if (toggleIcon) {
      toggleIcon.className = theme === 'light' ? 'bi bi-moon' : 'bi bi-sun';
    }
    localStorage.setItem('theme', theme);
  }

  function getPreferredTheme() {
    const stored = localStorage.getItem('theme');
    if (stored) return stored;
    if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
    return 'dark';
  }

  setTheme(getPreferredTheme());

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      const next = document.body.classList.contains('light') ? 'dark' : 'light';
      setTheme(next);
    });
  }
})();
