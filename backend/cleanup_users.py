"""
고아 Auth 계정 정리 스크립트
Auth에는 있지만 user_profiles에는 없는 계정들을 삭제합니다.
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
print("고아 Auth 계정 정리")
print("=" * 60)

# 1. Auth 사용자 목록 가져오기
print("\n📋 Fetching Auth users...")
try:
    auth_response = supabase.auth.admin.list_users()
    auth_users = auth_response
    auth_user_ids = {user.id for user in auth_users}
    print(f"✅ Found {len(auth_users)} users in Auth")
except Exception as e:
    print(f"❌ Failed to fetch auth users: {e}")
    exit(1)

# 2. user_profiles 목록 가져오기
print("\n📋 Fetching user_profiles...")
try:
    profiles_response = supabase.table('user_profiles').select('id, email').execute()
    profiles = profiles_response.data
    profile_user_ids = {profile['id'] for profile in profiles}
    print(f"✅ Found {len(profiles)} profiles in user_profiles")
except Exception as e:
    print(f"❌ Failed to fetch user profiles: {e}")
    exit(1)

# 3. 고아 Auth 계정 찾기
orphan_auth_users = auth_user_ids - profile_user_ids

if not orphan_auth_users:
    print("\n✅ 정리할 고아 계정이 없습니다!")
    exit(0)

print(f"\n⚠️  발견된 고아 Auth 계정: {len(orphan_auth_users)}개")
print("\n삭제될 계정 목록:")
for user_id in orphan_auth_users:
    user = next((u for u in auth_users if u.id == user_id), None)
    if user:
        print(f"   - {user.email} ({user_id})")

# 4. 사용자 확인
print("\n" + "=" * 60)
response = input(f"정말로 {len(orphan_auth_users)}개의 고아 Auth 계정을 삭제하시겠습니까? (yes/no): ")

if response.lower() != 'yes':
    print("\n❌ 취소되었습니다.")
    exit(0)

# 5. 삭제 실행
print("\n🗑️  삭제 시작...")
deleted_count = 0
failed_count = 0
failed_users = []

for user_id in orphan_auth_users:
    user = next((u for u in auth_users if u.id == user_id), None)
    try:
        supabase.auth.admin.delete_user(user_id)
        deleted_count += 1
        print(f"✅ Deleted: {user.email if user else user_id}")
    except Exception as e:
        failed_count += 1
        failed_users.append((user.email if user else user_id, str(e)))
        print(f"❌ Failed to delete {user.email if user else user_id}: {e}")

# 6. 결과 요약
print("\n" + "=" * 60)
print("정리 완료!")
print("=" * 60)
print(f"✅ 삭제 성공: {deleted_count}개")
print(f"❌ 삭제 실패: {failed_count}개")

if failed_users:
    print("\n실패한 계정:")
    for email, error in failed_users:
        print(f"   - {email}: {error}")

print("\n최종 상태:")
print(f"   Auth 사용자: {len(auth_users)} → {len(auth_users) - deleted_count}")
print(f"   user_profiles: {len(profiles)}")
print(f"   동기화 상태: {'✅ 완료' if deleted_count == len(orphan_auth_users) else '⚠️ 일부 실패'}")
