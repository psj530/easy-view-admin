from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/groups", tags=["그룹 관리"])


class GroupCreate(BaseModel):
    name: str
    company: str
    default_role: str = "viewer"


class GroupUpdate(BaseModel):
    name: Optional[str] = None
    company: Optional[str] = None
    default_role: Optional[str] = None


# Mock 그룹 데이터
MOCK_GROUPS = [
    {
        "id": 1,
        "name": "SeAH 경영관리팀",
        "company": "SeAH",
        "default_role": "manager",
        "report_count": 12,
        "member_count": 3,
        "created_at": "2025-01-10",
    },
    {
        "id": 2,
        "name": "SeAH 재무팀",
        "company": "SeAH",
        "default_role": "viewer",
        "report_count": 8,
        "member_count": 3,
        "created_at": "2025-01-15",
    },
    {
        "id": 3,
        "name": "POSCO 기획팀",
        "company": "POSCO",
        "default_role": "viewer",
        "report_count": 6,
        "member_count": 2,
        "created_at": "2025-02-01",
    },
    {
        "id": 4,
        "name": "POSCO 분석팀",
        "company": "POSCO",
        "default_role": "viewer",
        "report_count": 4,
        "member_count": 2,
        "created_at": "2025-03-10",
    },
]


@router.get("")
async def get_groups(company: Optional[str] = None):
    """그룹 목록 조회"""
    filtered = MOCK_GROUPS.copy()
    if company:
        filtered = [g for g in filtered if g["company"] == company]
    return {"groups": filtered, "total": len(filtered)}


@router.post("", status_code=201)
async def create_group(group: GroupCreate):
    """그룹 생성"""
    new_id = max(g["id"] for g in MOCK_GROUPS) + 1
    new_group = {
        "id": new_id,
        "name": group.name,
        "company": group.company,
        "default_role": group.default_role,
        "report_count": 0,
        "member_count": 0,
        "created_at": "2026-04-16",
    }
    MOCK_GROUPS.append(new_group)
    return new_group


@router.put("/{group_id}")
async def update_group(group_id: int, group_update: GroupUpdate):
    """그룹 정보 수정"""
    group = next((g for g in MOCK_GROUPS if g["id"] == group_id), None)
    if not group:
        raise HTTPException(status_code=404, detail="그룹을 찾을 수 없습니다.")

    update_data = group_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if key in group:
            group[key] = value
    return group
