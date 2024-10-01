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
      // Define the top-left and bottom-right coordinates
      const topLeft = new THREE.Vector3(
        boundBox.bbox[0] / 3.36,
        boundBox.bbox[1] / 2.99,
        1
      ); // Example coordinates (x, y, z)
      const bottomRight = new THREE.Vector3(
        boundBox.bbox[2] / 3.36,
        boundBox.bbox[3] / 2.99,
        1
      );

      boundingBoxes.push({
        center: topLeft,
        size: bottomRight,
        displayTime: parseTime(currentFrame, 3),
      });
    });
  });

  return boundingBoxes;
};
