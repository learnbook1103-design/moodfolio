# MoodFolio 배포 가이드

## 📦 배포 준비

### 1. Vercel 배포 (프론트엔드)

#### 사전 요구사항
- Vercel 계정 생성: https://vercel.com
- GitHub 저장소 연결

#### 배포 단계

**A. Vercel 대시보드에서 배포**

1. Vercel 대시보드 접속
2. "New Project" 클릭
3. GitHub 저장소 선택
4. 프로젝트 설정:
   - Framework Preset: `Next.js`
   - Root Directory: `./` (추천)
   - Build Command: `npm run build`
   - Output Directory: `.next`

5. 환경 변수 설정:
   ```
   NEXT_PUBLIC_GOOGLE_API_KEY=your_api_key
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id
   NEXT_PUBLIC_KAKAO_CLIENT_ID=your_kakao_id
   NEXT_PUBLIC_NAVER_CLIENT_ID=your_naver_id
   NEXT_PUBLIC_API_URL=https://your-backend.com
   ```

6. "Deploy" 클릭

**B. Vercel CLI로 배포**

```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 배포 (프로덕션)
vercel --prod

# 환경 변수 설정
vercel env add NEXT_PUBLIC_GOOGLE_API_KEY
```

---

### 2. 백엔드 배포 (FastAPI)

#### Railway 배포 (권장)

**사전 요구사항**
- Railway 계정: https://railway.app
- GitHub 저장소

**배포 단계**

1. Railway 대시보드 접속
2. "New Project" → "Deploy from GitHub repo"
3. 저장소 선택
4. 설정:
   - Root Directory: `backend`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Python Version: `3.11`

5. 환경 변수 설정:
   ```
   GOOGLE_API_KEY=your_api_key
   DATABASE_URL=sqlite:///./users.db
   ```

6. Deploy 클릭

#### Render 배포 (대안)

1. Render 대시보드: https://render.com
2. "New" → "Web Service"
3. GitHub 저장소 연결
4. 설정:
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Root Directory: `backend`

5. 환경 변수 설정 (위와 동일)

---

### 3. 도메인 연결

#### Vercel 커스텀 도메인

1. Vercel 프로젝트 → Settings → Domains
2. 도메인 입력 (예: `moodfolio.com`)
3. DNS 레코드 추가:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

4. SSL 자동 설정 (Let's Encrypt)

---

## 🔧 환경별 설정

### Development (개발)
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
NODE_ENV=development
```

### Staging (스테이징)
```bash
# Vercel 환경 변수
NEXT_PUBLIC_API_URL=https://staging-api.moodfolio.com
NODE_ENV=staging
```

### Production (프로덕션)
```bash
# Vercel 환경 변수
NEXT_PUBLIC_API_URL=https://api.moodfolio.com
NODE_ENV=production
```

---

## 🚀 CI/CD 파이프라인

### GitHub Actions 설정

**필요한 Secrets**

GitHub 저장소 → Settings → Secrets and variables → Actions:

```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
GOOGLE_API_KEY=your_api_key
API_URL=your_backend_url
```

**워크플로우 파일**: `.github/workflows/ci-cd.yml`

**자동화된 작업**:
1. ✅ 코드 푸시 시 자동 린트
2. ✅ 빌드 테스트
3. ✅ PR 생성 시 프리뷰 배포
4. ✅ main 브랜치 머지 시 프로덕션 배포

---

## 📊 배포 후 확인사항

### 1. 프론트엔드 체크리스트
- [ ] 모든 페이지 정상 로딩
- [ ] 환경 변수 정상 작동
- [ ] API 연결 확인
- [ ] 이미지 로딩 확인
- [ ] BGM 재생 확인
- [ ] 소셜 로그인 테스트

### 2. 백엔드 체크리스트
- [ ] API 엔드포인트 응답 확인
- [ ] 데이터베이스 연결 확인
- [ ] CORS 설정 확인
- [ ] 에러 로깅 확인

### 3. 성능 체크리스트
- [ ] Lighthouse 점수 확인 (90+ 목표)
- [ ] 페이지 로딩 속도 (< 3초)
- [ ] 이미지 최적화 확인
- [ ] 번들 크기 확인

---

## 🔍 모니터링 설정

### Vercel Analytics
1. Vercel 대시보드 → Analytics 탭
2. "Enable Analytics" 클릭
3. 실시간 트래픽 모니터링

### Sentry (에러 추적)

**설치**:
```bash
npm install @sentry/nextjs
```

**설정** (`sentry.client.config.js`):
```javascript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
```

---

## 🛡️ 보안 설정

### 1. 환경 변수 보안
- ✅ `.env.local` 파일 `.gitignore`에 추가
- ✅ 프로덕션 환경 변수는 Vercel/Railway에서 관리
- ✅ API 키 정기적 갱신

### 2. CORS 설정 (백엔드)
```python
# main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://moodfolio.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 3. 보안 헤더
`vercel.json`에 이미 설정됨:
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Referrer-Policy

---

## 📝 배포 체크리스트

### 배포 전
- [ ] 모든 테스트 통과
- [ ] 환경 변수 설정 완료
- [ ] 이미지 최적화 완료
- [ ] 빌드 에러 없음
- [ ] README 업데이트

### 배포 후
- [ ] 프로덕션 URL 접속 확인
- [ ] 모든 기능 테스트
- [ ] 성능 측정
- [ ] 에러 모니터링 설정
- [ ] 팀에 배포 알림

---

## 🔄 롤백 절차

### Vercel 롤백
1. Vercel 대시보드 → Deployments
2. 이전 배포 선택
3. "Promote to Production" 클릭

### Railway 롤백
1. Railway 대시보드 → Deployments
2. 이전 배포 선택
3. "Redeploy" 클릭

---

## 📞 문제 해결

### 일반적인 문제

**1. 환경 변수가 작동하지 않음**
- Vercel에서 환경 변수 재설정
- 재배포 필요

**2. API 연결 실패**
- CORS 설정 확인
- 백엔드 URL 확인
- 네트워크 탭에서 에러 확인

**3. 빌드 실패**
- 로그 확인
- 의존성 버전 확인
- 로컬에서 빌드 테스트

---

## 🎯 다음 단계

1. **모니터링 대시보드 설정**
2. **사용자 피드백 수집**
3. **성능 최적화 지속**
4. **기능 추가 및 개선**

---

**배포 완료 후 프로덕션 URL을 팀과 공유하세요!** 🚀
