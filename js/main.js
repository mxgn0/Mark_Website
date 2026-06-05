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
