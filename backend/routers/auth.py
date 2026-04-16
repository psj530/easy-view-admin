from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/auth", tags=["인증"])


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict


class MeResponse(BaseModel):
    id: int
    email: str
    name: str
    company: str
    role: str


# 현재 로그인된 사용자 (Mock)
CURRENT_USER = {
    "id": 1,
    "email": "admin@seah.co.kr",
    "name": "김관리",
    "company": "SeAH",
    "role": "admin",
    "group_id": 1,
    "status": "active",
    "trust_level": "high",
    "two_fa": True,
}


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """로그인 처리"""
    # Mock: 이메일/비밀번호 검증 없이 토큰 발급
    if request.email and request.password:
        return LoginResponse(
            access_token="mock-jwt-token-for-prototype",
            token_type="bearer",
            user=CURRENT_USER,
        )
    raise HTTPException(status_code=401, detail="이메일 또는 비밀번호가 올바르지 않습니다.")


@router.post("/logout")
async def logout():
    """로그아웃 처리"""
    return {"message": "로그아웃되었습니다."}


@router.get("/me")
async def get_current_user():
    """현재 로그인 사용자 정보 조회"""
    return CURRENT_USER
