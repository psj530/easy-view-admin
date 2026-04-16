from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from database import Base


class ReportPermission(Base):
    """리포트 권한 매트릭스 모델"""

    __tablename__ = "report_permissions"

    id = Column(Integer, primary_key=True, index=True)
    report_name = Column(String, nullable=False)
    role = Column(String, nullable=False)  # admin, manager, viewer
    can_view = Column(Boolean, default=False)
    can_download = Column(Boolean, default=False)
    can_print = Column(Boolean, default=False)
    can_share = Column(Boolean, default=False)
    can_comment = Column(Boolean, default=False)


class UserPermission(Base):
    """사용자별 개별 권한 모델"""

    __tablename__ = "user_permissions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    can_view_report = Column(Boolean, default=True)
    can_upload = Column(Boolean, default=False)
    can_pdf = Column(Boolean, default=False)
    can_excel = Column(Boolean, default=False)
    can_print = Column(Boolean, default=False)
    can_share = Column(Boolean, default=False)
    can_comment = Column(Boolean, default=True)
    can_request_user = Column(Boolean, default=False)
