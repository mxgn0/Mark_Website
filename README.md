# WELKLOHS — Internetauftritt & Buchungssystem

Werkstatt & Tuning Website für WELKLOHS.

## Struktur

```
WELKLOHS_Website/
├── index.html              # Startseite
├── preview.html            # Vorschau: Farbwelten + Button-Formen (nicht öffentlich verlinkt)
├── css/
│   ├── style.css           # Styling (Dark/Light Theme)
│   └── preview.css         # nur für preview.html
├── js/
│   ├── main.js             # Navigation, Theme-Toggle, Scroll
│   └── calendar.js         # Buchungskalender (→ Cloudflare Worker)
├── pages/
│   ├── admin.html          # Admin-Panel (Buchungen, Slots sperren)
│   ├── impressum.html
│   ├── datenschutz.html
│   └── Agb.html
├── assets/
│   ├── images/
│   │   └── hero.jpg
│   └── videos/
├── fonts/
│   └── Avenir/             # Lokale Schriftarten (Light–Black)
└── README.md
```


Die Site ist dann erreichbar unter:  
https://mxgn0.github.io/Mark_Website/

Admin Kalender:
https://mxgn0.github.io/Mark_Website/pages/admin.html

Vorschau Farben/Buttons (Toolbar unten links, nirgends verlinkt):
https://mxgn0.github.io/Mark_Website/preview.html

## Buchungen → Notion

Anleitung, wie Website-Buchungen in Marks eigenem Notion (und Notion Calendar)
landen: [`docs/notion-einrichtung.md`](docs/notion-einrichtung.md).
