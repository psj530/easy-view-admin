from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from database import Base


class User(Base):
    """사용자 모델"""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    company = Column(String, nullable=False)
    group_id = Column(Integer, ForeignKey("groups.id"), nullable=True)
    role = Column(String, default="viewer")  # admin, manager, viewer
    status = Column(String, default="active")  # active, inactive, pending
    trust_level = Column(String, default="normal")  # high, normal, low
    two_fa = Column(Boolean, default=False)
    hashed_password = Column(String, nullable=True)
    password_expiry = Column(DateTime, nullable=True)
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
