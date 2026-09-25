import * as THREE from 'three';
import { getTerrainHeight, getRiverX, getRiverWidth } from './terrain.js';

export function createHouse(scene) {
  const houseGroup = new THREE.Group();
  houseGroup.name = "AlpineChalet";

  // Chalet Anchor coordinates
  const hx = -16;
  const hz = 2;
  const hy = 1.3; // base elevation

  // Materials
  const stoneMat = new THREE.MeshStandardMaterial({
    color: 0x4d5054,
    roughness: 0.9,
    metalness: 0.1,
    flatShading: true,
  });

  const woodWallMat = new THREE.MeshStandardMaterial({
    color: 0x935f37, // warm cedar / pine
    roughness: 0.75,
    metalness: 0.05,
  });

  const darkWoodMat = new THREE.MeshStandardMaterial({
    color: 0x462d1a, // dark timber beams & trims
    roughness: 0.8,
  });

  const deckWoodMat = new THREE.MeshStandardMaterial({
    color: 0xb58252,
    roughness: 0.7,
  });

  const roofMat = new THREE.MeshStandardMaterial({
    color: 0x2e343b, // slate charcoal roof
    roughness: 0.6,
    metalness: 0.2,
    flatShading: true,
  });

  // Glowing window material (warm inviting interior light)
  const windowLitMat = new THREE.MeshStandardMaterial({
    color: 0xffd99b,
    emissive: 0xffa034,
    emissiveIntensity: 0.85,
    roughness: 0.2,
    metalness: 0.1,
  });

  const chimneyMat = new THREE.MeshStandardMaterial({
    color: 0x3d3f43,
    roughness: 0.95,
    flatShading: true,
  });

  // 1. Foundation Plinth
  const foundationGeo = new THREE.BoxGeometry(8.2, 1.4, 9.8);
  const foundation = new THREE.Mesh(foundationGeo, stoneMat);
  foundation.position.set(hx, hy + 0.6, hz);
  foundation.castShadow = true;
  foundation.receiveShadow = true;
  houseGroup.add(foundation);

  // 2. Main Floor Walls
  const mainFloorGeo = new THREE.BoxGeometry(7.4, 3.4, 8.8);
  const mainFloor = new THREE.Mesh(mainFloorGeo, woodWallMat);
  mainFloor.position.set(hx, hy + 1.4 + 1.7, hz);
  mainFloor.castShadow = true;
  mainFloor.receiveShadow = true;
  houseGroup.add(mainFloor);

  // Corner Timber Beams
  const beamGeo = new THREE.BoxGeometry(0.4, 3.5, 0.4);
  const beamOffsets = [
    [-3.7, 0, -4.4], [3.7, 0, -4.4],
    [-3.7, 0, 4.4], [3.7, 0, 4.4]
  ];
  beamOffsets.forEach(pos => {
    const beam = new THREE.Mesh(beamGeo, darkWoodMat);
    beam.position.set(hx + pos[0], hy + 3.1, hz + pos[2]);
    beam.castShadow = true;
    houseGroup.add(beam);
  });

  // 3. Second Floor Gabled Loft
  const loftGeo = new THREE.BoxGeometry(6.6, 2.6, 7.8);
  const loft = new THREE.Mesh(loftGeo, woodWallMat);
  loft.position.set(hx, hy + 1.4 + 3.4 + 1.3, hz);
  loft.castShadow = true;
  loft.receiveShadow = true;
  houseGroup.add(loft);

  // Gabled Roof End Triangles (Prisms)
  const roofApexHeight = 3.2;

  // Front & Back Gable Triangles
  const gableShape = new THREE.Shape();
  gableShape.moveTo(-3.4, 0);
  gableShape.lineTo(3.4, 0);
  gableShape.lineTo(0, roofApexHeight);
  gableShape.closePath();

  const gableExtrudeSettings = { depth: 0.35, bevelEnabled: false };
  const gableFrontGeo = new THREE.ExtrudeGeometry(gableShape, gableExtrudeSettings);
  
  const gableFront = new THREE.Mesh(gableFrontGeo, woodWallMat);
  gableFront.position.set(hx, hy + 7.4, hz + 3.8);
  gableFront.castShadow = true;
  houseGroup.add(gableFront);

  const gableBack = new THREE.Mesh(gableFrontGeo, woodWallMat);
  gableBack.position.set(hx, hy + 7.4, hz - 4.15);
  gableBack.castShadow = true;
  houseGroup.add(gableBack);

  // Roof Slabs (Overhanging Slanted Roof)
  const roofHalfWidth = 5.2;
  const roofLength = 10.4;
  const roofThickness = 0.25;

  const roofPanelGeo = new THREE.BoxGeometry(roofHalfWidth, roofThickness, roofLength);

  // Left roof slope
  const roofLeft = new THREE.Mesh(roofPanelGeo, roofMat);
  roofLeft.position.set(hx - 1.85, hy + 8.6, hz);
  roofLeft.rotation.z = Math.PI * 0.23;
  roofLeft.castShadow = true;
  roofLeft.receiveShadow = true;
  houseGroup.add(roofLeft);

  // Right roof slope
  const roofRight = new THREE.Mesh(roofPanelGeo, roofMat);
  roofRight.position.set(hx + 1.85, hy + 8.6, hz);
  roofRight.rotation.z = -Math.PI * 0.23;
  roofRight.castShadow = true;
  roofRight.receiveShadow = true;
  houseGroup.add(roofRight);

  // Ridge cap
  const ridgeGeo = new THREE.BoxGeometry(0.5, 0.4, roofLength + 0.2);
  const ridgeCap = new THREE.Mesh(ridgeGeo, darkWoodMat);
  ridgeCap.position.set(hx, hy + 10.5, hz);
  houseGroup.add(ridgeCap);

  // 4. Windows & Entrance Door
  // Front large panoramic windows facing river (+X direction)
  const largeWindowGeo = new THREE.BoxGeometry(0.15, 2.2, 3.2);
  const largeWindow = new THREE.Mesh(largeWindowGeo, windowLitMat);
  largeWindow.position.set(hx + 3.72, hy + 3.0, hz + 1.0);
  houseGroup.add(largeWindow);

  // Window mullions (frame)
  const frameMat = darkWoodMat;
  const frameH = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.1, 3.3), frameMat);
  frameH.position.set(hx + 3.74, hy + 3.0, hz + 1.0);
  houseGroup.add(frameH);
  const frameV = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.3, 0.1), frameMat);
  frameV.position.set(hx + 3.74, hy + 3.0, hz + 1.0);
  houseGroup.add(frameV);

  // Front entrance door
  const doorGeo = new THREE.BoxGeometry(0.18, 2.3, 1.3);
  const door = new THREE.Mesh(doorGeo, darkWoodMat);
  door.position.set(hx + 3.73, hy + 2.5, hz - 2.2);
  door.castShadow = true;
  houseGroup.add(door);

  // Door knob
  const knobGeo = new THREE.SphereGeometry(0.06, 6, 6);
  const knobMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.3 });
  const knob = new THREE.Mesh(knobGeo, knobMat);
  knob.position.set(hx + 3.84, hy + 2.4, hz - 1.8);
  houseGroup.add(knob);

  // Porch lantern near door
  const lanternPost = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4), darkWoodMat);
  lanternPost.position.set(hx + 3.82, hy + 3.8, hz - 1.3);
  houseGroup.add(lanternPost);

  const lanternGlass = new THREE.Mesh(new THREE.DodecahedronGeometry(0.14), windowLitMat);
  lanternGlass.position.set(hx + 3.85, hy + 3.65, hz - 1.3);
  houseGroup.add(lanternGlass);

  // Second floor balcony & window
  const balconyWindowGeo = new THREE.BoxGeometry(0.15, 1.6, 2.2);
  const balconyWindow = new THREE.Mesh(balconyWindowGeo, windowLitMat);
  balconyWindow.position.set(hx + 3.32, hy + 6.4, hz);
  houseGroup.add(balconyWindow);

  // Balcony deck
  const bDeckGeo = new THREE.BoxGeometry(1.6, 0.15, 3.4);
  const bDeck = new THREE.Mesh(bDeckGeo, deckWoodMat);
  bDeck.position.set(hx + 4.0, hy + 5.5, hz);
  bDeck.castShadow = true;
  houseGroup.add(bDeck);

  // Balcony Railing
  const bRailFront = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.9, 3.4), darkWoodMat);
  bRailFront.position.set(hx + 4.75, hy + 6.0, hz);
  houseGroup.add(bRailFront);

  // Flower Box under window
  const flowerBoxGeo = new THREE.BoxGeometry(0.4, 0.3, 1.8);
  const flowerBox = new THREE.Mesh(flowerBoxGeo, darkWoodMat);
  flowerBox.position.set(hx + 4.7, hy + 5.9, hz);
  houseGroup.add(flowerBox);

  // Colorful flowers in balcony box
  const bFlowerMat = new THREE.MeshStandardMaterial({ color: 0xff4d6d, roughness: 0.5 });
  for (let i = -0.7; i <= 0.7; i += 0.35) {
    const flower = new THREE.Mesh(new THREE.SphereGeometry(0.12, 5, 5), bFlowerMat);
    flower.position.set(hx + 4.7, hy + 6.15, hz + i);
    houseGroup.add(flower);
  }

  // 5. Wrap-Around Porch & River Viewing Deck
  const deckGeo = new THREE.BoxGeometry(4.2, 0.3, 11.2);
  const deck = new THREE.Mesh(deckGeo, deckWoodMat);
  deck.position.set(hx + 4.8, hy + 1.25, hz + 0.6);
  deck.receiveShadow = true;
  deck.castShadow = true;
  houseGroup.add(deck);

  // Deck steps leading down to lawn
  for (let s = 1; s <= 3; s++) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.2, 2.2), deckWoodMat);
    step.position.set(hx + 6.8 + (s - 1) * 0.4, hy + 1.25 - s * 0.3, hz - 2.2);
    step.receiveShadow = true;
    houseGroup.add(step);
  }

  // Deck Railings
  const dRailGeo = new THREE.BoxGeometry(0.1, 0.8, 11.0);
  const dRail = new THREE.Mesh(dRailGeo, darkWoodMat);
  dRail.position.set(hx + 6.8, hy + 1.75, hz + 0.6);
  houseGroup.add(dRail);

  // Lounge Chairs on the deck
  createDeckChairs(houseGroup, hx + 5.2, hy + 1.4, hz + 2.2);

  // 6. Stone Chimney & Smoke Pot
  const chimneyBase = new THREE.Mesh(new THREE.BoxGeometry(1.4, 8.5, 1.4), chimneyMat);
  chimneyBase.position.set(hx - 3.8, hy + 4.5, hz - 1.2);
  chimneyBase.castShadow = true;
  chimneyBase.receiveShadow = true;
  houseGroup.add(chimneyBase);

  const chimneyCap = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 0.7, 8), chimneyMat);
  chimneyCap.position.set(hx - 3.8, hy + 9.0, hz - 1.2);
  houseGroup.add(chimneyCap);

  // Chimney Smoke position
  const smokePosition = new THREE.Vector3(hx - 3.8, hy + 9.5, hz - 1.2);

  // 7. Interior Warm Light (Glows out onto deck)
  const houseInteriorLight = new THREE.PointLight(0xffa238, 2.4, 18, 1.2);
  houseInteriorLight.position.set(hx + 1.5, hy + 3.2, hz + 0.5);
  houseInteriorLight.castShadow = true;
  houseInteriorLight.shadow.bias = -0.002;
  houseGroup.add(houseInteriorLight);

  const porchLight = new THREE.PointLight(0xff9922, 1.2, 8, 1.5);
  porchLight.position.set(hx + 4.0, hy + 3.5, hz - 1.3);
  houseGroup.add(porchLight);

  // 8. Stone Stepping Pathway to River
  createSteppingStones(houseGroup, hx + 7.5, hz - 2.2);

  // 9. River Pier & Wooden Rowing Boat
  const { boat } = createPierAndBoat(houseGroup);

  // 10. Alpine Timber Bridge
  createAlpineBridge(scene);

  scene.add(houseGroup);

  return {
    houseGroup,
    smokePosition,
    houseInteriorLight,
    porchLight,
    boat,
    windowLitMat,
  };
}

