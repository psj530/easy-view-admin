"use client";

interface RoleCard {
  name: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  permissions: string[];
}

const pwcRoles: RoleCard[] = [
  {
    name: "Full Access",
    color: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    description: "모든 관리 기능에 대한 전체 접근 권한을 가집니다.",
    permissions: [
      "사용자 등록/삭제/수정",
      "역할 및 권한 변경",
      "그룹 생성/관리",
      "리포트 전체 접근",
      "보안 설정 변경",
      "로그 열람",
    ],
  },
  {
    name: "Standard",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    description: "일반적인 관리 업무를 수행할 수 있는 표준 권한입니다.",
    permissions: [
      "사용자 등록/수정 (삭제 불가)",
      "그룹 조회",
      "리포트 조회/편집",
      "로그 열람",
    ],
  },
  {
    name: "View Only",
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    description: "조회 전용 권한으로 데이터 수정이 불가합니다.",
    permissions: [
      "사용자 목록 조회",
      "그룹 조회",
      "리포트 조회",
      "로그 열람",
    ],
  },
];

const clientRoles: RoleCard[] = [
  {
    name: "Client Manager",
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    description: "고객사 내 관리자 역할로, 소속 사용자 관리가 가능합니다.",
    permissions: [
      "소속 사용자 조회/수정",
      "리포트 전체 접근",
      "데이터 다운로드",
      "알림 설정",
    ],
  },
  {
    name: "Client Standard",
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    description: "고객사 일반 사용자로, 리포트 조회 및 편집이 가능합니다.",
    permissions: [
      "리포트 조회/편집",
      "데이터 다운로드",
      "댓글 작성",
    ],
  },
  {
    name: "Client View Only",
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    description: "고객사 조회 전용 사용자로, 리포트만 열람할 수 있습니다.",
    permissions: [
      "리포트 조회",
      "대시보드 열람",
    ],
  },
];

function RoleCardComponent({ role }: { role: RoleCard }) {
  return (
    <div
      className={`rounded-lg border ${role.borderColor} ${role.bgColor} p-5`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${role.color} ${role.bgColor}`}
        >
          {role.name}
        </span>
      </div>
      <p className="text-sm text-pwc-gray-600 mb-4">{role.description}</p>
      <div className="space-y-1.5">
        {role.permissions.map((perm) => (
          <div key={perm} className="flex items-center gap-2 text-sm text-pwc-gray-700">
            <span className="w-1.5 h-1.5 rounded-full bg-pwc-gray-400 flex-shrink-0" />
            {perm}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RolesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-pwc-black">역할(Role) 정의</h1>
        <p className="text-sm text-pwc-gray-500 mt-1">
          시스템에서 사용되는 역할과 권한 범위를 확인합니다.
        </p>
      </div>

      {/* 2-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* PwC 내부 역할 */}
        <div className="card">
          <h2 className="text-lg font-semibold text-pwc-black mb-1">
            PwC 내부 역할
          </h2>
          <p className="text-sm text-pwc-gray-500 mb-5">
            PwC 내부 사용자에게 부여되는 역할입니다.
          </p>
          <div className="space-y-4">
            {pwcRoles.map((role) => (
              <RoleCardComponent key={role.name} role={role} />
            ))}
          </div>
        </div>

        {/* 고객사 역할 */}
        <div className="card">
          <h2 className="text-lg font-semibold text-pwc-black mb-1">
            고객사(Client) 역할
          </h2>
          <p className="text-sm text-pwc-gray-500 mb-5">
            고객사 사용자에게 부여되는 역할입니다.
          </p>
          <div className="space-y-4">
            {clientRoles.map((role) => (
              <RoleCardComponent key={role.name} role={role} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
