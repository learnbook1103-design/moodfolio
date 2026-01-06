# 피어 비교 데이터 생성 가이드

## 📊 데이터 흐름 설명

### 1단계: 원본 데이터 (user_profiles 테이블)

피어 비교 데이터는 **`user_profiles` 테이블**에서 생성됩니다.

필요한 컬럼:
- `job_type` (VARCHAR) - 직군: 'developer', 'designer', 'marketer', 'service'
- `years_experience` (INTEGER) - 연차: 0~30
- `skills` (JSONB array) - 기술 목록: ["JavaScript", "React", "Node.js"]

**예시 데이터:**
```sql
-- user_profiles 테이블 예시
id  | job_type   | years_experience | skills
----|------------|------------------|---------------------------
1   | developer  | 3                | ["JavaScript", "React"]
2   | developer  | 3                | ["JavaScript", "Node.js"]
3   | developer  | 5                | ["Python", "Django"]
```

---

### 2단계: 데이터 집계 (refresh_peer_skill_stats 함수)

`refresh_peer_skill_stats()` 함수가 user_profiles 데이터를 집계하여 `peer_skill_stats` 테이블에 저장합니다.

**집계 로직:**
```sql
-- 각 (직군, 연차, 기술) 조합별로 집계
SELECT 
  job_type,           -- 직군
  years_experience,   -- 연차
  skill,              -- 기술 이름
  COUNT(*) as user_count,  -- 해당 기술 보유 사용자 수
  total_users,        -- 해당 코호트의 총 사용자 수
  adoption_rate       -- 보유율 (user_count / total_users)
FROM user_profiles
GROUP BY job_type, years_experience, skill
```

**결과 예시:**
```sql
-- peer_skill_stats 테이블
job_type   | years_experience | skill      | user_count | total_users | adoption_rate
-----------|------------------|------------|------------|-------------|---------------
developer  | 3                | JavaScript | 2          | 2           | 1.0 (100%)
developer  | 3                | React      | 1          | 2           | 0.5 (50%)
developer  | 3                | Node.js    | 1          | 2           | 0.5 (50%)
```

---

### 3단계: API 조회 (get-peer-comparison.js)

사용자가 "동료 비교" 탭을 클릭하면:

1. **API 호출**
   ```javascript
   fetch('/api/get-peer-comparison', {
     method: 'POST',
     body: JSON.stringify({
       jobType: 'developer',
       yearsExperience: 3,
       userSkills: ['JavaScript', 'React']
     })
   })
   ```

2. **데이터베이스 조회**
   ```sql
   SELECT * FROM peer_skill_stats
   WHERE job_type = 'developer' 
     AND years_experience = 3
   ORDER BY adoption_rate DESC
   ```

3. **응답 생성**
   - 인기 기술 Top 10
   - 사용자 순위 계산
   - 추천 기술 생성

---

## 🔧 현재 상태 확인

### user_profiles 테이블 확인

Supabase SQL Editor에서 실행:

```sql
-- 1. user_profiles 테이블 구조 확인
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_profiles';

-- 2. 필수 컬럼 존재 여부 확인
SELECT 
  COUNT(*) as total_users,
  COUNT(job_type) as has_job_type,
  COUNT(years_experience) as has_years_experience,
  COUNT(skills) as has_skills
FROM user_profiles;

-- 3. 샘플 데이터 확인
SELECT id, job_type, years_experience, skills
FROM user_profiles
LIMIT 5;
```

---

## ⚠️ 문제 해결

### 문제 1: user_profiles에 필수 컬럼이 없는 경우

**해결 방법:** 컬럼 추가 마이그레이션 실행

```sql
-- job_type 컬럼 추가
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS job_type VARCHAR(50);

-- years_experience 컬럼 추가
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS years_experience INTEGER;

-- skills 컬럼 추가
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]'::jsonb;
```

---

### 문제 2: user_profiles에 데이터가 없는 경우

**해결 방법:** 테스트 데이터 삽입

```sql
-- 테스트 사용자 데이터 삽입
INSERT INTO user_profiles (id, job_type, years_experience, skills)
VALUES 
  (gen_random_uuid(), 'developer', 3, '["JavaScript", "React", "Node.js", "TypeScript"]'::jsonb),
  (gen_random_uuid(), 'developer', 3, '["JavaScript", "React", "Vue.js", "CSS"]'::jsonb),
  (gen_random_uuid(), 'developer', 3, '["Python", "Django", "PostgreSQL", "Docker"]'::jsonb),
  (gen_random_uuid(), 'developer', 5, '["JavaScript", "React", "Node.js", "AWS"]'::jsonb),
  (gen_random_uuid(), 'designer', 2, '["Figma", "Photoshop", "Illustrator"]'::jsonb),
  (gen_random_uuid(), 'designer', 2, '["Sketch", "Figma", "Prototyping"]'::jsonb);
```

---

### 문제 3: 기존 사용자 데이터 업데이트

**온보딩 과정에서 수집된 데이터를 user_profiles에 저장해야 합니다.**

현재 온보딩에서 수집하는 정보:
- Step 1: 직무 선택 (job_type)
- Step 3: 연차 입력 (years_experience)
- Step 4: 기술 스택 입력 (skills)

**수정 필요한 파일:** `pages/onboarding.js` 또는 `lib/db.js`

```javascript
// 예시: 온보딩 완료 시 user_profiles 업데이트
await updateUserProfile(userId, {
  job_type: answers.job,
  years_experience: parseInt(answers.years_experience),
  skills: answers.skills // JSONB array 형태로 저장
});
```

---

## ✅ 데이터 생성 단계별 가이드

### Step 1: 마이그레이션 실행

Supabase SQL Editor에서:

```sql
-- peer_skill_stats.sql 파일 내용 전체 복사하여 실행
-- (이미 실행했다면 생략)
```

### Step 2: user_profiles 확인 및 수정

```sql
-- 필수 컬럼 확인
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
  AND column_name IN ('job_type', 'years_experience', 'skills');

-- 없으면 추가
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS job_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS years_experience INTEGER,
ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]'::jsonb;
```

### Step 3: 테스트 데이터 삽입 (선택)

```sql
-- 위의 "문제 2" 섹션의 INSERT 문 실행
```

### Step 4: 통계 데이터 생성

```sql
-- 피어 비교 통계 생성
SELECT refresh_peer_skill_stats();

-- 결과 확인
SELECT * FROM peer_skill_stats LIMIT 10;
```

### Step 5: 프론트엔드에서 확인

1. 로그인한 상태로 Result 페이지 접근
2. "동료 비교" 탭 클릭
3. 데이터 표시 확인

---

## 🔄 자동 업데이트 설정 (선택)

매일 자정에 통계를 자동으로 갱신:

```sql
SELECT cron.schedule(
  'refresh-peer-stats',
  '0 0 * * *',
  'SELECT refresh_peer_skill_stats();'
);
```

---

## 📍 현재 위치 확인

**현재 상태:**
- ✅ 테이블 생성: `peer_skill_stats`
- ✅ 함수 생성: `refresh_peer_skill_stats()`
- ✅ API 엔드포인트: `/api/get-peer-comparison`
- ✅ UI 컴포넌트: `RecommendationPanel.js`
- ❌ **데이터 없음**: `user_profiles`에 필수 컬럼 또는 데이터 부족

**다음 단계:**
1. `user_profiles` 테이블 확인
2. 필수 컬럼 추가 (없는 경우)
3. 테스트 데이터 삽입 또는 온보딩 로직 수정
4. `SELECT refresh_peer_skill_stats();` 실행
