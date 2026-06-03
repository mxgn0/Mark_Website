// ===========================
// MARK GARAGE — main.js
// ===========================

document.addEventListener('DOMContentLoaded', () => {

  // ─── COOKIE BANNER ───
  const banner   = document.getElementById('cookieBanner');
  const accept   = document.getElementById('cookieAccept');
  const reject   = document.getElementById('cookieReject');

  if (banner) {
    const consent = localStorage.getItem('mg-cookie-consent');
    if (consent) {
      banner.classList.add('hidden');
    }

    accept?.addEventListener('click', () => {
      localStorage.setItem('mg-cookie-consent', 'accepted');
      banner.classList.add('hidden');
    });

    reject?.addEventListener('click', () => {
      localStorage.setItem('mg-cookie-consent', 'rejected');
      banner.classList.add('hidden');
    });
  }

  // ─── NAV SCROLL ───
  const nav = document.getElementById('mainNav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  // ─── MOBILE MENU ───
  const burger     = document.getElementById('navBurger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  burger?.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // ─── HERO IMAGE LOAD ───
  const hero = document.querySelector('.hero');
  if (hero) {
    setTimeout(() => hero.classList.add('loaded'), 100);
  }

  // ─── SCROLL FADE-IN ───
  const fadeEls = document.querySelectorAll(
    '.leistung-card, .stat, .kontakt-card, .standort__item, .termin__badge'
  );

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, i * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  fadeEls.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });

  // ─── TERMIN FORM ───
  const form = document.getElementById('terminForm');
  if (form) {
    // Min-Date: heute
    const datumInput = document.getElementById('datum');
    if (datumInput) {
      const today = new Date().toISOString().split('T')[0];
      datumInput.min = today;
    }

    form.addEventListener('submit', async (e) => {
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.textContent = 'Wird gesendet...';
      submitBtn.disabled = true;
      // Formspree übernimmt den Rest
    });
  }

});
