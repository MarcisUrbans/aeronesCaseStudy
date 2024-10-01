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

  // Set up the camera
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  camera.position.z = 15;

  const canvas = document.getElementById(canvaId) as HTMLElement; // TODO - remove this
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    logarithmicDepthBuffer: true,
  });

  renderer.setSize(width, height);
  document.body.appendChild(renderer.domElement);

  // Add lighting (optional for better visuals)
  const light = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(light);

  const sphereGeometry = new THREE.SphereGeometry(20, 128, 64);

  const videoElement = document.getElementById(videoId) as HTMLVideoElement;

  if (videoElement) {
    videoElement.loop = true;
    videoElement.muted = true;
    videoElement.playsInline = true;
    videoElement.crossOrigin = "anonymous";
  }

  // Create a texture from the video
  const videoTexture = new THREE.VideoTexture(videoElement);

  // Create a plane geometry for the video and apply the video texture
  // const planeGeometry = new THREE.PlaneGeometry(16, 9); // Assuming a 16:9 video aspect ratio
  const sphereMaterial = new THREE.MeshBasicMaterial({
    map: videoTexture,
    side: THREE.BackSide,
  });

  const mesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
  scene.add(mesh);

  // Define top-left and bottom-right coordinates for multiple bounding boxes
  const boundingBoxCoordinates = parseBoundingBoxes(scene, annotations || []);
  console.log({ boundingBoxCoordinates });
  // Create the bounding boxes and store them in an array
  const boxHelpers: any[] = [];
  boundingBoxCoordinates.forEach((coords: any) => {
    console.log({ coords });
    const boundingBox = new THREE.Box3().setFromCenterAndSize(
      coords.center,
      coords.size
    );
    const boxHelper = new THREE.Box3Helper(boundingBox, 0xff0000); // Red bounding box
    boxHelper.visible = false; // Initially hidden
    scene.add(boxHelper);
    boxHelpers.push({ boxHelper, displayTime: coords.displayTime });
  });

  const controls = new OrbitControls(camera, renderer.domElement);
  // Create an animation loop
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    // Update video texture if video is playing
    if (videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
      videoTexture.needsUpdate = true;
    }

    // Check the current time of the video and display each bounding box at the defined times
    boxHelpers.forEach(({ boxHelper, displayTime }) => {
      // console.log({ boxHelper, video: videoElement.currentTime, displayTime });
      if (videoElement.currentTime >= displayTime && !boxHelper.visible) {
        boxHelper.visible = true; // Show bounding box when the time is reached
      }
    });

    renderer.render(scene, camera);
  }

  // Start the animation loop
  animate();
};
