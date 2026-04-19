"use client";

import { useState, useEffect, useCallback } from "react";
import { showToast } from "../../components/Toast";
import { permissionsApi } from "../../lib/api";

// 리포트 페이지 탭 구조 (개발 중인 리포트 페이지 기준)
const reportPages = [
  { category: "손익분석", pages: ["PL 요약", "PL 추이분석", "PL 계정분석", "매출분석", "손익항목"] },
  { category: "재무상태분석", pages: ["BS 요약", "BS 추이분석", "BS 계정분석"] },
  { category: "전표분석", pages: ["전표분석내역", "전표검색"] },
  { category: "시나리오분석", pages: ["동일금액 중복 전표", "현금지급 後 부채인식", "주말 현금지급", "고액 현금지급", "비용인식 동시 현금지급", "Seldom Used Customer"] },
];

const allReportPages = reportPages.flatMap((c) => c.pages);

const detailFields = ["can_view_report", "can_upload", "can_pdf", "can_excel", "can_print", "can_share", "can_comment", "can_request_user"] as const;
const detailLabels: Record<string, string> = {
  can_view_report: "리포트 열람", can_upload: "업로드", can_pdf: "PDF", can_excel: "Excel", can_print: "인쇄", can_share: "공유", can_comment: "코멘트", can_request_user: "사용자 요청",
};

interface MatrixPerm {
  id: number; report_name: string; role: string;
  can_view: boolean; can_download: boolean; can_print: boolean; can_share: boolean; can_comment: boolean;
}

interface UserPerm {
  id: number; user_id: number; user_name: string; user_email: string;
  can_view_report: boolean; can_upload: boolean; can_pdf: boolean; can_excel: boolean;
  can_print: boolean; can_share: boolean; can_comment: boolean; can_request_user: boolean;
}

type PagePerms = Record<string, Record<string, boolean>>; // page -> role -> allowed

