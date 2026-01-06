# MoodFolio 프로젝트 기술 스택 요약

## 📚 프로젝트 개요
**MoodFolio** - AI 기반 포트폴리오 자동 생성 플랫폼

---

## 🎯 핵심 기술 스택

### Frontend Framework
- **Next.js 16.0.6** - React 기반 풀스택 프레임워크
- **React 19.2.0** - UI 라이브러리
- **React DOM 19.2.0** - React 렌더링

### 스타일링
- **Tailwind CSS 4** - 유틸리티 기반 CSS 프레임워크
- **PostCSS** - CSS 전처리기
- **Framer Motion 12.23.25** - 애니메이션 라이브러리

### 언어
- **JavaScript** - 주 프로그래밍 언어
- **TypeScript 5** - 타입 안정성 (설정 파일 및 일부 컴포넌트)
- **SQL** - 데이터베이스 쿼리 및 마이그레이션

---

## 🗄️ 백엔드 & 데이터베이스

### Database & Authentication
- **Supabase** (@supabase/supabase-js 2.87.3)
  - PostgreSQL 데이터베이스
  - 사용자 인증 (Auth)
  - Row Level Security (RLS)
  - Real-time subscriptions

### AI & Machine Learning
- **Google Gemini AI** (@google/generative-ai 0.24.1)
  - 이력서 분석
  - 프로젝트 추출
  - 시장 인사이트 생성
  - RAG (Retrieval-Augmented Generation)

---

## 🔐 인증 & OAuth

- **Google OAuth** (@react-oauth/google 0.12.2)
- **JWT** (jwt-decode 4.0.0)
- **Kakao Login** (SDK)
- **Naver Login** (SDK)

---

## 📄 문서 처리

### 파일 파싱
- **Mammoth 1.11.0** - DOCX 파일 파싱
- **PDF Parse 1.1.1** - PDF 텍스트 추출
- **PDF.js 5.4.449** - PDF 렌더링
- **Cheerio 1.1.2** - HTML/XML 파싱

### 파일 업로드
- **Formidable 3.5.4** - 멀티파트 폼 데이터 처리

---

## 🎨 UI/UX 라이브러리

- **Framer Motion** - 페이지 전환, 애니메이션
- **React Grid Layout 1.5.3** - 드래그 앤 드롭 그리드
- **React Resizable 3.0.5** - 크기 조절 가능한 컴포넌트

---

## 🌐 웹 스크래핑 & 자동화

- **Puppeteer Core 24.33.0** - 헤드리스 브라우저 자동화
- **Chrome AWS Lambda 10.1.0** - 서버리스 환경에서 Chrome 실행

---

## 🛠️ 개발 도구

### 코드 품질
- **ESLint 9** - JavaScript/TypeScript 린터
- **ESLint Config Next** - Next.js 최적화 린트 규칙

### 타입 시스템
- **TypeScript 5** - 정적 타입 검사
- **@types/node** - Node.js 타입 정의
- **@types/react** - React 타입 정의
- **@types/react-dom** - React DOM 타입 정의

---

## 📦 유틸리티

- **Lodash 4.17.21** - JavaScript 유틸리티 라이브러리

---

## 🏗️ 프로젝트 구조

```
./
├── pages/              # Next.js 페이지 (25개)
│   ├── api/           # API 라우트
│   ├── index.js       # 메인 페이지
│   ├── onboarding.js  # 온보딩
│   ├── result.js      # 결과 페이지
│   ├── signup/        # 회원가입
│   └── login.js       # 로그인
├── components/        # React 컴포넌트 (33개)
├── lib/              # 라이브러리 & 유틸리티 (9개)
│   ├── supabase.js   # Supabase 클라이언트
│   ├── auth.js       # 인증 로직
│   ├── db.js         # DB 헬퍼
│   └── peerComparison.js  # 피어 비교
├── utils/            # 유틸리티 함수 (7개)
├── styles/           # 글로벌 스타일
├── public/           # 정적 파일 (22개)
├── migrations/       # DB 마이그레이션 (5개)
├── backend/          # 백엔드 스크립트 (6개)
└── scripts/          # 빌드/배포 스크립트 (4개)
```

---

## 🚀 주요 기능별 기술

### 1. 이력서 분석
- **Mammoth** - DOCX 파싱
- **PDF Parse** - PDF 파싱
- **Google Gemini** - AI 분석
- **Cheerio** - HTML 정리

### 2. 포트폴리오 생성
- **React** - UI 렌더링
- **Framer Motion** - 애니메이션
- **Tailwind CSS** - 스타일링
- **Next.js** - SSR/SSG

### 3. 사용자 인증
- **Supabase Auth** - 이메일/비밀번호
- **Google OAuth** - 소셜 로그인
- **JWT** - 토큰 관리

### 4. 데이터 관리
- **PostgreSQL** (Supabase) - 관계형 DB
- **Supabase RLS** - 보안
- **SQL** - 데이터 쿼리

### 5. AI 인사이트
- **Google Gemini** - 시장 분석
- **RAG** - 채용공고 기반 추천
- **PostgreSQL** - 통계 집계

### 6. 피어 비교 (신규)
- **PostgreSQL** - 통계 데이터
- **SQL Functions** - 집계 함수
- **React** - 시각화 UI

---

## 📊 데이터베이스 스키마

### 주요 테이블
1. **user_profiles** - 사용자 프로필
   - name, intro, career_summary
   - skills (text[])
   - projects (JSONB)
   - job_type, years_experience

2. **portfolios** - 포트폴리오
   - job, strength, moods
   - template, featured_project_ids

3. **peer_skill_stats** - 피어 비교 통계
   - job_type, years_experience
   - skill_name, adoption_rate

4. **job_postings** - 채용공고 (RAG)
5. **market_insights_cache** - 시장 인사이트 캐시

---

## 🌍 배포 & 인프라

- **Vercel** - Next.js 호스팅
- **Supabase** - 백엔드 서비스
- **Google Cloud** - Gemini API

---

## 📝 설정 파일

- `package.json` - 의존성 관리
- `next.config.ts` - Next.js 설정
- `tailwind.config.js` - Tailwind 설정
- `tsconfig.json` - TypeScript 설정
- `eslint.config.mjs` - ESLint 설정
- `vercel.json` - Vercel 배포 설정

---

## 🔑 환경 변수

```env
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
GEMINI_API_KEY
GOOGLE_CLIENT_ID
KAKAO_API_KEY
NAVER_CLIENT_ID
```

---

## 📈 프로젝트 통계

- **총 페이지**: 25개
- **컴포넌트**: 33개
- **라이브러리**: 9개
- **유틸리티**: 7개
- **API 라우트**: 9개
- **마이그레이션**: 5개
- **의존성**: 18개 (production)
- **개발 의존성**: 8개

---

## 🎨 디자인 시스템

- **색상**: Tailwind 기본 팔레트 + 커스텀
- **타이포그래피**: 시스템 폰트
- **애니메이션**: Framer Motion
- **반응형**: Tailwind 브레이크포인트
- **다크모드**: 지원

---

## 🔮 최신 추가 기능

### 피어 비교 시스템 (2025-12-22)
- **기술**: PostgreSQL, SQL Functions, React
- **기능**: 같은 연차 사용자와 기술 스택 비교
- **UI**: 블러 티저 (게스트), 실제 데이터 (로그인)
- **데이터**: 집계 통계, 순위, 추천
