import { PricingPage } from "@/views/PricingPage";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({ locale: "en", route: "pricing" });

export default function Page() {
  return <PricingPage locale="en" />;
}
