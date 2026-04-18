export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(
    units.length - 1,
    Math.floor(Math.log(bytes) / Math.log(1024))
  );
  const value = bytes / Math.pow(1024, i);
  const decimals = i === 0 || value >= 100 ? 0 : value >= 10 ? 0 : 1;
  return `${value.toFixed(decimals)} ${units[i]}`;
}

export function filenameFromUrl(url: string): string {
  try {
    const u = new URL(url);
    const last = u.pathname.split("/").filter(Boolean).pop() ?? url;
    return decodeURIComponent(last);
  } catch {
    const parts = url.split("/");
    return decodeURIComponent(parts[parts.length - 1] ?? url);
  }
}

export interface ImageMeta {
  filename: string;
  sizeBytes: number | null;
}

export async function fetchImageMeta(url: string): Promise<ImageMeta> {
  const filename = filenameFromUrl(url);
  try {
    const res = await fetch(url, { method: "HEAD" });
    if (!res.ok) return { filename, sizeBytes: null };
    const len = res.headers.get("content-length");
    const sizeBytes = len ? parseInt(len, 10) : null;
    return { filename, sizeBytes: Number.isFinite(sizeBytes!) ? sizeBytes : null };
  } catch {
    return { filename, sizeBytes: null };
  }
}
