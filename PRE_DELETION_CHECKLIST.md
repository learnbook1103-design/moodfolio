# 🚨 FINAL MIGRATION CHECKLIST BEFORE DELETION

**STOP! READ THIS BEFORE DELETING YOUR FOLDER.**

You are about to wipe your local environment. Ensure you have backed up the following **sensitive files** which are NOT stored in GitHub.

## 1. Backup Environment Variables (Manual Action Required)

The following files contain your API Keys and Secrets. **They are ignored by Git.** You must copy their contents to a safe place (e.g., Notion, Memo, or transfer securely to your new PC) manually.

### Frontend Config: `.env.local`
Location: `C:\Users\PC\moodfolio\.env.local`
**Action**: Open this file and save the content. It contains:
- `GEMINI_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- OAuth Client IDs (Google, Kakao, Naver)

### Backend Config: `api/.env`
Location: `C:\Users\PC\moodfolio\api\.env`
**Action**: Open this file and save the content. It contains:
- `SUPABASE_SERVICE_ROLE_KEY` (Critical for admin access)
- `GOOGLE_API_KEY`

## 2. Verify Database Status
Your database file `users.db` IS currently tracked in Git.
- Location: `C:\Users\PC\moodfolio\api\users.db`
- **Note**: Since this is a binary file, merge conflicts can occur. If you have critical recent data in your local SQLite DB that hasn't been pushed, ensure you push now.
- *Recommendation*: If you are using Supabase, your main data is already safe in the cloud. `users.db` is likely just for local development testing.

## 3. Final Sync (Git Push)
Your local branch is ahead of the remote. You **MUST** run the push command successfully before deleting.

1.  Open Terminal.
2.  Run:
    ```bash
    git push main-repo main
    ```
3.  If asked for username/password, provide your GitHub credentials.

## 4. Verify on GitHub
Visit [https://github.com/learnbook1103-design/moodfolio](https://github.com/learnbook1103-design/moodfolio) and confirm that:
1.  This file (`PRE_DELETION_CHECKLIST.md`) exists.
2.  Your latest code changes are visible.

**Once steps 1-4 are done, it is safe to delete the `moodfolio` folder.**
