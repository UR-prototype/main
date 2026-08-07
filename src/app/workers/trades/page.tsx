"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** 직종 탭은 비교 화면으로 통합됨 */
export default function WorkersTradesRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/workers/compare/");
  }, [router]);
  return (
    <p className="p-6 text-sm text-muted">비교 화면으로 이동 중…</p>
  );
}
