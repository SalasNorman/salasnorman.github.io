const zenContent = document.getElementById('zen-content');
const zenPreview = document.getElementById('zen-preview');
const zenWords = document.getElementById('zen-words');
const zenChars = document.getElementById('zen-chars');
const zenFont = document.getElementById('zen-font');
const zenFullscreen = document.getElementById('zen-fullscreen');
const zenMarkdown = document.getElementById('zen-markdown');
const zenFind = document.getElementById('zen-find');
const zenDownload = document.getElementById('zen-download');
const zenDownloadMenu = document.getElementById('zen-download-menu');
const zenDownloadTxt = document.getElementById('zen-download-txt');
const zenDownloadMd = document.getElementById('zen-download-md');
const zenFindBar = document.getElementById('zen-find-bar');
const zenFindInput = document.getElementById('zen-find-input');
const zenReplaceInput = document.getElementById('zen-replace-input');
const zenFindPrev = document.getElementById('zen-find-prev');
const zenFindNext = document.getElementById('zen-find-next');
const zenReplaceOne = document.getElementById('zen-replace-one');
const zenReplaceAll = document.getElementById('zen-replace-all');
const zenFindClose = document.getElementById('zen-find-close');
const zenTabs = document.getElementById('zen-tabs');
const zenTabEdit = document.getElementById('zen-tab-edit');
const zenTabPreview = document.getElementById('zen-tab-preview');
const zenFontSize = document.getElementById('zen-font-size');

const STORAGE_KEY = 'zen-editor-content';
const FONT_KEY = 'zen-editor-font';
const FONT_SIZE_KEY = 'zen-editor-font-size';
const MARKDOWN_KEY = 'zen-editor-markdown';
let markdownMode = false;
let converter = null;

function getConverter() {
  if (!converter && typeof showdown !== 'undefined') {
    converter = new showdown.Converter();
  }
  return converter;
}

function updateStats() {
  if (!zenContent || !zenWords || !zenChars) return;
  const text = zenContent.innerText || '';
  const trimmed = text.trim();
  const wordCount = trimmed === '' ? 0 : trimmed.split(/\s+/).length;
  const charCount = trimmed.length;
  zenWords.textContent = `${wordCount} word${wordCount !== 1 ? 's' : ''}`;
  zenChars.textContent = `${charCount} character${charCount !== 1 ? 's' : ''}`;
}

function saveContent() {
  if (!zenContent) return;
  try {
    localStorage.setItem(STORAGE_KEY, zenContent.innerHTML);
  } catch (e) {}
}

function loadContent() {
  if (!zenContent) return;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      zenContent.innerHTML = saved;
    }
  } catch (e) {}
}

function updatePreview() {
  const conv = getConverter();
  if (!zenPreview || !conv) return;
  const html = zenContent.innerHTML || '';
  const plain = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<div[^>]*>/gi, '\n')
    .replace(/<\/div>/gi, '')
    .replace(/<[^>]+>/g, '');
  zenPreview.innerHTML = conv.makeHtml(plain);
}

function loadFont() {
  if (!zenContent || !zenFont) return;
  try {
    const saved = localStorage.getItem(FONT_KEY);
    if (saved) {
      zenContent.style.fontFamily = saved;
      zenFont.value = saved;
    }
  } catch (e) {}
}

function loadFontSize() {
  if (!zenContent || !zenFontSize) return;
  try {
    const saved = localStorage.getItem(FONT_SIZE_KEY);
    if (saved) {
      zenContent.style.fontSize = `${saved}px`;
      if (zenPreview) zenPreview.style.fontSize = `${saved}px`;
      zenFontSize.value = saved;
    }
  } catch (e) {}
}

function showTab(tab) {
  if (!zenTabEdit || !zenTabPreview || !zenContent || !zenPreview) return;
  if (tab === 'edit') {
    zenTabEdit.classList.add('zen__tab--active');
    zenTabPreview.classList.remove('zen__tab--active');
    zenContent.hidden = false;
    zenPreview.hidden = true;
  } else {
    zenTabPreview.classList.add('zen__tab--active');
    zenTabEdit.classList.remove('zen__tab--active');
    zenContent.hidden = true;
    zenPreview.hidden = false;
    updatePreview();
  }
}

function loadMarkdownMode() {
  try {
    const saved = localStorage.getItem(MARKDOWN_KEY);
    if (saved === 'true') {
      markdownMode = true;
      if (zenTabs) zenTabs.hidden = false;
      if (zenMarkdown) zenMarkdown.classList.add('zen__btn--active');
      showTab('edit');
    }
  } catch (e) {}
}

if (zenContent) {
  loadContent();
  loadFont();
  loadFontSize();
  loadMarkdownMode();
  updateStats();

  zenContent.addEventListener('input', () => {
    updateStats();
    saveContent();
    if (markdownMode && zenTabPreview && zenTabPreview.classList.contains('zen__tab--active')) {
      updatePreview();
    }
  });

  zenContent.addEventListener('paste', (e) => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text/plain');
    document.execCommand('insertText', false, text);
  });
}

if (zenFont && zenContent) {
  zenFont.addEventListener('change', (e) => {
    zenContent.style.fontFamily = e.target.value;
    try {
      localStorage.setItem(FONT_KEY, e.target.value);
    } catch (err) {}
  });
}

if (zenFontSize && zenContent) {
  zenFontSize.addEventListener('change', (e) => {
    zenContent.style.fontSize = `${e.target.value}px`;
    if (zenPreview) zenPreview.style.fontSize = `${e.target.value}px`;
    try {
      localStorage.setItem(FONT_SIZE_KEY, e.target.value);
    } catch (err) {}
  });
}

