"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

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

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-pwc-black text-white h-14 flex items-center px-6 sticky top-0 z-50">
      {/* PwC Logo */}
      <Link href="/" className="flex items-center mr-8">
        <svg
          width="48"
          height="28"
          viewBox="0 0 48 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <text
            x="0"
            y="22"
            fill="#d04a02"
            fontSize="18"
            fontWeight="bold"
            fontFamily="Helvetica, Arial, sans-serif"
          >
            PwC
          </text>
        </svg>
      </Link>

      {/* Portal Title */}
      <span className="text-sm font-medium text-pwc-gray-300 mr-8 border-l border-pwc-gray-600 pl-8">
        Digital Finance Portal
      </span>

      {/* Navigation */}
      <nav className="flex items-center gap-1 flex-1">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`px-3 py-1.5 rounded text-sm transition-colors ${
              item.active
                ? "bg-pwc-orange text-white font-medium"
                : "text-pwc-gray-300 hover:text-white hover:bg-pwc-gray-700"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* User Avatar Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 hover:bg-pwc-gray-700 rounded-lg px-2 py-1.5 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-pwc-orange flex items-center justify-center text-sm font-medium">
            K
          </div>
          <span className="text-sm text-pwc-gray-300">
            ksyjerry
          </span>
          <svg
            className={`w-4 h-4 text-pwc-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-pwc-gray-200 py-1 text-pwc-black">
            <div className="px-4 py-3 border-b border-pwc-gray-200">
              <p className="text-sm font-medium">ksyjerry</p>
              <p className="text-xs text-pwc-gray-500">ksyjerry@naver.com</p>
            </div>
            <Link
              href="/admin"
              className="block px-4 py-2 text-sm hover:bg-pwc-gray-50 transition-colors"
              onClick={() => setDropdownOpen(false)}
            >
              Admin Portal
            </Link>
            <Link
              href="#"
              className="block px-4 py-2 text-sm hover:bg-pwc-gray-50 transition-colors"
            >
              My Profile
            </Link>
            <Link
              href="#"
              className="block px-4 py-2 text-sm hover:bg-pwc-gray-50 transition-colors"
            >
              Settings
            </Link>
            <div className="border-t border-pwc-gray-200 mt-1 pt-1">
              <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
