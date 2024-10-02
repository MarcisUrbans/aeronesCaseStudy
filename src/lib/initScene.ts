import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { IParsedResponse } from "../types/apiResponse.types";
import { createBoundingBoxAlt, parseBoundingBoxes } from "./parseBoundingBoxes";

interface SceneInitProps {
  videoId: string;
  canvaId: string;
  annotations?: IParsedResponse[];
}

export const SceneInit = ({
  videoId,
  canvaId,
  annotations,
}: SceneInitProps) => {
  const videoResolution = { width: 5376, height: 2688 }; // 5K video dimensions
  const width = 1600;
  const height = 900;
  const scene = new THREE.Scene();

  const videoElement = document.getElementById(videoId) as HTMLVideoElement;

  if (videoElement) {
    videoElement.loop = true;
    videoElement.muted = true;
    videoElement.playsInline = true;
    videoElement.crossOrigin = "anonymous";
  }
  const texture = new THREE.VideoTexture(videoElement);
  texture.colorSpace = THREE.SRGBColorSpace;
  // texture.mapping = THREE.EquirectangularReflectionMapping;

  // radius / width segments / height segments
  // larger width / height - better image quality
  const sphereGeometry = new THREE.SphereGeometry(25, 128, 64);
  const sphereMaterial = new THREE.MeshBasicMaterial({
    map: texture,
    color: 0xaaaaaa,
  });

  sphereMaterial.side = THREE.BackSide;

  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

  //Video seemed to be inverted
  sphere.scale.set(-1, 1, 1);
  scene.add(sphere);

  const camera = new THREE.PerspectiveCamera(75, width / height, 1, 1000);
  camera.position.z = 30;

  const canvas = document.getElementById(canvaId) as HTMLElement;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    logarithmicDepthBuffer: true,
  });

  renderer.setSize(width, height);
  document.body.appendChild(renderer.domElement);

  const boundingBoxes = parseBoundingBoxes(
    scene,
    annotations || [],
    videoResolution
  );

  console.log({ boundingBoxes });

  // const light = new THREE.AmbientLight();
  // light.intensity = 2;

  // scene.add(light);

  // const stats = new Stats();
  // document.body.appendChild(stats.dom);

  const controls = new OrbitControls(camera, renderer.domElement);
  // controls.minDistance = 3;
  // controls.maxDistance = 30;

  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);

  const animate = () => {
    requestAnimationFrame(animate);
    // stats.update();
    controls.update();

    // Get current video time
    const currentTime = videoElement.currentTime * 1000;

    // Show or hide bounding boxes based on time
    boundingBoxes.forEach((el: any) => {
      const { time, box } = el;

      box.visible = currentTime >= time && currentTime <= time + 1000;
    });

    renderer.render(scene, camera);
  };

  animate();
};
