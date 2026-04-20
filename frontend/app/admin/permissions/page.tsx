"use client";

import { useState, useEffect, useCallback } from "react";
import { showToast } from "../../components/Toast";
import { permissionsApi } from "../../lib/api";

const reportPages = [
  { category: "손익분석", pages: ["PL 요약", "PL 추이분석", "PL 계정분석", "매출분석", "손익항목"] },
  { category: "재무상태분석", pages: ["BS 요약", "BS 추이분석", "BS 계정분석"] },
  { category: "전표분석", pages: ["전표분석내역", "전표검색"] },
  { category: "시나리오분석", pages: ["동일금액 중복 전표", "현금지급 後 부채인식", "주말 현금지급", "고액 현금지급", "비용인식 동시 현금지급", "Seldom Used Customer"] },
];

const allReportPages = reportPages.flatMap((c) => c.pages);

// 표시용 컬럼 (PDF/Excel/인쇄 → 추출로 통합)
const displayColumns = [
  { key: "can_view_report", label: "리포트 전체", tooltip: "모든 리포트 페이지에 접근할 수 있습니다. 해제 시 페이지별 개별 설정이 필요합니다." },
  { key: "can_upload", label: "업로드", tooltip: "자료실에 파일을 업로드할 수 있습니다." },
  { key: "can_export", label: "추출", tooltip: "PDF 다운로드, Excel 내보내기, 인쇄 기능이 포함됩니다.", merged: ["can_pdf", "can_excel", "can_print"] },
  { key: "can_share", label: "공유", tooltip: "리포트를 다른 사용자에게 공유할 수 있습니다." },
  { key: "can_comment", label: "코멘트", tooltip: "리포트에 코멘트를 작성할 수 있습니다." },
  { key: "can_request_user", label: "사용자 요청", tooltip: "새로운 사용자 추가를 신청할 수 있습니다." },
] as const;

// DB 필드 (실제 저장용)
const detailFields = ["can_view_report", "can_upload", "can_pdf", "can_excel", "can_print", "can_share", "can_comment", "can_request_user"] as const;

interface MatrixPerm {
  id: number; report_name: string; role: string;
  can_view: boolean; can_download: boolean; can_print: boolean; can_share: boolean; can_comment: boolean;
}

interface UserPerm {
  id: number; user_id: number; user_name: string; user_email: string;
  can_view_report: boolean; can_upload: boolean; can_pdf: boolean; can_excel: boolean;
  can_print: boolean; can_share: boolean; can_comment: boolean; can_request_user: boolean;
}

type PagePermsMap = Record<number, Record<string, boolean>>; // userId -> page -> allowed

