import type { PackageId } from "@/config/pricing";
import { Car, Handshake, Layers, Storefront, Swap } from "./icons";

export const PACKAGE_ICONS: Record<PackageId, typeof Car> = {
  praesenz: Storefront,
  showroom: Car,
  ankauf: Handshake,
  komplett: Swap,
  plattform: Layers,
};
