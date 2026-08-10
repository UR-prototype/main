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
      subtitle="사람 × 평가기술 × 일자 × 등록번호 · 영상·사진 복수 첨부"
    >
      <SectionTabs tabs={registerTabs} />
      {children}
    </AppShell>
  );
}
