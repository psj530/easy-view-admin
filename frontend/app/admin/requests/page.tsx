"use client";

import { useState } from "react";
import { showToast } from "../../components/Toast";

interface Request {
  id: number;
  name: string;
  email: string;
  company: string;
  group: string;
  requestDate: string;
  requestedBy: string;
  status: "pending" | "approved" | "rejected";
  reason: string;
}

const initialRequests: Request[] = [
  {
    id: 1,
    name: "강하늘",
    email: "hn.kang@samsung.com",
    company: "삼성전자",
    group: "Finance",
    requestDate: "2026-04-16",
    requestedBy: "김민수",
    status: "pending",
    reason: "신규 프로젝트 참여를 위한 접근 권한 필요",
  },
  {
    id: 2,
    name: "오지영",
    email: "jy.oh@lgcns.com",
    company: "LG CNS",
    group: "Tax",
    requestDate: "2026-04-15",
    requestedBy: "이서연",
    status: "pending",
    reason: "Tax Compliance 리포트 열람 필요",
  },
  {
    id: 3,
    name: "배수진",
    email: "sj.bae@hyundai.com",
    company: "현대자동차",
    group: "Advisory",
    requestDate: "2026-04-14",
    requestedBy: "최유진",
    status: "pending",
    reason: "ESG 리포트 분석 업무 배정",
  },
  {
    id: 4,
    name: "문현식",
    email: "hs.moon@skgroup.com",
    company: "SK그룹",
    group: "Consulting",
    requestDate: "2026-04-13",
    requestedBy: "박준형",
    status: "approved",
    reason: "비용 분석 프로젝트 참여",
  },
  {
    id: 5,
    name: "권도윤",
    email: "dy.kwon@posco.com",
    company: "포스코",
    group: "Finance",
    requestDate: "2026-04-12",
    requestedBy: "정다은",
    status: "rejected",
    reason: "내부통제 리포트 접근 필요 - 권한 부족으로 반려",
  },
];

export default function RequestsPage() {
  const [requests, setRequests] = useState<Request[]>(initialRequests);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  const filtered =
    filter === "all"
      ? requests
      : requests.filter((r) => r.status === filter);

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  const approveRequest = (id: number) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          showToast(`${r.name}님의 신청이 승인되었습니다.`, "success");
          return { ...r, status: "approved" as const };
        }
        return r;
      })
    );
  };

  const rejectRequest = (id: number) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          showToast(`${r.name}님의 신청이 반려되었습니다.`, "warning");
          return { ...r, status: "rejected" as const };
        }
        return r;
      })
    );
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { cls: string; label: string }> = {
      pending: { cls: "badge-pending", label: "대기" },
      approved: { cls: "badge-active", label: "승인" },
      rejected: { cls: "badge-locked", label: "반려" },
    };
    const s = map[status];
    return s ? <span className={s.cls}>{s.label}</span> : null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-pwc-black">
            사용자 추가 신청
          </h1>
          <p className="text-sm text-pwc-gray-500 mt-1">
            사용자 추가 신청 목록을 확인하고 승인/반려 처리합니다.
          </p>
        </div>
        {pendingCount > 0 && (
          <div className="bg-pwc-orange text-white text-sm font-medium px-4 py-2 rounded-lg">
            {pendingCount}건 대기중
          </div>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(
          [
            { key: "all", label: "전체" },
            { key: "pending", label: "대기" },
            { key: "approved", label: "승인" },
            { key: "rejected", label: "반려" },
          ] as const
        ).map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f.key
                ? "bg-pwc-orange text-white"
                : "bg-white text-pwc-gray-600 border border-pwc-gray-200 hover:bg-pwc-gray-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Request Cards */}
      <div className="space-y-4">
        {filtered.map((req) => (
          <div
            key={req.id}
            className="card hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-pwc-orange flex items-center justify-center text-white font-medium flex-shrink-0">
                  {req.name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-pwc-black">
                      {req.name}
                    </h3>
                    {statusBadge(req.status)}
                  </div>
                  <p className="text-sm text-pwc-gray-500">{req.email}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-pwc-gray-500">
                    <span>회사: {req.company}</span>
                    <span>그룹: {req.group}</span>
                    <span>신청자: {req.requestedBy}</span>
                    <span>신청일: {req.requestDate}</span>
                  </div>
                  <p className="text-sm text-pwc-gray-600 mt-2 bg-pwc-gray-50 px-3 py-2 rounded">
                    {req.reason}
                  </p>
                </div>
              </div>

              {req.status === "pending" && (
                <div className="flex gap-2 flex-shrink-0 ml-4">
                  <button
                    onClick={() => approveRequest(req.id)}
                    className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    승인
                  </button>
                  <button
                    onClick={() => rejectRequest(req.id)}
                    className="text-sm bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    반려
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="card text-center py-12 text-pwc-gray-400">
            해당 조건의 신청 내역이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
