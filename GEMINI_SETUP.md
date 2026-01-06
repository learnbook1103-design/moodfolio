# Gemini Flash API 설정 가이드

## 1. API 키 발급

1. [Google AI Studio](https://aistudio.google.com/app/apikey)에 접속
2. "Get API Key" 클릭
3. API 키 복사

## 2. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일 생성:

```bash
GEMINI_API_KEY=your_actual_api_key_here
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 3. 코드 수정 필요 사항

다음 파일들의 핸들러 함수를 `async`로 변경해야 합니다:

### `components/Step3Content.js` (Line 27)
```javascript
// 변경 전
const handleImportToStep3 = (text) => {

// 변경 후  
const handleImportToStep3 = async (text) => {
    const { refinedIntro, extractedData } = await simulateAIRefinement(text);
```

### `components/Step4Content.js` (Line 49)
```javascript
// 변경 전
const handleImportToStep4 = (text) => {

// 변경 후
const handleImportToStep4 = async (text) => {
    const { refinedProjects } = await simulateAIRefinement(text);
```

### `components/Step5Content.js` (Line 17)
```javascript
// 변경 전
const handleImportToStep5 = (text) => {

// 변경 후
const handleImportToStep5 = async (text) => {
    const { analyzedCoaching } = await simulateAIRefinement(text);
```

## 4. 서버 재시작

```bash
npm run dev
```

## 5. 테스트

1. `/survey` 페이지로 이동
2. Step 3에서 "이력서 가져오기" 클릭
3. 이력서 내용 붙여넣기
4. "내용 적용하기" 클릭
5. Gemini API가 자동으로 분석하여 필드 채움

## 작동 방식

- **Gemini API 성공**: 고품질 AI 분석 결과 사용
- **Gemini API 실패**: 자동으로 Regex 기반 추출로 폴백
- 사용자는 차이를 느끼지 못함 (Seamless Fallback)

## 프롬프트 커스터마이징

`pages/api/analyze-resume.js` 파일의 프롬프트를 수정하여:
- 더 감성적인 자기소개 생성
- 특정 산업 용어 강조
- 다른 형식의 출력 요청

가능합니다!
