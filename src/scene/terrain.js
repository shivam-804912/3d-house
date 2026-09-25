import * as THREE from 'three';
import { noise } from './noise.js';

// River centerline formula
export function getRiverX(z) {
  // S-curve river meandering through the valley
  return 14 * Math.sin(z * 0.028) + 6 * Math.cos(z * 0.052) + 2;
}

export function getRiverWidth(z) {
  return 12 + 3 * Math.sin(z * 0.04);
}

// Terrain elevation function
export function getTerrainHeight(x, z) {
  const rx = getRiverX(z);
  const rw = getRiverWidth(z);
  const distToRiver = Math.abs(x - rx);

  // 1. Mountain Factor based on distance from center and north/east positioning
  // North (negative z) has massive majestic peaks
  // East (positive x) and West (negative x) have flanking mountain ranges
  const distFromCenter = Math.sqrt(x * x + z * z);
  
  // House plateau clearing (around x: -16, z: 0)
  const distToChalet = Math.hypot(x - (-16), z - 2);
  const chaletPlateau = Math.max(0, 1 - distToChalet / 24);

  // Mountain masks
  const northMountain = Math.max(0, (-z - 15) / 95);
  const eastMountain = Math.max(0, (x - 25) / 85);
  const westMountain = Math.max(0, (-x - 30) / 80);
  const perimeterWeight = Math.max(0, (distFromCenter - 45) / 75);

  const mountainMask = Math.min(1.0, Math.max(northMountain * 1.3, eastMountain, westMountain, perimeterWeight));

  // Base rolling hills
  let h = noise.fbm(x * 0.015, z * 0.015, 4) * 8;

  // Dramatic mountain ridges
  if (mountainMask > 0.01) {
    const ridges = noise.ridgeFbm(x * 0.022 + 10, z * 0.022 + 10, 5, 2.1, 0.55);
    const peaks = noise.fbm(x * 0.035, z * 0.035, 4) * 0.5 + 0.5;
    const mountainElevation = (ridges * 42 + peaks * 18) * mountainMask;
    h += mountainElevation;
  }

  // Flatten / elevate the chalet clearing
  if (chaletPlateau > 0) {
    const flatTarget = 1.3;
    h = THREE.MathUtils.lerp(h, flatTarget, Math.pow(chaletPlateau, 1.8));
  }

  // 2. River carving
  if (distToRiver < rw + 10) {
    const t = distToRiver / rw;
    if (t < 1.0) {
      // Inside river trench
      const bedDepth = -2.4 + Math.sin(x * 0.5 + z * 0.3) * 0.2;
      const bankSmooth = Math.sin((t * Math.PI) / 2);
      h = THREE.MathUtils.lerp(bedDepth, -0.6, bankSmooth);
    } else {
      // River bank sloping up to the valley
      const bankFactor = (distToRiver - rw) / 10;
      const smoothBank = Math.sin((bankFactor * Math.PI) / 2);
      h = THREE.MathUtils.lerp(-0.6, h, smoothBank);
    }
  }

  return h;
}

