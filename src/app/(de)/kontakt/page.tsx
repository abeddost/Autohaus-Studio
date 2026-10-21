import { ContactPage } from "@/views/ContactPage";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({ locale: "de", route: "contact" });

export default function Page() {
  return <ContactPage locale="de" />;
}
