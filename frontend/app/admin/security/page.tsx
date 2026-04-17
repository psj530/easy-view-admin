"use client";

import { useState, useEffect, useCallback } from "react";
import { showToast } from "../../components/Toast";
import { securityApi, usersApi } from "../../lib/api";

type Tab = "status" | "password" | "failures";

interface AccountRow {
  id: number;
  name: string;
  email: string;
  company: string;
  role: string;
  status: string;
  two_fa: boolean;
  last_login: string | null;
  password_expiry: string | null;
}

interface DailyStat { date: string; count: number; }
interface FailureLog { id: number; timestamp: string | null; actor: string; detail: string; ip_address: string; }

export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState<Tab>("status");
  const [accounts, setAccounts] = useState<AccountRow[]>([]);
  const [summary, setSummary] = useState({ total: 0, active: 0, inactive: 0, pending: 0, expiring_passwords: 0 });
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [failureLogs, setFailureLogs] = useState<FailureLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Password policy state
  const [minLength, setMinLength] = useState(8);
  const [requireUppercase, setRequireUppercase] = useState(true);
  const [requireNumber, setRequireNumber] = useState(true);
  const [requireSpecial, setRequireSpecial] = useState(true);
  const [maxFailAttempts, setMaxFailAttempts] = useState(5);
  const [passwordExpiry, setPasswordExpiry] = useState(90);

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await securityApi.accounts();
      setAccounts(data.accounts || []);
      setSummary(data.summary || {});
    } catch { /* */ }
    finally { setLoading(false); }
  }, []);

  const loadFailures = useCallback(async () => {
    try {
      const data = await securityApi.loginFailures();
      setDailyStats(data.daily_stats || []);
      setFailureLogs(data.failure_logs || []);
    } catch { /* */ }
  }, []);

  useEffect(() => { loadAccounts(); }, [loadAccounts]);
  useEffect(() => { if (activeTab === "failures") loadFailures(); }, [activeTab, loadFailures]);

  const toggleStatus = async (id: number) => {
    try {
      const result = await usersApi.toggleStatus(id);
      showToast(result.message, "success");
      await loadAccounts();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "상태 변경에 실패했습니다.", "error");
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

  const tabs: { key: Tab; label: string }[] = [
    { key: "status", label: "계정 상태" },
    { key: "password", label: "비밀번호 정책" },
    { key: "failures", label: "로그인 실패 로그" },
  ];

  const maxFailure = dailyStats.length > 0 ? Math.max(...dailyStats.map((f) => f.count)) : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-pwc-black">계정 상태/보안</h1>
        <p className="text-sm text-pwc-gray-500 mt-1">계정 보안 정책과 로그인 상태를 관리합니다.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center"><p className="text-2xl font-bold text-pwc-black">{summary.total}</p><p className="text-xs text-pwc-gray-500">전체</p></div>
        <div className="card text-center"><p className="text-2xl font-bold text-green-600">{summary.active}</p><p className="text-xs text-pwc-gray-500">활성</p></div>
        <div className="card text-center"><p className="text-2xl font-bold text-red-600">{summary.inactive}</p><p className="text-xs text-pwc-gray-500">비활성</p></div>
        <div className="card text-center"><p className="text-2xl font-bold text-yellow-600">{summary.expiring_passwords}</p><p className="text-xs text-pwc-gray-500">PW 만료 임박</p></div>
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

      {activeTab === "status" && (
        <div className="card overflow-hidden p-0">
          <div className="px-6 py-4 border-b border-pwc-gray-200 bg-pwc-gray-50">
            <h3 className="font-semibold text-pwc-black">계정 상태 관리</h3>
          </div>
          {loading ? <div className="py-12 text-center text-pwc-gray-400">로딩 중...</div> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-pwc-gray-200">
                    <th className="text-left py-3 px-6 font-medium text-pwc-gray-500">사용자</th>
                    <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">회사</th>
                    <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">상태</th>
                    <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">2FA</th>
                    <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">마지막 로그인</th>
                    <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">PW 만료</th>
                    <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((acc) => (
                    <tr key={acc.id} className="border-b border-pwc-gray-100 hover:bg-pwc-gray-50 transition-colors">
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-pwc-orange flex items-center justify-center text-white text-xs font-medium">{acc.name[0]}</div>
                          <div><p className="font-medium text-pwc-black">{acc.name}</p><p className="text-xs text-pwc-gray-500">{acc.email}</p></div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-pwc-gray-700">{acc.company}</td>
                      <td className="py-3 px-4">{statusBadge(acc.status)}</td>
                      <td className="py-3 px-4"><span className={`text-xs ${acc.two_fa ? "text-green-600" : "text-pwc-gray-400"}`}>{acc.two_fa ? "활성" : "비활성"}</span></td>
                      <td className="py-3 px-4 text-pwc-gray-600">{acc.last_login?.slice(0, 16) || "-"}</td>
                      <td className="py-3 px-4 text-pwc-gray-600">{acc.password_expiry?.slice(0, 10) || "-"}</td>
                      <td className="py-3 px-4">
                        <button onClick={() => toggleStatus(acc.id)}
                          className={`text-xs px-3 py-1 rounded transition-colors ${acc.status === "active" ? "bg-red-100 text-red-700 hover:bg-red-200" : "bg-green-600 text-white hover:bg-green-700"}`}>
                          {acc.status === "active" ? "비활성화" : "활성화"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "password" && (
        <div className="card max-w-2xl">
          <h3 className="font-semibold text-pwc-black mb-6">비밀번호 정책 설정</h3>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-pwc-gray-700 mb-1">최소 비밀번호 길이</label>
              <input type="number" value={minLength} onChange={(e) => setMinLength(Number(e.target.value))} min={6} max={32} className="input-field w-32" />
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={requireUppercase} onChange={(e) => setRequireUppercase(e.target.checked)} className="w-4 h-4 rounded border-pwc-gray-300 text-pwc-orange focus:ring-pwc-orange" />
                <span className="text-sm text-pwc-gray-700">대문자 포함 필수</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={requireNumber} onChange={(e) => setRequireNumber(e.target.checked)} className="w-4 h-4 rounded border-pwc-gray-300 text-pwc-orange focus:ring-pwc-orange" />
                <span className="text-sm text-pwc-gray-700">숫자 포함 필수</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={requireSpecial} onChange={(e) => setRequireSpecial(e.target.checked)} className="w-4 h-4 rounded border-pwc-gray-300 text-pwc-orange focus:ring-pwc-orange" />
                <span className="text-sm text-pwc-gray-700">특수문자 포함 필수</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-pwc-gray-700 mb-1">최대 로그인 실패 허용 횟수</label>
              <input type="number" value={maxFailAttempts} onChange={(e) => setMaxFailAttempts(Number(e.target.value))} min={3} max={10} className="input-field w-32" />
            </div>
            <div>
              <label className="block text-sm font-medium text-pwc-gray-700 mb-1">비밀번호 만료 주기 (일)</label>
              <input type="number" value={passwordExpiry} onChange={(e) => setPasswordExpiry(Number(e.target.value))} min={30} max={365} className="input-field w-32" />
            </div>
            <button onClick={() => showToast("비밀번호 정책이 저장되었습니다.", "success")} className="btn-primary">정책 저장</button>
          </div>
        </div>
      )}

      {activeTab === "failures" && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="font-semibold text-pwc-black mb-6">일별 로그인 실패 추이</h3>
            {dailyStats.length > 0 ? (
              <div className="flex items-end gap-6 h-48">
                {dailyStats.map((item) => (
                  <div key={item.date} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs text-pwc-gray-500 font-medium">{item.count}</span>
                    <div className="w-full bg-red-500 rounded-t-md bar-animate hover:bg-red-400 transition-colors cursor-pointer" style={{ height: `${(item.count / maxFailure) * 140}px` }} title={`${item.date}: ${item.count}건`} />
                    <span className="text-xs text-pwc-gray-500">{item.date.slice(5).replace("-", "/")}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-pwc-gray-400">로그인 실패 데이터가 없습니다.</div>
            )}
          </div>

          <div className="card overflow-hidden p-0">
            <div className="px-6 py-4 border-b border-pwc-gray-200 bg-pwc-gray-50">
              <h3 className="font-semibold text-pwc-black">최근 로그인 실패 기록</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-pwc-gray-200">
                    <th className="text-left py-3 px-6 font-medium text-pwc-gray-500">시간</th>
                    <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">사용자</th>
                    <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">IP 주소</th>
                    <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">상세</th>
                  </tr>
                </thead>
                <tbody>
                  {failureLogs.length > 0 ? failureLogs.map((log) => (
                    <tr key={log.id} className="border-b border-pwc-gray-100 hover:bg-pwc-gray-50 transition-colors">
                      <td className="py-3 px-6 text-pwc-gray-600">{log.timestamp?.slice(0, 16)}</td>
                      <td className="py-3 px-4 font-medium text-pwc-black">{log.actor}</td>
                      <td className="py-3 px-4 text-pwc-gray-600 font-mono text-xs">{log.ip_address}</td>
                      <td className="py-3 px-4"><span className="text-red-600 text-xs">{log.detail}</span></td>
                    </tr>
                  )) : (
                    <tr><td colSpan={4} className="py-12 text-center text-pwc-gray-400">로그인 실패 기록이 없습니다.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
