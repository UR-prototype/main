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
      subtitle="내부 라벨링 · 타임라인 이상행동 · 조형물 좌표 (AI 보조)"
    >
      <SectionTabs tabs={labelingTabs} />
      {children}
    </AppShell>
  );
}
