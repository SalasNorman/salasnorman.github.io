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

const filterEl = document.getElementById('certificates-filter');

if (container) {
    fetch('data/certificates.json')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      // Collect unique tags
      const allTags = new Set();
      data.forEach(function (cert) {
        if (cert.techStack && cert.techStack.length > 0 && cert.techStack[0] !== '') {
          cert.techStack.forEach(function (t) { allTags.add(t); });
        }
        if (cert.pathway) allTags.add(cert.pathway);
      });
      const tagList = ['All'].concat(Array.from(allTags).sort());

      // Render filter buttons
      if (filterEl) {
        filterEl.innerHTML = tagList.map(function (tag) {
          return '<button class="certificates__filter-btn' + (tag === 'All' ? ' active' : '') + '" data-tag="' + tag + '">' + tag + '</button>';
        }).join('');
      }

      // Group by organization
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
          let tagItems = [];
          if (cert.techStack && cert.techStack.length > 0 && cert.techStack[0] !== '') {
            tagItems = tagItems.concat(cert.techStack);
          }
          if (cert.pathway) {
            tagItems.push(cert.pathway);
          }
          if (tagItems.length > 0) {
            tags = '<div class="certificate__tags">' +
              tagItems.map(function (t) {
                return '<span class="certificate__tag">' + t + '</span>';
              }).join('') + '</div>';
          }
          html += '<div class="card certificate" data-tags="' + tagItems.join(',') + '">' +
            '<img class="certificate__image" src="' + cert.image + '" alt="' + cert.title + '" loading="lazy" />' +
            '<div class="certificate__info">' +
            '<h4 class="certificate__name">' + cert.title + '</h4>' +
            tags +
            '</div></div>';
        });
        html += '</div></div>';
      });
      container.innerHTML = html;

      // Filter click handler
      if (filterEl) {
        filterEl.addEventListener('click', function (e) {
          if (!e.target.classList.contains('certificates__filter-btn')) return;
          filterEl.querySelectorAll('.certificates__filter-btn').forEach(function (b) { b.classList.remove('active'); });
          e.target.classList.add('active');
          const selected = e.target.dataset.tag;
          document.querySelectorAll('.certificate').forEach(function (cert) {
            if (selected === 'All') {
              cert.classList.remove('certificate--hidden');
            } else {
              var tags = (cert.dataset.tags || '').split(',');
              cert.classList.toggle('certificate--hidden', !tags.includes(selected));
            }
          });
        });
      }

      document.querySelectorAll('.certificate__image').forEach(function (img) {
        img.addEventListener('click', function () {
          lightboxImg.src = this.src;
          lightbox.classList.add('lightbox--open');
        });
      });
    });
}
