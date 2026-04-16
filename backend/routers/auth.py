from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from datetime import datetime
from database import get_db
from models.user import User
from models.audit import AuditLog
from auth_utils import verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["인증"])


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """로그인 처리 - SSO 전환 시 이 엔드포인트를 SSO 콜백으로 대체"""
    user = db.query(User).filter(User.email == request.email).first()
    if not user or not user.hashed_password:
        raise HTTPException(status_code=401, detail="이메일 또는 비밀번호가 올바르지 않습니다.")
    if not verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="이메일 또는 비밀번호가 올바르지 않습니다.")

    user.last_login = datetime.utcnow()
    db.add(AuditLog(actor=user.name, action_type="로그인", detail=f"{user.role} 로그인 성공", target="-", ip_address="0.0.0.0"))
    db.commit()

    token = create_access_token(data={"sub": str(user.id), "email": user.email, "role": user.role})
    return LoginResponse(
        access_token=token,
        token_type="bearer",
        user={
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "company": user.company,
            "role": user.role,
            "group_id": user.group_id,
            "status": user.status,
            "trust_level": user.trust_level,
            "two_fa": user.two_fa,
        },
    )


@router.post("/logout")
async def logout():
    """로그아웃 처리"""
    return {"message": "로그아웃되었습니다."}


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    """현재 로그인 사용자 정보 조회"""
    return {
        "id": current_user.id,
        "email": current_user.email,
        "name": current_user.name,
        "company": current_user.company,
        "role": current_user.role,
        "group_id": current_user.group_id,
        "status": current_user.status,
        "trust_level": current_user.trust_level,
        "two_fa": current_user.two_fa,
    }
