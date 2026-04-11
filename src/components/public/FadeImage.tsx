"use client";

import Image, { type ImageProps } from "next/image";
import { useCallback } from "react";

export default function FadeImage(props: ImageProps) {
  const handleLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      e.currentTarget.classList.add("loaded");
    },
    []
  );

  return <Image {...props} onLoad={handleLoad} />;
}
