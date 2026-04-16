from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from database import Base


class Group(Base):
    """그룹 모델"""

    __tablename__ = "groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    company = Column(String, nullable=False)
    default_role = Column(String, default="viewer")
    report_count = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
