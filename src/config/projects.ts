/**
 * Portfolio – confirmed client projects only.
 *
 * Rules:
 * - Add a project only with genuine information and the client's permission.
 * - Describe only functionality that is visible on the live website or that the
 *   owner has confirmed. Public appearance does not establish tech stack,
 *   backend integrations, private dashboards or automation.
 * - Screenshots are produced with `pnpm screenshots` (scripts/capture-screenshots.ts).
 */
import type { L10n } from "./pricing";
import bodenheim from "../../public/projects/autohaus-bodenheim/manifest.json";
import meinautoverkauf from "../../public/projects/meinautoverkauf/manifest.json";
import hfeautos from "../../public/projects/hf-eautos/manifest.json";

type ManifestEntry = { file: string; width: number; height: number; source: string };

export type Screenshot = {
  src: string;
  width: number;
  height: number;
  alt: L10n;
  device: "desktop" | "mobile";
};

export type Project = {
  slug: string;
  name: string;
  url: string;
  displayUrl: string;
  kind: "client";
  sector: L10n;
  summary: L10n;
  overview: L10n;
  need: L10n;
  contribution: L10n;
  features: L10n[];
  tags: L10n[];
  hero: { desktop: Screenshot; mobile?: Screenshot };
  gallery: Screenshot[];
  /** ISO date the screenshots and descriptions were verified against the live site. */
  verifiedAt: string;
};

function shot(entry: ManifestEntry, device: Screenshot["device"], alt: L10n): Screenshot {
  return { src: entry.file, width: entry.width, height: entry.height, device, alt };
}

const CONTRIBUTION: L10n = {
  de: "Konzeption, Design und Entwicklung der Website.",
  en: "Concept, design and development of the website.",
};

