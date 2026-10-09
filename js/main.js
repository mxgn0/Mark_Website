// ===========================
// WELKLOHS — main.js
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

  // ─── AUFLEUCHTEN: ab und zu ein klickbares Element in seiner Akzentfarbe ───
  // Zufällig eins, das gerade ganz im Bild ist (nie zweimal dasselbe), frühestens
  // 4 s nach dem Laden, danach 20–30 s Pause (= höchstens 3× pro Minute).
  // Die Navigation ist immer zu sehen — damit nicht fast nur sie leuchtet,
  // kommt sie nur in jedem vierten Fall dran. Farben und Art: style.css.
  const GLOW = '.nav__links a, .btn, .theme-toggle, .termin__to-kontakt, .kontakt-card, .social__link, ' +
               '.cal__arrow, .cal__day--free:not(.cal__day--sel), .cal__slot:not(.cal__slot--sel), ' +
               '.intro__text a, .footer__nav a, .footer__legal a';
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const inView = el => {
    if (el.disabled || el.closest('.mobile-menu, .cookie-banner') || el.matches(':hover, :focus')) return false;
    if (el.checkVisibility ? !el.checkVisibility({ opacityProperty: true, visibilityProperty: true })
                           : getComputedStyle(el).opacity === '0') return false;
    const r = el.getBoundingClientRect();
    const top = el.closest('.nav') || !nav ? 0 : nav.getBoundingClientRect().bottom;
    return r.width > 0 && r.top >= top && r.bottom <= window.innerHeight;
  };

  if (!calm) {
    let last = null, next = Date.now() + 4000;
    setInterval(() => {
      if (document.hidden || Date.now() < next) return;
      const pool = [...document.querySelectorAll(GLOW)].filter(el => el !== last && inView(el));
      const inNav = pool.filter(el => el.closest('.nav'));
      const rest  = pool.filter(el => !el.closest('.nav'));
      const from  = rest.length && (!inNav.length || Math.random() < 0.75) ? rest : inNav;
      if (!from.length) return;
      const el = from[Math.floor(Math.random() * from.length)];
      el.classList.remove('is-glowing');
      void el.offsetWidth;                       // Animation sicher neu starten
      el.classList.add('is-glowing');
      setTimeout(() => el.classList.remove('is-glowing'), 3200);
      last = el;
      next = Date.now() + 20000 + Math.random() * 10000;
    }, 500);
  }

  // ─── TERMIN FORM ───
  // Endpoint zu Notion (Cloudflare Worker). Nach dem Deploy hier die echte URL eintragen.
  const NOTION_ENDPOINT = 'https://DEIN-WORKER.welklohs.workers.dev';

  const form = document.getElementById('terminForm');
  if (form) {
    const datumInput = document.getElementById('datum');
    if (datumInput) {
      datumInput.min = new Date().toISOString().split('T')[0];
    }

    form.addEventListener('submit', () => {
      // Häkchen-Status IMMER als Ja/Nein festschreiben
      const erst = document.getElementById('chkErstinspektion');
      const ds   = document.getElementById('chkDatenschutz');
      const hErst = document.getElementById('hidErstinspektion');
      const hDs   = document.getElementById('hidDatenschutz');
      const hZeit = document.getElementById('hidGebuchtAm');
      if (hErst && erst) hErst.value = erst.checked ? 'Ja' : 'Nein';
      if (hDs && ds)     hDs.value   = ds.checked ? 'Ja' : 'Nein';
      if (hZeit)         hZeit.value = new Date().toLocaleString('de-DE');

      // Parallel an Notion senden (nur wenn echte URL hinterlegt ist).
      // keepalive: Request läuft weiter, auch wenn die Seite danach zu Formspree wechselt.
      if (NOTION_ENDPOINT && !NOTION_ENDPOINT.includes('DEIN-')) {
        try {
          const data = Object.fromEntries(new FormData(form).entries());
          fetch(NOTION_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
            keepalive: true
          }).catch(() => {});
        } catch (err) { /* still ok: Formspree-Mail läuft weiter */ }
      }

      const btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.textContent = 'Wird gesendet...'; btn.disabled = true; }
    });
  }

});
