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

/* TripAdvisor-style review carousel: swipeable, with clickable dot nav */
const taCarousel = document.getElementById('taCarousel');
const taDots = document.getElementById('taDots');
if (taCarousel && taDots) {
  const dots = taDots.querySelectorAll('span');
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const i = parseInt(dot.dataset.slide, 10);
      taCarousel.scrollTo({ left: i * taCarousel.offsetWidth, behavior: 'smooth' });
    });
  });
  taCarousel.addEventListener('scroll', () => {
    const i = Math.round(taCarousel.scrollLeft / taCarousel.offsetWidth);
    dots.forEach((dot, idx) => dot.classList.toggle('active', idx === i));
  });
}


/* Gallery lightbox: click a tile to view it full size, then arrow keys or the
   on-screen chevrons to move through the set. Progressive enhancement — with
   JS off the tiles are still plain links straight to the full-size photo. */
const lightbox = document.getElementById('lightbox');
if (lightbox) {
  const tiles   = Array.from(document.querySelectorAll('.gallery-tile'));
  const lbImg   = document.getElementById('lbImg');
  const lbCap   = document.getElementById('lbCap');
  const lbClose = document.getElementById('lbClose');
  const lbPrev  = document.getElementById('lbPrev');
  const lbNext  = document.getElementById('lbNext');
  let current = 0;
  let lastFocused = null;

  function show(i){
    current = (i + tiles.length) % tiles.length;
    const tile = tiles[current];
    const img = tile.querySelector('img');
    lbImg.src = tile.getAttribute('href');
    lbImg.alt = img ? img.alt : '';
    lbCap.textContent = tile.dataset.caption || '';
  }

  function open(i){
    lastFocused = document.activeElement;
    show(i);
    lightbox.hidden = false;
    requestAnimationFrame(() => lightbox.classList.add('open'));
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function close(){
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { lightbox.hidden = true; lbImg.src = ''; }, 300);
    if (lastFocused) lastFocused.focus();
  }

  tiles.forEach((tile, i) => {
    tile.addEventListener('click', (e) => { e.preventDefault(); open(i); });
  });

  lbClose.addEventListener('click', close);
  lbPrev.addEventListener('click', () => show(current - 1));
  lbNext.addEventListener('click', () => show(current + 1));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });

  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(current - 1);
    else if (e.key === 'ArrowRight') show(current + 1);
  });

  /* Keep tabbing inside the viewer while it's open. */
  lightbox.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusable = [lbClose, lbPrev, lbNext];
    const idx = focusable.indexOf(document.activeElement);
    e.preventDefault();
    const next = e.shiftKey ? idx - 1 : idx + 1;
    focusable[(next + focusable.length) % focusable.length].focus();
  });
}
