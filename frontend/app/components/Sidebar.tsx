"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const sidebarItems = [
  {
    label: "자료 요청",
    href: "#",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    label: "Users",
    href: "/admin/accounts",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
  {
    label: "Site Details",
    href: "/admin",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
      </svg>
    ),
    children: [
      { label: "Dashboard", href: "/admin" },
      { label: "계정 관리", href: "/admin/accounts" },
      { label: "PwC 내부 사용자", href: "/admin/pwc-users" },
      { label: "사용자 추가 신청", href: "/admin/requests" },
      { label: "리포트 접근 권한", href: "/admin/permissions" },
      { label: "역할 정의", href: "/admin/roles" },
      { label: "로그/방문이력", href: "/admin/logs" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-white border-r border-[#e8e8e8] flex-shrink-0 sticky top-[50px] h-[calc(100vh-50px)] overflow-y-auto">
      <nav className="py-4">
        {sidebarItems.map((item) => {
          const isActive = item.href !== "#" && (
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href))
          );
          const hasChildren = "children" in item && item.children;
          const childActive = hasChildren && item.children.some((c) =>
            pathname === c.href || (c.href !== "/admin" && pathname.startsWith(c.href))
          );

          return (
            <div key={item.label}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-5 py-3 text-[13px] transition-colors ${
                  isActive || childActive
                    ? "text-pwc-orange font-semibold bg-orange-50 border-l-3 border-l-pwc-orange"
                    : "text-[#555] hover:bg-gray-50"
                }`}
                style={isActive || childActive ? { borderLeft: "3px solid #d04a02" } : { borderLeft: "3px solid transparent" }}
              >
                <span className={isActive || childActive ? "text-pwc-orange" : "text-[#999]"}>{item.icon}</span>
                {item.label}
              </Link>

              {/* Children (Site Details 하위 메뉴) */}
              {hasChildren && (childActive || pathname === "/admin") && (
                <div className="ml-8 border-l border-[#e8e8e8]">
                  {item.children.map((child) => {
                    const cActive = pathname === child.href ||
                      (child.href !== "/admin" && pathname.startsWith(child.href));
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`block px-4 py-2 text-[12px] transition-colors ${
                          cActive
                            ? "text-pwc-orange font-medium"
                            : "text-[#888] hover:text-[#555]"
                        }`}
                      >
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
