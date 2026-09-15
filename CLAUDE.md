# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

A single-page marketing site (in Spanish) for **TsukiBoyz**, a music production collective (beats, mixing, mastering). The page pitches a "one month, one team" production package and drives visitors to a WhatsApp CTA, while showcasing a catalog of produced tracks and artist testimonials.

## Running the site

There is no build system, no `package.json`, and no dependencies to install. The site is static pages (`index.html`, the landing page, `contacto.html`, the contact form, plus the empty legal pages):

- Open `index.html` directly in a browser, or serve the folder with any static server, e.g.:
  ```
  python3 -m http.server 8000
  ```
- There are no lint, test, or build commands — none exist in this repo.

## Architecture

Landing-page HTML, CSS, and application logic live in index.html. Three.js 0.160.0 and its utilities are included as classic scripts in assets/vendor/ with their MIT license. No CDN, import map, package installation, or build step is required.

`assets/design.css` is a second art-direction pass shared by both pages: it holds the type scale, the section headers, the testimonial marquee, the plan card, the contact form (`.ct-*`) and the footer, and it overrides rules from index.html's own `<style>`. `assets/interior.css` carries only what `contacto.html` needs that would otherwise live inside index.html (base reset, black background, cursor, and the top menu) — if the top menu changes in index.html, change it there too. Both pages load these with a `?v=N` query string; bump it when you edit them so browsers don't serve a cached copy.

`contacto.html` is a plain page (no loader, no 3D): top menu, the `#contacto` section (form + socials), and the shared footer. The form posts to FormSubmit (`formsubmit.co/<correo>`) by AJAX so the visitor stays on the page, with a mailto link as fallback; the destination address must be confirmed once by email before messages start arriving.

The legal pages (`aviso-legal.html`, `privacidad.html`, `cookies.html`, `terminos.html`, `preferencias-cookies.html`) follow the same plain-page pattern and are linked from the `.footer-legal` row in every page's footer. They are intentionally empty placeholders (`noindex`) until the legal representative is decided; Google Analytics will need the cookie pages filled in and a real consent control behind "Preferencias de cookies".

Reading top to bottom, `index.html` is built from these pieces:

1. **Loading screen** — a progress bar tied to the real download progress of the 3D head model (`assets/cabeza-opt.glb`), with a minimum display time. It also gates a branded audio tag (`assets/audio/tag-tsukiboyz.m4a`) that must play at the exact moment the head is revealed; the "tap to enter" prompt is mandatory on the first load of a visit, including preview and reduced-motion modes. Audio is requested only on click; entry never waits for the playback promise. Entering sets `sessionStorage["tsuki-entrado"]`; on later loads in the same session (coming back from `contacto.html`) a small script placed before the 3D scripts hides the loader immediately — no bar, no button, no audio tag — and a 3D failure then leaves the page uncovered instead of showing the "Continuar" overlay.
2. **3D hero (Three.js, `classic scripts`)** — loads and centers a chrome head GLB model, orients it toward the mouse cursor, and renders a full-screen custom shader "lightning storm" behind it on the same canvas. The DOM background layers (`#bg`) sit behind the transparent canvas for depth/grain/vignette, independent of the 3D scene.
3. **Scroll-driven reveal (`onScroll`, `headY`)** — the `.track` element is `600vh` tall and drives, in five timed stages as the user scrolls: head alone → title → left copy box → right copy box → both boxes fade out and the WhatsApp CTA + video fade in, then the whole hero fades to hand off to the next section. **The stage thresholds in `onScroll()` and `headY()` are written in vh via `vh(n)` over `RECORRIDO` (500 = `.track` height − 100vh)** — changing that height means updating `RECORRIDO`, and the `0.112 * max` title-position fraction used by the return-from-contacto and "Volver arriba" scripts.
4. **Video block (`#video-embed` script)** — shows a cover image + play button; the YouTube iframe (`data-yt` attribute on `#video`) is only injected into the DOM on click, to avoid loading YouTube's JS while the hero is scrolling.
5. **Testimonials carousel (`#testimonios` section + its own `<script>`)** — a marquee-style track built from a hardcoded `TST` array (name, IG link, flag/country, quote). Cards expand on click/tap (only one open at a time), and the marquee pauses while one is open. It always runs **right to left** (`tstScroll` translates `0 → -50%`, `animation-direction:normal` in `design.css`). `fill()` duplicates the set into two identical halves — that `-50%` is what makes the loop seamless — and **measures** how many copies each half needs to cover the viewport instead of hardcoding four sets, which used to make the track 10,600px wide; combined with `will-change:transform` that was a composited layer big enough that browsers could fail to paint it, leaving the carousel blank. Don't reintroduce `will-change` here or go back to a fixed copy count. Because the track width now varies, `fill()` also sets `animationDuration` from the measured half-width to hold a constant ~40 px/s on any screen; the `animation-duration` values in the CSS are only a fallback.
6. **Catalog grid (`#catalogo` section + its own `<script>`)** — built from a hardcoded `WORKS` array of `[filename, title, spotifyUrl, [[artist, instagramUrl], ...]]`, rendered against cover images in `assets/portadas/`. An `IG` lookup table maps artist keys to Instagram URLs, reused across catalog and testimonial credits. The cover itself is not a link: the `spotifyUrl` is parsed into a `spotify:track:…` URI for the centred play button, which opens the fixed player bar (`#sp-player`) at the bottom of the page. That bar embeds Spotify's official iframe (via `open.spotify.com/embed/iframe-api/v1`; the API loads and the controller is pre-created, hidden, with the first catalog track once the catalog nears the viewport, so a play click only swaps the URI), so it brings its own play/pause and seek bar — and plays the full track only for visitors with an active Spotify session.

