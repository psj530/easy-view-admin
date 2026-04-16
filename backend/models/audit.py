from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from database import Base


class AuditLog(Base):
    """활동 로그 모델"""

    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, server_default=func.now())
    actor = Column(String, nullable=False)
    action_type = Column(String, nullable=False)
    detail = Column(String, nullable=True)
    target = Column(String, nullable=True)
    ip_address = Column(String, nullable=True)
