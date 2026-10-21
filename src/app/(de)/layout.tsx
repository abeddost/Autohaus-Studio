import type { Metadata } from "next";
import "../globals.css";
import { RootShell } from "@/components/RootShell";
import { rootMetadata } from "@/lib/metadata";

export const metadata: Metadata = rootMetadata("de");

export default function GermanRootLayout({ children }: { children: React.ReactNode }) {
  return <RootShell locale="de">{children}</RootShell>;
}
