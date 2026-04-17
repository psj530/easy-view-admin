"use client";

import { useState, useEffect, useCallback } from "react";
import { rolesApi } from "../../lib/api";

interface RoleData {
  id: number;
  name: string;
  category: string;
  description: string;
  permissions: string[];
}

const categoryColors: Record<string, { color: string; bgColor: string; borderColor: string }> = {
  "Full Access": { color: "text-red-700", bgColor: "bg-red-50", borderColor: "border-red-200" },
  "Standard": { color: "text-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
  "View Only": { color: "text-gray-600", bgColor: "bg-gray-50", borderColor: "border-gray-200" },
  "Client Manager": { color: "text-purple-700", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
  "Client Standard": { color: "text-orange-700", bgColor: "bg-orange-50", borderColor: "border-orange-200" },
  "Client View Only": { color: "text-gray-600", bgColor: "bg-gray-50", borderColor: "border-gray-200" },
};

const defaultColor = { color: "text-blue-700", bgColor: "bg-blue-50", borderColor: "border-blue-200" };

function RoleCard({ role }: { role: RoleData }) {
  const c = categoryColors[role.name] || defaultColor;
  return (
    <div className={`rounded-lg border ${c.borderColor} ${c.bgColor} p-5`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${c.color} ${c.bgColor}`}>
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
  const [pwcRoles, setPwcRoles] = useState<RoleData[]>([]);
  const [clientRoles, setClientRoles] = useState<RoleData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRoles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await rolesApi.list();
      const roles: RoleData[] = data.roles || [];
      setPwcRoles(roles.filter((r) => r.category === "pwc"));
      setClientRoles(roles.filter((r) => r.category === "client"));
    } catch { /* */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadRoles(); }, [loadRoles]);

  if (loading) return <div className="flex items-center justify-center h-64 text-pwc-gray-500">로딩 중...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-pwc-black">역할(Role) 정의</h1>
        <p className="text-sm text-pwc-gray-500 mt-1">시스템에서 사용되는 역할과 권한 범위를 확인합니다.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-pwc-black mb-1">PwC 내부 역할</h2>
          <p className="text-sm text-pwc-gray-500 mb-5">PwC 내부 사용자에게 부여되는 역할입니다.</p>
          <div className="space-y-4">
            {pwcRoles.map((role) => <RoleCard key={role.id} role={role} />)}
            {pwcRoles.length === 0 && <p className="text-sm text-pwc-gray-400">등록된 역할이 없습니다.</p>}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-pwc-black mb-1">고객사(Client) 역할</h2>
          <p className="text-sm text-pwc-gray-500 mb-5">고객사 사용자에게 부여되는 역할입니다.</p>
          <div className="space-y-4">
            {clientRoles.map((role) => <RoleCard key={role.id} role={role} />)}
            {clientRoles.length === 0 && <p className="text-sm text-pwc-gray-400">등록된 역할이 없습니다.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
