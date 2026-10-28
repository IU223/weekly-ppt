/* =========================================================
   NOVA / Desktop Anatomy Lab
   scene orchestration, interaction & teardown sequences
   ========================================================= */
(function () {
  'use strict';

  const PI = Math.PI;
  const $ = (sel, parent) => (parent || document).querySelector(sel);
  const $$ = (sel, parent) => Array.from((parent || document).querySelectorAll(sel));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (t) => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
  const easeInOut = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const pad2 = (n) => String(Math.round(n)).padStart(2, '0');

  /* ---------------------------------------------------------
     content
     --------------------------------------------------------- */
  const ORDER = ['cpu', 'gpu', 'ram', 'hdd', 'mb', 'psu'];

  const DATA = {
    overview: {
      id: 'overview',
      index: '00',
      kicker: '整机结构 / FULL TOWER',
      title: '整机解剖',
      en: 'FORGE X · X-RAY VIEW',
      accent: '#6ff2ef',
      desc: '一台完整的 ATX 高性能主机。钢化玻璃与网孔面板构成外部包围，内部围绕主板组织计算、图形、存储与供电。先旋转观察整机，再打开外壳，进入六大模块的逐层拆解。',
      specs: [
        { label: '机型 / FORM', value: 'FORGE X' },
        { label: '规格 / FORMAT', value: 'ATX 中塔' },
        { label: '尺寸 / SIZE', value: '460 × 230 × 510' },
        { label: '整备重量 / MASS', value: '14.8 kg' }
      ],
      note: '拖拽旋转整机；开启底部时间轴分离外壳。点击任一部件，进入它自己的拆解序列。',
      layers: [
        { name: '钢化玻璃侧板', en: 'TEMPERED GLASS', at: 0 },
        { name: '网孔前面板', en: 'MESH INTAKE PANEL', at: 0.3 },
        { name: '六大核心模块', en: 'MODULE LAYOUT', at: 0.68 }
      ],
      legend: ['ASSEMBLED', 'PANELS OPEN', 'MODULE VIEW']
    },
    cpu: {
      id: 'cpu',
      index: '01',
      kicker: '计算核心 / COMPUTE',
      title: '处理器',
      en: 'CPU · NOVA CORE X9',
      accent: '#7ee8ff',
      desc: '整机的运算中枢。处理器通过 LGA 触点与主板连接，IHS 均热顶盖将裸片产生的热量导出，再交给散热系统。拆解序列从顶盖开始，逐层剥离封装。',
      specs: [
        { label: '核心 / 线程', value: '24C / 32T' },
        { label: '最高频率', value: '6.2 GHz' },
        { label: '智能缓存', value: '36 MB L3' },
        { label: '基础功耗', value: '125 W' }
      ],
      note: 'IHS 与硅晶片之间使用钎焊导热。动画将顶盖、裸片、基板与 LGA 触点阵列依次分离。',
      layers: [
        { name: 'IHS 均热顶盖', en: 'HEAT SPREADER', at: 0 },
        { name: '硅晶片与基板', en: 'DIE / SUBSTRATE', at: 0.28 },
        { name: 'LGA 触点阵列', en: 'CONTACT ARRAY', at: 0.55 },
        { name: '封装分离完成', en: 'PACKAGE OPEN', at: 0.82 }
      ],
      legend: ['ASSEMBLED', 'IHS REMOVAL', 'DIE EXPOSED']
    },
    gpu: {
      id: 'gpu',
      index: '02',
      kicker: '图形处理 / GRAPHICS',
      title: '显卡',
      en: 'GPU · NOVA RTX 5080',
      accent: '#ff82b6',
      desc: '独立显卡承担实时光追与高帧率渲染。三风扇将气流压入均热板与鳍片，PCB 上的 GDDR7 显存围绕 GPU 核心布置，金属背板负责结构强化。',
      specs: [
        { label: '显存 / VRAM', value: '16 GB GDDR7' },
        { label: '总线 / BUS', value: 'PCIe 5.0 ×16' },
        { label: '显存带宽', value: '960 GB/s' },
        { label: '整卡功耗', value: '320 W' }
      ],
      note: '拆解方向沿卡的厚度展开：导风罩与风扇、均热板与鳍片、PCB 与背板依次分层。',
      layers: [
        { name: '三风扇导风罩', en: 'FAN SHROUD', at: 0 },
        { name: '均热板与鳍片', en: 'VAPOR CHAMBER', at: 0.28 },
        { name: 'PCB 与 GDDR7', en: 'BOARD / MEMORY', at: 0.55 },
        { name: '金属背板', en: 'BACKPLATE', at: 0.8 }
      ],
      legend: ['ASSEMBLED', 'SHROUD OFF', 'PCB EXPOSED']
    },
    ram: {
      id: 'ram',
      index: '03',
      kicker: '高速缓存 / MEMORY',
      title: '内存',
      en: 'RAM · DDR5 6400',
      accent: '#7dffc4',
      desc: '双通道 DDR5 内存为活跃数据提供高速暂存。铝合金散热马甲覆盖存储颗粒与供电模块，金手指沿板边与主板 DIMM 插槽连接。',
      specs: [
        { label: '容量 / CAPACITY', value: '64 GB (2×32)' },
        { label: '频率 / SPEED', value: '6400 MT/s' },
        { label: '时序 / TIMING', value: 'CL32-39-39' },
        { label: '电压 / VOLTAGE', value: '1.40 V' }
      ],
      note: '马甲向两侧分离后，可以看到双面 DDR5 颗粒、PMIC 供电与 288-pin 金手指。',
      layers: [
        { name: '铝合金散热马甲', en: 'HEAT SPREADER', at: 0 },
        { name: 'DDR5 存储颗粒', en: 'MEMORY CHIPS', at: 0.3 },
        { name: 'PCB 与金手指', en: 'PCB / GOLD FINGERS', at: 0.62 }
      ],
      legend: ['ASSEMBLED', 'ARMOR OFF', 'CHIPS EXPOSED']
    },
    hdd: {
      id: 'hdd',
      index: '04',
      kicker: '数据存储 / STORAGE',
      title: '硬盘',
      en: 'HDD · BARRACUDA 4TB',
      accent: '#ffc16b',
      desc: '机械硬盘用旋转盘片与磁头完成大容量存储。密封顶盖维持内部洁净环境，三张盘片堆叠在主轴上，音圈电机驱动磁头臂在盘面寻道。',
      specs: [
        { label: '容量 / CAPACITY', value: '4 TB' },
        { label: '转速 / RPM', value: '7200 RPM' },
        { label: '缓存 / CACHE', value: '256 MB' },
        { label: '接口 / INTERFACE', value: 'SATA 6 Gb/s' }
      ],
      note: '机械硬盘内部为微米级气隙结构，真实设备不可在普通环境中开盖；此处为数字孪生演示。',
      layers: [
        { name: '密封顶盖', en: 'SEALED COVER', at: 0 },
        { name: '盘片与主轴', en: 'PLATTER / SPINDLE', at: 0.28 },
        { name: '磁头驱动臂', en: 'ACTUATOR ARM', at: 0.55 },
        { name: '控制电路板', en: 'CONTROL PCB', at: 0.78 }
      ],
      legend: ['ASSEMBLED', 'COVER OFF', 'INTERNALS']
    },
    mb: {
      id: 'mb',
      index: '05',
      kicker: '互连平台 / PLATFORM',
      title: '主板',
      en: 'MOTHERBOARD · Z990 AERO',
      accent: '#64eadf',
      desc: '主板把处理器、内存、显卡与存储连接成完整系统。供电模块、芯片组、扩展插槽与 I/O 护罩覆盖在多层 PCB 之上，构成整机的骨架。',
      specs: [
        { label: '芯片组 / CHIPSET', value: 'NOVA Z990' },
        { label: '插槽 / SOCKET', value: 'LGA 1700' },
        { label: '内存 / DIMM', value: '4 × DDR5' },
        { label: '扩展 / PCIe', value: '5.0 ×16' }
      ],
      note: '拆解顺序按照装配层级：I/O 护罩、VRM 装甲、M.2 散热片、芯片组散热器依次抬起。',
      layers: [
        { name: 'I/O 与供电装甲', en: 'I/O + VRM ARMOR', at: 0 },
        { name: '插槽与芯片组', en: 'SOCKET / CHIPSET', at: 0.35 },
        { name: 'M.2 与扩展区', en: 'M.2 / PCIe AREA', at: 0.62 },
        { name: '多层 PCB 基底', en: 'PCB SUBSTRATE', at: 0.86 }
      ],
      legend: ['ASSEMBLED', 'ARMOR OFF', 'BOARD EXPOSED']
    },
    psu: {
      id: 'psu',
      index: '06',
      kicker: '能源供给 / POWER',
      title: '电源',
      en: 'PSU · NOVA 1000W',
      accent: '#8cb4ff',
      desc: '电源将交流电整流、滤波并转换为稳定的直流电。全模组接口连接各部件，LLC 谐振与 DC-DC 电路提供高效率输出，135mm 风扇维持低噪散热。',
      specs: [
        { label: '额定功率', value: '1000 W' },
        { label: '能效认证', value: '80+ Platinum' },
        { label: '规范 / ATX', value: 'ATX 3.1' },
        { label: '风扇 / FAN', value: '135 mm' }
      ],
      note: '拆解前请务必断电并放电。数字孪生中，顶盖、风扇、外壳与内部电容组依次分离。',
      layers: [
        { name: '顶盖与风扇', en: 'LID / FAN', at: 0 },
        { name: '外壳分离', en: 'CHASSIS OPEN', at: 0.3 },
        { name: '电容与整流', en: 'CAPACITORS / LLC', at: 0.58 },
        { name: '全模组线材', en: 'MODULAR CABLES', at: 0.8 }
      ],
      legend: ['ASSEMBLED', 'SHELL OFF', 'INTERNALS']
    }
  };

  const CAMERA = {
    overview: {
      dir: new THREE.Vector3(0.82, 0.33, 0.56).normalize(),
      distance: 16.8,
      target: new THREE.Vector3(0, 0.02, 0)
    },
    overviewOpen: {
      dir: new THREE.Vector3(0.8, 0.33, 0.58).normalize(),
      distance: 17.2,
      target: new THREE.Vector3(0.18, 0.14, 0.04)
    },
    focus: {
      cpu: { dir: [0.46, 0.44, 0.77], distance: 7.8, target: [0, 1.35, 0] },
      gpu: { dir: [0.42, 0.42, 0.8], distance: 9.6, target: [0, 0.9, 0] },
      ram: { dir: [0.74, 0.26, 0.62], distance: 7.4, target: [0, 0.75, 0] },
      hdd: { dir: [0.42, 0.43, 0.8], distance: 9.2, target: [0, 1.1, 0] },
      mb: { dir: [0.28, 0.28, 0.92], distance: 9.8, target: [0, 0.9, 0] },
      psu: { dir: [0.46, 0.42, 0.78], distance: 8.8, target: [0, 1.15, 0] }
    }
  };

  const FOCUS_ROOT = new THREE.Vector3(0, 0.8, 0);

  /* ---------------------------------------------------------
     state
     --------------------------------------------------------- */
  const state = {
    mode: 'overview',
    selected: null,
    overviewT: 0,
    focusT: 0,
    playing: false,
    play: null,
    autoRotate: true,
    glass: true,
    hovered: null,
    loaded: false,
    transitioning: false
  };

  let renderer, scene, camera, controls, stage, chassis, parts;
  let raycaster, pointer, hoverHelper, focusRing;
  let envTexture;
  let clock;
  let cameraTween = null;
  let focusAnim = null;
  let autoResumeTimer = null;
  let dust, platformTicks, focusRingSpin, guideGroup;
  const guides = [];
  const fanSpins = [];
  const focusLights = [];
  const envObjects = [];
  const hotspots = new Map();
  const tagEls = [];
  const decoMats = new Map();
  const tmpV = new THREE.Vector3();
  const tmpV2 = new THREE.Vector3();
  const tmpQ = new THREE.Quaternion();
  const tmpQ2 = new THREE.Quaternion();
  const pointerStart = { x: 0, y: 0, time: 0 };
  let pointerDragged = false;
  let lastFocusApplied = -1;
  let lastLayerActive = -1;
  let uiMode = null;
  let focusAutoToken = 0;
  let lastProgressKey = '';
  let lastModeChipText = '';
  let infoPanelWidth = 354;

  /* ---------------------------------------------------------
     boot
     --------------------------------------------------------- */
  function boot() {
    setLoader(8, 'INITIALIZING ENGINE');
    setTimeout(() => {
      try {
        initRenderer();
        setLoader(26, 'BUILDING ENVIRONMENT');
        requestAnimationFrame(() => {
          initScene();
          initWorld();
          setLoader(52, 'ASSEMBLING HARDWARE');
          requestAnimationFrame(() => {
            initHardware();
            setLoader(76, 'WIRING MODULES');
            requestAnimationFrame(() => {
              initInteraction();
              initUI();
              setLoader(94, 'CALIBRATING LIGHT');
              setTimeout(finishBoot, 380);
            });
          });
        });
      } catch (err) {
        console.error(err);
        setLoader(100, 'WEBGL INIT FAILED');
        const title = document.querySelector('.loader-sub');
        if (title) {
          title.textContent = '此浏览器无法初始化 WebGL，请更换 Chrome / Edge 并开启硬件加速。';
          title.style.color = '#ff9d9d';
        }
      }
    }, 80);
  }

  function setLoader(p, status) {
    const bar = $('#loader-progress');
    const pct = $('#loader-percent');
    const st = $('#loader-status');
    if (bar) bar.style.width = p + '%';
    if (pct) pct.textContent = String(Math.round(p)).padStart(3, '0') + '%';
    if (st && status) st.textContent = status;
  }

  function finishBoot() {
    setLoader(100, 'SYSTEM READY');
    renderer.render(scene, camera);
    state.loaded = true;
    setTimeout(() => {
      $('#loader').classList.add('done');
      document.body.classList.add('ready');
    }, 300);
    const startPos = getOverviewCamera(true).pos.clone().multiplyScalar(1.1);
    startPos.y += 1.2;
    camera.position.copy(startPos);
    controls.target.copy(CAMERA.overview.target);
    const target = getOverviewCamera(false);
    tweenCamera(target.pos, target.target, 2.6);
    setTimeout(() => {
      showToast('拖拽旋转整机 · 打开侧板或点击部件开始拆解', 3600);
    }, 2100);
  }

  /* ---------------------------------------------------------
     renderer / scene
     --------------------------------------------------------- */
  function initRenderer() {
    renderer = new THREE.WebGLRenderer({
      canvas: $('#webgl'),
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
      stencil: false
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.85));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.info.autoReset = true;
  }

  function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x04080b);
    scene.fog = new THREE.FogExp2(0x04080b, 0.0135);
    camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 90);
    camera.position.copy(CAMERA.overview.dir.clone().multiplyScalar(CAMERA.overview.distance * 1.2)).add(CAMERA.overview.target);
    clock = new THREE.Clock();
    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();
    buildEnvironment();
    buildLights();
    controls = new OrbitControls(camera, $('#webgl'));
    controls.target.copy(CAMERA.overview.target);
    controls.enableDamping = true;
    controls.dampingFactor = 0.062;
    controls.rotateSpeed = 0.58;
    controls.zoomSpeed = 0.8;
    controls.panSpeed = 0.7;
    controls.screenSpacePanning = true;
    controls.minDistance = 2.6;
    controls.maxDistance = 30;
    controls.minPolarAngle = 0.1;
    controls.maxPolarAngle = Math.PI / 2 + 0.06;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.34;
    controls.enabled = false;
    controls.addEventListener('start', onControlStart);
    controls.addEventListener('end', onControlEnd);
  }

  function buildEnvironment() {
    const c = document.createElement('canvas');
    c.width = 1024; c.height = 512;
    const ctx = c.getContext('2d');
    const sky = ctx.createLinearGradient(0, 0, 0, 512);
    sky.addColorStop(0, '#0b1a22');
    sky.addColorStop(0.36, '#071116');
    sky.addColorStop(0.55, '#03070a');
    sky.addColorStop(1, '#010203');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, 1024, 512);

    function soft(x, y, rx, ry, color) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, Math.max(rx, ry));
      g.addColorStop(0, color);
      g.addColorStop(0.38, color.replace(/[\d.]+\)$/, '0.22)'));
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.save();
      ctx.translate(x, y); ctx.scale(1, ry / Math.max(rx, ry)); ctx.translate(-x, -y);
      ctx.fillStyle = g; ctx.fillRect(x - rx, y - rx, rx * 2, rx * 2);
      ctx.restore();
    }
    soft(258, 118, 180, 90, 'rgba(255,241,216,0.95)');
    soft(706, 74, 220, 70, 'rgba(148,234,255,0.72)');
    soft(886, 214, 118, 170, 'rgba(255,138,190,0.42)');
    soft(86, 248, 96, 150, 'rgba(122,207,255,0.38)');
    soft(512, 390, 420, 80, 'rgba(36,102,111,0.26)');
    // thin strip lights for crisp metal reflections
    ctx.fillStyle = 'rgba(255,250,238,.8)';
    ctx.fillRect(40, 180, 8, 210);
    ctx.fillStyle = 'rgba(126,235,255,.62)';
    ctx.fillRect(948, 36, 7, 250);
    ctx.fillStyle = 'rgba(255,146,196,.35)';
    ctx.fillRect(642, 340, 180, 4);

    envTexture = new THREE.CanvasTexture(c);
    envTexture.mapping = THREE.EquirectangularReflectionMapping;
    envTexture.colorSpace = THREE.SRGBColorSpace;
    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    scene.environment = pmrem.fromEquirectangular(envTexture).texture;
    envTexture.dispose();
    pmrem.dispose();
  }

  function buildLights() {
    const hemi = new THREE.HemisphereLight(0x8fdce9, 0x030507, 0.72);
    scene.add(hemi);

    const key = new THREE.DirectionalLight(0xfff1dc, 3.4);
    key.position.set(8.5, 11, 9);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    key.shadow.camera.left = -10;
    key.shadow.camera.right = 10;
    key.shadow.camera.top = 11;
    key.shadow.camera.bottom = -7;
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 34;
    key.shadow.bias = -0.00035;
    key.shadow.normalBias = 0.025;
    scene.add(key);
    scene.add(key.target);
    key.target.position.set(0, 0.2, 0);

    const rim = new THREE.DirectionalLight(0x5cd8ff, 2.6);
    rim.position.set(-9, 5.5, -8);
    scene.add(rim);

    const warm = new THREE.PointLight(0xffa868, 24, 16, 2);
    warm.position.set(-4.4, 2.2, 4);
    scene.add(warm);

    const cyan = new THREE.PointLight(0x5ef7ff, 30, 14, 2);
    cyan.position.set(4.8, 0.2, 4.8);
    scene.add(cyan);

    const topFill = new THREE.PointLight(0xa8d8ff, 16, 18, 2);
    topFill.position.set(0, 8, 0);
    scene.add(topFill);

    const under = new THREE.PointLight(0x2bb5d1, 16, 12, 2);
    under.position.set(0, -2.8, 1.8);
    scene.add(under);

    // interior practicals - they read through the glass and front mesh
    const insideWarm = new THREE.PointLight(0xffd2a0, 6.5, 6.5, 2);
    insideWarm.position.set(0.5, 2.1, 1.2);
    scene.add(insideWarm);
    const insideCyan = new THREE.PointLight(0x69f3f5, 4.5, 5.5, 2);
    insideCyan.position.set(0.6, -0.3, 1.9);
    scene.add(insideCyan);
    const insideRim = new THREE.PointLight(0x8fc4ff, 3.5, 5, 2);
    insideRim.position.set(-0.2, 0.7, -1.5);
    scene.add(insideRim);

    // dedicated teardown lighting, enabled only in module focus
    const fKey = new THREE.DirectionalLight(0xfff2df, 2.0);
    fKey.position.set(5, 8, 8);
    fKey.visible = false;
    scene.add(fKey);
    const fRim = new THREE.DirectionalLight(0x65e9ff, 1.45);
    fRim.position.set(-7, 4, -5);
    fRim.visible = false;
    scene.add(fRim);
    const fFill = new THREE.PointLight(0xbfe9ff, 6.5, 14, 2);
    fFill.position.set(3, 2.5, 6);
    fFill.visible = false;
    scene.add(fFill);
    focusLights.push(fKey, fRim, fFill);
  }

  function initWorld() {
    // ground
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x05090c, roughness: 0.36, metalness: 0.58, envMapIntensity: 0.8
    });
    const ground = new THREE.Mesh(new THREE.CircleGeometry(34, 96), groundMat);
    ground.rotation.x = -PI;
    ground.position.y = -3.275;
    ground.receiveShadow = true;
    scene.add(ground);
    envObjects.push(ground);

    // showcase base
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x091115, roughness: 0.28, metalness: 0.82, envMapIntensity: 1.1 });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(4.65, 4.8, 0.07, 96), baseMat);
    base.position.y = -3.275;
    base.receiveShadow = true;
    scene.add(base);
    envObjects.push(base);

    // glow underneath the case
    const glowMat = new THREE.MeshBasicMaterial({
      map: HWTextures.glow(), color: 0x4de5ed, transparent: true, opacity: 0.2,
      blending: THREE.AdditiveBlending, depthWrite: false
    });
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(13, 13), glowMat);
    glow.rotation.x = -PI / 2;
    glow.position.y = -3.228;
    scene.add(glow);
    envObjects.push(glow);

    // contact shadow
    const shadowMat = new THREE.MeshBasicMaterial({
      map: HWTextures.glow(), color: 0x000000, transparent: true, opacity: 0.6, depthWrite: false
    });
    const contact = new THREE.Mesh(new THREE.PlaneGeometry(8.5, 8.5), shadowMat);
    contact.rotation.x = -PI / 2;
    contact.position.y = -3.226;
    scene.add(contact);
    envObjects.push(contact);

    // rings
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x66e4e8, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false });
    const ring1 = new THREE.Mesh(new THREE.RingGeometry(4.37, 4.39, 128), ringMat);
    ring1.rotation.x = -PI / 2; ring1.position.y = -3.225;
    scene.add(ring1);
    envObjects.push(ring1);
    const ring2 = new THREE.Mesh(new THREE.RingGeometry(5.18, 5.19, 128), ringMat.clone());
    ring2.material.opacity = 0.14;
    ring2.rotation.x = -PI / 2; ring2.position.y = -3.225;
    scene.add(ring2);
    envObjects.push(ring2);

    // technical tick marks around the base
    const positions = [];
    for (let i = 0; i < 120; i++) {
      const a = i / 120 * Math.PI * 2;
      const long = i % 10 === 0;
      const r1 = long ? 4.48 : 4.55;
      const r2 = 4.72;
      positions.push(Math.cos(a) * r1, 0, Math.sin(a) * r1, Math.cos(a) * r2, 0, Math.sin(a) * r2);
    }
    const tickGeo = new THREE.BufferGeometry();
    tickGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const tickMat = new THREE.LineBasicMaterial({ color: 0x6de4e9, transparent: true, opacity: 0.22, depthWrite: false });
    platformTicks = new THREE.LineSegments(tickGeo, tickMat);
    platformTicks.position.y = -3.224;
    scene.add(platformTicks);
    envObjects.push(platformTicks);

    // grid
    const grid = new THREE.GridHelper(44, 44, 0x155a61, 0x0a252b);
    grid.position.y = -3.265;
    grid.material.transparent = true;
    grid.material.opacity = 0.28;
    scene.add(grid);
    envObjects.push(grid);

    // airborne dust
    const count = 320;
    const dustPos = new Float32Array(count * 3);
    const dustSeed = (() => { let s = 331; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; })();
    for (let i = 0; i < count; i++) {
      const r = 3 + dustSeed() * 8;
      const a = dustSeed() * Math.PI * 2;
      dustPos[i * 3] = Math.cos(a) * r;
      dustPos[i * 3 + 1] = -2.8 + dustSeed() * 9.5;
      dustPos[i * 3 + 2] = Math.sin(a) * r;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0x7ae9ee, size: 0.023, transparent: true, opacity: 0.35,
      blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
    });
    dust = new THREE.Points(dustGeo, dustMat);
    scene.add(dust);
    envObjects.push(dust);

    // focus-only holographic pedestal
    focusRing = new THREE.Group();
    const fMat = new THREE.MeshBasicMaterial({ color: 0x63eef1, transparent: true, opacity: 0.23, side: THREE.DoubleSide, depthWrite: false });
    const f1 = new THREE.Mesh(new THREE.RingGeometry(2.35, 2.37, 128), fMat);
    f1.rotation.x = -PI / 2;
    focusRing.add(f1);
    const f2 = new THREE.Mesh(new THREE.RingGeometry(2.75, 2.755, 128), fMat.clone());
    f2.material.opacity = 0.09;
    f2.rotation.x = -PI / 2;
    focusRing.add(f2);
    const glow2 = new THREE.Mesh(new THREE.PlaneGeometry(7, 7), new THREE.MeshBasicMaterial({
      map: HWTextures.glow(), color: 0x4de5ed, transparent: true, opacity: 0.1,
      blending: THREE.AdditiveBlending, depthWrite: false
    }));
    glow2.rotation.x = -PI / 2;
    focusRing.add(glow2);
    focusRing.position.y = -1.35;
    focusRing.visible = false;
    scene.add(focusRing);

    focusRingSpin = new THREE.Group();
    const tickPos = [];
    for (let i = 0; i < 48; i++) {
      const a = i / 48 * Math.PI * 2;
      const r1 = i % 4 === 0 ? 2.42 : 2.5;
      tickPos.push(Math.cos(a) * r1, 0, Math.sin(a) * r1, Math.cos(a) * 2.6, 0, Math.sin(a) * 2.6);
    }
    const fgeo = new THREE.BufferGeometry();
    fgeo.setAttribute('position', new THREE.Float32BufferAttribute(tickPos, 3));
    const ticks = new THREE.LineSegments(fgeo, new THREE.LineBasicMaterial({ color: 0x87f6f1, transparent: true, opacity: 0.26, depthWrite: false }));
    focusRingSpin.add(ticks);
    focusRing.add(focusRingSpin);
  }

  function initHardware() {
    const built = HWModels.buildAll();
    stage = built.stage;
    chassis = built.chassis;
    parts = built.parts;
    scene.add(stage);

    // clone decor materials so they can fade independently from shared part materials
    chassis.deco.traverse((o) => {
      if (!o.material) return;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      const replaced = mats.map((m) => {
        if (decoMats.has(m)) return decoMats.get(m);
        const c = m.clone();
        c.transparent = true;
        c.userData.baseOpacity = m.opacity;
        c.userData.baseDepthWrite = m.depthWrite;
        c.opacity = m.opacity;
        decoMats.set(m, c);
        return c;
      });
      o.material = Array.isArray(o.material) ? replaced : replaced[0];
    });

    // give every removable case panel its own materials so the enclosure can dissolve
    Object.keys(chassis.panels).forEach((key) => {
      const panel = chassis.panels[key];
      panel.userData.fadeMats = [];
      panel.traverse((o) => {
        if (!o.material) return;
        const list = Array.isArray(o.material) ? o.material : [o.material];
        const cloned = list.map((m) => {
          const c = m.clone();
          c.transparent = true;
          c.userData.baseOpacity = m.opacity;
          c.userData.baseDepthWrite = m.depthWrite;
          panel.userData.fadeMats.push(c);
          return c;
        });
        o.material = Array.isArray(o.material) ? cloned : cloned[0];
      });
    });

    // collect every fan spin group
    stage.traverse((o) => {
      if (o.userData && o.userData.spin) {
        fanSpins.push({ spin: o.userData.spin, speed: 0.75 + Math.random() * 0.55 });
      }
    });

    // exploded-assembly guide lines from each original mount point
    guideGroup = new THREE.Group();
    guideGroup.visible = false;
    ORDER.forEach((id) => {
      const c = new THREE.Color(DATA[id].accent);
      const mat = new THREE.LineDashedMaterial({
        color: c, dashSize: 0.09, gapSize: 0.075,
        transparent: true, opacity: 0, depthWrite: false
      });
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(6), 3));
      const line = new THREE.Line(geo, mat);
      line.frustumCulled = false;
      guideGroup.add(line);
      const dot = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.055, 0),
        new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0, depthWrite: false })
      );
      dot.visible = false;
      guideGroup.add(dot);
      guides.push({ line, dot, part: parts[id] });
    });
    scene.add(guideGroup);

    // apply initial transforms
    applyPartLayout(0);
    applyAllExplode(0);

    // box helper for hover
    hoverHelper = new THREE.Box3Helper(new THREE.Box3(), 0x82f4f1);
    hoverHelper.material.transparent = true;
    hoverHelper.material.opacity = 0.55;
    hoverHelper.material.depthTest = false;
    hoverHelper.material.depthWrite = false;
    hoverHelper.renderOrder = 50;
    hoverHelper.visible = false;
    scene.add(hoverHelper);
  }

  /* ---------------------------------------------------------
     UI construction
     --------------------------------------------------------- */
  function initUI() {
    buildHotspots();
    buildLayerTags();
    buildTimelineTicks();
    infoPanelWidth = $('#info-panel').getBoundingClientRect().width || 354;
    updateContent('overview');
    updateProgressUI(true);
    bindUI();
    setAccent(DATA.overview.accent);
  }

  function buildHotspots() {
    const layer = $('#hotspot-layer');
    ORDER.forEach((id, i) => {
      const d = DATA[id];
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'hotspot';
      btn.dataset.part = id;
      btn.innerHTML = `
        <span class="hs-pulse"></span>
        <span class="hs-card">
          <span class="hs-idx">${d.index}</span>
          <span class="hs-copy"><b>${d.title}</b><small>${d.en.split('·')[0].trim()}</small></span>
        </span>`;
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        selectPart(id);
      });
      layer.appendChild(btn);
      hotspots.set(id, btn);
    });
  }

  function buildLayerTags() {
    const layer = $('#layer-tag-layer');
    ORDER.forEach((id) => {
      const p = parts[id];
      p.tags.forEach((tag, i) => {
        const el = document.createElement('div');
        el.className = 'layer-tag';
        el.dataset.part = id;
        el.innerHTML = `
          <span class="lt-dot"></span><span class="lt-line"></span>
          <span class="lt-copy">
            <span class="lt-idx">L${String(i + 1).padStart(2, '0')}</span>
            <span class="lt-name">${tag.name}</span>
            <span class="lt-sub">${tag.sub}</span>
          </span>`;
        layer.appendChild(el);
        tagEls.push({ el, tag, partId: id, min: tag.min });
      });
    });
  }

  function buildTimelineTicks() {
    const track = document.querySelector('.timeline-track');
    const thumb = document.createElement('span');
    thumb.className = 'timeline-thumb';
    thumb.id = 'timeline-thumb';
    track.appendChild(thumb);
  }

  function renderInfo(d) {
    $('#info-kicker').textContent = d.kicker;
    $('#info-index').innerHTML = `${d.index} <i>/ 06</i>`;
    $('#info-title').textContent = d.title;
    $('#info-en').textContent = d.en;
    $('#info-desc').textContent = d.desc;
    $('#info-note').textContent = d.note;
    $('#spec-grid').innerHTML = d.specs.map((s) => `
      <div class="spec"><span>${s.label}</span><b>${s.value}</b></div>`).join('');

    const list = $('#layer-list');
    list.innerHTML = d.layers.map((l, i) => `
      <li class="layer-item" data-at="${l.at}" data-i="${i}">
        <span class="ly-idx">${String(i + 1).padStart(2, '0')}</span>
        <span class="ly-copy"><b>${l.name}</b><small>${l.en}</small></span>
        <span class="ly-state">—</span>
      </li>`).join('');
    lastLayerActive = -1;

    const legend = $('#timeline-legend');
    legend.innerHTML = d.legend.map((x) => `<span>${x}</span>`).join('');

    $('#info-panel').animate(
      [{ opacity: 0.35, transform: 'translateY(5px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 360, easing: 'cubic-bezier(.22,.76,.22,1)' }
    );
  }

  function setAccent(hex) {
    const c = hex.replace('#', '');
    const r = parseInt(c.slice(0, 2), 16);
    const g = parseInt(c.slice(2, 4), 16);
    const b = parseInt(c.slice(4, 6), 16);
    const root = document.documentElement;
    root.style.setProperty('--accent', hex);
    root.style.setProperty('--accent-rgb', `${r}, ${g}, ${b}`);
  }

  function updateContent(mode) {
    uiMode = mode;
    if (mode === 'focus' && state.selected) {
      renderInfo(DATA[state.selected]);
      setAccent(DATA[state.selected].accent);
      $('#telemetry-layers').textContent = String(DATA[state.selected].layers.length).padStart(2, '0');
    } else {
      renderInfo(DATA.overview);
      setAccent(DATA.overview.accent);
      $('#telemetry-layers').textContent = '18';
    }
    $$('.comp-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.part === (mode === 'focus' ? state.selected : 'overview'));
    });
    document.body.classList.toggle('focus', mode === 'focus');
    $('#info-panel').classList.toggle('is-focus', mode === 'focus');
  }

  function bindUI() {
    $$('.comp-btn').forEach((b) => {
      b.addEventListener('click', () => {
        if (b.dataset.part === 'overview') goOverview();
        else selectPart(b.dataset.part);
      });
    });

    $('#btn-play').addEventListener('click', togglePlay);
    $('#btn-assemble').addEventListener('click', resetAssembly);
    $('#btn-reset').addEventListener('click', () => resetCamera(true));
    $('#btn-autorotate').addEventListener('click', toggleAutoRotate);
    $('#btn-glass').addEventListener('click', toggleGlass);
    $('#explode-range').addEventListener('input', onSliderInput);

    window.addEventListener('resize', onResize);
    window.addEventListener('keydown', onKeyDown);
  }

  /* ---------------------------------------------------------
     mode / selection
     --------------------------------------------------------- */
  function selectPart(id, options) {
    if (!parts[id]) return;
    const opts = options || {};
    stopPlay(false);
    if (state.mode === 'focus' && state.selected === id) {
      focusAutoToken++;
      if (state.focusT > 0.02) {
        animateFocusValue(0, 900);
      }
      return;
    }

    const previous = state.selected;
    state.mode = 'focus';
    state.selected = id;
    state.focusT = 0;
    lastFocusApplied = -1;
    lastLayerActive = -1;
    clearHover();
    updateContent('focus');

    $('#info-panel').animate(
      [{ opacity: 0.2, transform: 'translateY(7px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 420, easing: 'cubic-bezier(.22,.76,.22,1)' }
    );

    // hide everything except the selected module
    chassis.root.visible = false;
    chassis.deco.visible = false;
    if (guideGroup) guideGroup.visible = false;
    envObjects.forEach((o) => { o.visible = false; });
    focusLights.forEach((l) => { l.visible = true; });
    ORDER.forEach((pid) => {
      const p = parts[pid];
      p.root.visible = pid === id;
      p.focusOnly.forEach((o) => { o.visible = pid === id; });
      if (p.hideInFocus) p.hideInFocus.forEach((o) => { o.visible = pid !== id; });
    });
    if (previous && previous !== id) {
      parts[previous].root.visible = false;
      parts[previous].focusOnly.forEach((o) => { o.visible = false; });
    }
    focusRing.visible = true;
    focusRing.scale.setScalar(0.82);
    focusRing.position.y = -1.38;

    const p = parts[id];
    focusAnim = {
      part: p,
      fromPos: p.root.position.clone(),
      fromQuat: p.root.quaternion.clone(),
      toPos: FOCUS_ROOT.clone(),
      toQuat: p.focusQuat.clone(),
      start: performance.now(),
      duration: 1250
    };
    applyExplode(p, 0);
    p.root.position.copy(focusAnim.fromPos);
    p.root.quaternion.copy(focusAnim.fromQuat);

    updateModeChip();
    updateProgressUI();
    setTimelineStateLabel(0);
    const focusCam = getFocusCamera(id);
    tweenCamera(focusCam.pos, focusCam.target, 1250);
    // let the module settle for a beat, then reveal its layers
    const autoToken = ++focusAutoToken;
    if (!opts.still) {
      setTimeout(() => {
        if (autoToken === focusAutoToken && state.mode === 'focus' && state.selected === id) {
          startPlayback(3200);
        }
      }, 620);
    }
  }

  function goOverview() {
    focusAutoToken++;
    if (state.mode === 'overview') {
      if (state.selected !== null) return;
      tweenCamera(getOverviewCamera(state.overviewT > 0.35).pos, getOverviewCamera(state.overviewT > 0.35).target, 1100);
      return;
    }
    stopPlay(false);
    state.mode = 'overview';
    state.selected = null;
    state.focusT = 0;
    focusAnim = null;
    lastFocusApplied = -1;
    clearHover();

    chassis.root.visible = true;
    chassis.deco.visible = true;
    if (guideGroup) guideGroup.visible = state.overviewT > 0.33;
    envObjects.forEach((o) => { o.visible = true; });
    focusLights.forEach((l) => { l.visible = false; });
    focusRing.visible = false;
    ORDER.forEach((id) => {
      const p = parts[id];
      p.root.visible = true;
      p.focusOnly.forEach((o) => { o.visible = false; });
      if (p.hideInFocus) p.hideInFocus.forEach((o) => { o.visible = true; });
      applyExplode(p, 0);
    });
    resetDecoOpacity();
    updateContent('overview');
    updateModeChip();
    applyCasePanels(state.overviewT);
    applyPartLayout(state.overviewT);
    updateProgressUI();
    tweenCamera(getOverviewCamera(state.overviewT > 0.35).pos, getOverviewCamera(state.overviewT > 0.35).target, 1200);
  }

  function resetAssembly() {
    focusAutoToken++;
    stopPlay(false);
    if (state.mode === 'focus') {
      animateFocusValue(0, 850);
      showToast('部件已复位 / MODULE REASSEMBLED');
      return;
    }
    animateOverviewTo(0, 2300);
    showToast('整机正在复位 / REASSEMBLING');
    const target = getOverviewCamera(false);
    tweenCamera(target.pos, target.target, 1800);
  }

  function resetCamera(withToast) {
    if (state.mode === 'focus' && state.selected) {
      const c = getFocusCamera(state.selected);
      tweenCamera(c.pos, c.target, 900);
    } else {
      const c = getOverviewCamera(state.overviewT > 0.35);
      tweenCamera(c.pos, c.target, 900);
    }
    if (withToast) showToast('视角已重置 / VIEW RESET');
  }

  function toggleAutoRotate() {
    state.autoRotate = !state.autoRotate;
    controls.autoRotate = state.autoRotate;
    $('#btn-autorotate').setAttribute('aria-pressed', state.autoRotate ? 'true' : 'false');
    showToast(state.autoRotate ? '自动旋转已开启' : '自动旋转已关闭');
  }

  function toggleGlass() {
    state.glass = !state.glass;
    applyCasePanels(state.overviewT);
    $('#btn-glass').setAttribute('aria-pressed', state.glass ? 'true' : 'false');
    showToast(state.glass ? '侧透玻璃已显示' : '侧透玻璃已隐藏 · 观察内部');
  }

  /* ---------------------------------------------------------
     camera
     --------------------------------------------------------- */
  function aspectFactor() {
    const a = window.innerWidth / Math.max(1, window.innerHeight);
    if (a < 0.6) return 1.52;
    if (a < 0.72) return 1.5;
    if (a < 0.95) return 1.4;
    if (a < 1.25) return 1.2;
    if (a < 1.5) return 1.08;
    return 1;
  }

  function overviewFactor() {
    const a = window.innerWidth / Math.max(1, window.innerHeight);
    if (a < 0.6) return 1.5;
    if (a < 0.72) return 1.52;
    if (a < 0.95) return 1.3;
    return aspectFactor();
  }

  function getOverviewCamera(open) {
    const cfg = open ? CAMERA.overviewOpen : CAMERA.overview;
    const factor = overviewFactor();
    const target = cfg.target.clone();
    const pos = cfg.dir.clone().multiplyScalar(cfg.distance * factor).add(target);
    return { pos, target };
  }

  function getFocusCamera(id) {
    const cfg = CAMERA.focus[id];
    if (!cfg) return getOverviewCamera(false);
    const factor = aspectFactor() * (id === 'mb' ? 1.02 : 1);
    const target = new THREE.Vector3(cfg.target[0], cfg.target[1], cfg.target[2]);
    // on tall phones the info sheet occupies the top edge: bias the module downward
    if (window.innerWidth < 560 && window.innerHeight > window.innerWidth * 1.4) {
      target.y += 0.5;
    }
    const dir = new THREE.Vector3(cfg.dir[0], cfg.dir[1], cfg.dir[2]).normalize();
    const pos = dir.multiplyScalar(cfg.distance * factor).add(target);
    return { pos, target };
  }

  function tweenCamera(pos, target, duration) {
    if (!camera) return;
    cameraTween = {
      fromPos: camera.position.clone(),
      toPos: pos.clone(),
      fromTarget: controls.target.clone(),
      toTarget: target.clone(),
      start: performance.now(),
      duration: duration || 1100,
      onDone: null
    };
    state.transitioning = true;
    controls.enabled = false;
  }

  function updateCameraTween(now) {
    if (!cameraTween) return;
    const t = clamp((now - cameraTween.start) / cameraTween.duration, 0, 1);
    const e = easeInOut(t);
    camera.position.lerpVectors(cameraTween.fromPos, cameraTween.toPos, e);
    controls.target.lerpVectors(cameraTween.fromTarget, cameraTween.toTarget, e);
    camera.lookAt(controls.target);
    if (t >= 1) {
      const done = cameraTween.onDone;
      cameraTween = null;
      state.transitioning = false;
      controls.enabled = true;
      controls.update();
      if (done) done();
    }
  }

  function onControlStart() {
    if (autoResumeTimer) { clearTimeout(autoResumeTimer); autoResumeTimer = null; }
    controls.autoRotate = false;
    $('#webgl').classList.add('dragging');
    clearHover();
  }

  function onControlEnd() {
    $('#webgl').classList.remove('dragging');
    if (autoResumeTimer) clearTimeout(autoResumeTimer);
    autoResumeTimer = setTimeout(() => {
      if (state.autoRotate) controls.autoRotate = true;
    }, 3800);
  }

  /* ---------------------------------------------------------
     explosion / transforms
     --------------------------------------------------------- */
  function applyAllExplode(t) {
    ORDER.forEach((id) => applyExplode(parts[id], t));
  }

  function applyExplode(part, t) {
    part.exploders.forEach((obj) => {
      const e = obj.userData.explode;
      if (!e) return;
      const span = Math.max(0.0001, e.end - e.start);
      const f = smooth(clamp((t - e.start) / span, 0, 1));
      obj.position.copy(e.basePos).addScaledVector(e.deltaPos, f);
      tmpQ.copy(e.baseQuat).multiply(e.deltaQuat);
      obj.quaternion.slerpQuaternions(e.baseQuat, tmpQ, f);
    });
  }

  function applyCasePanels(t) {
    if (!chassis) return;
    const open = smooth(clamp((t - 0.01) / 0.46, 0, 1));
    const panelFade = 1 - smooth(clamp((t - 0.035) / 0.34, 0, 1));
    Object.keys(chassis.panels).forEach((key) => {
      const p = chassis.panels[key];
      const anim = p.userData.anim;
      if (anim) {
        p.position.copy(p.userData.basePos).addScaledVector(anim.deltaPos, open);
        tmpQ.setFromEuler(new THREE.Euler(anim.deltaEuler.x, anim.deltaEuler.y, anim.deltaEuler.z));
        tmpQ2.copy(p.userData.baseQuat).multiply(tmpQ);
        p.quaternion.slerpQuaternions(p.userData.baseQuat, tmpQ2, open);
      }
      const mats = p.userData.fadeMats || [];
      mats.forEach((m) => {
        m.opacity = (m.userData.baseOpacity == null ? 1 : m.userData.baseOpacity) * panelFade;
        m.depthWrite = m.userData.baseDepthWrite && panelFade > 0.985;
      });
      p.visible = panelFade > 0.01 && (key !== 'glass' || state.glass);
      p.updateMatrixWorld();
    });
    const f = 1 - smooth(clamp((t - 0.1) / 0.34, 0, 1));
    setDecoOpacity(f);
  }

  function setDecoOpacity(f) {
    const visible = f > 0.008;
    chassis.deco.visible = visible;
    if (!visible) return;
    decoMats.forEach((mat) => {
      mat.opacity = (mat.userData.baseOpacity == null ? 1 : mat.userData.baseOpacity) * f;
      mat.depthWrite = mat.userData.baseDepthWrite && f > 0.96;
    });
  }

  function resetDecoOpacity() {
    decoMats.forEach((mat) => {
      mat.opacity = mat.userData.baseOpacity == null ? 1 : mat.userData.baseOpacity;
      mat.depthWrite = mat.userData.baseDepthWrite;
    });
  }

  function applyPartLayout(t) {
    if (!parts) return;
    const spread = smooth(clamp((t - 0.34) / 0.66, 0, 1));
    ORDER.forEach((id, i) => {
      const p = parts[id];
      const delayed = smooth(clamp(spread * 1.25 - i * 0.015, 0, 1));
      p.root.position.lerpVectors(p.assemblyPos, p.explodePos, delayed);
      p.root.quaternion.copy(p.assemblyQuat);
    });
    updateGuides(t);
  }

  function updateGuides(t) {
    if (!guideGroup) return;
    const visible = state.mode === 'overview' && t > 0.33;
    guideGroup.visible = visible;
    if (!visible) return;
    const opacity = smooth(clamp((t - 0.33) / 0.38, 0, 1)) * 0.42;
    guides.forEach(({ line, dot, part }) => {
      const attr = line.geometry.getAttribute('position');
      attr.array[0] = part.assemblyPos.x;
      attr.array[1] = part.assemblyPos.y;
      attr.array[2] = part.assemblyPos.z;
      attr.array[3] = part.root.position.x;
      attr.array[4] = part.root.position.y;
      attr.array[5] = part.root.position.z;
      attr.needsUpdate = true;
      line.geometry.computeBoundingSphere();
      line.computeLineDistances();
      line.material.opacity = opacity;
      dot.position.copy(part.assemblyPos);
      dot.material.opacity = opacity * 1.3;
      dot.visible = opacity > 0.01;
      dot.rotation.y += 0.008;
    });
  }

  function animateOverviewTo(target, duration) {
    const from = state.overviewT;
    state.playTarget = 'overview';
    state.play = {
      start: performance.now(),
      from,
      to: target,
      duration,
      mode: 'overview'
    };
    state.playing = true;
    updatePlayButton();
  }

  function animateFocusValue(target, duration) {
    const from = state.focusT;
    state.play = {
      start: performance.now(),
      from,
      to: target,
      duration,
      mode: 'focus'
    };
    state.playing = true;
    updatePlayButton();
  }

  function startPlayback(duration) {
    if (!state.loaded) return;
    if (state.mode === 'focus') {
      state.focusT = 0;
      lastFocusApplied = -1;
      applyExplode(parts[state.selected], 0);
      state.play = {
        start: performance.now(),
        from: 0,
        to: 1,
        duration: duration || 3200,
        mode: 'focus'
      };
    } else {
      state.overviewT = 0;
      state.play = {
        start: performance.now(),
        from: 0,
        to: 1,
        duration: duration || 3600,
        mode: 'overview'
      };
    }
    state.playing = true;
    updatePlayButton();
    updateProgressUI();
  }

  function togglePlay() {
    focusAutoToken++;
    if (state.playing) {
      stopPlay(true);
      return;
    }
    if (state.mode === 'focus') {
      const max = 1;
      if (state.focusT >= 0.995) state.focusT = 0;
      state.play = {
        start: performance.now(),
        from: state.focusT,
        to: max,
        duration: 3200 * (1 - state.focusT),
        mode: 'focus'
      };
    } else {
      if (state.overviewT >= 0.995) state.overviewT = 0;
      state.play = {
        start: performance.now(),
        from: state.overviewT,
        to: 1,
        duration: 3800 * (1 - state.overviewT),
        mode: 'overview'
      };
    }
    state.playing = true;
    updatePlayButton();
  }

  function stopPlay(pause) {
    if (!state.playing) return;
    state.playing = false;
    state.play = null;
    updatePlayButton();
    if (pause) updateProgressUI();
  }

  function tickPlayback(now) {
    if (!state.playing || !state.play) return;
    if (state.play.mode !== state.mode) {
      stopPlay(false);
      return;
    }
    const p = clamp((now - state.play.start) / state.play.duration, 0, 1);
    const e = easeInOut(p);
    const v = lerp(state.play.from, state.play.to, e);
    if (state.mode === 'focus') {
      if (!state.selected) { stopPlay(false); return; }
      state.focusT = v;
      applyExplode(parts[state.selected], v);
    } else {
      state.overviewT = v;
      applyCasePanels(v);
      applyPartLayout(v);
    }
    updateProgressUI();
    if (p >= 1) {
      state.playing = false;
      state.play = null;
      updatePlayButton();
      if (state.mode === 'overview') {
        const c = getOverviewCamera(true);
        tweenCamera(c.pos, c.target, 1300);
      }
    }
  }

  function onSliderInput(e) {
    focusAutoToken++;
    stopPlay(false);
    const v = Number(e.target.value) / 100;
    if (state.mode === 'focus' && state.selected) {
      state.focusT = v;
      applyExplode(parts[state.selected], v);
      updateProgressUI();
    } else {
      state.overviewT = v;
      applyCasePanels(v);
      applyPartLayout(v);
      updateProgressUI();
    }
  }

  /* ---------------------------------------------------------
     progress / UI sync
     --------------------------------------------------------- */
  function updateProgressUI(force) {
    const t = state.mode === 'focus' ? state.focusT : state.overviewT;
    const pct = clamp(t * 100, 0, 100);
    const key = `${state.mode}|${state.selected || '-'}|${Math.round(pct * 10)}`;
    if (!force && key === lastProgressKey) return;
    lastProgressKey = key;
    $('#explode-range').value = Math.round(pct);
    $('#timeline-fill').style.width = pct + '%';
    const thumb = $('#timeline-thumb');
    if (thumb) thumb.style.left = pct + '%';
    $('#timeline-percent').textContent = pad2(pct) + '%';
    updateLayerUI(t);
    updatePlayButton();
  }

  function updateLayerUI(t) {
    if (uiMode === null) return;
    const d = state.mode === 'focus' && state.selected ? DATA[state.selected] : DATA.overview;
    let active = 0;
    d.layers.forEach((l, i) => { if (t >= l.at - 0.001) active = i; });
    if (active !== lastLayerActive) {
      lastLayerActive = active;
      const items = $$('#layer-list .layer-item');
      items.forEach((li, i) => {
        li.classList.toggle('active', i === active);
        const st = li.querySelector('.ly-state');
        if (st) st.textContent = i === active ? 'ACTIVE' : '—';
      });
    }
    setTimelineStateLabel(t, d);
  }

  function setTimelineStateLabel(t, d) {
    const data = d || (state.mode === 'focus' && state.selected ? DATA[state.selected] : DATA.overview);
    let idx = 0;
    data.layers.forEach((l, i) => { if (t >= l.at - 0.001) idx = i; });
    if (state.mode === 'overview' && t < 0.02) {
      $('#timeline-label').textContent = '装配完成 / ASSEMBLED';
    } else {
      const l = data.layers[idx];
      $('#timeline-label').textContent = `${l.name} / ${l.en}`;
    }
    const p = $('#mode-sub');
    if (state.mode === 'focus' && state.selected) {
      const s = data.layers[idx];
      p.textContent = s ? s.en : 'TEARDOWN';
    } else {
      p.textContent = t > 0.5 ? 'MODULE LAYOUT' : t > 0.1 ? 'PANELS OPEN' : '6 MODULES STANDBY';
    }
  }

  function updatePlayButton() {
    const dock = $('.dock');
    dock.classList.toggle('playing', state.playing);
    const label = $('#play-label');
    const sub = $('#play-sub');
    const t = state.mode === 'focus' ? state.focusT : state.overviewT;
    if (state.playing) {
      label.textContent = '暂停演示';
      sub.textContent = 'PAUSE SEQUENCE';
    } else if (t >= 0.995) {
      label.textContent = '重播拆解';
      sub.textContent = 'REPLAY SEQUENCE';
    } else if (t > 0.02) {
      label.textContent = '继续拆解';
      sub.textContent = 'RESUME SEQUENCE';
    } else {
      label.textContent = '拆解演示';
      sub.textContent = 'EXPLODE SEQUENCE';
    }
  }

  function updateModeChip() {
    let main, sub;
    if (state.mode === 'focus' && state.selected) {
      main = '部件拆解 / TEARDOWN';
      const tail = DATA[state.selected].en.split('·')[1];
      sub = tail ? tail.trim() : 'MODULE';
    } else if (state.overviewT > 0.55) {
      main = '壳体分离 / CUTAWAY';
      sub = 'CLICK A MODULE';
    } else if (state.overviewT > 0.06) {
      main = '外壳开启 / OPENING';
      sub = 'PANEL REMOVAL';
    } else {
      main = '整机 / ASSEMBLED';
      sub = '6 MODULES STANDBY';
    }
    const key = main + '|' + sub;
    if (key === lastModeChipText) return;
    lastModeChipText = key;
    $('#mode-text').textContent = main;
    $('#mode-sub').textContent = sub;
  }

  /* ---------------------------------------------------------
     labels / annotations
     --------------------------------------------------------- */
  const proj = new THREE.Vector3();
  function projectWorld(v) {
    proj.copy(v).project(camera);
    return {
      x: (proj.x * 0.5 + 0.5) * window.innerWidth,
      y: (-proj.y * 0.5 + 0.5) * window.innerHeight,
      z: proj.z
    };
  }

  function updateHotspots() {
    const visible = state.mode === 'overview' && state.overviewT > 0.3 && !state.transitioning;
    ORDER.forEach((id) => {
      const el = hotspots.get(id);
      if (!el) return;
      if (!visible) {
        el.classList.remove('visible');
        return;
      }
      const p = parts[id];
      const yOff = ({ cpu: 0.55, gpu: 0.5, ram: 0.24, hdd: 0.52, mb: 0.55, psu: 0.54 })[id];
      tmpV.copy(p.root.position).add(tmpV2.set(0, yOff, 0));
      const pt = projectWorld(tmpV);
      if (pt.z > 1 || pt.x < 30 || pt.x > window.innerWidth - 20 || pt.y < 80 || pt.y > window.innerHeight - 40) {
        el.classList.remove('visible');
        return;
      }
      el.classList.add('visible');
      el.style.transform = `translate3d(${pt.x}px, ${pt.y}px, 0) translate(-50%, -50%)`;
      el.classList.toggle('left', pt.x > window.innerWidth - infoPanelWidth - 190);
    });
  }

  function updateLayerTags() {
    if (state.mode !== 'focus' || !state.selected) {
      tagEls.forEach(({ el }) => el.classList.remove('visible'));
      return;
    }
    const flipThreshold = window.innerWidth - infoPanelWidth - 120;
    const candidates = [];
    tagEls.forEach(({ el, tag, partId, min }, index) => {
      if (partId !== state.selected || state.focusT < min) {
        el.classList.remove('visible');
        return;
      }
      tag.anchor.getWorldPosition(tmpV);
      const pt = projectWorld(tmpV);
      if (pt.z > 1 || pt.x < 0 || pt.x > window.innerWidth || pt.y < 58 || pt.y > window.innerHeight - 18) {
        el.classList.remove('visible');
        return;
      }
      const x = pt.x + (tag.dx || 0) * 34;
      const y = pt.y + (tag.dy || 0) * 28;
      const side = x > flipThreshold ? 'left' : 'right';
      el.classList.toggle('flip', side === 'left');
      el.classList.add('visible');
      candidates.push({ el, x, y, side, order: index });
    });
    // simple collision resolution so callouts stay readable
    ['right', 'left'].forEach((side) => {
      const group = candidates.filter((c) => c.side === side).sort((a, b) => a.y - b.y);
      let cursor = -Infinity;
      group.forEach((c) => {
        if (c.y < cursor + 54) c.y = cursor + 54;
        cursor = c.y;
      });
    });
    candidates.forEach((c) => {
      c.el.style.transform = `translate3d(${c.x}px, ${c.y}px, 0)`;
    });
  }

  /* ---------------------------------------------------------
     pointer / picking
     --------------------------------------------------------- */
  function initInteraction() {
    const canvas = $('#webgl');
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointerleave', () => {
      if (!pointerDragged) clearHover();
      canvas.classList.remove('dragging');
    });
    canvas.addEventListener('pointercancel', () => { pointerDragged = false; canvas.classList.remove('dragging'); });
  }

  function pickAt(clientX, clientY) {
    if (!parts) return null;
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const list = [];
    ORDER.forEach((id) => {
      if (!parts[id].root.visible) return;
      parts[id].pickables.forEach((mesh) => {
        let o = mesh, visible = true;
        while (o && o !== stage) {
          if (!o.visible) { visible = false; break; }
          o = o.parent;
        }
        if (visible) list.push(mesh);
      });
    });
    const hits = raycaster.intersectObjects(list, false);
    if (!hits.length) return null;
    return hits[0].object.userData.partId || null;
  }

  function onPointerMove(ev) {
    if (state.mode !== 'overview') return;
    if (ev.pointerType !== 'mouse') return;
    const tip = $('#hover-tip');
    tip.style.left = ev.clientX + 'px';
    tip.style.top = ev.clientY + 'px';
    const id = pickAt(ev.clientX, ev.clientY);
    setHover(id);
  }

  function setHover(id) {
    if (state.hovered === id) return;
    state.hovered = id;
    const tip = $('#hover-tip');
    if (!id) {
      tip.classList.remove('visible');
      if (hoverHelper) hoverHelper.visible = false;
      document.body.style.cursor = '';
      return;
    }
    const d = DATA[id];
    $('#hover-tip-index').textContent = d.index;
    $('#hover-tip-name').textContent = d.title;
    tip.classList.add('visible');
    const box = new THREE.Box3().setFromObject(parts[id].root);
    box.expandByScalar(0.045);
    hoverHelper.box.copy(box);
    hoverHelper.visible = true;
    hoverHelper.updateMatrixWorld(true);
  }

  function clearHover() {
    if (state.hovered) setHover(null);
    else if (hoverHelper) hoverHelper.visible = false;
  }

  function onPointerDown(ev) {
    if (state.mode !== 'overview') return;
    pointerDragged = false;
    pointerStart.x = ev.clientX;
    pointerStart.y = ev.clientY;
    pointerStart.time = performance.now();
    if (autoResumeTimer) { clearTimeout(autoResumeTimer); autoResumeTimer = null; }
    controls.autoRotate = false;
    clearHover();
  }

  function onPointerUp(ev) {
    if (state.mode !== 'overview') return;
    const dx = ev.clientX - pointerStart.x;
    const dy = ev.clientY - pointerStart.y;
    const moved = Math.hypot(dx, dy);
    pointerDragged = moved > 6;
    if (autoResumeTimer) clearTimeout(autoResumeTimer);
    autoResumeTimer = setTimeout(() => {
      if (state.autoRotate) controls.autoRotate = true;
    }, 3000);
    if (!pointerDragged && performance.now() - pointerStart.time < 700 && !state.transitioning) {
      const id = pickAt(ev.clientX, ev.clientY);
      if (id) selectPart(id);
    }
  }

  /* ---------------------------------------------------------
     keyboard
     --------------------------------------------------------- */
  function onKeyDown(ev) {
    const tag = (ev.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea') {
      if (ev.key === 'Escape') ev.target.blur();
      return;
    }
    if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
    const k = ev.key.toLowerCase();
    if (k === ' ' || ev.code === 'Space') {
      ev.preventDefault();
      togglePlay();
    } else if (k === '0' || k === 'escape') {
      if (state.mode === 'focus') goOverview();
    } else if (k === 'r') {
      resetCamera(true);
    } else if (k === 'a') {
      toggleAutoRotate();
    } else if (k === 'g') {
      toggleGlass();
    } else if (/^[1-6]$/.test(k)) {
      selectPart(ORDER[Number(k) - 1]);
    }
  }

  /* ---------------------------------------------------------
     misc
     --------------------------------------------------------- */
  let toastTimer = null;
  function showToast(text, duration) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = text;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), duration || 1800);
  }

  function onResize() {
    if (!renderer || !camera) return;
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.85));
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    infoPanelWidth = $('#info-panel').getBoundingClientRect().width || (w > 900 ? 354 : w - 24);
    if (!state.transitioning) {
      // keep the current orbit direction, but adjust distance gently for tiny screens
      if (w < 700 && state.mode === 'overview') {
        const c = getOverviewCamera(state.overviewT > 0.35);
        tweenCamera(c.pos, c.target, 500);
      }
    }
  }

  /* ---------------------------------------------------------
     render loop
     --------------------------------------------------------- */
  function animate(now) {
    requestAnimationFrame(animate);
    if (!renderer || !scene) return;
    const dt = Math.min(clock.getDelta(), 0.05);

    tickPlayback(now);
    updateCameraTween(now);

    if (state.mode === 'focus' && focusAnim) {
      const t = clamp((now - focusAnim.start) / focusAnim.duration, 0, 1);
      const e = easeInOut(t);
      const p = focusAnim.part;
      p.root.position.lerpVectors(focusAnim.fromPos, focusAnim.toPos, e);
      p.root.quaternion.slerpQuaternions(focusAnim.fromQuat, focusAnim.toQuat, e);
      focusRing.scale.lerp(tmpV.set(1, 1, 1), 0.06);
      if (t >= 1) focusAnim = null;
    }

    if (state.mode === 'overview') {
      applyCasePanels(state.overviewT);
      applyPartLayout(state.overviewT);
      // adapt mode chip as the slider moves
      updateModeChip();
    } else if (state.mode === 'focus' && state.selected) {
      // root is driven by focusAnim; explosion is driven by playback/slider
      if (lastFocusApplied !== state.focusT) {
        applyExplode(parts[state.selected], state.focusT);
        lastFocusApplied = state.focusT;
      }
    }

    if (controls.enabled) controls.update();

    // kinetic details
    fanSpins.forEach(({ spin, speed }) => {
      const boost = state.mode === 'focus' && state.selected === 'gpu' ? 2.8 : 1;
      spin.rotation.y += dt * speed * boost;
    });
    if (dust) {
      dust.rotation.y += dt * 0.006;
      dust.position.y = Math.sin(now * 0.00013) * 0.08;
    }
    if (platformTicks) platformTicks.rotation.y += dt * 0.008;
    if (focusRingSpin && focusRing.visible) focusRingSpin.rotation.y -= dt * 0.16;
    if (focusRing.visible) {
      focusRing.position.y = -1.38 + Math.sin(now * 0.0007) * 0.025;
    }

    updateHotspots();
    updateLayerTags();
    updateProgressUI();
    renderer.render(scene, camera);
  }

  /* debug / automation bridge */
  window.NOVA = {
    ready: () => state.loaded,
    state,
    selectPart,
    goOverview,
    stopPlay,
    resetCamera,
    setOverviewT(t) {
      stopPlay(false);
      state.overviewT = clamp(Number(t) || 0, 0, 1);
      applyCasePanels(state.overviewT);
      applyPartLayout(state.overviewT);
      updateProgressUI();
    },
    setFocusT(t) {
      if (!state.selected) return;
      stopPlay(false);
      state.focusT = clamp(Number(t) || 0, 0, 1);
      applyExplode(parts[state.selected], state.focusT);
      updateProgressUI();
    },
    snapCamera() {
      if (cameraTween) {
        camera.position.copy(cameraTween.toPos);
        controls.target.copy(cameraTween.toTarget);
        camera.lookAt(controls.target);
      }
      cameraTween = null;
      state.transitioning = false;
      controls.enabled = true;
      controls.update();
    },
    setAutoRotate(v) {
      state.autoRotate = !!v;
      controls.autoRotate = !!v;
      $('#btn-autorotate').setAttribute('aria-pressed', v ? 'true' : 'false');
    },
    snapOverview(open) {
      cameraTween = null;
      state.transitioning = false;
      const c = getOverviewCamera(!!open);
      camera.position.copy(c.pos);
      controls.target.copy(c.target);
      controls.enabled = true;
      controls.autoRotate = false;
      controls.update();
    },
    getCamera: () => ({ pos: camera.position.toArray(), target: controls.target.toArray() }),
    debugPanels: () => Object.fromEntries(Object.entries(chassis.panels).map(([k, p]) => [k, {
      visible: p.visible,
      opacity: p.userData.fadeMats && p.userData.fadeMats[0] ? p.userData.fadeMats[0].opacity : null
    }])),
    getStats: () => ({ calls: renderer.info.render.calls, triangles: renderer.info.render.triangles })
  };

  /* go */
  window.addEventListener('DOMContentLoaded', () => {
    boot();
    requestAnimationFrame(animate);
  });
})();
