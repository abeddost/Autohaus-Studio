/**
 * Marks configuration that has not been supplied yet.
 * Visible in development (and on previews with NEXT_PUBLIC_SHOW_MISSING=true),
 * renders nothing in production – missing data never becomes public content.
 */
export function showMissingMarkers() {
  return process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_SHOW_MISSING === "true";
}

export function Missing({ field, className }: { field: string; className?: string }) {
  if (!showMissingMarkers()) return null;
  return (
    <span
      data-missing={field}
      className={`inline-flex items-center gap-1.5 rounded-sm border border-dashed border-warning/60 bg-warning/10 px-2 py-0.5 font-mono text-[0.72rem] text-warning ${className ?? ""}`}
    >
      Fehlt: {field}
    </span>
  );
}
