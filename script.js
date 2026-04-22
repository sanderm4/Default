// Mobile navigation toggle
const toggle = document.querySelector('.nav-toggle');
const navList = document.getElementById('primary-nav');

if (toggle && navList) {
  toggle.addEventListener('click', () => {
    const open = navList.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  navList.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navList.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Reveal-on-scroll
const revealTargets = document.querySelectorAll(
  '.section-head, .card, .price-card, .steps li, .quote, .contact-form, .portrait, .stack'
);
revealTargets.forEach((el) => el.classList.add('reveal'));

const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 }
);
revealTargets.forEach((el) => io.observe(el));

// Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Contact form – friendly local feedback (no backend)
const form = document.querySelector('.contact-form');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.querySelector('#name');
    const email = form.querySelector('#email');
    if (!name.value.trim() || !email.value.trim()) {
      const note = form.querySelector('.form-note');
      note.textContent = 'Vennligst fyll inn navn og e-post.';
      note.style.color = '#a2574a';
      return;
    }
    form.innerHTML =
      '<div style="text-align:center;padding:28px 0;">' +
      '<p style="font-family:\'Cormorant Garamond\',serif;font-size:1.6rem;color:#8c5d4f;margin:0 0 8px;">Tusen takk!</p>' +
      '<p style="color:#6c5a55;margin:0;">Vi tar kontakt med deg innen 1–2 virkedager.</p>' +
      '</div>';
  });
}
