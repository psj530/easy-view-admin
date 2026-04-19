"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

interface SidebarItem {
  label: string;
  href: string;
  dotColor: string;
}

const sidebarItems: SidebarItem[] = [
  { label: "Dashboard", href: "/admin", dotColor: "bg-pwc-orange" },
  {
    label: "고객사 계정 관리",
    href: "/admin/accounts",
    dotColor: "bg-blue-500",
  },
  { label: "그룹 관리", href: "/admin/groups", dotColor: "bg-indigo-500" },
  {
    label: "PwC 내부 사용자",
    href: "/admin/pwc-users",
    dotColor: "bg-purple-500",
  },
  {
    label: "사용자 추가 신청",
    href: "/admin/requests",
    dotColor: "bg-green-500",
  },
  {
    label: "리포트 접근 권한",
    href: "/admin/permissions",
    dotColor: "bg-yellow-500",
  },
  { label: "역할 정의", href: "/admin/roles", dotColor: "bg-pink-500" },
  {
    label: "계정 상태/보안",
    href: "/admin/security",
    dotColor: "bg-red-500",
  },
  {
    label: "자료 요청",
    href: "/admin/data-request",
    dotColor: "bg-cyan-500",
  },
  {
    label: "로그/방문이력",
    href: "/admin/logs",
    dotColor: "bg-teal-500",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-pwc-gray-200 min-h-[calc(100vh-3.5rem)] flex-shrink-0">
      <div className="p-4">
        <h2 className="text-xs font-semibold text-pwc-gray-400 uppercase tracking-wider mb-4 px-3">
          Admin Menu
        </h2>
        <nav className="flex flex-col gap-1">
          {sidebarItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-pwc-orange text-white font-medium"
                    : "text-pwc-gray-700 hover:bg-pwc-gray-50"
                }`}
              >
                <span
                  className={`sidebar-dot ${
                    isActive ? "bg-white" : item.dotColor
                  }`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
