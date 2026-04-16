from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    """사용자 기본 스키마"""
    email: str
    name: str
    company: str
    group_id: Optional[int] = None
    role: str = "viewer"


class UserCreate(UserBase):
    """사용자 생성 스키마"""
    password: Optional[str] = None


class UserUpdate(BaseModel):
    """사용자 수정 스키마"""
    email: Optional[str] = None
    name: Optional[str] = None
    company: Optional[str] = None
    group_id: Optional[int] = None
    role: Optional[str] = None
    status: Optional[str] = None
    trust_level: Optional[str] = None
    two_fa: Optional[bool] = None


class UserResponse(UserBase):
    """사용자 응답 스키마"""
    id: int
    status: str
    trust_level: str
    two_fa: bool
    password_expiry: Optional[str] = None
    last_login: Optional[str] = None
    created_at: Optional[str] = None

    class Config:
        from_attributes = True


class UserListResponse(BaseModel):
    """사용자 목록 응답"""
    users: list[UserResponse]
    total: int
