// ===========================
// MARK GARAGE — main.js
// (Cookie & Burger laufen inline im HTML — hier nur Extras)
// ===========================

// iOS: beim Laden immer oben starten
window.scrollTo(0, 0);

document.addEventListener('DOMContentLoaded', () => {

  // ─── NAV SCROLL ───
  const nav = document.getElementById('mainNav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  // ─── HERO IMAGE LOAD ───
  const hero = document.querySelector('.hero');
  if (hero) {
    requestAnimationFrame(() => hero.classList.add('loaded'));
  }

  // ─── SCROLL FADE-IN ───
  const fadeEls = document.querySelectorAll(
    '.leistung-card, .stat, .kontakt-card, .standort__item'
  );

  if ('IntersectionObserver' in window) {
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
  }

  // ─── TERMIN FORM ───
  const form = document.getElementById('terminForm');
  if (form) {
    const datumInput = document.getElementById('datum');
    if (datumInput) {
      datumInput.min = new Date().toISOString().split('T')[0];
    }
    form.addEventListener('submit', () => {
      const btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.textContent = 'Wird gesendet...'; btn.disabled = true; }
    });
  }

});
