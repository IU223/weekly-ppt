/* =========================================================
   NOVA / procedural texture library
   Every surface is generated at runtime - no external assets.
   ========================================================= */
(function () {
  'use strict';

  const cache = new Map();
  const MONO = '"Cascadia Code", "Consolas", "SFMono-Regular", monospace';
  const SANS = '"Bahnschrift", "Segoe UI", "Microsoft YaHei", sans-serif';
  const CJK = '"Microsoft YaHei", "PingFang SC", "Segoe UI", sans-serif';

  function rng(seed) {
    let s = seed >>> 0;
    return function () {
      s |= 0;
      s = (s + 0x6D2B79F5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function make(size, draw, key, repeat) {
    if (key && cache.has(key)) return cache.get(key);
    const c = document.createElement('canvas');
    c.width = size[0];
    c.height = size[1];
    const ctx = c.getContext('2d');
    draw(ctx, c.width, c.height);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    if (repeat) tex.repeat.set(repeat[0], repeat[1]);
    tex.needsUpdate = true;
    if (key) cache.set(key, tex);
    return tex;
  }

  function roundRect(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w * 0.5, h * 0.5);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function pcbBase(ctx, w, h, base, seed) {
    const rand = rng(seed);
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, base);
    g.addColorStop(0.5, shade(base, 7));
    g.addColorStop(1, shade(base, -8));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // subtle woven glass pattern
    ctx.globalAlpha = 0.055;
    ctx.strokeStyle = '#bfe9dc';
    ctx.lineWidth = 1;
    for (let i = 0; i < w; i += 7) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // copper routing
    const traceColors = ['#a8843e', '#7d6a35', '#c5a259', '#556c52'];
    for (let i = 0; i < 115; i++) {
      const col = traceColors[Math.floor(rand() * traceColors.length)];
      ctx.strokeStyle = col;
      ctx.globalAlpha = 0.32 + rand() * 0.36;
      ctx.lineWidth = rand() < 0.75 ? 1 : 1.8;
      let x = rand() * w;
      let y = rand() * h;
      ctx.beginPath();
      ctx.moveTo(x, y);
      const segs = 2 + Math.floor(rand() * 5);
      for (let s = 0; s < segs; s++) {
        if (rand() < 0.55) x += (rand() - 0.5) * 260;
        else y += (rand() - 0.5) * 260;
        ctx.lineTo(x, y);
      }
      ctx.stroke();
      if (rand() < 0.45) {
        ctx.globalAlpha = 0.65;
        ctx.fillStyle = '#caa557';
        ctx.beginPath(); ctx.arc(x, y, 2.2, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    // pads
    for (let i = 0; i < 45; i++) {
      const x = rand() * w, y = rand() * h;
      const s = 2 + rand() * 7;
      ctx.fillStyle = rand() < 0.5 ? '#c8a352' : '#b9b395';
      ctx.globalAlpha = 0.55;
      ctx.fillRect(x, y, s, s * (rand() < 0.5 ? 2 : 1));
    }
    ctx.globalAlpha = 1;
  }

  function shade(hex, amt) {
    const n = parseInt(hex.replace('#', ''), 16);
    let r = (n >> 16) + amt, g = ((n >> 8) & 0xff) + amt, b = (n & 0xff) + amt;
    r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
    return `rgb(${r},${g},${b})`;
  }

  function pcb(theme) {
    const dark = theme === 'dark';
    const blue = theme === 'blue';
    return make([1024, 1024], (ctx, w, h) => {
      pcbBase(ctx, w, h, dark ? '#111a1e' : blue ? '#0d1b26' : '#0d231b', dark ? 91 : blue ? 47 : 14);
      // technical silkscreen
      ctx.save();
      ctx.translate(w * 0.5, h * 0.47);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = 'rgba(213,230,220,.55)';
      ctx.font = `600 24px ${MONO}`;
      ctx.textAlign = 'center';
      ctx.fillText('NOVA  /  Z990  AERO', 0, 0);
      ctx.font = `400 15px ${MONO}`;
      ctx.fillStyle = 'rgba(213,230,220,.3)';
      ctx.fillText('REV 2.1   •   8-LAYER LOW-LOSS PCB   •   2026', 0, 28);
      ctx.restore();

      ctx.strokeStyle = 'rgba(220,237,230,.27)';
      ctx.lineWidth = 2;
      ctx.strokeRect(26, 26, w - 52, h - 52);
      // fiducials
      ctx.fillStyle = '#c9a85c';
      [[40, 40], [w - 40, 40], [40, h - 40], [w - 40, h - 40]].forEach(([x, y]) => {
        ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
      });
      // board code block
      ctx.fillStyle = 'rgba(196,217,207,.5)';
      ctx.font = `500 14px ${MONO}`;
      ctx.fillText('SN  NVA-27X9-0041', 62, 78);
      ctx.fillText('MADE FOR THE EDGE', 62, 98);
      // QR-ish square
      const rand = rng(307);
      ctx.fillStyle = 'rgba(207,225,215,.6)';
      for (let y = 0; y < 12; y++) for (let x = 0; x < 12; x++) {
        if (rand() > 0.48) ctx.fillRect(838 + x * 8, 62 + y * 8, 7, 7);
      }
    }, 'pcb-' + theme);
  }

  function motherboardOverlay() {
    return make([1024, 1024], (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      const ink = 'rgba(225,240,234,.58)';
      const dim = 'rgba(225,240,234,.26)';
      ctx.strokeStyle = dim;
      ctx.lineWidth = 1.5;

      // CPU keep-out square
      ctx.save();
      ctx.translate(w * 0.47, h * 0.37);
      ctx.strokeRect(-190, -190, 380, 380);
      ctx.setLineDash([6, 6]);
      ctx.strokeRect(-150, -150, 300, 300);
      ctx.setLineDash([]);
      ctx.fillStyle = ink;
      ctx.font = `600 18px ${MONO}`;
      ctx.textAlign = 'center';
      ctx.fillText('LGA 1700  /  SOCKET', 0, -212);
      ctx.restore();

      // DIMM bank markings
      ctx.fillStyle = ink;
      ctx.font = `600 16px ${MONO}`;
      ctx.textAlign = 'left';
      for (let i = 0; i < 4; i++) {
        ctx.fillText(`DIMM_A${i + 1}`, 70 + i * 62, 760);
      }
      ctx.font = `500 13px ${MONO}`;
      ctx.fillStyle = dim;
      ctx.fillText('DDR5  •  XMP 3.0  •  1.4V', 70, 785);

      // PCIe labels
      ctx.fillStyle = ink;
      ctx.font = `600 15px ${MONO}`;
      ctx.fillText('PCIe 5.0 x16', 655, 636);
      ctx.fillText('PCIe 4.0 x4', 655, 712);

      // M.2 zones
      ctx.strokeStyle = dim;
      ctx.strokeRect(640, 748, 270, 48);
      ctx.fillStyle = ink;
      ctx.font = `500 13px ${MONO}`;
      ctx.fillText('M.2_1  /  PCIe 5.0 x4', 652, 777);

      // right-angle decorative corner lines
      ctx.strokeStyle = 'rgba(130,236,225,.35)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(w - 90, 420); ctx.lineTo(w - 90, h - 90); ctx.lineTo(580, h - 90);
      ctx.stroke();

      // board title
      ctx.fillStyle = 'rgba(230,244,238,.75)';
      ctx.font = `700 40px ${SANS}`;
      ctx.fillText('NOVA', 66, 650);
      ctx.fillStyle = 'rgba(130,236,225,.75)';
      ctx.font = `500 18px ${MONO}`;
      ctx.fillText('Z990  AERO  WIFI', 68, 680);

      // small regulatory marks
      ctx.fillStyle = dim;
      ctx.font = `400 12px ${MONO}`;
      ctx.fillText('CE  •  FCC  •  RoHS  •  PCI-SIG', 70, 930);
    }, 'mb-overlay');
  }

  function hddLabel() {
    return make([1024, 512], (ctx, w, h) => {
      ctx.fillStyle = '#c9c9c2';
      ctx.fillRect(0, 0, w, h);
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, 'rgba(255,255,255,.35)');
      g.addColorStop(0.5, 'rgba(0,0,0,0)');
      g.addColorStop(1, 'rgba(0,0,0,.12)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = '#22282b';
      ctx.font = `700 76px ${SANS}`;
      ctx.fillText('BARRACUDA', 58, 120);
      ctx.font = `500 18px ${MONO}`;
      ctx.fillStyle = '#53595a';
      ctx.fillText('3.5-INCH  INTERNAL  HARD  DRIVE', 60, 155);

      ctx.fillStyle = '#111719';
      ctx.font = `700 118px ${SANS}`;
      ctx.fillText('4TB', 58, 285);
      ctx.font = `500 24px ${MONO}`;
      ctx.fillStyle = '#3d4446';
      ctx.fillText('7200 RPM  /  256 MB CACHE', 62, 325);

      // barcode
      const rand = rng(818);
      ctx.fillStyle = '#101416';
      let x = 602;
      for (let i = 0; i < 52; i++) {
        const bw = 2 + Math.floor(rand() * 7);
        if (rand() > 0.35) ctx.fillRect(x, 80, bw, 120);
        x += bw + 3;
      }
      ctx.font = `400 15px ${MONO}`;
      ctx.fillStyle = '#343a3b';
      ctx.fillText('ST4000DM004  •  S/N  ZVT24K9P', 602, 230);

      ctx.strokeStyle = '#8b8d88';
      ctx.lineWidth = 2;
      ctx.strokeRect(40, 30, 944, 452);
      ctx.fillStyle = '#4b5152';
      ctx.font = `500 15px ${MONO}`;
      ctx.fillText('SATA 6 Gb/s', 602, 340);
      ctx.fillText('POWER  +5V 0.72A  /  +12V 0.55A', 602, 370);
      ctx.fillText('MADE IN THAILAND   •   2026', 602, 430);

      // warning triangle
      ctx.strokeStyle = '#777b76';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(72, 430); ctx.lineTo(95, 385); ctx.lineTo(118, 430); ctx.closePath(); ctx.stroke();
      ctx.font = `700 19px ${MONO}`; ctx.fillStyle = '#6b6e69'; ctx.fillText('!', 90, 420);
      ctx.font = `400 13px ${MONO}`;
      ctx.fillText('DO NOT COVER ANY DRIVE HOLES', 136, 422);
    }, 'hdd-label');
  }

  function psuLabel() {
    return make([1024, 640], (ctx, w, h) => {
      ctx.fillStyle = '#181b1d';
      ctx.fillRect(0, 0, w, h);
      // diagonal carbon-ish print
      ctx.globalAlpha = 0.12;
      for (let i = -h; i < w; i += 13) {
        ctx.strokeStyle = '#98a2a8'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + h, h); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.strokeStyle = 'rgba(180,195,200,.28)';
      ctx.lineWidth = 2;
      ctx.strokeRect(26, 26, w - 52, h - 52);

      ctx.fillStyle = '#e9f0ef';
      ctx.font = `700 70px ${SANS}`;
      ctx.fillText('NOVA', 62, 132);
      ctx.fillStyle = '#8ff4e7';
      ctx.font = `500 24px ${MONO}`;
      ctx.fillText('POWER  /  ATX 3.1', 64, 175);

      ctx.fillStyle = '#f4f7f6';
      ctx.font = `700 152px ${SANS}`;
      ctx.fillText('1000W', 58, 330);

      // 80 plus style badge
      ctx.save();
      ctx.translate(785, 190);
      ctx.strokeStyle = '#d9c28e'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(0, 0, 92, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#d9c28e';
      ctx.font = `700 28px ${MONO}`; ctx.textAlign = 'center';
      ctx.fillText('80 PLUS', 0, -8);
      ctx.font = `700 36px ${SANS}`;
      ctx.fillText('PLATINUM', 0, 38);
      ctx.restore();

      ctx.fillStyle = '#a7b1b3';
      ctx.font = `500 18px ${MONO}`;
      ctx.fillText('FULLY MODULAR  /  CYBENETICS A+', 62, 380);
      ctx.fillText('+12V  83.3A   •   100-240V ~ 50/60Hz', 62, 416);
      ctx.fillText('MODEL  NVA-P1000P     S/N  P26-1000-0842', 62, 452);

      // barcode
      const rand = rng(119);
      let x = 62;
      ctx.fillStyle = '#dce3e2';
      for (let i = 0; i < 46; i++) {
        const bw = 2 + Math.floor(rand() * 6);
        if (rand() > 0.4) ctx.fillRect(x, 500, bw, 72);
        x += bw + 3;
      }
      ctx.fillStyle = '#7a8587'; ctx.font = `400 13px ${MONO}`;
      ctx.fillText('P1000P-ATX31-2026', 62, 594);
      ctx.fillText('DESIGNED IN SHENZHEN', 740, 594);
    }, 'psu-label');
  }

  function gpuBackplate() {
    return make([1024, 512], (ctx, w, h) => {
      ctx.fillStyle = '#1b2024';
      ctx.fillRect(0, 0, w, h);
      // brushed metal
      const rand = rng(96);
      ctx.globalAlpha = 0.06;
      for (let i = 0; i < 700; i++) {
        ctx.strokeStyle = rand() > 0.5 ? '#ffffff' : '#000000';
        ctx.beginPath();
        const y = rand() * h;
        ctx.moveTo(0, y); ctx.lineTo(w, y + (rand() - 0.5) * 4); ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // angular graphic
      ctx.strokeStyle = 'rgba(143,244,231,.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(620, 52); ctx.lineTo(960, 52); ctx.lineTo(960, 210); ctx.lineTo(760, 210);
      ctx.stroke();
      ctx.fillStyle = 'rgba(143,244,231,.1)';
      ctx.beginPath(); ctx.moveTo(700, 90); ctx.lineTo(920, 90); ctx.lineTo(920, 176); ctx.lineTo(815, 176); ctx.closePath(); ctx.fill();

      ctx.fillStyle = 'rgba(235,245,242,.8)';
      ctx.font = `700 58px ${SANS}`;
      ctx.fillText('NOVA', 70, 120);
      ctx.fillStyle = 'rgba(143,244,231,.86)';
      ctx.font = `500 22px ${MONO}`;
      ctx.fillText('G E F O R C E   R T X   5 0 8 0', 74, 158);
      ctx.fillStyle = 'rgba(220,232,229,.4)';
      ctx.font = `400 15px ${MONO}`;
      ctx.fillText('16GB GDDR7  •  TRIPLE FAN  •  VAPOR CHAMBER', 74, 443);
      ctx.fillText('NVA-5080-X3  /  SN 26G0-0718', 74, 470);

      // warning glyph
      ctx.strokeStyle = 'rgba(210,225,220,.3)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(920, 430, 36, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = 'rgba(210,225,220,.4)';
      ctx.font = `700 38px ${MONO}`; ctx.textAlign = 'center';
      ctx.fillText('!', 920, 444);
    }, 'gpu-back');
  }

  function alphaMesh() {
    return make([512, 512], (ctx, w, h) => {
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#000';
      const step = 15;
      for (let y = 7; y < h; y += step * 0.86) {
        const offset = (Math.round(y / (step * 0.86)) % 2) * step * 0.5;
        for (let x = 6; x < w; x += step) {
          ctx.beginPath(); ctx.arc(x + offset, y, 4.4, 0, Math.PI * 2); ctx.fill();
        }
      }
    }, 'mesh-mask', [7, 12]);
  }

  function glassStreak() {
    return make([512, 512], (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      const g = ctx.createLinearGradient(0, h, w, 0);
      g.addColorStop(0, 'rgba(255,255,255,0)');
      g.addColorStop(0.38, 'rgba(197,245,255,0)');
      g.addColorStop(0.45, 'rgba(197,245,255,.22)');
      g.addColorStop(0.5, 'rgba(255,255,255,.05)');
      g.addColorStop(0.56, 'rgba(197,245,255,.16)');
      g.addColorStop(0.63, 'rgba(197,245,255,0)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    }, 'glass-streak');
  }

  function glow() {
    return make([256, 256], (ctx, w, h) => {
      const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      g.addColorStop(0, 'rgba(255,255,255,1)');
      g.addColorStop(0.18, 'rgba(255,255,255,.75)');
      g.addColorStop(0.45, 'rgba(255,255,255,.18)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    }, 'glow');
  }

  function caseLogo() {
    return make([512, 128], (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'rgba(235,247,246,.92)';
      ctx.font = `700 72px ${SANS}`;
      ctx.letterSpacing = '18px';
      ctx.fillText('NOVA', 20, 88);
      ctx.fillStyle = 'rgba(143,244,231,.8)';
      ctx.font = `500 15px ${MONO}`;
      ctx.letterSpacing = '5px';
      ctx.fillText('FORGE  X  /  ATX', 24, 112);
    }, 'case-logo');
  }

  function brandPlate() {
    return make([512, 128], (ctx, w, h) => {
      ctx.fillStyle = '#111518'; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(143,244,231,.4)'; ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, w - 2, h - 2);
      ctx.fillStyle = 'rgba(232,245,242,.9)';
      ctx.font = `700 46px ${SANS}`; ctx.letterSpacing = '13px';
      ctx.fillText('NOVA', 30, 62);
      ctx.fillStyle = 'rgba(143,244,231,.7)';
      ctx.font = `500 13px ${MONO}`; ctx.letterSpacing = '3px';
      ctx.fillText('DESKTOP ANATOMY LAB', 32, 91);
    }, 'brand-plate');
  }

  function pumpScreen() {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 256;
    const ctx = c.getContext('2d');
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    function draw(temp) {
      ctx.fillStyle = '#030709'; ctx.fillRect(0, 0, 256, 256);
      const ring = ctx.createRadialGradient(128, 128, 14, 128, 128, 128);
      ring.addColorStop(0, 'rgba(31,91,90,.45)');
      ring.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = ring; ctx.fillRect(0, 0, 256, 256);
      ctx.strokeStyle = 'rgba(143,244,231,.42)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(128, 128, 99, -Math.PI * 0.85, Math.PI * 0.7); ctx.stroke();
      ctx.fillStyle = '#e9fffb';
      ctx.font = `700 92px ${SANS}`; ctx.textAlign = 'center';
      ctx.fillText(temp, 128, 146);
      ctx.fillStyle = '#8ff4e7';
      ctx.font = `500 17px ${MONO}`;
      ctx.fillText('LIQUID  /  °C', 128, 184);
      ctx.fillStyle = 'rgba(220,245,242,.45)';
      ctx.font = `500 12px ${MONO}`;
      ctx.fillText('PUMP 2,840 RPM', 128, 224);
      tex.needsUpdate = true;
    }
    draw(42);
    return { texture: tex, draw };
  }

  function keyboardGrid() {
    return make([256, 256], (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(116,222,230,.18)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= w; i += 32) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(116,222,230,.28)';
      for (let x = 0; x <= w; x += 32) for (let y = 0; y <= h; y += 32) ctx.fillRect(x - 1, y - 1, 2, 2);
    }, 'keyboard-grid', [14, 14]);
  }

  function circuitDetail() {
    return make([256, 256], (ctx, w, h) => {
      ctx.fillStyle = '#07110d'; ctx.fillRect(0, 0, w, h);
      const rand = rng(222);
      ctx.strokeStyle = 'rgba(108,200,186,.5)'; ctx.lineWidth = 2;
      for (let i = 0; i < 26; i++) {
        let x = rand() * w, y = rand() * h;
        ctx.beginPath(); ctx.moveTo(x, y);
        for (let s = 0; s < 4; s++) {
          if (rand() > 0.5) x += (rand() - 0.5) * 100; else y += (rand() - 0.5) * 100;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.fillStyle = 'rgba(143,244,231,.75)';
        ctx.fillRect(x - 2, y - 2, 4, 4);
      }
    }, 'circuit-detail');
  }

  window.HWTextures = {
    pcb, motherboardOverlay, hddLabel, psuLabel, gpuBackplate, alphaMesh,
    glassStreak, glow, caseLogo, brandPlate, pumpScreen, keyboardGrid,
    circuitDetail, make, roundRect, MONO, SANS, CJK
  };
})();
