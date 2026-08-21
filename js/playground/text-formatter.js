var tfEditor = document.getElementById('tf-editor');
var tfCopy = document.getElementById('tf-copy');
var tfTabEdit = document.getElementById('tf-tab-edit');
var tfTabPreview = document.getElementById('tf-tab-preview');
var tfDrawerToggle = document.getElementById('tfDrawerToggle');
var tfDrawerClose = document.getElementById('tfDrawerClose');
var tfBackdrop = document.getElementById('tfBackdrop');
var tfDrawer = document.getElementById('tfDrawer');
var tfDrawerBody = document.getElementById('tfDrawerBody');

var originalText = '';
var formattedText = '';
var activeTab = 'edit';

var OPERATIONS = [
  { id: 'tf-trim-check', label: 'Trim whitespace', desc: 'Removes leading and trailing spaces from every line.', sampleIn: '  Hi, How are you?  ', fn: function (text) {
    return text.split('\n').map(function (l) { return l.replace(/^\s+|\s+$/g, ''); }).join('\n');
  }},
  { id: 'tf-spaces-check', label: 'Remove extra spaces', desc: 'Collapses runs of spaces into a single space.', sampleIn: 'Hi,  How are  you?', fn: function (text) {
    return text.replace(/[^\S\n]+/g, ' ');
  }},
  { id: 'tf-breaks-check', label: 'Remove line breaks', desc: 'Joins all lines into one continuous line.', sampleIn: 'Hi,\nHow are you?', fn: function (text) {
    return text.split('\n').map(function (l) { return l.replace(/^\s+|\s+$/g, ''); }).filter(function (l) { return l !== ''; }).join(' ');
  }},
  { id: 'tf-dedup-check', label: 'Deduplicate lines', desc: 'Keeps only the first copy of each repeated line.', sampleIn: 'apple\nbanana\napple', fn: function (text) {
    var seen = {};
    return text.split('\n').filter(function (l) { if (seen[l]) return false; seen[l] = true; return true; }).join('\n');
  }},
  { id: 'tf-sort-check', label: 'Sort lines', desc: 'Orders lines alphabetically; choose A→Z or Z→A.', sampleIn: 'banana\napple\ncherry', type: 'select', options: [
    { value: 'asc', text: 'A→Z' },
    { value: 'desc', text: 'Z→A' }
  ], fn: function (text, dir) {
    return text.split('\n').sort(function (a, b) { return dir === 'desc' ? b.localeCompare(a) : a.localeCompare(b); }).join('\n');
  }},
  { id: 'tf-case-check', label: 'Convert Case', desc: 'Switches letter casing: UPPERCASE, lowercase, Title Case, Sentence case, camelCase, snake_case, kebab-case.', sampleIn: 'hello world', sampleParam: 'upper', type: 'select', options: [
    { value: 'upper', text: 'UPPERCASE' },
    { value: 'lower', text: 'lowercase' },
    { value: 'title', text: 'Title Case' },
    { value: 'sentence', text: 'Sentence case' },
    { value: 'camel', text: 'camelCase' },
    { value: 'snake', text: 'snake_case' },
    { value: 'kebab', text: 'kebab-case' }
  ], fn: function (text, type) {
    if (type === 'upper') return text.toUpperCase();
    if (type === 'lower') return text.toLowerCase();
    if (type === 'title') return text.replace(/\w\S*/g, function (w) { return w.charAt(0).toUpperCase() + w.substr(1).toLowerCase(); });
    if (type === 'sentence') return text.replace(/(^|[.!?]\s+)([a-z])/g, function (m, s, l) { return s + l.toUpperCase(); });
    if (type === 'camel') {
      var words = text.toLowerCase().split(/\s+/);
      return words[0] || words.slice(1).map(function (w) { return w.charAt(0).toUpperCase() + w.substr(1); }).join('');
    }
    if (type === 'snake') return text.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    if (type === 'kebab') return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return text;
  }},
  { id: 'tf-linenums-check', label: 'Add line numbers', desc: 'Prefixes each line with its number (1., 2., 3., …).', sampleIn: 'a\nb', fn: function (text) {
    return text.split('\n').map(function (l, i) { return (i + 1) + '. ' + l; }).join('\n');
  }},
  { id: 'tf-wrap-check', label: 'Word wrap at', desc: 'Breaks lines longer than the given number of characters.', sampleIn: 'Wrap me at twelve chars please', sampleParam: 12, type: 'number', defaultValue: 80, fn: function (text, width) {
    var result = [];
    text.split('\n\n').forEach(function (para) {
      var words = para.split(/\s+/);
      var line = '';
      words.forEach(function (w) {
        if (line === '') { line = w; }
        else if (line.length + 1 + w.length <= width) { line += ' ' + w; }
        else { result.push(line); line = w; }
      });
      if (line !== '') result.push(line);
    });
    return result.join('\n');
  }}
];

