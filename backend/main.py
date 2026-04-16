from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from routers import auth, users, groups, permissions, requests, audit

app = FastAPI(
    title="EasyView Admin API",
    description="EasyView 관리자 포털 백엔드 API",
    version="1.0.0",
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(groups.router)
app.include_router(permissions.router)
app.include_router(requests.router)
app.include_router(audit.router)


@app.on_event("startup")
async def startup_event():
    """애플리케이션 시작 이벤트"""
    print("EasyView Admin API 서버가 시작되었습니다.")


@app.get("/")
async def root():
    """API 상태 확인"""
    return {
        "name": "EasyView Admin API",
        "version": "1.0.0",
        "status": "running",
    }


@app.get("/api/health")
async def health_check():
    """헬스 체크 엔드포인트"""
    return {"status": "healthy"}
