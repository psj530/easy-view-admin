"use client";

import { useState } from "react";

interface Group {
  id: number;
  name: string;
  clients: string;
  userCount: number;
  defaultRoles: string[];
  reportCount: number;
  createdAt: string;
}

const groupsData: Group[] = [
  {
    id: 1,
    name: "전체",
    clients: "모든 고객사",
    userCount: 4521,
    defaultRoles: ["Manager", "Viewer"],
    reportCount: 128,
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    name: "Holdings 본사",
    clients: "삼성전자, 현대자동차, SK그룹",
    userCount: 1240,
    defaultRoles: ["Admin", "Manager", "Viewer"],
    reportCount: 45,
    createdAt: "2024-03-22",
  },
  {
    id: 3,
    name: "SGV 베트남법인",
    clients: "삼성베트남, LG베트남",
    userCount: 860,
    defaultRoles: ["Manager", "Viewer"],
    reportCount: 32,
    createdAt: "2024-06-10",
  },
  {
    id: 4,
    name: "SGI 미국법인",
    clients: "삼성USA, 현대USA",
    userCount: 720,
    defaultRoles: ["Editor", "Viewer"],
    reportCount: 28,
    createdAt: "2024-08-05",
  },
  {
    id: 5,
    name: "POSCO 재무팀",
    clients: "포스코, 포스코케미칼",
    userCount: 340,
    defaultRoles: ["Manager"],
    reportCount: 18,
    createdAt: "2025-01-12",
  },
];

const roleBadgeColor = (role: string) => {
  const map: Record<string, string> = {
    Admin: "bg-red-100 text-red-700",
    Manager: "bg-blue-100 text-blue-700",
    Editor: "bg-purple-100 text-purple-700",
    Viewer: "bg-gray-100 text-gray-600",
  };
  return map[role] || "bg-gray-100 text-gray-600";
};

export default function GroupsPage() {
  const [search, setSearch] = useState("");

  const filtered = groupsData.filter(
    (g) =>
      g.name.includes(search) ||
      g.clients.includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-pwc-black">그룹 관리</h1>
          <p className="text-sm text-pwc-gray-500 mt-1">
            고객사 그룹을 관리하고 기본 권한을 설정합니다.
          </p>
        </div>
        <button className="btn-primary">+ 그룹 생성</button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="max-w-md">
          <label className="block text-xs font-medium text-pwc-gray-500 mb-1">
            검색
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="그룹명, 고객사 검색"
            className="input-field"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="px-6 py-3 border-b border-pwc-gray-200 bg-pwc-gray-50">
          <span className="text-sm text-pwc-gray-600">
            총 {filtered.length}개 그룹
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-pwc-gray-200 bg-pwc-gray-50">
                <th className="text-left py-3 px-6 font-medium text-pwc-gray-500">
                  그룹명
                </th>
                <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">
                  고객사
                </th>
                <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">
                  사용자 수
                </th>
                <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">
                  기본 권한
                </th>
                <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">
                  리포트 수
                </th>
                <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">
                  생성일
                </th>
                <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">
                  관리
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((group) => (
                <tr
                  key={group.id}
                  className="border-b border-pwc-gray-100 hover:bg-pwc-gray-50 transition-colors"
                >
                  <td className="py-3 px-6">
                    <span className="font-medium text-pwc-black">
                      {group.name}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-pwc-gray-700">
                    {group.clients}
                  </td>
                  <td className="py-3 px-4 text-pwc-gray-700">
                    {group.userCount.toLocaleString()}명
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {group.defaultRoles.map((role) => (
                        <span
                          key={role}
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${roleBadgeColor(role)}`}
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-pwc-gray-700">
                    {group.reportCount}개
                  </td>
                  <td className="py-3 px-4 text-pwc-gray-500">
                    {group.createdAt}
                  </td>
                  <td className="py-3 px-4">
                    <button className="text-xs bg-pwc-gray-100 text-pwc-gray-700 px-3 py-1.5 rounded hover:bg-pwc-gray-200 transition-colors">
                      편집
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-pwc-gray-400"
                  >
                    검색 결과가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