function createDeckChairs(parentGroup, cx, cy, cz) {
  const woodMat = new THREE.MeshStandardMaterial({ color: 0x9e6c46, roughness: 0.7 });
  const chairGroup = new THREE.Group();

  // Chair 1
  const seat1 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.08, 0.8), woodMat);
  seat1.position.set(0, 0.4, 0);
  const back1 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.9, 0.08), woodMat);
  back1.position.set(0, 0.8, -0.36);
  back1.rotation.x = -0.2;
  chairGroup.add(seat1);
  chairGroup.add(back1);

  // Chair 2
  const chair2 = chairGroup.clone();
  chair2.position.set(0, 0, 1.4);

  // Small Coffee table
  const table = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.45, 8), woodMat);
  table.position.set(0.1, 0.22, 0.7);

  const combined = new THREE.Group();
  combined.add(chairGroup);
  combined.add(chair2);
  combined.add(table);

  combined.position.set(cx, cy, cz);
  combined.rotation.y = -Math.PI * 0.45;
  parentGroup.add(combined);
}

function createSteppingStones(parentGroup) {
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0x6e7379, roughness: 0.9, flatShading: true });
  const stoneGeo = new THREE.CylinderGeometry(0.5, 0.6, 0.12, 7);

  // Pathway points leading to river pier at x: -4, z: 2
  const points = [
    { x: -8.0, z: -1.5 },
    { x: -7.0, z: -0.5 },
    { x: -6.2, z: 0.5 },
    { x: -5.4, z: 1.2 },
    { x: -4.5, z: 1.8 }
  ];

  points.forEach((pt, idx) => {
    const y = getTerrainHeight(pt.x, pt.z);
    const stone = new THREE.Mesh(stoneGeo, stoneMat);
    stone.position.set(pt.x, y + 0.05, pt.z);
    stone.rotation.y = idx * 1.3;
    stone.scale.set(0.8 + Math.random() * 0.4, 1, 0.8 + Math.random() * 0.4);
    stone.receiveShadow = true;
    parentGroup.add(stone);
  });
}

