"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/auth";
import { showToast } from "../components/Toast";
import { requestsApi } from "../lib/api";

interface Request {
  id: number; requester_name: string; target_name: string; target_email: string;
  reason: string | null; status: string; created_at: string | null;
}

export default function MyPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"profile" | "request" | "myRequests">("profile");

  // 프로필
  const [name, setName] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  // 사용자 추가 신청
  const [targetName, setTargetName] = useState("");
  const [targetEmail, setTargetEmail] = useState("");
  const [reason, setReason] = useState("");
  const [requestSaving, setRequestSaving] = useState(false);

  // 내 신청 내역
  const [myRequests, setMyRequests] = useState<Request[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push("/login");
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) setName(user.name);
  }, [user]);

  useEffect(() => {
    if (activeTab === "myRequests" && isAuthenticated) {
      setRequestsLoading(true);
      requestsApi.list().then((res) => setMyRequests(res.requests || [])).catch(() => {}).finally(() => setRequestsLoading(false));
    }
  }, [activeTab, isAuthenticated]);

  const saveProfile = async () => {
    if (!name.trim()) { showToast("이름을 입력하세요.", "warning"); return; }
    setProfileSaving(true);
    try {
      // API로 이름 변경 (추후 사진 업로드도 추가 가능)
      const { usersApi } = await import("../lib/api");
      await usersApi.update(user!.id, { name });
      showToast("프로필이 저장되었습니다.", "success");
      // localStorage 업데이트
      const saved = JSON.parse(localStorage.getItem("user") || "{}");
      saved.name = name;
      localStorage.setItem("user", JSON.stringify(saved));
    } catch (e: unknown) { showToast(e instanceof Error ? e.message : "저장 실패", "error"); }
    finally { setProfileSaving(false); }
  };

  const submitRequest = async () => {
    if (!targetName.trim() || !targetEmail.trim()) { showToast("이름과 이메일을 입력하세요.", "warning"); return; }
    setRequestSaving(true);
    try {
      await requestsApi.create({ target_name: targetName, target_email: targetEmail, reason: reason || undefined });
      showToast(`${targetName}님의 사용자 추가가 신청되었습니다.`, "success");
      setTargetName(""); setTargetEmail(""); setReason("");
    } catch (e: unknown) { showToast(e instanceof Error ? e.message : "신청 실패", "error"); }
    finally { setRequestSaving(false); }
  };

  if (authLoading || !user) return <div className="flex items-center justify-center min-h-[calc(100vh-52px)]"><p className="text-pwc-gray-400">로딩 중...</p></div>;

  const statusBadge = (s: string) => {
    const m: Record<string, { c: string; l: string }> = { pending: { c: "bg-yellow-100 text-yellow-700", l: "대기" }, approved: { c: "bg-green-100 text-green-700", l: "승인" }, rejected: { c: "bg-red-100 text-red-700", l: "반려" } };
    const x = m[s]; return x ? <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${x.c}`}>{x.l}</span> : null;
  };

  const tabs = [
    { key: "profile" as const, label: "내 정보" },
    { key: "request" as const, label: "사용자 추가 신청" },
    { key: "myRequests" as const, label: "신청 내역" },
  ];

  return (
    <div className="max-w-3xl mx-auto py-8 px-6">
      <h1 className="text-2xl font-bold text-pwc-black mb-1">마이페이지</h1>
      <p className="text-sm text-pwc-gray-500 mb-6">내 정보를 관리하고, 사용자 추가를 신청할 수 있습니다.</p>

      {/* Tabs */}
      <div className="border-b border-pwc-gray-200 mb-6">
        <div className="flex gap-0">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key ? "border-pwc-orange text-pwc-orange" : "border-transparent text-pwc-gray-500 hover:text-pwc-gray-700"}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 내 정보 */}
      {activeTab === "profile" && (
        <div className="card max-w-lg">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-pwc-orange flex items-center justify-center text-white text-2xl font-bold">
              {user.name[0]}
            </div>
            <div>
              <p className="text-lg font-semibold text-pwc-black">{user.name}</p>
              <p className="text-sm text-pwc-gray-500">{user.email}</p>
              <div className="flex gap-2 mt-1">
                <span className="badge-role">{user.role}</span>
                <span className="text-xs text-pwc-gray-400">{user.company}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-pwc-gray-700 mb-1">이름</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-pwc-gray-700 mb-1">이메일</label>
              <input type="email" value={user.email} disabled className="input-field bg-pwc-gray-50 text-pwc-gray-500" />
              <p className="text-xs text-pwc-gray-400 mt-1">이메일은 관리자만 변경 가능합니다.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-pwc-gray-700 mb-1">회사</label>
              <input type="text" value={user.company} disabled className="input-field bg-pwc-gray-50 text-pwc-gray-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-pwc-gray-700 mb-1">역할</label>
              <input type="text" value={user.role} disabled className="input-field bg-pwc-gray-50 text-pwc-gray-500" />
            </div>
          </div>

          <button onClick={saveProfile} disabled={profileSaving} className="btn-primary mt-6">
            {profileSaving ? "저장 중..." : "프로필 저장"}
          </button>
        </div>
      )}

      {/* 사용자 추가 신청 */}
      {activeTab === "request" && (
        <div className="card max-w-lg">
          <h3 className="font-semibold text-pwc-black mb-4">사용자 추가 신청</h3>
          <p className="text-sm text-pwc-gray-500 mb-4">추가하고자 하는 사용자의 정보를 입력하세요. 관리자 승인 후 계정이 생성됩니다.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-pwc-gray-700 mb-1">대상자 이름 <span className="text-red-500">*</span></label>
              <input type="text" value={targetName} onChange={(e) => setTargetName(e.target.value)} placeholder="홍길동" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-pwc-gray-700 mb-1">대상자 이메일 <span className="text-red-500">*</span></label>
              <input type="email" value={targetEmail} onChange={(e) => setTargetEmail(e.target.value)} placeholder="user@company.com" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-pwc-gray-700 mb-1">신청 사유</label>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="사용자 추가가 필요한 사유를 입력하세요." className="input-field resize-none" />
            </div>
          </div>
          <button onClick={submitRequest} disabled={requestSaving} className="btn-primary mt-6">
            {requestSaving ? "신청 중..." : "추가 신청"}
          </button>
        </div>
      )}

      {/* 신청 내역 */}
      {activeTab === "myRequests" && (
        <div className="card overflow-hidden p-0">
          <div className="px-6 py-4 border-b border-pwc-gray-200 bg-pwc-gray-50">
            <h3 className="font-semibold text-pwc-black">내 신청 내역</h3>
          </div>
          {requestsLoading ? (
            <div className="py-12 text-center text-pwc-gray-400">불러오는 중...</div>
          ) : myRequests.length === 0 ? (
            <div className="py-12 text-center text-pwc-gray-400">신청 내역이 없습니다.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-pwc-gray-200 bg-pwc-gray-50">
                  <th className="text-left py-3 px-6 font-medium text-pwc-gray-500">대상자</th>
                  <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">이메일</th>
                  <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">사유</th>
                  <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">상태</th>
                  <th className="text-left py-3 px-4 font-medium text-pwc-gray-500">신청일</th>
                </tr>
              </thead>
              <tbody>
                {myRequests.map((r) => (
                  <tr key={r.id} className="border-b border-pwc-gray-100 hover:bg-pwc-gray-50">
                    <td className="py-3 px-6 font-medium text-pwc-black">{r.target_name}</td>
                    <td className="py-3 px-4 text-pwc-gray-500 text-xs">{r.target_email}</td>
                    <td className="py-3 px-4 text-pwc-gray-600 text-xs max-w-[200px] truncate">{r.reason || "-"}</td>
                    <td className="py-3 px-4">{statusBadge(r.status)}</td>
                    <td className="py-3 px-4 text-pwc-gray-500 text-xs">{r.created_at?.slice(0, 10)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* 관리자 링크 */}
      {user.role === "admin" && (
        <div className="mt-8 p-4 border border-pwc-orange rounded-lg bg-orange-50">
          <p className="text-sm text-pwc-gray-700">관리자 권한이 있습니다. <a href="/admin" className="text-pwc-orange font-medium hover:underline">Admin Portal →</a></p>
        </div>
      )}
    </div>
  );
}
