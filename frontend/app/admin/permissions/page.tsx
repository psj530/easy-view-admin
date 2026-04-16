"use client";

import { useState } from "react";
import { showToast } from "../../components/Toast";

const reports = [
  "재무제표 분석",
  "Tax Compliance",
  "내부통제 리포트",
  "비용 분석",
  "ESG 리포트",
  "M&A Due Diligence",
  "Transfer Pricing",
];

const roles = ["Admin", "Manager", "Editor", "Viewer"];

type PermMatrix = Record<string, Record<string, boolean>>;

function buildInitialMatrix(): PermMatrix {
  const m: PermMatrix = {};
  reports.forEach((r) => {
    m[r] = {};
    roles.forEach((role) => {
      if (role === "Admin") m[r][role] = true;
      else if (role === "Manager") m[r][role] = true;
      else if (role === "Editor")
        m[r][role] = [
          "재무제표 분석",
          "비용 분석",
          "Tax Compliance",
        ].includes(r);
      else
        m[r][role] = ["재무제표 분석", "비용 분석"].includes(r);
    });
  });
  return m;
}

const detailPerms = ["열람", "다운로드", "인쇄", "공유", "코멘트"];

type DetailMatrix = Record<string, Record<string, boolean>>;

function buildDetailMatrix(): DetailMatrix {
  const m: DetailMatrix = {};
  roles.forEach((role) => {
    m[role] = {};
    detailPerms.forEach((p) => {
      if (role === "Admin") m[role][p] = true;
      else if (role === "Manager") m[role][p] = p !== "인쇄" || true;
      else if (role === "Editor")
        m[role][p] = ["열람", "코멘트", "다운로드"].includes(p);
      else m[role][p] = p === "열람";
    });
  });
  return m;
}

export default function PermissionsPage() {
  const [matrix, setMatrix] = useState<PermMatrix>(buildInitialMatrix);
  const [detailMatrix, setDetailMatrix] = useState<DetailMatrix>(
    buildDetailMatrix
  );

  const toggleCell = (report: string, role: string) => {
    setMatrix((prev) => ({
      ...prev,
      [report]: {
        ...prev[report],
        [role]: !prev[report][role],
      },
    }));
  };

  const toggleColumnAll = (role: string) => {
    const allChecked = reports.every((r) => matrix[r][role]);
    setMatrix((prev) => {
      const next = { ...prev };
      reports.forEach((r) => {
        next[r] = { ...next[r], [role]: !allChecked };
      });
      return next;
    });
  };

  const toggleDetailCell = (role: string, perm: string) => {
    setDetailMatrix((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [perm]: !prev[role][perm],
      },
    }));
  };

  const handleSave = () => {
    showToast("권한 설정이 저장되었습니다.", "success");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-pwc-black">
            리포트 접근 권한
          </h1>
          <p className="text-sm text-pwc-gray-500 mt-1">
            역할별 리포트 접근 권한과 상세 기능 권한을 관리합니다.
          </p>
        </div>
        <button onClick={handleSave} className="btn-primary">
          변경사항 저장
        </button>
      </div>

      {/* Report x Role Matrix */}
      <div className="card overflow-hidden p-0">
        <div className="px-6 py-4 border-b border-pwc-gray-200 bg-pwc-gray-50">
          <h3 className="font-semibold text-pwc-black">
            리포트별 접근 권한 매트릭스
          </h3>
          <p className="text-xs text-pwc-gray-500 mt-1">
            각 역할이 접근할 수 있는 리포트를 설정합니다.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-pwc-gray-200">
                <th className="text-left py-3 px-6 font-medium text-pwc-gray-500 min-w-[200px]">
                  리포트
                </th>
                {roles.map((role) => {
                  const allChecked = reports.every((r) => matrix[r][role]);
                  return (
                    <th
                      key={role}
                      className="py-3 px-6 font-medium text-pwc-gray-500 text-center min-w-[120px]"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span>{role}</span>
                        <label className="flex items-center gap-1 text-xs text-pwc-gray-400 cursor-pointer font-normal">
                          <input
                            type="checkbox"
                            checked={allChecked}
                            onChange={() => toggleColumnAll(role)}
                            className="w-3.5 h-3.5 rounded border-pwc-gray-300 text-pwc-orange focus:ring-pwc-orange"
                          />
                          전체
                        </label>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr
                  key={report}
                  className="border-b border-pwc-gray-100 hover:bg-pwc-gray-50 transition-colors"
                >
                  <td className="py-3 px-6 font-medium text-pwc-gray-700">
                    {report}
                  </td>
                  {roles.map((role) => (
                    <td key={role} className="py-3 px-6 text-center">
                      <input
                        type="checkbox"
                        checked={!!matrix[report]?.[role]}
                        onChange={() => toggleCell(report, role)}
                        className="w-4 h-4 rounded border-pwc-gray-300 text-pwc-orange focus:ring-pwc-orange cursor-pointer"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Permissions Table */}
      <div className="card overflow-hidden p-0">
        <div className="px-6 py-4 border-b border-pwc-gray-200 bg-pwc-gray-50">
          <h3 className="font-semibold text-pwc-black">상세 기능 권한</h3>
          <p className="text-xs text-pwc-gray-500 mt-1">
            역할별 세부 기능 권한을 설정합니다.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-pwc-gray-200">
                <th className="text-left py-3 px-6 font-medium text-pwc-gray-500 min-w-[150px]">
                  역할
                </th>
                {detailPerms.map((p) => (
                  <th
                    key={p}
                    className="py-3 px-6 font-medium text-pwc-gray-500 text-center min-w-[100px]"
                  >
                    {p}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr
                  key={role}
                  className="border-b border-pwc-gray-100 hover:bg-pwc-gray-50 transition-colors"
                >
                  <td className="py-3 px-6">
                    <span className="badge-role">{role}</span>
                  </td>
                  {detailPerms.map((perm) => (
                    <td key={perm} className="py-3 px-6 text-center">
                      <input
                        type="checkbox"
                        checked={!!detailMatrix[role]?.[perm]}
                        onChange={() => toggleDetailCell(role, perm)}
                        className="w-4 h-4 rounded border-pwc-gray-300 text-pwc-orange focus:ring-pwc-orange cursor-pointer"
                      />
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
