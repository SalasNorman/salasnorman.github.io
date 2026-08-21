var zenContent = document.getElementById('zen-content');
var zenPreview = document.getElementById('zen-preview');
var zenWords = document.getElementById('zen-words');
var zenChars = document.getElementById('zen-chars');
var zenFont = document.getElementById('zen-font');
var zenFullscreen = document.getElementById('zen-fullscreen');
var zenMarkdown = document.getElementById('zen-markdown');
var zenFind = document.getElementById('zen-find');
var zenDownload = document.getElementById('zen-download');
var zenDownloadMenu = document.getElementById('zen-download-menu');
var zenDownloadTxt = document.getElementById('zen-download-txt');
var zenDownloadMd = document.getElementById('zen-download-md');
var zenFindBar = document.getElementById('zen-find-bar');
var zenFindInput = document.getElementById('zen-find-input');
var zenReplaceInput = document.getElementById('zen-replace-input');
var zenFindPrev = document.getElementById('zen-find-prev');
var zenFindNext = document.getElementById('zen-find-next');
var zenReplaceOne = document.getElementById('zen-replace-one');
var zenReplaceAll = document.getElementById('zen-replace-all');
var zenFindClose = document.getElementById('zen-find-close');
var zenTabs = document.getElementById('zen-tabs');
var zenTabEdit = document.getElementById('zen-tab-edit');
var zenTabPreview = document.getElementById('zen-tab-preview');
var zenFontSize = document.getElementById('zen-font-size');

var STORAGE_KEY = 'zen-editor-content';
var FONT_KEY = 'zen-editor-font';
var FONT_SIZE_KEY = 'zen-editor-font-size';
var MARKDOWN_KEY = 'zen-editor-markdown';
var markdownMode = false;
var converter = null;

function getConverter() {
  if (!converter && typeof showdown !== 'undefined') {
    converter = new showdown.Converter();
  }
  return converter;
}

function updateStats() {
  if (!zenContent || !zenWords || !zenChars) return;
  var text = zenContent.innerText || '';
  var trimmed = text.trim();
  var wordCount = trimmed === '' ? 0 : trimmed.split(/\s+/).length;
  var charCount = trimmed.length;
  zenWords.textContent = wordCount + ' word' + (wordCount !== 1 ? 's' : '');
  zenChars.textContent = charCount + ' character' + (charCount !== 1 ? 's' : '');
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
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      zenContent.innerHTML = saved;
    }
  } catch (e) {}
}

function updatePreview() {
  var conv = getConverter();
  if (!zenPreview || !conv) return;
  var html = zenContent.innerHTML || '';
  var plain = html.replace(/<br\s*\/?>/gi, '\n').replace(/<div[^>]*>/gi, '\n').replace(/<\/div>/gi, '').replace(/<[^>]+>/g, '');
  zenPreview.innerHTML = conv.makeHtml(plain);
}

function loadFont() {
  if (!zenContent || !zenFont) return;
  try {
    var saved = localStorage.getItem(FONT_KEY);
    if (saved) {
      zenContent.style.fontFamily = saved;
      zenFont.value = saved;
    }
  } catch (e) {}
}

function loadFontSize() {
  if (!zenContent || !zenFontSize) return;
  try {
    var saved = localStorage.getItem(FONT_SIZE_KEY);
    if (saved) {
      zenContent.style.fontSize = saved + 'px';
      if (zenPreview) zenPreview.style.fontSize = saved + 'px';
      zenFontSize.value = saved;
    }
  } catch (e) {}
}

function showTab(tab) {
  if (!zenTabEdit || !zenTabPreview || !zenContent || !zenPreview) return;
  if (tab === 'edit') {
    zenTabEdit.classList.add('zen__tab--active');
    zenTabPreview.classList.remove('zen__tab--active');
    zenContent.style.display = '';
    zenPreview.style.display = 'none';
  } else {
    zenTabPreview.classList.add('zen__tab--active');
    zenTabEdit.classList.remove('zen__tab--active');
    zenContent.style.display = 'none';
    zenPreview.style.display = '';
    updatePreview();
  }
}

