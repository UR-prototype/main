/** GitHub Pages 등 basePath 환경에서 public 자산 경로를 보정합니다. */
export function asset(path: string) {
  const base =
    process.env.NODE_ENV === "production"
      ? (process.env.NEXT_PUBLIC_BASE_PATH ?? "")
      : "";
  if (!path) return path;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (base && path.startsWith(base)) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
