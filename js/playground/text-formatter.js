var tfEditor = document.getElementById('tf-editor');
var tfCopy = document.getElementById('tf-copy');
var tfTabEdit = document.getElementById('tf-tab-edit');
var tfTabPreview = document.getElementById('tf-tab-preview');
var tfDrawerToggle = document.getElementById('tfDrawerToggle');
var tfDrawerClose = document.getElementById('tfDrawerClose');
var tfBackdrop = document.getElementById('tfBackdrop');
var tfDrawer = document.getElementById('tfDrawer');
var tfDrawerBody = document.getElementById('tfDrawerBody');
var tfChipsFonts = document.getElementById('tfChipsFonts');
var tfChipsDeco = document.getElementById('tfChipsDeco');

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
  }},
  { id: 'tf-font-bold', label: 'Bold', ui: 'chip', kind: 'font', glyph: '𝐁', fn: makeFontFn('bold') },
  { id: 'tf-font-italic', label: 'Italic', ui: 'chip', kind: 'font', glyph: '𝐼', fn: makeFontFn('italic') },
  { id: 'tf-font-bolditalic', label: 'Bold Italic', ui: 'chip', kind: 'font', glyph: '𝘽', fn: makeFontFn('boldItalic') },
  { id: 'tf-font-sans', label: 'Sans', ui: 'chip', kind: 'font', glyph: '𝖲', fn: makeFontFn('sans') },
  { id: 'tf-font-sansbold', label: 'Sans Bold', ui: 'chip', kind: 'font', glyph: '𝗦', fn: makeFontFn('sansBold') },
  { id: 'tf-font-mono', label: 'Monospace', ui: 'chip', kind: 'font', glyph: '𝙼', fn: makeFontFn('mono') },
  { id: 'tf-under-chip', label: 'Underline', ui: 'chip', kind: 'deco', icon: 'bi-type-underline', fn: underlineText },
  { id: 'tf-strike-chip', label: 'Strikethrough', ui: 'chip', kind: 'deco', icon: 'bi-type-strikethrough', fn: strikeText },
  { id: 'tf-zalgo-chip', label: 'Zalgo text', ui: 'chip', kind: 'deco', icon: 'bi-virus', control: 'range', rangeMin: 1, rangeMax: 15, rangeValue: 6, fn: zalgoText }
];

function visualizeSample(text) {
  return text.replace(/ /g, '␣').replace(/\n/g, '↵');
}

var FONT_RANGES = {
  bold: { upper: 0x1D400, lower: 0x1D41A, digits: 0x1D7CE },
  italic: { upper: 0x1D434, lower: 0x1D44E },
  boldItalic: { upper: 0x1D468, lower: 0x1D482 },
  sans: { upper: 0x1D5A0, lower: 0x1D5BA, digits: 0x1D7E2 },
  sansBold: { upper: 0x1D5D4, lower: 0x1D5EE, digits: 0x1D7EC },
  mono: { upper: 0x1D670, lower: 0x1D68A, digits: 0x1D7F6 }
};

function makeFontFn(style) {
  return function (text) {
    var range = FONT_RANGES[style];
    var out = '';
    var i;
    var code;
    for (i = 0; i < text.length; i++) {
      if (style === 'italic' && text[i] === 'h') { out += '\u210E'; continue; }
      code = text.charCodeAt(i);
      if (code >= 65 && code <= 90) {
        out += String.fromCodePoint(range.upper + code - 65);
      } else if (code >= 97 && code <= 122) {
        out += String.fromCodePoint(range.lower + code - 97);
      } else if (range.digits && code >= 48 && code <= 57) {
        out += String.fromCodePoint(range.digits + code - 48);
      } else {
        out += text[i];
      }
    }
    return out;
  };
}

function underlineText(text) {
  return Array.from(text).join('\u0332');
}

function strikeText(text) {
  return Array.from(text).join('\u0336');
}

var ZALGO_RANGES = [
  [0x0300, 0x0314], [0x033D, 0x0344], [0x0346, 0x034F],
  [0x0333, 0x0338],
  [0x0316, 0x0329], [0x032C, 0x0331]
];

