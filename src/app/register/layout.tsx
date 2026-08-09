import { AppShell } from "@/components/AppShell";
import { SectionTabs, registerTabs } from "@/components/SectionTabs";

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell
      title="등록"
      subtitle="영상·메타정보 · 결과 조형물 이미지 · 외부 라벨 인수"
    >
      <SectionTabs tabs={registerTabs} />
      {children}
    </AppShell>
  );
}
