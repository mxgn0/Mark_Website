// ===========================
// MARK GARAGE — main.js
// ===========================

document.addEventListener('DOMContentLoaded', () => {

  // ─── NAV: Scroll behavior ───
  const nav = document.querySelector('.nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 60) {
        nav.style.padding = '12px 48px';
      } else {
        nav.style.padding = '20px 48px';
      }
    }, { passive: true });
  }

  // ─── FADE IN on scroll ───
  const fadeEls = document.querySelectorAll('.leistung-card, .projekt-item, .video-wrapper');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  fadeEls.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = `opacity 0.6s ease ${i * 0.08}s, transform 0.6s ease ${i * 0.08}s`;
    observer.observe(el);
  });

  // ─── HERO: Subtle parallax ───
  const hero = document.querySelector('.hero');
  if (hero) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      hero.style.backgroundPositionY = `${y * 0.3}px`;
    }, { passive: true });
  }

});