export default function PermissionsPage() {
  const [activeTab, setActiveTab] = useState<"users" | "reports">("users");
  const [matrixPerms, setMatrixPerms] = useState<MatrixPerm[]>([]);
  const [userPerms, setUserPerms] = useState<UserPerm[]>([]);
  const [pagePermsMap, setPagePermsMap] = useState<PagePermsMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notifyUsers, setNotifyUsers] = useState(true);
  const [showRoleInfo, setShowRoleInfo] = useState(false);
  const [userSearch, setUserSearch] = useState("");
  const [userCompanyFilter, setUserCompanyFilter] = useState("전체");

  // 팝업 상태
  const [popupUser, setPopupUser] = useState<UserPerm | null>(null);

  const reports = Array.from(new Set(matrixPerms.map((p) => p.report_name)));
  const roles = Array.from(new Set(matrixPerms.map((p) => p.role)));

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [mRes, dRes] = await Promise.all([permissionsApi.matrix(), permissionsApi.detail()]);
      setMatrixPerms(mRes.permissions || []);
      setUserPerms(dRes.permissions || []);
      // 페이지 권한 초기화
      const pp: PagePermsMap = {};
      (dRes.permissions || []).forEach((up: UserPerm) => {
        pp[up.user_id] = {};
        allReportPages.forEach((page) => { pp[up.user_id][page] = up.can_view_report; });
      });
      setPagePermsMap(pp);
    } catch { showToast("권한 데이터를 불러오지 못했습니다.", "error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const toggleMatrix = (report: string, role: string) => {
    setMatrixPerms((prev) => prev.map((p) =>
      p.report_name === report && p.role === role ? { ...p, can_view: !p.can_view } : p
    ));
  };

  const toggleUser = (userId: number, field: typeof detailFields[number]) => {
    setUserPerms((prev) => prev.map((p) => {
      if (p.user_id !== userId) return p;
      const updated = { ...p, [field]: !p[field] };
      // 리포트 전체를 켜면 모든 페이지 권한도 켜기
      if (field === "can_view_report" && updated.can_view_report) {
        setPagePermsMap((pm) => {
          const userPages = { ...(pm[userId] || {}) };
          allReportPages.forEach((page) => { userPages[page] = true; });
          return { ...pm, [userId]: userPages };
        });
      }
      return updated;
    }));
  };

  const togglePagePerm = (userId: number, page: string) => {
    setPagePermsMap((prev) => ({
      ...prev,
      [userId]: { ...(prev[userId] || {}), [page]: !(prev[userId]?.[page]) },
    }));
  };

  const toggleAllPages = (userId: number, checked: boolean) => {
    setPagePermsMap((prev) => {
      const userPages = { ...(prev[userId] || {}) };
      allReportPages.forEach((page) => { userPages[page] = checked; });
      return { ...prev, [userId]: userPages };
    });
  };

  const openPagePopup = (up: UserPerm) => {
    // 리포트 전체가 꺼져 있는 사용자만 상세 설정 가능
    setPopupUser(up);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        permissionsApi.updateMatrix(matrixPerms),
        permissionsApi.updateDetail(userPerms),
      ]);
      showToast(notifyUsers ? "권한 설정이 저장되었습니다. (변경 알림이 발송됩니다)" : "권한 설정이 저장되었습니다.", "success");
    } catch { showToast("저장에 실패했습니다.", "error"); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-pwc-gray-500">로딩 중...</div></div>;

  const companies = Array.from(new Set(userPerms.map((u) => u.user_email.split("@")[1]?.split(".")[0] || "").filter(Boolean)));
  const filteredUsers = userPerms.filter((up) => {
    const matchSearch = !userSearch ||
      up.user_name.toLowerCase().includes(userSearch.toLowerCase()) ||
      up.user_email.toLowerCase().includes(userSearch.toLowerCase());
    const matchCompany = userCompanyFilter === "전체" ||
      up.user_email.includes(userCompanyFilter.toLowerCase());
    return matchSearch && matchCompany;
  });

  const tabs = [
    { key: "users" as const, label: "사용자별 기능 권한" },
    { key: "reports" as const, label: "리포트 데이터 권한" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-pwc-black">리포트 접근 권한</h1>
          <p className="text-sm text-pwc-gray-500 mt-1">사용자별 기능 권한과 리포트 페이지 접근을 관리합니다.</p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-pwc-gray-600 cursor-pointer">
            <button type="button" onClick={() => setNotifyUsers(!notifyUsers)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${notifyUsers ? "bg-pwc-orange" : "bg-pwc-gray-300"}`}>
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${notifyUsers ? "translate-x-[18px]" : "translate-x-0.5"}`} />
            </button>
            변경 알림
          </label>
          <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? "저장 중..." : "변경사항 저장"}</button>
        </div>
      </div>

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

      {/* Tab 1: 사용자별 기능 권한 (기본) */}
      {activeTab === "users" && (
        <div className="space-y-4">
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
              <div className="text-sm text-pwc-gray-500 pb-2">{filteredUsers.length}명 / {userPerms.length}명</div>
            </div>
          </div>

          <div className="card overflow-hidden p-0">
            <div className="px-6 py-4 border-b border-pwc-gray-200 bg-pwc-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-pwc-black">사용자별 상세 기능 권한</h3>
                  <p className="text-xs text-pwc-gray-500 mt-1">&quot;리포트 전체&quot;가 해제된 사용자는 [페이지 설정] 버튼으로 접근 가능한 페이지를 개별 설정할 수 있습니다.</p>
                </div>
                <button onClick={() => setShowRoleInfo(true)} className="flex-shrink-0 text-xs text-pwc-orange border border-pwc-orange rounded px-2 py-1 hover:bg-pwc-orange hover:text-white transition-colors">
                  권한 정의 보기
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-pwc-gray-200">
                    <th className="text-left py-3 px-6 font-medium text-pwc-gray-500 min-w-[150px]">사용자</th>
                    {displayColumns.map((col) => (
                      <th key={col.key} className="py-3 px-3 font-medium text-pwc-gray-500 text-center min-w-[70px]">
                        {col.label}
                      </th>
                    ))}
                    <th className="py-3 px-3 font-medium text-pwc-gray-500 text-center min-w-[90px]">페이지 설정</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((up) => {
                    const pageCount = allReportPages.filter((p) => pagePermsMap[up.user_id]?.[p]).length;
                    return (
                      <tr key={up.user_id} className="border-b border-pwc-gray-100 hover:bg-pwc-gray-50 transition-colors">
                        <td className="py-3 px-6">
                          <div>
                            <p className="font-medium text-pwc-black">{up.user_name}</p>
                            <p className="text-xs text-pwc-gray-500">{up.user_email}</p>
                          </div>
                        </td>
                        {displayColumns.map((col) => {
                          if ("merged" in col && col.merged) {
                            // 통합 컬럼 (추출 = PDF + Excel + 인쇄)
                            const allChecked = col.merged.every((f) => !!(up as unknown as Record<string, boolean>)[f]);
                            const toggleMerged = () => {
                              col.merged.forEach((f) => toggleUser(up.user_id, f as typeof detailFields[number]));
                            };
                            return (
                              <td key={col.key} className="py-3 px-3 text-center">
                                <input type="checkbox" checked={allChecked} onChange={toggleMerged}
                                  className="w-4 h-4 rounded border-pwc-gray-300 text-pwc-orange focus:ring-pwc-orange cursor-pointer" />
                              </td>
                            );
                          }
                          const field = col.key as typeof detailFields[number];
                          return (
                            <td key={col.key} className="py-3 px-3 text-center">
                              <input type="checkbox" checked={!!(up as unknown as Record<string, boolean>)[field]} onChange={() => toggleUser(up.user_id, field)}
                                className="w-4 h-4 rounded border-pwc-gray-300 text-pwc-orange focus:ring-pwc-orange cursor-pointer" />
                            </td>
                          );
                        })}
                        <td className="py-3 px-3 text-center">
                          {up.can_view_report ? (
                            <span className="text-xs text-green-600">전체 허용</span>
                          ) : (
                            <button onClick={() => openPagePopup(up)}
                              className="text-xs bg-pwc-orange text-white px-3 py-1 rounded hover:bg-pwc-orange-dark transition-colors">
                              설정 ({pageCount}/{allReportPages.length})
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredUsers.length === 0 && (
                    <tr><td colSpan={detailFields.length + 2} className="py-12 text-center text-pwc-gray-400">검색 결과가 없습니다.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: 리포트 데이터 권한 */}
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

      {/* 페이지별 접근 권한 팝업 */}
      {popupUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setPopupUser(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[85vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-pwc-gray-200 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-pwc-black">{popupUser.user_name} - 리포트 페이지 접근 권한</h2>
                <p className="text-xs text-pwc-gray-500">{popupUser.user_email}</p>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-pwc-gray-600 cursor-pointer">
                  <input type="checkbox"
                    checked={allReportPages.every((p) => pagePermsMap[popupUser.user_id]?.[p])}
                    onChange={(e) => toggleAllPages(popupUser.user_id, e.target.checked)}
                    className="w-4 h-4 rounded border-pwc-gray-300 text-pwc-orange focus:ring-pwc-orange" />
                  전체 선택
                </label>
                <button onClick={() => setPopupUser(null)} className="text-pwc-gray-400 hover:text-pwc-gray-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-4">
              {reportPages.map((cat) => (
                <div key={cat.category} className="mb-5">
                  <h3 className="text-sm font-semibold text-pwc-orange mb-2">{cat.category}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {cat.pages.map((page) => (
                      <label key={page} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                        pagePermsMap[popupUser.user_id]?.[page]
                          ? "border-pwc-orange bg-orange-50"
                          : "border-pwc-gray-200 hover:bg-pwc-gray-50"
                      }`}>
                        <input type="checkbox"
                          checked={!!pagePermsMap[popupUser.user_id]?.[page]}
                          onChange={() => togglePagePerm(popupUser.user_id, page)}
                          className="w-4 h-4 rounded border-pwc-gray-300 text-pwc-orange focus:ring-pwc-orange" />
                        <span className="text-sm text-pwc-gray-700">{page}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 py-4 border-t border-pwc-gray-200 flex justify-between items-center flex-shrink-0">
              <span className="text-sm text-pwc-gray-500">
                {allReportPages.filter((p) => pagePermsMap[popupUser.user_id]?.[p]).length} / {allReportPages.length} 페이지 허용
              </span>
              <button onClick={() => setPopupUser(null)} className="btn-primary">확인</button>
            </div>
          </div>
        </div>
      )}
      {/* 역할 정의 팝업 */}
      {showRoleInfo && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowRoleInfo(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-xl mx-4">
            <div className="px-6 py-4 border-b border-pwc-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-pwc-black">권한 정의</h2>
              <button onClick={() => setShowRoleInfo(false)} className="text-pwc-gray-400 hover:text-pwc-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6">
              <table className="w-full text-sm table-fixed">
                <thead>
                  <tr className="border-b-2 border-pwc-orange">
                    <th className="text-left py-3 pr-4 font-semibold text-pwc-black w-[80px]">권한</th>
                    <th className="text-left py-3 px-4 font-semibold text-pwc-black w-[160px]">설명</th>
                    <th className="text-left py-3 pl-4 font-semibold text-pwc-black">포함 기능</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "리포트 전체", desc: "모든 리포트 페이지 접근", detail: "손익·재무상태·전표·시나리오분석 전체" },
                    { name: "업로드", desc: "자료실 파일 업로드", detail: "Excel, PDF, CSV 등 업로드" },
                    { name: "추출", desc: "데이터 내보내기", detail: "PDF 다운로드, Excel, 인쇄" },
                    { name: "공유", desc: "리포트 공유", detail: "URL 공유, 이메일 전송" },
                    { name: "코멘트", desc: "코멘트 작성", detail: "작성, 답글, 멘션" },
                    { name: "사용자 요청", desc: "사용자 추가 신청", detail: "신청서 작성 및 제출" },
                  ].map((r) => (
                    <tr key={r.name} className="border-b border-pwc-gray-100">
                      <td className="py-3 pr-4 font-medium text-pwc-orange whitespace-nowrap">{r.name}</td>
                      <td className="py-3 px-4 text-pwc-gray-700">{r.desc}</td>
                      <td className="py-3 pl-4 text-pwc-gray-500 text-xs">{r.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-5 p-3 bg-pwc-gray-50 rounded-lg text-xs text-pwc-gray-600 leading-relaxed">
                <strong>페이지 설정 안내</strong> — &quot;리포트 전체&quot; 활성 시 모든 페이지 접근 가능. 비활성 시 [설정] 버튼으로 개별 페이지를 지정할 수 있습니다.
              </div>
            </div>
            <div className="px-6 py-4 border-t border-pwc-gray-200 flex justify-end">
              <button onClick={() => setShowRoleInfo(false)} className="btn-primary">확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
