"use client";

import { useState } from "react";

const dailyVisitors = [
  { date: "04/10", value: 285 },
  { date: "04/11", value: 342 },
  { date: "04/12", value: 198 },
  { date: "04/13", value: 410 },
  { date: "04/14", value: 378 },
  { date: "04/15", value: 456 },
  { date: "04/16", value: 312 },
];

const maxVisitors = Math.max(...dailyVisitors.map((v) => v.value));

interface LogEntry {
  id: number;
  datetime: string;
  actor: string;
  type: "login" | "register" | "permission" | "lock";
  detail: string;
  target: string;
  ip: string;
}

const logEntries: LogEntry[] = [
  {
    id: 1,
    datetime: "2026-04-16 14:32",
    actor: "Sou-Jung Park",
    type: "login",
    detail: "관리자 포탈 로그인",
    target: "-",
    ip: "10.0.1.25",
  },
  {
    id: 2,
    datetime: "2026-04-16 13:15",
    actor: "Yuna Cho",
    type: "register",
    detail: "신규 사용자 등록",
    target: "강하늘 (hn.kang@samsung.com)",
    ip: "10.0.1.42",
  },
  {
    id: 3,
    datetime: "2026-04-16 11:48",
    actor: "Sou-Jung Park",
    type: "permission",
    detail: "역할 변경: Viewer -> Manager",
    target: "김민수 (minsu.kim@samsung.com)",
    ip: "10.0.1.25",
  },
  {
    id: 4,
    datetime: "2026-04-16 10:22",
    actor: "시스템",
    type: "lock",
    detail: "로그인 5회 실패 - 자동 잠금",
    target: "박준형 (jh.park@skgroup.com)",
    ip: "192.168.1.105",
  },
  {
    id: 5,
    datetime: "2026-04-16 09:15",
    actor: "Dong-Yeon Yoo",
    type: "login",
    detail: "관리자 포탈 로그인",
    target: "-",
    ip: "10.0.1.88",
  },
  {
    id: 6,
    datetime: "2026-04-15 17:30",
    actor: "Yuna Cho",
    type: "register",
    detail: "신규 사용자 등록",
    target: "오지영 (jy.oh@lgcns.com)",
    ip: "10.0.1.42",
  },
  {
    id: 7,
    datetime: "2026-04-15 15:12",
    actor: "Sou-Jung Park",
    type: "permission",
    detail: "그룹 변경: Finance -> Tax",
    target: "이서연 (sy.lee@lgcns.com)",
    ip: "10.0.1.25",
  },
  {
    id: 8,
    datetime: "2026-04-15 14:08",
    actor: "시스템",
    type: "lock",
    detail: "비밀번호 만료 - 계정 잠금",
    target: "송태양 (ty.song@kakao.com)",
    ip: "-",
  },
  {
    id: 9,
    datetime: "2026-04-15 10:45",
    actor: "Hye-Jin Kim",
    type: "login",
    detail: "관리자 포탈 로그인",
    target: "-",
    ip: "10.0.1.55",
  },
  {
    id: 10,
    datetime: "2026-04-14 16:20",
    actor: "Sou-Jung Park",
    type: "register",
    detail: "신규 사용자 등록",
    target: "배수진 (sj.bae@hyundai.com)",
    ip: "10.0.1.25",
  },
];

const typeBadge = (type: LogEntry["type"]) => {
  const map: Record<
    string,
    { label: string; cls: string }
  > = {
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
  const s = map[type];
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

  const filtered =
    typeFilter === "all"
      ? logEntries
      : logEntries.filter((l) => l.type === typeFilter);

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
              onChange={(e) => setTypeFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">전체</option>
              <option value="login">로그인</option>
              <option value="register">등록</option>
              <option value="permission">권한변경</option>
              <option value="lock">잠금</option>
            </select>
          </div>
          <button className="btn-primary h-[38px]">조회</button>
        </div>
      </div>

      {/* Daily Visitors Chart */}
      <div className="card">
        <h3 className="font-semibold text-pwc-black mb-6">일별 방문자 수</h3>
        <div className="flex items-end gap-6 h-48">
          {dailyVisitors.map((item) => (
            <div
              key={item.date}
              className="flex-1 flex flex-col items-center gap-2"
            >
              <span className="text-xs text-pwc-gray-500 font-medium">
                {item.value}
              </span>
              <div
                className="w-full bg-pwc-orange rounded-t-md bar-animate hover:bg-pwc-orange-light transition-colors cursor-pointer"
                style={{
                  height: `${(item.value / maxVisitors) * 160}px`,
                }}
                title={`${item.date}: ${item.value}명`}
              />
              <span className="text-xs text-pwc-gray-500">{item.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Trail Table */}
      <div className="card overflow-hidden p-0">
        <div className="px-6 py-4 border-b border-pwc-gray-200 bg-pwc-gray-50">
          <h3 className="font-semibold text-pwc-black">변경 이력</h3>
        </div>
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
              {filtered.map((log) => (
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
              {filtered.length === 0 && (
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
      </div>
    </div>
  );
}
