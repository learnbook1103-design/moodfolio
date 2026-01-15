# 시스템 유즈케이스 다이어그램 (System Use Case Diagram)

## 개요 (Overview)
이 시스템은 **일반 사용자 (구직자)**, **채용 담당자 (뷰어)**, **관리자**의 세 가지 주요 액터를 대상으로 합니다.

## 유즈케이스 다이어그램

```mermaid
usecaseDiagram
    actor "사용자 (Job Seeker)" as User
    actor "채용 담당자 (Viewer)" as Viewer
    actor "관리자 (Admin)" as Admin

    package "MoodFolio 시스템" {
        %% User Actions
        usecase "회원가입 / 로그인" as UC1
        usecase "포트폴리오 생성" as UC2
        usecase "AI 코치(포포)와 채팅" as UC3
        usecase "포트폴리오 저장/불러오기" as UC4
        usecase "포트폴리오 공유" as UC5

        %% Viewer Actions
        usecase "포트폴리오 열람" as UC6
        usecase "AI 도슨트(무무)와 채팅" as UC7

        %% Admin Actions
        usecase "대시보드 통계 조회" as UC8
        usecase "사용자 관리" as UC9
        usecase "공지사항 관리" as UC10
        usecase "템플릿 관리" as UC11
    }

    %% Relationships
    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5

    Viewer --> UC6
    Viewer --> UC7

    Admin --> UC8
    Admin --> UC9
    Admin --> UC10
    Admin --> UC11

    %% Includes / Extends (Optional Detail)
    UC2 ..> UC3 : "도움 받기"
    UC6 ..> UC7 : "심층 이해"
```

## 주요 유즈케이스 (Major Use Cases)

### 1. 사용자 (Job Seeker)
- **포트폴리오 생성**: 사용자가 경력 데이터를 입력하면 AI가 구조화된 JSON 포트폴리오를 생성합니다.
- **AI 코치(포포)와 채팅**: '포포' 페르소나로부터 포트폴리오 내용에 대한 실시간 조언과 피드백을 받습니다.
- **저장/불러오기**: 작업 진행 상황을 저장하고 나중에 다시 불러올 수 있습니다.

### 2. 채용 담당자 (Viewer)
- **포트폴리오 열람**: 공유 링크를 통해 정돈된 사용자 포트폴리오를 조회합니다.
- **AI 도슨트(무무)와 채팅**: 채용 담당자가 후보자에 대해 질문하면, '무무'가 포트폴리오 데이터에 기반하여 검증된 정보를 답변합니다.

### 3. 관리자 (Administrator)
- **대시보드**: 시스템 통계(사용자 수, AI 사용 로그 등)를 조회합니다.
- **관리 기능**:
  - **공지사항**: 시스템 공지사항을 작성하고 관리합니다.
  - **템플릿**: 특정 포트폴리오 템플릿의 사용 가능 여부를 설정합니다.
  - **사용자**: 필요 시 사용자 계정을 모니터링하거나 삭제합니다.
