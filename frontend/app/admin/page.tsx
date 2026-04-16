"use client";

import { useState } from "react";

const statCards = [
  {
    label: "전체 사용자",
    value: "4,521",
    change: "+12%",
    changeUp: true,
    icon: "U",
    iconBg: "bg-blue-100 text-blue-700",
  },
  {
    label: "활성 사용자",
    value: "3,847",
    change: "+8%",
    changeUp: true,
    icon: "A",
    iconBg: "bg-green-100 text-green-700",
  },
  {
    label: "고객사",
    value: "156",
    change: "+3",
    changeUp: true,
    icon: "C",
    iconBg: "bg-purple-100 text-purple-700",
  },
  {
    label: "로그인 실패",
    value: "14",
    change: "-5",
    changeUp: false,
    icon: "F",
    iconBg: "bg-red-100 text-red-700",
  },
];

const weeklyVisitors = [
  { day: "월", value: 320 },
  { day: "화", value: 450 },
  { day: "수", value: 380 },
  { day: "목", value: 520 },
  { day: "금", value: 490 },
  { day: "토", value: 180 },
  { day: "일", value: 120 },
];

const roleDistribution = [
  { role: "Admin", count: 45, color: "#d04a02", pct: 10 },
  { role: "Manager", count: 312, color: "#3b82f6", pct: 25 },
  { role: "Viewer", count: 580, color: "#22c55e", pct: 40 },
  { role: "Editor", count: 210, color: "#a855f7", pct: 25 },
];

const recentUsers = [
  {
    name: "김민수",
    email: "minsu.kim@samsung.com",
    company: "삼성전자",
    role: "Manager",
    status: "active",
    date: "2026-04-15",
  },
  {
    name: "이서연",
    email: "sy.lee@lgcns.com",
    company: "LG CNS",
    role: "Viewer",
    status: "active",
    date: "2026-04-15",
  },
  {
    name: "박준형",
    email: "jh.park@skgroup.com",
    company: "SK그룹",
    role: "Editor",
    status: "pending",
    date: "2026-04-14",
  },
  {
    name: "최유진",
    email: "yj.choi@hyundai.com",
    company: "현대자동차",
    role: "Admin",
    status: "active",
    date: "2026-04-14",
  },
  {
    name: "정다은",
    email: "de.jung@posco.com",
    company: "포스코",
    role: "Viewer",
    status: "inactive",
    date: "2026-04-13",
  },
];

const activityTimeline = [
  {
    time: "14:32",
    text: "김민수님이 Finance 리포트에 접근했습니다.",
    type: "info",
  },
  {
    time: "13:15",
    text: "이서연님의 계정이 활성화되었습니다.",
    type: "success",
  },
  {
    time: "11:48",
    text: "박준형님이 사용자 추가를 신청했습니다.",
    type: "warning",
  },
  {
    time: "10:22",
    text: "최유진님이 비밀번호를 변경했습니다.",
    type: "info",
  },
  {
    time: "09:05",
    text: "정다은님의 로그인이 3회 실패했습니다.",
    type: "error",
  },
];

const maxVisitors = Math.max(...weeklyVisitors.map((v) => v.value));

