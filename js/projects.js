const demoBtn = document.querySelector('.project__demo-btn');
const demoList = document.querySelector('.project__demo-list');
const chevron = document.querySelector('.project__chevron');

if (demoBtn && demoList) {
  demoBtn.addEventListener('click', function () {
    demoList.classList.toggle('open');
    if (chevron) chevron.classList.toggle('open');
  });
}
