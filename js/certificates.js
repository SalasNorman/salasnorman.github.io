const container = document.getElementById('certificates-container');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');

if (lightbox) {
  lightbox.addEventListener('click', function () {
    this.classList.remove('lightbox--open');
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') lightbox.classList.remove('lightbox--open');
  });
}

if (container) {
  fetch('assets/data/certificates.json')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      const groups = {};
      data.forEach(function (cert) {
        const org = cert.organization || 'Other';
        if (!groups[org]) groups[org] = [];
        groups[org].push(cert);
      });

      let html = '';
      Object.keys(groups).forEach(function (org) {
        html += '<div class="certificates__group">';
        html += '<h3 class="certificates__org-title">' + org + '</h3>';
        html += '<div class="certificates__grid">';
        groups[org].forEach(function (cert) {
          let tags = '';
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

      document.querySelectorAll('.certificate__image').forEach(function (img) {
        img.addEventListener('click', function () {
          lightboxImg.src = this.src;
          lightbox.classList.add('lightbox--open');
        });
      });
    });
}
