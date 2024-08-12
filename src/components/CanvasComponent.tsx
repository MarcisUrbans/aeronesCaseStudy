import { FC, useEffect, useRef, useState } from "react";
import { SceneInit } from "../lib/initScene";
import dataSet from "../api/frameData.json";
import { IParsedResponse } from "../types/apiResponse.types";
import { RewindButton } from "./RewindButton";

// Filter out only those entries with annotations
const prepareData = (): IParsedResponse[] => {
  const data = Object.entries(dataSet).reduce((acc, [n, { annotations }]) => {
    const ds = annotations.length > 0 ? annotations : [];
    const currentFrame = n.split("_")[0];
    return ds.length > 0
      ? { ...acc, [n]: { annotations: ds, currentFrame } }
      : acc;
  }, []);

  return Object.values(data) as unknown as IParsedResponse[];
};

export const CanvasComponent: FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // basing on data - frame 102 with time 00:34 and frame 105 with time 00:35
  const fps = 3;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(
        Math.round(
          ((videoRef.current?.currentTime || 0) + Number.EPSILON) * 100
        ) / 100
      );
    }, 1000 / fps);
    return () => clearInterval(interval);
  }, []);

  const togglePlayer = () => {
    if (isPlaying) {
      videoRef.current?.pause();
    } else {
      videoRef.current?.play();
    }

    setIsPlaying(!isPlaying);
  };

  const rewindVideo = (seconds: number, action: "rewind" | "forward") => {
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
      const currentTime = videoRef.current?.currentTime;
      if (action === "rewind") {
        videoRef.current.currentTime = currentTime - seconds;
      } else {
        videoRef.current.currentTime = currentTime + seconds;
      }
    }
  };

  const videoRef = useRef<HTMLVideoElement>(null);

  const getData = async () => {
    // Assuming that we would have some fetcher function, either as file loader or from fetching API
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

      <div className="flex p-[16px]">
        <RewindButton
          action={() => rewindVideo(15, "rewind")}
          text="Rewind 15 sec"
        />
        <RewindButton
          action={() => rewindVideo(5, "rewind")}
          text="Rewind 5 sec"
        />
        <RewindButton
          action={() => rewindVideo(1 / fps, "rewind")}
          text=" Rewind 1 Frame"
        />
        <button className="bg-[#8bc462]" onClick={togglePlayer}>
          {isPlaying ? "Pause" : "Play"}
        </button>
        <RewindButton
          action={() => rewindVideo(1 / fps, "forward")}
          text=" Forward 1 Frame"
        />
        <RewindButton
          action={() => rewindVideo(5, "forward")}
          text="Forward 5 sec"
        />
        <RewindButton
          action={() => rewindVideo(15, "forward")}
          text="Forward 15 sec"
        />

        <div className="mx-[8px] py-[8px] font-bold">
          Current time:{" "}
          {new Date(Math.round(currentTime) * 1000).toISOString().slice(11, 19)}
        </div>
        <div className="mx-[8px] py-[8px] font-bold">
          Current Frame: {Math.round(currentTime * fps)}
        </div>
      </div>
    </>
  );
};
