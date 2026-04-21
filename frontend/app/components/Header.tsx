"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../lib/auth";

const navItems = [
  { label: "서비스 소개", href: "/" },
  { label: "리포트", href: "#" },
  { label: "자료실", href: "#" },
  { label: "Administration", href: "/admin", adminOnly: true },
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

  const isAdmin = user?.role === "admin";

  const isActive = (href: string) => {
    if (href === "/admin") return pathname?.startsWith("/admin");
    if (href === "/") return pathname === "/";
    return false;
  };

  return (
    <header style={{ background: "#fff", borderBottom: "1px solid #e0e0e0", position: "sticky", top: 0, zIndex: 50 }}>
      <div style={{ height: 50, display: "flex", alignItems: "center", padding: "0 24px" }}>
        {/* hdr-brand */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", marginRight: 40, flexShrink: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/pwc-logo.png" alt="PwC" style={{ height: 24 }} />
          <span style={{
            fontSize: 15,
            fontWeight: 600,
            color: "#222",
            lineHeight: 1,
          }}>
            Easyview
          </span>
        </Link>

        {/* hdr-tabs */}
        <nav style={{ display: "flex", alignItems: "center", gap: 32, flex: 1, height: "100%" }}>
          {navItems.filter((item) => !("adminOnly" in item && item.adminOnly) || isAdmin).map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                style={{
                  fontSize: 14,
                  fontWeight: active ? 600 : 400,
                  color: active ? "#d04a02" : "#888",
                  textDecoration: "none",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  position: "relative",
                  cursor: "pointer",
                  borderBottom: active ? "3px solid #d04a02" : "3px solid transparent",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = "#222"; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = "#888"; }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* hdr-right */}
        {isAuthenticated && user ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }} ref={dropdownRef}>
            <span style={{ fontSize: 13 }}>
              <b style={{ color: "#d04a02" }}>{user.name}</b>
              <span style={{ color: "#888" }}>님, 환영합니다.</span>
            </span>

            {/* hdr-user-icon */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  width: 32, height: 32, borderRadius: "50%",
                  border: "1.5px solid #ccc", background: "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </button>

              {dropdownOpen && (
                <div style={{ position: "absolute", right: 0, top: 40, width: 210, background: "#fff", borderRadius: 8, boxShadow: "0 4px 20px rgba(0,0,0,0.12)", border: "1px solid #e5e7eb", padding: "4px 0", zIndex: 50 }}>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid #f0f0f0" }}>
                    <p style={{ fontSize: 14, fontWeight: 500, color: "#1a1a1a" }}>{user.name}</p>
                    <p style={{ fontSize: 12, color: "#999", marginTop: 2 }}>{user.email}</p>
                    {isAdmin && (
                      <span style={{ display: "inline-block", marginTop: 6, fontSize: 10, background: "#d04a02", color: "#fff", padding: "2px 6px", borderRadius: 4 }}>PwC</span>
                    )}
                  </div>
                  <Link href="/mypage" onClick={() => setDropdownOpen(false)} style={{ display: "block", padding: "8px 16px", fontSize: 13, color: "#555", textDecoration: "none" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#f9fafb"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                    마이페이지
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" onClick={() => setDropdownOpen(false)} style={{ display: "block", padding: "8px 16px", fontSize: 13, color: "#555", textDecoration: "none" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#f9fafb"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                      Admin Portal
                    </Link>
                  )}
                  <div style={{ borderTop: "1px solid #f0f0f0" }}>
                    <button onClick={logout} style={{ width: "100%", textAlign: "left", padding: "8px 16px", fontSize: 13, color: "#dc2626", background: "transparent", border: "none", cursor: "pointer" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#fef2f2"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
                      로그아웃
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <Link href="/login" style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid #ccc", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </Link>
        )}
      </div>
    </header>
  );
}
