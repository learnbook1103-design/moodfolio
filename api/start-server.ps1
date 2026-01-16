# Backend Server Start Script
# This script starts the FastAPI backend server with network access enabled

Write-Host "🚀 Starting MoodFolio Backend Server..." -ForegroundColor Cyan
Write-Host "📡 Server will be accessible from other devices on the network" -ForegroundColor Green
Write-Host ""

# Activate virtual environment
& .\venv\Scripts\Activate.ps1

# Start uvicorn with network access
uvicorn main:app --reload --host 0.0.0.0 --port 8000
