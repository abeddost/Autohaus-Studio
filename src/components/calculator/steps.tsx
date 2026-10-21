"use client";

import {
  ADDONS,
  CARE_FEATURES,
  CARE_LIMITS,
  FIXED_PACKAGES,
  HOURLY_RATE_CENTS,
  LANGUAGE_INCLUDED_PAGES,
  MANAGED_REQUIRED_NOTICE,
  PACKAGE_ORDER,
  PLATFORM_PACKAGE,
  QUOTE_TRIGGERS,
  SELF_OPERATION_NOTICE,
  type FixedPackage,
  type Locale,
  type PlatformNeedId,
  type QuoteTriggerId,
} from "@/config/pricing";
import type { Dictionary } from "@/content";
import { fill } from "@/content";
import type { Quote } from "@/lib/pricing/engine";
import { totalContentPages, type Selection } from "@/lib/pricing/selection";
import { formatEuro, formatMonthly } from "@/lib/format";
import { PACKAGE_ICONS } from "../packageIcons";
import { Check, Info } from "../icons";
import { Counter, Group, OptionCheckbox, PriceTag, RadioCard, RadioRow } from "./controls";
import { FullBreakdown, Notices, Totals } from "./Summary";

type CalcT = Dictionary["calculator"];
type Update = (patch: Partial<Selection>) => void;

type StepProps = {
  selection: Selection;
  update: Update;
  t: CalcT;
  locale: Locale;
};

const plus = (cents: number, locale: Locale) => `+${formatEuro(cents, locale)}`;

/* ------------------------------ Step 1 ----------------------------- */

export function ProjectTypeStep({ selection, update, t, locale, common }: StepProps & { common: Dictionary["common"] }) {
  return (
    <fieldset>
      <legend className="sr-only">{t.projectTypeLegend}</legend>
      <p aria-hidden className="mb-6 text-muted">
        {t.projectTypeLegend}
      </p>
      <div className="grid gap-2.5">
        {PACKAGE_ORDER.map((id) => {
          const Icon = PACKAGE_ICONS[id];
          const isPlatform = id === "plattform";
          const pkg = isPlatform ? PLATFORM_PACKAGE : FIXED_PACKAGES[id];
          return (
            <RadioCard
              key={id}
              name="projektart"
              value={id}
              checked={selection.projectType === id}
              onChange={() => update({ projectType: id })}
              icon={<Icon className="size-5" />}
              kicker={pkg.name}
              title={pkg.intent[locale]}
              description={t.typeDescriptions[id]}
              price={
                isPlatform ? (
                  <PriceTag tone="quote">{t.quoteLabel}</PriceTag>
                ) : (
                  <span className="flex flex-wrap items-baseline gap-x-2">
                    <PriceTag>
                      {common.from} {formatEuro(FIXED_PACKAGES[id].setupCents, locale)}
                    </PriceTag>
                    <span className="text-sm text-subtle tabular">
                      + {formatMonthly(FIXED_PACKAGES[id].care.monthlyCents, locale)}
                      {!FIXED_PACKAGES[id].care.required ? ` (${common.optional})` : ""}
                    </span>
                  </span>
                )
              }
            />
          );
        })}
      </div>
    </fieldset>
  );
}

/* ------------------------------ Step 2 ----------------------------- */

