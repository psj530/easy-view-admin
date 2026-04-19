"use client";

import { useState, useEffect } from "react";
import { showToast } from "./Toast";
import { groupsApi, companiesApi } from "../lib/api";

interface UserRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const permissionOptions = [
  { key: "data_upload", label: "자료 업로드" },
  { key: "report_view", label: "리포트 열람" },
  { key: "share_print", label: "공유/인쇄" },
  { key: "excel_pdf", label: "Excel/PDF 추출" },
  { key: "comment", label: "코멘트" },
  { key: "user_request", label: "사용자 추가 신청" },
];

interface CompanyGroup {
  id: number;
  name: string;
  company: string;
}

const defaultWelcomeMessage = `안녕하세요,

Easy View 포탈에 초대되었습니다. 아래 링크를 클릭하여 계정을 활성화해 주세요.

감사합니다.
PwC Digital Finance Portal 팀`;

export default function UserRegistrationModal({
  isOpen,
  onClose,
}: UserRegistrationModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [companyNames, setCompanyNames] = useState<string[]>([]);
  const [companySearch, setCompanySearch] = useState("");
  const [subsidiaryId, setSubsidiaryId] = useState<number | null>(null);
  const [subsidiaries, setSubsidiaries] = useState<CompanyGroup[]>([]);
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);
  const [welcomeMessage, setWelcomeMessage] = useState(defaultWelcomeMessage);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (isOpen) {
      groupsApi.list().then((res) => {
        setSubsidiaries(res.groups || []);
      }).catch(() => {});
      companiesApi.names().then((res) => {
        setCompanyNames(res.names || []);
      }).catch(() => {});
    }
  }, [isOpen]);

  const filteredSubs = subsidiaries.filter(
    (s) => s.name.includes(companySearch) || s.company.includes(companySearch)
  );

  const allChecked =
    permissionOptions.every((p) => permissions[p.key]) &&
    permissionOptions.length > 0;

  const toggleAll = () => {
    if (allChecked) {
      setPermissions({});
    } else {
      const all: Record<string, boolean> = {};
      permissionOptions.forEach((p) => { all[p.key] = true; });
      setPermissions(all);
    }
  };

  const togglePermission = (key: string) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = () => {
    if (!email || !name || !company) {
      showToast("필수 항목을 모두 입력해주세요.", "warning");
      return;
    }
    showToast(`${name}님의 계정이 생성되었습니다.`, "success");
    setEmail("");
    setName("");
    setCompany("");
    setCompanySearch("");
    setSubsidiaryId(null);
    setPermissions({});
    setSendWelcomeEmail(true);
    setWelcomeMessage(defaultWelcomeMessage);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-pwc-gray-200 px-6 py-4 rounded-t-xl flex items-center justify-between">
          <h2 className="text-lg font-semibold text-pwc-black">사용자 등록</h2>
          <button onClick={onClose} className="text-pwc-gray-400 hover:text-pwc-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-5">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-pwc-gray-700 mb-1">
                이메일 <span className="text-red-500">*</span>
              </label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@company.com" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-pwc-gray-700 mb-1">
                이름 <span className="text-red-500">*</span>
              </label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-pwc-gray-700 mb-1">
                회사 <span className="text-red-500">*</span>
              </label>
              <select value={company} onChange={(e) => setCompany(e.target.value)} className="input-field">
                <option value="">회사 선택</option>
                {companyNames.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-pwc-gray-700 mb-1">
                자회사 <span className="text-pwc-orange text-xs">(대상법인)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={companySearch}
                  onChange={(e) => { setCompanySearch(e.target.value); setSubsidiaryId(null); }}
                  placeholder="자회사 검색..."
                  className="input-field"
                />
                {companySearch && !subsidiaryId && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-pwc-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {filteredSubs.length > 0 ? filteredSubs.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => { setSubsidiaryId(s.id); setCompanySearch(s.name); }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-pwc-gray-50 transition-colors"
                      >
                        <span className="font-medium text-pwc-black">{s.name}</span>
                        <span className="text-xs text-pwc-gray-500 ml-2">{s.company}</span>
                      </button>
                    )) : (
                      <div className="px-3 py-2 text-sm text-pwc-gray-400">검색 결과 없음</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-pwc-gray-700">상세 권한 설정</label>
              <label className="flex items-center gap-2 text-sm text-pwc-gray-600 cursor-pointer">
                <input type="checkbox" checked={allChecked} onChange={toggleAll} className="w-4 h-4 rounded border-pwc-gray-300 text-pwc-orange focus:ring-pwc-orange" />
                전체 선택
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {permissionOptions.map((perm, i) => (
                <label key={perm.key} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-pwc-gray-200 hover:bg-pwc-gray-50 cursor-pointer transition-colors">
                  <input type="checkbox" checked={!!permissions[perm.key]} onChange={() => togglePermission(perm.key)} className="w-4 h-4 rounded border-pwc-gray-300 text-pwc-orange focus:ring-pwc-orange" />
                  <span className="text-sm text-pwc-gray-700">{i + 1}. {perm.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Welcome Email */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-pwc-gray-700">Welcome 이메일 발송</label>
              <button type="button" onClick={() => setSendWelcomeEmail(!sendWelcomeEmail)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${sendWelcomeEmail ? "bg-pwc-orange" : "bg-pwc-gray-300"}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${sendWelcomeEmail ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>

            {sendWelcomeEmail && (
              <div className="space-y-3">
                <textarea value={welcomeMessage} onChange={(e) => setWelcomeMessage(e.target.value)} rows={5} className="input-field resize-none" />
                <button type="button" onClick={() => setShowPreview(!showPreview)} className="text-sm text-pwc-orange hover:underline">
                  {showPreview ? "미리보기 닫기" : "이메일 미리보기"}
                </button>
                {showPreview && (
                  <div className="border border-pwc-gray-200 rounded-lg p-4 bg-pwc-gray-50">
                    <div className="text-xs text-pwc-gray-500 mb-2">To: {email || "user@company.com"}</div>
                    <div className="text-xs text-pwc-gray-500 mb-3">Subject: Easy View 포탈 계정 초대</div>
                    <div className="border-t border-pwc-gray-200 pt-3">
                      <div className="text-sm text-pwc-gray-700 whitespace-pre-line">{welcomeMessage}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-pwc-gray-200 px-6 py-4 rounded-b-xl flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">취소</button>
          <button onClick={handleSubmit} className="btn-primary">등록</button>
        </div>
      </div>
    </div>
  );
}
