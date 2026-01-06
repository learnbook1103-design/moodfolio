# MoodFolio 🎨

**커리어에 Mood를 켜다** - AI 기반 개인화 포트폴리오 생성 플랫폼

MoodFolio는 사용자의 직무, 강점, 선호하는 분위기를 분석하여 맞춤형 포트폴리오를 자동으로 생성해주는 웹 애플리케이션입니다.

## ✨ 주요 기능

- 🤖 **AI 기반 포트폴리오 생성**: Google Gemini를 활용한 맞춤형 콘텐츠 생성
- 🎨 **9가지 전문 템플릿**: 직무별(개발자/디자이너/마케터/서비스기획) 최적화된 디자인
- 📄 **이력서 자동 파싱**: DOCX, 텍스트 파일에서 정보 자동 추출
- 🎵 **무드별 BGM 시스템**: 분위기에 맞는 배경음악 제공
- 🔐 **다중 인증 지원**: 이메일, Google, Kakao, Naver 로그인
- ✏️ **드래그 앤 드롭 에디터**: 직관적인 레이아웃 편집 기능

## 🚀 시작하기

### 필수 요구사항

- Node.js 18.0 이상
- Python 3.8 이상 (백엔드)
- npm 또는 yarn

### 설치 방법

#### 1. 프론트엔드 설정

```bash
# 저장소 클론
git clone https://github.com/learnbook1103-design/moodfolio.git
cd moodfolio

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일을 열어 필요한 API 키 입력

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

#### 2. 백엔드 설정

```bash
cd backend

# 가상환경 생성 및 활성화
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# 의존성 설치
pip install -r requirements.txt

# 환경 변수 설정
# backend/.env 파일 생성 후 GOOGLE_API_KEY 설정

# 서버 실행
uvicorn main:app --reload
```

백엔드 API는 [http://localhost:8000](http://localhost:8000)에서 실행됩니다.

## 🔑 환경 변수 설정

`.env.local` 파일에 다음 환경 변수를 설정해야 합니다:

| 변수명 | 설명 | 필수 여부 |
|--------|------|-----------|
| `NEXT_PUBLIC_GOOGLE_API_KEY` | Google Gemini API 키 | ✅ 필수 |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth 클라이언트 ID | 선택 |
| `NEXT_PUBLIC_KAKAO_CLIENT_ID` | Kakao OAuth 클라이언트 ID | 선택 |
| `NEXT_PUBLIC_NAVER_CLIENT_ID` | Naver OAuth 클라이언트 ID | 선택 |
| `NEXT_PUBLIC_API_URL` | 백엔드 API URL | ✅ 필수 |

### API 키 발급 방법

- **Google Gemini API**: [Google AI Studio](https://aistudio.google.com/app/apikey)
- **Google OAuth**: [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- **Kakao**: [Kakao Developers](https://developers.kakao.com/)
- **Naver**: [Naver Developers](https://developers.naver.com/apps/)

## 📁 프로젝트 구조

```
./
├── pages/              # Next.js 페이지
│   ├── index.js        # 랜딩 페이지
│   ├── signup/         # 회원가입
│   ├── login.js        # 로그인
│   ├── survey/         # 설문 페이지
│   ├── result.js       # 포트폴리오 결과
│   └── api/            # API 라우트
├── components/         # React 컴포넌트
│   ├── templates/      # 포트폴리오 템플릿
│   ├── HeroSection.js  # 질문 섹션
│   └── ...
├── backend/            # FastAPI 백엔드
│   ├── main.py         # 메인 서버
│   └── users.db        # SQLite 데이터베이스
├── public/             # 정적 파일
│   └── music/          # BGM 파일
└── styles/             # CSS 스타일
```

## 🛠️ 기술 스택

### Frontend
- **Framework**: Next.js 16.0.6
- **UI Library**: React 19.2.0
- **Styling**: Tailwind CSS 4
- **Animation**: Framer Motion
- **State Management**: React Hooks

### Backend
- **Framework**: FastAPI
- **Database**: SQLite + SQLAlchemy
- **AI**: Google Gemini (LangChain)
- **Authentication**: Passlib (bcrypt)

## 📝 사용 방법

1. **회원가입/로그인**: 이메일 또는 소셜 로그인
2. **설문 작성**: 직무, 강점, 선호 분위기 선택
3. **이력서 업로드**: (선택) 자동 정보 추출
4. **포트폴리오 생성**: AI가 맞춤형 콘텐츠 생성
5. **편집 및 저장**: 드래그 앤 드롭으로 레이아웃 조정

## 🧪 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

## 📄 라이선스

이 프로젝트는 개인 프로젝트입니다.

## 🤝 기여

이슈 및 풀 리퀘스트를 환영합니다!

## 📧 문의

프로젝트 관련 문의사항이 있으시면 이슈를 생성해주세요.
