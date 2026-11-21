import { Badge } from "@/components/ui";

/** Product / company status pill. Green = published/verified, amber = pending, red = rejected. */
export function StatusPill({ status, className }: { status: string; className?: string }) {
  const s = (status || "").toLowerCase();
  const tone =
    s === "published" || s === "verified" || s === "active" || s === "paid" || s === "succeeded"
      ? "verified"
      : s === "pending" || s === "pending_review" || s === "open"
        ? "pending"
        : s === "rejected" || s === "failed"
          ? "error"
          : "neutral";
  const label = s.replace(/_/g, " ");
  return (
    <Badge tone={tone} dot size="xs" className={className ? `capitalize ${className}` : "capitalize"}>
      {label.charAt(0).toUpperCase() + label.slice(1)}
    </Badge>
  );
}
