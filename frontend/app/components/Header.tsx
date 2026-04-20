"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../lib/auth";

const navItems = [
  { label: "리포트", href: "/admin", active: true },
  { label: "새 리포트", href: "#" },
  { label: "자료실", href: "/admin/data-request" },
  { label: "서비스 소개", href: "/" },
];

export default function Header() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = user?.role === "admin" ? "관리자" : user?.name || "";
  const companyLabel = user?.role === "admin" ? "PwC Administrator" : user?.company || "";

  return (
    <header className="bg-white text-pwc-black h-14 flex items-center px-6 sticky top-0 z-50 border-b border-pwc-gray-200">
      {/* PwC Logo + Easy View */}
      <Link href="/" className="flex items-center mr-6 gap-2">
        <svg width="52" height="28" viewBox="0 0 52 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <text x="0" y="22" fill="#d04a02" fontSize="22" fontWeight="bold" fontFamily="Georgia, serif" letterSpacing="-1">pwc</text>
        </svg>
        <span className="text-pwc-gray-300 text-lg font-light">|</span>
        <span className="text-base font-semibold text-pwc-black tracking-tight">Easy View</span>
      </Link>

      {/* Navigation */}
      <nav className="flex items-center gap-0 flex-1">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`px-4 py-2 text-sm transition-colors rounded ${
              item.active
                ? "bg-pwc-black text-white font-medium"
                : "text-pwc-gray-600 hover:text-pwc-black hover:bg-pwc-gray-50"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Right side */}
      {isAuthenticated && user ? (
        <div className="flex items-center gap-3">
          {/* 관리자 표시 */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 hover:bg-pwc-gray-50 rounded px-2 py-1.5 transition-colors"
            >
              <span className="text-sm font-medium text-pwc-black">{displayName}</span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-pwc-gray-200 py-1 text-pwc-black">
                <div className="px-4 py-3 border-b border-pwc-gray-200">
                  <p className="text-sm font-medium">{displayName}</p>
                  <p className="text-xs text-pwc-gray-500">{user.email}</p>
                </div>
                <Link href="/admin" className="block px-4 py-2 text-sm hover:bg-pwc-gray-50 transition-colors" onClick={() => setDropdownOpen(false)}>
                  Admin Portal
                </Link>
                <div className="border-t border-pwc-gray-200 mt-1 pt-1">
                  <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                    로그아웃
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 소속 표시 */}
          <span className="text-sm text-pwc-gray-500">{companyLabel}</span>

          {/* 로그아웃 버튼 */}
          <button
            onClick={logout}
            className="text-sm text-pwc-gray-600 border border-pwc-gray-300 rounded px-3 py-1 hover:bg-pwc-gray-50 transition-colors"
          >
            로그아웃
          </button>
        </div>
      ) : (
        <Link href="/login" className="text-sm text-pwc-gray-600 border border-pwc-gray-300 rounded px-3 py-1 hover:bg-pwc-gray-50 transition-colors">
          로그인
        </Link>
      )}
    </header>
  );
}
