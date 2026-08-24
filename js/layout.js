const NAV_ITEMS = [
  ['Home', 'index.html'],
  ['Resume', 'resume.html'],
  ['Projects', 'projects.html'],
  ['Playground', 'playground.html'],
  ['Certificates', 'certificates.html']
];

function getBase() {
  const parts = location.pathname.split('/');
  parts.pop();
  let base = '';
  for (let i = 1; i < parts.length; i++) {
    base += '../';
  }
  return base;
}

function getCurrentTarget() {
  const path = location.pathname;
  if (path.indexOf('/playground/') !== -1) return 'playground.html';
  let page = path.substring(path.lastIndexOf('/') + 1);
  if (page === '') page = 'index.html';
  return page;
}

function buildHeader() {
  const base = getBase();
  const current = getCurrentTarget();

  const links = NAV_ITEMS
    .map(([label, target]) => {
      const isActive = target === current;
      return `<a href="${base}${target}"${isActive ? ' class="active" aria-current="page"' : ''}>${label}</a>`;
    })
    .join('');

  return (
    `<a href="${base}index.html" class="header__logo">` +
    `<img src="${base}assets/images/favicon.png" alt="" class="header__logo-icon" />` +
    'SalasNorman' +
    '</a>' +
    '<nav class="header__nav">' +
    `<div class="header__nav-links">${links}</div>` +
    '<button id="theme-toggle" class="theme-toggle push-btn" data-theme-toggle aria-label="Toggle theme">' +
    '<i class="bi bi-sun theme-toggle-icon"></i>' +
    '</button>' +
    '<button class="hamburger push-btn" id="hamburger" aria-label="Menu">' +
    '<i class="bi bi-list"></i>' +
    '</button>' +
    '</nav>'
  );
}

const headerEl = document.getElementById('site-header');
const footerEl = document.getElementById('site-footer');

if (headerEl) {
  headerEl.innerHTML = buildHeader();

  const hamburger = document.getElementById('hamburger');
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      const isOpen = headerEl.classList.toggle('nav-open');
      hamburger.setAttribute('aria-expanded', isOpen);
    });
  }
}

if (footerEl) {
  footerEl.innerHTML = '&copy; SalasNorman';
}
