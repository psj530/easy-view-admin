import json
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from models.role import Role
from models.user import User
from auth_utils import get_current_user

router = APIRouter(prefix="/api/roles", tags=["역할 관리"])


class RoleCreate(BaseModel):
    name: str
    category: str  # "pwc" | "client"
    description: Optional[str] = None
    permissions: list[str] = []


class RoleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    permissions: Optional[list[str]] = None


@router.get("")
async def get_roles(category: Optional[str] = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    query = db.query(Role)
    if category:
        query = query.filter(Role.category == category)
    roles = query.order_by(Role.id).all()
    return {"roles": [{
        "id": r.id, "name": r.name, "category": r.category,
        "description": r.description,
        "permissions": json.loads(r.permissions) if r.permissions else [],
        "created_at": str(r.created_at) if r.created_at else None,
    } for r in roles], "total": len(roles)}


@router.post("", status_code=201)
async def create_role(data: RoleCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    role = Role(name=data.name, category=data.category, description=data.description, permissions=json.dumps(data.permissions, ensure_ascii=False))
    db.add(role)
    db.commit()
    db.refresh(role)
    return {"id": role.id, "name": role.name, "category": role.category, "description": role.description, "permissions": data.permissions}


@router.put("/{role_id}")
async def update_role(role_id: int, data: RoleUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="역할을 찾을 수 없습니다.")
    if data.name is not None:
        role.name = data.name
    if data.description is not None:
        role.description = data.description
    if data.permissions is not None:
        role.permissions = json.dumps(data.permissions, ensure_ascii=False)
    db.commit()
    db.refresh(role)
    return {"id": role.id, "name": role.name, "category": role.category, "description": role.description, "permissions": json.loads(role.permissions) if role.permissions else []}


@router.delete("/{role_id}")
async def delete_role(role_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="역할을 찾을 수 없습니다.")
    db.delete(role)
    db.commit()
    return {"message": f"'{role.name}' 역할이 삭제되었습니다."}
