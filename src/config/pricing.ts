/**
 * Single source of truth for all prices.
 *
 * - All amounts are integer euro cents, net (zzgl. gesetzlicher USt.).
 * - Identifiers are stable: they are stored with enquiries. Rename labels freely,
 *   never rename ids.
 * - Used by the client calculator AND re-evaluated on the server before an
 *   enquiry is accepted (see lib/pricing/engine.ts).
 */

export type Locale = "de" | "en";
export type L10n = { de: string; en: string };

export type PackageId = "praesenz" | "showroom" | "ankauf" | "komplett" | "plattform";
export type FixedPackageId = Exclude<PackageId, "plattform">;

export type AddonId =
  | "extra_page"
  | "language"
  | "extra_translated_page"
  | "copywriting"
  | "local_seo"
  | "landing_page"
  | "appointment_request"
  | "booking_integration"
  | "headless_cms";

export type QuoteTriggerId =
  | "extra_branches"
  | "crm"
  | "extra_feeds"
  | "complex_roles"
  | "custom_workflows"
  | "more_languages";

export type PlatformNeedId =
  | "branches"
  | "roles"
  | "lead_workflows"
  | "appointments"
  | "inventory_sources"
  | "crm"
  | "automation";

export type ExternalCostId =
  | "mobilede_access"
  | "booking_subscription"
  | "translations"
  | "legal_texts"
  | "domain_email";

export type VehicleTier = {
  id: string;
  label: L10n;
  maxVehicles: number | null;
  setupDeltaCents: number;
  /** Replaces the package care price when set. */
  monthlyCents?: number;
  /** Tier cannot be priced automatically. */
  requiresQuote?: boolean;
};

export type FixedPackage = {
  id: FixedPackageId;
  name: string;
  intent: L10n;
  summary: L10n;
  setupCents: number;
  care: {
    monthlyCents: number;
    /** true: agency operation requires the plan. false: optional (self-operation allowed). */
    required: boolean;
    includedMinutes: number;
  };
  includedPages: number;
  includes: L10n[];
  excludes: L10n[];
  vehicleTiers?: VehicleTier[];
  /** Add-ons that make sense for this package. */
  addons: AddonId[];
  quoteTriggers: QuoteTriggerId[];
  externalCosts: ExternalCostId[];
};

export type PlatformPackage = {
  id: "plattform";
  name: string;
  intent: L10n;
  summary: L10n;
  possibleFeatures: { id: PlatformNeedId; label: L10n }[];
};

export type Addon = {
  id: AddonId;
  label: L10n;
  description: L10n;
  unitCents: number;
  kind: "toggle" | "count";
  /** Maximum count for "count" add-ons (further limited by rules in the engine). */
  max?: number;
  unit?: L10n;
  /** Add-ons in the same group are mutually exclusive. */
  exclusiveGroup?: "appointments";
  requires?: AddonId;
  externalCosts?: ExternalCostId[];
};

export const VAT_NOTICE: L10n = {
  de: "Alle Preise netto zzgl. gesetzlicher Umsatzsteuer.",
  en: "All prices are net, plus statutory VAT.",
};

export const ESTIMATE_NOTICE: L10n = {
  de: "Unverbindliche Kostenschätzung. Das verbindliche Angebot erhalten Sie nach Prüfung Ihrer Anforderungen.",
  en: "Non-binding cost estimate. You receive the binding quotation after we have reviewed your requirements.",
};

export const HOURLY_RATE_CENTS = 9500;

export const DISCOVERY = {
  id: "discovery",
  priceCents: 120000,
  label: { de: "Bezahlte Anforderungsanalyse", en: "Paid discovery phase" },
  description: {
    de: "Strukturierte Analyse Ihrer Abläufe, Datenquellen und Rollen mit schriftlichem Konzept und belastbarem Angebot. Bei Beauftragung des Projekts wird der Betrag vollständig angerechnet. Ein erstes Kennenlerngespräch bleibt kostenfrei.",
    en: "A structured analysis of your processes, data sources and roles, resulting in a written concept and a reliable quotation. The full amount is credited if you commission the project. An initial introductory call remains free of charge.",
  },
} as const;

