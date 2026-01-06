import React from 'react';
import { motion } from 'framer-motion';
// moodColorMap 경로가 components/templates 안에 있다면 아래 경로가 맞습니다.
// 만약 에러가 난다면 경로를 확인해주세요.
import { getStyleByMood, moodThemes } from './templates/moodColorMap'; 

export default function PortfolioBackground({ moods }) {
  // 선택된 무드에 따른 스타일 가져오기
  const style = getStyleByMood(moods);
  const moodArray = Array.isArray(moods) ? moods : (moods ? [moods] : []);

  // 여러 무드의 glowColor를 추출하여 각각 다른 위치에 배치
  const glowColors = moodArray
    .map(mood => moodThemes?.[mood]?.glowColor)
    .filter(Boolean);
  
  // glowColor가 없으면 기본 스타일의 것을 사용
  if (glowColors.length === 0) {
    glowColors.push(style.glowColor);
  }
  
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none -z-10 bg-gray-50 dark:bg-gray-900 transition-colors duration-700">
      
      {/* 1. 기본 배경 그라데이션 (은은하게 깔림) - 여러 무드 조합 */}
      <div className={`absolute inset-0 opacity-10 bg-linear-to-br ${style.headerGradient}`}></div>

      {/* 2. 움직이는 오로라 효과 (블러된 원) - 각 무드마다 다른 위치에 배치 */}
      {glowColors.map((color, index) => {
        const positions = [
          { top: '-10%', left: '-10%', x: [0, 100, 0], y: [0, -50, 0] },
          { bottom: '-10%', right: '-10%', x: [0, -100, 0], y: [0, 50, 0] },
          { top: '50%', left: '50%', x: [0, 50, 0], y: [0, -30, 0] }
        ];
        const pos = positions[index % positions.length];
        const delay = index * 2;
        const duration = 10 + index * 2;
        
        return (
          <motion.div 
            key={index}
            animate={{ 
              scale: [1, 1.2, 1], 
              opacity: [0.2, 0.4, 0.2],
              x: pos.x,
              y: pos.y
            }}
            transition={{ duration, repeat: Infinity, ease: "easeInOut", delay }}
            className="absolute w-[400px] h-[400px] rounded-full blur-[100px]"
            style={{ 
              backgroundColor: color,
              ...pos
            }}
          />
        );
      })}

      {/* 3. 노이즈 텍스처 (질감 추가) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>
      
    </div>
  );
}