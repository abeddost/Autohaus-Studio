import { LegalPage } from "@/views/LegalPage";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({ locale: "de", route: "privacy" });

export default function Page() {
  return <LegalPage doc="datenschutz" locale="de" />;
}