function loadMarkdownMode() {
  try {
    var saved = localStorage.getItem(MARKDOWN_KEY);
    if (saved === 'true') {
      markdownMode = true;
      if (zenTabs) zenTabs.style.display = '';
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

  zenContent.addEventListener('input', function () {
    updateStats();
    saveContent();
    if (markdownMode && zenTabPreview && zenTabPreview.classList.contains('zen__tab--active')) {
      updatePreview();
    }
  });

  zenContent.addEventListener('paste', function (e) {
    e.preventDefault();
    var text = (e.clipboardData || window.clipboardData).getData('text/plain');
    document.execCommand('insertText', false, text);
  });
}

if (zenFont && zenContent) {
  zenFont.addEventListener('change', function () {
    zenContent.style.fontFamily = this.value;
    try {
      localStorage.setItem(FONT_KEY, this.value);
    } catch (e) {}
  });
}

if (zenFontSize && zenContent) {
  zenFontSize.addEventListener('change', function () {
    zenContent.style.fontSize = this.value + 'px';
    if (zenPreview) zenPreview.style.fontSize = this.value + 'px';
    try {
      localStorage.setItem(FONT_SIZE_KEY, this.value);
    } catch (e) {}
  });
}

if (zenFullscreen) {
  zenFullscreen.addEventListener('click', function () {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(function () {});
    } else {
      document.exitFullscreen();
    }
  });
}

if (zenMarkdown) {
  zenMarkdown.addEventListener('click', function () {
    markdownMode = !markdownMode;
    if (zenTabs) {
      zenTabs.style.display = markdownMode ? '' : 'none';
    }
    this.classList.toggle('zen__btn--active', markdownMode);
    try {
      localStorage.setItem(MARKDOWN_KEY, markdownMode);
    } catch (e) {}
    if (markdownMode) {
      showTab('edit');
    } else {
      if (zenContent) zenContent.style.display = '';
      if (zenPreview) zenPreview.style.display = 'none';
    }
  });
}

if (zenTabEdit) {
  zenTabEdit.addEventListener('click', function () {
    showTab('edit');
  });
}

if (zenTabPreview) {
  zenTabPreview.addEventListener('click', function () {
    showTab('preview');
  });
}

function downloadFile(filename, type) {
  if (!zenContent) return;
  var text = zenContent.innerText || '';
  var blob = new Blob([text], { type: type });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

if (zenDownload) {
  zenDownload.addEventListener('click', function (e) {
    e.stopPropagation();
    if (zenDownloadMenu) {
      zenDownloadMenu.style.display = zenDownloadMenu.style.display === 'none' ? 'block' : 'none';
    }
  });
}

document.addEventListener('click', function () {
  if (zenDownloadMenu) zenDownloadMenu.style.display = 'none';
});

if (zenDownloadTxt) {
  zenDownloadTxt.addEventListener('click', function () {
    downloadFile('notepad.txt', 'text/plain');
  });
}

if (zenDownloadMd) {
  zenDownloadMd.addEventListener('click', function () {
    downloadFile('notepad.md', 'text/markdown');
  });
}

if (zenFind) {
  zenFind.addEventListener('click', function () {
    if (!zenFindBar) return;
    var isVisible = zenFindBar.style.display !== 'none';
    zenFindBar.style.display = isVisible ? 'none' : 'flex';
    if (!isVisible && zenFindInput) {
      zenFindInput.focus();
    }
  });
}

if (zenFindClose) {
  zenFindClose.addEventListener('click', function () {
    if (zenFindBar) zenFindBar.style.display = 'none';
    clearHighlights();
  });
}

function clearHighlights() {
  if (!zenContent) return;
  var marks = zenContent.querySelectorAll('mark.zen-highlight');
  for (var i = 0; i < marks.length; i++) {
    var parent = marks[i].parentNode;
    parent.replaceChild(document.createTextNode(marks[i].textContent), marks[i]);
    parent.normalize();
  }
}

function highlightAll(query) {
  clearHighlights();
  if (!query || !zenContent) return 0;
  var textNode = zenContent.firstChild;
  if (!textNode) return 0;
  var html = zenContent.innerHTML;
  var regex = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
  var count = (html.match(regex) || []).length;
  if (count > 0) {
    zenContent.innerHTML = html.replace(regex, '<mark class="zen-highlight">$1</mark>');
  }
  return count;
}

function replaceOne(query, replacement) {
  if (!query || !zenContent) return;
  clearHighlights();
  var html = zenContent.innerHTML;
  var regex = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'i');
  zenContent.innerHTML = html.replace(regex, replacement);
  saveContent();
  if (markdownMode && zenTabPreview && zenTabPreview.classList.contains('zen__tab--active')) {
    updatePreview();
  }
}

function replaceAll(query, replacement) {
  if (!query || !zenContent) return;
  clearHighlights();
  var html = zenContent.innerHTML;
  var regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  zenContent.innerHTML = html.replace(regex, replacement);
  saveContent();
  if (markdownMode && zenTabPreview && zenTabPreview.classList.contains('zen__tab--active')) {
    updatePreview();
  }
}

if (zenFindInput) {
  var findTimer = null;
  zenFindInput.addEventListener('input', function () {
    clearTimeout(findTimer);
    var val = this.value;
    findTimer = setTimeout(function () {
      highlightAll(val);
    }, 200);
  });
}

if (zenFindNext) {
  zenFindNext.addEventListener('click', function () {
    var marks = zenContent ? zenContent.querySelectorAll('mark.zen-highlight') : [];
    if (marks.length === 0) return;
    var current = zenContent.querySelector('mark.zen-highlight--active');
    if (current) current.classList.remove('zen-highlight--active');
    var next = current ? current.nextElementSibling : null;
    while (next && next.tagName !== 'MARK') next = next.nextElementSibling;
    if (!next) next = marks[0];
    next.classList.add('zen-highlight--active');
    next.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

if (zenFindPrev) {
  zenFindPrev.addEventListener('click', function () {
    var marks = zenContent ? zenContent.querySelectorAll('mark.zen-highlight') : [];
    if (marks.length === 0) return;
    var current = zenContent.querySelector('mark.zen-highlight--active');
    if (current) current.classList.remove('zen-highlight--active');
    var prev = current ? current.previousElementSibling : null;
    while (prev && prev.tagName !== 'MARK') prev = prev.previousElementSibling;
    if (!prev) prev = marks[marks.length - 1];
    prev.classList.add('zen-highlight--active');
    prev.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

if (zenReplaceOne) {
  zenReplaceOne.addEventListener('click', function () {
    var q = zenFindInput ? zenFindInput.value : '';
    var r = zenReplaceInput ? zenReplaceInput.value : '';
    replaceOne(q, r);
    if (q) highlightAll(q);
  });
}

if (zenReplaceAll) {
  zenReplaceAll.addEventListener('click', function () {
    var q = zenFindInput ? zenFindInput.value : '';
    var r = zenReplaceInput ? zenReplaceInput.value : '';
    replaceAll(q, r);
  });
}