export default function AdminDashboard() {
  const [chartPeriod, setChartPeriod] = useState<"week" | "month">("week");

  const statusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <span className="badge-active">활성</span>;
      case "inactive":
        return <span className="badge-inactive">비활성</span>;
      case "pending":
        return <span className="badge-pending">대기</span>;
      default:
        return null;
    }
  };

  const timelineDot = (type: string) => {
    const colors: Record<string, string> = {
      info: "bg-blue-500",
      success: "bg-green-500",
      warning: "bg-yellow-500",
      error: "bg-red-500",
    };
    return colors[type] || "bg-gray-400";
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-pwc-black">Dashboard</h1>
        <p className="text-sm text-pwc-gray-500 mt-1">
          Easy View 관리 포탈 현황을 한눈에 확인하세요.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="card flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-xl ${card.iconBg} flex items-center justify-center text-lg font-bold flex-shrink-0`}
            >
              {card.icon}
            </div>
            <div>
              <p className="text-sm text-pwc-gray-500">{card.label}</p>
              <p className="text-2xl font-bold text-pwc-black">{card.value}</p>
              <p
                className={`text-xs ${card.changeUp ? "text-green-600" : "text-red-600"}`}
              >
                {card.change} vs 지난주
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Visitors Bar Chart */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-pwc-black">주간 방문자 추이</h3>
            <div className="flex gap-1 bg-pwc-gray-100 rounded-lg p-1">
              <button
                onClick={() => setChartPeriod("week")}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  chartPeriod === "week"
                    ? "bg-white shadow text-pwc-black"
                    : "text-pwc-gray-500"
                }`}
              >
                주간
              </button>
              <button
                onClick={() => setChartPeriod("month")}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  chartPeriod === "month"
                    ? "bg-white shadow text-pwc-black"
                    : "text-pwc-gray-500"
                }`}
              >
                월간
              </button>
            </div>
          </div>
          <div className="flex items-end gap-4 h-48">
            {weeklyVisitors.map((item) => (
              <div
                key={item.day}
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
                  title={`${item.day}: ${item.value}명`}
                />
                <span className="text-xs text-pwc-gray-500">{item.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Role Distribution Donut */}
        <div className="card">
          <h3 className="font-semibold text-pwc-black mb-6">역할 분포</h3>
          <div className="flex justify-center mb-6">
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                {(() => {
                  let offset = 0;
                  return roleDistribution.map((r) => {
                    const dash = r.pct;
                    const gap = 100 - dash;
                    const el = (
                      <circle
                        key={r.role}
                        cx="18"
                        cy="18"
                        r="14"
                        fill="none"
                        stroke={r.color}
                        strokeWidth="5"
                        strokeDasharray={`${dash} ${gap}`}
                        strokeDashoffset={-offset}
                        strokeLinecap="round"
                      />
                    );
                    offset += dash;
                    return el;
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-pwc-black">1,147</span>
                <span className="text-xs text-pwc-gray-500">총 사용자</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {roleDistribution.map((r) => (
              <div key={r.role} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: r.color }}
                  />
                  <span className="text-pwc-gray-700">{r.role}</span>
                </div>
                <span className="text-pwc-gray-500">{r.count}명</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Users Table */}
        <div className="card lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-pwc-black">최근 등록 사용자</h3>
            <button className="text-sm text-pwc-orange hover:underline">
              전체 보기
            </button>
          </div>
          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-pwc-gray-200">
                  <th className="text-left py-3 px-6 font-medium text-pwc-gray-500">
                    사용자
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">
                    회사
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">
                    역할
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">
                    상태
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">
                    등록일
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user) => (
                  <tr
                    key={user.email}
                    className="border-b border-pwc-gray-100 hover:bg-pwc-gray-50 transition-colors"
                  >
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-pwc-orange flex items-center justify-center text-white text-xs font-medium">
                          {user.name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-pwc-black">
                            {user.name}
                          </p>
                          <p className="text-xs text-pwc-gray-500">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-pwc-gray-700">
                      {user.company}
                    </td>
                    <td className="py-3 px-4">
                      <span className="badge-role">{user.role}</span>
                    </td>
                    <td className="py-3 px-4">{statusBadge(user.status)}</td>
                    <td className="py-3 px-4 text-pwc-gray-500">
                      {user.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="card">
          <h3 className="font-semibold text-pwc-black mb-4">최근 활동</h3>
          <div className="space-y-4">
            {activityTimeline.map((item, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${timelineDot(item.type)} mt-1.5`}
                  />
                  {i < activityTimeline.length - 1 && (
                    <div className="w-px flex-1 bg-pwc-gray-200 mt-1" />
                  )}
                </div>
                <div className="pb-4">
                  <p className="text-sm text-pwc-gray-700">{item.text}</p>
                  <p className="text-xs text-pwc-gray-400 mt-1">
                    오늘 {item.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
