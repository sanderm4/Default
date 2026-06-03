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

// Reveal-on-scroll – triggers as soon as element edges into view
const revealTargets = document.querySelectorAll(
  '.section-head, .treatment, .price-extras, .steps li, .reviews-carousel, .faq-item, .contact-form, .portrait, .stack'
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
  { threshold: 0, rootMargin: '0px 0px -5% 0px' }
);
revealTargets.forEach((el) => io.observe(el));

// Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Pre-fill behandling-dropdown when clicking treatment cards / extra rows / faq-CTA
function jumpToContact(treatment) {
  const select = document.getElementById('treatment');
  if (select && treatment) {
    const match = Array.from(select.options).find(
      (o) => o.value === treatment || o.textContent.trim() === treatment
    );
    if (match) select.value = match.value || match.textContent.trim();
  }
  const target = document.getElementById('kontakt');
  if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.querySelectorAll('[data-treatment]').forEach((el) => {
  const treatment = el.getAttribute('data-treatment');
  const handler = (e) => {
    if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
    if (el.tagName === 'A' && el.getAttribute('href')) {
      // anchor with href – let default jump happen, just set the dropdown
      jumpToContact(treatment);
      return;
    }
    e.preventDefault();
    jumpToContact(treatment);
  };
  el.addEventListener('click', handler);
  if (el.getAttribute('tabindex') !== null) {
    el.addEventListener('keydown', handler);
  }
});

// Reviews carousel – infinite loop, always 3 visible, shift 2 per click
(function () {
  const carousel = document.querySelector('.reviews-carousel');
  if (!carousel) return;
  const track = carousel.querySelector('.reviews-track');
  const prevBtn = carousel.querySelector('.reviews-prev');
  const nextBtn = carousel.querySelector('.reviews-next');

  const orig = Array.from(track.children);
  const N = orig.length;

  // Build track: [N pre-clones, N originals, N post-clones]
  const preFrag = document.createDocumentFragment();
  const postFrag = document.createDocumentFragment();
  orig.forEach(s => preFrag.appendChild(s.cloneNode(true)));
  orig.forEach(s => postFrag.appendChild(s.cloneNode(true)));
  track.insertBefore(preFrag, track.firstChild);
  track.appendChild(postFrag);

  const all = Array.from(track.children); // 3*N slides total
  let cur = N; // index of leftmost visible slide (start at first original)
  let busy = false;

  function perPage() {
    if (window.innerWidth <= 599) return 1;
    if (window.innerWidth <= 819) return 2;
    return 3;
  }

  function snapTo(i) {
    cur = i;
    track.style.transition = 'none';
    void track.offsetWidth;
    track.style.transform = 'translateX(' + -all[i].offsetLeft + 'px)';
  }

  function slideTo(i) {
    cur = i;
    track.style.transition = 'transform .5s cubic-bezier(.4, 0, .2, 1)';
    track.style.transform = 'translateX(' + -all[i].offsetLeft + 'px)';
  }

  track.addEventListener('transitionend', () => {
    busy = false;
    if (cur >= 2 * N) snapTo(cur - N);
    else if (cur < N) snapTo(cur + N);
  });

  function go(dir) {
    if (busy) return;
    busy = true;
    const step = perPage() >= 3 ? 2 : 1;
    slideTo(cur + dir * step);
  }

  if (prevBtn) prevBtn.addEventListener('click', () => go(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => go(1));
  [prevBtn, nextBtn].forEach(b => { if (b) b.classList.remove('hidden'); });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => snapTo(cur), 150);
  });

  snapTo(N);
})();

// Contact form – Web3Forms submission with GDPR check
const form = document.querySelector('.contact-form');
if (form) {
  const note = form.querySelector('.form-note');
  const setNote = (msg, color) => {
    note.textContent = msg;
    note.style.color = color || '';
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = form.querySelector('#name');
    const email = form.querySelector('#email');
    const consent = form.querySelector('#consent');

    if (!name.value.trim() || !email.value.trim()) {
      setNote('Vennligst fyll inn navn og e-post.', '#a2574a');
      return;
    }
    if (!consent.checked) {
      setNote('Du må samtykke til behandling av personopplysninger.', '#a2574a');
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sender …';
    setNote('', '');

    try {
      const data = new FormData(form);
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });
      const result = await response.json();

      if (response.ok && result.success) {
        form.innerHTML =
          '<div style="text-align:center;padding:28px 0;">' +
          '<p style="font-family:\'Cormorant Garamond\',serif;font-size:1.9rem;color:#46301f;margin:0 0 8px;">Tusen takk!</p>' +
          '<p style="color:#3d2d22;margin:0;">Jeg tar kontakt innen 1–2 virkedager.</p>' +
          '</div>';
      } else {
        throw new Error(result.message || 'Ukjent feil');
      }
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send forespørsel';
      setNote('Beklager, noe gikk galt. Prøv igjen, eller send en e-post i stedet.', '#a2574a');
    }
  });
}
