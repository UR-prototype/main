import EvaluationClient from "./EvaluationClient";
import { jobs } from "@/data/mock";

export function generateStaticParams() {
  return jobs
    .filter((j) => j.status === "completed")
    .map((j) => ({ id: j.videoId }));
}

export default function EvaluationDetailPage() {
  return <EvaluationClient />;
}