export function ScopeStep({ selection, update, t, locale }: StepProps) {
  const s = t.scope;
  if (selection.projectType === null) return <p className="text-muted">{t.chooseTypeFirst}</p>;

  if (selection.projectType === "plattform") {
    const toggle = (id: PlatformNeedId, on: boolean) =>
      update({ platformNeeds: on ? [...selection.platformNeeds, id] : selection.platformNeeds.filter((n) => n !== id) });
    return (
      <Group title={s.platformLegend} note={s.platformNote}>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {PLATFORM_PACKAGE.possibleFeatures.map((f) => (
            <OptionCheckbox
              key={f.id}
              label={f.label[locale]}
              checked={selection.platformNeeds.includes(f.id)}
              onChange={(on) => toggle(f.id, on)}
            />
          ))}
        </div>
      </Group>
    );
  }

  const pkg = FIXED_PACKAGES[selection.projectType];
  const pages = totalContentPages(pkg.id, selection.extraPages);
  const maxTranslated = Math.max(0, pages - LANGUAGE_INCLUDED_PAGES);
  const perUnit = (unit?: { de: string; en: string }) => (unit ? fill(s.perUnit, { unit: unit[locale] }) : "");
  const counterLabels = (label: string) => ({
    decreaseLabel: fill(s.decrease, { label }),
    increaseLabel: fill(s.increase, { label }),
  });
  const toggleReq = (id: QuoteTriggerId, on: boolean) =>
    update({
      quoteRequirements: on ? [...selection.quoteRequirements, id] : selection.quoteRequirements.filter((r) => r !== id),
    });
  const advanced = pkg.quoteTriggers.filter((id) => id !== "more_languages");

  return (
    <div className="space-y-10">
      <IncludedBox pkg={pkg} t={t} locale={locale} />

      {pkg.vehicleTiers ? (
        <Group title={s.vehicles}>
          <div className="grid gap-2.5">
            {pkg.vehicleTiers.map((tier, i) => (
              <RadioRow
                key={tier.id}
                name="fahrzeuge"
                value={tier.id}
                checked={selection.vehicleTier === tier.id}
                onChange={(value) => update({ vehicleTier: value })}
                label={tier.label[locale]}
                price={
                  i === 0 ? (
                    <PriceTag tone="included">{s.vehiclesIncluded}</PriceTag>
                  ) : tier.requiresQuote ? (
                    <PriceTag tone="quote">{s.vehiclesQuote}</PriceTag>
                  ) : (
                    <PriceTag>
                      {fill(s.vehicleUpgradeNote, {
                        setup: formatEuro(tier.setupDeltaCents, locale),
                        monthly: formatMonthly(tier.monthlyCents ?? pkg.care.monthlyCents, locale),
                      })}
                    </PriceTag>
                  )
                }
              />
            ))}
          </div>
        </Group>
      ) : null}

      <Group title={s.pagesTitle} note={fill(s.pagesIncluded, { count: pkg.includedPages })}>
        <Counter
          label={ADDONS.extra_page.label[locale]}
          description={ADDONS.extra_page.description[locale]}
          value={selection.extraPages}
          max={ADDONS.extra_page.max!}
          onChange={(v) => update({ extraPages: v })}
          price={<PriceTag>{plus(ADDONS.extra_page.unitCents, locale)} {perUnit(ADDONS.extra_page.unit)}</PriceTag>}
          {...counterLabels(ADDONS.extra_page.label[locale])}
        />
        <Counter
          label={ADDONS.copywriting.label[locale]}
          description={ADDONS.copywriting.description[locale]}
          value={selection.copywritingPages}
          max={pages}
          onChange={(v) => update({ copywritingPages: v })}
          price={<PriceTag>{plus(ADDONS.copywriting.unitCents, locale)} {perUnit(ADDONS.copywriting.unit)}</PriceTag>}
          {...counterLabels(ADDONS.copywriting.label[locale])}
        />
        <OptionCheckbox
          label={ADDONS.headless_cms.label[locale]}
          description={ADDONS.headless_cms.description[locale]}
          checked={selection.headlessCms}
          onChange={(on) => update({ headlessCms: on })}
          price={<PriceTag>{plus(ADDONS.headless_cms.unitCents, locale)}</PriceTag>}
        />
      </Group>

      <Group title={s.languageTitle} note={s.languageNote}>
        <OptionCheckbox
          label={ADDONS.language.label[locale]}
          description={ADDONS.language.description[locale]}
          checked={selection.language}
          onChange={(on) => update({ language: on })}
          price={<PriceTag>{plus(ADDONS.language.unitCents, locale)}</PriceTag>}
        />
        {selection.language ? (
          <Counter
            label={ADDONS.extra_translated_page.label[locale]}
            description={maxTranslated > 0 ? ADDONS.extra_translated_page.description[locale] : s.translatedPagesDisabled}
            value={selection.extraTranslatedPages}
            max={maxTranslated}
            onChange={(v) => update({ extraTranslatedPages: v })}
            price={<PriceTag>{plus(ADDONS.extra_translated_page.unitCents, locale)} {perUnit(ADDONS.extra_translated_page.unit)}</PriceTag>}
            {...counterLabels(ADDONS.extra_translated_page.label[locale])}
          />
        ) : null}
        {pkg.quoteTriggers.includes("more_languages") ? (
          <OptionCheckbox
            label={s.moreLanguages}
            checked={selection.quoteRequirements.includes("more_languages")}
            onChange={(on) => toggleReq("more_languages", on)}
            price={<PriceTag tone="quote">{s.triggersQuote}</PriceTag>}
          />
        ) : null}
      </Group>

      <Group title={s.visibilityTitle}>
        <OptionCheckbox
          label={ADDONS.local_seo.label[locale]}
          description={s.localSeoNote}
          checked={selection.localSeo}
          onChange={(on) => update({ localSeo: on })}
          price={<PriceTag>{plus(ADDONS.local_seo.unitCents, locale)}</PriceTag>}
        />
        <Counter
          label={ADDONS.landing_page.label[locale]}
          description={ADDONS.landing_page.description[locale]}
          value={selection.landingPages}
          max={ADDONS.landing_page.max!}
          onChange={(v) => update({ landingPages: v })}
          price={<PriceTag>{plus(ADDONS.landing_page.unitCents, locale)} {perUnit(ADDONS.landing_page.unit)}</PriceTag>}
          {...counterLabels(ADDONS.landing_page.label[locale])}
        />
      </Group>

      <Group title={s.appointmentsTitle} note={s.appointmentsExclusive}>
        <RadioRow
          name="termine"
          value="none"
          checked={selection.appointments === "none"}
          onChange={() => update({ appointments: "none" })}
          label={s.appointmentsNone}
        />
        <RadioRow
          name="termine"
          value="request"
          checked={selection.appointments === "request"}
          onChange={() => update({ appointments: "request" })}
          label={ADDONS.appointment_request.label[locale]}
          description={ADDONS.appointment_request.description[locale]}
          price={<PriceTag>{plus(ADDONS.appointment_request.unitCents, locale)}</PriceTag>}
        />
        <RadioRow
          name="termine"
          value="booking"
          checked={selection.appointments === "booking"}
          onChange={() => update({ appointments: "booking" })}
          label={ADDONS.booking_integration.label[locale]}
          description={ADDONS.booking_integration.description[locale]}
          price={<PriceTag>{plus(ADDONS.booking_integration.unitCents, locale)}</PriceTag>}
        />
      </Group>

      {advanced.length ? (
        <Group title={s.advancedTitle} note={s.advancedNote}>
          {advanced.map((id) => (
            <OptionCheckbox
              key={id}
              label={QUOTE_TRIGGERS[id][locale]}
              checked={selection.quoteRequirements.includes(id)}
              onChange={(on) => toggleReq(id, on)}
              price={<PriceTag tone="quote">{s.triggersQuote}</PriceTag>}
            />
          ))}
        </Group>
      ) : null}
    </div>
  );
}

