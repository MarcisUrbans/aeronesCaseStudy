import * as THREE from "three";
import { IParsedResponse } from "../types/apiResponse.types";

// function latLonToVector3(lat: number, lon: number, radius: number) {
//   const phi = (90 - lat) * (Math.PI / 180);
//   const theta = (lon + 180) * (Math.PI / 180);

//   const x = -radius * Math.sin(phi) * Math.cos(theta);
//   const y = radius * Math.cos(phi);
//   const z = radius * Math.sin(phi) * Math.sin(theta);

//   return new THREE.Vector3(x, y, z);
// }

// function pixelToSphereIntersection(
//   x: number,
//   y: number,
//   camera: THREE.Camera,
//   sphere: THREE.Object3D
// ) {
//   const vector = new THREE.Vector2(); // Create a normalized 2D vector for the screen

//   // Normalize the pixel coordinates (x, y) to -1 to 1 range
//   vector.x = (x / window.innerWidth) * 2 - 1;
//   vector.y = -(y / window.innerHeight) * 2 + 1;

//   // Create a raycaster and cast from the camera through the screen point
//   const raycaster = new THREE.Raycaster();
//   raycaster.setFromCamera(vector, camera);

//   // Find where the ray intersects with the sphere
//   const intersects = raycaster.intersectObject(sphere);

//   console.log({ intersects });

//   if (intersects.length > 0) {
//     return intersects[0].point; // Return the intersection point on the sphere
//   } else {
//     console.error("No intersection found for pixel coordinates: ", x, y);
//     return null;
//   }
// }

const parseTime = (frame: number, fps: number) =>
  Math.round((frame / fps) * 1000);

// function createBoundingBox(
//   boundBox: {
//     topLeftX: number;
//     topLeftY: number;
//     bottomRightX: number;
//     bottomRightY: number;
//   },
//   camera: THREE.Camera,
//   sphere: THREE.Object3D
// ) {
//   const boundingBoxGroup = new THREE.Group();
//   console.log({ boundBox });
//   const { topLeftX, topLeftY, bottomRightX, bottomRightY } = boundBox;
//   // Calculate the 3D positions on the sphere
//   const topLeftVec = pixelToSphereIntersection(
//     topLeftX,
//     topLeftY,
//     camera,
//     sphere
//   );
//   const bottomRightVec = pixelToSphereIntersection(
//     bottomRightX,
//     bottomRightY,
//     camera,
//     sphere
//   );

//   // Calculate the other two corners of the bounding box in pixels
//   const topRightVec = pixelToSphereIntersection(
//     bottomRightX,
//     topLeftY,
//     camera,
//     sphere
//   );
//   const bottomLeftVec = pixelToSphereIntersection(
//     topLeftX,
//     bottomRightY,
//     camera,
//     sphere
//   );

//   if (!topLeftVec || !bottomRightVec || !topRightVec || !bottomLeftVec) {
//     console.error(
//       "One or more bounding box corners could not be projected onto the sphere."
//     );
//     return;
//   }

//   // Create edges for the bounding box
//   const edges = [
//     [topLeftVec, topRightVec],
//     [topRightVec, bottomRightVec],
//     [bottomRightVec, bottomLeftVec],
//     [bottomLeftVec, topLeftVec],
//   ];
//   // Material for the lines
//   const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
//   // Draw lines for each edge
//   edges.forEach((edge) => {
//     if (edge[0] && edge[1]) {
//       // Ensure both points are valid
//       const points = new THREE.BufferGeometry().setFromPoints(edge as any);
//       const line = new THREE.Line(points, lineMaterial);
//       boundingBoxGroup.add(line);
//     }
//   });

//   return boundingBoxGroup;
// }

export const parseBoundingBoxes = (
  scene: any,
  boundingBoxesData: IParsedResponse[],
  videoResolution: { width: number; height: number }
) => {
  const boundingBoxes = [] as unknown as any;

  console.log({ boundingBoxesData });

  boundingBoxesData.forEach((boxData) => {
    const { annotations, currentFrame } = boxData;

    // In case there's multiple annotations on same time frame
    annotations.forEach((boundBox: any) => {
      const startTime = parseTime(currentFrame, 3);

      const { bbox } = boundBox;

      const box = createBoundingBoxAlt(
        new THREE.Vector2(bbox[0], bbox[1]),
        new THREE.Vector2(bbox[2], bbox[3]),
        videoResolution,
        25
      );
      scene.add(box);

      boundingBoxes.push({
        time: startTime,
        box,
      });
    });
  });

  return boundingBoxes;
};

const videoCoordToSphere = (
  videoX: number,
  videoY: number,
  videoResolution: { width: number; height: number },
  sphereRadius: number
) => {
  // Normalize the video coordinates (0 to 1 range)
  const u = videoX / videoResolution.width;
  const v = videoY / videoResolution.height;

  // Convert normalized (u, v) to spherical coordinates (phi, theta)
  const theta = Math.acos(1 - 2 * v); // Theta: 0 at top, PI at bottom
  const phi = (u + 0) * 2 * Math.PI; // Phi: 0 to 2PI around the sphere horizontally

  // Convert spherical coordinates to Cartesian (x, y, z)
  const x = sphereRadius * Math.sin(theta) * Math.cos(phi);
  const y = sphereRadius * Math.cos(theta);
  const z = -sphereRadius * Math.sin(theta) * Math.sin(phi);

  return new THREE.Vector3(x, y, z);
};

export const createBoundingBoxAlt = (
  topLeft: { x: number; y: number },
  bottomRight: { x: number; y: number },
  videoResolution: { width: number; height: number },
  sphereRadius: number
) => {
  const material = new THREE.LineBasicMaterial({ color: 0xff0000 });

  // Aspect ratio correction for the video
  const aspectRatioCorrection = 1; //videoResolution.height / videoResolution.width;

  // Convert the 2D video coordinates to 3D points on the sphere
  const topLeft3D = videoCoordToSphere(
    topLeft.x * aspectRatioCorrection,
    topLeft.y,
    videoResolution,
    sphereRadius
  );
  const topRight3D = videoCoordToSphere(
    bottomRight.x * aspectRatioCorrection,
    topLeft.y,
    videoResolution,
    sphereRadius
  );
  const bottomRight3D = videoCoordToSphere(
    bottomRight.x * aspectRatioCorrection,
    bottomRight.y,
    videoResolution,
    sphereRadius
  );
  const bottomLeft3D = videoCoordToSphere(
    topLeft.x * aspectRatioCorrection,
    bottomRight.y,
    videoResolution,
    sphereRadius
  );

  // Create a geometry from these 3D points
  const geometry = new THREE.BufferGeometry().setFromPoints([
    topLeft3D,
    topRight3D,
    bottomRight3D,
    bottomLeft3D,
    topLeft3D, // Close the loop
  ]);

  const line = new THREE.Line(geometry, material);
  return line;
};
