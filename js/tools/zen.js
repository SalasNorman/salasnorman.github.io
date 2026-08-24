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
const zenSeg = document.getElementById('zen-seg');
const zenSegEdit = document.getElementById('zen-seg-edit');
const zenSegPreview = document.getElementById('zen-seg-preview');
const zenFontSize = document.getElementById('zen-font-size');
const zenNotes = document.getElementById('zen-notes');

const NOTES_KEY = 'zen-editor-notes';
const LEGACY_CONTENT_KEY = 'zen-editor-content';
const FONT_KEY = 'zen-editor-font';
const FONT_SIZE_KEY = 'zen-editor-font-size';
const MARKDOWN_KEY = 'zen-editor-markdown';
const MAX_NOTES = 3;
let notes = [''];
let activeNote = 0;
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
  notes[activeNote] = zenContent.innerHTML;
  saveNotes();
}

function saveNotes() {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify({ active: activeNote, notes }));
  } catch (e) {}
}

function loadNotes() {
  try {
    const saved = localStorage.getItem(NOTES_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed.notes) && parsed.notes.length > 0) {
        notes = parsed.notes.slice(0, MAX_NOTES);
        activeNote = Math.min(Math.max(parsed.active || 0, 0), notes.length - 1);
        return;
      }
    }
    const legacy = localStorage.getItem(LEGACY_CONTENT_KEY);
    if (legacy) {
      notes = [legacy];
      activeNote = 0;
      saveNotes();
      localStorage.removeItem(LEGACY_CONTENT_KEY);
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

function noteLabel(index) {
  return `Note ${index + 1}`;
}

function refreshPreviewIfVisible() {
  if (markdownMode && zenSegPreview && zenSegPreview.classList.contains('zen__seg__btn--active')) {
    updatePreview();
  }
}

function renderNotes() {
  if (!zenNotes) return;
  const showX = notes.length > 1 ? '' : ' hidden';
  const tabs = notes
    .map((_, i) => {
      const activeCls = i === activeNote ? ' zen__note--active' : '';
      return (
        `<div class="zen__note${activeCls}">` +
        `<button type="button" class="zen__note-name">${noteLabel(i)}</button>` +
        `<button type="button" class="zen__note-x"${showX} aria-label="Close ${noteLabel(i)}"><i class="bi bi-x"></i></button>` +
        '</div>'
      );
    })
    .join('');
  const addHtml =
    notes.length < MAX_NOTES
      ? '<button type="button" id="zen-note-add" class="zen__note-add push-btn" title="New note" aria-label="New note"><i class="bi bi-plus-lg"></i></button>'
      : '';
  zenNotes.innerHTML = tabs + addHtml;
}

function switchNote(index) {
  if (!zenContent || index === activeNote || index < 0 || index >= notes.length) return;
  clearHighlights();
  saveContent();
  activeNote = index;
  zenContent.innerHTML = notes[activeNote];
  updateStats();
  saveNotes();
  renderNotes();
  refreshPreviewIfVisible();
}

function addNote() {
  if (!zenContent || notes.length >= MAX_NOTES) return;
  clearHighlights();
  saveContent();
  notes.push('');
  activeNote = notes.length - 1;
  zenContent.innerHTML = '';
  updateStats();
  saveNotes();
  renderNotes();
  refreshPreviewIfVisible();
  zenContent.focus();
}

function deleteNote(index) {
  if (!zenContent || notes.length <= 1) return;
  notes.splice(index, 1);
  if (index < activeNote) {
    activeNote -= 1;
  } else if (index === activeNote) {
    activeNote = index < notes.length ? index : notes.length - 1;
  }
  zenContent.innerHTML = notes[activeNote];
  updateStats();
  saveNotes();
  renderNotes();
  refreshPreviewIfVisible();
}

function showTab(tab) {
  if (!zenSegEdit || !zenSegPreview || !zenContent || !zenPreview) return;
  if (tab === 'edit') {
    zenSegEdit.classList.add('zen__seg__btn--active');
    zenSegPreview.classList.remove('zen__seg__btn--active');
    zenContent.hidden = false;
    zenPreview.hidden = true;
  } else {
    zenSegPreview.classList.add('zen__seg__btn--active');
    zenSegEdit.classList.remove('zen__seg__btn--active');
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
      if (zenSeg) zenSeg.hidden = false;
      if (zenMarkdown) zenMarkdown.classList.add('zen__btn--active');
      showTab('edit');
    }
  } catch (e) {}
}

if (zenContent) {
  loadNotes();
  if (notes[activeNote]) {
    zenContent.innerHTML = notes[activeNote];
  }
  renderNotes();
  loadFont();
  loadFontSize();
  loadMarkdownMode();
  updateStats();

  zenContent.addEventListener('input', () => {
    updateStats();
    saveContent();
    refreshPreviewIfVisible();
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

const zenThemeFloat = document.getElementById('zen-theme');

if (zenThemeFloat || zenFullscreen) {
  document.addEventListener('fullscreenchange', () => {
    const active = !!document.fullscreenElement;
    if (zenThemeFloat) zenThemeFloat.hidden = !active;
    if (zenFullscreen) {
      zenFullscreen.classList.toggle('zen__btn--active', active);
      const icon = zenFullscreen.querySelector('i');
      if (icon) icon.className = active ? 'bi bi-fullscreen-exit' : 'bi bi-arrows-fullscreen';
      zenFullscreen.title = active ? 'Exit fullscreen' : 'Fullscreen';
    }
  });
}

if (zenMarkdown) {
  zenMarkdown.addEventListener('click', (e) => {
    markdownMode = !markdownMode;
    if (zenSeg) {
      zenSeg.hidden = !markdownMode;
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

if (zenSegEdit) {
  zenSegEdit.addEventListener('click', () => showTab('edit'));
}

if (zenSegPreview) {
  zenSegPreview.addEventListener('click', () => showTab('preview'));
}

if (zenNotes) {
  zenNotes.addEventListener('click', (e) => {
    const tabEls = Array.from(zenNotes.querySelectorAll('.zen__note'));
    const xBtn = e.target.closest('.zen__note-x');
    if (xBtn) {
      deleteNote(tabEls.indexOf(xBtn.closest('.zen__note')));
      return;
    }
    const nameBtn = e.target.closest('.zen__note-name');
    if (nameBtn) {
      switchNote(tabEls.indexOf(nameBtn.closest('.zen__note')));
      return;
    }
    if (e.target.closest('#zen-note-add')) {
      addNote();
    }
  });
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
    zenFind.classList.toggle('zen__btn--active', willShow);
    if (willShow && zenFindInput) {
      zenFindInput.focus();
    } else {
      clearHighlights();
    }
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
  refreshPreviewIfVisible();
}

function replaceAll(query, replacement) {
  if (!query || !zenContent) return;
  clearHighlights();
  const html = zenContent.innerHTML;
  const regex = new RegExp(escapeRegExp(query), 'gi');
  zenContent.innerHTML = html.replace(regex, replacement);
  saveContent();
  refreshPreviewIfVisible();
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
