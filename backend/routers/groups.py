from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from database import get_db
from models.group import Group
from models.user import User
from models.audit import AuditLog
from auth_utils import get_current_user

router = APIRouter(prefix="/api/groups", tags=["그룹 관리"])


class GroupCreate(BaseModel):
    name: str
    company: str
    default_role: str = "viewer"


class GroupUpdate(BaseModel):
    name: Optional[str] = None
    company: Optional[str] = None
    default_role: Optional[str] = None


@router.get("")
async def get_groups(company: Optional[str] = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """그룹 목록 조회"""
    query = db.query(Group)
    if company:
        query = query.filter(Group.company == company)
    groups = query.order_by(Group.id).all()

    result = []
    for g in groups:
        member_count = db.query(func.count(User.id)).filter(User.group_id == g.id).scalar()
        result.append({
            "id": g.id, "name": g.name, "company": g.company,
            "default_role": g.default_role, "report_count": g.report_count,
            "member_count": member_count,
            "created_at": str(g.created_at) if g.created_at else None,
        })
    return {"groups": result, "total": len(result)}


@router.post("", status_code=201)
async def create_group(group: GroupCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """그룹 생성"""
    new_group = Group(name=group.name, company=group.company, default_role=group.default_role)
    db.add(new_group)
    db.add(AuditLog(actor=current_user.name, action_type="그룹 생성", detail=f"{group.name} 그룹 생성", target=group.name))
    db.commit()
    db.refresh(new_group)
    return {
        "id": new_group.id, "name": new_group.name, "company": new_group.company,
        "default_role": new_group.default_role, "report_count": 0, "member_count": 0,
        "created_at": str(new_group.created_at) if new_group.created_at else None,
    }


@router.put("/{group_id}")
async def update_group(group_id: int, group_update: GroupUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """그룹 정보 수정"""
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="그룹을 찾을 수 없습니다.")

    update_data = group_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(group, key, value)
    db.commit()
    db.refresh(group)
    member_count = db.query(func.count(User.id)).filter(User.group_id == group.id).scalar()
    return {
        "id": group.id, "name": group.name, "company": group.company,
        "default_role": group.default_role, "report_count": group.report_count,
        "member_count": member_count,
        "created_at": str(group.created_at) if group.created_at else None,
    }
