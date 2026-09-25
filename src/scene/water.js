import * as THREE from 'three';
import { getRiverX, getRiverWidth } from './terrain.js';

export function createRiver(scene) {
  const riverGroup = new THREE.Group();
  riverGroup.name = "RiverWaterSystem";

  // Build a custom curved ribbon geometry conforming exactly to the river centerline
  const zSegments = 160;
  const xSegments = 24;
  const zMin = -125;
  const zMax = 125;

  const geometry = new THREE.PlaneGeometry(1, 1, xSegments, zSegments);
  const pos = geometry.attributes.position;

  // Store original local coordinates for animation
  const origPos = new Float32Array(pos.count * 3);

  for (let iz = 0; iz <= zSegments; iz++) {
    const tz = iz / zSegments;
    const z = THREE.MathUtils.lerp(zMin, zMax, tz);
    const rx = getRiverX(z);
    const rw = getRiverWidth(z);

    for (let ix = 0; ix <= xSegments; ix++) {
      const tx = (ix / xSegments) - 0.5; // -0.5 to 0.5 across river width
      const x = rx + tx * rw * 1.08;     // slight tuck into bank
      const y = -0.42;                    // water surface level

      const index = iz * (xSegments + 1) + ix;
      pos.setXYZ(index, x, y, z);

      origPos[index * 3] = x;
      origPos[index * 3 + 1] = y;
      origPos[index * 3 + 2] = z;
    }
  }

  geometry.computeVertexNormals();

  // Water Material: Clear Glacial Alpine Water
  const waterMaterial = new THREE.MeshStandardMaterial({
    color: 0x2288a2,
    roughness: 0.12,
    metalness: 0.18,
    transparent: true,
    opacity: 0.84,
    flatShading: false,
  });

  const riverMesh = new THREE.Mesh(geometry, waterMaterial);
  riverMesh.receiveShadow = true;
  riverGroup.add(riverMesh);

  // Floating river foam / sparkles along the current
  const foamCount = 60;
  const foamGeo = new THREE.CircleGeometry(0.22, 6);
  foamGeo.rotateX(-Math.PI / 2);
  const foamMat = new THREE.MeshBasicMaterial({
    color: 0xe6f7ff,
    transparent: true,
    opacity: 0.65,
    depthWrite: false,
  });

  const foamParticles = [];
  for (let i = 0; i < foamCount; i++) {
    const fMesh = new THREE.Mesh(foamGeo, foamMat);
    const z = THREE.MathUtils.lerp(zMin, zMax, Math.random());
    const rx = getRiverX(z);
    const rw = getRiverWidth(z);
    const x = rx + (Math.random() - 0.5) * rw * 0.7;
    fMesh.position.set(x, -0.38, z);
    riverGroup.add(fMesh);

    foamParticles.push({
      mesh: fMesh,
      speed: 4.5 + Math.random() * 3.5,
      zOffset: Math.random() * rw * 0.6,
    });
  }

  scene.add(riverGroup);

  return {
    riverGroup,
    riverMesh,
    waterMaterial,
    update: (delta, time) => {
      // 1. Procedural water waves
      const positionAttr = geometry.attributes.position;
      for (let i = 0; i < positionAttr.count; i++) {
        const ox = origPos[i * 3];
        const oy = origPos[i * 3 + 1];
        const oz = origPos[i * 3 + 2];

        // Multi-frequency wave formula
        const wave1 = Math.sin(ox * 0.75 + time * 3.2 + oz * 0.15) * 0.06;
        const wave2 = Math.cos(oz * 0.45 - time * 2.8 + ox * 0.3) * 0.05;
        const wave3 = Math.sin((ox + oz) * 0.6 + time * 4.0) * 0.03;

        positionAttr.setY(i, oy + wave1 + wave2 + wave3);
      }
      positionAttr.needsUpdate = true;
      geometry.computeVertexNormals();

      // 2. Animate floating foam downstream
      foamParticles.forEach(fp => {
        fp.mesh.position.z += fp.speed * delta;
        if (fp.mesh.position.z > zMax) {
          fp.mesh.position.z = zMin;
        }
        const curZ = fp.mesh.position.z;
        const curRx = getRiverX(curZ);
        fp.mesh.position.x = curRx + fp.zOffset;
        // Bob with wave
        fp.mesh.position.y = -0.37 + Math.sin(curZ * 0.3 + time * 3) * 0.04;
      });
    },
  };
}
