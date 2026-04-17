"""DB 초기 데이터 시딩"""
import json
from datetime import datetime, timedelta
from database import SessionLocal
from models.user import User
from models.group import Group
from models.permission import ReportPermission, UserPermission
from models.audit import AuditLog
from models.request import UserAddRequest
from models.role import Role
from models.company import Company, Subsidiary
from auth_utils import hash_password

DEFAULT_PASSWORD = "admin1234!"


def seed_data(force=False):
    db = SessionLocal()
    existing = db.query(User).first()
    if existing and not force:
        # admin 계정 이메일 확인 - 변경 필요 시 재시딩
        admin = db.query(User).filter(User.id == 1).first()
        if admin and admin.email == "admin@pwc.com":
            db.close()
            return
        # admin 이메일이 다르면 전체 재시딩
        from database import Base, engine
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()

    # 그룹
    groups = [
        Group(id=1, name="SeAH 경영관리팀", company="SeAH", default_role="manager", report_count=12),
        Group(id=2, name="SeAH 재무팀", company="SeAH", default_role="viewer", report_count=8),
        Group(id=3, name="POSCO 기획팀", company="POSCO", default_role="viewer", report_count=6),
        Group(id=4, name="POSCO 분석팀", company="POSCO", default_role="viewer", report_count=4),
    ]
    db.add_all(groups)
    db.flush()

    # 사용자
    hashed = hash_password(DEFAULT_PASSWORD)
    now = datetime.utcnow()
    users = [
        User(id=1, email="admin@pwc.com", name="김관리", company="PwC", group_id=1, role="admin", status="active", trust_level="high", two_fa=True, hashed_password=hashed, password_expiry=now + timedelta(days=180), last_login=now - timedelta(hours=1)),
        User(id=2, email="park.jm@seah.co.kr", name="박정민", company="SeAH", group_id=1, role="manager", status="active", trust_level="high", two_fa=True, hashed_password=hashed, password_expiry=now + timedelta(days=270), last_login=now - timedelta(days=1)),
        User(id=3, email="lee.sh@seah.co.kr", name="이서현", company="SeAH", group_id=2, role="viewer", status="active", trust_level="normal", two_fa=False, hashed_password=hashed, password_expiry=now + timedelta(days=300), last_login=now - timedelta(days=2)),
        User(id=4, email="choi.yw@posco.co.kr", name="최영우", company="POSCO", group_id=3, role="viewer", status="active", trust_level="normal", two_fa=False, hashed_password=hashed, password_expiry=now + timedelta(days=120), last_login=now - timedelta(days=3)),
        User(id=5, email="jung.ms@posco.co.kr", name="정민수", company="POSCO", group_id=3, role="manager", status="active", trust_level="high", two_fa=True, hashed_password=hashed, password_expiry=now + timedelta(days=350), last_login=now - timedelta(hours=2)),
        User(id=6, email="han.jh@seah.co.kr", name="한지혜", company="SeAH", group_id=2, role="viewer", status="inactive", trust_level="low", two_fa=False, hashed_password=hashed, password_expiry=now - timedelta(days=30), last_login=now - timedelta(days=45)),
        User(id=7, email="yoon.dk@seah.co.kr", name="윤대경", company="SeAH", group_id=1, role="viewer", status="active", trust_level="normal", two_fa=False, hashed_password=hashed, password_expiry=now + timedelta(days=400), last_login=now - timedelta(days=1)),
        User(id=8, email="kim.hs@posco.co.kr", name="김현수", company="POSCO", group_id=4, role="viewer", status="pending", trust_level="normal", two_fa=False, hashed_password=hashed, password_expiry=None, last_login=None),
        User(id=9, email="song.yr@seah.co.kr", name="송유라", company="SeAH", group_id=2, role="manager", status="active", trust_level="high", two_fa=True, hashed_password=hashed, password_expiry=now + timedelta(days=420), last_login=now - timedelta(hours=3)),
        User(id=10, email="oh.jw@posco.co.kr", name="오진우", company="POSCO", group_id=4, role="viewer", status="active", trust_level="normal", two_fa=False, hashed_password=hashed, password_expiry=now + timedelta(days=500), last_login=now - timedelta(days=4)),
    ]
    db.add_all(users)
    db.flush()

    # 리포트 권한 매트릭스
    reports = ["매출 현황", "재무 보고서", "비감사용역 현황", "인력 현황", "프로젝트 진행 현황"]
    role_perms = {
        "admin": (True, True, True, True, True),
        "manager": (True, True, False, False, True),
        "viewer": (True, False, False, False, False),
    }
    pid = 1
    for report in reports:
        for role, (v, d, p, s, c) in role_perms.items():
            # 특수 케이스
            if report == "인력 현황" and role == "viewer":
                v = False
            if report == "프로젝트 진행 현황" and role == "viewer":
                c = True
            if report == "매출 현황" and role == "manager":
                p = True
            if report == "인력 현황" and role == "manager":
                p = True
            db.add(ReportPermission(id=pid, report_name=report, role=role, can_view=v, can_download=d, can_print=p, can_share=s, can_comment=c))
            pid += 1
    db.flush()

    # 사용자별 권한
    user_perm_data = [
        (1, True, True, True, True, True, True, True, True),
        (2, True, True, True, True, True, False, True, True),
        (3, True, False, True, False, False, False, True, False),
        (4, True, False, False, False, False, False, True, False),
        (5, True, True, True, True, True, False, True, True),
        (6, False, False, False, False, False, False, False, False),
        (7, True, False, True, False, False, False, True, False),
        (8, True, False, False, False, False, False, False, False),
        (9, True, True, True, True, True, False, True, True),
        (10, True, False, True, False, False, False, True, False),
    ]
    for uid, vr, up, pdf, xl, pr, sh, cm, ru in user_perm_data:
        db.add(UserPermission(user_id=uid, can_view_report=vr, can_upload=up, can_pdf=pdf, can_excel=xl, can_print=pr, can_share=sh, can_comment=cm, can_request_user=ru))
    db.flush()

    # 요청
    requests_data = [
        UserAddRequest(id=1, requester_id=2, target_name="김현수", target_email="kim.hs@posco.co.kr", reason="POSCO 분석팀 신규 인원으로 리포트 열람 권한 필요", status="pending"),
        UserAddRequest(id=2, requester_id=5, target_name="배수진", target_email="bae.sj@posco.co.kr", reason="POSCO 기획팀 프로젝트 현황 리포트 검토 필요", status="pending"),
        UserAddRequest(id=3, requester_id=9, target_name="노현우", target_email="noh.hw@seah.co.kr", reason="SeAH 재무팀 인턴 리포트 열람 권한 요청", status="approved", reviewer_id=1),
        UserAddRequest(id=4, requester_id=2, target_name="장서윤", target_email="jang.sy@seah.co.kr", reason="SeAH 경영관리팀 계약직 직원 접근 권한 필요", status="approved", reviewer_id=1),
        UserAddRequest(id=5, requester_id=5, target_name="임태현", target_email="lim.th@posco.co.kr", reason="외부 컨설턴트 임시 접근 권한", status="rejected", reviewer_id=1),
    ]
    db.add_all(requests_data)
    db.flush()

    # 감사 로그
    logs = [
        AuditLog(actor="김관리", action_type="로그인", detail="관리자 로그인 성공", target="-", ip_address="192.168.1.100", timestamp=now - timedelta(hours=1)),
        AuditLog(actor="송유라", action_type="리포트 열람", detail="매출 현황 리포트 열람", target="매출 현황", ip_address="192.168.1.105", timestamp=now - timedelta(hours=2)),
        AuditLog(actor="박정민", action_type="사용자 추가 요청", detail="김현수 (kim.hs@posco.co.kr) 사용자 추가 요청", target="김현수", ip_address="192.168.1.102", timestamp=now - timedelta(hours=3)),
        AuditLog(actor="김관리", action_type="권한 변경", detail="이서현 사용자 PDF 다운로드 권한 부여", target="이서현", ip_address="192.168.1.100", timestamp=now - timedelta(days=1)),
        AuditLog(actor="윤대경", action_type="리포트 다운로드", detail="재무 보고서 PDF 다운로드", target="재무 보고서", ip_address="192.168.1.107", timestamp=now - timedelta(days=1, hours=6)),
        AuditLog(actor="박정민", action_type="로그인", detail="매니저 로그인 성공", target="-", ip_address="192.168.1.102", timestamp=now - timedelta(days=1, hours=10)),
        AuditLog(actor="정민수", action_type="리포트 열람", detail="프로젝트 진행 현황 리포트 열람", target="프로젝트 진행 현황", ip_address="10.0.0.50", timestamp=now - timedelta(days=1, hours=13)),
        AuditLog(actor="김관리", action_type="사용자 비활성화", detail="한지혜 사용자 비활성화 처리", target="한지혜", ip_address="192.168.1.100", timestamp=now - timedelta(days=2)),
        AuditLog(actor="이서현", action_type="로그인", detail="뷰어 로그인 성공", target="-", ip_address="192.168.1.103", timestamp=now - timedelta(days=2, hours=3)),
        AuditLog(actor="최영우", action_type="리포트 열람", detail="비감사용역 현황 리포트 열람", target="비감사용역 현황", ip_address="10.0.0.55", timestamp=now - timedelta(days=3)),
        AuditLog(actor="김관리", action_type="요청 승인", detail="노현우 사용자 추가 요청 승인", target="노현우", ip_address="192.168.1.100", timestamp=now - timedelta(days=3, hours=5)),
        AuditLog(actor="오진우", action_type="로그인", detail="뷰어 로그인 성공", target="-", ip_address="10.0.0.60", timestamp=now - timedelta(days=4)),
        AuditLog(actor="정민수", action_type="사용자 추가 요청", detail="배수진 (bae.sj@posco.co.kr) 사용자 추가 요청", target="배수진", ip_address="10.0.0.50", timestamp=now - timedelta(days=4, hours=8)),
        AuditLog(actor="김관리", action_type="요청 반려", detail="임태현 외부 컨설턴트 접근 요청 반려", target="임태현", ip_address="192.168.1.100", timestamp=now - timedelta(days=5)),
        AuditLog(actor="송유라", action_type="리포트 다운로드", detail="인력 현황 Excel 다운로드", target="인력 현황", ip_address="192.168.1.105", timestamp=now - timedelta(days=6)),
        AuditLog(actor="박정민", action_type="사용자 추가 요청", detail="김현수 (kim.hs@posco.co.kr) 사용자 추가 요청", target="김현수", ip_address="192.168.1.102", timestamp=now - timedelta(days=6, hours=5)),
        AuditLog(actor="김관리", action_type="그룹 생성", detail="POSCO 분석팀 그룹 생성", target="POSCO 분석팀", ip_address="192.168.1.100", timestamp=now - timedelta(days=7)),
        AuditLog(actor="송유라", action_type="사용자 추가 요청", detail="노현우 (noh.hw@seah.co.kr) 사용자 추가 요청", target="노현우", ip_address="192.168.1.105", timestamp=now - timedelta(days=8)),
        AuditLog(actor="김관리", action_type="비밀번호 초기화", detail="한지혜 사용자 비밀번호 초기화", target="한지혜", ip_address="192.168.1.100", timestamp=now - timedelta(days=9)),
    ]
    db.add_all(logs)
    db.flush()

    # 회사
    companies = [
        Company(id=1, name="PwC"),
        Company(id=2, name="SeAH"),
        Company(id=3, name="POSCO"),
    ]
    db.add_all(companies)
    db.flush()

    # 자회사
    subs = [
        Subsidiary(name="SeAH 경영관리팀", company_id=2),
        Subsidiary(name="SeAH 재무팀", company_id=2),
        Subsidiary(name="SeAH 인사팀", company_id=2),
        Subsidiary(name="POSCO 기획팀", company_id=3),
        Subsidiary(name="POSCO 분석팀", company_id=3),
        Subsidiary(name="POSCO 재무팀", company_id=3),
    ]
    db.add_all(subs)
    db.flush()

    # 역할
    roles_data = [
        Role(name="Full Access", category="pwc", description="모든 기능에 대한 전체 접근 권한", permissions=json.dumps(["자료 업로드", "리포트 열람", "공유/인쇄", "Excel/PDF 추출", "코멘트", "사용자 추가 신청", "사용자 관리", "권한 설정"], ensure_ascii=False)),
        Role(name="Standard", category="pwc", description="일반 업무에 필요한 표준 권한", permissions=json.dumps(["자료 업로드", "리포트 열람", "Excel/PDF 추출", "코멘트"], ensure_ascii=False)),
        Role(name="View Only", category="pwc", description="리포트 열람만 가능한 읽기 전용 권한", permissions=json.dumps(["리포트 열람"], ensure_ascii=False)),
        Role(name="Client Manager", category="client", description="고객사 관리자 - 소속 사용자 관리 및 전체 기능 접근", permissions=json.dumps(["자료 업로드", "리포트 열람", "공유/인쇄", "Excel/PDF 추출", "코멘트", "사용자 추가 신청"], ensure_ascii=False)),
        Role(name="Client Standard", category="client", description="고객사 표준 사용자 - 리포트 열람 및 기본 기능", permissions=json.dumps(["리포트 열람", "Excel/PDF 추출", "코멘트"], ensure_ascii=False)),
        Role(name="Client View Only", category="client", description="고객사 뷰어 - 리포트 열람만 가능", permissions=json.dumps(["리포트 열람"], ensure_ascii=False)),
    ]
    db.add_all(roles_data)

    db.commit()
    db.close()
    print("Seed 데이터가 성공적으로 입력되었습니다.")
