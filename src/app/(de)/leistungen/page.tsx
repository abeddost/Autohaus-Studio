import { ServicesPage } from "@/views/ServicesPage";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({ locale: "de", route: "services" });

export default function Page() {
  return <ServicesPage locale="de" />;
}