export default function PermissionsPage() {
  const [activeTab, setActiveTab] = useState<"reports" | "pages" | "users">("reports");
  const [matrixPerms, setMatrixPerms] = useState<MatrixPerm[]>([]);
  const [userPerms, setUserPerms] = useState<UserPerm[]>([]);
  const [pagePerms, setPagePerms] = useState<PagePerms>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [userCompanyFilter, setUserCompanyFilter] = useState("전체");

  const reports = Array.from(new Set(matrixPerms.map((p) => p.report_name)));
  const roles = Array.from(new Set(matrixPerms.map((p) => p.role)));

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [mRes, dRes] = await Promise.all([permissionsApi.matrix(), permissionsApi.detail()]);
      setMatrixPerms(mRes.permissions || []);
      setUserPerms(dRes.permissions || []);
      // 페이지 권한 초기화 (DB에 없으면 기본값)
      const pp: PagePerms = {};
      allReportPages.forEach((page) => {
        pp[page] = {};
        const r: string[] = Array.from(new Set((mRes.permissions || []).map((p: MatrixPerm) => p.role)));
        r.forEach((role) => { pp[page][role] = role === "admin"; });
      });
      setPagePerms(pp);
    } catch { showToast("권한 데이터를 불러오지 못했습니다.", "error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const toggleMatrix = (report: string, role: string) => {
    setMatrixPerms((prev) => prev.map((p) =>
      p.report_name === report && p.role === role ? { ...p, can_view: !p.can_view } : p
    ));
  };

  const togglePage = (page: string, role: string) => {
    setPagePerms((prev) => ({
      ...prev,
      [page]: { ...prev[page], [role]: !prev[page]?.[role] },
    }));
  };

  const toggleUser = (userId: number, field: typeof detailFields[number]) => {
    setUserPerms((prev) => prev.map((p) =>
      p.user_id === userId ? { ...p, [field]: !p[field] } : p
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        permissionsApi.updateMatrix(matrixPerms),
        permissionsApi.updateDetail(userPerms),
      ]);
      showToast("권한 설정이 저장되었습니다.", "success");
    } catch { showToast("저장에 실패했습니다.", "error"); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-pwc-gray-500">로딩 중...</div></div>;

  const tabs = [
    { key: "reports" as const, label: "리포트 데이터 권한" },
    { key: "pages" as const, label: "리포트 페이지 접근 권한" },
    { key: "users" as const, label: "사용자별 기능 권한" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-pwc-black">리포트 접근 권한</h1>
          <p className="text-sm text-pwc-gray-500 mt-1">역할별 리포트 접근 권한과 페이지별 상세 권한을 관리합니다.</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? "저장 중..." : "변경사항 저장"}</button>
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

      {/* Tab 1: Report Data Matrix */}
      {activeTab === "reports" && (
        <div className="card overflow-hidden p-0">
          <div className="px-6 py-4 border-b border-pwc-gray-200 bg-pwc-gray-50">
            <h3 className="font-semibold text-pwc-black">리포트 데이터별 접근 권한 매트릭스</h3>
            <p className="text-xs text-pwc-gray-500 mt-1">각 역할이 접근할 수 있는 리포트 데이터를 설정합니다.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-pwc-gray-200">
                  <th className="text-left py-3 px-6 font-medium text-pwc-gray-500 min-w-[200px]">리포트</th>
                  {roles.map((role) => (
                    <th key={role} className="py-3 px-4 font-medium text-pwc-gray-500 text-center min-w-[80px]">{role}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report} className="border-b border-pwc-gray-100 hover:bg-pwc-gray-50 transition-colors">
                    <td className="py-3 px-6 font-medium text-pwc-gray-700">{report}</td>
                    {roles.map((role) => {
                      const perm = matrixPerms.find((p) => p.report_name === report && p.role === role);
                      return (
                        <td key={role} className="py-3 px-4 text-center">
                          <input type="checkbox" checked={!!perm?.can_view} onChange={() => toggleMatrix(report, role)}
                            className="w-4 h-4 rounded border-pwc-gray-300 text-pwc-orange focus:ring-pwc-orange cursor-pointer" />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Report Pages */}
      {activeTab === "pages" && (
        <div className="card overflow-hidden p-0">
          <div className="px-6 py-4 border-b border-pwc-gray-200 bg-pwc-gray-50">
            <h3 className="font-semibold text-pwc-black">리포트 페이지별 접근 권한</h3>
            <p className="text-xs text-pwc-gray-500 mt-1">각 역할이 접근할 수 있는 리포트 페이지를 설정합니다.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-pwc-gray-200">
                  <th className="text-left py-3 px-6 font-medium text-pwc-gray-500 min-w-[100px]">카테고리</th>
                  <th className="text-left py-3 px-4 font-medium text-pwc-gray-500 min-w-[200px]">페이지</th>
                  {roles.map((role) => (
                    <th key={role} className="py-3 px-4 font-medium text-pwc-gray-500 text-center min-w-[80px]">{role}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reportPages.map((cat) =>
                  cat.pages.map((page, pi) => (
                    <tr key={page} className="border-b border-pwc-gray-100 hover:bg-pwc-gray-50 transition-colors">
                      {pi === 0 && (
                        <td rowSpan={cat.pages.length} className="py-3 px-6 font-semibold text-pwc-orange border-r border-pwc-gray-100 align-top">
                          {cat.category}
                        </td>
                      )}
                      <td className="py-3 px-4 text-pwc-gray-700">{page}</td>
                      {roles.map((role) => (
                        <td key={role} className="py-3 px-4 text-center">
                          <input type="checkbox" checked={!!pagePerms[page]?.[role]} onChange={() => togglePage(page, role)}
                            className="w-4 h-4 rounded border-pwc-gray-300 text-pwc-orange focus:ring-pwc-orange cursor-pointer" />
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: User Permissions */}
      {activeTab === "users" && (() => {
        const companies = Array.from(new Set(userPerms.map((u) => u.user_email.split("@")[1]?.split(".")[0] || "").filter(Boolean)));
        const filtered = userPerms.filter((up) => {
          const matchSearch = !userSearch ||
            up.user_name.toLowerCase().includes(userSearch.toLowerCase()) ||
            up.user_email.toLowerCase().includes(userSearch.toLowerCase());
          const matchCompany = userCompanyFilter === "전체" ||
            up.user_email.includes(userCompanyFilter.toLowerCase());
          return matchSearch && matchCompany;
        });
        return (
          <div className="space-y-4">
            {/* Search & Filter */}
            <div className="card">
              <div className="flex flex-wrap items-end gap-4">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-medium text-pwc-gray-500 mb-1">검색</label>
                  <input type="text" value={userSearch} onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="이름 또는 이메일로 검색" className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-pwc-gray-500 mb-1">도메인</label>
                  <select value={userCompanyFilter} onChange={(e) => setUserCompanyFilter(e.target.value)} className="input-field">
                    <option value="전체">전체</option>
                    {companies.map((c) => (<option key={c} value={c}>{c}</option>))}
                  </select>
                </div>
                <div className="text-sm text-pwc-gray-500 pb-2">{filtered.length}명 / {userPerms.length}명</div>
              </div>
            </div>

            <div className="card overflow-hidden p-0">
              <div className="px-6 py-4 border-b border-pwc-gray-200 bg-pwc-gray-50">
                <h3 className="font-semibold text-pwc-black">사용자별 상세 기능 권한</h3>
                <p className="text-xs text-pwc-gray-500 mt-1">사용자별 세부 기능 권한을 설정합니다.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-pwc-gray-200">
                      <th className="text-left py-3 px-6 font-medium text-pwc-gray-500 min-w-[150px]">사용자</th>
                      {detailFields.map((f) => (
                        <th key={f} className="py-3 px-3 font-medium text-pwc-gray-500 text-center min-w-[80px]">{detailLabels[f]}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((up) => (
                      <tr key={up.user_id} className="border-b border-pwc-gray-100 hover:bg-pwc-gray-50 transition-colors">
                        <td className="py-3 px-6">
                          <div>
                            <p className="font-medium text-pwc-black">{up.user_name}</p>
                            <p className="text-xs text-pwc-gray-500">{up.user_email}</p>
                          </div>
                        </td>
                        {detailFields.map((field) => (
                          <td key={field} className="py-3 px-3 text-center">
                            <input type="checkbox" checked={!!up[field]} onChange={() => toggleUser(up.user_id, field)}
                              className="w-4 h-4 rounded border-pwc-gray-300 text-pwc-orange focus:ring-pwc-orange cursor-pointer" />
                          </td>
                        ))}
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr><td colSpan={detailFields.length + 1} className="py-12 text-center text-pwc-gray-400">검색 결과가 없습니다.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
