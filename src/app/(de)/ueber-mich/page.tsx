import { AboutPage } from "@/views/AboutPage";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({ locale: "de", route: "about" });

export default function Page() {
  return <AboutPage locale="de" />;
}