export const projects: Project[] = [
  {
    slug: "autohaus-bodenheim",
    name: "Autohaus Bodenheim",
    url: "https://www.autohaus-bodenheim.de/",
    displayUrl: "autohaus-bodenheim.de",
    kind: "client",
    sector: { de: "Autohaus · Bodenheim", en: "Car dealership · Bodenheim" },
    summary: {
      de: "Website für ein Autohaus mit Premium-Gebrauchtwagen: filterbarer Fahrzeugbestand, Fahrzeugdetailseiten und ein fünfstufiges Formular für den Fahrzeugankauf.",
      en: "Website for a dealership specialising in premium used cars: a filterable vehicle inventory, vehicle pages and a five-step form for vehicle purchasing.",
    },
    overview: {
      de: "Autohaus Bodenheim verkauft Premium-Gebrauchtwagen und kauft Fahrzeuge an. Die Website verbindet beide Bereiche: Interessenten durchsuchen den aktuellen Bestand, Verkäufer bieten ihr Fahrzeug über ein geführtes Formular an. Ergänzend stellt sie den Zulassungsservice und die Einzugsgebiete des Betriebs vor.",
      en: "Autohaus Bodenheim sells premium used cars and buys vehicles. The website connects both sides: buyers browse the current stock, sellers offer their vehicle through a guided form. It also presents the registration service and the regions the business serves.",
    },
    need: {
      de: "Ein Auftritt, der Verkauf und Ankauf gleichermaßen trägt – mit einem Bestand, der sich schnell durchsuchen lässt, und einem Ankaufweg, der die wichtigsten Fahrzeugdaten vollständig abfragt.",
      en: "A presence that supports sales and purchasing equally – with stock that is quick to search and a purchase path that collects the key vehicle details completely.",
    },
    contribution: CONTRIBUTION,
    features: [
      {
        de: "Fahrzeugbestand mit Filtern nach Marke, Modell, Preis, Kilometerstand, Baujahr, Kraftstoff und Getriebe",
        en: "Vehicle inventory with filters for make, model, price, mileage, year, fuel and transmission",
      },
      { de: "Freitextsuche und fünf Sortierungen", en: "Free-text search and five sort orders" },
      {
        de: "Fahrzeugdetailseiten mit Bildergalerie und Fahrzeugdaten",
        en: "Vehicle pages with image gallery and vehicle data",
      },
      {
        de: "Verknüpfung jedes Fahrzeugs mit dem zugehörigen mobile.de-Inserat",
        en: "Each vehicle linked to its corresponding mobile.de listing",
      },
      {
        de: "WhatsApp-Anfrage mit vorausgefülltem Fahrzeugnamen",
        en: "WhatsApp enquiry pre-filled with the vehicle name",
      },
      {
        de: "Fünfstufiges Ankaufformular: Fahrzeug, Technik, Zustand, Details, Kontakt",
        en: "Five-step purchase form: vehicle, technical data, condition, details, contact",
      },
      {
        de: "Seiten für Zulassungsservice und regionale Standorte",
        en: "Pages for the registration service and regional locations",
      },
      { de: "Cookie-Einstellungen für optionale Dienste", en: "Cookie settings for optional services" },
    ],
    tags: [
      { de: "Fahrzeugbestand", en: "Vehicle inventory" },
      { de: "Filter & Sortierung", en: "Filters & sorting" },
      { de: "Fahrzeugdetailseiten", en: "Vehicle pages" },
      { de: "Ankaufformular", en: "Purchase form" },
      { de: "Standortseiten", en: "Location pages" },
    ],
    hero: {
      desktop: shot(bodenheim["home-desktop"], "desktop", {
        de: "Startseite von Autohaus Bodenheim auf dem Desktop",
        en: "Autohaus Bodenheim homepage on desktop",
      }),
      mobile: shot(bodenheim["inventory-mobile"], "mobile", {
        de: "Fahrzeugbestand von Autohaus Bodenheim auf dem Smartphone",
        en: "Autohaus Bodenheim vehicle inventory on a smartphone",
      }),
    },
    gallery: [
      shot(bodenheim["inventory-desktop"], "desktop", {
        de: "Fahrzeugbestand mit Filterleiste und Sortierung",
        en: "Vehicle inventory with filter panel and sorting",
      }),
      shot(bodenheim["vehicle-desktop"], "desktop", {
        de: "Fahrzeugdetailseite mit Galerie und Fahrzeugdaten",
        en: "Vehicle page with gallery and vehicle data",
      }),
      shot(bodenheim["ankauf-desktop"], "desktop", {
        de: "Fünfstufiges Formular „Fahrzeug verkaufen“",
        en: "Five-step “sell your vehicle” form",
      }),
      shot(bodenheim["home-mobile"], "mobile", {
        de: "Startseite auf dem Smartphone",
        en: "Homepage on a smartphone",
      }),
      shot(bodenheim["ankauf-mobile"], "mobile", {
        de: "Ankaufformular auf dem Smartphone",
        en: "Purchase form on a smartphone",
      }),
    ],
    verifiedAt: "2026-10-17",
  },
  {
    slug: "meinautoverkauf",
    name: "Meinautoverkauf",
    url: "https://meinautoverkauf.de/",
    displayUrl: "meinautoverkauf.de",
    kind: "client",
    sector: { de: "Autoankauf · deutschlandweit", en: "Vehicle buying · Germany-wide" },
    summary: {
      de: "Ankauf-Website für Privatverkäufer mit fünfstufiger Bewertungsanfrage direkt auf der Startseite, Standort- und Markenseiten sowie Ratgeber.",
      en: "Vehicle buying website for private sellers with a five-step valuation enquiry right on the homepage, location and brand pages, and a guide section.",
    },
    overview: {
      de: "Meinautoverkauf kauft Gebrauchtwagen von Privatpersonen an – auch Fahrzeuge mit Motorschaden, Unfallschaden oder ohne gültigen TÜV. Im Mittelpunkt der Website steht eine geführte Bewertungsanfrage, die direkt auf der Startseite beginnt.",
      en: "Meinautoverkauf buys used cars from private sellers – including vehicles with engine or accident damage or without a valid MOT. The website centres on a guided valuation enquiry that starts right on the homepage.",
    },
    need: {
      de: "Verkäufer sollen ohne Umwege eine Bewertung anfragen können – und der Betrieb soll die Angaben erhalten, die für eine erste Einschätzung nötig sind.",
      en: "Sellers should be able to request a valuation without detours – and the business should receive the details needed for an initial assessment.",
    },
    contribution: CONTRIBUTION,
    features: [
      {
        de: "Fünfstufige Bewertungsanfrage: Fahrzeugwahl, Technik, Zustand, Details, Kontakt",
        en: "Five-step valuation enquiry: vehicle, technical data, condition, details, contact",
      },
      {
        de: "Auswahl von Marke, Modellreihe und Erstzulassung",
        en: "Selection of make, model range and first registration",
      },
      { de: "Standortseiten für Städte und Regionen", en: "Location pages for cities and regions" },
      { de: "Markenseiten", en: "Brand pages" },
      { de: "Ratgeberbereich", en: "Guide section" },
      { de: "FAQ mit aufklappbaren Antworten", en: "FAQ with expandable answers" },
      { de: "Telefon-Hotline und E-Mail-Kontakt", en: "Phone hotline and email contact" },
      {
        de: "Cookie-Einwilligung mit Einstellungen für optionale Dienste",
        en: "Cookie consent with settings for optional services",
      },
    ],
    tags: [
      { de: "Autoankauf", en: "Vehicle buying" },
      { de: "Mehrstufige Anfrage", en: "Multi-step enquiry" },
      { de: "Standortseiten", en: "Location pages" },
      { de: "Markenseiten", en: "Brand pages" },
      { de: "Ratgeber", en: "Guides" },
    ],
    hero: {
      desktop: shot(meinautoverkauf["home-desktop"], "desktop", {
        de: "Startseite von Meinautoverkauf mit Bewertungsanfrage",
        en: "Meinautoverkauf homepage with valuation enquiry",
      }),
      mobile: shot(meinautoverkauf["home-mobile"], "mobile", {
        de: "Meinautoverkauf auf dem Smartphone",
        en: "Meinautoverkauf on a smartphone",
      }),
    },
    gallery: [
      shot(meinautoverkauf["home-long-desktop"], "desktop", {
        de: "Startseite mit Bewertungsanfrage und weiteren Inhalten",
        en: "Homepage with valuation enquiry and further content",
      }),
    ],
    verifiedAt: "2026-10-17",
  },
  {
    slug: "hf-eautos",
    name: "HF E-Autos",
    url: "https://www.hf-eautos.de/",
    displayUrl: "hf-eautos.de",
    kind: "client",
    sector: { de: "Elektro-Gebrauchtwagen · Wiesbaden", en: "Used electric vehicles · Wiesbaden" },
    summary: {
      de: "Website für einen Händler geprüfter Elektro- und Plug-in-Hybrid-Gebrauchtwagen – mit täglich aus mobile.de abgeglichenem Bestand und fahrzeugbezogenen Anfragen.",
      en: "Website for a dealer of inspected used electric and plug-in hybrid cars – with stock synchronised daily from mobile.de and vehicle-specific enquiries.",
    },
    overview: {
      de: "HF E-Autos verkauft geprüfte Elektro- und Plug-in-Hybrid-Gebrauchtwagen in Wiesbaden. Die Website präsentiert den aktuellen Bestand, die Leistungen rund um Batterie-Check, Garantie und Finanzierung sowie den direkten Kontakt zum Betrieb.",
      en: "HF E-Autos sells inspected used electric and plug-in hybrid cars in Wiesbaden. The website presents the current stock, services around battery checks, warranty and financing, and direct contact with the business.",
    },
    need: {
      de: "Der Bestand wird bei mobile.de gepflegt. Die Website sollte ihn ohne doppelte Pflege zeigen und Anfragen direkt einem Fahrzeug zuordnen.",
      en: "The stock is maintained on mobile.de. The website should show it without duplicate maintenance and link enquiries directly to a vehicle.",
    },
    contribution: CONTRIBUTION,
    features: [
      {
        de: "Fahrzeugbestand, der laut Website einmal täglich mit mobile.de abgeglichen wird",
        en: "Vehicle stock that, as stated on the website, is synchronised with mobile.de once a day",
      },
      {
        de: "Filter nach Marke, Kraftstoff, Getriebe, Karosserie und Preis sowie Sortierung",
        en: "Filters for make, fuel, transmission, body type and price, plus sorting",
      },
      { de: "Kategorien Elektro und Plug-in-Hybrid", en: "Electric and plug-in hybrid categories" },
      {
        de: "Fahrzeugdetailseiten mit Bildergalerie, Miniaturansichten und technischen Daten",
        en: "Vehicle pages with image gallery, thumbnails and specifications",
      },
      {
        de: "Fahrzeugbezogenes Anfrageformular, vorausgefüllt mit dem Fahrzeug",
        en: "Vehicle-specific enquiry form, pre-filled with the vehicle",
      },
      { de: "WhatsApp- und Telefonkontakt", en: "WhatsApp and phone contact" },
      { de: "Link zum jeweiligen mobile.de-Inserat", en: "Link to the corresponding mobile.de listing" },
      { de: "Leistungsseite", en: "Services page" },
      { de: "Kontaktseite mit Öffnungszeiten und Routenlink", en: "Contact page with opening hours and route link" },
    ],
    tags: [
      { de: "mobile.de-Bestand", en: "mobile.de stock" },
      { de: "Täglicher Abgleich", en: "Daily sync" },
      { de: "Filter & Sortierung", en: "Filters & sorting" },
      { de: "Fahrzeugdetailseiten", en: "Vehicle pages" },
      { de: "Fahrzeuganfragen", en: "Vehicle enquiries" },
      { de: "WhatsApp", en: "WhatsApp" },
    ],
    hero: {
      desktop: shot(hfeautos["home-desktop"], "desktop", {
        de: "Startseite von HF E-Autos auf dem Desktop",
        en: "HF E-Autos homepage on desktop",
      }),
      mobile: shot(hfeautos["inventory-mobile"], "mobile", {
        de: "Fahrzeugbestand von HF E-Autos auf dem Smartphone",
        en: "HF E-Autos vehicle stock on a smartphone",
      }),
    },
    gallery: [
      shot(hfeautos["inventory-desktop"], "desktop", {
        de: "Fahrzeugbestand mit Kategorien",
        en: "Vehicle stock with categories",
      }),
      shot(hfeautos["vehicle-desktop"], "desktop", {
        de: "Fahrzeugdetailseite mit Galerie und Anfrage",
        en: "Vehicle page with gallery and enquiry",
      }),
      shot(hfeautos["services-desktop"], "desktop", {
        de: "Leistungsseite",
        en: "Services page",
      }),
      shot(hfeautos["home-mobile"], "mobile", {
        de: "Startseite auf dem Smartphone",
        en: "Homepage on a smartphone",
      }),
    ],
    verifiedAt: "2026-10-17",
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
