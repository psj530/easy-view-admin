"use client";

import { useState, useEffect } from "react";
import { usersApi, auditApi } from "../lib/api";

export default function AdminDashboard() {
  const [chartPeriod, setChartPeriod] = useState<"week" | "month">("week");
  const [stats, setStats] = useState({ total: 0, active: 0, companies: 0, recentUsers: [] as Record<string, unknown>[] });
  const [auditStats, setAuditStats] = useState({ daily_stats: [] as { date: string; count: number }[], action_type_stats: [] as { action_type: string; count: number }[], total_logs: 0 });
  const [recentLogs, setRecentLogs] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [usersRes, activeRes, auditStatsRes, logsRes] = await Promise.all([
        usersApi.list(),
        usersApi.list({ status: "active" }),
        auditApi.stats(),
        auditApi.list({ page: "1", page_size: "5" }),
      ]);
      const companies = new Set((usersRes.users as Record<string, unknown>[]).map((u: Record<string, unknown>) => u.company));
      setStats({
        total: usersRes.total,
        active: activeRes.total,
        companies: companies.size,
        recentUsers: (usersRes.users as Record<string, unknown>[]).slice(0, 5),
      });
      setAuditStats(auditStatsRes);
      setRecentLogs(logsRes.logs);
    } catch { /* 로딩 실패 시 빈 상태 유지 */ }
  }

  const statCards = [
    { label: "전체 사용자", value: stats.total, icon: "U", iconBg: "bg-blue-100 text-blue-700" },
    { label: "활성 사용자", value: stats.active, icon: "A", iconBg: "bg-green-100 text-green-700" },
    { label: "고객사", value: stats.companies, icon: "C", iconBg: "bg-purple-100 text-purple-700" },
    { label: "전체 활동 로그", value: auditStats.total_logs, icon: "L", iconBg: "bg-yellow-100 text-yellow-700" },
  ];

  const dailyStats = auditStats.daily_stats;
  const maxVisitors = Math.max(...dailyStats.map((d) => d.count), 1);

  const statusBadge = (status: string) => {
    switch (status) {
      case "active": return <span className="badge-active">활성</span>;
      case "inactive": return <span className="badge-inactive">비활성</span>;
      case "pending": return <span className="badge-pending">대기</span>;
      default: return null;
    }
  };

  const timelineDot = (type: string) => {
    const colors: Record<string, string> = { "로그인": "bg-blue-500", "리포트 열람": "bg-green-500", "권한 변경": "bg-yellow-500", "사용자 비활성화": "bg-red-500" };
    return colors[type] || "bg-gray-400";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-pwc-black">Dashboard</h1>
        <p className="text-sm text-pwc-gray-500 mt-1">Easy View 관리 포탈 현황을 한눈에 확인하세요.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center text-lg font-bold flex-shrink-0`}>
              {card.icon}
            </div>
            <div>
              <p className="text-sm text-pwc-gray-500">{card.label}</p>
              <p className="text-2xl font-bold text-pwc-black">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

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
            {dailyStats.length > 0 ? dailyStats.map((item) => (
              <div key={item.date} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs text-pwc-gray-500 font-medium">{item.count}</span>
                <div className="w-full bg-pwc-orange rounded-t-md bar-animate hover:bg-pwc-orange-light transition-colors cursor-pointer" style={{ height: `${(item.count / maxVisitors) * 160}px` }} title={`${item.date}: ${item.count}건`} />
                <span className="text-xs text-pwc-gray-500">{item.date.slice(5)}</span>
              </div>
            )) : <p className="text-sm text-pwc-gray-400 m-auto">데이터를 불러오는 중...</p>}
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-pwc-black mb-6">활동 유형별 분포</h3>
          <div className="space-y-3">
            {auditStats.action_type_stats.map((s) => (
              <div key={s.action_type} className="flex items-center justify-between text-sm">
                <span className="text-pwc-gray-700">{s.action_type}</span>
                <span className="text-pwc-gray-500 font-medium">{s.count}건</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-pwc-black">등록 사용자</h3>
          </div>
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
                  <tr key={user.id as number} className="border-b border-pwc-gray-100 hover:bg-pwc-gray-50 transition-colors">
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
                    <td className="py-3 px-4"><span className="badge-role">{user.role as string}</span></td>
                    <td className="py-3 px-4">{statusBadge(user.status as string)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-pwc-black mb-4">최근 활동</h3>
          <div className="space-y-4">
            {recentLogs.map((log, i) => (
              <div key={log.id as number} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-2.5 h-2.5 rounded-full ${timelineDot(log.action_type as string)} mt-1.5`} />
                  {i < recentLogs.length - 1 && <div className="w-px flex-1 bg-pwc-gray-200 mt-1" />}
                </div>
                <div className="pb-4">
                  <p className="text-sm text-pwc-gray-700">{log.detail as string}</p>
                  <p className="text-xs text-pwc-gray-400 mt-1">{(log.timestamp as string)?.slice(0, 16)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
