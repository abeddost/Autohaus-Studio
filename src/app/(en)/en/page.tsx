import { HomePage } from "@/views/HomePage";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({ locale: "en", route: "home", absoluteTitle: true });

export default function Page() {
  return <HomePage locale="en" />;
}
