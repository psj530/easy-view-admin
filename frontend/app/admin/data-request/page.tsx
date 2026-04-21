"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DataRequestPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/admin"); }, [router]);
  return <div className="py-12 text-center text-pwc-gray-400">리다이렉트 중...</div>;
}
