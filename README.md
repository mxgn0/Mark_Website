# Mark_Website
# Mark Garage — Website

Werkstatt & Tuning Website für Mark Garage.

## Struktur

```
mark-garage/
├── index.html              # Startseite
├── css/
│   └── style.css           # Styling (dark, industrial)
├── js/
│   └── main.js             # Animationen, Scroll-Effekte
├── pages/
│   ├── impressum.html
│   ├── datenschutz.html
│   └── kontakt.html
└── assets/
    ├── images/             # Fotos der Projekte, Werkstatt etc.
    │   ├── projekt-01.jpg
    │   ├── projekt-02.jpg
    │   ├── projekt-03.jpg
    │   ├── projekt-04.jpg
    │   └── video-poster.jpg
    └── videos/
        └── showreel.mp4    # Optionales Video (autoplay, muted)
```

## Inhalte eintragen / anpassen

### Pflicht (vor Go-Live)

- [ ] `pages/impressum.html` → Adresse, Telefon, USt-ID eintragen
- [ ] `pages/datenschutz.html` → Adresse eintragen
- [ ] `pages/kontakt.html` → Adresse, Telefon, Formspree-ID eintragen
- [ ] `index.html` → Projekt-Namen in der Grid-Section anpassen
- [ ] Bilder in `assets/images/` ablegen (Dateinamen: `projekt-01.jpg` bis `projekt-04.jpg`)

### Optional

- [ ] Video in `assets/videos/showreel.mp4` ablegen
- [ ] `assets/images/video-poster.jpg` als Standbild für Video
- [ ] Favicon hinzufügen (`<link rel="icon" href="assets/images/favicon.ico">`)

## Kontaktformular

Das Formular in `pages/kontakt.html` nutzt [Formspree](https://formspree.io) (kostenlos bis 50 Einreichungen/Monat).

1. Konto auf formspree.io erstellen
1. Neues Formular anlegen → Form-ID kopieren
1. In `kontakt.html` ersetzen: `[DEINE-FORMSPREE-ID]` → deine ID

## GitHub Pages aktivieren

Im Repository → Settings → Pages → Branch: `main` / Folder: `/ (root)` → Save

Die Site ist dann erreichbar unter:  
`https://Mxgn0.github.io/mark-garage/`

## Deployment

```bash
git add .
git commit -m "update content"
git push
```

GitHub Pages updated automatisch nach jedem Push.