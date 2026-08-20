var NAV_ITEMS = [
  ['Home', 'index.html'],
  ['Resume', 'resume.html'],
  ['Projects', 'projects.html'],
  ['Playground', 'playground.html'],
  ['Certificates', 'certificates.html']
];

function getBase() {
  var parts = location.pathname.split('/');
  parts.pop();
  var base = '';
  for (var i = 1; i < parts.length; i++) {
    base += '../';
  }
  return base;
}

function getCurrentTarget() {
  var path = location.pathname;
  if (path.indexOf('/playground/') !== -1) return 'playground.html';
  var page = path.substring(path.lastIndexOf('/') + 1);
  if (page === '') page = 'index.html';
  return page;
}

function buildHeader() {
  var base = getBase();
  var current = getCurrentTarget();
  var html = '';

  html += '<a href="' + base + 'index.html" class="header__logo">';
  html += '<img src="' + base + 'assets/images/favicon.png" alt="" class="header__logo-icon" />';
  html += 'SalasNorman';
  html += '</a>';

  html += '<nav class="header__nav">';
  html += '<div class="header__nav-links">';
  NAV_ITEMS.forEach(function (item) {
    var isActive = item[1] === current;
    html += '<a href="' + base + item[1] + '"' +
      (isActive ? ' class="active" aria-current="page"' : '') +
      '>' + item[0] + '</a>';
  });
  html += '</div>';
  html += '<button id="theme-toggle" class="theme-toggle" aria-label="Toggle theme">';
  html += '<i id="toggle-icon" class="bi bi-sun"></i>';
  html += '</button>';
  html += '<button class="hamburger" id="hamburger" aria-label="Menu">';
  html += '<i class="bi bi-list"></i>';
  html += '</button>';
  html += '</nav>';

  return html;
}

var headerEl = document.getElementById('site-header');
var footerEl = document.getElementById('site-footer');

if (headerEl) {
  headerEl.innerHTML = buildHeader();

  var hamburger = document.getElementById('hamburger');
  if (hamburger) {
    hamburger.addEventListener('click', function () {
      var isOpen = headerEl.classList.toggle('nav-open');
      hamburger.setAttribute('aria-expanded', isOpen);
    });
  }
}

if (footerEl) {
  footerEl.innerHTML = '&copy; SalasNorman';
}
