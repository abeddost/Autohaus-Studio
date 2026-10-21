import { LegalPage } from "@/views/LegalPage";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({ locale: "en", route: "imprint" });

export default function Page() {
  return <LegalPage doc="impressum" locale="en" />;
}
