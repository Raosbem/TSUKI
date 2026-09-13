# TSUKI-WEB-PROJECT

Abre index.html con doble clic en un navegador con WebGL (Edge, Chrome, Firefox o Safari). La apertura local es compatible con Windows y macOS: no requiere Node, Python, extensiones de VS Code ni servidor. Conserva assets/ junto a index.html.

El logo 3D, su seguimiento del cursor y los recursos locales funcionan sin internet. YouTube, Spotify, enlaces sociales y otros servicios externos necesitan conexion. Al terminar la carga siempre aparece "Toca para entrar". Pulsa el boton para entrar e iniciar el audio; nunca se entra automaticamente.

## Funcionamiento

Three.js 0.160.0 y sus utilidades estan incluidas en assets/vendor/ con su licencia MIT. Se usan scripts clasicos para permitir la apertura directa mediante file://.

- Al abrir el archivo directamente, se decodifica assets/cabeza-opt.embedded.js y se entrega su ArrayBuffer a GLTFLoader.parse.
- En un alojamiento HTTP/HTTPS o Live Server, se carga assets/cabeza-opt.glb normalmente.
- El modelo incrustado contiene exactamente los mismos bytes que el GLB, incluidas sus texturas. No se modifica la seguridad del navegador.
- Si falla el modelo o WebGL, se muestra un boton para continuar. El audio no puede bloquear indefinidamente la entrada.

## Actualizar el modelo

Despues de sustituir assets/cabeza-opt.glb, abre tools/actualizar-modelo.html con doble clic, selecciona ese GLB y guarda la descarga como assets/cabeza-opt.embedded.js, reemplazando el anterior. No requiere instalar herramientas.

serve.ps1 es una herramienta opcional anterior para Windows; no es necesaria para abrir el sitio.
