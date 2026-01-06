# MoodFolio Copilot Instructions

## Project Overview

**MoodFolio** is a mood-driven portfolio generator that creates personalized portfolio websites based on user input. It's a Next.js + Python/FastAPI application where users answer questions about their career and then receive an AI-generated portfolio with mood-specific design themes.

## Architecture Layers

### Frontend (Next.js + React)
- **Entry Point:** `pages/index.js` (landing page with sign-in button)
- **Onboarding Flow:** `pages/step1.js` → `step5.js` (multi-page form collecting career data)
- **Final Step:** `pages/complete.js` (data review before AI submission)
- **Result Display:** `pages/result.js` (renders generated portfolio with mood-based theming)
- **Global Setup:** `pages/_app.js` (authentication providers, font loading, chatbot integration)

### Components
- **Form Components:** `HeroSection.js` (text inputs), `MoodEffectLayer.js` (visual effects)
- **Editors:** `PortfolioEditor.js` (allows users to change job category/template post-generation)
- **Templates:** `components/templates/` - 12 job-specific portfolio templates:
  - **Developer:** `DeveloperTimelineTemplate` | `DeveloperBentoTemplate` (draggable grid) | `DeveloperDocsTemplate`
  - **Designer:** `DesignerGalleryTemplate` (with edit mode) | `DesignerMagazineTemplate` | `DesignerCaseStudyTemplate`
  - **Marketer:** `MarketerDashboardTemplate` (with edit mode) | `MarketerDeckTemplate` | `MarketerFeedTemplate`
  - **Service Manager:** `ServiceJourneyTemplate` | `ServiceRoadmapTemplate` | `ServiceWikiTemplate`
- **Theme System:** `moodColorMap.js` (7 mood tags with Tailwind color schemes: #차분한, #열정적인, #신뢰감있는, #힙한, #창의적인, #미니멀한, #클래식한)
- **Chat:** `ChatWidget.js` (persistent on all pages)

### Backend (FastAPI + Python)
**File:** `backend/main.py` (single-file architecture)

**Key Services:**
1. **Authentication APIs:** Email signup/login, Google/Kakao/Naver OAuth
2. **AI Portfolio Generation:** `/submit` endpoint calls Gemini Flash with user answers, returns JSON schema with theme/hero/about/projects/contact
3. **Chat API:** `/chat` endpoint for chatbot responses (integrated in `ChatWidget.js`)

**Database:** SQLite (`users.db`) with single `User` table (id, email, password, name)

## Data Flow

```
Landing → Signup/Auth → Steps 1-5 (form) → Complete (review) 
→ POST /submit (backend) → Gemini AI processes → JSON portfolio
→ localStorage ('portfolio_data') → Result page renders
```

**State Management:** 
- Global state in `_app.js` via `answers` prop drilled to all pages
- Persistent storage: `localStorage.setItem('portfolio_data', JSON.stringify(userData))`
- Automatic save on `result.js` on any user edit

## Critical Patterns & Conventions

### Job/Template Mapping
See `PortfolioEditor.js` `TEMPLATE_OPTIONS` constant:
- Job categories: `developer`, `designer`, `marketer`, `service`
- Each job has 3 template strengths (e.g., `problem`, `impl`, `tech` for developers)
- **Designer projects:** 6 items (vs. 3 for others) - checked via `.includes('design')`

### Mood Theming
- Mood tags stored as `answers.moods` (array, typically 1 selected)
- Color mapping in `moodColorMap.js`: each mood maps to gradient, text highlight, accent ring, pill style, glow color
- Applied dynamically to `headerGradient`, `textHighlight`, etc. in template components

### Form Fields Naming Convention
```javascript
// Personal info
answers.name, answers.email, answers.phone, answers.intro, answers.job

// Career
answers.career_summary

// Projects (generic)
answers.project1_title, answers.project1_desc, project2_title, project2_desc, project3_title, project3_desc

// Designer projects (6 items)
answers.design_project1_title, design_project1_desc, ... design_project6_desc

// Visual choices
answers.moods (array), answers.strength (template ID), answers.bgm (music choice)
```

### Backend Integration
- Backend **ONLY** at `/submit` endpoint; returns Gemini-generated JSON with theme/hero/about/projects/contact
- No direct API calls in frontend for portfolio rendering—AI JSON drives `result.js`
- Chat is separate `/chat` endpoint (message → response)

### Edit Mode
- `PortfolioEditor.js` supports changing job/template dynamically
- Some templates (`DesignerGalleryTemplate`, `MarketerDashboardTemplate`, `DeveloperBentoTemplate`) accept `isEditing` prop
- `result.js` toggles `isEditing` state and re-renders template accordingly

## Critical Build & Run Commands

```bash
# Frontend
npm run dev          # Start Next.js on port 3000
npm run build        # Production build
npm run lint         # ESLint check

# Backend (separate process)
cd backend && python main.py  # Start FastAPI on http://127.0.0.1:8000
```

**Important:** Backend must be running for `/submit` (portfolio generation) to work. Users see error "서버 연결 실패!" if backend is down.

## Key Dependencies

- **Next.js 16.0.6**, **React 19.2.0** - Framework & UI
- **Framer Motion** - Animations (used extensively in hero sections, transitions)
- **React Grid Layout** - Bento template draggable grid (requires CSS imports in `_app.js`)
- **Google Generative AI (Gemini Flash)** - Portfolio content generation
- **SQLAlchemy + SQLite** - User persistence (minimal)
- **Tailwind CSS 4** - Styling (no custom theme overrides; uses Tailwind utilities + custom font vars)

## Common Developer Tasks

### Adding a New Template
1. Create `components/templates/NewTemplate.js` (export default component receiving `{answers}` and optional `isEditing`)
2. Import in `result.js` alongside other templates
3. Add to `TEMPLATE_OPTIONS` in `PortfolioEditor.js` with job category and template ID
4. Template should use mood colors from `moodColorMap.js` (destructure via `const theme = moodThemes[currentMood]`)

### Modifying Form Questions
1. Edit relevant step page (`pages/step1-5.js`)
2. Update `PortfolioEditor.js` if field affects template selection
3. **Ensure backend `main.py` `/submit` handler extracts new fields** when building `projects_str` or prompt input

### Testing AI Output
- Check `backend/user_data.json` (currently empty; intended to store last request)
- Backend logs "📢 [생성 요청] AI 작업 시작..." on successful submission
- JSON validation happens server-side; frontend shows "AI가 빈 응답을 보냈습니다" if response is malformed

## Localization Notes
- UI text is primarily **Korean** with English labels in some components
- Comments in code are bilingual (Korean intent, English implementation notes)
- Font setup uses Noto Sans KR + Gowun Batang for Korean typography

## Known Constraints
- **SQLite limitation:** Not suitable for production scale; replace with PostgreSQL for deployment
- **No authentication state persistence:** Tokens not stored; user must re-authenticate on page refresh
- **CORS wide-open:** Backend allows all origins (`allow_origins=["*"]`) for development
- **No error boundary:** Frontend has minimal error handling; crashed AI requests show generic message
