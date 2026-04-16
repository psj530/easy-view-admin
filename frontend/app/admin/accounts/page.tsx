"use client";

import { useState } from "react";
import UserRegistrationModal from "../../components/UserRegistrationModal";
import { showToast } from "../../components/Toast";

interface User {
  id: number;
  name: string;
  email: string;
  company: string;
  group: string;
  role: string;
  status: "active" | "inactive" | "pending" | "locked";
  avatar: string;
}

const initialUsers: User[] = [
  { id: 1, name: "김민수", email: "minsu.kim@samsung.com", company: "삼성전자", group: "Finance", role: "Manager", status: "active", avatar: "김" },
  { id: 2, name: "이서연", email: "sy.lee@lgcns.com", company: "LG CNS", group: "Tax", role: "Viewer", status: "active", avatar: "이" },
  { id: 3, name: "박준형", email: "jh.park@skgroup.com", company: "SK그룹", group: "Advisory", role: "Editor", status: "pending", avatar: "박" },
  { id: 4, name: "최유진", email: "yj.choi@hyundai.com", company: "현대자동차", group: "Finance", role: "Admin", status: "active", avatar: "최" },
  { id: 5, name: "정다은", email: "de.jung@posco.com", company: "포스코", group: "Consulting", role: "Viewer", status: "inactive", avatar: "정" },
  { id: 6, name: "한지민", email: "jm.han@lotte.com", company: "롯데그룹", group: "Finance", role: "Manager", status: "active", avatar: "한" },
  { id: 7, name: "송태양", email: "ty.song@kakao.com", company: "카카오", group: "Tax", role: "Editor", status: "locked", avatar: "송" },
  { id: 8, name: "윤서현", email: "sh.yoon@naver.com", company: "네이버", group: "Advisory", role: "Viewer", status: "active", avatar: "윤" },
  { id: 9, name: "장현우", email: "hw.jang@cj.com", company: "CJ그룹", group: "Consulting", role: "Manager", status: "pending", avatar: "장" },
  { id: 10, name: "임수빈", email: "sb.lim@gs.com", company: "GS그룹", group: "Finance", role: "Viewer", status: "active", avatar: "임" },
];

const statusOptions = ["전체", "active", "inactive", "pending", "locked"];
const roleOptions = ["전체", "Admin", "Manager", "Editor", "Viewer"];
const groupOptions = ["전체", "Finance", "Tax", "Advisory", "Consulting"];

