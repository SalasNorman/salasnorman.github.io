import { fetchJson } from '../lib/dom.js';

const container = document.getElementById('playground-container');

if (container) {
  fetchJson('data/playground.json').then((tools) => {
    const cards = tools
      .map((t) => {
        const header = t.logo
          ? `
            <div class="playground__header">
              <img class="playground__logo" src="${t.logo}" alt="${t.name} logo" />
              <h3 class="playground__name">${t.name}</h3>
            </div>`
          : `<h3 class="playground__name playground__name--standalone">${t.name}</h3>`;

        const tags = t.tags.map((tag) => `<span class="playground__tag">${tag}</span>`).join('');
        const openBtn = t.url ? `<a href="${t.url}" class="playground__open-btn push-btn">Open</a>` : '';

        return `
          <div class="card playground">
            ${header}
            <p class="playground__desc">${t.description}</p>
            <div class="playground__tags">${tags}</div>
            ${openBtn}
          </div>`;
      })
      .join('');

    container.innerHTML = cards;
  });
}