export function createTerrain(scene) {
  const terrainGroup = new THREE.Group();
  terrainGroup.name = "TerrainGroup";

  // High quality subdivided plane
  const width = 260;
  const depth = 260;
  const segments = 160;

  const geometry = new THREE.PlaneGeometry(width, depth, segments, segments);
  geometry.rotateX(-Math.PI / 2);

  const pos = geometry.attributes.position;
  const colors = [];

  // Color palette
  const cRiverBed = new THREE.Color(0x353b32);
  const cWetSand = new THREE.Color(0x5a5d4b);
  const cGrassDeep = new THREE.Color(0x35662a);
  const cGrassLight = new THREE.Color(0x4c8a37);
  const cGrassMeadow = new THREE.Color(0x609c48);
  const cRockDark = new THREE.Color(0x4e5358);
  const cRockLight = new THREE.Color(0x737980);
  const cSnowShadow = new THREE.Color(0xdce6f2);
  const cSnowPeak = new THREE.Color(0xfbfdff);

  // Apply heightmap and compute colors
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const y = getTerrainHeight(x, z);
    pos.setY(i, y);
  }

  // Compute normals for lighting and slope detection
  geometry.computeVertexNormals();
  const norm = geometry.attributes.normal;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const ny = norm.getY(i); // slope factor (1 = flat, 0 = vertical cliff)

    const rx = getRiverX(z);
    const rw = getRiverWidth(z);
    const distToRiver = Math.abs(x - rx);

    const vertexColor = new THREE.Color();

    if (y < -1.0) {
      // River bottom
      vertexColor.copy(cRiverBed);
    } else if (y < 0.2 || distToRiver < rw + 2.0) {
      // Moist river shoreline
      const t = Math.min(1, Math.max(0, (y + 1.0) / 1.2));
      vertexColor.copy(cRiverBed).lerp(cWetSand, t);
    } else if (y < 18.0) {
      // Grassy valley & foothills
      const grassNoise = noise.noise2D(x * 0.15, z * 0.15) * 0.5 + 0.5;
      const gColor = grassNoise > 0.5 ? cGrassLight : cGrassDeep;
      vertexColor.copy(gColor).lerp(cGrassMeadow, grassNoise * 0.4);

      // On steep hillsides, blend rock
      if (ny < 0.72) {
        const rockFactor = Math.min(1, (0.72 - ny) / 0.25);
        vertexColor.lerp(cRockDark, rockFactor);
      }
    } else if (y < 28.0) {
      // Mountain rock face transitioning to snow
      const t = (y - 18.0) / 10.0;
      const rockNoise = noise.noise2D(x * 0.2, z * 0.2) * 0.5 + 0.5;
      const rColor = rockNoise > 0.5 ? cRockLight : cRockDark;
      vertexColor.copy(rColor);

      // Snow on flatter rock ledges
      if (ny > 0.75) {
        vertexColor.lerp(cSnowShadow, t * 0.7);
      }
    } else {
      // Snow-capped alpine summits
      const t = Math.min(1, (y - 28.0) / 12.0);
      if (ny < 0.6) {
        // Exposed rock crags on sheer cliff peaks
        vertexColor.copy(cRockLight).lerp(cSnowShadow, 0.4);
      } else {
        vertexColor.copy(cSnowShadow).lerp(cSnowPeak, t);
      }
    }

    colors.push(vertexColor.r, vertexColor.g, vertexColor.b);
  }

  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.88,
    metalness: 0.08,
    flatShading: true,
  });

  const terrainMesh = new THREE.Mesh(geometry, material);
  terrainMesh.receiveShadow = true;
  terrainMesh.castShadow = false;
  terrainGroup.add(terrainMesh);

  // Add rich foliage: Trees, Rocks, Wildflowers
  populateFoliage(terrainGroup);

  scene.add(terrainGroup);
  return { terrainGroup, terrainMesh };
}

// Populate trees, rocks, and flowers
function populateFoliage(parentGroup) {
  // 1. Pine Trees (Evergreens)
  createPineTrees(parentGroup);

  // 2. Aspen / Birch Trees
  createBirchTrees(parentGroup);

  // 3. River Boulders & Shore Rocks
  createRiverRocks(parentGroup);

  // 4. Wildflowers in meadow
  createWildflowers(parentGroup);
}

