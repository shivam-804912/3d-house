import * as THREE from 'three';

function createSoftCircleTexture(innerColor, midColor, outerColor) {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, innerColor);
  grad.addColorStop(0.35, midColor);
  grad.addColorStop(0.7, outerColor);
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createEnvironment(scene, smokeSourcePos) {
  const envGroup = new THREE.Group();
  envGroup.name = "EnvironmentSystem";

  // Soft glowing particle textures
  const starTexture = createSoftCircleTexture('rgba(255, 255, 255, 1)', 'rgba(210, 235, 255, 0.6)', 'rgba(180, 210, 255, 0.1)');
  const fireflyTexture = createSoftCircleTexture('rgba(255, 255, 240, 1)', 'rgba(240, 255, 120, 0.8)', 'rgba(150, 230, 50, 0.2)');

  // 1. Sky Dome Geometry & Shader
  const skyGeo = new THREE.SphereGeometry(280, 32, 24);
  const skyMat = new THREE.ShaderMaterial({
    uniforms: {
      topColor: { value: new THREE.Color(0x3882d4) },     // Sky blue
      bottomColor: { value: new THREE.Color(0xdcefff) },  // Soft horizon haze
      offset: { value: 12.0 },
      exponent: { value: 0.65 },
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform float offset;
      uniform float exponent;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition + offset).y;
        gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
      }
    `,
    side: THREE.BackSide,
    depthWrite: false,
  });
  const skyMesh = new THREE.Mesh(skyGeo, skyMat);
  envGroup.add(skyMesh);

  // 2. Lighting
  // Hemisphere Light (ambient sky + ground bounce)
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x445533, 0.7);
  envGroup.add(hemiLight);

  // Directional Sun / Moon Light
  const dirLight = new THREE.DirectionalLight(0xfffaed, 1.8);
  dirLight.position.set(65, 80, -45);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  dirLight.shadow.camera.near = 5;
  dirLight.shadow.camera.far = 240;
  dirLight.shadow.camera.left = -65;
  dirLight.shadow.camera.right = 65;
  dirLight.shadow.camera.top = 65;
  dirLight.shadow.camera.bottom = -65;
  dirLight.shadow.bias = -0.0005;
  envGroup.add(dirLight);

  // 3. Glowing Sun & Moon Meshes
  const sunGeo = new THREE.SphereGeometry(7, 16, 16);
  const sunMat = new THREE.MeshBasicMaterial({ color: 0xfff6bd });
  const sunMesh = new THREE.Mesh(sunGeo, sunMat);
  sunMesh.position.copy(dirLight.position);
  envGroup.add(sunMesh);

  const moonGeo = new THREE.SphereGeometry(5, 16, 16);
  const moonMat = new THREE.MeshBasicMaterial({ color: 0xe6edf8 });
  const moonMesh = new THREE.Mesh(moonGeo, moonMat);
  moonMesh.position.set(-65, -80, 45); // opposite sun
  moonMesh.visible = false;
  envGroup.add(moonMesh);

  // 4. Starfield for Night Sky
  const starCount = 1800;
  const starGeo = new THREE.BufferGeometry();
  const starPositions = new Float32Array(starCount * 3);
  const starSizes = new Float32Array(starCount);

  for (let i = 0; i < starCount; i++) {
    // Distribute on upper hemisphere
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0) * 0.48; // keep upper sky
    const r = 265;

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.cos(phi) + 10;
    const z = r * Math.sin(phi) * Math.sin(theta);

    starPositions[i * 3] = x;
    starPositions[i * 3 + 1] = y;
    starPositions[i * 3 + 2] = z;
    starSizes[i] = Math.random() * 2.0 + 1.0;
  }

  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const starMat = new THREE.PointsMaterial({
    map: starTexture,
    color: 0xffffff,
    size: 2.2,
    transparent: true,
    opacity: 0.0, // starts invisible during day
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const starPoints = new THREE.Points(starGeo, starMat);
  envGroup.add(starPoints);

  // 5. Stylized Fluffy Clouds
  const cloudGroup = new THREE.Group();
  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.9,
    transparent: true,
    opacity: 0.88,
    flatShading: true,
  });

  const clouds = [];
  const cloudCount = 14;
  for (let c = 0; c < cloudCount; c++) {
    const singleCloud = new THREE.Group();
    const puffCount = 5 + Math.floor(Math.random() * 4);
    for (let p = 0; p < puffCount; p++) {
      const puffGeo = new THREE.DodecahedronGeometry(3.5 + Math.random() * 2.5, 1);
      const puff = new THREE.Mesh(puffGeo, cloudMat);
      puff.position.set(
        (p - puffCount / 2) * 3.8 + (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 1.5,
        (Math.random() - 0.5) * 3
      );
      singleCloud.add(puff);
    }
    const cx = (Math.random() - 0.5) * 260;
    const cy = 48 + Math.random() * 25;
    const cz = (Math.random() - 0.5) * 260;
    singleCloud.position.set(cx, cy, cz);
    cloudGroup.add(singleCloud);
    clouds.push({
      mesh: singleCloud,
      speed: 1.8 + Math.random() * 1.6,
    });
  }
  envGroup.add(cloudGroup);

  // 6. Flying Birds
  const birdGroup = new THREE.Group();
  const birdMat = new THREE.MeshBasicMaterial({ color: 0x222222, side: THREE.DoubleSide });
  const birds = [];
  const birdCount = 9;

  for (let b = 0; b < birdCount; b++) {
    const bGeom = new THREE.BufferGeometry();
    // Simple V-wing geometry
    const vertices = new Float32Array([
      0, 0, 0.4,
      -0.9, 0.15, -0.2,
      0, 0, -0.4,

      0, 0, 0.4,
      0.9, 0.15, -0.2,
      0, 0, -0.4,
    ]);
    bGeom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    const bMesh = new THREE.Mesh(bGeom, birdMat);
    birdGroup.add(bMesh);

    birds.push({
      mesh: bMesh,
      angle: (b / birdCount) * Math.PI * 2,
      radius: 45 + (b % 3) * 12,
      height: 38 + b * 2,
      speed: 0.35 + Math.random() * 0.1,
      flapSpeed: 9 + Math.random() * 3,
    });
  }
  envGroup.add(birdGroup);

  // 7. Chimney Smoke Particle System
  const smokeCount = 35;
  const smokeGeo = new THREE.DodecahedronGeometry(0.35, 1);
  const smokeMat = new THREE.MeshStandardMaterial({
    color: 0xdddddd,
    roughness: 0.9,
    transparent: true,
    opacity: 0.45,
    flatShading: true,
    depthWrite: false,
  });

  const smokePuffs = [];
  const smokeBasePos = smokeSourcePos || new THREE.Vector3(-19.8, 10.8, 0.8);

  for (let i = 0; i < smokeCount; i++) {
    const puff = new THREE.Mesh(smokeGeo, smokeMat.clone());
    puff.position.copy(smokeBasePos);
    puff.position.y += (i / smokeCount) * 7;
    envGroup.add(puff);

    smokePuffs.push({
      mesh: puff,
      life: i / smokeCount,
      vx: (Math.random() - 0.5) * 0.3 + 0.1,
      vz: (Math.random() - 0.5) * 0.2 + 0.1,
      rotSpeed: (Math.random() - 0.5) * 1.5,
    });
  }

  // 8. Fireflies at Dusk/Night
  const fireflyCount = 70;
  const fireflyGeo = new THREE.BufferGeometry();
  const fireflyPositions = new Float32Array(fireflyCount * 3);
  const fireflyData = [];

  for (let i = 0; i < fireflyCount; i++) {
    const x = -30 + Math.random() * 35;
    const y = 0.8 + Math.random() * 4.5;
    const z = -25 + Math.random() * 45;

    fireflyPositions[i * 3] = x;
    fireflyPositions[i * 3 + 1] = y;
    fireflyPositions[i * 3 + 2] = z;

    fireflyData.push({
      baseX: x,
      baseY: y,
      baseZ: z,
      phase: Math.random() * Math.PI * 2,
      speed: 0.8 + Math.random() * 1.2,
    });
  }

  fireflyGeo.setAttribute('position', new THREE.BufferAttribute(fireflyPositions, 3));
  const fireflyMat = new THREE.PointsMaterial({
    map: fireflyTexture,
    color: 0xd9ff66,
    size: 3.2,
    transparent: true,
    opacity: 0.0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const fireflyPoints = new THREE.Points(fireflyGeo, fireflyMat);
  envGroup.add(fireflyPoints);

  // 9. Rain Particle System
  const rainCount = 1500;
  const rainGeo = new THREE.BufferGeometry();
  const rainPos = new Float32Array(rainCount * 3);
  for (let i = 0; i < rainCount; i++) {
    rainPos[i * 3] = (Math.random() - 0.5) * 140;
    rainPos[i * 3 + 1] = Math.random() * 80;
    rainPos[i * 3 + 2] = (Math.random() - 0.5) * 140;
  }
  rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
  const rainMat = new THREE.PointsMaterial({
    color: 0xa8c8e8,
    size: 1.2,
    transparent: true,
    opacity: 0.0,
    depthWrite: false,
  });
  const rainPoints = new THREE.Points(rainGeo, rainMat);
  envGroup.add(rainPoints);

  scene.add(envGroup);

  // Time-of-Day Configurations
  const skyPresets = {
    day: {
      top: new THREE.Color(0x3282db),
      bottom: new THREE.Color(0xd7ecfc),
      hemiSky: 0xffffff,
      hemiGround: 0x4d6638,
      dirColor: 0xfffaed,
      dirIntensity: 1.8,
      sunPos: new THREE.Vector3(65, 80, -45),
      starOpacity: 0.0,
      fireflyTarget: 0.0,
      fogColor: 0xd7ecfc,
      fogDensity: 0.0035,
    },
    sunset: {
      top: new THREE.Color(0x272b5c),     // twilight deep violet
      bottom: new THREE.Color(0xeb6b40),  // burning golden rose
      hemiSky: 0xfaad70,
      hemiGround: 0x3d271d,
      dirColor: 0xff8833,
      dirIntensity: 2.2,
      sunPos: new THREE.Vector3(85, 18, -35),
      starOpacity: 0.25,
      fireflyTarget: 0.7,
      fogColor: 0xeb8259,
      fogDensity: 0.005,
    },
    night: {
      top: new THREE.Color(0x060914),     // midnight abyss
      bottom: new THREE.Color(0x131d2e),  // deep misty indigo
      hemiSky: 0x1f2e4d,
      hemiGround: 0x0a1017,
      dirColor: 0x93b4e6,                 // cool silver moonlight
      dirIntensity: 0.6,
      sunPos: new THREE.Vector3(-60, 65, 40),
      starOpacity: 0.95,
      fireflyTarget: 1.0,
      fogColor: 0x0e1726,
      fogDensity: 0.0045,
    },
    rain: {
      top: new THREE.Color(0x3e4d5c),
      bottom: new THREE.Color(0x8295a6),
      hemiSky: 0x9fb2c4,
      hemiGround: 0x3d453e,
      dirColor: 0xb5c8d9,
      dirIntensity: 0.9,
      sunPos: new THREE.Vector3(40, 60, -30),
      starOpacity: 0.0,
      fireflyTarget: 0.0,
      fogColor: 0x8295a6,
      fogDensity: 0.009,
    },
  };

  let targetPreset = 'day';
  let isRaining = false;
  let smokeActive = true;
  let firefliesActive = true;

  return {
    envGroup,
    dirLight,
    hemiLight,
    skyMat,
    starMat,
    fireflyMat,
    rainMat,

    setTimeOfDay: (timeName) => {
      if (skyPresets[timeName]) {
        targetPreset = timeName;
      }
    },

    setWeather: (weather) => {
      isRaining = weather === 'rain';
      if (isRaining) {
        targetPreset = 'rain';
      } else if (targetPreset === 'rain') {
        targetPreset = 'day';
      }
    },

    setSmokeActive: (active) => {
      smokeActive = active;
      smokePuffs.forEach(sp => {
        sp.mesh.visible = active;
      });
    },

    setFirefliesActive: (active) => {
      firefliesActive = active;
    },

    update: (delta, time, sceneFog) => {
      // 1. Smoothly interpolate Sky and Lighting to target preset
      const p = skyPresets[targetPreset];
      const lerpSpeed = Math.min(1.0, delta * 2.8);

      skyMat.uniforms.topColor.value.lerp(p.top, lerpSpeed);
      skyMat.uniforms.bottomColor.value.lerp(p.bottom, lerpSpeed);
      hemiLight.color.lerp(new THREE.Color(p.hemiSky), lerpSpeed);
      hemiLight.groundColor.lerp(new THREE.Color(p.hemiGround), lerpSpeed);
      dirLight.color.lerp(new THREE.Color(p.dirColor), lerpSpeed);
      dirLight.intensity = THREE.MathUtils.lerp(dirLight.intensity, p.dirIntensity, lerpSpeed);
      dirLight.position.lerp(p.sunPos, lerpSpeed);
      sunMesh.position.copy(dirLight.position);

      starMat.opacity = THREE.MathUtils.lerp(starMat.opacity, p.starOpacity, lerpSpeed);
      starPoints.visible = starMat.opacity > 0.02;

      const targetFirefly = (targetPreset === 'night' || targetPreset === 'sunset') && firefliesActive ? p.fireflyTarget : 0.0;
      fireflyMat.opacity = THREE.MathUtils.lerp(fireflyMat.opacity, targetFirefly, lerpSpeed);
      fireflyPoints.visible = fireflyMat.opacity > 0.02;

      if (sceneFog) {
        sceneFog.color.lerp(new THREE.Color(p.fogColor), lerpSpeed);
        sceneFog.density = THREE.MathUtils.lerp(sceneFog.density, p.fogDensity, lerpSpeed);
      }

      // Sun/Moon visibility
      sunMesh.visible = targetPreset !== 'night';
      moonMesh.visible = targetPreset === 'night';

      // 2. Animate Clouds
      clouds.forEach(c => {
        c.mesh.position.x += c.speed * delta;
        if (c.mesh.position.x > 140) {
          c.mesh.position.x = -140;
          c.mesh.position.z = (Math.random() - 0.5) * 240;
        }
      });

      // 3. Animate Birds
      birds.forEach(b => {
        b.angle += b.speed * delta * 0.4;
        b.mesh.position.x = Math.cos(b.angle) * b.radius;
        b.mesh.position.z = Math.sin(b.angle) * b.radius;
        b.mesh.position.y = b.height + Math.sin(time * 1.5 + b.angle) * 2;
        // Face forward along flight trajectory
        b.mesh.rotation.y = -b.angle + Math.PI / 2;
        // Wing flap
        b.mesh.rotation.z = Math.sin(time * b.flapSpeed) * 0.35;
      });

      // 4. Animate Chimney Smoke
      if (smokeActive) {
        smokePuffs.forEach(sp => {
          sp.life += delta * 0.32;
          if (sp.life > 1.0) {
            sp.life = 0;
            sp.mesh.position.copy(smokeBasePos);
          }
          sp.mesh.position.y += delta * 2.2;
          sp.mesh.position.x += sp.vx * delta * 1.8;
          sp.mesh.position.z += sp.vz * delta * 1.8;
          sp.mesh.rotation.y += sp.rotSpeed * delta;

          // Scale expands as smoke rises
          const scale = 0.5 + sp.life * 2.5;
          sp.mesh.scale.set(scale, scale, scale);

          // Opacity fades out
          sp.mesh.material.opacity = (1.0 - sp.life) * 0.42;
        });
      }

      // 5. Animate Fireflies (twinkling and hovering)
      if (firefliesActive && fireflyMat.opacity > 0.02) {
        const positions = fireflyGeo.attributes.position.array;
        for (let i = 0; i < fireflyCount; i++) {
          const fd = fireflyData[i];
          const curTime = time * fd.speed + fd.phase;
          positions[i * 3] = fd.baseX + Math.sin(curTime * 1.1) * 1.8;
          positions[i * 3 + 1] = fd.baseY + Math.sin(curTime * 2.2) * 0.6;
          positions[i * 3 + 2] = fd.baseZ + Math.cos(curTime * 1.3) * 1.8;
        }
        fireflyGeo.attributes.position.needsUpdate = true;
      }

      // 6. Animate Rain
      if (isRaining) {
        rainMat.opacity = THREE.MathUtils.lerp(rainMat.opacity, 0.75, 0.1);
        const rpos = rainGeo.attributes.position.array;
        for (let i = 0; i < rainCount; i++) {
          rpos[i * 3 + 1] -= delta * 65; // fall fast
          if (rpos[i * 3 + 1] < -1) {
            rpos[i * 3 + 1] = 75;
          }
        }
        rainGeo.attributes.position.needsUpdate = true;
      } else {
        rainMat.opacity = THREE.MathUtils.lerp(rainMat.opacity, 0.0, 0.1);
      }
    },
  };
}
