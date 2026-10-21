import { WorkIndexPage } from "@/views/WorkPages";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({ locale: "de", route: "work" });

export default function Page() {
  return <WorkIndexPage locale="de" />;
}
