import ReportClient from "./ReportClient";
import { jobs } from "@/data/mock";

export function generateStaticParams() {
  return jobs.map((j) => ({ id: j.videoId }));
}

export default function ReportPage() {
  return <ReportClient />;
}
