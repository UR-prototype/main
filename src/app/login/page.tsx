import Link from "next/link";
import { AppShell } from "@/components/AppShell";

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm rounded-xl border border-line bg-surface p-6">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand text-xs font-bold text-white">
            UR
          </div>
          <div>
            <p className="text-sm font-semibold">UR Connection</p>
            <p className="text-[11px] text-muted">Console</p>
          </div>
        </div>
        <h1 className="text-lg font-semibold">로그인</h1>
        <p className="mt-1 text-sm text-muted">프로토타입 — 바로 콘솔로 이동합니다.</p>
        <Link
          href="/"
          className="mt-6 flex w-full items-center justify-center rounded-lg bg-brand py-2.5 text-sm font-medium text-white"
        >
          콘솔 입장
        </Link>
      </div>
    </div>
  );
}
