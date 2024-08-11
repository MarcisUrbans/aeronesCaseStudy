import { FC, useEffect } from "react";
import { SceneInit } from "../lib/initScene";

export const CanvasComponent: FC = () => {
  useEffect(() => {
    SceneInit("canvasComponent");
  }, []);

  return (
    <div>
      <canvas id="canvasComponent"></canvas>
    </div>
  );
};
