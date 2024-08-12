import { FC, useEffect, useRef, useState } from "react";
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
  const [isPlaying, setIsPlaying] = useState(false);
  // const [parsedData, setParsedData] = useState<IParsedResponse[]>(
  //   prepareData()
  // );

  const togglePlayer = () => {
    if (isPlaying) {
      videoRef.current?.pause();
    } else {
      videoRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  const videoRef = useRef<HTMLVideoElement>(null);

  const getData = async () => {
    const data = await prepareData();
    SceneInit({
      videoId: "videoPlayer",
      canvaId: "canvasComponent",
      annotations: data,
    });
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <>
      <canvas id="canvasComponent">
        <video
          id="videoPlayer"
          src="/video/stitchedVideo.mp4"
          ref={videoRef}
          className="hidden"
        ></video>
      </canvas>

      <div className="flex flex-col">
        <button onClick={togglePlayer}>Play</button>
      </div>
    </>
  );
};
