"use client";

import { useState, useEffect } from "react";
import { usersApi, auditApi } from "../lib/api";

export default function AdminDashboard() {
  const [chartPeriod, setChartPeriod] = useState<"week" | "month">("week");
  const [stats, setStats] = useState({ total: 0, active: 0, companies: 0, recentUsers: [] as Record<string, unknown>[] });
  const [auditStats, setAuditStats] = useState({ daily_stats: [] as { date: string; count: number }[], action_type_stats: [] as { action_type: string; count: number }[], total_logs: 0 });
  const [recentLogs, setRecentLogs] = useState<Record<string, unknown>[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const usersRes = await usersApi.list().catch(() => ({ users: [], total: 0 }));
    const activeRes = await usersApi.list({ status: "active" }).catch(() => ({ users: [], total: 0 }));
    const auditStatsRes = await auditApi.stats().catch(() => ({ daily_stats: [], action_type_stats: [], total_logs: 0 }));
    const logsRes = await auditApi.list({ page: "1", page_size: "5" }).catch(() => ({ logs: [] }));

    const companies = new Set((usersRes.users as Record<string, unknown>[]).map((u: Record<string, unknown>) => u.company));
    setStats({ total: usersRes.total, active: activeRes.total, companies: companies.size, recentUsers: (usersRes.users as Record<string, unknown>[]).slice(0, 5) });
    setAuditStats(auditStatsRes);
    setRecentLogs(logsRes.logs || []);
    setLoaded(true);
  }

  const dailyStats = auditStats.daily_stats;
  const maxBar = Math.max(...dailyStats.map((d) => d.count), 1);

  const roleLabel = (r: string) => (r === "admin" || r === "manager") ? "PwC" : "User";
  const roleCls = (r: string) => (r === "admin" || r === "manager") ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700";

  const statusBadge = (s: string) => {
    const m: Record<string, { c: string; l: string }> = { active: { c: "badge-active", l: "활성" }, inactive: { c: "badge-inactive", l: "비활성" }, pending: { c: "badge-pending", l: "대기" } };
    const x = m[s]; return x ? <span className={x.c}>{x.l}</span> : null;
  };

  const dotColor = (t: string) => {
    const m: Record<string, string> = { "로그인": "bg-blue-500", "리포트 열람": "bg-green-500", "권한 변경": "bg-yellow-500", "사용자 비활성화": "bg-red-500", "사용자 생성": "bg-purple-500" };
    return m[t] || "bg-gray-400";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/pwc-logo.png" alt="PwC" style={{ height: 28 }} />
        <div>
          <h1 className="text-2xl font-bold text-pwc-black">Dashboard</h1>
          <p className="text-sm text-pwc-gray-500 mt-1">Easy View 관리 포탈 현황을 한눈에 확인하세요.</p>
        </div>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "전체 사용자", value: stats.total, color: "text-pwc-black", border: "border-l-4 border-l-pwc-orange" },
          { label: "활성 사용자", value: stats.active, color: "text-green-600", border: "border-l-4 border-l-green-500" },
          { label: "고객사", value: stats.companies, color: "text-purple-600", border: "border-l-4 border-l-purple-500" },
          { label: "전체 활동 로그", value: auditStats.total_logs, color: "text-yellow-600", border: "border-l-4 border-l-yellow-500" },
        ].map((card) => (
          <div key={card.label} className={`card ${card.border}`}>
            <p className="text-xs text-pwc-gray-500 mb-1">{card.label}</p>
            <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* 차트 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-pwc-black">일별 활동 추이</h3>
            <div className="flex gap-1 bg-pwc-gray-100 rounded-lg p-1">
              <button onClick={() => setChartPeriod("week")} className={`px-3 py-1 rounded text-xs font-medium transition-colors ${chartPeriod === "week" ? "bg-white shadow text-pwc-black" : "text-pwc-gray-500"}`}>주간</button>
              <button onClick={() => setChartPeriod("month")} className={`px-3 py-1 rounded text-xs font-medium transition-colors ${chartPeriod === "month" ? "bg-white shadow text-pwc-black" : "text-pwc-gray-500"}`}>월간</button>
            </div>
          </div>
          <div className="flex items-end gap-4 h-48">
            {!loaded ? (
              <p className="text-sm text-pwc-gray-400 m-auto">로딩 중...</p>
            ) : dailyStats.length > 0 ? dailyStats.map((item) => (
              <div key={item.date} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs text-pwc-gray-500 font-medium">{item.count}</span>
                <div className="w-full bg-pwc-orange rounded-t-md bar-animate hover:bg-pwc-orange-light transition-colors cursor-pointer" style={{ height: `${(item.count / maxBar) * 160}px` }} title={`${item.date}: ${item.count}건`} />
                <span className="text-xs text-pwc-gray-500">{item.date.slice(5)}</span>
              </div>
            )) : (
              <p className="text-sm text-pwc-gray-400 m-auto">최근 7일간 활동 기록이 없습니다.</p>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-pwc-black mb-6">활동 유형별 분포</h3>
          {!loaded ? (
            <p className="text-sm text-pwc-gray-400">로딩 중...</p>
          ) : auditStats.action_type_stats.length > 0 ? (
            <div className="space-y-3">
              {auditStats.action_type_stats.map((s) => (
                <div key={s.action_type} className="flex items-center justify-between text-sm">
                  <span className="text-pwc-gray-700">{s.action_type}</span>
                  <span className="text-pwc-gray-500 font-medium">{s.count}건</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-pwc-gray-400">활동 기록이 없습니다.</p>
          )}
        </div>
      </div>

      {/* 사용자 + 최근 활동 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2 overflow-hidden">
          <h3 className="font-semibold text-pwc-black mb-4">등록 사용자</h3>
          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-pwc-gray-200">
                  <th className="text-left py-3 px-6 font-medium text-pwc-gray-500">사용자</th>
                  <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">회사</th>
                  <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">역할</th>
                  <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">상태</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentUsers.map((user) => (
                  <tr key={user.id as number} className="border-b border-pwc-gray-100 hover:bg-pwc-gray-50">
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-pwc-orange flex items-center justify-center text-white text-xs font-medium">{(user.name as string)[0]}</div>
                        <div>
                          <p className="font-medium text-pwc-black">{user.name as string}</p>
                          <p className="text-xs text-pwc-gray-500">{user.email as string}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-pwc-gray-700">{user.company as string}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${roleCls(user.role as string)}`}>{roleLabel(user.role as string)}</span>
                    </td>
                    <td className="py-3 px-4">{statusBadge(user.status as string)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-pwc-black mb-4">최근 활동</h3>
          {!loaded ? (
            <p className="text-sm text-pwc-gray-400">로딩 중...</p>
          ) : recentLogs.length > 0 ? (
            <div className="space-y-4">
              {recentLogs.map((log, i) => (
                <div key={log.id as number} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-2.5 h-2.5 rounded-full ${dotColor(log.action_type as string)} mt-1.5`} />
                    {i < recentLogs.length - 1 && <div className="w-px flex-1 bg-pwc-gray-200 mt-1" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm text-pwc-gray-700">{log.detail as string}</p>
                    <p className="text-xs text-pwc-gray-400 mt-1">{(log.timestamp as string)?.slice(0, 16)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-pwc-gray-400">최근 활동이 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
}
