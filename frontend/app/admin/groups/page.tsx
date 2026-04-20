"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GroupsPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/admin/accounts"); }, [router]);
  return <div className="py-12 text-center text-pwc-gray-400">계정 관리로 이동 중...</div>;
}
