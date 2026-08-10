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
      subtitle="영상 · 작업 단계 · 이상행동 라벨링"
    >
      <SectionTabs tabs={labelingTabs} />
      {children}
    </AppShell>
  );
}
