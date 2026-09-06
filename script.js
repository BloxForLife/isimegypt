const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  });
}

const mobileMenu = document.getElementById('mobileMenu');
const menuBackdrop = document.getElementById('menuBackdrop');
const burgerBtn = document.getElementById('burgerBtn');
const closeMenuBtn = document.getElementById('closeMenuBtn');
function openMenu(){ mobileMenu.classList.add('open'); if (menuBackdrop) menuBackdrop.classList.add('open'); }
function closeMenu(){ mobileMenu.classList.remove('open'); if (menuBackdrop) menuBackdrop.classList.remove('open'); }
if (mobileMenu && burgerBtn && closeMenuBtn) {
  burgerBtn.addEventListener('click', openMenu);
  closeMenuBtn.addEventListener('click', closeMenu);
  if (menuBackdrop) menuBackdrop.addEventListener('click', closeMenu);
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
}

/* Reveal-on-view. Safe by design: if IntersectionObserver or transitions
   are unsupported/disabled, we still force everything visible after a
   short timeout so content can never get stuck hidden. */
const copyYear = document.getElementById('copyYear');
if (copyYear) copyYear.textContent = new Date().getFullYear();

const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('in-view');
  });
}, { threshold: 0.15 });
revealEls.forEach(el => io.observe(el));

setTimeout(() => {
  revealEls.forEach(el => el.classList.add('in-view'));
}, 1200);

const stats = document.querySelectorAll('.stat-num[data-count]');
const statIo = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting && !e.target.dataset.done) {
      e.target.dataset.done = "1";
      const target = parseInt(e.target.dataset.count, 10);
      const suffix = e.target.dataset.suffix || "";
      const display = e.target.dataset.display;
      if (display) { e.target.textContent = display; return; }
      const duration = 1400;
      const start = performance.now();
      function tick(now){
        const p = Math.min((now - start) / duration, 1);
        const val = Math.floor(p * target);
        e.target.textContent = val.toLocaleString() + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }
  });
}, { threshold: 0.4 });
stats.forEach(el => statIo.observe(el));

const parallaxEls = document.querySelectorAll('.parallax-img');
function updateParallax(){
  parallaxEls.forEach(el => {
    const rect = el.parentElement.getBoundingClientRect();
    const speed = parseFloat(el.dataset.speed) || 0.3;
    const offset = rect.top * speed;
    el.style.transform = `translateY(${offset}px)`;
  });
}
window.addEventListener('scroll', () => requestAnimationFrame(updateParallax));
updateParallax();

