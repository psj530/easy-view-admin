from fastapi import APIRouter, Query
from typing import Optional

router = APIRouter(prefix="/api/audit-logs", tags=["활동 로그"])

# Mock 활동 로그 데이터
MOCK_AUDIT_LOGS = [
    {
        "id": 1,
        "timestamp": "2026-04-16 10:30:00",
        "actor": "김관리",
        "action_type": "로그인",
        "detail": "관리자 로그인 성공",
        "target": "-",
        "ip_address": "192.168.1.100",
    },
    {
        "id": 2,
        "timestamp": "2026-04-16 10:15:00",
        "actor": "송유라",
        "action_type": "리포트 열람",
        "detail": "매출 현황 리포트 열람",
        "target": "매출 현황",
        "ip_address": "192.168.1.105",
    },
    {
        "id": 3,
        "timestamp": "2026-04-16 09:45:00",
        "actor": "박정민",
        "action_type": "사용자 추가 요청",
        "detail": "김현수 (kim.hs@posco.co.kr) 사용자 추가 요청",
        "target": "김현수",
        "ip_address": "192.168.1.102",
    },
    {
        "id": 4,
        "timestamp": "2026-04-16 09:30:00",
        "actor": "김관리",
        "action_type": "로그인",
        "detail": "관리자 로그인 성공",
        "target": "-",
        "ip_address": "192.168.1.100",
    },
    {
        "id": 5,
        "timestamp": "2026-04-15 17:30:00",
        "actor": "윤대경",
        "action_type": "리포트 다운로드",
        "detail": "재무 보고서 PDF 다운로드",
        "target": "재무 보고서",
        "ip_address": "192.168.1.107",
    },
    {
        "id": 6,
        "timestamp": "2026-04-15 16:00:00",
        "actor": "김관리",
        "action_type": "권한 변경",
        "detail": "이서현 사용자 PDF 다운로드 권한 부여",
        "target": "이서현",
        "ip_address": "192.168.1.100",
    },
    {
        "id": 7,
        "timestamp": "2026-04-15 14:22:00",
        "actor": "박정민",
        "action_type": "로그인",
        "detail": "매니저 로그인 성공",
        "target": "-",
        "ip_address": "192.168.1.102",
    },
    {
        "id": 8,
        "timestamp": "2026-04-15 11:30:00",
        "actor": "정민수",
        "action_type": "리포트 열람",
        "detail": "프로젝트 진행 현황 리포트 열람",
        "target": "프로젝트 진행 현황",
        "ip_address": "10.0.0.50",
    },
    {
        "id": 9,
        "timestamp": "2026-04-14 15:00:00",
        "actor": "김관리",
        "action_type": "사용자 비활성화",
        "detail": "한지혜 사용자 비활성화 처리",
        "target": "한지혜",
        "ip_address": "192.168.1.100",
    },
    {
        "id": 10,
        "timestamp": "2026-04-14 11:05:00",
        "actor": "이서현",
        "action_type": "로그인",
        "detail": "뷰어 로그인 성공",
        "target": "-",
        "ip_address": "192.168.1.103",
    },
    {
        "id": 11,
        "timestamp": "2026-04-13 16:45:00",
        "actor": "최영우",
        "action_type": "리포트 열람",
        "detail": "비감사용역 현황 리포트 열람",
        "target": "비감사용역 현황",
        "ip_address": "10.0.0.55",
    },
    {
        "id": 12,
        "timestamp": "2026-04-13 14:00:00",
        "actor": "김관리",
        "action_type": "요청 승인",
        "detail": "노현우 사용자 추가 요청 승인",
        "target": "노현우",
        "ip_address": "192.168.1.100",
    },
    {
        "id": 13,
        "timestamp": "2026-04-12 13:40:00",
        "actor": "오진우",
        "action_type": "로그인",
        "detail": "뷰어 로그인 성공",
        "target": "-",
        "ip_address": "10.0.0.60",
    },
    {
        "id": 14,
        "timestamp": "2026-04-12 09:15:00",
        "actor": "정민수",
        "action_type": "사용자 추가 요청",
        "detail": "배수진 (bae.sj@posco.co.kr) 사용자 추가 요청",
        "target": "배수진",
        "ip_address": "10.0.0.50",
    },
    {
        "id": 15,
        "timestamp": "2026-04-11 10:00:00",
        "actor": "김관리",
        "action_type": "요청 반려",
        "detail": "임태현 외부 컨설턴트 접근 요청 반려",
        "target": "임태현",
        "ip_address": "192.168.1.100",
    },
    {
        "id": 16,
        "timestamp": "2026-04-10 16:30:00",
        "actor": "송유라",
        "action_type": "리포트 다운로드",
        "detail": "인력 현황 Excel 다운로드",
        "target": "인력 현황",
        "ip_address": "192.168.1.105",
    },
    {
        "id": 17,
        "timestamp": "2026-04-10 14:30:00",
        "actor": "박정민",
        "action_type": "사용자 추가 요청",
        "detail": "김현수 (kim.hs@posco.co.kr) 사용자 추가 요청",
        "target": "김현수",
        "ip_address": "192.168.1.102",
    },
    {
        "id": 18,
        "timestamp": "2026-04-09 09:00:00",
        "actor": "김관리",
        "action_type": "그룹 생성",
        "detail": "POSCO 분석팀 그룹 생성",
        "target": "POSCO 분석팀",
        "ip_address": "192.168.1.100",
    },
    {
        "id": 19,
        "timestamp": "2026-04-08 11:00:00",
        "actor": "송유라",
        "action_type": "사용자 추가 요청",
        "detail": "노현우 (noh.hw@seah.co.kr) 사용자 추가 요청",
        "target": "노현우",
        "ip_address": "192.168.1.105",
    },
    {
        "id": 20,
        "timestamp": "2026-04-07 15:00:00",
        "actor": "김관리",
        "action_type": "비밀번호 초기화",
        "detail": "한지혜 사용자 비밀번호 초기화",
        "target": "한지혜",
        "ip_address": "192.168.1.100",
    },
]


