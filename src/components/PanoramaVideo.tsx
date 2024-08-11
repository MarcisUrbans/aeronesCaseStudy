import { FC, useEffect, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";

interface PanoramaVideoProps {
  videoSrc: string;
}

const VideoComponent: FC<PanoramaVideoProps> = ({ videoSrc }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const textureRef = useRef<THREE.VideoTexture | null>(null);

  useEffect(() => {
    const video = document.createElement("video");
    video.src = videoSrc;
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = true;
    video.play();
    videoRef.current = video;

    const texture = new THREE.VideoTexture(video);
    textureRef.current = texture;
  }, [videoSrc]);

  useFrame(() => {
    if (textureRef.current) {
      textureRef.current.needsUpdate = true;
    }
  });

  return (
    <mesh>
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial map={textureRef.current} side={THREE.BackSide} />
    </mesh>
  );
};

export const PanoramaVideo: FC<PanoramaVideoProps> = ({ videoSrc }) => {
  return (
    <Canvas>
      <VideoComponent videoSrc={videoSrc} />
      <ambientLight />
    </Canvas>
  );
};
