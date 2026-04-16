"use client";

import { useState } from "react";
import { showToast } from "../../components/Toast";

type Tab = "status" | "password" | "failures";

interface AccountRow {
  id: number;
  name: string;
  email: string;
  status: "active" | "inactive" | "locked";
  lastLogin: string;
  failCount: number;
}

const accountData: AccountRow[] = [
  { id: 1, name: "김민수", email: "minsu.kim@samsung.com", status: "active", lastLogin: "2026-04-16 09:32", failCount: 0 },
  { id: 2, name: "이서연", email: "sy.lee@lgcns.com", status: "active", lastLogin: "2026-04-15 14:20", failCount: 1 },
  { id: 3, name: "박준형", email: "jh.park@skgroup.com", status: "locked", lastLogin: "2026-04-14 11:05", failCount: 5 },
  { id: 4, name: "최유진", email: "yj.choi@hyundai.com", status: "active", lastLogin: "2026-04-16 08:15", failCount: 0 },
  { id: 5, name: "정다은", email: "de.jung@posco.com", status: "inactive", lastLogin: "2026-03-28 16:45", failCount: 0 },
  { id: 6, name: "송태양", email: "ty.song@kakao.com", status: "locked", lastLogin: "2026-04-13 10:30", failCount: 3 },
  { id: 7, name: "한지민", email: "jm.han@lotte.com", status: "active", lastLogin: "2026-04-16 10:12", failCount: 0 },
];

const failureLogData = [
  { date: "04/10", count: 3 },
  { date: "04/11", count: 7 },
  { date: "04/12", count: 2 },
  { date: "04/13", count: 12 },
  { date: "04/14", count: 5 },
  { date: "04/15", count: 8 },
  { date: "04/16", count: 4 },
];

const maxFailure = Math.max(...failureLogData.map((f) => f.count));

