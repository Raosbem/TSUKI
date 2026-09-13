/* ============================================================
   Banner de consentimiento de cookies + Google Analytics condicional
   Designed by Clopez · compartido por la home y las 4 páginas legales
   ------------------------------------------------------------
   - Recuerda la decisión en localStorage (clave "cloopez_consent").
   - Google Analytics (GA4) SOLO se carga si el visitante acepta.
   - Para reabrir el banner: enlace/botón con atributo  data-cookies
     (o llamar a  window.abrirPreferenciasCookies()  desde consola).
   ============================================================ */
(function () {
  'use strict';

  /* ====================================================================
     >>> PEGA AQUÍ TU ID DE GOOGLE ANALYTICS (GA4) CUANDO LO TENGAS <<<
     Ejemplo real: 'G-ABC123XYZ9'
     Mientras siga con las X, Analytics NO se carga (aunque se acepte),
     así la web no da error antes de tener el ID.
  ==================================================================== */
  var MEDICION_ID = 'G-4F0FCDG69S';
  /* ================================================================== */

  var CLAVE = 'cloopez_consent';           // valores: 'accepted' | 'rejected'
  var SIN_ID = /^G-X+$/;                    // detecta el hueco todavía sin rellenar

  /* ---------- Guardar / leer la decisión (a prueba de fallos) ---------- */
  function leer() {
    try { return localStorage.getItem(CLAVE); } catch (e) { return null; }
  }
  function guardar(v) {
    try { localStorage.setItem(CLAVE, v); } catch (e) {}
  }

  /* ---------- Cargar Google Analytics (solo tras aceptar) ---------- */
  var gaCargado = false;
  function cargarGA() {
    if (gaCargado) return;
    if (!MEDICION_ID || SIN_ID.test(MEDICION_ID)) return;   // aún sin ID -> no cargar nada
    gaCargado = true;

    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(MEDICION_ID);
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', MEDICION_ID);
  }

  /* ---------- Estilos del banner (inyectados: un solo archivo) ----------
     Usa las variables de la paleta de :root si existen, con color de
     reserva por si la página no las define. */
  var CSS = [
    '.ck-banner{position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;',
      'max-width:560px;margin:0 auto;',
      'background:var(--morado-profundo,#401b41);color:#fff;',
      'border:1px solid rgba(255,255,255,.10);border-radius:16px;',
      'box-shadow:0 18px 50px rgba(0,0,0,.35);',
      'padding:18px 20px;',
      'font-family:var(--fuente,-apple-system,"Helvetica Neue",Arial,sans-serif);',
      'opacity:0;transform:translateY(14px);',
      'transition:opacity .28s ease,transform .28s ease;}',
    '.ck-banner.visible{opacity:1;transform:translateY(0);}',
    '.ck-banner .ck-txt{font-size:.92rem;line-height:1.5;color:rgba(255,255,255,.9);margin:0 0 14px;}',
    '.ck-banner .ck-txt strong{color:#fff;font-weight:700;}',
    '.ck-banner .ck-txt a{color:var(--naranja,#F28322);text-decoration:underline;text-underline-offset:2px;}',
    '.ck-banner .ck-acc{display:flex;gap:10px;flex-wrap:wrap;}',
    '.ck-banner button{flex:1 1 auto;min-width:120px;cursor:pointer;',
      'font-family:inherit;font-size:.92rem;font-weight:700;letter-spacing:.2px;',
      'padding:11px 18px;border-radius:999px;border:2px solid transparent;',
      'transition:transform .12s ease,background .2s ease,border-color .2s ease;}',
    '.ck-banner button:hover{transform:translateY(-1px);}',
    '.ck-banner .ck-si{background:var(--naranja,#F28322);color:#2a1200;}',
    '.ck-banner .ck-si:hover{background:var(--naranja-oscuro,#c06a1e);}',
    '.ck-banner .ck-no{background:transparent;color:rgba(255,255,255,.9);',
      'border-color:rgba(255,255,255,.35);}',
    '.ck-banner .ck-no:hover{border-color:rgba(255,255,255,.7);color:#fff;}',
    '@media (max-width:420px){.ck-banner .ck-acc{flex-direction:column;}}',
    '@media (prefers-reduced-motion:reduce){',
      '.ck-banner{transition:opacity .2s ease;transform:none;}',
      '.ck-banner.visible{transform:none;}',
      '.ck-banner button:hover{transform:none;}}'
  ].join('');

  function inyectarCSS() {
    if (document.getElementById('ck-estilos')) return;
    var st = document.createElement('style');
    st.id = 'ck-estilos';
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  /* ---------- Construir el banner ---------- */
  var banner = null;
  function crearBanner() {
    inyectarCSS();
    var el = document.createElement('div');
    el.className = 'ck-banner';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-live', 'polite');
    el.setAttribute('aria-label', 'Aviso de cookies');
    el.innerHTML =
      '<p class="ck-txt">🍪 <strong>Cookies.</strong> Usamos una preferencia técnica para recordar tu elección y, ' +
      'solo si aceptas, cookies de <strong>Google Analytics</strong> para entender de forma anónima cómo se usa la web. ' +
      'Puedes rechazarlas. Más info en la <a href="cookies.html">Política de cookies</a>.</p>' +
      '<div class="ck-acc">' +
        '<button type="button" class="ck-no">Rechazar</button>' +
        '<button type="button" class="ck-si">Aceptar</button>' +
      '</div>';
    el.querySelector('.ck-si').addEventListener('click', aceptar);
    el.querySelector('.ck-no').addEventListener('click', rechazar);
    document.body.appendChild(el);
    return el;
  }

  function mostrar() {
    if (!banner) banner = crearBanner();
    banner.style.display = '';
    // fuerza reflow para que la transición de entrada se vea siempre
    void banner.offsetWidth;
    banner.classList.add('visible');
  }
  function ocultar() {
    if (!banner) return;
    banner.classList.remove('visible');
    setTimeout(function () { if (banner) banner.style.display = 'none'; }, 300);
  }

  function aceptar() { guardar('accepted'); cargarGA(); ocultar(); }
  function rechazar() { guardar('rejected'); ocultar(); }

  /* ---------- API pública para reabrir el banner ---------- */
  window.abrirPreferenciasCookies = mostrar;

  // Cualquier enlace/botón con  data-cookies  reabre el banner
  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('[data-cookies]') : null;
    if (t) { e.preventDefault(); mostrar(); }
  });

  /* ---------- Arranque ---------- */
  var decision = leer();
  if (decision === 'accepted') {
    cargarGA();
  } else if (decision === 'rejected') {
    /* no cargar nada */
  } else {
    mostrar();   // primera visita: pedir consentimiento
  }
})();
