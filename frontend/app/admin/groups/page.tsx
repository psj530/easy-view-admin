"use client";

import { useState, useEffect, useCallback } from "react";
import { companiesApi, groupsApi } from "../../lib/api";
import { showToast } from "../../components/Toast";

interface Company {
  id: number;
  name: string;
  subsidiaries: { id: number; name: string }[];
  created_at: string | null;
}

interface Group {
  id: number;
  name: string;
  company: string;
  default_role: string;
  member_count: number;
  report_count: number;
  created_at: string | null;
}

export default function GroupsPage() {
  const [activeTab, setActiveTab] = useState<"companies" | "groups">("companies");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // 회사 생성
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  // 자회사 생성
  const [showSubModal, setShowSubModal] = useState(false);
  const [subForm, setSubForm] = useState({ name: "", company_id: 0 });
  // 그룹 생성/수정
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [groupForm, setGroupForm] = useState({ name: "", company: "", default_role: "viewer" });
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, gRes] = await Promise.all([companiesApi.list(), groupsApi.list()]);
      setCompanies(cRes.companies || []);
      setGroups(gRes.groups || []);
    } catch { showToast("데이터를 불러오지 못했습니다.", "error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // 회사 생성
  const createCompany = async () => {
    if (!newCompanyName.trim()) { showToast("회사명을 입력하세요.", "warning"); return; }
    setSaving(true);
    try {
      await companiesApi.create({ name: newCompanyName });
      showToast(`"${newCompanyName}" 회사가 생성되었습니다.`, "success");
      setNewCompanyName(""); setShowCompanyModal(false);
      await loadData();
    } catch (err) { showToast(err instanceof Error ? err.message : "생성 실패", "error"); }
    finally { setSaving(false); }
  };

  // 자회사 생성
  const createSubsidiary = async () => {
    if (!subForm.name.trim() || !subForm.company_id) { showToast("자회사명과 회사를 선택하세요.", "warning"); return; }
    setSaving(true);
    try {
      await companiesApi.createSubsidiary(subForm);
      showToast(`"${subForm.name}" 자회사가 생성되었습니다.`, "success");
      setSubForm({ name: "", company_id: 0 }); setShowSubModal(false);
      await loadData();
    } catch (err) { showToast(err instanceof Error ? err.message : "생성 실패", "error"); }
    finally { setSaving(false); }
  };

  // 그룹 생성/수정
  const openGroupCreate = () => {
    setEditingGroup(null);
    setGroupForm({ name: "", company: companies[0]?.name || "", default_role: "viewer" });
    setShowGroupModal(true);
  };
  const openGroupEdit = (group: Group) => {
    setEditingGroup(group);
    setGroupForm({ name: group.name, company: group.company, default_role: group.default_role });
    setShowGroupModal(true);
  };
  const saveGroup = async () => {
    if (!groupForm.name.trim() || !groupForm.company) { showToast("그룹명과 회사를 입력하세요.", "warning"); return; }
    setSaving(true);
    try {
      if (editingGroup) {
        await groupsApi.update(editingGroup.id, groupForm);
        showToast("그룹이 수정되었습니다.", "success");
      } else {
        await groupsApi.create(groupForm);
        showToast("그룹이 생성되었습니다.", "success");
      }
      setShowGroupModal(false);
      await loadData();
    } catch (err) { showToast(err instanceof Error ? err.message : "저장 실패", "error"); }
    finally { setSaving(false); }
  };

  const roleBadge = (role: string) => {
    const map: Record<string, string> = { admin: "bg-red-100 text-red-700", manager: "bg-blue-100 text-blue-700", viewer: "bg-gray-100 text-gray-600" };
    return map[role] || "bg-gray-100 text-gray-600";
  };

  const filteredGroups = groups.filter((g) => g.name.includes(search) || g.company.includes(search));

  const tabs = [
    { key: "companies" as const, label: "회사/자회사 관리" },
    { key: "groups" as const, label: "그룹(대상법인) 관리" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-pwc-black">그룹 관리</h1>
          <p className="text-sm text-pwc-gray-500 mt-1">회사, 자회사(대상법인), 그룹을 등록하고 관리합니다.</p>
        </div>
        <div className="flex gap-2">
          {activeTab === "companies" && (
            <>
              <button onClick={() => setShowCompanyModal(true)} className="btn-secondary text-sm">+ 회사 생성</button>
              <button onClick={() => { setSubForm({ name: "", company_id: companies[0]?.id || 0 }); setShowSubModal(true); }} className="btn-primary text-sm">+ 자회사 생성</button>
            </>
          )}
          {activeTab === "groups" && (
            <button onClick={openGroupCreate} className="btn-primary text-sm">+ 그룹 생성</button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-pwc-gray-200">
        <div className="flex gap-0">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key ? "border-pwc-orange text-pwc-orange" : "border-transparent text-pwc-gray-500 hover:text-pwc-gray-700"}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="py-12 text-center text-pwc-gray-400">로딩 중...</div>}

      {/* Tab 1: 회사/자회사 */}
      {!loading && activeTab === "companies" && (
        <div className="space-y-4">
          {companies.length === 0 ? (
            <div className="card text-center py-12 text-pwc-gray-400">등록된 회사가 없습니다. 회사를 먼저 생성하세요.</div>
          ) : companies.map((company) => (
            <div key={company.id} className="card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-pwc-black">{company.name}</h3>
                <span className="text-xs text-pwc-gray-400">{company.created_at?.slice(0, 10)}</span>
              </div>
              {company.subsidiaries.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {company.subsidiaries.map((sub) => (
                    <div key={sub.id} className="flex items-center gap-2 px-3 py-2 bg-pwc-gray-50 rounded-lg border border-pwc-gray-200">
                      <span className="w-2 h-2 rounded-full bg-pwc-orange flex-shrink-0" />
                      <span className="text-sm text-pwc-gray-700">{sub.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-pwc-gray-400">등록된 자회사가 없습니다.</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: 그룹 */}
      {!loading && activeTab === "groups" && (
        <>
          <div className="card">
            <div className="max-w-md">
              <label className="block text-xs font-medium text-pwc-gray-500 mb-1">검색</label>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="그룹명, 고객사 검색" className="input-field" />
            </div>
          </div>
          <div className="card overflow-hidden p-0">
            <div className="px-6 py-3 border-b border-pwc-gray-200 bg-pwc-gray-50">
              <span className="text-sm text-pwc-gray-600">총 {filteredGroups.length}개 그룹</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-pwc-gray-200 bg-pwc-gray-50">
                    <th className="text-left py-3 px-6 font-medium text-pwc-gray-500">그룹명</th>
                    <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">회사</th>
                    <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">사용자 수</th>
                    <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">기본 권한</th>
                    <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">리포트 수</th>
                    <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">생성일</th>
                    <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGroups.map((group) => (
                    <tr key={group.id} className="border-b border-pwc-gray-100 hover:bg-pwc-gray-50 transition-colors">
                      <td className="py-3 px-6"><span className="font-medium text-pwc-black">{group.name}</span></td>
                      <td className="py-3 px-4 text-pwc-gray-700">{group.company}</td>
                      <td className="py-3 px-4 text-pwc-gray-700">{group.member_count}명</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${roleBadge(group.default_role)}`}>{group.default_role}</span>
                      </td>
                      <td className="py-3 px-4 text-pwc-gray-700">{group.report_count}개</td>
                      <td className="py-3 px-4 text-pwc-gray-500">{group.created_at?.slice(0, 10)}</td>
                      <td className="py-3 px-4">
                        <button onClick={() => openGroupEdit(group)} className="text-xs bg-pwc-gray-100 text-pwc-gray-700 px-3 py-1.5 rounded hover:bg-pwc-gray-200 transition-colors">편집</button>
                      </td>
                    </tr>
                  ))}
                  {filteredGroups.length === 0 && (
                    <tr><td colSpan={7} className="py-12 text-center text-pwc-gray-400">검색 결과가 없습니다.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* 회사 생성 모달 */}
      {showCompanyModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCompanyModal(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <h2 className="text-lg font-semibold text-pwc-black mb-4">회사 생성</h2>
            <div>
              <label className="block text-sm font-medium text-pwc-gray-700 mb-1">회사명</label>
              <input type="text" value={newCompanyName} onChange={(e) => setNewCompanyName(e.target.value)} placeholder="회사명 입력" className="input-field" />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowCompanyModal(false)} className="text-sm px-4 py-2 rounded border border-pwc-gray-300 text-pwc-gray-700 hover:bg-pwc-gray-50">취소</button>
              <button onClick={createCompany} disabled={saving} className="btn-primary">{saving ? "생성 중..." : "생성"}</button>
            </div>
          </div>
        </div>
      )}

      {/* 자회사 생성 모달 */}
      {showSubModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowSubModal(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <h2 className="text-lg font-semibold text-pwc-black mb-4">자회사(대상법인) 생성</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-pwc-gray-700 mb-1">소속 회사</label>
                <select value={subForm.company_id} onChange={(e) => setSubForm({ ...subForm, company_id: Number(e.target.value) })} className="input-field">
                  <option value={0}>선택하세요</option>
                  {companies.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-pwc-gray-700 mb-1">자회사명</label>
                <input type="text" value={subForm.name} onChange={(e) => setSubForm({ ...subForm, name: e.target.value })} placeholder="자회사명 입력" className="input-field" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowSubModal(false)} className="text-sm px-4 py-2 rounded border border-pwc-gray-300 text-pwc-gray-700 hover:bg-pwc-gray-50">취소</button>
              <button onClick={createSubsidiary} disabled={saving} className="btn-primary">{saving ? "생성 중..." : "생성"}</button>
            </div>
          </div>
        </div>
      )}

      {/* 그룹 생성/수정 모달 */}
      {showGroupModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowGroupModal(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-semibold text-pwc-black mb-4">{editingGroup ? "그룹 수정" : "그룹 생성"}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-pwc-gray-700 mb-1">소속 회사</label>
                <select value={groupForm.company} onChange={(e) => setGroupForm({ ...groupForm, company: e.target.value })} className="input-field">
                  <option value="">선택하세요</option>
                  {companies.map((c) => (<option key={c.id} value={c.name}>{c.name}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-pwc-gray-700 mb-1">그룹명(대상법인)</label>
                <input type="text" value={groupForm.name} onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })} placeholder="그룹명 입력" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-pwc-gray-700 mb-1">기본 역할</label>
                <select value={groupForm.default_role} onChange={(e) => setGroupForm({ ...groupForm, default_role: e.target.value })} className="input-field">
                  <option value="admin">admin</option>
                  <option value="manager">manager</option>
                  <option value="viewer">viewer</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowGroupModal(false)} disabled={saving} className="text-sm px-4 py-2 rounded border border-pwc-gray-300 text-pwc-gray-700 hover:bg-pwc-gray-50">취소</button>
              <button onClick={saveGroup} disabled={saving} className="btn-primary">{saving ? "저장 중..." : "저장"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
