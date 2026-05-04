/**
 * Shared incubator model loader — singleton cache.
 * Loads OBJ + MTL + PBR textures once; consumers call getModel()
 * which returns a Promise<THREE.Group> (the source object).
 * Each consumer should .clone(true) to get their own instance.
 */
import * as THREE from 'three';

let _promise = null;
let _cachedModel = null;

export function getModel() {
  if (_cachedModel) return Promise.resolve(_cachedModel);
  if (_promise) return _promise;

  _promise = (async () => {
    const { OBJLoader } = await import('three/examples/jsm/loaders/OBJLoader');
    const { MTLLoader } = await import('three/examples/jsm/loaders/MTLLoader');

    // Load MTL
    const mtlLoader = new MTLLoader();
    const materials = await new Promise((res, rej) =>
      mtlLoader.load('/incubator.mtl', res, undefined, rej)
    );
    materials.preload();

    // Load OBJ
    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    const obj = await new Promise((res, rej) =>
      objLoader.load('/incubator.obj', res, undefined, rej)
    );

    // Load PBR textures
    const tl = new THREE.TextureLoader();
    const lt = (p) => new Promise((r) => tl.load(p, r, undefined, () => r(null)));
    const [baseColor, normalMap, roughnessMap, metallicMap, aoMap] = await Promise.all([
      lt('/BaseColor.tga.png'),
      lt('/NormalMap.tga.png'),
      lt('/Roughness.tga.png'),
      lt('/Metallic.tga.png'),
      lt('/AO.tga.png'),
    ]);

    // Color spaces
    if (baseColor) baseColor.colorSpace = THREE.SRGBColorSpace;
    [normalMap, roughnessMap, metallicMap, aoMap].forEach((t) => {
      if (t) t.colorSpace = THREE.LinearSRGBColorSpace;
    });

    // Apply PBR materials by name
    obj.traverse((child) => {
      if (!child.isMesh) return;
      const mn = child.material?.name || '';

      if (mn === 'blinn2') {
        child.material = new THREE.MeshStandardMaterial({
          map: baseColor,
          normalMap,
          roughnessMap,
          metalnessMap: metallicMap,
          aoMap,
          side: THREE.DoubleSide,
        });
      } else if (mn === 'blinn1') {
        child.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(0.0, 0.14, 0.92),
          normalMap,
          roughness: 0.4,
          metalness: 0.3,
          side: THREE.DoubleSide,
        });
      } else {
        child.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(0.5, 0.5, 0.5),
          roughness: 0.6,
          metalness: 0.2,
          side: THREE.DoubleSide,
        });
      }
      child.castShadow = true;
      child.receiveShadow = true;
    });

    // Auto-scale & center
    const box = new THREE.Box3().setFromObject(obj);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const s = 3.0 / maxDim;
    obj.scale.set(s, s, s);
    obj.position.set(-center.x * s, -center.y * s, -center.z * s);

    _cachedModel = obj;
    return obj;
  })();

  return _promise;
}