function visualizeSample(text) {
  return text.replace(/ /g, '␣').replace(/\n/g, '↵');
}

function buildDrawer() {
  if (!tfDrawerBody) return;
  var html = '';
  OPERATIONS.forEach(function (op) {
    html += '<div class="tf__op">';
    html += '<label class="tf__op-main" for="' + op.id + '">';
    html += '<input type="checkbox" id="' + op.id + '" />';
    html += '<span>' + op.label + '</span>';
    if (op.type === 'select') {
      html += '<select id="' + op.id + '-select" class="tf__select" disabled>';
      op.options.forEach(function (opt) {
        html += '<option value="' + opt.value + '">' + opt.text + '</option>';
      });
      html += '</select>';
    } else if (op.type === 'number') {
      html += '<input type="number" id="' + op.id + '-width" class="tf__num-input" value="' + op.defaultValue + '" min="10" max="200" disabled />';
      html += '<span>chars</span>';
    }
    html += '</label>';
    html += '<button type="button" id="' + op.id + '-info" class="tf__info" aria-expanded="false" aria-label="About ' + op.label + '" aria-describedby="' + op.id + '-tip">';
    html += '<i class="bi bi-info-circle"></i>';
    html += '</button>';
    html += '<span id="' + op.id + '-tip" class="tf__tooltip" role="tooltip" hidden>' + op.desc;
    html += '<span class="tf__tooltip-sample">' +
      visualizeSample(op.sampleIn) + '<br>↓<br>' +
      visualizeSample(op.fn(op.sampleIn, op.sampleParam !== undefined ? op.sampleParam : null)) +
      '</span>';
    html += '</span>';
    html += '</div>';
  });
  tfDrawerBody.innerHTML = html;
}

function computeFormatted() {
  var text = originalText;
  OPERATIONS.forEach(function (op) {
    var checkbox = document.getElementById(op.id);
    if (!checkbox || !checkbox.checked) return;
    var param = null;
    if (op.type === 'select') {
      var sel = document.getElementById(op.id + '-select');
      param = sel ? sel.value : null;
    } else if (op.type === 'number') {
      var inp = document.getElementById(op.id + '-width');
      param = inp ? (parseInt(inp.value, 10) || 80) : 80;
    }
    text = op.fn(text, param);
  });
  return text;
}

function showTab(tab) {
  if (!tfTabEdit || !tfTabPreview || !tfEditor) return;
  activeTab = tab;
  if (tab === 'edit') {
    tfTabEdit.classList.add('tf__tab--active');
    tfTabPreview.classList.remove('tf__tab--active');
    tfEditor.readOnly = false;
    tfEditor.value = originalText;
  } else {
    tfTabPreview.classList.add('tf__tab--active');
    tfTabEdit.classList.remove('tf__tab--active');
    formattedText = computeFormatted();
    tfEditor.readOnly = true;
    tfEditor.value = formattedText;
  }
}

function autoFormat() {
  if (!tfEditor) return;
  if (activeTab === 'edit') {
    originalText = tfEditor.value;
  }
  formattedText = computeFormatted();
  showTab('preview');
}

function copyToClipboard() {
  if (!tfEditor || !tfCopy) return;
  var text = tfEditor.value;
  if (text === '') return;
  navigator.clipboard.writeText(text).then(function () {
    var icon = tfCopy.querySelector('i');
    if (icon) icon.className = 'bi bi-check';
    setTimeout(function () { if (icon) icon.className = 'bi bi-clipboard'; }, 1500);
  }).catch(function () {});
}