export const CARE_FEATURES: L10n[] = [
  { de: "Hosting auf gepflegter Infrastruktur", en: "Hosting on maintained infrastructure" },
  { de: "Regelmäßige technische Updates", en: "Routine technical updates" },
  { de: "Monitoring von Erreichbarkeit und Fehlern", en: "Monitoring of availability and errors" },
  { de: "Backups und dokumentierte Wiederherstellung", en: "Backups and documented recovery procedures" },
  {
    de: "Prüfung von Bestandsabgleich bzw. Anfrageeingang, sofern zutreffend",
    en: "Checks of inventory sync or enquiry delivery, where applicable",
  },
  {
    de: "Ein begrenztes Kontingent für kleine Änderungen und Unterstützung",
    en: "A limited allowance for small changes and assistance",
  },
];

export const CARE_LIMITS: L10n = {
  de: "Das Betriebspaket umfasst keine unbegrenzte Weiterentwicklung und keinen persönlichen Support rund um die Uhr. Zusätzlicher Aufwand wird mit 95 € pro Stunde netto abgerechnet.",
  en: "The operating plan does not include unlimited development or round-the-clock personal support. Additional work is billed at €95 per hour net.",
};

export const MANAGED_REQUIRED_NOTICE: L10n = {
  de: "Für den laufenden Betrieb durch uns ist das passende Betriebspaket erforderlich. Ein Wechsel zu einem anderen Betreiber ist mit dokumentierter Übergabe möglich.",
  en: "Operation by us requires the matching operating plan. Moving to another operator is possible with a documented handover.",
};

export const SELF_OPERATION_NOTICE: L10n = {
  de: "Bei Eigenbetrieb kümmern Sie sich selbst oder über einen Dienstleister Ihrer Wahl um Hosting, Updates, Sicherheit und Backups. Sie erhalten eine dokumentierte Übergabe.",
  en: "With self-operation, you or a provider of your choice take care of hosting, updates, security and backups. You receive a documented handover.",
};

export const EXTERNAL_COSTS: Record<ExternalCostId, L10n> = {
  mobilede_access: {
    de: "Kosten Ihres mobile.de-Händlerzugangs und API-Zugriffs (Vertrag direkt mit mobile.de)",
    en: "Costs of your mobile.de dealer account and API access (contract directly with mobile.de)",
  },
  booking_subscription: {
    de: "Abonnement des externen Buchungsdienstes",
    en: "Subscription to the external booking service",
  },
  translations: {
    de: "Übersetzungen – werden von Ihnen geliefert",
    en: "Translations – supplied by you",
  },
  legal_texts: {
    de: "Rechtstexte (Impressum, Datenschutz) – werden von Ihnen bzw. Ihrer Rechtsberatung geliefert",
    en: "Legal texts (legal notice, privacy policy) – supplied by you or your legal adviser",
  },
  domain_email: {
    de: "Domain und E-Mail-Postfächer, sofern nicht gesondert vereinbart",
    en: "Domain and email mailboxes, unless agreed separately",
  },
};

export const QUOTE_TRIGGERS: Record<QuoteTriggerId, L10n> = {
  extra_branches: { de: "Weitere Standorte / Filialen", en: "Additional branches" },
  crm: { de: "Anbindung an ein CRM- oder DMS-System", en: "CRM or DMS integration" },
  extra_feeds: { de: "Weitere Bestandsquellen oder Feeds", en: "Additional inventory sources or feeds" },
  complex_roles: { de: "Komplexe Rollen und Berechtigungen", en: "Complex roles and permissions" },
  custom_workflows: { de: "Individuelle Abläufe und Automatisierungen", en: "Custom workflows and automations" },
  more_languages: { de: "Mehr als eine zusätzliche Sprache", en: "More than one additional language" },
};

