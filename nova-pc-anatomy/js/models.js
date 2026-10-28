/* =========================================================
   NOVA / hardware model factory
   All geometry is built procedurally with Three.js primitives.
   ========================================================= */
(function () {
  'use strict';

  const T = window.HWTextures;
  const PI = Math.PI;

  /* ---------------------------------------------------------
     materials
     --------------------------------------------------------- */
  const M = {};

  function std(color, roughness, metalness, extra) {
    return new THREE.MeshStandardMaterial(Object.assign({
      color, roughness, metalness,
      envMapIntensity: 1.0
    }, extra || {}));
  }

  M.caseMetal = std(0x1d242a, 0.31, 0.8);
  M.frame = std(0x2c343b, 0.3, 0.9);
  M.aluminum = std(0x9ba4ab, 0.26, 0.97);
  M.darkAluminum = std(0x3c444b, 0.34, 0.88);
  M.steel = std(0x7c878e, 0.3, 0.95);
  M.darkSteel = std(0x333a40, 0.4, 0.82);
  M.blackPlastic = std(0x0e1114, 0.58, 0.2);
  M.plastic = std(0x161b1f, 0.5, 0.28);
  M.plasticSoft = std(0x20272b, 0.64, 0.08);
  M.rubber = std(0x050708, 0.94, 0.02);
  M.copper = std(0xb16a3d, 0.28, 1.0);
  M.brass = std(0xbd8f4c, 0.28, 1.0);
  M.gold = std(0xc39a43, 0.36, 0.88);
  M.silver = std(0xd5dde0, 0.2, 1.0);
  M.silicon = std(0x111a27, 0.22, 0.55, { envMapIntensity: 1.6 });
  M.ic = std(0x171d20, 0.46, 0.32);
  M.icTop = std(0x242b2e, 0.5, 0.25);
  M.pcb = new THREE.MeshStandardMaterial({ map: T.pcb('green'), roughness: 0.7, metalness: 0.12, envMapIntensity: 0.7 });
  M.pcbDark = new THREE.MeshStandardMaterial({ map: T.pcb('dark'), roughness: 0.58, metalness: 0.2, envMapIntensity: 0.9 });
  M.pcbBlue = new THREE.MeshStandardMaterial({ map: T.pcb('blue'), roughness: 0.6, metalness: 0.16, envMapIntensity: 0.8 });
  M.hddCover = std(0xb9bcc0, 0.38, 0.86);
  M.psuShell = std(0x1e2327, 0.38, 0.74);
  M.glass = new THREE.MeshPhysicalMaterial({
    color: 0xa9dfe4,
    metalness: 0.06,
    roughness: 0.055,
    ior: 1.45,
    transparent: true,
    opacity: 0.062,
    side: THREE.DoubleSide,
    envMapIntensity: 0.6,
    clearcoat: 0.45,
    clearcoatRoughness: 0.08,
    specularIntensity: 0.65,
    depthWrite: false
  });
  M.ledCyan = new THREE.MeshStandardMaterial({ color: 0x061518, emissive: 0x58eef2, emissiveIntensity: 3.2, roughness: 0.28, metalness: 0.4 });
  M.ledOcean = new THREE.MeshStandardMaterial({ color: 0x061116, emissive: 0x3f9bff, emissiveIntensity: 2.4, roughness: 0.3, metalness: 0.35 });
  M.ledWarm = new THREE.MeshStandardMaterial({ color: 0x171008, emissive: 0xffb15e, emissiveIntensity: 1.5, roughness: 0.4 });
  M.ledPink = new THREE.MeshStandardMaterial({ color: 0x180810, emissive: 0xff6fa8, emissiveIntensity: 1.7, roughness: 0.4 });
  M.ledSoft = new THREE.MeshStandardMaterial({ color: 0x0b1b1e, emissive: 0x55d5d8, emissiveIntensity: 0.85, roughness: 0.4, metalness: 0.4 });
  M.ledPinkSoft = new THREE.MeshStandardMaterial({ color: 0x1b0910, emissive: 0xff78ad, emissiveIntensity: 0.85, roughness: 0.38, metalness: 0.35 });
  M.fanBlade = std(0x7b858b, 0.27, 0.82, { side: THREE.DoubleSide });
  M.ramCover = std(0x596268, 0.3, 0.94);
  M.screen = new THREE.MeshBasicMaterial({ map: T.pumpScreen().texture, toneMapped: false });

  /* ---------------------------------------------------------
     small helpers
     --------------------------------------------------------- */
  function add(parent, obj) { if (parent) parent.add(obj); return obj; }

  function box(w, h, d, mat, x, y, z, parent, rot) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x || 0, y || 0, z || 0);
    if (rot) m.rotation.set(rot[0] || 0, rot[1] || 0, rot[2] || 0);
    m.castShadow = true; m.receiveShadow = true;
    return add(parent, m);
  }

  function rbox(w, h, d, r, mat, x, y, z, parent, rot) {
    const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, r), mat);
    m.position.set(x || 0, y || 0, z || 0);
    if (rot) m.rotation.set(rot[0] || 0, rot[1] || 0, rot[2] || 0);
    m.castShadow = true; m.receiveShadow = true;
    return add(parent, m);
  }

  function cyl(rt, rb, h, seg, mat, x, y, z, parent, rot) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
    m.position.set(x || 0, y || 0, z || 0);
    if (rot) m.rotation.set(rot[0] || 0, rot[1] || 0, rot[2] || 0);
    m.castShadow = true; m.receiveShadow = true;
    return add(parent, m);
  }

  function plane(w, h, mat, x, y, z, parent, rot) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    m.position.set(x || 0, y || 0, z || 0);
    if (rot) m.rotation.set(rot[0] || 0, rot[1] || 0, rot[2] || 0);
    return add(parent, m);
  }

  function torus(r, tube, seg, mat, x, y, z, parent, rot) {
    const m = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 10, seg), mat);
    m.position.set(x || 0, y || 0, z || 0);
    if (rot) m.rotation.set(rot[0] || 0, rot[1] || 0, rot[2] || 0);
    m.castShadow = true;
    return add(parent, m);
  }

  function edge(mesh, color, opacity) {
    const e = new THREE.LineSegments(
      new THREE.EdgesGeometry(mesh.geometry, 36),
      new THREE.LineBasicMaterial({ color: color || 0x72dbe6, transparent: true, opacity: opacity || 0.2 })
    );
    e.userData.ignoreRaycast = true;
    mesh.add(e);
    return e;
  }

  function decal(parent, texture, w, h, x, y, z, rot, opts) {
    opts = opts || {};
    let mat;
    if (opts.basic) {
      mat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: opts.side || THREE.FrontSide,
        depthWrite: false,
        toneMapped: false,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2
      });
    } else {
      mat = new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        roughness: opts.roughness != null ? opts.roughness : 0.62,
        metalness: opts.metalness != null ? opts.metalness : 0.12,
        side: opts.side || THREE.FrontSide,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
        emissive: opts.emissive || 0x000000,
        emissiveIntensity: opts.emissiveIntensity || 0
      });
    }
    const m = plane(w, h, mat, x, y, z, parent, rot);
    m.userData.ignoreRaycast = true;
    return m;
  }

  function textTexture(lines, w, h, opts) {
    opts = opts || {};
    return T.make([w || 512, h || 256], (ctx, cw, ch) => {
      ctx.clearRect(0, 0, cw, ch);
      if (opts.bg) { ctx.fillStyle = opts.bg; ctx.fillRect(0, 0, cw, ch); }
      const align = opts.align || 'left';
      ctx.textAlign = align;
      const ox = align === 'center' ? cw / 2 : (opts.x || 30);
      let y = opts.y || 80;
      lines.forEach((line, i) => {
        ctx.fillStyle = line.color || '#e9f7f4';
        ctx.font = `${line.weight || 600} ${line.size || 44}px ${line.font || T.SANS}`;
        if (line.spacing) ctx.letterSpacing = line.spacing;
        ctx.fillText(line.text, ox, y);
        y += line.gap || 50;
      });
    }, opts.key || null);
  }

  function makePart(id, data) {
    const root = new THREE.Group();
    root.name = id;
    root.userData.partId = id;
    return Object.assign({
      id, root,
      pickables: [],
      focusOnly: [],
      tags: [],
      fans: [],
      exploders: [],
      data: data || {}
    }, data || {});
  }

  function registerExplode(part, obj, delta, start, end, rot) {
    obj.userData.explode = {
      basePos: obj.position.clone(),
      baseQuat: obj.quaternion.clone(),
      deltaPos: new THREE.Vector3(delta[0] || 0, delta[1] || 0, delta[2] || 0),
      deltaQuat: new THREE.Quaternion().setFromEuler(new THREE.Euler(
        (rot && rot[0]) || 0, (rot && rot[1]) || 0, (rot && rot[2]) || 0
      )),
      start: start == null ? 0 : start,
      end: end == null ? 1 : end
    };
    part.exploders.push(obj);
  }

  function tag(part, anchor, name, sub, min, dx, dy) {
    if (!anchor) return;
    const o = new THREE.Object3D();
    o.position.set(0, 0, 0);
    anchor.add(o);
    part.tags.push({ anchor: o, name, sub, min: min == null ? 0.35 : min, dx: dx || 0, dy: dy || 0 });
  }

  function finalizePart(part) {
    part.root.traverse((o) => {
      if (o.isMesh && !o.userData.ignoreRaycast) {
        o.userData.partId = part.id;
        part.pickables.push(o);
      }
    });
  }

  /* ---------------------------------------------------------
     fan factory
     --------------------------------------------------------- */
  const fanBladeMat = std(0x2a3338, 0.42, 0.55, { side: THREE.DoubleSide });
  const fanBladeMatLight = std(0x5e686e, 0.34, 0.6, { side: THREE.DoubleSide });
  const fanFrameMat = std(0x101418, 0.52, 0.3);

  function buildFan(opts) {
    opts = opts || {};
    const radius = opts.radius || 0.55;
    const depth = opts.depth || 0.12;
    const group = new THREE.Group();
    const spin = new THREE.Group();
    group.add(spin);

    // mounting frame - four corner brackets
    if (opts.frame !== false) {
      const frameR = radius + 0.1;
      const frame = new THREE.Mesh(
        new THREE.TorusGeometry(frameR, 0.035, 8, 48),
        opts.frameMat || fanFrameMat
      );
      frame.rotation.x = PI / 2;
      frame.castShadow = true;
      group.add(frame);
      for (let i = 0; i < 4; i++) {
        const a = PI * 0.25 + i * PI * 0.5;
        const b = box(0.16, 0.06, 0.16, opts.frameMat || fanFrameMat,
          Math.cos(a) * frameR, 0, Math.sin(a) * frameR, group);
        b.rotation.y = -a;
      }
    }

    // blades
    const bladeMat = opts.bladeMat || fanBladeMat;
    const bladeGeo = new THREE.PlaneGeometry(radius * 0.58, radius * 0.24, 5, 1);
    for (let i = 0; i < (opts.blades || 9); i++) {
      const a = (i / (opts.blades || 9)) * PI * 2;
      const bg = new THREE.Group();
      bg.rotation.y = a;
      const b = new THREE.Mesh(bladeGeo, bladeMat);
      b.position.set(radius * 0.57, 0, 0);
      b.rotation.x = -PI / 2 + 0.32;
      b.rotation.z = 0.05;
      b.castShadow = true;
      bg.add(b);
      spin.add(bg);
    }

    // hub
    cyl(radius * 0.23, radius * 0.26, depth + 0.04, 28, opts.hubMat || fanFrameMat, 0, 0, 0, spin);
    cyl(radius * 0.19, radius * 0.22, depth + 0.06, 28, opts.hubTopMat || M.darkAluminum, 0, 0.005, 0, spin);
    torus(radius * 0.85, 0.012, 48, opts.ringMat || M.ledCyan, 0, depth * 0.18, 0, group, [PI / 2, 0, 0]);

    if (opts.led !== false) {
      const glowMat = new THREE.MeshBasicMaterial({
        color: opts.ledColor || 0x6ff6ff, transparent: true, opacity: 0.22,
        blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(new THREE.TorusGeometry(radius * 0.87, 0.03, 6, 48), glowMat);
      ring.rotation.x = PI / 2;
      ring.position.y = depth * 0.18;
      group.add(ring);
    }
    group.userData.spin = spin;
    return group;
  }

  /* ---------------------------------------------------------
     case + chassis
     --------------------------------------------------------- */
  function buildCase() {
    const root = new THREE.Group();
    root.name = 'case';
    const panels = {};
    const deco = new THREE.Group();
    deco.name = 'decor';
    root.add(deco);

    // structural frame
    const frame = new THREE.Group();
    root.add(frame);
    const px = 1.79, pz = 2.94, py = 3.16;
    [[-px, -pz], [px, -pz], [-px, pz], [px, pz]].forEach(([x, z]) => {
      const post = box(0.1, 6.25, 0.1, M.caseMetal, x, 0, z, frame);
      edge(post, 0x5bbcc5, 0.14);
    });
    // top / bottom rails
    box(3.6, 0.12, 0.12, M.caseMetal, 0, 3.12, pz, frame);
    box(3.6, 0.12, 0.12, M.caseMetal, 0, 3.12, -pz, frame);
    box(0.12, 0.12, 6.0, M.caseMetal, px, 3.12, 0, frame);
    box(0.12, 0.12, 6.0, M.caseMetal, -px, 3.12, 0, frame);
    box(3.6, 0.14, 0.14, M.caseMetal, 0, -3.05, pz, frame);
    box(3.6, 0.14, 0.14, M.caseMetal, 0, -3.05, -pz, frame);
    box(0.14, 0.14, 6.0, M.caseMetal, px, -3.05, 0, frame);
    box(0.14, 0.14, 6.0, M.caseMetal, -px, -3.05, 0, frame);

    // base plate
    const base = rbox(3.46, 0.12, 5.8, 0.04, M.caseMetal, 0, -3.0, 0, frame);
    edge(base, 0x5bbcc5, 0.12);
    // PSU vent slots on floor
    for (let i = 0; i < 10; i++) {
      box(0.04, 0.006, 1.55, M.blackPlastic, -1.05 + i * 0.17, -2.935, -1.25, frame);
    }
    // feet
    [[-1.45, -2.48], [1.45, -2.48], [-1.45, 2.48], [1.45, 2.48]].forEach(([x, z]) => {
      cyl(0.2, 0.23, 0.16, 16, M.rubber, x, -3.16, z, frame);
      torus(0.19, 0.012, 24, M.ledCyan, x, -3.075, z, frame, [PI / 2, 0, 0]);
    });

    // motherboard tray
    const tray = rbox(0.08, 4.45, 4.8, 0.03, M.caseMetal, -1.26, 0.04, -0.32, frame);
    edge(tray, 0x4f9aa4, 0.1);
    // cable grommets
    [[-1.21, 1.25, -1.28], [-1.21, 0.15, -1.55], [-1.21, -1.15, 0.6]].forEach(([x, y, z]) => {
      torus(0.19, 0.035, 24, M.rubber, x, y, z, frame, [0, PI / 2, 0]);
    });
    // vertical cable bar
    box(0.07, 2.7, 0.09, M.darkSteel, -1.08, 0.55, 1.45, frame);
    // GPU anti-sag post
    box(0.09, 1.05, 0.09, M.darkAluminum, 0.82, -1.45, 1.02, frame);
    box(0.28, 0.08, 0.18, M.darkAluminum, 0.82, -0.94, 1.02, frame);

    // small internal LEDs
    for (let i = 0; i < 4; i++) {
      const led = box(0.02, 0.12, 0.02, M.ledCyan, -1.18, 1.35 - i * 0.16, 1.83, frame);
      led.castShadow = false;
    }

    // front I/O / fascia
    const front = new THREE.Group();
    front.position.set(0, 0.02, pz);
    root.add(front);
    panels.front = front;
    // an actual open front aperture - the intake mesh is see-through
    const frontTop = rbox(3.58, 0.76, 0.19, 0.035, M.caseMetal, 0, 2.76, 0.02, front);
    const frontBottom = rbox(3.58, 0.78, 0.19, 0.035, M.caseMetal, 0, -2.75, 0.02, front);
    const frontL = rbox(0.34, 5.0, 0.19, 0.025, M.caseMetal, -1.62, 0.0, 0.02, front);
    const frontR = rbox(0.34, 5.0, 0.19, 0.025, M.caseMetal, 1.62, 0.0, 0.02, front);
    [frontTop, frontBottom, frontL, frontR].forEach((m) => edge(m, 0x6fd8df, 0.22));
    // inner rim around aperture
    box(2.98, 0.035, 0.06, M.darkAluminum, 0, 2.39, 0.11, front);
    box(2.98, 0.035, 0.06, M.darkAluminum, 0, -2.39, 0.11, front);
    box(0.035, 4.78, 0.06, M.darkAluminum, -1.48, 0, 0.11, front);
    box(0.035, 4.78, 0.06, M.darkAluminum, 1.48, 0, 0.11, front);
    // perforated metal air intake - visible texture, reads as a real front panel
    const meshTex = T.alphaMesh().clone();
    meshTex.repeat.set(3, 6);
    meshTex.needsUpdate = true;
    const meshMat = new THREE.MeshStandardMaterial({
      map: meshTex, color: 0x46535a, roughness: 0.38, metalness: 0.7,
      side: THREE.DoubleSide, envMapIntensity: 0.55
    });
    const mesh = plane(2.92, 4.74, meshMat, 0, 0, 0.125, front);
    mesh.castShadow = false;
    // horizontal structural ribs give the intake depth
    for (let i = 0; i < 4; i++) {
      box(2.92, 0.025, 0.035, M.darkSteel, 0, -1.72 + i * 1.14, 0.14, front);
    }
    // slim inner accent bars
    box(0.018, 4.6, 0.02, M.ledSoft, -1.44, 0, 0.145, front);
    box(0.018, 4.6, 0.02, M.ledSoft, 1.44, 0, 0.145, front);
    // chamfered side strips
    rbox(0.12, 5.9, 0.15, 0.02, M.darkAluminum, -1.68, 0, 0.11, front);
    rbox(0.12, 5.9, 0.15, 0.02, M.darkAluminum, 1.68, 0, 0.11, front);
    // brand
    decal(front, T.caseLogo(), 1.9, 0.48, -0.66, -2.5, 0.16);
    // power button
    const power = new THREE.Group();
    power.position.set(1.18, 2.44, 0.18);
    front.add(power);
    cyl(0.16, 0.16, 0.055, 32, M.caseMetal, 0, 0, 0, power, [PI / 2, 0, 0]);
    torus(0.135, 0.014, 32, M.ledCyan, 0, 0.032, 0, power, [0, 0, 0]);
    cyl(0.058, 0.058, 0.06, 20, M.ledCyan, 0, 0.035, 0, power, [PI / 2, 0, 0]);
    // USB / audio ports
    box(0.16, 0.06, 0.04, M.blackPlastic, 0.58, 2.46, 0.14, front);
    box(0.16, 0.06, 0.04, M.blackPlastic, 0.34, 2.46, 0.14, front);
    cyl(0.045, 0.045, 0.035, 16, M.ledCyan, 0.08, 2.46, 0.145, front, [PI / 2, 0, 0]);
    // front accent light
    box(2.4, 0.012, 0.015, M.ledCyan, 0, -2.9, 0.15, front);
    // vent grille side detail
    for (let i = 0; i < 14; i++) {
      box(0.015, 0.12, 0.04, M.blackPlastic, -1.48, 2.2 - i * 0.23, 0.15, front);
    }

    // top panel - open mesh vent with the radiator visible underneath
    const top = new THREE.Group();
    top.position.set(0, 3.24, 0);
    root.add(top);
    panels.top = top;
    const topMat = std(0x20272c, 0.43, 0.62);
    const topL = rbox(0.55, 0.1, 5.9, 0.03, topMat, -1.5, 0, 0, top);
    const topR = rbox(0.55, 0.1, 5.9, 0.03, topMat, 1.5, 0, 0, top);
    const topFront = box(2.46, 0.1, 0.34, topMat, 0, 0, 2.78, top);
    const topRear = box(2.46, 0.1, 1.3, topMat, 0, 0, -2.3, top);
    [topL, topR].forEach((m) => edge(m, 0x6fd8df, 0.18));
    const topTex = T.alphaMesh().clone();
    topTex.repeat.set(3, 5);
    topTex.needsUpdate = true;
    const topMeshMat = new THREE.MeshStandardMaterial({
      map: topTex, color: 0x3a454a, roughness: 0.44, metalness: 0.62,
      side: THREE.DoubleSide, envMapIntensity: 0.42
    });
    plane(2.44, 4.66, topMeshMat, 0, 0.055, 0.32, top, [-PI / 2, 0, 0]);
    // thin structural cross brace
    box(2.44, 0.025, 0.035, M.darkAluminum, 0, 0.07, 0.55, top);
    // I/O strip on the solid rear shelf
    box(1.3, 0.02, 0.28, M.darkAluminum, 0.66, 0.06, -2.42, top);
    for (let i = 0; i < 4; i++) {
      box(0.12, 0.035, 0.09, M.blackPlastic, 0.14 + i * 0.19, 0.08, -2.42, top);
    }
    const topPower = cyl(0.09, 0.09, 0.045, 24, M.ledCyan, 1.1, 0.075, -2.42, top);
    topPower.castShadow = false;

    // right tempered glass
    const glass = new THREE.Group();
    glass.position.set(1.83, 0.02, -0.08);
    root.add(glass);
    panels.glass = glass;
    const gp = new THREE.Mesh(new THREE.PlaneGeometry(5.55, 5.7), M.glass);
    gp.rotation.y = PI / 2;
    gp.userData.ignoreRaycast = true;
    glass.add(gp);
    // glass frame
    box(0.06, 0.09, 5.7, M.darkAluminum, 0, 2.86, 0, glass);
    box(0.06, 0.09, 5.7, M.darkAluminum, 0, -2.86, 0, glass);
    box(0.06, 5.72, 0.09, M.darkAluminum, 0, 0, 2.8, glass);
    box(0.06, 5.72, 0.09, M.darkAluminum, 0, 0, -2.8, glass);
    [[-2.65, -2.5], [2.65, -2.5], [-2.65, 2.5], [2.65, 2.5]].forEach(([y, z]) => {
      cyl(0.075, 0.075, 0.06, 20, M.darkSteel, 0.01, y, z, glass, [0, 0, PI / 2]);
    });
    // glass reflection streak
    const streakMat = new THREE.MeshBasicMaterial({
      map: T.glassStreak(), transparent: true, opacity: 0.17,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
    });
    const streak = plane(5.48, 5.62, streakMat, 0.01, 0, 0, glass, [0, PI / 2, 0]);
    streak.userData.ignoreRaycast = true;
    // etched corner mark
    decal(glass, textTexture([
      { text: 'NOVA', size: 52, spacing: '8px', color: 'rgba(220,250,250,.5)' },
      { text: 'TEMPERED  GLASS  /  4mm', size: 15, color: 'rgba(220,250,250,.3)', font: T.MONO }
    ], 512, 128, { align: 'right', x: 480, y: 58, key: 'glass-etch' }), 1.5, 0.38, 0.01, 2.45, -2.35, [0, PI / 2, 0]);

    // left panel
    const left = new THREE.Group();
    left.position.set(-1.83, 0.02, -0.08);
    root.add(left);
    panels.left = left;
    const leftPanel = rbox(0.08, 5.7, 5.65, 0.03, M.caseMetal, 0, 0, 0, left);
    edge(leftPanel, 0x5bbcc5, 0.14);
    // subtle panel break lines
    box(0.012, 0.018, 5.1, M.darkAluminum, -0.05, 1.6, 0, left);
    box(0.012, 0.018, 5.1, M.darkAluminum, -0.05, -1.6, 0, left);

    // rear panel
    const rear = new THREE.Group();
    rear.position.set(0, 0.02, -2.96);
    root.add(rear);
    panels.rear = rear;
    const rearPlate = rbox(3.56, 6.22, 0.08, 0.03, M.caseMetal, 0, 0, 0, rear);
    edge(rearPlate, 0x4f9aa4, 0.12);
    // rear fan opening (visible fan ring)
    const rearFanRing = torus(0.74, 0.035, 40, M.darkAluminum, 0.86, 1.35, -0.06, rear);
    rearFanRing.rotation.x = 0;
    const rearFan = buildFan({ radius: 0.66, depth: 0.08, blades: 9, frame: false, led: false });
    rearFan.position.set(0.86, 1.35, -0.08);
    rearFan.rotation.x = PI / 2;
    rear.add(rearFan);
    deco.userData.rearFan = rearFan;
    // rear mesh back
    const rearMeshMat = meshMat.clone();
    rearMeshMat.alphaMap = T.alphaMesh();
    plane(1.36, 1.36, rearMeshMat, 0.86, 1.35, -0.055, rear, [0, 0, 0]);
    // rear I/O cutout
    box(0.94, 0.42, 0.03, M.blackPlastic, -0.92, 1.64, -0.07, rear);
    for (let i = 0; i < 8; i++) {
      box(0.08, 0.08, 0.04, M.darkSteel, -1.3 + i * 0.1, 1.66, -0.09, rear);
    }
    // PCIe bracket slots
    for (let i = 0; i < 4; i++) {
      box(1.9, 0.13, 0.03, M.blackPlastic, -0.25, -0.25 - i * 0.31, -0.065, rear);
      box(1.86, 0.012, 0.045, M.steel, -0.25, -0.18 - i * 0.31, -0.08, rear);
    }
    // PSU cutout
    box(2.3, 1.2, 0.04, M.blackPlastic, -0.22, -2.42, -0.065, rear);
    // rear screws
    [[-1.6, 2.75], [1.6, 2.75], [-1.6, -2.75], [1.6, -2.75]].forEach(([x, y]) => {
      cyl(0.07, 0.07, 0.04, 18, M.darkSteel, x, y, -0.07, rear, [PI / 2, 0, 0]);
    });

    // inner RGB strip
    box(0.03, 4.2, 0.03, M.ledCyan, -1.2, 0.2, 2.2, frame);
    box(0.03, 0.03, 2.0, M.ledCyan, -1.2, 2.25, 0.9, frame);

    // panel animation descriptors
    const panelAnim = {
      glass: { deltaPos: new THREE.Vector3(1.35, 1.65, -0.8), deltaEuler: new THREE.Euler(0.06, -0.16, 0.18) },
      front: { deltaPos: new THREE.Vector3(-0.15, 0.7, 1.35), deltaEuler: new THREE.Euler(-0.08, 0, 0.02) },
      top: { deltaPos: new THREE.Vector3(0.25, 1.35, 0.3), deltaEuler: new THREE.Euler(0.05, 0.08, -0.03) },
      left: { deltaPos: new THREE.Vector3(-1.5, 0.25, -0.25), deltaEuler: new THREE.Euler(0, 0.1, -0.04) }
    };
    Object.keys(panelAnim).forEach((k) => {
      const p = panels[k];
      p.userData.basePos = p.position.clone();
      p.userData.baseQuat = p.quaternion.clone();
      p.userData.anim = panelAnim[k];
    });

    // ---- decor: AIO, fans, cables -------------------------
    // front intake fans (behind mesh)
    const fanA = buildFan({ radius: 0.62, depth: 0.16, blades: 9, led: true });
    fanA.position.set(-0.18, 1.2, 2.62);
    fanA.rotation.x = PI / 2;
    deco.add(fanA);
    const fanB = buildFan({ radius: 0.62, depth: 0.16, blades: 9, led: true });
    fanB.position.set(-0.18, 0.2, 2.62);
    fanB.rotation.x = PI / 2;
    deco.add(fanB);
    deco.userData.spinFans = [fanA, fanB];
    // fan mounting rail
    box(2.2, 0.03, 0.04, M.darkAluminum, -0.18, 1.75, 2.55, deco);
    box(2.2, 0.03, 0.04, M.darkAluminum, -0.18, -0.35, 2.55, deco);
    for (let i = 0; i < 3; i++) {
      box(0.03, 1.9, 0.03, M.darkAluminum, -1.02, 0.55, 2.55, deco);
      box(0.03, 1.9, 0.03, M.darkAluminum, 0.66, 0.55, 2.55, deco);
    }

    // top radiator
    const radiator = new THREE.Group();
    radiator.position.set(0.08, 2.72, -0.2);
    deco.add(radiator);
    box(3.0, 0.2, 1.8, M.darkAluminum, 0, 0, 0, radiator);
    for (let i = 0; i < 30; i++) {
      box(0.018, 0.28, 1.78, M.darkSteel, -1.42 + i * 0.098, 0, 0, radiator);
    }
    box(3.0, 0.045, 0.06, M.ledCyan, 0, 0.17, 0.86, radiator);
    // radiator fans, blowing up (axis y)
    [ -0.78, 0.78 ].forEach((x) => {
      const rf = buildFan({ radius: 0.6, depth: 0.13, blades: 9, frame: false, led: false });
      rf.position.set(x, -0.2, 0);
      radiator.add(rf);
      deco.userData.radFans = deco.userData.radFans || [];
      deco.userData.radFans.push(rf);
    });
    // radiator end tanks and fittings
    box(0.16, 0.26, 1.85, M.darkSteel, -1.54, 0.02, 0, radiator);
    box(0.16, 0.26, 1.85, M.darkSteel, 1.54, 0.02, 0, radiator);
    cyl(0.08, 0.08, 0.18, 20, M.brass, -1.15, 0.12, -0.72, radiator, [0, 0, 0]);
    cyl(0.08, 0.08, 0.18, 20, M.brass, -0.85, 0.12, -0.72, radiator, [0, 0, 0]);

    // AIO pump block at CPU socket (world approx -0.32, 0.9, -0.4)
    const pump = new THREE.Group();
    pump.position.set(-0.3, 0.9, -0.4);
    deco.add(pump);
    const pumpBody = cyl(0.42, 0.44, 0.24, 48, M.blackPlastic, 0, 0, 0, pump, [0, 0, PI / 2]);
    pumpBody.rotation.z = PI / 2;
    torus(0.36, 0.022, 48, M.ledCyan, 0.13, 0, 0, pump, [0, PI / 2, 0]);
    const pumpScreen = plane(0.54, 0.54, M.screen, 0.135, 0, 0, pump, [0, PI / 2, 0]);
    pumpScreen.userData.ignoreRaycast = true;
    // tubes
    const tubeMat = std(0x101315, 0.66, 0.12);
    const tubeA = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.18, 1.06, -0.55),
      new THREE.Vector3(0.35, 1.72, -0.92),
      new THREE.Vector3(0.1, 2.35, -0.95),
      new THREE.Vector3(-1.12, 2.84, -0.72)
    ]);
    const tubeGeoA = new THREE.TubeGeometry(tubeA, 40, 0.045, 8, false);
    const tubeMeshA = new THREE.Mesh(tubeGeoA, tubeMat);
    tubeMeshA.castShadow = true;
    deco.add(tubeMeshA);
    const tubeB = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.1, 1.08, -0.25),
      new THREE.Vector3(0.55, 1.86, -0.3),
      new THREE.Vector3(0.22, 2.45, -0.45),
      new THREE.Vector3(-0.82, 2.84, -0.52)
    ]);
    const tubeGeoB = new THREE.TubeGeometry(tubeB, 40, 0.045, 8, false);
    const tubeMeshB = new THREE.Mesh(tubeGeoB, tubeMat);
    tubeMeshB.castShadow = true;
    deco.add(tubeMeshB);

    // braided GPU / board power cables
    const cableMat = std(0x14181b, 0.65, 0.1);
    const cableCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.72, -1.9, -0.4),
      new THREE.Vector3(0.96, -1.1, -0.1),
      new THREE.Vector3(0.6, -0.25, 0.6),
      new THREE.Vector3(0.15, -0.1, 0.95)
    ]);
    const cable = new THREE.Mesh(new THREE.TubeGeometry(cableCurve, 30, 0.06, 7, false), cableMat);
    cable.castShadow = true;
    deco.add(cable);
    for (let i = 0; i < 3; i++) {
      const c = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.3 + i * 0.07, -1.85, -0.78),
        new THREE.Vector3(0.55 + i * 0.06, -1.15, -0.9),
        new THREE.Vector3(0.3 + i * 0.05, -0.72, -0.94),
        new THREE.Vector3(0.02 + i * 0.04, -0.72, -0.94)
      ]);
      const cm = new THREE.Mesh(new THREE.TubeGeometry(c, 24, 0.032, 6, false), cableMat);
      cm.castShadow = true;
      deco.add(cm);
    }

    return { root, panels, deco, frame };
  }

  /* ---------------------------------------------------------
     CPU
     --------------------------------------------------------- */
  function buildCPU() {
    const part = makePart('cpu');
    const root = part.root;

    // socket is part of the teardown rig, but only in focused view
    const socket = new THREE.Group();
    socket.position.y = -0.34;
    root.add(socket);
    part.focusOnly.push(socket);
    const socketBase = rbox(1.62, 0.16, 1.62, 0.02, M.darkSteel, 0, 0, 0, socket);
    edge(socketBase, 0x70d9e2, 0.15);
    // LGA pin field
    const pinMat = M.gold;
    const pinCount = 23;
    const pinGeo = new THREE.BoxGeometry(0.021, 0.012, 0.021);
    const pins = new THREE.InstancedMesh(pinGeo, pinMat, pinCount * pinCount);
    const dummy = new THREE.Object3D();
    let n = 0;
    for (let ix = 0; ix < pinCount; ix++) {
      for (let iz = 0; iz < pinCount; iz++) {
        dummy.position.set(-0.55 + ix * (1.1 / (pinCount - 1)), 0.087, -0.55 + iz * (1.1 / (pinCount - 1)));
        dummy.updateMatrix();
        pins.setMatrixAt(n++, dummy.matrix);
      }
    }
    pins.castShadow = false;
    socket.add(pins);
    // socket frame rails
    const railTop = box(1.32, 0.055, 0.075, M.darkAluminum, 0, 0.16, -0.66, socket);
    const railBottom = box(1.32, 0.055, 0.075, M.darkAluminum, 0, 0.16, 0.66, socket);
    const railLeft = box(0.075, 0.055, 1.32, M.darkAluminum, -0.66, 0.16, 0, socket);
    const railRight = box(0.075, 0.055, 1.32, M.darkAluminum, 0.66, 0.16, 0, socket);
    // retention lever
    const lever = new THREE.Group();
    lever.position.set(0.72, 0.19, -0.48);
    socket.add(lever);
    cyl(0.018, 0.018, 0.78, 10, M.steel, 0, 0, -0.27, lever, [PI / 2, 0, 0]);
    cyl(0.026, 0.026, 0.05, 12, M.steel, 0, 0, 0.1, lever, [0, 0, PI / 2]);
    // screws
    [[-0.72, -0.72], [0.72, -0.72], [-0.72, 0.72], [0.72, 0.72]].forEach(([x, z]) => {
      cyl(0.045, 0.045, 0.06, 16, M.steel, x, 0.15, z, socket);
    });

    // CPU package
    const pkg = new THREE.Group();
    pkg.position.y = 0.09;
    root.add(pkg);
    const substrate = rbox(1.18, 0.075, 1.18, 0.018, M.pcbBlue, 0, 0, 0, pkg);
    edge(substrate, 0xc6a25a, 0.12);
    // SMD capacitors around edge
    for (let i = 0; i < 9; i++) {
      const a = i / 9 * PI * 2;
      box(0.055, 0.028, 0.032, M.ic, Math.cos(a) * 0.49, 0.055, Math.sin(a) * 0.49, pkg);
    }
    // die
    const dieGroup = new THREE.Group();
    dieGroup.position.y = 0.075;
    pkg.add(dieGroup);
    box(0.54, 0.055, 0.47, M.silicon, 0, 0, 0, dieGroup);
    decal(dieGroup, T.circuitDetail(), 0.5, 0.44, 0, 0.03, 0, [-PI / 2, 0, 0], { metalness: 0.55, roughness: 0.35, emissive: 0x0d5b65, emissiveIntensity: 0.8 });
    // tiny capacitors on die side
    for (let i = 0; i < 4; i++) {
      box(0.073, 0.04, 0.055, M.ic, -0.31 + i * 0.21, 0, 0.31, dieGroup);
    }
    // IHS
    const ihs = new THREE.Group();
    ihs.position.y = 0.16;
    pkg.add(ihs);
    const ihsBody = rbox(1.03, 0.14, 1.03, 0.055, M.steel, 0, 0, 0, ihs);
    edge(ihsBody, 0xc7d4d7, 0.28);
    // brushed top catch-light
    const topInset = rbox(0.8, 0.012, 0.8, 0.03, M.aluminum, 0, 0.074, 0, ihs);
    // laser engraving
    decal(ihs, textTexture([
      { text: 'NOVA', size: 67, weight: 700, font: T.SANS, spacing: '6px', color: 'rgba(30,38,42,.9)' },
      { text: 'CORE  X9  /  3.8 GHz', size: 18, font: T.MONO, gap: 0, color: 'rgba(30,38,42,.6)' }
    ], 512, 256, { align: 'center', y: 124, key: 'cpu-ihs' }), 0.86, 0.43, 0, 0.078, 0, [-PI / 2, 0, 0], { roughness: 0.35, metalness: 0.4 });
    // contact pads under package
    const contact = new THREE.Group();
    contact.position.y = -0.055;
    pkg.add(contact);
    box(1.12, 0.02, 1.12, M.gold, 0, 0, 0, contact);
    decal(contact, textTexture([
      { text: 'NOVA  X9  /  LGA 1700', size: 34, font: T.MONO, spacing: '2px', color: 'rgba(24,19,8,.78)' }
    ], 512, 64, { align: 'center', y: 44, key: 'cpu-contact' }), 0.94, 0.12, 0, -0.013, 0, [PI / 2, 0, 0], { metalness: 1, roughness: 0.3 });

    registerExplode(part, ihs, [0, 1.55, 0], 0.02, 0.42, [0.04, 0.08, -0.02]);
    registerExplode(part, dieGroup, [0, 0.95, 0], 0.22, 0.58, [0, 0, 0.06]);
    registerExplode(part, pkg, [0, 0.34, 0], 0.48, 0.78);
    registerExplode(part, contact, [0, -0.9, 0], 0.55, 0.92);
    registerExplode(part, socket, [0, -0.5, 0], 0.2, 0.6);

    tag(part, ihs, 'IHS 均热顶盖', 'INTEGRATED HEAT SPREADER', 0.22, 0.7, -0.3);
    tag(part, dieGroup, '硅晶片 Die', '8 P-CORES + 16 E-CORES', 0.42, -0.6, 0.4);
    tag(part, socket, 'LGA 1700 触点', '1,700 CONTACT PINS', 0.55, 0.3, 0.9);
    tag(part, contact, '黄金触点层', 'GOLD-PLATED CONTACTS', 0.7, -0.8, 0.2);

    part.assemblyPos = new THREE.Vector3(-0.72, 0.9, -0.4);
    part.assemblyQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, -PI / 2));
    part.focusQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.08, 0.12, 0));
    part.explodePos = new THREE.Vector3(-0.28, 1.32, -0.08);
    finalizePart(part);
    return part;
  }

  /* ---------------------------------------------------------
     GPU
     --------------------------------------------------------- */
  function buildGPU() {
    const part = makePart('gpu');
    const root = part.root;

    // PCB
    const pcb = rbox(3.34, 0.07, 1.56, 0.02, M.pcbDark, 0, 0, 0, root);
    edge(pcb, 0x7be6dd, 0.13);
    // gold PCIe fingers along board-side edge
    box(2.2, 0.045, 0.14, M.gold, -0.15, -0.045, 0.735, root);
    decal(root, textTexture([
      { text: 'NOVA  RTX 5080  /  16G', size: 22, font: T.MONO, color: 'rgba(210,244,240,.5)' }
    ], 512, 64, { align: 'center', y: 42, key: 'gpu-pcb-label' }), 1.7, 0.21, 0, 0.042, 0.58, [-PI / 2, 0, 0], { roughness: 0.7, metalness: 0.1 });

    // VRM / VRAM component field on top
    const components = new THREE.Group();
    components.position.y = 0.07;
    root.add(components);
    // memory chips
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 2; j++) {
        box(0.31, 0.045, 0.22, M.ic, -1.28 + i * 0.78, 0, -0.17 + j * 0.34, components);
      }
    }
    // VRM chokes
    for (let i = 0; i < 5; i++) {
      box(0.18, 0.09, 0.16, M.darkSteel, -1.1 + i * 0.32, 0.04, 0.51, components);
    }
    // capacitors
    for (let i = 0; i < 9; i++) {
      cyl(0.032, 0.032, 0.09, 10, M.silver, 0.2 + (i % 5) * 0.17, 0.04, 0.6 - Math.floor(i / 5) * 0.12, components);
    }
    // power connector
    const powerConn = box(0.48, 0.2, 0.22, M.blackPlastic, -1.02, 0.12, -0.15, root);
    for (let i = 0; i < 6; i++) box(0.035, 0.14, 0.035, M.gold, -1.2 + i * 0.07, 0.1, -0.26, root);

    // backplate
    const backplate = new THREE.Group();
    backplate.position.y = 0.28;
    root.add(backplate);
    const bp = rbox(3.28, 0.065, 1.52, 0.045, M.darkAluminum, 0, 0, 0, backplate);
    edge(bp, 0x8fe9e0, 0.16);
    decal(backplate, T.gpuBackplate(), 3.08, 1.4, 0, 0.037, 0, [-PI / 2, 0, 0], { roughness: 0.82, metalness: 0.06 });
    // etched underside - becomes the display face when the card is flipped for teardown
    decal(backplate, textTexture([
      { text: 'NOVA', size: 92, weight: 700, font: T.SANS, spacing: '18px', color: 'rgba(218,240,236,.18)' },
      { text: 'FULL-LENGTH  ALUMINIUM  BACKPLATE', size: 15, font: T.MONO, color: 'rgba(143,244,231,.24)', gap: 0 }
    ], 1024, 256, { align: 'center', y: 128, key: 'gpu-back-under' }), 2.9, 0.72, 0, -0.036, 0, [PI / 2, 0, 0], { basic: true });
    // backplate cutouts / screws
    [[-1.42, 0.62], [1.42, 0.62], [-1.42, -0.62], [1.42, -0.62]].forEach(([x, z]) => {
      cyl(0.055, 0.055, 0.045, 16, M.steel, x, 0.04, z, backplate);
    });

    // heatsink
    const heatsink = new THREE.Group();
    heatsink.position.y = -0.1;
    root.add(heatsink);
    box(3.06, 0.055, 1.38, M.copper, 0, 0, 0, heatsink);
    for (let i = 0; i < 16; i++) {
      box(3.0, 0.24, 0.02, M.darkAluminum, 0, -0.18, -0.62 + i * 0.083, heatsink);
    }
    // heatpipes
    [-0.42, 0.02, 0.42].forEach((z) => {
      cyl(0.028, 0.028, 2.9, 12, M.copper, 0, -0.06, z, heatsink, [0, 0, PI / 2]);
    });
    // vapor chamber block
    box(1.1, 0.11, 1.05, M.copper, 0.1, 0.04, 0, heatsink);
    // fins visible at end
    for (let i = 0; i < 7; i++) {
      box(0.02, 0.3, 1.34, M.aluminum, -1.52 + i * 0.03, -0.18, 0, heatsink);
    }

    // shroud with 3 fan cutouts
    const shroud = new THREE.Group();
    shroud.position.y = -0.45;
    root.add(shroud);
    const shroudShape = new THREE.Shape();
    const sw = 3.38, sh = 1.57, rr = 0.16;
    shroudShape.moveTo(-sw / 2 + rr, -sh / 2);
    shroudShape.lineTo(sw / 2 - rr, -sh / 2);
    shroudShape.quadraticCurveTo(sw / 2, -sh / 2, sw / 2, -sh / 2 + rr);
    shroudShape.lineTo(sw / 2, sh / 2 - rr);
    shroudShape.quadraticCurveTo(sw / 2, sh / 2, sw / 2 - rr, sh / 2);
    shroudShape.lineTo(-sw / 2 + rr, sh / 2);
    shroudShape.quadraticCurveTo(-sw / 2, sh / 2, -sw / 2, sh / 2 - rr);
    shroudShape.lineTo(-sw / 2, -sh / 2 + rr);
    shroudShape.quadraticCurveTo(-sw / 2, -sh / 2, -sw / 2 + rr, -sh / 2);
    [-1.06, 0, 1.06].forEach((cx) => {
      const hole = new THREE.Path();
      hole.absarc(cx, 0, 0.61, 0, PI * 2, true);
      shroudShape.holes.push(hole);
    });
    const shroudGeo = new THREE.ExtrudeGeometry(shroudShape, {
      depth: 0.1, bevelEnabled: true, bevelSize: 0.018, bevelThickness: 0.018,
      bevelSegments: 2, curveSegments: 40
    });
    shroudGeo.rotateX(PI / 2);
    const shroudMesh = new THREE.Mesh(shroudGeo, M.blackPlastic);
    shroudMesh.castShadow = true;
    shroudMesh.receiveShadow = true;
    shroud.add(shroudMesh);
    // shroud divider facets
    box(0.035, 0.14, 1.45, M.darkAluminum, -0.53, 0.04, 0, shroud);
    box(0.035, 0.14, 1.45, M.darkAluminum, 0.53, 0.04, 0, shroud);
    // illuminated fan aperture rings - visible from the fan side
    const fanX = [-1.06, 0, 1.06];
    fanX.forEach((x) => {
      torus(0.615, 0.012, 52, M.ledPinkSoft, x, -0.115, 0, shroud, [PI / 2, 0, 0]);
      const f = buildFan({
        radius: 0.59, depth: 0.13, blades: 11, frame: false, led: true,
        bladeMat: M.fanBlade, ringMat: M.ledPinkSoft, hubMat: M.steel, hubTopMat: M.silver
      });
      f.position.set(x, -0.22, 0);
      shroud.add(f);
      part.fans.push(f);
    });

    // PCIe bracket and ports
    const bracket = new THREE.Group();
    root.add(bracket);
    const br = box(0.06, 1.15, 1.58, M.steel, -1.7, -0.03, 0, bracket);
    edge(br, 0x91a2a8, 0.22);
    // vent slots
    for (let i = 0; i < 6; i++) {
      box(0.025, 0.55, 0.035, M.blackPlastic, -1.735, 0.1, -0.62 + i * 0.1, bracket);
    }
    // display ports / HDMI cutouts
    for (let i = 0; i < 3; i++) {
      box(0.025, 0.14, 0.28, M.blackPlastic, -1.735, -0.22, -0.52 + i * 0.38, bracket);
      box(0.028, 0.09, 0.2, M.darkSteel, -1.74, -0.22, -0.52 + i * 0.38, bracket);
    }
    // support bracket
    box(0.08, 0.5, 0.08, M.steel, 1.55, -0.32, 0, root);

    registerExplode(part, backplate, [0, 1.35, 0], 0.04, 0.4, [0.1, 0, 0]);
    registerExplode(part, shroud, [0, -1.15, 0], 0.04, 0.5, [0, 0, 0]);
    registerExplode(part, heatsink, [0, -0.52, 0], 0.22, 0.64, [0, 0, 0]);
    registerExplode(part, components, [0, 0.2, 0], 0.38, 0.75);
    registerExplode(part, bracket, [0, 0, 0.1], 0, 1);
    // backplate screws lift with it automatically; RGB on shroud follows

    tag(part, shroud, '三风扇导风罩', 'TRIPLE 110MM  /  ARGB', 0.25, 0.65, -0.4);
    tag(part, heatsink, '均热板 + 鳍片', 'VAPOR CHAMBER / 7 HEATPIPES', 0.42, -0.75, 0.25);
    tag(part, components, 'GDDR7 显存', '16GB  /  256-BIT', 0.56, 0.7, -0.2);
    tag(part, backplate, '金属背板', 'FULL-LENGTH BACKPLATE', 0.7, -0.45, 0.45);

    part.assemblyPos = new THREE.Vector3(-0.06, -0.78, -0.55);
    part.assemblyQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -PI / 2, 0));
    part.focusQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(PI - 0.15, 0.16, 0.02));
    part.explodePos = new THREE.Vector3(0.95, -0.92, 0.2);
    finalizePart(part);
    return part;
  }

  /* ---------------------------------------------------------
     RAM
     --------------------------------------------------------- */
  function buildRAM() {
    const part = makePart('ram');
    const root = part.root;

    const moduleGroups = [];
    const zOffsets = [-0.22, 0.22];

    zOffsets.forEach((zOff, index) => {
      const mod = new THREE.Group();
      mod.position.z = zOff;
      root.add(mod);
      moduleGroups.push(mod);

      // PCB substrate
      const pcb = rbox(0.72, 2.04, 0.085, 0.012, M.pcbBlue, 0, 0, 0, mod);
      edge(pcb, 0x71ddd4, 0.1);

      // gold contact fingers along the board-side edge
      const contact = new THREE.Group();
      contact.position.x = -0.365;
      mod.add(contact);
      box(0.04, 2.02, 0.1, M.gold, 0, 0, 0, contact);
      const finger = new THREE.BoxGeometry(0.024, 0.085, 0.104);
      for (let i = 0; i < 20; i++) {
        const f = new THREE.Mesh(finger, M.brass);
        f.position.set(0.005, -0.92 + i * 0.096, 0);
        contact.add(f);
      }
      // key notch
      box(0.07, 0.1, 0.12, M.blackPlastic, -0.005, -0.18, 0, contact);

      // memory chips + PMIC on both faces
      [-1, 1].forEach((side) => {
        const chips = new THREE.Group();
        chips.position.z = side * 0.06;
        mod.add(chips);
        for (let row = 0; row < 2; row++) {
          for (let col = 0; col < 4; col++) {
            const chip = box(0.28, 0.26, 0.04, M.ic,
              -0.24 + col * 0.16, 0.38 - row * 0.4, 0, chips);
            chip.castShadow = false;
            box(0.22, 0.02, 0.012, M.icTop, -0.24 + col * 0.16, 0.38 - row * 0.4 + 0.1, side * 0.026, chips);
          }
        }
        // PMIC and small passives
        box(0.18, 0.15, 0.04, M.ic, 0.2, -0.46, 0, chips);
        for (let i = 0; i < 5; i++) {
          box(0.035, 0.06, 0.03, M.silver, -0.28 + i * 0.1, -0.66, 0, chips);
        }
        // side-mounted register chips
        for (let i = 0; i < 3; i++) {
          box(0.06, 0.2, 0.028, M.ic, 0.3, 0.62 + i * 0.24, 0, chips);
        }
      });

      // heat spreader - two halves
      const covers = [];
      [-1, 1].forEach((side) => {
        const cover = new THREE.Group();
        cover.position.z = side * 0.075;
        mod.add(cover);
        covers.push({ cover, side });
        const plate = rbox(0.8, 1.88, 0.055, 0.06, M.ramCover, 0, 0, 0, cover);
        edge(plate, 0x9cefe7, 0.13);
        // brushed ridge pattern
        for (let i = 0; i < 7; i++) {
          box(0.034, 1.62, 0.012, M.darkSteel, -0.3 + i * 0.1, 0, side * 0.033, cover);
        }
        // angled top plate accent
        box(0.55, 0.05, 0.012, M.ledSoft, 0, 0.78, side * 0.034, cover);
        box(0.3, 0.035, 0.012, M.ledSoft, 0, -0.84, side * 0.034, cover);
        // label
        if (side === 1) {
          decal(cover, textTexture([
            { text: 'NOVA', size: 66, weight: 700, font: T.SANS, spacing: '7px', color: 'rgba(235,250,247,.9)' },
            { text: 'DDR5  /  6400  /  32GB', size: 17, font: T.MONO, color: 'rgba(143,244,231,.78)', gap: 0 }
          ], 512, 192, { align: 'center', y: 94, key: 'ram-cover-' + index }), 0.68, 0.26, 0, 0.02, 0.034, [0, 0, 0], { basic: true });
        }
      });

      // smoked RGB diffuser fixed to the outer heat-spreader half
      const rgb = new THREE.Group();
      const frontCover = covers.find((c) => c.side === 1).cover;
      rgb.position.set(0.375, 0, 0.04);
      frontCover.add(rgb);
      const rgbMat = new THREE.MeshStandardMaterial({
        color: 0x10241d, emissive: 0x74ffc8, emissiveIntensity: 0.42,
        roughness: 0.34, metalness: 0.3, transparent: true, opacity: 0.82
      });
      box(0.032, 1.66, 0.065, rgbMat, 0, 0, 0, rgb);

      if (index === 0) {
        tag(part, covers[0].cover, 'DDR5 散热马甲', 'ALUMINIUM HEAT SPREADER', 0.25, 0.75, -0.3);
        tag(part, covers[0].cover, 'DDR5 存储颗粒', '16Gb × 16  /  6400 MT/s', 0.48, -0.8, 0.2);
        tag(part, contact, '金手指触点', '288-PIN  /  1.4V', 0.7, 0.6, 0.5);
      }

      covers.forEach(({ cover, side }) => {
        registerExplode(part, cover, [0, 0, side * 0.62], 0.08, 0.5, [0, side * 0.16, 0]);
      });
      registerExplode(part, contact, [-0.58, 0, 0], 0.5, 0.9);
    });

    // one module is enough for a legible teardown; the second stays installed
    part.hideInFocus = [moduleGroups[1]];
    part.assemblyPos = new THREE.Vector3(-0.4, 0.55, 1.0);
    part.assemblyQuat = new THREE.Quaternion();
    part.focusQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.02, -0.24, 0));
    part.explodePos = new THREE.Vector3(0.55, 0.72, 1.53);
    finalizePart(part);
    return part;
  }

  /* ---------------------------------------------------------
     HDD
     --------------------------------------------------------- */
  function buildHDD() {
    const part = makePart('hdd');
    const root = part.root;

    // drive base / chassis
    const base = rbox(2.16, 0.34, 2.18, 0.035, M.darkAluminum, 0, -0.22, 0, root);
    edge(base, 0x8ee8df, 0.12);
    box(2.18, 0.5, 0.045, M.darkSteel, 0, -0.01, 1.075, root);
    box(2.18, 0.5, 0.045, M.darkSteel, 0, -0.01, -1.075, root);
    box(0.045, 0.5, 2.14, M.darkSteel, 1.075, -0.01, 0, root);
    box(0.045, 0.5, 2.14, M.darkSteel, -1.075, -0.01, 0, root);

    // top cover
    const cover = new THREE.Group();
    cover.position.y = 0.27;
    root.add(cover);
    const lid = rbox(2.18, 0.09, 2.19, 0.02, M.hddCover, 0, 0, 0, cover);
    edge(lid, 0xdfe7e7, 0.18);
    decal(cover, T.hddLabel(), 1.94, 0.97, 0, 0.048, 0, [-PI / 2, 0, 0], { roughness: 0.68, metalness: 0.1 });
    // label around the top edge / side
    for (let i = 0; i < 4; i++) {
      cyl(0.058, 0.058, 0.025, 16, M.steel, [-0.92, 0.92, -0.92, 0.92][i], 0.055, i < 2 ? 0.92 : -0.92, cover);
    }
    // warranty seal
    const seal = box(0.18, 0.012, 0.32, M.blackPlastic, 0.82, 0.052, 0.55, cover);
    decal(cover, textTexture([
      { text: 'VOID', size: 40, font: T.MONO, color: 'rgba(25,30,31,.7)' }
    ], 128, 64, { align: 'center', y: 45, key: 'void-seal' }), 0.14, 0.07, 0.82, 0.06, 0.55, [-PI / 2, 0, 0], { roughness: 0.8, metalness: 0 });

    // platters
    const platters = new THREE.Group();
    root.add(platters);
    const platterGroups = [];
    const platterMat = new THREE.MeshStandardMaterial({ color: 0xb8c2c6, roughness: 0.18, metalness: 1.0, envMapIntensity: 1.6 });
    const platterEdgeMat = new THREE.MeshStandardMaterial({ color: 0x646f73, roughness: 0.4, metalness: 0.9 });
    for (let i = 0; i < 3; i++) {
      const pg = new THREE.Group();
      pg.position.y = -0.04 + i * 0.075;
      platters.add(pg);
      platterGroups.push(pg);
      const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.86, 0.86, 0.032, 64), [platterEdgeMat, platterMat, platterMat]);
      disc.castShadow = true; disc.receiveShadow = true;
      pg.add(disc);
      for (let r = 0; r < 4; r++) {
        torus(0.26 + r * 0.16, 0.003, 64, M.steel, 0, 0.017, 0, pg, [PI / 2, 0, 0]);
      }
      // tiny sector mark
      box(0.22, 0.004, 0.05, M.darkSteel, 0.47, 0.021, 0, pg);
    }
    // central spindle
    const spindle = cyl(0.16, 0.16, 0.44, 32, M.steel, 0, 0.02, 0, root);
    torus(0.21, 0.018, 36, M.darkSteel, 0, 0.2, 0, root, [PI / 2, 0, 0]);
    for (let i = 0; i < 6; i++) {
      const a = i / 6 * PI * 2;
      cyl(0.014, 0.014, 0.05, 8, M.darkSteel, Math.cos(a) * 0.11, 0.22, Math.sin(a) * 0.11, root);
    }

    // actuator arm
    const actuator = new THREE.Group();
    actuator.position.set(0.73, 0.17, -0.72);
    root.add(actuator);
    cyl(0.13, 0.13, 0.13, 24, M.darkSteel, 0, 0, 0, actuator);
    const arm = box(0.9, 0.055, 0.12, M.aluminum, -0.46, 0.04, 0.1, actuator);
    arm.rotation.y = -0.18;
    box(0.22, 0.06, 0.18, M.steel, -0.91, 0.04, 0.18, actuator);
    const armTip = box(0.12, 0.03, 0.1, M.copper, -0.99, 0.024, 0.19, actuator);
    // voice coil
    box(0.24, 0.08, 0.3, M.copper, 0.2, 0.02, 0.25, actuator);
    box(0.3, 0.1, 0.36, M.darkSteel, 0.22, 0.0, 0.25, actuator);
    torus(0.07, 0.012, 20, M.steel, -0.96, 0.04, 0.19, actuator, [0, 0, PI / 2]);

    // bottom PCB
    const pcb = new THREE.Group();
    pcb.position.y = -0.46;
    root.add(pcb);
    const pcbBoard = rbox(1.98, 0.055, 1.72, 0.02, M.pcbDark, 0, 0, -0.04, pcb);
    edge(pcbBoard, 0x6fded1, 0.1);
    // controller + cache
    box(0.4, 0.06, 0.34, M.ic, 0.32, -0.045, -0.22, pcb);
    box(0.24, 0.05, 0.24, M.ic, -0.18, -0.04, -0.35, pcb);
    for (let i = 0; i < 8; i++) {
      box(0.08, 0.035, 0.13, M.ic, -0.58 + i * 0.16, -0.04, 0.34, pcb);
    }
    // SATA + power connector (facing outward)
    box(0.48, 0.15, 0.2, M.blackPlastic, 0.6, -0.04, 0.68, pcb);
    box(0.3, 0.12, 0.19, M.blackPlastic, 0.04, -0.04, 0.68, pcb);
    for (let i = 0; i < 5; i++) box(0.02, 0.09, 0.02, M.gold, 0.45 + i * 0.04, -0.04, 0.79, pcb);
    // screw posts
    [[-0.82, -0.72], [0.82, -0.72], [-0.82, 0.72], [0.82, 0.72]].forEach(([x, z]) => {
      cyl(0.045, 0.045, 0.08, 12, M.steel, x, -0.04, z, pcb);
    });

    // subtle model markings on the front edge
    decal(root, textTexture([
      { text: 'BARRACUDA', size: 30, weight: 700, font: T.SANS, spacing: '3px', color: 'rgba(204,231,228,.32)' },
      { text: '4TB  •  7200RPM  •  SATA', size: 11, font: T.MONO, color: 'rgba(143,244,231,.35)', gap: 0 }
    ], 512, 128, { align: 'center', y: 68, key: 'hdd-edge' }), 1.0, 0.24, 0, -0.13, 1.1, [0, 0, 0], { basic: true });

    // side rails / mounting holes
    [[-0.96, 0.8], [-0.96, -0.8], [0.96, 0.8], [0.96, -0.8]].forEach(([x, z]) => {
      cyl(0.055, 0.055, 0.06, 14, M.steel, x, -0.06, z, root, [0, 0, PI / 2]);
    });

    registerExplode(part, cover, [0, 1.9, 0], 0.02, 0.38, [0.02, 0.05, 0.02]);
    platterGroups.forEach((pg, i) => {
      registerExplode(part, pg, [0, 0.7 + i * 0.3, 0], 0.18 + i * 0.06, 0.68 + i * 0.06, [0, 0.18 * (i + 1), 0]);
    });
    registerExplode(part, actuator, [0, 0.24, 0], 0.34, 0.78, [0, -0.32, 0]);
    registerExplode(part, pcb, [0, -0.92, 0], 0.35, 0.85, [0.05, 0, 0]);
    registerExplode(part, spindle, [0, 0.22, 0], 0.12, 0.6);

    tag(part, cover, '密封顶盖', 'HERMETICALLY SEALED COVER', 0.2, 0.65, -0.35);
    tag(part, platterGroups[1], '磁盘盘片', '3 × 1.33TB  /  7200 RPM', 0.42, -0.8, 0.25);
    tag(part, actuator, '磁头驱动臂', 'VOICE COIL ACTUATOR', 0.58, 0.75, 0.35);
    tag(part, pcb, '控制电路板', 'SATA 6Gb/s  /  256MB CACHE', 0.7, -0.4, 0.55);

    part.assemblyPos = new THREE.Vector3(0.32, -1.7, 1.22);
    part.assemblyQuat = new THREE.Quaternion();
    part.focusQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.04, -0.28, 0.03));
    part.explodePos = new THREE.Vector3(1.18, -1.25, 2.3);
    finalizePart(part);
    return part;
  }

  /* ---------------------------------------------------------
     MOTHERBOARD
     --------------------------------------------------------- */
  function buildMotherboard() {
    const part = makePart('mb');
    const root = part.root;

    // PCB
    const board = rbox(3.7, 4.2, 0.075, 0.055, M.pcb, 0, 0, 0, root);
    edge(board, 0x66d8d4, 0.12);
    decal(root, T.motherboardOverlay(), 3.58, 4.08, 0, 0, 0.049, [0, 0, 0], { roughness: 0.8, metalness: 0.08 });
    // board rear edge accents
    box(0.03, 4.1, 0.02, M.ledCyan, 1.78, 0, 0.03, root);
    box(3.6, 0.025, 0.02, M.darkAluminum, 0, 2.06, 0.03, root);

    // scattered SMD components
    const smd = new THREE.Group();
    root.add(smd);
    const rand = (function () { let s = 9081; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; })();
    for (let i = 0; i < 42; i++) {
      const x = (rand() - 0.5) * 3.2;
      const y = (rand() - 0.5) * 3.7;
      if (Math.abs(x) < 0.8 && Math.abs(y - 0.75) < 0.8) continue;
      box(0.06 + rand() * 0.08, 0.02 + rand() * 0.02, 0.04 + rand() * 0.04, M.ic, x, y, 0.05, smd);
    }
    for (let i = 0; i < 12; i++) {
      const x = (rand() - 0.5) * 3.0;
      const y = (rand() - 0.5) * 3.4;
      cyl(0.035, 0.035, 0.1, 10, M.silver, x, y, 0.07, smd);
    }

    // CPU socket
    const socket = new THREE.Group();
    socket.position.set(0.15, 0.75, 0.07);
    root.add(socket);
    const socketBase = rbox(1.12, 1.12, 0.13, 0.02, M.darkSteel, 0, 0, 0, socket);
    edge(socketBase, 0xd3b26a, 0.18);
    const pinGeo = new THREE.BoxGeometry(0.015, 0.015, 0.008);
    const socketPins = new THREE.InstancedMesh(pinGeo, M.gold, 21 * 21);
    const dummy = new THREE.Object3D();
    let pi = 0;
    for (let ix = 0; ix < 21; ix++) for (let iy = 0; iy < 21; iy++) {
      dummy.position.set(-0.4 + ix * 0.04, -0.4 + iy * 0.04, 0.07);
      dummy.updateMatrix(); socketPins.setMatrixAt(pi++, dummy.matrix);
    }
    socket.add(socketPins);
    // retention frame
    const retention = new THREE.Group();
    socket.add(retention);
    box(1.28, 0.055, 0.1, M.darkAluminum, 0, 0.61, 0.1, retention);
    box(1.28, 0.055, 0.1, M.darkAluminum, 0, -0.61, 0.1, retention);
    box(0.1, 0.055, 1.28, M.darkAluminum, 0.61, 0, 0.1, retention);
    box(0.1, 0.055, 1.28, M.darkAluminum, -0.61, 0, 0.1, retention);
    cyl(0.018, 0.018, 0.75, 8, M.steel, -0.69, 0, 0.1, retention, [PI / 2, 0, 0]);
    // mounting holes
    [[-0.72, -0.72], [0.72, -0.72], [-0.72, 0.72], [0.72, 0.72]].forEach(([x, y]) => {
      torus(0.055, 0.012, 18, M.darkSteel, x, y, 0.1, socket);
    });

    // VRM heatsinks
    const vrmTop = new THREE.Group();
    vrmTop.position.set(0.14, 1.7, 0.13);
    root.add(vrmTop);
    const vrmBlock = rbox(1.35, 0.38, 0.22, 0.05, M.darkAluminum, 0, 0, 0, vrmTop);
    edge(vrmBlock, 0x7fe4e2, 0.12);
    for (let i = 0; i < 12; i++) {
      box(0.03, 0.31, 0.2, M.steel, -0.54 + i * 0.098, 0.02, 0.02, vrmTop);
    }
    decal(vrmTop, textTexture([
      { text: 'NOVA  /  VRM', size: 32, font: T.MONO, color: 'rgba(225,244,241,.5)' }
    ], 512, 64, { align: 'center', y: 43, key: 'vrm-label' }), 0.68, 0.085, 0, 0.1, 0.115, [0, 0, 0], { roughness: 0.5, metalness: 0.6 });

    const vrmSide = new THREE.Group();
    vrmSide.position.set(1.23, 1.2, 0.14);
    root.add(vrmSide);
    const vs = rbox(0.34, 0.95, 0.22, 0.05, M.darkAluminum, 0, 0, 0, vrmSide);
    edge(vs, 0x7fe4e2, 0.12);
    for (let i = 0; i < 9; i++) {
      box(0.26, 0.03, 0.2, M.steel, 0, -0.39 + i * 0.098, 0.02, vrmSide);
    }

    // rear I/O shroud
    const io = new THREE.Group();
    io.position.set(1.62, 1.26, 0.17);
    root.add(io);
    const ioBlock = rbox(0.55, 1.46, 0.38, 0.05, M.blackPlastic, 0, 0, 0, io);
    edge(ioBlock, 0x74dfe4, 0.18);
    decal(io, textTexture([
      { text: 'NOVA', size: 56, weight: 700, font: T.SANS, spacing: '7px', color: 'rgba(233,249,247,.84)' },
      { text: 'Z990  AERO  /  WIFI 7', size: 14, font: T.MONO, color: 'rgba(143,244,231,.58)', gap: 0 }
    ], 512, 256, { align: 'center', y: 118, key: 'mb-io' }), 0.47, 0.69, 0, 0.1, 0.192, [0, 0, 0], { roughness: 0.4, metalness: 0.45 });
    // ports on the outward side (back of board in assembled view)
    for (let i = 0; i < 5; i++) {
      box(0.28, 0.14, 0.03, M.blackPlastic, 1.79, 0.08 - i * 0.17, 0.05, root);
    }
    // hidden port block on board back
    box(0.5, 1.1, 0.12, M.darkSteel, 1.7, 1.25, -0.08, root);

    // DIMM slots
    const dimmX = [-1.03, -1.25, -1.47, -1.69];
    dimmX.forEach((x, i) => {
      const slot = new THREE.Group();
      slot.position.set(x, 0.54, 0.095);
      root.add(slot);
      box(0.075, 1.54, 0.23, M.blackPlastic, 0, 0, 0, slot);
      box(0.038, 1.42, 0.25, M.darkSteel, 0, 0, 0.015, slot);
      // latch tabs
      box(0.09, 0.16, 0.2, M.plasticSoft, 0, 0.81, 0, slot);
      box(0.09, 0.16, 0.2, M.plasticSoft, 0, -0.81, 0, slot);
      box(0.055, 0.12, 0.14, M.ledCyan, 0, 0.73, 0.08, slot);
      // pin contacts
      for (let p = 0; p < 8; p++) box(0.03, 0.025, 0.01, M.gold, 0, -0.62 + p * 0.17, 0.12, slot);
    });
    // DIMM bank accents
    box(0.02, 1.72, 0.03, M.ledCyan, -0.92, 0.52, 0.11, root);

    // PCIe slots
    const pcieY = [-0.88, -1.4];
    pcieY.forEach((y, i) => {
      const slot = new THREE.Group();
      slot.position.set(-0.48, y, 0.1);
      root.add(slot);
      box(2.32, 0.13, 0.14, M.blackPlastic, 0, 0, 0, slot);
      box(2.2, 0.055, 0.18, M.steel, 0, 0.04, 0, slot);
      // slot key
      box(0.12, 0.14, 0.16, M.plasticSoft, -0.25, 0, 0.01, slot);
      // retention clip
      box(0.12, 0.2, 0.16, M.plasticSoft, 1.12, 0, 0, slot);
      if (i === 0) {
        box(2.35, 0.03, 0.03, M.ledCyan, 0, 0.095, 0.08, slot);
        for (let p = 0; p < 5; p++) box(0.04, 0.08, 0.02, M.gold, -0.9 + p * 0.4, 0, 0.08, slot);
      }
    });

    // M.2 shield
    const m2 = new THREE.Group();
    m2.position.set(-0.55, -0.37, 0.12);
    root.add(m2);
    const m2plate = rbox(1.25, 0.3, 0.07, 0.035, M.darkAluminum, 0, 0, 0, m2);
    edge(m2plate, 0x97e9e0, 0.16);
    for (let i = 0; i < 8; i++) {
      box(0.03, 0.19, 0.015, M.steel, -0.5 + i * 0.14, 0, 0.04, m2);
    }
    decal(m2, textTexture([
      { text: 'M.2  /  PCIe 5.0', size: 24, font: T.MONO, color: 'rgba(230,247,244,.55)' }
    ], 512, 64, { align: 'center', y: 40, key: 'm2-label' }), 0.65, 0.08, 0, 0.05, 0.041, [0, 0, 0], { roughness: 0.5, metalness: 0.55 });
    // M.2 slot
    box(1.2, 0.12, 0.1, M.blackPlastic, -0.55, -0.6, 0.06, root);

    // chipset heatsink
    const chipset = new THREE.Group();
    chipset.position.set(-1.27, -1.59, 0.14);
    root.add(chipset);
    const chipsetPlate = rbox(0.88, 0.82, 0.16, 0.06, M.darkAluminum, 0, 0, 0, chipset);
    edge(chipsetPlate, 0x82e8e2, 0.15);
    for (let i = 0; i < 4; i++) {
      box(0.03, 0.7, 0.15, M.steel, -0.32 + i * 0.2, 0, 0.02, chipset);
    }
    decal(chipset, textTexture([
      { text: 'Z990', size: 62, weight: 700, font: T.SANS, color: 'rgba(227,245,242,.65)' },
      { text: 'CHIPSET', size: 13, font: T.MONO, color: 'rgba(143,244,231,.5)', gap: 0 }
    ], 256, 256, { align: 'center', y: 128, key: 'chipset-label' }), 0.58, 0.42, 0, 0.03, 0.085, [0, 0, 0], { roughness: 0.45, metalness: 0.45 });

    // audio island
    const audio = new THREE.Group();
    audio.position.set(0.92, -1.72, 0.08);
    root.add(audio);
    for (let i = 0; i < 4; i++) {
      cyl(0.06, 0.06, 0.14, 16, M.gold, -0.34 + i * 0.2, 0, 0, audio);
      cyl(0.052, 0.052, 0.15, 16, M.silver, -0.34 + i * 0.2, 0.01, 0, audio);
    }
    box(0.95, 0.44, 0.045, M.darkSteel, 0.08, 0, 0, audio);
    decal(audio, textTexture([
      { text: 'ESS  /  AUDIO', size: 24, font: T.MONO, color: 'rgba(143,244,231,.52)' }
    ], 512, 64, { align: 'center', y: 42, key: 'audio-label' }), 0.65, 0.08, 0.05, 0.02, 0.028, [0, 0, 0], { roughness: 0.5, metalness: 0.5 });

    // 24-pin and headers
    const atx = box(0.46, 0.62, 0.22, M.blackPlastic, 1.43, 0.02, 0.14, root);
    for (let r = 0; r < 2; r++) for (let c = 0; c < 6; c++) {
      box(0.03, 0.06, 0.02, M.gold, 1.26 + c * 0.064, 0.22 - r * 0.1, 0.25, root);
    }
    // 8-pin CPU power
    box(0.4, 0.32, 0.2, M.blackPlastic, 1.4, 1.62, 0.16, root);
    // fan headers
    for (let i = 0; i < 4; i++) {
      box(0.17, 0.1, 0.12, M.plasticSoft, 0.45 + i * 0.35, 1.95, 0.09, root);
    }
    // CMOS battery
    cyl(0.16, 0.16, 0.045, 28, M.silver, 0.22, -0.72, 0.08, root);
    decal(root, textTexture([
      { text: 'CR2032', size: 18, font: T.MONO, color: 'rgba(30,40,44,.6)' }
    ], 128, 64, { align: 'center', y: 40, key: 'cmos' }), 0.2, 0.1, 0.22, -0.72, 0.105, [-PI / 2, 0, 0], { roughness: 0.7, metalness: 0.2 });

    // mounting screws
    [[-1.65, 1.95], [1.65, 1.95], [-1.65, -1.95], [1.65, -1.95], [0.8, -1.95]].forEach(([x, y]) => {
      cyl(0.06, 0.06, 0.03, 18, M.steel, x, y, 0.05, root, [PI / 2, 0, 0]);
    });

    // teardown actuators
    registerExplode(part, io, [0.16, 0.1, 1.45], 0.02, 0.4, [0.02, -0.08, 0.02]);
    registerExplode(part, vrmTop, [0, 0.12, 1.2], 0.16, 0.55, [0, 0, 0.04]);
    registerExplode(part, vrmSide, [0.1, 0, 1.02], 0.22, 0.6, [0, 0.02, -0.05]);
    registerExplode(part, m2, [-0.22, 0, 0.78], 0.3, 0.7, [0, 0.02, 0.03]);
    registerExplode(part, chipset, [-0.1, 0, 0.9], 0.36, 0.76, [0, 0.03, 0]);
    registerExplode(part, retention, [0, 0, 0.43], 0.44, 0.86, [0, 0, 0.02]);

    tag(part, io, 'Rear I/O 护罩', 'INTEGRATED  I/O  SHIELD', 0.22, 0.7, -0.3);
    tag(part, socket, 'LGA 1700 插槽', 'SOCKET  /  1,700 PINS', 0.35, -0.7, 0.3);
    tag(part, vrmTop, '16+1+2 相供电', 'VRM  /  110A  SPS', 0.5, 0.7, 0.3);
    tag(part, chipset, 'Z990 芯片组', 'CHIPSET  /  PCIe 5.0', 0.65, -0.7, 0.35);
    tag(part, m2, 'M.2 装甲', 'PCIe 5.0 ×4  /  4 SLOTS', 0.78, 0.65, -0.3);

    part.assemblyPos = new THREE.Vector3(-0.88, 0.15, -0.25);
    part.assemblyQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, PI / 2, 0));
    part.focusQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.04, 0, 0));
    part.explodePos = new THREE.Vector3(-0.42, 0.18, -0.2);
    finalizePart(part);
    return part;
  }

  /* ---------------------------------------------------------
     PSU
     --------------------------------------------------------- */
  function buildPSU() {
    const part = makePart('psu');
    const root = part.root;

    // bottom tray
    const base = rbox(2.7, 0.1, 2.2, 0.03, M.psuShell, 0, -0.56, 0, root);
    edge(base, 0x7ce0df, 0.12);
    // internal mounting rails
    box(2.5, 0.05, 0.05, M.darkSteel, 0, -0.47, 0.96, root);
    box(2.5, 0.05, 0.05, M.darkSteel, 0, -0.47, -0.96, root);

    // side panels
    const sideR = new THREE.Group();
    sideR.position.set(1.33, 0, 0);
    root.add(sideR);
    const sr = box(0.06, 1.14, 2.18, M.psuShell, 0, 0, 0, sideR);
    edge(sr, 0x7ce0df, 0.12);
    decal(sideR, T.psuLabel(), 1.94, 0.98, 0.036, 0.0, 0, [0, PI / 2, 0], { roughness: 0.55, metalness: 0.35 });
    // cutaway vent slots on the label's side edge
    for (let i = 0; i < 8; i++) {
      box(0.012, 0.035, 0.12, M.blackPlastic, 0.036, 0.48, 0.78 + i * 0.028, sideR);
    }

    const sideL = new THREE.Group();
    sideL.position.set(-1.33, 0, 0);
    root.add(sideL);
    box(0.06, 1.14, 2.18, M.psuShell, 0, 0, 0, sideL);
    // ventilation slots
    for (let i = 0; i < 12; i++) {
      box(0.015, 0.8, 0.025, M.blackPlastic, -0.035, 0, -0.9 + i * 0.15, sideL);
    }

    const frontPanel = new THREE.Group();
    frontPanel.position.set(0, 0, 1.1);
    root.add(frontPanel);
    box(2.62, 1.14, 0.06, M.psuShell, 0, 0, 0, frontPanel);
    for (let i = 0; i < 9; i++) box(0.03, 0.8, 0.02, M.blackPlastic, -1.0 + i * 0.25, 0, 0.036, frontPanel);

    const backPanel = new THREE.Group();
    backPanel.position.set(0, 0, -1.1);
    root.add(backPanel);
    box(2.62, 1.14, 0.06, M.psuShell, 0, 0, 0, backPanel);
    // modular socket bank + AC socket
    box(1.5, 0.72, 0.05, M.blackPlastic, 0.35, -0.02, -0.04, backPanel);
    for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) {
      box(0.38, 0.2, 0.07, M.plasticSoft, -0.2 + c * 0.43, -0.18 + r * 0.31, -0.07, backPanel);
      for (let p = 0; p < 6; p++) box(0.025, 0.06, 0.02, M.gold, -0.34 + c * 0.43 + p * 0.045, -0.18 + r * 0.31, -0.1, backPanel);
    }
    box(0.55, 0.44, 0.08, M.blackPlastic, -0.75, 0.05, -0.04, backPanel);
    box(0.22, 0.1, 0.04, M.ledCyan, -0.75, 0.36, -0.08, backPanel);

    // top lid + fan
    const lid = new THREE.Group();
    lid.position.y = 0.57;
    root.add(lid);
    const plateShape = new THREE.Shape();
    const lw = 2.68, lh = 2.18, lr = 0.08;
    plateShape.moveTo(-lw / 2 + lr, -lh / 2);
    plateShape.lineTo(lw / 2 - lr, -lh / 2);
    plateShape.quadraticCurveTo(lw / 2, -lh / 2, lw / 2, -lh / 2 + lr);
    plateShape.lineTo(lw / 2, lh / 2 - lr);
    plateShape.quadraticCurveTo(lw / 2, lh / 2, lw / 2 - lr, lh / 2);
    plateShape.lineTo(-lw / 2 + lr, lh / 2);
    plateShape.quadraticCurveTo(-lw / 2, lh / 2, -lw / 2, lh / 2 - lr);
    plateShape.lineTo(-lw / 2, -lh / 2 + lr);
    plateShape.quadraticCurveTo(-lw / 2, -lh / 2, -lw / 2 + lr, -lh / 2);
    const hole = new THREE.Path();
    hole.absarc(0, 0, 0.63, 0, PI * 2, true);
    plateShape.holes.push(hole);
    const lidGeo = new THREE.ExtrudeGeometry(plateShape, {
      depth: 0.055, bevelEnabled: true, bevelSize: 0.015,
      bevelThickness: 0.015, bevelSegments: 2, curveSegments: 40
    });
    lidGeo.rotateX(PI / 2);
    const lidMesh = new THREE.Mesh(lidGeo, M.psuShell);
    lidMesh.castShadow = true; lidMesh.receiveShadow = true;
    lid.add(lidMesh);
    // fan below lid
    const psuFan = buildFan({ radius: 0.56, depth: 0.11, blades: 9, frame: false, led: false });
    psuFan.position.set(0, -0.03, 0);
    lid.add(psuFan);
    part.fans.push(psuFan);
    // fan grill
    torus(0.61, 0.018, 44, M.darkSteel, 0, 0.065, 0, lid, [PI / 2, 0, 0]);
    for (let i = 0; i < 5; i++) {
      const s = box(1.1, 0.012, 0.02, M.darkSteel, 0, 0.072, 0, lid);
      s.rotation.y = i / 5 * PI;
    }
    // top trim + screws
    box(2.2, 0.025, 0.035, M.ledCyan, 0, 0.071, 1.02, lid);
    [[-1.18, -0.9], [1.18, -0.9], [-1.18, 0.9], [1.18, 0.9]].forEach(([x, z]) => {
      cyl(0.06, 0.06, 0.02, 14, M.steel, x, 0.055, z, lid);
    });

    // internal PCB
    const internals = new THREE.Group();
    root.add(internals);
    const pcb = rbox(2.42, 0.045, 1.84, 0.02, M.pcb, 0, -0.3, 0, internals);
    edge(pcb, 0x6fded1, 0.1);
    // transformer
    cyl(0.33, 0.33, 0.56, 36, M.plasticSoft, -0.68, -0.02, 0.22, internals);
    cyl(0.35, 0.35, 0.07, 36, M.copper, -0.68, 0.27, 0.22, internals);
    torus(0.27, 0.035, 32, M.copper, -0.68, 0.15, 0.22, internals, [PI / 2, 0, 0]);
    // bulk capacitors
    for (let i = 0; i < 5; i++) {
      const x = 0.12 + (i % 3) * 0.31;
      const z = -0.1 + Math.floor(i / 3) * 0.35;
      cyl(0.115, 0.115, 0.52, 28, M.plasticSoft, x, -0.01, z, internals);
      cyl(0.118, 0.118, 0.035, 28, M.silver, x, 0.27, z, internals);
      box(0.12, 0.006, 0.02, M.ledCyan, x, 0.29, z, internals);
    }
    // secondary capacitors
    for (let i = 0; i < 8; i++) {
      cyl(0.065, 0.065, 0.26, 18, M.plasticSoft, -0.85 + (i % 4) * 0.18, -0.04, -0.55 + Math.floor(i / 4) * 0.2, internals);
      cyl(0.067, 0.067, 0.02, 18, M.silver, -0.85 + (i % 4) * 0.18, 0.1, -0.55 + Math.floor(i / 4) * 0.2, internals);
    }
    // heatsinks
    [-0.18, 0.6].forEach((x, idx) => {
      const hs = new THREE.Group();
      hs.position.set(x, 0.02, -0.58 + idx * 0.1);
      internals.add(hs);
      box(0.44, 0.05, 0.66, M.aluminum, 0, -0.2, 0, hs);
      for (let i = 0; i < 9; i++) box(0.02, 0.4, 0.64, M.darkAluminum, -0.19 + i * 0.047, 0, 0, hs);
    });
    // chokes
    for (let i = 0; i < 4; i++) {
      torus(0.1, 0.036, 24, M.copper, 0.82, -0.1, -0.12 + i * 0.18, internals, [PI / 2, 0, 0]);
      cyl(0.09, 0.09, 0.12, 16, M.darkSteel, 0.82, -0.1, -0.12 + i * 0.18, internals);
    }
    // cables exiting the modular bank
    const cableGroup = new THREE.Group();
    root.add(cableGroup);
    const cableMat = std(0x111416, 0.62, 0.12);
    [0.55, 0.78, 1.01].forEach((y, i) => {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.3, y, -1.05),
        new THREE.Vector3(0.2, y - 0.05, -1.3),
        new THREE.Vector3(-0.22 + i * 0.25, y - 0.26, -1.58),
        new THREE.Vector3(-0.3 + i * 0.25, y - 0.42, -1.83)
      ]);
      const cm = new THREE.Mesh(new THREE.TubeGeometry(curve, 26, 0.07, 8, false), cableMat);
      cm.castShadow = true;
      cableGroup.add(cm);
      // connector
      box(0.28, 0.18, 0.14, M.blackPlastic, 0.3, y, -1.07, cableGroup);
    });

    registerExplode(part, lid, [0, 1.32, 0], 0.02, 0.4, [0, 0.06, 0.05]);
    registerExplode(part, sideR, [0.95, 0.1, 0], 0.2, 0.6, [0, 0, 0.08]);
    registerExplode(part, sideL, [-0.95, 0.1, 0], 0.24, 0.64, [0, 0, -0.08]);
    registerExplode(part, frontPanel, [0, 0.06, 0.72], 0.3, 0.7, [0.04, 0, 0]);
    registerExplode(part, backPanel, [0, 0.06, -0.72], 0.34, 0.72, [-0.04, 0, 0]);
    registerExplode(part, cableGroup, [0, -0.1, -0.72], 0.38, 0.8);

    tag(part, lid, '135mm 静音风扇', 'FDB BEARING  /  0 dB MODE', 0.22, 0.7, -0.4);
    tag(part, internals, '全日系电容', 'JAPANESE 105°C CAPACITORS', 0.45, -0.8, 0.3);
    tag(part, internals, 'LLC + DC-DC', 'PLATINUM EFFICIENCY', 0.62, 0.75, 0.4);
    tag(part, cableGroup, '全模组线材', 'FULLY MODULAR CABLES', 0.78, -0.5, 0.55);

    part.assemblyPos = new THREE.Vector3(-0.2, -2.42, -1.18);
    part.assemblyQuat = new THREE.Quaternion();
    part.focusQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.02, -0.28, 0));
    part.explodePos = new THREE.Vector3(0.68, -1.92, -0.72);
    finalizePart(part);
    return part;
  }

  /* ---------------------------------------------------------
     assemble all
     --------------------------------------------------------- */
  function buildAll() {
    const chassis = buildCase();
    const parts = {
      cpu: buildCPU(),
      gpu: buildGPU(),
      ram: buildRAM(),
      hdd: buildHDD(),
      mb: buildMotherboard(),
      psu: buildPSU()
    };
    const stage = new THREE.Group();
    stage.name = 'stage';
    stage.add(chassis.root);
    Object.keys(parts).forEach((id) => {
      const p = parts[id];
      p.root.position.copy(p.assemblyPos);
      p.root.quaternion.copy(p.assemblyQuat);
      stage.add(p.root);
      p.focusOnly.forEach((o) => { o.visible = false; });
    });
    return { stage, chassis, parts };
  }

  const api = {
    M, buildCase, buildCPU, buildGPU, buildRAM, buildHDD, buildMotherboard, buildPSU, buildAll,
    helpers: { textTexture, decal, box, rbox, cyl, torus, edge }
  };
  window.HWModels = api;
})();
