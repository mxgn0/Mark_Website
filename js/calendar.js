/* ============================================================
   WELKLOHS – Buchungskalender
   ============================================================ */

const WORKER_URL = 'https://DEIN-WORKER.workers.dev'; // ← anpassen!

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
      const work   = d.workDays.includes(dow);
      const past   = dt < today;
      const blocked = d.blocked[ds]?.includes('all');

      let free = 0;
      if (work && !past && !blocked) {
        const bt = d.blocked[ds] || [];
        const bk = d.booked[ds]  || [];
        free = d.slots.filter(s => !bt.includes(s) && !bk.includes(s)).length;
      }

      const btn = document.createElement('button');
      btn.className = 'cal__day';
      btn.textContent = n;

      if (past)                       btn.classList.add('cal__day--past');
      else if (!work)                 btn.classList.add('cal__day--off');
      else if (blocked || free === 0) btn.classList.add('cal__day--full');
      else {
        btn.classList.add('cal__day--free');
        btn.addEventListener('click', () => this.pickDate(ds));
      }
      if (ds === this.selDate) btn.classList.add('cal__day--sel');
      grid.appendChild(btn);
    }
  },

  /* ---- Tag gewählt → Slots zeigen ---- */
  pickDate(ds) {
    this.selDate = ds; this.selTime = null;
    this.renderGrid();
    this.el.querySelector('.cal__form').innerHTML = '';

    const bt = this.data.blocked[ds] || [];
    const bk = this.data.booked[ds]  || [];
    const free = this.data.slots.filter(s => !bt.includes(s) && !bk.includes(s));

    const [y, m, d] = ds.split('-');
    const dn = ['So','Mo','Di','Mi','Do','Fr','Sa'][new Date(+y, m - 1, +d).getDay()];

    const wrap = this.el.querySelector('.cal__slots');
    wrap.innerHTML = `
      <p class="cal__slots-label">${dn}, ${d}.${m}.${y}</p>
      <div class="cal__slots-grid">
        ${free.map(s => `<button class="cal__slot" data-t="${s}">${s}</button>`).join('')}
      </div>`;
    wrap.querySelectorAll('.cal__slot').forEach(b =>
      b.addEventListener('click', () => {
        this.selTime = b.dataset.t;
        wrap.querySelectorAll('.cal__slot').forEach(x => x.classList.remove('cal__slot--sel'));
        b.classList.add('cal__slot--sel');
        this.showForm();
      }));
  },

  /* ---- Buchungsformular ---- */
  showForm() {
    const [y, m, d] = this.selDate.split('-');
    const wrap = this.el.querySelector('.cal__form');
    wrap.innerHTML = `
      <p class="cal__form-label">Termin am ${d}.${m}.${y} um ${this.selTime} Uhr</p>
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
      <div class="form-group"><label>Wie möchtest du zur Terminbestätigung kontaktiert werden? *</label>
        <select id="bkKontakt" required>
          <option value="whatsapp">WhatsApp</option>
          <option value="sms">SMS</option>
          <option value="email">E-Mail</option>
          <option value="telegram">Telegram</option>
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
      msg.textContent = 'Für die Benachrichtigung per E-Mail bitte deine E-Mail-Adresse angeben.';
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
            <span class="cal__ok-icon">✓</span>
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
