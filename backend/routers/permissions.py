from fastapi import APIRouter, Query
from schemas.permission import (
    ReportPermissionSchema,
    ReportPermissionUpdate,
    UserPermissionSchema,
    UserPermissionUpdate,
)
from typing import Optional

router = APIRouter(prefix="/api/permissions", tags=["권한 관리"])

# Mock 리포트 권한 매트릭스
MOCK_REPORT_PERMISSIONS = [
    # 매출 현황 리포트
    {"id": 1, "report_name": "매출 현황", "role": "admin", "can_view": True, "can_download": True, "can_print": True, "can_share": True, "can_comment": True},
    {"id": 2, "report_name": "매출 현황", "role": "manager", "can_view": True, "can_download": True, "can_print": True, "can_share": False, "can_comment": True},
    {"id": 3, "report_name": "매출 현황", "role": "viewer", "can_view": True, "can_download": False, "can_print": False, "can_share": False, "can_comment": False},
    # 재무 보고서
    {"id": 4, "report_name": "재무 보고서", "role": "admin", "can_view": True, "can_download": True, "can_print": True, "can_share": True, "can_comment": True},
    {"id": 5, "report_name": "재무 보고서", "role": "manager", "can_view": True, "can_download": True, "can_print": False, "can_share": False, "can_comment": True},
    {"id": 6, "report_name": "재무 보고서", "role": "viewer", "can_view": True, "can_download": False, "can_print": False, "can_share": False, "can_comment": False},
    # 비감사용역 현황
    {"id": 7, "report_name": "비감사용역 현황", "role": "admin", "can_view": True, "can_download": True, "can_print": True, "can_share": True, "can_comment": True},
    {"id": 8, "report_name": "비감사용역 현황", "role": "manager", "can_view": True, "can_download": False, "can_print": False, "can_share": False, "can_comment": True},
    {"id": 9, "report_name": "비감사용역 현황", "role": "viewer", "can_view": True, "can_download": False, "can_print": False, "can_share": False, "can_comment": False},
    # 인력 현황
    {"id": 10, "report_name": "인력 현황", "role": "admin", "can_view": True, "can_download": True, "can_print": True, "can_share": True, "can_comment": True},
    {"id": 11, "report_name": "인력 현황", "role": "manager", "can_view": True, "can_download": True, "can_print": True, "can_share": False, "can_comment": True},
    {"id": 12, "report_name": "인력 현황", "role": "viewer", "can_view": False, "can_download": False, "can_print": False, "can_share": False, "can_comment": False},
    # 프로젝트 진행 현황
    {"id": 13, "report_name": "프로젝트 진행 현황", "role": "admin", "can_view": True, "can_download": True, "can_print": True, "can_share": True, "can_comment": True},
    {"id": 14, "report_name": "프로젝트 진행 현황", "role": "manager", "can_view": True, "can_download": True, "can_print": False, "can_share": False, "can_comment": True},
    {"id": 15, "report_name": "프로젝트 진행 현황", "role": "viewer", "can_view": True, "can_download": False, "can_print": False, "can_share": False, "can_comment": True},
]

