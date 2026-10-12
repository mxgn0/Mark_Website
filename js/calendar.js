/* ============================================================
   WELKLOHS – Buchungskalender
   ============================================================ */

const WORKER_URL = 'https://bookings.mxgn-studio.workers.dev'; // ← anpassen!

/* Farbspektrum des Lotus-Logos, von Hellblau ueber Blau nach Violett.
   Index = Wochentag (0 = Sonntag). Wird nur als Umrandung sichtbar. */
const SPEKTRUM = ['#2A0098', '#66A8FF', '#2E8FFF', '#0075FF', '#1B4BFF', '#2340FF', '#4A1CC4'];

const CalendarWidget = {
  el: null,
  month: null,
  year: null,
  data: null,
  selDate: null,
  selTime: null,

  /* ---- Bootstrap ---- */
  init(selector) {
    this.el = document.querySelector(selector);
    if (!this.el) return;
    const now = new Date();
    this.month = now.getMonth();
    this.year  = now.getFullYear();
    this.shell();
    this.load();
  },

  /* ---- Grundgerüst ---- */
  shell() {
    this.el.innerHTML = `
      <div class="cal">
        <div class="cal__head">
          <button class="cal__arrow" data-d="-1">‹</button>
          <span class="cal__title"></span>
          <button class="cal__arrow" data-d="1">›</button>
        </div>
        <div class="cal__weekdays">
          <span>Mo</span><span>Di</span><span>Mi</span><span>Do</span><span>Fr</span><span>Sa</span><span>So</span>
        </div>
        <div class="cal__grid"></div>
        <div class="cal__slots"></div>
        <div class="cal__form"></div>
      </div>`;
    this.el.querySelectorAll('.cal__arrow').forEach(b =>
      b.addEventListener('click', () => this.navigate(+b.dataset.d)));
  },

  navigate(dir) {
    this.month += dir;
    if (this.month > 11) { this.month = 0; this.year++; }
    if (this.month < 0)  { this.month = 11; this.year--; }
    this.selDate = null; this.selTime = null;
    this.el.querySelector('.cal__slots').innerHTML = '';
    this.el.querySelector('.cal__form').innerHTML = '';
    this.load();
  },

  /* ---- Daten laden ---- */
  async load() {
    const key = `${this.year}-${String(this.month + 1).padStart(2, '0')}`;
    const grid = this.el.querySelector('.cal__grid');
    grid.innerHTML = '<p class="cal__loading">Laden …</p>';
    try {
      const r = await fetch(`${WORKER_URL}/api/availability?month=${key}`);
      this.data = await r.json();
      this.renderGrid();
    } catch {
      grid.innerHTML = '<p class="cal__error">Verbindung fehlgeschlagen.</p>';
    }
  },

  /* ---- Freie Zeiten eines Tages (Zeiten aus zeiten.js, heute nur die kommenden) ---- */
  freeSlots(ds) {
    const [y, m, d] = ds.split('-').map(Number);
    const dt  = new Date(y, m - 1, d);
    const bt  = this.data.blocked[ds] || [];
    const bk  = this.data.booked[ds]  || [];
    if (bt.includes('all')) return [];
    const now = new Date();
    const jetzt = dt.toDateString() === now.toDateString()
      ? `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}` : '';
    return terminSlots(dt.getDay()).filter(s => !bt.includes(s) && !bk.includes(s) && s > jetzt);
  },

  /* ---- Monatsraster ---- */
  renderGrid() {
    const d = this.data;
    const names = ['Januar','Februar','März','April','Mai','Juni',
                   'Juli','August','September','Oktober','November','Dezember'];
    this.el.querySelector('.cal__title').textContent = `${names[this.month]} ${this.year}`;

    const grid = this.el.querySelector('.cal__grid');
    grid.innerHTML = '';

    const first  = new Date(this.year, this.month, 1).getDay();
    const offset = first === 0 ? 6 : first - 1;          // Mo = 0
    const days   = new Date(this.year, this.month + 1, 0).getDate();
    const today  = new Date(); today.setHours(0,0,0,0);
    const mm     = `${this.year}-${String(this.month + 1).padStart(2, '0')}`;

    for (let i = 0; i < offset; i++) {
      const s = document.createElement('span');
      s.className = 'cal__day cal__day--empty';
      grid.appendChild(s);
    }

    for (let n = 1; n <= days; n++) {
      const ds  = `${mm}-${String(n).padStart(2, '0')}`;
      const dt  = new Date(this.year, this.month, n);
      const dow = dt.getDay();
      const work   = terminSlots(dow).length > 0;
      const past   = dt < today;
      const blocked = d.blocked[ds]?.includes('all');
      const free   = work && !past ? this.freeSlots(ds).length : 0;

      const btn = document.createElement('button');
      btn.className = 'cal__day';
      btn.textContent = n;

      if (past)                       btn.classList.add('cal__day--past');
      else if (!work)                 btn.classList.add('cal__day--off');
      else if (blocked || free === 0) btn.classList.add('cal__day--full');
      else {
        btn.classList.add('cal__day--free');
        // Jeder Wochentag bekommt seine Farbe aus dem Spektrum des Logos.
        // Sichtbar wird sie nur beim Hover und bei der Auswahl - als Umrandung.
        btn.style.setProperty('--hov', SPEKTRUM[dow]);
        btn.title = free === 1 ? 'Noch 1 Termin frei' : `Noch ${free} Termine frei`;
        btn.addEventListener('click', () => this.pickDate(ds));
      }
      if (dt.getTime() === today.getTime()) btn.classList.add('cal__day--today');
      if (ds === this.selDate) btn.classList.add('cal__day--sel');
      grid.appendChild(btn);
    }
  },

  /* ---- Tag gewählt → Uhrzeit wählen ---- */
  pickDate(ds) {
    this.selDate = ds; this.selTime = null;
    this.renderGrid();
    this.el.querySelector('.cal__form').innerHTML = '';

    const free = this.freeSlots(ds);

    const [y, m, d] = ds.split('-');
    const dn = ['So','Mo','Di','Mi','Do','Fr','Sa'][new Date(+y, m - 1, +d).getDay()];

    const wrap = this.el.querySelector('.cal__slots');
    // Auswahlfeld erbt die Farbe des gewaehlten Tages
    wrap.style.setProperty('--hov', SPEKTRUM[new Date(+y, m - 1, +d).getDay()]);
    // Natives Auswahlfeld: am iPhone ein Drehrad, am Rechner eine Liste —
    // bei 20 halbstündlichen Zeiten übersichtlicher als lauter Kacheln.
    wrap.innerHTML = `
      <div class="form-group cal__time">
        <label for="bkZeit">${dn}, ${d}.${m}.${y} · Uhrzeit</label>
        <select id="bkZeit">
          <option value="" disabled selected>Uhrzeit wählen …</option>
          ${free.map(s => `<option value="${s}">${s} Uhr</option>`).join('')}
        </select>
      </div>`;
    const sel = wrap.querySelector('select');
    sel.addEventListener('change', () => {
      this.selTime = sel.value;
      sel.classList.add('is-set');
      this.showForm();
    });
  },

  /* ---- Buchungsformular ---- */
  showForm() {
    const [y, m, d] = this.selDate.split('-');
    const wrap = this.el.querySelector('.cal__form');
    const label = `Termin am ${d}.${m}.${y} um ${this.selTime} Uhr`;
    // Uhrzeit nur geändert → Formular samt Eingaben stehen lassen
    if (wrap.querySelector('#bkSend')) {
      wrap.querySelector('.cal__form-label').textContent = label;
      return;
    }
    wrap.innerHTML = `
      <p class="cal__form-label">${label}</p>
      <div class="form-row">
        <div class="form-group"><label>Vorname *</label>
          <input type="text" id="bkV" required placeholder="Max"></div>
        <div class="form-group"><label>Nachname *</label>
          <input type="text" id="bkN" required placeholder="Mustermann"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Telefon *</label>
          <input type="tel" id="bkT" required placeholder="+49 151 …"></div>
        <div class="form-group"><label>E-Mail</label>
          <input type="email" id="bkE" placeholder="deine@mail.de"></div>
      </div>
      <div class="form-group"><label>Fahrzeug *</label>
        <input type="text" id="bkF" required placeholder="z.B. VW Golf 7 GTI, Bj. 2018"></div>
      <div class="form-group"><label>Anliegen</label>
        <textarea id="bkA" placeholder="Was soll gemacht / angeschaut werden?"></textarea></div>
      <div class="form-group"><label>Wie möchtest Du zur Terminbestätigung kontaktiert werden? *</label>
        <select id="bkKontakt" required>
          <option value="whatsapp">WhatsApp</option>
          <option value="sms">SMS</option>
          <option value="email">E-Mail</option>
          <option value="telefon">Telefon</option>
        </select></div>
      <div class="form-group form-group--check">
        <label class="checkbox-label">
          <input type="checkbox" id="bkNeu">
          <span>Ich bin Neukunde und möchte die kostenfreie Erstinspektion nutzen</span>
        </label>
      </div>
      <div class="form-group form-group--check">
        <label class="checkbox-label">
          <input type="checkbox" id="bkDS" required>
          <span>Ich habe die <a href="pages/datenschutz.html">Datenschutzerklärung</a> gelesen und stimme zu *</span>
        </label>
      </div>
      <button class="btn btn--full" id="bkSend">Termin verbindlich buchen</button>
      <p class="form-hint">* Pflichtfelder</p>
      <div class="cal__msg"></div>`;
    document.getElementById('bkSend').addEventListener('click', () => this.book());
  },

  /* ---- Absenden ---- */
  async book() {
    const v  = id => document.getElementById(id)?.value.trim();
    const ch = id => document.getElementById(id)?.checked;
    const msg = this.el.querySelector('.cal__msg');
    const btn = document.getElementById('bkSend');

    const vorname  = v('bkV'), nachname = v('bkN'), telefon = v('bkT');
    const email    = v('bkE'), fahrzeug = v('bkF'), anliegen = v('bkA');
    const kontakt  = v('bkKontakt');
    const neukunde = ch('bkNeu'), dsgvo = ch('bkDS');

    if (!vorname || !nachname || !telefon || !fahrzeug) {
      msg.textContent = 'Bitte alle Pflichtfelder ausfüllen.';
      msg.className = 'cal__msg cal__msg--err'; return;
    }
    if (kontakt === 'email' && !email) {
      msg.textContent = 'Für die Benachrichtigung per E-Mail bitte Deine E-Mail-Adresse angeben.';
      msg.className = 'cal__msg cal__msg--err'; return;
    }
    if (!dsgvo) {
      msg.textContent = 'Bitte der Datenschutzerklärung zustimmen.';
      msg.className = 'cal__msg cal__msg--err'; return;
    }

    btn.disabled = true; btn.textContent = 'Wird gebucht …';

    try {
      const r = await fetch(`${WORKER_URL}/api/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: this.selDate, time: this.selTime,
          name: `${vorname} ${nachname}`, phone: telefon,
          email, vehicle: fahrzeug, notes: anliegen, newCustomer: neukunde,
          contactVia: kontakt
        })
      });
      const j = await r.json();

      if (j.success) {
        this.el.querySelector('.cal__slots').innerHTML = '';
        this.el.querySelector('.cal__form').innerHTML = `
          <div class="cal__ok">
            <span class="cal__ok-icon"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8 12.4l2.8 2.8L16 9.8"/></svg></span>
            <p class="cal__ok-title">Termin gebucht!</p>
            <p>Wir melden uns innerhalb von 24 h zur Bestätigung.</p>
          </div>`;
        this.load();
      } else {
        msg.textContent = j.error || 'Fehler bei der Buchung.';
        msg.className = 'cal__msg cal__msg--err';
        btn.disabled = false; btn.textContent = 'Termin verbindlich buchen';
      }
    } catch {
      msg.textContent = 'Verbindungsfehler – bitte erneut versuchen.';
      msg.className = 'cal__msg cal__msg--err';
      btn.disabled = false; btn.textContent = 'Termin verbindlich buchen';
    }
  }
};

document.addEventListener('DOMContentLoaded', () => CalendarWidget.init('#cal-booking'));
