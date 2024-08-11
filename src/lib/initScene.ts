import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import Stats from "three/examples/jsm/libs/stats.module.js";

export const SceneInit = (canvaId: string) => {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(50, 1600 / 900, 1, 1000);
  camera.position.z = 96;

  const canvas = document.getElementById(canvaId) as HTMLElement; // TODO - remove this
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
  });

  renderer.setSize(1600, 900);
  document.body.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  ambientLight.castShadow = true;
  scene.add(ambientLight);

  const spotLight = new THREE.SpotLight(0xffffff, 1);

  spotLight.castShadow = true;
  spotLight.position.set(0, 64, 32);
  scene.add(spotLight);

  const boxGeometry = new THREE.BoxGeometry(16, 16, 16);
  const boxMaterial = new THREE.MeshNormalMaterial();
  const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
  scene.add(boxMesh);

  const controls = new OrbitControls(camera, renderer.domElement);

  const stats = new Stats();
  document.body.appendChild(stats.dom);

  const animate = () => {
    //   boxMesh.rotateX(0.01);
    //   boxMesh.rotateY(0.01);
    //   boxMesh.rotateZ(0.01);
    stats.update();
    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(animate);
  };

  animate();
};
