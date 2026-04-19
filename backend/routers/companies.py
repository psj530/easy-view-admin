from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from models.company import Company, Subsidiary
from models.user import User
from auth_utils import get_current_user

router = APIRouter(prefix="/api/companies", tags=["회사/자회사 관리"])


class CompanyCreate(BaseModel):
    name: str


class SubsidiaryCreate(BaseModel):
    name: str
    company_id: int


@router.get("")
async def get_companies(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """회사 목록 조회"""
    companies = db.query(Company).order_by(Company.id).all()
    result = []
    for c in companies:
        subs = db.query(Subsidiary).filter(Subsidiary.company_id == c.id).all()
        result.append({
            "id": c.id, "name": c.name,
            "subsidiaries": [{"id": s.id, "name": s.name} for s in subs],
            "created_at": str(c.created_at) if c.created_at else None,
        })
    return {"companies": result, "total": len(result)}


@router.post("", status_code=201)
async def create_company(data: CompanyCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(Company).filter(Company.name == data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="이미 등록된 회사입니다.")
    company = Company(name=data.name)
    db.add(company)
    db.commit()
    db.refresh(company)
    return {"id": company.id, "name": company.name, "subsidiaries": []}


@router.post("/subsidiaries", status_code=201)
async def create_subsidiary(data: SubsidiaryCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    company = db.query(Company).filter(Company.id == data.company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="회사를 찾을 수 없습니다.")
    sub = Subsidiary(name=data.name, company_id=data.company_id)
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return {"id": sub.id, "name": sub.name, "company_id": sub.company_id, "company_name": company.name}


@router.get("/names")
async def get_company_names(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """회사명 목록 - 사용자 테이블의 실제 회사명 + companies 테이블 통합"""
    user_companies = db.query(User.company).distinct().order_by(User.company).all()
    reg_companies = db.query(Company.name).order_by(Company.name).all()
    all_names = sorted(set([c[0] for c in user_companies] + [c[0] for c in reg_companies]))
    return {"names": all_names}
