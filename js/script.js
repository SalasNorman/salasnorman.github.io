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

  /* Certificates page */
  var container = document.getElementById('certificates-container');
  if (container) {
    fetch('assets/data/certificates.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var groups = {};
        data.forEach(function (cert) {
          var org = cert.organization || 'Other';
          if (!groups[org]) groups[org] = [];
          groups[org].push(cert);
        });

        var html = '';
        Object.keys(groups).forEach(function (org) {
          html += '<div class="certificates__group">';
          html += '<h3 class="certificates__org-title">' + org + '</h3>';
          html += '<div class="certificates__grid">';
          groups[org].forEach(function (cert) {
            var tags = '';
            if (cert.techStack && cert.techStack.length > 0 && cert.techStack[0] !== '') {
              tags = '<div class="certificate__tags">' +
                cert.techStack.map(function (t) {
                  return '<span class="certificate__tag">' + t + '</span>';
                }).join('') + '</div>';
            }
            html += '<div class="certificate">' +
              '<img class="certificate__image" src="' + cert.image + '" alt="' + cert.title + '" loading="lazy" />' +
              '<div class="certificate__info">' +
              '<h4 class="certificate__name">' + cert.title + '</h4>' +
              tags +
              '</div></div>';
          });
          html += '</div></div>';
        });
        container.innerHTML = html;

        /* Lightbox triggers */
        document.querySelectorAll('.certificate__image').forEach(function (img) {
          img.addEventListener('click', function () {
            lightboxImg.src = this.src;
            lightbox.classList.add('lightbox--open');
          });
        });
      });
  }

  /* Lightbox */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightbox-img');
  if (lightbox) {
    lightbox.addEventListener('click', function () {
      this.classList.remove('lightbox--open');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') lightbox.classList.remove('lightbox--open');
    });
  }
})();
