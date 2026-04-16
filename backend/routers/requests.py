from fastapi import APIRouter, HTTPException, Query, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from database import get_db
from models.request import UserAddRequest
from models.user import User
from models.audit import AuditLog
from schemas.request import RequestCreate
from auth_utils import get_current_user

router = APIRouter(prefix="/api/requests", tags=["사용자 추가 요청"])


@router.get("")
async def get_requests(
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """사용자 추가 요청 목록 조회"""
    query = db.query(UserAddRequest)
    if status:
        query = query.filter(UserAddRequest.status == status)
    if search:
        query = query.filter(
            or_(
                UserAddRequest.target_name.ilike(f"%{search}%"),
                UserAddRequest.target_email.ilike(f"%{search}%"),
            )
        )
    reqs = query.order_by(UserAddRequest.id.desc()).all()

    result = []
    for r in reqs:
        requester = db.query(User).filter(User.id == r.requester_id).first()
        reviewer = db.query(User).filter(User.id == r.reviewer_id).first() if r.reviewer_id else None
        result.append({
            "id": r.id, "requester_id": r.requester_id,
            "requester_name": requester.name if requester else "알 수 없음",
            "target_name": r.target_name, "target_email": r.target_email,
            "reason": r.reason, "status": r.status,
            "reviewer_id": r.reviewer_id,
            "reviewer_name": reviewer.name if reviewer else None,
            "created_at": str(r.created_at) if r.created_at else None,
        })
    return {"requests": result, "total": len(result)}


@router.post("", status_code=201)
async def create_request(request: RequestCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """사용자 추가 요청 생성"""
    new_req = UserAddRequest(
        requester_id=current_user.id,
        target_name=request.target_name,
        target_email=request.target_email,
        reason=request.reason,
    )
    db.add(new_req)
    db.add(AuditLog(actor=current_user.name, action_type="사용자 추가 요청", detail=f"{request.target_name} ({request.target_email}) 사용자 추가 요청", target=request.target_name))
    db.commit()
    db.refresh(new_req)
    return {
        "id": new_req.id, "requester_id": new_req.requester_id,
        "requester_name": current_user.name,
        "target_name": new_req.target_name, "target_email": new_req.target_email,
        "reason": new_req.reason, "status": new_req.status,
        "reviewer_id": None, "reviewer_name": None,
        "created_at": str(new_req.created_at) if new_req.created_at else None,
    }


@router.put("/{request_id}/approve")
async def approve_request(request_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """요청 승인"""
    req = db.query(UserAddRequest).filter(UserAddRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="요청을 찾을 수 없습니다.")
    if req.status != "pending":
        raise HTTPException(status_code=400, detail="대기 중인 요청만 승인할 수 있습니다.")

    req.status = "approved"
    req.reviewer_id = current_user.id
    db.add(AuditLog(actor=current_user.name, action_type="요청 승인", detail=f"{req.target_name} 사용자 추가 요청 승인", target=req.target_name))
    db.commit()
    return {"message": f"'{req.target_name}' 사용자 추가 요청이 승인되었습니다."}


@router.put("/{request_id}/reject")
async def reject_request(request_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """요청 반려"""
    req = db.query(UserAddRequest).filter(UserAddRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="요청을 찾을 수 없습니다.")
    if req.status != "pending":
        raise HTTPException(status_code=400, detail="대기 중인 요청만 반려할 수 있습니다.")

    req.status = "rejected"
    req.reviewer_id = current_user.id
    db.add(AuditLog(actor=current_user.name, action_type="요청 반려", detail=f"{req.target_name} 사용자 추가 요청 반려", target=req.target_name))
    db.commit()
    return {"message": f"'{req.target_name}' 사용자 추가 요청이 반려되었습니다."}
