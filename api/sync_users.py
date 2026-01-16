"""
Supabase Auth와 user_profiles 테이블 동기화 스크립트
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

print("=" * 60)
print("Supabase Auth vs user_profiles 동기화 분석")
print("=" * 60)

# 1. Auth 사용자 목록 가져오기
print("\n📋 Step 1: Fetching Auth users...")
try:
    auth_response = supabase.auth.admin.list_users()
    auth_users = auth_response
    auth_user_ids = {user.id for user in auth_users}
    print(f"✅ Found {len(auth_users)} users in Auth")
    for user in auth_users[:5]:  # 처음 5개만 표시
        print(f"   - {user.email} ({user.id})")
    if len(auth_users) > 5:
        print(f"   ... and {len(auth_users) - 5} more")
except Exception as e:
    print(f"❌ Failed to fetch auth users: {e}")
    exit(1)

# 2. user_profiles 목록 가져오기
print("\n📋 Step 2: Fetching user_profiles...")
try:
    profiles_response = supabase.table('user_profiles').select('id, email, name').execute()
    profiles = profiles_response.data
    profile_user_ids = {profile['id'] for profile in profiles}
    print(f"✅ Found {len(profiles)} profiles in user_profiles")
    for profile in profiles[:5]:  # 처음 5개만 표시
        print(f"   - {profile['email']} ({profile['id']})")
    if len(profiles) > 5:
        print(f"   ... and {len(profiles) - 5} more")
except Exception as e:
    print(f"❌ Failed to fetch user profiles: {e}")
    exit(1)

# 3. 차이점 분석
print("\n🔍 Step 3: Analyzing differences...")

# Auth에는 있지만 user_profiles에는 없는 사용자 (고아 Auth 계정)
orphan_auth_users = auth_user_ids - profile_user_ids
if orphan_auth_users:
    print(f"\n⚠️  Auth에만 있는 사용자 ({len(orphan_auth_users)}개):")
    for user_id in list(orphan_auth_users)[:10]:
        user = next((u for u in auth_users if u.id == user_id), None)
        if user:
            print(f"   - {user.email} ({user_id})")
    if len(orphan_auth_users) > 10:
        print(f"   ... and {len(orphan_auth_users) - 10} more")
else:
    print("\n✅ Auth에만 있는 사용자 없음")

# user_profiles에는 있지만 Auth에는 없는 사용자 (고아 프로필)
orphan_profiles = profile_user_ids - auth_user_ids
if orphan_profiles:
    print(f"\n⚠️  user_profiles에만 있는 사용자 ({len(orphan_profiles)}개):")
    for user_id in list(orphan_profiles)[:10]:
        profile = next((p for p in profiles if p['id'] == user_id), None)
        if profile:
            print(f"   - {profile['email']} ({user_id})")
    if len(orphan_profiles) > 10:
        print(f"   ... and {len(orphan_profiles) - 10} more")
else:
    print("\n✅ user_profiles에만 있는 사용자 없음")

# 4. 동기화 옵션 제시
print("\n" + "=" * 60)
print("동기화 옵션:")
print("=" * 60)

if orphan_auth_users:
    print(f"\n옵션 1: Auth에만 있는 {len(orphan_auth_users)}개 계정 삭제")
    print("   → 이 사용자들은 프로필이 없으므로 로그인해도 사용할 수 없습니다")

if orphan_profiles:
    print(f"\n옵션 2: user_profiles에만 있는 {len(orphan_profiles)}개 프로필 삭제")
    print("   → 이 프로필들은 Auth 계정이 없으므로 로그인할 수 없습니다")

if not orphan_auth_users and not orphan_profiles:
    print("\n✅ 모든 데이터가 동기화되어 있습니다!")

print("\n" + "=" * 60)
print("정리 스크립트를 실행하려면 cleanup_users.py를 실행하세요")
print("=" * 60)