export default function AccountsPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("전체");
  const [roleFilter, setRoleFilter] = useState("전체");
  const [groupFilter, setGroupFilter] = useState("전체");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.includes(search) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.company.includes(search);
    const matchStatus = statusFilter === "전체" || u.status === statusFilter;
    const matchRole = roleFilter === "전체" || u.role === roleFilter;
    const matchGroup = groupFilter === "전체" || u.group === groupFilter;
    return matchSearch && matchStatus && matchRole && matchGroup;
  });

  const toggleSelectAll = () => {
    if (selectedUsers.length === filtered.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filtered.map((u) => u.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleStatus = (id: number) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const newStatus = u.status === "active" ? "inactive" : "active";
          showToast(
            `${u.name}님의 상태가 ${newStatus === "active" ? "활성" : "비활성"}으로 변경되었습니다.`,
            "success"
          );
          return { ...u, status: newStatus as User["status"] };
        }
        return u;
      })
    );
  };

  const deleteUser = (id: number) => {
    const user = users.find((u) => u.id === id);
    if (user && confirm(`${user.name}님을 삭제하시겠습니까?`)) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setSelectedUsers((prev) => prev.filter((x) => x !== id));
      showToast(`${user.name}님이 삭제되었습니다.`, "success");
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { cls: string; label: string }> = {
      active: { cls: "badge-active", label: "활성" },
      inactive: { cls: "badge-inactive", label: "비활성" },
      pending: { cls: "badge-pending", label: "대기" },
      locked: { cls: "badge-locked", label: "잠금" },
    };
    const s = map[status];
    return s ? <span className={s.cls}>{s.label}</span> : null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-pwc-black">
            고객사 계정 관리
          </h1>
          <p className="text-sm text-pwc-gray-500 mt-1">
            등록된 고객사 사용자를 관리하고 권한을 설정합니다.
          </p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          + 사용자 등록
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-pwc-gray-500 mb-1">
              검색
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="이름, 이메일, 회사명"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-pwc-gray-500 mb-1">
              상태
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              {statusOptions.map((o) => (
                <option key={o} value={o}>
                  {o === "전체"
                    ? "전체"
                    : o === "active"
                      ? "활성"
                      : o === "inactive"
                        ? "비활성"
                        : o === "pending"
                          ? "대기"
                          : "잠금"}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-pwc-gray-500 mb-1">
              역할
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="input-field"
            >
              {roleOptions.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-pwc-gray-500 mb-1">
              그룹
            </label>
            <select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="input-field"
            >
              {groupOptions.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="px-6 py-3 border-b border-pwc-gray-200 flex items-center justify-between bg-pwc-gray-50">
          <span className="text-sm text-pwc-gray-600">
            총 {filtered.length}명
            {selectedUsers.length > 0 && (
              <span className="ml-2 text-pwc-orange">
                ({selectedUsers.length}명 선택)
              </span>
            )}
          </span>
          {selectedUsers.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  showToast(
                    `${selectedUsers.length}명의 상태가 변경되었습니다.`,
                    "success"
                  );
                  setSelectedUsers([]);
                }}
                className="text-xs btn-secondary py-1 px-3"
              >
                일괄 상태변경
              </button>
              <button
                onClick={() => {
                  if (
                    confirm(
                      `${selectedUsers.length}명을 삭제하시겠습니까?`
                    )
                  ) {
                    setUsers((prev) =>
                      prev.filter((u) => !selectedUsers.includes(u.id))
                    );
                    showToast(
                      `${selectedUsers.length}명이 삭제되었습니다.`,
                      "success"
                    );
                    setSelectedUsers([]);
                  }
                }}
                className="text-xs btn-danger py-1 px-3"
              >
                일괄 삭제
              </button>
            </div>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-pwc-gray-200 bg-pwc-gray-50">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      filtered.length > 0 &&
                      selectedUsers.length === filtered.length
                    }
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-pwc-gray-300 text-pwc-orange focus:ring-pwc-orange"
                  />
                </th>
                <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">
                  사용자
                </th>
                <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">
                  회사
                </th>
                <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">
                  그룹
                </th>
                <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">
                  역할
                </th>
                <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">
                  상태
                </th>
                <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">
                  관리
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr
                  key={user.id}
                  className={`border-b border-pwc-gray-100 hover:bg-pwc-gray-50 transition-colors ${
                    selectedUsers.includes(user.id) ? "bg-orange-50" : ""
                  }`}
                >
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleSelect(user.id)}
                      className="w-4 h-4 rounded border-pwc-gray-300 text-pwc-orange focus:ring-pwc-orange"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-pwc-orange flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                        {user.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-pwc-black">
                          {user.name}
                        </p>
                        <p className="text-xs text-pwc-gray-500">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-pwc-gray-700">
                    {user.company}
                  </td>
                  <td className="py-3 px-4 text-pwc-gray-700">{user.group}</td>
                  <td className="py-3 px-4">
                    <span className="badge-role">{user.role}</span>
                  </td>
                  <td className="py-3 px-4">{statusBadge(user.status)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleStatus(user.id)}
                        className="p-1.5 rounded hover:bg-pwc-gray-100 transition-colors text-pwc-gray-500 hover:text-pwc-orange"
                        title={
                          user.status === "active"
                            ? "비활성화"
                            : "활성화"
                        }
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                      </button>
                      <button
                        onClick={() =>
                          showToast(
                            `${user.name}님의 정보를 수정합니다.`,
                            "info"
                          )
                        }
                        className="p-1.5 rounded hover:bg-pwc-gray-100 transition-colors text-pwc-gray-500 hover:text-blue-600"
                        title="수정"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="p-1.5 rounded hover:bg-red-50 transition-colors text-pwc-gray-500 hover:text-red-600"
                        title="삭제"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
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

      <UserRegistrationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
