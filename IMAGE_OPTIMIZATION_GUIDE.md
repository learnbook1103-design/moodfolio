# 이미지 최적화 가이드

## 현재 문제점
프로젝트의 대용량 이미지 파일들:
- `ground-front.png` - 68.8MB
- `character.gif` - 11.2MB  
- `tree-left.png` - 7.5MB
- `tree-right.png` - 7.3MB

**총 94.8MB** → 페이지 로딩 속도 저하

## 최적화 방법

### 1. 온라인 도구 사용 (권장)

#### A. Squoosh (Google 제공)
1. https://squoosh.app/ 접속
2. 이미지 파일 드래그 앤 드롭
3. 우측에서 WebP 형식 선택
4. Quality: 70-80% 설정
5. 다운로드

#### B. TinyPNG
1. https://tinypng.com/ 접속
2. PNG 파일 업로드 (최대 5MB)
3. 자동 압축 후 다운로드

### 2. 로컬 도구 사용

#### ImageMagick (명령줄)
```bash
# ImageMagick 설치 (Windows)
# https://imagemagick.org/script/download.php

# PNG → WebP 변환 (품질 75%)
magick convert ground-front.png -quality 75 ground-front.webp
magick convert tree-left.png -quality 75 tree-left.webp
magick convert tree-right.png -quality 75 tree-right.webp

# GIF → MP4 변환 (ffmpeg 필요)
ffmpeg -i character.gif -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" character.mp4
```

### 3. 권장 설정

| 파일 | 원본 크기 | 목표 크기 | 형식 | 품질 |
|------|-----------|-----------|------|------|
| ground-front.png | 68.8MB | ~3-5MB | WebP | 70% |
| tree-left.png | 7.5MB | ~500KB | WebP | 75% |
| tree-right.png | 7.3MB | ~500KB | WebP | 75% |
| character.gif | 11.2MB | ~1-2MB | MP4 | - |

### 4. 적용 방법

압축된 이미지를 `public/` 폴더에 저장 후:

#### PlaceholderAssets.js 수정
```javascript
// tree-left.png → tree-left.webp
export const TreeLeft = () => (
  <div className="relative w-full h-full">
    <Image
      src="/tree-left.webp"  // ← 변경
      alt="Left Tree"
      layout="fill"
      objectFit="cover"
      objectPosition="right top"
      priority={false}  // lazy load로 변경
    />
  </div>
);
```

#### character.gif → video 태그로 변경
```javascript
// GIF 대신 video 사용 (80-90% 용량 감소)
<video 
  autoPlay 
  loop 
  muted 
  playsInline
  className="w-full h-full object-cover"
>
  <source src="/character.mp4" type="video/mp4" />
</video>
```

## 예상 효과

- **로딩 속도**: 10-30초 → 1-3초
- **총 용량**: 94.8MB → 5-10MB (90% 감소)
- **Lighthouse 점수**: 향상
- **모바일 경험**: 크게 개선

## 다음 단계

1. ✅ 이미지 압축 도구로 파일 최적화
2. ✅ 압축된 파일을 `public/` 폴더에 저장
3. ✅ 컴포넌트에서 파일명 업데이트
4. ✅ 테스트 및 확인
