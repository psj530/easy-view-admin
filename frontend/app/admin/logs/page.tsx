"use client";

import { useState, useEffect, useCallback } from "react";
import { auditApi } from "../../lib/api";

interface LogEntry {
  id: number;
  datetime: string;
  actor: string;
  type: "login" | "register" | "permission" | "lock";
  detail: string;
  target: string;
  ip: string;
}

interface DailyStat {
  date: string;
  count: number;
}

const typeBadge = (type: LogEntry["type"]) => {
  const map: Record<string, { label: string; cls: string }> = {
    login: {
      label: "로그인",
      cls: "bg-green-100 text-green-700",
    },
    register: {
      label: "등록",
      cls: "bg-blue-100 text-blue-700",
    },
    permission: {
      label: "권한변경",
      cls: "bg-orange-100 text-orange-700",
    },
    lock: {
      label: "잠금",
      cls: "bg-red-100 text-red-700",
    },
  };
  const s = map[type] || { label: type, cls: "bg-gray-100 text-gray-700" };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.cls}`}
    >
      {s.label}
    </span>
  );
};

export default function LogsPage() {
  const [startDate, setStartDate] = useState("2026-04-10");
  const [endDate, setEndDate] = useState("2026-04-16");
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {
        page: String(page),
        page_size: String(pageSize),
      };
      if (typeFilter !== "all") params.action_type = typeFilter;
      if (searchQuery) params.search = searchQuery;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const data = await auditApi.list(params);
      setLogs(data.logs || []);
      setTotalLogs(data.total || 0);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, typeFilter, searchQuery, startDate, endDate]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await auditApi.stats();
      setDailyStats(data.daily_stats || []);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
      setDailyStats([]);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleSearch = () => {
    setPage(1);
    // fetchLogs will be triggered by the page/dep change via useEffect
  };

  const maxVisitors = dailyStats.length > 0
    ? Math.max(...dailyStats.map((v) => v.count))
    : 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-pwc-black">로그/방문이력</h1>
        <p className="text-sm text-pwc-gray-500 mt-1">
          시스템 접근 기록과 주요 변경 이력을 확인합니다.
        </p>
      </div>

      {/* Date Range Filter */}
      <div className="card">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-medium text-pwc-gray-500 mb-1">
              시작일
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-pwc-gray-500 mb-1">
              종료일
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-pwc-gray-500 mb-1">
              유형
            </label>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="input-field"
            >
              <option value="all">전체</option>
              <option value="login">로그인</option>
              <option value="register">등록</option>
              <option value="permission">권한변경</option>
              <option value="lock">잠금</option>
            </select>
          </div>
          <button className="btn-primary h-[38px]" onClick={handleSearch}>
            조회
          </button>
        </div>
      </div>

      {/* Daily Visitors Chart */}
      <div className="card">
        <h3 className="font-semibold text-pwc-black mb-6">일별 방문자 수</h3>
        {statsLoading ? (
          <div className="flex items-center justify-center h-48 text-pwc-gray-400">
            로딩 중...
          </div>
        ) : dailyStats.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-pwc-gray-400">
            데이터가 없습니다.
          </div>
        ) : (
          <div className="flex items-end gap-6 h-48">
            {dailyStats.map((item) => (
              <div
                key={item.date}
                className="flex-1 flex flex-col items-center gap-2"
              >
                <span className="text-xs text-pwc-gray-500 font-medium">
                  {item.count}
                </span>
                <div
                  className="w-full bg-pwc-orange rounded-t-md bar-animate hover:bg-pwc-orange-light transition-colors cursor-pointer"
                  style={{
                    height: `${(item.count / maxVisitors) * 160}px`,
                  }}
                  title={`${item.date}: ${item.count}명`}
                />
                <span className="text-xs text-pwc-gray-500">
                  {item.date.length > 5 ? item.date.slice(5).replace("-", "/") : item.date}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Audit Trail Table */}
      <div className="card overflow-hidden p-0">
        <div className="px-6 py-4 border-b border-pwc-gray-200 bg-pwc-gray-50 flex justify-between items-center">
          <h3 className="font-semibold text-pwc-black">
            변경 이력 {!loading && <span className="text-sm font-normal text-pwc-gray-500">({totalLogs}건)</span>}
          </h3>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16 text-pwc-gray-400">
            로딩 중...
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-pwc-gray-200 bg-pwc-gray-50">
                    <th className="text-left py-3 px-6 font-medium text-pwc-gray-500">
                      일시
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">
                      수행자
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">
                      유형
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">
                      상세
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">
                      대상
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">
                      IP
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-pwc-gray-100 hover:bg-pwc-gray-50 transition-colors"
                    >
                      <td className="py-3 px-6 text-pwc-gray-600 whitespace-nowrap">
                        {log.datetime}
                      </td>
                      <td className="py-3 px-4 font-medium text-pwc-black">
                        {log.actor}
                      </td>
                      <td className="py-3 px-4">{typeBadge(log.type)}</td>
                      <td className="py-3 px-4 text-pwc-gray-700">{log.detail}</td>
                      <td className="py-3 px-4 text-pwc-gray-600">{log.target}</td>
                      <td className="py-3 px-4 text-pwc-gray-500 font-mono text-xs">
                        {log.ip}
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-12 text-center text-pwc-gray-400"
                      >
                        해당 조건의 로그가 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 py-4 border-t border-pwc-gray-200">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 text-sm rounded border border-pwc-gray-200 disabled:opacity-40 hover:bg-pwc-gray-50"
                >
                  이전
                </button>
                <span className="text-sm text-pwc-gray-600">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 text-sm rounded border border-pwc-gray-200 disabled:opacity-40 hover:bg-pwc-gray-50"
                >
                  다음
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