function createPineTrees(parentGroup) {
  // Low-poly stylish pine tree geometry
  const pineTrunkGeo = new THREE.CylinderGeometry(0.2, 0.35, 1.8, 6);
  const pineTrunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3525, roughness: 0.9 });

  const f1Geo = new THREE.ConeGeometry(1.9, 2.5, 6);
  const f2Geo = new THREE.ConeGeometry(1.5, 2.2, 6);
  const f3Geo = new THREE.ConeGeometry(1.0, 1.8, 6);
  const foliageMat1 = new THREE.MeshStandardMaterial({ color: 0x224720, roughness: 0.85, flatShading: true });
  const foliageMat2 = new THREE.MeshStandardMaterial({ color: 0x1b3b1a, roughness: 0.85, flatShading: true });
  const foliageMat3 = new THREE.MeshStandardMaterial({ color: 0x2d592a, roughness: 0.85, flatShading: true });

  const treeGroup = new THREE.Group();

  // Scatter 240 pine trees along hillsides and foothills
  const treeCount = 240;
  let placed = 0;
  let attempts = 0;

  while (placed < treeCount && attempts < 900) {
    attempts++;
    const x = (Math.random() - 0.5) * 220;
    const z = (Math.random() - 0.5) * 220;

    const rx = getRiverX(z);
    const rw = getRiverWidth(z);
    const distToRiver = Math.abs(x - rx);

    // Keep clear of river
    if (distToRiver < rw + 4) continue;

    // Keep clear of house and immediate lawn
    const distToHouse = Math.hypot(x - (-16), z - 2);
    if (distToHouse < 14) continue;

    // Get terrain height
    const y = getTerrainHeight(x, z);

    // Pine trees grow between y = 1.0 and y = 24.0 (below severe snowline)
    if (y < 1.0 || y > 24.0) continue;

    const scale = 0.8 + Math.random() * 0.7;
    const rot = Math.random() * Math.PI * 2;

    const singleTree = new THREE.Group();

    // Trunk
    const trunk = new THREE.Mesh(pineTrunkGeo, pineTrunkMat);
    trunk.position.y = 0.9 * scale;
    trunk.scale.set(scale, scale, scale);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    singleTree.add(trunk);

    // Foliage layers
    const fMat = placed % 3 === 0 ? foliageMat1 : placed % 3 === 1 ? foliageMat2 : foliageMat3;

    const cone1 = new THREE.Mesh(f1Geo, fMat);
    cone1.position.y = 2.0 * scale;
    cone1.scale.set(scale, scale, scale);
    cone1.castShadow = true;
    singleTree.add(cone1);

    const cone2 = new THREE.Mesh(f2Geo, fMat);
    cone2.position.y = 3.2 * scale;
    cone2.scale.set(scale, scale, scale);
    cone2.castShadow = true;
    singleTree.add(cone2);

    const cone3 = new THREE.Mesh(f3Geo, fMat);
    cone3.position.y = 4.2 * scale;
    cone3.scale.set(scale, scale, scale);
    cone3.castShadow = true;
    singleTree.add(cone3);

    singleTree.position.set(x, y - 0.2, z);
    singleTree.rotation.y = rot;
    singleTree.rotation.x = (Math.random() - 0.5) * 0.08;
    singleTree.rotation.z = (Math.random() - 0.5) * 0.08;

    treeGroup.add(singleTree);
    placed++;
  }

  parentGroup.add(treeGroup);
}

function createBirchTrees(parentGroup) {
  const trunkGeo = new THREE.CylinderGeometry(0.18, 0.28, 3.2, 5);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0xdcd8cf, roughness: 0.9 });
  const leavesGeo = new THREE.DodecahedronGeometry(1.6, 1);
  const leavesMat = new THREE.MeshStandardMaterial({ color: 0x6da83b, roughness: 0.8, flatShading: true });
  const leavesMatAutumn = new THREE.MeshStandardMaterial({ color: 0x94b33c, roughness: 0.8, flatShading: true });

  const birchGroup = new THREE.Group();
  let placed = 0;
  let attempts = 0;

  while (placed < 50 && attempts < 400) {
    attempts++;
    const x = (Math.random() - 0.5) * 160;
    const z = (Math.random() - 0.5) * 160;

    const rx = getRiverX(z);
    const rw = getRiverWidth(z);
    const distToRiver = Math.abs(x - rx);

    if (distToRiver < rw + 3.5) continue;
    const distToHouse = Math.hypot(x - (-16), z - 2);
    if (distToHouse < 11) continue;

    const y = getTerrainHeight(x, z);
    if (y < 0.8 || y > 15.0) continue;

    const scale = 0.75 + Math.random() * 0.5;
    const tree = new THREE.Group();

    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1.6 * scale;
    trunk.scale.set(scale, scale, scale);
    trunk.castShadow = true;
    tree.add(trunk);

    const mat = placed % 2 === 0 ? leavesMat : leavesMatAutumn;
    const foliage = new THREE.Mesh(leavesGeo, mat);
    foliage.position.y = 3.6 * scale;
    foliage.scale.set(scale * 1.1, scale * 1.3, scale * 1.1);
    foliage.castShadow = true;
    tree.add(foliage);

    tree.position.set(x, y - 0.2, z);
    tree.rotation.y = Math.random() * Math.PI * 2;
    birchGroup.add(tree);
    placed++;
  }

  parentGroup.add(birchGroup);
}