function openDrawer() {
  if (tfDrawer) tfDrawer.style.display = '';
  if (tfBackdrop) tfBackdrop.style.display = '';
  requestAnimationFrame(function () {
    if (tfDrawer) tfDrawer.classList.add('tf__drawer--open');
    if (tfBackdrop) tfBackdrop.classList.add('tf__backdrop--visible');
  });
}

function closeDrawer() {
  if (tfDrawer) tfDrawer.classList.remove('tf__drawer--open');
  if (tfBackdrop) tfBackdrop.classList.remove('tf__backdrop--visible');
  setTimeout(function () {
    if (tfDrawer) tfDrawer.style.display = 'none';
    if (tfBackdrop) tfBackdrop.style.display = 'none';
  }, 300);
}

function bindCheckboxDisabled(checkboxId, selector) {
  var checkbox = document.getElementById(checkboxId);
  var control = document.getElementById(selector);
  if (checkbox && control) {
    checkbox.addEventListener('change', function () {
      control.disabled = !this.checked;
    });
  }
}

function closeAllTooltips() {
  var tips = tfDrawerBody.querySelectorAll('.tf__tooltip');
  var infos = tfDrawerBody.querySelectorAll('.tf__info');
  var i;
  for (i = 0; i < tips.length; i++) {
    tips[i].hidden = true;
    tips[i].removeAttribute('data-pinned');
  }
  for (i = 0; i < infos.length; i++) {
    infos[i].setAttribute('aria-expanded', 'false');
  }
}

function setupTooltipRow(row) {
  var btn = row.querySelector('.tf__info');
  var tip = row.querySelector('.tf__tooltip');
  if (!btn || !tip) return;

  function show() {
    tip.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
  }

  function hideUnlessPinned() {
    if (tip.getAttribute('data-pinned') !== 'true') {
      tip.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
    }
  }

  row.addEventListener('mouseenter', show);
  row.addEventListener('mouseleave', hideUnlessPinned);
  btn.addEventListener('focus', show);
  btn.addEventListener('blur', hideUnlessPinned);
  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    var wasPinned = tip.getAttribute('data-pinned') === 'true';
    closeAllTooltips();
    if (!wasPinned) {
      tip.setAttribute('data-pinned', 'true');
      tip.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
    }
  });
}

buildDrawer();

var opRows = tfDrawerBody ? tfDrawerBody.querySelectorAll('.tf__op') : [];
for (var r = 0; r < opRows.length; r++) setupTooltipRow(opRows[r]);

OPERATIONS.forEach(function (op) {
  if (op.type === 'select') bindCheckboxDisabled(op.id, op.id + '-select');
  if (op.type === 'number') bindCheckboxDisabled(op.id, op.id + '-width');
});

tfDrawerBody.addEventListener('change', function () {
  autoFormat();
});

if (tfEditor) {
  tfEditor.addEventListener('input', function () {
    if (activeTab === 'edit') {
      originalText = tfEditor.value;
    }
  });
}

if (tfTabEdit) {
  tfTabEdit.addEventListener('click', function () {
    showTab('edit');
  });
}

if (tfTabPreview) {
  tfTabPreview.addEventListener('click', function () {
    originalText = tfEditor.value;
    showTab('preview');
  });
}

if (tfCopy) tfCopy.addEventListener('click', copyToClipboard);
if (tfDrawerToggle) tfDrawerToggle.addEventListener('click', openDrawer);
if (tfDrawerClose) tfDrawerClose.addEventListener('click', closeDrawer);
if (tfBackdrop) tfBackdrop.addEventListener('click', closeDrawer);

document.addEventListener('click', function (e) {
  if (e.target.closest && !e.target.closest('.tf__info')) {
    closeAllTooltips();
  }
});

document.addEventListener('keydown', function (e) {
  if (e.key !== 'Escape') return;
  if (tfDrawerBody && tfDrawerBody.querySelector('.tf__tooltip:not([hidden])')) {
    closeAllTooltips();
    return;
  }
  if (tfDrawer && tfDrawer.classList.contains('tf__drawer--open')) {
    closeDrawer();
  }
});
