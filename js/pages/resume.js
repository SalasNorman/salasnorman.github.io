const educationContainer = document.getElementById('resume-education');
const experienceContainer = document.getElementById('resume-experience');
const skillsContainer = document.getElementById('resume-skills');

fetch('data/resume.json')
  .then(function (r) { return r.json(); })
  .then(function (data) {
    if (educationContainer) {
      educationContainer.innerHTML =
        '<div class="card resume__container">' +
          '<section class="resume__section">' +
            '<h2 class="resume__section-title">' +
              '<img src="assets/icons/boxicons--education.svg" alt="" width="18" height="18" />Education' +
            '</h2>' +
            '<div class="resume__entry">' +
              '<div class="resume__entry-header">' +
                '<span class="resume__entry-title">' + data.education.degree + '</span>' +
                '<span class="resume__entry-date">' + data.education.years + '</span>' +
              '</div>' +
              '<p class="resume__entry-detail">' + data.education.institution + ' \u2014 ' + data.education.details + '</p>' +
            '</div>' +
          '</section>' +
        '</div>';
    }

    if (experienceContainer) {
      var html = '<div class="card resume__container">' +
        '<section class="resume__section">' +
          '<h2 class="resume__section-title">' +
            '<img src="assets/icons/mdi--work-outline.svg" alt="" width="18" height="18" />Experience' +
          '</h2>';
      data.experience.forEach(function (exp) {
        html +=
          '<div class="resume__entry">' +
            '<div class="resume__entry-header">' +
              '<span class="resume__entry-title">' + exp.company + '</span>' +
              '<span class="resume__entry-date">' + exp.dates + '</span>' +
            '</div>' +
            '<p class="resume__entry-role">' + exp.role + '</p>' +
            '<ul class="resume__entry-list">';
        exp.highlights.forEach(function (h) {
          html += '<li>' + h + '</li>';
        });
        html += '</ul></div>';
      });
      html += '</section></div>';
      experienceContainer.innerHTML = html;
    }

    if (skillsContainer) {
      var html = '<div class="card resume__container">' +
        '<section class="resume__section">' +
          '<h2 class="resume__section-title">' +
            '<img src="assets/icons/game-icons--skills.svg" alt="" width="18" height="18" />Skills' +
          '</h2>';
      data.skills.forEach(function (sk) {
        html +=
          '<div class="resume__skill-group">' +
            '<span class="resume__skill-label">' + sk.category + ':</span>' +
            '<ul class="resume__skill-list">';
        sk.items.forEach(function (item) {
          html += '<li>' + item + '</li>';
        });
        html += '</ul></div>';
      });
      html += '</section></div>';
      skillsContainer.innerHTML = html;
    }
  });
