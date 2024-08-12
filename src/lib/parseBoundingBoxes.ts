import * as THREE from "three";
import { IParsedResponse } from "../types/apiResponse.types";

function latLonToVector3(lat: number, lon: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.sin(theta);

  return new THREE.Vector3(x, y, z);
}

const parseTime = (frame: number, fps: number) => frame / fps;

export const parseBoundingBoxes = (
  scene: any,
  boundingBoxesData: IParsedResponse[]
) => {
  const boundingBoxes = [] as unknown as any;
  const sphereRadius = 20;

  boundingBoxesData.forEach((boxData) => {
    const { annotations, currentFrame } = boxData;

    // In case there's multiple annotations on same time frame
    annotations.forEach((boundBox: any) => {
      // For now divided video width by 1600 and height by 900 to somewhat keep aspect artio for drawing. Of course needs fixup.
      const lat = boundBox.bbox[0] / 3.36;
      const lon = boundBox.bbox[1] / 2.99;
      const width = boundBox.bbox[2] - boundBox.bbox[0];
      const height = boundBox.bbox[3] - boundBox.bbox[1];

      const startTime = parseTime(currentFrame, 3);

      // Create plane geometry for the bounding box
      const planeGeometry = new THREE.PlaneGeometry(width, height);
      const planeMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000, // Red color
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.3,
        name: `${boundBox.category_name} ${boundBox.confidence}`,
      });
      const plane = new THREE.Mesh(planeGeometry, planeMaterial);

      // Position the plane
      const position = latLonToVector3(lat, lon, sphereRadius - 0.5); // Slightly inside the sphere
      plane.position.copy(position);

      // Make the plane face the camera
      plane.lookAt(new THREE.Vector3(0, 0, 0));

      // Store time range for visibility control
      // for now keeping bbox visible for 1 sec
      plane.userData.timeRange = { start: startTime, end: startTime + 1 };

      scene.add(plane);
      boundingBoxes.push(plane);
    });
  });

  return boundingBoxes;
};