function createPierAndBoat(parentGroup) {
  const pierWood = new THREE.MeshStandardMaterial({ color: 0x5a412c, roughness: 0.85 });

  // Pier positioned over river edge
  const pierGroup = new THREE.Group();
  const px = -3.8;
  const pz = 2.2;
  const py = -0.15; // slightly above water surface

  // Wooden deck planks
  const deck = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.14, 1.8), pierWood);
  deck.position.set(px, py, pz);
  deck.receiveShadow = true;
  pierGroup.add(deck);

  // Wooden piles / posts into river bottom
  const postGeo = new THREE.CylinderGeometry(0.12, 0.12, 2.5, 6);
  const postPositions = [
    [-1.8, -1.0, -0.7], [-1.8, -1.0, 0.7],
    [0.0, -1.0, -0.7], [0.0, -1.0, 0.7],
    [1.8, -1.0, -0.7], [1.8, -1.0, 0.7]
  ];
  postPositions.forEach(pos => {
    const post = new THREE.Mesh(postGeo, pierWood);
    post.position.set(px + pos[0], py + pos[1], pz + pos[2]);
    pierGroup.add(post);
  });

  // Small Rowing Boat tied to pier
  const boatGroup = new THREE.Group();
  boatGroup.name = "RowingBoat";
  const boatMat = new THREE.MeshStandardMaterial({ color: 0x8a5229, roughness: 0.7 });

  // Hull
  const hullGeo = new THREE.BoxGeometry(2.8, 0.7, 1.3);
  const hull = new THREE.Mesh(hullGeo, boatMat);
  hull.position.y = 0.1;
  boatGroup.add(hull);

  // Boat interior cutout (illusion)
  const innerMat = new THREE.MeshStandardMaterial({ color: 0x3d2411, roughness: 0.8 });
  const inner = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.65, 1.05), innerMat);
  inner.position.y = 0.18;
  boatGroup.add(inner);

  // Benches
  const benchMat = new THREE.MeshStandardMaterial({ color: 0xb37746, roughness: 0.7 });
  const bench1 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.08, 1.05), benchMat);
  bench1.position.set(-0.6, 0.28, 0);
  boatGroup.add(bench1);
  const bench2 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.08, 1.05), benchMat);
  bench2.position.set(0.6, 0.28, 0);
  boatGroup.add(bench2);

  // Oars
  const oarGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.6, 6);
  const oar1 = new THREE.Mesh(oarGeo, benchMat);
  oar1.position.set(-0.1, 0.45, 0.7);
  oar1.rotation.set(0.3, 0.4, 0.5);
  boatGroup.add(oar1);

  // Position boat in water near pier
  boatGroup.position.set(px + 2.4, -0.4, pz + 1.2);
  boatGroup.rotation.y = 0.2;
  pierGroup.add(boatGroup);

  parentGroup.add(pierGroup);

  return { boat: boatGroup };
}

