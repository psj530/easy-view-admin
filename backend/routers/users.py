from fastapi import APIRouter, HTTPException, Query, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from datetime import datetime, timedelta
from database import get_db
from models.user import User
from models.audit import AuditLog
from schemas.user import UserCreate, UserUpdate, UserResponse, UserListResponse
from auth_utils import hash_password, get_current_user

router = APIRouter(prefix="/api/users", tags=["사용자 관리"])


@router.get("", response_model=UserListResponse)
async def get_users(
    search: Optional[str] = Query(None),
    company: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """사용자 목록 조회"""
    query = db.query(User)
    if search:
        query = query.filter(or_(User.name.ilike(f"%{search}%"), User.email.ilike(f"%{search}%")))
    if company:
        query = query.filter(User.company == company)
    if role:
        query = query.filter(User.role == role)
    if status:
        query = query.filter(User.status == status)

    users = query.order_by(User.id).all()
    user_list = []
    for u in users:
        user_list.append({
            "id": u.id, "email": u.email, "name": u.name, "company": u.company,
            "group_id": u.group_id, "role": u.role, "status": u.status,
            "trust_level": u.trust_level, "two_fa": u.two_fa,
            "password_expiry": str(u.password_expiry) if u.password_expiry else None,
            "last_login": str(u.last_login) if u.last_login else None,
            "created_at": str(u.created_at) if u.created_at else None,
        })
    return UserListResponse(users=user_list, total=len(user_list))


@router.post("", response_model=UserResponse, status_code=201)
async def create_user(
    user: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """사용자 생성"""
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="이미 등록된 이메일입니다.")

    new_user = User(
        email=user.email, name=user.name, company=user.company,
        group_id=user.group_id, role=user.role, status="active",
        hashed_password=hash_password(user.password) if user.password else None,
        password_expiry=datetime.utcnow() + timedelta(days=365),
    )
    db.add(new_user)
    db.add(AuditLog(actor=current_user.name, action_type="사용자 생성", detail=f"{user.name} ({user.email}) 사용자 생성", target=user.name))
    db.commit()
    db.refresh(new_user)
    return _user_to_response(new_user)


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """사용자 상세 조회"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
    return _user_to_response(user)


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """사용자 정보 수정"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    update_data = user_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)
    db.add(AuditLog(actor=current_user.name, action_type="사용자 수정", detail=f"{user.name} 사용자 정보 수정", target=user.name))
    db.commit()
    db.refresh(user)
    return _user_to_response(user)


@router.delete("/{user_id}")
async def delete_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """사용자 삭제"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
    name = user.name
    db.delete(user)
    db.add(AuditLog(actor=current_user.name, action_type="사용자 삭제", detail=f"{name} 사용자 삭제", target=name))
    db.commit()
    return {"message": f"사용자 '{name}'이(가) 삭제되었습니다."}


@router.post("/{user_id}/reset-password")
async def reset_password(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """비밀번호 초기화"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
    user.hashed_password = hash_password("temp1234!")
    user.password_expiry = datetime.utcnow() + timedelta(days=1)
    db.add(AuditLog(actor=current_user.name, action_type="비밀번호 초기화", detail=f"{user.name} 사용자 비밀번호 초기화", target=user.name))
    db.commit()
    return {"message": f"'{user.name}' 사용자의 비밀번호가 초기화되었습니다."}


@router.post("/{user_id}/toggle-status")
async def toggle_status(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """사용자 상태 토글"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    if user.status == "active":
        user.status = "inactive"
        msg = "비활성화"
    else:
        user.status = "active"
        msg = "활성화"
    db.add(AuditLog(actor=current_user.name, action_type=f"사용자 {msg}", detail=f"{user.name} 사용자 {msg} 처리", target=user.name))
    db.commit()
    return {"message": f"'{user.name}' 사용자가 {msg}되었습니다.", "status": user.status}


def _user_to_response(user: User) -> dict:
    return {
        "id": user.id, "email": user.email, "name": user.name, "company": user.company,
        "group_id": user.group_id, "role": user.role, "status": user.status,
        "trust_level": user.trust_level, "two_fa": user.two_fa,
        "password_expiry": str(user.password_expiry) if user.password_expiry else None,
        "last_login": str(user.last_login) if user.last_login else None,
        "created_at": str(user.created_at) if user.created_at else None,
    }
