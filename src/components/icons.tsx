import type { SVGProps } from "react";

/**
 * Minimal line-icon set: 24px grid, 1.5px stroke, round joins.
 * Decorative by default (aria-hidden); pass `title` for meaningful icons.
 */
type IconProps = SVGProps<SVGSVGElement> & { title?: string };

function Icon({ title, children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      focusable="false"
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

export const ArrowRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4.5 12h15M13.5 6l6 6-6 6" />
  </Icon>
);
export const ArrowLeft = (p: IconProps) => (
  <Icon {...p}>
    <path d="M19.5 12h-15M10.5 6l-6 6 6 6" />
  </Icon>
);
export const ArrowUpRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="M7 17 17 7M8.5 7H17v8.5" />
  </Icon>
);
export const Check = (p: IconProps) => (
  <Icon {...p}>
    <path d="m5 12.5 4.2 4.2L19 7" />
  </Icon>
);
export const Plus = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);
export const Minus = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 12h14" />
  </Icon>
);
export const Close = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
);
export const Menu = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 8h16M4 16h16" />
  </Icon>
);
export const ChevronDown = (p: IconProps) => (
  <Icon {...p}>
    <path d="m6 9 6 6 6-6" />
  </Icon>
);
export const Car = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 15.5v-2.2c0-.6.3-1.1.8-1.4l1.6-1 1.8-3.1A2 2 0 0 1 8.9 6.8h5.6a2 2 0 0 1 1.6.8l2.5 3.3 2 .6c.8.2 1.4 1 1.4 1.8v2.2" />
    <path d="M3 15.5h1.8M9.2 15.5h5.6M19.2 15.5H21" />
    <circle cx="7" cy="15.8" r="2" />
    <circle cx="17" cy="15.8" r="2" />
    <path d="M7.5 10.7h10" />
  </Icon>
);
export const Storefront = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 10v9.5h16V10" />
    <path d="M3 10 4.6 4.5h14.8L21 10" />
    <path d="M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
    <path d="M10 19.5v-5h4v5" />
  </Icon>
);
export const Handshake = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 9.5 6.5 6l3 1.5L12 6l3 1.5L17.5 6 21 9.5" />
    <path d="m6.5 13 3.2 3.2a1.4 1.4 0 0 0 2-2" />
    <path d="m9.6 12.4 3.6 3.6a1.4 1.4 0 0 0 2-2l-3.4-3.4" />
    <path d="M3 9.5 6.5 13M21 9.5 17 13.5l-2-2" />
  </Icon>
);
export const Swap = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 8h13.5M14 4.5 17.5 8 14 11.5" />
    <path d="M20 16H6.5M10 12.5 6.5 16l3.5 3.5" />
  </Icon>
);
export const Layers = (p: IconProps) => (
  <Icon {...p}>
    <path d="m12 3.5 8.5 4.5-8.5 4.5L3.5 8z" />
    <path d="m3.5 12 8.5 4.5 8.5-4.5" />
    <path d="m3.5 16 8.5 4.5 8.5-4.5" />
  </Icon>
);
export const Sync = (p: IconProps) => (
  <Icon {...p}>
    <path d="M19.5 9A8 8 0 0 0 5 7.5M4.5 4v3.8h3.8" />
    <path d="M4.5 15A8 8 0 0 0 19 16.5M19.5 20v-3.8h-3.8" />
  </Icon>
);
export const Inbox = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3.5 13.5 6 5.5h12l2.5 8V19a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1z" />
    <path d="M3.5 13.5H8l1.2 2.5h5.6l1.2-2.5h4.5" />
  </Icon>
);
export const Camera = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 8.5h3l1.5-2.5h7L17 8.5h3v10H4z" />
    <circle cx="12" cy="13" r="3.2" />
  </Icon>
);
export const Users = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="9" cy="8.5" r="3" />
    <path d="M3.5 19c.6-3 2.8-4.8 5.5-4.8s4.9 1.8 5.5 4.8" />
    <path d="M15.5 5.8a3 3 0 0 1 0 5.6M17.5 14.6c1.6.6 2.7 2.1 3 4.4" />
  </Icon>
);
export const Server = (p: IconProps) => (
  <Icon {...p}>
    <rect x="4" y="4" width="16" height="7" rx="1.5" />
    <rect x="4" y="13" width="16" height="7" rx="1.5" />
    <path d="M7.5 7.5h.01M7.5 16.5h.01M11 7.5h5.5M11 16.5h5.5" />
  </Icon>
);
export const Shield = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3.5 19 6v5.5c0 4.3-2.9 7.7-7 9-4.1-1.3-7-4.7-7-9V6z" />
    <path d="m9 12 2.2 2.2L15.5 10" />
  </Icon>
);
export const Phone = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6.6 3.8h2.6l1.4 4-2 1.3a10.5 10.5 0 0 0 6.3 6.3l1.3-2 4 1.4v2.6a1.8 1.8 0 0 1-1.9 1.8C11.3 18.8 5.2 12.7 4.8 5.7a1.8 1.8 0 0 1 1.8-1.9z" />
  </Icon>
);
export const Mail = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="1.5" />
    <path d="m4 6.5 8 6 8-6" />
  </Icon>
);
export const Globe = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17M12 3.5c2.3 2.4 3.5 5.2 3.5 8.5s-1.2 6.1-3.5 8.5c-2.3-2.4-3.5-5.2-3.5-8.5s1.2-6.1 3.5-8.5z" />
  </Icon>
);
export const Calendar = (p: IconProps) => (
  <Icon {...p}>
    <rect x="4" y="5.5" width="16" height="14.5" rx="1.5" />
    <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
  </Icon>
);
export const Pages = (p: IconProps) => (
  <Icon {...p}>
    <path d="M7 3.5h7.5L19 8v12.5H7z" />
    <path d="M14.5 3.5V8H19M10 12.5h6M10 16h6" />
  </Icon>
);
export const Pin = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 20.5s6.5-5.6 6.5-11a6.5 6.5 0 0 0-13 0c0 5.4 6.5 11 6.5 11z" />
    <circle cx="12" cy="9.5" r="2.3" />
  </Icon>
);
export const Search = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4 4" />
  </Icon>
);
export const Sliders = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
    <circle cx="15" cy="7" r="2" />
    <circle cx="9" cy="17" r="2" />
  </Icon>
);
export const Info = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11v5.5M12 7.8h.01" />
  </Icon>
);
export const Alert = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 4 21 19.5H3z" />
    <path d="M12 10v4.5M12 17h.01" />
  </Icon>
);
export const Spark = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 3.5v4M12 16.5v4M3.5 12h4M16.5 12h4M6 6l2.6 2.6M15.4 15.4 18 18M6 18l2.6-2.6M15.4 8.6 18 6" />
  </Icon>
);
export const Workflow = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3.5" y="4" width="6" height="5" rx="1" />
    <rect x="14.5" y="15" width="6" height="5" rx="1" />
    <path d="M6.5 9v4.5a2 2 0 0 0 2 2h6" />
    <path d="m12.5 13.5 2 2-2 2" />
  </Icon>
);
export const Wrench = (p: IconProps) => (
  <Icon {...p}>
    <path d="M14.5 4.2a4.5 4.5 0 0 0-5.6 5.9L4 15a2.1 2.1 0 0 0 3 3l4.9-4.9a4.5 4.5 0 0 0 5.9-5.6l-2.6 2.6-2.4-.6-.6-2.4z" />
  </Icon>
);
export const Note = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 4.5h14v10l-5 5H5z" />
    <path d="M14 19.5v-5h5M8.5 9h7M8.5 12.5h4" />
  </Icon>
);
