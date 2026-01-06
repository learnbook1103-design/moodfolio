# Database Migration Guide

## 🎯 목적
프로젝트 테이블에 새로운 필드 추가하여 채용담당자에게 유용한 정보 제공

## 📋 추가되는 필드
1. `role` - 프로젝트에서의 역할
2. `tech_stack` - 사용 기술 스택
3. `team_size` - 팀 규모
4. `github_url` - GitHub 저장소 URL
5. `live_url` - 라이브 배포 URL
6. `achievements` - 주요 성과

## 🚀 마이그레이션 실행 방법

### Option 1: Supabase Dashboard (추천)

1. **Supabase 대시보드 접속**
   - https://supabase.com 로그인
   - 프로젝트 선택

2. **SQL Editor 열기**
   - 왼쪽 메뉴에서 "SQL Editor" 클릭
   - "New query" 버튼 클릭

3. **마이그레이션 스크립트 실행**
   - `migrations/add_enhanced_project_fields.sql` 파일 내용 복사
   - SQL Editor에 붙여넣기
   - "Run" 버튼 클릭 (또는 Ctrl+Enter)

4. **결과 확인**
   - 성공 메시지 확인
   - 하단의 검증 쿼리 결과에서 6개 컬럼이 표시되는지 확인

### Option 2: Supabase CLI (개발자용)

```bash
# Supabase CLI 설치 (아직 안 했다면)
npm install -g supabase

# 프로젝트 연결
supabase link --project-ref [YOUR_PROJECT_REF]

# 마이그레이션 실행
supabase db push

# 또는 직접 SQL 실행
supabase db execute -f migrations/add_enhanced_project_fields.sql
```

## ✅ 마이그레이션 후 확인사항

### 1. 스키마 확인
Supabase Dashboard → Table Editor → projects 테이블 선택
→ 새로운 6개 컬럼이 추가되었는지 확인

### 2. 데이터 테스트
1. 마이페이지에서 프로젝트 추가/수정
2. 모든 새 필드에 데이터 입력
3. 저장 후 Supabase에서 데이터 확인

### 3. 챗봇 테스트
1. 공유 링크 생성
2. 챗봇에게 질문:
   - "어떤 기술을 사용했나요?"
   - "팀 프로젝트 경험이 있나요?"
   - "주요 성과가 뭐예요?"

## 🔄 롤백 방법 (문제 발생 시)

```sql
-- 새로 추가한 컬럼 제거
ALTER TABLE projects 
DROP COLUMN IF EXISTS role,
DROP COLUMN IF EXISTS tech_stack,
DROP COLUMN IF EXISTS team_size,
DROP COLUMN IF EXISTS github_url,
DROP COLUMN IF EXISTS live_url,
DROP COLUMN IF EXISTS achievements;
```

## 📝 주의사항

- ✅ 기존 프로젝트 데이터는 영향받지 않음 (새 컬럼은 NULL 허용)
- ✅ 백워드 호환성 유지 (기존 코드 정상 작동)
- ✅ 프로덕션 환경에서는 백업 후 실행 권장

## 🎉 완료 후
마이그레이션이 성공하면 사용자들이 프로젝트에 더 상세한 정보를 입력할 수 있고,
채용담당자는 챗봇을 통해 더 구체적인 정보를 얻을 수 있습니다!
