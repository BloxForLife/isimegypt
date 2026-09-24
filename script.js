/* Visit and tap counting, stored in a Google Sheet through a small Apps
   Script web app (setup steps in tracking/SETUP.md). TRACK_URL empty means
   tracking is off and nothing is sent. Only the event, which page, phone or
   desktop, and the referring site are sent: never names or phone numbers. */
const TRACK_URL = 'https://script.google.com/macros/s/AKfycbyVL1Rw37cDNgFxULXA1WrQ4JlTqz_N_DDgFba6XwA3HWOvxXzhGy-yTONxkVrtfob2/exec';
let bookedSession = '';

function track(event, detail){
  if (!TRACK_URL) return;
  let ref = '';
  try { if (document.referrer) { const h = new URL(document.referrer).hostname; if (h !== location.hostname) ref = h; } } catch (e) {}
  const body = JSON.stringify({
    event: event,
    detail: detail || '',
    page: document.body.dataset.page || location.pathname.split('/').pop() || 'index.html',
    device: window.matchMedia('(max-width: 780px)').matches ? 'phone' : 'desktop',
    ref: ref
  });
  // credentials: 'omit' because Apps Script can reject requests carrying
  // cookies from a browser signed into several Google accounts.
  try {
    fetch(TRACK_URL, { method: 'POST', mode: 'no-cors', credentials: 'omit', keepalive: true, body: body });
  } catch (e) {}
}

track('page_view', new URLSearchParams(location.search).get('session') || '');

document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href]');
  if (!a) return;
  const href = a.getAttribute('href');
  if (href.startsWith('tel:')) track('call_tap', bookedSession || 'not from booking form');
  else if (href.includes('wa.me/')) track('whatsapp_tap');
});

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

/* Booking page: the customer picks a session, date and time, then gets a
   summary to read out on the phone. There is no backend, so nothing is
   reserved here; the call is what books the slot. */
const bookForm = document.getElementById('bookForm');
if (bookForm) {
  const OPEN = 10 * 60, CLOSE = 24 * 60, STEP = 30; // minutes from midnight
  const bkSession = document.getElementById('bkSession');
  const bkDate    = document.getElementById('bkDate');
  const bkTime    = document.getElementById('bkTime');
  const bkName    = document.getElementById('bkName');
  const summary   = document.getElementById('bookSummary');

  const pad = n => String(n).padStart(2, '0');
  const isoLocal = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  function clock(mins){
    const h = Math.floor(mins / 60) % 24;
    return (h % 12 || 12) + ':' + pad(mins % 60) + ' ' + (h < 12 ? 'AM' : 'PM');
  }
  function placeholder(text){
    bkTime.innerHTML = '';
    bkTime.add(new Option(text, ''));
  }

  bkDate.min = isoLocal(new Date());

  function rebuildTimes(){
    const opt = bkSession.selectedOptions[0];
    const duration = opt && opt.value ? parseInt(opt.dataset.min, 10) : 0;
    if (!duration || !bkDate.value) { placeholder('Pick a session and date first'); return; }

    const now = new Date();
    const isToday = bkDate.value === isoLocal(now);
    const nowMins = now.getHours() * 60 + now.getMinutes();
    const previous = bkTime.value;

    placeholder('Choose a time');
    let count = 0;
    for (let start = OPEN; start + duration <= CLOSE; start += STEP) {
      if (isToday && start <= nowMins) continue;
      bkTime.add(new Option(clock(start), String(start)));
      count++;
    }
    if (!count) { placeholder('No times left today, try another date'); return; }
    if (previous && bkTime.querySelector('option[value="' + previous + '"]')) bkTime.value = previous;
  }

  const preset = new URLSearchParams(location.search).get('session');
  if (preset && bkSession.querySelector('option[value="' + preset + '"]')) bkSession.value = preset;

  bkSession.addEventListener('change', rebuildTimes);
  bkDate.addEventListener('change', rebuildTimes);
  rebuildTimes();

  bookForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const opt = bkSession.selectedOptions[0];
    const duration = parseInt(opt.dataset.min, 10);
    const start = parseInt(bkTime.value, 10);
    bookedSession = opt.dataset.name + ' ' + duration + ' min';
    track('book_continue', bookedSession);
    const [y, m, d] = bkDate.value.split('-').map(Number);

    document.getElementById('sumSession').textContent = opt.dataset.name + ' · ' + duration + ' min';
    document.getElementById('sumDate').textContent =
      new Date(y, m - 1, d).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
    document.getElementById('sumTime').textContent = clock(start) + ' – ' + clock(start + duration);
    document.getElementById('sumPrice').textContent = opt.dataset.price;
    document.getElementById('sumName').textContent = bkName.value.trim();

    bookForm.hidden = true;
    summary.hidden = false;
    document.getElementById('bookSummaryTitle').focus();
    summary.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  document.getElementById('bookEdit').addEventListener('click', () => {
    summary.hidden = true;
    bookForm.hidden = false;
    bkSession.focus();
  });
}
