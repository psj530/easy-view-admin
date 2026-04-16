"use client";

import Link from "next/link";

const features = [
  {
    icon: "R",
    iconBg: "bg-blue-100 text-blue-700",
    title: "실시간 리포트",
    desc: "비감사용역 데이터를 실시간으로 분석하고 인사이트를 확인하세요.",
  },
  {
    icon: "S",
    iconBg: "bg-green-100 text-green-700",
    title: "안전한 데이터 관리",
    desc: "역할 기반 접근 제어와 보안 정책으로 데이터를 안전하게 보호합니다.",
  },
  {
    icon: "C",
    iconBg: "bg-purple-100 text-purple-700",
    title: "협업 도구",
    desc: "팀원들과 리포트를 공유하고 코멘트를 통해 실시간으로 소통하세요.",
  },
];

const stats = [
  { value: "4,500+", label: "등록 사용자" },
  { value: "150+", label: "고객사" },
  { value: "99.9%", label: "서비스 가동률" },
  { value: "24/7", label: "기술 지원" },
];

export default function HomePage() {
  return (
    <main className="min-h-[calc(100vh-3.5rem)]">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-pwc-black via-pwc-gray-800 to-pwc-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="max-w-2xl">
            <p className="text-pwc-orange font-medium text-sm mb-4 tracking-wider uppercase">
              PwC Digital Finance Portal
            </p>
            <h1 className="text-4xl font-bold mb-6 leading-tight">
              비감사용역의 새로운 기준
              <br />
              <span className="text-pwc-orange">Easy View</span>
            </h1>
            <p className="text-pwc-gray-300 text-lg mb-8 leading-relaxed">
              데이터 기반의 비감사용역 관리 플랫폼으로 업무 효율을 극대화하고
              실시간 인사이트를 확보하세요.
            </p>
            <div className="flex gap-4">
              <Link href="/admin" className="btn-primary text-base px-6 py-3">
                Admin Portal
              </Link>
              <button className="btn-secondary border-pwc-gray-500 text-white hover:bg-pwc-gray-700 text-base px-6 py-3">
                자세히 알아보기
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-pwc-black mb-3">
            주요 기능
          </h2>
          <p className="text-pwc-gray-500">
            Easy View가 제공하는 핵심 기능을 확인하세요
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f) => (
            <div
              key={f.title}
              className="card hover:shadow-md transition-shadow group"
            >
              <div
                className={`w-12 h-12 rounded-xl ${f.iconBg} flex items-center justify-center text-lg font-bold mb-4 group-hover:scale-110 transition-transform`}
              >
                {f.icon}
              </div>
              <h3 className="text-lg font-semibold text-pwc-black mb-2">
                {f.title}
              </h3>
              <p className="text-sm text-pwc-gray-500 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-pwc-black text-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="text-3xl font-bold text-pwc-orange mb-2">
                  {s.value}
                </div>
                <div className="text-sm text-pwc-gray-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-pwc-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-pwc-gray-500">
          2026 PwC. All rights reserved. Digital Finance Portal - Easy View
        </div>
      </footer>
    </main>
  );
}
