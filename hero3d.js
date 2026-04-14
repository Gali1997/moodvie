// ─── Cinematic Particle Sphere ────────────────────────────────────────────────
(function () {
  const canvas   = document.getElementById('hero-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = window.innerWidth < 768 ? 4.5 : 3.2;

  // ─── Particles ───────────────────────────────────────────────────────────────
  const COUNT  = window.innerWidth < 768 ? 2000 : 4000;
  const geo    = new THREE.BufferGeometry();
  const pos    = new Float32Array(COUNT * 3);
  const colors = new Float32Array(COUNT * 3);
  const sizes  = new Float32Array(COUNT);
  const base   = new Float32Array(COUNT * 3); // original sphere positions

  for (let i = 0; i < COUNT; i++) {
    // Fibonacci sphere distribution — evenly spread particles
    const phi   = Math.acos(1 - (2 * (i + 0.5)) / COUNT);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    const r     = 1.1 + (Math.random() - 0.5) * 0.08; // slight variance in radius

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);

    pos[i * 3]     = x;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = z;
    base[i * 3]    = x;
    base[i * 3 + 1] = y;
    base[i * 3 + 2] = z;

    // Color: mix of gold, warm white, and faint crimson
    const t = Math.random();
    if (t < 0.6) {
      // Gold
      colors[i * 3]     = 0.78 + Math.random() * 0.12;
      colors[i * 3 + 1] = 0.62 + Math.random() * 0.12;
      colors[i * 3 + 2] = 0.18 + Math.random() * 0.1;
    } else if (t < 0.85) {
      // Warm cream/white
      colors[i * 3]     = 0.92;
      colors[i * 3 + 1] = 0.88;
      colors[i * 3 + 2] = 0.82;
    } else {
      // Faint crimson
      colors[i * 3]     = 0.6 + Math.random() * 0.2;
      colors[i * 3 + 1] = 0.1;
      colors[i * 3 + 2] = 0.1;
    }

    sizes[i] = window.innerWidth < 768 ? Math.random() * 2 + 0.8 : Math.random() * 3.5 + 1.2;
  }

  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
  geo.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uTime:   { value: 0 },
      uMouse:  { value: new THREE.Vector2(0, 0) },
      uPixelRatio: { value: renderer.getPixelRatio() }
    },
    vertexShader: `
      attribute float size;
      attribute vec3 color;
      varying vec3 vColor;
      varying float vAlpha;
      uniform float uTime;
      uniform vec2 uMouse;

      void main() {
        vColor = color;
        vec3 pos = position;

        // Gentle wave distortion
        float wave = sin(pos.y * 3.0 + uTime * 0.6) * 0.03
                   + cos(pos.x * 2.5 + uTime * 0.4) * 0.03;
        pos += normalize(pos) * wave;

        // Mouse attraction — pull particles toward cursor
        vec3 toMouse = vec3(uMouse * 1.8, 0.0) - pos;
        float dist   = length(toMouse);
        float strength = smoothstep(1.2, 0.0, dist) * 0.18;
        pos += normalize(toMouse) * strength;

        // Depth-based alpha — edges of sphere slightly transparent
        float depth = dot(normalize(pos), vec3(0.0, 0.0, 1.0));
        vAlpha = smoothstep(-0.4, 0.6, depth) * 0.85 + 0.15;

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = size * (280.0 / -mvPosition.z);
        gl_Position  = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        // Circular soft particle
        vec2 uv   = gl_PointCoord - 0.5;
        float r   = length(uv);
        float alpha = smoothstep(0.5, 0.1, r) * vAlpha;
        gl_FragColor = vec4(vColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    vertexColors: true,
    blending: THREE.AdditiveBlending
  });

  const points = new THREE.Points(geo, mat);
  scene.add(points);

  // ─── Inner glow sphere ───────────────────────────────────────────────────────
  const glowGeo = new THREE.SphereGeometry(0.95, 32, 32);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0x3a1a00,
    transparent: true,
    opacity: 0.18,
    side: THREE.FrontSide
  });
  scene.add(new THREE.Mesh(glowGeo, glowMat));

  // ─── Mouse tracking ──────────────────────────────────────────────────────────
  const mouse    = new THREE.Vector2(0, 0);
  const target   = new THREE.Vector2(0, 0);

  document.addEventListener('mousemove', e => {
    target.x =  (e.clientX / window.innerWidth  - 0.5) * 2;
    target.y = -(e.clientY / window.innerHeight - 0.5) * 2;
  });

  // ─── Resize ──────────────────────────────────────────────────────────────────
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.position.z = window.innerWidth < 768 ? 4.5 : 3.2;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ─── Animate ─────────────────────────────────────────────────────────────────
  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.008;

    // Smooth mouse lerp
    mouse.x += (target.x - mouse.x) * 0.04;
    mouse.y += (target.y - mouse.y) * 0.04;

    mat.uniforms.uTime.value  = t;
    mat.uniforms.uMouse.value = mouse;

    // Slow auto-rotation + subtle tilt toward mouse
    points.rotation.y = t * 0.12 + mouse.x * 0.25;
    points.rotation.x = mouse.y * 0.18;

    renderer.render(scene, camera);
  }

  animate();
})();
