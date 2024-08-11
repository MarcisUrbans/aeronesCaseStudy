import { FC, useEffect } from "react";
import { SceneInit } from "../lib/initScene";

export const CanvasComponent: FC = () => {
  useEffect(() => {
    SceneInit({
      canvaId: "canvasComponent",
      videoSrc: "/video/stitchedVideo.mp4",
    });
  }, []);

  return (
    <div>
      <canvas id="canvasComponent"></canvas>
    </div>
  );
};
