# Easy View Admin Portal

PwC Digital Finance Portal - Easy View 관리자 포털

## 배포 URL

| 서비스 | URL |
|--------|-----|
| Frontend (Vercel) | https://easy-view-admin.vercel.app |
| Backend API (Render) | https://easy-view-admin.onrender.com |
| API 문서 (Swagger) | https://easy-view-admin.onrender.com/docs |
| GitHub | https://github.com/psj530/easy-view-admin |

**관리자 계정**: `admin@pwc.com` / `admin1234!`

---

## Tech Stack

| 구분 | 기술 |
|------|------|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Backend | FastAPI (Python 3.12) + SQLAlchemy + SQLite |
| 인증 | JWT (SSO 전환 대비 추상화) |
| 이메일 | Gmail SMTP |
| 배포 | Vercel (Frontend) + Render (Backend) |

---

## 프로젝트 구조

```
easy-view-admin/
├── frontend/                    # Next.js 프론트엔드
│   ├── app/
│   │   ├── admin/               # Admin 페이지들
│   │   │   ├── accounts/        # 고객사 계정 관리
│   │   │   ├── groups/          # 그룹(회사/자회사) 관리
│   │   │   ├── pwc-users/       # PwC 내부 사용자
│   │   │   ├── requests/        # 사용자 추가 신청
│   │   │   ├── permissions/     # 리포트 접근 권한
│   │   │   ├── roles/           # 역할 정의
│   │   │   ├── security/        # 계정 상태/보안
│   │   │   ├── data-request/    # 자료 요청 (업로드/요청)
│   │   │   ├── logs/            # 로그/방문이력
│   │   │   ├── layout.tsx       # Admin 레이아웃 (인증 가드)
│   │   │   └── page.tsx         # Dashboard
│   │   ├── login/               # 로그인 페이지
│   │   ├── components/          # 공통 컴포넌트
│   │   │   ├── Header.tsx       # PwC 테마 헤더
│   │   │   ├── Sidebar.tsx      # Admin 사이드바
│   │   │   ├── Toast.tsx        # 토스트 알림
│   │   │   └── UserRegistrationModal.tsx  # 사용자 등록 모달
│   │   ├── lib/
│   │   │   ├── api.ts           # API 클라이언트 (fetch wrapper)
│   │   │   └── auth.tsx         # 인증 Context (AuthProvider)
│   │   ├── globals.css          # Tailwind + PwC 커스텀 스타일
│   │   ├── layout.tsx           # Root 레이아웃
│   │   └── page.tsx             # 홈페이지
│   ├── .env.local               # 로컬 환경변수
│   ├── next.config.js
│   ├── tailwind.config.ts
│   └── vercel.json
├── backend/                     # FastAPI 백엔드
│   ├── main.py                  # FastAPI 앱 (CORS, 라우터 등록, DB 초기화)
│   ├── config.py                # 환경변수 설정 (Pydantic Settings)
│   ├── database.py              # SQLAlchemy 엔진/세션
│   ├── auth_utils.py            # JWT 인증 (SSO 전환 대비 추상화)
│   ├── email_service.py         # Gmail SMTP 이메일 발송
│   ├── seed.py                  # 초기 데이터 시딩
│   ├── models/                  # SQLAlchemy 모델
│   │   ├── user.py              # 사용자
│   │   ├── group.py             # 그룹 (대상법인)
│   │   ├── company.py           # 회사 + 자회사
│   │   ├── role.py              # 역할 정의
│   │   ├── permission.py        # 권한 (리포트 매트릭스 + 사용자별)
│   │   ├── request.py           # 사용자 추가 요청
│   │   └── audit.py             # 감사 로그
│   ├── routers/                 # API 엔드포인트
│   │   ├── auth.py              # 인증 (로그인/로그아웃/me)
│   │   ├── users.py             # 사용자 CRUD + 상태 토글 + PW 초기화
│   │   ├── groups.py            # 그룹 CRUD
│   │   ├── companies.py         # 회사/자회사 관리 + 회사명 목록
│   │   ├── roles.py             # 역할 CRUD
│   │   ├── permissions.py       # 권한 매트릭스/사용자별 CRUD
│   │   ├── requests.py          # 추가 요청 + 승인/반려
│   │   ├── security.py          # 계정 상태/로그인 실패 통계
│   │   └── audit.py             # 감사 로그 조회/통계
│   ├── schemas/                 # Pydantic 스키마
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── render.yaml                  # Render 배포 설정
├── prototype/                   # HTML 프로토타입 (참고용)
└── README.md
```

---

## API 엔드포인트

### 인증
| Method | Path | 설명 |
|--------|------|------|
| POST | /api/auth/login | 로그인 (JWT 발급) |
| POST | /api/auth/logout | 로그아웃 |
| GET | /api/auth/me | 현재 사용자 정보 |

