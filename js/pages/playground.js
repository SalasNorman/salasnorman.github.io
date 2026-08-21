var container = document.getElementById('playground-container');

if (container) {
  fetch('data/playground.json')
    .then(function (r) { return r.json(); })
    .then(function (items) {
      var html = '';
      items.forEach(function (t) {
        html += '<div class="card playground">';

        if (t.logo) {
          html +=
            '<div class="playground__header">' +
              '<img class="playground__logo" src="' + t.logo + '" alt="' + t.name + ' logo" />' +
              '<h3 class="playground__name">' + t.name + '</h3>' +
            '</div>';
        } else {
          html += '<h3 class="playground__name" style="margin-bottom:0.5rem">' + t.name + '</h3>';
        }

        html += '<p class="playground__desc">' + t.description + '</p>';

        html += '<div class="playground__tags">';
        t.tags.forEach(function (tag) {
          html += '<span class="playground__tag">' + tag + '</span>';
        });
        html += '</div>';

        if (t.url) {
          html += '<a href="' + t.url + '" class="playground__open-btn">Open</a>';
        }

        html += '</div>';
      });
      container.innerHTML = html;
    });
}
