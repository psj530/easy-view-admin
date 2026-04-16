"use client";

import { useState, useEffect, useCallback } from "react";
import { showToast } from "../../components/Toast";
import { permissionsApi } from "../../lib/api";

const permFields = ["can_view", "can_download", "can_print", "can_share", "can_comment"] as const;
const permLabels: Record<string, string> = {
  can_view: "열람", can_download: "다운로드", can_print: "인쇄", can_share: "공유", can_comment: "코멘트",
};

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

export default function PermissionsPage() {
  const [matrixPerms, setMatrixPerms] = useState<MatrixPerm[]>([]);
  const [userPerms, setUserPerms] = useState<UserPerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const reports = [...new Set(matrixPerms.map((p) => p.report_name))];
  const roles = [...new Set(matrixPerms.map((p) => p.role))];

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [mRes, dRes] = await Promise.all([permissionsApi.matrix(), permissionsApi.detail()]);
      setMatrixPerms(mRes.permissions || []);
      setUserPerms(dRes.permissions || []);
    } catch { showToast("권한 데이터를 불러오지 못했습니다.", "error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const toggleMatrix = (report: string, role: string, field: typeof permFields[number]) => {
    setMatrixPerms((prev) => prev.map((p) =>
      p.report_name === report && p.role === role ? { ...p, [field]: !p[field] } : p
    ));
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-pwc-black">리포트 접근 권한</h1>
          <p className="text-sm text-pwc-gray-500 mt-1">역할별 리포트 접근 권한과 상세 기능 권한을 관리합니다.</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? "저장 중..." : "변경사항 저장"}</button>
      </div>

      {/* Report x Role Matrix */}
      <div className="card overflow-hidden p-0">
        <div className="px-6 py-4 border-b border-pwc-gray-200 bg-pwc-gray-50">
          <h3 className="font-semibold text-pwc-black">리포트별 접근 권한 매트릭스</h3>
          <p className="text-xs text-pwc-gray-500 mt-1">각 역할이 접근할 수 있는 리포트를 설정합니다.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-pwc-gray-200">
                <th className="text-left py-3 px-6 font-medium text-pwc-gray-500 min-w-[200px]">리포트 / 역할</th>
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
                        <input type="checkbox" checked={!!perm?.can_view} onChange={() => toggleMatrix(report, role, "can_view")}
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

      {/* User Permissions */}
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
              {userPerms.map((up) => (
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
