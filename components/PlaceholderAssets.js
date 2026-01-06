import React from "react";
import Image from "next/image";

// 1. 배경
export const LayerBack = () => (
  <div className="absolute inset-0 w-full h-full">
    <Image
      src="/forest-bg.webp"
      alt="Forest Background"
      fill
      style={{ objectFit: 'cover' }}
      className="opacity-50"
      priority
    />
  </div>
);

// 2. 왼쪽 나무
export const TreeLeft = () => (
  <div className="relative w-full h-full">
    <Image
      src="/tree-left.png"
      alt="Left Tree"
      fill
      style={{ objectFit: 'contain', objectPosition: 'left top' }}
      priority={false}
    />
  </div>
);

// 3. 오른쪽 나무
export const TreeRight = () => (
  <div className="relative w-full h-full">
    <Image
      src="/tree-right.png"
      alt="Right Tree"
      fill
      style={{ objectFit: 'contain', objectPosition: 'right top' }}
      priority={false}
    />
  </div>
);

// 4. 바닥
export const GroundFront = () => (
  <div className="relative w-full h-full">
    <Image
      src="/ground-front_v2.png"
      alt="Forest Ground"
      fill
      style={{ objectFit: 'cover', objectPosition: 'center top' }}
      priority={false}
    />
  </div>
);