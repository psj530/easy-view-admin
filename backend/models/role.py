from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from database import Base


class Role(Base):
    """역할 정의 모델"""

    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)  # "pwc" | "client"
    description = Column(Text, nullable=True)
    permissions = Column(Text, nullable=True)  # JSON string of permission list
    created_at = Column(DateTime, server_default=func.now())
