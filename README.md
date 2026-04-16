# Easy View Admin Portal

PwC Digital Finance Portal - Easy View 관리자 페이지

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: FastAPI (Python 3.12) + SQLAlchemy
- **Font**: Helvetica

## Project Structure

```
easy-view-admin/
├── frontend/          # Next.js App
│   ├── app/
│   │   ├── admin/     # Admin pages
│   │   └── components/
│   └── public/
├── backend/           # FastAPI Server
│   ├── routers/
│   ├── models/
│   └── schemas/
├── prototype/         # HTML prototypes (reference only)
└── docker-compose.yml
```

## Quick Start

### Frontend
```bash
cd frontend
npm install
npm run dev
# http://localhost:3000
```

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
# http://localhost:8000/docs
```

### Docker
```bash
docker-compose up --build
```

## Admin Pages

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | /admin | 통계, 차트, 최근 활동 |
| 고객사 계정 관리 | /admin/accounts | 사용자 CRUD, 상태 관리 |
| 그룹 관리 | /admin/groups | 고객사 그룹 분류 |
| PwC 내부 사용자 | /admin/pwc-users | 내부 권한 관리 |
| 사용자 추가 신청 | /admin/requests | 승인/반려 워크플로우 |
| 리포트 접근 권한 | /admin/permissions | 체크박스 매트릭스 |
| 역할 정의 | /admin/roles | PwC/Client 역할 |
| 계정 상태/보안 | /admin/security | 잠금, 비밀번호, 실패 로그 |
| 로그/방문이력 | /admin/logs | 방문 차트, 변경 로그 |
