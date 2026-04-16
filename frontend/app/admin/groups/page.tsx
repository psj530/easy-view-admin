"use client";

import { useState, useEffect, useCallback } from "react";
import { groupsApi } from "../../lib/api";
import { showToast } from "../../components/Toast";

interface Group {
  id: number;
  name: string;
  company: string;
  default_role: string;
  member_count: number;
  report_count: number;
  created_at: string | null;
}

const roleBadgeColor = (role: string) => {
  const map: Record<string, string> = {
    admin: "bg-red-100 text-red-700",
    manager: "bg-blue-100 text-blue-700",
    viewer: "bg-gray-100 text-gray-600",
  };
  return map[role] || "bg-gray-100 text-gray-600";
};

export default function GroupsPage() {
  const [search, setSearch] = useState("");
  const [groups, setGroups] = useState<Group[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const data = await groupsApi.list();
      setGroups(data.groups || []);
      setTotal(data.total ?? 0);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "그룹 목록을 불러오지 못했습니다.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  const filtered = groups.filter(
    (g) => g.name.includes(search) || g.company.includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-pwc-black">그룹 관리</h1>
          <p className="text-sm text-pwc-gray-500 mt-1">고객사 그룹을 관리하고 기본 권한을 설정합니다.</p>
        </div>
        <button className="btn-primary">+ 그룹 생성</button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="max-w-md">
          <label className="block text-xs font-medium text-pwc-gray-500 mb-1">검색</label>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="그룹명, 고객사 검색" className="input-field" />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="px-6 py-3 border-b border-pwc-gray-200 bg-pwc-gray-50">
          <span className="text-sm text-pwc-gray-600">총 {filtered.length}개 그룹</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-pwc-gray-200 bg-pwc-gray-50">
                <th className="text-left py-3 px-6 font-medium text-pwc-gray-500">그룹명</th>
                <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">고객사</th>
                <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">사용자 수</th>
                <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">기본 권한</th>
                <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">리포트 수</th>
                <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">생성일</th>
                <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">관리</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center text-pwc-gray-400">로딩 중...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-pwc-gray-400">검색 결과가 없습니다.</td></tr>
              ) : (
                filtered.map((group) => (
                  <tr key={group.id} className="border-b border-pwc-gray-100 hover:bg-pwc-gray-50 transition-colors">
                    <td className="py-3 px-6"><span className="font-medium text-pwc-black">{group.name}</span></td>
                    <td className="py-3 px-4 text-pwc-gray-700">{group.company}</td>
                    <td className="py-3 px-4 text-pwc-gray-700">{group.member_count}명</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${roleBadgeColor(group.default_role)}`}>
                        {group.default_role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-pwc-gray-700">{group.report_count}개</td>
                    <td className="py-3 px-4 text-pwc-gray-500">{group.created_at?.slice(0, 10)}</td>
                    <td className="py-3 px-4">
                      <button className="text-xs bg-pwc-gray-100 text-pwc-gray-700 px-3 py-1.5 rounded hover:bg-pwc-gray-200 transition-colors">편집</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
