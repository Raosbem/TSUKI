# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

A single-page marketing site (in Spanish) for **TsukiBoyz**, a music production collective (beats, mixing, mastering). The page pitches a "one month, one team" production package and drives visitors to a WhatsApp CTA, while showcasing a catalog of produced tracks and artist testimonials.

## Running the site

There is no build system, no `package.json`, and no dependencies to install. The entire site is one static file:

- Open `index.html` directly in a browser, or serve the folder with any static server, e.g.:
  ```
  python3 -m http.server 8000
  ```
- There are no lint, test, or build commands — none exist in this repo.

## Architecture

Site HTML, CSS, and application logic live in index.html. Three.js 0.160.0 and its utilities are included as classic scripts in assets/vendor/ with their MIT license. No CDN, import map, package installation, or build step is required.

Reading top to bottom, `index.html` is built from these pieces:

1. **Loading screen** — a progress bar tied to the real download progress of the 3D head model (`assets/cabeza-opt.glb`), with a minimum display time. It also gates a branded audio tag (`assets/audio/tag-tsukiboyz.m4a`) that must play at the exact moment the head is revealed; the "tap to enter" prompt is mandatory on every load, including preview and reduced-motion modes. Audio is requested only on click; entry never waits for the playback promise.
2. **3D hero (Three.js, `classic scripts`)** — loads and centers a chrome head GLB model, orients it toward the mouse cursor, and renders a full-screen custom shader "lightning storm" behind it on the same canvas. The DOM background layers (`#bg`) sit behind the transparent canvas for depth/grain/vignette, independent of the 3D scene.
3. **Scroll-driven reveal (`onScroll`, `headY`)** — the `.track` element is `530vh` tall and drives, in five timed stages as the user scrolls: head alone → title → left copy box → right copy box → both boxes fade out and the WhatsApp CTA + video fade in, then the whole hero fades to hand off to the next section. **The stage thresholds in `onScroll()` and `headY()` are hand-tuned to `.track`'s height** — changing that height requires rescaling those thresholds too (this is called out in comments in the file itself).
4. **Video block (`#video-embed` script)** — shows a cover image + play button; the YouTube iframe (`data-yt` attribute on `#video`) is only injected into the DOM on click, to avoid loading YouTube's JS while the hero is scrolling.
5. **Testimonials carousel (`#testimonios` section + its own `<script>`)** — a marquee-style track built from a hardcoded `TST` array (name, IG link, flag/country, quote). Cards duplicate their content for a seamless loop and expand on click/tap (only one open at a time).
6. **Catalog grid (`#catalogo` section + its own `<script>`)** — built from a hardcoded `WORKS` array of `[filename, title, spotifyUrl, [[artist, instagramUrl], ...]]`, rendered against cover images in `assets/portadas/`. An `IG` lookup table maps artist keys to Instagram URLs, reused across catalog and testimonial credits.

Both the catalog and testimonials scripts reveal their section via `IntersectionObserver` (respecting `prefers-reduced-motion` and a `?reveal` query-string debug mode that skips all scroll/reveal gating for previewing content instantly).

### Where to make common content edits

- **Catalog tracks/credits**: the `WORKS` array (and `IG` lookup) inside the `<!-- CATÁLOGO -->` script near the end of `index.html`.
- **Testimonials**: the `TST` array inside the `<!-- TESTIMONIOS -->` script right after it.
- **Featured video**: the `data-yt` attribute on `<div id="video">`.
- **WhatsApp CTA link**: the `href` on `.cta-btn` inside `<div id="cta">`.
- **Hero copy**: `#hero-title`, `#copy-bl`, `#copy-br` markup near the top of `<body>`.

## Portable 3D loading

Opening index.html directly uses assets/cabeza-opt.embedded.js and GLTFLoader.parse; HTTP/HTTPS uses assets/cabeza-opt.glb. Both contain the same model and embedded textures. Update both together: tools/actualizar-modelo.html regenerates the embedded script in a browser without installing anything. File URLs must not use fetch/XHR for the model or ES module imports.

The model is centered and scaled using a parent group to preserve its original transforms. Load failures offer a Continue button, and audio is requested only on the entry button click and cannot prevent access if playback fails or stalls.

## Assets

- `assets/` holds everything actually loaded at runtime: optimized cover images (`assets/portadas/`), testimonial avatars (`assets/testimonios/`), the optimized 3D head (`assets/cabeza-opt.glb`), the mouse cursor image, and the brand audio tag.
- `source/` holds original/unoptimized reference material that is **not** loaded by the site: the unoptimized head model, brand logos, raw testimonial/cover source files, and draft legal pages (`source/legales-referencia/` — aviso legal, cookies, privacidad, términos). Note these legal pages are **not currently linked from `index.html`**.

## Backup convention

`backups/` contains manually saved, timestamped full copies of `index.html` (named `index-antes-<what-was-about-to-change>-<YYYYMMDD-HHMM>.html`), taken before risky edits as a rollback safety net alongside git history. When making a significant change to `index.html`, follow this project's existing convention of saving a copy here first.