### 사용자 관리
| Method | Path | 설명 |
|--------|------|------|
| GET | /api/users | 사용자 목록 (search, company, role, status 필터) |
| POST | /api/users | 사용자 생성 + Welcome 메일 자동 발송 |
| GET | /api/users/{id} | 사용자 상세 |
| PUT | /api/users/{id} | 사용자 수정 + 역할/상태 변경 시 알림 메일 |
| DELETE | /api/users/{id} | 사용자 삭제 |
| POST | /api/users/{id}/reset-password | 비밀번호 초기화 |
| POST | /api/users/{id}/toggle-status | 활성/비활성 토글 |

### 회사/자회사
| Method | Path | 설명 |
|--------|------|------|
| GET | /api/companies | 회사 + 자회사 목록 |
| POST | /api/companies | 회사 생성 |
| POST | /api/companies/subsidiaries | 자회사 생성 |
| GET | /api/companies/names | 회사명 목록 (필터 드롭다운용) |

### 그룹 (대상법인)
| Method | Path | 설명 |
|--------|------|------|
| GET | /api/groups | 그룹 목록 |
| POST | /api/groups | 그룹 생성 |
| PUT | /api/groups/{id} | 그룹 수정 |

### 권한
| Method | Path | 설명 |
|--------|------|------|
| GET | /api/permissions/matrix | 리포트 권한 매트릭스 |
| PUT | /api/permissions/matrix | 리포트 권한 일괄 수정 |
| GET | /api/permissions/detail | 사용자별 상세 권한 |
| PUT | /api/permissions/detail | 사용자별 권한 일괄 수정 |

### 역할
| Method | Path | 설명 |
|--------|------|------|
| GET | /api/roles | 역할 목록 (category 필터: pwc/client) |
| POST | /api/roles | 역할 생성 |
| PUT | /api/roles/{id} | 역할 수정 |
| DELETE | /api/roles/{id} | 역할 삭제 |

### 보안
| Method | Path | 설명 |
|--------|------|------|
| GET | /api/security/accounts | 계정 상태 현황 + 요약 통계 |
| GET | /api/security/login-failures | 로그인 실패 통계 (최근 7일) |
| GET | /api/security/stats | 보안 대시보드 통계 |

### 사용자 추가 요청
| Method | Path | 설명 |
|--------|------|------|
| GET | /api/requests | 요청 목록 (status, search 필터) |
| POST | /api/requests | 요청 생성 |
| PUT | /api/requests/{id}/approve | 승인 |
| PUT | /api/requests/{id}/reject | 반려 |

### 감사 로그
| Method | Path | 설명 |
|--------|------|------|
| GET | /api/audit-logs | 로그 목록 (페이징, 필터) |
| GET | /api/audit-logs/stats | 통계 (유형별, 수행자별, 일별) |

---

## Admin 페이지 상세

### 1. Dashboard (`/admin`)
- 전체/활성 사용자 수, 고객사 수, 활동 로그 수 카드
- 일별 활동 추이 바 차트
- 활동 유형별 분포
- 등록 사용자 테이블 + 최근 활동 타임라인

### 2. 고객사 계정 관리 (`/admin/accounts`)
- 검색 (이름, 이메일, 회사명) + 상태/역할/회사 필터 (DB 동적 로드)
- 체크박스 일괄 선택 → 일괄 상태변경/삭제
- 수정 버튼 → 모달 팝업 (이름, 이메일, 회사, 역할, 상태 + 알림 발송 토글)
- 사용자 등록 → 모달 (회사 검색, 자회사 검색, 6개 권한 체크, Welcome 메일)

### 3. 그룹 관리 (`/admin/groups`)
- **회사/자회사 관리 탭**: 회사 카드 + 자회사 목록
  - 회사 생성 모달: 회사명 + 자회사 동시 생성 (+ 버튼으로 추가)
  - 자회사 추가 모달: 소속 회사 선택 + 자회사명
- **그룹(대상법인) 관리 탭**: 그룹 테이블 (검색, 생성, 편집)

### 4. PwC 내부 사용자 (`/admin/pwc-users`)
- `/api/users?company=PwC`로 PwC 직원만 조회
- 역할별 탭 필터 (전체/admin/manager/viewer)

### 5. 사용자 추가 신청 (`/admin/requests`)
- 상태별 탭 (전체/대기/승인/반려)
- 대기 건수 뱃지 표시
- 승인/반려 버튼 → API 호출 + 감사 로그

### 6. 리포트 접근 권한 (`/admin/permissions`)
- **사용자별 기능 권한 탭** (기본):
  - 검색 + 도메인 필터 + N명/전체명 카운트
  - "리포트 전체" 체크 → 전체 페이지 허용
  - 해제 시 → [설정] 버튼 → 팝업으로 페이지별 접근 권한 설정
  - 팝업: 카테고리별 체크박스 (손익분석 5개, 재무상태분석 3개, 전표분석 2개, 시나리오분석 6개)
  - 전체 선택 + 카운트 (N/16 페이지 허용)
- **리포트 데이터 권한 탭**: 리포트 x 역할 매트릭스
- 변경 알림 토글 (ON 시 저장 후 알림 메일 발송)

