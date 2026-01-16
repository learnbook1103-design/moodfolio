from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import sys
import traceback

# 현재 디렉토리(api/)의 모듈을 찾을 수 있게 설정
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

try:
    # 이제 같은 api/ 폴더 안에 main.py가 있으므로 바로 import 가능
    from main import app
    
    # Vercel Serverless를 위한 추가 설정 (CORS 등)
    origins = [
        "*",
        "https://moodfolio-v2.vercel.app",
        "http://localhost:3000"
    ]

    # main.py에도 CORS가 있지만 여기서도 확실히 적용
    if not any(m.cls == CORSMiddleware for m in app.user_middleware):
        app.add_middleware(
            CORSMiddleware,
            allow_origins=origins,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

except Exception as e:
    # If app fails to import or initialize, creating a fallback app to report the error
    app = FastAPI()
    error_msg = f"Startup Error: {str(e)}\n{traceback.format_exc()}"
    print(error_msg)
    
    @app.api_route("/{path_name:path}", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"])
    async def catch_all(path_name: str):
        return JSONResponse(
            status_code=200, # Return 200 so we can see the JSON in browser even if it failed
            content={
                "status": "error",
                "message": "Backend failed to start",
                "detail": error_msg,
                "path": path_name
            }
        )