if (zenFullscreen) {
  zenFullscreen.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  });
}

if (zenMarkdown) {
  zenMarkdown.addEventListener('click', (e) => {
    markdownMode = !markdownMode;
    if (zenTabs) {
      zenTabs.hidden = !markdownMode;
    }
    e.currentTarget.classList.toggle('zen__btn--active', markdownMode);
    try {
      localStorage.setItem(MARKDOWN_KEY, markdownMode);
    } catch (err) {}
    if (markdownMode) {
      showTab('edit');
    } else {
      if (zenContent) zenContent.hidden = false;
      if (zenPreview) zenPreview.hidden = true;
    }
  });
}

if (zenTabEdit) {
  zenTabEdit.addEventListener('click', () => showTab('edit'));
}

if (zenTabPreview) {
  zenTabPreview.addEventListener('click', () => showTab('preview'));
}

function downloadFile(filename, type) {
  if (!zenContent) return;
  const text = zenContent.innerText || '';
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

if (zenDownload) {
  zenDownload.addEventListener('click', (e) => {
    e.stopPropagation();
    if (zenDownloadMenu) {
      zenDownloadMenu.hidden = !zenDownloadMenu.hidden;
    }
  });
}

document.addEventListener('click', () => {
  if (zenDownloadMenu) zenDownloadMenu.hidden = true;
});

if (zenDownloadTxt) {
  zenDownloadTxt.addEventListener('click', () => downloadFile('notepad.txt', 'text/plain'));
}

if (zenDownloadMd) {
  zenDownloadMd.addEventListener('click', () => downloadFile('notepad.md', 'text/markdown'));
}

if (zenFind) {
  zenFind.addEventListener('click', () => {
    if (!zenFindBar) return;
    const willShow = zenFindBar.hidden;
    zenFindBar.hidden = !willShow;
    if (willShow && zenFindInput) {
      zenFindInput.focus();
    }
  });
}

if (zenFindClose) {
  zenFindClose.addEventListener('click', () => {
    if (zenFindBar) zenFindBar.hidden = true;
    clearHighlights();
  });
}

function clearHighlights() {
  if (!zenContent) return;
  const marks = zenContent.querySelectorAll('mark.zen-highlight');
  marks.forEach((mark) => {
    const parent = mark.parentNode;
    parent.replaceChild(document.createTextNode(mark.textContent), mark);
    parent.normalize();
  });
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightAll(query) {
  clearHighlights();
  if (!query || !zenContent) return 0;
  if (!zenContent.firstChild) return 0;
  const html = zenContent.innerHTML;
  const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
  const count = (html.match(regex) || []).length;
  if (count > 0) {
    zenContent.innerHTML = html.replace(regex, '<mark class="zen-highlight">$1</mark>');
  }
  return count;
}

function replaceOne(query, replacement) {
  if (!query || !zenContent) return;
  clearHighlights();
  const html = zenContent.innerHTML;
  const regex = new RegExp(`(${escapeRegExp(query)})`, 'i');
  zenContent.innerHTML = html.replace(regex, replacement);
  saveContent();
  if (markdownMode && zenTabPreview && zenTabPreview.classList.contains('zen__tab--active')) {
    updatePreview();
  }
}

function replaceAll(query, replacement) {
  if (!query || !zenContent) return;
  clearHighlights();
  const html = zenContent.innerHTML;
  const regex = new RegExp(escapeRegExp(query), 'gi');
  zenContent.innerHTML = html.replace(regex, replacement);
  saveContent();
  if (markdownMode && zenTabPreview && zenTabPreview.classList.contains('zen__tab--active')) {
    updatePreview();
  }
}

if (zenFindInput) {
  let findTimer = null;
  zenFindInput.addEventListener('input', (e) => {
    clearTimeout(findTimer);
    const val = e.target.value;
    findTimer = setTimeout(() => {
      highlightAll(val);
    }, 200);
  });
}

if (zenFindNext) {
  zenFindNext.addEventListener('click', () => {
    const marks = zenContent ? zenContent.querySelectorAll('mark.zen-highlight') : [];
    if (marks.length === 0) return;
    const current = zenContent.querySelector('mark.zen-highlight--active');
    if (current) current.classList.remove('zen-highlight--active');
    let next = current ? current.nextElementSibling : null;
    while (next && next.tagName !== 'MARK') next = next.nextElementSibling;
    if (!next) next = marks[0];
    next.classList.add('zen-highlight--active');
    next.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

if (zenFindPrev) {
  zenFindPrev.addEventListener('click', () => {
    const marks = zenContent ? zenContent.querySelectorAll('mark.zen-highlight') : [];
    if (marks.length === 0) return;
    const current = zenContent.querySelector('mark.zen-highlight--active');
    if (current) current.classList.remove('zen-highlight--active');
    let prev = current ? current.previousElementSibling : null;
    while (prev && prev.tagName !== 'MARK') prev = prev.previousElementSibling;
    if (!prev) prev = marks[marks.length - 1];
    prev.classList.add('zen-highlight--active');
    prev.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

if (zenReplaceOne) {
  zenReplaceOne.addEventListener('click', () => {
    const q = zenFindInput ? zenFindInput.value : '';
    const r = zenReplaceInput ? zenReplaceInput.value : '';
    replaceOne(q, r);
    if (q) highlightAll(q);
  });
}

if (zenReplaceAll) {
  zenReplaceAll.addEventListener('click', () => {
    const q = zenFindInput ? zenFindInput.value : '';
    const r = zenReplaceInput ? zenReplaceInput.value : '';
    replaceAll(q, r);
  });
}
