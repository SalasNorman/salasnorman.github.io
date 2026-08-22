const tfEditor = document.getElementById('tf-editor');
const tfCopy = document.getElementById('tf-copy');
const tfTabEdit = document.getElementById('tf-tab-edit');
const tfTabPreview = document.getElementById('tf-tab-preview');
const tfFontSelect = document.getElementById('tf-font');
const tfChipsDeco = document.getElementById('tf-chips-deco');
const tfCaseBtn = document.getElementById('tf-case-btn');
const tfSortBtn = document.getElementById('tf-sort-btn');

let originalText = '';
let formattedText = '';
let activeTab = 'edit';
let caseIndex = -1;
let sortIndex = -1;

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

let LETTERFORM = {};

function cjkText(text) {
  return Array.from(text.toUpperCase())
    .map((ch) => LETTERFORM[ch] || ch)
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

const TRANSFORMS = {
  sortLines(text, dir) {
    return text.split('\n').sort((a, b) => (dir === 'desc' ? b.localeCompare(a) : a.localeCompare(b))).join('\n');
  },
  convertCase(text, type) {
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
  },
  serifBold: makeFontFn('bold'),
  serifItalic: makeFontFn('italic'),
  serifBoldItalic: makeFontFn('boldItalic'),
  monospace: makeFontFn('mono'),
  sansBold: makeFontFn('sansBold'),
  sansItalic: makeFontFn('sansItalic'),
  sansBoldItalic: makeFontFn('sansBoldItalic'),
  cjkLetterform: cjkText,
  underlineText,
  strikeText,
  zalgoText
};

let OPERATIONS = [];

fetch('../data/text-formatter.json')
  .then((response) => {
    if (!response.ok) throw new Error(`HTTP ${response.status} while loading text-formatter data`);
    return response.json();
  })
  .then((config) => {
    LETTERFORM = config.letterform || {};
    OPERATIONS = config.operations.map((op) => ({ ...op, fn: TRANSFORMS[op.fn] }));
    init();
  });

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
  if (caseIndex >= 0) text = TRANSFORMS.convertCase(text, CASE_MODES[caseIndex]);
  if (sortIndex >= 0) text = TRANSFORMS.sortLines(text, SORT_DIRS[sortIndex]);
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

function init() {
  buildFontSelect();
  buildChips();
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

const CASE_MODES = ['upper', 'lower', 'title', 'sentence', 'camel', 'snake', 'kebab'];
const CASE_LABELS = {
  upper: 'UPPER',
  lower: 'lower',
  title: 'Title',
  sentence: 'Sentence',
  camel: 'camel',
  snake: 'snake',
  kebab: 'kebab'
};
const SORT_DIRS = ['asc', 'desc'];

function syncActionButtons() {
  if (!tfCaseBtn || !tfSortBtn) return;
  const mode = CASE_MODES[caseIndex];
  tfCaseBtn.textContent = mode ? `Case: ${CASE_LABELS[mode]}` : 'Case';
  tfCaseBtn.classList.toggle('push-btn--in', Boolean(mode));
  const dir = SORT_DIRS[sortIndex];
  tfSortBtn.textContent = dir === 'asc' ? 'Sort A\u2192Z' : dir === 'desc' ? 'Sort Z\u2192A' : 'Sort';
  tfSortBtn.classList.toggle('push-btn--in', Boolean(dir));
}

if (tfCaseBtn) {
  tfCaseBtn.addEventListener('click', () => {
    caseIndex = caseIndex + 1 >= CASE_MODES.length ? -1 : caseIndex + 1;
    syncActionButtons();
    autoFormat();
  });
}

if (tfSortBtn) {
  tfSortBtn.addEventListener('click', () => {
    sortIndex = sortIndex + 1 >= SORT_DIRS.length ? -1 : sortIndex + 1;
    syncActionButtons();
    autoFormat();
  });
}

syncActionButtons();

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