# Mock 사용자별 개별 권한
MOCK_USER_PERMISSIONS = [
    {"id": 1, "user_id": 1, "user_name": "김관리", "user_email": "admin@seah.co.kr", "can_view_report": True, "can_upload": True, "can_pdf": True, "can_excel": True, "can_print": True, "can_share": True, "can_comment": True, "can_request_user": True},
    {"id": 2, "user_id": 2, "user_name": "박정민", "user_email": "park.jm@seah.co.kr", "can_view_report": True, "can_upload": True, "can_pdf": True, "can_excel": True, "can_print": True, "can_share": False, "can_comment": True, "can_request_user": True},
    {"id": 3, "user_id": 3, "user_name": "이서현", "user_email": "lee.sh@seah.co.kr", "can_view_report": True, "can_upload": False, "can_pdf": True, "can_excel": False, "can_print": False, "can_share": False, "can_comment": True, "can_request_user": False},
    {"id": 4, "user_id": 4, "user_name": "최영우", "user_email": "choi.yw@posco.co.kr", "can_view_report": True, "can_upload": False, "can_pdf": False, "can_excel": False, "can_print": False, "can_share": False, "can_comment": True, "can_request_user": False},
    {"id": 5, "user_id": 5, "user_name": "정민수", "user_email": "jung.ms@posco.co.kr", "can_view_report": True, "can_upload": True, "can_pdf": True, "can_excel": True, "can_print": True, "can_share": False, "can_comment": True, "can_request_user": True},
    {"id": 6, "user_id": 6, "user_name": "한지혜", "user_email": "han.jh@seah.co.kr", "can_view_report": False, "can_upload": False, "can_pdf": False, "can_excel": False, "can_print": False, "can_share": False, "can_comment": False, "can_request_user": False},
    {"id": 7, "user_id": 7, "user_name": "윤대경", "user_email": "yoon.dk@seah.co.kr", "can_view_report": True, "can_upload": False, "can_pdf": True, "can_excel": False, "can_print": False, "can_share": False, "can_comment": True, "can_request_user": False},
    {"id": 8, "user_id": 8, "user_name": "김현수", "user_email": "kim.hs@posco.co.kr", "can_view_report": True, "can_upload": False, "can_pdf": False, "can_excel": False, "can_print": False, "can_share": False, "can_comment": False, "can_request_user": False},
    {"id": 9, "user_id": 9, "user_name": "송유라", "user_email": "song.yr@seah.co.kr", "can_view_report": True, "can_upload": True, "can_pdf": True, "can_excel": True, "can_print": True, "can_share": False, "can_comment": True, "can_request_user": True},
    {"id": 10, "user_id": 10, "user_name": "오진우", "user_email": "oh.jw@posco.co.kr", "can_view_report": True, "can_upload": False, "can_pdf": True, "can_excel": False, "can_print": False, "can_share": False, "can_comment": True, "can_request_user": False},
]


@router.get("/matrix")
async def get_permission_matrix(report_name: Optional[str] = None):
    """리포트 권한 매트릭스 조회"""
    filtered = MOCK_REPORT_PERMISSIONS.copy()
    if report_name:
        filtered = [p for p in filtered if p["report_name"] == report_name]
    return {"permissions": filtered, "total": len(filtered)}


@router.put("/matrix")
async def update_permission_matrix(data: ReportPermissionUpdate):
    """리포트 권한 매트릭스 수정"""
    updated_count = 0
    for perm in data.permissions:
        existing = next(
            (p for p in MOCK_REPORT_PERMISSIONS if p.get("id") == perm.id),
            None,
        )
        if existing:
            existing.update(perm.model_dump(exclude={"id"}))
            updated_count += 1
    return {"message": f"{updated_count}건의 권한이 수정되었습니다."}


@router.get("/detail")
async def get_user_permissions(
    user_id: Optional[int] = None,
    search: Optional[str] = None,
):
    """사용자별 개별 권한 조회"""
    filtered = MOCK_USER_PERMISSIONS.copy()
    if user_id:
        filtered = [p for p in filtered if p["user_id"] == user_id]
    if search:
        search_lower = search.lower()
        filtered = [
            p for p in filtered
            if search_lower in p.get("user_name", "").lower()
            or search_lower in p.get("user_email", "").lower()
        ]
    return {"permissions": filtered, "total": len(filtered)}


@router.put("/detail")
async def update_user_permissions(data: UserPermissionUpdate):
    """사용자별 개별 권한 수정"""
    updated_count = 0
    for perm in data.permissions:
        existing = next(
            (p for p in MOCK_USER_PERMISSIONS if p["user_id"] == perm.user_id),
            None,
        )
        if existing:
            update_data = perm.model_dump(exclude={"id", "user_name", "user_email"})
            existing.update(update_data)
            updated_count += 1
    return {"message": f"{updated_count}명의 권한이 수정되었습니다."}