@router.get("")
async def get_audit_logs(
    action_type: Optional[str] = Query(None, description="활동 유형 필터"),
    actor: Optional[str] = Query(None, description="수행자 필터"),
    search: Optional[str] = Query(None, description="검색어"),
    page: int = Query(1, ge=1, description="페이지 번호"),
    page_size: int = Query(10, ge=1, le=100, description="페이지 크기"),
):
    """활동 로그 목록 조회"""
    filtered = MOCK_AUDIT_LOGS.copy()

    if action_type:
        filtered = [log for log in filtered if log["action_type"] == action_type]
    if actor:
        filtered = [log for log in filtered if log["actor"] == actor]
    if search:
        search_lower = search.lower()
        filtered = [
            log for log in filtered
            if search_lower in log["detail"].lower()
            or search_lower in log["actor"].lower()
            or search_lower in log.get("target", "").lower()
        ]

    total = len(filtered)
    start = (page - 1) * page_size
    end = start + page_size
    paginated = filtered[start:end]

    return {
        "logs": paginated,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
    }


@router.get("/stats")
async def get_audit_stats():
    """활동 로그 통계 (차트용 데이터)"""
    # 활동 유형별 통계
    action_type_counts = {}
    for log in MOCK_AUDIT_LOGS:
        action = log["action_type"]
        action_type_counts[action] = action_type_counts.get(action, 0) + 1

    action_type_stats = [
        {"action_type": k, "count": v}
        for k, v in sorted(action_type_counts.items(), key=lambda x: -x[1])
    ]

    # 수행자별 통계
    actor_counts = {}
    for log in MOCK_AUDIT_LOGS:
        actor = log["actor"]
        actor_counts[actor] = actor_counts.get(actor, 0) + 1

    actor_stats = [
        {"actor": k, "count": v}
        for k, v in sorted(actor_counts.items(), key=lambda x: -x[1])
    ]

    # 일별 활동 추이 (최근 7일)
    daily_stats = [
        {"date": "2026-04-10", "count": 3},
        {"date": "2026-04-11", "count": 1},
        {"date": "2026-04-12", "count": 2},
        {"date": "2026-04-13", "count": 2},
        {"date": "2026-04-14", "count": 2},
        {"date": "2026-04-15", "count": 3},
        {"date": "2026-04-16", "count": 4},
    ]

    return {
        "action_type_stats": action_type_stats,
        "actor_stats": actor_stats,
        "daily_stats": daily_stats,
        "total_logs": len(MOCK_AUDIT_LOGS),
    }
