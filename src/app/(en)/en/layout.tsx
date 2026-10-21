import type { Metadata } from "next";
import "../../globals.css";
import { RootShell } from "@/components/RootShell";
import { rootMetadata } from "@/lib/metadata";

export const metadata: Metadata = rootMetadata("en");

export default function EnglishRootLayout({ children }: { children: React.ReactNode }) {
  return <RootShell locale="en">{children}</RootShell>;
}
