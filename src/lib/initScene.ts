import { RefObject, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { IParsedResponse } from "../types/apiResponse.types";
import { parseBoundingBoxes } from "./parseBoundingBoxes";

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
  const width = 1600;
  const height = 900;
  const scene = new THREE.Scene();

  const boundingBoxes = parseBoundingBoxes(scene, annotations || []);

  const camera = new THREE.PerspectiveCamera(75, width / height, 1, 1000);
  camera.position.z = 15;

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
  const sphereGeometry = new THREE.SphereGeometry(20, 128, 64);

  const videoElement = document.getElementById(videoId) as HTMLVideoElement;

  if (videoElement) {
    videoElement.loop = true;
    videoElement.muted = true;
    videoElement.playsInline = true;
    videoElement.crossOrigin = "anonymous";
  }
  const texture = new THREE.VideoTexture(videoElement);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.format = THREE.RGBFormat;

  const material = new THREE.MeshBasicMaterial({ map: texture });

  material.side = THREE.BackSide;

  const mesh = new THREE.Mesh(sphereGeometry, material);
  scene.add(mesh);

  // const stats = new Stats();
  // document.body.appendChild(stats.dom);

  const controls = new OrbitControls(camera, renderer.domElement);

  const animate = () => {
    requestAnimationFrame(animate);
    // stats.update();
    controls.update();

    // Get current video time
    const currentTime = videoElement.currentTime;

    // Show or hide bounding boxes based on time
    boundingBoxes.forEach((box: any) => {
      const { start, end } = box.userData.timeRange;
      box.visible = currentTime >= start && currentTime <= end;
    });

    // renderer.setAnimationLoop(() => renderer.render(scene, camera));
    renderer.render(scene, camera);
  };

  animate();
};
