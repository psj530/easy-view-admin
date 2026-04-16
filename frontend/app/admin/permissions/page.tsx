"use client";

import { useState, useEffect, useCallback } from "react";
import { permissionsApi } from "../../lib/api";
import { showToast } from "../../components/Toast";

type PermMatrix = Record<string, Record<string, boolean>>;
type DetailMatrix = Record<string, Record<string, boolean>>;

export default function PermissionsPage() {
  const [matrix, setMatrix] = useState<PermMatrix>({});
  const [detailMatrix, setDetailMatrix] = useState<DetailMatrix>({});
  const [reports, setReports] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [detailPerms, setDetailPerms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadMatrix = useCallback(async () => {
    try {
      const res = await permissionsApi.matrix();
      const perms: any[] = res.permissions || [];
      const reportSet = new Set<string>();
      const roleSet = new Set<string>();
      const m: PermMatrix = {};

      perms.forEach((p: any) => {
        reportSet.add(p.report_name);
        roleSet.add(p.role);
        if (!m[p.report_name]) m[p.report_name] = {};
        m[p.report_name][p.role] = !!p.has_access;
      });

      setReports(Array.from(reportSet));
      setRoles(Array.from(roleSet));
      setMatrix(m);
    } catch {
      showToast("권한 매트릭스를 불러오지 못했습니다.", "error");
    }
  }, []);

  const loadDetail = useCallback(async () => {
    try {
      const res = await permissionsApi.detail();
      const perms: any[] = res.permissions || [];
      const roleSet = new Set<string>();
      const permSet = new Set<string>();
      const m: DetailMatrix = {};

      perms.forEach((p: any) => {
        roleSet.add(p.role);
        permSet.add(p.permission);
        if (!m[p.role]) m[p.role] = {};
        m[p.role][p.permission] = !!p.enabled;
      });

      // Only update roles if we didn't get them from matrix yet
      if (roles.length === 0) setRoles(Array.from(roleSet));
      setDetailPerms(Array.from(permSet));
      setDetailMatrix(m);
    } catch {
      showToast("상세 권한을 불러오지 못했습니다.", "error");
    }
  }, [roles.length]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadMatrix(), loadDetail()]);
      setLoading(false);
    };
    init();
  }, [loadMatrix, loadDetail]);

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
    const allChecked = reports.every((r) => matrix[r]?.[role]);
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

  const handleSave = async () => {
    setSaving(true);
    try {
      // Build matrix permissions array
      const matrixPerms: any[] = [];
      reports.forEach((report) => {
        roles.forEach((role) => {
          matrixPerms.push({
            report_name: report,
            role,
            has_access: !!matrix[report]?.[role],
          });
        });
      });

      // Build detail permissions array
      const detailPermsArr: any[] = [];
      roles.forEach((role) => {
        detailPerms.forEach((perm) => {
          detailPermsArr.push({
            role,
            permission: perm,
            enabled: !!detailMatrix[role]?.[perm],
          });
        });
      });

      await Promise.all([
        permissionsApi.updateMatrix(matrixPerms),
        permissionsApi.updateDetail(detailPermsArr),
      ]);
      showToast("권한 설정이 저장되었습니다.", "success");
    } catch {
      showToast("권한 설정 저장에 실패했습니다.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-pwc-gray-500">로딩 중...</div>
      </div>
    );
  }

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
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? "저장 중..." : "변경사항 저장"}
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
                  const allChecked = reports.every((r) => matrix[r]?.[role]);
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
