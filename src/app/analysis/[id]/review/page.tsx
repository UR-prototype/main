import ReviewClient from "./ReviewClient";
import { jobs } from "@/data/mock";

export function generateStaticParams() {
  return jobs.map((j) => ({ id: j.videoId }));
}

export default function ReviewPage() {
  return <ReviewClient />;
}
