import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";

interface SceneInitProps {
  canvaId: string;
  videoSrc: string;
}

export const SceneInit = ({ canvaId, videoSrc }: SceneInitProps) => {
  const width = 1600;
  const height = 900;
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(75, width / height, 1, 100);
  camera.position.z = 10;

  const canvas = document.getElementById(canvaId) as HTMLElement; // TODO - remove this
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    logarithmicDepthBuffer: true,
  });

  renderer.setSize(width, height);
  document.body.appendChild(renderer.domElement);

  // radius / width segments / height segments
  // larger width / height - better image quality
  const sphereGeometry = new THREE.SphereGeometry(20, 32, 16);

  const videoElement = document.createElement("video");
  videoElement.src = videoSrc;
  videoElement.loop = true;
  videoElement.muted = true;
  videoElement.playsInline = true;
  videoElement.crossOrigin = "anonymous";
  videoElement.play();
  const texture = new THREE.VideoTexture(videoElement);

  const material = new THREE.MeshBasicMaterial({ map: texture });

  material.side = THREE.BackSide;

  const mesh = new THREE.Mesh(sphereGeometry, material);
  scene.add(mesh);

  const stats = new Stats();
  document.body.appendChild(stats.dom);

  const animate = () => {
    stats.update();
    renderer.setAnimationLoop(() => renderer.render(scene, camera));

    window.requestAnimationFrame(animate);
  };

  animate();
};