function randomZalgoMark() {
  var r = ZALGO_RANGES[Math.floor(Math.random() * ZALGO_RANGES.length)];
  return String.fromCodePoint(r[0] + Math.floor(Math.random() * (r[1] - r[0] + 1)));
}

function zalgoText(text, maxMarks) {
  var chars = Array.from(text);
  var out = '';
  var i;
  var j;
  var count;
  for (i = 0; i < chars.length; i++) {
    out += chars[i];
    if (/\s/.test(chars[i])) continue;
    count = 1 + Math.floor(Math.random() * maxMarks);
    for (j = 0; j < count; j++) out += randomZalgoMark();
  }
  return out;
}

function buildDrawer() {
  if (!tfDrawerBody) return;
  var html = '';
  OPERATIONS.forEach(function (op) {
    if (op.ui === 'chip') return;
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

function buildChips() {
  if (!tfChipsFonts || !tfChipsDeco) return;
  var fontsHtml = '';
  var decoHtml = '';
  OPERATIONS.forEach(function (op) {
    if (op.ui !== 'chip') return;
    var inner = op.glyph ? op.glyph : '<i class="bi ' + op.icon + '"></i>';
    var chip = '<button type="button" id="' + op.id + '" class="tf__chip" aria-pressed="false" aria-label="' + op.label + '" title="' + op.label + '">' + inner + '</button>';
    if (op.kind === 'font') {
      fontsHtml += chip;
    } else {
      decoHtml += chip;
      if (op.control === 'range') {
        decoHtml += '<input type="range" id="' + op.id + '-range" class="tf__range" min="' + op.rangeMin + '" max="' + op.rangeMax + '" value="' + op.rangeValue + '" hidden />';
      }
    }
  });
  tfChipsFonts.innerHTML = fontsHtml;
  tfChipsDeco.innerHTML = decoHtml;
}

function computeFormatted() {
  var text = originalText;
  OPERATIONS.forEach(function (op) {
    var param = null;
    if (op.ui === 'chip') {
      if (!op.active) return;
      if (op.control === 'range') {
        var slider = document.getElementById(op.id + '-range');
        param = slider ? (parseInt(slider.value, 10) || op.rangeValue) : op.rangeValue;
      }
      text = op.fn(text, param);
      return;
    }
    var checkbox = document.getElementById(op.id);
    if (!checkbox || !checkbox.checked) return;
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
buildChips();

var opRows = tfDrawerBody ? tfDrawerBody.querySelectorAll('.tf__op') : [];
for (var r = 0; r < opRows.length; r++) setupTooltipRow(opRows[r]);

OPERATIONS.forEach(function (op) {
  if (op.type === 'select') bindCheckboxDisabled(op.id, op.id + '-select');
  if (op.type === 'number') bindCheckboxDisabled(op.id, op.id + '-width');
});

function syncChipUI() {
  OPERATIONS.forEach(function (op) {
    if (op.ui !== 'chip') return;
    var el = document.getElementById(op.id);
    if (!el) return;
    el.classList.toggle('tf__chip--on', !!op.active);
    el.setAttribute('aria-pressed', op.active ? 'true' : 'false');
    if (op.control === 'range') {
      var slider = document.getElementById(op.id + '-range');
      if (slider) slider.hidden = !op.active;
    }
  });
}

function toggleChip(chipId) {
  var target = null;
  OPERATIONS.forEach(function (op) {
    if (op.id === chipId && op.ui === 'chip') target = op;
  });
  if (!target) return;
  if (target.kind === 'font') {
    var wasActive = !!target.active;
    OPERATIONS.forEach(function (op) {
      if (op.kind === 'font') op.active = false;
    });
    target.active = !wasActive;
  } else {
    target.active = !target.active;
  }
  syncChipUI();
  autoFormat();
}

function bindChipEvents(container) {
  if (!container) return;
  container.addEventListener('click', function (e) {
    var chip = e.target.closest ? e.target.closest('.tf__chip') : null;
    if (!chip) return;
    toggleChip(chip.id);
  });
  container.addEventListener('change', function () {
    autoFormat();
  });
}

bindChipEvents(tfChipsFonts);
bindChipEvents(tfChipsDeco);

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
