var container = document.getElementById('trinkets-container');

if (container) {
  fetch('data/trinkets.json')
    .then(function (r) { return r.json(); })
    .then(function (trinkets) {
      var html = '';
      trinkets.forEach(function (t) {
        html += '<div class="card trinket">';

        if (t.logo) {
          html +=
            '<div class="trinket__header">' +
              '<img class="trinket__logo" src="' + t.logo + '" alt="' + t.name + ' logo" />' +
              '<h3 class="trinket__name">' + t.name + '</h3>' +
            '</div>';
        } else {
          html += '<h3 class="trinket__name" style="margin-bottom:0.5rem">' + t.name + '</h3>';
        }

        html += '<p class="trinket__desc">' + t.description + '</p>';

        html += '<div class="trinket__tags">';
        t.tags.forEach(function (tag) {
          html += '<span class="trinket__tag">' + tag + '</span>';
        });
        html += '</div>';

        html += '</div>';
      });
      container.innerHTML = html;
    });
}
