from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from models.permission import ReportPermission, UserPermission
from models.user import User
from models.audit import AuditLog
from schemas.permission import ReportPermissionUpdate, UserPermissionUpdate
from auth_utils import get_current_user

router = APIRouter(prefix="/api/permissions", tags=["권한 관리"])


@router.get("/matrix")
async def get_permission_matrix(report_name: Optional[str] = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """리포트 권한 매트릭스 조회"""
    query = db.query(ReportPermission)
    if report_name:
        query = query.filter(ReportPermission.report_name == report_name)
    perms = query.order_by(ReportPermission.id).all()
    result = [{
        "id": p.id, "report_name": p.report_name, "role": p.role,
        "can_view": p.can_view, "can_download": p.can_download,
        "can_print": p.can_print, "can_share": p.can_share, "can_comment": p.can_comment,
    } for p in perms]
    return {"permissions": result, "total": len(result)}


@router.put("/matrix")
async def update_permission_matrix(data: ReportPermissionUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """리포트 권한 매트릭스 수정"""
    updated_count = 0
    for perm in data.permissions:
        existing = db.query(ReportPermission).filter(ReportPermission.id == perm.id).first()
        if existing:
            existing.can_view = perm.can_view
            existing.can_download = perm.can_download
            existing.can_print = perm.can_print
            existing.can_share = perm.can_share
            existing.can_comment = perm.can_comment
            updated_count += 1
    db.add(AuditLog(actor=current_user.name, action_type="권한 변경", detail=f"리포트 권한 매트릭스 {updated_count}건 수정", target="권한 매트릭스"))
    db.commit()
    return {"message": f"{updated_count}건의 권한이 수정되었습니다."}


@router.get("/detail")
async def get_user_permissions(user_id: Optional[int] = None, search: Optional[str] = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """사용자별 개별 권한 조회"""
    query = db.query(UserPermission, User).join(User, UserPermission.user_id == User.id)
    if user_id:
        query = query.filter(UserPermission.user_id == user_id)
    if search:
        query = query.filter(User.name.ilike(f"%{search}%") | User.email.ilike(f"%{search}%"))

    rows = query.all()
    result = [{
        "id": p.id, "user_id": p.user_id, "user_name": u.name, "user_email": u.email,
        "can_view_report": p.can_view_report, "can_upload": p.can_upload,
        "can_pdf": p.can_pdf, "can_excel": p.can_excel, "can_print": p.can_print,
        "can_share": p.can_share, "can_comment": p.can_comment, "can_request_user": p.can_request_user,
    } for p, u in rows]
    return {"permissions": result, "total": len(result)}


@router.put("/detail")
async def update_user_permissions(data: UserPermissionUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """사용자별 개별 권한 수정"""
    updated_count = 0
    for perm in data.permissions:
        existing = db.query(UserPermission).filter(UserPermission.user_id == perm.user_id).first()
        if existing:
            existing.can_view_report = perm.can_view_report
            existing.can_upload = perm.can_upload
            existing.can_pdf = perm.can_pdf
            existing.can_excel = perm.can_excel
            existing.can_print = perm.can_print
            existing.can_share = perm.can_share
            existing.can_comment = perm.can_comment
            existing.can_request_user = perm.can_request_user
            updated_count += 1
            user = db.query(User).filter(User.id == perm.user_id).first()
            if user:
                db.add(AuditLog(actor=current_user.name, action_type="권한 변경", detail=f"{user.name} 사용자 권한 수정", target=user.name))
    db.commit()
    return {"message": f"{updated_count}명의 권한이 수정되었습니다."}
