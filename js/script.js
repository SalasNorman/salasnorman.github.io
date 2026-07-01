(function () {
  const themeToggle = document.getElementById('theme-toggle');
  const toggleIcon = document.getElementById('toggle-icon');
  const hamburger = document.getElementById('hamburger');
  const header = document.querySelector('.header');

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

  if (hamburger && header) {
    hamburger.addEventListener('click', function () {
      header.classList.toggle('nav-open');
    });
  }

  const demoBtn = document.querySelector('.project__demo-btn');
  const demoList = document.querySelector('.project__demo-list');
  const chevron = document.querySelector('.project__chevron');

  if (demoBtn && demoList) {
    demoBtn.addEventListener('click', function () {
      demoList.classList.toggle('open');
      if (chevron) chevron.classList.toggle('open');
    });
  }
})();
