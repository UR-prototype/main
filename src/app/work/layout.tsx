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
      title="작업 현황"
      subtitle="평가 세션 · 진행·NCS 검토 · 실패 재처리"
      actions={<UploadButton />}
    >
      <SectionTabs tabs={workTabs} />
      {children}
    </AppShell>
  );
}
