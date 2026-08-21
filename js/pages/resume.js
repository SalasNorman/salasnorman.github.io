import { fetchJson } from '../lib/dom.js';

const educationContainer = document.getElementById('resume-education');
const experienceContainer = document.getElementById('resume-experience');
const skillsContainer = document.getElementById('resume-skills');

if (educationContainer || experienceContainer || skillsContainer) {
  fetchJson('data/resume.json').then((data) => {
    if (educationContainer) {
      educationContainer.innerHTML =
        '<div class="card resume__container">' +
          '<section class="resume__section">' +
            '<h2 class="resume__section-title">' +
              '<img src="assets/icons/boxicons--education.svg" alt="" width="18" height="18" />Education' +
            '</h2>' +
            '<div class="resume__entry">' +
              '<div class="resume__entry-header">' +
                `<span class="resume__entry-title">${data.education.degree}</span>` +
                `<span class="resume__entry-date">${data.education.years}</span>` +
              '</div>' +
              `<p class="resume__entry-detail">${data.education.institution} \u2014 ${data.education.details}</p>` +
            '</div>' +
          '</section>' +
        '</div>';
    }

    if (experienceContainer) {
      const entries = data.experience
        .map(
          (exp) => `
            <div class="resume__entry">
              <div class="resume__entry-header">
                <span class="resume__entry-title">${exp.company}</span>
                <span class="resume__entry-date">${exp.dates}</span>
              </div>
              <p class="resume__entry-role">${exp.role}</p>
              <ul class="resume__entry-list">
                ${exp.highlights.map((h) => `<li>${h}</li>`).join('')}
              </ul>
            </div>`
        )
        .join('');

      experienceContainer.innerHTML =
        '<div class="card resume__container">' +
          '<section class="resume__section">' +
            '<h2 class="resume__section-title">' +
              '<img src="assets/icons/mdi--work-outline.svg" alt="" width="18" height="18" />Experience' +
            '</h2>' +
            entries +
          '</section>' +
        '</div>';
    }

    if (skillsContainer) {
      const groups = data.skills
        .map(
          (sk) => `
            <div class="resume__skill-group">
              <span class="resume__skill-label">${sk.category}:</span>
              <ul class="resume__skill-list">
                ${sk.items.map((item) => `<li>${item}</li>`).join('')}
              </ul>
            </div>`
        )
        .join('');

      skillsContainer.innerHTML =
        '<div class="card resume__container">' +
          '<section class="resume__section">' +
            '<h2 class="resume__section-title">' +
              '<img src="assets/icons/game-icons--skills.svg" alt="" width="18" height="18" />Skills' +
            '</h2>' +
            groups +
          '</section>' +
        '</div>';
    }
  });
}
