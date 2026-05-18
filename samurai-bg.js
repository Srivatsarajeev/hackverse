/**
 * HACKVERSE 2.0 — Shared Samurai Background
 * Adds ghost samurai silhouette + falling sakura + floating kanji + ground mist
 * to every page via a fixed canvas. Each page can layer its own extras on top.
 */
(function initSamuraiBg() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const isMobile = window.innerWidth < 768;

    /* ── Scene ─────────────────────────────────────────────────────── */
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x04000a);
    scene.fog = new THREE.FogExp2(0x04000a, 0.032);

    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 6);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = false;

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    /* ── Lighting ───────────────────────────────────────────────────── */
    scene.add(new THREE.AmbientLight(0x1a0000, 0.6));

    const redLight = new THREE.PointLight(0xff003c, 2.5, 14);
    redLight.position.set(2, 3, 3);
    scene.add(redLight);

    const blueLight = new THREE.PointLight(0x001aff, 0.8, 12);
    blueLight.position.set(-4, 1, 1);
    scene.add(blueLight);

    const dirLight = new THREE.DirectionalLight(0xff4466, 0.5);
    dirLight.position.set(3, 6, 4);
    scene.add(dirLight);

    /* ── Ghost Samurai (right-side atmospheric silhouette) ──────────── */
    const samuraiGroup = new THREE.Group();
    const ghostMat = new THREE.MeshStandardMaterial({
        color: 0x3a0008, emissive: 0xff003c, emissiveIntensity: 0.08,
        transparent: true, opacity: isMobile ? 0.22 : 0.3
    });
    const ghostEdgeMat = new THREE.MeshBasicMaterial({ color: 0xff003c, transparent: true, opacity: 0.12, wireframe: false });

    function addPart(geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) {
        const m = new THREE.Mesh(geo, mat);
        m.position.set(x, y, z);
        m.rotation.set(rx, ry, rz);
        samuraiGroup.add(m);
        return m;
    }

    const s = isMobile ? 0.7 : 1;
    // Head
    addPart(new THREE.SphereGeometry(0.28 * s, 10, 10), ghostMat, 0, 2.8 * s, 0);
    // Helmet cone
    addPart(new THREE.ConeGeometry(0.36 * s, 0.55 * s, 8), ghostMat, 0, 3.22 * s, 0);
    // Helmet brim
    addPart(new THREE.CylinderGeometry(0.48 * s, 0.48 * s, 0.07 * s, 8), ghostMat, 0, 3.0 * s, 0);
    // Torso
    addPart(new THREE.BoxGeometry(0.85 * s, 1.05 * s, 0.45 * s), ghostMat, 0, 1.8 * s, 0);
    // Shoulder L
    addPart(new THREE.BoxGeometry(0.42 * s, 0.22 * s, 0.45 * s), ghostMat, -0.68 * s, 2.2 * s, 0, 0, 0, 0.3);
    // Shoulder R
    addPart(new THREE.BoxGeometry(0.42 * s, 0.22 * s, 0.45 * s), ghostMat, 0.68 * s, 2.2 * s, 0, 0, 0, -0.3);
    // Arm L
    addPart(new THREE.CylinderGeometry(0.09 * s, 0.09 * s, 0.75 * s, 6), ghostMat, -0.62 * s, 1.5 * s, 0, 0, 0, 0.22);
    // Arm R
    addPart(new THREE.CylinderGeometry(0.09 * s, 0.09 * s, 0.75 * s, 6), ghostMat, 0.62 * s, 1.5 * s, 0, 0, 0, -0.22);
    // Katana blade (glowing silver)
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 1, roughness: 0, emissive: 0xffffff, emissiveIntensity: 0.4 });
    const blade = addPart(new THREE.BoxGeometry(0.035 * s, 1.7 * s, 0.01 * s), bladeMat, 0.82 * s, 1.2 * s, 0, 0, 0, -0.38);
    // Tsuba (guard)
    addPart(new THREE.CylinderGeometry(0.11 * s, 0.11 * s, 0.035 * s, 8), new THREE.MeshStandardMaterial({ color: 0x8b6914 }), 0.7 * s, 1.88 * s, 0, 0, 0, -0.38);
    // Skirt / lower body
    addPart(new THREE.CylinderGeometry(0.42 * s, 0.58 * s, 0.95 * s, 8), ghostMat, 0, 0.85 * s, 0);
    // Leg L
    addPart(new THREE.CylinderGeometry(0.11 * s, 0.09 * s, 0.85 * s, 6), ghostMat, -0.19 * s, 0.05 * s, 0);
    // Leg R
    addPart(new THREE.CylinderGeometry(0.11 * s, 0.09 * s, 0.85 * s, 6), ghostMat, 0.19 * s, 0.05 * s, 0);

    if (isMobile) {
        samuraiGroup.position.set(1.5, -1.2, -2.5);
        samuraiGroup.scale.set(0.9, 0.9, 0.9);
    } else {
        samuraiGroup.position.set(3.8, -1.6, -1.5);
        samuraiGroup.scale.set(1.7, 1.7, 1.7);
    }
    scene.add(samuraiGroup);

    /* ── Ground mist rings ──────────────────────────────────────────── */
    const mistRings = [];
    const mistCount = isMobile ? 3 : 5;
    for (let i = 0; i < mistCount; i++) {
        const r = 1.5 + i * 1.2;
        const geo = new THREE.TorusGeometry(r, 0.04 + Math.random() * 0.04, 4, isMobile ? 30 : 60);
        const mat = new THREE.MeshBasicMaterial({ color: 0xff003c, transparent: true, opacity: 0.04 + Math.random() * 0.05 });
        const ring = new THREE.Mesh(geo, mat);
        ring.rotation.x = Math.PI / 2;
        ring.position.set(isMobile ? 1 : 3, -2.8, -1.5);
        scene.add(ring);
        mistRings.push({ mesh: ring, speed: 0.002 + Math.random() * 0.003, base: r });
    }

    /* ── Floating kanji pillars ─────────────────────────────────────── */
    const kanjis = [];
    const kanjiPositions = isMobile
        ? [[-5, 0, -4], [5, -1, -5], [-4, 2, -6]]
        : [[-6, 0, -4], [6, -1, -5], [-5, 3, -7], [4, 2, -6], [-3, -1, -3]];
    const kanjiGeo = new THREE.PlaneGeometry(0.25, 0.25);
    kanjiPositions.forEach(p => {
        const mat = new THREE.MeshBasicMaterial({ color: 0xff003c, transparent: true, opacity: 0.04 + Math.random() * 0.04 });
        const m = new THREE.Mesh(kanjiGeo, mat);
        m.position.set(p[0], p[1], p[2]);
        scene.add(m);
        kanjis.push({ mesh: m, baseY: p[1], speed: 0.002 + Math.random() * 0.003 });
    });

    /* ── Sakura petals ─────────────────────────────────────────────── */
    const petals = [];
    const petalCount = isMobile ? 50 : 120;
    const petalGeo = new THREE.PlaneGeometry(0.09, 0.13);
    const petalMat = new THREE.MeshBasicMaterial({ color: 0xff003c, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });

    for (let i = 0; i < petalCount; i++) {
        const p = new THREE.Mesh(petalGeo, petalMat);
        p.position.set(
            (Math.random() - 0.5) * 18,
            (Math.random() * 16) - 3,
            (Math.random() * -6) - 0.5
        );
        p.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        scene.add(p);
        petals.push({
            mesh: p,
            vy: 0.007 + Math.random() * 0.018,
            vx: (Math.random() - 0.5) * 0.008,
            rz: (Math.random() - 0.5) * 0.035,
            rx: (Math.random() - 0.5) * 0.02,
            wobble: Math.random() * Math.PI * 2
        });
    }

    /* ── Energy crack lines on ground ──────────────────────────────── */
    const cracks = [];
    if (!isMobile) {
        for (let i = 0; i < 6; i++) {
            const points = [];
            let x = (Math.random() - 0.5) * 8;
            let z = -Math.random() * 4;
            for (let j = 0; j < 8; j++) {
                x += (Math.random() - 0.5) * 0.8;
                z -= Math.random() * 0.3;
                points.push(new THREE.Vector3(x, -3.0, z));
            }
            const geo = new THREE.BufferGeometry().setFromPoints(points);
            const mat = new THREE.LineBasicMaterial({ color: 0xff003c, transparent: true, opacity: 0.15 });
            const line = new THREE.Line(geo, mat);
            scene.add(line);
            cracks.push({ line, mat });
        }
    }

    /* ── Animate ────────────────────────────────────────────────────── */
    function animate() {
        requestAnimationFrame(animate);
        const now = Date.now();
        const t = now * 0.001;

        // Ghost samurai breathe + slow sway
        samuraiGroup.position.y = (isMobile ? -1.2 : -1.6) + Math.sin(t * 0.6) * 0.08;
        samuraiGroup.rotation.y = Math.sin(t * 0.25) * 0.18;
        blade.material.emissiveIntensity = 0.3 + Math.sin(t * 2.5) * 0.25;

        // Ghost opacity pulse
        ghostMat.opacity = (isMobile ? 0.22 : 0.3) + Math.sin(t * 0.8) * 0.07;

        // Red light flicker
        redLight.intensity = 2.2 + Math.sin(t * 1.8) * 0.5;
        redLight.position.x = 2 + Math.sin(t * 0.4) * 0.6;

        // Mist rings expand slowly
        mistRings.forEach((mr, i) => {
            const s = 1 + (((t * 0.3 + i * 0.8)) % 2) * 0.4;
            mr.mesh.scale.set(s, s, 1);
            mr.mesh.material.opacity = Math.max(0, 0.07 - (s - 1) * 0.06);
        });

        // Kanji drift up
        kanjis.forEach(k => {
            k.mesh.position.y += k.speed;
            k.mesh.material.opacity = 0.04 + Math.sin(t * 0.5 + k.baseY) * 0.03;
            if (k.mesh.position.y > k.baseY + 6) k.mesh.position.y = k.baseY;
        });

        // Sakura fall
        petals.forEach(p => {
            p.mesh.position.y -= p.vy;
            p.mesh.position.x += Math.sin(t + p.wobble) * 0.003 + p.vx;
            p.mesh.rotation.z += p.rz;
            p.mesh.rotation.x += p.rx;
            if (p.mesh.position.y < -4) {
                p.mesh.position.y = 12 + Math.random() * 4;
                p.mesh.position.x = (Math.random() - 0.5) * 18;
            }
        });

        // Ground crack pulse
        cracks.forEach((c, i) => {
            c.mat.opacity = 0.08 + Math.sin(t * 1.2 + i) * 0.08;
        });

        renderer.render(scene, camera);
    }
    animate();

    // Expose renderer & scene so page-specific extras can add to it
    window._samuraiBgScene = scene;
    window._samuraiBgCamera = camera;
    window._samuraiBgRenderer = renderer;
})();