export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState<Tab>("status");
  const [accounts, setAccounts] = useState(accountData);

  // Password policy state
  const [minLength, setMinLength] = useState(8);
  const [requireUppercase, setRequireUppercase] = useState(true);
  const [requireNumber, setRequireNumber] = useState(true);
  const [requireSpecial, setRequireSpecial] = useState(true);
  const [maxFailAttempts, setMaxFailAttempts] = useState(5);
  const [passwordExpiry, setPasswordExpiry] = useState(90);

  const unlockAccount = (id: number) => {
    setAccounts((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          showToast(`${a.name}님의 계정 잠금이 해제되었습니다.`, "success");
          return { ...a, status: "active" as const, failCount: 0 };
        }
        return a;
      })
    );
  };

  const lockAccount = (id: number) => {
    setAccounts((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          showToast(`${a.name}님의 계정이 잠금되었습니다.`, "warning");
          return { ...a, status: "locked" as const };
        }
        return a;
      })
    );
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { cls: string; label: string }> = {
      active: { cls: "badge-active", label: "활성" },
      inactive: { cls: "badge-inactive", label: "비활성" },
      locked: { cls: "badge-locked", label: "잠금" },
    };
    const s = map[status];
    return s ? <span className={s.cls}>{s.label}</span> : null;
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "status", label: "계정 상태" },
    { key: "password", label: "비밀번호 정책" },
    { key: "failures", label: "로그인 실패 로그" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-pwc-black">계정 상태/보안</h1>
        <p className="text-sm text-pwc-gray-500 mt-1">
          계정 보안 정책과 로그인 상태를 관리합니다.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-pwc-gray-200">
        <div className="flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-pwc-orange text-pwc-orange"
                  : "border-transparent text-pwc-gray-500 hover:text-pwc-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "status" && (
        <div className="card overflow-hidden p-0">
          <div className="px-6 py-4 border-b border-pwc-gray-200 bg-pwc-gray-50">
            <h3 className="font-semibold text-pwc-black">계정 상태 관리</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-pwc-gray-200">
                  <th className="text-left py-3 px-6 font-medium text-pwc-gray-500">
                    사용자
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">
                    상태
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">
                    마지막 로그인
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">
                    실패 횟수
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((acc) => (
                  <tr
                    key={acc.id}
                    className="border-b border-pwc-gray-100 hover:bg-pwc-gray-50 transition-colors"
                  >
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-pwc-orange flex items-center justify-center text-white text-xs font-medium">
                          {acc.name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-pwc-black">
                            {acc.name}
                          </p>
                          <p className="text-xs text-pwc-gray-500">
                            {acc.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">{statusBadge(acc.status)}</td>
                    <td className="py-3 px-4 text-pwc-gray-600">
                      {acc.lastLogin}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-medium ${acc.failCount >= 3 ? "text-red-600" : "text-pwc-gray-600"}`}
                      >
                        {acc.failCount}회
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {acc.status === "locked" ? (
                        <button
                          onClick={() => unlockAccount(acc.id)}
                          className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                        >
                          잠금 해제
                        </button>
                      ) : acc.status === "active" ? (
                        <button
                          onClick={() => lockAccount(acc.id)}
                          className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition-colors"
                        >
                          계정 잠금
                        </button>
                      ) : (
                        <span className="text-xs text-pwc-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "password" && (
        <div className="card max-w-2xl">
          <h3 className="font-semibold text-pwc-black mb-6">
            비밀번호 정책 설정
          </h3>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-pwc-gray-700 mb-1">
                최소 비밀번호 길이
              </label>
              <input
                type="number"
                value={minLength}
                onChange={(e) => setMinLength(Number(e.target.value))}
                min={6}
                max={32}
                className="input-field w-32"
              />
              <p className="text-xs text-pwc-gray-400 mt-1">
                6자 이상 32자 이하
              </p>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requireUppercase}
                  onChange={(e) => setRequireUppercase(e.target.checked)}
                  className="w-4 h-4 rounded border-pwc-gray-300 text-pwc-orange focus:ring-pwc-orange"
                />
                <span className="text-sm text-pwc-gray-700">
                  대문자 포함 필수
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requireNumber}
                  onChange={(e) => setRequireNumber(e.target.checked)}
                  className="w-4 h-4 rounded border-pwc-gray-300 text-pwc-orange focus:ring-pwc-orange"
                />
                <span className="text-sm text-pwc-gray-700">
                  숫자 포함 필수
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requireSpecial}
                  onChange={(e) => setRequireSpecial(e.target.checked)}
                  className="w-4 h-4 rounded border-pwc-gray-300 text-pwc-orange focus:ring-pwc-orange"
                />
                <span className="text-sm text-pwc-gray-700">
                  특수문자 포함 필수
                </span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-pwc-gray-700 mb-1">
                최대 로그인 실패 허용 횟수
              </label>
              <input
                type="number"
                value={maxFailAttempts}
                onChange={(e) => setMaxFailAttempts(Number(e.target.value))}
                min={3}
                max={10}
                className="input-field w-32"
              />
              <p className="text-xs text-pwc-gray-400 mt-1">
                초과 시 자동 계정 잠금
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-pwc-gray-700 mb-1">
                비밀번호 만료 주기 (일)
              </label>
              <input
                type="number"
                value={passwordExpiry}
                onChange={(e) => setPasswordExpiry(Number(e.target.value))}
                min={30}
                max={365}
                className="input-field w-32"
              />
            </div>

            <button
              onClick={() =>
                showToast("비밀번호 정책이 저장되었습니다.", "success")
              }
              className="btn-primary"
            >
              정책 저장
            </button>
          </div>
        </div>
      )}

      {activeTab === "failures" && (
        <div className="space-y-6">
          {/* Failure chart */}
          <div className="card">
            <h3 className="font-semibold text-pwc-black mb-6">
              일별 로그인 실패 추이
            </h3>
            <div className="flex items-end gap-6 h-48">
              {failureLogData.map((item) => (
                <div
                  key={item.date}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <span className="text-xs text-pwc-gray-500 font-medium">
                    {item.count}
                  </span>
                  <div
                    className="w-full bg-red-500 rounded-t-md bar-animate hover:bg-red-400 transition-colors cursor-pointer"
                    style={{
                      height: `${(item.count / maxFailure) * 140}px`,
                    }}
                    title={`${item.date}: ${item.count}건`}
                  />
                  <span className="text-xs text-pwc-gray-500">
                    {item.date}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Failure log table */}
          <div className="card overflow-hidden p-0">
            <div className="px-6 py-4 border-b border-pwc-gray-200 bg-pwc-gray-50">
              <h3 className="font-semibold text-pwc-black">
                최근 로그인 실패 기록
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-pwc-gray-200">
                    <th className="text-left py-3 px-6 font-medium text-pwc-gray-500">
                      시간
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">
                      사용자
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">
                      IP 주소
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">
                      사유
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { time: "2026-04-16 09:45", user: "박준형", ip: "192.168.1.105", reason: "비밀번호 불일치" },
                    { time: "2026-04-16 09:43", user: "박준형", ip: "192.168.1.105", reason: "비밀번호 불일치" },
                    { time: "2026-04-16 09:40", user: "박준형", ip: "192.168.1.105", reason: "비밀번호 불일치" },
                    { time: "2026-04-16 08:22", user: "송태양", ip: "10.0.0.54", reason: "계정 잠금 상태" },
                    { time: "2026-04-15 17:30", user: "Unknown", ip: "203.248.52.10", reason: "존재하지 않는 계정" },
                    { time: "2026-04-15 15:12", user: "송태양", ip: "10.0.0.54", reason: "비밀번호 불일치" },
                    { time: "2026-04-15 14:08", user: "이서연", ip: "172.16.0.33", reason: "비밀번호 불일치" },
                  ].map((log, i) => (
                    <tr
                      key={i}
                      className="border-b border-pwc-gray-100 hover:bg-pwc-gray-50 transition-colors"
                    >
                      <td className="py-3 px-6 text-pwc-gray-600">
                        {log.time}
                      </td>
                      <td className="py-3 px-4 font-medium text-pwc-black">
                        {log.user}
                      </td>
                      <td className="py-3 px-4 text-pwc-gray-600 font-mono text-xs">
                        {log.ip}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-red-600 text-xs">
                          {log.reason}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
