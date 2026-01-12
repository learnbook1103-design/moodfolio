# 🛠️ 프로젝트 트러블슈팅 및 해결 사례 모음
(Project Challenges & Solutions)

프로젝트 개발 과정에서 발생한 주요 기술적 문제들과 이를 해결하기 위해 적용한 솔루션을 정리한 문서입니다.

---

## 1. 백엔드 환경 변수 인코딩 문제 (Critical)
**증상**:
- `.env` 파일에 `GOOGLE_API_KEY`가 정확히 존재함에도 불구하고, 서버 시작 시 `ValueError: API Key not found` 에러가 발생하며 서버가 중단됨.

**원인**:
- Windows 환경에서 `.env` 파일을 저장할 때, 눈에 보이지 않는 **BOM(Byte Order Mark)** 문자가 파일 맨 앞에 포함됨 (`\ufeffGOOGLE_API_KEY=...`).
- Python의 기본 `os.getenv`나 `python-dotenv` 라이브러리가 BOM을 공백이나 다른 문자로 처리하지 못해 키 값을 인식하지 못함.

**해결 (Solution)**:
- 라이브러리 의존성을 제거하고, Python 표준 입출력을 사용하여 직접 파싱 로직을 구현.
- `open(..., encoding='utf-8-sig')` 옵션을 사용하여 BOM을 자동으로 제거하고 읽도록 처리.
- **결과**: 어떤 OS나 에디터에서 저장하더라도 안정적으로 환경 변수를 로드하도록 개선.

---

## 2. API 보안 및 접근 권한 분리 (Architecture)
**증상**:
- 초기에는 `/admin/templates/config` 하나의 API로 템플릿 설정을 관리함.
- 포트폴리오 생성 페이지(Public)에서도 템플릿 사용 가능 여부를 확인해야 하는데, 해당 API는 **관리자 토큰(Admin Token)**을 요구하여 접근 불가능(403 Forbidden).

**원인**:
- 읽기(Read)와 쓰기(Write) 권한에 대한 엔드포인트 분리가 되어 있지 않음.

**해결 (Solution)**:
- **CQRS(명령과 조회의 책임 분리) 패턴**을 일부 차용하여 API를 분리.
    1. **Public API** (`GET /api/templates/config`): 인증 없이 누구나 현재 활성화된 템플릿 목록 조회 가능.
    2. **Admin API** (`PUT /admin/templates/config/{key}`): 관리자 토큰 검증 미들웨어를 통과해야만 상태 변경 가능.
- **결과**: 일반 사용자는 템플릿 목록을 자유롭게 조회하고, 관리자는 안전하게 설정을 변경할 수 있는 구조 확립.

---

## 3. 관리자 대시보드 시인성 문제 (UI/UX)
**증상**:
- 관리자 페이지의 배경에 무드 효과(이미지/그라디언트)가 적용되어 있어, "공지사항 관리" 등의 흰색 텍스트 제목이 배경색에 묻혀 잘 보이지 않음.

**원인**:
- 텍스트와 배경 간의 명도 대비(Contrast) 부족.

**해결 (Solution)**:
- Tailwind CSS의 **Drop Shadow** 유틸리티를 커스텀하여 적용 (`drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]`).
- 단순 `text-shadow`보다 더 진하고 부드러운 그림자를 주어, 어떤 배경 이미지 위에서도 글자가 선명하게 뜨도록(Pop-out) 처리.
- **결과**: 대시보드 내 5개 주요 섹션(대시보드, 사용자, 포트폴리오, 공지사항, 템플릿)의 가독성 대폭 개선.

---

## 4. 협업을 위한 Git 리모트 전략 (DevOps)
**문제**:
- 포트폴리오용으로 코드를 정리해서 공유하고 싶지만, 로컬 개발 히스토리(많은 시행착오 커밋)와 민감한 설정이 모두 포함된 기존 저장소를 그대로 노출하기 부담스러움.

**해결 (Solution)**:
- **이중 리모트(Dual Remote) 전략** 도입:
    1. `main-repo`: 개인 작업 내역보존용 (Private/Origin).
    2. `invite-repo` (또는 public): 제출 및 공유를 위한 깔끔한 저장소 (Push 전용).
- **.env.example 도입**:
    - 실제 키가 들어있는 `.env`는 `.gitignore`로 제외시키고, 키 이름만 명시된 `.env.example`을 생성하여 공유 저장소에 업로드.
    - 다른 개발자(또는 면접관)가 `git clone` 후 바로 설정할 수 있도록 가이드 문서(`portfolio_docs`) 포함.
