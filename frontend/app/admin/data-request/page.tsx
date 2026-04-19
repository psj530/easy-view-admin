"use client";

import { useState } from "react";
import { showToast } from "../../components/Toast";

export default function DataRequestPage() {
  const [activeTab, setActiveTab] = useState<"upload" | "request">("upload");
  const [dragOver, setDragOver] = useState(false);

  // 업로드 폼
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDesc, setUploadDesc] = useState("");
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);

  // 요청 폼
  const [requestTitle, setRequestTitle] = useState("");
  const [requestDesc, setRequestDesc] = useState("");
  const [requestDeadline, setRequestDeadline] = useState("");

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    setUploadFiles((prev) => [...prev, ...files]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const submitUpload = () => {
    if (!uploadTitle.trim()) { showToast("제목을 입력해주세요.", "warning"); return; }
    if (uploadFiles.length === 0) { showToast("파일을 선택해주세요.", "warning"); return; }
    showToast(`"${uploadTitle}" 자료가 업로드되었습니다. (${uploadFiles.length}개 파일)`, "success");
    setUploadTitle(""); setUploadDesc(""); setUploadFiles([]);
  };

  const submitRequest = () => {
    if (!requestTitle.trim()) { showToast("제목을 입력해주세요.", "warning"); return; }
    showToast(`"${requestTitle}" 자료 요청이 등록되었습니다.`, "success");
    setRequestTitle(""); setRequestDesc(""); setRequestDeadline("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-pwc-black">자료 요청</h1>
        <p className="text-sm text-pwc-gray-500 mt-1">자료를 업로드하거나 필요한 자료를 요청할 수 있습니다.</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-pwc-gray-200">
        <div className="flex gap-0">
          <button onClick={() => setActiveTab("upload")}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "upload" ? "border-pwc-orange text-pwc-orange" : "border-transparent text-pwc-gray-500 hover:text-pwc-gray-700"}`}>
            자료 업로드
          </button>
          <button onClick={() => setActiveTab("request")}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "request" ? "border-pwc-orange text-pwc-orange" : "border-transparent text-pwc-gray-500 hover:text-pwc-gray-700"}`}>
            자료 요청
          </button>
        </div>
      </div>

      {activeTab === "upload" && (
        <div className="card max-w-2xl">
          <h3 className="font-semibold text-pwc-black mb-4">자료 업로드</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-pwc-gray-700 mb-1">제목 <span className="text-red-500">*</span></label>
              <input type="text" value={uploadTitle} onChange={(e) => setUploadTitle(e.target.value)} placeholder="업로드 자료 제목" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-pwc-gray-700 mb-1">설명</label>
              <textarea value={uploadDesc} onChange={(e) => setUploadDesc(e.target.value)} rows={3} placeholder="자료에 대한 설명을 입력하세요" className="input-field resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-pwc-gray-700 mb-1">파일 선택</label>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragOver ? "border-pwc-orange bg-orange-50" : "border-pwc-gray-300 hover:border-pwc-gray-400"}`}
              >
                <svg className="w-10 h-10 mx-auto text-pwc-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm text-pwc-gray-600 mb-1">파일을 드래그하거나 클릭하여 선택하세요</p>
                <p className="text-xs text-pwc-gray-400">Excel, PDF, CSV 등 모든 파일 형식 지원</p>
                <input type="file" multiple onChange={handleFileSelect} className="hidden" id="file-upload" />
                <label htmlFor="file-upload" className="mt-3 inline-block text-sm text-pwc-orange cursor-pointer hover:underline">파일 선택</label>
              </div>
              {uploadFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  {uploadFiles.map((file, i) => (
                    <div key={i} className="flex items-center justify-between bg-pwc-gray-50 rounded px-3 py-2">
                      <span className="text-sm text-pwc-gray-700 truncate">{file.name} <span className="text-xs text-pwc-gray-400">({(file.size / 1024).toFixed(1)} KB)</span></span>
                      <button onClick={() => removeFile(i)} className="text-red-500 hover:text-red-700 text-xs">삭제</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={submitUpload} className="btn-primary">업로드</button>
          </div>
        </div>
      )}

      {activeTab === "request" && (
        <div className="card max-w-2xl">
          <h3 className="font-semibold text-pwc-black mb-4">자료 요청</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-pwc-gray-700 mb-1">제목 <span className="text-red-500">*</span></label>
              <input type="text" value={requestTitle} onChange={(e) => setRequestTitle(e.target.value)} placeholder="요청 자료 제목" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-pwc-gray-700 mb-1">상세 내용</label>
              <textarea value={requestDesc} onChange={(e) => setRequestDesc(e.target.value)} rows={4} placeholder="필요한 자료에 대한 상세 설명을 입력하세요" className="input-field resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-pwc-gray-700 mb-1">요청 마감일</label>
              <input type="date" value={requestDeadline} onChange={(e) => setRequestDeadline(e.target.value)} className="input-field w-48" />
            </div>
            <button onClick={submitRequest} className="btn-primary">요청 등록</button>
          </div>
        </div>
      )}
    </div>
  );
}
