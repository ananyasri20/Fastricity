/* ============================================================
   FASTRICITY — main.js
   All interactive functionality for the Fastricity website
   ============================================================ */

/* ─────────────────────────────────────────
   1. PAGE NAVIGATION
   Navigate between Home / About / Project / Contact
   without reloading — single-page app style
───────────────────────────────────────── */
function goPage(id, el) {
  // Hide every page
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  // Show the requested page
  const target = document.getElementById('page-' + id);
  if (target) target.classList.add('active');

  // Update active link highlight in navbar
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  if (el) {
    el.classList.add('active');
  } else {
    // Auto-highlight the correct link by index
    const map = { home: 0, about: 1, project: 2, contact: 3 };
    const links = document.querySelectorAll('.nav-links a');
    if (typeof map[id] !== 'undefined' && links[map[id]]) {
      links[map[id]].classList.add('active');
    }
  }

  // Scroll to top of page
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Re-trigger reveal animations for newly shown page
  setTimeout(checkReveal, 120);
}

/* ─────────────────────────────────────────
   2. HAMBURGER MOBILE MENU
───────────────────────────────────────── */
function toggleMenu() {
  document.getElementById('hmbg').classList.toggle('open');
  document.getElementById('mobMenu').classList.toggle('open');
}

function closeMenu() {
  document.getElementById('hmbg').classList.remove('open');
  document.getElementById('mobMenu').classList.remove('open');
}

