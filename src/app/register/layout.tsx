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
      subtitle="기술자 프로필에 영상·조형물·라벨을 묶어 등록"
    >
      <SectionTabs tabs={registerTabs} />
      {children}
    </AppShell>
  );
}