### 7. 역할 정의 (`/admin/roles`)
- PwC 내부 역할 + 고객사 역할 (DB에서 로드)
- 역할별 카드: 이름, 설명, 권한 목록

### 8. 계정 상태/보안 (`/admin/security`)
- 요약 카드 (전체, 활성, 비활성, PW 만료 임박)
- **계정 상태 탭**: 사용자 테이블 (2FA, 마지막 로그인, PW 만료일, 활성화/비활성화 버튼)
- **비밀번호 정책 탭**: 최소 길이, 대문자/숫자/특수문자 필수, 실패 허용 횟수, 만료 주기
- **로그인 실패 로그 탭**: 일별 차트 + 실패 기록 테이블

### 9. 자료 요청 (`/admin/data-request`)
- **자료 업로드 탭**: 제목, 설명, 파일 드래그앤드롭
- **자료 요청 탭**: 제목, 상세 내용, 마감일

### 10. 로그/방문이력 (`/admin/logs`)
- 활동 유형 필터 (로그인, 리포트 열람, 권한 변경 등)
- 일별 활동 바 차트
- 변경 이력 테이블 (페이지네이션)

---

## 인증 구조 (SSO 전환 대비)

```
현재: JWT 로컬 인증
├── auth_utils.py > get_current_user()
│   ├── AUTH_PROVIDER == "local" → JWT 토큰 검증
│   └── AUTH_PROVIDER == "sso"  → SSO 토큰 검증 (TODO)
├── 프론트엔드: AuthProvider Context
│   ├── localStorage에 access_token + user 저장
│   └── 401 응답 시 자동 로그아웃 + /login 리다이렉트

SSO 전환 시:
1. config.py: AUTH_PROVIDER = "sso", SSO_PROVIDER_URL 등 설정
2. auth_utils.py: get_current_user()에 SSO 검증 로직 추가
3. routers/auth.py: /login을 SSO 콜백으로 대체
4. 프론트엔드: /login 페이지를 SSO 리다이렉트로 변경
```

---

## 이메일 발송

| 이벤트 | 발송 내용 |
|--------|----------|
| 사용자 생성 | Welcome 메일 (로그인 정보, 임시 비밀번호) |
| 역할/상태 변경 | 변경 알림 메일 (변경 전/후 표시) |

**설정**: Render 환경변수에 `SMTP_USER`, `SMTP_PASSWORD` (Gmail 앱 비밀번호) 추가

---

## 환경변수

### Backend (Render)
| 변수 | 설명 | 기본값 |
|------|------|--------|
| DATABASE_URL | DB 연결 문자열 | sqlite:///./easyview.db |
| SECRET_KEY | JWT 서명 키 | (Generate) |
| CORS_ORIGINS | 허용 Origin | * |
| AUTH_PROVIDER | 인증 방식 | local |
| SMTP_USER | Gmail 주소 | (선택) |
| SMTP_PASSWORD | Gmail 앱 비밀번호 | (선택) |

### Frontend (Vercel)
| 변수 | 설명 |
|------|------|
| NEXT_PUBLIC_API_URL | 백엔드 API URL |

---

## 로컬 개발

```bash
# 프론트엔드
cd frontend
npm install
npm run dev        # http://localhost:3000

# 백엔드
cd backend
pip install -r requirements.txt
uvicorn main:app --reload  # http://localhost:8000
```

---

## Seed 데이터

서버 시작 시 자동 생성 (DB가 비어있을 때):

- **사용자 10명** (admin 1, manager 3, viewer 6)
- **회사 3개** (PwC, SeAH, POSCO)
- **자회사 6개** (각 회사별 2~3개)
- **그룹 4개** (SeAH 2, POSCO 2)
- **역할 6개** (PwC 3 + Client 3)
- **리포트 권한 매트릭스** (5개 리포트 x 3개 역할)
- **사용자별 권한 10명**
- **추가 요청 5건** (대기 2, 승인 2, 반려 1)
- **감사 로그 19건**

---

## 리포트 페이지 구조 (개발 중)

```
Summary
├── 손익분석
│   ├── PL 요약
│   ├── PL 추이분석
│   ├── PL 계정분석
│   ├── 매출분석
│   └── 손익항목
├── 재무상태분석
│   ├── BS 요약
│   ├── BS 추이분석
│   └── BS 계정분석
├── 전표분석
│   ├── 전표분석내역
│   └── 전표검색
├── 시나리오분석
│   ├── 동일금액 중복 전표
│   ├── 현금지급 後 부채인식
│   ├── 주말 현금지급
│   ├── 고액 현금지급
│   ├── 비용인식 동시 현금지급
│   └── Seldom Used Customer
└── 문의게시판
```

---

## 주의사항

- **Render Free 플랜**: 15분 비활성 시 슬립 → 재시작 시 SQLite DB 초기화 (seed 데이터로 복원)
- 실서비스에서는 PostgreSQL (Render 무료 플랜 지원)로 전환 필요
- 이메일 발송은 SMTP 환경변수 미설정 시 자동 스킵 (앱 정상 작동)