function IncludedBox({ pkg, t, locale }: { pkg: FixedPackage; t: CalcT; locale: Locale }) {
  return (
    <section aria-label={t.scope.included} className="rounded-[12px] border border-line bg-white/70 p-5">
      <p className="eyebrow text-success">{t.scope.included}</p>
      <p className="mt-1.5 text-sm text-muted">{t.scope.includedNote}</p>
      <ul className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        {pkg.includes.map((item) => (
          <li key={item.de} className="flex gap-2">
            <Check className="mt-0.5 size-4 shrink-0 text-success" />
            {item[locale]}
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------ Step 3 ----------------------------- */

export function CareStep({ selection, update, t, locale, quote }: StepProps & { quote: Quote }) {
  const c = t.care;
  if (selection.projectType === null) return <p className="text-muted">{t.chooseTypeFirst}</p>;

  const features = (
    <div className="mt-8 grid gap-8 md:grid-cols-2">
      <div>
        <h4 className="eyebrow text-muted">{c.features}</h4>
        <ul className="mt-3 space-y-2 text-[0.95rem]">
          {CARE_FEATURES.map((f) => (
            <li key={f.de} className="flex gap-2.5">
              <Check className="mt-1 size-4 shrink-0 text-accent" />
              {f[locale]}
            </li>
          ))}
        </ul>
      </div>
      <div className="space-y-3 text-[0.95rem]">
        {quote.monthly.includedMinutes ? (
          <p className="font-medium">{fill(c.minutes, { minutes: quote.monthly.includedMinutes })}</p>
        ) : null}
        <p className="text-muted">{fill(c.extra, { rate: formatEuro(HOURLY_RATE_CENTS, locale) })}</p>
        <p className="flex gap-2.5 text-sm text-muted">
          <Info className="mt-0.5 size-4 shrink-0" />
          {CARE_LIMITS[locale]}
        </p>
      </div>
    </div>
  );

  if (selection.projectType === "plattform") {
    return (
      <div>
        <div className="rounded-lg border border-line bg-white p-5">
          <p className="font-medium">{c.platformTitle}</p>
          <p className="mt-1.5 text-sm text-muted">{c.platformText}</p>
        </div>
        {features}
      </div>
    );
  }

  const pkg = FIXED_PACKAGES[selection.projectType];

  if (!pkg.care.required) {
    return (
      <div>
        <fieldset>
          <legend className="mb-4 text-muted">{c.legend}</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <RadioCard
              name="betrieb"
              value="managed"
              checked={selection.operation === "managed"}
              onChange={() => update({ operation: "managed" })}
              title={c.managed}
              price={<PriceTag>{formatMonthly(pkg.care.monthlyCents, locale)}</PriceTag>}
            />
            <RadioCard
              name="betrieb"
              value="self"
              checked={selection.operation === "self"}
              onChange={() => update({ operation: "self" })}
              title={c.self}
              price={<PriceTag>{c.selfPrice}</PriceTag>}
            />
          </div>
        </fieldset>
        {selection.operation === "self" ? (
          <p className="mt-4 flex gap-2.5 rounded-md border border-warning/30 bg-warning/5 px-4 py-3 text-sm text-ink-soft">
            <Info className="mt-0.5 size-4 shrink-0 text-warning" />
            {SELF_OPERATION_NOTICE[locale]}
          </p>
        ) : null}
        {selection.operation === "managed" ? features : null}
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-lg border border-accent bg-white p-5 shadow-[0_0_0_1px_var(--color-accent)]">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <p className="font-medium">{fill(c.requiredTitle, { name: pkg.name })}</p>
          <PriceTag>{quote.monthly.cents !== null ? formatMonthly(quote.monthly.cents, locale) : "–"}</PriceTag>
        </div>
        <p className="mt-2 text-sm text-muted">{MANAGED_REQUIRED_NOTICE[locale]}</p>
      </div>
      {features}
    </div>
  );
}

/* ------------------------------ Step 4 ----------------------------- */

export function SummaryStep({ quote, t, locale }: { quote: Quote; t: CalcT; locale: Locale }) {
  return (
    <div className="space-y-8">
      <div className="rounded-[14px] border border-ink bg-white p-6 shadow-[0_24px_60px_-36px_rgb(0_0_0/0.5)]">
        <p className="eyebrow text-subtle">{t.summary.package}</p>
        <p className="serif mt-2 text-[2rem] leading-none">{quote.packageName}</p>
        <div className="mt-6">
          <Totals quote={quote} t={t.summary} locale={locale} />
        </div>
      </div>
      <FullBreakdown quote={quote} t={t.summary} locale={locale} />
      <Notices locale={locale} />
    </div>
  );
}
