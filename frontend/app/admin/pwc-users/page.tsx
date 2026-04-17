"use client";

import { useState, useEffect, useCallback } from "react";
import { usersApi } from "../../lib/api";

interface PwcUser {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  last_login: string | null;
}

const roleBadge = (role: string) => {
  const map: Record<string, string> = {
    admin: "bg-red-100 text-red-700",
    manager: "bg-blue-100 text-blue-700",
    viewer: "bg-gray-100 text-gray-600",
  };
  return map[role] || "bg-gray-100 text-gray-600";
};

export default function PwcUsersPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [users, setUsers] = useState<PwcUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { company: "PwC" };
      if (activeTab !== "all") params.role = activeTab;
      const data = await usersApi.list(params);
      setUsers(data.users || []);
    } catch { setUsers([]); }
    finally { setLoading(false); }
  }, [activeTab]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const adminCount = users.filter((u) => u.role === "admin").length;
  const managerCount = users.filter((u) => u.role === "manager").length;
  const viewerCount = users.filter((u) => u.role === "viewer").length;

  const tabs = [
    { key: "all", label: "전체", count: users.length },
    { key: "admin", label: "Admin", count: adminCount },
    { key: "manager", label: "Manager", count: managerCount },
    { key: "viewer", label: "Viewer", count: viewerCount },
  ];

  const toggleSelectAll = () => {
    setSelectedUsers(selectedUsers.length === users.length ? [] : users.map((u) => u.id));
  };

  const toggleSelect = (id: number) => {
    setSelectedUsers((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-pwc-black">PwC 내부 사용자</h1>
        <p className="text-sm text-pwc-gray-500 mt-1">PwC 내부 사용자 목록과 역할을 관리합니다.</p>
      </div>

      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => { setActiveTab(tab.key); setSelectedUsers([]); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.key ? "bg-pwc-orange text-white" : "bg-white text-pwc-gray-600 border border-pwc-gray-200 hover:bg-pwc-gray-50"}`}>
            {tab.label} <span className={`ml-1 ${activeTab === tab.key ? "text-white/80" : "text-pwc-gray-400"}`}>{tab.count}</span>
          </button>
        ))}
      </div>

      <div className="card overflow-hidden p-0">
        <div className="px-6 py-3 border-b border-pwc-gray-200 bg-pwc-gray-50">
          <span className="text-sm text-pwc-gray-600">{users.length}명
            {selectedUsers.length > 0 && <span className="ml-2 text-pwc-orange">({selectedUsers.length}명 선택)</span>}
          </span>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-12 text-center text-pwc-gray-400">로딩 중...</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-pwc-gray-200 bg-pwc-gray-50">
                  <th className="py-3 px-4 w-10">
                    <input type="checkbox" checked={users.length > 0 && selectedUsers.length === users.length} onChange={toggleSelectAll} className="w-4 h-4 rounded border-pwc-gray-300 text-pwc-orange focus:ring-pwc-orange" />
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">사용자</th>
                  <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">역할</th>
                  <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">최종 접속</th>
                  <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">관리</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className={`border-b border-pwc-gray-100 hover:bg-pwc-gray-50 transition-colors ${selectedUsers.includes(user.id) ? "bg-orange-50" : ""}`}>
                    <td className="py-3 px-4">
                      <input type="checkbox" checked={selectedUsers.includes(user.id)} onChange={() => toggleSelect(user.id)} className="w-4 h-4 rounded border-pwc-gray-300 text-pwc-orange focus:ring-pwc-orange" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-pwc-orange flex items-center justify-center text-white text-xs font-medium flex-shrink-0">{user.name[0]}</div>
                        <div>
                          <p className="font-medium text-pwc-black">{user.name}</p>
                          <p className="text-xs text-pwc-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleBadge(user.role)}`}>{user.role}</span>
                    </td>
                    <td className="py-3 px-4 text-pwc-gray-500">{user.last_login?.slice(0, 16) || "-"}</td>
                    <td className="py-3 px-4">
                      <button className="text-xs bg-pwc-gray-100 text-pwc-gray-700 px-3 py-1.5 rounded hover:bg-pwc-gray-200 transition-colors">편집</button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={5} className="py-12 text-center text-pwc-gray-400">검색 결과가 없습니다.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