function createRiverRocks(parentGroup) {
  const rockGeo = new THREE.DodecahedronGeometry(1, 1);
  const rockMatDark = new THREE.MeshStandardMaterial({ color: 0x484c50, roughness: 0.85, flatShading: true });
  const rockMatMossy = new THREE.MeshStandardMaterial({ color: 0x565c4c, roughness: 0.9, flatShading: true });

  const rockGroup = new THREE.Group();

  // Place rocks along both banks of the river
  for (let z = -110; z < 110; z += 3.5) {
    const rx = getRiverX(z);
    const rw = getRiverWidth(z);

    // Left and right bank points
    const side = Math.random() > 0.5 ? 1 : -1;
    const offset = rw * 0.85 * side + (Math.random() - 0.5) * 3;
    const x = rx + offset;
    const y = getTerrainHeight(x, z);

    if (Math.random() > 0.4) {
      const rock = new THREE.Mesh(rockGeo, Math.random() > 0.5 ? rockMatDark : rockMatMossy);
      const s = 0.4 + Math.random() * 0.9;
      rock.scale.set(s * (0.8 + Math.random() * 0.4), s * 0.6, s * (0.8 + Math.random() * 0.4));
      rock.position.set(x, y + 0.1, z);
      rock.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      rock.castShadow = true;
      rock.receiveShadow = true;
      rockGroup.add(rock);
    }
  }

  // A few large boulders in mountain foothills
  for (let i = 0; i < 25; i++) {
    const x = (Math.random() - 0.5) * 180;
    const z = (Math.random() - 0.5) * 180;
    const y = getTerrainHeight(x, z);
    if (y > 4 && y < 22) {
      const boulder = new THREE.Mesh(rockGeo, rockMatDark);
      const s = 1.4 + Math.random() * 2.2;
      boulder.scale.set(s, s * 0.8, s * 1.2);
      boulder.position.set(x, y - 0.3, z);
      boulder.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      boulder.castShadow = true;
      boulder.receiveShadow = true;
      rockGroup.add(boulder);
    }
  }

  parentGroup.add(rockGroup);
}

function createWildflowers(parentGroup) {
  const flowerGeo = new THREE.SphereGeometry(0.12, 4, 4);
  const redMat = new THREE.MeshStandardMaterial({ color: 0xe04343, roughness: 0.5 });
  const yellowMat = new THREE.MeshStandardMaterial({ color: 0xf5b722, roughness: 0.5 });
  const purpleMat = new THREE.MeshStandardMaterial({ color: 0x935cd8, roughness: 0.5 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8f9fa, roughness: 0.5 });

  const flowerGroup = new THREE.Group();

  // Clusters of flowers around house meadow
  const clusters = [
    { cx: -12, cz: 9, r: 5 },
    { cx: -21, cz: 7, r: 6 },
    { cx: -9, cz: -6, r: 4 },
    { cx: -18, cz: -8, r: 5 },
    { cx: -6, cz: 2, r: 3 },
  ];

  clusters.forEach(c => {
    const count = 40;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * c.r;
      const x = c.cx + Math.cos(angle) * dist;
      const z = c.cz + Math.sin(angle) * dist;
      const y = getTerrainHeight(x, z);

      if (y > 0.5) {
        const mat = Math.random() < 0.35 ? redMat : Math.random() < 0.6 ? purpleMat : Math.random() < 0.8 ? yellowMat : whiteMat;
        const fl = new THREE.Mesh(flowerGeo, mat);
        fl.position.set(x, y + 0.14, z);
        fl.scale.set(1, 1.4, 1);
        flowerGroup.add(fl);
      }
    }
  });

  parentGroup.add(flowerGroup);
}
