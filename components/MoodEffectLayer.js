import { useEffect, useState } from 'react';
// motion import는 필요 없으면 지워도 되지만, 혹시 모를 확장성을 위해 남겨둡니다.
// import { motion } from 'framer-motion'; 

// SVG 노이즈 필터 (파일 없이 코드로 질감 생성)
const noiseSVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")`;

// 스캔라인 패턴
const scanlineCSS = "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))";

const moodEffects = {
  "#차분한": {
    texture: noiseSVG,
    textureOpacity: 0.05,
    filter: "grayscale(30%) sepia(10%)",
    fontClass: "font-serif tracking-wide" // 세리프 + 넓은 자간
  },
  "#열정적인": {
    texture: "none",
    textureOpacity: 0,
    filter: "contrast(110%) saturate(120%)",
    fontClass: "font-sans font-bold" // 산세리프 + 굵게
  },
  "#신뢰감있는": {
    texture: "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
    textureSize: "20px 20px",
    textureOpacity: 0.3,
    filter: "none",
    fontClass: "font-sans tracking-normal" // 산세리프 + 일반 자간
  },
  "#힙한(Hip)": {
    texture: scanlineCSS,
    textureSize: "100% 4px",
    textureOpacity: 0.3,
    filter: "contrast(110%) hue-rotate(-5deg)",
    fontClass: "font-mono tracking-tight" // 모노스페이스 + 좁은 자간
  },
  "#창의적인": {
    texture: noiseSVG,
    textureOpacity: 0.07,
    filter: "saturate(110%) brightness(105%)",
    fontClass: "font-sans italic" // 산세리프 + 이탤릭
  },
  "#미니멀한": {
    texture: "none",
    textureOpacity: 0,
    filter: "grayscale(100%)",
    fontClass: "font-sans tracking-tight font-light" // 산세리프 + 좁은 자간 + 가늘게
  },
  "#클래식한": {
    texture: noiseSVG,
    textureOpacity: 0.08,
    filter: "sepia(40%) contrast(90%)",
    fontClass: "font-serif font-medium" // 세리프 + 중간 굵기
  },
  // 기본값
  "default": {
    texture: "none",
    textureOpacity: 0,
    filter: "none",
    fontClass: "font-sans"
  }
};

// 여러 무드의 효과를 조합하는 함수
function combineMoodEffects(moods) {
  if (!moods || moods.length === 0) return moodEffects["default"];
  if (moods.length === 1) return moodEffects[moods[0]] || moodEffects["default"];

  // 여러 무드의 효과를 조합
  const validEffects = moods
    .map(mood => moodEffects[mood])
    .filter(Boolean);

  if (validEffects.length === 0) return moodEffects["default"];

  // 첫 번째 무드를 기본으로 사용하고, 필터는 조합
  const baseEffect = validEffects[0];

  // 여러 필터를 조합 (CSS 필터는 순차적으로 적용)
  const combinedFilter = validEffects
    .map(e => e.filter)
    .filter(f => f && f !== "none")
    .join(" ");

  // 텍스처는 첫 번째 무드의 것을 사용 (겹치면 복잡해짐)
  // 폰트는 첫 번째 무드의 것을 사용
  return {
    ...baseEffect,
    filter: combinedFilter || baseEffect.filter,
    fontClass: baseEffect.fontClass
  };
}

export default function MoodEffectLayer({ mood }) {
  const moods = Array.isArray(mood) ? mood : (mood ? [mood] : []);
  const effect = combineMoodEffects(moods);

  // [삭제됨] 마우스 추적 로직 제거

  return (
    <div className={`pointer-events-none fixed inset-0 z-9999 overflow-hidden ${effect.fontClass}`}>

      {/* 1. 전체 색감 필터 */}
      <div
        className="fixed inset-0 pointer-events-none transition-all duration-700"
        style={{ backdropFilter: effect.filter }}
      />

      {/* 2. 질감(Texture) 오버레이 */}
      <div
        className="fixed inset-0 pointer-events-none transition-opacity duration-700"
        style={{
          backgroundImage: effect.texture,
          backgroundSize: effect.textureSize || 'auto',
          opacity: effect.textureOpacity
        }}
      />

      {/* [삭제됨] 커스텀 마우스 커서 제거 */}
    </div>
  );
}