const PRAESENZ_INCLUDES: L10n[] = [
  { de: "Fünf Inhaltsseiten", en: "Five content pages" },
  { de: "Ein Standort, eine deutschsprachige Website", en: "One branch, one German-language website" },
  { de: "Responsives Design für alle Geräte", en: "Responsive design for all devices" },
  {
    de: "Kontaktformular mit Spamschutz und E-Mail-Benachrichtigung",
    en: "Contact form with spam protection and email notification",
  },
  { de: "Telefon- und optionale WhatsApp-Kontaktlinks", en: "Telephone and optional WhatsApp contact links" },
  { de: "Öffnungszeiten, Adresse und Routenlink", en: "Opening hours, address and route link" },
  { de: "Technische SEO-Grundlagen", en: "Basic technical SEO" },
  { de: "Einbindung Ihrer gelieferten Rechtstexte", en: "Placement of your supplied legal texts" },
  { de: "Zwei gebündelte Korrekturrunden", en: "Two consolidated revision rounds" },
];

const COMMON_ADDONS: AddonId[] = [
  "extra_page",
  "language",
  "extra_translated_page",
  "copywriting",
  "local_seo",
  "landing_page",
  "appointment_request",
  "booking_integration",
  "headless_cms",
];

export const FIXED_PACKAGES: Record<FixedPackageId, FixedPackage> = {
  praesenz: {
    id: "praesenz",
    name: "Autohaus Präsenz",
    intent: { de: "Autohaus vorstellen", en: "Present your dealership" },
    summary: {
      de: "Ein hochwertiger Auftritt für Ihren Betrieb – klar, schnell und gut erreichbar.",
      en: "A refined presence for your business – clear, fast and easy to contact.",
    },
    setupCents: 249000,
    care: { monthlyCents: 9900, required: false, includedMinutes: 15 },
    includedPages: 5,
    includes: PRAESENZ_INCLUDES,
    excludes: [
      { de: "Keine Bestandsanbindung", en: "No inventory integration" },
      { de: "Keine Datei-Uploads", en: "No file uploads" },
      { de: "Kein Anfrage-Dashboard", en: "No enquiry dashboard" },
    ],
    addons: COMMON_ADDONS,
    quoteTriggers: ["extra_branches", "more_languages"],
    externalCosts: ["legal_texts", "domain_email"],
  },
  showroom: {
    id: "showroom",
    name: "Fahrzeug-Showroom",
    intent: { de: "Fahrzeuge präsentieren", en: "Showcase your vehicles" },
    summary: {
      de: "Ihr mobile.de-Bestand automatisch auf Ihrer eigenen Website – ohne doppelte Pflege.",
      en: "Your mobile.de stock automatically on your own website – no duplicate maintenance.",
    },
    setupCents: 490000,
    care: { monthlyCents: 24900, required: true, includedMinutes: 30 },
    includedPages: 5,
    includes: [
      { de: "Alle Leistungen von Autohaus Präsenz", en: "Everything in Autohaus Präsenz" },
      { de: "Ein autorisierter mobile.de-Händlerzugang", en: "One authorised mobile.de dealer account" },
      { de: "Bis zu 50 aktive Fahrzeuge", en: "Up to 50 active vehicles" },
      { de: "Zeitgesteuerter Bestandsabgleich", en: "Scheduled inventory synchronisation" },
      { de: "Fahrzeugliste mit Filtern und Sortierung", en: "Vehicle listing with filters and sorting" },
      {
        de: "Fahrzeugdetailseiten mit Galerie und technischen Daten",
        en: "Vehicle pages with gallery and specifications",
      },
      { de: "Fahrzeugbezogene Anfrageformulare", en: "Vehicle-specific enquiry forms" },
      { de: "Überwachung des Abgleichs", en: "Synchronisation monitoring" },
    ],
    excludes: [
      { de: "Keine Rückschreibung von Inseraten", en: "No listing write-back" },
      { de: "Keine Fahrzeugbewertung", en: "No vehicle valuation" },
      { de: "Kein Finanzierungssystem", en: "No financing system" },
    ],
    vehicleTiers: [
      { id: "vehicles_50", label: { de: "Bis zu 50 Fahrzeuge", en: "Up to 50 vehicles" }, maxVehicles: 50, setupDeltaCents: 0 },
      {
        id: "vehicles_200",
        label: { de: "Bis zu 200 Fahrzeuge", en: "Up to 200 vehicles" },
        maxVehicles: 200,
        setupDeltaCents: 60000,
        monthlyCents: 29900,
      },
      {
        id: "vehicles_more",
        label: { de: "Mehr als 200 Fahrzeuge", en: "More than 200 vehicles" },
        maxVehicles: null,
        setupDeltaCents: 0,
        requiresQuote: true,
      },
    ],
    addons: COMMON_ADDONS,
    quoteTriggers: ["extra_branches", "extra_feeds", "crm", "more_languages"],
    externalCosts: ["mobilede_access", "legal_texts", "domain_email"],
  },
  ankauf: {
    id: "ankauf",
    name: "Autoankauf Direkt",
    intent: { de: "Autoankauf-Anfragen gewinnen", en: "Win vehicle purchase enquiries" },
    summary: {
      de: "Strukturierte Verkäuferanfragen mit Fotos – vollständig, geprüft und sicher gespeichert.",
      en: "Structured seller enquiries with photos – complete, validated and stored securely.",
    },
    setupCents: 450000,
    care: { monthlyCents: 24900, required: true, includedMinutes: 30 },
    includedPages: 5,
    includes: [
      { de: "Fünf Inhaltsseiten, ein Standort", en: "Five content pages, one branch" },
      { de: "Vierstufiges Verkäuferformular", en: "Four-step seller enquiry form" },
      { de: "Bis zu 20 abgestimmte Felder", en: "Up to 20 agreed fields" },
      { de: "Bis zu zehn Fotos pro Anfrage", en: "Up to ten photos per submission" },
      {
        de: "Dateiprüfung, Bildverarbeitung und privater Speicher",
        en: "File checks, image processing and private storage",
      },
      { de: "Spamschutz und serverseitige Validierung", en: "Spam protection and server-side validation" },
      {
        de: "Gespeicherte Anfragen und wiederholte Zustellversuche",
        en: "Saved submissions and notification retries",
      },
      { de: "Eingangsbestätigung per E-Mail an Verkäufer", en: "Acknowledgement email to the seller" },
      { de: "Benachrichtigung an zwei Empfänger im Betrieb", en: "Notifications to two business recipients" },
      {
        de: "Ein Admin-Zugang zum Ansehen, Exportieren und Löschen",
        en: "One administrator account to view, export and delete enquiries",
      },
    ],
    excludes: [
      { de: "Keine Sofortbewertung", en: "No instant valuation" },
      { de: "Kein automatisches Kaufangebot", en: "No automatic purchase offer" },
      { de: "Keine Mitarbeiter-Pipeline", en: "No staff pipeline" },
      { de: "Kein Terminsystem", en: "No appointment system" },
    ],
    addons: COMMON_ADDONS,
    quoteTriggers: ["extra_branches", "crm", "complex_roles", "custom_workflows", "more_languages"],
    externalCosts: ["legal_texts", "domain_email"],
  },
  komplett: {
    id: "komplett",
    name: "Autohaus Komplett",
    intent: { de: "Fahrzeuge verkaufen und ankaufen", en: "Sell and buy vehicles" },
    summary: {
      de: "Verkauf und Ankauf auf einer Website – mit gemeinsamem Posteingang für Ihr Team.",
      en: "Sales and purchasing on one website – with a shared inbox for your team.",
    },
    setupCents: 750000,
    care: { monthlyCents: 39900, required: true, includedMinutes: 45 },
    includedPages: 7,
    includes: [
      { de: "Bestandsanbindung und Autoankauf kombiniert", en: "Combined inventory and vehicle purchasing" },
      { de: "Sieben Inhaltsseiten, ein Standort", en: "Seven content pages, one branch" },
      { de: "Ein autorisierter mobile.de-Händlerzugang", en: "One authorised mobile.de dealer account" },
      { de: "Bis zu 100 aktive Fahrzeuge", en: "Up to 100 active vehicles" },
      { de: "Zwei Mitarbeiterzugänge", en: "Two staff accounts" },
      { de: "Gemeinsamer Anfrage-Posteingang", en: "Shared enquiry inbox" },
      { de: "Status: offen, kontaktiert, abgeschlossen", en: "Statuses: open, contacted, closed" },
      { de: "Interne Notizen und CSV-Export", en: "Internal notes and CSV export" },
      { de: "Einweisung bei der Übergabe", en: "Handover training" },
    ],
    excludes: [
      { de: "Kein erweitertes CRM", en: "No advanced CRM" },
      { de: "Keine Abläufe über mehrere Filialen", en: "No multi-branch workflow" },
      { de: "Keine Kalenderintegration", en: "No calendar integration" },
    ],
    vehicleTiers: [
      { id: "vehicles_100", label: { de: "Bis zu 100 Fahrzeuge", en: "Up to 100 vehicles" }, maxVehicles: 100, setupDeltaCents: 0 },
      {
        id: "vehicles_more",
        label: { de: "Mehr als 100 Fahrzeuge", en: "More than 100 vehicles" },
        maxVehicles: null,
        setupDeltaCents: 0,
        requiresQuote: true,
      },
    ],
    addons: COMMON_ADDONS,
    quoteTriggers: ["extra_branches", "crm", "extra_feeds", "complex_roles", "custom_workflows", "more_languages"],
    externalCosts: ["mobilede_access", "legal_texts", "domain_email"],
  },
};