Both the catalog and testimonials scripts reveal their section via `IntersectionObserver` (respecting `prefers-reduced-motion` and a `?reveal` query-string debug mode that skips all scroll/reveal gating for previewing content instantly). **Cards and covers are visible by default; the entrance animation only exists once the script adds `.js-anim` to the section, which it does as its very last step.** That inversion is deliberate and is the thing that keeps the carousel/grid from ever rendering blank: previously they started at `opacity:0` and depended on a single `IntersectionObserver` adding `.in`, so one missed trigger left them invisible forever. Now, if anything before that last line throws, `.js-anim` is never set and the content simply shows without animation. On top of that, `revelar()` is reachable by five independent paths — the observer, `scroll`, `resize`, a 300 ms poll capped at 20 s, and an unconditional 30 s timeout — all torn down once it fires. The poll covers the case that actually broke: content above changing height after load (fonts, images, the 600vh hero) slides the section into view *without any scroll event*, and the observer does not reliably fire for that. Don't move the `.js-anim` line earlier, and don't reduce this back to a lone observer.

### Where to make common content edits

- **Catalog tracks/credits**: the `WORKS` array (and `IG` lookup) inside the `<!-- CATÁLOGO -->` script near the end of `index.html`.
- **Testimonials**: the `TST` array inside the `<!-- TESTIMONIOS -->` script right after it.
- **Featured video**: the `data-yt` attribute on `<div id="video">`.
- **WhatsApp CTA link**: the `href` on `.cta-btn` inside `<div id="cta">`.
- **Hero copy**: `#hero-title`, `#copy-bl`, `#copy-br` markup near the top of `<body>`.
- **Price and launch offer**: `.plan-card-head` inside `<section id="plan">`. It shows the regular price (`$600`, crossed out by the red marker `svg.marca-x`) beside the launch price (`$450`, ringed by the green marker `svg.marca-circulo`); both strokes are drawn by an `IntersectionObserver` that adds `.dibuja`. The `.plan-promo` notice beside it frames the offer as **4 spots total, the first 3 at $450** (not a time-limited window) — keep those numbers in sync with `.promo-text` and `.promo-datos` if they change. **When the offer ends**, drop the `.plan-antes` block and the `.rodeado`/`svg` wrapper around the amount, set the amount back to the regular price, and delete the whole `<div class="plan-aparte">` next to the card (the notice plus its `.promo-cta` button to `contacto.html`) — `.plan-layout` then only needs its second grid column removed in `design.css`.

## Portable 3D loading

Opening index.html directly uses assets/cabeza-opt.embedded.js and GLTFLoader.parse; HTTP/HTTPS uses assets/cabeza-opt.glb. Both contain the same model and embedded textures. Update both together: tools/actualizar-modelo.html regenerates the embedded script in a browser without installing anything. File URLs must not use fetch/XHR for the model or ES module imports.

The model is centered and scaled using a parent group to preserve its original transforms. Load failures offer a Continue button, and audio is requested only on the entry button click and cannot prevent access if playback fails or stalls.

## Assets

- `assets/` holds everything actually loaded at runtime: optimized cover images (`assets/portadas/`), testimonial avatars (`assets/testimonios/`), the optimized 3D head (`assets/cabeza-opt.glb`), the mouse cursor image, and the brand audio tag.
- **Covers exist twice**: `<nombre>.jpg` and `<nombre>.webp` (same crop, same 640×640, WebP quality 92 ≈ 24% lighter). The catalog script feature-detects WebP once and picks the extension for all of them, falling back to `.jpg`. **Add both files when adding a track**, or that cover 404s on modern browsers.
- The favicons are deliberately small: they embed a 256×256 PNG, which is ample at any favicon size. They used to embed a 1280×1280 one and weighed 1.4 MB between the three. The untouched originals are in `source/favicon-original/`.
- `index.html` preloads `cabeza-opt.glb` from the `<head>` (skipped on `file:`). Without it the model isn't requested until THREE.js and GLTFLoader have downloaded *and* run — measured at 1174 ms vs 401 ms on localhost, and the gap grows on a real connection. It must stay `as="fetch"` + `crossOrigin` to match `THREE.FileLoader`, or the browser downloads the 6.3 MB twice.
- `source/` holds original/unoptimized reference material that is **not** loaded by the site: the unoptimized head model, brand logos, raw testimonial/cover source files, and draft legal pages (`source/legales-referencia/` — aviso legal, cookies, privacidad, términos). Note these legal pages are **not currently linked from `index.html`**.

## Backup convention

`backups/` contains manually saved, timestamped full copies of `index.html` (named `index-antes-<what-was-about-to-change>-<YYYYMMDD-HHMM>.html`), taken before risky edits as a rollback safety net alongside git history. When making a significant change to `index.html`, follow this project's existing convention of saving a copy here first.
