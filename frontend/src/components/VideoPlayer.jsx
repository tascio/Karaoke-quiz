import { useRef, useEffect } from "react";

export default function VideoPlayer({ src }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (src && videoRef.current) {
      videoRef.current.src = src;
      videoRef.current.play();
    }
  }, [src]);

  return (
    <video
      id="video-player"
      ref={videoRef}
      width="80%"
      controls
    />
  );
}