export const PLATFORM_PACKAGE: PlatformPackage = {
  id: "plattform",
  name: "Händlerplattform",
  intent: { de: "Individuelle Plattform", en: "Custom platform" },
  summary: {
    de: "Für mehrere Standorte, Teams und Abläufe – gemeinsam konzipiert nach einer Anforderungsanalyse.",
    en: "For multiple branches, teams and workflows – scoped together after a discovery phase.",
  },
  possibleFeatures: [
    { id: "branches", label: { de: "Mehrere Standorte", en: "Multiple branches" } },
    { id: "roles", label: { de: "Mitarbeiterrollen und Berechtigungen", en: "Staff roles and permissions" } },
    { id: "lead_workflows", label: { de: "Lead-Zuweisung und Abläufe", en: "Lead assignment and workflows" } },
    { id: "appointments", label: { de: "Terminverwaltung", en: "Appointment management" } },
    {
      id: "inventory_sources",
      label: { de: "Weitere autorisierte Bestandsquellen", en: "Additional authorised inventory sources" },
    },
    { id: "crm", label: { de: "CRM-Anbindungen", en: "CRM integrations" } },
    {
      id: "automation",
      label: { de: "Automatische Benachrichtigungen und Erinnerungen", en: "Automated notifications and reminders" },
    },
  ],
};

