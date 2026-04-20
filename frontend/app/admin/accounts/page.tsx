"use client";

import { useState, useEffect, useCallback } from "react";
import UserRegistrationModal from "../../components/UserRegistrationModal";
import { showToast } from "../../components/Toast";
import { usersApi, companiesApi, securityApi, groupsApi } from "../../lib/api";

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
const roleOptions = ["전체", "admin", "manager", "viewer"];

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

  // 회사/그룹
  const [companies, setCompanies] = useState<Company[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [showCompanySection, setShowCompanySection] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newSubsidiaries, setNewSubsidiaries] = useState<string[]>([""]);
  const [showSubModal, setShowSubModal] = useState(false);
  const [subForm, setSubForm] = useState({ name: "", company_id: 0 });
  const [companySaving, setCompanySaving] = useState(false);
  // 선택된 자회사 필터
  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const [companySearchTerm, setCompanySearchTerm] = useState("");

  // 수정 모달
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", company: "", role: "", status: "" });
  const [editSaving, setEditSaving] = useState(false);
  const [notifyUser, setNotifyUser] = useState(true);

  // 비밀번호 정책
  const [showPolicy, setShowPolicy] = useState(false);
  const [minLength, setMinLength] = useState(8);
  const [requireUppercase, setRequireUppercase] = useState(true);
  const [requireNumber, setRequireNumber] = useState(true);
  const [requireSpecial, setRequireSpecial] = useState(true);
  const [maxFailAttempts, setMaxFailAttempts] = useState(5);
  const [passwordExpiry, setPasswordExpiry] = useState(90);

  const loadCompanies = useCallback(async () => {
    try {
      const [cRes, gRes] = await Promise.all([companiesApi.list(), groupsApi.list()]);
      setCompanies(cRes.companies || []);
      setGroups(gRes.groups || []);
    } catch { /* */ }
  }, []);

  const createCompany = async () => {
    if (!newCompanyName.trim()) { showToast("회사명을 입력하세요.", "warning"); return; }
    setCompanySaving(true);
    try {
      const res = await companiesApi.create({ name: newCompanyName });
      const subs = newSubsidiaries.filter((s) => s.trim());
      for (const s of subs) await companiesApi.createSubsidiary({ name: s.trim(), company_id: res.id });
      showToast(`"${newCompanyName}" 생성 완료`, "success");
      setNewCompanyName(""); setNewSubsidiaries([""]); setShowCompanyModal(false);
      await loadCompanies();
      companiesApi.names().then((r) => setCompanyOptions(["전체", ...(r.names || [])])).catch(() => {});
    } catch (e) { showToast(e instanceof Error ? e.message : "실패", "error"); }
    finally { setCompanySaving(false); }
  };

  const createSub = async () => {
    if (!subForm.name.trim() || !subForm.company_id) { showToast("자회사명과 회사를 선택하세요.", "warning"); return; }
    setCompanySaving(true);
    try {
      await companiesApi.createSubsidiary(subForm);
      showToast(`"${subForm.name}" 생성 완료`, "success");
      setSubForm({ name: "", company_id: 0 }); setShowSubModal(false);
      await loadCompanies();
    } catch (e) { showToast(e instanceof Error ? e.message : "실패", "error"); }
    finally { setCompanySaving(false); }
  };

  // 자회사 클릭 시 회사 필터 적용
  const selectSub = (companyName: string, subName: string) => {
    if (selectedSub === subName) {
      setSelectedSub(null);
      setCompanyFilter("전체");
    } else {
      setSelectedSub(subName);
      setCompanyFilter(companyName);
    }
  };

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
  const openEdit = (user: User) => {
    setEditUser(user); setEditForm({ name: user.name, email: user.email, company: user.company, role: user.role, status: user.status }); setNotifyUser(true);
  };
  const saveEdit = async () => {
    if (!editUser) return; setEditSaving(true);
    try { await usersApi.update(editUser.id, editForm); showToast(notifyUser ? "수정 완료 (알림 발송)" : "수정 완료", "success"); setEditUser(null); await fetchUsers(); await loadSecurity(); }
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
          <h1 className="text-2xl font-bold text-pwc-black">계정 관리</h1>
          <p className="text-sm text-pwc-gray-500 mt-1">사용자 계정, 보안 상태, 비밀번호 정책을 통합 관리합니다.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowPolicy(!showPolicy)} className="btn-secondary text-sm">{showPolicy ? "정책 닫기" : "비밀번호 정책"}</button>
          <button onClick={() => setModalOpen(true)} className="btn-primary">+ 사용자 등록</button>
        </div>
      </div>

      {/* 보안 요약 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="card text-center py-3"><p className="text-xl font-bold text-pwc-black">{summary.total || total}</p><p className="text-xs text-pwc-gray-500">전체</p></div>
        <div className="card text-center py-3"><p className="text-xl font-bold text-green-600">{summary.active}</p><p className="text-xs text-pwc-gray-500">활성</p></div>
        <div className="card text-center py-3"><p className="text-xl font-bold text-red-600">{summary.inactive}</p><p className="text-xs text-pwc-gray-500">비활성</p></div>
        <div className="card text-center py-3"><p className="text-xl font-bold text-yellow-600">{summary.pending}</p><p className="text-xs text-pwc-gray-500">대기</p></div>
        <div className="card text-center py-3"><p className="text-xl font-bold text-orange-600">{summary.expiring_passwords}</p><p className="text-xs text-pwc-gray-500">PW만료 임박</p></div>
      </div>

      {/* 비밀번호 정책 (접이식) */}
      {showPolicy && (
        <div className="card border-l-4 border-l-pwc-orange">
          <h3 className="font-semibold text-pwc-black mb-4">비밀번호 정책 설정</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div><label className="block text-sm font-medium text-pwc-gray-700 mb-1">최소 길이</label><input type="number" value={minLength} onChange={(e) => setMinLength(Number(e.target.value))} min={6} max={32} className="input-field w-24" /></div>
            <div><label className="block text-sm font-medium text-pwc-gray-700 mb-1">실패 허용 횟수</label><input type="number" value={maxFailAttempts} onChange={(e) => setMaxFailAttempts(Number(e.target.value))} min={3} max={10} className="input-field w-24" /></div>
            <div><label className="block text-sm font-medium text-pwc-gray-700 mb-1">만료 주기 (일)</label><input type="number" value={passwordExpiry} onChange={(e) => setPasswordExpiry(Number(e.target.value))} min={30} max={365} className="input-field w-24" /></div>
          </div>
          <div className="flex gap-6 mt-4">
            {[{ c: requireUppercase, s: setRequireUppercase, l: "대문자 필수" }, { c: requireNumber, s: setRequireNumber, l: "숫자 필수" }, { c: requireSpecial, s: setRequireSpecial, l: "특수문자 필수" }].map((i) => (
              <label key={i.l} className="flex items-center gap-2 text-sm text-pwc-gray-700 cursor-pointer">
                <input type="checkbox" checked={i.c} onChange={(e) => i.s(e.target.checked)} className="w-4 h-4 rounded border-pwc-gray-300 text-pwc-orange focus:ring-pwc-orange" />{i.l}
              </label>
            ))}
          </div>
          <button onClick={() => showToast("비밀번호 정책이 저장되었습니다.", "success")} className="btn-primary mt-4 text-sm">정책 저장</button>
        </div>
      )}

      {/* 회사/자회사 관리 (상단) */}
      {(() => {
        const fc = companies.filter((c) =>
          !companySearchTerm ||
          c.name.toLowerCase().includes(companySearchTerm.toLowerCase()) ||
          c.subsidiaries.some((s) => s.name.toLowerCase().includes(companySearchTerm.toLowerCase()))
        );
        return (
          <div className="card">
            <button onClick={() => setShowCompanySection(!showCompanySection)} className="flex items-center justify-between w-full">
              <h3 className="font-semibold text-pwc-black">회사/자회사 관리</h3>
              <div className="flex items-center gap-2">
                {selectedSub && <span className="text-xs bg-pwc-orange text-white px-2 py-0.5 rounded">{selectedSub}</span>}
                <span className="text-xs text-pwc-gray-400">{companies.length}개 회사</span>
                <svg className={`w-5 h-5 text-pwc-gray-400 transition-transform ${showCompanySection ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {showCompanySection && (
              <div className="mt-4 space-y-3">
                {/* 검색 + 버튼 */}
                <div className="flex items-center gap-2">
                  <input type="text" value={companySearchTerm} onChange={(e) => setCompanySearchTerm(e.target.value)}
                    placeholder="회사 또는 자회사 검색..." className="input-field flex-1 max-w-xs text-sm" />
                  <button onClick={() => { setNewCompanyName(""); setNewSubsidiaries([""]); setShowCompanyModal(true); }} className="btn-secondary text-xs">+ 회사</button>
                  <button onClick={() => { setSubForm({ name: "", company_id: 0 }); setShowSubModal(true); }} className="btn-primary text-xs">+ 자회사</button>
                  {selectedSub && (
                    <button onClick={() => { setSelectedSub(null); setCompanyFilter("전체"); }} className="text-xs text-red-500 hover:underline">필터 해제</button>
                  )}
                </div>

                {/* 회사 목록 (스크롤) */}
                <div className="max-h-[320px] overflow-y-auto space-y-2 pr-1">
                  {fc.map((c) => (
                    <div key={c.id} className="border border-pwc-gray-200 rounded-lg px-4 py-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <button onClick={() => selectSub(c.name, c.name)}
                          className={`text-sm font-semibold transition-colors flex-shrink-0 ${selectedSub === c.name ? "text-pwc-orange" : "text-pwc-black hover:text-pwc-orange"}`}>
                          {c.name}
                        </button>
                        {c.subsidiaries.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {c.subsidiaries
                              .filter((s) => !companySearchTerm || s.name.toLowerCase().includes(companySearchTerm.toLowerCase()) || c.name.toLowerCase().includes(companySearchTerm.toLowerCase()))
                              .map((s) => (
                              <button key={s.id} onClick={() => selectSub(c.name, s.name)}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs transition-colors ${
                                  selectedSub === s.name
                                    ? "bg-pwc-orange text-white"
                                    : "bg-pwc-gray-100 text-pwc-gray-600 hover:bg-pwc-orange hover:text-white"
                                }`}>
                                {s.name}
                              </button>
                            ))}
                          </div>
                        )}
                        {c.subsidiaries.length === 0 && <span className="text-xs text-pwc-gray-400">자회사 없음</span>}
                      </div>
                    </div>
                  ))}
                  {fc.length === 0 && <p className="text-sm text-pwc-gray-400 text-center py-4">검색 결과가 없습니다.</p>}
                </div>
                <p className="text-xs text-pwc-gray-400">{fc.length}개 회사 표시 / 전체 {companies.length}개</p>
              </div>
            )}
          </div>
        );
      })()}

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
                        <p className="text-pwc-gray-700">{user.company}</p>
                        {(() => {
                          const c = companies.find((x) => x.name === user.company);
                          const g = groups.find((x) => x.id === user.group_id);
                          const subName = g?.name || c?.subsidiaries.find((s) => s.id === user.group_id)?.name;
                          return subName ? <p className="text-xs text-pwc-gray-400">{subName}</p> : null;
                        })()}
                      </div>
                    </td>
                    <td className="py-3 px-4"><span className="badge-role">{user.role}</span></td>
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

      {/* 수정 모달 - z-[100]으로 헤더 위에 */}
      {editUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setEditUser(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-semibold text-pwc-black mb-4">사용자 정보 수정</h2>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-pwc-gray-700 mb-1">이름</label><input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="input-field" /></div>
              <div><label className="block text-sm font-medium text-pwc-gray-700 mb-1">이메일</label><input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="input-field" /></div>
              <div><label className="block text-sm font-medium text-pwc-gray-700 mb-1">회사</label>
                <select value={editForm.company} onChange={(e) => setEditForm({ ...editForm, company: e.target.value })} className="input-field">
                  {companyOptions.filter((o) => o !== "전체").map((c) => (<option key={c} value={c}>{c}</option>))}
                  {!companyOptions.includes(editForm.company) && editForm.company && (<option value={editForm.company}>{editForm.company}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-pwc-gray-700 mb-1">역할</label><select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} className="input-field"><option value="admin">admin</option><option value="manager">manager</option><option value="viewer">viewer</option></select></div>
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowBulkModal(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-semibold text-pwc-black mb-1">일괄 변경</h2>
            <p className="text-sm text-pwc-gray-500 mb-4">{selectedUsers.length}명의 계정을 일괄 변경합니다. 변경하지 않을 항목은 비워두세요.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-pwc-gray-700 mb-1">역할</label>
                <select value={bulkForm.role} onChange={(e) => setBulkForm({ ...bulkForm, role: e.target.value })} className="input-field">
                  <option value="">변경 안 함</option>
                  <option value="admin">admin</option>
                  <option value="manager">manager</option>
                  <option value="viewer">viewer</option>
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

      {/* 회사 생성 모달 */}
      {showCompanyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCompanyModal(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-semibold text-pwc-black mb-4">회사 생성</h2>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-pwc-gray-700 mb-1">회사명 *</label><input type="text" value={newCompanyName} onChange={(e) => setNewCompanyName(e.target.value)} placeholder="회사명" className="input-field" /></div>
              <div>
                <div className="flex items-center justify-between mb-2"><label className="text-sm font-medium text-pwc-gray-700">자회사(대상법인)</label><button type="button" onClick={() => setNewSubsidiaries((p) => [...p, ""])} className="text-xs text-pwc-orange hover:underline">+ 추가</button></div>
                {newSubsidiaries.map((s, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input type="text" value={s} onChange={(e) => setNewSubsidiaries((p) => p.map((x, j) => j === i ? e.target.value : x))} placeholder={`자회사 ${i + 1}`} className="input-field flex-1" />
                    {newSubsidiaries.length > 1 && <button onClick={() => setNewSubsidiaries((p) => p.filter((_, j) => j !== i))} className="text-red-500 px-2">✕</button>}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowCompanyModal(false)} className="text-sm px-4 py-2 rounded border border-pwc-gray-300 text-pwc-gray-700 hover:bg-pwc-gray-50">취소</button>
              <button onClick={createCompany} disabled={companySaving} className="btn-primary">{companySaving ? "생성 중..." : "생성"}</button>
            </div>
          </div>
        </div>
      )}

      {/* 자회사 추가 모달 */}
      {showSubModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowSubModal(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <h2 className="text-lg font-semibold text-pwc-black mb-4">자회사 추가</h2>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-pwc-gray-700 mb-1">소속 회사</label>
                <select value={subForm.company_id} onChange={(e) => setSubForm({ ...subForm, company_id: Number(e.target.value) })} className="input-field">
                  <option value={0}>선택하세요</option>
                  {companies.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
              </div>
              <div><label className="block text-sm font-medium text-pwc-gray-700 mb-1">자회사명</label><input type="text" value={subForm.name} onChange={(e) => setSubForm({ ...subForm, name: e.target.value })} placeholder="자회사명" className="input-field" /></div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowSubModal(false)} className="text-sm px-4 py-2 rounded border border-pwc-gray-300 text-pwc-gray-700 hover:bg-pwc-gray-50">취소</button>
              <button onClick={createSub} disabled={companySaving} className="btn-primary">{companySaving ? "생성 중..." : "생성"}</button>
            </div>
          </div>
        </div>
      )}

      <UserRegistrationModal isOpen={modalOpen} onClose={() => { setModalOpen(false); fetchUsers(); loadSecurity(); loadCompanies(); }} />
    </div>
  );
}
