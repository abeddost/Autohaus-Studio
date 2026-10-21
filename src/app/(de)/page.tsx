import { HomePage } from "@/views/HomePage";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({ locale: "de", route: "home", absoluteTitle: true });

export default function Page() {
  return <HomePage locale="de" />;
}
