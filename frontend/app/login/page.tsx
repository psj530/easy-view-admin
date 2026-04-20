"use client";

import { useState } from "react";
import { useAuth } from "../lib/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
      router.push(savedUser.role === "admin" ? "/admin" : "/mypage");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-pwc-gray-50">
      <div className="w-full max-w-md">
        <div className="card">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-pwc-black mb-2">Easy View Admin</h1>
            <p className="text-sm text-pwc-gray-500">관리자 포털에 로그인하세요</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-pwc-gray-700 mb-1">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="admin@pwc.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-pwc-gray-700 mb-1">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="비밀번호를 입력하세요"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 disabled:opacity-50"
            >
              {loading ? "로그인 중..." : "로그인"}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-pwc-gray-200">
            <p className="text-xs text-pwc-gray-500 font-medium mb-2 text-center">테스트 계정</p>
            <div className="space-y-1.5">
              <button type="button" onClick={() => { setEmail("admin@pwc.com"); setPassword("admin1234!"); }}
                className="w-full text-left px-3 py-2 rounded border border-pwc-gray-200 hover:bg-pwc-gray-50 transition-colors">
                <span className="text-xs font-medium text-pwc-orange">관리자</span>
                <span className="text-xs text-pwc-gray-500 ml-2">admin@pwc.com / admin1234!</span>
              </button>
              <button type="button" onClick={() => { setEmail("park.jm@seah.co.kr"); setPassword("admin1234!"); }}
                className="w-full text-left px-3 py-2 rounded border border-pwc-gray-200 hover:bg-pwc-gray-50 transition-colors">
                <span className="text-xs font-medium text-blue-600">매니저</span>
                <span className="text-xs text-pwc-gray-500 ml-2">park.jm@seah.co.kr / admin1234!</span>
              </button>
              <button type="button" onClick={() => { setEmail("lee.sh@seah.co.kr"); setPassword("admin1234!"); }}
                className="w-full text-left px-3 py-2 rounded border border-pwc-gray-200 hover:bg-pwc-gray-50 transition-colors">
                <span className="text-xs font-medium text-gray-600">뷰어</span>
                <span className="text-xs text-pwc-gray-500 ml-2">lee.sh@seah.co.kr / admin1234!</span>
              </button>
            </div>
            <p className="text-xs text-pwc-gray-400 mt-3 text-center">클릭하면 자동 입력됩니다</p>
          </div>
        </div>
      </div>
    </main>
  );
}