export const PACKAGE_ORDER: PackageId[] = ["praesenz", "showroom", "ankauf", "komplett", "plattform"];

export const ADDONS: Record<AddonId, Addon> = {
  extra_page: {
    id: "extra_page",
    label: { de: "Zusätzliche Inhaltsseite", en: "Additional content page" },
    description: {
      de: "Weitere Seite im Design Ihrer Website, z. B. Service, Team oder Karriere.",
      en: "A further page in your website design, e.g. service, team or careers.",
    },
    unitCents: 25000,
    kind: "count",
    max: 20,
    unit: { de: "Seite", en: "page" },
  },
  language: {
    id: "language",
    label: { de: "Zusätzliche Sprache", en: "Additional language" },
    description: {
      de: "Deutsch plus eine weitere Sprache für bis zu fünf von Ihnen gelieferte, übersetzte Seiten.",
      en: "German plus one further language for up to five translated pages supplied by you.",
    },
    unitCents: 90000,
    kind: "toggle",
    externalCosts: ["translations"],
  },
  extra_translated_page: {
    id: "extra_translated_page",
    label: { de: "Weitere übersetzte Seite", en: "Further translated page" },
    description: {
      de: "Jede übersetzte Seite über die ersten fünf hinaus.",
      en: "Each translated page beyond the first five.",
    },
    unitCents: 12000,
    kind: "count",
    max: 30,
    unit: { de: "Seite", en: "page" },
    requires: "language",
  },
  copywriting: {
    id: "copywriting",
    label: { de: "Texterstellung", en: "Copywriting" },
    description: {
      de: "Professionelle Texte für eine Seite mit bis zu 600 Wörtern, abgestimmt mit Ihnen.",
      en: "Professional copy for one page of up to 600 words, agreed with you.",
    },
    unitCents: 25000,
    kind: "count",
    max: 30,
    unit: { de: "Seite", en: "page" },
  },
  local_seo: {
    id: "local_seo",
    label: { de: "Lokale SEO-Einrichtung", en: "Local SEO setup" },
    description: {
      de: "Einmalige Einrichtung für einen Standort: lokale Seitenstruktur, strukturierte Daten und Abstimmung mit Ihrem Unternehmensprofil. Keine laufende SEO-Betreuung.",
      en: "One-time setup for one location: local page structure, structured data and alignment with your business profile. Not ongoing SEO management.",
    },
    unitCents: 65000,
    kind: "toggle",
  },
  landing_page: {
    id: "landing_page",
    label: { de: "Kampagnen-Landingpage", en: "Advertising landing page" },
    description: {
      de: "Eigenständige Seite für eine Werbekampagne mit fokussiertem Anfrageweg.",
      en: "A standalone page for an advertising campaign with a focused enquiry path.",
    },
    unitCents: 85000,
    kind: "count",
    max: 5,
    unit: { de: "Seite", en: "page" },
  },
  appointment_request: {
    id: "appointment_request",
    label: { de: "Terminanfrage-Formular", en: "Appointment request form" },
    description: {
      de: "Formular mit Wunschdatum und -uhrzeit. Termine werden von Ihrem Team bestätigt.",
      en: "Form with preferred date and time. Appointments are confirmed by your team.",
    },
    unitCents: 45000,
    kind: "toggle",
    exclusiveGroup: "appointments",
  },
  booking_integration: {
    id: "booking_integration",
    label: { de: "Anbindung eines Buchungsdienstes", en: "Booking service integration" },
    description: {
      de: "Einbindung Ihres bestehenden Online-Buchungsdienstes. Dessen Abonnement ist nicht enthalten.",
      en: "Integration of your existing online booking service. Its subscription is not included.",
    },
    unitCents: 120000,
    kind: "toggle",
    exclusiveGroup: "appointments",
    externalCosts: ["booking_subscription"],
  },
  headless_cms: {
    id: "headless_cms",
    label: { de: "Headless CMS", en: "Headless CMS" },
    description: {
      de: "Inhalte selbst pflegen – für fünf vorab abgestimmte Seitentypen.",
      en: "Edit content yourself – for five agreed page types.",
    },
    unitCents: 120000,
    kind: "toggle",
  },
};

/** Pages covered by the language add-on before extra translated pages are charged. */
export const LANGUAGE_INCLUDED_PAGES = 5;
