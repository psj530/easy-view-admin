from fastapi import APIRouter, HTTPException, Query
from schemas.user import UserCreate, UserUpdate, UserResponse, UserListResponse
from typing import Optional

router = APIRouter(prefix="/api/users", tags=["사용자 관리"])

# Mock 사용자 데이터
MOCK_USERS = [
    {
        "id": 1,
        "email": "admin@seah.co.kr",
        "name": "김관리",
        "company": "SeAH",
        "group_id": 1,
        "role": "admin",
        "status": "active",
        "trust_level": "high",
        "two_fa": True,
        "password_expiry": "2026-06-01",
        "last_login": "2026-04-16 09:30:00",
        "created_at": "2025-01-15",
    },
    {
        "id": 2,
        "email": "park.jm@seah.co.kr",
        "name": "박정민",
        "company": "SeAH",
        "group_id": 1,
        "role": "manager",
        "status": "active",
        "trust_level": "high",
        "two_fa": True,
        "password_expiry": "2026-07-15",
        "last_login": "2026-04-15 14:22:00",
        "created_at": "2025-02-10",
    },
    {
        "id": 3,
        "email": "lee.sh@seah.co.kr",
        "name": "이서현",
        "company": "SeAH",
        "group_id": 2,
        "role": "viewer",
        "status": "active",
        "trust_level": "normal",
        "two_fa": False,
        "password_expiry": "2026-08-20",
        "last_login": "2026-04-14 11:05:00",
        "created_at": "2025-03-05",
    },
    {
        "id": 4,
        "email": "choi.yw@posco.co.kr",
        "name": "최영우",
        "company": "POSCO",
        "group_id": 3,
        "role": "viewer",
        "status": "active",
        "trust_level": "normal",
        "two_fa": False,
        "password_expiry": "2026-05-10",
        "last_login": "2026-04-13 16:45:00",
        "created_at": "2025-04-20",
    },
    {
        "id": 5,
        "email": "jung.ms@posco.co.kr",
        "name": "정민수",
        "company": "POSCO",
        "group_id": 3,
        "role": "manager",
        "status": "active",
        "trust_level": "high",
        "two_fa": True,
        "password_expiry": "2026-09-01",
        "last_login": "2026-04-16 08:10:00",
        "created_at": "2025-01-20",
    },
    {
        "id": 6,
        "email": "han.jh@seah.co.kr",
        "name": "한지혜",
        "company": "SeAH",
        "group_id": 2,
        "role": "viewer",
        "status": "inactive",
        "trust_level": "low",
        "two_fa": False,
        "password_expiry": "2026-03-01",
        "last_login": "2026-02-28 09:00:00",
        "created_at": "2025-05-15",
    },
    {
        "id": 7,
        "email": "yoon.dk@seah.co.kr",
        "name": "윤대경",
        "company": "SeAH",
        "group_id": 1,
        "role": "viewer",
        "status": "active",
        "trust_level": "normal",
        "two_fa": False,
        "password_expiry": "2026-10-15",
        "last_login": "2026-04-15 17:30:00",
        "created_at": "2025-06-01",
    },
    {
        "id": 8,
        "email": "kim.hs@posco.co.kr",
        "name": "김현수",
        "company": "POSCO",
        "group_id": 4,
        "role": "viewer",
        "status": "pending",
        "trust_level": "normal",
        "two_fa": False,
        "password_expiry": None,
        "last_login": None,
        "created_at": "2026-04-10",
    },
    {
        "id": 9,
        "email": "song.yr@seah.co.kr",
        "name": "송유라",
        "company": "SeAH",
        "group_id": 2,
        "role": "manager",
        "status": "active",
        "trust_level": "high",
        "two_fa": True,
        "password_expiry": "2026-11-01",
        "last_login": "2026-04-16 10:15:00",
        "created_at": "2025-02-28",
    },
    {
        "id": 10,
        "email": "oh.jw@posco.co.kr",
        "name": "오진우",
        "company": "POSCO",
        "group_id": 4,
        "role": "viewer",
        "status": "active",
        "trust_level": "normal",
        "two_fa": False,
        "password_expiry": "2026-12-01",
        "last_login": "2026-04-12 13:40:00",
        "created_at": "2025-07-10",
    },
]


@router.get("", response_model=UserListResponse)
async def get_users(
    search: Optional[str] = Query(None, description="검색어 (이름, 이메일)"),
    company: Optional[str] = Query(None, description="회사 필터"),
    role: Optional[str] = Query(None, description="역할 필터"),
    status: Optional[str] = Query(None, description="상태 필터"),
):
    """사용자 목록 조회"""
    filtered = MOCK_USERS.copy()

    if search:
        search_lower = search.lower()
        filtered = [
            u for u in filtered
            if search_lower in u["name"].lower() or search_lower in u["email"].lower()
        ]
    if company:
        filtered = [u for u in filtered if u["company"] == company]
    if role:
        filtered = [u for u in filtered if u["role"] == role]
    if status:
        filtered = [u for u in filtered if u["status"] == status]

    return UserListResponse(users=filtered, total=len(filtered))


@router.post("", response_model=UserResponse, status_code=201)
async def create_user(user: UserCreate):
    """사용자 생성"""
    new_id = max(u["id"] for u in MOCK_USERS) + 1
    new_user = {
        "id": new_id,
        "email": user.email,
        "name": user.name,
        "company": user.company,
        "group_id": user.group_id,
        "role": user.role,
        "status": "active",
        "trust_level": "normal",
        "two_fa": False,
        "password_expiry": "2027-04-16",
        "last_login": None,
        "created_at": "2026-04-16",
    }
    MOCK_USERS.append(new_user)
    return new_user


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int):
    """사용자 상세 조회"""
    user = next((u for u in MOCK_USERS if u["id"] == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
    return user


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(user_id: int, user_update: UserUpdate):
    """사용자 정보 수정"""
    user = next((u for u in MOCK_USERS if u["id"] == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    update_data = user_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if key in user:
            user[key] = value
    return user


@router.delete("/{user_id}")
async def delete_user(user_id: int):
    """사용자 삭제"""
    global MOCK_USERS
    user = next((u for u in MOCK_USERS if u["id"] == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
    MOCK_USERS = [u for u in MOCK_USERS if u["id"] != user_id]
    return {"message": f"사용자 '{user['name']}'이(가) 삭제되었습니다."}


@router.post("/{user_id}/reset-password")
async def reset_password(user_id: int):
    """비밀번호 초기화"""
    user = next((u for u in MOCK_USERS if u["id"] == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")
    return {"message": f"'{user['name']}' 사용자의 비밀번호가 초기화되었습니다. 임시 비밀번호가 이메일로 발송됩니다."}


@router.post("/{user_id}/toggle-status")
async def toggle_status(user_id: int):
    """사용자 상태 토글 (활성/비활성)"""
    user = next((u for u in MOCK_USERS if u["id"] == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    if user["status"] == "active":
        user["status"] = "inactive"
        msg = "비활성화"
    else:
        user["status"] = "active"
        msg = "활성화"

    return {"message": f"'{user['name']}' 사용자가 {msg}되었습니다.", "status": user["status"]}
