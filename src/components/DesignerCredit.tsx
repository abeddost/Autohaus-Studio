/**
 * Designer credit: a small badge that links to the portfolio of Abdul Qader Dost,
 * who designed and built this website. It takes the surrounding text colour, so it fits
 * light and dark footers alike. `site` is added to the link so the portfolio's statistics
 * can show which website a visitor came from.
 */
export default function DesignerCredit({
  site,
  label = "Webdesign & Entwicklung",
  className,
}: {
  site: string;
  label?: string;
  className?: string;
}) {
  return (
    <a
      href={`https://abeddost.vercel.app/?ref=${site}`}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.6rem",
        padding: "0.3rem 0.9rem 0.3rem 0.3rem",
        borderRadius: "999px",
        border: "1px solid color-mix(in srgb, currentColor 30%, transparent)",
        color: "inherit",
        textDecoration: "none",
        lineHeight: 1.2,
        textAlign: "left",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "1.9rem",
          height: "1.9rem",
          flexShrink: 0,
          borderRadius: "999px",
          border: "1px solid currentColor",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: "0.68rem",
          fontWeight: 700,
        }}
      >
        AQ
      </span>
      <span style={{ display: "inline-flex", flexDirection: "column" }}>
        <span style={{ fontSize: "0.68rem", opacity: 0.75 }}>{label}</span>
        <span style={{ fontSize: "0.82rem", fontWeight: 600 }}>Abdul Qader Dost</span>
      </span>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        style={{ width: "0.85rem", height: "0.85rem", flexShrink: 0, opacity: 0.75 }}
      >
        <path d="M7 17 17 7M8 7h9v9" />
      </svg>
      <span
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          overflow: "hidden",
          clip: "rect(0 0 0 0)",
          whiteSpace: "nowrap",
        }}
      >
        (öffnet in neuem Tab)
      </span>
    </a>
  );
}
