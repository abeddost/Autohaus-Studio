import { AboutPage } from "@/views/AboutPage";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({ locale: "en", route: "about" });

export default function Page() {
  return <AboutPage locale="en" />;
}