/* ─────────────────────────────────────────
   3. SCROLL TO SIMULATOR
   Navigates to home page then smoothly scrolls
   down to the simulator section
───────────────────────────────────────── */
function scrollSim() {
  goPage('home');
  setTimeout(() => {
    const el = document.getElementById('simulator');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 160);
}

/* ─────────────────────────────────────────
   4. NAVBAR SCROLL EFFECT
   Adds shadow when user scrolls down
───────────────────────────────────────── */
window.addEventListener('scroll', () => {
  const nav = document.getElementById('nav');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
  checkReveal();
});

/* ─────────────────────────────────────────
   5. SCROLL REVEAL ANIMATIONS
   Elements with .reveal / .reveal-l / .reveal-r
   fade/slide in when they enter the viewport
───────────────────────────────────────── */
function checkReveal() {
  const windowH = window.innerHeight;
  document.querySelectorAll('.reveal, .reveal-l, .reveal-r').forEach(el => {
    if (el.getBoundingClientRect().top < windowH * 0.92) {
      el.classList.add('visible');
    }
  });
}

// Run on page load and on scroll
setTimeout(checkReveal, 200);
window.addEventListener('load', checkReveal);

/* ─────────────────────────────────────────
   6. FAQ ACCORDION
   Only one FAQ open at a time
───────────────────────────────────────── */
function toggleFaq(qEl) {
  const item = qEl.closest('.faq-item');
  const wasOpen = item.classList.contains('open');
  // Close all items first
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
  // If it wasn't open, open it now
  if (!wasOpen) item.classList.add('open');
}

/* ─────────────────────────────────────────
   7. CONTACT FORM SUBMISSION
   Shows success message on submit (no backend)
───────────────────────────────────────── */
function submitForm(e) {
  e.preventDefault();
  const form = document.getElementById('contactForm');
  const ok   = document.getElementById('formOk');
  if (form) form.style.display = 'none';
  if (ok)   ok.classList.add('show');
}

/* ─────────────────────────────────────────
   8. 🚴 RIDE SIMULATOR
   ─────────────────────────────────────────
   FORMULA:
     Energy (units) = (seconds ÷ 60) × 2   → 2 units per minute
     Points         = Energy × 5            → 5 points per energy unit
     CO₂ saved (g)  = Energy × 8           → 8 grams per energy unit

   FLOW:
     startRide() → starts setInterval every 1 second
                 → each tick: rideSec++, update display
     endRide()   → clears interval, shows summary card
───────────────────────────────────────── */

let rideTimer  = null;   // setInterval reference
let rideSec    = 0;      // total seconds elapsed in current ride
let riding     = false;  // whether a ride is currently active
const MAX_SECS = 600;    // 10-minute maximum ride for progress bar

/** Calculate energy units from seconds ridden */
const calcEnergy = (s) => (s / 60) * 2;

/** Calculate reward points from energy units */
const calcPoints = (e) => Math.floor(e * 5);

/** Calculate CO₂ saved (grams) from energy units */
const calcCO2 = (e) => (e * 8).toFixed(1) + 'g';

/** Calculate progress bar percentage (max 10 min = 100%) */
const calcProgress = (s) => Math.min((s / MAX_SECS) * 100, 100);

/** Format seconds as m:ss string */
const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

/** Update all simulator display elements */
function updateSim() {
  const e = calcEnergy(rideSec);
  const el = (id) => document.getElementById(id);
  if (el('simTime'))   el('simTime').textContent   = formatTime(rideSec);
  if (el('simEnergy')) el('simEnergy').textContent = e.toFixed(1);
  if (el('simPoints')) el('simPoints').textContent = calcPoints(e);
  if (el('simBar'))    el('simBar').style.width    = calcProgress(rideSec) + '%';
}

/** Start a new ride session */
function startRide() {
  if (riding) return; // prevent double-start
  riding  = true;
  rideSec = 0;

  // Hide previous summary
  const summary = document.getElementById('simSummary');
  if (summary) summary.classList.remove('show');

  // Update button states
  const btnStart = document.getElementById('btnStart');
  const btnStop  = document.getElementById('btnStop');
  if (btnStart) { btnStart.disabled = true; btnStart.style.opacity = '.4'; }
  if (btnStop)  { btnStop.disabled = false; }

  // Show riding indicator
  const ind = document.getElementById('ridingInd');
  if (ind) ind.style.display = 'flex';

  updateSim();

  // Tick every second
  rideTimer = setInterval(() => {
    rideSec++;
    updateSim();
    // Auto-stop at max time
    if (rideSec >= MAX_SECS) endRide();
  }, 1000);
}

/** End the current ride and show summary */
function endRide() {
  if (!riding && rideSec === 0) return;
  riding = false;
  clearInterval(rideTimer);

  // Hide riding indicator
  const ind = document.getElementById('ridingInd');
  if (ind) ind.style.display = 'none';

  // Reset button states
  const btnStart = document.getElementById('btnStart');
  const btnStop  = document.getElementById('btnStop');
  if (btnStart) { btnStart.disabled = false; btnStart.style.opacity = '1'; }
  if (btnStop)  { btnStop.disabled = true; }

  // Populate and show summary
  const e = calcEnergy(rideSec);
  const el = (id) => document.getElementById(id);
  if (el('sumE')) el('sumE').textContent = e.toFixed(1);
  if (el('sumP')) el('sumP').textContent = calcPoints(e);
  if (el('sumC')) el('sumC').textContent = calcCO2(e);

  const summary = document.getElementById('simSummary');
  if (summary) summary.classList.add('show');

  // Reset counters for next ride
  rideSec = 0;
  updateSim();
}

/* ─────────────────────────────────────────
   9. HERO STATS ANIMATED COUNTERS
   Numbers count up from 0 on page load
───────────────────────────────────────── */
function animCount(elId, target, suffix, duration) {
  const el = document.getElementById(elId);
  if (!el) return;
  let value = 0;
  const step = target / (duration / 16);
  const iv = setInterval(() => {
    value += step;
    if (value >= target) { value = target; clearInterval(iv); }
    el.textContent = Math.floor(value) + suffix;
  }, 16);
}

window.addEventListener('load', () => {
  setTimeout(() => {
    animCount('s1', 5000, '+', 1800);
    animCount('s2', 12,   'T', 1800);
    animCount('s3', 40,   '+', 1800);
  }, 700);
});
