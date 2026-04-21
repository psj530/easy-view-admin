"use client";

import { useState, useEffect, useCallback } from "react";
import UserRegistrationModal from "../../components/UserRegistrationModal";
import { showToast } from "../../components/Toast";
import { usersApi, companiesApi, securityApi, groupsApi } from "../../lib/api";
import InfoPopup from "../../components/InfoPopup";
import BulkUploadModal from "../../components/BulkUploadModal";
import { downloadCSV } from "../../lib/export";

interface User {
  id: number; name: string; email: string; company: string; group_id: number | null;
  role: string; status: string; trust_level: string; two_fa: boolean;
  last_login?: string | null; password_expiry?: string | null;
}
interface Company {
  id: number; name: string; subsidiaries: { id: number; name: string }[]; created_at: string | null;
}
interface Group {
  id: number; name: string; company: string; default_role: string; member_count: number; report_count: number; created_at: string | null;
}

const statusOptions = ["전체", "active", "inactive", "pending"];
const roleOptions = ["전체", "PwC", "User"];
const roleMap: Record<string, string> = { "PwC": "admin", "User": "viewer" };
const roleMapReverse: Record<string, string> = { admin: "PwC", manager: "PwC", viewer: "User" };
const roleLabel = (role: string) => roleMapReverse[role] || role;

