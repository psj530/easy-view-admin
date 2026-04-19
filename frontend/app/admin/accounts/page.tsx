"use client";

import { useState, useEffect, useCallback } from "react";
import UserRegistrationModal from "../../components/UserRegistrationModal";
import { showToast } from "../../components/Toast";
import { usersApi, companiesApi } from "../../lib/api";

interface User {
  id: number;
  name: string;
  email: string;
  company: string;
  group_id: number | null;
  role: string;
  status: string;
  trust_level: string;
  two_fa: boolean;
}

const statusOptions = ["전체", "active", "inactive", "pending"];
const roleOptions = ["전체", "admin", "manager", "viewer"];
const defaultCompanyOptions = ["전체"];

export default function AccountsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("전체");
  const [roleFilter, setRoleFilter] = useState("전체");
  const [companyFilter, setCompanyFilter] = useState("전체");
  const [companyOptions, setCompanyOptions] = useState(defaultCompanyOptions);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  // 수정 모달
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", company: "", role: "", status: "" });
  const [editSaving, setEditSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (statusFilter !== "전체") params.status = statusFilter;
      if (roleFilter !== "전체") params.role = roleFilter;
      if (companyFilter !== "전체") params.company = companyFilter;
      const data = await usersApi.list(Object.keys(params).length > 0 ? params : undefined);
      setUsers(data.users ?? []);
      setTotal(data.total ?? 0);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "사용자 목록을 불러오지 못했습니다.", "error");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, roleFilter, companyFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  useEffect(() => {
    companiesApi.names().then((res) => {
      setCompanyOptions(["전체", ...(res.names || [])]);
    }).catch(() => {});
  }, []);

  const toggleSelectAll = () => {
    setSelectedUsers(selectedUsers.length === users.length ? [] : users.map((u) => u.id));
  };
  const toggleSelect = (id: number) => {
    setSelectedUsers((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const toggleStatus = async (id: number) => {
    try {
      const result = await usersApi.toggleStatus(id);
      showToast(result.message, "success");
      await fetchUsers();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "상태 변경에 실패했습니다.", "error");
    }
  };

  const deleteUser = async (id: number) => {
    const user = users.find((u) => u.id === id);
    if (user && confirm(`${user.name}님을 삭제하시겠습니까?`)) {
      try {
        await usersApi.delete(id);
        setSelectedUsers((prev) => prev.filter((x) => x !== id));
        showToast(`${user.name}님이 삭제되었습니다.`, "success");
        await fetchUsers();
      } catch (err: unknown) {
        showToast(err instanceof Error ? err.message : "삭제에 실패했습니다.", "error");
      }
    }
  };

  const bulkDelete = async () => {
    if (!confirm(`${selectedUsers.length}명을 삭제하시겠습니까?`)) return;
    try {
      await Promise.all(selectedUsers.map((id) => usersApi.delete(id)));
      showToast(`${selectedUsers.length}명이 삭제되었습니다.`, "success");
      setSelectedUsers([]);
      await fetchUsers();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "일괄 삭제에 실패했습니다.", "error");
    }
  };

  const bulkToggleStatus = async () => {
    try {
      await Promise.all(selectedUsers.map((id) => usersApi.toggleStatus(id)));
      showToast(`${selectedUsers.length}명의 상태가 변경되었습니다.`, "success");
      setSelectedUsers([]);
      await fetchUsers();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "일괄 상태 변경에 실패했습니다.", "error");
    }
  };

  const openEdit = (user: User) => {
    setEditUser(user);
    setEditForm({ name: user.name, email: user.email, company: user.company, role: user.role, status: user.status });
  };

  const saveEdit = async () => {
    if (!editUser) return;
    setEditSaving(true);
    try {
      await usersApi.update(editUser.id, editForm);
      showToast(`${editForm.name}님의 정보가 수정되었습니다.`, "success");
      setEditUser(null);
      await fetchUsers();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "수정에 실패했습니다.", "error");
    } finally {
      setEditSaving(false);
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { cls: string; label: string }> = {
      active: { cls: "badge-active", label: "활성" },
      inactive: { cls: "badge-inactive", label: "비활성" },
      pending: { cls: "badge-pending", label: "대기" },
    };
    const s = map[status];
    return s ? <span className={s.cls}>{s.label}</span> : null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-pwc-black">고객사 계정 관리</h1>
          <p className="text-sm text-pwc-gray-500 mt-1">등록된 고객사 사용자를 관리하고 권한을 설정합니다.</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">+ 사용자 등록</button>
      </div>

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-pwc-gray-500 mb-1">검색</label>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="이름, 이메일, 회사명" className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-medium text-pwc-gray-500 mb-1">상태</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field">
              {statusOptions.map((o) => (
                <option key={o} value={o}>{o === "전체" ? "전체" : o === "active" ? "활성" : o === "inactive" ? "비활성" : "대기"}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-pwc-gray-500 mb-1">역할</label>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input-field">
              {roleOptions.map((o) => (<option key={o} value={o}>{o}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-pwc-gray-500 mb-1">회사</label>
            <select value={companyFilter} onChange={(e) => setCompanyFilter(e.target.value)} className="input-field">
              {companyOptions.map((o) => (<option key={o} value={o}>{o}</option>))}
            </select>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="px-6 py-3 border-b border-pwc-gray-200 flex items-center justify-between bg-pwc-gray-50">
          <span className="text-sm text-pwc-gray-600">
            총 {total}명
            {selectedUsers.length > 0 && <span className="ml-2 text-pwc-orange">({selectedUsers.length}명 선택)</span>}
          </span>
          {selectedUsers.length > 0 && (
            <div className="flex gap-2">
              <button onClick={bulkToggleStatus} className="text-xs btn-secondary py-1 px-3">일괄 상태변경</button>
              <button onClick={bulkDelete} className="text-xs btn-danger py-1 px-3">일괄 삭제</button>
            </div>
          )}
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-12 text-center text-pwc-gray-400">불러오는 중...</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-pwc-gray-200 bg-pwc-gray-50">
                  <th className="py-3 px-4 w-10">
                    <input type="checkbox" checked={users.length > 0 && selectedUsers.length === users.length} onChange={toggleSelectAll} className="w-4 h-4 rounded border-pwc-gray-300 text-pwc-orange focus:ring-pwc-orange" />
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">사용자</th>
                  <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">회사</th>
                  <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">역할</th>
                  <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">상태</th>
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
                    <td className="py-3 px-4 text-pwc-gray-700">{user.company}</td>
                    <td className="py-3 px-4"><span className="badge-role">{user.role}</span></td>
                    <td className="py-3 px-4">{statusBadge(user.status)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => toggleStatus(user.id)} className="p-1.5 rounded hover:bg-pwc-gray-100 transition-colors text-pwc-gray-500 hover:text-pwc-orange" title={user.status === "active" ? "비활성화" : "활성화"}>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                        </button>
                        <button onClick={() => openEdit(user)} className="p-1.5 rounded hover:bg-pwc-gray-100 transition-colors text-pwc-gray-500 hover:text-blue-600" title="수정">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => deleteUser(user.id)} className="p-1.5 rounded hover:bg-red-50 transition-colors text-pwc-gray-500 hover:text-red-600" title="삭제">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={6} className="py-12 text-center text-pwc-gray-400">검색 결과가 없습니다.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 수정 모달 */}
      {editUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setEditUser(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-semibold text-pwc-black mb-4">사용자 정보 수정</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-pwc-gray-700 mb-1">이름</label>
                <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-pwc-gray-700 mb-1">이메일</label>
                <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-pwc-gray-700 mb-1">회사</label>
                <input type="text" value={editForm.company} onChange={(e) => setEditForm({ ...editForm, company: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-pwc-gray-700 mb-1">역할</label>
                <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} className="input-field">
                  <option value="admin">admin</option>
                  <option value="manager">manager</option>
                  <option value="viewer">viewer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-pwc-gray-700 mb-1">상태</label>
                <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className="input-field">
                  <option value="active">활성</option>
                  <option value="inactive">비활성</option>
                  <option value="pending">대기</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setEditUser(null)} className="text-sm px-4 py-2 rounded border border-pwc-gray-300 text-pwc-gray-700 hover:bg-pwc-gray-50">취소</button>
              <button onClick={saveEdit} disabled={editSaving} className="btn-primary">{editSaving ? "저장 중..." : "저장"}</button>
            </div>
          </div>
        </div>
      )}

      <UserRegistrationModal isOpen={modalOpen} onClose={() => { setModalOpen(false); fetchUsers(); }} />
    </div>
  );
}
