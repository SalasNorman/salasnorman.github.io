const hamburger = document.getElementById('hamburger');
const header = document.querySelector('.header');

if (hamburger && header) {
  hamburger.addEventListener('click', function () {
    const isOpen = header.classList.toggle('nav-open');
    hamburger.setAttribute('aria-expanded', isOpen);
  });
}

document.querySelectorAll('.header__nav-links a').forEach(function (link) {
  if (link.classList.contains('active')) {
    link.setAttribute('aria-current', 'page');
  }
});
