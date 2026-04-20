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
      {/* PwC Logo */}
      <Link href="/" className="flex-shrink-0 mr-2">
        <span style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "24px", fontWeight: "bold", color: "#d04a02", letterSpacing: "-1px" }}>
          pwc
        </span>
      </Link>

      {/* Separator */}
      <div className="w-px h-6 bg-pwc-gray-300 mx-3 flex-shrink-0" />

      {/* Easy View Title */}
      <Link href="/" className="flex-shrink-0 mr-8">
        <span className="text-[15px] font-bold text-pwc-black tracking-tight">Easy View</span>
      </Link>

      {/* Navigation */}
      <nav className="flex items-center gap-1 flex-1">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`px-4 py-1.5 text-[13px] rounded transition-colors ${
              item.active
                ? "bg-pwc-black text-white font-medium"
                : "text-pwc-gray-600 hover:text-pwc-black"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Right side */}
      {isAuthenticated && user ? (
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* 관리자 드롭다운 */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="text-[13px] font-medium text-pwc-black hover:text-pwc-orange transition-colors"
            >
              {displayName}
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-pwc-gray-200 py-1 text-pwc-black z-50">
                <div className="px-4 py-3 border-b border-pwc-gray-200">
                  <p className="text-sm font-medium">{displayName}</p>
                  <p className="text-xs text-pwc-gray-500">{user.email}</p>
                  {user.role === "admin" && (
                    <span className="inline-block mt-1 text-[10px] bg-pwc-orange text-white px-1.5 py-0.5 rounded">PwC Internal</span>
                  )}
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
          <span className="text-[13px] text-pwc-gray-500">{companyLabel}</span>

          {/* 로그아웃 버튼 */}
          <button
            onClick={logout}
            className="text-[13px] text-pwc-gray-600 border border-pwc-gray-300 rounded px-3 py-1 hover:bg-pwc-gray-50 transition-colors"
          >
            로그아웃
          </button>
        </div>
      ) : (
        <Link href="/login" className="text-[13px] text-pwc-gray-600 border border-pwc-gray-300 rounded px-3 py-1 hover:bg-pwc-gray-50 transition-colors">
          로그인
        </Link>
      )}
    </header>
  );
}
