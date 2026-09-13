# Three.js 0.160.0 (MIT)

Source: https://cdn.jsdelivr.net/npm/three@0.160.0/
License: LICENSE-three.txt

These files are vendored so the page works offline and with file://:
- THREE.js: build/three.module.js
- TsukiGeometryUtils.js: examples/jsm/utils/BufferGeometryUtils.js
- TsukiGLTF.js: examples/jsm/loaders/GLTFLoader.js
- TsukiEnvironment.js: examples/jsm/environments/RoomEnvironment.js

Each source is wrapped in an IIFE assigned to its window namespace. Named imports become destructuring from the corresponding namespace; exports become returned object properties (including export aliases and named function exports). Rendering and loader implementations are unchanged.

Load order: THREE, TsukiGeometryUtils, TsukiGLTF, TsukiEnvironment. Keep all four files on the same upstream version. This is a prepared browser distribution; users need no package manager.
