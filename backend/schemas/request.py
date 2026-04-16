from pydantic import BaseModel
from typing import Optional


class RequestCreate(BaseModel):
    """사용자 추가 요청 생성 스키마"""
    target_name: str
    target_email: str
    reason: Optional[str] = None


class RequestResponse(BaseModel):
    """사용자 추가 요청 응답 스키마"""
    id: int
    requester_id: int
    requester_name: Optional[str] = None
    target_name: str
    target_email: str
    reason: Optional[str] = None
    status: str
    reviewer_id: Optional[int] = None
    reviewer_name: Optional[str] = None
    created_at: Optional[str] = None

    class Config:
        from_attributes = True


class RequestListResponse(BaseModel):
    """요청 목록 응답"""
    requests: list[RequestResponse]
    total: int
