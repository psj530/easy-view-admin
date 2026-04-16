from pydantic import BaseModel
from typing import Optional


class ReportPermissionSchema(BaseModel):
    """리포트 권한 매트릭스 스키마"""
    id: Optional[int] = None
    report_name: str
    role: str
    can_view: bool = False
    can_download: bool = False
    can_print: bool = False
    can_share: bool = False
    can_comment: bool = False

    class Config:
        from_attributes = True


class ReportPermissionUpdate(BaseModel):
    """리포트 권한 매트릭스 수정 스키마"""
    permissions: list[ReportPermissionSchema]


class UserPermissionSchema(BaseModel):
    """사용자 개별 권한 스키마"""
    id: Optional[int] = None
    user_id: int
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    can_view_report: bool = True
    can_upload: bool = False
    can_pdf: bool = False
    can_excel: bool = False
    can_print: bool = False
    can_share: bool = False
    can_comment: bool = True
    can_request_user: bool = False

    class Config:
        from_attributes = True


class UserPermissionUpdate(BaseModel):
    """사용자 개별 권한 수정 스키마"""
    permissions: list[UserPermissionSchema]
