import EvaluationClient from "./EvaluationClient";
import { assessmentSessions } from "@/data/mock";

export function generateStaticParams() {
  return assessmentSessions.map((s) => ({ id: s.id }));
}

export default function EvaluationDetailPage() {
  return <EvaluationClient />;
}
