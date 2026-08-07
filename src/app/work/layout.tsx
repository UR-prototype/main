import { AppShell } from "@/components/AppShell";
import { SectionTabs, workTabs } from "@/components/SectionTabs";
import { UploadButton } from "@/components/UploadButton";

export default function WorkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell
      title="작업·분석"
      subtitle="영상 등록 · 분석 진행 · 실패 재처리"
      actions={<UploadButton />}
    >
      <SectionTabs tabs={workTabs} />
      {children}
    </AppShell>
  );
}
