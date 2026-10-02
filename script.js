/* =========================================================
   STARTS SCHOOL — script.js
   Navigation · Audio · Animations · Wake-Up sequence
   ========================================================= */

'use strict';

/* ── DOM references ── */
const startScreen   = document.getElementById('start-screen');
const startBtn      = document.getElementById('start-btn');
const presentation  = document.getElementById('presentation');
const pages         = Array.from(document.querySelectorAll('.page'));
const prevBtn       = document.getElementById('prevBtn');
const nextBtn       = document.getElementById('nextBtn');
const curPageEl     = document.getElementById('cur-page');
const totPagesEl    = document.getElementById('tot-pages');
const sfxClick      = document.getElementById('sfx-click');
const sfxAlarm      = document.getElementById('sfx-alarm');

/* ── State ── */
let current          = 0;
const TOTAL          = pages.length;
const SUNSET_INDEX   = TOTAL - 2;   // second-to-last page (index 17)
const WAKEUP_INDEX   = TOTAL - 1;   // last page (index 18)

let navigating       = false;       // debounce guard

/* ── Initialise counter ── */
totPagesEl.textContent = TOTAL;

/* ─────────────────────────────────────────────
   START BUTTON
   ───────────────────────────────────────────── */
startBtn.addEventListener('click', () => {
  /* Unlock audio context (must be inside user gesture) */
  [sfxClick, sfxAlarm].forEach(a => { a.load(); });

  startScreen.style.transition = 'opacity .6s ease';
  startScreen.style.opacity = '0';
  setTimeout(() => {
    startScreen.style.display = 'none';
    presentation.classList.remove('hidden');
    prevBtn.style.display  = 'block';
    nextBtn.style.display  = 'block';
    document.getElementById('page-counter').style.display = 'block';
    activatePage(0, 'none');
  }, 650);
});

/* ─────────────────────────────────────────────
   PAGE ACTIVATION
   ───────────────────────────────────────────── */
function activatePage(index, direction) {
  if (index < 0 || index >= TOTAL) return;

  const prev = pages[current];
  const next = pages[index];

  /* Deactivate current */
  if (prev) {
    prev.classList.remove('active');
    if (direction === 'forward') prev.classList.add('exit-left');
    setTimeout(() => prev.classList.remove('exit-left'), 700);
    pausePageMedia(prev);
  }

  current = index;

  /* Activate next */
  next.classList.add('active');
  updateCounter();
  playPageMedia(next);

  /* Special pages */
  if (index === WAKEUP_INDEX) triggerWakeUp();

  /* Reset navigating guard after transition */
  setTimeout(() => { navigating = false; }, 700);
}

/* ─────────────────────────────────────────────
   NAVIGATION
   ───────────────────────────────────────────── */
function goNext() {
  if (navigating) return;
  navigating = true;
  playClick();
  activatePage(current + 1, 'forward');
}

function goPrev() {
  if (navigating || current === 0) return;
  navigating = true;
  playClick();
  activatePage(current - 1, 'back');
}

nextBtn.addEventListener('click', goNext);
prevBtn.addEventListener('click', goPrev);

document.addEventListener('keydown', e => {
  if (startScreen.style.display === 'none' || !startScreen.style.display) {
    /* start screen still visible — skip */
    if (!presentation.classList.contains('hidden')) {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') goNext();
      if (e.key === 'ArrowLeft'  || e.key === 'PageUp')   goPrev();
    }
  }
});

/* Touch / swipe support */
let touchStartX = 0;
document.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
document.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 50) {
    if (dx < 0) goNext();
    else        goPrev();
  }
});

/* ─────────────────────────────────────────────
   PAGE COUNTER
   ───────────────────────────────────────────── */
function updateCounter() {
  curPageEl.textContent = current + 1;
}

/* ─────────────────────────────────────────────
   MEDIA (videos / auto-play images)
   ───────────────────────────────────────────── */
function playPageMedia(page) {
  const vid = page.querySelector('video');
  if (vid) { vid.currentTime = 0; vid.play().catch(() => {}); }
}

function pausePageMedia(page) {
  const vid = page.querySelector('video');
  if (vid) vid.pause();
}

/* ─────────────────────────────────────────────
   SOUND HELPERS
   ───────────────────────────────────────────── */
function playClick() {
  if (!sfxClick) return;
  sfxClick.currentTime = 0;
  sfxClick.volume = 0.7;
  sfxClick.play().catch(() => {});
}

function playAlarm() {
  if (!sfxAlarm) return;
  sfxAlarm.currentTime = 0;
  sfxAlarm.volume = 1;
  sfxAlarm.play().catch(() => {});
}

/* ─────────────────────────────────────────────
   WAKE-UP SEQUENCE
   ───────────────────────────────────────────── */
function triggerWakeUp() {
  const title = document.getElementById('wakeup-text');
  const sub   = document.getElementById('wakeup-sub');

  /* Reset */
  title.classList.remove('show');
  sub.classList.remove('show');

  /* Flash white */
  flash();

  /* Alarm after flash */
  setTimeout(() => {
    playAlarm();
  }, 350);

  /* Show WAKE UP text */
  setTimeout(() => {
    title.classList.add('show');
  }, 500);

  /* Show sub-text */
  setTimeout(() => {
    sub.classList.add('show');
  }, 1600);
}

/* White flash overlay */
function flash() {
  let overlay = document.getElementById('flash-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'flash-overlay';
    document.body.appendChild(overlay);
  }
  overlay.style.opacity = '1';
  setTimeout(() => { overlay.style.opacity = '0'; }, 180);
}

/* ─────────────────────────────────────────────
   KEYBOARD SHORTCUT HINT on Start Screen
   ───────────────────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !presentation.classList.contains('hidden') === false) {
    startBtn.click();
  }
});
