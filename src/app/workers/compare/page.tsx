import { Suspense } from "react";
import CompareClient from "./CompareClient";

export default function WorkersComparePage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-xl border border-line bg-surface p-10 text-center text-sm text-muted">
          비교 표 준비 중…
        </div>
      }
    >
      <CompareClient />
    </Suspense>
  );
}
