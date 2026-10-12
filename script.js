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

function moveIndicator(link) {
  if (!indicator || window.innerWidth <= 820 || !link) return;
  const navRect = nav.getBoundingClientRect();
  const linkRect = link.getBoundingClientRect();
  indicator.style.width = `${linkRect.width}px`;
  indicator.style.transform = `translateX(${linkRect.left - navRect.left - 4}px)`;
}

function setActiveSection(id) {
  navLinks.forEach((link) => link.classList.toggle('active', link.dataset.section === id));
  moveIndicator(navLinks.find((link) => link.dataset.section === id));
  const section = document.getElementById(id);
  header?.classList.toggle('is-green', section?.dataset.theme === 'green');
}

// Scroll spy tuned around the middle of the viewport.
const spy = new IntersectionObserver((entries) => {
  const visible = entries
    .filter((entry) => entry.isIntersecting)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (visible) setActiveSection(visible.target.id);
}, { rootMargin: '-32% 0px -52% 0px', threshold: [0, .2, .5, .8] });

sections.forEach((section) => spy.observe(section));

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

window.addEventListener('resize', () => {
  const active = document.querySelector('.nav-link.active');
  moveIndicator(active);
});

window.addEventListener('load', () => {
  moveIndicator(document.querySelector('.nav-link.active'));
  document.querySelectorAll('.hero .reveal').forEach((el) => el.classList.add('is-visible'));
});
