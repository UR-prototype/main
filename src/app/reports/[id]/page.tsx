import ReportClient from "./ReportClient";
import { assessmentSessions } from "@/data/mock";

export function generateStaticParams() {
  return assessmentSessions.map((s) => ({ id: s.id }));
}

export default function ReportPage() {
  return <ReportClient />;
}
