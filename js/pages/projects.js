import { fetchJson } from '../lib/dom.js';

const container = document.getElementById('projects-container');

const ICONS = {
  download:
    '<svg class="project__btn-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path fill="currentColor" d="M4 22q-.825 0-1.412-.587T2 20V4q0-.825.588-1.412T4 2h8l6 6v4.25h-2V9h-5V4H4v16h11v2zm0-2V4zm1-1q.1-1.225.75-2.25t1.7-1.625l-.95-1.7q0-.025.1-.375q.125-.05.238-.05t.162.125l.975 1.75q.5-.2 1-.312T10 14.45t1.025.113t1 .312l.975-1.75l.375-.1q.125.05.15.175t-.025.225l-.95 1.7q1.05.6 1.7 1.625T15 19zm3.1-1.65q.15-.15.15-.35t-.15-.35t-.35-.15t-.35.15t-.15.35t.15.35t.35.15t.35-.15m4.5 0q.15-.15.15-.35t-.15-.35t-.35-.15t-.35.15t-.15.35t.15.35t.35.15t.35-.15M20 22l-4-4l1.4-1.425L19 18.15V14h2v4.15l1.6-1.575L24 18z"/></svg>',
  github:
    '<svg class="project__btn-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path fill="currentColor" d="M12.001 2c-5.525 0-10 4.475-10 10a9.99 9.99 0 0 0 6.837 9.488c.5.087.688-.213.688-.476c0-.237-.013-1.024-.013-1.862c-2.512.463-3.162-.612-3.362-1.175c-.113-.288-.6-1.175-1.025-1.413c-.35-.187-.85-.65-.013-.662c.788-.013 1.35.725 1.538 1.025c.9 1.512 2.337 1.087 2.912.825c.088-.65.35-1.087.638-1.337c-2.225-.25-4.55-1.113-4.55-4.938c0-1.088.387-1.987 1.025-2.687c-.1-.25-.45-1.275.1-2.65c0 0 .837-.263 2.75 1.024a9.3 9.3 0 0 1 2.5-.337c.85 0 1.7.112 2.5.337c1.913-1.3 2.75-1.024 2.75-1.024c.55 1.375.2 2.4.1 2.65c.637.7 1.025 1.587 1.025 2.687c0 3.838-2.337 4.688-4.562 4.938c.362.312.675.912.675 1.85c0 1.337-.013 2.412-.013 2.75c0 .262.188.574.688.474A10.02 10.02 0 0 0 22 12c0-5.525-4.475-10-10-10"/></svg>',
  demo:
    '<svg class="project__btn-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path fill="currentColor" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2M4 9h10.5v3.5H4zm0 5.5h10.5V18H4zM20 18h-3.5V9H20z"/></svg>'
};

function iconSVG(type) {
  return ICONS[type] || '';
}

if (container) {
  fetchJson('data/projects.json').then((projects) => {
    const cards = projects
      .map((p) => {
        const header = p.logo
          ? `
            <div class="project__header">
              <img class="project__logo" src="${p.logo}" alt="${p.name} logo" />
              <h3 class="project__name">${p.name}</h3>
            </div>`
          : `<h3 class="project__name project__name--standalone">${p.name}</h3>`;

        const tags = p.tags.map((t) => `<span class="project__tag">${t}</span>`).join('');

        const actions = p.actions
          .map(
            (a) =>
              `<a href="${a.url}" target="_blank" rel="noopener" class="project__button">${iconSVG(a.icon)}${a.label}</a>`
          )
          .join('');

        const demoButton =
          p.demos.length > 0
            ? `<button class="project__button project__demo-btn">${iconSVG('demo')}Live Demo<i class="bi bi-chevron-down project__chevron"></i></button>`
            : '';

        const demoList =
          p.demos.length > 0
            ? `
            <div class="project__demo-list">
              ${p.demos.map((d) => `<a href="${d.url}" target="_blank" rel="noopener">${d.label}</a>`).join('')}
            </div>`
            : '';

        return `
          <div class="card project">
            ${header}
            <p class="project__desc">${p.description}</p>
            <div class="project__tags">${tags}</div>
            <div class="project__actions">${demoButton}${actions}</div>
            ${demoList}
          </div>`;
      })
      .join('');

    container.innerHTML = cards;
  });

  container.addEventListener('click', (e) => {
    const btn = e.target.closest('.project__demo-btn');
    if (!btn) return;
    const list = btn.parentElement.nextElementSibling;
    const chevron = btn.querySelector('.project__chevron');
    if (list && list.classList.contains('project__demo-list')) {
      list.classList.toggle('open');
      if (chevron) chevron.classList.toggle('open');
    }
  });
}
