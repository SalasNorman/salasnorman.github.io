const tfEditor = document.getElementById('tf-editor');
const tfCopy = document.getElementById('tf-copy');
const tfTabEdit = document.getElementById('tf-tab-edit');
const tfTabPreview = document.getElementById('tf-tab-preview');
const tfDrawerToggle = document.getElementById('tf-drawer-toggle');
const tfDrawerClose = document.getElementById('tf-drawer-close');
const tfBackdrop = document.getElementById('tf-backdrop');
const tfDrawer = document.getElementById('tf-drawer');
const tfDrawerBody = document.getElementById('tf-drawer-body');
const tfFontSelect = document.getElementById('tf-font');
const tfChipsDeco = document.getElementById('tf-chips-deco');

let originalText = '';
let formattedText = '';
let activeTab = 'edit';

const FONT_RANGES = {
  bold: { upper: 0x1d400, lower: 0x1d41a, digits: 0x1d7ce },
  italic: { upper: 0x1d434, lower: 0x1d44e },
  boldItalic: { upper: 0x1d468, lower: 0x1d482 },
  sansBold: { upper: 0x1d5d4, lower: 0x1d5ee, digits: 0x1d7ec },
  sansItalic: { upper: 0x1d608, lower: 0x1d622 },
  sansBoldItalic: { upper: 0x1d63c, lower: 0x1d656 },
  mono: { upper: 0x1d670, lower: 0x1d68a, digits: 0x1d7f6 }
};

