import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createTerrain } from './terrain.js';
import { createHouse } from './house.js';
import { createRiver } from './water.js';
import { createEnvironment } from './environment.js';

export class WorldScene {
  constructor(containerElement, onSelectLandmark) {
    this.container = containerElement;
    this.onSelectLandmark = onSelectLandmark;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.clock = new THREE.Clock();

    // Scene sub-systems
    this.terrain = null;
    this.house = null;
    this.river = null;
    this.environment = null;

    // Camera animation state
    this.targetCameraPos = null;
    this.targetControlsTarget = null;
    this.isCameraTransitioning = false;
    this.autoOrbit = false;

    // Raycasting for interactive landmarks
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Landmark clickable targets
    this.landmarks = [];

    this.animId = null;
    this.houseLightsOn = true;

    this.init();
  }

  init() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // 1. Scene & Atmospheric Fog
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0xd7ecfc, 0.0035);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 450);
    this.camera.position.set(22, 24, 38);

    // 3. Renderer with high-end post-like tone mapping & shadows
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.container.appendChild(this.renderer.domElement);

    // 4. OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.target.set(-8, 3, 2);
    this.controls.minDistance = 6;
    this.controls.maxDistance = 140;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.04; // don't go below ground level
    this.controls.update();

    // 5. Build 3D World Components
    this.terrain = createTerrain(this.scene);
    this.house = createHouse(this.scene);
    this.river = createRiver(this.scene);
    this.environment = createEnvironment(this.scene, this.house.smokePosition);

    // 6. Setup Landmark Colliders for Interactive Clicks
    this.setupLandmarks();

    // 7. Event Listeners
    this.onWindowResize = this.onWindowResize.bind(this);
    this.onPointerDown = this.onPointerDown.bind(this);

    window.addEventListener('resize', this.onWindowResize);
    this.renderer.domElement.addEventListener('pointerdown', this.onPointerDown);

    // 8. Start Animation Loop
    this.animate = this.animate.bind(this);
    this.animate();
  }

  setupLandmarks() {
    // Landmark invisible clickable proxies with rich metadata
    const addLandmark = (name, desc, pos, cameraPos, lookAtPos, icon) => {
      const geo = new THREE.SphereGeometry(2.2, 8, 8);
      const mat = new THREE.MeshBasicMaterial({ visible: false });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(pos);
      mesh.userData = {
        name,
        desc,
        cameraPos,
        lookAtPos,
        icon,
      };
      this.scene.add(mesh);
      this.landmarks.push(mesh);
    };

    addLandmark(
      "Alpine Pine Chalet",
      "Handcrafted timber haven with panoramic mountain-view glass windows, stone chimney, and warm hearth.",
      new THREE.Vector3(-16, 4, 2),
      new THREE.Vector3(-3.5, 4.5, 9.5),
      new THREE.Vector3(-16, 3.5, 2),
      "🏡"
    );

    addLandmark(
      "Glacial River & Pier",
      "Pristine crystal-clear waters flowing from high alpine glacial springs down through the valley floor.",
      new THREE.Vector3(-2, 0.5, 3),
      new THREE.Vector3(7, 4.2, 11),
      new THREE.Vector3(-2, 0, 3),
      "🌊"
    );

    addLandmark(
      "Timber Footbridge",
      "Arched wooden bridge spanning across the river gorge connecting the meadow to the mountain trail.",
      new THREE.Vector3(2, 2.5, -22),
      new THREE.Vector3(18, 9, -10),
      new THREE.Vector3(2, 2, -22),
      "🌉"
    );

    addLandmark(
      "Eagle Peak Range",
      "Majestic granite ridges and snow-capped alpine summits reaching into the azure skies.",
      new THREE.Vector3(10, 36, -55),
      new THREE.Vector3(-25, 28, 45),
      new THREE.Vector3(10, 32, -55),
      "🏔️"
    );
  }

  onPointerDown(event) {
    // Don't trigger if right-clicking or dragging heavily
    if (event.button !== 0) return;

    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.landmarks);

    if (intersects.length > 0) {
      const data = intersects[0].object.userData;
      if (this.onSelectLandmark) {
        this.onSelectLandmark(data);
      }
      this.flyTo(data.cameraPos, data.lookAtPos);
    }
  }

  // Smooth camera fly-to transition
  flyTo(targetCamPos, targetControlsTarget) {
    this.targetCameraPos = targetCamPos.clone();
    this.targetControlsTarget = targetControlsTarget.clone();
    this.isCameraTransitioning = true;
    this.autoOrbit = false;
  }

  setCameraPreset(name) {
    const presets = {
      panorama: {
        cam: new THREE.Vector3(22, 24, 38),
        target: new THREE.Vector3(-8, 3, 2),
      },
      chalet: {
        cam: new THREE.Vector3(-5, 4.8, 8.5),
        target: new THREE.Vector3(-16, 4.0, 2.0),
      },
      river: {
        cam: new THREE.Vector3(6, 2.8, 12),
        target: new THREE.Vector3(-3.5, 0.4, 2.5),
      },
      bridge: {
        cam: new THREE.Vector3(18, 9, -10),
        target: new THREE.Vector3(2, 2.2, -22),
      },
      summit: {
        cam: new THREE.Vector3(-45, 34, 52),
        target: new THREE.Vector3(12, 18, -35),
      },
    };

    if (presets[name]) {
      this.flyTo(presets[name].cam, presets[name].target);
    }
  }

  setTimeOfDay(time) {
    if (this.environment) {
      this.environment.setTimeOfDay(time);
    }
    // Auto adjust interior light glow based on time of day
    if (this.house && this.house.windowLitMat) {
      if (time === 'night') {
        this.house.windowLitMat.emissiveIntensity = 1.35;
        if (this.house.houseInteriorLight) this.house.houseInteriorLight.intensity = 3.2;
        if (this.house.porchLight) this.house.porchLight.intensity = 2.0;
      } else if (time === 'sunset') {
        this.house.windowLitMat.emissiveIntensity = 1.05;
        if (this.house.houseInteriorLight) this.house.houseInteriorLight.intensity = 2.6;
        if (this.house.porchLight) this.house.porchLight.intensity = 1.5;
      } else {
        this.house.windowLitMat.emissiveIntensity = 0.65;
        if (this.house.houseInteriorLight) this.house.houseInteriorLight.intensity = 1.8;
        if (this.house.porchLight) this.house.porchLight.intensity = 0.9;
      }
    }
  }

  setWeather(weather) {
    if (this.environment) {
      this.environment.setWeather(weather);
    }
  }

  toggleHouseLights(enabled) {
    this.houseLightsOn = enabled;
    if (this.house) {
      if (this.house.houseInteriorLight) this.house.houseInteriorLight.visible = enabled;
      if (this.house.porchLight) this.house.porchLight.visible = enabled;
      if (this.house.windowLitMat) {
        this.house.windowLitMat.emissiveIntensity = enabled ? 1.0 : 0.05;
      }
    }
  }

  toggleSmoke(enabled) {
    if (this.environment) {
      this.environment.setSmokeActive(enabled);
    }
  }

  toggleAutoOrbit(enabled) {
    this.autoOrbit = enabled;
  }

  onWindowResize() {
    if (!this.container || !this.camera || !this.renderer) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    this.animId = requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const elapsedTime = this.clock.getElapsedTime();

    // 1. Update River Waves and Floating Elements
    if (this.river) {
      this.river.update(delta, elapsedTime);
    }

    // 2. Gently bob the rowing boat tied to the pier
    if (this.house && this.house.boat) {
      this.house.boat.position.y = -0.42 + Math.sin(elapsedTime * 2.2) * 0.04;
      this.house.boat.rotation.z = Math.sin(elapsedTime * 1.8) * 0.035;
      this.house.boat.rotation.x = Math.cos(elapsedTime * 1.5) * 0.025;
    }

    // 3. Update Environment (Clouds, Birds, Smoke, Fireflies, Rain, Sky lerp)
    if (this.environment) {
      this.environment.update(delta, elapsedTime, this.scene.fog);
    }

    // 4. Smooth Camera Animation to Target
    if (this.isCameraTransitioning && this.targetCameraPos && this.targetControlsTarget) {
      this.camera.position.lerp(this.targetCameraPos, 0.045);
      this.controls.target.lerp(this.targetControlsTarget, 0.045);

      if (this.camera.position.distanceTo(this.targetCameraPos) < 0.25 &&
          this.controls.target.distanceTo(this.targetControlsTarget) < 0.25) {
        this.isCameraTransitioning = false;
      }
    }

    // 5. Auto Orbit Mode
    if (this.autoOrbit && !this.isCameraTransitioning) {
      this.controls.autoRotate = true;
      this.controls.autoRotateSpeed = 0.85;
    } else {
      this.controls.autoRotate = false;
    }

    // 6. Update controls & render scene
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
    window.removeEventListener('resize', this.onWindowResize);
    if (this.renderer && this.renderer.domElement) {
      this.renderer.domElement.removeEventListener('pointerdown', this.onPointerDown);
      if (this.container && this.container.contains(this.renderer.domElement)) {
        this.container.removeChild(this.renderer.domElement);
      }
      this.renderer.dispose();
    }
  }
}
