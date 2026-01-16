# Python 환경 설정 가이드

## 현재 상황
Python이 시스템에 설치되어 있지 않아 백엔드 서버를 실행할 수 없습니다.

## 해결 방법

### 1️⃣ Python 설치

**방법 A: Microsoft Store (추천 - 가장 쉬움)**
1. Windows 검색에서 "Microsoft Store" 실행
2. "Python 3.12" 검색
3. "Python 3.12" 설치 (무료)
4. 설치 완료 후 PowerShell 재시작

**방법 B: 공식 웹사이트**
1. https://www.python.org/downloads/ 접속
2. "Download Python 3.12.x" 클릭
3. 설치 파일 실행
4. ⚠️ **중요**: "Add Python to PATH" 체크박스 반드시 선택!
5. "Install Now" 클릭

### 2️⃣ 설치 확인

PowerShell을 **새로 열고** 실행:
```powershell
python --version
```

출력 예시: `Python 3.12.x`

### 3️⃣ 가상환경 생성 및 의존성 설치

```powershell
# backend 폴더로 이동
cd c:\Users\PC\moodfolio\backend

# 가상환경 생성
python -m venv venv

# 가상환경 활성화
.\venv\Scripts\Activate.ps1

# 의존성 설치
pip install -r requirements.txt
```

### 4️⃣ 환경 변수 설정

`backend` 폴더에 `.env` 파일 생성:
```
GOOGLE_API_KEY=your_google_api_key_here
```

### 5️⃣ 서버 실행

```powershell
# 가상환경이 활성화된 상태에서
uvicorn main:app --reload
```

성공 시 출력:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

---

## 빠른 테스트 (Python 없이)

Python 설치가 번거롭다면, 프론트엔드만으로 UI 테스트 가능:

1. `http://localhost:3000/result?share=true` 접속
2. 챗봇 버튼 확인 (파란색 문서 아이콘)
3. UI/UX 확인

⚠️ 단, 메시지 전송은 백엔드 없이 작동하지 않음

---

## 문제 해결

### PowerShell 실행 정책 오류
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### pip 업그레이드
```powershell
python -m pip install --upgrade pip
```

### requirements.txt 내용
```
fastapi
uvicorn
sqlalchemy
passlib[bcrypt]
python-dotenv
langchain-google-genai
langchain-core
google-auth
requests
```