function createAlpineBridge(scene) {
  const bridgeGroup = new THREE.Group();
  bridgeGroup.name = "AlpineTimberBridge";

  const bridgeZ = -22;
  const rx = getRiverX(bridgeZ);
  const rw = getRiverWidth(bridgeZ);

  // Span from west bank to east bank
  const spanStart = rx - (rw * 0.75);
  const spanEnd = rx + (rw * 0.75);

  const bridgeWood = new THREE.MeshStandardMaterial({ color: 0x6e4b2d, roughness: 0.8, flatShading: true });
  const darkTrim = new THREE.MeshStandardMaterial({ color: 0x3d2714, roughness: 0.85 });

  // Arched walkway planks
  const plankCount = 28;
  for (let i = 0; i <= plankCount; i++) {
    const t = i / plankCount;
    const x = THREE.MathUtils.lerp(spanStart, spanEnd, t);
    // Subtle arch
    const archH = Math.sin(t * Math.PI) * 1.4;
    const y = 0.5 + archH;

    const plank = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.15, 2.6), bridgeWood);
    plank.position.set(x, y, bridgeZ);
    // Rotate to match arch tangent
    const tangentAngle = -Math.cos(t * Math.PI) * 0.18;
    plank.rotation.z = tangentAngle;
    plank.castShadow = true;
    plank.receiveShadow = true;
    bridgeGroup.add(plank);

    // Railing posts
    if (i % 4 === 0) {
      const post1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.1, 0.12), darkTrim);
      post1.position.set(x, y + 0.55, bridgeZ - 1.25);
      bridgeGroup.add(post1);

      const post2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.1, 0.12), darkTrim);
      post2.position.set(x, y + 0.55, bridgeZ + 1.25);
      bridgeGroup.add(post2);
    }
  }

  // Support Pillars in the river
  const pillarGeo = new THREE.CylinderGeometry(0.25, 0.25, 4.2, 6);
  [-2.5, 2.5].forEach(offsetX => {
    const px = rx + offsetX;
    const p1 = new THREE.Mesh(pillarGeo, bridgeWood);
    p1.position.set(px, -0.6, bridgeZ - 0.9);
    p1.castShadow = true;
    bridgeGroup.add(p1);

    const p2 = new THREE.Mesh(pillarGeo, bridgeWood);
    p2.position.set(px, -0.6, bridgeZ + 0.9);
    p2.castShadow = true;
    bridgeGroup.add(p2);
  });

  scene.add(bridgeGroup);
}