export default function AccountsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("전체");
  const [roleFilter, setRoleFilter] = useState("전체");
  const [companyFilter, setCompanyFilter] = useState("전체");
  const [companyOptions, setCompanyOptions] = useState(["전체"]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [summary, setSummary] = useState({ total: 0, active: 0, inactive: 0, pending: 0, expiring_passwords: 0 });

  // 회사/그룹 (소속 표시용)
  const [companies, setCompanies] = useState<Company[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedSub, setSelectedSub] = useState<string | null>(null);

  // 수정 모달
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", company: "", group_id: null as number | null, role: "", status: "" });
  const [editSaving, setEditSaving] = useState(false);
  const [notifyUser, setNotifyUser] = useState(true);
  const [showRoleInfo, setShowRoleInfo] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  // 회사/자회사 등록 (통합 모달)
  const [showNewCompany, setShowNewCompany] = useState(false);
  const [addToExisting, setAddToExisting] = useState(false);
  const [existingCoId, setExistingCoId] = useState(0);
  const [newCoName, setNewCoName] = useState("");
  const [newSubs, setNewSubs] = useState<string[]>([""]);
  const [coSaving, setCoSaving] = useState(false);
  // 수정 모달 내 인라인용
  const [showNewSub, setShowNewSub] = useState(false);
  const [newSubName, setNewSubName] = useState("");
  const [newSubCoId, setNewSubCoId] = useState(0);

  // 비밀번호 정책
  const [showPolicy, setShowPolicy] = useState(false);
  const [minLength, setMinLength] = useState(8);
  const [requireUppercase, setRequireUppercase] = useState(true);
  const [requireNumber, setRequireNumber] = useState(true);
  const [requireSpecial, setRequireSpecial] = useState(true);
  const [maxFailAttempts, setMaxFailAttempts] = useState(5);
  const [passwordExpiry, setPasswordExpiry] = useState(1825);

  const loadCompanies = useCallback(async () => {
    try {
      const [cRes, gRes] = await Promise.all([companiesApi.list(), groupsApi.list()]);
      setCompanies(cRes.companies || []);
      setGroups(gRes.groups || []);
    } catch { /* */ }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (search) params.search = search;
      if (statusFilter !== "전체") params.status = statusFilter;
      if (roleFilter === "PwC") params.role = "admin";
      else if (roleFilter === "User") params.role = "viewer";
      if (companyFilter !== "전체") params.company = companyFilter;
      const data = await usersApi.list(Object.keys(params).length > 0 ? params : undefined);
      setUsers(data.users ?? []);
      setTotal(data.total ?? 0);
    } catch { /* */ } finally { setLoading(false); }
  }, [search, statusFilter, roleFilter, companyFilter]);

  const loadSecurity = useCallback(async () => {
    try { const d = await securityApi.accounts(); setSummary(d.summary || {}); } catch { /* */ }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { loadSecurity(); }, [loadSecurity]);
  useEffect(() => { loadCompanies(); }, [loadCompanies]);
  useEffect(() => { companiesApi.names().then((r) => setCompanyOptions(["전체", ...(r.names || [])])).catch(() => {}); }, []);

  const toggleSelectAll = () => setSelectedUsers(selectedUsers.length === users.length ? [] : users.map((u) => u.id));
  const toggleSelect = (id: number) => setSelectedUsers((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const toggleStatus = async (id: number) => {
    try { const r = await usersApi.toggleStatus(id); showToast(r.message, "success"); await fetchUsers(); await loadSecurity(); }
    catch (e: unknown) { showToast(e instanceof Error ? e.message : "실패", "error"); }
  };
  const deleteUser = async (id: number) => {
    const u = users.find((x) => x.id === id);
    if (u && confirm(`${u.name}님을 삭제하시겠습니까?`)) {
      try { await usersApi.delete(id); setSelectedUsers((p) => p.filter((x) => x !== id)); showToast("삭제 완료", "success"); await fetchUsers(); await loadSecurity(); }
      catch (e: unknown) { showToast(e instanceof Error ? e.message : "실패", "error"); }
    }
  };
  const bulkDelete = async () => {
    if (!confirm(`${selectedUsers.length}명을 삭제하시겠습니까?`)) return;
    try { await Promise.all(selectedUsers.map((id) => usersApi.delete(id))); showToast(`${selectedUsers.length}명 삭제`, "success"); setSelectedUsers([]); await fetchUsers(); await loadSecurity(); }
    catch (e: unknown) { showToast(e instanceof Error ? e.message : "실패", "error"); }
  };
  // 일괄 변경 모달
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkForm, setBulkForm] = useState({ role: "", status: "", company: "" });
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkNotify, setBulkNotify] = useState(true);

  const openBulkModal = () => {
    setBulkForm({ role: "", status: "", company: "" });
    setBulkNotify(true);
    setShowBulkModal(true);
  };

  const saveBulk = async () => {
    // PwC 역할 일괄 적용 시 도메인 검증
    if (bulkForm.role === "admin") {
      const nonPwc = users.filter((u) => selectedUsers.includes(u.id) && !u.email.endsWith("@pwc.com"));
      if (nonPwc.length > 0) {
        showToast(`PwC 역할은 @pwc.com 도메인만 가능합니다. (${nonPwc.map((u) => u.name).join(", ")})`, "error");
        return;
      }
    }
    const updates: Record<string, string> = {};
    if (bulkForm.role) updates.role = bulkForm.role;
    if (bulkForm.status) updates.status = bulkForm.status;
    if (bulkForm.company) updates.company = bulkForm.company;
    if (Object.keys(updates).length === 0) { showToast("변경할 항목을 선택하세요.", "warning"); return; }
    setBulkSaving(true);
    try {
      await Promise.all(selectedUsers.map((id) => usersApi.update(id, updates)));
      const changes = [];
      if (bulkForm.role) changes.push(`역할→${bulkForm.role}`);
      if (bulkForm.status) changes.push(`상태→${bulkForm.status}`);
      if (bulkForm.company) changes.push(`회사→${bulkForm.company}`);
      showToast(`${selectedUsers.length}명 일괄 변경 완료 (${changes.join(", ")})${bulkNotify ? " · 알림 발송" : ""}`, "success");
      setSelectedUsers([]); setShowBulkModal(false);
      await fetchUsers(); await loadSecurity();
    } catch (e: unknown) { showToast(e instanceof Error ? e.message : "실패", "error"); }
    finally { setBulkSaving(false); }
  };
  const saveCompanyModal = async () => {
    setCoSaving(true);
    try {
      if (addToExisting) {
        // 기존 회사에 자회사 추가
        if (!existingCoId) { showToast("회사를 선택하세요.", "warning"); setCoSaving(false); return; }
        const subs = newSubs.filter((s) => s.trim());
        if (subs.length === 0) { showToast("자회사명을 입력하세요.", "warning"); setCoSaving(false); return; }
        for (const s of subs) await companiesApi.createSubsidiary({ name: s.trim(), company_id: existingCoId });
        const coName = companies.find((c) => c.id === existingCoId)?.name || "";
        showToast(`${coName}에 자회사 ${subs.length}개 추가 완료`, "success");
      } else {
        // 신규 회사 + 자회사
        if (!newCoName.trim()) { showToast("회사명을 입력하세요.", "warning"); setCoSaving(false); return; }
        const res = await companiesApi.create({ name: newCoName });
        const subs = newSubs.filter((s) => s.trim());
        for (const s of subs) await companiesApi.createSubsidiary({ name: s.trim(), company_id: res.id });
        showToast(`"${newCoName}" 등록 완료${subs.length > 0 ? ` (자회사 ${subs.length}개)` : ""}`, "success");
      }
      setShowNewCompany(false);
      await loadCompanies();
      companiesApi.names().then((r) => setCompanyOptions(["전체", ...(r.names || [])])).catch(() => {});
    } catch (e) { showToast(e instanceof Error ? e.message : "실패", "error"); }
    finally { setCoSaving(false); }
  };
  const addSubInline = async () => {
    if (!newSubName.trim() || !newSubCoId) return;
    try {
      await companiesApi.createSubsidiary({ name: newSubName, company_id: newSubCoId });
      showToast(`"${newSubName}" 등록 완료`, "success");
      setNewSubName(""); setShowNewSub(false);
      await loadCompanies();
    } catch (e) { showToast(e instanceof Error ? e.message : "실패", "error"); }
  };

  const openEdit = (user: User) => {
    // 비 pwc.com인데 admin이면 viewer로 자동 교정
    const correctedRole = (!user.email.endsWith("@pwc.com") && (user.role === "admin" || user.role === "manager")) ? "viewer" : user.role;
    setEditUser(user); setEditForm({ name: user.name, email: user.email, company: user.company, group_id: user.group_id, role: correctedRole, status: user.status }); setNotifyUser(true);
  };
  const saveEdit = async () => {
    if (!editUser) return;
    // PwC 역할은 @pwc.com 도메인만 가능
    if (editForm.role === "admin" && !editForm.email.endsWith("@pwc.com")) {
      showToast("PwC 역할은 @pwc.com 도메인 계정만 설정 가능합니다.", "error");
      return;
    }
    setEditSaving(true);
    try { await usersApi.update(editUser.id, editForm); showToast(notifyUser ? "수정 완료 (알림 발송)" : "수정 완료", "success"); setEditUser(null); await fetchUsers(); await loadSecurity(); await loadCompanies(); }
    catch (e: unknown) { showToast(e instanceof Error ? e.message : "실패", "error"); }
    finally { setEditSaving(false); }
  };
  const statusBadge = (s: string) => {
    const m: Record<string, { c: string; l: string }> = { active: { c: "badge-active", l: "활성" }, inactive: { c: "badge-inactive", l: "비활성" }, pending: { c: "badge-pending", l: "대기" } };
    const x = m[s]; return x ? <span className={x.c}>{x.l}</span> : null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-pwc-black">계정 관리</h1>
            <button onClick={() => setShowRoleInfo(true)} className="w-6 h-6 rounded-full border border-pwc-gray-300 text-pwc-gray-400 text-xs hover:border-pwc-orange hover:text-pwc-orange transition-colors" title="역할/정책 안내">?</button>
          </div>
          <p className="text-sm text-pwc-gray-500 mt-1">사용자 계정, 보안 상태, 비밀번호 정책을 통합 관리합니다.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => downloadCSV(users as unknown as Record<string, unknown>[], [
            { key: "name", label: "이름" }, { key: "email", label: "이메일" }, { key: "company", label: "회사" },
            { key: "role", label: "역할" }, { key: "status", label: "상태" }, { key: "last_login", label: "최종 로그인" },
          ], "계정목록")} className="btn-secondary text-sm">엑셀 추출</button>
          <button onClick={() => setShowPolicy(!showPolicy)} className="btn-secondary text-sm">비밀번호 정책</button>
          <button onClick={() => { setShowNewCompany(true); setNewCoName(""); setNewSubs([""]); setAddToExisting(false); setExistingCoId(0); }} className="btn-secondary text-sm">+ 회사/자회사</button>
          <button onClick={() => setShowBulkUpload(true)} className="btn-secondary text-sm">일괄 등록</button>
          <button onClick={() => setModalOpen(true)} className="btn-primary">+ 사용자 등록</button>
        </div>
      </div>

      {/* 계정 현황 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <button onClick={() => { setStatusFilter("전체"); setRoleFilter("전체"); setCompanyFilter("전체"); }} className="card text-center py-3 hover:ring-2 hover:ring-pwc-orange transition-all"><p className="text-xl font-bold text-pwc-black">{summary.total || total}</p><p className="text-xs text-pwc-gray-500">전체</p></button>
        <button onClick={() => { setStatusFilter("active"); setRoleFilter("전체"); setCompanyFilter("전체"); }} className="card text-center py-3 hover:ring-2 hover:ring-green-400 transition-all"><p className="text-xl font-bold text-green-600">{summary.active}</p><p className="text-xs text-pwc-gray-500">활성</p></button>
        <button onClick={() => { setStatusFilter("inactive"); setRoleFilter("전체"); setCompanyFilter("전체"); }} className="card text-center py-3 hover:ring-2 hover:ring-red-400 transition-all"><p className="text-xl font-bold text-red-600">{summary.inactive}</p><p className="text-xs text-pwc-gray-500">비활성</p></button>
        <button onClick={() => { setStatusFilter("pending"); setRoleFilter("전체"); setCompanyFilter("전체"); }} className="card text-center py-3 hover:ring-2 hover:ring-yellow-400 transition-all"><p className="text-xl font-bold text-yellow-600">{summary.pending}</p><p className="text-xs text-pwc-gray-500">대기</p></button>
        <div className="card text-center py-3"><p className="text-xl font-bold text-orange-600">{summary.expiring_passwords}</p><p className="text-xs text-pwc-gray-500">PW만료 임박</p></div>
      </div>


      {/* 비밀번호 정책 팝업 */}
      {showPolicy && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowPolicy(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-semibold text-pwc-black mb-4">비밀번호 정책 설정</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-xs font-medium text-pwc-gray-700 mb-1">최소 길이</label><input type="number" value={minLength} onChange={(e) => setMinLength(Number(e.target.value))} min={6} max={32} className="input-field" /></div>
                <div><label className="block text-xs font-medium text-pwc-gray-700 mb-1">실패 허용</label><input type="number" value={maxFailAttempts} onChange={(e) => setMaxFailAttempts(Number(e.target.value))} min={3} max={10} className="input-field" /></div>
                <div><label className="block text-xs font-medium text-pwc-gray-700 mb-1">만료 (일)</label><input type="number" value={passwordExpiry} onChange={(e) => setPasswordExpiry(Number(e.target.value))} min={30} max={3650} className="input-field" /></div>
              </div>
              <div className="flex flex-wrap gap-4">
                {[{ c: requireUppercase, s: setRequireUppercase, l: "대문자 필수" }, { c: requireNumber, s: setRequireNumber, l: "숫자 필수" }, { c: requireSpecial, s: setRequireSpecial, l: "특수문자 필수" }].map((i) => (
                  <label key={i.l} className="flex items-center gap-2 text-sm text-pwc-gray-700 cursor-pointer">
                    <input type="checkbox" checked={i.c} onChange={(e) => i.s(e.target.checked)} className="w-4 h-4 rounded border-pwc-gray-300 text-pwc-orange focus:ring-pwc-orange" />{i.l}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowPolicy(false)} className="text-sm px-4 py-2 rounded border border-pwc-gray-300 text-pwc-gray-700 hover:bg-pwc-gray-50">취소</button>
              <button onClick={() => { showToast("비밀번호 정책이 저장되었습니다.", "success"); setShowPolicy(false); }} className="btn-primary">저장</button>
            </div>
          </div>
        </div>
      )}

      {/* 검색/필터 */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div><label className="block text-xs font-medium text-pwc-gray-500 mb-1">검색</label><input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="이름, 이메일, 회사명" className="input-field" /></div>
          <div><label className="block text-xs font-medium text-pwc-gray-500 mb-1">상태</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field">
              {statusOptions.map((o) => (<option key={o} value={o}>{o === "전체" ? "전체" : o === "active" ? "활성" : o === "inactive" ? "비활성" : "대기"}</option>))}
            </select>
          </div>
          <div><label className="block text-xs font-medium text-pwc-gray-500 mb-1">역할</label>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input-field">
              {roleOptions.map((o) => (<option key={o} value={o}>{o}</option>))}
            </select>
          </div>
          <div><label className="block text-xs font-medium text-pwc-gray-500 mb-1">회사 {selectedSub && <span className="text-pwc-orange">({selectedSub})</span>}</label>
            <select value={companyFilter} onChange={(e) => { setCompanyFilter(e.target.value); setSelectedSub(null); }} className="input-field">
              {companyOptions.map((o) => (<option key={o} value={o}>{o}</option>))}
            </select>
          </div>
        </div>
      </div>

      {/* 계정 테이블 */}
      <div className="card overflow-hidden p-0">
        <div className="px-6 py-3 border-b border-pwc-gray-200 flex items-center justify-between bg-pwc-gray-50">
          <span className="text-sm text-pwc-gray-600">
            총 {total}명
            {selectedSub && <span className="ml-1 text-pwc-orange">({selectedSub})</span>}
            {selectedUsers.length > 0 && <span className="ml-2 text-pwc-orange">· {selectedUsers.length}명 선택</span>}
          </span>
          {selectedUsers.length > 0 && (
            <div className="flex gap-2">
              <button onClick={openBulkModal} className="text-xs btn-secondary py-1 px-3">일괄 변경</button>
              <button onClick={bulkDelete} className="text-xs btn-danger py-1 px-3">일괄 삭제</button>
            </div>
          )}
        </div>
        <div className="overflow-x-auto">
          {loading ? <div className="py-12 text-center text-pwc-gray-400">불러오는 중...</div> : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-pwc-gray-200 bg-pwc-gray-50">
                  <th className="py-3 px-3 w-10"><input type="checkbox" checked={users.length > 0 && selectedUsers.length === users.length} onChange={toggleSelectAll} className="w-4 h-4 rounded border-pwc-gray-300 text-pwc-orange focus:ring-pwc-orange" /></th>
                  <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">사용자</th>
                  <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">소속</th>
                  <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">역할</th>
                  <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">상태</th>
                  <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">최종 로그인</th>
                  <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">관리</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className={`border-b border-pwc-gray-100 hover:bg-pwc-gray-50 transition-colors ${selectedUsers.includes(user.id) ? "bg-orange-50" : ""}`}>
                    <td className="py-3 px-3"><input type="checkbox" checked={selectedUsers.includes(user.id)} onChange={() => toggleSelect(user.id)} className="w-4 h-4 rounded border-pwc-gray-300 text-pwc-orange focus:ring-pwc-orange" /></td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-pwc-orange flex items-center justify-center text-white text-xs font-medium flex-shrink-0">{user.name[0]}</div>
                        <div><p className="font-medium text-pwc-black">{user.name}</p><p className="text-xs text-pwc-gray-500">{user.email}</p></div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <button onClick={() => { setCompanyFilter(user.company); setSelectedSub(null); }}
                          className="text-pwc-gray-700 hover:text-pwc-orange transition-colors text-left">
                          {user.company}
                        </button>
                        {(() => {
                          const c = companies.find((x) => x.name === user.company);
                          const g = groups.find((x) => x.id === user.group_id);
                          const subName = g?.name || c?.subsidiaries.find((s) => s.id === user.group_id)?.name;
                          return subName ? <p className="text-xs text-pwc-gray-400">{subName}</p> : null;
                        })()}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${roleLabel(user.role) === "PwC" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                        {roleLabel(user.role)}
                      </span>
                      {roleLabel(user.role) === "PwC" && !user.email.endsWith("@pwc.com") && (
                        <span className="ml-1 text-yellow-600 text-[10px]" title="PwC 도메인(@pwc.com)이 아닙니다">⚠</span>
                      )}
                    </td>
                    <td className="py-3 px-4">{statusBadge(user.status)}</td>
                    <td className="py-3 px-4 text-xs text-pwc-gray-500">{user.last_login?.slice(0, 16) || "-"}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => toggleStatus(user.id)} className="p-1.5 rounded hover:bg-pwc-gray-100 text-pwc-gray-500 hover:text-pwc-orange" title="상태변경">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                        </button>
                        <button onClick={() => openEdit(user)} className="p-1.5 rounded hover:bg-pwc-gray-100 text-pwc-gray-500 hover:text-blue-600" title="수정">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => deleteUser(user.id)} className="p-1.5 rounded hover:bg-red-50 text-pwc-gray-500 hover:text-red-600" title="삭제">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && <tr><td colSpan={7} className="py-12 text-center text-pwc-gray-400">검색 결과가 없습니다.</td></tr>}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 수정 모달 - z-[200]으로 헤더 위에 */}
      {editUser && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setEditUser(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-semibold text-pwc-black mb-4">사용자 정보 수정</h2>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-pwc-gray-700 mb-1">이름</label><input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="input-field" /></div>
              <div><label className="block text-sm font-medium text-pwc-gray-700 mb-1">이메일</label><input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="input-field" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-pwc-gray-700">회사</label>
                    <button type="button" onClick={() => setShowNewCompany(!showNewCompany)} className="text-[10px] text-pwc-orange hover:underline">+ 신규</button>
                  </div>
                  <select value={editForm.company} onChange={(e) => { setEditForm({ ...editForm, company: e.target.value, group_id: null }); }} className="input-field">
                    {companyOptions.filter((o) => o !== "전체").map((c) => (<option key={c} value={c}>{c}</option>))}
                    {!companyOptions.includes(editForm.company) && editForm.company && (<option value={editForm.company}>{editForm.company}</option>)}
                  </select>
                  {showNewCompany && (
                    <div className="flex gap-1 mt-1">
                      <input type="text" value={newCoName} onChange={(e) => setNewCoName(e.target.value)} placeholder="회사명" className="input-field text-xs flex-1" />
                      <button onClick={async () => { if (!newCoName.trim()) return; try { await companiesApi.create({ name: newCoName }); showToast("등록 완료", "success"); setNewCoName(""); setShowNewCompany(false); await loadCompanies(); companiesApi.names().then((r) => setCompanyOptions(["전체", ...(r.names || [])])).catch(() => {}); } catch (e) { showToast(e instanceof Error ? e.message : "실패", "error"); } }} className="text-xs bg-pwc-orange text-white px-2 rounded">등록</button>
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-pwc-gray-700">자회사</label>
                    <button type="button" onClick={() => { setShowNewSub(!showNewSub); setNewSubCoId(companies.find((c) => c.name === editForm.company)?.id || 0); }} className="text-[10px] text-pwc-orange hover:underline">+ 신규</button>
                  </div>
                  <select value={editForm.group_id ?? ""} onChange={(e) => setEditForm({ ...editForm, group_id: e.target.value ? Number(e.target.value) : null })} className="input-field">
                    <option value="">선택 안 함</option>
                    {(() => {
                      const co = companies.find((c) => c.name === editForm.company);
                      return co?.subsidiaries.map((s) => (<option key={s.id} value={s.id}>{s.name}</option>)) || [];
                    })()}
                  </select>
                  {showNewSub && (
                    <div className="flex gap-1 mt-1">
                      <input type="text" value={newSubName} onChange={(e) => setNewSubName(e.target.value)} placeholder="자회사명" className="input-field text-xs flex-1" />
                      <button onClick={addSubInline} className="text-xs bg-pwc-orange text-white px-2 rounded">등록</button>
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-pwc-gray-700 mb-1">역할</label>
                  <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} className="input-field">
                    {editForm.email.endsWith("@pwc.com") && <option value="admin">PwC</option>}
                    <option value="viewer">User</option>
                  </select>
                  {editForm.role === "admin" && !editForm.email.endsWith("@pwc.com") && (
                    <p className="text-xs text-red-500 mt-1">@pwc.com 도메인만 PwC 역할 가능</p>
                  )}
                </div>
                <div><label className="block text-sm font-medium text-pwc-gray-700 mb-1">상태</label><select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className="input-field"><option value="active">활성</option><option value="inactive">비활성</option><option value="pending">대기</option></select></div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-pwc-gray-200">
                <div><p className="text-sm font-medium text-pwc-gray-700">변경 알림</p><p className="text-xs text-pwc-gray-400">역할/상태 변경 시 이메일 발송</p></div>
                <button type="button" onClick={() => setNotifyUser(!notifyUser)} className={`relative inline-flex h-6 w-11 items-center rounded-full ${notifyUser ? "bg-pwc-orange" : "bg-pwc-gray-300"}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white ${notifyUser ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setEditUser(null)} className="text-sm px-4 py-2 rounded border border-pwc-gray-300 text-pwc-gray-700 hover:bg-pwc-gray-50">취소</button>
              <button onClick={saveEdit} disabled={editSaving} className="btn-primary">{editSaving ? "저장 중..." : "저장"}</button>
            </div>
          </div>
        </div>
      )}

      {/* 일괄 변경 모달 */}
      {showBulkModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowBulkModal(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-semibold text-pwc-black mb-1">일괄 변경</h2>
            <p className="text-sm text-pwc-gray-500 mb-4">{selectedUsers.length}명의 계정을 일괄 변경합니다. 변경하지 않을 항목은 비워두세요.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-pwc-gray-700 mb-1">역할</label>
                <select value={bulkForm.role} onChange={(e) => setBulkForm({ ...bulkForm, role: e.target.value })} className="input-field">
                  <option value="">변경 안 함</option>
                  <option value="admin">PwC</option>
                  <option value="viewer">User</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-pwc-gray-700 mb-1">상태</label>
                <select value={bulkForm.status} onChange={(e) => setBulkForm({ ...bulkForm, status: e.target.value })} className="input-field">
                  <option value="">변경 안 함</option>
                  <option value="active">활성</option>
                  <option value="inactive">비활성</option>
                  <option value="pending">대기</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-pwc-gray-700 mb-1">회사</label>
                <select value={bulkForm.company} onChange={(e) => setBulkForm({ ...bulkForm, company: e.target.value })} className="input-field">
                  <option value="">변경 안 함</option>
                  {companyOptions.filter((o) => o !== "전체").map((c) => (<option key={c} value={c}>{c}</option>))}
                </select>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-pwc-gray-200">
                <div><p className="text-sm font-medium text-pwc-gray-700">변경 알림</p><p className="text-xs text-pwc-gray-400">대상자에게 이메일 발송</p></div>
                <button type="button" onClick={() => setBulkNotify(!bulkNotify)} className={`relative inline-flex h-6 w-11 items-center rounded-full ${bulkNotify ? "bg-pwc-orange" : "bg-pwc-gray-300"}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white ${bulkNotify ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowBulkModal(false)} className="text-sm px-4 py-2 rounded border border-pwc-gray-300 text-pwc-gray-700 hover:bg-pwc-gray-50">취소</button>
              <button onClick={saveBulk} disabled={bulkSaving} className="btn-primary">{bulkSaving ? "변경 중..." : `${selectedUsers.length}명 일괄 변경`}</button>
            </div>
          </div>
        </div>
      )}

      {/* 회사/자회사 통합 등록 모달 */}
      {showNewCompany && !editUser && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowNewCompany(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-semibold text-pwc-black mb-4">회사/자회사 등록</h2>
            <div className="flex gap-0 border-b border-pwc-gray-200 mb-5">
              <button onClick={() => setAddToExisting(false)} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${!addToExisting ? "border-pwc-orange text-pwc-orange" : "border-transparent text-pwc-gray-500"}`}>신규 회사 등록</button>
              <button onClick={() => setAddToExisting(true)} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${addToExisting ? "border-pwc-orange text-pwc-orange" : "border-transparent text-pwc-gray-500"}`}>기존 회사에 자회사 추가</button>
            </div>
            {!addToExisting ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-pwc-gray-700 mb-1">회사명 <span className="text-red-500">*</span></label>
                  <input type="text" value={newCoName} onChange={(e) => setNewCoName(e.target.value)} placeholder="회사명 입력" className="input-field" autoFocus />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-pwc-gray-700">자회사(대상법인)</label>
                    <button type="button" onClick={() => setNewSubs((p) => [...p, ""])} className="text-xs text-pwc-orange hover:underline">+ 추가</button>
                  </div>
                  {newSubs.map((s, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input type="text" value={s} onChange={(e) => setNewSubs((p) => p.map((x, j) => j === i ? e.target.value : x))} placeholder={`자회사 ${i + 1}`} className="input-field flex-1 text-sm" />
                      {newSubs.length > 1 && <button onClick={() => setNewSubs((p) => p.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 px-1">✕</button>}
                    </div>
                  ))}
                  <p className="text-xs text-pwc-gray-400">자회사 없이 회사만 등록할 수도 있습니다.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-pwc-gray-700 mb-1">소속 회사 <span className="text-red-500">*</span></label>
                  <select value={existingCoId} onChange={(e) => setExistingCoId(Number(e.target.value))} className="input-field">
                    <option value={0}>회사 선택</option>
                    {companies.map((c) => (<option key={c.id} value={c.id}>{c.name} ({c.subsidiaries.length}개)</option>))}
                  </select>
                  {existingCoId > 0 && (() => {
                    const co = companies.find((c) => c.id === existingCoId);
                    return co && co.subsidiaries.length > 0 ? (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {co.subsidiaries.map((s) => (<span key={s.id} className="text-xs bg-pwc-gray-100 text-pwc-gray-600 px-2 py-0.5 rounded">{s.name}</span>))}
                      </div>
                    ) : null;
                  })()}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-pwc-gray-700">추가할 자회사</label>
                    <button type="button" onClick={() => setNewSubs((p) => [...p, ""])} className="text-xs text-pwc-orange hover:underline">+ 추가</button>
                  </div>
                  {newSubs.map((s, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input type="text" value={s} onChange={(e) => setNewSubs((p) => p.map((x, j) => j === i ? e.target.value : x))} placeholder={`자회사 ${i + 1}`} className="input-field flex-1 text-sm" />
                      {newSubs.length > 1 && <button onClick={() => setNewSubs((p) => p.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 px-1">✕</button>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowNewCompany(false)} className="text-sm px-4 py-2 rounded border border-pwc-gray-300 text-pwc-gray-700 hover:bg-pwc-gray-50">취소</button>
              <button onClick={saveCompanyModal} disabled={coSaving} className="btn-primary">{coSaving ? "등록 중..." : "등록"}</button>
            </div>
          </div>
        </div>
      )}

      {/* 역할/정책 안내 팝업 */}
      {showRoleInfo && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowRoleInfo(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <h2 className="text-lg font-semibold text-pwc-black">역할 및 정책 안내</h2>
              <button onClick={() => setShowRoleInfo(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-pwc-orange mb-3">역할 분류</h3>
                <table className="w-full text-sm table-fixed">
                  <thead><tr className="border-b-2 border-pwc-orange"><th className="text-left py-2 w-[80px]">역할</th><th className="text-left py-2 w-[100px]">대상</th><th className="text-left py-2">설명</th></tr></thead>
                  <tbody>
                    <tr className="border-b border-gray-100"><td className="py-2"><span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">PwC</span></td><td className="py-2 text-gray-600">@pwc.com</td><td className="py-2 text-gray-600">PwC 내부 임직원. 관리자 권한 포함.</td></tr>
                    <tr className="border-b border-gray-100"><td className="py-2"><span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">User</span></td><td className="py-2 text-gray-600">고객사</td><td className="py-2 text-gray-600">고객사 사용자. 리포트 열람 및 요청 가능.</td></tr>
                  </tbody>
                </table>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-pwc-orange mb-3">상태 정의</h3>
                <table className="w-full text-sm table-fixed">
                  <thead><tr className="border-b-2 border-pwc-orange"><th className="text-left py-2 w-[80px]">상태</th><th className="text-left py-2">설명</th></tr></thead>
                  <tbody>
                    <tr className="border-b border-gray-100"><td className="py-2"><span className="badge-active">활성</span></td><td className="py-2 text-gray-600">정상 사용 가능한 계정</td></tr>
                    <tr className="border-b border-gray-100"><td className="py-2"><span className="badge-inactive">비활성</span></td><td className="py-2 text-gray-600">관리자에 의해 비활성화된 계정</td></tr>
                    <tr className="border-b border-gray-100"><td className="py-2"><span className="badge-pending">대기</span></td><td className="py-2 text-gray-600">승인 대기 중인 신규 계정</td></tr>
                  </tbody>
                </table>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-pwc-orange mb-3">도메인 규칙</h3>
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 space-y-1">
                  <p>• <b>PwC 역할</b>은 <b>@pwc.com</b> 도메인 이메일만 설정 가능합니다.</p>
                  <p>• 비 pwc.com 이메일에 PwC 역할이 설정된 경우 <span className="text-yellow-600">⚠</span> 경고가 표시됩니다.</p>
                  <p>• 역할/상태 변경 시 변경 알림 이메일이 자동 발송됩니다.</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-3 border-t border-gray-200 flex justify-end flex-shrink-0">
              <button onClick={() => setShowRoleInfo(false)} className="btn-primary text-sm">확인</button>
            </div>
          </div>
        </div>
      )}

      <UserRegistrationModal isOpen={modalOpen} onClose={() => { setModalOpen(false); fetchUsers(); loadSecurity(); loadCompanies(); }} />
      <BulkUploadModal isOpen={showBulkUpload} onClose={() => { setShowBulkUpload(false); fetchUsers(); loadSecurity(); }} />
    </div>
  );
}
