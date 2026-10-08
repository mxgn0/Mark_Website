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

  // ─── SOCIAL-BUTTONS: ab und zu dezent aufleuchten ───
  // Nur wenn der Bereich zu sehen ist, frühestens 2,5 s nach dem Reinscrollen,
  // danach 21–30 s Pause (= höchstens 3× pro Minute), immer der nächste Button.
  const socialBox = document.querySelector('.social');
  const socialLinks = document.querySelectorAll('.social__link');
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (socialBox && socialLinks.length && !calm && 'IntersectionObserver' in window) {
    let visibleSince = 0, lastGlow = 0, pause = 0, next = 0;
    new IntersectionObserver(([e]) => {
      visibleSince = e.isIntersecting ? Date.now() : 0;
    }, { threshold: 0.6 }).observe(socialBox);

    setInterval(() => {
      const now = Date.now();
      if (!visibleSince || document.hidden) return;
      if (now - visibleSince < 2500 || now - lastGlow < pause) return;
      const el = socialLinks[next++ % socialLinks.length];
      el.classList.remove('is-glowing');
      void el.offsetWidth;                       // Animation sicher neu starten
      el.classList.add('is-glowing');
      setTimeout(() => el.classList.remove('is-glowing'), 3200);
      lastGlow = now;
      pause = 21000 + Math.random() * 9000;
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
