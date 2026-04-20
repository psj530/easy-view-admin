"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../lib/auth";

const navItems = [
  { label: "서비스 소개", href: "/" },
  { label: "리포트", href: "/admin" },
  { label: "자료실", href: "/admin/data-request" },
];

export default function Header() {
  const pathname = usePathname();
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

  const isActive = (href: string) => {
    if (href === "/admin") return pathname?.startsWith("/admin") && !pathname?.startsWith("/admin/data-request");
    if (href === "/admin/data-request") return pathname === "/admin/data-request";
    if (href === "/") return pathname === "/";
    return false;
  };

  const isAdmin = user?.role === "admin";
  const displayName = isAdmin ? "관리자" : user?.name || "";
  const companyLabel = isAdmin ? "감사본부" : user?.company || "";

  return (
    <header className="bg-white sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-[1400px] mx-auto h-[52px] flex items-center px-8">
        {/* PwC Logo */}
        <Link href="/" className="flex-shrink-0">
          <span
            className="select-none"
            style={{
              fontFamily: "'Georgia', 'Times New Roman', serif",
              fontSize: "28px",
              fontWeight: 700,
              color: "#d04a02",
              letterSpacing: "-1.5px",
              lineHeight: 1,
            }}
          >
            pwc
          </span>
        </Link>

        {/* Divider */}
        <div className="w-[1px] h-[28px] bg-gray-300 mx-4 flex-shrink-0" />

        {/* Easy View */}
        <Link href="/" className="flex-shrink-0 mr-10">
          <span
            style={{
              fontSize: "18px",
              fontWeight: 600,
              color: "#1a1a1a",
              letterSpacing: "-0.3px",
            }}
          >
            Easy View
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-2 flex-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`px-4 py-[6px] text-[13px] rounded-[4px] transition-all ${
                  active
                    ? "bg-[#2d2d2d] text-white font-medium"
                    : "text-[#666] hover:text-[#1a1a1a] hover:bg-gray-100"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Side */}
        {isAuthenticated && user ? (
          <div className="flex items-center gap-5 flex-shrink-0">
            {/* 관리자 */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="text-[13px] text-[#1a1a1a] font-medium hover:text-[#d04a02] transition-colors"
              >
                {displayName}
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-52 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-[#1a1a1a]">{displayName}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                    {user.role === "admin" && (
                      <span className="inline-block mt-1.5 text-[10px] bg-[#d04a02] text-white px-1.5 py-0.5 rounded">PwC Internal</span>
                    )}
                  </div>
                  <Link href="/mypage" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setDropdownOpen(false)}>
                    마이페이지
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setDropdownOpen(false)}>
                      Admin Portal
                    </Link>
                  )}
                  <div className="border-t border-gray-100">
                    <button onClick={logout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                      로그아웃
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 감사본부 */}
            <span className="text-[13px] text-[#666]">{companyLabel}</span>

            {/* 로그아웃 */}
            <button
              onClick={logout}
              className="text-[13px] text-[#666] border border-gray-300 rounded-[4px] px-3 py-[4px] hover:bg-gray-50 hover:border-gray-400 transition-all"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="text-[13px] text-[#666] border border-gray-300 rounded-[4px] px-3 py-[4px] hover:bg-gray-50 hover:border-gray-400 transition-all"
          >
            로그인
          </Link>
        )}
      </div>
    </header>
  );
}
