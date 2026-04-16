"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../lib/auth";

const navItems = [
  { label: "Our Solutions", href: "#" },
  { label: "Robotic", href: "#" },
  { label: "XBRL", href: "#" },
  { label: "Tax Hub", href: "#" },
  { label: "Easy View", href: "/", active: true },
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
  const displayInitial = user?.role === "admin" ? "A" : (user?.name?.charAt(0) || "");

  return (
    <header className="bg-white text-pwc-black h-14 flex items-center px-6 sticky top-0 z-50 border-b border-pwc-gray-200">
      {/* PwC Logo */}
      <Link href="/" className="flex items-center mr-4">
        <svg width="62" height="28" viewBox="0 0 62 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <text x="0" y="22" fill="#d04a02" fontSize="22" fontWeight="bold" fontFamily="Georgia, serif" letterSpacing="-1">pwc</text>
        </svg>
      </Link>

      {/* Portal Title */}
      <span className="text-sm font-medium text-pwc-black mr-8">
        Digital Finance Portal
      </span>

      {/* Navigation */}
      <nav className="flex items-center gap-1 flex-1">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`px-4 py-1.5 text-sm transition-colors ${
              item.active
                ? "text-pwc-orange font-semibold border-b-2 border-pwc-orange"
                : "text-pwc-gray-600 hover:text-pwc-black"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User Avatar */}
      {isAuthenticated && user ? (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 hover:bg-pwc-gray-50 rounded-lg px-2 py-1.5 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-pwc-gray-700 flex items-center justify-center text-sm font-medium text-white">
              {displayInitial}
            </div>
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
      ) : (
        <Link href="/login" className="text-sm text-pwc-gray-600 hover:text-pwc-black px-3 py-1.5 rounded hover:bg-pwc-gray-50 transition-colors">
          로그인
        </Link>
      )}
    </header>
  );
}
