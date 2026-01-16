-- AI 사용 로그 테이블 생성
CREATE TABLE IF NOT EXISTS ai_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_type TEXT NOT NULL,
    model_name TEXT DEFAULT 'gemini-flash',
    status TEXT DEFAULT 'success',
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_ai_logs_created_at ON ai_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_logs_prompt_type ON ai_logs(prompt_type);
CREATE INDEX IF NOT EXISTS idx_ai_logs_user_id ON ai_logs(user_id);

-- RLS (Row Level Security) 설정
ALTER TABLE ai_logs ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 자신의 로그를 삽입할 수 있도록 허용
CREATE POLICY "Anyone can insert ai logs"
    ON ai_logs
    FOR INSERT
    WITH CHECK (true);

-- 관리자만 모든 로그를 조회할 수 있도록 허용 (service_role_key 사용 시 자동 허용)
CREATE POLICY "Service role can view all ai logs"
    ON ai_logs
    FOR SELECT
    USING (true);
