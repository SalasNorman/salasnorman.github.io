import { fetchJson } from '../lib/dom.js';

const container = document.getElementById('certificates-container');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const filterEl = document.getElementById('certificates-filter');

if (lightbox) {
  lightbox.addEventListener('click', function () {
    this.classList.remove('lightbox--open');
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') lightbox.classList.remove('lightbox--open');
  });
}

function collectTags(data) {
  const allTags = new Set();
  Object.values(data)
    .flat()
    .forEach((cert) => {
      if (cert.techStack && cert.techStack.length > 0) {
        cert.techStack.forEach((t) => allTags.add(t));
      }
      if (cert.pathway) allTags.add(cert.pathway);
    });
  return ['All'].concat(Array.from(allTags).sort());
}

function renderTags(tagItems) {
  if (tagItems.length === 0) return '';
  const tags = tagItems.map((t) => `<span class="certificate__tag">${t}</span>`).join('');
  return `<div class="certificate__tags">${tags}</div>`;
}

function renderGroups(data) {
  return Object.keys(data)
    .map((org) => {
      const certs = data[org]
        .map((cert) => {
          const tagItems = (cert.techStack || []).concat(cert.pathway ? [cert.pathway] : []);
          return `
            <div class="card certificate" data-tags="${tagItems.join(',')}">
              <img class="certificate__image" src="${cert.image}" alt="${cert.title}" loading="lazy" />
              <div class="certificate__info">
                <h4 class="certificate__name">${cert.title}</h4>
                ${renderTags(tagItems)}
              </div>
            </div>`;
        })
        .join('');

      return `
        <div class="certificates__group">
          <h3 class="certificates__org-title">${org}</h3>
          <div class="certificates__grid">${certs}</div>
        </div>`;
    })
    .join('');
}

function applyFilter(selected) {
  document.querySelectorAll('.certificate').forEach((cert) => {
    const tags = (cert.dataset.tags || '').split(',');
    cert.classList.toggle('certificate--hidden', selected !== 'All' && !tags.includes(selected));
  });
}

if (container) {
  fetchJson('data/certificates.json').then((data) => {
    if (filterEl) {
      filterEl.innerHTML = collectTags(data)
        .map(
          (tag) =>
            `<button class="certificates__filter-btn${tag === 'All' ? ' active' : ''}" data-tag="${tag}">${tag}</button>`
        )
        .join('');

      filterEl.addEventListener('click', (e) => {
        if (!e.target.classList.contains('certificates__filter-btn')) return;
        filterEl.querySelectorAll('.certificates__filter-btn').forEach((b) => b.classList.remove('active'));
        e.target.classList.add('active');
        applyFilter(e.target.dataset.tag);
      });
    }

    container.innerHTML = renderGroups(data);

    document.querySelectorAll('.certificate__image').forEach((img) => {
      img.addEventListener('click', () => {
        lightboxImg.src = img.src;
        lightbox.classList.add('lightbox--open');
      });
    });
  });
}
