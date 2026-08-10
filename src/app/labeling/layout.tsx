import { AppShell } from "@/components/AppShell";
import { SectionTabs, labelingTabs } from "@/components/SectionTabs";

export default function LabelingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell
      title="라벨링"
      subtitle="미디어 목록 · 타임라인 Stage/Event · 조형물 좌표"
    >
      <SectionTabs tabs={labelingTabs} />
      {children}
    </AppShell>
  );
}
