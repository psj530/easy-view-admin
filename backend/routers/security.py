from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, case, cast, Date
from typing import Optional
from datetime import datetime, timedelta
from database import get_db
from models.user import User
from models.audit import AuditLog
from auth_utils import get_current_user

router = APIRouter(prefix="/api/security", tags=["보안"])


@router.get("/accounts")
async def get_account_status(
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """계정 상태 현황"""
    query = db.query(User)
    if status:
        query = query.filter(User.status == status)
    if search:
        query = query.filter(User.name.ilike(f"%{search}%") | User.email.ilike(f"%{search}%"))
    users = query.order_by(User.id).all()

    total = len(users)
    active = sum(1 for u in users if u.status == "active")
    inactive = sum(1 for u in users if u.status == "inactive")
    pending = sum(1 for u in users if u.status == "pending")

    # 비밀번호 만료 임박 (30일 이내)
    now = datetime.utcnow()
    expiring = sum(1 for u in users if u.password_expiry and u.password_expiry < now + timedelta(days=30))

    accounts = [{
        "id": u.id, "name": u.name, "email": u.email, "company": u.company,
        "role": u.role, "status": u.status, "two_fa": u.two_fa,
        "last_login": str(u.last_login) if u.last_login else None,
        "password_expiry": str(u.password_expiry) if u.password_expiry else None,
    } for u in users]

    return {
        "accounts": accounts,
        "summary": {"total": total, "active": active, "inactive": inactive, "pending": pending, "expiring_passwords": expiring},
    }


@router.get("/login-failures")
async def get_login_failures(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """로그인 실패 통계 (최근 7일)"""
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    rows = (
        db.query(cast(AuditLog.timestamp, Date), func.count(AuditLog.id))
        .filter(AuditLog.action_type.in_(["로그인 실패", "로그인"]))
        .filter(AuditLog.timestamp >= seven_days_ago)
        .group_by(cast(AuditLog.timestamp, Date))
        .order_by(cast(AuditLog.timestamp, Date))
        .all()
    )
    daily = [{"date": str(r[0]), "count": r[1]} for r in rows]

    # 최근 로그인 실패 로그
    failures = (
        db.query(AuditLog)
        .filter(AuditLog.action_type == "로그인 실패")
        .order_by(AuditLog.timestamp.desc())
        .limit(20)
        .all()
    )
    failure_logs = [{
        "id": f.id, "timestamp": str(f.timestamp) if f.timestamp else None,
        "actor": f.actor, "detail": f.detail, "ip_address": f.ip_address,
    } for f in failures]

    return {"daily_stats": daily, "failure_logs": failure_logs}


@router.get("/stats")
async def get_security_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """보안 대시보드 통계"""
    total = db.query(func.count(User.id)).scalar()
    active = db.query(func.count(User.id)).filter(User.status == "active").scalar()
    two_fa_enabled = db.query(func.count(User.id)).filter(User.two_fa == True).scalar()
    now = datetime.utcnow()
    expired_passwords = db.query(func.count(User.id)).filter(User.password_expiry < now).scalar()

    return {
        "total_users": total, "active_users": active,
        "two_fa_enabled": two_fa_enabled, "expired_passwords": expired_passwords,
    }
