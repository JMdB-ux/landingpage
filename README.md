# ERDINGER Alkoholfrei Halbmarathon-Gewinnspiel 2027

Kampagnen-Landingpage für das Halbmarathon-Gewinnspiel von ERDINGER Alkoholfrei. Besucherinnen und Besucher können Starterplätze für Halbmarathons oder einen Gutschein für die Sportkollektion gewinnen. Die Website umfasst die Kampagnen-Landingpage, Teilnahme- und Statusseiten sowie die Teilnahmebedingungen.

Die Website ist eine statische Multi-Page-Anwendung mit semantischem HTML, tokenbasiertem CSS, Tailwind CSS, GSAP/ScrollTrigger und Lenis. Kampagnenbilder und lokale Schriften liegen unter `public/assets/`.

## Stack

- [Vite](https://vite.dev) als Dev-Server und Multi-Page-Build
- Vanilla HTML und Vanilla JavaScript (ES Modules)
- [Tailwind CSS 4](https://tailwindcss.com) über `@tailwindcss/vite`
- [GSAP](https://gsap.com) und ScrollTrigger
- [Lenis](https://github.com/darkroomengineering/lenis) Smooth Scroll
- npm als Paketmanager

Kein React, Vue, Angular, TypeScript, jQuery oder UI-Framework.

## Voraussetzungen

- Node.js 20.19 oder neuer
- npm 10 oder neuer

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Vite startet den lokalen Server und öffnet die Startseite. Weitere Seiten direkt aufrufen:

- `/` bzw. `/index.html`
- `/teilnahme.html`
- `/teilnahme-ende.html`
- `/teilnahmebedingungen.html`
- `/styleguide.html`

## Production Build

```bash
npm run build
npm run preview
```

`npm run build` schreibt statische Dateien nach `dist/`. `npm run preview` serviert diesen Ordner lokal.

## Projektstruktur

```text
/
├── index.html                 Landingpage
├── teilnahme.html             Teilnahmebestätigung
├── teilnahme-ende.html        Beendete Teilnahmephase
├── teilnahmebedingungen.html  Teilnahmebedingungen (Platzhalter)
├── styleguide.html            Visuelle Kontrolle des Designsystems
├── package.json
├── vite.config.js             Multi-Page-Build und Tailwind-Plugin
├── public/
│   └── assets/
│       ├── images/            Kampagnenbilder, Logos, Social-Icons und Favicons
│       ├── icons/             Erweiterungspunkt für Icons
│       └── fonts/             Lokale Webfonts (TTF)
└── src/
    ├── css/
    │   ├── main.css           Einstieg: Tailwind, Tokens, Komponenten
    │   ├── tokens.css         Design Tokens und Tailwind-Theme
    │   ├── fonts.css          @font-face-Erweiterungspunkt
    │   ├── base.css           Elementstyles
    │   ├── components.css     Semantische Komponentenklassen
    │   ├── utilities.css      Reveal-Fallbacks und kleine Utilities
    │   └── styleguide.css     Nur für styleguide.html
    └── js/
        ├── main.js            Gemeinsamer Einstieg aller Seiten
        ├── config.js          Motion, Lenis, Formular-Endpunkt
        ├── gsap.js            Zentrale Plugin-Registrierung
        ├── media.js           Breakpoints und prefers-reduced-motion
        ├── animations.js      Data-Attribute für Reveals
        ├── layer-parallax.js  Mehrschichtige Parallax-Animationen
        ├── smooth-scroll.js   Lenis + ScrollTrigger
        ├── navigation.js      Accessible Mobile-Navigation
        ├── accordion.js       details/summary mit optionaler Animation
        ├── form.js            Clientseitige Validierung
        ├── participation-api.js  Erweiterungspunkt für den echten Endpunkt
        └── styleguide.js      Live-Werte auf der Styleguide-Seite
```

Zusätzliche HTML-Seiten werden nur dann gebaut, wenn sie in `vite.config.js` registriert sind.

## Designsystem

Design Tokens liegen in `src/css/tokens.css`.

- Tokens in `@theme static` kennt Tailwind und erzeugt Utilities (`bg-primary`, `text-h2`, `py-section`, `rounded-lg`, `shadow-md`).
- Tokens in `:root` sind CSS Custom Properties für Komponenten und JavaScript (`--font-family-sans`, `--focus-ring`, `--z-header`).
- Farbnamen sind semantisch (`--color-primary`, `--color-error`), nicht an eine Palette gebunden.

Komponentenklassen in `src/css/components.css` fassen wiederkehrende UI-Bausteine zusammen. Tailwind-Utilities bleiben für Layout, Grid, Abstände und responsive Varianten.

Die Seite `styleguide.html` ist die visuelle Kontrollseite. Jede Token- oder Komponentenänderung sollte zuerst dort geprüft werden.

### Wichtige Komponentenklassen

| Klasse | Verwendung |
| --- | --- |
| `.container-site` | Standard-Contentbreite |
| `.container-site-wide` / `.container-site-narrow` | Breite bzw. schmale Variante |
| `.section` / `.section-header` | vertikaler Abschnitt und Kopfbereich |
| `.button` + `.button-primary` / `.button-secondary` / `.button-tertiary` | Buttons und Button-Links |
| `.card` / `.badge` | Karten und Status-Pills |
| `.form-group` / `.form-label` / `.form-control` / `.form-error` | Formularfelder |
| `.accordion` | FAQ und weitere Disclosure-Gruppen |

Zustände für Figma-Varianten: `.is-hover`, `.is-focus`, `.is-active` sowie native `:hover`, `:focus-visible`, `:active` und `:disabled`.

## Design Tokens anpassen

1. Farben, Typografie, Abstände, Radien und Schatten in `src/css/tokens.css` ersetzen.
2. Styleguide neu laden und Palette, Type-Scale, Buttons und Formulare prüfen.
3. Landingpage nur anfassen, wenn das Figma-Layout von den bestehenden Sektionen abweicht.

Beispiel: Primary-Farbe aus Figma:

```css
--color-primary: #2445c4;
--color-primary-hover: #1a3496;
--color-on-primary: #ffffff;
```

## Lokale Fonts

Die Kampagne verwendet Open Sans in den Schriftschnitten 600 und 700 sowie Barlow Condensed in 900 Italic. Die TTF-Dateien liegen in `public/assets/fonts/` und sind in `src/css/fonts.css` eingebunden.

Weitere Schriften nach `public/assets/fonts/` legen, in `src/css/fonts.css` per `@font-face` registrieren (`font-display: swap`) und die Familie in `tokens.css` vor die System-Fallbacks setzen:

```css
--font-family-sans: "Brand Sans", ui-sans-serif, system-ui, sans-serif;
--font-family-display: "Brand Display", var(--font-family-sans);
```

System-Fallbacks bleiben für nicht verfügbare oder nicht geladene Webfonts definiert.

## Animationen

`src/js/animations.js` wertet Data-Attribute aus. Werte kommen aus `src/js/config.js`.

| Attribut | Wirkung |
| --- | --- |
| `data-animate="fade-up"` | Einblenden von unten |
| `data-animate="fade-in"` | Nur Opacity |
| `data-animate="scale-in"` | Leichtes Hochskalieren |
| `data-animate="stagger"` | Direkte Kinder nacheinander |
| `data-stagger-type="fade-in"` | Optionaler Effekt für Stagger-Kinder |
| `data-intro` + `data-intro-item` | Intro beim Laden |
| `data-parallax="0.06"` | Dezente Scroll-Verschiebung |
| `.layer-stack` + `data-layer-*` | Mehrschichtige Verschiebung und Rotation, gesteuert in `src/js/layer-parallax.js` |
| `data-delay="0.2"` | Zusätzliche Verzögerung in Sekunden |

Ohne JavaScript bleiben Inhalte sichtbar. Motion folgt [GSAP Accessible Animation](https://gsap.com/resources/getting-started/accessibility/) über `gsap.matchMedia()`:

- `(prefers-reduced-motion: no-preference)`: volle Reveals, Stagger, Intro, optionales Parallax
- `(prefers-reduced-motion: reduce)`: nur kurze Opacity-Fades, kein X/Y, kein Scale, kein Parallax

Unterhalb des Mobile-Breakpoints in `config.mobile.breakpoint` werden Distanzen verkürzt und Parallax deaktiviert.

## Lenis und GSAP

- ScrollTrigger wird einmal in `src/js/gsap.js` registriert.
- Lenis läuft über den GSAP-Ticker (`autoRaf: false`), ScrollTrigger erhält Updates über `lenis.on('scroll', ScrollTrigger.update)`.
- Es gibt genau eine `requestAnimationFrame`-Schleife.
- Bei `prefers-reduced-motion: reduce` startet Lenis nicht. Ankerlinks, Tastatur und natives Scrollen bleiben erhalten.
- Auf Touch-Geräten bleibt das native Touch-Scrolling aktiv (`syncTouch: false`).

Einstellungen: `config.lenis` und `config.animation`.

## Formular und Backend

Das Teilnahmeformular validiert clientseitig und speichert nichts in Local Storage, Session Storage oder Cookies. Die Validierung prüft unter anderem Pflichtfelder, E-Mail, Postleitzahl, Mindestalter und die Auswahl von ein bis drei Marathons.

Aktuell:

1. Pflichtfelder und E-Mail-Format prüfen
2. Fehlermeldungen am Feld (`aria-invalid`, `aria-describedby`)
3. Formularstatus über `aria-live`
4. bei Erfolg Weiterleitung nach `teilnahme.html`

Die Übertragung ist in `src/js/participation-api.js` gekapselt. `config.form.endpoint` ist derzeit leer; deshalb werden keine Formulardaten übertragen. Nach erfolgreicher Client-Validierung zeigt das Formular trotzdem den Erfolgsstatus an und leitet zu `teilnahme.html` weiter.

Vor einem Livegang müssen der echte Endpunkt und das Backend-Vertragsformat eingerichtet werden. Serverseitige Validierung ist zwingend; Client-Validierung dient ausschließlich der UX.

## Umsetzung aus Figma

1. Farben aus Figma in die Design Tokens übertragen.
2. Lokale Fonts einbinden.
3. Typografie-Werte (Größe, Gewicht, Zeilenhöhe, Tracking) übertragen.
4. Container, Grid und Spacing gegen die Tokens prüfen.
5. Komponenten im Styleguide anpassen.
6. Komponenten auf die Landingpage übertragen.
7. Bilder und SVGs nach `public/assets/` exportieren und ersetzen.
8. Animationen erst nach dem statischen Layout ergänzen.
9. Responsive Verhalten gegen die Figma-Breakpoints prüfen.
10. Accessibility und Performance abschließend testen.

### Figma Mapping

| Figma | Template |
| --- | --- |
| Color Styles | CSS Color Tokens (`--color-*`) |
| Text Styles | Typography Tokens (`--text-*`, `--font-weight-*`, `--leading-*`) |
| Variables | CSS Custom Properties in `tokens.css` |
| Auto Layout | Flexbox oder CSS Grid (Tailwind) |
| Components | Semantische Klassen (`.button`, `.card`, `.form-control`) |
| Variants | Modifier und State Classes (`.button-primary`, `.is-hover`) |
| Spacing | Layout Tokens (`--spacing-gutter`, `--spacing-section`, `--spacing-grid`) |
| Prototype Transitions | GSAP-Werte in `src/js/config.js` |

## Weitere Landingpage anlegen

1. HTML-Datei im Projektroot anlegen, zum Beispiel `kampagne.html`.
2. Dieselben Assets einbinden:

```html
<link rel="stylesheet" href="/src/css/main.css">
<script type="module" src="/src/js/main.js"></script>
```

3. Datei in `vite.config.js` unter `pages` registrieren:

```js
const pages = {
  main: 'index.html',
  participation: 'teilnahme.html',
  participationClosed: 'teilnahme-ende.html',
  styleguide: 'styleguide.html',
  terms: 'teilnahmebedingungen.html',
  privacy: 'datenschutz.html',
  imprint: 'impressum.html',
  campaign: 'kampagne.html',
};
```

Ohne Eintrag in `pages` wird die Datei im Production-Build nicht als Einstieg ausgegeben.

Bestehende Sektionen aus `index.html` kopieren und Texte, Bilder und Tokens anpassen. Neue JS-Module nur anlegen, wenn das Markup nicht über die vorhandenen Data-Attribute auskommt.

## Accessibility

- Semantische Landmarks, Skip-Link, sichtbare Focus States
- Mobile-Menü mit `aria-expanded`, `aria-controls` und Escape
- Accordion auf nativem `details`/`summary`, per Tastatur bedienbar
- Formularlabels, `autocomplete`, `aria-describedby`, `aria-live`
- `prefers-reduced-motion: reduce` deaktiviert Lenis, Parallax und X/Y-/Scale-Tweens; GSAP behält nur Opacity-Fades. Accordion und CSS-Transform-Transitions laufen ohne Bewegung.
- Dekorative Bilder: `alt=""`. Inhaltliche Bilder: beschreibendes `alt`
- Ohne JavaScript bleiben Inhalte lesbar; Navigation bleibt im Dokumentfluss

`teilnahmebedingungen.html` enthält Platzhalter und muss vor Veröffentlichung durch rechtlich geprüfte Teilnahmebedingungen ersetzt werden. Datenschutz und Impressum sind in der Fußzeile mit den Seiten von ERDINGER Alkoholfrei verlinkt.

## Performance

- Wenige Dependencies: Vite, Tailwind, GSAP, Lenis
- Modulare ES-Module, keine CDN-Skripte
- Animationen über `transform` und `opacity`
- Lazy Loading für Bilder unterhalb des Helds
- Feste SVG-/Bildmaße gegen Layout Shifts
- ScrollTrigger.refresh nach `load` und Fonts
- Passive Listener, wo das Browser-API es zulässt

## Deployment als statische Website

Der Inhalt von `dist/` kann auf jedem Static Host liegen (Netlify, Vercel, GitHub Pages, S3, eigener Nginx).

- `vite.config.js` setzt `base: './'`, relative Pfade funktionieren in Unterordnern.
- Kein Server-Rendering, kein Node-Prozess zur Laufzeit.
- Formular-POST braucht einen eigenen Backend-Endpunkt; der Host für HTML/CSS/JS kann davon getrennt sein.
- Vor Go-Live: Teilnahmebedingungen rechtlich prüfen sowie Meta-Tags und Kampagnenmedien kontrollieren.

## Hinweise und Grenzen

- Es gibt keinen echten API-Endpunkt. `config.form.endpoint` ist leer; aktuell werden keine Teilnahmedaten übertragen.
- Clientseitige Validierung ersetzt keine Serverprüfung.
- Nach erfolgreicher Client-Validierung erfolgt die Weiterleitung nach `teilnahme.html`, auch wenn kein Endpunkt konfiguriert ist.
- Die Seite `teilnahmebedingungen.html` enthält rechtliche Platzhalter.
- Parallax ist unterhalb des `md`-Breakpoints ausgeschaltet.
