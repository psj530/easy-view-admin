"use client";

import { useState } from "react";

interface PwcUser {
  id: number;
  name: string;
  email: string;
  avatar: string;
  connectRole: string;
  internalRole: "Full Access" | "Standard" | "View Only";
  lastAccess: string;
}

const pwcUsers: PwcUser[] = [
  { id: 1, name: "Sou-Jung Park", email: "soujung.park@pwc.com", avatar: "P", connectRole: "Connect Admin", internalRole: "Full Access", lastAccess: "2026-04-16 10:22" },
  { id: 2, name: "Min-Ho Kang", email: "minho.kang@pwc.com", avatar: "K", connectRole: "Connect Admin", internalRole: "Full Access", lastAccess: "2026-04-16 09:15" },
  { id: 3, name: "Yuna Cho", email: "yuna.cho@pwc.com", avatar: "C", connectRole: "Engagement Lead", internalRole: "Standard", lastAccess: "2026-04-16 08:45" },
  { id: 4, name: "Dong-Yeon Yoo", email: "dongyeon.yoo@pwc.com", avatar: "Y", connectRole: "Staff", internalRole: "View Only", lastAccess: "2026-04-15 17:30" },
  { id: 5, name: "Hye-Jin Kim", email: "hyejin.kim@pwc.com", avatar: "K", connectRole: "Engagement Lead", internalRole: "Standard", lastAccess: "2026-04-16 11:05" },
  { id: 6, name: "Jae-Won Lee", email: "jaewon.lee@pwc.com", avatar: "L", connectRole: "Senior Manager", internalRole: "Standard", lastAccess: "2026-04-15 14:20" },
  { id: 7, name: "Soo-Bin Han", email: "soobin.han@pwc.com", avatar: "H", connectRole: "Staff", internalRole: "View Only", lastAccess: "2026-04-14 16:50" },
  { id: 8, name: "Tae-Hyun Jung", email: "taehyun.jung@pwc.com", avatar: "J", connectRole: "Staff", internalRole: "View Only", lastAccess: "2026-04-15 10:12" },
  { id: 9, name: "Eun-Ji Choi", email: "eunji.choi@pwc.com", avatar: "C", connectRole: "Manager", internalRole: "Standard", lastAccess: "2026-04-16 09:30" },
  { id: 10, name: "Sang-Woo Lim", email: "sangwoo.lim@pwc.com", avatar: "L", connectRole: "Senior Associate", internalRole: "Standard", lastAccess: "2026-04-15 15:40" },
  { id: 11, name: "Ji-Hoon Baek", email: "jihoon.baek@pwc.com", avatar: "B", connectRole: "Staff", internalRole: "View Only", lastAccess: "2026-04-14 11:20" },
  { id: 12, name: "Na-Young Shin", email: "nayoung.shin@pwc.com", avatar: "S", connectRole: "Staff", internalRole: "View Only", lastAccess: "2026-04-13 09:55" },
  { id: 13, name: "Hyun-Woo Oh", email: "hyunwoo.oh@pwc.com", avatar: "O", connectRole: "Manager", internalRole: "Standard", lastAccess: "2026-04-16 08:10" },
  { id: 14, name: "Ye-Rim Song", email: "yerim.song@pwc.com", avatar: "S", connectRole: "Staff", internalRole: "View Only", lastAccess: "2026-04-15 13:25" },
  { id: 15, name: "Woo-Jin Moon", email: "woojin.moon@pwc.com", avatar: "M", connectRole: "Senior Associate", internalRole: "Standard", lastAccess: "2026-04-16 07:55" },
  { id: 16, name: "Da-Hye Kwon", email: "dahye.kwon@pwc.com", avatar: "K", connectRole: "Staff", internalRole: "View Only", lastAccess: "2026-04-14 14:30" },
  { id: 17, name: "Sung-Min Yoon", email: "sungmin.yoon@pwc.com", avatar: "Y", connectRole: "Manager", internalRole: "Standard", lastAccess: "2026-04-15 16:10" },
  { id: 18, name: "Bo-Ra Jang", email: "bora.jang@pwc.com", avatar: "J", connectRole: "Staff", internalRole: "View Only", lastAccess: "2026-04-13 11:45" },
];

type TabKey = "all" | "Full Access" | "Standard" | "View Only";

const roleBadge = (role: string) => {
  const map: Record<string, string> = {
    "Full Access": "bg-red-100 text-red-700",
    Standard: "bg-blue-100 text-blue-700",
    "View Only": "bg-gray-100 text-gray-600",
  };
  return map[role] || "bg-gray-100 text-gray-600";
};

export default function PwcUsersPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  const fullAccessCount = pwcUsers.filter((u) => u.internalRole === "Full Access").length;
  const standardCount = pwcUsers.filter((u) => u.internalRole === "Standard").length;
  const viewOnlyCount = pwcUsers.filter((u) => u.internalRole === "View Only").length;

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: "all", label: "전체", count: pwcUsers.length },
    { key: "Full Access", label: "Full Access", count: fullAccessCount },
    { key: "Standard", label: "Standard", count: standardCount },
    { key: "View Only", label: "View Only", count: viewOnlyCount },
  ];

  const filtered =
    activeTab === "all"
      ? pwcUsers
      : pwcUsers.filter((u) => u.internalRole === activeTab);

  const toggleSelectAll = () => {
    if (selectedUsers.length === filtered.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filtered.map((u) => u.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-pwc-black">PwC 내부 사용자</h1>
        <p className="text-sm text-pwc-gray-500 mt-1">
          PwC 내부 사용자 목록과 역할을 관리합니다.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setSelectedUsers([]);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-pwc-orange text-white"
                : "bg-white text-pwc-gray-600 border border-pwc-gray-200 hover:bg-pwc-gray-50"
            }`}
          >
            {tab.label}{" "}
            <span
              className={`ml-1 ${
                activeTab === tab.key ? "text-white/80" : "text-pwc-gray-400"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="px-6 py-3 border-b border-pwc-gray-200 bg-pwc-gray-50">
          <span className="text-sm text-pwc-gray-600">
            {filtered.length}명
            {selectedUsers.length > 0 && (
              <span className="ml-2 text-pwc-orange">
                ({selectedUsers.length}명 선택)
              </span>
            )}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-pwc-gray-200 bg-pwc-gray-50">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      filtered.length > 0 &&
                      selectedUsers.length === filtered.length
                    }
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-pwc-gray-300 text-pwc-orange focus:ring-pwc-orange"
                  />
                </th>
                <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">
                  사용자
                </th>
                <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">
                  Connect Role
                </th>
                <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">
                  내부 권한
                </th>
                <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">
                  최종 접속
                </th>
                <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">
                  관리
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr
                  key={user.id}
                  className={`border-b border-pwc-gray-100 hover:bg-pwc-gray-50 transition-colors ${
                    selectedUsers.includes(user.id) ? "bg-orange-50" : ""
                  }`}
                >
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleSelect(user.id)}
                      className="w-4 h-4 rounded border-pwc-gray-300 text-pwc-orange focus:ring-pwc-orange"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-pwc-orange flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                        {user.avatar}
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
                    {user.connectRole}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleBadge(user.internalRole)}`}
                    >
                      {user.internalRole}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-pwc-gray-500">
                    {user.lastAccess}
                  </td>
                  <td className="py-3 px-4">
                    <button className="text-xs bg-pwc-gray-100 text-pwc-gray-700 px-3 py-1.5 rounded hover:bg-pwc-gray-200 transition-colors">
                      편집
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-pwc-gray-400"
                  >
                    검색 결과가 없습니다.
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
