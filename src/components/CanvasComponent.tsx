import { FC, useEffect, useState } from "react";
import { SceneInit } from "../lib/initScene";
import dataSet from "../api/frameData.json";
import tempData from "../api/temp.json";
import { IParsedResponse } from "../types/apiResponse.types";

const prepareData = (): IParsedResponse[] => {
  const data = Object.entries(tempData).reduce(
    (acc, [n, { annotations, video_time }]) => {
      const ds = annotations.length > 0 ? annotations : [];
      const currentFrame = n.split("_")[0];
      return ds.length > 0
        ? { ...acc, [n]: { annotations: ds, currentFrame, video_time } }
        : acc;
    },
    []
  );

  return Object.values(data) as unknown as IParsedResponse[];
};
export const CanvasComponent: FC = () => {
  // const [parsedData, setParsedData] = useState<IParsedResponse[]>(
  //   prepareData()
  // );

  const getData = async () => {
    const data = await prepareData();
    SceneInit({
      canvaId: "canvasComponent",
      videoSrc: "/video/stitchedVideo.mp4",
      annotations: data,
    });
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <div>
      <canvas id="canvasComponent"></canvas>
    </div>
  );
};
