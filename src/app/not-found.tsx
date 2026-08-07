import Link from "next/link";
import { AppShell } from "@/components/AppShell";

export default function NotFound() {
  return (
    <AppShell title="페이지 없음">
      <div className="rounded-xl border border-dashed border-line bg-surface p-10 text-center">
        <p className="text-sm text-muted">요청한 화면을 찾을 수 없습니다.</p>
        <Link href="/" className="mt-4 inline-block text-sm text-brand hover:underline">
          대시보드로
        </Link>
      </div>
    </AppShell>
  );
}
