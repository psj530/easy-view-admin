from fastapi import APIRouter, HTTPException, Query
from schemas.request import RequestCreate, RequestResponse, RequestListResponse
from typing import Optional

router = APIRouter(prefix="/api/requests", tags=["사용자 추가 요청"])

# Mock 요청 데이터
MOCK_REQUESTS = [
    {
        "id": 1,
        "requester_id": 2,
        "requester_name": "박정민",
        "target_name": "김현수",
        "target_email": "kim.hs@posco.co.kr",
        "reason": "POSCO 분석팀 신규 인원으로 리포트 열람 권한 필요",
        "status": "pending",
        "reviewer_id": None,
        "reviewer_name": None,
        "created_at": "2026-04-10 14:30:00",
    },
    {
        "id": 2,
        "requester_id": 5,
        "requester_name": "정민수",
        "target_name": "배수진",
        "target_email": "bae.sj@posco.co.kr",
        "reason": "POSCO 기획팀 프로젝트 현황 리포트 검토 필요",
        "status": "pending",
        "reviewer_id": None,
        "reviewer_name": None,
        "created_at": "2026-04-12 09:15:00",
    },
    {
        "id": 3,
        "requester_id": 9,
        "requester_name": "송유라",
        "target_name": "노현우",
        "target_email": "noh.hw@seah.co.kr",
        "reason": "SeAH 재무팀 인턴 리포트 열람 권한 요청",
        "status": "approved",
        "reviewer_id": 1,
        "reviewer_name": "김관리",
        "created_at": "2026-04-08 11:00:00",
    },
    {
        "id": 4,
        "requester_id": 2,
        "requester_name": "박정민",
        "target_name": "장서윤",
        "target_email": "jang.sy@seah.co.kr",
        "reason": "SeAH 경영관리팀 계약직 직원 접근 권한 필요",
        "status": "approved",
        "reviewer_id": 1,
        "reviewer_name": "김관리",
        "created_at": "2026-04-05 16:20:00",
    },
    {
        "id": 5,
        "requester_id": 5,
        "requester_name": "정민수",
        "target_name": "임태현",
        "target_email": "lim.th@posco.co.kr",
        "reason": "외부 컨설턴트 임시 접근 권한",
        "status": "rejected",
        "reviewer_id": 1,
        "reviewer_name": "김관리",
        "created_at": "2026-04-03 10:45:00",
    },
]


@router.get("")
async def get_requests(
    status: Optional[str] = Query(None, description="상태 필터 (pending, approved, rejected)"),
    search: Optional[str] = Query(None, description="검색어"),
):
    """사용자 추가 요청 목록 조회"""
    filtered = MOCK_REQUESTS.copy()
    if status:
        filtered = [r for r in filtered if r["status"] == status]
    if search:
        search_lower = search.lower()
        filtered = [
            r for r in filtered
            if search_lower in r["target_name"].lower()
            or search_lower in r["target_email"].lower()
            or search_lower in r["requester_name"].lower()
        ]
    return {"requests": filtered, "total": len(filtered)}


@router.post("", status_code=201)
async def create_request(request: RequestCreate):
    """사용자 추가 요청 생성"""
    new_id = max(r["id"] for r in MOCK_REQUESTS) + 1
    new_request = {
        "id": new_id,
        "requester_id": 1,  # 현재 로그인 사용자
        "requester_name": "김관리",
        "target_name": request.target_name,
        "target_email": request.target_email,
        "reason": request.reason,
        "status": "pending",
        "reviewer_id": None,
        "reviewer_name": None,
        "created_at": "2026-04-16 12:00:00",
    }
    MOCK_REQUESTS.append(new_request)
    return new_request


@router.put("/{request_id}/approve")
async def approve_request(request_id: int):
    """요청 승인"""
    req = next((r for r in MOCK_REQUESTS if r["id"] == request_id), None)
    if not req:
        raise HTTPException(status_code=404, detail="요청을 찾을 수 없습니다.")
    if req["status"] != "pending":
        raise HTTPException(status_code=400, detail="대기 중인 요청만 승인할 수 있습니다.")

    req["status"] = "approved"
    req["reviewer_id"] = 1
    req["reviewer_name"] = "김관리"
    return {"message": f"'{req['target_name']}' 사용자 추가 요청이 승인되었습니다.", "request": req}


@router.put("/{request_id}/reject")
async def reject_request(request_id: int):
    """요청 반려"""
    req = next((r for r in MOCK_REQUESTS if r["id"] == request_id), None)
    if not req:
        raise HTTPException(status_code=404, detail="요청을 찾을 수 없습니다.")
    if req["status"] != "pending":
        raise HTTPException(status_code=400, detail="대기 중인 요청만 반려할 수 있습니다.")

    req["status"] = "rejected"
    req["reviewer_id"] = 1
    req["reviewer_name"] = "김관리"
    return {"message": f"'{req['target_name']}' 사용자 추가 요청이 반려되었습니다.", "request": req}
