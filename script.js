const header = document.querySelector('.site-header');
const nav = document.querySelector('.main-nav');
const indicator = document.querySelector('.nav-indicator');
const navLinks = [...document.querySelectorAll('.nav-link')];
const sections = [...document.querySelectorAll('.section')];
const menuToggle = document.querySelector('.menu-toggle');
const progressBar = document.querySelector('.page-progress span');

// Current year
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

// Smooth anchor scrolling with fixed-header compensation.
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (event) => {
    const id = anchor.getAttribute('href');
    const target = id && document.querySelector(id);
    if (!target) return;

    event.preventDefault();
    const y = target.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: y, behavior: 'smooth' });

    document.body.classList.remove('menu-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  });
});

// Mobile menu
menuToggle?.addEventListener('click', () => {
  const open = document.body.classList.toggle('menu-open');
  menuToggle.setAttribute('aria-expanded', String(open));
});

// O indicador é uma única cápsula animada: segue a secção ativa e antecipa o hover.
let activeSectionId = 'inicio';
let navHoveredLink = null;
let scrollFrame = 0;
let scrollLockUntil = 0;

function moveIndicator(link) {
  if (!indicator || !nav || !link || window.innerWidth <= 820) return;
  const navRect = nav.getBoundingClientRect();
  const linkRect = link.getBoundingClientRect();
  indicator.style.width = `${linkRect.width}px`;
  indicator.style.transform = `translate3d(${linkRect.left - navRect.left - 4}px, 0, 0)`;
}

function paintNav() {
  const selected = navHoveredLink || navLinks.find(link => link.dataset.section === activeSectionId);
  navLinks.forEach(link => {
    const selectedHere = link === selected;
    link.classList.toggle('active', selectedHere);
    if (link.dataset.section === activeSectionId) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  moveIndicator(selected);
  header?.classList.toggle('is-green', document.getElementById(activeSectionId)?.dataset.theme === 'green');
}

// Segue o rato e regressa à secção atual quando sai do menu.
navLinks.forEach(link => {
  link.addEventListener('pointerenter', event => {
    if (event.pointerType === 'touch' || window.innerWidth <= 820) return;
    navHoveredLink = link;
    paintNav();
  });
  link.addEventListener('focus', () => {
    if (window.innerWidth > 820) { navHoveredLink = link; paintNav(); }
  });
  link.addEventListener('blur', () => {
    navHoveredLink = null;
    paintNav();
  });
  link.addEventListener('click', () => {
    activeSectionId = link.dataset.section;
    navHoveredLink = null;
    scrollLockUntil = performance.now() + 850;
    paintNav();
  });
});
nav?.addEventListener('pointerleave', () => { navHoveredLink = null; paintNav(); });

// Um único cálculo por frame evita saltos na transição ao fazer scroll.
function updateActiveFromScroll() {
  scrollFrame = 0;
  if (performance.now() < scrollLockUntil) return;
  const checkY = Math.min(window.innerHeight * .38, 340);
  let current = sections[0];
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= checkY) current = section;
    else break;
  }
  if (current && current.id !== activeSectionId) {
    activeSectionId = current.id;
    paintNav();
  }
}
window.addEventListener('scroll', () => {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateActiveFromScroll);
}, { passive: true });
window.addEventListener('resize', () => {
  updateActiveFromScroll();
  paintNav();
});

// Reveal animations
const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    observer.unobserve(entry.target);
  });
}, { threshold: .14 });

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

// Reading / page progress bar
function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const pct = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0;
  progressBar.style.width = `${pct}%`;
}
window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

// Subtle image/book tilt. Disabled for touch / reduced-motion users.
const canTilt = window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (canTilt) {
  document.querySelectorAll('[data-tilt]').forEach((el) => {
    el.addEventListener('mousemove', (event) => {
      const rect = el.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      const base = el.classList.contains('book-mockup') ? -5 : 0;
      el.style.transform = `perspective(900px) rotateX(${-y * 4}deg) rotateY(${x * 6}deg) rotateZ(${base}deg) translateY(-3px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = el.classList.contains('book-mockup') ? 'rotate(-5deg)' : '';
    });
  });

  // Magnetic CTA movement
  document.querySelectorAll('.magnetic').forEach((el) => {
    el.addEventListener('mousemove', (event) => {
      const rect = el.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * .045}px, ${y * .08}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });

  // Floating hero notes react softly to pointer movement
  const hero = document.querySelector('.hero');
  hero?.addEventListener('mousemove', (event) => {
    const x = event.clientX / window.innerWidth - .5;
    const y = event.clientY / window.innerHeight - .5;
    document.querySelectorAll('[data-parallax]').forEach((el) => {
      const amount = Number(el.dataset.parallax || 10);
      el.style.translate = `${x * amount}px ${y * amount}px`;
    });
  });
}

window.addEventListener('load', () => {
  updateActiveFromScroll();
  paintNav();
  document.querySelectorAll('.hero .reveal').forEach((el) => el.classList.add('is-visible'));
});