function makeFontFn(style) {
  return (text) => {
    const range = FONT_RANGES[style];
    let out = '';
    for (let i = 0; i < text.length; i++) {
      if (style === 'italic' && text[i] === 'h') {
        out += '\u210E';
        continue;
      }
      const code = text.charCodeAt(i);
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

const CJK_LETTERFORM = {
  A: '丹', B: '乃', C: '匚', D: '刀', E: 'モ', F: '下', G: 'ム', H: '卄', I: '工', J: '丿',
  K: 'ㄑ', L: 'ㄥ', M: '爪', N: '力', O: '口', P: 'ㄗ', Q: '囚', R: '尺', S: 'ち', T: '匕',
  U: 'し', V: 'レ', W: '山', X: '㐅', Y: 'ソ', Z: '乙',
  0: 'ㄖ', 1: '丨', 2: '己', 3: 'ヨ', 4: 'ㄐ', 5: '丂', 6: '石', 7: 'ワ', 8: '曰', 9: 'ㄢ'
};

function cjkText(text) {
  return Array.from(text.toUpperCase())
    .map((ch) => CJK_LETTERFORM[ch] || ch)
    .join('');
}

const ZALGO_RANGES = [
  [0x0300, 0x0314],
  [0x033d, 0x0344],
  [0x0346, 0x034f],
  [0x0333, 0x0338],
  [0x0316, 0x0329],
  [0x032c, 0x0331]
];

function randomZalgoMark() {
  const r = ZALGO_RANGES[Math.floor(Math.random() * ZALGO_RANGES.length)];
  return String.fromCodePoint(r[0] + Math.floor(Math.random() * (r[1] - r[0] + 1)));
}

function zalgoText(text, maxMarks) {
  const chars = Array.from(text);
  let out = '';
  for (let i = 0; i < chars.length; i++) {
    out += chars[i];
    if (/\s/.test(chars[i])) continue;
    const count = 1 + Math.floor(Math.random() * maxMarks);
    for (let j = 0; j < count; j++) out += randomZalgoMark();
  }
  return out;
}

function visualizeSample(text) {
  return text.replace(/ /g, '\u2423').replace(/\n/g, '\u21B5');
}

const OPERATIONS = [
  {
    id: 'tf-trim-check',
    label: 'Trim whitespace',
    desc: 'Removes leading and trailing spaces from every line.',
    sampleIn: '  Hi, How are you?  ',
    fn: (text) => text.split('\n').map((l) => l.replace(/^\s+|\s+$/g, '')).join('\n')
  },
  {
    id: 'tf-spaces-check',
    label: 'Remove extra spaces',
    desc: 'Collapses runs of spaces into a single space.',
    sampleIn: 'Hi,  How are  you?',
    fn: (text) => text.replace(/[^\S\n]+/g, ' ')
  },
  {
    id: 'tf-breaks-check',
    label: 'Remove line breaks',
    desc: 'Joins all lines into one continuous line.',
    sampleIn: 'Hi,\nHow are you?',
    fn: (text) => text.split('\n').map((l) => l.replace(/^\s+|\s+$/g, '')).filter((l) => l !== '').join(' ')
  },
  {
    id: 'tf-dedup-check',
    label: 'Deduplicate lines',
    desc: 'Keeps only the first copy of each repeated line.',
    sampleIn: 'apple\nbanana\napple',
    fn: (text) => {
      const seen = {};
      return text.split('\n').filter((l) => {
        if (seen[l]) return false;
        seen[l] = true;
        return true;
      }).join('\n');
    }
  },
  {
    id: 'tf-sort-check',
    label: 'Sort lines',
    desc: 'Orders lines alphabetically; choose A\u2192Z or Z\u2192A.',
    sampleIn: 'banana\napple\ncherry',
    type: 'select',
    options: [
      { value: 'asc', text: 'A\u2192Z' },
      { value: 'desc', text: 'Z\u2192A' }
    ],
    fn: (text, dir) =>
      text.split('\n').sort((a, b) => (dir === 'desc' ? b.localeCompare(a) : a.localeCompare(b))).join('\n')
  },
  {
    id: 'tf-case-check',
    label: 'Convert Case',
    desc: 'Switches letter casing: UPPERCASE, lowercase, Title Case, Sentence case, camelCase, snake_case, kebab-case.',
    sampleIn: 'hello world',
    sampleParam: 'upper',
    type: 'select',
    options: [
      { value: 'upper', text: 'UPPERCASE' },
      { value: 'lower', text: 'lowercase' },
      { value: 'title', text: 'Title Case' },
      { value: 'sentence', text: 'Sentence case' },
      { value: 'camel', text: 'camelCase' },
      { value: 'snake', text: 'snake_case' },
      { value: 'kebab', text: 'kebab-case' }
    ],
    fn: (text, type) => {
      if (type === 'upper') return text.toUpperCase();
      if (type === 'lower') return text.toLowerCase();
      if (type === 'title') {
        return text.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase());
      }
      if (type === 'sentence') {
        return text.replace(/(^|[.!?]\s+)([a-z])/g, (m, s, l) => s + l.toUpperCase());
      }
      if (type === 'camel') {
        const words = text.toLowerCase().split(/\s+/);
        return words[0] || words.slice(1).map((w) => w.charAt(0).toUpperCase() + w.substr(1)).join('');
      }
      if (type === 'snake') return text.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      if (type === 'kebab') return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      return text;
    }
  },
  {
    id: 'tf-linenums-check',
    label: 'Add line numbers',
    desc: 'Prefixes each line with its number (1., 2., 3., \u2026).',
    sampleIn: 'a\nb',
    fn: (text) => text.split('\n').map((l, i) => `${i + 1}. ${l}`).join('\n')
  },
  {
    id: 'tf-wrap-check',
    label: 'Word wrap at',
    desc: 'Breaks lines longer than the given number of characters.',
    sampleIn: 'Wrap me at twelve chars please',
    sampleParam: 12,
    type: 'number',
    defaultValue: 80,
    fn: (text, width) => {
      const result = [];
      text.split('\n\n').forEach((para) => {
        const words = para.split(/\s+/);
        let line = '';
        words.forEach((w) => {
          if (line === '') {
            line = w;
          } else if (line.length + 1 + w.length <= width) {
            line += ` ${w}`;
          } else {
            result.push(line);
            line = w;
          }
        });
        if (line !== '') result.push(line);
      });
      return result.join('\n');
    }
  },
  { id: 'tf-font-bold', label: 'Serif Bold', ui: 'chip', kind: 'font', glyph: '𝐁', fn: makeFontFn('bold') },
  { id: 'tf-font-italic', label: 'Serif Italic', ui: 'chip', kind: 'font', glyph: '𝐼', fn: makeFontFn('italic') },
  { id: 'tf-font-bolditalic', label: 'Serif Bold Italic', ui: 'chip', kind: 'font', glyph: '𝘽', fn: makeFontFn('boldItalic') },
  { id: 'tf-font-mono', label: 'Monospace', ui: 'chip', kind: 'font', glyph: '𝙼', fn: makeFontFn('mono') },
  { id: 'tf-font-sansbold', label: 'Sans Bold', ui: 'chip', kind: 'font', glyph: '𝗦', fn: makeFontFn('sansBold') },
  { id: 'tf-font-sansitalic', label: 'Sans Italic', ui: 'chip', kind: 'font', glyph: '𝘚', fn: makeFontFn('sansItalic') },
  { id: 'tf-font-sansbolditalic', label: 'Sans Bold Italic', ui: 'chip', kind: 'font', glyph: '𝙎', fn: makeFontFn('sansBoldItalic') },
  { id: 'tf-font-cjk', label: 'CJK Letterform', ui: 'chip', kind: 'font', glyph: '丹', fn: cjkText },
  { id: 'tf-under-chip', label: 'Underline', ui: 'chip', kind: 'deco', icon: 'bi-type-underline', fn: underlineText },
  { id: 'tf-strike-chip', label: 'Strikethrough', ui: 'chip', kind: 'deco', icon: 'bi-type-strikethrough', fn: strikeText },
  {
    id: 'tf-zalgo-chip',
    label: 'Zalgo text',
    ui: 'chip',
    kind: 'deco',
    icon: 'bi-virus',
    control: 'range',
    rangeMin: 1,
    rangeMax: 15,
    rangeValue: 6,
    fn: zalgoText
  }
];

function buildDrawer() {
  if (!tfDrawerBody) return;
  const rows = OPERATIONS.filter((op) => op.ui !== 'chip').map((op) => {
    let control = '';
    if (op.type === 'select') {
      const options = op.options.map((opt) => `<option value="${opt.value}">${opt.text}</option>`).join('');
      control = `<select id="${op.id}-select" class="tf__select" disabled>${options}</select>`;
    } else if (op.type === 'number') {
      control =
        `<input type="number" id="${op.id}-width" class="tf__num-input" value="${op.defaultValue}" min="10" max="200" disabled />` +
        '<span>chars</span>';
    }

    const sampleOut = op.fn(op.sampleIn, op.sampleParam !== undefined ? op.sampleParam : null);

    return (
      `<div class="tf__op">` +
      `<label class="tf__op-main" for="${op.id}">` +
      `<input type="checkbox" id="${op.id}" />` +
      `<span>${op.label}</span>` +
      control +
      '</label>' +
      `<button type="button" id="${op.id}-info" class="tf__info" aria-expanded="false" aria-label="About ${op.label}" aria-describedby="${op.id}-tip">` +
      '<i class="bi bi-info-circle"></i>' +
      '</button>' +
      `<span id="${op.id}-tip" class="tf__tooltip" role="tooltip" hidden>${op.desc}` +
      '<span class="tf__tooltip-sample">' +
      `${visualizeSample(op.sampleIn)}<br>\u2193<br>` +
      `${visualizeSample(sampleOut)}` +
      '</span>' +
      '</span>' +
      '</div>'
    );
  });

  tfDrawerBody.innerHTML = rows.join('');
}

function buildFontSelect() {
  if (!tfFontSelect) return;
  const fonts = OPERATIONS.filter((op) => op.kind === 'font');
  tfFontSelect.innerHTML = ['<option value="">None</option>']
    .concat(fonts.map((op) => `<option value="${op.id}">${op.glyph} ${op.label}</option>`))
    .join('');
}

function buildChips() {
  if (!tfChipsDeco) return;
  let decoHtml = '';
  OPERATIONS.forEach((op) => {
    if (op.ui !== 'chip' || op.kind !== 'deco') return;
    const inner = op.glyph || `<i class="bi ${op.icon}"></i>`;
    decoHtml +=
      `<button type="button" id="${op.id}" class="tf__chip" aria-pressed="false" aria-label="${op.label}" title="${op.label}">${inner}</button>`;
    if (op.control === 'range') {
      decoHtml +=
        `<input type="range" id="${op.id}-range" class="tf__range" min="${op.rangeMin}" max="${op.rangeMax}" value="${op.rangeValue}" hidden />`;
    }
  });
  tfChipsDeco.innerHTML = decoHtml;
}

function computeFormatted() {
  let text = originalText;
  OPERATIONS.forEach((op) => {
    let param = null;
    if (op.ui === 'chip') {
      if (!op.active) return;
      if (op.control === 'range') {
        const slider = document.getElementById(`${op.id}-range`);
        param = slider ? parseInt(slider.value, 10) || op.rangeValue : op.rangeValue;
      }
      text = op.fn(text, param);
      return;
    }
    const checkbox = document.getElementById(op.id);
    if (!checkbox || !checkbox.checked) return;
    if (op.type === 'select') {
      const sel = document.getElementById(`${op.id}-select`);
      param = sel ? sel.value : null;
    } else if (op.type === 'number') {
      const inp = document.getElementById(`${op.id}-width`);
      param = inp ? parseInt(inp.value, 10) || 80 : 80;
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
  const text = tfEditor.value;
  if (text === '') return;
  navigator.clipboard.writeText(text).then(() => {
    const icon = tfCopy.querySelector('i');
    if (icon) icon.className = 'bi bi-check';
    setTimeout(() => {
      if (icon) icon.className = 'bi bi-copy';
    }, 1500);
  }).catch(() => {});
}

function openDrawer() {
  if (tfDrawer) tfDrawer.hidden = false;
  if (tfBackdrop) tfBackdrop.hidden = false;
  requestAnimationFrame(() => {
    if (tfDrawer) tfDrawer.classList.add('tf__drawer--open');
    if (tfBackdrop) tfBackdrop.classList.add('tf__backdrop--visible');
  });
}

function closeDrawer() {
  if (tfDrawer) tfDrawer.classList.remove('tf__drawer--open');
  if (tfBackdrop) tfBackdrop.classList.remove('tf__backdrop--visible');
  setTimeout(() => {
    if (tfDrawer) tfDrawer.hidden = true;
    if (tfBackdrop) tfBackdrop.hidden = true;
  }, 300);
}

function bindCheckboxDisabled(checkboxId, selectorId) {
  const checkbox = document.getElementById(checkboxId);
  const control = document.getElementById(selectorId);
  if (checkbox && control) {
    checkbox.addEventListener('change', (e) => {
      control.disabled = !e.target.checked;
    });
  }
}

function closeAllTooltips() {
  tfDrawerBody.querySelectorAll('.tf__tooltip').forEach((tip) => {
    tip.hidden = true;
    tip.removeAttribute('data-pinned');
  });
  tfDrawerBody.querySelectorAll('.tf__info').forEach((info) => {
    info.setAttribute('aria-expanded', 'false');
  });
}

function setupTooltipRow(row) {
  const btn = row.querySelector('.tf__info');
  const tip = row.querySelector('.tf__tooltip');
  if (!btn || !tip) return;

  const show = () => {
    tip.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
  };

  const hideUnlessPinned = () => {
    if (tip.getAttribute('data-pinned') !== 'true') {
      tip.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
    }
  };

  row.addEventListener('mouseenter', show);
  row.addEventListener('mouseleave', hideUnlessPinned);
  btn.addEventListener('focus', show);
  btn.addEventListener('blur', hideUnlessPinned);
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const wasPinned = tip.getAttribute('data-pinned') === 'true';
    closeAllTooltips();
    if (!wasPinned) {
      tip.setAttribute('data-pinned', 'true');
      tip.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
    }
  });
}

buildDrawer();
buildFontSelect();
buildChips();

if (tfDrawerBody) {
  tfDrawerBody.querySelectorAll('.tf__op').forEach((row) => setupTooltipRow(row));

  OPERATIONS.forEach((op) => {
    if (op.type === 'select') bindCheckboxDisabled(op.id, `${op.id}-select`);
    if (op.type === 'number') bindCheckboxDisabled(op.id, `${op.id}-width`);
  });

  tfDrawerBody.addEventListener('change', () => autoFormat());
}

function syncChipUI() {
  if (tfFontSelect) {
    const activeFont = OPERATIONS.find((op) => op.kind === 'font' && op.active);
    tfFontSelect.value = activeFont ? activeFont.id : '';
  }
  OPERATIONS.forEach((op) => {
    if (op.ui !== 'chip') return;
    const el = document.getElementById(op.id);
    if (!el) return;
    el.classList.toggle('tf__chip--on', !!op.active);
    el.setAttribute('aria-pressed', op.active ? 'true' : 'false');
    if (op.control === 'range') {
      const slider = document.getElementById(`${op.id}-range`);
      if (slider) slider.hidden = !op.active;
    }
  });
}

function toggleChip(chipId) {
  const target = OPERATIONS.find((op) => op.id === chipId && op.ui === 'chip');
  if (!target) return;
  target.active = !target.active;
  syncChipUI();
  autoFormat();
}

function bindChipEvents(chipsContainer) {
  if (!chipsContainer) return;
  chipsContainer.addEventListener('click', (e) => {
    const chip = e.target.closest ? e.target.closest('.tf__chip') : null;
    if (!chip) return;
    toggleChip(chip.id);
  });
  chipsContainer.addEventListener('change', () => autoFormat());
}

if (tfFontSelect) {
  tfFontSelect.addEventListener('change', () => {
    OPERATIONS.forEach((op) => {
      if (op.kind === 'font') op.active = false;
    });
    const chosen = OPERATIONS.find((op) => op.id === tfFontSelect.value);
    if (chosen) chosen.active = true;
    syncChipUI();
    autoFormat();
  });
}
bindChipEvents(tfChipsDeco);

if (tfEditor) {
  tfEditor.addEventListener('input', () => {
    if (activeTab === 'edit') {
      originalText = tfEditor.value;
    }
  });
}

if (tfTabEdit) {
  tfTabEdit.addEventListener('click', () => showTab('edit'));
}

if (tfTabPreview) {
  tfTabPreview.addEventListener('click', () => {
    originalText = tfEditor.value;
    showTab('preview');
  });
}

if (tfCopy) tfCopy.addEventListener('click', copyToClipboard);
if (tfDrawerToggle) tfDrawerToggle.addEventListener('click', openDrawer);
if (tfDrawerClose) tfDrawerClose.addEventListener('click', closeDrawer);
if (tfBackdrop) tfBackdrop.addEventListener('click', closeDrawer);

document.addEventListener('click', (e) => {
  if (e.target.closest && !e.target.closest('.tf__info')) {
    closeAllTooltips();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (tfDrawerBody && tfDrawerBody.querySelector('.tf__tooltip:not([hidden])')) {
    closeAllTooltips();
    return;
  }
  if (tfDrawer && tfDrawer.classList.contains('tf__drawer--open')) {
    closeDrawer();
  }
});
