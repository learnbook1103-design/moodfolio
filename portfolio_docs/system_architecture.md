# 시스템 아키텍처 (System Architecture)

## 개요 (Overview)
**MoodFolio** 시스템은 **Next.js**를 프론트엔드로, **FastAPI**를 백엔드로 사용하며, **Google Gemini**의 AI 기능과 **Supabase**의 데이터 스토리지를 통합하여 구축된 현대적인 웹 애플리케이션입니다.

## 아키텍처 다이어그램 (Architecture Diagram)

```mermaid
graph TD
    %% Client Side
    subgraph Client [클라이언트 (Next.js)]
        UI[사용자 인터페이스 / React 컴포넌트]
        AuthClient[인증 클라이언트]
        APIClient[API 클라이언트]
    end

    %% Server Side
    subgraph Server [백엔드 (FastAPI)]
        APIGateway[API 엔드포인트]
        AuthService[인증 서비스]
        AIService[AI 서비스 / LangChain]
        AdminService[관리자 서비스]
        SyncService[동기화 서비스]
    end

    %% External Services
    subgraph External [외부 서비스]
        Gemini[Google Gemini AI]
        SupabaseDb[(Supabase / PostgreSQL)]
        SupabaseAuth[Supabase Auth]
        OAuth[OAuth 제공자\n(Google, Kakao, Naver)]
    end

    %% Connections
    UI --> AuthClient
    UI --> APIClient
    
    AuthClient -->|로그인/가입| APIClient
    APIClient -->|HTTP / JSON| APIGateway
    
    APIGateway --> AuthService
    APIGateway --> AIService
    APIGateway --> AdminService
    
    AuthService -->|토큰 검증| OAuth
    AuthService -->|사용자 관리| SyncService
    
    AIService -->|포트폴리오 생성/채팅| Gemini
    AIService -->|사용량 로그| SupabaseDb
    
    AdminService -->|데이터 관리| SupabaseDb
    SyncService -->|데이터 동기화| SupabaseDb
    
    %% Optional: Direct connection for client to Supabase if used
    AuthClient -.->|직접 인증| SupabaseAuth
```

## 컴포넌트 상세 (Component Details)

### 1. 프론트엔드 (Client)
- **프레임워크**: Next.js (React)
- **스타일링**: TailwindCSS
- **담당 역할**:
  - 사용자(포트폴리오 생성) 및 관리자(대시보드) UI 렌더링.
  - 사용자 상호작용 및 폼 데이터 처리.
  - 백엔드 API와의 통신.

### 2. 백엔드 (Server)
- **프레임워크**: FastAPI (Python)
- **담당 역할**:
  - **API 게이트웨이**: 클라이언트의 모든 HTTP 요청 처리.
  - **AI 처리**: LangChain을 통해 Google Gemini와 연동하여 다음 기능 수행:
    - `Popo (포포)`: 포트폴리오 제작 도우미 코치 (챗봇).
    - `Mumu (무무)`: 포트폴리오 도슨트 (채용 담당자용 뷰어).
    - `Auto Generation`: 사용자 답변을 기반으로 포트폴리오 JSON 자동 생성.
  - **인증 및 사용자 관리**: 소셜 로그인(Google, Kakao, Naver) 처리 및 사용자 데이터 동기화.
  - **관리자 기능**: 통계, 사용자 관리, 공지사항, 템플릿 설정 API 제공.

### 3. 데이터 및 스토리지 (Data & Storage)
- **주 데이터베이스**: **Supabase (PostgreSQL)**
  - `notices`(공지), `ai_logs`(AI 로그), `template_config`(템플릿 설정) 및 동기화된 `user_profiles`/`portfolios` 저장.
- **로컬/개발 데이터베이스**: SQLite (`users.db`)
  - 로컬 개발 및 동기화 전 초기 사용자 데이터 저장용.

### 4. AI 엔진 (AI Engine)
- **서비스**: Google Gemini (via `langchain-google-genai`)
- **모델**: `gemini-flash-latest` (채팅 및 생성 속도 최적화 모델).
