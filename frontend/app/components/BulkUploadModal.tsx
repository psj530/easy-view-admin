"use client";

import { useState } from "react";
import { showToast } from "./Toast";
import { usersApi } from "../lib/api";
import { parseCSV, downloadCSV } from "../lib/export";

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PreviewUser {
  email: string;
  name: string;
  company: string;
  role: string;
  status: "ready" | "success" | "error";
  message?: string;
}

export default function BulkUploadModal({ isOpen, onClose }: BulkUploadModalProps) {
  const [step, setStep] = useState<"upload" | "preview" | "result">("upload");
  const [previewUsers, setPreviewUsers] = useState<PreviewUser[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rows = parseCSV(text);
      if (rows.length === 0) {
        showToast("파일에 데이터가 없습니다. 헤더 행을 확인하세요.", "error");
        return;
      }

      const users: PreviewUser[] = rows.map((row) => ({
        email: row["이메일"] || row["email"] || "",
        name: row["이름"] || row["name"] || "",
        company: row["회사"] || row["company"] || "",
        role: (row["역할"] || row["role"] || "viewer").toLowerCase(),
        status: "ready" as const,
      })).filter((u) => u.email && u.name);

      if (users.length === 0) {
        showToast("유효한 사용자를 찾을 수 없습니다. 열 이름을 확인하세요 (이메일, 이름, 회사)", "error");
        return;
      }

      setPreviewUsers(users);
      setStep("preview");
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    setUploading(true);
    setProgress(0);
    const results = [...previewUsers];

    for (let i = 0; i < results.length; i++) {
      const u = results[i];
      try {
        await usersApi.create({
          email: u.email,
          name: u.name,
          company: u.company,
          role: u.role === "pwc" ? "admin" : "viewer",
          password: "temp1234!",
        });
        results[i] = { ...u, status: "success", message: "등록 완료" };
      } catch (err: unknown) {
        results[i] = { ...u, status: "error", message: err instanceof Error ? err.message : "등록 실패" };
      }
      setProgress(Math.round(((i + 1) / results.length) * 100));
      setPreviewUsers([...results]);
    }

    const success = results.filter((r) => r.status === "success").length;
    const fail = results.filter((r) => r.status === "error").length;
    showToast(`일괄 등록 완료: ${success}명 성공, ${fail}명 실패`, success > 0 ? "success" : "error");
    setUploading(false);
    setStep("result");
  };

  const downloadTemplate = () => {
    downloadCSV(
      [{ 이메일: "user@company.com", 이름: "홍길동", 회사: "SeAH", 역할: "User" }],
      [{ key: "이메일", label: "이메일" }, { key: "이름", label: "이름" }, { key: "회사", label: "회사" }, { key: "역할", label: "역할" }],
      "사용자_등록_템플릿"
    );
  };

  const removeUser = (i: number) => {
    setPreviewUsers((prev) => prev.filter((_, idx) => idx !== i));
  };

  const reset = () => {
    setStep("upload");
    setPreviewUsers([]);
    setProgress(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[85vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-semibold text-pwc-black">일괄 사용자 등록</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          {step === "upload" && (
            <div className="space-y-4">
              <div className="text-center py-8 border-2 border-dashed border-pwc-gray-300 rounded-lg">
                <svg className="w-12 h-12 mx-auto text-pwc-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm text-pwc-gray-600 mb-2">CSV 파일을 업로드하세요</p>
                <p className="text-xs text-pwc-gray-400 mb-4">열: 이메일, 이름, 회사, 역할(PwC/User)</p>
                <div className="flex justify-center gap-3">
                  <label className="btn-primary text-sm cursor-pointer">
                    파일 선택
                    <input type="file" accept=".csv,.txt" onChange={handleFile} className="hidden" />
                  </label>
                  <button onClick={downloadTemplate} className="btn-secondary text-sm">템플릿 다운로드</button>
                </div>
              </div>
              <div className="bg-pwc-gray-50 rounded-lg p-4 text-xs text-pwc-gray-600 space-y-1">
                <p className="font-medium text-pwc-black">CSV 파일 형식 안내</p>
                <p>• 첫 번째 행: 헤더 (이메일, 이름, 회사, 역할)</p>
                <p>• 역할: PwC (@pwc.com만 가능) 또는 User</p>
                <p>• 임시 비밀번호 <b>temp1234!</b>가 자동 설정됩니다</p>
              </div>
            </div>
          )}

          {step === "preview" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-pwc-gray-700"><b>{previewUsers.length}명</b>의 사용자를 등록합니다</p>
                <button onClick={reset} className="text-xs text-pwc-orange hover:underline">다시 선택</button>
              </div>
              <div className="max-h-[400px] overflow-y-auto border border-pwc-gray-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-pwc-gray-200 bg-pwc-gray-50 sticky top-0">
                      <th className="text-left py-2 px-3 font-medium text-pwc-gray-500">이메일</th>
                      <th className="text-left py-2 px-3 font-medium text-pwc-gray-500">이름</th>
                      <th className="text-left py-2 px-3 font-medium text-pwc-gray-500">회사</th>
                      <th className="text-left py-2 px-3 font-medium text-pwc-gray-500">역할</th>
                      <th className="py-2 px-2 w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewUsers.map((u, i) => (
                      <tr key={i} className="border-b border-pwc-gray-100">
                        <td className="py-2 px-3 text-pwc-gray-700">{u.email}</td>
                        <td className="py-2 px-3 text-pwc-gray-700">{u.name}</td>
                        <td className="py-2 px-3 text-pwc-gray-700">{u.company}</td>
                        <td className="py-2 px-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${u.role === "pwc" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}>
                            {u.role === "pwc" ? "PwC" : "User"}
                          </span>
                        </td>
                        <td className="py-2 px-2">
                          <button onClick={() => removeUser(i)} className="text-red-400 hover:text-red-600">✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {step === "result" && (
            <div className="space-y-4">
              {uploading && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-pwc-gray-500 mb-1">
                    <span>등록 중...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-pwc-gray-200 rounded-full h-2">
                    <div className="bg-pwc-orange h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}
              <div className="flex gap-4 mb-4">
                <div className="flex-1 text-center py-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{previewUsers.filter((u) => u.status === "success").length}</p>
                  <p className="text-xs text-green-600">성공</p>
                </div>
                <div className="flex-1 text-center py-3 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">{previewUsers.filter((u) => u.status === "error").length}</p>
                  <p className="text-xs text-red-600">실패</p>
                </div>
              </div>
              <div className="max-h-[300px] overflow-y-auto border border-pwc-gray-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-pwc-gray-200 bg-pwc-gray-50 sticky top-0">
                      <th className="text-left py-2 px-3 font-medium text-pwc-gray-500">이메일</th>
                      <th className="text-left py-2 px-3 font-medium text-pwc-gray-500">이름</th>
                      <th className="text-left py-2 px-3 font-medium text-pwc-gray-500">결과</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewUsers.map((u, i) => (
                      <tr key={i} className="border-b border-pwc-gray-100">
                        <td className="py-2 px-3 text-pwc-gray-700">{u.email}</td>
                        <td className="py-2 px-3 text-pwc-gray-700">{u.name}</td>
                        <td className="py-2 px-3">
                          {u.status === "success" ? (
                            <span className="text-green-600 text-xs">✓ 성공</span>
                          ) : (
                            <span className="text-red-600 text-xs">✕ {u.message}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2 flex-shrink-0">
          {step === "upload" && <button onClick={onClose} className="btn-secondary text-sm">닫기</button>}
          {step === "preview" && (
            <>
              <button onClick={reset} className="btn-secondary text-sm">취소</button>
              <button onClick={handleUpload} disabled={uploading || previewUsers.length === 0} className="btn-primary text-sm">
                {uploading ? "등록 중..." : `${previewUsers.length}명 일괄 등록`}
              </button>
            </>
          )}
          {step === "result" && !uploading && (
            <>
              <button onClick={reset} className="btn-secondary text-sm">추가 등록</button>
              <button onClick={onClose} className="btn-primary text-sm">완료</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
