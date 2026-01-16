"""
AI 로그 테스트 스크립트
"""
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

# Supabase 클라이언트 초기화
supabase_url = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not supabase_url or not service_key:
    print("❌ Supabase credentials not found")
    exit(1)

supabase = create_client(supabase_url, service_key)

# 1. 테스트 로그 삽입
print("📝 Inserting test AI log...")
try:
    result = supabase.table('ai_logs').insert({
        "prompt_type": "test",
        "model_name": "gemini-flash",
        "status": "success"
    }).execute()
    print(f"✅ Test log inserted: {result.data}")
except Exception as e:
    print(f"❌ Failed to insert test log: {e}")

# 2. 로그 조회
print("\n📊 Fetching AI logs...")
try:
    result = supabase.table('ai_logs').select('*').order('created_at', desc=True).limit(10).execute()
    print(f"✅ Found {len(result.data)} logs:")
    for log in result.data:
        print(f"  - {log['prompt_type']} ({log['model_name']}) at {log['created_at']}")
except Exception as e:
    print(f"❌ Failed to fetch logs: {e}")

# 3. 통계 집계
print("\n📈 Aggregating statistics...")
try:
    result = supabase.table('ai_logs').select('*').execute()
    logs = result.data
    
    stats = {
        "total_requests": len(logs),
        "by_type": {},
        "by_model": {}
    }
    
    for log in logs:
        p_type = log.get('prompt_type', 'unknown')
        model = log.get('model_name', 'unknown')
        
        stats['by_type'][p_type] = stats['by_type'].get(p_type, 0) + 1
        stats['by_model'][model] = stats['by_model'].get(model, 0) + 1
    
    print(f"✅ Statistics:")
    print(f"  Total requests: {stats['total_requests']}")
    print(f"  By type: {stats['by_type']}")
    print(f"  By model: {stats['by_model']}")
except Exception as e:
    print(f"❌ Failed to aggregate stats: {e}")
