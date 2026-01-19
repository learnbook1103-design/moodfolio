# Moodfolio Work Migration Guide

This guide describes how to continue working on the Moodfolio project on a different PC.

## 1. Repository Access
Your code and documentation are synced to the following GitHub repository:
- **URL**: https://github.com/learnbook1103-design/moodfolio.git
- **Branch**: main

## 2. Setup on New PC

### Prerequisites
- Install [Node.js](https://nodejs.org/) (version 18+ recommended)
- Install [Python](https://www.python.org/) (version 3.8+ recommended)
- Install Git

### Cloning the Repository
Open a terminal (Command Prompt, PowerShell, or Git Bash) and run:
```bash
git clone https://github.com/learnbook1103-design/moodfolio.git
cd moodfolio
```

### Environment Configuration
The `.env` files contain sensitive API keys and are NOT included in the repository for security. You must recreate them.

1.  **Frontend (`.env.local`)**:
    Create a file named `.env.local` in the root directory.
    Copy the contents from `.env.example` (if available) or add your keys manually:
    ```
    NEXT_PUBLIC_GOOGLE_API_KEY=your_key_here
    NEXT_PUBLIC_API_URL=http://localhost:8000
    # Add other keys as needed (Supabase, etc.)
    ```

2.  **Backend (`.env`)**:
    If running the Python backend locally, create a `.env` file in the root (or `backend/` if using that folder structure).

### Dependencies Installation

**Frontend**:
```bash
npm install
```

**Backend (Python)**:
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install requirements
pip install -r requirements.txt
```

## 3. Running the Project

**Frontend**:
```bash
npm run dev
```
Access at: http://localhost:3000

**Backend**:
```bash
# Ensure venv is active
uvicorn api.index:app --reload
# OR if using main.py in root/backend
# python main.py
```
*(Check `package.json` scripts or `README.md` for specific start commands)*

## 4. Work Status & Documentation
All development logs and status documents are located in the `portfolio_docs/` folder.
- `portfolio_docs/wbs_structure.md`: Work Breakdown Structure
- `portfolio_docs/troubleshooting_log.md`: Issues and fixes

## 5. Database
- **SQLite**: The `users.db` file is included in the repository. It will contain the data from the last commit.
- **Supabase**: If connected to Supabase, data will be accessible automatically via the connection string in your `.env` file.
